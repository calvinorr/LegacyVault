import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RecordTypeManager from './record-types/RecordTypeManager';
import { useAuth } from '@/hooks/useAuth';

const DomainManagement: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="col-span-full">
      <Card>
        <CardHeader>
          <CardTitle>Domain Management</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordTypeManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainManagement;
