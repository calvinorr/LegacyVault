import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RecordTypeManager from '../record-types/RecordTypeManager';

// Mock the useRecordTypes hook
const mockUseRecordTypes = jest.fn();
jest.mock('@/hooks/useRecordTypes', () => ({
  useRecordTypes: (...args: any[]) => mockUseRecordTypes(...args),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const defaultMockData = {
  recordTypes: [
    { _id: '1', name: 'Mortgage', domain: 'Property' },
    { _id: '2', name: 'Rent', domain: 'Property' },
    { _id: '3', name: 'Car Loan', domain: 'Finance' },
    { _id: '4', name: 'Passport', domain: 'Government' },
  ],
  loading: false,
  error: null,
  addRecordType: jest.fn(),
  updateRecordType: jest.fn(),
  deleteRecordType: jest.fn(),
};

describe('RecordTypeManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRecordTypes.mockReturnValue(defaultMockData);
  });

  it('renders the record type management section', () => {
    render(<RecordTypeManager />, { wrapper });

    expect(screen.getByText('Record Type Management')).toBeInTheDocument();
    expect(screen.getByText('Manage the types of records available for each life domain')).toBeInTheDocument();
  });

  it('displays add button', () => {
    render(<RecordTypeManager />, { wrapper });

    expect(screen.getByText('+ Add Record Type')).toBeInTheDocument();
  });

  it('groups record types by domain', () => {
    render(<RecordTypeManager />, { wrapper });

    // Check for domain headers
    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Government')).toBeInTheDocument();

    // Check for record types under domains
    expect(screen.getByText('Mortgage')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('Car Loan')).toBeInTheDocument();
    expect(screen.getByText('Passport')).toBeInTheDocument();
  });

  it('shows empty state message for domains without types', () => {
    render(<RecordTypeManager />, { wrapper });

    // Vehicle domain should have no types in mock data - check for empty state text
    expect(screen.getByText(/No record types defined. Add your first vehicle type/i)).toBeInTheDocument();
  });

  it('opens add form when Add button is clicked', () => {
    render(<RecordTypeManager />, { wrapper });

    const addButton = screen.getByText('+ Add Record Type');
    fireEvent.click(addButton);

    expect(screen.getByText('Add Record Type')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Domain')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseRecordTypes.mockReturnValue({
      recordTypes: [],
      loading: true,
      error: null,
      addRecordType: jest.fn(),
      updateRecordType: jest.fn(),
      deleteRecordType: jest.fn(),
    });

    render(<RecordTypeManager />, { wrapper });

    expect(screen.getByText('Loading record types...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockUseRecordTypes.mockReturnValue({
      recordTypes: [],
      loading: false,
      error: 'Failed to fetch record types',
      addRecordType: jest.fn(),
      updateRecordType: jest.fn(),
      deleteRecordType: jest.fn(),
    });

    render(<RecordTypeManager />, { wrapper });

    expect(screen.getByText('Failed to fetch record types')).toBeInTheDocument();
  });

  it('provides edit button for each record type', () => {
    render(<RecordTypeManager />, { wrapper });

    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('provides delete button for each record type', () => {
    render(<RecordTypeManager />, { wrapper });

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('opens edit form when Edit button is clicked', () => {
    render(<RecordTypeManager />, { wrapper });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Record Type')).toBeInTheDocument();
  });

  it('shows confirmation dialog when Delete button is clicked', () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);

    render(<RecordTypeManager />, { wrapper });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this record type?');

    mockConfirm.mockRestore();
  });

  it('displays all 8 life domains', () => {
    render(<RecordTypeManager />, { wrapper });

    const domains = ['Property', 'Vehicle', 'Employment', 'Government', 'Insurance', 'Legal', 'Services', 'Finance'];

    domains.forEach(domain => {
      expect(screen.getByText(domain)).toBeInTheDocument();
    });
  });

  it('displays Collapse All and Expand All buttons', () => {
    render(<RecordTypeManager />, { wrapper });

    expect(screen.getByText('Collapse All')).toBeInTheDocument();
    expect(screen.getByText('Expand All')).toBeInTheDocument();
  });

  it('displays count badges for each domain', () => {
    render(<RecordTypeManager />, { wrapper });

    // Property has 2 record types
    expect(screen.getByText('(2)')).toBeInTheDocument();
    // Finance and Government each have 1 record type - check for multiple (1)
    const countOnes = screen.getAllByText('(1)');
    expect(countOnes.length).toBeGreaterThanOrEqual(2);
    // Multiple domains have 0 record types (Vehicle, Employment, Insurance, Legal, Services)
    const countZeros = screen.getAllByText('(0)');
    expect(countZeros.length).toBeGreaterThanOrEqual(1);
  });

  it('toggles domain collapse when header is clicked', () => {
    render(<RecordTypeManager />, { wrapper });

    // Initially expanded - should see record types
    expect(screen.getByText('Mortgage')).toBeInTheDocument();

    // Click Property header to collapse
    const propertyHeader = screen.getByText('Property').closest('button');
    if (propertyHeader) {
      fireEvent.click(propertyHeader);
    }

    // Record types should be hidden after collapse
    expect(screen.queryByText('Mortgage')).not.toBeInTheDocument();
  });

  it('collapses all domains when Collapse All is clicked', () => {
    render(<RecordTypeManager />, { wrapper });

    // Initially expanded - should see record types
    expect(screen.getByText('Mortgage')).toBeInTheDocument();
    expect(screen.getByText('Car Loan')).toBeInTheDocument();

    // Click Collapse All
    const collapseAllButton = screen.getByText('Collapse All');
    fireEvent.click(collapseAllButton);

    // All record types should be hidden
    expect(screen.queryByText('Mortgage')).not.toBeInTheDocument();
    expect(screen.queryByText('Car Loan')).not.toBeInTheDocument();
  });

  it('expands all domains when Expand All is clicked after collapse', () => {
    render(<RecordTypeManager />, { wrapper });

    // Collapse all first
    const collapseAllButton = screen.getByText('Collapse All');
    fireEvent.click(collapseAllButton);

    expect(screen.queryByText('Mortgage')).not.toBeInTheDocument();

    // Click Expand All
    const expandAllButton = screen.getByText('Expand All');
    fireEvent.click(expandAllButton);

    // Record types should be visible again
    expect(screen.getByText('Mortgage')).toBeInTheDocument();
    expect(screen.getByText('Car Loan')).toBeInTheDocument();
  });

  it('shows inline add button in empty state', () => {
    render(<RecordTypeManager />, { wrapper });

    // Vehicle domain has no types, should show inline + Add button
    const addButtons = screen.getAllByText('+ Add');
    expect(addButtons.length).toBeGreaterThan(0);
  });
});
