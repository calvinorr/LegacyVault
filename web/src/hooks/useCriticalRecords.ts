// web/src/hooks/useCriticalRecords.ts
import { useQuery } from '@tanstack/react-query';
import { emergencyApi, CriticalRecordsResponse } from '../services/api/emergency';

export const useCriticalRecords = () => {
  return useQuery<CriticalRecordsResponse>({
    queryKey: ['critical-records'],
    queryFn: emergencyApi.getCriticalRecords,
    staleTime: 1000 * 60 * 5, // 5 minutes - emergency data should be relatively fresh
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
};

export const useEmergencyChecklist = () => {
  return useQuery({
    queryKey: ['emergency-checklist'],
    queryFn: emergencyApi.getChecklist,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
