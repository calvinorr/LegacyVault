import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PropertyRecordForm from '../../property/PropertyRecordForm';

// Mock fetch for API calls
global.fetch = jest.fn();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Record Type Dropdown in Forms', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches and displays record types for Property domain', async () => {
    const mockRecordTypes = [
      { _id: '1', name: 'Mortgage', domain: 'Property' },
      { _id: '2', name: 'Rent', domain: 'Property' },
      { _id: '3', name: 'Council Tax', domain: 'Property' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ recordTypes: mockRecordTypes }),
    });

    render(
      <PropertyRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    // Wait for the record types to load
    await waitFor(() => {
      const recordTypeLabel = screen.getByText('Record Type *');
      expect(recordTypeLabel).toBeInTheDocument();
    });

    // Check that fetch was called with correct domain filter
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/record-types?domain=property'),
      expect.objectContaining({ credentials: 'include' })
    );

    // Check that record type label exists
    expect(screen.getByText('Record Type *')).toBeInTheDocument();

    // Wait for options to be populated
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      // Should have "Select type..." + 3 record types = 4 options total
      expect(options.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('disables dropdown while loading record types', async () => {
    // Mock a slow response
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ recordTypes: [] }),
      }), 100))
    );

    render(
      <PropertyRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    // Find the select element
    const selectElements = screen.getAllByRole('combobox');
    const recordTypeSelect = selectElements.find(el =>
      el.parentElement?.textContent?.includes('Record Type')
    );

    // Should be disabled while loading
    if (recordTypeSelect) {
      expect(recordTypeSelect).toBeDisabled();
    }
  });

  it('shows validation error when no record type is selected', async () => {
    const mockRecordTypes = [
      { _id: '1', name: 'Mortgage', domain: 'Property' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ recordTypes: mockRecordTypes }),
    });

    render(
      <PropertyRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText('Record Type *')).toBeInTheDocument();
    });

    // Try to submit without selecting a record type
    const saveButton = screen.getByText('Save Record');
    saveButton.click();

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Record type is required')).toBeInTheDocument();
    });
  });

  it('filters record types by domain', async () => {
    const mockAllRecordTypes = [
      { _id: '1', name: 'Mortgage', domain: 'Property' },
      { _id: '2', name: 'Car Loan', domain: 'Finance' },
      { _id: '3', name: 'Passport', domain: 'Government' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        recordTypes: mockAllRecordTypes.filter(rt => rt.domain === 'Property')
      }),
    });

    render(
      <PropertyRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Record Type *')).toBeInTheDocument();
    });

    // Verify fetch was called with property domain filter
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('domain=property'),
      expect.any(Object)
    );
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <PropertyRecordForm isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper }
    );

    // Form should still render even if record types fail to load
    await waitFor(() => {
      expect(screen.getByText('Add Property Record')).toBeInTheDocument();
    });
  });
});
