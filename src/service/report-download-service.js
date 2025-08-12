const config = require('../../shared/config/rabitmq-config.json');
const { DownloadReportRepository , IncomingReportRepository, UserRepository } = require("../../shared/c_repositories");
const { IncomingReportJanuaryW1Repository,IncomingReportJanuaryW2Repository,IncomingReportJanuaryW3Repository,IncomingReportJanuaryW4Repository,
  IncomingReportFebruaryW1Repository,IncomingReportFebruaryW2Repository,IncomingReportFebruaryW3Repository,IncomingReportFebruaryW4Repository,
  IncomingReportMarchW1Repository,IncomingReportMarchW2Repository,IncomingReportMarchW3Repository,IncomingReportMarchW4Repository,
  IncomingReportAprilW1Repository,IncomingReportAprilW2Repository,IncomingReportAprilW3Repository,IncomingReportAprilW4Repository,
  IncomingReportMayW1Repository,IncomingReportMayW2Repository,IncomingReportMayW3Repository,IncomingReportMayW4Repository,
  IncomingReportJuneW1Repository,IncomingReportJuneW2Repository,IncomingReportJuneW3Repository,IncomingReportJuneW4Repository,
  IncomingReportJulyW1Repository,IncomingReportJulyW2Repository,IncomingReportJulyW3Repository,IncomingReportJulyW4Repository,
  IncomingReportAugustW1Repository,IncomingReportAugustW2Repository,IncomingReportAugustW3Repository,IncomingReportAugustW4Repository,
  IncomingReportSeptemberW1Repository,IncomingReportSeptemberW2Repository,IncomingReportSeptemberW3Repository,IncomingReportSeptemberW4Repository,
  IncomingReportOctoberW1Repository,IncomingReportOctoberW2Repository,IncomingReportOctoberW3Repository,IncomingReportOctoberW4Repository,
  IncomingReportNovemberW1Repository,IncomingReportNovemberW2Repository,IncomingReportNovemberW3Repository,IncomingReportNovemberW4Repository,
  IncomingReportDecemberW1Repository,IncomingReportDecemberW2Repository,IncomingReportDecemberW3Repository,IncomingReportDecemberW4Repository, } = require("../../shared/c_repositories");

const { OutboundReportJanuaryW1Repository,OutboundReportJanuaryW2Repository,OutboundReportJanuaryW3Repository,OutboundReportJanuaryW4Repository,
  OutboundReportFebruaryW1Repository,OutboundReportFebruaryW2Repository,OutboundReportFebruaryW3Repository,OutboundReportFebruaryW4Repository,
  OutboundReportMarchW1Repository,OutboundReportMarchW2Repository,OutboundReportMarchW3Repository,OutboundReportMarchW4Repository,
  OutboundReportAprilW1Repository,OutboundReportAprilW2Repository,OutboundReportAprilW3Repository,OutboundReportAprilW4Repository,
  OutboundReportMayW1Repository,OutboundReportMayW2Repository,OutboundReportMayW3Repository,OutboundReportMayW4Repository,
  OutboundReportJuneW1Repository,OutboundReportJuneW2Repository,OutboundReportJuneW3Repository,OutboundReportJuneW4Repository,
  OutboundReportJulyW1Repository,OutboundReportJulyW2Repository,OutboundReportJulyW3Repository,OutboundReportJulyW4Repository,
  OutboundReportAugustW1Repository,OutboundReportAugustW2Repository,OutboundReportAugustW3Repository,OutboundReportAugustW4Repository,
  OutboundReportSeptemberW1Repository,OutboundReportSeptemberW2Repository,OutboundReportSeptemberW3Repository,OutboundReportSeptemberW4Repository,
  OutboundReportOctoberW1Repository,OutboundReportOctoberW2Repository,OutboundReportOctoberW3Repository,OutboundReportOctoberW4Repository,
  OutboundReportNovemberW1Repository,OutboundReportNovemberW2Repository,OutboundReportNovemberW3Repository,OutboundReportNovemberW4Repository,
  OutboundReportDecemberW1Repository,OutboundReportDecemberW2Repository,OutboundReportDecemberW3Repository,OutboundReportDecemberW4Repository, } = require("../../shared/c_repositories");

const incomingReport1W1Repo = new IncomingReportJanuaryW1Repository();
const incomingReport1W2Repo = new IncomingReportJanuaryW2Repository();
const incomingReport1W3Repo = new IncomingReportJanuaryW3Repository();
const incomingReport1W4Repo = new IncomingReportJanuaryW4Repository();

