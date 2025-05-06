const express = require("express");
const router = express.Router();
const User = require('../../c_db/User');
const { AuthMiddleware, UserMiddleware} = require("../../middlewares");
const { UserController } = require("../../c_controllers");

  // SWITCH USER
  router.post('/switch-user', UserMiddleware.authenticateSuperAdmin, UserController.switchUser)

  // USER SIGN UP
  router.post('/signup',AuthMiddleware.validateUser, UserMiddleware.validateSignup,(req, res, next) => UserMiddleware.modifyUserSignupBodyRequest(req, res, next, true), UserController.signupUser);

  // SIGN IN USER ROUTE
  router.post('/signin', UserMiddleware.validateSignin, UserController.signinUser);

  // LOGOUT USER ROUTE
  router.post("/logout", AuthMiddleware.validateUser, UserController.logoutUser);
  // GET USER
  router.get('/:id', AuthMiddleware.validateUser, UserController.get);

  // GET ALL USERS
  router.get('/',AuthMiddleware.validateUser,UserController.getAll);

  // DELETE USER
  router.post("/delete", AuthMiddleware.validateUser, UserMiddleware.validateDeleteRequest, UserController.deleteUser);

  // USER UPDATE
  router.post('/:id', AuthMiddleware.validateUser, UserMiddleware.validateUpdateUser, (req, res, next) => UserMiddleware.modifyUserSignupBodyRequest(req, res, next, false), UserController.updateUser);

  //User Update: /api/v1/users/:id PATCH
  router.patch("/:id", AuthMiddleware.validateUser, UserMiddleware.validateUserStatusRequest, UserController.statusPasswordUpdateUser);

module.exports = router;