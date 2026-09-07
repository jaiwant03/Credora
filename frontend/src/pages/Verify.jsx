import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, Circle, Loader,
  AlertTriangle, ChevronDown, ChevronUp,
  RefreshCw, Sparkles, Globe, AlertCircle,
  Copy, Check, ExternalLink, ArrowRight, Zap, HelpCircle,
  Newspaper, BookOpen, Quote, Radio, CheckCircle
} from 'lucide-react';
import { useVerification } from '../hooks/useVerification';
import { useNotifications } from '../context/NotificationContext';
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
  const { addNotification } = useNotifications();
  const lastNotifiedKeyRef = useRef(null);

  // Trigger notification when verification finishes: "This question is ready!"
  useEffect(() => {
    if (result && !loading) {
      const qText = result.question || question || 'Submitted question';
      const key = `${result._id || result.id || 'res'}-${qText}`;
      if (lastNotifiedKeyRef.current !== key) {
        lastNotifiedKeyRef.current = key;
        const shortQ = qText.length > 55 ? qText.slice(0, 52) + '...' : qText;
        const conf = result.confidenceScore || result.confidence || 88;
        addNotification({
          title: 'This question is ready!',
          message: `Claim "${shortQ}" verification complete (${result.status || 'verified'}).`,
          question: qText,
          status: result.status || 'verified',
          confidence: conf,
        });
      }
    }
  }, [result, loading, addNotification, question]);

  // Handle incoming question from Live News page or Dashboard
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
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="verify-badge">
              <Sparkles size={13} color="#00A88A" />
              <span>Multi-Agent Consensus & Real-Time Grounding</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em', marginBottom: 6 }}>
              Verify an AI Answer & <span className="hero-text-gradient">News Claim</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: 720 }}>
              Submit any factual question, news claim, or statement for cross-model verification against Google News RSS and Wikipedia Open REST API.
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/news')}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <Newspaper size={15} color="#1687E8" />
            <span>Browse Live News</span>
          </button>
        </div>
      </div>

      {/* Input Area Card */}
      {!result && (
        <div className={`card verify-input-card fade-in-up ${loading ? 'is-scanning' : ''}`}>
          {/* Live Sonar Connection Pill */}
          <div className="grounding-indicator">
            <div className="sonar-emitter">
              <div className="sonar-ping-dot" />
              <div className="sonar-ping-wave" />
            </div>
            <span>
              Connected: <strong style={{ color: '#071A3D' }}>Google News Live RSS + Wikipedia Open REST API + Multi-Model AI</strong>
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
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
                      className={`filter-chip ${selectedCategory === category ? 'filter-chip--active' : ''}`}
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
                <Loader size={20} className="animate-spin" color="#00A88A" />
              </div>
              <div>
                <span style={{ fontWeight: 750, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                  Executing Multi-Source Verification Pipeline...
                </span>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Parallel AI analysis & factual grounding in progress
                </div>
              </div>
            </div>
            <span className="badge badge-blue">Active Trace</span>
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
                      <CheckCircle2 size={18} color="#10B981" />
                    ) : isCurrent ? (
                      <div className="current-step-pulse">
                        <Loader size={16} className="animate-spin" color="#1687E8" />
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
        <div className="card" style={{ padding: 24, background: '#FFF1F2', border: '1px solid #FECDD3', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <AlertCircle size={22} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <p style={{ color: '#EF4444', fontWeight: 700, marginBottom: 4 }}>
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
              <Sparkles size={16} color="#10B981" />
              <span>
                <strong>Grounding Active:</strong> Live Wikipedia & Google News verified. AI multi-agent consensus evaluated.
              </span>
            </div>
          )}

          {/* Answer Card */}
          <div className="answer-card card">
            <div className="answer-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={result.status} size="md" variant="dot" />
                <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                  {result.classification || 'General Fact'}
                </span>
                {result.viaN8n && (
                  <span className="badge" style={{ background: '#FFF0F5', color: '#E11D48', borderColor: '#FECDD3', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
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
                  {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
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
                <CheckCircle2 size={14} color="#10B981" />
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
                  showLabel
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
                          <BookOpen size={13} color="#10B981" />
                        ) : isGoogle ? (
                          <Newspaper size={13} color="#1687E8" />
                        ) : (
                          <Globe size={13} color="#00A88A" />
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
                    <Quote size={16} color="#1687E8" />
                  </div>
                  <span style={{ fontWeight: 750, fontSize: '0.9375rem', color: 'var(--primary-navy)' }}>
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
                <HelpCircle size={17} color="#1687E8" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-navy)' }}>
                  View Multi-Agent Verification Trace
                </span>
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
                            <div style={{ fontWeight: 650, fontSize: '0.8125rem', color: 'var(--primary-navy)' }}>
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
                              <span className={`badge ${v.agreement ? 'badge-green' : 'badge-orange'}`}>
                                {v.agreement ? 'Agreed' : 'Disputed'}
                              </span>
                            </div>
                            <p className="details-agent-reason">{v.reason}</p>
                            <div className="details-agent-meta">
                              <span>Confidence: {Math.round((v.confidence || 0) * 100)}%</span>
                              {v.role && <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>• {v.role}</span>}
                              {v.model && <span style={{ marginLeft: 6, color: '#1687E8', fontFamily: 'monospace', fontSize: '0.75rem' }}>[{v.model}]</span>}
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
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #059669;
          margin-bottom: 10px;
        }

        .hero-text-gradient {
          background: linear-gradient(135deg, #00A88A 0%, #06B6D4 50%, #1687E8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        .verify-input-card {
          padding: 28px;
          margin-bottom: 28px;
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          position: relative;
        }

        .verify-input-card.is-scanning {
          border-color: #06B6D4;
          box-shadow: 0 0 20px -4px rgba(6, 182, 212, 0.2);
        }

        .grounding-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: #ECFDF5;
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }

        .verify-textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px 18px;
          font-size: 0.975rem;
          font-family: inherit;
          color: var(--primary-navy);
          background: #FFFFFF;
          resize: vertical;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          line-height: 1.6;
        }

        .verify-textarea:focus {
          border-color: #06B6D4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
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
          background: var(--bg-secondary);
          border-color: var(--border-hover);
          color: var(--text-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(7, 26, 61, 0.06);
        }

        .quick-pick-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
          transition: transform 0.2s;
        }

        .quick-pick-btn:hover .quick-pick-arrow {
          color: #1687E8;
          transform: translateX(4px);
        }

        .verify-progress-card {
          padding: 26px;
          margin-bottom: 28px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-left: 4px solid #10B981;
          box-shadow: var(--shadow-sm);
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
          background: #ECFDF5;
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
          color: #1687E8;
          font-weight: 700;
        }

        .step-label {
          font-size: 0.875rem;
          color: var(--primary-navy);
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
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          font-size: 0.845rem;
          color: #065F46;
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
          color: var(--primary-navy);
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
          color: #059669;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
        }

        .answer-body-text {
          color: var(--primary-navy);
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
          background: #ECFDF5;
          border-color: #A7F3D0;
          color: #059669;
        }

        .chip--google {
          background: #F0F9FF;
          border-color: #BAE6FD;
          color: #0284C7;
        }

        .evidence-card {
          padding: 22px 26px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-left: 4px solid #1687E8;
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
          background: #F0F9FF;
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
          background: var(--bg-secondary);
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
          background: #ECFDF5;
          color: #059669;
        }

        .badge--news {
          background: #F0F9FF;
          color: #0284C7;
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
          color: #1687E8;
          text-decoration: none;
          font-weight: 600;
        }

        .evidence-url-link:hover { text-decoration: underline; }

        .evidence-title {
          font-size: 0.875rem;
          font-weight: 650;
          color: var(--primary-navy);
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
          background: #10B981;
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
          background: var(--bg-secondary);
          border: 1px solid var(--border);
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
          color: var(--primary-navy);
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
          background: var(--border);
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
        <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
      ) : warn ? (
        <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0 }} />
      ) : (
        <Circle size={16} color="#CBD5E1" style={{ flexShrink: 0 }} />
      )}
      <span style={{ color: ok ? 'var(--primary-navy)' : 'var(--text-secondary)', fontWeight: ok ? 600 : 450 }}>
        {label}
      </span>
    </div>
  );
}
