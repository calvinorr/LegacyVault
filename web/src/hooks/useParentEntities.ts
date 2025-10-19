import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listParentEntities,
  getParentEntity,
  createParentEntity,
  updateParentEntity,
  deleteParentEntity,
  DomainType,
  CreateParentEntityData,
  UpdateParentEntityData
} from '../services/api/parentEntities';

// Query hook: List parent entities
export const useParentEntities = (
  domain: DomainType,
  options?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
  }
) => {
  return useQuery({
    queryKey: ['parent-entities', domain, options],
    queryFn: () => listParentEntities(domain, options),
    staleTime: 30000 // 30 seconds
  });
};

// Query hook: Get single parent entity
export const useParentEntity = (domain: DomainType, id: string) => {
  return useQuery({
    queryKey: ['parent-entity', domain, id],
    queryFn: () => getParentEntity(domain, id),
    enabled: !!id,
    staleTime: 30000
  });
};

// Mutation hook: Create parent entity
export const useCreateParentEntity = (domain: DomainType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateParentEntityData) =>
      createParentEntity(domain, data),
    onSuccess: () => {
      // Invalidate and refetch parent entities list
      queryClient.invalidateQueries({ queryKey: ['parent-entities', domain] });
      // Invalidate domain stats (if used in dashboard)
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create parent entity:', error.message);
    }
  });
};

// Mutation hook: Update parent entity
export const useUpdateParentEntity = (domain: DomainType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParentEntityData }) =>
      updateParentEntity(domain, id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific parent entity
      queryClient.invalidateQueries({
        queryKey: ['parent-entity', domain, variables.id]
      });
      // Invalidate parent entities list
      queryClient.invalidateQueries({ queryKey: ['parent-entities', domain] });
      // Invalidate domain stats
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update parent entity:', error.message);
    }
  });
};

// Mutation hook: Delete parent entity
export const useDeleteParentEntity = (domain: DomainType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteParentEntity(domain, id),
    onSuccess: (_, id) => {
      // Remove from cache immediately (optimistic)
      queryClient.setQueryData(['parent-entities', domain], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          entities: oldData.entities.filter((e: any) => e._id !== id),
          total: oldData.total - 1
        };
      });

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['parent-entities', domain] });
      queryClient.invalidateQueries({ queryKey: ['parent-entity', domain, id] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete parent entity:', error.message);
      // Refetch to restore correct state
      queryClient.invalidateQueries({ queryKey: ['parent-entities', domain] });
    }
  });
};
