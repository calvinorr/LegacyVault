import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BankImport from '../../pages/BankImport';

// Mock the useAuth hook
const mockUser = { role: 'admin', email: 'admin@test.com' };
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('BankImport - Create Entry Functionality', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    
    // Mock the sessions API response
    (global.fetch as any).mockImplementation((url: string) => {
      if (url === '/api/import/sessions') {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Map([['content-type', 'application/json']]),
          json: () => Promise.resolve({
            sessions: [
              {
                _id: 'session1',
                filename: 'test-statement.pdf',
                status: 'completed',
                bank_name: 'HSBC',
                statistics: {
                  total_transactions: 5,
                  recurring_detected: 2,
                  total_debits: 150.00,
                  total_credits: 100.00,
                },
                createdAt: '2025-09-10T10:00:00.000Z',
              }
            ]
          }),
        });
      }
      
      if (url === '/api/import/sessions/session1/transactions') {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Map([['content-type', 'application/json']]),
          json: () => Promise.resolve({
            session_id: 'session1',
            transaction_count: 3,
            transactions: [
              {
                date: '2025-09-01',
                description: 'British Gas Payment',
                amount: -85.50,
                originalText: 'DD BRITISH GAS'
              },
              {
                date: '2025-09-02', 
                description: 'Netflix Subscription',
                amount: -12.99,
                originalText: 'NETFLIX.COM'
              },
              {
                date: '2025-09-03',
                description: 'Salary Payment',
                amount: 2500.00,
                originalText: 'SALARY ACME CORP'
              }
            ]
          }),
        });
      }
      
      return Promise.reject(new Error('Unknown API endpoint'));
    });
  });

  it('should display Create Entry buttons for each transaction', async () => {
    render(<BankImport />);
    
    // Wait for the component to load transactions - look for the table content instead
    await waitFor(() => {
      expect(screen.getByText('British Gas Payment')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check that Create Entry buttons are present for each transaction
    const createEntryButtons = screen.getAllByText('Create Entry');
    expect(createEntryButtons).toHaveLength(3); // One for each transaction
  });

  it('should display bulk selection checkboxes for transactions', async () => {
    render(<BankImport />);
    
    await waitFor(() => {
      expect(screen.getByText('British Gas Payment')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for transaction selection checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4); // 3 transaction checkboxes + 1 select all
  });

  it('should show bulk actions when transactions are selected', async () => {
    render(<BankImport />);
    
    await waitFor(() => {
      expect(screen.getByText('British Gas Payment')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Select first transaction
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First transaction checkbox (index 0 is select all)

    // Check that bulk action button appears
    await waitFor(() => {
      expect(screen.getByText('Create Entries (1)')).toBeInTheDocument();
    });
  });

  it('should handle select all functionality', async () => {
    render(<BankImport />);
    
    await waitFor(() => {
      expect(screen.getByText('British Gas Payment')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click select all checkbox
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);

    // Check that bulk action shows all transactions selected
    await waitFor(() => {
      expect(screen.getByText('Create Entries (3)')).toBeInTheDocument();
    });
  });

  it('should show processed status for transactions that have been converted', async () => {
    // Mock a transaction with processed status
    (global.fetch as any).mockImplementation((url: string) => {
      if (url === '/api/import/sessions') {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Map([['content-type', 'application/json']]),
          json: () => Promise.resolve({
            sessions: [
              {
                _id: 'session1',
                filename: 'test-statement.pdf',
                status: 'completed',
                bank_name: 'HSBC',
                statistics: { total_transactions: 1 },
                createdAt: '2025-09-10T10:00:00.000Z',
              }
            ]
          }),
        });
      }
      
      if (url === '/api/import/sessions/session1/transactions') {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Map([['content-type', 'application/json']]),
          json: () => Promise.resolve({
            session_id: 'session1',
            transaction_count: 1,
            transactions: [
              {
                date: '2025-09-01',
                description: 'British Gas Payment',
                amount: -85.50,
                originalText: 'DD BRITISH GAS',
                status: 'processed'
              }
            ]
          }),
        });
      }
      
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    render(<BankImport />);
    
    await waitFor(() => {
      expect(screen.getByText('British Gas Payment')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check that processed indicator is shown
    expect(screen.getByText('Entry Created')).toBeInTheDocument();
    
    // Create Entry button should be disabled or hidden for processed transactions
    expect(screen.queryByText('Create Entry')).not.toBeInTheDocument();
  });

  it('should handle Create Entry button click', async () => {
    const mockCreateEntry = jest.fn();
    
    render(<BankImport />);
    
    await waitFor(() => {
      expect(screen.getByText('British Gas Payment')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click on first Create Entry button
    const createEntryButtons = screen.getAllByText('Create Entry');
    fireEvent.click(createEntryButtons[0]);

    // This should trigger modal opening or navigation
    // For now, just verify the button is clickable
    expect(createEntryButtons[0]).toBeEnabled();
  });
});