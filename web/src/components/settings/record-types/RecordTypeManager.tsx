import React, { useState } from 'react';
import { useRecordTypes } from '@/hooks/useRecordTypes';
import RecordTypeList from './RecordTypeList';
import RecordTypeForm from './RecordTypeForm';

const DOMAINS = [
  'Property',
  'Vehicle',
  'Employment',
  'Government',
  'Insurance',
  'Legal',
  'Services',
  'Finance'
];

const RecordTypeManager: React.FC = () => {
  const { recordTypes, loading, error, addRecordType, updateRecordType, deleteRecordType } = useRecordTypes();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<{ _id: string; name: string; domain: string } | null>(null);

  const handleAdd = () => {
    setEditingType(null);
    setIsFormOpen(true);
  };

  const handleEdit = (recordType: { _id: string; name: string; domain: string }) => {
    setEditingType(recordType);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: { name: string; domain: string }) => {
    try {
      if (editingType) {
        await updateRecordType(editingType._id, { name: data.name });
      } else {
        await addRecordType(data);
      }
      setIsFormOpen(false);
      setEditingType(null);
    } catch (err) {
      console.error('Failed to save record type:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record type?')) {
      try {
        await deleteRecordType(id);
      } catch (err) {
        console.error('Failed to delete record type:', err);
      }
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading record types...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Record Type Management</h3>
          <p className="text-sm text-slate-600">
            Manage the types of records available for each life domain
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
        >
          + Add Record Type
        </button>
      </div>

      <div className="space-y-8">
        {DOMAINS.map(domain => (
          <RecordTypeList
            key={domain}
            domain={domain}
            recordTypes={recordTypes.filter(rt => rt.domain === domain)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isFormOpen && (
        <RecordTypeForm
          onClose={() => {
            setIsFormOpen(false);
            setEditingType(null);
          }}
          onSubmit={handleSubmit}
          initialData={editingType}
          domains={DOMAINS}
        />
      )}
    </div>
  );
};

export default RecordTypeManager;
