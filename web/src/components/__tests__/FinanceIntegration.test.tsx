import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import FinanceDomainPage from '../../pages/FinanceDomainPage';
import FinanceRecordDetailPage from '../../pages/FinanceRecordDetailPage';
import { maskAccountNumber, maskSortCode } from '../../utils/dataMasking';
import {
  getFinanceRecords,
  getFinanceRecord,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord
} from '../../services/api/domains';

jest.mock('../../services/api/domains');

const mockGetFinanceRecords = getFinanceRecords as jest.MockedFunction<
  typeof getFinanceRecords
>;
const mockGetFinanceRecord = getFinanceRecord as jest.MockedFunction<
  typeof getFinanceRecord
>;
const mockCreateFinanceRecord = createFinanceRecord as jest.MockedFunction<
  typeof createFinanceRecord
>;
const mockUpdateFinanceRecord = updateFinanceRecord as jest.MockedFunction<
  typeof updateFinanceRecord
>;
const mockDeleteFinanceRecord = deleteFinanceRecord as jest.MockedFunction<
  typeof deleteFinanceRecord
>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Finance Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('Create Finance Record Flow', () => {
    it('creates a new finance record end-to-end', async () => {
      mockGetFinanceRecords.mockResolvedValue([]);
      mockCreateFinanceRecord.mockResolvedValue({
        _id: 'new-123',
        name: 'Main Current Account',
        recordType: 'current-account',
        institution: 'HSBC',
        accountNumber: '12345678',
        sortCode: '12-34-56',
        currentBalance: 1000,
        priority: 'Standard',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      });

      renderWithRouter(<FinanceDomainPage />);

      // Wait for empty state
      await waitFor(() => {
        expect(screen.getByText(/no finance records yet/i)).toBeInTheDocument();
      });

      // Open form
      const addButton = screen.getByRole('button', { name: /add account/i });
      fireEvent.click(addButton);

      // Fill form
      await waitFor(() => {
        expect(screen.getByLabelText(/account name/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/account name/i), {
        target: { value: 'Main Current Account' }
      });

      fireEvent.change(screen.getByLabelText(/account type/i), {
        target: { value: 'current-account' }
      });

      fireEvent.change(screen.getByLabelText(/financial institution/i), {
        target: { value: 'HSBC' }
      });

      // Submit
      const saveButton = screen.getByRole('button', { name: /save account/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateFinanceRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Main Current Account',
            recordType: 'current-account',
            institution: 'HSBC'
          })
        );
      });
    });
  });

  describe('Edit Finance Record Flow', () => {
    it('updates an existing finance record', async () => {
      const existingRecord = {
        _id: 'edit-123',
        name: 'Savings Account',
        recordType: 'savings-account',
        institution: 'Barclays',
        currentBalance: 5000,
        priority: 'Standard' as const,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      mockGetFinanceRecord.mockResolvedValue(existingRecord);
      mockUpdateFinanceRecord.mockResolvedValue({
        ...existingRecord,
        currentBalance: 6000,
        updatedAt: '2025-01-02'
      });

      renderWithRouter(<FinanceRecordDetailPage />);

      // Wait for record to load
      await waitFor(() => {
        expect(screen.getByText('Savings Account')).toBeInTheDocument();
      });

      // Click edit
      const editButton = screen.getByRole('button', { name: '' }); // Pencil icon button
      fireEvent.click(editButton);

      // Update balance
      await waitFor(() => {
        const balanceInput = screen.getByLabelText(/current balance/i);
        fireEvent.change(balanceInput, { target: { value: '6000' } });
      });

      // Save
      const updateButton = screen.getByRole('button', { name: /update account/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateFinanceRecord).toHaveBeenCalledWith(
          'edit-123',
          expect.objectContaining({
            currentBalance: 6000
          })
        );
      });
    });
  });

  describe('Delete Finance Record Flow', () => {
    it('deletes a finance record with confirmation', async () => {
      const recordToDelete = {
        _id: 'delete-123',
        name: 'Old Account',
        recordType: 'current-account',
        institution: 'NatWest',
        priority: 'Standard' as const,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      mockGetFinanceRecord.mockResolvedValue(recordToDelete);
      mockDeleteFinanceRecord.mockResolvedValue();

      const mockNavigate = jest.fn();
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate
      }));

      renderWithRouter(<FinanceRecordDetailPage />);

      // Wait for record to load
      await waitFor(() => {
        expect(screen.getByText('Old Account')).toBeInTheDocument();
      });

      // First click shows confirmation
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find((btn) =>
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      );
      fireEvent.click(deleteButton!);

      await waitFor(() => {
        expect(
          screen.getByText(/click delete again to confirm/i)
        ).toBeInTheDocument();
      });

      // Second click deletes
      fireEvent.click(deleteButton!);

      await waitFor(() => {
        expect(mockDeleteFinanceRecord).toHaveBeenCalledWith('delete-123');
      });
    });
  });

  describe('Sensitive Data Masking', () => {
    it('masks account number and sort code by default', async () => {
      const recordWithSensitiveData = {
        _id: 'mask-123',
        name: 'Secure Account',
        recordType: 'current-account',
        institution: 'HSBC',
        accountNumber: '12345678',
        sortCode: '12-34-56',
        priority: 'Standard' as const,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      mockGetFinanceRecords.mockResolvedValue([recordWithSensitiveData]);

      renderWithRouter(<FinanceDomainPage />);

      await waitFor(() => {
        expect(screen.getByText(/secure account/i)).toBeInTheDocument();
      });

      // Verify masked values are shown
      expect(screen.getByText(maskAccountNumber('12345678'))).toBeInTheDocument();
      expect(screen.getByText(maskSortCode('12-34-56'))).toBeInTheDocument();

      // Verify full values are NOT shown
      expect(screen.queryByText('12345678')).not.toBeInTheDocument();
      expect(screen.queryByText('12-34-56')).not.toBeInTheDocument();
    });

    it('reveals sensitive data when toggle clicked', async () => {
      const recordWithSensitiveData = {
        _id: 'reveal-123',
        name: 'Test Account',
        recordType: 'current-account',
        institution: 'Barclays',
        accountNumber: '87654321',
        sortCode: '65-43-21',
        priority: 'Standard' as const,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      mockGetFinanceRecord.mockResolvedValue(recordWithSensitiveData);

      renderWithRouter(<FinanceRecordDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Account')).toBeInTheDocument();
      });

      // Initially masked
      expect(screen.getByText(maskAccountNumber('87654321'))).toBeInTheDocument();

      // Click show button
      const showButtons = screen.getAllByRole('button', { name: /show/i });
      fireEvent.click(showButtons[0]);

      // Now revealed
      await waitFor(() => {
        expect(screen.getByText('87654321')).toBeInTheDocument();
      });
    });
  });

  describe('Data Masking Utilities', () => {
    it('masks account numbers correctly', () => {
      expect(maskAccountNumber('12345678')).toBe('**** 5678');
      expect(maskAccountNumber('123')).toBe('****');
      expect(maskAccountNumber('')).toBe('****');
    });

    it('masks sort codes correctly', () => {
      expect(maskSortCode('12-34-56')).toBe('**-**-56');
      expect(maskSortCode('invalid')).toBe('**-**-**');
      expect(maskSortCode('')).toBe('**-**-**');
    });
  });
});
