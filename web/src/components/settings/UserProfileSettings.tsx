import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserProfileSettingsProps {
  user: {
    displayName: string;
    email: string;
    role: string;
  };
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Name</label>
          <p className="text-base">{user.displayName}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <p className="text-base">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Role</label>
          <p className="text-base capitalize">{user.role}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileSettings;
