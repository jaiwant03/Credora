import { CheckCircle, AlertTriangle, XCircle, Clock, HelpCircle } from 'lucide-react';
import { getStatusColor, formatStatus } from '../../utils/formatters';

const STATUS_ICONS = {
  verified: CheckCircle,
  conflict_resolved: AlertTriangle,
  low_confidence: HelpCircle,
  unable_to_verify: XCircle,
  pending: Clock,
};

export default function StatusBadge({ status, size = 'sm' }) {
  const colors = getStatusColor(status);
  const Icon = STATUS_ICONS[status] || HelpCircle;
  const label = formatStatus(status);
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className="badge"
      style={{
        background: colors.bg,
        color: colors.text,
        borderColor: colors.border,
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
      }}
    >
      <Icon size={iconSize} />
      {label}
    </span>
  );
}
