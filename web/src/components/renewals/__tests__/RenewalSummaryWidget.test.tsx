// web/src/components/renewals/__tests__/RenewalSummaryWidget.test.tsx

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RenewalSummaryWidget from '../RenewalSummaryWidget';
import * as useRenewalSummaryModule from '../../../hooks/useRenewalSummary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe('RenewalSummaryWidget', () => {
  it('renders nothing when loading', () => {
    jest.spyOn(useRenewalSummaryModule, 'useRenewalSummary').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
      isError: false,
      isFetching: false,
      isPending: true,
      isSuccess: false,
      status: 'pending'
    } as any);

    const { container } = render(<RenewalSummaryWidget />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when no renewals', () => {
    jest.spyOn(useRenewalSummaryModule, 'useRenewalSummary').mockReturnValue({
      data: { overdue: 0, next7Days: 0, next30Days: 0, total: 0 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      isError: false,
      isFetching: false,
      isPending: false,
      isSuccess: true,
      status: 'success'
    } as any);

    const { container } = render(<RenewalSummaryWidget />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('displays renewal summary counts', () => {
    jest.spyOn(useRenewalSummaryModule, 'useRenewalSummary').mockReturnValue({
      data: { overdue: 2, next7Days: 5, next30Days: 8, total: 15 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      isError: false,
      isFetching: false,
      isPending: false,
      isSuccess: true,
      status: 'success'
    } as any);

    render(<RenewalSummaryWidget />, { wrapper });

    expect(screen.getByText('Upcoming Renewals')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // overdue count
    expect(screen.getByText('5')).toBeInTheDocument(); // next7Days count
    expect(screen.getByText('8')).toBeInTheDocument(); // next30Days count
  });

  it('shows overdue section when there are overdue renewals', () => {
    jest.spyOn(useRenewalSummaryModule, 'useRenewalSummary').mockReturnValue({
      data: { overdue: 3, next7Days: 0, next30Days: 0, total: 3 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      isError: false,
      isFetching: false,
      isPending: false,
      isSuccess: true,
      status: 'success'
    } as any);

    render(<RenewalSummaryWidget />, { wrapper });

    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('has link to view all renewals', () => {
    jest.spyOn(useRenewalSummaryModule, 'useRenewalSummary').mockReturnValue({
      data: { overdue: 0, next7Days: 2, next30Days: 3, total: 5 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      isError: false,
      isFetching: false,
      isPending: false,
      isSuccess: true,
      status: 'success'
    } as any);

    render(<RenewalSummaryWidget />, { wrapper });

    const viewAllLink = screen.getByText('View All Renewals');
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink.closest('a')).toHaveAttribute('href', '/renewals');
  });

  it('has filterable links for each time period', () => {
    jest.spyOn(useRenewalSummaryModule, 'useRenewalSummary').mockReturnValue({
      data: { overdue: 1, next7Days: 2, next30Days: 3, total: 6 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      isError: false,
      isFetching: false,
      isPending: false,
      isSuccess: true,
      status: 'success'
    } as any);

    render(<RenewalSummaryWidget />, { wrapper });

    // Find links by their container elements
    const overdueLink = screen.getByText('Overdue').closest('a');
    const next7DaysLink = screen.getByText('Next 7 Days').closest('a');
    const next30DaysLink = screen.getByText('Next 30 Days').closest('a');

    expect(overdueLink).toHaveAttribute('href', '/renewals?filter=overdue');
    expect(next7DaysLink).toHaveAttribute('href', '/renewals?filter=7days');
    expect(next30DaysLink).toHaveAttribute('href', '/renewals?filter=30days');
  });
});
