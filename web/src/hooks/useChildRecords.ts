// web/src/hooks/useChildRecords.ts
// React Query hooks for child record operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listChildRecords,
  getChildRecord,
  createChildRecord,
  updateChildRecord,
  deleteChildRecord,
  CreateChildRecordData,
  UpdateChildRecordData
} from '../services/api/childRecords';

// Query hook: List child records for a parent
export const useChildRecords = (domain: string, parentId: string) => {
  return useQuery({
    queryKey: ['child-records', domain, parentId],
    queryFn: () => listChildRecords(domain, parentId),
    enabled: !!parentId,
    staleTime: 30000 // 30 seconds
  });
};

// Query hook: Get single child record
export const useChildRecord = (domain: string, parentId: string, recordId: string) => {
  return useQuery({
    queryKey: ['child-record', domain, parentId, recordId],
    queryFn: () => getChildRecord(domain, parentId, recordId),
    enabled: !!parentId && !!recordId,
    staleTime: 30000
  });
};

// Mutation hook: Create child record
export const useCreateChildRecord = (domain: string, parentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChildRecordData) =>
      createChildRecord(domain, parentId, data),
    onSuccess: () => {
      // Invalidate child records list
      queryClient.invalidateQueries({
        queryKey: ['child-records', domain, parentId]
      });
      // Invalidate parent entity (to update child count)
      queryClient.invalidateQueries({
        queryKey: ['parent-entity', domain, parentId]
      });
      // Invalidate domain stats if any
      queryClient.invalidateQueries({
        queryKey: ['domain-stats']
      });
    },
    onError: (error: Error) => {
      console.error('Failed to create child record:', error.message);
    }
  });
};

// Mutation hook: Update child record
export const useUpdateChildRecord = (domain: string, parentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: UpdateChildRecordData }) =>
      updateChildRecord(domain, parentId, recordId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific child record
      queryClient.invalidateQueries({
        queryKey: ['child-record', domain, parentId, variables.recordId]
      });
      // Invalidate child records list
      queryClient.invalidateQueries({
        queryKey: ['child-records', domain, parentId]
      });
      // Invalidate parent entity
      queryClient.invalidateQueries({
        queryKey: ['parent-entity', domain, parentId]
      });
    },
    onError: (error: Error) => {
      console.error('Failed to update child record:', error.message);
    }
  });
};

// Mutation hook: Delete child record
export const useDeleteChildRecord = (domain: string, parentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) =>
      deleteChildRecord(domain, parentId, recordId),
    onSuccess: (_, recordId) => {
      // Remove from cache immediately (optimistic)
      queryClient.setQueryData(['child-records', domain, parentId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          records: oldData.records.filter((r: any) => r._id !== recordId),
          total: oldData.total - 1
        };
      });

      // Invalidate queries to refetch
      queryClient.invalidateQueries({
        queryKey: ['child-records', domain, parentId]
      });
      queryClient.invalidateQueries({
        queryKey: ['child-record', domain, parentId, recordId]
      });
      queryClient.invalidateQueries({
        queryKey: ['parent-entity', domain, parentId]
      });
    },
    onError: (error: Error) => {
      console.error('Failed to delete child record:', error.message);
      // Refetch to restore correct state
      queryClient.invalidateQueries({
        queryKey: ['child-records', domain, parentId]
      });
    }
  });
};
