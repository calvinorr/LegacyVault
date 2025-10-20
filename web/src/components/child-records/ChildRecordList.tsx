// web/src/components/child-records/ChildRecordList.tsx
// Display child records grouped by type with collapsible sections and urgency indicators

import React, { useState } from 'react';
import { ChevronDown, Plus, Paperclip } from 'lucide-react';
import { ChildRecord, getAttachmentUrl } from '../../services/api/childRecords';
import { calculateRenewalUrgency, hasUrgentRenewals, shouldExpandSection } from '../../utils/renewalUrgency';
import { ChildRecordForm } from './ChildRecordForm';
import { DeleteChildRecordModal } from './DeleteChildRecordModal';

interface ChildRecordListProps {
  domain: string;
  parentId: string;
  childRecords?: Record<string, ChildRecord[]>;
  onAddRecord?: (recordType: string) => void;
  onEditRecord?: (recordType: string, record: ChildRecord) => void;
  onDeleteRecord?: (recordType: string, recordId: string) => void;
}

export const ChildRecordList: React.FC<ChildRecordListProps> = ({
  domain,
  parentId,
  childRecords = {},
  onAddRecord,
  onEditRecord,
  onDeleteRecord
}) => {
  const recordTypes = ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension'];
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    recordTypes.forEach((type) => {
      const records = childRecords[type] || [];
      const urgent = hasUrgentRenewals(records);
      initial[type] = shouldExpandSection(records, urgent);
    });
    return initial;
  });

  const [formState, setFormState] = useState<{
    isOpen: boolean;
    record?: ChildRecord;
    recordType?: string;
  }>({ isOpen: false });

  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean;
    record?: ChildRecord;
    isLoading?: boolean;
  }>({ isOpen: false });

  const toggleSection = (recordType: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [recordType]: !prev[recordType]
    }));
  };

  const getRecordTypeLabel = (recordType: string): string => {
    const labels: Record<string, string> = {
      Contact: 'Contacts',
      ServiceHistory: 'Service History',
      Finance: 'Finance',
      Insurance: 'Insurance',
      Government: 'Government',
      Pension: 'Pensions'
    };
    return labels[recordType] || recordType;
  };

  const getRecordTypeIcon = (recordType: string): string => {
    const icons: Record<string, string> = {
      Contact: '📞',
      ServiceHistory: '🔧',
      Finance: '💰',
      Insurance: '🛡️',
      Government: '📋',
      Pension: '💼'
    };
    return icons[recordType] || '📄';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Section Header */}
      <div style={{
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#f1f5f9',
          margin: '0 0 8px 0'
        }}>
          Related Records
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          margin: 0
        }}>
          Manage contacts, finance, insurance, and other information
        </p>
      </div>

      {/* Record Type Sections */}
      {recordTypes.map((recordType) => {
        const records = childRecords[recordType] || [];
        const isExpanded = expandedSections[recordType];
        const hasUrgent = hasUrgentRenewals(records);

        return (
          <div
            key={recordType}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            {/* Section Header (Collapsible) */}
            <button
              onClick={() => toggleSection(recordType)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flex: 1
              }}>
                <span style={{ fontSize: '20px' }}>{getRecordTypeIcon(recordType)}</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#f1f5f9',
                    margin: 0
                  }}>
                    {getRecordTypeLabel(recordType)}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    margin: '4px 0 0 0'
                  }}>
                    {records.length} record{records.length !== 1 ? 's' : ''}
                    {hasUrgent && (
                      <span style={{
                        marginLeft: '8px',
                        color: '#ef4444',
                        fontWeight: '600'
                      }}>
                        • ⚠️ Has urgent renewals
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Expand/Collapse Indicator */}
              <ChevronDown
                size={20}
                style={{
                  color: '#94a3b8',
                  transition: 'transform 0.3s',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)'
                }}
              />
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div style={{
                padding: '0 16px 16px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {records.length === 0 ? (
                  <div style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      margin: '0 0 12px 0'
                    }}>
                      No {getRecordTypeLabel(recordType).toLowerCase()} yet
                    </p>
                    <button
                      onClick={() => setFormState({ isOpen: true, recordType })}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Plus size={14} />
                      Add {getRecordTypeLabel(recordType).slice(0, -1)}
                    </button>
                  </div>
                ) : (
                  records.map((record) => {
                    const urgency = calculateRenewalUrgency(record.renewalDate);
                    const urgencyColors = {
                      critical: { border: '#ef4444', bg: '#fef2f2', text: '#991b1b' },
                      important: { border: '#f97316', bg: '#fff7ed', text: '#92400e' },
                      upcoming: { border: '#3b82f6', bg: '#eff6ff', text: '#1e3a8a' },
                      none: { border: '#cbd5e1', bg: '#f1f5f9', text: '#64748b' }
                    };
                    const colors = urgencyColors[urgency.level];

                    return (
                      <div
                        key={record._id}
                        style={{
                          padding: '12px',
                          backgroundColor: colors.bg,
                          border: `2px solid ${colors.border}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <p style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: colors.text,
                                margin: 0,
                                wordBreak: 'break-word'
                              }}>
                                {record.name}
                              </p>

                              {/* Attachment Indicator */}
                              {record.attachment && (
                                <a
                                  href={getAttachmentUrl(domain, parentId, record._id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    color: '#3b82f6',
                                    whiteSpace: 'nowrap',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                                  }}
                                >
                                  <Paperclip size={12} />
                                  File
                                </a>
                              )}
                            </div>

                            {/* Show Contact Info if Available */}
                            {(record.fields?.phone || record.fields?.email) && (
                              <div style={{ marginBottom: '8px' }}>
                                {record.fields?.phone && (
                                  <p style={{
                                    fontSize: '13px',
                                    color: colors.text,
                                    margin: '4px 0',
                                    opacity: 0.9
                                  }}>
                                    📞 {record.fields.phone}
                                  </p>
                                )}
                                {record.fields?.email && (
                                  <p style={{
                                    fontSize: '13px',
                                    color: colors.text,
                                    margin: '4px 0',
                                    opacity: 0.9
                                  }}>
                                    ✉️ {record.fields.email}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Renewal Date */}
                            {urgency.level !== 'none' && (
                              <p style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: colors.text,
                                margin: '4px 0',
                                opacity: 0.9
                              }}>
                                {urgency.message}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div style={{
                            display: 'flex',
                            gap: '6px',
                            flexShrink: 0
                          }}>
                            <button
                              onClick={() => setFormState({ isOpen: true, record, recordType })}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                color: '#3b82f6',
                                border: '1px solid #3b82f6',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteState({ isOpen: true, record })}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Add Record Button (if has records) */}
                {records.length > 0 && (
                  <button
                    onClick={() => setFormState({ isOpen: true, recordType })}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      border: '1px dashed #3b82f6',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginTop: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    }}
                  >
                    + Add another {getRecordTypeLabel(recordType).slice(0, -1)}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Form Modal */}
      {formState.isOpen && (
        <ChildRecordForm
          domain={domain}
          parentId={parentId}
          record={formState.record}
          recordType={formState.recordType}
          onClose={() => setFormState({ isOpen: false })}
          onSuccess={() => {
            setFormState({ isOpen: false });
            onAddRecord?.(formState.recordType || 'Contact');
          }}
        />
      )}

      {/* Delete Modal */}
      {deleteState.isOpen && deleteState.record && (
        <DeleteChildRecordModal
          record={deleteState.record}
          isLoading={deleteState.isLoading}
          onConfirm={async () => {
            setDeleteState({ ...deleteState, isLoading: true });
            try {
              onDeleteRecord?.(deleteState.record!.recordType, deleteState.record!._id);
              setDeleteState({ isOpen: false });
            } finally {
              setDeleteState({ ...deleteState, isLoading: false });
            }
          }}
          onCancel={() => setDeleteState({ isOpen: false })}
        />
      )}
    </div>
  );
};
