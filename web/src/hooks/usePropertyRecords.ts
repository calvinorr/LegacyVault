import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPropertyRecords,
  getPropertyRecord,
  createPropertyRecord,
  updatePropertyRecord,
  deletePropertyRecord,
  PropertyRecord
} from '../services/api/domains';

export const usePropertyRecords = () => {
  return useQuery({
    queryKey: ['property-records'],
    queryFn: getPropertyRecords
  });
};

export const usePropertyRecord = (id: string) => {
  return useQuery({
    queryKey: ['property-record', id],
    queryFn: () => getPropertyRecord(id),
    enabled: !!id
  });
};

export const useCreatePropertyRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPropertyRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useUpdatePropertyRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PropertyRecord> }) =>
      updatePropertyRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-records'] });
      queryClient.invalidateQueries({ queryKey: ['property-record', variables.id] });
    }
  });
};

export const useDeletePropertyRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePropertyRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};
