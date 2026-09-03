const Source = require('../models/Source');
const { v4: uuidv4 } = require('uuid');

async function getSources(req, res, next) {
  try {
    const { type } = req.query;
    
    const query = {};
    if (type && type !== 'all') {
      query.type = type;
    }

    const sources = await Source.find(query)
      .sort({ usage_count: -1, usageCount: -1 })
      .lean();

    res.json({
      sources: sources.map(s => ({
        id: s._id,
        _id: s._id,
        name: s.name,
        title: s.title || s.name,
        url: s.url || '',
        type: s.type || 'web',
        reliability: s.reliability || 'medium',
        domain: s.domain || (s.url ? new URL(s.url.startsWith('http') ? s.url : `https://${s.url}`).hostname : ''),
        usageCount: s.usageCount !== undefined ? s.usageCount : (s.usage_count || 0),
        usage_count: s.usage_count !== undefined ? s.usage_count : (s.usageCount || 0),
        lastUsed: s.lastUsed || s.last_used || new Date(),
        last_used: s.last_used || s.lastUsed || new Date(),
        createdAt: s.createdAt || s.created_at || new Date(),
        created_at: s.created_at || s.createdAt || new Date()
      }))
    });
  } catch (err) {
    next(err);
  }
}

async function createSource(req, res, next) {
  try {
    const { name, title, url, type, reliability, domain } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: true, message: 'Name and type are required.' });
    }

    const existing = await Source.findOne({ name });
    if (existing) {
      return res.status(409).json({ error: true, message: 'Source with this name already exists.' });
    }

    const id = `src-${uuidv4().slice(0, 8)}`;
    const now = new Date();
    const source = new Source({
      _id: id,
      name,
      title: title || name,
      url: url || '',
      domain: domain || '',
      type,
      reliability: reliability || 'medium',
      usage_count: 0,
      usageCount: 0,
      last_used: now,
      lastUsed: now,
      created_at: now,
      createdAt: now
    });

    await source.save();

    res.status(201).json({
      id: source._id,
      name: source.name,
      title: source.title,
      url: source.url,
      type: source.type,
      reliability: source.reliability,
      usageCount: source.usageCount,
      usage_count: source.usage_count,
      lastUsed: source.lastUsed,
      last_used: source.last_used,
      createdAt: source.createdAt,
      created_at: source.created_at
    });
  } catch (err) {
    next(err);
  }
}

async function updateSource(req, res, next) {
  try {
    const { id } = req.params;
    const { name, title, url, type, reliability, domain } = req.body;

    const update = {};
    if (name) update.name = name;
    if (title) update.title = title;
    if (url !== undefined) update.url = url;
    if (type) update.type = type;
    if (reliability) update.reliability = reliability;
    if (domain) update.domain = domain;

    const source = await Source.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).lean();

    if (!source) {
      return res.status(404).json({ error: true, message: 'Source not found.' });
    }

    res.json({
      id: source._id,
      name: source.name,
      title: source.title || source.name,
      url: source.url,
      type: source.type,
      reliability: source.reliability,
      usageCount: source.usageCount || source.usage_count || 0,
      usage_count: source.usage_count || source.usageCount || 0,
      lastUsed: source.lastUsed || source.last_used,
      last_used: source.last_used || source.lastUsed,
      createdAt: source.createdAt || source.created_at,
      created_at: source.created_at || source.createdAt
    });
  } catch (err) {
    next(err);
  }
}

async function deleteSource(req, res, next) {
  try {
    const { id } = req.params;

    const source = await Source.findByIdAndDelete(id);

    if (!source) {
      return res.status(404).json({ error: true, message: 'Source not found.' });
    }

    res.json({ message: 'Source deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSources, createSource, updateSource, deleteSource };
