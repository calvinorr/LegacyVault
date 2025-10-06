import React from 'react';

interface UserProfileSettingsProps {
  user: {
    displayName: string;
    email: string;
    role: string;
  };
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">User Profile</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-600">Name</label>
          <p className="text-base">{user.displayName}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Email</label>
          <p className="text-base">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Role</label>
          <p className="text-base capitalize">{user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings;
