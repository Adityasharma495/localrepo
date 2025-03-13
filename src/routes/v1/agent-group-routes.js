const express = require("express");
const { AgentGroupController, MemberScheduleController } = require("../../controllers");
const { AuthMiddleware, AgentGroupMiddleware } = require("../../middlewares");

const router = express.Router();

//agent-group delete: /api/v1/agent-group/delete POST
router.post("/delete", AuthMiddleware.validateUser, AgentGroupMiddleware.validateDeleteRequest, AgentGroupController.deleteAgentGroup);

//agent-group create: /api/v1/agent-group POST
router.post('/',AuthMiddleware.validateUser,AgentGroupMiddleware.validateAgentGroupCreate,AgentGroupMiddleware.modifyAgentGroupCreateBodyRequest,AgentGroupController.createAgentGroup);

// agent-group update: /api/v1/agent-group POST
// router.post('/:id',AuthMiddleware.validateUser,AgentGroupMiddleware.validateAgentGroupCreate,AgentGroupMiddleware.modifyAgentGroupUpdateBodyRequest,AgentGroupController.updateAgentGroup);
router.post('/:id',AuthMiddleware.validateUser,AgentGroupMiddleware.modifyAgentGroupUpdateBodyRequest,AgentGroupController.updateAgentGroup)
//agent-group getAll: /api/v1/agent-group GET
router.get("/", AuthMiddleware.validateUser, AgentGroupController.getAll);

//agent-group getByid: /api/v1/agent-group/:id GET 
router.get("/:id", AuthMiddleware.validateUser, AgentGroupController.getById);

router.get("/:id/assigned-agents",AuthMiddleware.validateUser, AgentGroupController.getAssignedAgents)

router.post("/schedule/:id", AuthMiddleware.validateUser,AgentGroupMiddleware.validateSchedule,AgentGroupController.updateMemberScheduleAgent);

router.post("/remove-agent/:id", AuthMiddleware.validateUser,AgentGroupMiddleware.validateAgentRemove,AgentGroupController.removeAgent);


module.exports = router;
