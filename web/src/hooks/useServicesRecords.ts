import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServicesRecords,
  getServicesRecord,
  createServicesRecord,
  updateServicesRecord,
  deleteServicesRecord
} from '../services/api/domains';

export const useServicesRecords = () => {
  return useQuery({
    queryKey: ['services-records'],
    queryFn: getServicesRecords
  });
};

export const useServicesRecord = (recordId: string) => {
  return useQuery({
    queryKey: ['services-record', recordId],
    queryFn: () => getServicesRecord(recordId),
    enabled: !!recordId
  });
};

export const useCreateServicesRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createServicesRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useUpdateServicesRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: any }) =>
      updateServicesRecord(recordId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services-records'] });
      queryClient.invalidateQueries({ queryKey: ['services-record', variables.recordId] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useDeleteServicesRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteServicesRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};
