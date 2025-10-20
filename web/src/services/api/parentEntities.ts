const API_BASE = '/api/v2';

export type DomainType = 'vehicles' | 'properties' | 'employments' | 'services' | 'finance';

export interface ParentEntity {
  _id: string;
  userId: string;
  domainType: 'Vehicle' | 'Property' | 'Employment' | 'Services' | 'Finance';
  name: string;
  fields: Record<string, any>;
  status: 'active' | 'archived';
  image?: {
    filename: string;
    data?: Buffer;
    contentType: string;
    uploadedAt: string;
  };
  lastUpdatedBy?: string;
  createdAt: string;
  updatedAt: string;
  childRecordCount?: number; // Added by backend for list endpoint
}

export interface ParentEntityWithChildren extends ParentEntity {
  childRecords: {
    Contact: any[];
    ServiceHistory: any[];
    Finance: any[];
    Insurance: any[];
    Government: any[];
    Pension: any[];
  };
}

export interface ParentEntitiesResponse {
  entities: ParentEntity[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateParentEntityData {
  name: string;
  fields?: Record<string, any>;
}

export interface UpdateParentEntityData {
  name?: string;
  fields?: Record<string, any>;
  status?: 'active' | 'archived';
}

// List parent entities
export const listParentEntities = async (
  domain: DomainType,
  options?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
  }
): Promise<ParentEntitiesResponse> => {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);
  if (options?.sort) params.append('sort', options.sort);

  const url = `${API_BASE}/${domain}${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url, {
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to fetch ${domain}`);
  }

  return response.json();
};

// Get parent entity by ID
export const getParentEntity = async (
  domain: DomainType,
  id: string
): Promise<ParentEntityWithChildren> => {
  const response = await fetch(`${API_BASE}/${domain}/${id}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Parent entity not found');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch parent entity');
  }

  const data = await response.json();

  // Backend returns { entity, childRecords }
  // Merge into single object with childRecords nested
  return {
    ...data.entity,
    childRecords: data.childRecords
  };
};

// Create parent entity
export const createParentEntity = async (
  domain: DomainType,
  data: CreateParentEntityData
): Promise<ParentEntity> => {
  const response = await fetch(`${API_BASE}/${domain}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create parent entity');
  }

  return response.json();
};

// Update parent entity
export const updateParentEntity = async (
  domain: DomainType,
  id: string,
  data: UpdateParentEntityData
): Promise<ParentEntity> => {
  const response = await fetch(`${API_BASE}/${domain}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Parent entity not found');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to update parent entity');
  }

  return response.json();
};

// Delete parent entity
export const deleteParentEntity = async (
  domain: DomainType,
  id: string
): Promise<void> => {
  const response = await fetch(`${API_BASE}/${domain}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Parent entity not found');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete parent entity');
  }
};

// Upload image for parent entity
export const uploadEntityImage = async (
  domain: DomainType,
  id: string,
  file: File
): Promise<{ success: boolean; image: { data: string; contentType: string; filename: string } }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/${domain}/${id}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  return response.json();
};

// Get image for parent entity (returns URL)
export const getEntityImageUrl = (domain: DomainType, id: string): string => {
  return `${API_BASE}/${domain}/${id}/image`;
};
