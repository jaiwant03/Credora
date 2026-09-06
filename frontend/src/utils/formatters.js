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
  if (score >= 90) return '#059669'; // Vivid Emerald
  if (score >= 75) return '#10B981'; // Mint Emerald
  if (score >= 60) return '#F59E0B'; // Amber
  if (score >= 40) return '#F97316'; // Tangerine
  return '#F43F5E'; // Rose
}

export function getStatusColor(status) {
  switch (status) {
    case 'verified': return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    case 'conflict_resolved': return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    case 'low_confidence': return { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' };
    case 'unable_to_verify': return { bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3' };
    case 'pending': return { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' };
    default: return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
  }
}

export function truncateText(text, maxLen = 100) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '…';
}
