/**
 * PatternInsightsPanel Component
 *
 * Displays detected recurring payment patterns with confidence scores.
 * Epic 5 - Story 5.4: Cross-Import Pattern Detection
 */

import React, { useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { usePatternDetection } from '../../hooks/usePatternDetection';

interface PatternInsightsPanelProps {
  onPatternClick?: (patternId: string) => void;
  onCreateRecord?: (patternId: string) => void;
}

export const PatternInsightsPanel: React.FC<PatternInsightsPanelProps> = ({
  onPatternClick,
  onCreateRecord
}) => {
  const { patterns, loading, error, fetchPatterns } = usePatternDetection();

  useEffect(() => {
    // Fetch patterns on mount
    fetchPatterns(0.65); // Minimum 65% confidence
  }, [fetchPatterns]);

  // Format confidence as percentage
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  // Get confidence badge color
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85) {
      return {
        color: 'bg-green-100 text-green-800',
        label: 'Strong Match'
      };
    } else if (confidence >= 0.65) {
      return {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Likely Match'
      };
    } else {
      return {
        color: 'bg-gray-100 text-gray-800',
        label: 'Possible Match'
      };
    }
  };

  // Format frequency
  const formatFrequency = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(Math.abs(amount));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Pattern Insights</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-slate-900">Pattern Insights</h3>
        </div>
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Pattern Insights</h3>
        </div>
        <div className="text-sm text-slate-600 py-4">
          No recurring patterns detected yet. Upload more statements (minimum 3 months recommended) to detect patterns.
        </div>
      </div>
    );
  }

  // Sort by confidence (highest first), limit to top 5
  const topPatterns = [...patterns]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Pattern Insights</h3>
        </div>
        <span className="text-sm font-medium text-slate-600">
          {patterns.length} Detected
        </span>
      </div>

      {/* Pattern List */}
      <div className="space-y-4">
        {topPatterns.map((pattern) => {
          const badge = getConfidenceBadge(pattern.confidence);

          return (
            <div
              key={pattern._id}
              className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors cursor-pointer"
              onClick={() => onPatternClick?.(pattern._id)}
            >
              {/* Payee Name */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-900">{pattern.payee}</h4>
                <span className={`text-xs px-2 py-1 rounded ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              {/* Pattern Details */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatFrequency(pattern.frequency)}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatAmount(pattern.averageAmount)}</span>
                </div>
              </div>

              {/* Confidence and Occurrences */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>{pattern.occurrences} occurrences</span>
                <span>{formatConfidence(pattern.confidence)} confidence</span>
              </div>

              {/* Suggested Domain */}
              {pattern.suggestedDomain && (
                <div className="text-xs text-slate-600 mb-3">
                  <span className="font-medium">Suggested:</span>{' '}
                  <span className="capitalize">{pattern.suggestedDomain}</span>
                  {pattern.suggestedRecordType && (
                    <span> › {pattern.suggestedRecordType}</span>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateRecord?.(pattern._id);
                }}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded transition-colors"
              >
                Create Record
              </button>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      {patterns.length > 5 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <button className="text-sm text-slate-600 hover:text-slate-900 font-medium">
            View All {patterns.length} Patterns →
          </button>
        </div>
      )}
    </div>
  );
};
