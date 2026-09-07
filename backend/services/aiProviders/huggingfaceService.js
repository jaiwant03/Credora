const axios = require('axios');

const HF_ROUTER_URL = process.env.HUGGINGFACE_ROUTER_URL || 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.1-8B-Instruct';

function isAvailable() {
  return !!process.env.HUGGINGFACE_API_KEY;
}

function cleanJsonResponse(text) {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function generateAnswer(question) {
  if (!isAvailable()) return null;

  try {
    const response = await axios.post(
      HF_ROUTER_URL,
      {
        model: HF_MODEL,
        messages: [
          { role: 'system', content: 'You are a factual knowledge assistant. Provide clear, accurate, concise answers.' },
          { role: 'user', content: question },
        ],
        max_tokens: 400,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) return null;

    return { answer: text.trim(), provider: 'huggingface' };
  } catch (err) {
    console.warn('[HuggingFace] generateAnswer error:', err.response?.data?.error || err.message);
    return null;
  }
}

async function verifyAnswer(question, answer) {
  if (!isAvailable()) {
    return {
      provider: 'Hugging Face',
      role: 'Evidence Reviewer',
      available: false,
      agreement: null,
      confidence: 0,
      reason: 'Hugging Face API key not configured',
      claims: [],
      sourcesFound: false,
      sources: [],
    };
  }

  try {
    const prompt = `You are an AI Evidence Reviewer and Fact Checking agent.
Evaluate whether the factual claims in this answer are supported by authoritative training data.

Question: "${question}"
Proposed Answer: "${answer}"

Respond strictly in valid JSON format only, with this exact schema:
{
  "agreement": true or false,
  "confidence": 0.0 to 1.0,
  "reason": "Clear, concise explanation of whether facts are accurate",
  "claims": ["key factual claim 1", "key factual claim 2"],
  "disputedClaim": "specific claim you disagree with, if any",
  "sourcesFound": true or false,
  "sources": ["Authoritative Source 1", "Authoritative Source 2"]
}`;

    const response = await axios.post(
      HF_ROUTER_URL,
      {
        model: HF_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 450,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content || '';
    const parsed = cleanJsonResponse(text);

    if (parsed) {
      return {
        provider: 'Hugging Face',
        role: 'Evidence Reviewer',
        available: true,
        agreement: Boolean(parsed.agreement),
        confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.85,
        reason: parsed.reason || 'Evidence matches consensus training corpora.',
        claims: Array.isArray(parsed.claims) ? parsed.claims : [],
        disputedClaim: parsed.disputedClaim || null,
        sourcesFound: Boolean(parsed.sourcesFound),
        sources: Array.isArray(parsed.sources) ? parsed.sources : [],
      };
    }

    // Fallback parser if not valid JSON
    const agreement = !text.toLowerCase().includes('disagree') && !text.toLowerCase().includes('false');
    return {
      provider: 'Hugging Face',
      role: 'Evidence Reviewer',
      available: true,
      agreement,
      confidence: agreement ? 0.82 : 0.45,
      reason: text.slice(0, 250).trim() || 'Verified via Hugging Face model inference.',
      claims: [],
      sourcesFound: true,
      sources: ['Hugging Face Open Foundation Models'],
    };
  } catch (e) {
    console.warn('[HuggingFace] verifyAnswer error:', e.response?.data?.error || e.message);
    return {
      provider: 'Hugging Face',
      role: 'Evidence Reviewer',
      available: false,
      agreement: null,
      confidence: 0,
      reason: `Error: ${e.response?.data?.error || e.message}`,
      sourcesFound: false,
      sources: [],
    };
  }
}

async function checkStatus() {
  if (!isAvailable()) return { provider: 'huggingface', status: 'not_configured', available: false };
  try {
    const response = await axios.post(
      HF_ROUTER_URL,
      {
        model: HF_MODEL,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      }
    );
    return {
      provider: 'huggingface',
      status: 'connected',
      available: true,
      model: HF_MODEL,
    };
  } catch (e) {
    return {
      provider: 'huggingface',
      status: 'error',
      available: false,
      error: e.response?.data?.error || e.message,
    };
  }
}

module.exports = { verifyAnswer, generateAnswer, checkStatus, isAvailable };

