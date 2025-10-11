import React, { useState } from 'react';
import { useRecordTypes } from '@/hooks/useRecordTypes';
import { useAuth } from '@/hooks/useAuth';
import DomainManagementCard from '@/components/domain/DomainManagementCard';
import RecordTypeForm from '@/components/settings/record-types/RecordTypeForm';
import {
  Home,
  Car,
  Briefcase,
  FileText,
  Banknote,
  Shield,
  Scale,
  Wrench
} from 'lucide-react';

const DOMAINS = [
  {
    id: 'property',
    name: 'Property',
    icon: Home
  },
  {
    id: 'vehicles',
    name: 'Vehicle',
    icon: Car
  },
  {
    id: 'employment',
    name: 'Employment',
    icon: Briefcase
  },
  {
    id: 'government',
    name: 'Government',
    icon: FileText
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: Banknote
  },
  {
    id: 'insurance',
    name: 'Insurance',
    icon: Shield
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: Scale
  },
  {
    id: 'services',
    name: 'Services',
    icon: Wrench
  }
];

const DomainsPage: React.FC = () => {
  const { user } = useAuth();
  const { recordTypes, loading, error, addRecordType, updateRecordType, deleteRecordType } = useRecordTypes();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<{ _id: string; name: string; domain: string } | null>(null);

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">
            Access Denied: Admin privileges required
          </p>
        </div>
      </div>
    );
  }

  const handleEdit = (recordType: { _id: string; name: string; domain: string }) => {
    setEditingType(recordType);
    setIsFormOpen(true);
  };

  const handleAddForDomain = (domain: string) => {
    setEditingType({ _id: '', name: '', domain });
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: { name: string; domain: string }) => {
    try {
      if (editingType && editingType._id) {
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
    if (window.confirm('Are you sure you want to delete this record type? This action cannot be undone.')) {
      try {
        await deleteRecordType(id);
      } catch (err) {
        console.error('Failed to delete record type:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-slate-600">Loading domain configuration...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Domain Management
        </h1>
        <p className="text-slate-600 mt-2">
          Configure record types for each life domain
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DOMAINS.map((domain) => {
          const domainRecordTypes = recordTypes.filter(rt => rt.domain === domain.name);
          return (
            <DomainManagementCard
              key={domain.id}
              domain={domain}
              recordTypes={domainRecordTypes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddForDomain={handleAddForDomain}
            />
          );
        })}
      </div>

      {isFormOpen && (
        <RecordTypeForm
          onClose={() => {
            setIsFormOpen(false);
            setEditingType(null);
          }}
          onSubmit={handleSubmit}
          initialData={editingType}
          domains={DOMAINS.map(d => d.name)}
          hideDomainSelect={true}
        />
      )}
    </div>
  );
};

export default DomainsPage;
