import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Newspaper, Search, RefreshCw, ExternalLink, ShieldCheck,
  Globe, Sparkles, Zap, Flame, Clock, Radio, ChevronRight,
  TrendingUp, BookOpen, AlertCircle, CheckCircle2, Plus
} from 'lucide-react';
import { getLiveNews, searchNews } from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All Breaking', icon: Flame },
  { id: 'tamil', label: 'Tamil News (தமிழ்)', icon: Globe },
  { id: 'india', label: 'India News', icon: Radio },
  { id: 'technology', label: 'Technology', icon: Zap },
  { id: 'world', label: 'World News', icon: Globe },
  { id: 'business', label: 'Business & Finance', icon: TrendingUp },
  { id: 'science', label: 'Science & Space', icon: Sparkles },
  { id: 'health', label: 'Health & Medicine', icon: ShieldCheck },
  { id: 'entertainment', label: 'Entertainment', icon: BookOpen },
  { id: 'sports', label: 'Sports', icon: Radio },
];

// Helper to assign a cohesive multi-color palette to various publishers
function getPublisherStyle(publisher = '') {
  const p = publisher.toLowerCase();
  if (p.includes('ap') || p.includes('reuters') || p.includes('npr')) {
    return { badgeClass: 'badge-green', btnClass: 'btn-emerald', color: '#10B981' };
  }
  if (p.includes('fox weather') || p.includes('cnn') || p.includes('weather') || p.includes('sky')) {
    return { badgeClass: 'badge-blue', btnClass: 'btn-blue', color: '#1687E8' };
  }
  if (p.includes('cbs') || p.includes('bloomberg') || p.includes('cnbc') || p.includes('times')) {
    return { badgeClass: 'badge-orange', btnClass: 'btn-orange', color: '#F59E0B' };
  }
  if (p.includes('fox') || p.includes('the verge') || p.includes('wired') || p.includes('guardian')) {
    return { badgeClass: 'badge-purple', btnClass: 'btn-purple', color: '#7C3AED' };
  }
  return { badgeClass: 'badge-blue', btnClass: 'btn-cyan', color: '#06B6D4' };
}

