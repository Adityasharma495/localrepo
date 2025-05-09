const { StatusCodes } = require('http-status-codes');
const { SuccessRespnose, ErrorResponse } = require('../utils/common');
const { formatResponse, ResponseFormatter } = require("../utils/common")
const { Logger } = require('../config');
const { Op } = require("sequelize");
const { State } = require('country-state-city');
const {
  NumbersRepository,
  DIDUserMappingRepository,
  UserJourneyRepository,
  UserRepository,
  NumberFileListRepository,
  NumberStatusRepository,
  MemberScheduleRepo,
  CountryCodeRepository,
  VoicePlansRepository,
  CompanyRepository,
  CallCentreRepository,
  DidAllocateHistoryRepository,
  DidRemoveHistoryRepository,
} = require('../c_repositories');
const fs = require("fs");
const { MODULE_LABEL, ACTION_LABEL, BACKEND_API_BASE_URL, USERS_ROLE, NUMBER_STATUS_LABLE, DID_ALLOCATION_LEVEL } = require('../utils/common/constants');
const didUserMappingRepository = new DIDUserMappingRepository();
const userJourneyRepo = new UserJourneyRepository();
const numberRepo = new NumbersRepository();
const numFileListRepo = new NumberFileListRepository();
const numberStatusRepo = new NumberStatusRepository();
const userRepo = new UserRepository();
const memberScheduleRepo = new MemberScheduleRepo();
const countryCodeRepository = new CountryCodeRepository();
const companyRepo = new CompanyRepository();
const callCentreRepo = new CallCentreRepository();
const voicePlanRepo = new VoicePlansRepository();
const didAllocateHistoryRepo = new DidAllocateHistoryRepository();
const didRemoveHistoryRepo = new DidRemoveHistoryRepository();

