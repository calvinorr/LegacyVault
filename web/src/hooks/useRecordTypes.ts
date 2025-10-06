import { useState, useEffect } from 'react';
import { api } from '@/api'; // Assuming a pre-configured api client

// Placeholder type - will need to be defined properly
interface RecordType {
  _id: string;
  name: string;
  domain: string;
}

export const useRecordTypes = () => {
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecordTypes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/record-types');
        setRecordTypes(response.data);
      } catch (err) {
        setError('Failed to fetch record types');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordTypes();
  }, []);

  const addRecordType = async (data: { name: string; domain: string }) => {
    try {
      const response = await api.post('/record-types', data);
      setRecordTypes([...recordTypes, response.data]);
      return response.data;
    } catch (err) {
      console.error('Failed to add record type:', err);
      throw err;
    }
  };

  const updateRecordType = async (id: string, data: { name: string }) => {
    try {
      const response = await api.put(`/record-types/${id}`, data);
      setRecordTypes(recordTypes.map(rt => rt._id === id ? response.data : rt));
      return response.data;
    } catch (err) {
      console.error('Failed to update record type:', err);
      throw err;
    }
  };

  const deleteRecordType = async (id: string) => {
    try {
      await api.delete(`/record-types/${id}`);
      setRecordTypes(recordTypes.filter(rt => rt._id !== id));
    } catch (err) {
      console.error('Failed to delete record type:', err);
      throw err;
    }
  };

  return { recordTypes, loading, error, addRecordType, updateRecordType, deleteRecordType };
};
