import React from 'react';
import { render, screen } from '@testing-library/react';
import Settings from '../../pages/Settings';
import { useAuth } from '../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock child components
jest.mock('../../components/settings/UserProfileSettings', () => () => <div>UserProfileSettings</div>);
jest.mock('../../components/settings/ApplicationSettings', () => () => <div>ApplicationSettings</div>);
jest.mock('../../components/settings/DomainManagement', () => () => <div>DomainManagement</div>);
jest.mock('../../components/settings/record-types/RecordTypeManager', () => () => <div>RecordTypeManager</div>);

describe('Settings Page', () => {
  it('should render the settings page with all sections', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        displayName: 'Test User',
        isAdmin: true,
      },
    });

    render(<Settings />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('UserProfileSettings')).toBeInTheDocument();
    expect(screen.getByText('ApplicationSettings')).toBeInTheDocument();
    expect(screen.getByText('DomainManagement')).toBeInTheDocument();
    expect(screen.getByText('RecordTypeManager')).toBeInTheDocument();
  });

  it('should show a login prompt if the user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<Settings />);

    expect(screen.getByText('Please log in to view settings.')).toBeInTheDocument();
  });
});