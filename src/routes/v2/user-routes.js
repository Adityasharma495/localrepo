const express = require("express");
const router = express.Router();
const User = require('../../c_db/User');
const { AuthMiddleware, UserMiddleware } = require("../../middlewares");
const { UserController } = require("../../c_controllers");


router.post('/signup',async (req, res) => {
  
  console.log("CAME TO SIGNUP USER");
    try {
      const { username, name, email, password, role,status } = req.body;
      console.log(username, name, email, password, role);
      const newUser = await User.create({ username, name, email, password, role, status });
      if(newUser){
        console.log("USer created successfully", newUser);
      }
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  });


  router.post('/signin', UserMiddleware.validateSignin, UserController.signinUser);
  router.get('/',UserController.getAll);

module.exports = router;