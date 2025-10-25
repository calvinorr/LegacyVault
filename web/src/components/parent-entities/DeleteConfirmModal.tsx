import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ParentEntity, DomainType } from '../../services/api/parentEntities';
import { useDeleteParentEntity } from '../../hooks/useParentEntities';
import { useNavigate } from 'react-router-dom';

interface DeleteConfirmModalProps {
  entity: ParentEntity | null;
  domain: DomainType;
  isOpen: boolean;
  onClose: () => void;
  childRecordCount?: number;
  childRecordBreakdown?: Record<string, number>; // e.g., { Insurance: 2, Finance: 1 }
}

const getDomainDisplayName = (domainType: string): string => {
  const map: Record<string, string> = {
    Vehicle: 'vehicle',
    Property: 'property',
    Employment: 'employment',
    Services: 'service provider',
    Finance: 'financial account'
  };
  return map[domainType] || domainType.toLowerCase();
};

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  entity,
  domain,
  isOpen,
  onClose,
  childRecordCount = 0,
  childRecordBreakdown = {}
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const navigate = useNavigate();
  const deleteMutation = useDeleteParentEntity(domain);

  const handleDelete = async () => {
    if (!entity || !confirmed) return;

    try {
      await deleteMutation.mutateAsync(entity._id);
      onClose();
      setConfirmed(false);

      // Navigate back to domain list page
      const domainPath = domain === 'finance' ? 'finance' : domain;
      navigate(`/${domainPath}`);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  if (!isOpen || !entity) return null;

  const displayName = getDomainDisplayName(entity.domainType);
  const hasChildRecords = childRecordCount > 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '24px 24px 16px 24px'
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                color: '#ef4444',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 4px 0'
                }}
              >
                Delete {displayName}?
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: '#1e293b',
                  margin: 0
                }}
              >
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              color: '#1e293b'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          {/* Entity Name */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '16px'
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#0f172a',
                margin: 0
              }}
            >
              {entity.name}
            </p>
          </div>

          {/* Child Records Warning */}
          {hasChildRecords && (
            <div
              style={{
                padding: '16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#dc2626',
                  margin: '0 0 8px 0'
                }}
              >
                ⚠️ This will delete {childRecordCount} child {childRecordCount === 1 ? 'record' : 'records'}
              </p>

              {/* Breakdown of child records */}
              {Object.keys(childRecordBreakdown).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Object.entries(childRecordBreakdown).map(([type, count]) => (
                    <span
                      key={type}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#7f1d1d',
                        fontWeight: '500'
                      }}
                    >
                      {count} {type}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Confirmation Checkbox */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '16px'
            }}
          >
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{
                marginTop: '2px',
                cursor: 'pointer',
                width: '16px',
                height: '16px'
              }}
            />
            <span
              style={{
                fontSize: '14px',
                color: '#334155',
                lineHeight: '1.5'
              }}
            >
              I understand this action cannot be undone{hasChildRecords ? ' and all associated records will be permanently deleted' : ''}
            </span>
          </label>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleClose}
              disabled={deleteMutation.isPending}
              style={{
                flex: 1,
                padding: '12px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={!confirmed || deleteMutation.isPending}
              style={{
                flex: 1,
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: !confirmed || deleteMutation.isPending ? '#fca5a5' : '#ef4444',
                color: '#ffffff',
                cursor: !confirmed || deleteMutation.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>

          {/* Error Message */}
          {deleteMutation.isError && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px'
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  color: '#dc2626',
                  margin: 0
                }}
              >
                Failed to delete {displayName}. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
