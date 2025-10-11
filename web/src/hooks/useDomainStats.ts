import { useQuery } from '@tanstack/react-query';

interface DomainStats {
  [domainId: string]: number;
}

const fetchDomainStats = async (): Promise<DomainStats> => {
  const response = await fetch('/api/domains/stats', {
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
