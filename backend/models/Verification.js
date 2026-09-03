const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
    index: 'text',
  },
  classification: {
    type: String,
    default: 'general',
    enum: ['historical', 'conceptual', 'temporal', 'numerical', 'scientific', 'general', 'current_events', 'history', 'science', 'technology', 'news', 'politics', 'geography', 'mathematics', 'programming', 'comparison', 'other'],
  },
  initialAnswer: String,
  initial_answer: String,
  finalAnswer: String,
  final_answer: String,
  confidenceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  confidence_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  confidenceLevel: {
    type: String,
    default: 'low',
    enum: ['very_high', 'high', 'moderate', 'low', 'unable'],
  },
  confidence_level: {
    type: String,
    default: 'low',
    enum: ['very_high', 'high', 'moderate', 'low', 'unable'],
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['verified', 'conflict_resolved', 'low_confidence', 'unable_to_verify', 'pending'],
    index: true,
  },
  conflictDetected: {
    type: Boolean,
    default: false,
  },
  conflict_detected: {
    type: Boolean,
    default: false,
  },
  sources: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  verificationSummary: {
    aiAgreement: Boolean,
    evidenceFound: Boolean,
    conflictDetected: Boolean,
    conflictResolved: Boolean,
    additionalVerificationPerformed: Boolean,
  },
  verificationResults: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  verification_results: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  verifierDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  verifier_details: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  evidenceSnippets: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  evidence_snippets: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  sourceObjects: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  conflicts: [
    {
      claim: String,
      description: String,
      resolved: Boolean,
    }
  ],
  processingTime: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'verifications',
});

verificationSchema.index({ created_at: -1 });
verificationSchema.index({ status: 1, created_at: -1 });

module.exports = mongoose.model('Verification', verificationSchema);
