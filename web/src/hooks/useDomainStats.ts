import { useQuery } from '@tanstack/react-query';

interface DomainStats {
  [domainId: string]: number;
}

const fetchDomainStats = async (): Promise<DomainStats> => {
  // For now, return mock data - will be connected to backend API later
  // Backend endpoint will be: GET /api/domains/stats
  return {
    property: 0,
    vehicles: 0,
    employment: 0,
    government: 0,
    finance: 0,
    insurance: 0,
    legal: 0,
    services: 0
  };
};

export const useDomainStats = () => {
  return useQuery({
    queryKey: ['domain-stats'],
    queryFn: fetchDomainStats,
    staleTime: 30000, // 30 seconds
  });
};
