const express = require("express");
const { AgentController } = require("../../controllers");
const { AuthMiddleware, AgentMiddleware } = require("../../middlewares");
const router = express.Router();


//get: /api/v1/agent/real-time POST
router.get('/real-time', AgentController.getAgentRealTimeData);

router.post("/allocate",AuthMiddleware.validateUser,AgentController.updateAllocation)
//agent delete: /api/v1/agent/delete POST
router.post("/delete", AuthMiddleware.validateUser, AgentMiddleware.validateDeleteRequest,AgentController.deleteAgent);

//agent create: /api/v1/agent POST
router.post('/',AuthMiddleware.validateUser,AgentMiddleware.validateAgentCreate,AgentMiddleware.modifyAgentCreateBodyRequest,AgentController.createAgent);

// agent update: /api/v1/agent POST
router.post('/:id',AuthMiddleware.validateUser, AgentMiddleware.modifyAgentUpdateBodyRequest,AgentController.updateAgent);

//agent getAll: /api/v1/agent GET
router.get("/", AuthMiddleware.validateUser, AgentController.getAll);

router.post("/status/:id", AuthMiddleware.validateUser, AgentController.toggleStatus);

//agent getByid: /api/v1/agent/:id GET 
router.get("/:id", AuthMiddleware.validateUser, AgentController.getById);

module.exports = router;
