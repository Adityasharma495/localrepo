const { StatusCodes } = require('http-status-codes');
const { SuccessRespnose, ErrorResponse } = require('../utils/common');
const { Logger } = require('../config');
const { State} = require('country-state-city');
const { NumbersRepository, DIDUserMappingRepository,
    UserJourneyRepository, NumberFileListRepository,
    NumberStatusRepository, UserRepository ,
    MemberScheduleRepository, CountryCodeRepository, VoicePlansRepository, CompanyRepository, CallCentreRepository} = require('../repositories');
const fs = require("fs");
const {MODULE_LABEL, ACTION_LABEL, BACKEND_API_BASE_URL, USERS_ROLE, NUMBER_STATUS_LABLE, DID_ALLOCATION_LEVEL} = require('../utils/common/constants');
const userJourneyRepo = new UserJourneyRepository();
const numberRepo = new NumbersRepository();
const numFileListRepo = new NumberFileListRepository();
const numberStatusRepo = new NumberStatusRepository();
const userRepo = new UserRepository();
const memberScheduleRepo = new MemberScheduleRepository();
const countryCodeRepository = new CountryCodeRepository();
const voicePlanRepo = new VoicePlansRepository();
const didUserMappingRepository = new DIDUserMappingRepository();
const companyRepo = new CompanyRepository();
const callCentreRepo = new CallCentreRepository();

const { constants } = require("../utils/common");
const numberStatusValues = constants.NUMBER_STATUS_VALUE;
const stream = require('stream');
const csv = require('csv-parser');

