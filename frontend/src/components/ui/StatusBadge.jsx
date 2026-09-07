import { CheckCircle2, AlertTriangle, XCircle, Clock, HelpCircle } from 'lucide-react';
import { formatStatus } from '../../utils/formatters';

const STATUS_CONFIG = {
  verified: {
    icon: CheckCircle2,
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    label: 'Verified',
  },
  conflict_resolved: {
    icon: AlertTriangle,
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    label: 'Review',
  },
  low_confidence: {
    icon: HelpCircle,
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    label: 'Review',
  },
  unable_to_verify: {
    icon: XCircle,
    color: '#EF4444',
    bg: '#FFF1F2',
    border: '#FECDD3',
    label: 'Disputed',
  },
  pending: {
    icon: Clock,
    color: '#1687E8',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    label: 'Pending',
  },
};

export default function StatusBadge({ status, size = 'sm', variant = 'dot' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const label = config.label || formatStatus(status);

  if (variant === 'dot') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 650,
          fontSize: size === 'sm' ? '0.8125rem' : '0.875rem',
          color: config.color,
          letterSpacing: '-0.01em',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: config.color,
            display: 'inline-block',
            flexShrink: 0,
            boxShadow: `0 0 6px ${config.color}55`,
          }}
        />
        <span>{label}</span>
      </span>
    );
  }

  const Icon = config.icon;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className="badge"
      style={{
        background: config.bg,
        color: config.color,
        borderColor: config.border,
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
        padding: size === 'sm' ? '3px 9px' : '5px 12px',
        fontWeight: 650,
        letterSpacing: '0.01em',
      }}
    >
      <Icon size={iconSize} strokeWidth={2.4} />
      <span>{label}</span>
    </span>
  );
}
