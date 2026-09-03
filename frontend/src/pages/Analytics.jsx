import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { TrendingUp, ShieldCheck, AlertTriangle, XCircle, BarChart2 } from 'lucide-react';
import { getAnalytics } from '../services/api';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

const COLORS = {
  verified: '#19C463',
  conflict: '#F59E0B',
  unable: '#DC2626',
  low: '#F97316',
  veryHigh: '#16A34A',
  high: '#19C463',
  moderate: '#F59E0B',
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await getAnalytics();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const summaryCards = data ? [
    { label: 'Total Verifications', value: data.summary.total, icon: BarChart2, color: '#667085', bg: '#F9FAFB' },
    { label: 'Success Rate', value: `${data.summary.successRate}%`, icon: TrendingUp, color: '#19C463', bg: '#F0FDF4' },
    { label: 'Avg Confidence', value: `${data.summary.avgConfidence}%`, icon: ShieldCheck, color: '#19C463', bg: '#F0FDF4' },
    { label: 'Conflicts', value: data.summary.conflicts, icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Unable to Verify', value: data.summary.unableToVerify, icon: XCircle, color: '#DC2626', bg: '#FEF2F2' },
  ] : [];

  const resultsPieData = data ? [
    { name: 'Verified', value: data.summary.verified, color: COLORS.verified },
    { name: 'Conflicts', value: data.summary.conflicts, color: COLORS.conflict },
    { name: 'Unable', value: data.summary.unableToVerify, color: COLORS.unable },
  ].filter(d => d.value > 0) : [];

  const distributionData = data ? [
    { name: 'Very High (90-100)', value: data.confidenceDistribution.veryHigh, color: COLORS.veryHigh },
    { name: 'High (75-89)', value: data.confidenceDistribution.high, color: COLORS.high },
    { name: 'Moderate (60-74)', value: data.confidenceDistribution.moderate, color: COLORS.moderate },
    { name: 'Low (0-59)', value: data.confidenceDistribution.low, color: COLORS.low },
  ] : [];

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Verification statistics, confidence distribution, and activity overview.</p>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {/* Summary cards */}
      <div className="analytics-grid-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: 18 }}>
                <Skeleton height={12} width={90} />
                <Skeleton height={28} width={50} radius={4} style={{ marginTop: 10 }} />
              </div>
            ))
          : summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card" style={{ padding: 18, transition: 'box-shadow 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>
                      {label}
                    </p>
                    <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                      {value}
                    </div>
                  </div>
                  <div style={{ width: 34, height: 34, background: bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={color} />
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      <div className="analytics-charts-row" style={{ marginTop: 20 }}>
        {/* Results pie */}
        <div className="card" style={{ padding: 20, flex: 1 }}>
          <h4 style={{ marginBottom: 16 }}>Verification Results</h4>
          {loading ? (
            <Skeleton height={200} />
          ) : resultsPieData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={resultsPieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {resultsPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {resultsPieData.map((d) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, background: d.color, borderRadius: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {d.name}: <strong style={{ color: 'var(--text-primary)' }}>{d.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confidence distribution */}
        <div className="card" style={{ padding: 20, flex: 1 }}>
          <h4 style={{ marginBottom: 16 }}>Confidence Distribution</h4>
          {loading ? (
            <Skeleton height={200} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distributionData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {distributionData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Daily activity */}
      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <h4 style={{ marginBottom: 16 }}>Verification Activity (Last 14 Days)</h4>
        {loading ? (
          <Skeleton height={200} />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.dailyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(d) => {
                  if (!d) return '';
                  const parts = d.split('-');
                  if (parts.length === 3) return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
                  return d;
                }}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                labelFormatter={(d) => {
                  if (!d) return '';
                  const parts = d.split('-');
                  if (parts.length === 3) {
                    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                    return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  }
                  return d;
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#19C463"
                strokeWidth={2}
                dot={{ fill: '#19C463', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: '#19C463' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category breakdown */}
      {data?.categories?.length > 0 && (
        <div className="card" style={{ padding: 20, marginTop: 16 }}>
          <h4 style={{ marginBottom: 16 }}>Question Categories</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.categories.map(({ classification, count }) => {
              const maxCount = data.categories[0]?.count || 1;
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={classification} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 90, fontSize: '0.8125rem', color: 'var(--text-secondary)', textTransform: 'capitalize', flexShrink: 0 }}>
                    {classification}
                  </span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: '#19C463' }} />
                  </div>
                  <span style={{ width: 28, textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .analytics-grid-5 {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        .analytics-charts-row {
          display: flex;
          gap: 16px;
        }
        @media (max-width: 1200px) {
          .analytics-grid-5 { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .analytics-grid-5 { grid-template-columns: repeat(2, 1fr); }
          .analytics-charts-row { flex-direction: column; }
        }
        @media (max-width: 480px) {
          .analytics-grid-5 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
      No data yet
    </div>
  );
}
