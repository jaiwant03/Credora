import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, Circle, Loader,
  AlertTriangle, ChevronDown, ChevronUp,
  RefreshCw, Sparkles, Globe, AlertCircle,
  Copy, Check, ExternalLink, ArrowRight, Zap, HelpCircle,
  Newspaper, BookOpen, Quote, Radio, CheckCircle
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

  const currentQuestions = QUESTION_CATEGORIES.find(c => c.category === selectedCategory)?.questions || [];

  return (
    <div className="page-content fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="verify-badge">
              <Sparkles size={13} color="var(--brand-secondary)" />
              <span>Multi-Agent Consensus & Real-Time Grounding</span>
            </div>
            <h1>Verify an AI Answer & News Claim</h1>
            <p>
              Submit any factual question, news claim, or statement for cross-model verification against Google News RSS and Wikipedia Open REST API.
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/news')}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <Newspaper size={15} color="var(--brand-primary)" />
            <span>Browse Live News</span>
          </button>
        </div>
      </div>

      {/* Input Area Card with Futuristic Scanner Effect */}
      {!result && (
        <div className={`card verify-input-card scanner-container fade-in-up ${loading ? 'is-scanning' : ''}`}>
          {/* Laser Scanner Beam (Active during typing or loading) */}
          {(loading || question.length > 0) && <div className="scanner-beam" />}

          {/* Live Sonar Connection Pill */}
          <div className="grounding-indicator">
            <div className="sonar-emitter">
              <div className="sonar-ping-dot" />
              <div className="sonar-ping-wave" />
            </div>
            <span>
              Connected: <strong>Google News Live RSS + Wikipedia Open REST API + Multi-Model AI</strong>
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            <textarea
              className="verify-textarea"
              placeholder="Ask any question, paste a news headline, or test a claim (e.g., 'Did NASA confirm water ice on the Moon?' or 'Who invented the telephone?')..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              disabled={loading}
            />

            <div className="verify-input-footer">
              <span className="verify-char-count">
                {question.length} / 2000 characters
              </span>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || question.trim().length < 3}
                style={{ minWidth: 175, height: 42 }}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Fact-Checking...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={17} />
                    <span>Fact-Check Claim</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick-Pick Questions */}
          {!loading && (
            <div className="verify-quick-picks">
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
                    <ArrowRight size={14} className="quick-pick-arrow" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Steps (during loading) */}
      {loading && (
        <div className="card verify-progress-card fade-in-up">
          <div className="progress-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="progress-spin-ring">
                <Loader size={20} className="animate-spin" color="var(--brand-primary)" />
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-primary)' }}>
                  Executing Multi-Source Verification Pipeline...
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Parallel AI analysis & factual grounding in progress
                </div>
              </div>
            </div>
            <span className="badge badge-indigo">Active Trace</span>
          </div>

          <div className="pipeline-steps-list">
            {steps.map((step, index) => {
              const isDone = index < activeStepIndex;
              const isCurrent = index === activeStepIndex;

              return (
                <div
                  key={step.id}
                  className={`pipeline-step-item ${isCurrent ? 'pipeline-step-item--current' : ''} ${isDone ? 'pipeline-step-item--done' : ''}`}
                >
                  <div className="step-icon-col">
                    {isDone ? (
                      <CheckCircle2 size={18} color="var(--emerald-primary)" />
                    ) : isCurrent ? (
                      <div className="current-step-pulse">
                        <Loader size={16} className="animate-spin" color="var(--brand-primary)" />
                      </div>
                    ) : (
                      <Circle size={16} color="#CBD5E1" />
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
        <div className="card" style={{ padding: 24, background: 'var(--error-light)', border: '1px solid var(--error-border)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <AlertCircle size={22} color="var(--error)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--error)', fontWeight: 700, marginBottom: 4 }}>
                Verification Pipeline Error
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 14 }}>
                {error}
              </p>
              <button className="btn btn-secondary btn-sm" onClick={handleNewQuestion}>
                <RefreshCw size={13} /> Try Another Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Result View */}
      {result && !loading && (
        <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Demo simulation badge */}
          {result.demoMode && (
            <div className="demo-banner">
              <Sparkles size={16} color="var(--brand-primary)" />
              <span>
                <strong>Grounding Active:</strong> Live Wikipedia & Google News verified. AI multi-agent consensus evaluated.
              </span>
            </div>
          )}

          {/* Answer Card */}
          <div className="answer-card card">
            <div className="answer-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={result.status} size="md" />
                <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                  {result.classification || 'General Fact'}
                </span>
                {result.viaN8n && (
                  <span className="badge" style={{ background: '#EA4B7120', color: '#EA4B71', border: '1px solid #EA4B7140', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    🔄 n8n Orchestrated
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopy}
                  style={{ gap: 6 }}
                >
                  {copied ? <Check size={14} color="var(--emerald-primary)" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Answer'}</span>
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleNewQuestion} style={{ gap: 6 }}>
                  <RefreshCw size={14} />
                  <span>Verify Another</span>
                </button>
              </div>
            </div>

            {/* Question */}
            <div className="answer-question">
              <span className="answer-question-label">Fact-Checked Claim</span>
              <h2 className="answer-question-title">
                {result.question}
              </h2>
            </div>

            <div className="divider" />

            {/* Verified Answer Body */}
            <div className="answer-body">
              <div className="answer-body-label">
                <CheckCircle2 size={14} color="var(--emerald-primary)" />
                <span>Single Verified Consensus</span>
              </div>
              <p className="answer-body-text">
                {result.answer || result.finalAnswer}
              </p>
            </div>

            <div className="divider" />

            {/* Confidence & Evidence Checklist */}
            <div className="answer-meta-row">
              <div className="answer-confidence-block">
                <div className="meta-section-label">Consensus Score</div>
                <ConfidenceScore
                  score={result.confidence ?? result.confidenceScore}
                  level={result.confidenceLevel}
                  size="md"
                  variant="radial"
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
                <div className="meta-section-label">Verified Reference Sources</div>
                <div className="answer-sources">
                  {result.sources.map((src, i) => {
                    const srcName = typeof src === 'string' ? src : (src.name || src.title);
                    const isWiki = srcName.toLowerCase().includes('wikipedia');
                    const isGoogle = srcName.toLowerCase().includes('google');

                    return (
                      <div key={i} className={`answer-source-chip ${isWiki ? 'chip--wiki' : isGoogle ? 'chip--google' : ''}`}>
                        {isWiki ? (
                          <BookOpen size={13} color="#059669" />
                        ) : isGoogle ? (
                          <Newspaper size={13} color="#4F46E5" />
                        ) : (
                          <Globe size={13} color="var(--brand-primary)" />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="evidence-icon-badge">
                    <Quote size={16} color="var(--brand-primary)" />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    Verified Evidence Quotes & Live Reference Extracts ({result.evidenceSnippets.length})
                  </span>
                </div>
                {evidenceOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
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
          <div className="card" style={{ overflow: 'hidden' }}>
            <button
              className="verification-details-toggle"
              onClick={() => setDetailsOpen(!detailsOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <HelpCircle size={17} color="var(--brand-primary)" />
                <span style={{ fontWeight: 650, fontSize: '0.875rem' }}>View Multi-Agent Verification Trace</span>
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
                            <div style={{ fontWeight: 650, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
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
                  <div className="details-section" style={{ marginTop: 20 }}>
                    <div className="details-section-title">AI Verifier Agent Outputs</div>
                    <div className="details-agents-grid">
                      {result.verifierDetails.map((v, i) => {
                        const icon = v.provider?.toLowerCase().includes('hugging')
                          ? '🤗'
                          : v.provider?.toLowerCase().includes('ollama')
                          ? '🦙'
                          : v.provider?.toLowerCase().includes('groq')
                          ? '⚡'
                          : v.provider?.toLowerCase().includes('n8n')
                          ? '🔄'
                          : '✨';

                        return (
                          <div key={i} className="details-agent-card">
                            <div className="details-agent-header">
                              <span className="details-agent-name">
                                <span style={{ marginRight: 6 }}>{icon}</span>
                                {v.provider}
                              </span>
                              <span className={`badge ${v.agreement ? 'badge-green' : 'badge-yellow'}`}>
                                {v.agreement ? 'Agreed' : 'Disputed'}
                              </span>
                            </div>
                            <p className="details-agent-reason">{v.reason}</p>
                            <div className="details-agent-meta">
                              <span>Confidence: {Math.round((v.confidence || 0) * 100)}%</span>
                              {v.role && <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>• {v.role}</span>}
                              {v.model && <span style={{ marginLeft: 6, color: 'var(--brand-primary)', fontFamily: 'monospace', fontSize: '0.75rem' }}>[{v.model}]</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .verify-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: var(--brand-light);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--brand-primary);
          margin-bottom: 10px;
        }

        .verify-input-card {
          padding: 28px;
          margin-bottom: 28px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          position: relative;
        }

        .verify-input-card.is-scanning {
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 0 20px -4px rgba(99, 102, 241, 0.15);
        }

        .grounding-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--emerald-light);
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          color: var(--emerald-dark);
          border: 1px solid var(--emerald-border);
        }

        .verify-textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px 18px;
          font-size: 0.975rem;
          font-family: inherit;
          color: var(--text-primary);
          background: var(--bg-card);
          resize: vertical;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          line-height: 1.6;
        }

        .verify-textarea:focus {
          border-color: var(--brand-secondary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .verify-input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 14px;
        }

        .verify-char-count {
          font-size: 0.775rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .verify-quick-picks {
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px solid var(--border-light);
        }

        .quick-picks-header {
          margin-bottom: 16px;
        }

        .quick-picks-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          display: block;
          margin-bottom: 10px;
        }

        .quick-picks-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 6px;
        }

        .quick-picks-tab {
          padding: 6px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 0.775rem;
          font-weight: 550;
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .quick-picks-tab:hover {
          background: var(--bg-gray);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .quick-picks-tab--active {
          background: var(--brand-light);
          color: var(--brand-primary);
          border-color: rgba(99, 102, 241, 0.35);
          font-weight: 650;
          box-shadow: 0 1px 4px rgba(99, 102, 241, 0.12);
        }

        .quick-picks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 10px;
        }

        .quick-pick-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.845rem;
          color: var(--text-secondary);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .quick-pick-btn:hover {
          background: var(--bg-gray);
          border-color: rgba(99, 102, 241, 0.35);
          color: var(--brand-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }

        .quick-pick-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
          transition: transform 0.2s;
        }

        .quick-pick-btn:hover .quick-pick-arrow {
          color: var(--brand-primary);
          transform: translateX(4px);
        }

        .verify-progress-card {
          padding: 26px;
          margin-bottom: 28px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-left: 4px solid var(--brand-primary);
          box-shadow: var(--shadow-md);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }

        .progress-spin-ring {
          width: 36px;
          height: 36px;
          background: var(--brand-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pipeline-steps-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pipeline-step-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          opacity: 0.45;
          transition: all 0.25s ease;
        }

        .pipeline-step-item--done {
          opacity: 0.95;
        }

        .pipeline-step-item--current {
          opacity: 1;
        }

        .pipeline-step-item--current .step-label {
          color: var(--brand-primary);
          font-weight: 700;
        }

        .step-label {
          font-size: 0.875rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .step-detail {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .demo-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--brand-light);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          font-size: 0.845rem;
          color: var(--brand-hover);
        }

        .answer-card {
          padding: 32px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .answer-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .answer-question {
          margin: 22px 0 16px;
        }

        .answer-question-label {
          font-size: 0.725rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .answer-question-title {
          font-size: 1.35rem;
          font-weight: 750;
          color: var(--text-primary);
          margin-top: 6px;
          line-height: 1.35;
        }

        .answer-body {
          margin: 18px 0;
        }

        .answer-body-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--emerald-dark);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
        }

        .answer-body-text {
          color: var(--text-primary);
          line-height: 1.8;
          font-size: 1.025rem;
          white-space: pre-line;
        }

        .answer-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
          padding: 6px 0;
        }

        .meta-section-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
        }

        .answer-checks {
          display: flex;
          flex-direction: column;
          gap: 10px;
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
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 0.775rem;
          font-weight: 550;
          color: var(--text-secondary);
        }

        .chip--wiki {
          background: var(--emerald-light);
          border-color: var(--emerald-border);
          color: var(--emerald-dark);
        }

        .chip--google {
          background: var(--brand-light);
          border-color: rgba(99, 102, 241, 0.35);
          color: var(--brand-primary);
        }

        .evidence-card {
          padding: 22px 26px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-left: 4px solid var(--brand-primary);
        }

        .evidence-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .evidence-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--brand-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .evidence-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 20px;
        }

        .evidence-item {
          padding: 16px 18px;
          background: var(--bg-gray);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }

        .evidence-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .evidence-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 5px;
          text-transform: uppercase;
        }

        .badge--wiki {
          background: var(--emerald-light);
          color: var(--emerald-dark);
        }

        .badge--news {
          background: var(--brand-light);
          color: var(--brand-primary);
        }

        .evidence-source {
          font-size: 0.75rem;
          font-weight: 650;
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
          gap: 4px;
          font-size: 0.75rem;
          color: var(--brand-primary);
          text-decoration: none;
          font-weight: 600;
        }

        .evidence-url-link:hover { text-decoration: underline; }

        .evidence-title {
          font-size: 0.875rem;
          font-weight: 650;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .evidence-quote {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.6;
          font-style: italic;
        }

        .verification-details-toggle {
          width: 100%;
          padding: 18px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
        }

        .verification-details {
          padding: 0 24px 24px;
        }

        .details-section-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 14px;
        }

        .details-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .details-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .details-step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .details-step-dot.done {
          background: var(--emerald-primary);
        }

        .details-step-dot.warn {
          background: #F59E0B;
        }

        .details-agents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 14px;
        }

        .details-agent-card {
          padding: 16px;
          background: #F8FAFC;
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
          font-weight: 700;
          font-size: 0.8125rem;
          color: var(--text-primary);
        }

        .details-agent-reason {
          font-size: 0.775rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .details-agent-meta {
          font-size: 0.725rem;
          color: var(--text-muted);
          font-weight: 550;
        }

        .divider {
          height: 1px;
          background: var(--border-light);
          margin: 20px 0;
        }

        @media (max-width: 768px) {
          .verify-input-card { padding: 20px; }
          .answer-card { padding: 20px; }
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.845rem' }}>
      {ok ? (
        <CheckCircle2 size={16} color="var(--emerald-primary)" style={{ flexShrink: 0 }} />
      ) : warn ? (
        <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0 }} />
      ) : (
        <Circle size={16} color="#CBD5E1" style={{ flexShrink: 0 }} />
      )}
      <span style={{ color: ok ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: ok ? 550 : 450 }}>
        {label}
      </span>
    </div>
  );
}
