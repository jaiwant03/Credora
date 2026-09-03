const axios = require('axios');

/**
 * Free Wikipedia Open REST & Search API Service
 * Fetches encyclopedic summaries, key facts, and verified knowledge.
 * 100% Free - No API key required.
 */

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php';
const WIKIPEDIA_REST_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary';

/**
 * Search Wikipedia for a query and return relevant articles with extracts
 */
async function searchWikipedia(query, limit = 3) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }

  try {
    const cleanQuery = query.replace(/[^\w\s-]/gi, ' ').trim();
    const response = await axios.get(WIKIPEDIA_API_BASE, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: cleanQuery,
        format: 'json',
        srlimit: limit,
        utf8: 1,
      },
      headers: {
        'User-Agent': 'VerifyAI-FactChecker/1.0 (https://github.com/VerifyAI; verifyai@example.com)',
      },
      timeout: 8000,
    });

    const searchResults = response.data?.query?.search || [];
    const results = [];

    for (const item of searchResults) {
      const summary = await getPageSummary(item.title);
      if (summary) {
        results.push(summary);
      } else {
        results.push({
          title: item.title,
          snippet: item.snippet ? item.snippet.replace(/<\/?[^>]+(>|$)/g, '') : '',
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
          source: 'Wikipedia',
        });
      }
    }

    return results;
  } catch (err) {
    console.warn('[Wikipedia Service] Search error:', err.message);
    return [];
  }
}

/**
 * Fetch detailed summary of a specific Wikipedia article
 */
async function getPageSummary(title) {
  if (!title) return null;

  try {
    const encodedTitle = encodeURIComponent(title.trim().replace(/ /g, '_'));
    const response = await axios.get(`${WIKIPEDIA_REST_BASE}/${encodedTitle}`, {
      headers: {
        'User-Agent': 'VerifyAI-FactChecker/1.0 (https://github.com/VerifyAI; verifyai@example.com)',
      },
      timeout: 6000,
    });

    const data = response.data;
    if (!data || data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
      return null;
    }

    return {
      title: data.title,
      description: data.description || '',
      extract: data.extract || '',
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodedTitle}`,
      thumbnail: data.thumbnail?.source || null,
      source: 'Wikipedia The Free Encyclopedia',
      type: 'encyclopedia',
    };
  } catch (err) {
    // Page might not exist in REST API format
    return null;
  }
}

module.exports = {
  searchWikipedia,
  getPageSummary,
};
