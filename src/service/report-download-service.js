const config = require('../config/rabitmq-config.json');
const { DownloadReportRepository , IncomingReportRepository } = require("../repositories");
const incomingReportRepo = new IncomingReportRepository();
const downloadReportRepo = new DownloadReportRepository();
const { Logger } = require("../config");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { parse } = require('json2csv');
const moment = require('moment');
const {BACKEND_API_BASE_URL} = require('../utils/common/constants');
const batchLimit = 900000;


const connectMongo = async() => {
    try {
        await mongoose.connect(config.MONGO_DB_URI);
    } catch (error) {
        throw error;
    }   
}

const mongoConnection = async() =>{
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }
        await connectMongo();
        Logger.info(`Mongodb -> Successfully connected`);
    } catch (error) {
        Logger.error(`Mongodb -> Error while connecting: ${ JSON.stringify(error) }`)
    }
}

const reports = async () => {
     
    try {
         await mongoConnection();
         const downloadReportData = await downloadReportRepo.getAllData({status : 0},{ limit: batchLimit })
         if (downloadReportData.length > 0) {
            for (const report of downloadReportData) {
                try {
                    await downloadReportRepo.update(
                        report._id,
                        {status : 1}
                    );

                    const BASE_FOLDER = path.join(__dirname, '../../assets/reports', report.did); 
                    Logger.info(`Base Folder : ${BASE_FOLDER}`);
                    if (!fs.existsSync(BASE_FOLDER)) {
                           fs.mkdirSync(BASE_FOLDER, { recursive: true });
                    }
                    let fileName;
                    const rawDid = report.did.replace(/^\+/, ''); // Remove '+' if it exists
                    const regex = new RegExp(`^\\+?${rawDid}$`);  // Match with or without '+'
                    Logger.info(`DID Search: ${regex} `);
                    const incomingReportData = await incomingReportRepo.getByDid({ caller_number: { $regex: regex } })
                    Logger.info(`Incomming Report Data Count : ${incomingReportData.length} `);
                    if (incomingReportData.length > 0) {
                        const extractedData = incomingReportData.map(record => ({
                            ...record._doc,
                            caller_number: `'${record._doc.caller_number}'`,
                            callee_number: `'${record._doc.callee_number}'`
                        }));

                        const csvData = parse(extractedData);
                        const timestamp = moment().format('YYYYMMDD_HHmmss');
                        Logger.info(`Time : ${timestamp} `);
                        fileName = `report_${report.did}_${timestamp}.zip`;
                        Logger.info(`File Name : ${fileName} `);
                        const csvFilePath = path.join(BASE_FOLDER, `report_${report.did}_${timestamp}.csv`);
                        Logger.info(`CSV File Path  : ${csvFilePath} `);
                        const zipFilePath = path.join(BASE_FOLDER, `report_${report.did}_${timestamp}.zip`);
                        Logger.info(`ZIP File Path : ${zipFilePath} `);
                        fs.writeFileSync(csvFilePath, csvData, 'utf8');
                        const output = fs.createWriteStream(zipFilePath);
                        const archive = archiver('zip', { zlib: { level: 9 } });

                        archive.pipe(output);
                        archive.append(fs.createReadStream(csvFilePath), { name: `report_${report.did}_${timestamp}.csv` });
                        await archive.finalize();

                        fs.unlinkSync(csvFilePath);

                        const file_url = `${BACKEND_API_BASE_URL}/assets/reports/${report.did}/${fileName}`;
                        Logger.info(`File URL : ${file_url} `);
                        await downloadReportRepo.update(
                        report._id,
                        {download_link : file_url , status : 2}
                        );
                    }

                    

                } catch (sqlError) {
                    console.error(`Error updating Mongo for report ID ${report}:`, sqlError);
                }
            }
         }



    }
    catch (err) {
       console.error(`Exception ${err}`);
    }

    const tout = setTimeout(reports, 1000)

};

const tout = setTimeout(reports, 1000);