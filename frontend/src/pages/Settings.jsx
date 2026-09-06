import { useState, useEffect } from 'react';
import {
  Cpu, Shield, Sliders, CheckCircle, XCircle,
  Save, RefreshCw, Eye, EyeOff, Sun, Moon,
} from 'lucide-react';
import { getSettings, updateSettings, toggleAgent } from '../services/api';
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
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('verifyai_theme') || 'light';
  });

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
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure AI providers, verification behavior, and scoring weights.</p>
      </div>

      {error && <ErrorState message={error} compact />}

      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* AI Providers */}
          <div className="card" style={{ padding: 22 }}>
            <div className="settings-section-header">
              <div className="settings-section-icon"><Cpu size={16} color="#19C463" /></div>
              <div>
                <h3>AI Providers</h3>
                <p style={{ fontSize: '0.8125rem', marginTop: 2 }}>Configure API connections for verification agents.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
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

          {/* Verification Settings */}
          <div className="card" style={{ padding: 22 }}>
            <div className="settings-section-header">
              <div className="settings-section-icon"><Shield size={16} color="#19C463" /></div>
              <div>
                <h3>Verification Settings</h3>
                <p style={{ fontSize: '0.8125rem', marginTop: 2 }}>Control how verification behaves.</p>
              </div>
            </div>

            <div className="settings-form-grid" style={{ marginTop: 18 }}>
              <FormField
                label="Minimum Confidence Threshold"
                hint="Answers below this score are flagged as low confidence"
                type="range"
                min={20} max={90} step={5}
                value={verForm.minConfidenceThreshold ?? 60}
                onChange={(v) => setVerForm(f => ({ ...f, minConfidenceThreshold: Number(v) }))}
                suffix="%"
              />

              <FormField
                label="Number of Verification Agents"
                hint="How many AI agents to use per verification"
                type="range"
                min={1} max={4} step={1}
                value={verForm.numVerificationAgents ?? 3}
                onChange={(v) => setVerForm(f => ({ ...f, numVerificationAgents: Number(v) }))}
                suffix=" agents"
              />

              <ToggleField
                label="Additional Verification on Conflict"
                hint="Run a second verification pass when agents disagree"
                value={verForm.additionalVerificationOnConflict ?? true}
                onChange={(v) => setVerForm(f => ({ ...f, additionalVerificationOnConflict: v }))}
              />

              <ToggleField
                label="Source Verification Enabled"
                hint="Include external sources in confidence scoring"
                value={verForm.sourceVerificationEnabled ?? true}
                onChange={(v) => setVerForm(f => ({ ...f, sourceVerificationEnabled: v }))}
              />

              <ToggleField
                label="Demo Mode"
                hint="Use simulated responses when API keys are not configured"
                value={verForm.demoMode ?? true}
                onChange={(v) => setVerForm(f => ({ ...f, demoMode: v }))}
              />
            </div>
          </div>

          {/* Scoring Weights */}
          <div className="card" style={{ padding: 22 }}>
            <div className="settings-section-header">
              <div className="settings-section-icon"><Sliders size={16} color="#19C463" /></div>
              <div>
                <h3>Confidence Scoring Weights</h3>
                <p style={{ fontSize: '0.8125rem', marginTop: 2 }}>Adjust how the confidence score is calculated. Total should equal 100.</p>
              </div>
            </div>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'aiAgreementWeight', label: 'AI Agreement' },
                { key: 'evidenceSupportWeight', label: 'Evidence Support' },
                { key: 'sourceReliabilityWeight', label: 'Source Reliability' },
                { key: 'consistencyWeight', label: 'Consistency' },
              ].map(({ key, label }) => (
                <WeightField
                  key={key}
                  label={label}
                  value={scoreForm[key] ?? 25}
                  onChange={(v) => setScoreForm(f => ({ ...f, [key]: Number(v) }))}
                />
              ))}

              {/* Total */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Total</span>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: Object.values(scoreForm).reduce((a, b) => a + Number(b), 0) === 100
                      ? 'var(--green-dark)'
                      : 'var(--error)',
                  }}>
                    {Object.values(scoreForm).reduce((a, b) => a + Number(b), 0)} / 100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="card" style={{ padding: 22 }}>
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ background: 'var(--brand-light)' }}>
                <Shield size={16} color="var(--brand-primary)" />
              </div>
              <div>
                <h3>Appearance & Theme</h3>
                <p style={{ fontSize: '0.8125rem', marginTop: 2 }}>
                  Configure visual interface mode (Pure White light mode or Deep Obsidian dark mode).
                </p>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              {/* Light Mode Card */}
              <div
                onClick={() => applyTheme('light')}
                style={{
                  padding: '16px 18px',
                  border: `2px solid ${currentTheme === 'light' ? 'var(--brand-primary)' : 'var(--border)'}`,
                  borderRadius: 12,
                  background: currentTheme === 'light' ? 'var(--brand-light)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sun size={17} color={currentTheme === 'light' ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 650, fontSize: '0.9375rem', color: currentTheme === 'light' ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                      Pure White Light
                    </span>
                  </div>
                  {currentTheme === 'light' && <CheckCircle size={17} color="var(--brand-primary)" />}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Crisp pure bright white canvas with electric indigo truth accents.
                </p>
              </div>

              {/* Dark Mode Card */}
              <div
                onClick={() => applyTheme('dark')}
                style={{
                  padding: '16px 18px',
                  border: `2px solid ${currentTheme === 'dark' ? 'var(--brand-primary)' : 'var(--border)'}`,
                  borderRadius: 12,
                  background: currentTheme === 'dark' ? 'var(--brand-light)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Moon size={17} color={currentTheme === 'dark' ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 650, fontSize: '0.9375rem', color: currentTheme === 'dark' ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                      Pitch Black Dark
                    </span>
                  </div>
                  {currentTheme === 'dark' && <CheckCircle size={17} color="var(--brand-primary)" />}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Pitch obsidian black appearance with high-contrast luminous white text.
                </p>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-dark)', fontSize: '0.875rem' }}>
                <CheckCircle size={15} /> Settings saved
              </div>
            )}
            <button type="button" className="btn btn-secondary" onClick={load}>
              <RefreshCw size={14} /> Reset
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .settings-section-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .settings-section-icon {
          width: 34px;
          height: 34px;
          background: var(--green-light);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .settings-form-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>
    </div>
  );
}

