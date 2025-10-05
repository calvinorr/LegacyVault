import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInsuranceRecords,
  getInsuranceRecord,
  createInsuranceRecord,
  updateInsuranceRecord,
  deleteInsuranceRecord
} from '../services/api/domains';

export const useInsuranceRecords = () => {
  return useQuery({
    queryKey: ['insurance-records'],
    queryFn: getInsuranceRecords
  });
};

export const useInsuranceRecord = (recordId: string) => {
  return useQuery({
    queryKey: ['insurance-record', recordId],
    queryFn: () => getInsuranceRecord(recordId),
    enabled: !!recordId
  });
};

export const useCreateInsuranceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInsuranceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useUpdateInsuranceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: any }) =>
      updateInsuranceRecord(recordId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['insurance-records'] });
      queryClient.invalidateQueries({ queryKey: ['insurance-record', variables.recordId] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useDeleteInsuranceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInsuranceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};
