import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FinanceRecordForm from '../finance/FinanceRecordForm';
import { createFinanceRecord } from '../../services/api/domains';

jest.mock('../../services/api/domains');

const mockCreateFinanceRecord = createFinanceRecord as jest.MockedFunction<
  typeof createFinanceRecord
>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderForm = (props = {}) => {
  const defaultProps = {
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <FinanceRecordForm {...defaultProps} {...props} />
    </QueryClientProvider>
  );
};

describe('FinanceRecordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all required fields', () => {
    renderForm();

    expect(screen.getByPlaceholderText(/e.g., Main Current Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Account Type \*/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., HSBC, Barclays/i)).toBeInTheDocument();
    expect(screen.getByText(/Priority/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const onSuccess = jest.fn();
    renderForm({ onSuccess });

    const submitButton = screen.getByRole('button', { name: /save account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('validates UK sort code format', async () => {
    renderForm();

    fireEvent.change(screen.getByPlaceholderText(/e.g., Main Current Account/i), {
      target: { value: 'Test Account' }
    });

    const typeSelects = screen.getAllByRole('combobox');
    fireEvent.change(typeSelects[0], { target: { value: 'current-account' } });

    fireEvent.change(screen.getByPlaceholderText(/e.g., HSBC, Barclays/i), {
      target: { value: 'HSBC' }
    });

    fireEvent.change(screen.getByPlaceholderText(/12-34-56/i), {
      target: { value: 'invalid' }
    });

    const submitButton = screen.getByRole('button', { name: /save account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid uk sort code format/i)
      ).toBeInTheDocument();
    });
  });

  it('shows conditional fields for savings account', () => {
    renderForm();

    const typeSelect = screen.getByLabelText(/account type/i);
    fireEvent.change(typeSelect, { target: { value: 'savings-account' } });

    expect(screen.getByLabelText(/interest rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maturity date/i)).toBeInTheDocument();
  });

  it('shows conditional fields for credit card', () => {
    renderForm();

    const typeSelect = screen.getByLabelText(/account type/i);
    fireEvent.change(typeSelect, { target: { value: 'credit-card' } });

    expect(screen.getByLabelText(/monthly payment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/credit limit/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const onSuccess = jest.fn();
    mockCreateFinanceRecord.mockResolvedValue({
      _id: '123',
      name: 'Main Account',
      recordType: 'current-account',
      institution: 'HSBC',
      priority: 'Standard',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    });

    renderForm({ onSuccess });

    fireEvent.change(screen.getByLabelText(/account name/i), {
      target: { value: 'Main Account' }
    });

    fireEvent.change(screen.getByLabelText(/account type/i), {
      target: { value: 'current-account' }
    });

    fireEvent.change(screen.getByLabelText(/financial institution/i), {
      target: { value: 'HSBC' }
    });

    fireEvent.change(screen.getByLabelText(/sort code/i), {
      target: { value: '12-34-56' }
    });

    const submitButton = screen.getByRole('button', { name: /save account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateFinanceRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Main Account',
          recordType: 'current-account',
          institution: 'HSBC',
          sortCode: '12-34-56'
        })
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    const onSuccess = jest.fn();
    mockCreateFinanceRecord.mockRejectedValue(new Error('Network error'));

    renderForm({ onSuccess });

    fireEvent.change(screen.getByLabelText(/account name/i), {
      target: { value: 'Test Account' }
    });

    fireEvent.change(screen.getByLabelText(/account type/i), {
      target: { value: 'current-account' }
    });

    fireEvent.change(screen.getByLabelText(/financial institution/i), {
      target: { value: 'HSBC' }
    });

    const submitButton = screen.getByRole('button', { name: /save account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = jest.fn();
    renderForm({ onCancel });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('populates form with initial data when editing', () => {
    const initialData = {
      _id: '123',
      name: 'Existing Account',
      recordType: 'savings-account',
      institution: 'Barclays',
      currentBalance: 5000,
      priority: 'Important' as const,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    };

    renderForm({ initialData });

    expect(screen.getByDisplayValue('Existing Account')).toBeInTheDocument();
    expect(screen.getByDisplayValue('savings-account')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Barclays')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Important')).toBeInTheDocument();
  });

  it('masks account number input as password', () => {
    renderForm();

    const accountNumberInput = screen.getByLabelText(/account number/i);
    expect(accountNumberInput).toHaveAttribute('type', 'password');
  });

  it('includes contact information fields', () => {
    renderForm();

    expect(screen.getByLabelText(/contact phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact email/i)).toBeInTheDocument();
  });

  it('includes notes textarea', () => {
    renderForm();

    const notesField = screen.getByPlaceholderText(/additional information/i);
    expect(notesField).toBeInTheDocument();
    expect(notesField.tagName).toBe('TEXTAREA');
  });
});
