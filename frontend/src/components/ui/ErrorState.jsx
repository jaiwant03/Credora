import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry, compact = false }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: compact ? '24px 16px' : '48px 24px',
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      borderRadius: 12,
    }}>
      <AlertCircle size={compact ? 24 : 36} color="#DC2626" style={{ margin: '0 auto 12px' }} />
      <p style={{ color: '#991B1B', fontWeight: 500, marginBottom: 4, fontSize: compact ? 14 : 16 }}>
        {message || 'Something went wrong'}
      </p>
      {!compact && (
        <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16 }}>
          Some verification services may be temporarily unavailable.
        </p>
      )}
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} style={{ marginTop: 8 }}>
          <RefreshCw size={13} /> Try Again
        </button>
      )}
    </div>
  );
}
