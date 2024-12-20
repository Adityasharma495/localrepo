const mongoose = require("mongoose")
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
})
const MemberSchedule = mongoose.model('member_schedules', MemberScheduleSchema)
module.exports = MemberSchedule