const { StatusCodes } = require("http-status-codes");
const { UserJourneyRepository,FLowRepository,FlowControlRepository, FlowEdgesRepository, MemberScheduleRepository } = require("../repositories");
const {SuccessRespnose , ErrorResponse , Authentication } = require("../utils/common");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const {IvrSettings} = require('../db')


const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");

const userJourneyRepo = new UserJourneyRepository();
const flowsRepo = new FLowRepository();
const flowsControlRepo = new FlowControlRepository();
const flowEdgesRepo = new FlowEdgesRepository();
const memberScheduleRepo = new MemberScheduleRepository();

async function createIVR(req, res) {
  const bodyReq = req.body;

  try {
    // check for duplicate Flow name
    const conditions = {
      createdBy: req.user.id, 
      flowName: bodyReq.nodesData.flowName 
    }
    const checkDuplicate = await flowsRepo.findOne(conditions);
        
    if (checkDuplicate && Object.keys(checkDuplicate).length !== 0) {
        ErrorResponse.message = `Flow Name Already Exists`;
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    const FlowDataResponse = await flowsRepo.create(bodyReq.nodesData, req?.user?.id);

    let FlowControlDataResponse;
    let FlowEdgesResponse;
    if (bodyReq.edges.length > 0) {
      FlowEdgesResponse = await flowEdgesRepo.create({
        flowId: FlowDataResponse.length > 0 && FlowDataResponse[0].flowId,
        edgeJson: bodyReq.edges
      })

      if (FlowDataResponse.length > 0) {
        FlowControlDataResponse = await flowsControlRepo.create(bodyReq.nodesData, FlowDataResponse[0].flowId);
      }
    }

    let scheduleData;
    if (Object.keys(bodyReq.nodesData.scheduleData).length > 0) {
      scheduleData = await memberScheduleRepo.create(
        {
          ... bodyReq.nodesData.scheduleData,
          module_id : FlowDataResponse.length > 0 && FlowDataResponse[0].flowId
        })

      flowsRepo.updateByFlowId(FlowDataResponse[0].flowId, {scheduleId : scheduleData._id}) 
    }

    
   

    if (FlowDataResponse) {

      const lastResponse = "Successfully created a new IVR"
  
      SuccessRespnose.data = lastResponse;
      SuccessRespnose.message = "Successfully created a new IVR";
      Logger.info(`IVR -> created successfully: ${JSON.stringify(lastResponse)}`);

      const userJourneyfields = {
        module_name: MODULE_LABEL.IVR,
        action: ACTION_LABEL.ADD,
        createdBy: req?.user?.id
      }
      await userJourneyRepo.create(userJourneyfields);

      return res.status(StatusCodes.CREATED).json(SuccessRespnose);
    } 


  } 
    catch (error) {
      console.log(error)
    const errorMsg = "Unable to create IVR";
    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse); 
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
    console.log('req.user.id', req.user.id)
    const data = await flowsRepo.getAll(req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

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
      const currentData = await flowsRepo.getIVRByFlowId(id);
      
      // Check for duplicate flow Name
      if (currentData.flowName !== bodyReq.nodesData.flowName) {
        const nameCondition = {
          createdBy: req.user.id,
          flowName: bodyReq.nodesData.flowName
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


      //insert All data
      const FlowDataResponse = await flowsRepo.create(bodyReq.nodesData);

      let FlowControlDataResponse;
      let FlowEdgesResponse;
      if (bodyReq.edges.length > 0) {
        FlowEdgesResponse = await flowEdgesRepo.create({
          flowId: FlowDataResponse.length > 0 && FlowDataResponse[0].flowId,
          edgeJson: bodyReq.edges
        })

        if (FlowDataResponse.length > 0) {
          FlowControlDataResponse = await flowsControlRepo.create(bodyReq.nodesData, FlowDataResponse[0].flowId);
        }
      }

      let scheduleData;
      if (Object.keys(bodyReq.nodesData.scheduleData).length > 0) {
       scheduleData = await memberScheduleRepo.create(
        {
          ... bodyReq.nodesData.scheduleData,
          module_id : FlowDataResponse.length > 0 && FlowDataResponse[0].flowId
        })

      flowsRepo.updateByFlowId(FlowDataResponse[0].flowId, {scheduleId : scheduleData._id}) 
    }

      if (FlowDataResponse) {

        const userJourneyfields = {
          module_name: MODULE_LABEL.IVR,
          action: ACTION_LABEL.EDIT,
          createdBy: req?.user?.id
        }
    
        await userJourneyRepo.create(userJourneyfields);
    
        SuccessRespnose.message = 'Updated successfully!';
        SuccessRespnose.data = responseData;
    
        Logger.info(`ivr -> ${id} updated successfully`);
    
        return res.status(StatusCodes.OK).json(SuccessRespnose);
      } 
  
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
      // delete existing data
      const FlowDataResponse = await flowsRepo.deleteIVRByFlowId(id);
      const FlowControlDataResponse = await flowsControlRepo.deleteIVRByFlowId(id);
      const FlowEdgesResponse = await flowEdgesRepo.deleteIVRByFlowId(id);
      const IvrScheduleResponse = await memberScheduleRepo.deleteByModuleId(id);


      if (FlowDataResponse && FlowControlDataResponse && FlowEdgesResponse && IvrScheduleResponse) {

        const userJourneyfields = {
          module_name: MODULE_LABEL.IVR,
          action: ACTION_LABEL.DELETE,
          createdBy: req?.user?.id
        }
    
        await userJourneyRepo.create(userJourneyfields);
        SuccessRespnose.message = "Deleted successfully!";
        SuccessRespnose.data = FlowDataResponse;
    
        Logger.info(`ivr -> ${id} deleted successfully`);
    
        return res.status(StatusCodes.OK).json(SuccessRespnose);
      } 
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
      const nodesData = await flowsRepo.getIVRByFlowId(IvrId);
      const edgeData = await flowEdgesRepo.getAll(IvrId);
      const scheduleData = await memberScheduleRepo.getAll(IvrId);

      SuccessRespnose.data = {nodesData,edgeData,scheduleData};
      SuccessRespnose.message = "Success";
  
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
  


module.exports = {
  createIVR,
  updateIVR,
  deleteIVR,
  getAllIVR,
  getIVRSettings,
  getIVRByFlowId
};
