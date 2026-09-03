import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle, Circle, Loader,
  AlertTriangle, ChevronDown, ChevronUp,
  RefreshCw, Sparkles, Globe, AlertCircle,
  Copy, Check, ExternalLink, ArrowRight, Zap, HelpCircle,
  Newspaper, BookOpen, Quote, Radio
} from 'lucide-react';
import { useVerification } from '../hooks/useVerification';
import ConfidenceScore from '../components/ui/ConfidenceScore';
import StatusBadge from '../components/ui/StatusBadge';

const QUESTION_CATEGORIES = [
  {
    category: 'Breaking News & Trending',
    questions: [
      'Did NASA confirm water ice in permanently shadowed Moon craters?',
      'Is James Webb Telescope revealing unexpected early galaxy structures?',
      'What are the latest developments in humanoid robotics and AI chips?',
      'Did scientists achieve net energy gain in nuclear fusion?',
    ]
  },
  {
    category: 'Popular',
    questions: [
      'Who invented the telephone?',
      'Who was the first person to walk on the Moon?',
      'What is quantum computing?',
      'Who discovered penicillin?',
    ]
  },
  {
    category: 'Science & Nature',
    questions: [
      'How does CRISPR gene editing work?',
      'What is the largest desert on Earth?',
      'How does photosynthesis generate oxygen?',
      'What causes the Northern Lights (Aurora Borealis)?',
    ]
  },
  {
    category: 'Myths & Facts',
    questions: [
      'Do humans really only use 10% of their brains?',
      'Is the Great Wall of China visible from the Moon?',
      'Does cracking your knuckles cause arthritis?',
      'Can lightning strike the same place twice?',
    ]
  },
  {
    category: 'History & Arts',
    questions: [
      'Who painted the Mona Lisa?',
      'What was the Rosetta Stone and why was it significant?',
      'When did the Industrial Revolution begin?',
      'What caused the Library of Alexandria to be destroyed?',
    ]
  }
];

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [question, setQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Breaking News & Trending');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const { verify, reset, result, loading, error, steps, activeStepIndex } = useVerification();

  // Handle incoming question from Live News page
  useEffect(() => {
    if (location.state?.initialQuestion) {
      const initQ = location.state.initialQuestion;
      setQuestion(initQ);
      if (location.state.autoSubmit) {
        verify(initQ);
      }
      // Clear state so back navigation doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  function handleSubmit(e) {
    e.preventDefault();
    if (question.trim().length < 3) return;
    setDetailsOpen(false);
    verify(question.trim());
  }

  function handleNewQuestion() {
    reset();
    setQuestion('');
    setDetailsOpen(false);
    setCopied(false);
  }

  function handleCopy() {
    if (!result?.answer && !result?.finalAnswer) return;
    navigator.clipboard.writeText(result.answer || result.finalAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const stepsDone = loading || result
    ? (result ? steps.length : activeStepIndex)
    : -1;

  const currentQuestions = QUESTION_CATEGORIES.find(c => c.category === selectedCategory)?.questions || [];

  return (
    <div className="page-content fade-in">
      {/* Page header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>Verify an AI Answer & News Claim</h1>
            <p>
              Submit any question or news claim for multi-agent parallel fact-checking, Google News & Wikipedia grounding, and confidence consensus scoring.
            </p>
          </div>
          <button
            className="btn btn--secondary"
            onClick={() => navigate('/news')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Newspaper size={15} color="var(--green-primary)" />
            <span>Browse Live News</span>
          </button>
        </div>
      </div>

      {/* Input area */}
      {!result && (
        <div className="verify-input-card card fade-in-up" style={{ padding: 24, marginBottom: 24 }}>
          <div className="grounding-indicator">
            <div className="grounding-dot" />
            <span>Connected: <strong>Google News Live RSS + Wikipedia Open REST API + Multi-Model AI</strong></span>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
            <textarea
              className="verify-textarea"
              placeholder="Ask any question, paste a news headline, or test a factual claim (e.g. 'Did NASA discover water on the Moon?' or 'Who invented the telephone?')..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              disabled={loading}
            />

            <div className="verify-input-footer">
              <span className="verify-char-count">
                {question.length}/2000 characters
              </span>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading || question.trim().length < 3}
                style={{ minWidth: 160 }}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Fact-Check Claim</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick-Pick Questions */}
          {!loading && (
            <div className="verify-quick-picks" style={{ marginTop: 24 }}>
              <div className="quick-picks-header">
                <span className="quick-picks-label">Explore Suggested Claims & News</span>
                <div className="quick-picks-tabs">
                  {QUESTION_CATEGORIES.map(({ category }) => (
                    <button
                      key={category}
                      className={`quick-picks-tab ${selectedCategory === category ? 'quick-picks-tab--active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="quick-picks-grid">
                {currentQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="quick-pick-btn"
                    onClick={() => {
                      setQuestion(q);
                      verify(q);
                    }}
                  >
                    <span>{q}</span>
                    <ArrowRight size={13} className="quick-pick-arrow" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Steps (during loading) */}
      {loading && (
        <div className="card verify-progress-card fade-in-up" style={{ padding: 24, marginBottom: 24 }}>
          <div className="progress-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Loader size={18} className="animate-spin" color="var(--green-primary)" />
              <span style={{ fontWeight: 650, fontSize: '0.9375rem' }}>
                Executing Multi-Source Verification Pipeline...
              </span>
            </div>
            <span className="badge badge-green">In Progress</span>
          </div>

          <div className="pipeline-steps-list">
            {steps.map((step, index) => {
              const isDone = index < activeStepIndex;
              const isCurrent = index === activeStepIndex;
              const isPending = index > activeStepIndex;

              return (
                <div
                  key={step.id}
                  className={`pipeline-step-item ${isCurrent ? 'pipeline-step-item--current' : ''} ${isDone ? 'pipeline-step-item--done' : ''}`}
                >
                  <div className="step-icon-col">
                    {isDone ? (
                      <CheckCircle size={16} color="var(--green-primary)" />
                    ) : isCurrent ? (
                      <Loader size={16} className="animate-spin" color="var(--green-primary)" />
                    ) : (
                      <Circle size={16} color="var(--border-dark)" />
                    )}
                  </div>
                  <div className="step-info-col">
                    <div className="step-label">{step.label}</div>
                    <div className="step-detail">{step.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="card" style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <p style={{ color: '#991B1B', fontWeight: 600, marginBottom: 4 }}>
                Verification Error
              </p>
              <p style={{ color: '#DC2626', fontSize: '0.875rem', marginBottom: 14 }}>
                {error}
              </p>
              <button className="btn btn--secondary btn--sm" onClick={handleNewQuestion}>
                <RefreshCw size={13} /> Try Another Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Result View */}
      {result && !loading && (
        <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Demo simulation badge */}
          {result.demoMode && (
            <div className="demo-banner">
              <Sparkles size={14} color="#3B82F6" />
              <span>
                <strong>Grounding Active:</strong> Live Wikipedia & Google News sources retrieved. AI multi-model consensus evaluated.
              </span>
            </div>
          )}

          {/* Answer Card */}
          <div className="answer-card card" style={{ padding: 28 }}>
            <div className="answer-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StatusBadge status={result.status} size="md" />
                <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                  {result.classification || 'General'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={handleCopy}
                  style={{ gap: 6 }}
                >
                  {copied ? <Check size={13} color="var(--green-dark)" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button className="btn btn--primary btn--sm" onClick={handleNewQuestion} style={{ gap: 6 }}>
                  <RefreshCw size={13} /> Verify Another
                </button>
              </div>
            </div>

            {/* Question */}
            <div className="answer-question" style={{ margin: '18px 0 12px' }}>
              <span className="answer-question-label">Fact-Checked Claim</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--text-primary)', marginTop: 4 }}>
                {result.question}
              </h2>
            </div>

            <div className="divider" style={{ margin: '16px 0 20px' }} />

            {/* Verified Answer Body */}
            <div className="answer-body">
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--green-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Single Verified Answer
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.75, fontSize: '1rem', whiteSpace: 'pre-line' }}>
                {result.answer || result.finalAnswer}
              </p>
            </div>

            <div className="divider" style={{ margin: '22px 0' }} />

            {/* Confidence & Evidence Checklist */}
            <div className="answer-meta-row">
              <div className="answer-confidence-block">
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Confidence Assessment
                </div>
                <ConfidenceScore
                  score={result.confidence ?? result.confidenceScore}
                  level={result.confidenceLevel}
                  size="lg"
                  showBar
                />
              </div>

              <div className="answer-checks">
                <CheckItem
                  ok={result.verificationSummary?.aiAgreement}
                  label="Multi-Model AI Consensus"
                />
                <CheckItem
                  ok={result.verificationSummary?.evidenceFound}
                  label="Google News & Wikipedia Grounding"
                />
                <CheckItem
                  ok={!result.verificationSummary?.conflictDetected}
                  label={result.verificationSummary?.conflictDetected ? 'Disputes Evaluated & Resolved' : 'Consistent Factual Baseline'}
                  warn={result.verificationSummary?.conflictDetected}
                />
              </div>
            </div>

            {/* Sources list */}
            {result.sources?.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Verified Reference Sources
                </div>
                <div className="answer-sources">
                  {result.sources.map((src, i) => {
                    const srcName = typeof src === 'string' ? src : (src.name || src.title);
                    const isWiki = srcName.toLowerCase().includes('wikipedia');
                    const isGoogle = srcName.toLowerCase().includes('google');

                    return (
                      <div key={i} className={`answer-source-chip ${isWiki ? 'chip--wiki' : isGoogle ? 'chip--google' : ''}`}>
                        {isWiki ? (
                          <BookOpen size={12} color="#10B981" />
                        ) : isGoogle ? (
                          <Newspaper size={12} color="#3B82F6" />
                        ) : (
                          <Globe size={12} color="var(--green-primary)" />
                        )}
                        <span>{srcName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Evidence Snippets & Quotes Card */}
          {result.evidenceSnippets?.length > 0 && (
            <div className="card evidence-card">
              <div
                className="evidence-card-header"
                onClick={() => setEvidenceOpen(!evidenceOpen)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Quote size={16} color="var(--green-primary)" />
                  <span style={{ fontWeight: 650, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    Verified Evidence Quotes & Live Reference Extracts ({result.evidenceSnippets.length})
                  </span>
                </div>
                {evidenceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {evidenceOpen && (
                <div className="evidence-list fade-in">
                  {result.evidenceSnippets.map((snippet, idx) => (
                    <div key={idx} className="evidence-item">
                      <div className="evidence-meta">
                        <span className={`evidence-badge ${snippet.type === 'encyclopedia' ? 'badge--wiki' : 'badge--news'}`}>
                          {snippet.type === 'encyclopedia' ? 'Wikipedia Extract' : 'Live News Wire'}
                        </span>
                        <span className="evidence-source">{snippet.source}</span>
                        {snippet.publishedAt && (
                          <span className="evidence-date">{snippet.publishedAt}</span>
                        )}
                        {snippet.url && (
                          <a
                            href={snippet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="evidence-url-link"
                          >
                            <span>Open Source</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>

                      {snippet.title && (
                        <h4 className="evidence-title">{snippet.title}</h4>
                      )}

                      <p className="evidence-quote">
                        "{snippet.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Multi-Agent Trace Details Toggle */}
          <div className="card">
            <button
              className="verification-details-toggle"
              onClick={() => setDetailsOpen(!detailsOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HelpCircle size={16} color="var(--green-primary)" />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>View Multi-Agent Verification Trace</span>
              </div>
              {detailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {detailsOpen && (
              <div className="verification-details fade-in">
                {/* Pipeline Steps */}
                {result.steps?.length > 0 && (
                  <div className="details-section">
                    <div className="details-section-title">Execution Steps</div>
                    <div className="details-steps">
                      {result.steps.map((step, i) => (
                        <div key={i} className="details-step">
                          <div className={`details-step-dot ${step.status === 'conflict' ? 'warn' : 'done'}`} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                              {step.label}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {step.detail}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verifier Models */}
                {result.verifierDetails?.length > 0 && (
                  <div className="details-section" style={{ marginTop: 18 }}>
                    <div className="details-section-title">AI Verifier Agent Outputs</div>
                    <div className="details-agents-grid">
                      {result.verifierDetails.map((v, i) => (
                        <div key={i} className="details-agent-card">
                          <div className="details-agent-header">
                            <span className="details-agent-name">{v.provider}</span>
                            <span className={`badge ${v.agreement ? 'badge-green' : 'badge-amber'}`}>
                              {v.agreement ? 'Agreed' : 'Disputed'}
                            </span>
                          </div>
                          <p className="details-agent-reason">{v.reason}</p>
                          <div className="details-agent-meta">
                            <span>Confidence: {Math.round((v.confidence || 0) * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .grounding-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #ECFDF5;
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }

        .grounding-dot {
          width: 8px;
          height: 8px;
          background: #10B981;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .verify-textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          font-size: 0.95rem;
          font-family: inherit;
          color: var(--text-primary);
          background: #fff;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          line-height: 1.6;
        }

        .verify-textarea:focus {
          border-color: var(--green-primary);
          box-shadow: 0 0 0 3px rgba(25, 196, 99, 0.15);
        }

        .verify-input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .verify-char-count {
          font-size: 0.775rem;
          color: var(--text-muted);
        }

        .quick-picks-header {
          margin-bottom: 12px;
        }

        .quick-picks-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          display: block;
          margin-bottom: 8px;
        }

        .quick-picks-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 6px;
        }

        .quick-picks-tab {
          padding: 5px 12px;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 0.775rem;
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
        }

        .quick-picks-tab:hover {
          background: #fff;
          color: var(--text-primary);
        }

        .quick-picks-tab--active {
          background: var(--green-primary);
          color: #fff;
          border-color: var(--green-primary);
          font-weight: 550;
        }

        .quick-picks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 8px;
        }

        .quick-pick-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 14px;
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          color: var(--text-secondary);
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
        }

        .quick-pick-btn:hover {
          background: #fff;
          border-color: var(--green-primary);
          color: var(--text-primary);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .quick-pick-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
          transition: transform 0.15s;
        }

        .quick-pick-btn:hover .quick-pick-arrow {
          color: var(--green-primary);
          transform: translateX(2px);
        }

        .verify-progress-card {
          border-left: 4px solid var(--green-primary);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .pipeline-steps-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pipeline-step-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          opacity: 0.45;
          transition: opacity 0.2s;
        }

        .pipeline-step-item--done {
          opacity: 0.9;
        }

        .pipeline-step-item--current {
          opacity: 1;
          font-weight: 600;
        }

        .step-label {
          font-size: 0.845rem;
          color: var(--text-primary);
        }

        .step-detail {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 1px;
        }

        .demo-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          font-size: 0.8125rem;
          color: #1E40AF;
        }

        .answer-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .answer-question-label {
          font-size: 0.725rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .answer-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .answer-checks {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .answer-sources {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .answer-source-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 0.775rem;
          color: var(--text-secondary);
        }

        .chip--wiki {
          background: #ECFDF5;
          border-color: #A7F3D0;
          color: #065F46;
          font-weight: 550;
        }

        .chip--google {
          background: #EFF6FF;
          border-color: #BFDBFE;
          color: #1E40AF;
          font-weight: 550;
        }

        .evidence-card {
          padding: 20px 24px;
          border-left: 4px solid var(--green-primary);
        }

        .evidence-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .evidence-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 18px;
        }

        .evidence-item {
          padding: 14px 16px;
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
        }

        .evidence-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }

        .evidence-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .badge--wiki {
          background: #D1FAE5;
          color: #065F46;
        }

        .badge--news {
          background: #DBEAFE;
          color: #1E40AF;
        }

        .evidence-source {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .evidence-date {
          font-size: 0.725rem;
          color: var(--text-muted);
        }

        .evidence-url-link {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.75rem;
          color: var(--green-dark);
          text-decoration: none;
          font-weight: 550;
        }

        .evidence-url-link:hover {
          text-decoration: underline;
        }

        .evidence-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .evidence-quote {
          font-size: 0.835rem;
          color: var(--text-secondary);
          line-height: 1.55;
          font-style: italic;
        }

        .verification-details-toggle {
          width: 100%;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
        }

        .verification-details {
          padding: 0 20px 20px;
        }

        .details-section-title {
          font-size: 0.75rem;
          font-weight: 650;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 12px;
        }

        .details-steps {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .details-step {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .details-step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .details-step-dot.done {
          background: var(--green-primary);
        }

        .details-step-dot.warn {
          background: #F59E0B;
        }

        .details-agents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
        }

        .details-agent-card {
          padding: 14px;
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
        }

        .details-agent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .details-agent-name {
          font-weight: 650;
          font-size: 0.8125rem;
          color: var(--text-primary);
        }

        .details-agent-reason {
          font-size: 0.775rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin-bottom: 8px;
        }

        .details-agent-meta {
          font-size: 0.725rem;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .answer-meta-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

function CheckItem({ ok, label, warn }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.845rem' }}>
      {ok ? (
        <CheckCircle size={15} color="var(--green-primary)" style={{ flexShrink: 0 }} />
      ) : warn ? (
        <AlertTriangle size={15} color="#F59E0B" style={{ flexShrink: 0 }} />
      ) : (
        <Circle size={15} color="var(--border-dark)" style={{ flexShrink: 0 }} />
      )}
      <span style={{ color: ok ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: ok ? 500 : 400 }}>
        {label}
      </span>
    </div>
  );
}
