import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEmploymentRecords,
  getEmploymentRecord,
  createEmploymentRecord,
  updateEmploymentRecord,
  deleteEmploymentRecord
} from '../services/api/domains';

export const useEmploymentRecords = () => {
  return useQuery({
    queryKey: ['employment-records'],
    queryFn: getEmploymentRecords
  });
};

export const useEmploymentRecord = (recordId: string) => {
  return useQuery({
    queryKey: ['employment-record', recordId],
    queryFn: () => getEmploymentRecord(recordId),
    enabled: !!recordId
  });
};

export const useCreateEmploymentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmploymentRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useUpdateEmploymentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: any }) =>
      updateEmploymentRecord(recordId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employment-records'] });
      queryClient.invalidateQueries({ queryKey: ['employment-record', variables.recordId] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useDeleteEmploymentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmploymentRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};
