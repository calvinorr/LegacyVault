// web/src/components/emergency/__tests__/EmergencyChecklist.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmergencyChecklist from '../EmergencyChecklist';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

// Mock the useEmergencyChecklist hook
jest.mock('../../../hooks/useCriticalRecords', () => ({
  useEmergencyChecklist: jest.fn(),
}));

import { useEmergencyChecklist } from '../../../hooks/useCriticalRecords';

const mockChecklistData = {
  checklist: {
    property: { criticalCount: 2, recommendation: 'OK' },
    vehicles: { criticalCount: 1, recommendation: 'OK' },
    finance: { criticalCount: 0, recommendation: 'Add critical records' },
    employment: { criticalCount: 1, recommendation: 'OK' },
    government: { criticalCount: 0, recommendation: 'Add critical records' },
    insurance: { criticalCount: 3, recommendation: 'OK' },
    legal: { criticalCount: 0, recommendation: 'Add critical records' },
    services: { criticalCount: 2, recommendation: 'OK' },
  },
};

describe('EmergencyChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useEmergencyChecklist as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <EmergencyChecklist />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading checklist...')).toBeInTheDocument();
  });

  it('renders checklist header with total count', () => {
    (useEmergencyChecklist as jest.Mock).mockReturnValue({
      data: mockChecklistData,
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <EmergencyChecklist />
      </QueryClientProvider>
    );

    expect(screen.getByText('Emergency Preparedness')).toBeInTheDocument();
    expect(screen.getByText('9 critical records')).toBeInTheDocument();
  });

  it('renders all domain categories', () => {
    (useEmergencyChecklist as jest.Mock).mockReturnValue({
      data: mockChecklistData,
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <EmergencyChecklist />
      </QueryClientProvider>
    );

    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Insurance')).toBeInTheDocument();
  });

  it('shows correct critical counts for each domain', () => {
    (useEmergencyChecklist as jest.Mock).mockReturnValue({
      data: mockChecklistData,
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <EmergencyChecklist />
      </QueryClientProvider>
    );

    // Check that critical counts are displayed
    const criticalTexts = screen.getAllByText(/\d+ critical/);
    expect(criticalTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('3 critical')).toBeInTheDocument(); // Insurance (unique count)
  });

  it('shows tip when no critical records exist', () => {
    const emptyChecklist = {
      checklist: {
        property: { criticalCount: 0, recommendation: 'Add critical records' },
        vehicles: { criticalCount: 0, recommendation: 'Add critical records' },
        finance: { criticalCount: 0, recommendation: 'Add critical records' },
        employment: { criticalCount: 0, recommendation: 'Add critical records' },
        government: { criticalCount: 0, recommendation: 'Add critical records' },
        insurance: { criticalCount: 0, recommendation: 'Add critical records' },
        legal: { criticalCount: 0, recommendation: 'Add critical records' },
        services: { criticalCount: 0, recommendation: 'Add critical records' },
      },
    };

    (useEmergencyChecklist as jest.Mock).mockReturnValue({
      data: emptyChecklist,
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <EmergencyChecklist />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Tip:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Mark important records as "Critical" priority/i)
    ).toBeInTheDocument();
  });
});
