const mongoose = require('mongoose');

const verificationAgentSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    default: 'unknown',
    enum: ['connected', 'error', 'not_configured', 'unknown', 'loading'],
  },
  last_checked: Date,
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'verification_agents',
});

module.exports = mongoose.model('VerificationAgent', verificationAgentSchema);
