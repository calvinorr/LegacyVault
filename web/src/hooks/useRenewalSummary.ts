// web/src/hooks/useRenewalSummary.ts
// React Query hook for renewal summary

import { useQuery } from '@tanstack/react-query';
import { fetchRenewalSummary } from '../services/api/renewals';

/**
 * Hook to fetch renewal summary counts
 */
export const useRenewalSummary = () => {
  return useQuery({
    queryKey: ['renewals', 'summary'],
    queryFn: fetchRenewalSummary,
    // Refetch every 5 minutes to keep counts fresh
    refetchInterval: 5 * 60 * 1000
  });
};
