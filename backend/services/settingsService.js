const SystemSetting = require('../models/SystemSetting');
const VerificationAgent = require('../models/VerificationAgent');

function maskApiKey(key) {
  if (!key || key.length < 8) return null;
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

async function getFormattedSettings() {
  try {
    const dbSettings = await SystemSetting.find().lean();
    const settingsMap = {};
    for (const s of dbSettings) {
      settingsMap[s._id] = s.value;
    }

    const agents = await VerificationAgent.find().lean();
    const agentMap = {};
    for (const a of agents) {
      agentMap[a.provider] = a;
    }

    const providers = {
      gemini: {
        name: 'Google Gemini',
        configured: !!process.env.GEMINI_API_KEY,
        keyMasked: maskApiKey(process.env.GEMINI_API_KEY),
        enabled: agentMap.gemini ? agentMap.gemini.enabled : true,
      },
      groq: {
        name: 'Groq',
        configured: !!process.env.GROQ_API_KEY,
        keyMasked: maskApiKey(process.env.GROQ_API_KEY),
        enabled: agentMap.groq ? agentMap.groq.enabled : true,
      },
      huggingface: {
        name: 'Hugging Face',
        configured: !!process.env.HUGGINGFACE_API_KEY,
        keyMasked: maskApiKey(process.env.HUGGINGFACE_API_KEY),
        enabled: agentMap.huggingface ? agentMap.huggingface.enabled : true,
      },
      ollama: {
        name: 'Ollama (Local)',
        configured: !!process.env.OLLAMA_URL,
        url: process.env.OLLAMA_URL || 'http://localhost:11434',
        keyMasked: null,
        enabled: agentMap.ollama ? agentMap.ollama.enabled : true,
      },
      n8n: {
        name: 'n8n Workflow Automation',
        configured: !!process.env.N8N_WEBHOOK_URL,
        url: process.env.N8N_WEBHOOK_URL,
        keyMasked: null,
        enabled: agentMap.n8n ? agentMap.n8n.enabled : ((settingsMap.n8n_enabled ?? 'false') === 'true' || process.env.N8N_ENABLED === 'true'),
      },
    };

    const verification = {
      minConfidenceThreshold: parseInt(settingsMap.min_confidence_threshold || 60),
      numVerificationAgents: parseInt(settingsMap.num_verification_agents || 4),
      additionalVerificationOnConflict: (settingsMap.additional_verification_on_conflict ?? 'true') === 'true',
      sourceVerificationEnabled: (settingsMap.source_verification_enabled ?? 'true') === 'true',
      demoMode: (settingsMap.demo_mode ?? 'false') === 'true',
      n8nEnabled: (settingsMap.n8n_enabled ?? 'false') === 'true' || process.env.N8N_ENABLED === 'true',
    };

    const scoring = {
      aiAgreementWeight: parseInt(settingsMap.ai_agreement_weight || 30),
      evidenceSupportWeight: parseInt(settingsMap.evidence_support_weight || 30),
      sourceReliabilityWeight: parseInt(settingsMap.source_reliability_weight || 25),
      consistencyWeight: parseInt(settingsMap.consistency_weight || 15),
    };

    return {
      providers,
      verification,
      scoring,
      raw: settingsMap
    };
  } catch (e) {
    console.error('[Settings] Error getting formatted settings:', e.message);
    return {
      providers: {},
      verification: {
        minConfidenceThreshold: 60,
        numVerificationAgents: 3,
        additionalVerificationOnConflict: true,
        sourceVerificationEnabled: true,
        demoMode: true,
      },
      scoring: {
        aiAgreementWeight: 30,
        evidenceSupportWeight: 30,
        sourceReliabilityWeight: 25,
        consistencyWeight: 15,
      }
    };
  }
}

async function getRawSettings() {
  try {
    const dbSettings = await SystemSetting.find().maxTimeMS(2000).lean();
    const map = {};
    for (const s of dbSettings) {
      map[s._id] = s.value;
    }
    return map;
  } catch (err) {
    return {
      demo_mode: 'true',
      min_confidence_threshold: '60',
      num_verification_agents: '3',
      additional_verification_on_conflict: 'true',
      source_verification_enabled: 'true',
      ai_agreement_weight: '30',
      evidence_support_weight: '30',
      source_reliability_weight: '25',
      consistency_weight: '15',
    };
  }
}

async function updateSetting(key, value) {
  await SystemSetting.findByIdAndUpdate(
    key,
    { value: String(value), updated_at: new Date() },
    { upsert: true }
  );
}

async function updateStructuredSettings(payload) {
  const updates = [];
  const { verification, scoring } = payload || {};

  if (verification) {
    if (verification.minConfidenceThreshold !== undefined) {
      updates.push(updateSetting('min_confidence_threshold', verification.minConfidenceThreshold));
    }
    if (verification.numVerificationAgents !== undefined) {
      updates.push(updateSetting('num_verification_agents', verification.numVerificationAgents));
    }
    if (verification.additionalVerificationOnConflict !== undefined) {
      updates.push(updateSetting('additional_verification_on_conflict', verification.additionalVerificationOnConflict));
    }
    if (verification.sourceVerificationEnabled !== undefined) {
      updates.push(updateSetting('source_verification_enabled', verification.sourceVerificationEnabled));
    }
    if (verification.demoMode !== undefined) {
      updates.push(updateSetting('demo_mode', verification.demoMode));
    }
    if (verification.n8nEnabled !== undefined) {
      updates.push(updateSetting('n8n_enabled', verification.n8nEnabled));
    }
  }

  if (scoring) {
    if (scoring.aiAgreementWeight !== undefined) {
      updates.push(updateSetting('ai_agreement_weight', scoring.aiAgreementWeight));
    }
    if (scoring.evidenceSupportWeight !== undefined) {
      updates.push(updateSetting('evidence_support_weight', scoring.evidenceSupportWeight));
    }
    if (scoring.sourceReliabilityWeight !== undefined) {
      updates.push(updateSetting('source_reliability_weight', scoring.sourceReliabilityWeight));
    }
    if (scoring.consistencyWeight !== undefined) {
      updates.push(updateSetting('consistency_weight', scoring.consistencyWeight));
    }
  }

  await Promise.all(updates);
}

module.exports = {
  getSettings: getRawSettings,
  getFormattedSettings,
  updateSetting,
  updateStructuredSettings
};
