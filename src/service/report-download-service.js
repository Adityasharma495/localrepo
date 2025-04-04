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


const connectMongo = async() => {
    try {
        await mongoose.connect(config.MONGO_DB_URI);
    } catch (error) {
        throw error;
    }   
}

const mongoConnection = async() =>{
    try {
        await connectMongo();
        Logger.info(`Mongodb -> Successfully connected`);
    } catch (error) {
        Logger.error(`Mongodb -> Error while connecting: ${ JSON.stringify(error) }`)
    }
}

(async () => {
     
    try {
         await mongoConnection();
         const downloadReportData = await downloadReportRepo.getAllData({status : 0})
         if (downloadReportData.length > 0) {
            for (const report of downloadReportData) {
                try {
                    await downloadReportRepo.update(
                        report._id,
                        {status : 1}
                    );

                    const BASE_FOLDER = path.join(__dirname, '../../assets/reports', report.did); 
                    let fileName;
                    const incomingReportData = await incomingReportRepo.getByDid({caller_number : report.did})
                    if (incomingReportData.length > 0) {
                        const extractedData = incomingReportData.map(record => ({
                            ...record._doc,
                            caller_number: `'${record._doc.caller_number}'`,
                            callee_number: `'${record._doc.callee_number}'`
                        }));

                        const csvData = parse(extractedData);
                        const timestamp = moment().format('YYYYMMDD_HHmmss');
                        fileName = `report_${report.did}_${timestamp}.zip`
                        const csvFilePath = path.join(BASE_FOLDER, `report_${report.did}_${timestamp}.csv`);
                        const zipFilePath = path.join(BASE_FOLDER, `report_${report.did}_${timestamp}.zip`);

                        fs.writeFileSync(csvFilePath, csvData, 'utf8');
                        const output = fs.createWriteStream(zipFilePath);
                        const archive = archiver('zip', { zlib: { level: 9 } });

                        archive.pipe(output);
                        archive.append(fs.createReadStream(csvFilePath), { name: `report_${report.did}_${timestamp}.csv` });
                        await archive.finalize();

                        fs.unlinkSync(csvFilePath);
                    }

                    const file_url = `${BACKEND_API_BASE_URL}/assets/reports/${report.did}/${fileName}`;
                    await downloadReportRepo.update(
                        report._id,
                        {download_link : file_url}
                    );

                } catch (sqlError) {
                    console.error(`Error updating SQL for report ID ${report.sql_id}:`, sqlError);
                }
            }
         }



    }
    catch (err) {
       console.error(`Exception ${err}`);
    }

})();

