const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')

const LanguageSchema = new mongoose.Schema({
    language:{
        type: {},
        require:true,
    },
})

const languageData = mongoose.model(MODEL.LANGUAGE, LanguageSchema);

module.exports = languageData;




