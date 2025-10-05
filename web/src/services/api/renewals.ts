// web/src/services/api/renewals.ts
// Renewal Dashboard API client

export interface RenewalSummary {
  overdue: number;
  next7Days: number;
  next30Days: number;
  total: number;
}

export interface Renewal {
  id: string;
  domain: string;
  name: string;
  recordType: string;
  renewalDate: string;
  priority: string;
  domainUrl: string;
}

export interface RenewalTimelineResponse {
  renewals: Renewal[];
}

export interface RenewalFilters {
  domain?: string;
  priority?: string;
  from?: string;
  to?: string;
}

/**
 * Fetch renewal summary counts
 */
export const fetchRenewalSummary = async (): Promise<RenewalSummary> => {
  const response = await fetch('/api/renewals/summary', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch renewal summary');
  }

  return response.json();
};

/**
 * Fetch renewal timeline with optional filters
 */
export const fetchRenewalTimeline = async (
  filters?: RenewalFilters
): Promise<RenewalTimelineResponse> => {
  const params = new URLSearchParams();

  if (filters?.domain && filters.domain !== 'all') {
    params.append('domain', filters.domain);
  }

  if (filters?.priority && filters.priority !== 'all') {
    params.append('priority', filters.priority);
  }

  if (filters?.from) {
    params.append('from', filters.from);
  }

  if (filters?.to) {
    params.append('to', filters.to);
  }

  const url = `/api/renewals/timeline${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch renewal timeline');
  }

  return response.json();
};