const incomingReport2W1Repo = new IncomingReportFebruaryW1Repository();
const incomingReport2W2Repo = new IncomingReportFebruaryW2Repository();
const incomingReport2W3Repo = new IncomingReportFebruaryW3Repository();
const incomingReport2W4Repo = new IncomingReportFebruaryW4Repository();

const incomingReport3W1Repo = new IncomingReportMarchW1Repository();
const incomingReport3W2Repo = new IncomingReportMarchW2Repository();
const incomingReport3W3Repo = new IncomingReportMarchW3Repository();
const incomingReport3W4Repo = new IncomingReportMarchW4Repository();

const incomingReport4W1Repo = new IncomingReportAprilW1Repository();
const incomingReport4W2Repo = new IncomingReportAprilW2Repository();
const incomingReport4W3Repo = new IncomingReportAprilW3Repository();
const incomingReport4W4Repo = new IncomingReportAprilW4Repository();

const incomingReport5W1Repo = new IncomingReportMayW1Repository();
const incomingReport5W2Repo = new IncomingReportMayW2Repository();
const incomingReport5W3Repo = new IncomingReportMayW3Repository();
const incomingReport5W4Repo = new IncomingReportMayW4Repository();

const incomingReport6W1Repo = new IncomingReportJuneW1Repository();
const incomingReport6W2Repo = new IncomingReportJuneW2Repository();
const incomingReport6W3Repo = new IncomingReportJuneW3Repository();
const incomingReport6W4Repo = new IncomingReportJuneW4Repository();

const incomingReport7W1Repo = new IncomingReportJulyW1Repository();
const incomingReport7W2Repo = new IncomingReportJulyW2Repository();
const incomingReport7W3Repo = new IncomingReportJulyW3Repository();
const incomingReport7W4Repo = new IncomingReportJulyW4Repository();

const incomingReport8W1Repo = new IncomingReportAugustW1Repository();
const incomingReport8W2Repo = new IncomingReportAugustW2Repository();
const incomingReport8W3Repo = new IncomingReportAugustW3Repository();
const incomingReport8W4Repo = new IncomingReportAugustW4Repository();

const incomingReport9W1Repo = new IncomingReportSeptemberW1Repository();
const incomingReport9W2Repo = new IncomingReportSeptemberW2Repository();
const incomingReport9W3Repo = new IncomingReportSeptemberW3Repository();
const incomingReport9W4Repo = new IncomingReportSeptemberW4Repository();

const incomingReport10W1Repo = new IncomingReportOctoberW1Repository();
const incomingReport10W2Repo = new IncomingReportOctoberW2Repository();
const incomingReport10W3Repo = new IncomingReportOctoberW3Repository();
const incomingReport10W4Repo = new IncomingReportOctoberW4Repository();

const incomingReport11W1Repo = new IncomingReportNovemberW1Repository();
const incomingReport11W2Repo = new IncomingReportNovemberW2Repository();
const incomingReport11W3Repo = new IncomingReportNovemberW3Repository();
const incomingReport11W4Repo = new IncomingReportNovemberW4Repository();

const incomingReport12W1Repo = new IncomingReportDecemberW1Repository();
const incomingReport12W2Repo = new IncomingReportDecemberW2Repository();
const incomingReport12W3Repo = new IncomingReportDecemberW3Repository();
const incomingReport12W4Repo = new IncomingReportDecemberW4Repository();

const outboundReport1W1Repo = new OutboundReportJanuaryW1Repository();
const outboundReport1W2Repo = new OutboundReportJanuaryW2Repository();
const outboundReport1W3Repo = new OutboundReportJanuaryW3Repository();
const outboundReport1W4Repo = new OutboundReportJanuaryW4Repository();

const outboundReport2W1Repo = new OutboundReportFebruaryW1Repository();
const outboundReport2W2Repo = new OutboundReportFebruaryW2Repository();
const outboundReport2W3Repo = new OutboundReportFebruaryW3Repository();
const outboundReport2W4Repo = new OutboundReportFebruaryW4Repository();

const outboundReport3W1Repo = new OutboundReportMarchW1Repository();
const outboundReport3W2Repo = new OutboundReportMarchW2Repository();
const outboundReport3W3Repo = new OutboundReportMarchW3Repository();
const outboundReport3W4Repo = new OutboundReportMarchW4Repository();

const outboundReport4W1Repo = new OutboundReportAprilW1Repository();
const outboundReport4W2Repo = new OutboundReportAprilW2Repository();
const outboundReport4W3Repo = new OutboundReportAprilW3Repository();
const outboundReport4W4Repo = new OutboundReportAprilW4Repository();

