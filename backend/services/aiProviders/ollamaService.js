const axios = require('axios');

const OLLAMA_BASE_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '');
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3';

function isAvailable() {
  return !!process.env.OLLAMA_URL;
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

async function getAvailableModels() {
  try {
    const res = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 2500 });
    const all = res.data?.models?.map(m => m.name) || [];
    // Filter out embedding-only models
    const generative = all.filter(m => !m.toLowerCase().includes('embed'));
    return generative.length > 0 ? generative : all;
  } catch (e) {
    return [];
  }
}

async function getPreferredModel() {
  if (process.env.OLLAMA_MODEL) return process.env.OLLAMA_MODEL;
  const models = await getAvailableModels();
  if (models.length === 0) return DEFAULT_MODEL;
  // Prioritize compact fast models (e.g., 3b, 4b) for fast real-time verification
  const fastModel = models.find(m => /(?:1|2|3|4)b/i.test(m) && /qwen|llama|mistral|phi/i.test(m));
  if (fastModel) return fastModel;
  const preferred = models.find(m => /qwen|llama|mistral|gemma|phi/i.test(m));
  return preferred || models[0];
}

async function checkStatus() {
  if (!isAvailable()) {
    return { provider: 'ollama', status: 'not_configured', available: false, url: OLLAMA_BASE_URL };
  }

  try {
    const models = await getAvailableModels();
    const res = await axios.get(`${OLLAMA_BASE_URL}/api/version`, { timeout: 2500 });
    const activeModel = await getPreferredModel();
    return {
      provider: 'ollama',
      status: 'connected',
      available: true,
      version: res.data?.version || 'detected',
      activeModel,
      models,
      url: OLLAMA_BASE_URL,
    };
  } catch (e) {
    return {
      provider: 'ollama',
      status: 'not_running',
      available: false,
      url: OLLAMA_BASE_URL,
      error: `Ollama not reachable at ${OLLAMA_BASE_URL} (${e.code || e.message})`,
    };
  }
}

async function generateAnswer(question) {
  if (!isAvailable()) return null;

  try {
    const model = await getPreferredModel();

    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model,
        prompt: `Provide a clear, accurate, and factual answer to this question: ${question}`,
        stream: false,
        options: { temperature: 0.2 },
      },
      { timeout: 25000 }
    );

    const text = response.data?.response;
    if (!text) return null;

    return { answer: text.trim(), provider: 'ollama', model };
  } catch (err) {
    console.warn('[Ollama] generateAnswer error:', err.message);
    return null;
  }
}

async function verifyAnswer(question, answer) {
  if (!isAvailable()) {
    return {
      provider: 'Ollama',
      role: 'Local LLM Verifier',
      available: false,
      agreement: null,
      confidence: 0,
      reason: 'OLLAMA_URL not configured',
      claims: [],
      sourcesFound: false,
      sources: [],
    };
  }

  // Fast ping before attempting generation to prevent blocking if daemon is stopped
  try {
    await axios.get(`${OLLAMA_BASE_URL}/api/version`, { timeout: 1500 });
  } catch (e) {
    return {
      provider: 'Ollama',
      role: 'Local LLM Verifier',
      available: false,
      agreement: null,
      confidence: 0,
      reason: `Ollama service not running at ${OLLAMA_BASE_URL}`,
      claims: [],
      sourcesFound: false,
      sources: [],
    };
  }

  try {
    const model = await getPreferredModel();

    const prompt = `You are a Local AI Verifier agent.
Evaluate whether the factual claims in this answer are supported.
Question: "${question}"
Proposed Answer: "${answer}"

Respond strictly in valid JSON format only with this exact schema:
{
  "agreement": true or false,
  "confidence": 0.0 to 1.0,
  "reason": "Clear explanation of factual accuracy",
  "claims": ["key factual claims"],
  "disputedClaim": "specific dispute if any",
  "sourcesFound": true or false,
  "sources": ["referenced knowledge sources"]
}`;

    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model,
        prompt,
        stream: false,
        options: { temperature: 0.1, num_predict: 220 },
      },
      { timeout: 18000 }
    );

    const text = response.data?.response || '';
    const parsed = cleanJsonResponse(text);

    if (parsed) {
      return {
        provider: 'Ollama',
        role: 'Local LLM Verifier',
        available: true,
        agreement: Boolean(parsed.agreement),
        confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.85,
        reason: parsed.reason || `Validated with local ${model} model.`,
        claims: Array.isArray(parsed.claims) ? parsed.claims : [],
        disputedClaim: parsed.disputedClaim || null,
        sourcesFound: Boolean(parsed.sourcesFound),
        sources: Array.isArray(parsed.sources) ? parsed.sources : [],
        model,
      };
    }

    const agreement = !text.toLowerCase().includes('disagree') && !text.toLowerCase().includes('false');
    return {
      provider: 'Ollama',
      role: 'Local LLM Verifier',
      available: true,
      agreement,
      confidence: agreement ? 0.80 : 0.40,
      reason: text.slice(0, 250).trim() || `Verified via local model (${model}).`,
      claims: [],
      sourcesFound: false,
      sources: [`Local Model: ${model}`],
      model,
    };
  } catch (err) {
    console.warn('[Ollama] verifyAnswer error:', err.message);
    return {
      provider: 'Ollama',
      role: 'Local LLM Verifier',
      available: false,
      agreement: null,
      confidence: 0,
      reason: `Error: ${err.message}`,
      sourcesFound: false,
      sources: [],
    };
  }
}

module.exports = {
  verifyAnswer,
  generateAnswer,
  checkStatus,
  isAvailable,
  getAvailableModels,
};