async function create(req, res) {
    const bodyReq = req.body;
    try {
      const responseData = {};
      
      const number = await numberRepo.create(bodyReq.number);

      await didUserMappingRepository.create({
        DID: number?._id,
        mapping_detail: [{
            allocated_to: req?.user?.id
        }]
      })
    Logger.info(
      `Number -> Did Allocation created successfully: ${JSON.stringify(responseData)}`
    );

      responseData.number = number;

      const userJourneyfields = {
        module_name: MODULE_LABEL.NUMBERS,
        action: ACTION_LABEL.ADD,
        created_by:  req?.user?.id
      }
  
      const userJourney = await userJourneyRepo.create(userJourneyfields);
      responseData.userJourney = userJourney
  
      SuccessRespnose.data = responseData;
      SuccessRespnose.message = "Successfully created a new Number";
  
      Logger.info(
        `Number -> created successfully: ${JSON.stringify(responseData)}`
      );
  
      return res.status(StatusCodes.CREATED).json(SuccessRespnose);
    } catch (error) {
      Logger.error(
        `Number -> unable to create Number: ${JSON.stringify(
          bodyReq
        )} error: ${JSON.stringify(error)}`
      );
  
      let statusCode = error.statusCode;
      let errorMsg = error.message;
      if (error.name == "MongoServerError" || error.code == 11000) {
        statusCode = StatusCodes.BAD_REQUEST;
        if (error.codeName == "DuplicateKey")
          errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
  
      ErrorResponse.message = errorMsg;
      ErrorResponse.error = error;
  
      return res.status(statusCode).json(ErrorResponse);
    }
}

async function update(req, res) {

    const numberId = req.params.id;
    const bodyReq = req.body;



    let data = {};
    try {

        const numberData = await numberRepo.get({_id : numberId});
        
        // if status is updated by other then superadmin
        if (numberData?.status !== bodyReq.number.status) {
            if (req.user.role !== USERS_ROLE.SUPER_ADMIN) {
                bodyReq.number.updated_status = bodyReq.number.status
                bodyReq.number.status = 9 //  set Pending
            }
        }
       
        const responseData = {};
        const number = await numberRepo.update(numberId, bodyReq.number);
        if (!number) {
            const error = new Error();
            error.name = 'CastError';
            throw error;
        }
        responseData.number = number;
        const userJourneyfields = {
            module_name: MODULE_LABEL.NUMBERS,
            action: ACTION_LABEL.EDIT,
            created_by: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);

        SuccessRespnose.message = 'Updated successfully!';
        SuccessRespnose.data = responseData;

        Logger.info(`Number -> ${numberId} updated successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {
        Logger.error(`Numbers -> unable to Update: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`);

        let statusCode = error.statusCode;
        let errorMsg = error.message;
        if (error.name == 'MongoServerError' || error.code == 11000) {
            statusCode = StatusCodes.BAD_REQUEST;
            if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
        }

        ErrorResponse.message = errorMsg;
        ErrorResponse.error = error;

        return res.status(statusCode).json(ErrorResponse);
    }

}

async function bulkUpdate(req, res) {
    const file = req.file;
    const bodyReq = Object.assign({}, req.body);
    try {
        if (!file) {
            const errorResponse = {
                message: 'File not found',
                error: new Error('File not found')
            };
            Logger.error('File processing error:', errorResponse.error);
            return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
        }
    
        const records = [];
        const dataPromises = [];
        let headersSent = false;

        const readableStream = new stream.PassThrough();
        readableStream.end(file.buffer);  

        readableStream
        .pipe(csv())
        .on('data', (row) => {
          const dataPromise = (async () => {
            if (row['Country Code'].length !== 2) {
                const data = await countryCodeRepository.getAll();
                const sanitizedInput = row['Country Code'].trim().toLowerCase();
                const country = data.find(item => item.name.toLowerCase() === sanitizedInput);
                row['Country Code'] = country ? country.code : null;
             }

             if (row?.['State Code'] && row['State Code'].length !== 2) {
                 const states = State.getStatesOfCountry(row['Country Code']);
                 const sanitizedInput = row['State Code'].trim().toLowerCase();
                 const state = states.find(item => item.name.toLowerCase() === sanitizedInput);
                 row['State Code'] = state ? state.isoCode : null;
              }
            records.push({
              status: row.Status,
              actual_number: Number(row['DID']),
              category: row?.Category || null,
              currency: row.Currency,
              country_code: row['Country Code'],
              state_code: row?.['State Code'] || null,
              cost: row.Cost,
              operator: row.Operator.toUpperCase(),
              number_type: bodyReq.numberType
            });
          })();
      
          dataPromises.push(dataPromise);
        })
        .on('end', async () => {
          await Promise.all(dataPromises);
          try {
            const insertedData = [];
            const updatedData = [];
            const DIDAlloctionInsertion = [];
            for (let i = 0; i < records.length; i += 1) {
              const numberRecord = records[i];
              const numberDetails = await numberRepo.findOne({
                actual_number: numberRecord.actual_number, number_type: bodyReq.numberType
              });

              if (!numberDetails) {  
                
                numberRecord.status = NUMBER_STATUS_LABLE[numberRecord.status];
                numberRecord.created_by = req.user.id;
                numberRecord.created_at = toIST(new Date());
                DIDAlloctionInsertion.push({
                    DID: numberRecord.actual_number,
                    allocated_to: req?.user?.id
                })
                insertedData.push(numberRecord);
              } else {

                if (numberDetails.number_type !== numberRecord.number_type) {

                  numberRecord.status = NUMBER_STATUS_LABLE[numberRecord.status];
                  numberRecord.created_by = req.user.id;
                  numberRecord.created_at = toIST(new Date());
                  DIDAlloctionInsertion.push({
                    DID: numberRecord.actual_number,
                    allocated_to: req?.user?.id
                })
                  insertedData.push(numberRecord);
                } else {
                  if (numberDetails?.status !== NUMBER_STATUS_LABLE[numberRecord.status]) {
                    if (req.user.role !== USERS_ROLE.SUPER_ADMIN) {
                      numberRecord.updated_status = NUMBER_STATUS_LABLE[numberRecord.status];
                      numberRecord.status = 9; 
                    }
                    numberRecord.status = NUMBER_STATUS_LABLE[numberRecord.status];
                    numberRecord.updatedAt = toIST(new Date())
                    updatedData.push(numberRecord);
                  } else {
                    numberRecord.status = NUMBER_STATUS_LABLE[numberRecord.status];
                    numberRecord.updatedAt = toIST(new Date())

                    updatedData.push(numberRecord);
                  }
                }
              }
            }

            const bulkOps = [];
            const insertedDocumentIds = []
      
            insertedData.forEach((doc) => {
              bulkOps.push({
                insertOne: {
                  document: doc
                }
              });
            });
      
            updatedData.forEach((doc) => {
              bulkOps.push({
                updateOne: {
                  filter: { actual_number: doc.actual_number, number_type: bodyReq.numberType },
                  update: { $set: doc }
                }
              });
            });

            if (bulkOps.length > 0) {
              const result = await numberRepo.bulkWrite(bulkOps);
              for (const key in result.insertedIds) {
                if (result.insertedIds.hasOwnProperty(key)) {
                    insertedDocumentIds.push(result.insertedIds[key].toString()); 
                }
            }
            }

            if (insertedDocumentIds.length > 0) {
                const insertedDocuments = await numberRepo.model.find({ _id: { $in: insertedDocumentIds } });
                const DIDAlloction = insertedDocuments.map(item => ({
                    DID: item?._id,
                    mapping_detail: [{
                        allocated_to: req?.user?.id
                    }]
                  }));

                await didUserMappingRepository.insertMany(DIDAlloction);
            }
      
            if (!headersSent) {
              const SuccessRespnose = {
                message: 'Successfully Uploaded Numbers.',
                data: bulkOps
              };
              Logger.info('Numbers uploaded successfully');
              headersSent = true;
      
              const userJourneyfields = {
                module_name: MODULE_LABEL.NUMBERS,
                action: ACTION_LABEL.UPLOAD,
                created_by: req?.user?.id
              };
      
              await userJourneyRepo.create(userJourneyfields);
              return res.status(StatusCodes.CREATED).json(SuccessRespnose);
            }
          } catch (error) {
            if (!headersSent) {
              const errorResponse = {
                message: 'Error while saving numbers to the database.',
                error: error
              };
              Logger.error('Database error:', error);
              headersSent = true;
              return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
            }
          }
        })
        .on('error', (error) => {
          if (!headersSent) {
            const errorResponse = {
              message: 'Error while processing the file.',
              error: error
            };
            Logger.error('File processing error:', error);
            headersSent = true;
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
          }
        });
    } catch (error) {
        const errorResponse = {
            message: 'Error while processing the file.',
            error: error
        };
        Logger.error('File processing error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}

const toIST = (date) => {
    const istOffset = 5.5 * 60 * 60 * 1000; 
    return new Date(date.getTime() + istOffset);
};

async function uploadNumbers(req, res) {
    const dest = req.file.path;
    const bodyReq = Object.assign({}, req.body);
    try {
        if (!fs.existsSync(dest)) {
            const errorResponse = {
                message: 'File not foundd',
                error: new Error('File not found')
            };
            Logger.error('File processing error:', errorResponse.error);
            return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
        }

        const file_name = req.file.name;
        const file_url = `${BACKEND_API_BASE_URL}/assets/number/${req.user.id}/${file_name}`;

        const uploadFile = await numFileListRepo.create({
            user_id: req.user.id,
            file_name: file_name,
            file_url: file_url
        });

        const records = [];
        const dataPromises = []
        let headersSent = false;

        fs.createReadStream(dest)
            .pipe(csv())
            .on('data', (row) => {
                const dataPromise = (async () => {
                    if (row['Country Code'].length !== 2) {
                       const data = await countryCodeRepository.getAll();
                       const sanitizedInput = row['Country Code'].trim().toLowerCase();
                       const country = data.find(item => item.name.toLowerCase() === sanitizedInput);
                       row['Country Code'] = country ? country.code : null;
                    }

                    if (row?.['State Code'] && row['State Code'].length !== 2) {
                        const states = State.getStatesOfCountry(row['Country Code']);
                        const sanitizedInput = row['State Code'].trim().toLowerCase();
                        const state = states.find(item => item.name.toLowerCase() === sanitizedInput);
                        row['State Code'] = state ? state.isoCode : null;
                     }

                records.push({
                    status: 1,
                    actual_number: Number(row['DID']),
                    category: bodyReq.category,
                    currency: bodyReq.currency,
                    country_code: row['Country Code'],
                    state_code: row?.['State Code'] || null,
                    cost: row.Cost,
                    operator: row.Operator.toUpperCase(),
                    created_by: req.user.id,
                    number_type: bodyReq.numberType,
                    uploaded_file_id: uploadFile._id,
                    created_at: toIST(new Date()),
                    updatedAt: toIST(new Date())
                });
                })();

                dataPromises.push(dataPromise);
            })
            .on('end', async () => {
                await Promise.all(dataPromises);

                try {
                const batchSize = 100;
                for (let i = 0; i < records.length; i += batchSize) {
                    const batch = records.slice(i, i + batchSize);
                    const insertedRecords = await numberRepo.insertMany(batch);
                    // DID allocation
                    const DIDAlloction = insertedRecords.map(item => ({
                        DID: item?._id,
                        mapping_detail: [{
                            allocated_to: req?.user?.id
                        }]
                      }));

                    await didUserMappingRepository.insertMany(DIDAlloction);
                }

                if (!headersSent) {
                    const SuccessResponse = {
                    message: 'Successfully Uploaded Numbers.',
                    data: { file_destination: dest }
                    };
                    Logger.info('Numbers uploaded successfully');
                    headersSent = true;

                    const userJourneyfields = {
                    module_name: MODULE_LABEL.NUMBERS,
                    action: ACTION_LABEL.UPLOAD,
                    created_by: req?.user?.id
                    };

                    await userJourneyRepo.create(userJourneyfields);
                    return res.status(StatusCodes.CREATED).json(SuccessResponse);
                }
                } catch (error) {
                if (!headersSent) {
                    const errorResponse = {
                    message: 'Error while saving numbers to the database.',
                    error: error
                    };
                    Logger.error('Database error:', error);
                    headersSent = true;
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
                }
                }
            })
            .on('error', (error) => {
                if (!headersSent) {
                const errorResponse = {
                    message: 'Error while processing the file.',
                    error: error
                };
                Logger.error('File processing error:', error);
                headersSent = true;
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
                }
            });
    } catch (error) {
        const errorResponse = {
            message: 'Error while processing the file.',
            error: error
        };
        Logger.error('File processing error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}


async function getAll(req, res) {
    try {
        let data;
        let idToCheck
        if (req.user.role === USERS_ROLE.COMPANY_ADMIN) {
            const getLoggedDetail = await userRepo.get(req.user.id)
            idToCheck = getLoggedDetail?.companies?._id?._id
        } else if (req.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
            const getLoggedDetail = await userRepo.get(req.user.id)
            idToCheck = getLoggedDetail?.callcenters?._id
        } else {
            idToCheck = req.user.id
        }

        if (req.user.role === USERS_ROLE.SUPER_ADMIN) {
            data = await didUserMappingRepository.getForSuperadmin(idToCheck);
        } else {
            data = await didUserMappingRepository.getForOthers(idToCheck);
        }

        const uniqueDIDs = [...new Set(data.map(item => item.DID?._id))];
        data = await numberRepo.findMany(uniqueDIDs);

        data = await Promise.all(
            data.map(async (val) => {
              val['status'] = numberStatusValues[val['status']];
              let allocatedData = null;
              let finalData = {};
          
              // Try company first
              allocatedData = await companyRepo.findOne({ _id: val.allocated_to });
              if (allocatedData) {
                finalData = {
                  name: allocatedData.name,
                  _id: allocatedData._id
                };
              }
          
              // Try user if not found in company
              if (!allocatedData) {
                allocatedData = await userRepo.findOne({ _id: val.allocated_to });
                if (allocatedData) {
                  finalData = {
                    name: allocatedData.username,
                    _id: allocatedData._id
                  };
                }
              }
          
              // Try call center if not found in user
              if (!allocatedData) {
                allocatedData = await callCentreRepo.findOne({ _id: val.allocated_to });
                if (allocatedData) {
                  finalData = {
                    name: allocatedData.name,
                    _id: allocatedData._id
                  };
                }
              }
          
              if (allocatedData) {
                val['allocated_to'] = finalData;
              }
          
              return val;
            })
          );
          
          // Now safely sort
          data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          

        SuccessRespnose.data = data;
        SuccessRespnose.message = 'Success';

        Logger.info(
            `Number -> recieved all successfully`
        );

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {
        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`Number -> unable to get Numbers list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);

    }

}

async function get(req, res) {

    const numberId = req.params.id;
    try {

        const data = await numberRepo.get(numberId);
        SuccessRespnose.data = data;
        if (data.is_deleted) {
            let statusCode = StatusCodes.NOT_FOUND;
            let errorMsg = `Numbers -> this Number ${numberId} deleted`;
            ErrorResponse.message = errorMsg;
            ErrorResponse.data = data;
            return res.status(statusCode).json(ErrorResponse);
        }

        Logger.info(
            `Number -> recieved ${numberId} successfully`
        );

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == 'CastError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Numbers not found';
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Numbers-> unable to get ${numberId}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }

}

async function deleteNumber(req, res) {
    const id = req.body.numberIds;

    try {

        const response = await numberRepo.deleteMany(id);
        const userJourneyfields = {
            module_name: MODULE_LABEL.NUMBERS,
            action: ACTION_LABEL.DELETE,
            created_by: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);
        SuccessRespnose.message = 'Deleted successfully!';
        SuccessRespnose.data = response;

        Logger.info(`Number -> ${id} deleted successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == 'CastError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Number not found';
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Number -> unable to delete number: ${id}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }

}

async function getDIDNumbers(req, res) {
    const numberType = 'DID'
    try {

        const data = await numberRepo.getParticularTypeNumber(numberType);
        SuccessRespnose.data = data;
        SuccessRespnose.message = 'Succesfully Getting the DID Numbers.';

        if (data.is_deleted) {
            let statusCode = StatusCodes.NOT_FOUND;
            let errorMsg = `Numbers -> this Number ${numberType} deleted`;
            ErrorResponse.message = errorMsg;
            ErrorResponse.data = data;
            return res.status(statusCode).json(ErrorResponse);
        }

        Logger.info(
            `Number -> recieved ${numberType} number successfully`
        );

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == 'CastError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Numbers not found';
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Numbers-> unable to get ${numberType}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }

}

async function getAllStatus(req, res) {
    try {
        const data = await numberStatusRepo.getAll();
        const filteredData = data.filter(item => item.status_code !== 9 && item.status_code !== 10);
        SuccessRespnose.data = filteredData;
        SuccessRespnose.message = 'Success';

        Logger.info(
            `Number -> recieved number with all status successfully`
        );

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`Number -> unable to get Numbers list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);

    }

}

const assignBulkDID = async (req, res) => {
    const dest = req.file.path;
    const bodyReq = req.body;
    try {
        if (!fs.existsSync(dest)) {
            const errorResponse = {
                message: 'File not found',
                error: new Error('File not found')
            };
            Logger.error('File processing error:', errorResponse.error);
            return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
        }

        const records = [];
        let headersSent = false;
        let numberType;
        if (bodyReq.type !== undefined && bodyReq.type === 'VMN') {
            numberType = 'VMN'
        } else {
            numberType = 'TOLL FREE'
        } 

        fs.createReadStream(dest)
            .pipe(csv())
            .on('data', (row) => {
                records.push(row);
            })
            .on('end', async () => {
                try {
                    for (const record of records) {
                        const data = record[numberType];
                        const did = record.DID
                        const existingNumber = await numberRepo.findOne(
                            { 
                                actual_number: data,
                                number_type: numberType 

                            });
                        if (existingNumber) {
                            const numberId = existingNumber._id;
                            const updatedFields = {
                                status: NUMBER_STATUS_LABLE[record['STATUS']],
                                routing_destination: Number(did),
                                routing_type: numberType
                            }
                            await numberRepo.update(numberId, updatedFields);
                        }
                    }

                    const userJourneyfields = {
                        module_name: MODULE_LABEL.NUMBERS,
                        action: ACTION_LABEL.ASSIGN_BULK_DID,
                        created_by: req?.user?.id
                      }
                  
                    await userJourneyRepo.create(userJourneyfields);
                    if (!headersSent) {
                        const SuccessResponse = {
                            message: 'Successfully assigned Bulk DID.',
                            data: { file_destination: dest }
                        };
                        Logger.info('Bulk DID assigned successfully');
                        headersSent = true;
                        return res.status(StatusCodes.CREATED).json(SuccessResponse);
                    }
                } catch (error) {
                    if (!headersSent) {
                        const errorResponse = {
                            message: 'Error while saving numbers to the database.',
                            error: error
                        };
                        Logger.error('Database error:', error);
                        headersSent = true;
                        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
                    }
                }
            })
            .on('error', (error) => {
                if (!headersSent) {
                    const errorResponse = {
                        message: 'Error while processing assigning bulk DID file.',
                        error: error
                    };
                    Logger.error('Assigning bulk DID file Error:', error);
                    headersSent = true;
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
                }
            });
    } catch (error) {
        const errorResponse = {
            message: 'Error while processing assigning bulk DID file.',
            error: error
        };
        Logger.error('Assigning bulk DID file Error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
};

const assignIndividualDID = async (req, res) => {
    const bodyReq = req.body;
    try {
        const numberId = bodyReq._id
        const updatedFields = {
            status: bodyReq.status,
            routing_destination: bodyReq.DID,
            routing_type: bodyReq.numberType,
            routing_id : bodyReq.DID_id,
            expiry_date: bodyReq?.expiryDate || null
        }
       
        await numberRepo.update(numberId, updatedFields);

        const userJourneyfields = {
            module_name: MODULE_LABEL.NUMBERS,
            action: ACTION_LABEL.ASSIGN_INDIVIDUAL_DID,
            created_by: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);

        Logger.info(
            `Number -> successfully assigned individual DID`
        );

        SuccessRespnose.message = 'Successfully assigned Individual DID.';
        return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
        const errorResponse = {
            message: 'Error while assigning Individual DID.',
            error: error
        };
        Logger.error('Assigning Individual DID error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
};

async function updateStatus(req, res) {
    const bodyReq = req.body;

    let params = {
        status: Number(bodyReq.status),
        updated_status: bodyReq.updated_status
    };

    try {

        const responseData = {};
        const number = await numberRepo.update(bodyReq.updateId, params);
        if (!number) {
            const error = new Error();
            error.name = 'CastError';
            throw error;
        }
        responseData.number = number;
        const userJourneyfields = {
            module_name: MODULE_LABEL.NUMBERS,
            action: ACTION_LABEL.STATUS_ACTION_APPROVED,
            created_by: req?.user?.id
        }

        if (bodyReq.action === 'Reject') {
            userJourneyfields.action = ACTION_LABEL.STATUS_ACTION_REJECT
        }
      
        await userJourneyRepo.create(userJourneyfields);

        SuccessRespnose.message = 'Status Changes Updated successfully!';
        SuccessRespnose.data = responseData;

        Logger.info(`Number -> ${bodyReq.updateId} updated successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {
        Logger.error(`Numbers -> unable to Update: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`);

        let statusCode = error.statusCode;
        let errorMsg = error.message;
        if (error.name == 'MongoServerError' || error.code == 11000) {
            statusCode = StatusCodes.BAD_REQUEST;
            if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
        }

        ErrorResponse.message = errorMsg;
        ErrorResponse.error = error;

        return res.status(statusCode).json(ErrorResponse);
    }

}

async function DIDUserMapping(req, res) {
    const bodyReq = req.body;
    const successDIDs = [];
    const successActualNumbers = [];
    const failedDIDs = [];

    try {
        if (req.user.role === USERS_ROLE.SUPER_ADMIN) {
            for (const did of bodyReq.DID) {
                try {
                    const didDetail = await numberRepo.get(did)

                   await didUserMappingRepository.addMappingDetail(did, {
                        level: 1,
                        allocated_to: bodyReq.allocated_to,
                        parent_id: req.user.id,
                        voice_plan_id: bodyReq?.voice_plan_id,
                    }); 


                    await numberRepo.update(did, {
                        allocated_to: bodyReq.allocated_to,
                        voice_plan_id: bodyReq?.voice_plan_id
                    });



                    await voicePlanRepo.update(bodyReq?.voice_plan_id, { is_allocated: 1 });
                    successDIDs.push(did);
                    successActualNumbers.push(didDetail.actual_number)

                } catch (err) {
                    failedDIDs.push({ did, reason: err.message || "Failed to allocate number." });
                }
            }
        } else {
            for (const did of bodyReq.DID) {
                try {
            
                    const parentVoicePlanDetail = (await numberRepo.findOneWithVoicePlan({_id : did}))?.voice_plan_id;
                    const currentPlanDetail = await voicePlanRepo.findOne({_id : bodyReq?.voice_plan_id});
                    const didDetail = await numberRepo.get(did)

                    if (parentVoicePlanDetail) {
                        for (const plan1 of currentPlanDetail.plans) {
                            const match = parentVoicePlanDetail.plans.find(plan2 => plan2.plan_type === plan1.plan_type);
            
                            if (!match) {
                                failedDIDs.push({
                                    did: didDetail.actual_number,
                                    reason: `No matching parent plan found for "${plan1.plan_type}".`
                                });
                                throw new Error('Validation failed');
                            }
            
                            if (plan1.pulse_price < match.pulse_price) {
                                failedDIDs.push({
                                    did: didDetail.actual_number,
                                    reason: `Can't allocate pulse price less than parent pulse price for "${plan1.plan_type}".`
                                });
                                throw new Error('Validation failed');
                            }
            
                            if (plan1.pulse_duration < match.pulse_duration) {
                                failedDIDs.push({
                                    did: didDetail.actual_number,
                                    reason: `Can't allocate pulse duration less than parent duration for "${plan1.plan_type}".`
                                });
                                throw new Error('Validation failed');
                            }
                        }
                    }

                        let level;
                        if (req.user.role === USERS_ROLE.RESELLER) {
                            const isCompanyUser = await companyRepo.findOne({_id: bodyReq.allocated_to})
                            if (isCompanyUser) {
                                level = DID_ALLOCATION_LEVEL.COMPANY_ADMIN
                            } else {
                                const count = await didUserMappingRepository.countLevelEntry(did, 2)
                                if (count === 0) {
                                    level = DID_ALLOCATION_LEVEL.SUB_RESELLER
                                } else {
                                    level = `${DID_ALLOCATION_LEVEL.SUB_RESELLER}_${Number(count)}`
                                }
                            }
                            
                        } else if (req.user.role === USERS_ROLE.COMPANY_ADMIN) {
                            const isCompanyUser = await companyRepo.findOne({_id: bodyReq.allocated_to})
                            if (isCompanyUser) {
                                const count = await didUserMappingRepository.countLevelEntry(did, 5)
                                if (count === 0) {
                                    level = DID_ALLOCATION_LEVEL.SUB_COMPANY_ADMIN
                                } else {
                                    level = `${DID_ALLOCATION_LEVEL.SUB_COMPANY_ADMIN}_${Number(count)}`
                                }
                            } else {
                                level = DID_ALLOCATION_LEVEL.CALLCENTER
                            }
                        } 

                        await didUserMappingRepository.addMappingDetail(did, {
                            level,
                            allocated_to: bodyReq.allocated_to,
                            parent_id: req.user.id,
                            voice_plan_id: bodyReq?.voice_plan_id,
                        });
            
                        await numberRepo.update(did, {
                            allocated_to: bodyReq.allocated_to,
                            voice_plan_id: bodyReq?.voice_plan_id
                        });
            
                    await voicePlanRepo.update(bodyReq?.voice_plan_id, { is_allocated: 1 });
                    successDIDs.push(did);
                    successActualNumbers.push(didDetail.actual_number)
                } catch (err) {
                    continue;
                }
            }
            
        }

        SuccessRespnose.data = {
            total: bodyReq.DID.length,
            processed: successDIDs.length,
            failed: failedDIDs.length,
            successDIDs,
            failedDIDs,
            successActualNumbers
        };
        SuccessRespnose.message = 'Number(s) Allocated Successfully!';
        Logger.info(`Numbers -> ${bodyReq.DID} updated successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {
        Logger.error(`Numbers -> unable to Allocate Number error: ${JSON.stringify(error)}`);

        let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message || 'An error occurred during allocation';

        ErrorResponse.message = errorMsg;
        ErrorResponse.error = error;

        return res.status(statusCode).json(ErrorResponse);
    }
}



async function getToAllocateNumbers(req, res) {
    try {

        let data;

        let allocatedToId = req.params.id
        if (req.user.role !== USERS_ROLE.SUPER_ADMIN && req.user.role !== USERS_ROLE.RESELLER) {
            const getLoggedDetail = await userRepo.get(req.user.id)
            allocatedToId = getLoggedDetail?.companies?._id?._id
        } else {
            allocatedToId = req.params.id
        }

        if (req.user.role === USERS_ROLE.SUPER_ADMIN) {
            data = await numberRepo.getAllocatedNumbers(null);
        } else {
            data = await numberRepo.getAllocatedNumbers(allocatedToId);
        }

        SuccessRespnose.data = data;

        SuccessRespnose.message = 'Success';

        Logger.info(`Numbers -> to allocated numbers recieved successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`To Allocated numbers -> unable to get To Allocated numbers list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);

    }

}

async function getAllocatedNumbers(req, res) {
    try {
        const allocatedToId = req.params.id;
        let allocatedNumbers = await didUserMappingRepository.getForOthers(allocatedToId);

        const allocatedId = allocatedNumbers.length > 0 ? allocatedNumbers[0]?.mapping_detail[0].allocated_to: null 
        let allocatedTo;
        if (req.user.role === USERS_ROLE.SUPER_ADMIN) {
            allocatedTo = (await userRepo.get(allocatedId))?.username
        } else if (req.user.role === USERS_ROLE.RESELLER) {
            const company = await companyRepo.findOne({_id : allocatedId})
            if (company) {
                allocatedTo = company?.name
            } else {
                allocatedTo = (await userRepo.findOne({_id : allocatedId}))?.username
            }
        } else if (req.user.role === USERS_ROLE.COMPANY_ADMIN) {
            const company = await companyRepo.findOne({_id : allocatedId})
            if (company) {
                allocatedTo = company?.name
            } else {
                allocatedTo = (await callCentreRepo.findOne({_id : allocatedId}))?.name
            }
        }
        const allocatedBy = req.user.username

        const uniqueDIDs = [...new Set(allocatedNumbers.map(item => item.DID))];

        // Create a map of DID to voiceplan_id
        const didVoicePlanMap = {};

        allocatedNumbers.forEach(async (item) => {
        didVoicePlanMap[item.DID._id] = item.mapping_detail[0].voice_plan_id;
        });

        const data = await numberRepo.findMany(uniqueDIDs);
        const updatedData = data.map((item) => {
            return {
              ...item,  
              voice_plan_id: didVoicePlanMap[item._id] ,
              allocated_name: allocatedTo, 
              allocated_by: allocatedBy
            };
          });

        const response = {};
        response.data = updatedData

        //Remove Button permission
        const check = await numberRepo.getAllocatedNumbers(allocatedToId);
        if (check.length > 0) {
            response.is_removal_button = true
        } else {
            response.is_removal_button = false 
        }
        SuccessRespnose.data = response;
        SuccessRespnose.message = 'Success';

        Logger.info(`Numbers -> allocated numbers recieved successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`Allocated numbers -> unable to get Allocated numbers list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);

    }

}

async function removeAllocatedNumbers(req, res) {
    try {
        const { DID, user_id } = req.body;

        for (const did of DID) {
            let allocatedNumbers = await didUserMappingRepository.checkMappingIfNotExists(did, {
                allocated_to: user_id,
            });

            const childDetail = await didUserMappingRepository.checkMappingIfNotExists(did, {
                parent_id: allocatedNumbers._id,
                active: true
            })

            if (childDetail) {
                ErrorResponse.message = `DID(s) assigned to child. Remove from that first!`;
                return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }

            if (!allocatedNumbers) {
                ErrorResponse.message = `DID ${did} not found or not allocated to user.`;
                return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }

            const superadminCheck = await userRepo.getByUserRole(USERS_ROLE.SUPER_ADMIN);
            const isSame = allocatedNumbers?.mapping_detail[0].parent_id.toString() === superadminCheck._id.toString();

            if (isSame) {
                // update did user mapping
                // await didUserMappingRepository.updateMappingDetail(allocatedNumbers.DID, { active: false, voice_plan_id : null, allocated_to:allocatedNumbers?.mapping_detail[0].allocated_to });

                await didUserMappingRepository.deleteMappingDetail(did, {allocated_to: user_id})

                // update numbers
                await numberRepo.update(did, { allocated_to: null, voice_plan_id : null  });

                //update voice plan
                await voicePlanRepo.update(allocatedNumbers?.mapping_detail[0].voice_plan_id , {is_allocated : 0})
            } else {
                let allocatedToId
                if (req.user.role !== USERS_ROLE.RESELLER) {
                    const getLoggedDetail = await userRepo.get(req.user.id)
                    allocatedToId = getLoggedDetail?.companies?._id?._id
                } else {
                    allocatedToId = req.user.id
                }

                const parentDetail = await didUserMappingRepository.checkMappingIfNotExists(did, {allocated_to : allocatedToId});

                // update did user mapping
                await didUserMappingRepository.deleteMappingDetail(did, {allocated_to: user_id})
                // await didUserMappingRepository.updateMappingDetail(allocatedNumbers.DID, { active: false, voice_plan_id : null , allocated_to :  allocatedNumbers?.mapping_detail[0].allocated_to});

                // update numbers
                await numberRepo.update(did, { allocated_to: parentDetail.mapping_detail[0].allocated_to, voice_plan_id : parentDetail.mapping_detail[0].voice_plan_id });
            }
        }

        SuccessRespnose.message = 'Success';
        Logger.info(`Numbers -> removed allocated numbers successfully`);
        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {
        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`Remove DID -> unable to remove DID(s), error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function setInboundRouting(req, res) {
    try {
        const bodyReq = req.body;
        if (bodyReq.numberType === 'DID') {
          await numberRepo.update(bodyReq.number, {
            routing_id: bodyReq.id,
            routing_type: (bodyReq.action).toUpperCase(),
            routing_destination : bodyReq.name
          })
        } else {
            const getDetail = await numberRepo.get(bodyReq.number)
            const getDID = await numberRepo.get(getDetail.routing_id)

            await numberRepo.update(getDID._id, {
                routing_id: bodyReq.id,
                routing_type: (bodyReq.action).toUpperCase(),
                routing_destination : bodyReq.name
              })
        }

        if (bodyReq.action === 'agent') {
            memberScheduleRepo.create({... bodyReq.agentSchedule, module_id : bodyReq.id})
        }

        SuccessRespnose.message = 'Success';

        Logger.info(`Numbers -> set up inbound routing on ${bodyReq.number} successfully`);
        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`Allocated numbers -> unable to get Allocated numbers list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);

    }

}

async function getNumbersToRemove(req, res) {
    try {
        let data;
        const allocatedToId = req.params.id

        if (req.user.role === USERS_ROLE.SUPER_ADMIN) {
            data = await numberRepo.getAllocatedNumbers(allocatedToId);
        } else {
            data = await numberRepo.getAllocatedNumbers(allocatedToId);
        }

        SuccessRespnose.data = data;
        SuccessRespnose.message = 'Success';

        Logger.info(`Numbers -> to be removed recieved successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`To be removed -> unable to get To be removed list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);

    }

}


module.exports = {
    create,
    uploadNumbers,
    getAll,
    get,
    deleteNumber,
    update,
    bulkUpdate,
    getDIDNumbers,
    getAllStatus,
    assignBulkDID,
    assignIndividualDID,
    updateStatus,
    DIDUserMapping,
    getToAllocateNumbers,
    getAllocatedNumbers,
    removeAllocatedNumbers,
    setInboundRouting,
    getNumbersToRemove
}