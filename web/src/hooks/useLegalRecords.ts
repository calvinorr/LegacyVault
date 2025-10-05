import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLegalRecords,
  getLegalRecord,
  createLegalRecord,
  updateLegalRecord,
  deleteLegalRecord
} from '../services/api/domains';

export const useLegalRecords = () => {
  return useQuery({
    queryKey: ['legal-records'],
    queryFn: getLegalRecords
  });
};

export const useLegalRecord = (recordId: string) => {
  return useQuery({
    queryKey: ['legal-record', recordId],
    queryFn: () => getLegalRecord(recordId),
    enabled: !!recordId
  });
};

export const useCreateLegalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLegalRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useUpdateLegalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: any }) =>
      updateLegalRecord(recordId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['legal-records'] });
      queryClient.invalidateQueries({ queryKey: ['legal-record', variables.recordId] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useDeleteLegalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLegalRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};