const outboundReport5W1Repo = new OutboundReportMayW1Repository();
const outboundReport5W2Repo = new OutboundReportMayW2Repository();
const outboundReport5W3Repo = new OutboundReportMayW3Repository();
const outboundReport5W4Repo = new OutboundReportMayW4Repository();

const outboundReport6W1Repo = new OutboundReportJuneW1Repository();
const outboundReport6W2Repo = new OutboundReportJuneW2Repository();
const outboundReport6W3Repo = new OutboundReportJuneW3Repository();
const outboundReport6W4Repo = new OutboundReportJuneW4Repository();

const outboundReport7W1Repo = new OutboundReportJulyW1Repository();
const outboundReport7W2Repo = new OutboundReportJulyW2Repository();
const outboundReport7W3Repo = new OutboundReportJulyW3Repository();
const outboundReport7W4Repo = new OutboundReportJulyW4Repository();

const outboundReport8W1Repo = new OutboundReportAugustW1Repository();
const outboundReport8W2Repo = new OutboundReportAugustW2Repository();
const outboundReport8W3Repo = new OutboundReportAugustW3Repository();
const outboundReport8W4Repo = new OutboundReportAugustW4Repository();

const outboundReport9W1Repo = new OutboundReportSeptemberW1Repository();
const outboundReport9W2Repo = new OutboundReportSeptemberW2Repository();
const outboundReport9W3Repo = new OutboundReportSeptemberW3Repository();
const outboundReport9W4Repo = new OutboundReportSeptemberW4Repository();

const outboundReport10W1Repo = new OutboundReportOctoberW1Repository();
const outboundReport10W2Repo = new OutboundReportOctoberW2Repository();
const outboundReport10W3Repo = new OutboundReportOctoberW3Repository();
const outboundReport10W4Repo = new OutboundReportOctoberW4Repository();

const outboundReport11W1Repo = new OutboundReportNovemberW1Repository();
const outboundReport11W2Repo = new OutboundReportNovemberW2Repository();
const outboundReport11W3Repo = new OutboundReportNovemberW3Repository();
const outboundReport11W4Repo = new OutboundReportNovemberW4Repository();

const outboundReport12W1Repo = new OutboundReportDecemberW1Repository();
const outboundReport12W2Repo = new OutboundReportDecemberW2Repository();
const outboundReport12W3Repo = new OutboundReportDecemberW3Repository();
const outboundReport12W4Repo = new OutboundReportDecemberW4Repository();

const userRepo = new UserRepository();

const repositoryMap = {
  incomingReport1W1Repo: incomingReport1W1Repo,
  incomingReport1W2Repo: incomingReport1W2Repo,
  incomingReport1W3Repo: incomingReport1W3Repo,
  incomingReport1W4Repo: incomingReport1W4Repo,

  incomingReport2W1Repo:incomingReport2W1Repo,
  incomingReport2W2Repo:incomingReport2W2Repo,
  incomingReport2W3Repo:incomingReport2W3Repo,
  incomingReport2W4Repo:incomingReport2W4Repo,

  incomingReport3W1Repo:incomingReport3W1Repo,
  incomingReport3W2Repo:incomingReport3W2Repo,
  incomingReport3W3Repo:incomingReport3W3Repo,
  incomingReport3W4Repo:incomingReport3W4Repo,

  incomingReport4W1Repo:incomingReport4W1Repo,
  incomingReport4W2Repo:incomingReport4W2Repo,
  incomingReport4W3Repo:incomingReport4W3Repo,
  incomingReport4W4Repo:incomingReport4W4Repo,

  incomingReport5W1Repo: incomingReport5W1Repo,
  incomingReport5W2Repo: incomingReport5W2Repo,
  incomingReport5W3Repo: incomingReport5W3Repo,
  incomingReport5W4Repo: incomingReport5W4Repo,

  incomingReport6W1Repo: incomingReport6W1Repo,
  incomingReport6W2Repo: incomingReport6W2Repo,
  incomingReport6W3Repo: incomingReport6W3Repo,
  incomingReport6W4Repo: incomingReport6W4Repo,

  incomingReport7W1Repo:incomingReport7W1Repo,
  incomingReport7W2Repo:incomingReport7W2Repo,
  incomingReport7W3Repo:incomingReport7W3Repo,
  incomingReport7W4Repo:incomingReport7W4Repo,

  incomingReport8W1Repo:incomingReport8W1Repo,
  incomingReport8W2Repo:incomingReport8W2Repo,
  incomingReport8W3Repo:incomingReport8W3Repo,
  incomingReport8W4Repo:incomingReport8W4Repo,

  incomingReport9W1Repo:incomingReport9W1Repo,
  incomingReport9W2Repo:incomingReport9W2Repo,
  incomingReport9W3Repo:incomingReport9W3Repo,
  incomingReport9W4Repo:incomingReport9W4Repo,

  incomingReport10W1Repo:incomingReport10W1Repo,
  incomingReport10W2Repo:incomingReport10W2Repo,
  incomingReport10W3Repo:incomingReport10W3Repo,
  incomingReport10W4Repo:incomingReport10W4Repo,

  incomingReport11W1Repo:incomingReport11W1Repo,
  incomingReport11W2Repo:incomingReport11W2Repo,
  incomingReport11W3Repo:incomingReport11W3Repo,
  incomingReport11W4Repo:incomingReport11W4Repo,

  incomingReport12W1Repo:incomingReport12W1Repo,
  incomingReport12W2Repo:incomingReport12W2Repo,
  incomingReport12W3Repo:incomingReport12W3Repo,
  incomingReport12W4Repo:incomingReport12W4Repo,
};

