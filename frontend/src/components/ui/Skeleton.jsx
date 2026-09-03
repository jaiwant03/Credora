export default function Skeleton({ width = '100%', height = 16, radius = 6, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
    />
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <Skeleton height={20} width="60%" radius={6} />
      <div style={{ marginTop: 12 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height={14} width={i === lines - 1 ? '40%' : '100%'} radius={4} style={{ marginTop: 8 }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><Skeleton height={14} width={60 + i * 10} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j}><Skeleton height={14} width={`${60 + j * 8}%`} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
