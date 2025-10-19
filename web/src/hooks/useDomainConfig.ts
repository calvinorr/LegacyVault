import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CustomRecordType {
  name: string;
  icon: string;
  color: string;
  description: string;
  requiredFields?: string[];
}

export interface DomainConfig {
  domainType: string;
  allowedRecordTypes: string[];
  customRecordTypes: CustomRecordType[];
  updatedAt: string;
}

const API_BASE_URL = '/api/admin/domain-config';

/**
 * Fetch domain configuration from API
 */
async function fetchDomainConfigs(): Promise<DomainConfig[]> {
  const response = await fetch(API_BASE_URL, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch domain configs: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update domain configuration
 */
async function updateDomainConfig(
  domain: string,
  allowedRecordTypes: string[]
): Promise<DomainConfig> {
  const response = await fetch(`${API_BASE_URL}/${domain}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ allowedRecordTypes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to update domain config`);
  }

  return response.json();
}

/**
 * Create a custom record type
 */
async function createCustomRecordType(
  recordType: CustomRecordType
): Promise<CustomRecordType> {
  const response = await fetch(`${API_BASE_URL}/record-types`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recordType),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to create custom record type`);
  }

  return response.json();
}

/**
 * Hook to fetch all domain configurations
 */
export function useDomainConfigs() {
  return useQuery({
    queryKey: ['domainConfig'],
    queryFn: fetchDomainConfigs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update a domain configuration
 */
export function useUpdateDomainConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      domain,
      allowedRecordTypes,
    }: {
      domain: string;
      allowedRecordTypes: string[];
    }) => updateDomainConfig(domain, allowedRecordTypes),
    onSuccess: () => {
      // Invalidate domain config cache
      queryClient.invalidateQueries({ queryKey: ['domainConfig'] });
      // Also invalidate child record forms that depend on config
      queryClient.invalidateQueries({ queryKey: ['childRecordTypes'] });
    },
  });
}

/**
 * Hook to create a custom record type
 */
export function useCreateCustomRecordType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordType: CustomRecordType) =>
      createCustomRecordType(recordType),
    onSuccess: () => {
      // Invalidate domain config cache
      queryClient.invalidateQueries({ queryKey: ['domainConfig'] });
      // Also invalidate child record forms
      queryClient.invalidateQueries({ queryKey: ['childRecordTypes'] });
    },
  });
}
