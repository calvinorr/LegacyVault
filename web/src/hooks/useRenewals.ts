// web/src/hooks/useRenewals.ts
// React Query hooks for renewal data fetching

import { useQuery } from '@tanstack/react-query';
import { fetchRenewalTimeline, RenewalFilters } from '../services/api/renewals';

/**
 * Hook to fetch renewal timeline with filters
 */
export const useRenewals = (filters?: RenewalFilters) => {
  return useQuery({
    queryKey: ['renewals', 'timeline', filters],
    queryFn: () => fetchRenewalTimeline(filters),
    select: (data) => data.renewals
  });
};
