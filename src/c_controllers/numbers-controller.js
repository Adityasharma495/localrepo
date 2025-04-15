const { StatusCodes } = require('http-status-codes');
const { SuccessRespnose, ErrorResponse } = require('../utils/common');
const {formatResponse,ResponseFormatter} = require("../utils/common")
const { Logger } = require('../config');
const { State} = require('country-state-city');
const {
    NumbersRepository,
    DIDUserMappingRepository,
    UserJourneyRepository,
    UserRepository,
    NumberFileListRepository,
    NumberStatusRepository,
    MemberScheduleRepo,
    CountryCodeRepository
   } = require('../c_repositories');
const fs = require("fs");
const {MODULE_LABEL, ACTION_LABEL, BACKEND_API_BASE_URL, USERS_ROLE, NUMBER_STATUS_LABLE, DID_ALLOCATION_LEVEL} = require('../utils/common/constants');
const didUserMappingRepository = new DIDUserMappingRepository();
const userJourneyRepo = new UserJourneyRepository();
const numberRepo = new NumbersRepository();
const numFileListRepo = new NumberFileListRepository();
const numberStatusRepo = new NumberStatusRepository();
const userRepo = new UserRepository();
const memberScheduleRepo = new MemberScheduleRepo();
const countryCodeRepository = new CountryCodeRepository();

const { constants } = require("../utils/common");
const NUMBER_STATUS = constants.NUMBER_STATUS_LABLE;
const stream = require('stream');
const csv = require('csv-parser');
const version = process.env.API_V || '1';

