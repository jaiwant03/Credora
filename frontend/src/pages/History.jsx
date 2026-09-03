import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Eye, ShieldCheck, Filter, ArrowUpDown,
  Download, Trash2, X, AlertCircle
} from 'lucide-react';
import { getVerifications, deleteVerification } from '../services/api';
import StatusBadge from '../components/ui/StatusBadge';
import ConfidenceScore from '../components/ui/ConfidenceScore';
import { SkeletonTable } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { formatRelativeTime, truncateText, formatClassification } from '../utils/formatters';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Conflict Resolved', value: 'conflict_resolved' },
  { label: 'Low Confidence', value: 'low_confidence' },
  { label: 'Unable to Verify', value: 'unable_to_verify' },
];

export default function History() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifications, setVerifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest_conf, lowest_conf

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVerifications({
        status: activeFilter === 'all' ? undefined : activeFilter,
        search: search || undefined,
        limit: 100,
      });
      setVerifications(data.verifications || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, search]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
  }

  function handleExportAll() {
    if (verifications.length === 0) return;
    const blob = new Blob([JSON.stringify(verifications, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verifyai-history-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVerification(deleteTarget.id || deleteTarget._id);
      setVerifications(prev => prev.filter(v => v.id !== deleteTarget.id && v._id !== deleteTarget._id));
      setTotal(prev => Math.max(0, prev - 1));
      setDeleteTarget(null);
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  }

  // Client-side sorting for responsive instant UI updates
  const sortedVerifications = [...verifications].sort((a, b) => {
    const scoreA = a.confidenceScore ?? a.confidence ?? 0;
    const scoreB = b.confidenceScore ?? b.confidence ?? 0;
    const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
    const timeB = new Date(b.createdAt || b.created_at || 0).getTime();

    if (sortBy === 'newest') return timeB - timeA;
    if (sortBy === 'oldest') return timeA - timeB;
    if (sortBy === 'highest_conf') return scoreB - scoreA;
    if (sortBy === 'lowest_conf') return scoreA - scoreB;
    return 0;
  });

  return (
    <div className="page-content fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Verification History</h1>
          <p>Review, search, and analyze previously fact-checked questions and multi-agent reports.</p>
        </div>
        {verifications.length > 0 && (
          <button className="btn btn-secondary" onClick={handleExportAll} style={{ gap: 7 }}>
            <Download size={15} /> Export History (JSON)
          </button>
        )}
      </div>

      {/* Search + filter + sort toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 300px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                className="input"
                placeholder="Search questions or answers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ paddingLeft: 32, height: 38 }}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ height: 38 }}>
              Search
            </button>
            {search && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setSearch(''); setSearchInput(''); }}
                style={{ color: 'var(--text-muted)' }}
              >
                Clear
              </button>
            )}
          </form>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 170, height: 38, fontSize: '0.8125rem', padding: '6px 10px' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_conf">Highest Confidence</option>
              <option value="lowest_conf">Lowest Confidence</option>
            </select>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Filter size={13} style={{ color: 'var(--text-muted)' }} />
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              className={`filter-chip ${activeFilter === value ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results meta */}
      {!loading && !error && (
        <div style={{ marginBottom: 12, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Showing {sortedVerifications.length} of {total} verifications
          {search && ` matching "${search}"`}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <SkeletonTable rows={8} cols={5} />
      ) : sortedVerifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div className="empty-state-icon"><ShieldCheck size={26} color="var(--green-primary)" /></div>
          <h3 style={{ fontSize: '1.0625rem', marginBottom: 6 }}>No verifications found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
            {search ? `No records found for query "${search}".` : 'Start by asking a question to verify accuracy.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/verify')}>
            Verify a Question
          </button>
        </div>
      ) : (
        <div className="table-container card">
          <table>
            <thead>
              <tr>
                <th>Question & Category</th>
                <th>Status</th>
                <th>Confidence</th>
                <th>Verified Answer Preview</th>
                <th>Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedVerifications.map((v) => {
                const vid = v.id || v._id;
                const score = v.confidenceScore ?? v.confidence ?? 0;
                return (
                  <tr key={vid} style={{ cursor: 'pointer' }} onClick={() => navigate(`/history/${vid}`)}>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {v.question}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="badge badge-gray" style={{ fontSize: '0.6875rem' }}>
                            {formatClassification(v.classification)}
                          </span>
                          {v.conflictDetected && (
                            <span className="badge badge-yellow" style={{ fontSize: '0.6875rem' }}>
                              Conflict Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={v.status} size="sm" />
                    </td>
                    <td>
                      <ConfidenceScore score={score} level={v.confidenceLevel} size="sm" />
                    </td>
                    <td style={{ maxWidth: 320 }}>
                      <p style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                        marginBottom: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {v.finalAnswer || v.final_answer || v.answer}
                      </p>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatRelativeTime(v.createdAt || v.created_at)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/history/${vid}`)}
                          title="View detailed report"
                          style={{ padding: 6 }}
                        >
                          <Eye size={14} color="var(--text-secondary)" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteTarget(v)}
                          title="Delete verification"
                          style={{ padding: 6, color: 'var(--error)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trash2 size={18} color="var(--error)" />
                <h3 style={{ fontSize: '1.0625rem' }}>Delete Verification</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)} style={{ padding: 4 }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Are you sure you want to delete this verification record?
              </p>
              <div style={{ padding: '10px 12px', background: 'var(--bg-gray)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  "{deleteTarget.question}"
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
