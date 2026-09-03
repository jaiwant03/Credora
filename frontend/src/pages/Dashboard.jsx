import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, TrendingUp, AlertTriangle, BarChart2,
  ArrowRight, Plus, Eye, Newspaper, Flame, ExternalLink,
  Clock, Zap
} from 'lucide-react';
import { getVerifications, getAnalytics, getLiveNews } from '../services/api';
import StatusBadge from '../components/ui/StatusBadge';
import ConfidenceScore from '../components/ui/ConfidenceScore';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { formatRelativeTime, truncateText } from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, verifData, newsData] = await Promise.allSettled([
        getAnalytics(),
        getVerifications({ limit: 8 }),
        getLiveNews('all', 4),
      ]);

      if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value);
      if (verifData.status === 'fulfilled') setVerifications(verifData.value.verifications || []);
      if (newsData.status === 'fulfilled') setTrendingNews(newsData.value.articles || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  const statsCards = analytics ? [
    {
      label: 'Total Questions',
      value: analytics.summary.total,
      icon: BarChart2,
      color: '#667085',
      bg: '#F9FAFB',
    },
    {
      label: 'Verified Answers',
      value: analytics.summary.verified,
      icon: ShieldCheck,
      color: '#19C463',
      bg: '#F0FDF4',
    },
    {
      label: 'Conflicts Detected',
      value: analytics.summary.conflicts,
      icon: AlertTriangle,
      color: '#F59E0B',
      bg: '#FFFBEB',
    },
    {
      label: 'Avg Confidence',
      value: `${analytics.summary.avgConfidence}%`,
      icon: TrendingUp,
      color: '#19C463',
      bg: '#F0FDF4',
    },
  ] : [];

  function handleVerifyNews(article) {
    navigate('/verify', {
      state: { initialQuestion: `Is it true: "${article.title}"?`, autoSubmit: true }
    });
  }

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 4 }}>{greeting}</p>
          <h1 style={{ marginBottom: 4 }}>AI Verification Overview</h1>
          <p style={{ fontSize: '0.875rem' }}>
            Fact-check claims against real-time Google News, Wikipedia Open API, and Multi-Agent AI.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn--secondary" onClick={() => navigate('/news')}>
            <Newspaper size={15} color="var(--green-primary)" />
            <span>Live News Feed</span>
          </button>
          <button className="btn btn--primary" onClick={() => navigate('/verify')}>
            <Plus size={15} />
            <span>Verify Question</span>
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      {/* Stats Cards */}
      <div className="stats-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: 20 }}>
                <Skeleton height={16} width={100} />
                <Skeleton height={32} width={60} radius={4} style={{ marginTop: 12 }} />
              </div>
            ))
          : statsCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card stat-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>
                      {label}
                    </p>
                    <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                      {value}
                    </div>
                  </div>
                  <div style={{
                    width: 38, height: 38, background: bg, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={color} />
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {/* Live Breaking News Spotlight */}
      {trendingNews.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={18} color="#EF4444" />
              <h3 style={{ margin: 0 }}>Trending News to Fact-Check</h3>
              <span className="badge badge-green" style={{ fontSize: '0.6875rem' }}>Live Google News</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/news')}>
              View All News <ArrowRight size={13} />
            </button>
          </div>

          <div className="trending-news-grid">
            {trendingNews.map((article) => (
              <div key={article.id || article.link} className="card trending-card">
                <div className="trending-card-meta">
                  <span className="trending-publisher">{article.publisher}</span>
                  <button
                    className="btn btn--primary btn--sm trending-verify-btn"
                    onClick={() => handleVerifyNews(article)}
                  >
                    <ShieldCheck size={13} />
                    <span>Verify</span>
                  </button>
                </div>
                <h4 className="trending-title">{truncateText(article.title, 80)}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Verifications */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3>Recent Verifications</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--secondary btn-sm" onClick={() => navigate('/history')}>
              View All <ArrowRight size={13} />
            </button>
            <button className="btn btn--primary btn-sm" onClick={() => navigate('/verify')}>
              <Plus size={13} /> Verify New
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {['Question', 'Status', 'Confidence', 'Sources', 'Date', ''].map(h => (
                    <th key={h}><Skeleton height={12} width={60} /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton height={13} width="80%" /></td>
                    <td><Skeleton height={22} width={80} radius={999} /></td>
                    <td><Skeleton height={13} width={50} /></td>
                    <td><Skeleton height={13} width={60} /></td>
                    <td><Skeleton height={13} width={60} /></td>
                    <td><Skeleton height={28} width={50} radius={6} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : verifications.length === 0 ? (
          <div className="card" style={{ padding: 0 }}>
            <div className="empty-state">
              <div className="empty-state-icon">
                <ShieldCheck size={22} />
              </div>
              <p style={{ fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
                No verifications yet
              </p>
              <button className="btn btn--primary btn-sm" onClick={() => navigate('/verify')}>
                <Plus size={13} /> Ask your first question
              </button>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Status</th>
                  <th>Confidence</th>
                  <th>Sources</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((v) => (
                  <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/history/${v.id}`)}>
                    <td>
                      <span style={{ fontWeight: 450, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        {truncateText(v.question, 65)}
                      </span>
                    </td>
                    <td><StatusBadge status={v.status} /></td>
                    <td>
                      <ConfidenceScore score={v.confidence} level={v.confidenceLevel} size="sm" showBar={false} />
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {Array.isArray(v.sources) ? `${v.sources.length} sources` : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {formatRelativeTime(v.createdAt)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/history/${v.id}`); }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .stat-card {
          transition: box-shadow 0.15s, transform 0.15s;
        }
        .stat-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .trending-news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 14px;
        }

        .trending-card {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-left: 3px solid var(--green-primary);
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .trending-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .trending-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .trending-publisher {
          font-size: 0.725rem;
          font-weight: 600;
          color: var(--green-dark);
          background: var(--green-light);
          padding: 2px 7px;
          border-radius: 4px;
        }

        .trending-verify-btn {
          padding: 4px 9px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .trending-title {
          font-size: 0.855rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.45;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
