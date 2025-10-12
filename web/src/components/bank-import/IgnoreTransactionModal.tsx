import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface IgnoreTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: {
    _id: string;
    description: string;
    amount: number;
    date: string;
    patternMatched?: boolean;
    patternConfidence?: number;
  } | null;
}

export default function IgnoreTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
}: IgnoreTransactionModalProps) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [alwaysIgnore, setAlwaysIgnore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason) {
      setError('Please select a reason');
      return;
    }

    if (reason === 'other' && !customReason.trim()) {
      setError('Please provide a reason');
      return;
    }

    try {
      setSubmitting(true);

      const ignoreReason = reason === 'other' ? customReason : reason;

      const response = await fetch(`/api/transactions/${transaction._id}/ignore`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: ignoreReason,
          alwaysIgnore,
          payeeName: getPayeeName(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to ignore transaction');
      }

      onSuccess();
      resetForm();
    } catch (err: any) {
      console.error('Error ignoring transaction:', err);
      setError(err.message || 'Failed to ignore transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setCustomReason('');
    setAlwaysIgnore(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

  // Extract payee name from description for "always ignore" text
  const getPayeeName = () => {
    // Simple extraction - take first 20 chars or up to first space after 10 chars
    const desc = transaction.description;
    if (desc.length <= 20) return desc;
    const spaceIndex = desc.indexOf(' ', 10);
    return spaceIndex > 0 ? desc.substring(0, spaceIndex) : desc.substring(0, 20);
  };

  const showHighConfidenceWarning = transaction.patternMatched && (transaction.patternConfidence || 0) >= 0.85;
  const showAlwaysIgnoreOption = reason === 'one_time' || reason === 'personal';

  const modalOverlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  };

  const modalStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  };

  const buttonStyle = {
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#64748b',
    cursor: submitting ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '500' as const,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    opacity: submitting ? 0.5 : 1,
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: '1px solid #dc2626',
  };

  return (
    <div style={modalOverlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>
              Ignore Transaction
            </h2>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              {formatCurrency(transaction.amount)} · {formatDate(transaction.date)}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {transaction.description}
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#64748b',
            }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px' }}>
            {/* High confidence pattern warning */}
            {showHighConfidenceWarning && (
              <div
                style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <AlertTriangle size={18} color="#d97706" strokeWidth={2} />
                <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.4' }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Recurring Payment Detected</strong>
                  This appears to be a recurring payment ({Math.round((transaction.patternConfidence || 0) * 100)}%
                  confidence). Are you sure you want to ignore it?
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: '#dc2626',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            {/* Reason Dropdown */}
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
                Reason <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
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
                <option value="">Select a reason...</option>
                <option value="one_time">One-time purchase</option>
                <option value="personal">Personal (not household)</option>
                <option value="already_covered">Already covered by existing record</option>
                <option value="other">Other (specify)</option>
              </select>
            </div>

            {/* Custom Reason Input */}
            {reason === 'other' && (
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
                  Custom Reason <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Explain why you're ignoring this..."
                  required
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
            )}

            {/* Always Ignore Checkbox */}
            {showAlwaysIgnoreOption && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={alwaysIgnore}
                    onChange={(e) => setAlwaysIgnore(e.target.checked)}
                    style={{
                      marginTop: '2px',
                      cursor: 'pointer',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', marginBottom: '4px' }}>
                      Always ignore transactions from "{getPayeeName()}"
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                      Future imports will automatically ignore transactions matching this payee
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              style={buttonStyle}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={dangerButtonStyle}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                  e.currentTarget.style.borderColor = '#b91c1c';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.borderColor = '#dc2626';
                }
              }}
            >
              {submitting
                ? 'Ignoring...'
                : alwaysIgnore
                ? 'Create Ignore Rule'
                : 'Ignore Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
