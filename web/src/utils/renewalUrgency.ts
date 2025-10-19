// web/src/utils/renewalUrgency.ts
// Utilities for calculating and displaying renewal date urgency

export type UrgencyLevel = 'critical' | 'important' | 'upcoming' | 'none';

export interface UrgencyInfo {
  level: UrgencyLevel;
  daysRemaining: number | null;
  message: string;
  isUrgent: boolean;
}

/**
 * Calculate renewal urgency based on renewal date
 * - Critical: < 30 days (red)
 * - Important: 30-90 days (orange)
 * - Upcoming: > 90 days (blue)
 * - None: null or past date
 */
export function calculateRenewalUrgency(renewalDate: string | undefined): UrgencyInfo {
  if (!renewalDate) {
    return {
      level: 'none',
      daysRemaining: null,
      message: 'No renewal date set',
      isUrgent: false
    };
  }

  const renewal = new Date(renewalDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = renewal.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      level: 'none',
      daysRemaining,
      message: `Expired ${Math.abs(daysRemaining)} days ago`,
      isUrgent: false
    };
  }

  if (daysRemaining < 30) {
    return {
      level: 'critical',
      daysRemaining,
      message: `URGENT: Renews in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
      isUrgent: true
    };
  }

  if (daysRemaining < 90) {
    return {
      level: 'important',
      daysRemaining,
      message: `Renews in ${daysRemaining} days`,
      isUrgent: false
    };
  }

  return {
    level: 'upcoming',
    daysRemaining,
    message: `Renews in ${daysRemaining} days`,
    isUrgent: false
  };
}

/**
 * Get color classes for urgency level (Tailwind + inline style support)
 */
export function getUrgencyColors(level: UrgencyLevel) {
  const colorMap = {
    critical: {
      border: '#ef4444', // red-500
      bg: '#fef2f2', // red-50
      text: '#991b1b', // red-900
      badge: '#dc2626', // red-600
      icon: '#ef4444' // red-500
    },
    important: {
      border: '#f97316', // orange-500
      bg: '#fff7ed', // orange-50
      text: '#92400e', // orange-900
      badge: '#ea580c', // orange-600
      icon: '#f97316' // orange-500
    },
    upcoming: {
      border: '#3b82f6', // blue-500
      bg: '#eff6ff', // blue-50
      text: '#1e3a8a', // blue-900
      badge: '#2563eb', // blue-600
      icon: '#3b82f6' // blue-500
    },
    none: {
      border: '#cbd5e1', // slate-300
      bg: '#f1f5f9', // slate-100
      text: '#64748b', // slate-500
      badge: '#94a3b8', // slate-400
      icon: '#cbd5e1' // slate-300
    }
  };

  return colorMap[level];
}

/**
 * Format renewal date for display (e.g., "15 Jun 2025")
 */
export function formatRenewalDate(date: string | undefined): string {
  if (!date) return '—';

  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  return d.toLocaleDateString('en-GB', options);
}

/**
 * Get sections that should be expanded by default
 * - Sections with records: expanded
 * - Sections with urgent renewals (<30 days): expanded
 * - Empty sections: collapsed
 */
export function shouldExpandSection(records: any[] | undefined, hasUrgentRenewals: boolean): boolean {
  if (!records || records.length === 0) {
    return false;
  }

  if (hasUrgentRenewals) {
    return true;
  }

  return true; // Default to expanded if has records
}

/**
 * Check if any records in a section have urgent renewals
 */
export function hasUrgentRenewals(records: any[] | undefined): boolean {
  if (!records) return false;

  return records.some(record => {
    const urgency = calculateRenewalUrgency(record.renewalDate || record.fields?.renewalDate);
    return urgency.level === 'critical';
  });
}
