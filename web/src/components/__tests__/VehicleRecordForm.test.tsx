import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VehicleRecordForm from '../vehicles/VehicleRecordForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('VehicleRecordForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSuccess.mockClear();
  });

  it('renders form when isOpen is true', () => {
    render(
      <VehicleRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    expect(screen.getByText('Add Vehicle Record')).toBeInTheDocument();
    expect(screen.getByText('Name *')).toBeInTheDocument();
    expect(screen.getByText('Record Type *')).toBeInTheDocument();
  });

  it('does not render form when isOpen is false', () => {
    render(
      <VehicleRecordForm isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    expect(screen.queryByText('Add Vehicle Record')).not.toBeInTheDocument();
  });

  it('shows validation error when name is empty', async () => {
    render(
      <VehicleRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    const submitButton = screen.getByText('Save Vehicle');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('shows validation error when record type is empty', async () => {
    render(
      <VehicleRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    const nameInput = screen.getByPlaceholderText('e.g., Family Car, Work Van');
    fireEvent.change(nameInput, { target: { value: 'Test Vehicle' } });

    const submitButton = screen.getByText('Save Vehicle');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Record type is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid UK registration plate', async () => {
    render(
      <VehicleRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    const nameInput = screen.getByPlaceholderText('e.g., Family Car, Work Van');
    fireEvent.change(nameInput, { target: { value: 'Test Vehicle' } });

    const registrationInput = screen.getByPlaceholderText('e.g., AB12 CDE');
    fireEvent.change(registrationInput, { target: { value: 'INVALID123' } });

    const submitButton = screen.getByText('Save Vehicle');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid UK/NI registration plate format')).toBeInTheDocument();
    });
  });

  it('accepts valid UK registration plate formats', async () => {
    render(
      <VehicleRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    const nameInput = screen.getByPlaceholderText('e.g., Family Car, Work Van');
    fireEvent.change(nameInput, { target: { value: 'Test Vehicle' } });

    const registrationInput = screen.getByPlaceholderText('e.g., AB12 CDE');
    fireEvent.change(registrationInput, { target: { value: 'AB12 CDE' } });

    const submitButton = screen.getByText('Save Vehicle');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('Invalid UK/NI registration plate format')).not.toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <VehicleRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal when clicking Cancel button', () => {
    render(
      <VehicleRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    const cancelButton = screen.getAllByText('Cancel')[0];
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders all vehicle-specific form sections', () => {
    render(
      <VehicleRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    expect(screen.getAllByText('Vehicle Details').length).toBeGreaterThan(0);
    expect(screen.getByText('Finance Details')).toBeInTheDocument();
    expect(screen.getByText('Renewal Dates')).toBeInTheDocument();
    expect(screen.getByText('Additional Details')).toBeInTheDocument();
  });
});
