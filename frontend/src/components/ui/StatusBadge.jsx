import { CheckCircle2, AlertTriangle, XCircle, Clock, HelpCircle } from 'lucide-react';
import { formatStatus } from '../../utils/formatters';

const STATUS_CONFIG = {
  verified: {
    icon: CheckCircle2,
    bg: '#ECFDF5',
    text: '#059669',
    border: '#A7F3D0',
    glow: 'rgba(16, 185, 129, 0.2)',
  },
  conflict_resolved: {
    icon: AlertTriangle,
    bg: '#FFFBEB',
    text: '#D97706',
    border: '#FDE68A',
    glow: 'rgba(245, 158, 11, 0.2)',
  },
  low_confidence: {
    icon: HelpCircle,
    bg: '#FFF7ED',
    text: '#C2410C',
    border: '#FED7AA',
    glow: 'rgba(249, 115, 22, 0.2)',
  },
  unable_to_verify: {
    icon: XCircle,
    bg: '#FFF1F2',
    text: '#E11D48',
    border: '#FECDD3',
    glow: 'rgba(244, 63, 94, 0.2)',
  },
  pending: {
    icon: Clock,
    bg: '#EEF2FF',
    text: '#4F46E5',
    border: '#C7D2FE',
    glow: 'rgba(79, 70, 229, 0.2)',
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  const label = formatStatus(status);
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className="badge"
      style={{
        background: config.bg,
        color: config.text,
        borderColor: config.border,
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
        boxShadow: `0 1px 3px ${config.glow}`,
        padding: size === 'sm' ? '3px 9px' : '5px 12px',
        fontWeight: 600,
        letterSpacing: '0.01em',
      }}
    >
      <Icon size={iconSize} strokeWidth={2.4} />
      <span>{label}</span>
    </span>
  );
}
