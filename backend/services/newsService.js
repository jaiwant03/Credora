const axios = require('axios');

/**
 * Free Google News RSS & Real-Time News Service
 * Ingests live global news, categorizes headlines, and searches news articles.
 * 100% Free - No API key required.
 */

const GOOGLE_NEWS_RSS_BASE = 'https://news.google.com/rss';

const TOPIC_MAP = {
  all: `${GOOGLE_NEWS_RSS_BASE}?hl=en-US&gl=US&ceid=US:en`,
  world: `${GOOGLE_NEWS_RSS_BASE}/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en`,
  technology: `${GOOGLE_NEWS_RSS_BASE}/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en`,
  business: `${GOOGLE_NEWS_RSS_BASE}/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en`,
  science: `${GOOGLE_NEWS_RSS_BASE}/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en`,
  health: `${GOOGLE_NEWS_RSS_BASE}/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en`,
  entertainment: `${GOOGLE_NEWS_RSS_BASE}/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en`,
  sports: `${GOOGLE_NEWS_RSS_BASE}/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en`,
};

/**
 * Robust XML RSS Parser for Google News feed
 */
function parseRssFeed(xmlString, category = 'general') {
  if (!xmlString || typeof xmlString !== 'string') return [];

  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlString)) !== null && items.length < 30) {
    const itemXml = match[1];

    // Extract title
    let title = '';
    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    if (titleMatch) {
      title = decodeHtmlEntities(titleMatch[1].trim());
    }

    // Extract link
    let link = '';
    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    if (linkMatch) {
      link = linkMatch[1].trim();
    }

    // Extract pubDate
    let pubDate = '';
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    if (pubDateMatch) {
      pubDate = pubDateMatch[1].trim();
    }

    // Extract source publisher
    let publisher = 'Google News';
    const sourceMatch = itemXml.match(/<source[^>]*url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/i) ||
                        itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    if (sourceMatch) {
      publisher = decodeHtmlEntities((sourceMatch[2] || sourceMatch[1] || 'Google News').trim());
    } else if (title.includes(' - ')) {
      const parts = title.split(' - ');
      publisher = parts[parts.length - 1];
      title = parts.slice(0, -1).join(' - ');
    }

    // Extract snippet from description
    let snippet = '';
    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    if (descMatch) {
      snippet = descMatch[1]
        .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .trim();
      snippet = decodeHtmlEntities(snippet);
    }

    if (!snippet || snippet.length < 10) {
      snippet = `Breaking news report from ${publisher} regarding: ${title}.`;
    }

    if (title && link) {
      items.push({
        id: Buffer.from(link || title).toString('base64').slice(0, 16),
        title,
        link,
        url: link,
        publisher,
        source: publisher,
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        publishedAt: pubDate || new Date().toUTCString(),
        snippet,
        category: category || 'general',
      });
    }
  }

  return items;
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Fetch live news by category
 */
async function getNewsByCategory(category = 'all', limit = 20) {
  const catKey = (category || 'all').toLowerCase();
  const feedUrl = TOPIC_MAP[catKey] || TOPIC_MAP.all;

  try {
    const response = await axios.get(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      timeout: 10000,
    });

    const items = parseRssFeed(response.data, catKey);
    return items.slice(0, limit);
  } catch (err) {
    console.warn(`[News Service] Failed to fetch news for category "${category}":`, err.message);
    // Fallback to top stories feed if category fails
    if (catKey !== 'all') {
      return getNewsByCategory('all', limit);
    }
    return [];
  }
}

/**
 * Search live news for a specific query or claim
 */
async function searchNews(query, limit = 10) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const searchUrl = `${GOOGLE_NEWS_RSS_BASE}/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      timeout: 10000,
    });

    const items = parseRssFeed(response.data, 'search');
    return items.slice(0, limit);
  } catch (err) {
    console.warn(`[News Service] Search error for query "${query}":`, err.message);
    return [];
  }
}

module.exports = {
  getNewsByCategory,
  searchNews,
  TOPIC_MAP,
};
