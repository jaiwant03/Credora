const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'system_settings',
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
