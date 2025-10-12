import React, { useState, useEffect } from 'react';
import { TrendingUp, ExternalLink, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Pattern {
  _id: string;
  payee: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'irregular';
  confidence: number;
  occurrences: number;
  averageAmount: number;
  suggestedDomain: string | null;
  suggestedRecordType: string | null;
  autoSuggest: boolean;
  userConfirmed: boolean;
}

interface PatternInsightsPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export default function PatternInsightsPanel({
  isVisible = true,
  onClose,
}: PatternInsightsPanelProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/patterns/recurring?minConfidence=0.65', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load patterns');
      }

      const data = await response.json();

      // Get top 5 patterns sorted by confidence
      const topPatterns = data.patterns.slice(0, 5);
      setPatterns(topPatterns);
    } catch (err: any) {
      console.error('Error loading patterns:', err);
      setError(err.message || 'Failed to load patterns');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(Math.abs(amount));
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annually: 'Annual',
      irregular: 'Irregular',
    };
    return labels[frequency] || frequency;
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: Record<string, string> = {
      weekly: '#3b82f6',
      monthly: '#8b5cf6',
      quarterly: '#ec4899',
      annually: '#f59e0b',
      irregular: '#64748b',
    };
    return colors[frequency] || '#64748b';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return { bg: '#dcfce7', border: '#bbf7d0', text: '#15803d' };
    if (confidence >= 0.65) return { bg: '#fef3c7', border: '#fde68a', text: '#92400e' };
    return { bg: '#f3f4f6', border: '#e5e7eb', text: '#374151' };
  };

  const getDomainLabel = (domain: string | null, recordType: string | null) => {
    if (!domain) return 'Unknown';

    const domainLabels: Record<string, string> = {
      property: 'Property',
      vehicles: 'Vehicles',
      finance: 'Finance',
      employment: 'Employment',
      government: 'Government',
      insurance: 'Insurance',
      legal: 'Legal',
      services: 'Services',
    };

    const domainLabel = domainLabels[domain] || domain;
    return recordType ? `${domainLabel} > ${recordType}` : domainLabel;
  };

  const handleViewTransactions = (patternId: string) => {
    // Navigate to Transaction History with pattern filter
    navigate(`/transaction-history?pattern=${patternId}`);
  };

  const handleCreateEntry = (pattern: Pattern) => {
    // Navigate to Transaction History and open create entry modal for this pattern
    navigate(`/transaction-history?pattern=${pattern._id}&action=create`);
  };

  if (!isVisible) return null;

  const panelStyle = {
    width: '320px',
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #f1f5f9',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  };

  const headerStyle = {
    padding: '24px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '20px',
  };

  const patternCardStyle = (confidence: number) => {
    const colors = getConfidenceColor(confidence);
    return {
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  const buttonStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500' as const,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: '1px solid #0f172a',
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <TrendingUp size={20} strokeWidth={1.5} color="#0f172a" />
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: 0, flex: 1 }}>
          Pattern Insights
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#64748b',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '14px' }}>Loading patterns...</div>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#dc2626',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && patterns.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#64748b',
            }}
          >
            <TrendingUp
              size={48}
              strokeWidth={1}
              color="#cbd5e1"
              style={{ marginBottom: '16px' }}
            />
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              No Patterns Detected Yet
            </div>
            <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#94a3b8' }}>
              Import more bank statements to help us detect recurring payments and subscriptions.
            </div>
          </div>
        )}

        {!loading && !error && patterns.length > 0 && (
          <>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Top {patterns.length} detected recurring patterns
            </div>

            {patterns.map((pattern) => {
              const colors = getConfidenceColor(pattern.confidence);

              return (
                <div key={pattern._id} style={patternCardStyle(pattern.confidence)}>
                  {/* Payee Name */}
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                    {pattern.payee}
                  </div>

                  {/* Frequency and Confidence Badges */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: getFrequencyColor(pattern.frequency),
                        color: '#ffffff',
                      }}
                    >
                      {getFrequencyLabel(pattern.frequency)}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: colors.text,
                        color: '#ffffff',
                      }}
                    >
                      {Math.round(pattern.confidence * 100)}% confidence
                    </span>
                  </div>

                  {/* Transaction Count */}
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                    Found in {pattern.occurrences} import{pattern.occurrences !== 1 ? 's' : ''}
                  </div>

                  {/* Average Amount */}
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', marginBottom: '8px' }}>
                    {formatCurrency(pattern.averageAmount)} avg
                  </div>

                  {/* Suggested Domain */}
                  {pattern.suggestedDomain && (
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                      {getDomainLabel(pattern.suggestedDomain, pattern.suggestedRecordType)}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      style={primaryButtonStyle}
                      onClick={() => handleCreateEntry(pattern)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1e293b';
                        e.currentTarget.style.borderColor = '#1e293b';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0f172a';
                        e.currentTarget.style.borderColor = '#0f172a';
                      }}
                    >
                      <ExternalLink size={14} strokeWidth={1.5} />
                      Create Entry
                    </button>
                    <button
                      style={buttonStyle}
                      onClick={() => handleViewTransactions(pattern._id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <Eye size={14} strokeWidth={1.5} />
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
