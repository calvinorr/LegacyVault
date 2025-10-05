import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VehiclesDomainPage from '../VehiclesDomainPage';
import * as domainsApi from '../../services/api/domains';

// Mock the API
jest.mock('../../services/api/domains');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe('VehiclesDomainPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('renders page header with Vehicles title', async () => {
    (domainsApi.getVehicleRecords as jest.Mock).mockResolvedValue([]);

    render(<VehiclesDomainPage />, { wrapper });

    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Manage vehicle details, MOT, insurance, road tax, and finance')).toBeInTheDocument();
  });

  it('shows empty state when no vehicles exist', async () => {
    (domainsApi.getVehicleRecords as jest.Mock).mockResolvedValue([]);

    render(<VehiclesDomainPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('No vehicle records yet. Add your first vehicle to get started.')).toBeInTheDocument();
    });
  });

  it('renders vehicle records when they exist', async () => {
    const mockVehicles = [
      {
        _id: '1',
        name: 'Family Car',
        recordType: 'vehicle-details',
        registration: 'AB12 CDE',
        make: 'Ford',
        model: 'Focus',
        priority: 'Standard',
        motExpiryDate: '2025-12-01',
        insuranceRenewalDate: '2025-11-01',
        roadTaxExpiryDate: '2025-10-15',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      },
      {
        _id: '2',
        name: 'Work Van',
        recordType: 'vehicle-details',
        registration: 'XY99 ZZZ',
        make: 'Mercedes',
        model: 'Sprinter',
        priority: 'Important',
        motExpiryDate: '2026-03-15',
        createdAt: '2025-01-02',
        updatedAt: '2025-01-02'
      }
    ];

    (domainsApi.getVehicleRecords as jest.Mock).mockResolvedValue(mockVehicles);

    render(<VehiclesDomainPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Family Car')).toBeInTheDocument();
      expect(screen.getByText('AB12 CDE')).toBeInTheDocument();
      expect(screen.getByText('Ford Focus')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Work Van')).toBeInTheDocument();
      expect(screen.getByText('XY99 ZZZ')).toBeInTheDocument();
      expect(screen.getByText('Mercedes Sprinter')).toBeInTheDocument();
    });
  });

  it('opens add vehicle form when Add Vehicle button is clicked', async () => {
    (domainsApi.getVehicleRecords as jest.Mock).mockResolvedValue([]);

    render(<VehiclesDomainPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Add Vehicle')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Vehicle');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add Vehicle Record')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching vehicles', () => {
    (domainsApi.getVehicleRecords as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<VehiclesDomainPage />, { wrapper });

    expect(screen.getByText('Loading vehicles...')).toBeInTheDocument();
  });
});
