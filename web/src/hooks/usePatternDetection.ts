/**
 * usePatternDetection Hook
 *
 * Hook for managing pattern detection state and operations.
 * Epic 5 - Story 5.4: Cross-Import Pattern Detection
 */

import { useState, useEffect, useCallback } from 'react';

interface Pattern {
  _id: string;
  user: string;
  payee: string;
  normalizedDescription: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'irregular';
  averageAmount: number;
  amountVariance: number;
  minAmount?: number;
  maxAmount?: number;
  confidence: number;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  suggestedDomain: string | null;
  suggestedRecordType: string | null;
  suggestionAccepted: boolean;
  userOverrides: number;
  autoSuggest: boolean;
  userConfirmed: boolean;
  transactions: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface PatternSuggestion {
  pattern: {
    id: string;
    payee: string;
    frequency: string;
    confidence: number;
    occurrences: number;
  } | null;
  suggestion: {
    domain: string;
    recordType: string;
    fields: {
      name?: string;
      provider?: string;
      amount?: number;
      frequency?: string;
    };
  };
}

interface UsePatternDetectionReturn {
  patterns: Pattern[];
  loading: boolean;
  error: string | null;
  fetchPatterns: (minConfidence?: number) => Promise<void>;
  detectPatterns: () => Promise<void>;
  getSuggestion: (transactionId: string) => Promise<PatternSuggestion | null>;
  applyPattern: (
    patternId: string,
    transactionIds: string[],
    domain: string,
    recordType: string,
    remember?: boolean
  ) => Promise<any>;
  getPatternTransactions: (patternId: string) => Promise<any>;
  deletePattern: (patternId: string) => Promise<void>;
}

export function usePatternDetection(): UsePatternDetectionReturn {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all detected patterns for user
   */
  const fetchPatterns = useCallback(async (minConfidence: number = 0.65) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/patterns/recurring?minConfidence=${minConfidence}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patterns');
      }

      const data = await response.json();
      setPatterns(data.patterns || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch patterns';
      setError(message);
      console.error('Fetch patterns error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Trigger pattern detection for user
   */
  const detectPatterns = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/patterns/detect', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Pattern detection failed');
      }

      const data = await response.json();
      setPatterns(data.patterns || []);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Pattern detection failed';
      setError(message);
      console.error('Detect patterns error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get domain suggestion from transaction
   */
  const getSuggestion = useCallback(async (transactionId: string): Promise<PatternSuggestion | null> => {
    setError(null);

    try {
      const response = await fetch('/api/patterns/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ transactionId })
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestion');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get suggestion';
      setError(message);
      console.error('Get suggestion error:', err);
      return null;
    }
  }, []);

  /**
   * Apply pattern to create domain records (batch creation)
   */
  const applyPattern = useCallback(async (
    patternId: string,
    transactionIds: string[],
    domain: string,
    recordType: string,
    remember: boolean = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/patterns/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          patternId,
          transactionIds,
          domain,
          recordType,
          remember
        })
      });

      if (!response.ok) {
        throw new Error('Failed to apply pattern');
      }

      const data = await response.json();

      // Refresh patterns after applying
      await fetchPatterns();

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply pattern';
      setError(message);
      console.error('Apply pattern error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPatterns]);

  /**
   * Get all transactions matching pattern
   */
  const getPatternTransactions = useCallback(async (patternId: string) => {
    setError(null);

    try {
      const response = await fetch(`/api/patterns/${patternId}/transactions`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pattern transactions');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch pattern transactions';
      setError(message);
      console.error('Get pattern transactions error:', err);
      throw err;
    }
  }, []);

  /**
   * Delete pattern
   */
  const deletePattern = useCallback(async (patternId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/patterns/${patternId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete pattern');
      }

      // Refresh patterns after deletion
      await fetchPatterns();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete pattern';
      setError(message);
      console.error('Delete pattern error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPatterns]);

  return {
    patterns,
    loading,
    error,
    fetchPatterns,
    detectPatterns,
    getSuggestion,
    applyPattern,
    getPatternTransactions,
    deletePattern
  };
}
