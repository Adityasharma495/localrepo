const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const { MODEL } = require('../utils/common/constants')

const telephonyProfileSchema = new mongoose.Schema({
  profile:[ 
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      number: {
          country_code: {
            type: String,
            default: null
          },
          number: {
            type: String,
            required: true
          }
      },
      active_profile: {
        type: Boolean,
        default: true
      }
    }],
  created_by: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: USER_MODEL_NAME,
    default: null 
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  
}, { versionKey: false, });

const TelephonyProfile = mongoose.model(MODEL.TELEPHONY_PROFILE, telephonyProfileSchema, MODEL.TELEPHONY_PROFILE);

module.exports = TelephonyProfile;
