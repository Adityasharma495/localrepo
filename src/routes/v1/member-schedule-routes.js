const express = require('express');
const { AuthMiddleware, MemberScheduleMiddleware } = require('../../middlewares');
const { MemberScheduleController } = require('../../controllers');
const Router = express.Router();


Router.post('/:id',AuthMiddleware.validateUser, MemberScheduleMiddleware.validateSchedule,MemberScheduleController.UpdateScheduleTime)


module.exports = Router;