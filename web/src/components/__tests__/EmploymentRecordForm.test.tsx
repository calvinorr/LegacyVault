import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmploymentRecordForm from '../employment/EmploymentRecordForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('EmploymentRecordForm', () => {
  it('renders employment record form', () => {
    const onSuccess = vi.fn();
    const onCancel = vi.fn();

    render(
      <EmploymentRecordForm onSuccess={onSuccess} onCancel={onCancel} />,
      { wrapper }
    );

    expect(screen.getByText('Record Name *')).toBeInTheDocument();
    expect(screen.getByText('Record Type *')).toBeInTheDocument();
  });

  it('shows validation error when name is empty', async () => {
    const onSuccess = vi.fn();
    const onCancel = vi.fn();

    render(
      <EmploymentRecordForm onSuccess={onSuccess} onCancel={onCancel} />,
      { wrapper }
    );

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Record name is required')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onSuccess = vi.fn();
    const onCancel = vi.fn();

    render(
      <EmploymentRecordForm onSuccess={onSuccess} onCancel={onCancel} />,
      { wrapper }
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });
});
