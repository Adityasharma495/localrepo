const express = require("express");
const router = express.Router();
const { AgentGroupController, MemberScheduleController } = require("../../c_controllers");
const { AuthMiddleware, AgentGroupMiddleware } = require("../../middlewares");


// CREATE AGENT GROUP
router.post('/',AuthMiddleware.validateUser,AgentGroupMiddleware.validateAgentGroupCreate,AgentGroupMiddleware.modifyAgentGroupCreateBodyRequest,AgentGroupController.createAgentGroup);

// GET ALL AGENTS
router.get("/", AuthMiddleware.validateUser, AgentGroupController.getAll);

// GET BY ID
router.get("/:id", AuthMiddleware.validateUser, AgentGroupController.getById);


// ASSIGNED AGENTS
router.get("/:id/assigned-agents",AuthMiddleware.validateUser, AgentGroupController.getAssignedAgents)

// Scehdule 
router.post("/schedule/:id", AuthMiddleware.validateUser,AgentGroupMiddleware.validateSchedule,AgentGroupController.updateMemberScheduleAgent);

// DELETE GROUPS
router.post("/delete", AuthMiddleware.validateUser, AgentGroupMiddleware.validateDeleteRequest, AgentGroupController.deleteAgentGroup);

// UPDATE GROUPS
router.post('/:id',AuthMiddleware.validateUser,AgentGroupMiddleware.modifyAgentGroupUpdateBodyRequest,AgentGroupController.updateAgentGroup)

module.exports = router;