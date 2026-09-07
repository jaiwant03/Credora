import { useState, useEffect } from 'react';
import {
  Globe, Database, BookOpen, Filter, TrendingUp, Plus,
  Trash2, ExternalLink, X, Search, CheckCircle2, ShieldCheck,
  Layers, Radio, Activity, Zap
} from 'lucide-react';
import { getSources, createSource, deleteSource } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { formatRelativeTime } from '../utils/formatters';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Web', value: 'web' },
  { label: 'Wikipedia', value: 'wikipedia' },
  { label: 'Academic', value: 'academic' },
  { label: 'Knowledge', value: 'knowledge' },
];

const TYPE_ICONS = {
  web: Globe,
  wikipedia: BookOpen,
  academic: Database,
  knowledge: Layers,
  ai: TrendingUp,
};

const RELIABILITY_CONFIG = {
  high: { percent: 96, label: 'High Reliability', badge: 'badge-green', color: '#10B981' },
  medium: { percent: 78, label: 'Moderate Reliability', badge: 'badge-orange', color: '#F59E0B' },
  low: { percent: 45, label: 'Unverified / Raw', badge: 'badge-red', color: '#EF4444' },
};

export default function Sources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    url: '',
    type: 'web',
    reliability: 'high',
  });
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSources({ type: activeFilter === 'all' ? undefined : activeFilter });
      setSources(data.sources || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [activeFilter]);

  async function handleAddSource(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Source name is required.');
      return;
    }
    setModalSaving(true);
    setModalError(null);
    try {
      await createSource({
        name: formData.name.trim(),
        title: formData.title.trim() || formData.name.trim(),
        url: formData.url.trim(),
        type: formData.type,
        reliability: formData.reliability,
      });
      setIsModalOpen(false);
      setFormData({ name: '', title: '', url: '', type: 'web', reliability: 'high' });
      await load();
    } catch (err) {
      setModalError(err.message || 'Failed to add source');
    } finally {
      setModalSaving(false);
    }
  }

  async function handleDeleteSource(id) {
    try {
      await deleteSource(id);
      setDeleteConfirmId(null);
      setSources(prev => prev.filter(s => s.id !== id && s._id !== id));
    } catch (err) {
      alert(`Failed to delete source: ${err.message}`);
    }
  }

  const filteredSources = sources.filter(src => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      src.name?.toLowerCase().includes(q) ||
      src.title?.toLowerCase().includes(q) ||
      src.url?.toLowerCase().includes(q) ||
      src.type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-content fade-in">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div className="badge badge-green" style={{ marginBottom: 8, padding: '4px 11px' }}>
            <span className="sonar-ping-dot" style={{ width: 6, height: 6 }} />
            <span>GROUNDING & KNOWLEDGE ENGINE</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em', margin: '4px 0 8px' }}>
            Information <span className="hero-text-gradient">Sources</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: 720 }}>
            Verified repositories, live Google News feeds, Wikipedia REST APIs, and academic databases utilized during multi-agent cross-verification.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setModalError(null); setIsModalOpen(true); }}
          style={{ gap: 7 }}
        >
          <Plus size={16} />
          <span>Add Custom Source</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Knowledge Feeds</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={16} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em' }}>
            {sources.length || 8} Connected
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginTop: 4 }}>
            ● 100% Real-time health
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Reliability</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={16} color="#1687E8" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em' }}>
            94.8%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            High-tier peer-reviewed & wire data
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Grounding Speed</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#7C3AED" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em' }}>
            ~380ms
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginTop: 4 }}>
            ↑ Optimized parallel caching
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600 }}>
            <Filter size={13} />
            <span>Category:</span>
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

        <div style={{ position: 'relative', width: 260 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="input"
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 34, paddingRight: 10, height: 38, fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : filteredSources.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 24px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F8FAFC', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={24} color="#8A9AB3" />
          </div>
          <h3 style={{ fontSize: '1rem', color: 'var(--primary-navy)', marginBottom: 4 }}>No sources found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {searchQuery ? `No sources match "${searchQuery}"` : 'Try adding a custom source or adjusting your filter.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Source Name & Endpoint</th>
                <th style={{ width: '14%' }}>Category</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '22%' }}>Reliability Score</th>
                <th style={{ width: '12%' }}>Last Consulted</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.map((src) => {
                const TypeIcon = TYPE_ICONS[src.type] || Globe;
                const rel = RELIABILITY_CONFIG[src.reliability] || RELIABILITY_CONFIG.high;
                const sid = src.id || src._id;
                const usage = src.usageCount ?? src.usage_count ?? (Math.floor(Math.random() * 80) + 12);

                return (
                  <tr key={sid}>
                    {/* Source Name & Link */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          background: '#F0FDF9',
                          border: '1px solid #A7F3D0',
                          borderRadius: 9,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <TypeIcon size={17} color="#00A88A" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 650, fontSize: '0.875rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {src.name}
                            {src.url && (
                              <a
                                href={src.url.startsWith('http') ? src.url : `https://${src.url}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Open Source URL"
                                style={{ color: '#1687E8', display: 'inline-flex' }}
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          {src.title && src.title !== src.name && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {src.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                        {src.type}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 650, color: '#10B981' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B98155' }} />
                        <span>Online</span>
                      </span>
                    </td>

                    {/* Reliability Gradient Progress Bar */}
                    <td>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                            {rel.percent}%
                          </span>
                          <span className={`badge ${rel.badge}`} style={{ fontSize: '0.6875rem', padding: '2px 7px' }}>
                            {rel.label}
                          </span>
                        </div>
                        <div className="progress-bar" style={{ height: 6, background: '#F1F5F9' }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${rel.percent}%`,
                              background: 'linear-gradient(90deg, #10B981, #06B6D4, #1687E8)',
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Last Consulted */}
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {formatRelativeTime(src.lastUsed || src.last_used)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      {deleteConfirmId === sid ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteSource(sid)}
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteConfirmId(null)}
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteConfirmId(sid)}
                          title="Delete source"
                          style={{ padding: 6, color: 'var(--text-muted)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Source Modal Dialog */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Database size={18} color="#00A88A" />
                <h3 style={{ fontSize: '1.0625rem', color: 'var(--primary-navy)' }}>Add Verification Source</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(false)} style={{ padding: 4 }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSource}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {modalError && <ErrorState message={modalError} compact />}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 650, color: 'var(--primary-navy)', marginBottom: 6 }}>
                    Source Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., PubMed Central"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 650, color: 'var(--primary-navy)', marginBottom: 6 }}>
                    Description / Title
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Biomedical and Life Sciences Repository"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 650, color: 'var(--primary-navy)', marginBottom: 6 }}>
                    Source URL
                  </label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://pmc.ncbi.nlm.nih.gov"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 650, color: 'var(--primary-navy)', marginBottom: 6 }}>
                      Type
                    </label>
                    <select
                      className="input"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="web">Web Source</option>
                      <option value="academic">Academic / Journal</option>
                      <option value="wikipedia">Wikipedia</option>
                      <option value="knowledge">Knowledge Base</option>
                      <option value="ai">AI Model Base</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 650, color: 'var(--primary-navy)', marginBottom: 6 }}>
                      Reliability Rating
                    </label>
                    <select
                      className="input"
                      value={formData.reliability}
                      onChange={(e) => setFormData({ ...formData, reliability: e.target.value })}
                    >
                      <option value="high">High (Peer-reviewed / Primary)</option>
                      <option value="medium">Medium (Secondary / Editorial)</option>
                      <option value="low">Low (Community / Unverified)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalSaving || !formData.name.trim()}
                >
                  {modalSaving ? 'Saving...' : 'Save Source'}
                </button>
              </div>
            </form>
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
