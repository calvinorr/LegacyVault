// web/src/pages/__tests__/EmergencyViewPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmergencyViewPage from '../EmergencyViewPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

// Mock the useCriticalRecords hook
jest.mock('../../hooks/useCriticalRecords', () => ({
  useCriticalRecords: jest.fn(),
  useEmergencyChecklist: jest.fn(),
}));

import { useCriticalRecords, useEmergencyChecklist } from '../../hooks/useCriticalRecords';

const mockCriticalRecords = [
  {
    id: '1',
    domain: 'property',
    name: 'Home Insurance',
    recordType: 'home-insurance',
    contactPhone: '0800 111 2222',
    contactEmail: 'home@insurance.co.uk',
    priority: 'Critical',
    notes: 'Annual renewal due March',
    domainUrl: '/property/1',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    domain: 'vehicles',
    name: 'Car Insurance',
    recordType: 'car-insurance',
    contactPhone: '0800 333 4444',
    priority: 'Critical',
    domainUrl: '/vehicles/2',
    updatedAt: '2025-01-02T00:00:00Z',
  },
];

describe('EmergencyViewPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for useEmergencyChecklist
    (useEmergencyChecklist as jest.Mock).mockReturnValue({
      data: { checklist: {} },
      isLoading: false,
    } as any);
  });

  it('renders loading state', () => {
    (useCriticalRecords as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EmergencyViewPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading critical records...')).toBeInTheDocument();
  });

  it('renders emergency information header', () => {
    (useCriticalRecords as jest.Mock).mockReturnValue({
      data: { criticalRecords: mockCriticalRecords, count: 2 },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EmergencyViewPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Emergency Information')).toBeInTheDocument();
    expect(screen.getByText('Quick access to critical household information')).toBeInTheDocument();
  });

  it('renders print and PDF buttons', () => {
    (useCriticalRecords as jest.Mock).mockReturnValue({
      data: { criticalRecords: mockCriticalRecords, count: 2 },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EmergencyViewPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Print')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('renders critical records grouped by domain', () => {
    (useCriticalRecords as jest.Mock).mockReturnValue({
      data: { criticalRecords: mockCriticalRecords, count: 2 },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EmergencyViewPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Property (1)')).toBeInTheDocument();
    expect(screen.getByText('Vehicles (1)')).toBeInTheDocument();
    expect(screen.getByText('Home Insurance')).toBeInTheDocument();
    expect(screen.getByText('Car Insurance')).toBeInTheDocument();
  });

  it('shows empty state when no critical records', () => {
    (useCriticalRecords as jest.Mock).mockReturnValue({
      data: { criticalRecords: [], count: 0 },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EmergencyViewPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('No critical records found.')).toBeInTheDocument();
    expect(
      screen.getByText(/Mark important records as 'Critical' priority/i)
    ).toBeInTheDocument();
  });

  it('filters records by search query', async () => {
    (useCriticalRecords as jest.Mock).mockReturnValue({
      data: { criticalRecords: mockCriticalRecords, count: 2 },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EmergencyViewPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText('Search critical records...');
    fireEvent.change(searchInput, { target: { value: 'Home' } });

    await waitFor(() => {
      expect(screen.getByText('Home Insurance')).toBeInTheDocument();
      expect(screen.queryByText('Car Insurance')).not.toBeInTheDocument();
    });
  });

  it('filters records by domain', async () => {
    (useCriticalRecords as jest.Mock).mockReturnValue({
      data: { criticalRecords: mockCriticalRecords, count: 2 },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EmergencyViewPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const propertyButton = screen.getByText('Property');
    fireEvent.click(propertyButton);

    await waitFor(() => {
      expect(screen.getByText('Home Insurance')).toBeInTheDocument();
      expect(screen.queryByText('Car Insurance')).not.toBeInTheDocument();
    });
  });

  it('calls window.print when print button clicked', () => {
    const mockPrint = jest.fn();
    window.print = mockPrint;

    (useCriticalRecords as jest.Mock).mockReturnValue({
      data: { criticalRecords: mockCriticalRecords, count: 2 },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EmergencyViewPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const printButton = screen.getByText('Print');
    fireEvent.click(printButton);

    expect(mockPrint).toHaveBeenCalled();
  });
});