const outboundRepositoryMap = {
  outboundReport1W1Repo: outboundReport1W1Repo,
  outboundReport1W2Repo: outboundReport1W2Repo,
  outboundReport1W3Repo: outboundReport1W3Repo,
  outboundReport1W4Repo: outboundReport1W4Repo,

  outboundReport2W1Repo: outboundReport2W1Repo,
  outboundReport2W2Repo: outboundReport2W2Repo,
  outboundReport2W3Repo: outboundReport2W3Repo,
  outboundReport2W4Repo: outboundReport2W4Repo,

  outboundReport3W1Repo: outboundReport3W1Repo,
  outboundReport3W2Repo: outboundReport3W2Repo,
  outboundReport3W3Repo: outboundReport3W3Repo,
  outboundReport3W4Repo: outboundReport3W4Repo,

  outboundReport4W1Repo: outboundReport4W1Repo,
  outboundReport4W2Repo: outboundReport4W2Repo,
  outboundReport4W3Repo: outboundReport4W3Repo,
  outboundReport4W4Repo: outboundReport4W4Repo,

  outboundReport5W1Repo: outboundReport5W1Repo,
  outboundReport5W2Repo: outboundReport5W2Repo,
  outboundReport5W3Repo: outboundReport5W3Repo,
  outboundReport5W4Repo: outboundReport5W4Repo,

  outboundReport6W1Repo: outboundReport6W1Repo,
  outboundReport6W2Repo: outboundReport6W2Repo,
  outboundReport6W3Repo: outboundReport6W3Repo,
  outboundReport6W4Repo: outboundReport6W4Repo,

  outboundReport7W1Repo: outboundReport7W1Repo,
  outboundReport7W2Repo: outboundReport7W2Repo,
  outboundReport7W3Repo: outboundReport7W3Repo,
  outboundReport7W4Repo: outboundReport7W4Repo,

  outboundReport8W1Repo: outboundReport8W1Repo,
  outboundReport8W2Repo: outboundReport8W2Repo,
  outboundReport8W3Repo: outboundReport8W3Repo,
  outboundReport8W4Repo: outboundReport8W4Repo,

  outboundReport9W1Repo: outboundReport9W1Repo,
  outboundReport9W2Repo: outboundReport9W2Repo,
  outboundReport9W3Repo: outboundReport9W3Repo,
  outboundReport9W4Repo: outboundReport9W4Repo,

  outboundReport10W1Repo: outboundReport10W1Repo,
  outboundReport10W2Repo: outboundReport10W2Repo,
  outboundReport10W3Repo: outboundReport10W3Repo,
  outboundReport10W4Repo: outboundReport10W4Repo,

  outboundReport11W1Repo: outboundReport11W1Repo,
  outboundReport11W2Repo: outboundReport11W2Repo,
  outboundReport11W3Repo: outboundReport11W3Repo,
  outboundReport11W4Repo: outboundReport11W4Repo,

  outboundReport12W1Repo: outboundReport12W1Repo,
  outboundReport12W2Repo: outboundReport12W2Repo,
  outboundReport12W3Repo: outboundReport12W3Repo,
  outboundReport12W4Repo: outboundReport12W4Repo,
};

const incomingReportRepo = new IncomingReportRepository();
const downloadReportRepo = new DownloadReportRepository();
const { Logger } = require("../../shared/config");
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { parse } = require('json2csv');
const moment = require('moment-timezone');
const {BACKEND_API_BASE_URL, TOTAL_WEEK_DAYS, DOWNLOAD_REPORT_FILE_RECORD_SIZE} = require('../../shared/utils/common/constants');
const batchLimit = 900000;
const sequelize = require('../../shared/config/sequelize');
const { Op, fn, col, where } = require('sequelize');

