const { StatusCodes } = require("http-status-codes");
const { UserJourneyRepository,FLowRepository,FlowControlRepository,
  FlowEdgesRepository, MemberScheduleRepository, FlowJsonRepository,
  UserRepository } = require("../repositories");
const {SuccessRespnose , ErrorResponse , Authentication } = require("../utils/common");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const {IvrSettings} = require('../db')
const { v4: uuidv4 } = require('uuid');
const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");

const userJourneyRepo = new UserJourneyRepository();
const flowsRepo = new FLowRepository();
const flowsControlRepo = new FlowControlRepository();
const flowEdgesRepo = new FlowEdgesRepository();
const memberScheduleRepo = new MemberScheduleRepository();
const flowJsonRepository = new FlowJsonRepository();
const userRepository = new UserRepository();
const amqp = require("amqplib");


async function createIVR(req, res) {
  const bodyReq = req.body;
  
  try {
    const flowId = uuidv4();

    const userDetail = await userRepository.get(req.user.id)

    if (userDetail?.flow_type == 1) {
      // check for duplicate Flow name
      const conditions = {
        created_by: req.user.id, 
        flow_name: bodyReq.nodesData.flowName 
      }
      const checkDuplicate = await flowsRepo.findOne(conditions);
          
      if (checkDuplicate && Object.keys(checkDuplicate).length !== 0) {
          ErrorResponse.message = `Flow Name Already Exists`;
            return res
              .status(StatusCodes.BAD_REQUEST)
              .json(ErrorResponse);
      }
      const FlowDataResponse = await flowsRepo.create(bodyReq.nodesData, req?.user?.id, flowId);

      if (bodyReq.edges.length > 0) {
        await flowEdgesRepo.create({
          flow_id: flowId,
          edge_json: bodyReq.edges
        })

        if (FlowDataResponse.length > 0) {
          await flowsControlRepo.create(bodyReq.nodesData, flowId);
        }
      }

      let scheduleData;
      if (Object.keys(bodyReq.nodesData.scheduleData).length > 0) {
        scheduleData = await memberScheduleRepo.create(
          {
            ... bodyReq.nodesData.scheduleData,
            module_id : flowId
          })

        flowsRepo.updateByFlowId(flowId, {schedule_id : scheduleData._id}) 
      }
      // data insert into flow-astrisk
      await flowJsonRepository.create({
        call_center_id: bodyReq.nodesData.callCenterId,
        flow_name: bodyReq.nodesData.flowName,
        flow_id: flowId,
        nodes_data : bodyReq.nodesData,
        edges_data: bodyReq.edges,
        type: userDetail.flow_type,
        created_by: req.user.id,
        schedule_id: scheduleData ? scheduleData?._id : null,
        file_data: bodyReq.nodesData.fileData,
        re_prompt: bodyReq.nodesData.rePrompt,
        is_gather_node: bodyReq.nodesData.isGatherNode
      })
    } else {
      const conditions = {
        created_by: req.user.id, 
        flow_name: bodyReq.nodesData.flowName 
      }

      const checkDuplicate = await flowJsonRepository.findOne(conditions);
          
      if (checkDuplicate && Object.keys(checkDuplicate).length !== 0) {
          ErrorResponse.message = `Flow Name Already Exists`;
            return res
              .status(StatusCodes.BAD_REQUEST)
              .json(ErrorResponse);
      }

      let scheduleData;
      if (Object.keys(bodyReq.nodesData?.scheduleData).length > 0) {
        scheduleData = await memberScheduleRepo.create(
          {
            ... bodyReq.nodesData.scheduleData,
            module_id : flowId
          })
      }

      // data insert into flow-astrisk
      await flowJsonRepository.create({
        call_center_id: bodyReq.nodesData.callCenterId,
        flow_name: bodyReq.nodesData.flowName,
        flow_id: flowId,
        nodes_data : bodyReq.nodesData,
        edges_data: bodyReq.edges,
        type: userDetail.flow_type,
        created_by: req.user.id,
        schedule_id: scheduleData ? scheduleData?._id : null,
        file_data: bodyReq.nodesData.fileData,
        re_prompt: bodyReq.nodesData.rePrompt,
        is_gather_node: bodyReq.nodesData.isGatherNode
      })
      Logger.info(`${bodyReq.nodesData.flowName}: Publishing message to queue`);
      publishIVRUpdate(bodyReq.nodesData.flowName);

    }

      const lastResponse = "Successfully created a new IVR"
  
      SuccessRespnose.data = lastResponse;
      SuccessRespnose.message = "Successfully created a new IVR";
      Logger.info(`${bodyReq.nodesData.flowName} IVR -> created successfully: ${JSON.stringify(lastResponse)}`);

      const userJourneyfields = {
        module_name: MODULE_LABEL.IVR,
        action: ACTION_LABEL.ADD,
        created_by: req?.user?.id
      }
      await userJourneyRepo.create(userJourneyfields);

      return res.status(StatusCodes.CREATED).json(SuccessRespnose);


  } 
    catch (error) {
    console.log(error)
    const errorMsg = "Unable to create IVR";
    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse); 
  }
}
async function publishIVRUpdate(flowName) {
	Logger.info(`${flowName} Inside Publish IVR`);
	try {
        const connection = await amqp.connect("amqp://dialplan:ns@4044888@localhost:5672");
        const channel = await connection.createChannel();

        const exchange = "dialplan_exchange";
        const routingKey = "dialplan.update";

        // Declare the exchange before publishing
        await channel.assertExchange(exchange, "fanout", { durable: true });

        const message = "dialplan reload";
        channel.publish(exchange, routingKey, Buffer.from(message));

        Logger.info(`Sent message to exchange: ${exchange}`);
        await channel.close();
        await connection.close();
    } catch (error) {
        Logger.error("Error publishing message:", error);
    }
}
async function getIVRSettings(req, res) {
  try {
    const ivrSettings = await IvrSettings.findOne({}); 
    if (!ivrSettings) {
      throw new AppError('No IVR settings found', StatusCodes.NOT_FOUND);
    }

    SuccessRespnose.data = ivrSettings;
    SuccessRespnose.message = "Successfully fetched IVR settings";

    Logger.info(`IVR -> created successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log(error)
    ErrorResponse.message = "Unable to fetch IVR settings";
    ErrorResponse.error = error;

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getAllIVR(req, res) {
  try {
    // const userDetail = await userRepository.get(req.user.id)
    const data = await flowJsonRepository.getAll({created_by: req.user.id});
    
    // if (userDetail?.flow_type == 1) {
    //   data = await flowsRepo.getAll(req.user.id);
    // } else {
    //   data = await flowJsonRepository.getAll({createdBy: req.user.id});
    // }

    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(`IVR -> recieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `IVR -> unable to get IVR list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function updateIVR(req, res) {
    const id = req.params.id;
    const bodyReq = req.body;

    try {
      const userDetail = await userRepository.get(req.user.id)
      if (userDetail?.flow_type == 1) {
        const currentData = await flowsRepo.getIVRByFlowId(id);

        // Check for duplicate flow Name
        if (currentData[0]?.flow_name !== bodyReq.nodesData.flowName) {
          const nameCondition = {
            created_by: req.user.id,
            flow_name: bodyReq.nodesData.flowName
          };
        
          const nameDuplicate = await flowsRepo.findOne(nameCondition);
          if (nameDuplicate) {
              ErrorResponse.message = 'Flow Name already exists';
              return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }
        }
  
        const responseData = {};
        // delete existing data
        await flowsRepo.deleteIVRByFlowId(id);
        await flowsControlRepo.deleteIVRByFlowId(id);
        await flowEdgesRepo.deleteIVRByFlowId(id);
        await memberScheduleRepo.deleteByModuleId(id);
        await flowJsonRepository.deleteIVRByFlowId(id)

        const flowId = uuidv4();

        //insert All data
        const FlowDataResponse = await flowsRepo.create(bodyReq.nodesData, req.user.id, flowId);

        let FlowControlDataResponse;
        let FlowEdgesResponse;
        if (bodyReq.edges.length > 0) {
          FlowEdgesResponse = await flowEdgesRepo.create({
            flow_id: flowId,
            edge_json: bodyReq.edges
          })

          if (FlowDataResponse.length > 0) {
            FlowControlDataResponse = await flowsControlRepo.create(bodyReq.nodesData, flowId);
          }
        }

        let scheduleData;
        if (Object.keys(bodyReq.nodesData.scheduleData).length > 0) {
          scheduleData = await memberScheduleRepo.create(
            {
              ... bodyReq.nodesData.scheduleData,
              module_id : flowId
            })

          flowsRepo.updateByFlowId(flowId, {schedule_id : scheduleData._id}) 
        }

        // data insert into flow-astrisk
        await flowJsonRepository.create({
          call_center_id: bodyReq.nodesData.callCenterId,
          flow_name: bodyReq.nodesData.flowName,
          flow_id: flowId,
          nodes_data : bodyReq.nodesData,
          edges_data: bodyReq.edges,
          type: userDetail.flow_type,
          created_by: req.user.id,
          schedule_id: scheduleData ? scheduleData?._id : null,
          file_data: bodyReq.nodesData.fileData,
          re_prompt: bodyReq.nodesData.rePrompt,
          is_gather_node: bodyReq.nodesData.isGatherNode
        })
      } else {
        const currentData = await flowJsonRepository.getIVRByFlowId(id);
        // Check for duplicate flow Name
        if (currentData?.flow_name !== bodyReq.nodesData.flowName) {
          const nameCondition = {
            created_by: req.user.id,
            flow_name: bodyReq.nodesData.flowName
          };
        
          const nameDuplicate = await flowJsonRepository.findOne(nameCondition);
          if (nameDuplicate) {
              ErrorResponse.message = 'Flow Name already exists';
              return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
          }
        }

        await memberScheduleRepo.deleteByModuleId(id);

        let scheduleData;
        if (Object.keys(bodyReq.nodesData.scheduleData).length > 0) {
          scheduleData = await memberScheduleRepo.create(
            {
              ... bodyReq.nodesData.scheduleData,
              module_id : id
            })
        }

        flowJsonRepository.updateByFlowId(id,
          {
            type: userDetail?.flow_type,
            flow_name: bodyReq.nodesData.flowName,
            nodes_data : bodyReq.nodesData,
            edges_data: bodyReq.edges,
            schedule_id: scheduleData ? scheduleData?._id : null,
            file_data: bodyReq.nodesData.fileData,
            re_prompt: bodyReq.nodesData.rePrompt,
            is_gather_node: bodyReq.nodesData.isGatherNode
          }) 
      }
        const userJourneyfields = {
          module_name: MODULE_LABEL.IVR,
          action: ACTION_LABEL.EDIT,
          created_by: req?.user?.id
        }
    
        await userJourneyRepo.create(userJourneyfields);
    
        SuccessRespnose.message = 'Updated successfully!';
        // SuccessRespnose.data = responseData;
    
        Logger.info(`ivr -> ${id} updated successfully`);
    
        return res.status(StatusCodes.OK).json(SuccessRespnose);
  
    } catch (error) {
      console.log(error)
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;

      if (error.name == 'CastError') {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = 'ivr not found';
      }
      else if (error.name == 'MongoServerError') {
        StatusCodes = StatusCodes.BAD_REQUEST;
        if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }

      ErrorResponse.message = errorMsg;
  
      Logger.error(`ivr-> unable to update ivr: ${id}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`);
  
      return res.status(statusCode).json(ErrorResponse);
  
    }

  }
  
  async function deleteIVR(req, res) {
    const id = req.body.ivrIds;
    try {
      // const userDetail = await userRepository.get(req.user.id)
      await flowsRepo.deleteIVRByFlowId(id);
      await flowsControlRepo.deleteIVRByFlowId(id);
      await flowEdgesRepo.deleteIVRByFlowId(id);
      await memberScheduleRepo.deleteByModuleId(id);
      await flowJsonRepository.deleteIVRByFlowId(id)

      // if (userDetail?.flow_type == 1) {
      //   // delete existing data
      //   await flowsRepo.deleteIVRByFlowId(id);
      //   await flowsControlRepo.deleteIVRByFlowId(id);
      //   await flowEdgesRepo.deleteIVRByFlowId(id);
      //   await memberScheduleRepo.deleteByModuleId(id);
      // } else {
      //   await flowJsonRepository.deleteIVRByFlowId(id)
      // }

        const userJourneyfields = {
          module_name: MODULE_LABEL.IVR,
          action: ACTION_LABEL.DELETE,
          created_by: req?.user?.id
        }  
    
        await userJourneyRepo.create(userJourneyfields);
        SuccessRespnose.message = "Deleted successfully!";
        // SuccessRespnose.data = FlowDataResponse;
    
        Logger.info(`ivr -> ${id} deleted successfully`);
    
        return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      console.log(error)
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      ErrorResponse.error = error;
      if (error.name == "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = "ivr not found";
      }
      ErrorResponse.message = errorMsg;
  
      Logger.error(
        `ivr -> unable to delete user: ${id}, error: ${JSON.stringify(error)}`
      );
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }

  async function getIVRByFlowId(req, res) {
    try {
      const IvrId = req.params.id;
      // const userDetail = await userRepository.get(req.user.id)
      const data = await flowJsonRepository.getIVRByFlowId(IvrId);
      const nodesData = transformData(data)
      const edgeData = {
          edgeJson : data.edges_data
        };
      const scheduleData = await memberScheduleRepo.getAll(IvrId);
      const fileData = data.file_data;
      const rePrompt = data.re_prompt;
      const isGatherNode = data.is_gather_node


      // if (userDetail?.flow_type == 1) {
      //   nodesData = await flowsRepo.getIVRByFlowId(IvrId);
      //   edgeData = await flowEdgesRepo.getAll(IvrId);
      //   scheduleData = await memberScheduleRepo.getAll(IvrId);
      // } else {
      //   const data = await flowJsonRepository.getIVRByFlowId(IvrId);
      //   nodesData = transformData(data)
      //   edgeData = {
      //     edgeJson : data.edgesData
      //   };
      //   scheduleData = await memberScheduleRepo.getAll(IvrId);
      // }
      SuccessRespnose.data = {nodesData,edgeData,scheduleData, fileData, rePrompt,isGatherNode };
      SuccessRespnose.message = "Success";

      Logger.info(`IVR -> recieved ivr of flow ${IvrId} successfully`);

      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
  
      Logger.error(
        `IVR -> unable to get IVR list, error: ${JSON.stringify(error)}`
      );
  
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }

  function transformData(input) {
    return Object.values(input.nodes_data.nodes).map((node, index) => ({
        _id: input._id, 
        call_center_id: input.call_center_id,
        flow_name: input.flow_name,
        flow_id: input.flow_id,
        node_id: parseInt(node.id),
        schedule_id: input.scheduleId || null,
        flow_json: node.flowJson,
        status: input.status,
        flow_render: node.flowRender,
        created_by: input.created_by,
        created_at: input.created_at,
        updated_at: input.updated_at,
    }));
}

  


module.exports = {
  createIVR,
  updateIVR,
  deleteIVR,
  getAllIVR,
  getIVRSettings,
  getIVRByFlowId
};
