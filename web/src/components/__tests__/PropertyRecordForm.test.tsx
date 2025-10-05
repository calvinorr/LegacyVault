import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PropertyRecordForm from '../property/PropertyRecordForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('PropertyRecordForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSuccess.mockClear();
  });

  it('renders form when isOpen is true', () => {
    render(
      <PropertyRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    expect(screen.getByText('Add Property Record')).toBeInTheDocument();
    expect(screen.getByText('Name *')).toBeInTheDocument();
    expect(screen.getByText('Record Type *')).toBeInTheDocument();
  });

  it('does not render form when isOpen is false', () => {
    render(
      <PropertyRecordForm isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    expect(screen.queryByText('Add Property Record')).not.toBeInTheDocument();
  });

  it('shows validation error when name is empty', async () => {
    render(
      <PropertyRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    const submitButton = screen.getByText('Save Record');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('shows validation error when record type is empty', async () => {
    render(
      <PropertyRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    const nameInput = screen.getByPlaceholderText('e.g., Main Mortgage, Electric Bill');
    fireEvent.change(nameInput, { target: { value: 'Test Property' } });

    const submitButton = screen.getByText('Save Record');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Record type is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid UK postcode', async () => {
    render(
      <PropertyRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    const nameInput = screen.getByPlaceholderText('e.g., Main Mortgage, Electric Bill');
    fireEvent.change(nameInput, { target: { value: 'Test Property' } });

    const postcodeInput = screen.getByPlaceholderText('e.g., SW1A 1AA');
    fireEvent.change(postcodeInput, { target: { value: 'INVALID' } });

    const submitButton = screen.getByText('Save Record');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid UK postcode format')).toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <PropertyRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal when clicking outside (overlay)', () => {
    render(
      <PropertyRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    const overlay = screen.getByText('Add Property Record').parentElement?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });
});
