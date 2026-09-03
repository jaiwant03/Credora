const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    index: true,
  },
  title: String,
  url: String,
  domain: String,
  type: {
    type: String,
    default: 'web',
    enum: ['web', 'wikipedia', 'academic', 'knowledge', 'ai', 'news', 'official'],
    index: true,
  },
  reliability: {
    type: String,
    default: 'medium',
    enum: ['high', 'medium', 'low'],
  },
  usage_count: {
    type: Number,
    default: 0,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  last_used: {
    type: Date,
    default: Date.now,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'sources',
});

module.exports = mongoose.model('Source', sourceSchema);
