const axios = require('axios');

const HF_API_URL = 'https://api-inference.huggingface.co/models/google/flan-t5-large';

function isAvailable() {
  return !!process.env.HUGGINGFACE_API_KEY;
}

async function verifyAnswer(question, answer) {
  if (!isAvailable()) {
    return {
      provider: 'Hugging Face',
      role: 'Evidence Reviewer',
      available: false,
      agreement: null,
      confidence: 0,
      reason: 'API key not configured',
      sourcesFound: false,
    };
  }

  try {
    const prompt = `Role: Evidence Reviewer. Does available training evidence support this answer? Question: ${question} Answer: ${answer} Respond with yes or no and a brief reason.`;

    const response = await axios.post(
      HF_API_URL,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const text = Array.isArray(response.data)
      ? response.data[0]?.generated_text || ''
      : response.data?.generated_text || '';

    const agreement = !text.toLowerCase().includes('no') || text.toLowerCase().includes('yes');
    const confidence = agreement ? 0.75 : 0.35;

    return {
      provider: 'Hugging Face',
      role: 'Evidence Reviewer',
      available: true,
      agreement,
      confidence,
      reason: text.substring(0, 200),
      sourcesFound: false,
      sources: [],
    };
  } catch (e) {
    const isLoading = e.response?.status === 503;
    console.warn('[HuggingFace] Error:', e.message);
    return {
      provider: 'Hugging Face',
      role: 'Evidence Reviewer',
      available: !isLoading,
      agreement: null,
      confidence: 0,
      reason: isLoading ? 'Model loading, temporarily unavailable' : `Error: ${e.message}`,
      sourcesFound: false,
    };
  }
}

async function checkStatus() {
  if (!isAvailable()) return { provider: 'huggingface', status: 'not_configured', available: false };
  try {
    await axios.post(
      HF_API_URL,
      { inputs: 'test' },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );
    return { provider: 'huggingface', status: 'connected', available: true };
  } catch (e) {
    if (e.response?.status === 503) {
      return { provider: 'huggingface', status: 'loading', available: false };
    }
    return { provider: 'huggingface', status: 'error', available: false, error: e.message };
  }
}

module.exports = { verifyAnswer, checkStatus, isAvailable };
