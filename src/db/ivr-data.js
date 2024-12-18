const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')

const IVRDataSchema = new mongoose.Schema({
    data: mongoose.Schema.Types.Mixed
},{
    versionKey: false,
    timestamps: false,
    collection: MODEL.IVR_DATA
});

const ivrDataSchema = mongoose.model(MODEL.IVR_DATA, IVRDataSchema);

module.exports = ivrDataSchema;
