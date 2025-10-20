import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ServicesDirectory from '../ServicesDirectory';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

// Mock the useParentEntities hook
jest.mock('../../../hooks/useParentEntities', () => ({
  useParentEntities: jest.fn(() => ({
    data: {
      entities: [
        {
          _id: '1',
          name: 'ABC Plumbing',
          domainType: 'Services',
          fields: {
            serviceType: 'plumber',
            contactName: 'John Doe',
            phone: '123-456-7890',
            email: 'john@abcplumbing.com',
          },
          childRecordCount: 3,
        },
        {
          _id: '2',
          name: 'Electric Pro',
          domainType: 'Services',
          fields: {
            serviceType: 'electrician',
            contactName: 'Jane Smith',
            phone: '098-765-4321',
          },
          childRecordCount: 1,
        },
      ],
      total: 2,
    },
    isLoading: false,
    error: null,
  })),
}));

describe('ServicesDirectory', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('should render services directory with list of providers', () => {
    render(<ServicesDirectory />, { wrapper });
    expect(screen.getByText('ABC Plumbing')).toBeInTheDocument();
    expect(screen.getByText('Electric Pro')).toBeInTheDocument();
  });

  it('should display search bar and filter', () => {
    render(<ServicesDirectory />, { wrapper });
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should filter providers by search term', async () => {
    render(<ServicesDirectory />, { wrapper });

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'ABC' } });

    await waitFor(() => {
      expect(screen.getByText('ABC Plumbing')).toBeInTheDocument();
    });
  });

  it('should show Add Service Provider button', () => {
    render(<ServicesDirectory />, { wrapper });
    expect(screen.getByText(/add service provider/i)).toBeInTheDocument();
  });
});
