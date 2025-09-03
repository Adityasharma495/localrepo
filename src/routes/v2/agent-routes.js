const express  = require("express")
const router = express.Router()
const { AuthMiddleware, AgentMiddleware } = require("../../middlewares")
const {AgentController} = require("../../c_controllers")


router.post('/bulk-logout', AuthMiddleware.validateUser ,AgentController.bulkLogout);

router.get('/real-time',AuthMiddleware.validateUser, AgentController.getAgentRealTimeData);

router.post('/',AuthMiddleware.validateUser,AgentMiddleware.validateAgentCreate,AgentMiddleware.modifyAgentCreateBodyRequest,AgentController.createAgent);

router.get("/", AuthMiddleware.validateUser, AgentController.getAll);

router.get("/:id", AuthMiddleware.validateUser, AgentController.getById);

router.get("/parent/:id/:user", AuthMiddleware.validateUser, AgentController.getByParentId);

router.post("/delete", AuthMiddleware.validateUser, AgentMiddleware.validateDeleteRequest,AgentController.deleteAgent);

router.post('/:id',AuthMiddleware.validateUser, AgentMiddleware.modifyAgentUpdateBodyRequest,AgentController.updateAgent);

router.post("/status/:id", AuthMiddleware.validateUser, AgentController.toggleStatus);

router.post("/allocate",AuthMiddleware.validateUser,AgentController.updateAllocation)

router.post("/break/:id",AuthMiddleware.validateUser,AgentController.updateBreakAllocation)



module.exports = router;