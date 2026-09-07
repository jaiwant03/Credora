import { useState, useEffect } from 'react';
import {
  Cpu, Shield, Sliders, CheckCircle, XCircle,
  Save, RefreshCw, Eye, EyeOff, Sun, Moon, Activity, Terminal, Workflow, Zap, Sparkles, Bell
} from 'lucide-react';
import { getSettings, updateSettings, toggleAgent, testProvider } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { SkeletonCard } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [verForm, setVerForm] = useState({});
  const [scoreForm, setScoreForm] = useState({});
  const { theme, setTheme, addNotification } = useNotifications();

  function applyTheme(newTheme) {
    setCurrentTheme(newTheme);
    localStorage.setItem('verifyai_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new CustomEvent('verifyai_theme_change', { detail: { theme: newTheme } }));
  }

  useEffect(() => {
    function handleThemeChange(e) {
      if (e?.detail?.theme) {
        setCurrentTheme(e.detail.theme);
      }
    }
    window.addEventListener('verifyai_theme_change', handleThemeChange);
    return () => window.removeEventListener('verifyai_theme_change', handleThemeChange);
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      setSettings(data);
      setVerForm(data.verification || {});
      setScoreForm(data.scoring || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({ verification: verForm, scoring: scoreForm });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAgent(provider, enabled) {
    try {
      await toggleAgent(provider, enabled);
      load();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content fade-in">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="badge badge-blue" style={{ marginBottom: 8, padding: '4px 11px' }}>
          <Sliders size={13} style={{ marginRight: 4 }} />
          <span>SYSTEM & MULTI-AGENT CONFIGURATION</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em', margin: '4px 0 8px' }}>
          Platform <span className="hero-text-gradient">Settings</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: 720 }}>
          Configure AI intelligence providers, multi-agent verification threshold rules, scoring weights, and interface aesthetics.
        </p>
      </div>

      {error && <ErrorState message={error} compact />}

      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* AI Providers Section */}
          <div className="card" style={{ padding: 24 }}>
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ background: '#ECFDF5' }}>
                <Cpu size={18} color="#10B981" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 750, color: 'var(--primary-navy)', margin: 0 }}>
                  AI Verification Providers
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Configure local and cloud API connections for automated truth agents.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 18, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {settings?.providers && Object.entries(settings.providers).map(([key, provider], idx, arr) => (
                <ProviderRow
                  key={key}
                  provider={provider}
                  providerKey={key}
                  onToggle={handleToggleAgent}
                  isLast={idx === arr.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Verification Settings Section */}
          <div className="card" style={{ padding: 24 }}>
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ background: '#F0F9FF' }}>
                <Shield size={18} color="#1687E8" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 750, color: 'var(--primary-navy)', margin: 0 }}>
                  Verification Behavior & Rules
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Fine-tune agent execution thresholds, consensus checks, and grounding pipelines.
                </p>
              </div>
            </div>

            <div className="settings-form-grid" style={{ marginTop: 20 }}>
              <FormField
                label="Minimum Confidence Threshold"
                hint="Answers below this score are automatically flagged for review or dispute"
                type="range"
                min={20} max={90} step={5}
                value={verForm.minConfidenceThreshold ?? 60}
                onChange={(v) => setVerForm(f => ({ ...f, minConfidenceThreshold: Number(v) }))}
                suffix="%"
              />

              <FormField
                label="Number of Verification Agents"
                hint="How many AI models execute parallel consensus checks per claim"
                type="range"
                min={1} max={4} step={1}
                value={verForm.numVerificationAgents ?? 3}
                onChange={(v) => setVerForm(f => ({ ...f, numVerificationAgents: Number(v) }))}
                suffix=" agents"
              />

              <ToggleField
                label="Additional Verification on Conflict"
                hint="Run an automated arbitration pass when agents disagree"
                value={verForm.additionalVerificationOnConflict ?? true}
                onChange={(v) => setVerForm(f => ({ ...f, additionalVerificationOnConflict: v }))}
              />

              <ToggleField
                label="Real-Time Source Verification Enabled"
                hint="Include live Google News RSS and Wikipedia REST data in scoring"
                value={verForm.sourceVerificationEnabled ?? true}
                onChange={(v) => setVerForm(f => ({ ...f, sourceVerificationEnabled: v }))}
              />

              <ToggleField
                label="n8n Workflow Automation"
                hint="Dispatch claims through n8n webhook orchestration before local fallback"
                value={verForm.n8nEnabled ?? false}
                onChange={(v) => setVerForm(f => ({ ...f, n8nEnabled: v }))}
              />
            </div>
          </div>

          {/* Scoring Weights Section */}
          <div className="card" style={{ padding: 24 }}>
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ background: '#F5F3FF' }}>
                <Sliders size={18} color="#7C3AED" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 750, color: 'var(--primary-navy)', margin: 0 }}>
                  Confidence Scoring Weights
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Adjust how overall consensus confidence is calculated. Total should equal 100 points.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'aiAgreementWeight', label: 'Multi-Model AI Agreement' },
                { key: 'evidenceSupportWeight', label: 'Live Evidence & Grounding Support' },
                { key: 'sourceReliabilityWeight', label: 'Source Outlet Reliability Rating' },
                { key: 'consistencyWeight', label: 'Factual Semantic Consistency' },
              ].map(({ key, label }) => (
                <WeightField
                  key={key}
                  label={label}
                  value={scoreForm[key] ?? 25}
                  onChange={(v) => setScoreForm(f => ({ ...f, [key]: Number(v) }))}
                />
              ))}

              {/* Total points check */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 650, fontSize: '0.875rem', color: 'var(--primary-navy)' }}>Total Calculated Weight</span>
                  <span style={{
                    fontWeight: 800,
                    fontSize: '0.9375rem',
                    color: Object.values(scoreForm).reduce((a, b) => a + Number(b), 0) === 100
                      ? '#10B981'
                      : '#EF4444',
                  }}>
                    {Object.values(scoreForm).reduce((a, b) => a + Number(b), 0)} / 100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Design & Theme System */}
          <div className="card" style={{ padding: 24 }}>
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ background: '#FFFBEB' }}>
                <Sun size={18} color="#F59E0B" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 750, color: 'var(--text-primary)', margin: 0 }}>
                  Visual Design & Theme System
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  VerifyAI features an instant theme engine with complete white-to-black inversion and pure white typography.
                </p>
              </div>
            </div>
            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {/* Pure White Light Card */}
              <div
                onClick={() => setTheme('light')}
                style={{
                  padding: '18px 20px',
                  border: `2px solid ${theme === 'light' ? '#10B981' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: theme === 'light' ? (theme === 'dark' ? '#0B1322' : '#F0FDF9') : 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sun size={18} color="#00A88A" />
                    <span style={{ fontWeight: 750, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      Bright White SaaS
                    </span>
                  </div>
                  {theme === 'light' && <CheckCircle size={18} color="#10B981" />}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Clean bright-white canvas with deep navy typography and vibrant multi-color accents.
                </p>
              </div>

              {/* Deep Obsidian Dark Card */}
              <div
                onClick={() => setTheme('dark')}
                style={{
                  padding: '18px 20px',
                  border: `2px solid ${theme === 'dark' ? '#06B6D4' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: theme === 'dark' ? '#09101E' : 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Moon size={18} color="#22D3EE" />
                    <span style={{ fontWeight: 750, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      Deep Obsidian Dark
                    </span>
                  </div>
                  {theme === 'dark' && <CheckCircle size={18} color="#06B6D4" />}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Pure deep black canvas (#070D18) with crisp white text and radiant glowing neon accents.
                </p>
              </div>
            </div>
          </div>

          {/* Notification Center & Audio Alerts */}
          <div className="card" style={{ padding: 24 }}>
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ background: '#F0F9FF' }}>
                <Bell size={18} color="#1687E8" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 750, color: 'var(--text-primary)', margin: 0 }}>
                  Notification Center & Live Alerts
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Receive instant toast and chime notifications ("This question is ready!") as soon as a claim or chat verification finishes.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  addNotification({
                    title: 'This question is ready!',
                    message: 'Claim "Did NASA confirm water ice in permanently shadowed lunar craters?" is verified and ready.',
                    question: 'Did NASA confirm water ice in permanently shadowed Moon craters?',
                    status: 'verified',
                    confidence: 94,
                  });
                }}
                style={{ gap: 6 }}
              >
                <Sparkles size={14} color="#06B6D4" />
                <span>Test Notification</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 8 }}>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: '0.875rem', fontWeight: 650 }}>
                <CheckCircle size={16} />
                <span>Settings saved successfully</span>
              </div>
            )}
            <button type="button" className="btn btn-secondary" onClick={load}>
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .hero-text-gradient {
          background: linear-gradient(135deg, #00A88A 0%, #06B6D4 50%, #1687E8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }
        .settings-section-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .settings-section-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .settings-form-grid {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
      `}</style>
    </div>
  );
}

function ProviderRow({ provider, providerKey, onToggle, isLast }) {
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const isConfigured = provider.configured;
  const statusColor = isConfigured ? '#10B981' : '#8A9AB3';

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testProvider(providerKey);
      setTestResult(res?.result || { status: 'unknown' });
    } catch (e) {
      setTestResult({ status: 'error', error: e.message });
    } finally {
      setTesting(false);
    }
  }

  const providerIcons = {
    gemini: <Sparkles size={16} color="#1687E8" />,
    groq: <Zap size={16} color="#F59E0B" />,
    huggingface: <span style={{ fontSize: '1rem' }}>🤗</span>,
    ollama: <span style={{ fontSize: '1rem' }}>🦙</span>,
    n8n: <Workflow size={16} color="#EA4B71" />,
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
      background: '#FFFFFF',
    }}>
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: '#F8FAFC',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {providerIcons[providerKey] || <Cpu size={16} color="#1687E8" />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 650, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>{provider.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: statusColor }}>
              {isConfigured ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          {testResult && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 650,
              padding: '2px 8px',
              borderRadius: 6,
              background: testResult.available || testResult.status === 'connected' ? '#ECFDF5' : '#FFF1F2',
              color: testResult.available || testResult.status === 'connected' ? '#059669' : '#EF4444',
            }}>
              {testResult.available || testResult.status === 'connected'
                ? `✓ Ping OK ${testResult.activeModel ? `(${testResult.activeModel})` : (testResult.model ? `(${testResult.model.split('/').pop()})` : '')}`
                : `⚠️ ${testResult.error || testResult.status || 'Failed'}`}
            </span>
          )}
        </div>

        {/* Credentials / URL Display */}
        {provider.url ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>URL:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#1687E8', background: '#F0F9FF', padding: '2px 6px', borderRadius: 4 }}>
              {provider.url}
            </span>
          </div>
        ) : provider.keyMasked ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {showKey ? provider.keyMasked : '••••••••••••••••'}
            </span>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 2, cursor: 'pointer' }}
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0, marginTop: 2 }}>
            {providerKey === 'ollama'
              ? 'Set OLLAMA_URL in backend/.env (e.g. http://localhost:11434)'
              : providerKey === 'n8n'
              ? 'Set N8N_WEBHOOK_URL in backend/.env (e.g. http://localhost:5678/webhook/VerifyAI)'
              : `Set ${providerKey.toUpperCase()}_API_KEY in backend/.env to connect`}
          </p>
        )}
      </div>

      {/* Test Connection Button */}
      {isConfigured && (
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="btn btn-secondary btn-sm"
          style={{ padding: '5px 10px', fontSize: '0.75rem', height: 30 }}
          title="Test real-time connection"
        >
          {testing ? <RefreshCw size={12} className="animate-spin" /> : <Activity size={12} color="#1687E8" />}
          <span>{testing ? 'Testing...' : 'Test'}</span>
        </button>
      )}

      {/* Enable Toggle */}
      {provider.enabled !== undefined && (
        <label className="toggle" style={{ flexShrink: 0 }}>
          <input
            type="checkbox"
            checked={Boolean(provider.enabled)}
            onChange={(e) => onToggle(providerKey, e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
      )}
    </div>
  );
}

function FormField({ label, hint, type, min, max, step, value, onChange, suffix }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-navy)' }}>{label}</label>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10B981' }}>
          {value}{suffix}
        </span>
      </div>
      {hint && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, marginTop: 0 }}>{hint}</p>}
      <input
        type={type}
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
      />
    </div>
  );
}

function ToggleField({ label, hint, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-navy)', marginBottom: 2 }}>{label}</div>
        {hint && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>{hint}</p>}
      </div>
      <label className="toggle" style={{ flexShrink: 0 }}>
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

function WeightField({ label, value, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 550, color: 'var(--primary-navy)' }}>{label}</label>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10B981', minWidth: 44, textAlign: 'right' }}>
          {value} pts
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="range"
          min={0} max={60} step={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, accentColor: '#10B981', cursor: 'pointer' }}
        />
        <div className="progress-bar" style={{ width: 90, flexShrink: 0, height: 6, background: '#F1F5F9' }}>
          <div className="progress-fill" style={{ width: `${(value / 60) * 100}%`, background: 'linear-gradient(90deg, #10B981, #06B6D4)' }} />
        </div>
      </div>
    </div>
  );
}
