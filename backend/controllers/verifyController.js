const { verify } = require('../services/verificationEngine');
const Verification = require('../models/Verification');

async function handleVerify(req, res, next) {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return res.status(400).json({ error: true, message: 'Question must be at least 3 characters.' });
    }

    if (question.trim().length > 2000) {
      return res.status(400).json({ error: true, message: 'Question must be under 2000 characters.' });
    }

    const result = await verify(question.trim());

    res.json({
      success: true,
      verification: result,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

async function getVerifications(req, res, next) {
  try {
    const { status, limit = 50, offset = 0, search } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { final_answer: { $regex: search, $options: 'i' } },
        { finalAnswer: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Verification.countDocuments(query);
    const verifications = await Verification.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    res.json({
      verifications: verifications.map(formatVerification),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    next(err);
  }
}

async function getVerificationById(req, res, next) {
  try {
    const verification = await Verification.findById(req.params.id).lean();

    if (!verification) {
      return res.status(404).json({ error: true, message: 'Verification not found' });
    }

    res.json(formatVerification(verification));
  } catch (err) {
    next(err);
  }
}

async function deleteVerification(req, res, next) {
  try {
    const deleted = await Verification.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: true, message: 'Verification not found' });
    }
    res.json({ success: true, message: 'Verification deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
}

function formatVerification(doc) {
  const initialAnswer = doc.initialAnswer || doc.initial_answer || '';
  const finalAnswer = doc.finalAnswer || doc.final_answer || '';
  const confidenceScore = doc.confidenceScore !== undefined ? doc.confidenceScore : (doc.confidence_score || 0);
  const confidenceLevel = doc.confidenceLevel || doc.confidence_level || 'low';
  const conflictDetected = doc.conflictDetected !== undefined ? doc.conflictDetected : (doc.conflict_detected || false);
  const summary = doc.verificationSummary || doc.verification_results || {};
  const verifierDetails = doc.verifierDetails || doc.verifier_details || [];

  return {
    id: doc._id,
    _id: doc._id,
    question: doc.question,
    classification: doc.classification || 'general',
    initialAnswer,
    initial_answer: initialAnswer,
    answer: finalAnswer,
    finalAnswer,
    final_answer: finalAnswer,
    confidence: confidenceScore,
    confidenceScore,
    confidence_score: confidenceScore,
    confidenceLevel,
    confidence_level: confidenceLevel,
    status: doc.status || 'verified',
    conflictDetected,
    conflict_detected: conflictDetected,
    sources: doc.sources || [],
    sourceObjects: doc.sourceObjects || doc.source_objects || [],
    evidenceSnippets: doc.evidenceSnippets || doc.evidence_snippets || [],
    evidence_snippets: doc.evidenceSnippets || doc.evidence_snippets || [],
    verificationSummary: summary,
    verificationResults: summary,
    verifierDetails,
    verifier_details: verifierDetails,
    createdAt: doc.created_at || doc.createdAt,
    created_at: doc.created_at || doc.createdAt,
    updatedAt: doc.updated_at || doc.updatedAt,
    updated_at: doc.updated_at || doc.updatedAt,
  };
}

module.exports = { handleVerify, getVerifications, getVerificationById, deleteVerification };
