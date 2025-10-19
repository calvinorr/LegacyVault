import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useParentEntities,
  useParentEntity,
  useCreateParentEntity,
  useUpdateParentEntity,
  useDeleteParentEntity
} from '../useParentEntities';
import * as api from '../../services/api/parentEntities';

// Mock the API module
jest.mock('../../services/api/parentEntities');

const mockApi = api as jest.Mocked<typeof api>;

describe('useParentEntities hooks', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useParentEntities', () => {
    it('fetches parent entities successfully', async () => {
      const mockData = {
        entities: [
          {
            _id: '1',
            userId: 'user1',
            domainType: 'Vehicle' as const,
            name: '2019 Honda Civic',
            fields: { make: 'Honda', model: 'Civic' },
            status: 'active' as const,
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01'
          }
        ],
        page: 1,
        limit: 50,
        total: 1
      };

      mockApi.listParentEntities.mockResolvedValue(mockData);

      const { result } = renderHook(() => useParentEntities('vehicles'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(mockApi.listParentEntities).toHaveBeenCalledWith('vehicles', undefined);
    });

    it('caches query results with correct key', async () => {
      const mockData = {
        entities: [],
        page: 1,
        limit: 50,
        total: 0
      };

      mockApi.listParentEntities.mockResolvedValue(mockData);

      const { result } = renderHook(() => useParentEntities('properties'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const cachedData = queryClient.getQueryData(['parent-entities', 'properties', undefined]);
      expect(cachedData).toEqual(mockData);
    });
  });

  describe('useParentEntity', () => {
    it('fetches single parent entity with children', async () => {
      const mockEntity = {
        _id: '1',
        userId: 'user1',
        domainType: 'Vehicle' as const,
        name: '2019 Honda Civic',
        fields: {},
        status: 'active' as const,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        childRecords: {
          Contact: [],
          ServiceHistory: [],
          Finance: [],
          Insurance: [],
          Government: [],
          Pension: []
        }
      };

      mockApi.getParentEntity.mockResolvedValue(mockEntity);

      const { result } = renderHook(() => useParentEntity('vehicles', '1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockEntity);
    });

    it('does not fetch when id is not provided', () => {
      const { result } = renderHook(() => useParentEntity('vehicles', ''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockApi.getParentEntity).not.toHaveBeenCalled();
    });
  });

  describe('useCreateParentEntity', () => {
    it('creates parent entity and invalidates cache', async () => {
      const newEntity = {
        _id: '2',
        userId: 'user1',
        domainType: 'Property' as const,
        name: 'Primary Residence',
        fields: {},
        status: 'active' as const,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      mockApi.createParentEntity.mockResolvedValue(newEntity);

      const { result } = renderHook(() => useCreateParentEntity('properties'), { wrapper });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      await result.current.mutateAsync({ name: 'Primary Residence' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApi.createParentEntity).toHaveBeenCalledWith('properties', {
        name: 'Primary Residence'
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['parent-entities', 'properties'] });
    });
  });

  describe('useUpdateParentEntity', () => {
    it('updates parent entity and invalidates specific cache', async () => {
      const updatedEntity = {
        _id: '1',
        userId: 'user1',
        domainType: 'Employment' as const,
        name: 'Updated Employment',
        fields: {},
        status: 'active' as const,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-02'
      };

      mockApi.updateParentEntity.mockResolvedValue(updatedEntity);

      const { result } = renderHook(() => useUpdateParentEntity('employments'), { wrapper });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      await result.current.mutateAsync({
        id: '1',
        data: { name: 'Updated Employment' }
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['parent-entity', 'employments', '1']
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['parent-entities', 'employments']
      });
    });
  });

  describe('useDeleteParentEntity', () => {
    it('deletes parent entity with optimistic update', async () => {
      mockApi.deleteParentEntity.mockResolvedValue(undefined);

      // Pre-populate cache with mock data
      queryClient.setQueryData(['parent-entities', 'services'], {
        entities: [
          { _id: '1', name: 'Service 1' },
          { _id: '2', name: 'Service 2' }
        ],
        total: 2
      });

      const { result } = renderHook(() => useDeleteParentEntity('services'), { wrapper });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Check optimistic update removed the entity
      const cachedData: any = queryClient.getQueryData(['parent-entities', 'services']);
      expect(cachedData.entities).toHaveLength(1);
      expect(cachedData.entities[0]._id).toBe('2');
    });

    it('refetches on error to restore correct state', async () => {
      mockApi.deleteParentEntity.mockRejectedValue(new Error('Delete failed'));

      // Pre-populate cache
      queryClient.setQueryData(['parent-entities', 'vehicles'], {
        entities: [{ _id: '1', name: 'Vehicle 1' }],
        total: 1
      });

      const { result } = renderHook(() => useDeleteParentEntity('vehicles'), { wrapper });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      try {
        await result.current.mutateAsync('1');
      } catch (error) {
        // Expected to throw
      }

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['parent-entities', 'vehicles'] });
    });
  });
});
