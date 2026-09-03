import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Newspaper, Search, RefreshCw, ExternalLink, ShieldCheck,
  Globe, Sparkles, Zap, Flame, Clock, Radio, ChevronRight,
  TrendingUp, BookOpen, AlertCircle
} from 'lucide-react';
import { getLiveNews, searchNews } from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All Breaking', icon: Flame },
  { id: 'technology', label: 'Technology', icon: Zap },
  { id: 'world', label: 'World News', icon: Globe },
  { id: 'business', label: 'Business & Finance', icon: TrendingUp },
  { id: 'science', label: 'Science & Space', icon: Sparkles },
  { id: 'health', label: 'Health & Medicine', icon: ShieldCheck },
  { id: 'entertainment', label: 'Entertainment', icon: BookOpen },
  { id: 'sports', label: 'Sports', icon: Radio },
];

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
    // Navigate to verify page with pre-filled question
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

  return (
    <div className="page-content fade-in">
      {/* Page Header */}
      <div className="page-header news-header">
        <div className="news-header-top">
          <div>
            <div className="news-live-badge">
              <span className="live-pulse" />
              <span>LIVE GOOGLE NEWS & WIKIPEDIA FEEDS</span>
            </div>
            <h1>Global Real-Time News & Fact Checker</h1>
            <p>
              Browse live breaking news and fact-check any headline across AI models, Wikipedia, and global sources in real time.
            </p>
          </div>
          <button
            className="btn btn--secondary refresh-btn"
            onClick={() => isSearching ? handleSearch({ preventDefault: () => {} }) : fetchNews(selectedCategory)}
            disabled={loading}
            title="Refresh news stream"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="news-search-form">
          <div className="news-search-box">
            <Search size={18} className="news-search-icon" />
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
            <button type="submit" className="btn btn--primary news-search-submit">
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
                className={`news-cat-pill ${selectedCategory === id ? 'news-cat-pill--active' : ''}`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="search-status-bar">
            <span>Showing search results for: <strong>"{searchQuery}"</strong></span>
            <button
              className="btn btn--ghost btn--sm"
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
            <strong>Unable to load news</strong>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{error}</p>
          </div>
          <button className="btn btn--secondary btn--sm" onClick={() => fetchNews(selectedCategory)}>
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
          {articles.map((article) => (
            <div key={article.id || article.link} className="card news-card fade-in-up">
              <div className="news-card-header">
                <span className="news-publisher-tag">
                  {article.publisher || 'Verified News'}
                </span>
                <span className="news-time">
                  <Clock size={12} style={{ marginRight: 4 }} />
                  {formatTimeAgo(article.publishedAt || article.pubDate)}
                </span>
              </div>

              <h3 className="news-title">{article.title}</h3>

              <p className="news-snippet">{article.snippet}</p>

              <div className="news-card-footer">
                <a
                  href={article.link || article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-source-link"
                  title="Open original news report in new tab"
                >
                  <span>Source Outlet</span>
                  <ExternalLink size={13} />
                </a>

                <button
                  className="btn btn--primary btn--sm news-verify-btn"
                  onClick={() => handleVerifyArticle(article)}
                >
                  <ShieldCheck size={14} />
                  <span>Fact-Check News</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && articles.length === 0 && (
        <div className="card news-empty-state">
          <Newspaper size={48} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3>No breaking articles found</h3>
          <p>Try searching for a different topic or switch category filters.</p>
          <button
            className="btn btn--secondary"
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

        .news-header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 18px;
        }

        .news-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ECFDF5;
          color: #059669;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid #A7F3D0;
          margin-bottom: 8px;
        }

        .live-pulse {
          width: 7px;
          height: 7px;
          background: #10B981;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse-ring 1.8s infinite;
        }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
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
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 4px 6px 4px 14px;
          gap: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          transition: all 0.2s ease;
        }

        .news-search-box:focus-within {
          border-color: var(--green-primary);
          box-shadow: 0 0 0 3px rgba(25, 196, 99, 0.15);
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
          color: var(--text-primary);
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

        .news-search-submit {
          padding: 8px 16px;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .news-categories {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
        }

        .news-cat-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .news-cat-pill:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .news-cat-pill--active {
          background: var(--green-primary);
          color: #fff;
          border-color: var(--green-primary);
          box-shadow: 0 2px 8px rgba(25, 196, 99, 0.3);
        }

        .search-status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--bg-subtle);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 18px;
        }

        .news-card {
          display: flex;
          flex-direction: column;
          padding: 18px;
          transition: transform 0.2s, box-shadow 0.2s;
          border-left: 3px solid transparent;
        }

        .news-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-left-color: var(--green-primary);
        }

        .news-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .news-publisher-tag {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--green-dark);
          background: var(--green-light);
          padding: 3px 8px;
          border-radius: 6px;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .news-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }

        .news-title {
          font-size: 0.985rem;
          font-weight: 650;
          color: var(--text-primary);
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
          line-height: 1.5;
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
          padding-top: 12px;
          border-top: 1px solid var(--border-light);
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
          color: var(--text-primary);
          text-decoration: underline;
        }

        .news-verify-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 0.8125rem;
        }

        .news-error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
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
        }

        .skeleton-line {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 640px) {
          .news-grid {
            grid-template-columns: 1fr;
          }
          .news-header-top {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
