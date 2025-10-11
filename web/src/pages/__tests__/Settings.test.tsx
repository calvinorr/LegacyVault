import React from 'react';
import { render, screen } from '@testing-library/react';
import Settings from '../../pages/Settings';
import { useAuth } from '../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock child components
jest.mock('@/components/settings/UserProfileSettings', () => {
  return function UserProfileSettings() { return <div>UserProfileSettings</div>; };
});
jest.mock('@/components/settings/ApplicationSettings', () => {
  return function ApplicationSettings() { return <div>ApplicationSettings</div>; };
});
jest.mock('@/components/settings/DomainManagement', () => {
  return function DomainManagement() { return <div>DomainManagement</div>; };
});
jest.mock('@/components/settings/record-types/RecordTypeManager', () => {
  return function RecordTypeManager() { return <div>RecordTypeManager</div>; };
});

describe('Settings Page', () => {
  it('should render the settings page with all sections for admin', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        displayName: 'Test User',
        role: 'admin',
      },
    });

    render(<Settings />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('UserProfileSettings')).toBeInTheDocument();
    expect(screen.getByText('ApplicationSettings')).toBeInTheDocument();
    expect(screen.getByText('DomainManagement')).toBeInTheDocument();
    expect(screen.getByText('RecordTypeManager')).toBeInTheDocument();
  });

  it('should not show RecordTypeManager for non-admin users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        displayName: 'Test User',
        role: 'user',
      },
    });

    render(<Settings />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('UserProfileSettings')).toBeInTheDocument();
    expect(screen.getByText('ApplicationSettings')).toBeInTheDocument();
    expect(screen.getByText('DomainManagement')).toBeInTheDocument();
    expect(screen.queryByText('RecordTypeManager')).not.toBeInTheDocument();
  });

  it('should show a login prompt if the user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<Settings />);

    expect(screen.getByText('Please log in to view settings.')).toBeInTheDocument();
  });
});