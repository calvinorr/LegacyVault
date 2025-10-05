import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGovernmentRecords,
  getGovernmentRecord,
  createGovernmentRecord,
  updateGovernmentRecord,
  deleteGovernmentRecord
} from '../services/api/domains';

export const useGovernmentRecords = () => {
  return useQuery({
    queryKey: ['government-records'],
    queryFn: getGovernmentRecords
  });
};

export const useGovernmentRecord = (recordId: string) => {
  return useQuery({
    queryKey: ['government-record', recordId],
    queryFn: () => getGovernmentRecord(recordId),
    enabled: !!recordId
  });
};

export const useCreateGovernmentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGovernmentRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['government-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useUpdateGovernmentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: any }) =>
      updateGovernmentRecord(recordId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['government-records'] });
      queryClient.invalidateQueries({ queryKey: ['government-record', variables.recordId] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useDeleteGovernmentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGovernmentRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['government-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};
