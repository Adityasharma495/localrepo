const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')

const TimezoneSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  timezoneSchema: {
    type: String,
    required: true
  },
  offset: {
    type: Number,
    required: true
  },
  isdst: {
    type: Boolean,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  utc: [{
    type: String
  }]
},{
    versionKey: false,
    timestamps: false
});



const timezoneSchema = mongoose.model(MODEL.TIMEZONES, TimezoneSchema);

module.exports = timezoneSchema;
