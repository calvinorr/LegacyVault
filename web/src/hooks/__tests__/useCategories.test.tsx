// web/src/hooks/__tests__/useCategories.test.tsx
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { CategoriesProvider, useCategories } from '../useCategories';
import * as api from '../../api';
import type { CategoryTreeResponse, Category } from '../../types/category';

// Mock the api module
jest.mock('../../api');
const mockedApi = api as jest.Mocked<typeof api>;

// Test component to use the hook
function TestComponent() {
  const { 
    categories, 
    loading, 
    error, 
    isUsingFallback, 
    refresh,
    getCategoryById,
    getCategoriesByParent,
    getRootCategories
  } = useCategories();

  if (loading) return <div data-testid="loading">Loading...</div>;

  return (
    <div>
      <div data-testid="categories-count">{categories.length}</div>
      <div data-testid="is-fallback">{isUsingFallback.toString()}</div>
      <div data-testid="root-categories">{getRootCategories().length}</div>
      {error && <div data-testid="error">{error}</div>}
      <button onClick={refresh} data-testid="refresh-btn">Refresh</button>
      {categories.map(cat => (
        <div key={cat._id} data-testid={`category-${cat._id}`}>
          {cat.name}
        </div>
      ))}
    </div>
  );
}

// Mock categories for API responses
const mockApiCategories: Category[] = [
  {
    _id: 'api-accounts',
    name: 'Accounts',
    description: 'Bank accounts',
    parentId: null,
    userId: 'user-123',
    isSystemCategory: true,
    isDeleted: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    children: [
      {
        _id: 'api-current',
        name: 'Current Accounts',
        parentId: 'api-accounts',
        userId: 'user-123',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      }
    ]
  },
  {
    _id: 'api-bills',
    name: 'Bills',
    description: 'Utilities',
    parentId: null,
    userId: 'user-123',
    isSystemCategory: true,
    isDeleted: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  }
];

