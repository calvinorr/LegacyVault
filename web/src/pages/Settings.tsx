import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserProfileSettings from '@/components/settings/UserProfileSettings';
import ApplicationSettings from '@/components/settings/ApplicationSettings';

const Settings: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-6">Please log in to view settings.</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UserProfileSettings user={user} />
          <ApplicationSettings />
        </div>
      </div>
    </div>
  );
};

export default Settings;
