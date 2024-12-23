const mongoose = require("mongoose")
const { constants } = require('../utils/common');
const MEMEBER_SCHEDULES_NAME = constants.MODEL.MEMEBER_SCHEDULES;


const MemberScheduleSchema = new mongoose.Schema({
    start_time:{
        type:String,
        required:false,
    },
    end_time:{
        type:String,
        required:false
    },
    week_days:[
        {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: false,
    }],
    module_id: {
        type: String,
        default: null
    }
})
const MemberSchedule = mongoose.model(MEMEBER_SCHEDULES_NAME, MemberScheduleSchema)
module.exports = MemberSchedule