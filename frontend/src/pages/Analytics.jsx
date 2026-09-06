import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, ShieldCheck, AlertTriangle, HelpCircle, BarChart3,
  RefreshCw, RotateCcw, CheckCircle2, ArrowUpRight, Sparkles,
  Layers, CheckCircle, PieChart as PieIcon, Activity, Flame
} from 'lucide-react';
import { getAnalytics, clearAnalytics } from '../services/api';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

const OUTCOME_COLORS = {
  verified: '#10B981',        // Luminous Emerald
  conflict_resolved: '#6366F1',// Electric Indigo
  unable_to_verify: '#F43F5E', // Rose
  low_confidence: '#F59E0B',   // Amber
};

const DISTRIBUTION_COLORS = [
  '#059669', // Very High: 90-100 (Deep Emerald)
  '#10B981', // High: 75-89 (Bright Emerald)
  '#F59E0B', // Moderate: 60-74 (Amber)
  '#F43F5E', // Low: 0-59 (Rose)
];

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await getAnalytics();
      setData(result);
      if (isRefresh) {
        setToastMsg('Analytics data refreshed');
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch analytics metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleConfirmReset() {
    setResetting(true);
    try {
      await clearAnalytics();
      setShowResetModal(false);
      await load();
      setToastMsg('Analytics metrics successfully cleared and reset');
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      alert(`Failed to reset analytics: ${err.message}`);
    } finally {
      setResetting(false);
    }
  }

  // Summary Metrics Cards
  const summary = data?.summary || {
    total: 0,
    verified: 0,
    conflicts: 0,
    avgConfidence: 0,
    unableToVerify: 0,
    successRate: 100,
  };

  const kpis = [
    {
      id: 'total',
      label: 'Total Verifications',
      value: summary.total,
      badge: 'All Engines',
      badgeColor: 'var(--brand-light)',
      badgeText: 'var(--brand-primary)',
      icon: BarChart3,
      iconColor: 'var(--brand-primary)',
      iconBg: 'var(--brand-light)',
      borderAccent: 'rgba(99, 102, 241, 0.3)',
      desc: 'Fact-checks processed',
    },
    {
      id: 'accuracy',
      label: 'Consensus Rate',
      value: `${summary.successRate}%`,
      badge: 'Verified Truth',
      badgeColor: 'var(--emerald-light)',
      badgeText: 'var(--emerald-dark)',
      icon: ShieldCheck,
      iconColor: 'var(--emerald-dark)',
      iconBg: 'var(--emerald-light)',
      borderAccent: 'rgba(16, 185, 129, 0.3)',
      desc: 'High-certainty verdicts',
    },
    {
      id: 'confidence',
      label: 'Average Confidence',
      value: `${summary.avgConfidence}%`,
      badge: 'Multi-Agent',
      badgeColor: 'rgba(124, 58, 237, 0.16)',
      badgeText: '#A78BFA',
      icon: Sparkles,
      iconColor: '#8B5CF6',
      iconBg: 'rgba(124, 58, 237, 0.16)',
      borderAccent: 'rgba(124, 58, 237, 0.3)',
      desc: 'Aggregated reliability',
    },
    {
      id: 'conflicts',
      label: 'Arbitrated Conflicts',
      value: summary.conflicts,
      badge: 'Resolved',
      badgeColor: 'var(--warning-light)',
      badgeText: 'var(--warning)',
      icon: AlertTriangle,
      iconColor: 'var(--warning)',
      iconBg: 'var(--warning-light)',
      borderAccent: 'rgba(217, 119, 6, 0.3)',
      desc: 'Disagreements reconciled',
    },
    {
      id: 'unverified',
      label: 'Inconclusive Claims',
      value: summary.unableToVerify,
      badge: 'Low Evidence',
      badgeColor: 'var(--error-light)',
      badgeText: 'var(--error)',
      icon: HelpCircle,
      iconColor: 'var(--error)',
      iconBg: 'var(--error-light)',
      borderAccent: 'rgba(225, 29, 72, 0.3)',
      desc: 'Need manual investigation',
    },
  ];

  // Outcome Donut Data
  const outcomeData = [
    { name: 'Verified Claims', value: data?.byStatus?.verified || 0, color: OUTCOME_COLORS.verified },
    { name: 'Conflicts Resolved', value: data?.byStatus?.conflict_resolved || 0, color: OUTCOME_COLORS.conflict_resolved },
    { name: 'Inconclusive / Unable', value: data?.byStatus?.unable_to_verify || 0, color: OUTCOME_COLORS.unable_to_verify },
    { name: 'Low Confidence', value: data?.byStatus?.low_confidence || 0, color: OUTCOME_COLORS.low_confidence },
  ].filter(item => item.value > 0);

  // Confidence Distribution Data
  const distributionData = data ? [
    { name: 'Very High (90-100%)', short: '90-100%', value: data.confidenceDistribution?.veryHigh || 0, fill: DISTRIBUTION_COLORS[0] },
    { name: 'High (75-89%)', short: '75-89%', value: data.confidenceDistribution?.high || 0, fill: DISTRIBUTION_COLORS[1] },
    { name: 'Moderate (60-74%)', short: '60-74%', value: data.confidenceDistribution?.moderate || 0, fill: DISTRIBUTION_COLORS[2] },
    { name: 'Low (0-59%)', short: '<60%', value: data.confidenceDistribution?.low || 0, fill: DISTRIBUTION_COLORS[3] },
  ] : [];

  // Daily Activity Trend
  const activityData = (data?.dailyActivity || []).map(d => {
    let displayDate = d.date;
    if (d.date && d.date.includes('-')) {
      const parts = d.date.split('-');
      if (parts.length === 3) displayDate = `${parseInt(parts[1])}/${parseInt(parts[2])}`;
    }
    return {
      date: displayDate,
      fullDate: d.date,
      count: d.count,
      avgConfidence: d.avgConfidence || 0,
    };
  });

  const hasData = summary.total > 0;

  return (
    <div className="page-content fade-in">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} color="var(--emerald-primary)" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header analytics-header">
        <div>
          <div className="analytics-pill">
            <Activity size={13} />
            <span>REAL-TIME PLATFORM METRICS</span>
          </div>
          <h1>Verification Analytics & Intelligence</h1>
          <p>
            Comprehensive telemetry on truth verification throughput, consensus accuracy, and multi-agent confidence.
          </p>
        </div>

        <div className="analytics-header-actions">
          <button
            className="btn btn-secondary analytics-btn"
            onClick={() => load(true)}
            disabled={loading || refreshing}
            title="Refresh analytics data"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          {hasData && (
            <button
              className="btn btn-secondary analytics-btn analytics-reset-btn"
              onClick={() => setShowResetModal(true)}
              title="Reset all verification metrics"
            >
              <RotateCcw size={14} />
              <span>Reset Statistics</span>
            </button>
          )}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={() => load()} />}

      {/* 5-Column KPI Stat Cards */}
      <div className="analytics-kpi-grid">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card analytics-kpi-card skeleton-card">
                <Skeleton height={14} width={110} />
                <Skeleton height={32} width={70} radius={6} style={{ marginTop: 12 }} />
                <Skeleton height={12} width={130} style={{ marginTop: 10 }} />
              </div>
            ))
          : kpis.map((kpi) => (
              <div
                key={kpi.id}
                className="card analytics-kpi-card"
                style={{ '--accent-border': kpi.borderAccent }}
              >
                <div className="kpi-top">
                  <span className="kpi-label">{kpi.label}</span>
                  <div
                    className="kpi-icon-wrap"
                    style={{ background: kpi.iconBg }}
                  >
                    <kpi.icon size={17} color={kpi.iconColor} />
                  </div>
                </div>

                <div className="kpi-value-row">
                  <span className="kpi-value">{kpi.value}</span>
                  <span
                    className="kpi-badge"
                    style={{ background: kpi.badgeColor, color: kpi.badgeText }}
                  >
                    {kpi.badge}
                  </span>
                </div>

                <div className="kpi-desc">{kpi.desc}</div>
              </div>
            ))}
      </div>

      {/* Primary Charts Section */}
      <div className="analytics-charts-grid" style={{ marginTop: 22 }}>
        {/* Verification Velocity Over Time (Area Chart) */}
        <div className="card analytics-chart-card">
          <div className="chart-card-header">
            <div>
              <h3>Verification Activity Velocity</h3>
              <p>Daily volume of fact-checked claims and questions over the last 14 days</p>
            </div>
            <div className="chart-stat-chip">
              <span>{summary.total}</span> Total Processed
            </div>
          </div>

          <div className="chart-body" style={{ height: 260 }}>
            {loading ? (
              <Skeleton height={260} radius={8} />
            ) : activityData.length === 0 ? (
              <EmptyChartState
                title="No recent verification activity"
                description="New queries will appear on this timeline as they are verified."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="activityIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Verifications"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#activityIndigo)"
                    activeDot={{ r: 6, fill: '#4F46E5', stroke: '#FFFFFF', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Verification Outcomes (Donut Chart) */}
        <div className="card analytics-chart-card">
          <div className="chart-card-header">
            <div>
              <h3>Verification Outcomes</h3>
              <p>Consensus verdicts categorised by truth resolution state</p>
            </div>
            <div className="chart-stat-chip">
              <PieIcon size={12} style={{ marginRight: 4 }} />
              Breakdown
            </div>
          </div>

          <div className="chart-body" style={{ minHeight: 260 }}>
            {loading ? (
              <Skeleton height={260} radius={8} />
            ) : outcomeData.length === 0 ? (
              <EmptyChartState
                title="No verification verdicts recorded"
                description="Execute a verification in the Verify tab to generate outcome charts."
              />
            ) : (
              <div className="donut-content-layout">
                <div className="donut-chart-wrapper">
                  <ResponsiveContainer width={190} height={190}>
                    <PieChart>
                      <Pie
                        data={outcomeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {outcomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-center-metric">
                    <span className="center-num">{summary.total}</span>
                    <span className="center-sub">Verdicts</span>
                  </div>
                </div>

                <div className="donut-legend-list">
                  {outcomeData.map((item) => {
                    const pct = summary.total > 0 ? Math.round((item.value / summary.total) * 100) : 0;
                    return (
                      <div key={item.name} className="donut-legend-row">
                        <div className="legend-label-col">
                          <span className="legend-dot" style={{ background: item.color }} />
                          <span className="legend-name">{item.name}</span>
                        </div>
                        <div className="legend-val-col">
                          <strong className="legend-count">{item.value}</strong>
                          <span className="legend-pct">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Charts Section */}
      <div className="analytics-charts-grid" style={{ marginTop: 22 }}>
        {/* Confidence Distribution (Bar Chart) */}
        <div className="card analytics-chart-card">
          <div className="chart-card-header">
            <div>
              <h3>Confidence Score Spectrum</h3>
              <p>Frequency distribution across multi-agent confidence brackets</p>
            </div>
            <div className="chart-stat-chip">
              Avg: {summary.avgConfidence}%
            </div>
          </div>

          <div className="chart-body" style={{ height: 250 }}>
            {loading ? (
              <Skeleton height={250} radius={8} />
            ) : !hasData ? (
              <EmptyChartState
                title="No confidence scores available"
                description="Distribution brackets will calculate once verifications are completed."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="short"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{
                      background: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1)',
                      fontSize: 12,
                    }}
                    formatter={(v, name, item) => [v, item.payload.name]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Categories / Classifications Breakdown */}
        <div className="card analytics-chart-card">
          <div className="chart-card-header">
            <div>
              <h3>Verified Domains & Categories</h3>
              <p>Top inquiry subjects categorized by intelligence models</p>
            </div>
            <div className="chart-stat-chip">
              {data?.categories?.length || 0} Topics
            </div>
          </div>

          <div className="chart-body" style={{ minHeight: 250 }}>
            {loading ? (
              <Skeleton height={250} radius={8} />
            ) : !data?.categories || data.categories.length === 0 ? (
              <EmptyChartState
                title="No categories mapped yet"
                description="Questions submitted to VerifyAI will automatically categorize into topics."
              />
            ) : (
              <div className="categories-list">
                {data.categories.slice(0, 6).map(({ classification, count }, idx) => {
                  const maxCount = data.categories[0]?.count || 1;
                  const pct = Math.round((count / summary.total) * 100);
                  const barPct = Math.round((count / maxCount) * 100);

                  return (
                    <div key={classification} className="category-row">
                      <div className="cat-meta-row">
                        <div className="cat-title-group">
                          <span className="cat-rank">#{idx + 1}</span>
                          <span className="cat-name">{classification}</span>
                        </div>
                        <div className="cat-counts">
                          <strong>{count}</strong>
                          <span className="cat-pct">({pct}%)</span>
                        </div>
                      </div>

                      <div className="cat-progress-track">
                        <div
                          className="cat-progress-fill"
                          style={{
                            width: `${barPct}%`,
                            background: idx === 0 ? 'linear-gradient(90deg, #4F46E5, #6366F1)' : '#10B981',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Analytics */}
      {showResetModal && (
        <div className="modal-backdrop" onClick={() => setShowResetModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RotateCcw size={18} color="var(--error)" />
                <h3 style={{ fontSize: '1.0625rem' }}>Reset Analytics Statistics</h3>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowResetModal(false)}
                style={{ padding: 4 }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Are you sure you want to reset all verification analytics metrics?
              </p>
              <div style={{ padding: '10px 12px', background: 'var(--error-light)', borderRadius: 8, border: '1px solid var(--error-border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={15} />
                  This resets all historical counts, success rates, and chart data to zero.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmReset}
                disabled={resetting}
              >
                {resetting ? 'Resetting...' : 'Yes, Reset Statistics'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Scoped Styles */}
      <style>{`
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .analytics-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EEF2FF;
          color: var(--brand-primary);
          border: 1px solid rgba(99, 102, 241, 0.25);
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }

        .analytics-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .analytics-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .analytics-reset-btn {
          color: var(--error);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .analytics-reset-btn:hover {
          background: #FEF2F2;
          border-color: var(--error);
          color: #991B1B;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 5-column grid */
        .analytics-kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        .analytics-kpi-card {
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .analytics-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px -4px rgba(15, 23, 42, 0.07);
          border-color: var(--accent-border, rgba(99, 102, 241, 0.35));
        }

        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .kpi-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .kpi-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-value-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 6px;
        }

        .kpi-value {
          font-size: 1.875rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .kpi-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .kpi-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Charts grid */
        .analytics-charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .analytics-chart-card {
          padding: 22px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
        }

        .chart-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 18px;
        }

        .chart-card-header h3 {
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .chart-card-header p {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin: 0;
        }

        .chart-stat-chip {
          display: inline-flex;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-gray);
          border: 1px solid var(--border);
          padding: 3px 9px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .chart-stat-chip span {
          color: var(--brand-primary);
          font-weight: 700;
          margin-right: 4px;
        }

        .donut-content-layout {
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 24px;
          flex-wrap: wrap;
          padding-top: 10px;
        }

        .donut-chart-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .donut-center-metric {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .center-num {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .center-sub {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 3px;
        }

        .donut-legend-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          min-width: 190px;
        }

        .donut-legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--bg-gray);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .legend-label-col {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .legend-val-col {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-count {
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .legend-pct {
          font-size: 0.6875rem;
          color: var(--text-muted);
          background: var(--bg-card);
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid var(--border);
        }

        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .category-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cat-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cat-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cat-rank {
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--brand-primary);
          background: var(--brand-light);
          padding: 1px 5px;
          border-radius: 4px;
        }

        .cat-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: capitalize;
        }

        .cat-counts {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8125rem;
        }

        .cat-counts strong {
          color: var(--text-primary);
        }

        .cat-pct {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .cat-progress-track {
          height: 7px;
          background: var(--bg-gray);
          border-radius: 999px;
          overflow: hidden;
        }

        .cat-progress-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 1200px) {
          .analytics-kpi-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 860px) {
          .analytics-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .analytics-charts-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 520px) {
          .analytics-kpi-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function EmptyChartState({ title, description }) {
  return (
    <div
      style={{
        height: '100%',
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'var(--text-muted)',
        padding: 20,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <BarChart3 size={20} color="#94A3B8" />
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {title}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 280, marginTop: 4 }}>
        {description}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.4)',
          padding: '8px 12px',
        }}
      >
        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F46E5' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {payload[0].value} {payload[0].value === 1 ? 'Verification' : 'Verifications'}
          </span>
        </div>
      </div>
    );
  }
  return null;
}
