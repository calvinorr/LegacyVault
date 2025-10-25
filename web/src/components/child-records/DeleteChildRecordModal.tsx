// web/src/components/child-records/DeleteChildRecordModal.tsx
// Confirmation modal for deleting a child record with safeguards

import React, { useState } from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { ChildRecord } from '../../services/api/childRecords';

interface DeleteChildRecordModalProps {
  record: ChildRecord;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DeleteChildRecordModal: React.FC<DeleteChildRecordModalProps> = ({
  record,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    if (confirmed) {
      await onConfirm();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
          backgroundColor: 'rgba(239, 68, 68, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} style={{ color: '#ef4444' }} />
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ef4444',
              margin: 0
            }}>
              Delete Record
            </h2>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#334155',
              padding: '4px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#334155'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Record Info */}
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#334155',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Record to Delete
            </p>
            <p style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#f1f5f9',
              margin: 0
            }}>
              {record.name}
            </p>
            <p style={{
              fontSize: '13px',
              color: '#cbd5e1',
              margin: '6px 0 0 0'
            }}>
              Type: {record.recordType}
            </p>
          </div>

          {/* Warning Message */}
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderLeft: '3px solid #ef4444',
            marginBottom: '16px'
          }}>
            <Trash2 size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#ef4444',
                margin: '0 0 4px 0'
              }}>
                This action cannot be undone
              </p>
              <p style={{
                fontSize: '12px',
                color: '#cbd5e1',
                margin: 0
              }}>
                Once deleted, this record will be permanently removed from your account.
              </p>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <input
              type="checkbox"
              id="confirm-delete"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{
                marginTop: '2px',
                cursor: 'pointer',
                accentColor: '#ef4444'
              }}
            />
            <label
              htmlFor="confirm-delete"
              style={{
                fontSize: '13px',
                color: '#cbd5e1',
                cursor: 'pointer',
                margin: 0
              }}
            >
              I understand this record will be permanently deleted
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onCancel}
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#f1f5f9',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={!confirmed || isLoading}
              style={{
                padding: '10px 16px',
                backgroundColor: confirmed && !isLoading ? '#ef4444' : '#334155',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: confirmed && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (confirmed && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (confirmed && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading ? 'Deleting...' : 'Delete Record'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
