const express = require('express');
const { UserController } = require('../../controllers');
const { UserMiddleware, AuthMiddleware } = require('../../middlewares');

const router = express.Router();


//User Switch
router.post('/switch-user', UserMiddleware.authenticateSuperAdmin, UserController.switchUser)

// Delete user api/v1/users/delete
router.post("/logout", AuthMiddleware.validateUser, UserController.logoutUser);

//User signup: /api/v1/users/signup POST
//modifyUserSignupBodyRequest(true): create 
router.post('/signup', AuthMiddleware.validateUser, UserMiddleware.validateSignup, (req, res, next) => UserMiddleware.modifyUserSignupBodyRequest(req, res, next, true), UserController.signupUser);

//User Login: /api/v1/users/signin POST
router.post('/signin', UserMiddleware.validateSignin, UserController.signinUser);

//Users list: /api/v1/users GET
router.get('/', AuthMiddleware.validateUser, UserController.getAll);

//User edit: /api/v1/users/:id GET
router.get('/:id', AuthMiddleware.validateUser, UserController.get);

// Delete user api/v1/users/delete
router.post("/delete", AuthMiddleware.validateUser, UserMiddleware.validateDeleteRequest, UserController.deleteUser);

//User update: /api/v1/users/:id POST
//modifyUserSignupBodyRequest(false): update 
router.post('/:id', AuthMiddleware.validateUser, UserMiddleware.validateUpdateUser, (req, res, next) => UserMiddleware.modifyUserSignupBodyRequest(req, res, next, false), UserController.updateUser);

//User Update: /api/v1/users/:id PATCH
router.patch("/:id", AuthMiddleware.validateUser, UserMiddleware.validateUserStatusRequest, UserController.statusPasswordUpdateUser);



module.exports = router;