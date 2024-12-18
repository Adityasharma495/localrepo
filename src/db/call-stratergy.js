const mongoose = require('mongoose');

const callStratergySchema = new mongoose.Schema({
    strategies:{
        type: [],
        require:true,
    },
})


const VoiceCategorySchema = new mongoose.Schema({
    categories:{
        type: [],
        require:true,
    },
})

const VoiceCategory = mongoose.model('voice_categories',VoiceCategorySchema)
const CallStrategy = mongoose.model('call_stratergy',callStratergySchema)

module.exports = {
    CallStrategy,
    VoiceCategory
}




