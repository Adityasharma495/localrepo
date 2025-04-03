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

const VoiceCategory = mongoose.model('voice_categories',VoiceCategorySchema, 'voice_categories')
const CallStrategy = mongoose.model('call_stratergy',callStratergySchema, 'call_stratergy')

module.exports = {
    CallStrategy,
    VoiceCategory
}




