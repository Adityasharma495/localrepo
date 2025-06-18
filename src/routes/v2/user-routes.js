const express = require("express");
const router = express.Router();
const { AuthMiddleware, UserMiddleware} = require("../../middlewares");
const { UserController } = require("../../c_controllers");

  // SWITCH USER
  router.post('/switch-user', UserMiddleware.authenticateSuperAdmin, UserController.switchUser)

  // USER SIGN UP
  router.post('/signup',AuthMiddleware.validateUser, UserMiddleware.validateSignup,(req, res, next) => UserMiddleware.modifyUserSignupBodyRequest(req, res, next, true), UserController.signupUser);

  // SIGN IN USER ROUTE
  router.post('/signin', UserMiddleware.validateSignin, UserController.signinUser);

  // login as Callcenter agent (PSTN, WEBRTC, SIP)
  router.post('/login-as/:id', AuthMiddleware.validateUser, UserMiddleware.validateLoginAs, UserController.loginAs);

  // logout from Callcenter agent (PSTN, WEBRTC, SIP)
  router.post('/logout-from/:id', AuthMiddleware.validateUser, UserMiddleware.validateLoginAs, UserController.logoutAs);

  // LOGOUT USER ROUTE
  router.post("/logout/:id", AuthMiddleware.validateUser, UserController.logoutUser);
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