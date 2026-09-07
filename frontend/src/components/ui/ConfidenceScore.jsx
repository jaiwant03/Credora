import { formatConfidenceLevel } from '../../utils/formatters';

export function getConfidenceColor(score) {
  if (score >= 75) return '#10B981'; // Master Green
  if (score >= 40) return '#F59E0B'; // Master Orange
  return '#EF4444'; // Master Red
}

export default function ConfidenceScore({
  score = 0,
  level,
  size = 'md',
  showBar = true,
  variant = 'radial', // 'radial' | 'bar'
  showLabel = false,
}) {
  const numScore = Math.round(Number(score) || 0);
  const color = getConfidenceColor(numScore);
  const label = formatConfidenceLevel(level);

  const radialSizes = {
    sm: { size: 40, radius: 15, stroke: 3.5, fontSize: '0.75rem' },
    md: { size: 50, radius: 19, stroke: 4.5, fontSize: '0.875rem' },
    lg: { size: 76, radius: 30, stroke: 6, fontSize: '1.25rem' },
  };
  const rs = radialSizes[size] || radialSizes.md;

  if (variant === 'radial') {
    const circumference = 2 * Math.PI * rs.radius;
    const strokeDashoffset = circumference - (numScore / 100) * circumference;

    return (
      <div className="confidence-score-radial" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative', width: rs.size, height: rs.size }}>
          <svg
            width={rs.size}
            height={rs.size}
            style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
          >
            {/* Background track */}
            <circle
              cx={rs.size / 2}
              cy={rs.size / 2}
              r={rs.radius}
              stroke="#E5EAF1"
              strokeWidth={rs.stroke}
              fill="none"
            />
            {/* Progress arc */}
            <circle
              cx={rs.size / 2}
              cy={rs.size / 2}
              r={rs.radius}
              stroke={color}
              strokeWidth={rs.stroke}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 750,
              fontSize: rs.fontSize,
              color: 'var(--primary-navy)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
            }}
          >
            {numScore}%
          </div>
        </div>
        {showLabel && label && (
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {label}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Confidence</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="confidence-score" style={{ minWidth: size === 'sm' ? 80 : 120 }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: showBar ? 5 : 0,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: size === 'sm' ? '1.125rem' : '1.5rem',
          fontWeight: 800,
          color: 'var(--primary-navy)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {numScore}%
        </span>
        {showLabel && label && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {label}
          </span>
        )}
      </div>

      {showBar && (
        <div
          className="progress-bar"
          style={{
            height: size === 'sm' ? 5 : 7,
            background: '#F1F5F9',
            borderRadius: 999,
          }}
        >
          <div
            className="progress-fill"
            style={{
              width: `${numScore}%`,
              background: color,
            }}
          />
        </div>
      )}
    </div>
  );
}
