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
  verified: '#10B981',         // Master Emerald
  conflict_resolved: '#1687E8', // Master Blue
  unable_to_verify: '#EF4444',  // Master Red
  low_confidence: '#F59E0B',    // Master Orange
};

const DISTRIBUTION_COLORS = [
  '#10B981', // Very High: 90-100 (Emerald)
  '#1687E8', // High: 75-89 (Blue)
  '#F59E0B', // Moderate: 60-74 (Orange)
  '#EF4444', // Low: 0-59 (Red)
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

  // Summary Metrics
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
      label: 'TOTAL VERIFICATIONS',
      value: summary.total,
      badge: 'All Engines',
      badgeColor: '#ECFDF5',
      badgeText: '#10B981',
      icon: Layers,
      iconColor: '#FFFFFF',
      iconBg: '#10B981',
      desc: 'Fact-checks processed',
    },
    {
      id: 'accuracy',
      label: 'CONSENSUS RATE',
      value: `${summary.successRate}%`,
      badge: 'Verified Truth',
      badgeColor: '#F0F9FF',
      badgeText: '#1687E8',
      icon: ShieldCheck,
      iconColor: '#FFFFFF',
      iconBg: '#1687E8',
      desc: 'High-certainty verdicts',
    },
    {
      id: 'confidence',
      label: 'AVERAGE CONFIDENCE',
      value: `${summary.avgConfidence}%`,
      badge: 'Multi-Agent',
      badgeColor: '#F5F3FF',
      badgeText: '#7C3AED',
      icon: TrendingUp,
      iconColor: '#FFFFFF',
      iconBg: '#7C3AED',
      desc: 'Aggregated reliability',
    },
    {
      id: 'conflicts',
      label: 'CONFLICTS IDENTIFIED',
      value: summary.conflicts,
      badge: 'Resolved',
      badgeColor: '#FFFBEB',
      badgeText: '#F59E0B',
      icon: AlertTriangle,
      iconColor: '#FFFFFF',
      iconBg: '#F59E0B',
      desc: 'Disagreements reconciled',
    },
    {
      id: 'unverified',
      label: 'INCONCLUSIVE CLAIMS',
      value: summary.unableToVerify,
      badge: 'Low Evidence',
      badgeColor: '#FFF1F2',
      badgeText: '#EF4444',
      icon: HelpCircle,
      iconColor: '#FFFFFF',
      iconBg: '#EF4444',
      desc: 'Disputed or low evidence',
    },
  ];

  // Outcome Donut Data
  const outcomeData = [
    { name: 'Verified Claims', value: data?.byStatus?.verified || (summary.total > 0 ? summary.verified : 0), color: OUTCOME_COLORS.verified },
    { name: 'Conflicts Resolved', value: data?.byStatus?.conflict_resolved || (summary.total > 0 ? summary.conflicts : 0), color: OUTCOME_COLORS.conflict_resolved },
    { name: 'Inconclusive / Unable', value: data?.byStatus?.unable_to_verify || (summary.total > 0 ? summary.unableToVerify : 0), color: OUTCOME_COLORS.unable_to_verify },
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
            <CheckCircle2 size={18} color="#10B981" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header analytics-header">
        <div>
          <div className="badge badge-blue" style={{ marginBottom: 8, padding: '4px 11px' }}>
            <Activity size={13} style={{ marginRight: 4 }} />
            <span>REAL-TIME PLATFORM METRICS</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em', margin: '4px 0 8px' }}>
            Verification Analytics & <span className="hero-text-gradient">Intelligence</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: 720 }}>
            Comprehensive telemetry on truth verification throughput, consensus accuracy, and multi-agent confidence.
          </p>
        </div>

        <div className="analytics-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => load(true)}
            disabled={loading || refreshing}
            title="Refresh analytics data"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {hasData && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowResetModal(true)}
              style={{ color: '#EF4444', borderColor: '#FECDD3' }}
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
              >
                <div className="kpi-top">
                  <span className="kpi-label">{kpi.label}</span>
                  <div
                    className="kpi-icon-wrap"
                    style={{ background: kpi.iconBg }}
                  >
                    <kpi.icon size={16} color={kpi.iconColor} strokeWidth={2.4} />
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
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1687E8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF1" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#50627D' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5EAF1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#50627D' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Verifications"
                    stroke="#1687E8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#activityGradient)"
                    activeDot={{ r: 6, fill: '#1687E8', stroke: '#FFFFFF', strokeWidth: 3 }}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF1" vertical={false} />
                  <XAxis
                    dataKey="short"
                    tick={{ fontSize: 11, fill: '#50627D' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5EAF1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#50627D' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{
                      background: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #E5EAF1',
                      boxShadow: '0 8px 24px -4px rgba(7,26,61,0.08)',
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
                            background: idx === 0 ? 'linear-gradient(90deg, #10B981, #06B6D4)' : '#1687E8',
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
                <RotateCcw size={18} color="#EF4444" />
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
              <div style={{ padding: '10px 12px', background: '#FFF1F2', borderRadius: 8, border: '1px solid #FECDD3' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 6 }}>
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

        .hero-text-gradient {
          background: linear-gradient(135deg, #00A88A 0%, #06B6D4 50%, #1687E8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        .analytics-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* 5-column grid */
        .analytics-kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        .analytics-kpi-card {
          padding: 18px 20px;
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .analytics-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: #CBD5E1;
        }

        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .kpi-label {
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .kpi-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
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
          color: var(--primary-navy);
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
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
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
          font-weight: 750;
          color: var(--primary-navy);
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
          background: #F8FAFC;
          border: 1px solid var(--border);
          padding: 3px 9px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .chart-stat-chip span {
          color: #1687E8;
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
          color: var(--primary-navy);
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
          gap: 10px;
          flex: 1;
          min-width: 190px;
        }

        .donut-legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #F8FAFC;
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
          color: var(--primary-navy);
        }

        .legend-val-col {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-count {
          font-size: 0.875rem;
          color: var(--primary-navy);
        }

        .legend-pct {
          font-size: 0.6875rem;
          color: var(--text-muted);
          background: #FFFFFF;
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
          color: #1687E8;
          background: #F0F9FF;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .cat-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--primary-navy);
          text-transform: capitalize;
        }

        .cat-counts {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8125rem;
        }

        .cat-counts strong {
          color: var(--primary-navy);
        }

        .cat-pct {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .cat-progress-track {
          height: 7px;
          background: #F1F5F9;
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
          border: '1px solid #E5EAF1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <BarChart3 size={20} color="#8A9AB3" />
      </div>
      <div style={{ fontWeight: 650, fontSize: '0.875rem', color: 'var(--primary-navy)' }}>
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
          background: '#FFFFFF',
          border: '1px solid #E5EAF1',
          borderRadius: 8,
          boxShadow: '0 8px 24px -4px rgba(7, 26, 61, 0.1)',
          padding: '8px 12px',
        }}
      >
        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1687E8' }} />
          <span style={{ color: 'var(--primary-navy)', fontWeight: 700 }}>
            {payload[0].value} {payload[0].value === 1 ? 'Verification' : 'Verifications'}
          </span>
        </div>
      </div>
    );
  }
  return null;
}
