import { getConfidenceColor, formatConfidenceLevel } from '../../utils/formatters';

export default function ConfidenceScore({ score, level, size = 'md', showBar = true }) {
  const color = getConfidenceColor(score);
  const label = formatConfidenceLevel(level);

  const sizes = {
    sm: { score: '1.5rem', label: '0.6875rem', barH: 6 },
    md: { score: '2.25rem', label: '0.75rem', barH: 8 },
    lg: { score: '3rem', label: '0.875rem', barH: 10 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="confidence-score" style={{ minWidth: size === 'sm' ? 80 : 120 }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 4,
        marginBottom: showBar ? 6 : 0,
      }}>
        <span style={{
          fontSize: s.score,
          fontWeight: 700,
          color,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {score}%
        </span>
        <span style={{
          fontSize: s.label,
          fontWeight: 600,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {label}
        </span>
      </div>

      {showBar && (
        <div className="progress-bar" style={{ height: s.barH }}>
          <div
            className="progress-fill"
            style={{
              width: `${score}%`,
              background: color,
            }}
          />
        </div>
      )}
    </div>
  );
}
