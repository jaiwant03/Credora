const { getFormattedSettings, updateStructuredSettings } = require('../services/settingsService');
const VerificationAgent = require('../models/VerificationAgent');

async function getSettingsHandler(req, res, next) {
  try {
    const settings = await getFormattedSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

async function updateSettingsHandler(req, res, next) {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: true, message: 'Invalid settings payload format.' });
    }

    await updateStructuredSettings(payload);

    const updated = await getFormattedSettings();
    res.json({ ...updated, message: 'Settings updated successfully.' });
  } catch (err) {
    next(err);
  }
}

async function getAgents(req, res, next) {
  try {
    const agents = await VerificationAgent.find().lean();

    res.json({
      agents: agents.map(a => ({
        id: a._id,
        name: a.name,
        provider: a.provider,
        enabled: a.enabled,
        status: a.status,
        lastChecked: a.last_checked,
        createdAt: a.created_at
      }))
    });
  } catch (err) {
    next(err);
  }
}

async function toggleAgent(req, res, next) {
  try {
    const { provider } = req.params;
    const { enabled } = req.body;

    let agent = await VerificationAgent.findOneAndUpdate(
      { provider },
      { enabled: Boolean(enabled), last_checked: new Date() },
      { new: true, upsert: true }
    ).lean();

    res.json({
      success: true,
      provider,
      enabled: agent.enabled,
      agent
    });
  } catch (err) {
    next(err);
  }
}

async function testProvider(req, res, next) {
  try {
    const { provider } = req.params;
    let result = null;

    if (provider === 'gemini') {
      const geminiService = require('../services/aiProviders/geminiService');
      result = await geminiService.checkStatus();
    } else if (provider === 'groq') {
      const groqService = require('../services/aiProviders/groqService');
      result = await groqService.checkStatus();
    } else if (provider === 'huggingface') {
      const huggingfaceService = require('../services/aiProviders/huggingfaceService');
      result = await huggingfaceService.checkStatus();
    } else if (provider === 'ollama') {
      const ollamaService = require('../services/aiProviders/ollamaService');
      result = await ollamaService.checkStatus();
    } else if (provider === 'n8n') {
      const n8nService = require('../services/n8nService');
      result = await n8nService.checkStatus();
    } else {
      return res.status(400).json({ error: true, message: `Unknown provider: ${provider}` });
    }

    res.json({ success: true, provider, result });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettingsHandler, updateSettingsHandler, getAgents, toggleAgent, testProvider };

