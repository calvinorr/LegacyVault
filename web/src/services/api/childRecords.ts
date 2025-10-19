// web/src/services/api/childRecords.ts
// API client for child record operations

const API_BASE = '/api/v2';

export type RecordType = 'Contact' | 'ServiceHistory' | 'Finance' | 'Insurance' | 'Government' | 'Pension';

export interface ChildRecord {
  _id: string;
  parentId: string;
  recordType: RecordType;
  name: string;
  fields: Record<string, any>;
  renewalDate?: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  attachments: Array<{
    fileId: string;
    fileName: string;
    mimeType: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChildRecordData {
  recordType: RecordType;
  name: string;
  fields: Record<string, any>;
  status?: 'active' | 'expired' | 'cancelled' | 'pending';
}

export interface UpdateChildRecordData {
  name?: string;
  fields?: Record<string, any>;
  status?: 'active' | 'expired' | 'cancelled' | 'pending';
}

export interface ChildRecordsResponse {
  records: ChildRecord[];
  total: number;
}

// List child records for a parent entity
export const listChildRecords = async (
  domain: string,
  parentId: string
): Promise<ChildRecordsResponse> => {
  const response = await fetch(`${API_BASE}/${domain}/${parentId}/children`, {
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to fetch child records for ${parentId}`);
  }

  return response.json();
};

// Get single child record
export const getChildRecord = async (
  domain: string,
  parentId: string,
  recordId: string
): Promise<ChildRecord> => {
  const response = await fetch(`${API_BASE}/${domain}/${parentId}/children/${recordId}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Child record not found');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch child record');
  }

  return response.json();
};

// Create child record
export const createChildRecord = async (
  domain: string,
  parentId: string,
  data: CreateChildRecordData
): Promise<ChildRecord> => {
  const response = await fetch(`${API_BASE}/${domain}/${parentId}/children`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create child record');
  }

  return response.json();
};

// Update child record
export const updateChildRecord = async (
  domain: string,
  parentId: string,
  recordId: string,
  data: UpdateChildRecordData
): Promise<ChildRecord> => {
  const response = await fetch(`${API_BASE}/${domain}/${parentId}/children/${recordId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Child record not found');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to update child record');
  }

  return response.json();
};

// Delete child record
export const deleteChildRecord = async (
  domain: string,
  parentId: string,
  recordId: string
): Promise<void> => {
  const response = await fetch(`${API_BASE}/${domain}/${parentId}/children/${recordId}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Child record not found');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete child record');
  }
};
