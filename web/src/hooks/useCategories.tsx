// web/src/hooks/useCategories.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCategories } from "../api";
import type { Category, CategoryTreeResponse } from "../types/category";

// Hard-coded UK-focused fallback categories
const FALLBACK_CATEGORIES: Category[] = [
  {
    _id: 'fallback-accounts',
    name: 'Accounts',
    description: 'Bank accounts and building society accounts',
    parentId: null,
    userId: 'system',
    isSystemCategory: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    children: [
      {
        _id: 'fallback-current-accounts',
        name: 'Current Accounts',
        parentId: 'fallback-accounts',
        userId: 'system',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'fallback-savings-accounts',
        name: 'Savings Accounts',
        parentId: 'fallback-accounts',
        userId: 'system',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'fallback-isas',
        name: 'ISAs',
        description: 'Individual Savings Accounts',
        parentId: 'fallback-accounts',
        userId: 'system',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  },
  {
    _id: 'fallback-bills',
    name: 'Bills',
    description: 'Utilities and recurring bills',
    parentId: null,
    userId: 'system',
    isSystemCategory: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    children: [
      {
        _id: 'fallback-gas-electricity',
        name: 'Gas & Electricity',
        parentId: 'fallback-bills',
        userId: 'system',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'fallback-water',
        name: 'Water',
        parentId: 'fallback-bills',
        userId: 'system',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'fallback-council-tax',
        name: 'Council Tax',
        parentId: 'fallback-bills',
        userId: 'system',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'fallback-tv-licence',
        name: 'TV Licence',
        parentId: 'fallback-bills',
        userId: 'system',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  },
  {
    _id: 'fallback-pensions',
    name: 'Pensions',
    description: 'Pension schemes and retirement savings',
    parentId: null,
    userId: 'system',
    isSystemCategory: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    children: [
      {
        _id: 'fallback-sipps',
        name: 'SIPPs',
        description: 'Self-Invested Personal Pensions',
        parentId: 'fallback-pensions',
        userId: 'system',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'fallback-workplace-pensions',
        name: 'Workplace Pensions',
        parentId: 'fallback-pensions',
        userId: 'system',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  },
  {
    _id: 'fallback-investments',
    name: 'Investments',
    description: 'Investment accounts and savings',
    parentId: null,
    userId: 'system',
    isSystemCategory: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    children: [
      {
        _id: 'fallback-premium-bonds',
        name: 'Premium Bonds',
        parentId: 'fallback-investments',
        userId: 'system',
        isSystemCategory: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  }
];

type CategoriesContextValue = {
  categories: Category[];
  loading: boolean;
  error: string | null;
  isUsingFallback: boolean;
  refresh: () => Promise<void>;
  clearCache: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByParent: (parentId: string | null) => Category[];
  getRootCategories: () => Category[];
};

const CategoriesContext = createContext<CategoriesContextValue | undefined>(undefined);

// Simple in-memory cache for categories
const CACHE_KEY = 'categories-data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  data: CategoryTreeResponse;
  timestamp: number;
}

function getCachedData(): CategoryTreeResponse | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp }: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    if (now - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

function setCachedData(data: CategoryTreeResponse): void {
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Ignore cache errors
  }
}

function clearCachedData(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore cache errors
  }
}

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to use cached data first
      const cachedData = getCachedData();
      if (cachedData) {
        setCategories(cachedData.categories);
        setIsUsingFallback(false);
        setLoading(false);
        return;
      }

      // Fetch from API
      const response = await getCategories();
      setCategories(response.categories);
      setIsUsingFallback(false);
      
      // Cache the successful response
      setCachedData(response);
      
    } catch (err: any) {
      console.warn('Failed to fetch categories, using fallback:', err.message);
      setCategories(FALLBACK_CATEGORIES);
      setIsUsingFallback(true);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategoryById = useCallback((id: string): Category | undefined => {
    const findInTree = (cats: Category[]): Category | undefined => {
      for (const cat of cats) {
        if (cat._id === id) return cat;
        if (cat.children) {
          const found = findInTree(cat.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findInTree(categories);
  }, [categories]);

  const getCategoriesByParent = useCallback((parentId: string | null): Category[] => {
    if (parentId === null) {
      // Return root categories
      return categories.filter(cat => !cat.parentId);
    }
    
    // Find parent and return its children
    const parent = getCategoryById(parentId);
    return parent?.children || [];
  }, [categories, getCategoryById]);

  const getRootCategories = useCallback((): Category[] => {
    return categories.filter(cat => !cat.parentId);
  }, [categories]);

  const clearCache = useCallback(async () => {
    clearCachedData();
    await fetchCategories();
  }, [fetchCategories]);

  const value: CategoriesContextValue = {
    categories,
    loading,
    error,
    isUsingFallback,
    refresh: fetchCategories,
    clearCache,
    getCategoryById,
    getCategoriesByParent,
    getRootCategories
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error('useCategories must be used inside CategoriesProvider');
  }
  return ctx;
}