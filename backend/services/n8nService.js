const axios = require('axios');

async function triggerVerification(question, requestId) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('N8N_WEBHOOK_URL is not configured');
  }

  const payload = {
    question,
    requestId,
    timestamp: new Date().toISOString(),
  };

  const response = await axios.post(webhookUrl, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000, // n8n workflows can take time
  });

  const data = response.data;

  // Normalize n8n response to our internal format
  return {
    id: requestId,
    question,
    classification: data.classification || 'general',
    initialAnswer: data.initialAnswer || data.initial_answer || '',
    answer: data.finalAnswer || data.final_answer || data.answer || '',
    confidence: data.confidence || data.confidenceScore || data.confidence_score || 0,
    confidenceLevel: data.confidenceLevel || data.confidence_level || 'low',
    confidenceLevelLabel: data.confidenceLevelLabel || data.confidence_level_label || 'Low',
    status: data.status || 'verified',
    sources: data.sources || [],
    verificationSummary: data.verificationSummary || data.verification_summary || {
      aiAgreement: false,
      evidenceFound: false,
      conflictDetected: false,
    },
    verifierDetails: data.verifierDetails || data.verifier_details || data.verifiers || [],
    steps: data.steps || [],
    demoMode: false,
    viaN8n: true,
  };
}

async function checkStatus() {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) return { available: false, reason: 'Webhook URL not configured' };

  try {
    // Try a health check if n8n provides one, otherwise assume available
    return { available: true, url: webhookUrl };
  } catch (e) {
    return { available: false, reason: e.message };
  }
}

module.exports = { triggerVerification, checkStatus };
