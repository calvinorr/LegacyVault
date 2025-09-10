// web/src/components/__tests__/AddBillModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddBillModal from '../AddBillModal';
import { CategoriesProvider } from '../../hooks/useCategories';
import * as api from '../../api';
import type { CategoryTreeResponse, Category } from '../../types/category';

// Mock the api module
jest.mock('../../api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock categories for testing - using "Bills" terminology
const mockCategories: Category[] = [
  {
    _id: 'cat-bills',
    name: 'Bills',
    description: 'Bills and services',
    parentId: null,
    userId: 'user-123',
    isSystemCategory: true,
    isDeleted: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    children: [
      {
        _id: 'cat-energy',
        name: 'Energy',
        parentId: 'cat-bills',
        userId: 'user-123',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        _id: 'cat-water',
        name: 'Water',
        parentId: 'cat-bills',
        userId: 'user-123',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      }
    ]
  },
  {
    _id: 'cat-banking',
    name: 'Banking',
    description: 'Bank accounts and services',
    parentId: null,
    userId: 'user-123',
    isSystemCategory: true,
    isDeleted: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    _id: 'cat-insurance',
    name: 'Insurance',
    description: 'Insurance policies',
    parentId: null,
    userId: 'user-123',
    isSystemCategory: true,
    isDeleted: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  }
];

const mockCategoryResponse: CategoryTreeResponse = {
  categories: mockCategories,
  total: 3
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock console.warn to avoid noise in tests
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <CategoriesProvider>{children}</CategoriesProvider>;
}

describe('AddBillModal - Bills Terminology Tests', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    consoleWarnSpy.mockClear();
    
    // Default successful API responses
    mockedApi.getCategories.mockResolvedValue(mockCategoryResponse);
    mockedApi.createEntry.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render modal with "Bills" terminology instead of "Utilities"', async () => {
    render(
      <TestWrapper>
        <AddBillModal {...mockProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Bill/Service')).toBeInTheDocument();
    });

    // Should not contain old "Utility" terminology
    expect(screen.queryByText('Add Utility/Service')).not.toBeInTheDocument();
    expect(screen.queryByText('Utility Type')).not.toBeInTheDocument();
  });

  it('should show "Bill Type" field instead of "Utility Type"', async () => {
    render(
      <TestWrapper>
        <AddBillModal {...mockProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Bill Type *')).toBeInTheDocument();
    });

    // Should not show old utility field
    expect(screen.queryByLabelText('Utility Type *')).not.toBeInTheDocument();
  });

  it('should use "Bills" category by default', async () => {
    render(
      <TestWrapper>
        <AddBillModal {...mockProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Bill/Service')).toBeInTheDocument();
    });

    // Wait for categories to load, then check default selection
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Bills' })).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText('Category');
    expect(categorySelect).toHaveValue('Bills');
  });

  it('should submit form with "bill" type instead of "utility"', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AddBillModal {...mockProps} />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Add Bill/Service')).toBeInTheDocument();
    });

    // Fill required fields
    const titleInput = screen.getByLabelText('Service Name *');
    const providerInput = screen.getByLabelText('Provider/Supplier *');
    const billTypeSelect = screen.getByLabelText('Bill Type *');

    await act(async () => {
      await user.type(titleInput, 'Test Bill');
      await user.type(providerInput, 'Test Provider');
      await user.selectOptions(billTypeSelect, 'Electricity');
    });
    
    // Wait for categories to load, then select one
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Bills' })).toBeInTheDocument();
    });
    
    const categorySelect = screen.getByLabelText('Category');
    await act(async () => {
      await user.selectOptions(categorySelect, 'Bills');
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Create Bill Account' });
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(mockedApi.createEntry).toHaveBeenCalledWith({
        title: 'Test Bill',
        type: 'bill',
        provider: 'Test Provider',
        accountDetails: expect.objectContaining({
          billType: 'Electricity',
          category: 'bill',
        }),
        notes: '',
        confidential: true,
        category: 'Bills',
        subCategory: '',
        supplier: '',
        tags: [],
      });
    });

    expect(mockProps.onSuccess).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should use "Bills" in sub-category options', async () => {
    render(
      <TestWrapper>
        <AddBillModal {...mockProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Bill/Service')).toBeInTheDocument();
    });

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Bills' })).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText('Category');
    await act(async () => {
      fireEvent.change(categorySelect, { target: { value: 'Bills' } });
    });

    // Check sub-category options contain bills-related categories
    const subCategorySelect = screen.getByLabelText('Sub-Category');
    const energyOption = screen.getByRole('option', { name: 'Energy' });
    const waterOption = screen.getByRole('option', { name: 'Water' });
    
    expect(energyOption).toBeInTheDocument();
    expect(waterOption).toBeInTheDocument();
  });

  it('should show "Create Bill Account" button text', async () => {
    render(
      <TestWrapper>
        <AddBillModal {...mockProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create Bill Account' })).toBeInTheDocument();
    });

    // Should not show old utility button text
    expect(screen.queryByRole('button', { name: 'Create Utility Account' })).not.toBeInTheDocument();
  });

  it('should handle form submission errors with "bill" terminology', async () => {
    const user = userEvent.setup();
    mockedApi.createEntry.mockRejectedValue(new Error('Failed to create bill account'));

    await act(async () => {
      render(
        <TestWrapper>
          <AddBillModal {...mockProps} />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Add Bill/Service')).toBeInTheDocument();
    });

    // Fill required fields
    const titleInput = screen.getByLabelText('Service Name *');
    const providerInput = screen.getByLabelText('Provider/Supplier *');
    const billTypeSelect = screen.getByLabelText('Bill Type *');

    await act(async () => {
      await user.type(titleInput, 'Test Bill');
      await user.type(providerInput, 'Test Provider');
      await user.selectOptions(billTypeSelect, 'Electricity');
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Create Bill Account' });
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to create bill account')).toBeInTheDocument();
    });

    // Should not close modal on error
    expect(mockProps.onSuccess).not.toHaveBeenCalled();
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });

  it('should use fallback categories with "Bills" instead of "Utilities"', async () => {
    mockedApi.getCategories.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(
        <TestWrapper>
          <AddBillModal {...mockProps} />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Add Bill/Service')).toBeInTheDocument();
    });

    // Should still have categories from fallback
    await waitFor(() => {
      const categorySelect = screen.getByLabelText('Category');
      expect(categorySelect).toBeInTheDocument();
    });
      
    // Check for fallback categories using "Bills" instead of "Utilities"
    await waitFor(() => {
      const accountsOption = screen.getByRole('option', { name: 'Accounts' });
      const billsOption = screen.getByRole('option', { name: 'Bills' });
      
      expect(accountsOption).toBeInTheDocument();
      expect(billsOption).toBeInTheDocument();
      
      // Should not have "Utilities" option
      expect(screen.queryByRole('option', { name: 'Utilities' })).not.toBeInTheDocument();
    });
  });

  it('should have bill-specific type options', async () => {
    render(
      <TestWrapper>
        <AddBillModal {...mockProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Bill Type *')).toBeInTheDocument();
    });

    const billTypeSelect = screen.getByLabelText('Bill Type *');
    
    // Check for UK-focused bill types
    expect(screen.getByRole('option', { name: 'Electricity' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Gas' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Water' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Council Tax' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'TV Licence' })).toBeInTheDocument();
  });

  it('should show confidential checkbox with bill context', async () => {
    render(
      <TestWrapper>
        <AddBillModal {...mockProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Mark as confidential')).toBeInTheDocument();
    });

    // Should use bill-specific ID instead of utility ID
    const checkbox = screen.getByLabelText('Mark as confidential');
    expect(checkbox.id).toBe('confidential-bill');
    expect(checkbox.id).not.toBe('confidential-utility');
  });
});