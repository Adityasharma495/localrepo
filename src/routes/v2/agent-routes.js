const express  = require("express")
const router = express.Router()
const { AuthMiddleware, AgentMiddleware } = require("../../middlewares")
const {AgentController} = require("../../c_controllers")


router.post('/',AuthMiddleware.validateUser,AgentMiddleware.validateAgentCreate,AgentMiddleware.modifyAgentCreateBodyRequest,AgentController.createAgent);


router.get("/", AuthMiddleware.validateUser, AgentController.getAll);

router.get("/:id", AuthMiddleware.validateUser, AgentController.getById);


router.post("/delete", AuthMiddleware.validateUser, AgentMiddleware.validateDeleteRequest,AgentController.deleteAgent);

router.post('/:id',AuthMiddleware.validateUser, AgentMiddleware.modifyAgentUpdateBodyRequest,AgentController.updateAgent);


router.post("/status/:id", AuthMiddleware.validateUser, AgentController.toggleStatus);

router.post("/allocate",AuthMiddleware.validateUser,AgentController.updateAllocation)

module.exports = router;