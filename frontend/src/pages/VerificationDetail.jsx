import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, AlertTriangle, Brain,
  Globe, BarChart2, ShieldCheck, XCircle,
  ChevronDown, ChevronUp, Tag, Copy, Check,
  Share2, Download, Trash2, X, FileText
} from 'lucide-react';
import { getVerificationById, deleteVerification } from '../services/api';
import StatusBadge from '../components/ui/StatusBadge';
import ConfidenceScore from '../components/ui/ConfidenceScore';
import { SkeletonCard } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { formatDate, formatClassification } from '../utils/formatters';

const STEP_ICONS = {
  classification: Tag,
  primary_answer: Brain,
  verification: ShieldCheck,
  conflict_detection: AlertTriangle,
  additional_verification: Globe,
  confidence: BarChart2,
  final_answer: CheckCircle,
};

export default function VerificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [techOpen, setTechOpen] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await getVerificationById(id);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  function handleCopyAnswer() {
    if (!data?.finalAnswer && !data?.answer) return;
    navigator.clipboard.writeText(data.finalAnswer || data.answer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2500);
  }

  function generateMarkdownReport() {
    if (!data) return '';
    const score = data.confidenceScore ?? data.confidence ?? 0;
    const sources = (data.sources || []).map(s => `- ${typeof s === 'string' ? s : s.name}`).join('\n');
    const verifiers = (data.verifierDetails || []).map(v => 
      `- **${v.provider}** (${v.role || 'Verifier'}): ${v.agreement ? '✅ Agrees' : '⚠️ Disagrees'} (${Math.round((v.confidence || 0) * 100)}%) — ${v.reason || 'Verified'}`
    ).join('\n');

    return `# VerifyAI Verification Report

**Question:** ${data.question}
**Date:** ${formatDate(data.createdAt)}
**Status:** ${data.status}
**Confidence Score:** ${score}% (${data.confidenceLevel || 'High'})
**Category:** ${formatClassification(data.classification)}

---

### Verified Final Answer
${data.finalAnswer || data.answer}

---

### Initial AI Answer
${data.initialAnswer || 'N/A'}

---

### Multi-Agent Verification Breakdown
${verifiers || 'No agent logs available.'}

---

### Consulted Sources
${sources || 'No external sources cited.'}
`;
  }

  function handleCopyMarkdown() {
    const md = generateMarkdownReport();
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
  }

  function handleDownloadJSON() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verifyai-report-${data.id || id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteVerification(data.id || id);
      navigate('/history');
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!data) return null;

  const verifiers = data.verifierDetails || [];
  const summary = data.verificationSummary || {};

  return (
    <div className="page-content fade-in">
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
          <ArrowLeft size={14} /> Back to History
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsExportOpen(true)}>
            <Share2 size={13} color="#1687E8" />
            <span>Export Report</span>
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="card detail-header-card" style={{ padding: 26, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <StatusBadge status={data.status} size="md" variant="dot" />
              <span className="badge badge-gray" style={{ fontSize: '0.75rem' }}>
                {formatClassification(data.classification)}
              </span>
              {data.demoMode && <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>Demo Simulation</span>}
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 8, lineHeight: 1.35, letterSpacing: '-0.02em' }}>
              {data.question}
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Verified on {formatDate(data.createdAt)}
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <ConfidenceScore
              score={data.confidenceScore ?? data.confidence}
              level={data.confidenceLevel}
              size="md"
              variant="radial"
              showLabel
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Steps & Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Final Verified Answer */}
          <div className="card" style={{ padding: 24, borderLeft: '4px solid #10B981' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: '#ECFDF5', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} color="#10B981" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 750, color: 'var(--primary-navy)', margin: 0 }}>Final Verified Consensus</h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopyAnswer}
                style={{ gap: 6, fontSize: '0.75rem', padding: '5px 10px' }}
              >
                {copiedAnswer ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                <span>{copiedAnswer ? 'Copied!' : 'Copy Answer'}</span>
              </button>
            </div>
            <p style={{ fontSize: '0.975rem', color: 'var(--primary-navy)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {data.finalAnswer || data.answer}
            </p>
          </div>

          {/* Initial Raw Answer */}
          <TimelineCard
            icon={Brain}
            title="Initial AI Generated Answer"
            status="done"
            content={data.initialAnswer || data.initial_answer || 'Initial response was synthesized prior to parallel cross-checking.'}
            timestamp="Step 1"
          />

          {/* Multi-AI Verification Panel */}
          <TimelineCard
            icon={ShieldCheck}
            title="Parallel AI Agents Evaluation"
            status="done"
            timestamp="Step 2"
          >
            {verifiers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {verifiers.map((v, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 16px', background: '#F8FAFC', borderRadius: 10,
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{
                      width: 9, height: 9, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                      background: v.agreement ? '#10B981' : '#F59E0B',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-navy)' }}>
                          <span style={{ marginRight: 6 }}>
                            {v.provider?.toLowerCase().includes('hugging')
                              ? '🤗'
                              : v.provider?.toLowerCase().includes('ollama')
                              ? '🦙'
                              : v.provider?.toLowerCase().includes('groq')
                              ? '⚡'
                              : v.provider?.toLowerCase().includes('n8n')
                              ? '🔄'
                              : '✨'}
                          </span>
                          {v.provider}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({v.role || 'Verifier'})</span>
                        {v.agreement
                          ? <span className="badge badge-green" style={{ fontSize: '0.6875rem' }}>Agrees</span>
                          : <span className="badge badge-orange" style={{ fontSize: '0.6875rem' }}>Disagrees / Conflict</span>
                        }
                      </div>
                      {v.reason && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
                          {v.reason}
                        </p>
                      )}
                      {v.disputedClaim && (
                        <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4, fontWeight: 500 }}>
                          Disputed Claim: "{v.disputedClaim}"
                        </p>
                      )}
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-navy)', whiteSpace: 'nowrap' }}>
                      {v.confidence ? `${Math.round(v.confidence * 100)}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Multi-agent logs recorded.</p>
            )}
          </TimelineCard>

          {/* Sources Section */}
          {data.sources && data.sources.length > 0 && (
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Globe size={16} color="#00A88A" />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-navy)', margin: 0 }}>Consulted Sources & Citations</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.sources.map((s, i) => (
                  <span key={i} className="badge badge-gray" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>
                    <Globe size={12} color="var(--text-muted)" />
                    {typeof s === 'string' ? s : s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Meta & Technical Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary Box */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 750, color: 'var(--primary-navy)', marginBottom: 16 }}>
              Verification Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SummaryRow
                label="AI Agreement"
                value={summary.aiAgreement ? 'Consensus Achieved' : 'Partial Divergence'}
                ok={summary.aiAgreement}
              />
              <SummaryRow
                label="Evidence Support"
                value={summary.evidenceFound ? 'Strong Grounding' : 'Limited'}
                ok={summary.evidenceFound}
              />
              <SummaryRow
                label="Conflict Status"
                value={data.conflictDetected ? 'Conflict Resolved' : 'No Conflicts'}
                ok={!data.conflictDetected || summary.conflictResolved}
              />
            </div>
          </div>

          {/* Technical JSON Toggle */}
          <div className="card" style={{ padding: 18 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setTechOpen(!techOpen)}
              style={{ width: '100%', justifyContent: 'space-between', padding: 0 }}
            >
              <span style={{ fontWeight: 650, fontSize: '0.875rem', color: 'var(--primary-navy)' }}>Raw Verification Object</span>
              {techOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {techOpen && (
              <pre style={{
                marginTop: 12,
                padding: 12,
                background: '#F8FAFC',
                borderRadius: 8,
                fontSize: '0.75rem',
                overflowX: 'auto',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)'
              }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Export Modal Dialog */}
      {isExportOpen && (
        <div className="modal-backdrop" onClick={() => setIsExportOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Share2 size={18} color="#1687E8" />
                <h3 style={{ fontSize: '1.0625rem', color: 'var(--primary-navy)' }}>Export Verification Report</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsExportOpen(false)} style={{ padding: 4 }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Choose your preferred export format for this verified query:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleCopyMarkdown}
                  style={{ justifyContent: 'flex-start', padding: '12px 16px', gap: 12 }}
                >
                  <FileText size={18} color="#10B981" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 650, fontSize: '0.875rem', color: 'var(--primary-navy)' }}>
                      {copiedMarkdown ? '✓ Copied Markdown to Clipboard!' : 'Copy Formatted Markdown'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Ready to paste into Notion, GitHub, or documentation
                    </div>
                  </div>
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadJSON}
                  style={{ justifyContent: 'flex-start', padding: '12px 16px', gap: 12 }}
                >
                  <Download size={18} color="#1687E8" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 650, fontSize: '0.875rem', color: 'var(--primary-navy)' }}>Download JSON File</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Full structured verification data with agent logs
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsExportOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="modal-backdrop" onClick={() => setIsDeleteOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trash2 size={18} color="#EF4444" />
                <h3 style={{ fontSize: '1.0625rem', color: 'var(--primary-navy)' }}>Delete Verification</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsDeleteOpen(false)} style={{ padding: 4 }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Are you sure you want to permanently delete this verification record? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineCard({ icon: Icon, title, status, content, timestamp, children }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#F8FAFC', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={15} color="#1687E8" />
          </div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-navy)', margin: 0 }}>{title}</h3>
        </div>
        {timestamp && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timestamp}</span>}
      </div>
      {content && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {content}
        </p>
      )}
      {children}
    </div>
  );
}

function SummaryRow({ label, value, ok }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {ok ? <CheckCircle size={14} color="#10B981" /> : <AlertTriangle size={14} color="#F59E0B" />}
        <span style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--primary-navy)' }}>{value}</span>
      </div>
    </div>
  );
}
