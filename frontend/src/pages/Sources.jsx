import { useState, useEffect } from 'react';
import {
  Globe, Database, BookOpen, Filter, TrendingUp, Plus,
  Trash2, ExternalLink, X, Search, CheckCircle2,
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
  knowledge: BookOpen,
  ai: TrendingUp,
};

const RELIABILITY_COLORS = {
  high: { bg: 'rgba(22, 163, 74, 0.12)', text: '#16A34A', border: 'rgba(22, 163, 74, 0.25)', label: 'High' },
  medium: { bg: 'rgba(245, 158, 11, 0.12)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.25)', label: 'Medium' },
  low: { bg: 'rgba(220, 38, 38, 0.12)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.25)', label: 'Low' },
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
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Information Sources</h1>
          <p>Verified repositories, academic databases, and knowledge engines utilized during cross-verification.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setModalError(null); setIsModalOpen(true); }}
          style={{ gap: 7 }}
        >
          <Plus size={16} /> Add Custom Source
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
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

        <div style={{ position: 'relative', width: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="input"
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 30, paddingRight: 10, height: 36, fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : filteredSources.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 24px' }}>
          <div className="empty-state-icon"><Globe size={24} /></div>
          <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>No sources found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {searchQuery ? `No sources match "${searchQuery}"` : 'Try adding a custom source or adjusting your filter.'}
          </p>
        </div>
      ) : (
        <div className="table-container card">
          <table>
            <thead>
              <tr>
                <th>Source Name & Link</th>
                <th>Type</th>
                <th>Reliability Tier</th>
                <th>Usage Volume</th>
                <th>Last Consulted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.map((src) => {
                const TypeIcon = TYPE_ICONS[src.type] || Globe;
                const rel = RELIABILITY_COLORS[src.reliability] || RELIABILITY_COLORS.medium;
                const sid = src.id || src._id;
                const usage = src.usageCount ?? src.usage_count ?? 0;

                return (
                  <tr key={sid}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          background: 'var(--green-light)',
                          borderRadius: 9,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <TypeIcon size={17} color="var(--green-dark)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {src.name}
                            {src.url && (
                              <a
                                href={src.url.startsWith('http') ? src.url : `https://${src.url}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Open Source URL"
                                style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
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
                    <td>
                      <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                        {src.type}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: rel.bg, color: rel.text, borderColor: rel.border, fontWeight: 600 }}>
                        {rel.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="progress-bar" style={{ width: 64, flexShrink: 0 }}>
                          <div className="progress-fill" style={{ width: `${Math.min(100, (usage / 45) * 100)}%`, background: 'var(--green-primary)' }} />
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                          {usage}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {formatRelativeTime(src.lastUsed || src.last_used)}
                      </span>
                    </td>
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
                <Database size={18} color="var(--green-primary)" />
                <h3 style={{ fontSize: '1.0625rem' }}>Add Verification Source</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(false)} style={{ padding: 4 }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSource}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {modalError && <ErrorState message={modalError} compact />}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 550, marginBottom: 6 }}>
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
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 550, marginBottom: 6 }}>
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
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 550, marginBottom: 6 }}>
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
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 550, marginBottom: 6 }}>
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
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 550, marginBottom: 6 }}>
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
    </div>
  );
}
