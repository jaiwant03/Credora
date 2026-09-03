const newsService = require('../services/newsService');
const wikipediaService = require('../services/wikipediaService');
const webSearchService = require('../services/webSearchService');

/**
 * Controller for Live News, Google News Feeds, and Wikipedia Search
 */

async function getLiveNews(req, res, next) {
  try {
    const { category = 'all', limit = 20 } = req.query;
    const items = await newsService.getNewsByCategory(category, parseInt(limit));

    res.json({
      success: true,
      category,
      total: items.length,
      articles: items,
    });
  } catch (err) {
    next(err);
  }
}

async function searchNewsArticles(req, res, next) {
  try {
    const { q, limit = 15 } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: true, message: 'Search query "q" is required' });
    }

    const items = await newsService.searchNews(q.trim(), parseInt(limit));

    res.json({
      success: true,
      query: q.trim(),
      total: items.length,
      articles: items,
    });
  } catch (err) {
    next(err);
  }
}

async function searchWikipediaArticles(req, res, next) {
  try {
    const { q, limit = 5 } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: true, message: 'Wikipedia search query "q" is required' });
    }

    const results = await wikipediaService.searchWikipedia(q.trim(), parseInt(limit));

    res.json({
      success: true,
      query: q.trim(),
      total: results.length,
      results,
    });
  } catch (err) {
    next(err);
  }
}

async function getGroundingData(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: true, message: 'Query "q" is required' });
    }

    const data = await webSearchService.groundClaim(q.trim());

    res.json({
      success: true,
      query: q.trim(),
      ...data,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLiveNews,
  searchNewsArticles,
  searchWikipediaArticles,
  getGroundingData,
};
