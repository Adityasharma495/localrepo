const mongoose = require("mongoose");
const PromptSchema = new mongoose.Schema({
    prompt_name:{
        type:String,
        require:true,
    },
    prompt_url:{
        type:String,
        require:true,
    },
    prompt_duration:{
        type:Number,
        default:0,
        require:true,
    },
    upload_date:{
        type: Date,
        default: Date.now,
    },
    prompt_category:{
        type:String,
        require:true,
    },
    prompt_status:{
        type:Number,
        default:0
    },
    approval_time:{
        type:Date,
        default:null,
    }
})
const PromptModel = mongoose.model("prompts", PromptSchema)
module.exports = PromptModel