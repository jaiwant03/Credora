export function formatConfidenceLevel(level) {
  const map = {
    very_high: 'Very High',
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
    unable: 'Unable to Verify',
  };
  return map[level] || level || '—';
}

export function formatStatus(status) {
  const map = {
    verified: 'Verified',
    conflict_resolved: 'Conflict Resolved',
    low_confidence: 'Low Confidence',
    unable_to_verify: 'Unable to Verify',
    pending: 'Pending',
  };
  return map[status] || status || '—';
}

export function formatClassification(cls) {
  const map = {
    historical: 'Historical',
    conceptual: 'Conceptual',
    temporal: 'Temporal',
    numerical: 'Numerical',
    scientific: 'Scientific',
    general: 'General',
  };
  return map[cls] || cls || 'General';
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getConfidenceColor(score) {
  if (score >= 90) return '#16A34A';
  if (score >= 75) return '#19C463';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#F97316';
  return '#DC2626';
}

export function getStatusColor(status) {
  switch (status) {
    case 'verified': return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
    case 'conflict_resolved': return { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' };
    case 'low_confidence': return { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' };
    case 'unable_to_verify': return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
    default: return { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' };
  }
}

export function truncateText(text, maxLen = 100) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '…';
}
