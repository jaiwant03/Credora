import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Eye, ShieldCheck, Filter, ArrowUpDown,
  Download, Trash2, X, AlertCircle, CheckCircle2,
  Clock, Link2, MoreVertical
} from 'lucide-react';
import { getVerifications, deleteVerification, clearAllVerifications } from '../services/api';
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
  const [sortBy, setSortBy] = useState('newest');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

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
      setToastMsg('Record deleted successfully');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  }

  async function handleConfirmClearAll() {
    setClearingAll(true);
    try {
      await clearAllVerifications();
      setVerifications([]);
      setTotal(0);
      setShowClearAllModal(false);
      setToastMsg('All verification history permanently cleared');
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      alert(`Failed to clear history: ${err.message}`);
    } finally {
      setClearingAll(false);
    }
  }

  // Client-side sorting
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
      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} color="#10B981" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em', marginBottom: 6 }}>
            Verification <span className="hero-text-gradient">History</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Review, search, and analyze previously fact-checked questions and multi-agent reports.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {verifications.length > 0 && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setShowClearAllModal(true)}
                style={{ color: '#EF4444', borderColor: '#FECDD3', gap: 6 }}
                title="Permanently remove all history records"
              >
                <Trash2 size={14} color="#EF4444" />
                <span>Clear All History</span>
              </button>
              <button className="btn btn-secondary" onClick={handleExportAll} style={{ gap: 7 }}>
                <Download size={15} color="#1687E8" />
                <span>Export History (JSON)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search + Filter + Sort Toolbar */}
      <div className="card" style={{ padding: 18, marginBottom: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 320px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                className="input"
                placeholder="Search questions or answers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ paddingLeft: 34, height: 40 }}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ height: 40, padding: '0 16px' }}>
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
              style={{ width: 175, height: 40, fontSize: '0.8125rem', padding: '6px 12px' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_conf">Highest Confidence</option>
              <option value="lowest_conf">Lowest Confidence</option>
            </select>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600 }}>
            <Filter size={13} />
            <span>Filter:</span>
          </div>
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
          Showing <strong>{sortedVerifications.length}</strong> of {total} verifications
          {search && ` matching "${search}"`}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <SkeletonTable rows={8} cols={5} />
      ) : sortedVerifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#ECFDF5', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={28} color="#10B981" />
          </div>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-navy)', marginBottom: 6 }}>No verifications found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 18 }}>
            {search ? `No records found for query "${search}".` : 'Start by asking a question to verify accuracy.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/verify')}>
            Verify a Question
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '38%' }}>Question & Topic</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '14%' }}>Confidence</th>
                <th style={{ width: '22%' }}>Verified Answer Preview</th>
                <th style={{ width: '8%' }}>Time</th>
                <th style={{ width: '6%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedVerifications.map((v) => {
                const vid = v.id || v._id;
                const score = v.confidenceScore ?? v.confidence ?? 0;
                return (
                  <tr key={vid} style={{ cursor: 'pointer' }} onClick={() => navigate(`/history/${vid}`)}>
                    {/* Question */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontWeight: 650, color: 'var(--primary-navy)', lineHeight: 1.4, fontSize: '0.875rem' }}>
                          {v.question}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="badge badge-gray" style={{ fontSize: '0.6875rem' }}>
                            {formatClassification(v.classification)}
                          </span>
                          {v.conflictDetected && (
                            <span className="badge badge-orange" style={{ fontSize: '0.6875rem' }}>
                              Conflict Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Dot */}
                    <td>
                      <StatusBadge status={v.status} size="sm" variant="dot" />
                    </td>

                    {/* Radial Confidence Score */}
                    <td>
                      <ConfidenceScore score={score} level={v.confidenceLevel} size="sm" variant="radial" />
                    </td>

                    {/* Answer Preview */}
                    <td>
                      <p style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {v.finalAnswer || v.final_answer || v.answer}
                      </p>
                    </td>

                    {/* Time */}
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatRelativeTime(v.createdAt || v.created_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/history/${vid}`)}
                          title="View detailed report"
                          style={{ padding: '6px 8px' }}
                        >
                          <Eye size={14} color="#1687E8" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteTarget(v)}
                          title="Delete verification"
                          style={{ padding: '6px 8px', color: '#EF4444' }}
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
                <Trash2 size={18} color="#EF4444" />
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
              <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--primary-navy)' }}>
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

      {/* Clear All Confirmation Modal */}
      {showClearAllModal && (
        <div className="modal-backdrop" onClick={() => setShowClearAllModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trash2 size={18} color="#EF4444" />
                <h3 style={{ fontSize: '1.0625rem' }}>Clear All History</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowClearAllModal(false)} style={{ padding: 4 }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Are you sure you want to permanently delete <strong>all {total}</strong> verification records from the database? This action cannot be undone.
              </p>
              <div style={{ padding: '10px 12px', background: '#FFF1F2', borderRadius: 8, border: '1px solid #FECDD3' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={15} /> All verification records and cached findings will be wiped.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowClearAllModal(false)} disabled={clearingAll}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmClearAll} disabled={clearingAll}>
                {clearingAll ? 'Clearing All...' : 'Yes, Clear All History'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hero-text-gradient {
          background: linear-gradient(135deg, #00A88A 0%, #06B6D4 50%, #1687E8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