const mockApiResponse: CategoryTreeResponse = {
  categories: mockApiCategories,
  total: 2
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

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    consoleWarnSpy.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw error when used outside CategoriesProvider', () => {
    // Mock console.error to avoid noise in test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => render(<TestComponent />)).toThrow(
      'useCategories must be used inside CategoriesProvider'
    );
    
    consoleErrorSpy.mockRestore();
  });

  it('should successfully fetch categories from API', async () => {
    mockedApi.getCategories.mockResolvedValueOnce(mockApiResponse);

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    // Should show loading state initially
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Should display API categories
    expect(screen.getByTestId('categories-count')).toHaveTextContent('2');
    expect(screen.getByTestId('is-fallback')).toHaveTextContent('false');
    expect(screen.getByTestId('root-categories')).toHaveTextContent('2');
    expect(screen.getByTestId('category-api-accounts')).toHaveTextContent('Accounts');
    expect(screen.getByTestId('category-api-bills')).toHaveTextContent('Bills');
  });

  it('should use fallback categories when API fails', async () => {
    const localConsoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockedApi.getCategories.mockRejectedValueOnce(new Error('API Error'));

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    // Wait for fallback to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Should display fallback categories
    expect(screen.getByTestId('is-fallback')).toHaveTextContent('true');
    expect(screen.getByTestId('error')).toHaveTextContent('API Error');
    
    // Should have fallback categories (4 root categories in our fallback)
    expect(screen.getByTestId('root-categories')).toHaveTextContent('4');
    expect(screen.getByTestId('category-fallback-accounts')).toHaveTextContent('Accounts');
    expect(screen.getByTestId('category-fallback-bills')).toHaveTextContent('Bills');
    
    expect(localConsoleWarnSpy).toHaveBeenCalledWith('Failed to fetch categories, using fallback:', 'API Error');
    localConsoleWarnSpy.mockRestore();
  });

  it('should use cached data when available', async () => {
    const cachedData = {
      data: mockApiResponse,
      timestamp: Date.now() - 1000 // 1 second ago
    };
    sessionStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    // Should load immediately from cache without API call
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(mockedApi.getCategories).not.toHaveBeenCalled();
    expect(screen.getByTestId('categories-count')).toHaveTextContent('2');
    expect(screen.getByTestId('is-fallback')).toHaveTextContent('false');
  });

  it('should ignore expired cache and fetch fresh data', async () => {
    const expiredCachedData = {
      data: mockApiResponse,
      timestamp: Date.now() - (10 * 60 * 1000) // 10 minutes ago (expired)
    };
    sessionStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCachedData));
    mockedApi.getCategories.mockResolvedValueOnce(mockApiResponse);

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Should have removed expired cache and called API
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('categories-data');
    expect(mockedApi.getCategories).toHaveBeenCalled();
    expect(screen.getByTestId('categories-count')).toHaveTextContent('2');
  });

  it('should handle malformed cache gracefully', async () => {
    sessionStorageMock.getItem.mockReturnValue('invalid-json');
    mockedApi.getCategories.mockResolvedValueOnce(mockApiResponse);

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Should fall back to API call
    expect(mockedApi.getCategories).toHaveBeenCalled();
    expect(screen.getByTestId('categories-count')).toHaveTextContent('2');
  });

  it('should refresh categories when refresh is called', async () => {
    mockedApi.getCategories.mockResolvedValueOnce(mockApiResponse);

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Clear the mock and set up new response
    mockedApi.getCategories.mockClear();
    const newApiResponse = {
      categories: [
        ...mockApiCategories,
        {
          _id: 'api-new-category',
          name: 'New Category',
          parentId: null,
          userId: 'user-123',
          isSystemCategory: false,
          isDeleted: false,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        }
      ],
      total: 3
    };
    mockedApi.getCategories.mockResolvedValueOnce(newApiResponse);

    // Click refresh
    await act(async () => {
      screen.getByTestId('refresh-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('categories-count')).toHaveTextContent('3');
    });

    expect(mockedApi.getCategories).toHaveBeenCalledTimes(1);
  });

  it('should provide helper functions for category access', async () => {
    mockedApi.getCategories.mockResolvedValueOnce(mockApiResponse);

    function TestHelperComponent() {
      const { getCategoryById, getCategoriesByParent, getRootCategories, loading } = useCategories();

      if (loading) return <div data-testid="loading">Loading...</div>;

      const accountsCategory = getCategoryById('api-accounts');
      const childrenOfAccounts = getCategoriesByParent('api-accounts');
      const rootCategories = getRootCategories();

      return (
        <div>
          <div data-testid="found-category">{accountsCategory?.name || 'not-found'}</div>
          <div data-testid="children-count">{childrenOfAccounts.length}</div>
          <div data-testid="root-count">{rootCategories.length}</div>
        </div>
      );
    }

    render(
      <CategoriesProvider>
        <TestHelperComponent />
      </CategoriesProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('found-category')).toHaveTextContent('Accounts');
    expect(screen.getByTestId('children-count')).toHaveTextContent('1');
    expect(screen.getByTestId('root-count')).toHaveTextContent('2');
  });

  it('should cache successful API responses', async () => {
    mockedApi.getCategories.mockResolvedValueOnce(mockApiResponse);

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Should have cached the response
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'categories-data',
      expect.stringContaining('"data":')
    );
  });

  it('should handle sessionStorage errors gracefully', async () => {
    // Mock sessionStorage.setItem to throw
    sessionStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    
    mockedApi.getCategories.mockResolvedValueOnce(mockApiResponse);

    render(
      <CategoriesProvider>
        <TestComponent />
      </CategoriesProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Should still work without caching
    expect(screen.getByTestId('categories-count')).toHaveTextContent('2');
    expect(screen.getByTestId('is-fallback')).toHaveTextContent('false');
  });
});