import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ParentEntityForm from '../ParentEntityForm';
import * as hooks from '../../../hooks/useParentEntities';

jest.mock('../../../hooks/useParentEntities');

const mockHooks = hooks as jest.Mocked<typeof hooks>;

describe('ParentEntityForm', () => {
  let queryClient: QueryClient;
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    mockHooks.useCreateParentEntity.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      data: undefined,
      error: null,
      mutate: jest.fn(),
      reset: jest.fn(),
      status: 'idle',
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      isPaused: false,
      submittedAt: 0
    });

    mockHooks.useUpdateParentEntity.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      data: undefined,
      error: null,
      mutate: jest.fn(),
      reset: jest.fn(),
      status: 'idle',
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      isPaused: false,
      submittedAt: 0
    });

    jest.clearAllMocks();
  });

  const renderForm = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ParentEntityForm
          domain="vehicles"
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  it('renders vehicle form with all fields', () => {
    renderForm();

    expect(screen.getByText('Add New Vehicle')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('2019 Honda Civic')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Honda')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Civic')).toBeInTheDocument();
  });

  it('renders property form with address field', () => {
    renderForm({ domain: 'properties' });

    expect(screen.getByText('Add New Property')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Primary Residence')).toBeInTheDocument();
  });

  it('renders employment form with job fields', () => {
    renderForm({ domain: 'employments' });

    expect(screen.getByText('Add New Employment')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Acme Corp - Software Engineer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Acme Corporation')).toBeInTheDocument();
  });

  it('renders services form with service-specific fields', () => {
    renderForm({ domain: 'services' });

    expect(screen.getByText('Add New Service Provider')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('McGrath Plumbing')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('McGrath Plumbing Ltd')).toBeInTheDocument();
  });

  it('validates required name field', async () => {
    renderForm();

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('validates max length for name field', async () => {
    renderForm();

    const nameInput = screen.getByPlaceholderText('2019 Honda Civic');
    const longName = 'a'.repeat(101);
    fireEvent.change(nameInput, { target: { value: longName } });

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be 100 characters or less/i)).toBeInTheDocument();
    });
  });

  it('validates year range for vehicle form', async () => {
    renderForm({ domain: 'vehicles' });

    const yearInput = screen.getByPlaceholderText('2019');
    fireEvent.change(yearInput, { target: { value: '1800' } });

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Year must be 1900 or later/i)).toBeInTheDocument();
    });
  });

  it('validates postcode format for property form', async () => {
    renderForm({ domain: 'properties' });

    const nameInput = screen.getByPlaceholderText('Primary Residence');
    fireEvent.change(nameInput, { target: { value: 'My House' } });

    const addressInput = screen.getByPlaceholderText(/123 Main Street/);
    fireEvent.change(addressInput, { target: { value: '123 Main St' } });

    const postcodeInput = screen.getByPlaceholderText('BT1 1AA');
    fireEvent.change(postcodeInput, { target: { value: 'INVALID' } });

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid UK postcode format/i)).toBeInTheDocument();
    });
  });

  it('validates phone format for services form', async () => {
    renderForm({ domain: 'services' });

    const nameInput = screen.getByPlaceholderText('McGrath Plumbing');
    fireEvent.change(nameInput, { target: { value: 'Test Service' } });

    const phoneInput = screen.getByPlaceholderText('028-1234-5678');
    fireEvent.change(phoneInput, { target: { value: '123' } });

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid NI phone format/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockMutateAsync.mockResolvedValue({});

    renderForm();

    const nameInput = screen.getByPlaceholderText('2019 Honda Civic');
    fireEvent.change(nameInput, { target: { value: 'Test Vehicle' } });

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Test Vehicle',
        fields: {}
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', () => {
    renderForm();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    const { container } = renderForm({ isOpen: false });

    expect(container).toBeEmptyDOMElement();
  });
});
