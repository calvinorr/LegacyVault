import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVehicleRecords,
  getVehicleRecord,
  createVehicleRecord,
  updateVehicleRecord,
  deleteVehicleRecord,
  VehicleRecord
} from '../services/api/domains';

export const useVehicleRecords = () => {
  return useQuery({
    queryKey: ['vehicle-records'],
    queryFn: getVehicleRecords
  });
};

export const useVehicleRecord = (id: string) => {
  return useQuery({
    queryKey: ['vehicle-record', id],
    queryFn: () => getVehicleRecord(id),
    enabled: !!id
  });
};

export const useCreateVehicleRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVehicleRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useUpdateVehicleRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VehicleRecord> }) =>
      updateVehicleRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-records'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-record', variables.id] });
    }
  });
};

export const useDeleteVehicleRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVehicleRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};
