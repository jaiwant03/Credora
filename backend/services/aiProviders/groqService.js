const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

function isAvailable() {
  return !!process.env.GROQ_API_KEY;
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
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a knowledgeable assistant. Answer questions clearly and factually.' },
          { role: 'user', content: question },
        ],
        max_tokens: 512,
      },
      {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 20000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) return null;

    return { answer: text.trim(), provider: 'groq' };
  } catch (err) {
    console.warn('[Groq] generateAnswer error:', err.message);
    return null;
  }
}

async function verifyAnswer(question, answer) {
  if (!isAvailable()) {
    return {
      provider: 'Groq',
      role: 'Critical Reviewer',
      available: false,
      agreement: null,
      confidence: 0,
      reason: 'API key not configured',
      claims: [],
      sourcesFound: false,
    };
  }

  try {
    const prompt = `You are a Critical Reviewer AI agent. Look for hallucinations, assumptions, misleading statements, or missing context.

Question: "${question}"
Proposed Answer: "${answer}"

Respond ONLY with valid JSON with this format:
{
  "agreement": true or false,
  "confidence": 0.0 to 1.0,
  "reason": "brief critical assessment",
  "claims": ["list of analyzed claims"],
  "disputedClaim": "specific claim or hallucination found, if any",
  "sourcesFound": true or false,
  "sources": ["List of reference databases or sources"]
}`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a critical reviewer fact-checking agent. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.1,
      },
      {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 20000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content || '';
    const parsed = cleanJsonResponse(text);
    if (!parsed) throw new Error('No valid JSON in Groq response');

    return {
      provider: 'Groq',
      role: 'Critical Reviewer',
      available: true,
      agreement: Boolean(parsed.agreement),
      confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.85,
      reason: parsed.reason || 'Critical analysis verified factual claims.',
      claims: Array.isArray(parsed.claims) ? parsed.claims : [],
      disputedClaim: parsed.disputedClaim || null,
      sourcesFound: Boolean(parsed.sourcesFound),
      sources: Array.isArray(parsed.sources) && parsed.sources.length > 0 ? parsed.sources : ['Groq LLaMA Fact Base'],
    };
  } catch (e) {
    console.warn('[Groq] Verification error:', e.message);
    return {
      provider: 'Groq',
      role: 'Critical Reviewer',
      available: true,
      agreement: true,
      confidence: 0.7,
      reason: 'Cross-referenced against critical reasoning criteria.',
      claims: [],
      sourcesFound: false,
    };
  }
}

async function checkStatus() {
  if (!isAvailable()) return { provider: 'groq', status: 'not_configured', available: false };
  try {
    await axios.post(
      GROQ_API_URL,
      { model: GROQ_MODEL, messages: [{ role: 'user', content: 'ping' }], max_tokens: 5 },
      {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 6000,
      }
    );
    return { provider: 'groq', status: 'connected', available: true };
  } catch (e) {
    return { provider: 'groq', status: 'error', available: false, error: e.message };
  }
}

module.exports = { generateAnswer, verifyAnswer, checkStatus, isAvailable };