const connectCockroach = async () => {
    try {
      await sequelize.authenticate();
    } catch(error) {
      throw error;
    }
  }


const reports = async () => {
     
    try {
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

                    startOfDay = startOfDay;
                    endOfDay = endOfDay

                    Logger.info(`Start Date : ${typeof startOfDay.toISOString()} , End Date : ${endOfDay.toISOString()}`)

                    const didWithPlus = `+${rawDid}`;
                    const didWithoutPlus = rawDid;

                    const date = report.schedule_date.getUTCDate();
                    const month = report.schedule_date.getUTCMonth() + 1;
                    let week = 0;
                    if(date>28){
                      week = Math.floor(date/TOTAL_WEEK_DAYS);
                    }else{
                      week = Math.ceil(date/TOTAL_WEEK_DAYS);
                    }
                    
                    const key = `incomingReport${month}W${week}Repo`;
                    const repoInstance = repositoryMap[key];

                    const outboundKey = `outboundReport${month}W${week}Repo`;
                    const outboundRepoInstance = outboundRepositoryMap[outboundKey];
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
                    const incomingReportData = await repoInstance.getByDid(query);
                    Logger.info(`Incomming Report Data Count : ${incomingReportData.length} `);
                    const RECORDS_PER_FILE = DOWNLOAD_REPORT_FILE_RECORD_SIZE;
                    if (incomingReportData.length > 0) {
                        const finalReportData = [];
                        for (const record of incomingReportData) {
                          const incomingFormatted = {
                            ...record.dataValues,
                            caller_number: `'${record.dataValues.caller_number}'`,
                            callee_number: `'${record.dataValues.callee_number}'`,
                            type: "INBOUND"
                          };
                          finalReportData.push(incomingFormatted); 

                          if (record?.trace_id) {
                            const outboundData = await outboundRepoInstance.getDidByTraceId(
                              record.trace_id,
                              record.callee_number,
                              query.startDate,
                              query.endDate
                            );

                            if (outboundData?.length > 0) {
                              for (const outRecord of outboundData) {
                                const user = await userRepo.findOne({
                                  name: outRecord.dataValues.agent_name,
                                });
                                
                                finalReportData.push({
                                  ...outRecord.dataValues,
                                  caller_number: `'${outRecord.dataValues.caller_number}'`,
                                  callee_number: `'${outRecord.dataValues.callee_number}'`,
                                  type: "OUTBOUND",
                                  user_id: user ? user.id : null 
                                });
                              }
                            }
                          }
                        }
                        // const extractedData = incomingReportData.map(record => ({
                        //     ...record.dataValues,
                        //     caller_number: `'${record.dataValues.caller_number}'`,
                        //     callee_number: `'${record.dataValues.callee_number}'`
                        // }));

                        const timestamp = moment().format('YYYYMMDD_HHmmss');
                        Logger.info(`Time : ${timestamp} `);
                        fileName = `report_${report.did}_${timestamp}.zip`;
                        Logger.info(`File Name : ${fileName} `);
                        const csvFilePath = path.join(BASE_FOLDER, `report_${report.did}_${timestamp}.csv`);
                        Logger.info(`CSV File Path  : ${csvFilePath} `);
                        const zipFilePath = path.join(BASE_FOLDER, `report_${report.did}_${timestamp}.zip`);
                        Logger.info(`ZIP File Path : ${zipFilePath} `);
                        const output = fs.createWriteStream(zipFilePath);
                        const archive = archiver('zip', { zlib: { level: 9 } });

                        archive.pipe(output);
                        const totalChunks = Math.ceil(
                          finalReportData.length / RECORDS_PER_FILE
                        );
                        for (let i = 0; i < totalChunks; i++) {
                          const chunk = finalReportData.slice(
                            i * RECORDS_PER_FILE,
                            (i + 1) * RECORDS_PER_FILE
                          );
                          const csvData = parse(chunk);
                          const partNumber = i + 1;
                          const csvFileName = `report_${report.did}_${partNumber}.csv`;
                          const tempCsvFilePath = path.join(
                            BASE_FOLDER,
                            csvFileName
                          );
                          fs.writeFileSync(tempCsvFilePath, csvData, "utf8");
                          const stream = fs.createReadStream(tempCsvFilePath);
                          archive.append(stream, { name: csvFileName });
                          stream.on("close", () => {
                            fs.unlink(tempCsvFilePath, (err) => {
                              if (err)
                                console.error(
                                  "Failed to delete temp CSV:",
                                  err
                                );
                            });
                          });
                        }
                        await archive.finalize();

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