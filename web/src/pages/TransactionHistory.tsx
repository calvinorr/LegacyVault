import React, { useState, useEffect } from 'react';
import { List, Filter, Search, Calendar, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams, Link } from 'react-router-dom';
import PatternBadge from '../components/bank-import/PatternBadge';
import TransactionStatusBadge from '../components/bank-import/TransactionStatusBadge';
import CreateEntryFromTransactionModal from '../components/CreateEntryFromTransactionModal';
import IgnoreTransactionModal from '../components/bank-import/IgnoreTransactionModal';
import PatternInsightsPanel from '../components/bank-import/PatternInsightsPanel';

interface Transaction {
  _id: string;
  date: string;
  description: string;
  reference?: string;
  amount: number;
  balance?: number;
  originalText: string;
  status: 'pending' | 'record_created' | 'ignored';
  recordCreated?: boolean;
  createdRecordId?: string;
  createdRecordDomain?: string;
  ignoredReason?: string;
  patternMatched?: boolean;
  patternConfidence?: number;
  patternId?: string;
}

interface TransactionStats {
  total: number;
  pending: number;
  recordCreated: number;
  ignored: number;
}

export default function TransactionHistory() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({ total: 0, pending: 0, recordCreated: 0, ignored: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter state from URL params
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [dateRangeStart, setDateRangeStart] = useState(searchParams.get('startDate') || '');
  const [dateRangeEnd, setDateRangeEnd] = useState(searchParams.get('endDate') || '');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;

  // Modal state
  const [createEntryModal, setCreateEntryModal] = useState<{
    isOpen: boolean;
    transaction: Transaction | null;
  }>({
    isOpen: false,
    transaction: null,
  });

  const [ignoreModal, setIgnoreModal] = useState<{
    isOpen: boolean;
    transaction: Transaction | null;
  }>({
    isOpen: false,
    transaction: null,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchParams.set('search', searchQuery);
      } else {
        searchParams.delete('search');
      }
      setSearchParams(searchParams);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL params when filters change
  useEffect(() => {
    if (statusFilter && statusFilter !== 'all') {
      searchParams.set('status', statusFilter);
    } else {
      searchParams.delete('status');
    }
    if (dateRangeStart) searchParams.set('startDate', dateRangeStart);
    else searchParams.delete('startDate');
    if (dateRangeEnd) searchParams.set('endDate', dateRangeEnd);
    else searchParams.delete('endDate');

    setSearchParams(searchParams);
    setPage(1); // Reset to first page on filter change
  }, [statusFilter, dateRangeStart, dateRangeEnd]);

  // Fetch transactions
  useEffect(() => {
    loadTransactions();
  }, [statusFilter, searchQuery, dateRangeStart, dateRangeEnd, page]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (dateRangeStart) params.append('startDate', dateRangeStart);
      if (dateRangeEnd) params.append('endDate', dateRangeEnd);

      const response = await fetch(`/api/transactions?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.totalPages || 1);

      // Load stats separately
      loadStats();
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/transactions/stats', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const toggleRowExpansion = (transactionId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedRows(newExpanded);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setDateRangeStart('');
    setDateRangeEnd('');
    setSearchParams({});
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const handleCreateEntry = (transaction: Transaction) => {
    setCreateEntryModal({
      isOpen: true,
      transaction: transaction,
    });
  };

  const handleIgnoreTransaction = (transaction: Transaction) => {
    setIgnoreModal({
      isOpen: true,
      transaction: transaction,
    });
  };

  const handleUndoIgnore = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/ignore`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to undo ignore');
      }

      // Refresh transactions to show updated status
      loadTransactions();
    } catch (err: any) {
      console.error('Error undoing ignore:', err);
      setError(err.message || 'Failed to undo ignore');
    }
  };

  const pageStyle = {
    minHeight: '100vh',
    background: '#fefefe',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#0f172a',
  };

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 24px',
  };

  const buttonStyle = {
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500' as const,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: '1px solid #0f172a',
  };

  if (loading && transactions.length === 0) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#0f172a', marginBottom: '8px' }}>
              Loading transactions...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: '#0f172a',
                borderRadius: '8px',
              }}
            >
              <List size={18} color="#ffffff" strokeWidth={2} />
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0',
                letterSpacing: '-0.025em',
              }}
            >
              Transaction History
            </h1>
          </div>

          {/* Summary Stats */}
          <div
            style={{
              fontSize: '16px',
              color: '#64748b',
              fontWeight: '400',
              margin: '0',
              lineHeight: '1.5',
            }}
          >
            {stats.total} total | {stats.pending} pending | {stats.recordCreated} created | {stats.ignored} ignored
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              color: '#dc2626',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '24px' }}>
          {/* Left Sidebar - Filter Panel */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '16px',
              padding: '24px',
              height: 'fit-content',
              position: 'sticky',
              top: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Filter size={18} color="#0f172a" strokeWidth={1.5} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0' }}>Filters</h3>
            </div>

            {/* Status Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0f172a',
                  marginBottom: '8px',
                }}
              >
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="record_created">Record Created</option>
                <option value="ignored">Ignored</option>
              </select>
            </div>

            {/* Date Range */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0f172a',
                  marginBottom: '8px',
                }}
              >
                Date Range
              </label>
              <input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                placeholder="Start date"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  marginBottom: '8px',
                  backgroundColor: '#ffffff',
                }}
              />
              <input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                placeholder="End date"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  backgroundColor: '#ffffff',
                }}
              />
            </div>

            {/* Search */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0f172a',
                  marginBottom: '8px',
                }}
              >
                Search
              </label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '12px' }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by payee or description..."
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              style={{
                ...buttonStyle,
                width: '100%',
              }}
            >
              Clear Filters
            </button>
          </div>

          {/* Main Content - Transaction Table */}
          <div>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #f1f5f9',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)',
              }}
            >
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
                  <List size={48} color="#cbd5e1" strokeWidth={1.5} style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontSize: '16px', fontWeight: '500', margin: '0' }}>
                    {searchQuery || statusFilter !== 'all' || dateRangeStart || dateRangeEnd
                      ? 'No transactions match your filters. Try adjusting your search criteria.'
                      : 'No transactions yet. Upload your first bank statement to get started.'}
                  </p>
                </div>
              ) : (
                <>
                  <table
                    style={{
                      width: '100%',
                      fontSize: '13px',
                      borderCollapse: 'collapse',
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', width: '40px' }}></th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Description</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', width: '100px' }}>
                          Pattern
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>Amount</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', width: '140px' }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => {
                        const isExpanded = expandedRows.has(transaction._id);
                        return (
                          <React.Fragment key={transaction._id}>
                            <tr
                              onClick={() => toggleRowExpansion(transaction._id)}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                backgroundColor: isExpanded ? '#f8fafc' : 'transparent',
                              }}
                              onMouseEnter={(e) => {
                                if (!isExpanded) {
                                  e.currentTarget.style.backgroundColor = '#fafbfc';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isExpanded) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              <td style={{ padding: '12px 16px' }}>
                                {isExpanded ? (
                                  <ChevronDown size={16} color="#64748b" />
                                ) : (
                                  <ChevronRight size={16} color="#64748b" />
                                )}
                              </td>
                              <td style={{ padding: '12px 16px', color: '#334155' }}>{formatDate(transaction.date)}</td>
                              <td style={{ padding: '12px 16px', color: '#334155', maxWidth: '300px' }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {transaction.description}
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                {transaction.patternMatched && transaction.patternConfidence ? (
                                  <PatternBadge confidence={transaction.patternConfidence} />
                                ) : (
                                  <span style={{ fontSize: '10px', color: '#cbd5e1' }}>-</span>
                                )}
                              </td>
                              <td
                                style={{
                                  padding: '12px 16px',
                                  textAlign: 'right',
                                  fontWeight: '600',
                                  color: transaction.amount < 0 ? '#dc2626' : '#059669',
                                }}
                              >
                                {formatCurrency(transaction.amount)}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <TransactionStatusBadge
                                  status={transaction.status}
                                  recordId={transaction.createdRecordId}
                                  recordDomain={transaction.createdRecordDomain}
                                  ignoredReason={transaction.ignoredReason}
                                />
                              </td>
                            </tr>
                            {/* Expanded Row */}
                            {isExpanded && (
                              <tr style={{ backgroundColor: '#f8fafc' }}>
                                <td colSpan={6} style={{ padding: '20px 24px' }}>
                                  <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                                    <div style={{ marginBottom: '12px' }}>
                                      <strong>Full Description:</strong> {transaction.description}
                                    </div>
                                    {transaction.reference && (
                                      <div style={{ marginBottom: '12px' }}>
                                        <strong>Reference:</strong> {transaction.reference}
                                      </div>
                                    )}
                                    {transaction.balance !== undefined && (
                                      <div style={{ marginBottom: '12px' }}>
                                        <strong>Balance after:</strong> {formatCurrency(transaction.balance)}
                                      </div>
                                    )}
                                    <div
                                      style={{
                                        marginTop: '12px',
                                        padding: '12px',
                                        backgroundColor: '#f1f5f9',
                                        borderRadius: '8px',
                                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                        fontSize: '11px',
                                        color: '#64748b',
                                      }}
                                    >
                                      <strong style={{ display: 'block', marginBottom: '4px' }}>Original PDF Text:</strong>
                                      {transaction.originalText}
                                    </div>

                                    {/* Pattern Info */}
                                    {transaction.patternMatched && transaction.patternConfidence && (
                                      <div
                                        style={{
                                          marginTop: '16px',
                                          padding: '16px',
                                          backgroundColor: transaction.patternConfidence >= 0.85 ? '#dcfce7' : transaction.patternConfidence >= 0.65 ? '#fef3c7' : '#f3f4f6',
                                          border: `1px solid ${transaction.patternConfidence >= 0.85 ? '#bbf7d0' : transaction.patternConfidence >= 0.65 ? '#fde68a' : '#e5e7eb'}`,
                                          borderRadius: '12px',
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                          <PatternBadge confidence={transaction.patternConfidence} />
                                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                                            Recurring Pattern Detected
                                          </strong>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                                          This transaction matches a pattern with {Math.round(transaction.patternConfidence * 100)}% confidence.
                                          {transaction.patternConfidence >= 0.85 && ' This is a strong match - likely a recurring payment.'}
                                          {transaction.patternConfidence >= 0.65 && transaction.patternConfidence < 0.85 && ' This appears to be a recurring payment.'}
                                        </div>
                                      </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                                      {transaction.status === 'pending' && (
                                        <>
                                          <button
                                            style={{
                                              ...primaryButtonStyle,
                                              fontSize: '13px',
                                              padding: '8px 16px',
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCreateEntry(transaction);
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.backgroundColor = '#1e293b';
                                              e.currentTarget.style.borderColor = '#1e293b';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = '#0f172a';
                                              e.currentTarget.style.borderColor = '#0f172a';
                                            }}
                                          >
                                            Create Entry
                                          </button>
                                          <button
                                            style={{
                                              ...buttonStyle,
                                              fontSize: '13px',
                                              padding: '8px 16px',
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleIgnoreTransaction(transaction);
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.backgroundColor = '#f8fafc';
                                              e.currentTarget.style.borderColor = '#cbd5e1';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = '#ffffff';
                                              e.currentTarget.style.borderColor = '#e2e8f0';
                                            }}
                                          >
                                            Ignore
                                          </button>
                                        </>
                                      )}
                                      {transaction.status === 'ignored' && (
                                        <button
                                          style={{
                                            ...buttonStyle,
                                            fontSize: '13px',
                                            padding: '8px 16px',
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUndoIgnore(transaction._id);
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                          }}
                                        >
                                          Undo Ignore
                                        </button>
                                      )}
                                      {transaction.status === 'record_created' && transaction.createdRecordId && transaction.createdRecordDomain && (
                                        <Link
                                          to={`/${transaction.createdRecordDomain}/${transaction.createdRecordId}`}
                                          style={{
                                            ...buttonStyle,
                                            fontSize: '13px',
                                            padding: '8px 16px',
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                          }}
                                        >
                                          <ExternalLink size={14} strokeWidth={1.5} />
                                          View Record
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div
                      style={{
                        padding: '16px 24px',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        Page {page} of {totalPages}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          style={{
                            ...buttonStyle,
                            padding: '8px 16px',
                            opacity: page === 1 ? 0.5 : 1,
                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          style={{
                            ...buttonStyle,
                            padding: '8px 16px',
                            opacity: page === totalPages ? 0.5 : 1,
                            cursor: page === totalPages ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar - Pattern Insights Panel */}
          <PatternInsightsPanel />
        </div>
      </div>

      {/* Create Entry Modal */}
      <CreateEntryFromTransactionModal
        isOpen={createEntryModal.isOpen}
        onClose={() => setCreateEntryModal({ isOpen: false, transaction: null })}
        onSuccess={() => {
          setCreateEntryModal({ isOpen: false, transaction: null });
          // Refresh transactions to show updated status
          loadTransactions();
        }}
        transaction={createEntryModal.transaction}
      />

      {/* Ignore Transaction Modal */}
      <IgnoreTransactionModal
        isOpen={ignoreModal.isOpen}
        onClose={() => setIgnoreModal({ isOpen: false, transaction: null })}
        onSuccess={() => {
          setIgnoreModal({ isOpen: false, transaction: null });
          // Refresh transactions to show updated status
          loadTransactions();
        }}
        transaction={ignoreModal.transaction}
      />
    </div>
  );
}
