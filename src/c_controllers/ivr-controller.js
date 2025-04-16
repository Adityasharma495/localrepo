const { StatusCodes } = require("http-status-codes");
const { 
  UserJourneyRepository,
  FlowRepository,
  FlowControlRepository,
  FlowEdgesRepository, 
  FlowJsonRepository,
  MemberScheduleRepo, 
  UserRepository
} = require("../c_repositories");
const { IVRSettings } = require("../c_db"); 
const { SuccessRespnose, ErrorResponse, ResponseFormatter } = require("../utils/common");
const { MODULE_LABEL, ACTION_LABEL } = require('../utils/common/constants');
const { v4: uuidv4 } = require('uuid');
const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");
const amqp = require("amqplib");
const sequelize = require('../config/sequelize');
const version = process.env.API_V || '1'; 

const userJourneyRepo = new UserJourneyRepository();
const flowsRepo = new FlowRepository();
const flowsControlRepo = new FlowControlRepository();
const flowEdgesRepo = new FlowEdgesRepository();
const memberScheduleRepo = new MemberScheduleRepo();
const flowJsonRepository = new FlowJsonRepository();
const userRepository = new UserRepository();


async function createIVR(req, res) {
  const transaction = await sequelize.transaction();
  let transactionCommitted = false;
  try {
    const bodyReq = req.body;
    const flowId = uuidv4();
    const userDetail = await userRepository.get(req.user.id);

    // Check for duplicate flow name
    const duplicateConditions = {
      created_by: req.user.id,
      flow_name: bodyReq.nodesData.flowName
    };
    
    const checkDuplicate = Number(userDetail?.flow_type == 1) 
      ? await flowsRepo.findOne(duplicateConditions, { transaction })
      : await flowJsonRepository.findOne(duplicateConditions, { transaction });

    if (checkDuplicate) {
      await transaction.rollback();
      ErrorResponse.message = 'Flow Name Already Exists';
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    let scheduleData;
    if (bodyReq.nodesData.scheduleData && Object.keys(bodyReq.nodesData.scheduleData).length > 0) {
      scheduleData = await memberScheduleRepo.create({
        ...bodyReq.nodesData.scheduleData,
        module_id: flowId
      }, { transaction });
    }

    const flowData = {
      call_center_id: bodyReq.nodesData.callCenterId,
      flow_name: bodyReq.nodesData.flowName,
      flow_id: flowId,
      nodes_data: bodyReq.nodesData,
      edges_data: bodyReq.edges,
      type: userDetail.flow_type,
      created_by: req.user.id,
      schedule_id: scheduleData?.id || null,
      file_data: bodyReq.nodesData.fileData,
      re_prompt: bodyReq.nodesData.rePrompt,
      is_gather_node: bodyReq.nodesData.isGatherNode == true ? 1 : 0
    };

    let flowRepoData;
    let flowEdgesData;
    let flowControlData;
    let flowJsonData;

    if (Number(userDetail?.flow_type == 1)) {
      flowRepoData = await flowsRepo.create(bodyReq.nodesData, req.user.id, flowId, { transaction });
      
      if (bodyReq.edges.length > 0) {
        flowEdgesData = await flowEdgesRepo.create({
          flow_id: flowId,
          edge_json: bodyReq.edges
        }, { transaction });

        flowControlData = await flowsControlRepo.create(bodyReq.nodesData, flowId, { transaction });
      }

      if (scheduleData) {
        await flowsRepo.updateByFlowId(flowId, { schedule_id: scheduleData.id }, { transaction });
      }
    }

    flowJsonData = await flowJsonRepository.create(flowData, { transaction });

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.IVR,
      action: ACTION_LABEL.ADD,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();
    transactionCommitted = true;

    if (Number(userDetail?.flow_type) !== 1) {
      Logger.info('Publishing message to queue');
      await publishIVRUpdate();
    }

    SuccessRespnose.message = "Successfully created a new IVR";
    SuccessRespnose.data = {
      flowRepoData: ResponseFormatter.formatResponseIds(flowRepoData, version),
      flowEdgesData: ResponseFormatter.formatResponseIds(flowEdgesData, version), 
      flowControlData: ResponseFormatter.formatResponseIds(flowControlData, version), 
      flowJsonData: ResponseFormatter.formatResponseIds(flowJsonData, version)
    };
    Logger.info(`IVR created successfully: ${flowId}`);
    return res.status(StatusCodes.CREATED).json(SuccessRespnose);

  } catch (error) {
    console.log("error while creating ivr", error);
    if (!transactionCommitted) {
      await transaction.rollback();
    }
    Logger.error(`Error creating IVR: ${error}`);
    ErrorResponse.message = "Unable to create IVR";
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getIVRSettings(req, res) {
  try {
    const ivrSettings = await IVRSettings.findOne({});
    
    if (!ivrSettings) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        success: false,
        message: 'IVR settings not found',
        data: null
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'IVR settings retrieved successfully',
      data: ivrSettings
    });

  } catch (error) {
    Logger.error(`IVR Settings Fetch Error: ${error.stack || error}`);

    const errorResponse = {
      success: false,
      message: 'Failed to retrieve IVR settings',
      data: null
    };
   
    if (process.env.NODE_ENV == 'development') {
      errorResponse.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function getAllIVR(req, res) {
  try {
    const data = await flowJsonRepository.getAll({ created_by: req.user.id });
    SuccessRespnose.data = ResponseFormatter.formatResponseIds(data, version);
    SuccessRespnose.message = "Success";
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    Logger.error(`Error getting all IVRs: ${error}`);
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function updateIVR(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;
    const bodyReq = req.body;
    const userDetail = await userRepository.get(req.user.id);

    // Fetch current IVR data
    const currentData = Number(userDetail?.flow_type) == 1 
      ? await flowsRepo.getIVRByFlowId(id, { transaction })
      : await flowJsonRepository.getIVRByFlowId(id, { transaction });

    const currentFlowData = Array.isArray(currentData) ? currentData[0] : currentData;

    // ✅ Skip duplicate check if flow name hasn't changed
    if (currentFlowData?.flow_name !== bodyReq.nodesData.flowName) {
      const duplicateCheck = await (Number(userDetail?.flow_type == 1) ? flowsRepo : flowJsonRepository)
        .findOne({
          created_by: req.user.id,
          flow_name: bodyReq.nodesData.flowName
        }, { transaction });

      if (duplicateCheck) {
        await transaction.rollback();
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Flow Name already exists'
        });
      }
    }

    await flowJsonRepository.deleteIVRByFlowId(id, { transaction });

    if (Number(userDetail?.flow_type == 1)) {
      await flowsRepo.deleteIVRByFlowId(id, { transaction });
      await flowsControlRepo.deleteIVRByFlowId(id, { transaction });
      await flowEdgesRepo.deleteIVRByFlowId(id, { transaction });
    }

    // ✅ Now safely delete `member_schedules`
    await memberScheduleRepo.deleteByModuleId(id, { transaction });

    // ✅ Recreate `member_schedules` if `scheduleData` exists
    let scheduleData = null;
    if (bodyReq.nodesData.scheduleData && Object.keys(bodyReq.nodesData.scheduleData).length > 0) {
      scheduleData = await memberScheduleRepo.create({
        ...bodyReq.nodesData.scheduleData,
        module_id: id
      }, { transaction });
    }

    // ✅ Construct IVR data for insertion
    const flowData = {
      call_center_id: bodyReq.nodesData.callCenterId,
      flow_name: bodyReq.nodesData.flowName,
      flow_id: id,
      nodes_data: bodyReq.nodesData,
      edges_data: bodyReq.edges,
      type: userDetail.flow_type,
      created_by: req.user.id,
      schedule_id: scheduleData?.id || null,
      file_data: bodyReq.nodesData.fileData,
      re_prompt: bodyReq.nodesData.rePrompt,
      is_gather_node: bodyReq.nodesData.isGatherNode == true ? 1 : 0
    };

    // ✅ Insert new IVR data
    if (Number(userDetail?.flow_type == 1)) {
      await flowsRepo.create(bodyReq.nodesData, req.user.id, id, { transaction });

      if (bodyReq.edges.length > 0) {
        await flowEdgesRepo.create({
          flow_id: id,
          edge_json: bodyReq.edges
        }, { transaction });

        await flowsControlRepo.create(bodyReq.nodesData, id, { transaction });
      }
    }

    await flowJsonRepository.create(flowData, { transaction });

    // ✅ Log user action
    await userJourneyRepo.create({
      module_name: MODULE_LABEL.IVR,
      action: ACTION_LABEL.EDIT,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Updated successfully!'
    });

  } catch (error) {
    await transaction.rollback();
    Logger.error(`Error updating IVR: ${error}`);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to update IVR',
      error: {
        statusCode: 500,
        explanation: error.message
      }
    });
  }
}


async function deleteIVR(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const id = req.body.ivrIds;

     
    await flowJsonRepository.deleteIVRByFlowId(id, { transaction });

 
    await flowsRepo.deleteIVRByFlowId(id, { transaction });
    await flowsControlRepo.deleteIVRByFlowId(id, { transaction });
    await flowEdgesRepo.deleteIVRByFlowId(id, { transaction });

    
    await memberScheduleRepo.deleteByModuleId(id, { transaction });

     
    await userJourneyRepo.create({
      module_name: MODULE_LABEL.IVR,
      action: ACTION_LABEL.DELETE,
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    SuccessRespnose.message = "Deleted successfully!";
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    console.log("error", error);
    await transaction.rollback();
    Logger.error(`Error deleting IVR: ${error}`);
    
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name == 'SequelizeDatabaseError') {
      statusCode = StatusCodes.BAD_REQUEST;
    }

    ErrorResponse.message = errorMsg;
    return res.status(statusCode).json(ErrorResponse);
  }
}


async function getIVRByFlowId(req, res) {
  try {
    const ivrId = req.params.id;
    const data = await flowJsonRepository.getIVRByFlowId(ivrId);
    
    if (!data) {
      throw new AppError('IVR not found', StatusCodes.NOT_FOUND);
    }
    const nodesData = transformData(data);
    const edgeData = { edgeJson: data.edges_data };
    const scheduleData = await memberScheduleRepo.getAll(ivrId);

    SuccessRespnose.data = {
      nodesData: ResponseFormatter.formatResponseIds(nodesData, version),
      edgeData: ResponseFormatter.formatResponseIds(edgeData, version),
      scheduleData: ResponseFormatter.formatResponseIds(scheduleData, version),
      fileData: ResponseFormatter.formatResponseIds(data.file_data, version),
      rePrompt: ResponseFormatter.formatResponseIds(data.re_prompt, version),
      isGatherNode: ResponseFormatter.formatResponseIds(data.is_gather_node, version)
    };
    
    SuccessRespnose.message = "Success";
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    console.log("error", error);
    Logger.error(`Error getting IVR by flow ID: ${error}`);
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

function transformData(input) {
  return Object.values(input.nodes_data.nodes).map(node => ({
    id: input.id,
    call_center_id: input.call_center_id,
    flow_name: input.flow_name,
    flow_id: input.flow_id,
    node_id: parseInt(node.id),
    schedule_id: input.schedule_id || null,
    flow_json: node.flowJson,
    status: input.status,
    flow_render: node.flowRender,
    created_by: input.created_by,
    created_at: input.created_at,
    updated_at: input.updated_at
  }));
}

async function publishIVRUpdate() {
  try {
    const connection = await amqp.connect("amqp://dialplan:ns@4044888@localhost:5672");
    const channel = await connection.createChannel();
    const exchange = "dialplan_exchange";
    const routingKey = "dialplan.update";

    await channel.assertExchange(exchange, "fanout", { durable: true });
    channel.publish(exchange, routingKey, Buffer.from("dialplan reload"));
    
    Logger.info(`Sent message to exchange: ${exchange}`);
    await channel.close();
    await connection.close();
  } catch (error) {
    Logger.error("Error publishing message:", error);
    throw error;
  }
}

module.exports = {
  createIVR,
  updateIVR,
  deleteIVR,
  getAllIVR,
  getIVRSettings,
  getIVRByFlowId
};