const { constants } = require("../utils/common");
const NUMBER_STATUS = constants.NUMBER_STATUS_LABLE;
const stream = require('stream');
const csv = require('csv-parser');
const { level } = require('winston');
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
      state_code: bodyReq.number.state_code, create,
      cost: bodyReq.number.cost,
      operator: bodyReq.number.operator.toUpperCase(),
      number_type: bodyReq.number.number_type,
      created_by: req.user.id,
    });

    const didMapping = await didUserMappingRepository.create({
      DID: number.id,
      mapping_detail: [{
        allocated_to: req?.user?.id,
        active: true,
        level: 0,
        parent_id: null,
        voice_plan_id: null,
      }]
    });

    responseData.didMapping = didMapping;
    responseData.number = number;

    const userJourney = await userJourneyRepo.create({
      module_name: 'NUMBERS',
      action: ACTION_LABEL.ADD,
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

async function update(req, res) {
  const numberId = req.params.id;
  const bodyReq = req.body;

  try {
    const numberData = await numberRepo.findOne({ id: numberId });

    if (numberData.status !== bodyReq.number.status && req.user.role !== USERS_ROLE.SUPER_ADMIN) {
      bodyReq.number.updated_status = bodyReq.number.status;
      bodyReq.number.status = 9;
    }

    bodyReq.number.operator = bodyReq.number.operator.toUpperCase()

    const number = await numberRepo.update(numberId, bodyReq.number);

    if (!number) {
      throw new Error('Number not found');
    }

    await userJourneyRepo.create({
      module_name: 'NUMBERS',
      action: ACTION_LABEL.EDIT,
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
              DID: item.id,
              mapping_detail: [{
                allocated_to: req?.user?.id,
                active: true,
                level: 0,
                parent_id: null,
                voice_plan_id: null,
              }]
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
    let idToCheck;
    const loggedUser = await userRepo.get(req.user.id);

    if (req.user.role === USERS_ROLE.COMPANY_ADMIN) {
      idToCheck = loggedUser?.company?.id;
    } else if (req.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      idToCheck = loggedUser?.callcenter?.id;
    } else {
      idToCheck = req.user.id;
    }

      let data
      let level

      if (loggedUser?.role === USERS_ROLE.COMPANY_ADMIN) {
        data = await didUserMappingRepository.getForOthers(idToCheck, 4);
      } else if (loggedUser?.role === USERS_ROLE.RESELLER && loggedUser?.createdByUser?.role === USERS_ROLE.SUPER_ADMIN) {
        data = await didUserMappingRepository.getForOthers(idToCheck, 1);
      } else if (loggedUser?.role === USERS_ROLE.RESELLER && loggedUser?.createdByUser?.role === USERS_ROLE.RESELLER &&
        loggedUser?.createdByUser?.createdByUser?.role === USERS_ROLE.SUPER_ADMIN) {
          data = await didUserMappingRepository.getForOthers(idToCheck, 2);
      } else if (loggedUser?.role === USERS_ROLE.RESELLER && loggedUser?.createdByUser?.role === USERS_ROLE.RESELLER &&
        loggedUser?.createdByUser?.createdByUser?.role === USERS_ROLE.RESELLER) {
          data = await didUserMappingRepository.getForOthers(idToCheck, 3);
      } else if (loggedUser?.role === USERS_ROLE.CALLCENTRE_ADMIN) {
        data = await didUserMappingRepository.getForOthers(idToCheck, 5);
      } else {
        data = await didUserMappingRepository.getForSuperadmin(idToCheck);
      }

    const uniqueDIDs = [...new Set(data.map(item => Number(item.did?.id) || Number(item?.did)))];
    data = await numberRepo.findMany(uniqueDIDs);

    const reverseNumberStatus = Object.entries(NUMBER_STATUS).reduce((acc, [key, value]) => {
      acc[value] = key;
      return acc;
    }, {});

    data = await Promise.all(
      data.map(async (val) => {
        val.status = reverseNumberStatus[val.status] || val.status;

        let allocatedData = null;
        let finalData = {};

        const didMapping = await didUserMappingRepository.findOne({DID: val.id})

        level = didMapping.mapping_detail.length

        if (level === 1) {
          finalData = { name: '', id: null };
        } else if (level === 2 || level === 3 || level === 4) {
          allocatedData = await userRepo.get(val?.allocated_to)
          if (allocatedData) {
            finalData = { name: allocatedData.username, id: allocatedData.id };
          }
        } else if (level === 5) {
          allocatedData = await companyRepo.findOne({id : val?.allocated_to})
          finalData = { name: allocatedData?.name, id: allocatedData?.id };
          
        } else if (level === 6) {
          allocatedData = await callCentreRepo.findOne({id : val?.allocated_to})
          finalData = { name: allocatedData?.name, id: allocatedData?.id };
          
        }

        if (allocatedData) {
          val.allocated_to = finalData;
        }

        if (val.voice_plan) {
          val.voice_plan_id = val.voice_plan;
        }
        delete val.voice_plan_id;
        delete val.voice_plan;

        return val;
      })
    );

    data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    SuccessRespnose.data = data;
    SuccessRespnose.message = 'Success';

    Logger.info(`Number -> received all successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    console.log(error)
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
    Logger.error(`Number -> unable to get numbers list, error: ${JSON.stringify(error)}`);
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
      action: ACTION_LABEL.DELETE,
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
          action: ACTION_LABEL.ASSIGN_BULK_DID,
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

      await numberRepo.update(bodyReq.id, {
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
      action: ACTION_LABEL.ASSIGN_INDIVIDUAL_DID,
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
  const successDIDs = [];
  const failedDIDs = [];
  const successActualNumbers = [];

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
            voice_plan_id: bodyReq?.voice_plan_id,
            level: 1
          });

          await voicePlanRepo.update(bodyReq?.voice_plan_id, { is_allocated: 1 });
          await didAllocateHistoryRepo.create({
            DID: did,
            from_user: req.user.id,
            to_user: bodyReq.allocated_to,
            plan_id: bodyReq?.voice_plan_id,
            action: "ADD",
            level: 1
          })
          successDIDs.push(did);

          successActualNumbers.push(didDetail.map((data) => data.actual_number))

        } catch (err) {
          failedDIDs.push({ did, reason: err.message || "Failed to allocate number." });
        }
      }
    } else {
      for (const did of bodyReq.DID) {
        try {

          const parentVoicePlanDetailId = (await numberRepo.findOneWithVoicePlan({ id: Number(did) }))?.voice_plan_id;

          const ParentVoicePlanDetails = await voicePlanRepo.get(parentVoicePlanDetailId)
          const currentPlanDetail = await voicePlanRepo.findOne({ id: bodyReq?.voice_plan_id });

          const didDetail = await numberRepo.findOne({id: did})

          if (ParentVoicePlanDetails) {
            for (const plan1 of currentPlanDetail.plans) {
              const match = ParentVoicePlanDetails.plans.find(plan2 => plan2.plan_type === plan1.plan_type);


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

          if (bodyReq.allocated_to_role === USERS_ROLE.RESELLER) {
              const data = await userRepo.get(req.user.id)
                if (data?.createdByUser?.role === USERS_ROLE.SUPER_ADMIN) {
                  level = DID_ALLOCATION_LEVEL.SUB_RESELLER
                } else {
                  level = DID_ALLOCATION_LEVEL.SUB_SUB_RESELLER
              }
          }
          else if (bodyReq.allocated_to_role === USERS_ROLE.COMPANY_ADMIN) {
              const isCompanyUser = await companyRepo.findOne({id: bodyReq.allocated_to})
              if (isCompanyUser) {
                  level = DID_ALLOCATION_LEVEL.COMPANY_ADMIN
              } 
              
          } else if (bodyReq.allocated_to_role === USERS_ROLE.CALLCENTRE_ADMIN) {
                  level = DID_ALLOCATION_LEVEL.CALLCENTER
          }

          await didUserMappingRepository.addMappingDetail(did, {
            level,
            allocated_to: bodyReq.allocated_to,
            parent_id: req.user.id,
            voice_plan_id: bodyReq?.voice_plan_id,
          });

          await numberRepo.update(did, {
              level,
              allocated_to: bodyReq.allocated_to,
              voice_plan_id: bodyReq?.voice_plan_id,
          });

          await didAllocateHistoryRepo.update({DID: did}, {active: false})

          await didAllocateHistoryRepo.create({
            DID: did,
            from_user: req.user.id,
            to_user: bodyReq.allocated_to,
            plan_id: bodyReq?.voice_plan_id,
            action: "ADD",
            level: level
          })

          await voicePlanRepo.update(bodyReq?.voice_plan_id, { is_allocated: 1 });
          successDIDs.push(did);
          successActualNumbers.push(didDetail.actual_number)

        } catch (err) {
          continue;
        }
      }

    }
    return res.status(200).json({
      message: "DIDs allocated successfully",
      data: {
        total: bodyReq.DID.length,
        processed: successDIDs.length,
        failed: failedDIDs.length,
        successDIDs,
        failedDIDs,
        successActualNumbers,
      },
    });
  } catch (error) {
    console.error("Allocation error:", error);
    return res.status(500).json({
      message: "Something went wrong during allocation",
      error,
    });
  }
}


async function getToAllocateNumbers(req, res) {
  const allocatedToId = req.params.id;

  try {

    let data;
      if (req.user.role === USERS_ROLE.SUPER_ADMIN ) {
        data = await numberRepo.getAll({ where: { allocated_to: null } });
      } else if (req.user.role === USERS_ROLE.COMPANY_ADMIN) {
        data = await numberRepo.getAll({ where: { allocated_to: allocatedToId , level: 4} });
      } else {
        data = await numberRepo.getAll({ where: { allocated_to: allocatedToId } });
      }

    SuccessRespnose.data = formatResponse.formatResponseIds(data, version);

    SuccessRespnose.data = data.map(item => {
      const obj = { ...item };
      obj.created_at = obj.createdAt;
      obj.updated_at = obj.updatedAt;
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    });

    SuccessRespnose.message = 'Success';
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getAllocatedNumbers(req, res) {
  try {
      const allocatedToId = req.params.id;
      const loggedUser = await userRepo.get(req.user.id)
      let allocatedNumbers
      let level

      if (loggedUser?.role === USERS_ROLE.COMPANY_ADMIN) {
        allocatedNumbers = await didUserMappingRepository.getForOthers(allocatedToId, 5);
        level = 5
      } else if (loggedUser?.role === USERS_ROLE.RESELLER && loggedUser?.createdByUser?.role === USERS_ROLE.SUPER_ADMIN) {
        allocatedNumbers = await didUserMappingRepository.getForOthers(allocatedToId, 2);
        level = 2

        if (!allocatedNumbers) {
          allocatedNumbers = await didUserMappingRepository.getForOthers(allocatedToId, 4);
          level = 4
        }
      } else if (loggedUser?.role === USERS_ROLE.RESELLER && loggedUser?.createdByUser?.role === USERS_ROLE.RESELLER &&
        loggedUser?.createdByUser?.createdByUser?.role === USERS_ROLE.SUPER_ADMIN) {
          allocatedNumbers = await didUserMappingRepository.getForOthers(allocatedToId, 3);
          level = 3

          if (!allocatedNumbers) {
            allocatedNumbers = await didUserMappingRepository.getForOthers(allocatedToId, 4);
            level = 4
          }
      } else if (loggedUser?.role === USERS_ROLE.RESELLER && loggedUser?.createdByUser?.role === USERS_ROLE.RESELLER &&
        loggedUser?.createdByUser?.createdByUser?.role === USERS_ROLE.RESELLER) {
          allocatedNumbers = await didUserMappingRepository.getForOthers(allocatedToId, 4);
          level = 4
      } else {
        allocatedNumbers = await didUserMappingRepository.getForOthers(allocatedToId, 1);
        level = 1
      }

      const allocatedId = allocatedNumbers.length > 0 ? allocatedNumbers[0]?.mapping_detail[0].allocated_to: null 

      let allocatedTo;
      if (level === 1 || level === 2 || level === 3) {
          allocatedTo = (await userRepo.get(allocatedId))?.username
      } else if (level === 4) {
          const company = await companyRepo.findOne({id : allocatedId})
          allocatedTo = company?.name
      } else if (level === 5) {
          allocatedTo = (await callCentreRepo.findOne({id : allocatedId}))?.name
      }
      const allocatedBy = req.user.username
      const uniqueDIDs = [...new Set(allocatedNumbers.map(item => item.DID))];

      // Create a map of DID to voiceplan_id
      const didVoicePlanMap = {};

      allocatedNumbers.forEach(async (item) => {
      didVoicePlanMap[item?.did?.id] = item.mapping_detail[0]?.voice_plan_id;
      });

      let data = await numberRepo.findMany(uniqueDIDs);
      data = data.map(item => item.toJSON());

      const updatedData = data.map((item) => {
          return {
            ...item,  
            voice_plan_id: didVoicePlanMap[item.id] ,
            allocated_name: allocatedTo, 
            allocated_by: allocatedBy,
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
  const { DID, user_id } = req.body;
  try {
    for (const did of DID) {
      let allocatedNumbers = await didUserMappingRepository.checkMappingIfNotExists(did, {
        allocated_to: user_id,
      });

      const childDetail = await didUserMappingRepository.checkMappingIfNotExists(did, {
        parent_id: allocatedNumbers.id,
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

      const isSame = allocatedNumbers?.mapping_detail[0].parent_id.toString() === superadminCheck.id.toString();

      if (isSame) {

        const removedDetails = await didUserMappingRepository.deleteMappingDetail(did, { allocated_to: user_id })

        // update numbers
        await numberRepo.update(did, { allocated_to: null, voice_plan_id: null, level: 0 });

        await didRemoveHistoryRepo.create({
            DID: did,
            remove_from: removedDetails[0]?.allocated_to,
            remove_by: req.user.id,
            plan_id: removedDetails[0]?.voice_plan_id,
            action: 'Remove',
            level: removedDetails[0]?.level
        })

        const planId = await didUserMappingRepository.checkPlanIdExists(removedDetails[0]?.level, removedDetails[0]?.voice_plan_id)

        if (!planId) {
          await voicePlanRepo.update(removedDetails[0]?.voice_plan_id, { is_allocated: 0 })
        }

      } else {
        let allocatedToId

        if (req.user.role === USERS_ROLE.SUPER_ADMIN) {
          allocatedToId = req.user.id
        }
        else if (req.user.role !== USERS_ROLE.RESELLER) {
          const getLoggedDetail = await userRepo.get(req.user.id)

          allocatedToId = getLoggedDetail?.companies?._id?.id
        } else {
          allocatedToId = req.user.id
        }

        const parentDetail = await didUserMappingRepository.checkMappingIfNotExists(did, { allocated_to: allocatedToId });

        // update did user mapping
        const removedDetails = await didUserMappingRepository.deleteMappingDetail(did, { allocated_to: user_id })

        // update numbers
        await numberRepo.update(did, { allocated_to: parentDetail.mapping_detail[0].allocated_to, voice_plan_id: parentDetail.mapping_detail[0].voice_plan_id, level: parentDetail.mapping_detail[0].level });

        await didRemoveHistoryRepo.create({
            DID: did,
            remove_from: removedDetails[0]?.allocated_to,
            remove_by: req.user.id,
            plan_id: removedDetails[0]?.voice_plan_id,
            action: "REMOVE",
            level: removedDetails[0]?.level
        })

        const planId = await didUserMappingRepository.checkPlanIdExists(removedDetails[0]?.level, removedDetails[0]?.voice_plan_id)

        if (!planId) {
          await voicePlanRepo.update(removedDetails[0]?.voice_plan_id, { is_allocated: 0 })
        }

      }
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
  setInboundRouting,
  getNumbersToRemove,
}