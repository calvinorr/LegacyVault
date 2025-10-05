import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFinanceRecords,
  getFinanceRecord,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
  type FinanceRecord
} from '../services/api/domains';

export const useFinanceRecords = () => {
  return useQuery({
    queryKey: ['finance-records'],
    queryFn: getFinanceRecords
  });
};

export const useFinanceRecord = (id: string) => {
  return useQuery({
    queryKey: ['finance-record', id],
    queryFn: () => getFinanceRecord(id),
    enabled: !!id
  });
};

export const useCreateFinanceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<FinanceRecord>) => createFinanceRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useUpdateFinanceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FinanceRecord> }) =>
      updateFinanceRecord(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['finance-records'] });
      queryClient.invalidateQueries({ queryKey: ['finance-record', id] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useDeleteFinanceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFinanceRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};