async function create(req, res) {
    const bodyReq = req.body;
    try {
      const responseData = {};
  
      const number = await numberRepo.create({
        actual_number: bodyReq.number.actual_number,
        status: bodyReq.number.status,
        category: bodyReq.number.category,
        currency: bodyReq.number.currency,
        country_code: bodyReq.number.country_code,
        state_code: bodyReq.number.state_code,create,
        cost: bodyReq.number.cost,
        operator: bodyReq.number.operator.toUpperCase(),
        number_type: bodyReq.number.number_type,
        created_by: req.user.id,
      });
  
      const didMapping = await didUserMappingRepository.create({
        DID: number.id,
        mapping_detail: [{
          allocated_to: req?.user?.id
        }]
      });

      responseData.didMapping = didMapping;
      responseData.number = number;
  
      const userJourney = await userJourneyRepo.create({
        module_name: 'NUMBERS',
        action: 'ADD',
        created_by: req.user.id,
      });
  
      responseData.userJourney = userJourney;
  
      SuccessRespnose.data = responseData;
      SuccessRespnose.message = "Successfully created a new Number";
  
      return res.status(StatusCodes.CREATED).json(SuccessRespnose);
    } catch (error) {
      Logger.error(`Number -> unable to create Number: ${JSON.stringify(bodyReq)} error: ${JSON.stringify(error)}`);
  
      let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      if (error.name === "SequelizeUniqueConstraintError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = `Duplicate key, record already exists for ${error.errors[0].value}`;
      }
  
      ErrorResponse.message = errorMsg;
      ErrorResponse.error = error;
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }

async function update(req, res) {
    const numberId = req.params.id;
    const bodyReq = req.body;
  
    try {
      const numberData = await numberRepo.findOne({ id: numberId });
  
      if (numberData.status !== bodyReq.number.status && req.user.role !== USERS_ROLE.SUPER_ADMIN) {
        bodyReq.number.updated_status = bodyReq.number.status;
        bodyReq.number.status = 9;  
      }
  
      const number = await numberRepo.update(numberId, bodyReq.number);
  
      if (!number) {
        throw new Error('Number not found');
      }
  
      await userJourneyRepo.create({
        module_name: 'NUMBERS',
        action: 'EDIT',
        created_by: req.user.id,
      });
  
      SuccessRespnose.message = 'Updated successfully!';
      SuccessRespnose.data = number;
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      Logger.error(`Numbers -> unable to Update: ${JSON.stringify(error)} error: ${JSON.stringify(error)}`);
  
      let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      if (error.name === "SequelizeUniqueConstraintError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = `Duplicate key, record already exists for ${error.errors[0].value}`;
      }
  
      ErrorResponse.message = errorMsg;
      ErrorResponse.error = error;
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }

  // async function getAll(req, res) {
  //   try {
  //     let data;
  //     if (req.user.role === USERS_ROLE.SUPER_ADMIN) {
  //       data = await didUserMappingRepository.findAll({ where: { allocated_to: req.user.id } });
  //     } else {
  //       data = await didUserMappingRepository.findAll({ where: { allocated_to: req.user.id } });
  //     }
  
  //     const uniqueDIDs = [...new Set(data.map(item => item.DID))];
  //     data = await numberRepo.findAll({ where: { id: uniqueDIDs } });
  
  //     data = data.map(val => {
  //       val.status = numberStatusValues[val.status];
  //       return val;
  //     }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  //     SuccessRespnose.data = data;
  //     SuccessRespnose.message = 'Success';
  
  //     return res.status(StatusCodes.OK).json(SuccessRespnose);
  //   } catch (error) {
  //     ErrorResponse.message = error.message;
  //     ErrorResponse.error = error;
  //     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  //   }
  // }

async function bulkUpdate(req, res) {
    const file = req.file;
    const bodyReq = req.body;
  
    try {
      if (!file) {
        throw new Error('File not found');
      }
  
      const records = [];
      const dataPromises = [];
  
      const readableStream = new stream.PassThrough();
      readableStream.end(file.buffer);
  
      readableStream
        .pipe(csv())
        .on('data', (row) => {
          const dataPromise = (async () => {
            
            records.push({
              status: row.Status,
              actual_number: row['DID'],
              category: row?.Category || null,
              currency: row.Currency,
              country_code: row['Country Code'],
              state_code: row?.['State Code'] || null,
              cost: row.Cost,
              operator: row.Operator.toUpperCase(),
              number_type: bodyReq.numberType,
              created_by: req.user.id
            });
          })();
          dataPromises.push(dataPromise);
        })
        .on('end', async () => {
          await Promise.all(dataPromises);
  
          const bulkOps = records.map(record => ({
            insertOne: { document: record },
          }));
  
          await numberRepo.bulkCreate(records);
  
          SuccessRespnose.message = 'Successfully Uploaded Numbers.';
          return res.status(StatusCodes.CREATED).json(SuccessRespnose);
        });
    } catch (error) {
      Logger.error(`File processing error: ${error}`);
      ErrorResponse.message = 'Error while processing the file.';
      ErrorResponse.error = error;
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
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
                        DID: item._id,
                        allocated_to: req?.user?.id
                      }));
                    await didUserMappingRepository.insertMany(DIDAlloction);
                }

                if (!headersSent) {
                    const SuccessRespnose = {
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

async function getAll(req, res) {
  try {
    let data;
    if (req.user.role === USERS_ROLE.SUPER_ADMIN) {
      data = await didUserMappingRepository.getForSuperadmin(req.user.id);
    } else {
      data = await didUserMappingRepository.getForOthers(req.user.id);
    }

    const uniqueDIDs = [...new Set(data.map(item => item.DID))];
    data = await numberRepo.getAll(uniqueDIDs);

    const reverseNumberStatus = Object.entries(NUMBER_STATUS).reduce((acc, [key, value]) => {
      acc[value] = key;
      return acc;
    }, {});

    data = data
      .map(val => {
        val.status = reverseNumberStatus[val.status] || val.status;
        return val;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    SuccessRespnose.data = formatResponse.formatResponseIds(data, version);

    SuccessRespnose.message = 'Success';

    Logger.info(`Number -> received all successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
    Logger.error(`Call Centre -> unable to get call centres list, error: ${JSON.stringify(error)}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}


async function get(req, res) {
    const numberId = req.params.id;

    try {
      const data = await numberRepo.findOne({ id: numberId });
  
      if (data.is_deleted) {
        ErrorResponse.message = `Number ${numberId} is deleted`;
        return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
      }
      SuccessRespnose.data = data;
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }

  async function deleteNumber(req, res) {
    const ids = req.body.numberIds;
    try {
      await numberRepo.deleteMany(ids);
  
      await userJourneyRepo.create({
        module_name: 'NUMBERS',
        action: 'DELETE',
        created_by: req.user.id,
      });
  
      SuccessRespnose.message = 'Deleted successfully!';
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }

async function getDIDNumbers(req, res) {
  const numberType = 'DID';
  try {
    const data = await numberRepo.getAll({ where: { number_type: numberType } });

    if (data.is_deleted) {
      ErrorResponse.message = `Number ${numberType} is deleted`;
      return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
    }


    
    SuccessRespnose.data = ResponseFormatter.formatResponseIds(data, version);
    SuccessRespnose.message = 'Successfully retrieved DID numbers.';
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getAllStatus(req, res) {
    try {
      const data = await numberStatusRepo.getAll();

      const filteredData = data.filter(item => item.status_code !== 9 && item.status_code !== 10);
  


      SuccessRespnose.data = formatResponse.formatResponseIds(filteredData, version);
      SuccessRespnose.message = 'Success';
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }

  async function assignBulkDID(req, res) {
    const dest = req.file.path;
    const bodyReq = req.body;
    try {
      if (!fs.existsSync(dest)) {
        throw new Error('File not found');
      }
  
      const records = [];
      fs.createReadStream(dest)
        .pipe(csv())
        .on('data', (row) => {
          records.push(row);
        })
        .on('end', async () => {
          for (const record of records) {
            const numberType = bodyReq.type === 'VMN' ? 'VMN' : 'TOLL FREE';
            const existingNumber = await numberRepo.findOne({
              actual_number: record[numberType],
              number_type: numberType
            });
  
            if (existingNumber) {
              await numberRepo.update(existingNumber.id, {
                status: NUMBER_STATUS_LABLE[record['STATUS']],
                routing_destination: Number(record.DID),
                routing_type: numberType,
              });
            }
          }
  
          await userJourneyRepo.create({
            module_name: 'NUMBERS',
            action: 'ASSIGN_BULK_DID',
            created_by: req.user.id,
          });
  
          SuccessRespnose.message = 'Successfully assigned Bulk DID.';
          return res.status(StatusCodes.CREATED).json(SuccessRespnose);
        });
    } catch (error) {
      ErrorResponse.message = 'Error while processing assigning bulk DID file.';
      ErrorResponse.error = error;
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }

  async function assignIndividualDID(req, res) {

    const bodyReq = req.body;

    try {

      try {
        
        await numberRepo.update(bodyReq._id, {
          status: bodyReq.status,
          routing_destination: bodyReq.DID,
          routing_type: bodyReq.numberType,
          routing_id: bodyReq.DID_id,
          expiry_date: bodyReq.expiryDate || null,
        });
      } catch (error) {
        console.log("ERROR HERE", error);
      }
      
  
      await userJourneyRepo.create({
        module_name: 'NUMBERS',
        action: 'ASSIGN_INDIVIDUAL_DID',
        created_by: req.user.id,
      });
  
      SuccessRespnose.message = 'Successfully assigned Individual DID.';
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = 'Error while assigning Individual DID.';
      ErrorResponse.error = error;
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }

  async function updateStatus(req, res) {
    const bodyReq = req.body;
    try {
      const number = await numberRepo.update(bodyReq.updateId, {
        status: Number(bodyReq.status),
        updated_status: bodyReq.updated_status,
      });
 
      const action = bodyReq.action === 'Reject' ? 'STATUS_ACTION_REJECT' : 'STATUS_ACTION_APPROVED';
      await userJourneyRepo.create({
        module_name: 'NUMBERS',
        action: action,
        created_by: req.user.id,
      });
  
      SuccessRespnose.message = 'Status updated successfully!';
      SuccessRespnose.data = number;
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }

  async function DIDUserMapping(req, res) {
    const bodyReq = req.body;
    try {
      for (const did of bodyReq.DID) {
        const availCheck = await didUserMappingRepository.findOne({
          DID: did, 
          allocated_to: bodyReq.allocated_to
        });
  
        if (availCheck) {
          await didUserMappingRepository.update(availCheck.id, { active: true });
          await numberRepo.update(did, { allocated_to: availCheck.allocated_to });
        } else {
          await didUserMappingRepository.create({
            DID: did,
            level: 1,
            allocated_to: bodyReq.allocated_to,
            parent_id: req.user.id,
          });
          await numberRepo.update(did, { allocated_to: bodyReq.allocated_to });
        }
      }
  
      SuccessRespnose.message = 'Number(s) Allocated Successfully!';
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }


  async function getToAllocateNumbers(req, res) {
    const allocatedToId = req.params.id;


    try {
      const roleToCheck = await userRepo.findOne({ id: allocatedToId });
      let data;
      if (roleToCheck.role === USERS_ROLE.SUPER_ADMIN) {s
        data = await numberRepo.getAll({ where: { allocated_to: null } });
      } else {
        data = await numberRepo.getAll({ where: { allocated_to: allocatedToId } });
      }
  

      SuccessRespnose.data = formatResponse.formatResponseIds(data,version);
      SuccessRespnose.message = 'Success';
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }

  async function getAllocatedNumbers(req, res) {
    const allocatedToId = req.params.id;
    try {
      const allocatedNumbers = await didUserMappingRepository.getAll({ where: { allocated_to: allocatedToId } });
      const uniqueDIDs = [...new Set(allocatedNumbers.map(item => item.DID))];
      const data = await numberRepo.getAll({ where: { id: uniqueDIDs } });
      const response = {
       
        data: data.map(item => ({
          allocated_name: allocatedNumbers[0]?.allocated_to?.username || null,
          allocated_by: req.user.username,
        })),
        is_removal_button: allocatedNumbers.length > 0,
      };
  
      SuccessRespnose.data = response;
      SuccessRespnose.message = 'Success';
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }

  async function removeAllocatedNumbers(req, res) {
    const { DID, user_id } = req.body;
    try {
      for (const did of DID) {
        const allocatedNumbers = await didUserMappingRepository.findOne({
          DID: did, 
          allocated_to: user_id
        });
  
        if (!allocatedNumbers) {
          ErrorResponse.message = `DID ${did} not found or not allocated to user.`;
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
  
        await didUserMappingRepository.update(allocatedNumbers.id, { active: false });
        await numberRepo.update(did, { allocated_to: null });
      }
  
      SuccessRespnose.message = 'Success';
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }

  async function setInboundRouting(req, res) {
    const bodyReq = req.body;
    try {
      if (bodyReq.numberType === 'DID') {
        await numberRepo.update(bodyReq.number, {
          routing_id: bodyReq.id,
          routing_type: bodyReq.action.toUpperCase(),
          routing_destination: bodyReq.name,
        });
      } else {
        const getDetail = await numberRepo.findOne({ id: bodyReq.number });
        const getDID = await numberRepo.findOne({ id: getDetail.routing_id });
  
        await numberRepo.update(getDID.id, {
          routing_id: bodyReq.id,
          routing_type: bodyReq.action.toUpperCase(),
          routing_destination: bodyReq.name,
        });
      }
  
      if (bodyReq.action === 'agent') {
        await memberScheduleRepo.create({ ...bodyReq.agentSchedule, module_id: bodyReq.id });
      }
  
      SuccessRespnose.message = 'Success';
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
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
    setInboundRouting
}