export default function News() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  async function fetchNews(category) {
    setLoading(true);
    setError(null);
    setIsSearching(false);
    try {
      const data = await getLiveNews(category, 24);
      setArticles(data.articles || []);
    } catch (err) {
      console.error('Failed to load news:', err);
      setError(err.message || 'Failed to load live news feed. Please retry.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchNews(selectedCategory);
      return;
    }

    setLoading(true);
    setError(null);
    setIsSearching(true);
    try {
      const data = await searchNews(searchQuery.trim(), 20);
      setArticles(data.articles || []);
    } catch (err) {
      console.error('Failed searching news:', err);
      setError(err.message || 'Error searching news articles.');
    } finally {
      setLoading(false);
    }
  }

  function handleVerifyArticle(article) {
    const query = `Is it true: "${article.title}"?`;
    navigate('/verify', { state: { initialQuestion: query, autoSubmit: true } });
  }

  function formatTimeAgo(dateStr) {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      const diffSecs = Math.floor((new Date() - date) / 1000);
      if (diffSecs < 60) return 'Just now';
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      return `${Math.floor(diffSecs / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  }

  function cleanSnippet(snippet, title, publisher) {
    if (!snippet) return `Live breaking news coverage from ${publisher || 'verified sources'}.`;
    const cleaned = snippet
      .replace(/<[^>]*>/g, ' ')
      .replace(/&[a-z0-9#]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length < 15 || cleaned === title) {
      return `Real-time report published by ${publisher || 'news wire'} regarding "${title}". Fact-check with VerifyAI multi-agent engine.`;
    }
    return cleaned;
  }

  return (
    <div className="page-content fade-in">
      {/* Page Header */}
      <div className="page-header news-header">
        <div className="news-header-top">
          <div>
            <div className="badge badge-green" style={{ marginBottom: 8, padding: '4px 11px' }}>
              <span className="sonar-ping-dot" style={{ width: 6, height: 6 }} />
              <span>LIVE GOOGLE NEWS & WIKIPEDIA FEEDS</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em', margin: '4px 0 8px' }}>
              Global Real-Time News & <span className="hero-text-gradient">Fact Checker</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: 720 }}>
              Browse live breaking news and fact-check any headline across AI models, Wikipedia, and global sources in real time.
            </p>
          </div>
          <button
            className="btn btn-secondary refresh-btn"
            onClick={() => isSearching ? handleSearch({ preventDefault: () => {} }) : fetchNews(selectedCategory)}
            disabled={loading}
            title="Refresh news stream"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="news-search-form">
          <div className="news-search-box">
            <Search size={17} className="news-search-icon" />
            <input
              type="text"
              placeholder="Search live news claims, breaking events, entities, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="news-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="news-search-clear"
                onClick={() => {
                  setSearchQuery('');
                  fetchNews(selectedCategory);
                }}
              >
                ✕
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '7px 16px' }}>
              Search Live News
            </button>
          </div>
        </form>

        {/* Category Filter Pills */}
        {!isSearching && (
          <div className="news-categories">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(id)}
                className={`filter-chip ${selectedCategory === id ? 'filter-chip--active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Icon size={13} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="search-status-bar">
            <span>Showing search results for: <strong>"{searchQuery}"</strong></span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSearchQuery('');
                setIsSearching(false);
                fetchNews(selectedCategory);
              }}
            >
              Reset to Live Categories
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="news-error-banner card">
          <AlertCircle size={20} color="#EF4444" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#EF4444' }}>Unable to load news</strong>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{error}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => fetchNews(selectedCategory)}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton Grid */}
      {loading && (
        <div className="news-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card news-skeleton-card">
              <div className="skeleton-line" style={{ width: '35%', height: 16, marginBottom: 12 }} />
              <div className="skeleton-line" style={{ width: '90%', height: 20, marginBottom: 8 }} />
              <div className="skeleton-line" style={{ width: '75%', height: 16, marginBottom: 16 }} />
              <div className="skeleton-line" style={{ width: '100%', height: 36 }} />
            </div>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {!loading && articles.length > 0 && (
        <div className="news-grid">
          {articles.map((article) => {
            const pubStyle = getPublisherStyle(article.publisher);

            return (
              <div key={article.id || article.link} className="card news-card fade-in-up">
                <div className="news-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                    <span className={`badge ${pubStyle.badgeClass}`}>
                      {article.publisher || 'Verified News'}
                    </span>
                    {article.credible && (
                      <span className="badge badge-green" title="High-reputation verified wire source" style={{ fontSize: '0.6875rem' }}>
                        <ShieldCheck size={11} /> Trusted
                      </span>
                    )}
                    {(article.language === 'ta' || /[\u0B80-\u0BFF]/.test(article.title || '')) && (
                      <span className="badge badge-orange" style={{ fontSize: '0.6875rem' }}>தமிழ்</span>
                    )}
                  </div>
                  <span className="news-time">
                    <Clock size={12} style={{ marginRight: 4 }} />
                    {formatTimeAgo(article.publishedAt || article.pubDate)}
                  </span>
                </div>

                <h3 className="news-title">{article.title}</h3>

                <p className="news-snippet">{cleanSnippet(article.snippet, article.title, article.publisher)}</p>

                <div className="news-card-footer">
                  <a
                    href={article.link || article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-source-link"
                    title="Open original news report in new tab"
                  >
                    <span>Source Outlet</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor: pubStyle.color,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 650,
                      gap: 5
                    }}
                    onClick={() => handleVerifyArticle(article)}
                  >
                    <Plus size={13} strokeWidth={2.6} />
                    <span>Verify Claim</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && articles.length === 0 && (
        <div className="card news-empty-state">
          <Newspaper size={48} color="#8A9AB3" style={{ marginBottom: 12 }} />
          <h3 style={{ color: 'var(--primary-navy)' }}>No breaking articles found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try searching for a different topic or switch category filters.</p>
          <button
            className="btn btn-secondary"
            style={{ marginTop: 12 }}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              fetchNews('all');
            }}
          >
            Show All Breaking News
          </button>
        </div>
      )}

      <style>{`
        .news-header {
          margin-bottom: 24px;
        }

        .hero-text-gradient {
          background: linear-gradient(135deg, #00A88A 0%, #06B6D4 50%, #1687E8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        .news-header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 18px;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .news-search-form {
          margin-bottom: 16px;
        }

        .news-search-box {
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 5px 6px 5px 14px;
          gap: 10px;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }

        .news-search-box:focus-within {
          border-color: #06B6D4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }

        .news-search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .news-search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.9375rem;
          color: var(--primary-navy);
          background: transparent;
        }

        .news-search-clear {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 4px 6px;
        }

        .news-categories {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: thin;
        }

        .search-status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          background: #F0F9FF;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          color: #0284C7;
          border: 1px solid #BAE6FD;
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .news-card {
          display: flex;
          flex-direction: column;
          padding: 22px;
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .news-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: #CBD5E1;
        }

        .news-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .news-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }

        .news-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary-navy);
          line-height: 1.4;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .news-snippet {
          font-size: 0.845rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin-bottom: 16px;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .news-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 1px solid var(--border);
          margin-top: auto;
          gap: 10px;
        }

        .news-source-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.775rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.15s;
        }

        .news-source-link:hover {
          color: var(--primary-navy);
          text-decoration: underline;
        }

        .news-error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #FFF1F2;
          border: 1px solid #FECDD3;
          border-left: 4px solid #EF4444;
          margin-bottom: 20px;
        }

        .news-empty-state {
          text-align: center;
          padding: 48px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .news-skeleton-card {
          padding: 18px;
          background: #FFFFFF;
        }

        .skeleton-line {
          background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 640px) {
          .news-grid { grid-template-columns: 1fr; }
          .news-header-top { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
