import React, { useState } from 'react';
import { useRecordTypes } from '@/hooks/useRecordTypes';
import RecordTypeList from './RecordTypeList';
import RecordTypeForm from './RecordTypeForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
    return <div className="text-muted-foreground">Loading record types...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Record Type Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage the types of records available for each life domain
          </p>
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Record Type
        </Button>
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

      <RecordTypeForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingType(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingType}
        domains={DOMAINS}
      />
    </div>
  );
};

export default RecordTypeManager;
