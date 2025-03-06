const express = require("express");
const router = express.Router();
const User = require('../../c_db/User');
const { AuthMiddleware, UserMiddleware} = require("../../middlewares");
const { UserController } = require("../../c_controllers");


// router.post('/signup',async (req, res) => {
  
//   console.log("CAME TO SIGNUP USER");
//     try {
//       const { username, name, email, password, role,status, companies } = req.body;
//       console.log(username, name, email, password, role);
//       const newUser = await User.create({ username, name, email, password, role, status,companies });
//       if(newUser){
//         console.log("USer created successfully", newUser);
//       }
//       res.status(201).json(newUser);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

  // SWITCH USER
  router.post('/switch-user', UserMiddleware.authenticateSuperAdmin, UserController.switchUser)

  // USER SIGN UP
  router.post('/signup',AuthMiddleware.validateUser, UserMiddleware.validateSignup);

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


  //User Update: /api/v1/users/:id PATCH
  router.patch("/:id", AuthMiddleware.validateUser, UserMiddleware.validateUserStatusRequest, UserController.statusPasswordUpdateUser);

module.exports = router;