import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import UserProfileSettings from '@/components/settings/UserProfileSettings';
import ApplicationSettings from '@/components/settings/ApplicationSettings';
import DomainManagement from '@/components/settings/DomainManagement';

// This is the refactored Settings page, consistent with modern architecture.
const Settings: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view settings.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UserProfileSettings user={user} />
        <ApplicationSettings />
        <DomainManagement />

        {/* Placeholder for Story 3.1 */}
        <Card>
          <CardHeader>
            <CardTitle>Record Type Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Here you will be able to manage the record types for each domain.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              (Coming in Story 3.1)
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Settings;