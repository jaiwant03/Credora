import { getConfidenceColor, formatConfidenceLevel } from '../../utils/formatters';

export default function ConfidenceScore({
  score,
  level,
  size = 'md',
  showBar = true,
  variant = 'bar', // 'bar' | 'radial' | 'pill'
}) {
  const color = getConfidenceColor(score);
  const label = formatConfidenceLevel(level);

  const sizes = {
    sm: { score: '1.25rem', label: '0.6875rem', barH: 5, radius: 14, stroke: 3 },
    md: { score: '2rem', label: '0.75rem', barH: 7, radius: 24, stroke: 4 },
    lg: { score: '2.75rem', label: '0.875rem', barH: 9, radius: 36, stroke: 5 },
  };
  const s = sizes[size] || sizes.md;

  if (variant === 'radial') {
    const circumference = 2 * Math.PI * s.radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="confidence-score-radial" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', width: s.radius * 2 + s.stroke * 2, height: s.radius * 2 + s.stroke * 2 }}>
          <svg
            width={s.radius * 2 + s.stroke * 2}
            height={s.radius * 2 + s.stroke * 2}
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle
              cx={s.radius + s.stroke}
              cy={s.radius + s.stroke}
              r={s.radius}
              stroke="var(--border-light)"
              strokeWidth={s.stroke}
              fill="none"
            />
            <circle
              cx={s.radius + s.stroke}
              cy={s.radius + s.stroke}
              r={s.radius}
              stroke={color}
              strokeWidth={s.stroke}
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
              fontSize: size === 'sm' ? '0.75rem' : '0.9375rem',
              color,
              fontFamily: 'var(--font-display)',
            }}
          >
            {score}%
          </div>
        </div>
        {label && (
          <div>
            <div style={{ fontSize: s.label, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Confidence</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="confidence-score" style={{ minWidth: size === 'sm' ? 75 : 120 }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: showBar ? 5 : 0,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: s.score,
          fontWeight: 800,
          color,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {score}%
        </span>
        {label && (
          <span style={{
            fontSize: s.label,
            fontWeight: 700,
            color,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {label}
          </span>
        )}
      </div>

      {showBar && (
        <div
          className="progress-bar"
          style={{
            height: s.barH,
            background: 'var(--border-light)',
            borderRadius: 999,
          }}
        >
          <div
            className="progress-fill"
            style={{
              width: `${score}%`,
              background: `linear-gradient(90deg, ${color} 0%, ${color}DD 100%)`,
              boxShadow: `0 0 10px ${color}55`,
            }}
          />
        </div>
      )}
    </div>
  );
}
