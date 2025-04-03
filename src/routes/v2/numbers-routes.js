const express = require('express');
const { AuthMiddleware, NumbersMiddleWare } = require('../../middlewares');
const { NumbersController } = require("../../c_controllers");
const router = express.Router();

//Numbers delete: /api/v2/numbers/delete POST
router.post("/delete", AuthMiddleware.validateUser, NumbersMiddleWare.validateDeleteRequest, NumbersController.deleteNumber); //done

//set the inbounding-routing /api/v2/numbers/inbound-routing POST
router.post('/inbound-routing', AuthMiddleware.validateUser, NumbersController.setInboundRouting);  //done

//Numbers create: /api/v2/numbers POST
router.post('/', AuthMiddleware.validateUser, NumbersMiddleWare.validateCreate, NumbersMiddleWare.modifyNumberCreateBodyRequest, //done
    NumbersController.create);

//Upload Numbers: /api/v2/upload-numbers POST
router.post('/upload-numbers',AuthMiddleware.validateUser,NumbersMiddleWare.upload,NumbersMiddleWare.validateUploadNumbers,  //done
    NumbersMiddleWare.saveFile,NumbersController.uploadNumbers);

//get DID Numbers(numberType = DID): /api/v2/numbers/did GET
router.get('/did', AuthMiddleware.validateUser, NumbersController.getDIDNumbers);  //done

//Remove Allocated Numbers /api/v2/numbers/remove GET
router.post('/remove', AuthMiddleware.validateUser, NumbersController.removeAllocatedNumbers); // done

//Numbers did-mapping : /api/v2/numbers/did-mapping POST
router.post('/did-mapping', AuthMiddleware.validateUser, NumbersMiddleWare.validateMapping, NumbersController.DIDUserMapping);

//get Number status: /api/v2/numbers/number-status GET
router.get('/number-status', AuthMiddleware.validateUser, NumbersController.getAllStatus); //done

//Numbers get all: /api/v2/numbers GET
router.get('/', AuthMiddleware.validateUser, NumbersController.getAll); //done

//Numbers get info: /api/v2/numbers/:id GET
router.get('/:id', AuthMiddleware.validateUser, NumbersController.get);  //done

//Numbers Update Bulk: /api/v2/numbers/bulk-update POST
router.post('/update-bulk', AuthMiddleware.validateUser, NumbersMiddleWare.upload, NumbersMiddleWare.validateBulkUpdate, NumbersController.bulkUpdate);

//Numbers status change : /api/v2/numbers/bulk-update POST
router.post('/status-change', AuthMiddleware.validateUser, NumbersMiddleWare.validateUpdateStatus, NumbersController.updateStatus);  //done

//Numbers Update Individual : /api/v2/numbers/:id POST
router.post('/:id', AuthMiddleware.validateUser, NumbersMiddleWare.validateUpdate, NumbersMiddleWare.modifyNumberUpdateBodyRequest, NumbersController.update); //done

//Numbers assignBulkDID : /api/v2/numbers/:id GET
router.post('/bulk/assign-did', AuthMiddleware.validateUser, NumbersMiddleWare.upload ,NumbersMiddleWare.validateBulkAssignDID,
    NumbersMiddleWare.saveFile, NumbersController.assignBulkDID);

//Numbers individual-assign-did : /api/v2/numbers/:id GET
router.post('/individual/assign-did', AuthMiddleware.validateUser ,NumbersMiddleWare.validateIndividualAssignDID,NumbersController.assignIndividualDID); //done

//get to allocated Numbers: /api/v2/numbers/to-allocate GET
router.get('/to-allocate/:id', AuthMiddleware.validateUser, NumbersController.getToAllocateNumbers);  //done

//get Allocated Numbers by id: /api/v2/numbers/allocated/:id GET
router.get('/allocated/:id', AuthMiddleware.validateUser, NumbersController.getAllocatedNumbers);  //done

module.exports = router;