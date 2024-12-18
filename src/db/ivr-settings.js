const mongoose = require('mongoose');

const IVRSettingsSchema = new mongoose.Schema({
  actions: {
    type: Object,
    required: true,
  },
});

const IVRSettingsModel = mongoose.model('ivr_settings', IVRSettingsSchema);

module.exports = IVRSettingsModel;
