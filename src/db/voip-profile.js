const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const { MODEL } = require('../utils/common/constants')

const voipProfileSchema = new mongoose.Schema(
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      type: {
        type: String,
        required: true,
        enum: ["SIP", "WEBRTC"],
        default: "SIP"
      },
      settings: {

          host: {
            type: String,
            required: true
          },
          websocket_url: {
            type: String,
            default: null
          },
          port: {
            type: Number,
            default: null
          },
          stun_servers: {
            type: Array,
            default: null
          },
          turn_servers: {
            type: Array,
            default: null
          },


        required: true
      },
    
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

const VoipProfile = mongoose.model(MODEL.VOIP_PROFILE, voipProfileSchema, MODEL.VOIP_PROFILE);

module.exports = VoipProfile;
