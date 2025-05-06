const express = require('express');
const { AuthMiddleware, NumbersMiddleWare } = require('../../middlewares');
const { NumbersController } = require("../../c_controllers");
const router = express.Router();

//Numbers delete: /api/v2/numbers/delete POST
router.post("/delete", AuthMiddleware.validateUser, NumbersMiddleWare.validateDeleteRequest, NumbersController.deleteNumber); 

//set the inbounding-routing /api/v2/numbers/inbound-routing POST
router.post('/inbound-routing', AuthMiddleware.validateUser, NumbersController.setInboundRouting);  

//Numbers create: /api/v2/numbers POST
router.post('/', AuthMiddleware.validateUser, NumbersMiddleWare.validateCreate, NumbersMiddleWare.modifyNumberCreateBodyRequest, 
    NumbersController.create);

//Upload Numbers: /api/v2/upload-numbers POST
router.post('/upload-numbers',AuthMiddleware.validateUser,NumbersMiddleWare.upload,NumbersMiddleWare.validateUploadNumbers,  
    NumbersMiddleWare.saveFile,NumbersController.uploadNumbers);

//get DID Numbers(numberType = DID): /api/v2/numbers/did GET
router.get('/did', AuthMiddleware.validateUser, NumbersController.getDIDNumbers);  

//Remove Allocated Numbers /api/v2/numbers/remove GET
router.post('/remove', AuthMiddleware.validateUser, NumbersController.removeAllocatedNumbers); 

//Numbers did-mapping : /api/v2/numbers/did-mapping POST
router.post('/did-mapping', AuthMiddleware.validateUser, NumbersMiddleWare.validateMapping, NumbersController.DIDUserMapping);

//get Number status: /api/v2/numbers/number-status GET
router.get('/number-status', AuthMiddleware.validateUser, NumbersController.getAllStatus); 

//Numbers get all: /api/v2/numbers GET
router.get('/', AuthMiddleware.validateUser, NumbersController.getAll); 

//Numbers get info: /api/v2/numbers/:id GET
router.get('/:id', AuthMiddleware.validateUser, NumbersController.get);  

//Numbers Update Bulk: /api/v2/numbers/bulk-update POST
router.post('/update-bulk', AuthMiddleware.validateUser, NumbersMiddleWare.upload, NumbersMiddleWare.validateBulkUpdate, NumbersController.bulkUpdate);

//Numbers status change : /api/v2/numbers/bulk-update POST
router.post('/status-change', AuthMiddleware.validateUser, NumbersMiddleWare.validateUpdateStatus, NumbersController.updateStatus);  

//Numbers Update Individual : /api/v2/numbers/:id POST
router.post('/:id', AuthMiddleware.validateUser, NumbersMiddleWare.validateUpdate, NumbersMiddleWare.modifyNumberUpdateBodyRequest, NumbersController.update); 

//Numbers assignBulkDID : /api/v2/numbers/:id GET
router.post('/bulk/assign-did', AuthMiddleware.validateUser, NumbersMiddleWare.upload ,NumbersMiddleWare.validateBulkAssignDID,
    NumbersMiddleWare.saveFile, NumbersController.assignBulkDID);

//Numbers individual-assign-did : /api/v2/numbers/:id GET
router.post('/individual/assign-did', AuthMiddleware.validateUser ,NumbersMiddleWare.validateIndividualAssignDID,NumbersController.assignIndividualDID); 

//get to allocated Numbers: /api/v2/numbers/to-allocate GET
router.get('/to-allocate/:id', AuthMiddleware.validateUser, NumbersController.getToAllocateNumbers);  

//get Allocated Numbers by id: /api/v2/numbers/allocated/:id GET
router.get('/allocated/:id', AuthMiddleware.validateUser, NumbersController.getAllocatedNumbers);  

//get Number to remove by id: /api/v1/numbers/remove/:id GET
router.get('/remove/:id', AuthMiddleware.validateUser, NumbersController.getNumbersToRemove);

module.exports = router;