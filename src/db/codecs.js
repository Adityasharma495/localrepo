const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const CODEC_MODEL = constants.MODEL.CODEC;

const codecSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
},{
    versionKey: false,
    timestamps: false
});

const CodecSchema = mongoose.model(CODEC_MODEL, codecSchema);

module.exports = CodecSchema;