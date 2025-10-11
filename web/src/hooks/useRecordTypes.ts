import { useState, useEffect } from 'react';

interface RecordType {
  _id: string;
  name: string;
  domain: string;
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('unauthenticated');
  }
  if (!res.ok) {
    try {
      const json = await res.json();
      throw new Error(json.error || `API error ${res.status}`);
    } catch {
      throw new Error(`API error ${res.status}`);
    }
  }
  return res.json();
}

export const useRecordTypes = (domain?: string) => {
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecordTypes = async () => {
      try {
        setLoading(true);
        const url = domain
          ? `/api/record-types?domain=${encodeURIComponent(domain)}`
          : '/api/record-types';
        const res = await fetch(url, { credentials: 'include' });
        const data = await handleResponse(res);
        setRecordTypes(data.recordTypes || data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch record types');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordTypes();
  }, [domain]);

  const addRecordType = async (data: { name: string; domain: string }) => {
    try {
      const res = await fetch('/api/record-types', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(res);
      const newRecordType = result.recordType || result;
      setRecordTypes([...recordTypes, newRecordType]);
      return newRecordType;
    } catch (err) {
      console.error('Failed to add record type:', err);
      throw err;
    }
  };

  const updateRecordType = async (id: string, data: { name: string }) => {
    try {
      const res = await fetch(`/api/record-types/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(res);
      const updatedRecordType = result.recordType || result;
      setRecordTypes(recordTypes.map(rt => rt._id === id ? updatedRecordType : rt));
      return updatedRecordType;
    } catch (err) {
      console.error('Failed to update record type:', err);
      throw err;
    }
  };

  const deleteRecordType = async (id: string) => {
    try {
      const res = await fetch(`/api/record-types/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      await handleResponse(res);
      setRecordTypes(recordTypes.filter(rt => rt._id !== id));
    } catch (err) {
      console.error('Failed to delete record type:', err);
      throw err;
    }
  };

  return { recordTypes, loading, error, addRecordType, updateRecordType, deleteRecordType };
};
