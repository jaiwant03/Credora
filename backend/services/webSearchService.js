const wikipediaService = require('./wikipediaService');
const newsService = require('./newsService');

/**
 * Free Multi-Source Web & Fact-Check Grounding Service
 * Combines Google News Live RSS, Wikipedia REST API, and Public Knowledge Sources.
 * 100% Free - No paid API keys required.
 */

async function groundClaim(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return {
      sources: [],
      evidenceSnippets: [],
      wikipediaExtracts: [],
      newsArticles: [],
      combinedContext: '',
    };
  }

  const cleanQuery = query.trim();

  // Parallel lookup across Wikipedia and Google News
  const [wikiResults, newsResults] = await Promise.allSettled([
    wikipediaService.searchWikipedia(cleanQuery, 3),
    newsService.searchNews(cleanQuery, 5),
  ]);

  const wikiData = wikiResults.status === 'fulfilled' ? wikiResults.value : [];
  const newsData = newsResults.status === 'fulfilled' ? newsResults.value : [];

  const sourcesSet = new Set();
  const evidenceSnippets = [];
  const sourceObjects = [];

  // Add Wikipedia findings
  for (const item of wikiData) {
    const srcName = 'Wikipedia (The Free Encyclopedia)';
    sourcesSet.add(srcName);

    if (item.extract || item.snippet) {
      evidenceSnippets.push({
        source: srcName,
        title: item.title,
        text: item.extract || item.snippet,
        url: item.url,
        type: 'encyclopedia',
        publishedAt: 'Peer-Reviewed / Continuously Updated',
      });
    }

    sourceObjects.push({
      name: `Wikipedia: ${item.title}`,
      url: item.url,
      type: 'Encyclopedia',
      reliability: 'High',
    });
  }

  // Add Google News findings
  for (const item of newsData) {
    const srcName = item.publisher || 'Google News';
    sourcesSet.add(srcName);

    if (item.title || item.snippet) {
      evidenceSnippets.push({
        source: srcName,
        title: item.title,
        text: item.snippet || item.title,
        url: item.url || item.link,
        type: 'news',
        publishedAt: item.publishedAt || item.pubDate,
      });
    }

    sourceObjects.push({
      name: `${srcName}: ${item.title}`,
      url: item.url || item.link,
      type: 'News Media',
      reliability: 'Verified Outlet',
    });
  }

  // Build combined grounding context string for AI verifiers
  let combinedContext = '';
  if (wikiData.length > 0) {
    combinedContext += '--- WIKIPEDIA GROUNDING ---\n';
    wikiData.forEach(w => {
      combinedContext += `Article: "${w.title}"\nExtract: ${w.extract || w.snippet}\nLink: ${w.url}\n\n`;
    });
  }

  if (newsData.length > 0) {
    combinedContext += '--- LIVE GOOGLE NEWS & WEB CITATIONS ---\n';
    newsData.forEach(n => {
      combinedContext += `Headline: "${n.title}"\nPublisher: ${n.publisher}\nSnippet: ${n.snippet}\nLink: ${n.url}\n\n`;
    });
  }

  return {
    sources: Array.from(sourcesSet),
    sourceObjects,
    evidenceSnippets,
    wikipediaExtracts: wikiData,
    newsArticles: newsData,
    combinedContext: combinedContext.trim(),
    hasGrounding: wikiData.length > 0 || newsData.length > 0,
  };
}

module.exports = {
  groundClaim,
};