function ProviderRow({ provider, providerKey, onToggle, isLast }) {
  const [showKey, setShowKey] = useState(false);

  const isConfigured = provider.configured;
  const StatusIcon = isConfigured ? CheckCircle : XCircle;
  const statusColor = isConfigured ? '#16A34A' : '#9CA3AF';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      borderBottom: isLast ? 'none' : '1px solid var(--border-light)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{provider.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <StatusIcon size={13} color={statusColor} />
            <span style={{ fontSize: '0.75rem', color: statusColor }}>
              {isConfigured ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
        {provider.keyMasked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {showKey ? provider.keyMasked : '••••••••••••••••'}
            </span>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 2 }}
            >
              {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
        )}
        {!provider.keyMasked && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0, marginTop: 2 }}>
            Set {providerKey.toUpperCase()}_API_KEY in .env to connect
          </p>
        )}
      </div>

      {provider.enabled !== undefined && (
        <label className="toggle">
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
        <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>{label}</label>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--green-dark)' }}>
          {value}{suffix}
        </span>
      </div>
      {hint && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, marginTop: 0 }}>{hint}</p>}
      <input
        type={type}
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', accentColor: '#19C463', cursor: 'pointer' }}
      />
    </div>
  );
}

function ToggleField({ label, hint, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 2 }}>{label}</div>
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
        <label style={{ fontSize: '0.875rem', fontWeight: 450 }}>{label}</label>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--green-dark)', minWidth: 36, textAlign: 'right' }}>
          {value} pts
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="range"
          min={0} max={60} step={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, accentColor: '#19C463', cursor: 'pointer' }}
        />
        <div className="progress-bar" style={{ width: 80, flexShrink: 0 }}>
          <div className="progress-fill" style={{ width: `${(value / 60) * 100}%`, background: '#19C463' }} />
        </div>
      </div>
    </div>
  );
}
