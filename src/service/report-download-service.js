const config = require('../config/rabitmq-config.json');
const { DownloadReportRepository , IncomingReportRepository } = require("../c_repositories");
const incomingReportRepo = new IncomingReportRepository();
const downloadReportRepo = new DownloadReportRepository();
const { Logger } = require("../config");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { parse } = require('json2csv');
const moment = require('moment-timezone');
const {BACKEND_API_BASE_URL} = require('../utils/common/constants');
const batchLimit = 900000;
const sequelize = require('../config/sequelize');
const { Op } = require('sequelize');


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

const connectCockroach = async () => {
    try {
      await sequelize.authenticate();
    } catch(error) {
      throw error;
    }
  }

const getDateTimeFormat = (date) =>{

            const startdateIST = moment.tz(date, "Asia/Kolkata"); // Parse as IST
            const startdateUTC = startdateIST.utc().toDate(); // Convert to UTC Date Object

            const now = new Date(startdateUTC);
            const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
            const istDate = new Date(now.getTime() + istOffset);

            return istDate;

}

const reports = async () => {
     
    try {
        //  await mongoConnection();
         await connectCockroach();
         const downloadReportData = await downloadReportRepo.getAllData({status : 0},{ limit: batchLimit })
         if (downloadReportData.length > 0) {
            for (const report of downloadReportData) {
                console.log("::::::::::::::: "+JSON.stringify(report));
                console.log("::::::::::::::: "+report.schedule_date.toISOString());
                try {
                    await downloadReportRepo.update(
                        report.id,
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
                    Logger.info(`Schedule Date : ${report.schedule_date.toISOString()} `);

                    let startOfDay = new Date(report.schedule_date.toISOString());
                    Logger.info(`Start Of  Date : ${startOfDay} `);
                    startOfDay.setHours(0, 0, 0, 0);

                    let endOfDay = new Date(report.schedule_date.toISOString());
                    endOfDay.setHours(23, 59, 59, 999);

                    startOfDay = getDateTimeFormat(startOfDay);
                    endOfDay = getDateTimeFormat(endOfDay)

                    Logger.info(`Start Date : ${typeof startOfDay.toISOString()} , End Date : ${endOfDay.toISOString()}`)

                    const didWithPlus = `+${rawDid}`;
                    const didWithoutPlus = rawDid;

                    const query = {
                        [Op.and]: [
                          {
                            [Op.or]: [
                              { callee_number: didWithPlus },
                              { callee_number: didWithoutPlus }
                            ]
                          },
                          {
                            start_time: {
                              [Op.gte]: new Date(startOfDay),
                              [Op.lt]: new Date(endOfDay)
                            }
                          }
                        ]
                      };
                    const incomingReportData = await incomingReportRepo.getByDid(query);
                    Logger.info(`Incomming Report Data Count : ${incomingReportData.length} `);
                    if (incomingReportData.length > 0) {
                        const extractedData = incomingReportData.map(record => ({
                            ...record.dataValues,
                            caller_number: `'${record.dataValues.caller_number}'`,
                            callee_number: `'${record.dataValues.callee_number}'`
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
                        report.id,
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