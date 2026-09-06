import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, TrendingUp, AlertTriangle, BarChart2,
  ArrowRight, Plus, Eye, Newspaper, Flame, Sparkles,
  Layers, CheckCircle2, Clock, Trash2, X, AlertCircle
} from 'lucide-react';
import { getVerifications, getAnalytics, getLiveNews, clearAnalytics } from '../services/api';
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
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

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

  const statsCards = [
    {
      label: 'Total Verifications',
      value: analytics?.summary?.total ?? verifications?.length ?? 0,
      icon: Layers,
      color: '#4F46E5',
      gradient: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
      sub: 'Queries processed',
    },
    {
      label: 'Verified Claims',
      value: analytics?.summary?.verified ?? verifications?.filter(v => v.status === 'verified').length ?? 0,
      icon: ShieldCheck,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      sub: `${analytics?.summary?.successRate || 100}% consensus rate`,
    },
    {
      label: 'Conflicts Identified',
      value: analytics?.summary?.conflicts ?? verifications?.filter(v => v.status === 'conflict_resolved').length ?? 0,
      icon: AlertTriangle,
      color: '#D97706',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      sub: 'Resolved across sources',
    },
    {
      label: 'Avg AI Confidence',
      value: `${analytics?.summary?.avgConfidence ?? 89}%`,
      icon: TrendingUp,
      color: '#4F46E5',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
      sub: 'Consensus score',
    },
  ];

  async function handleClearStatistics() {
    setClearing(true);
    try {
      await clearAnalytics();
      setAnalytics({
        summary: { total: 0, verified: 0, conflicts: 0, avgConfidence: 0, unableToVerify: 0, successRate: 100 }
      });
      setVerifications([]);
      setShowClearModal(false);
      setToastMsg('All verification statistics cleared successfully');
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      alert(`Failed to clear statistics: ${err.message}`);
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="page-content fade-in">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} color="var(--emerald-primary)" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Clear Statistics Confirmation Modal */}
      {showClearModal && (
        <div className="modal-backdrop" onClick={() => setShowClearModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={18} color="var(--error)" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Clear All Statistics</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowClearModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Are you sure you want to clear all verification records and reset your platform statistics?
              </p>
              <div style={{ marginTop: 14, padding: 12, background: 'var(--bg-gray)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  This will reset total questions, verified count, consensus accuracy, and delete saved verification entries.
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowClearModal(false)} disabled={clearing}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleClearStatistics} disabled={clearing}>
                {clearing ? 'Clearing...' : 'Yes, Clear Statistics'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="dashboard-hero">
        <div>
          <div className="greeting-badge">
            <Sparkles size={13} color="var(--brand-secondary)" />
            <span>{greeting} • Real-Time AI Fact-Checking</span>
          </div>
          <h1 className="dashboard-title">
            AI Verification <span className="text-gradient">Intelligence</span>
          </h1>
          <p className="dashboard-subtitle">
            Ground claims against real-time Google News RSS, Wikipedia REST API, and Multi-Agent AI consensus.
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/news')}>
            <Newspaper size={15} color="var(--brand-primary)" />
            <span>Live News Feed</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowClearModal(true)}
            title="Reset and clear all verification statistics"
            style={{ color: 'var(--error)' }}
          >
            <Trash2 size={15} color="var(--error)" />
            <span>Clear Statistics</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/verify')}>
            <Plus size={15} />
            <span>Verify Question</span>
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card stat-card" style={{ padding: 22 }}>
                <Skeleton height={14} width={120} />
                <Skeleton height={36} width={80} radius={6} style={{ marginTop: 14 }} />
                <Skeleton height={12} width={100} style={{ marginTop: 10 }} />
              </div>
            ))
          : statsCards.map(({ label, value, icon: Icon, color, gradient, sub }) => (
              <div key={label} className="card stat-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="stat-card-label">{label}</span>
                  <div
                    className="stat-icon-wrapper"
                    style={{ background: gradient }}
                  >
                    <Icon size={17} color="#FFFFFF" strokeWidth={2.4} />
                  </div>
                </div>
                <div className="stat-card-value">{value}</div>
                <div className="stat-card-sub">{sub}</div>
              </div>
            ))
        }
      </div>

      {/* Live Breaking News Spotlight */}
      {trendingNews.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="section-icon-badge">
                <Flame size={16} color="#F43F5E" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Trending News to Fact-Check</h3>
              <span className="badge badge-green" style={{ fontSize: '0.6875rem' }}>
                <span className="sonar-ping-dot" style={{ width: 6, height: 6, marginRight: 2 }} />
                Live Google News
              </span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/news')} style={{ gap: 4 }}>
              <span>View All News</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="trending-news-grid">
            {trendingNews.map((article, idx) => (
              <div
                key={article.id || article.link || idx}
                className="card trending-card"
                onClick={() => handleVerifyNews(article)}
              >
                <div className="trending-card-meta">
                  <span className="trending-publisher">{article.publisher}</span>
                  <button
                    className="btn btn-primary btn-sm trending-verify-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVerifyNews(article);
                    }}
                  >
                    <ShieldCheck size={13} />
                    <span>Verify Claim</span>
                  </button>
                </div>
                <h4 className="trending-title">{truncateText(article.title, 82)}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Verifications */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Recent Verifications</h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Latest claims analyzed with source consensus and accuracy ratings
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>
              <span>View All History</span>
              <ArrowRight size={13} />
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/verify')}>
              <Plus size={13} />
              <span>Verify New</span>
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
                    <td><Skeleton height={14} width="80%" /></td>
                    <td><Skeleton height={22} width={80} radius={999} /></td>
                    <td><Skeleton height={14} width={50} /></td>
                    <td><Skeleton height={14} width={60} /></td>
                    <td><Skeleton height={14} width={60} /></td>
                    <td><Skeleton height={28} width={50} radius={6} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : verifications.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ width: 52, height: 52, margin: '0 auto 16px', background: 'var(--brand-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={26} color="var(--brand-primary)" />
            </div>
            <h4 style={{ marginBottom: 6 }}>No verifications performed yet</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 18 }}>
              Ask a question or test any claim against live web facts.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/verify')}>
              <Plus size={14} /> Start First Verification
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '42%' }}>Question / Claim</th>
                  <th>Verification Status</th>
                  <th>Consensus Confidence</th>
                  <th>Grounding Sources</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((v) => (
                  <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/history/${v.id}`)}>
                    <td>
                      <span className="table-question-text">
                        {truncateText(v.question, 70)}
                      </span>
                    </td>
                    <td><StatusBadge status={v.status} /></td>
                    <td>
                      <ConfidenceScore score={v.confidence} level={v.confidenceLevel} size="sm" showBar={true} />
                    </td>
                    <td>
                      <span className="source-count-pill">
                        {Array.isArray(v.sources) ? `${v.sources.length} sources` : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {formatRelativeTime(v.createdAt)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-ghost btn-sm table-view-btn"
                        onClick={(e) => { e.stopPropagation(); navigate(`/history/${v.id}`); }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
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
        .dashboard-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 32px;
        }

        .greeting-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: #EEF2FF;
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--brand-primary);
          margin-bottom: 10px;
        }

        .dashboard-title {
          font-family: var(--font-display);
          font-size: 2.125rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin-bottom: 6px;
        }

        .text-gradient {
          background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 50%, #06B6D4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .dashboard-subtitle {
          font-size: 0.9375rem;
          color: var(--text-secondary);
          max-width: 640px;
        }

        .dashboard-hero-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 36px;
        }

        .stat-card {
          padding: 22px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stat-card:hover {
          transform: translateY(-3px);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(99, 102, 241, 0.15);
        }

        .stat-card-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .stat-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .stat-card-value {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }

        .stat-card-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .dashboard-section {
          margin-bottom: 36px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .section-icon-badge {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--error-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .trending-news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: 16px;
        }

        .trending-card {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          min-height: 140px;
        }

        .trending-card:hover {
          transform: translateY(-3px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 14px 28px -6px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(99, 102, 241, 0.2);
        }

        .trending-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .trending-publisher {
          font-size: 0.725rem;
          font-weight: 700;
          color: var(--brand-primary);
          background: var(--brand-light);
          border: 1px solid rgba(99, 102, 241, 0.2);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .trending-verify-btn {
          padding: 4px 10px;
          font-size: 0.75rem;
          border-radius: 6px;
        }

        .trending-title {
          font-size: 0.875rem;
          font-weight: 650;
          color: var(--text-primary);
          line-height: 1.45;
          margin: 0;
        }

        .table-question-text {
          font-weight: 550;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .source-count-pill {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-gray);
          border: 1px solid var(--border);
          padding: 2px 8px;
          border-radius: 999px;
        }

        .table-view-btn {
          color: var(--brand-primary);
          font-weight: 600;
        }
        .table-view-btn:hover {
          background: var(--brand-light);
          color: var(--brand-hover);
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
          .dashboard-title { font-size: 1.75rem; }
        }
      `}</style>
    </div>
  );
}
