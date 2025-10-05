// web/src/utils/renewalHelpers.ts
// Helper functions for renewal grouping and urgency calculations

import { Renewal } from '../services/api/renewals';

export interface GroupedRenewals {
  overdue: Renewal[];
  next7days: Renewal[];
  next30days: Renewal[];
  next90days: Renewal[];
  beyond: Renewal[];
}

/**
 * Group renewals by time period
 */
export const groupRenewalsByPeriod = (renewals: Renewal[]): GroupedRenewals => {
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const next90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const grouped: GroupedRenewals = {
    overdue: [],
    next7days: [],
    next30days: [],
    next90days: [],
    beyond: []
  };

  renewals.forEach((renewal) => {
    const renewalDate = new Date(renewal.renewalDate);

    if (renewalDate < now) {
      grouped.overdue.push(renewal);
    } else if (renewalDate <= next7Days) {
      grouped.next7days.push(renewal);
    } else if (renewalDate <= next30Days) {
      grouped.next30days.push(renewal);
    } else if (renewalDate <= next90Days) {
      grouped.next90days.push(renewal);
    } else {
      grouped.beyond.push(renewal);
    }
  });

  return grouped;
};

/**
 * Get urgency level for a renewal date
 */
export const getRenewalUrgency = (renewalDate: string): 'critical' | 'important' | 'standard' | 'info' => {
  const now = new Date();
  const renewal = new Date(renewalDate);
  const daysUntil = Math.floor((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return 'critical'; // Overdue
  if (daysUntil <= 7) return 'critical'; // Next 7 days
  if (daysUntil <= 30) return 'important'; // Next 30 days
  if (daysUntil <= 90) return 'standard'; // Next 90 days
  return 'info'; // Beyond 90 days
};

/**
 * Get color class for urgency level
 */
export const getUrgencyColor = (urgency: 'critical' | 'important' | 'standard' | 'info'): string => {
  const colors = {
    critical: 'red',
    important: 'amber',
    standard: 'green',
    info: 'blue'
  };

  return colors[urgency];
};
