const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')

const IVRSchema = new mongoose.Schema({
  data: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODEL.IVR_DATA,
    required: true
  },
  input_action_data: {
    type: Object,
    required: true
  },
  config: {
    type: Object,
    required: true
  },
  name: {
    type: String,
    unique: true,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODEL.USERS,
    required: true
  },
  call_centres:{
    type:mongoose.Schema.Types.ObjectId,
    ref:MODEL.CALL_CENTERS,
    required:true
  },
  menu_wait_time: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value > 0;
      },
      message: 'Menu wait time must not be 0.'
    }
  },
  reprompt: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value > 0;
      },
      message: 'Reprompt must not be 0.'
    }
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
},{
    versionKey: false,
    timestamps: true
});

const ivrSchema = mongoose.model(MODEL.IVR, IVRSchema);

module.exports = ivrSchema;
