import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '../HomePage';

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

describe('HomePage', () => {
  it('renders Life Domains heading', () => {
    render(<HomePage />, { wrapper });

    expect(screen.getByText('Life Domains')).toBeInTheDocument();
    expect(screen.getByText('Organize your household information by life area')).toBeInTheDocument();
  });

  it('renders all 8 domain cards', () => {
    render(<HomePage />, { wrapper });

    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Employment')).toBeInTheDocument();
    expect(screen.getByText('Government')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Insurance & Protection')).toBeInTheDocument();
    expect(screen.getByText('Legal & Estate')).toBeInTheDocument();
    expect(screen.getByText('Household Services')).toBeInTheDocument();
  });

  it('shows Coming Soon for disabled domains', () => {
    render(<HomePage />, { wrapper });

    const comingSoonElements = screen.getAllByText('Coming Soon');
    expect(comingSoonElements).toHaveLength(6); // All except Property and Vehicles
  });

  it('shows Property and Vehicles domains as enabled', () => {
    render(<HomePage />, { wrapper });

    const propertyCard = screen.getByText('Property').closest('div');
    expect(propertyCard).not.toHaveClass('cursor-not-allowed');

    const vehiclesCard = screen.getByText('Vehicles').closest('div');
    expect(vehiclesCard).not.toHaveClass('cursor-not-allowed');
  });
});
