import { useQuery } from '@tanstack/react-query';

interface DomainStats {
  [domainId: string]: number;
}

const fetchDomainStats = async (): Promise<DomainStats> => {
  // Use new parent entity stats endpoint (Epic 6)
  const response = await fetch('/api/v2/stats', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch domain stats');
  }

  return response.json();
};

export const useDomainStats = () => {
  return useQuery({
    queryKey: ['domain-stats'],
    queryFn: fetchDomainStats,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
};
