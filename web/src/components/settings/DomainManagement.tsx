import React from 'react';
import RecordTypeManager from './record-types/RecordTypeManager';
import { useAuth } from '@/hooks/useAuth';

const DomainManagement: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="col-span-full bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Domain Management</h3>
      <RecordTypeManager />
    </div>
  );
};

export default DomainManagement;
