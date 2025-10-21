// web/src/components/child-records/ChildRecordForm.tsx
// 2-step form for creating/editing child records with continuity-focused fields
// Step 1: Select record type | Step 2: Fill dynamic fields (Continuity prominent, Financial collapsed)

import React, { useState, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, ChevronRight, ChevronLeft, Upload, FileText, Trash2, Download, ExternalLink } from 'lucide-react';
import { ChildRecord, CreateChildRecordData, UpdateChildRecordData, uploadAttachment, deleteAttachment, getAttachmentUrl } from '../../services/api/childRecords';
import { useCreateChildRecord, useUpdateChildRecord } from '../../hooks/useChildRecords';

interface ChildRecordFormProps {
  domain: string;
  parentId: string;
  record?: ChildRecord | null;
  recordType?: string;
  onClose: () => void;
  onSuccess: () => void;
}

type RecordType = 'Contact' | 'ServiceHistory' | 'Finance' | 'Insurance' | 'Government' | 'Pension';

const RECORD_TYPES: RecordType[] = ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension'];

const getRecordTypeIcon = (recordType: RecordType): string => {
  const icons: Record<RecordType, string> = {
    Contact: '📞',
    ServiceHistory: '🔧',
    Finance: '💰',
    Insurance: '🛡️',
    Government: '📋',
    Pension: '💼'
  };
  return icons[recordType] || '📄';
};

const getRecordTypeLabel = (recordType: RecordType): string => {
  const labels: Record<RecordType, string> = {
    Contact: 'Contact',
    ServiceHistory: 'Service History',
    Finance: 'Finance',
    Insurance: 'Insurance',
    Government: 'Government',
    Pension: 'Pension'
  };
  return labels[recordType] || recordType;
};

const getContinuityFields = (recordType: RecordType): string[] => {
  const continuityFields: Record<RecordType, string[]> = {
    Contact: ['name', 'phone', 'email', 'relationship'],
    ServiceHistory: ['name', 'serviceDate', 'nextServiceDue', 'provider', 'phone'],
    Finance: ['name', 'accountNumber', 'policyNumber', 'phone', 'renewalDate'],
    Insurance: ['name', 'policyNumber', 'provider', 'phone', 'renewalDate'],
    Government: ['name', 'accountNumber', 'renewalDate', 'phone'],
    Pension: ['name', 'provider', 'accountNumber', 'phone']
  };
  return continuityFields[recordType] || [];
};

interface FormData {
  name: string;
  phone?: string;
  email?: string;
  relationship?: string;
  provider?: string;
  accountNumber?: string;
  policyNumber?: string;
  renewalDate?: string;
  status?: 'active' | 'expired' | 'cancelled' | 'pending';
  serviceDate?: string;
  nextServiceDue?: string;
  amount?: string;
  frequency?: string;
  notes?: string;
}

export const ChildRecordForm: React.FC<ChildRecordFormProps> = ({
  domain,
  parentId,
  record,
  recordType: initialRecordType,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2>(record ? 2 : initialRecordType ? 2 : 1);
  const [selectedType, setSelectedType] = useState<RecordType>(
    (initialRecordType as RecordType) || 'Contact'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    defaultValues: record ? {
      name: record.name,
      ...record.fields
    } : { status: 'active' }
  });

  const createMutation = useCreateChildRecord(domain, parentId);
  const updateMutation = useUpdateChildRecord(domain, parentId);

  const continuityFields = useMemo(() => getContinuityFields(selectedType), [selectedType]);

  const handleStepOne = (type: RecordType) => {
    setSelectedType(type);
    setStep(2);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (record) {
        await updateMutation.mutateAsync({
          recordId: record._id,
          data: {
            name: data.name,
            fields: Object.fromEntries(
              Object.entries(data).filter(([key]) => key !== 'name')
            )
          } as UpdateChildRecordData
        });
      } else {
        await createMutation.mutateAsync({
          recordType: selectedType,
          name: data.name,
          fields: Object.fromEntries(
            Object.entries(data).filter(([key]) => key !== 'name')
          ),
          status: (data.status || 'active') as 'active' | 'expired' | 'cancelled' | 'pending'
        } as CreateChildRecordData);
      }
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !record) return;

    setUploadingFile(true);
    setUploadError(null);

    try {
      await uploadAttachment(domain, parentId, record._id, selectedFile);
      setSelectedFile(null);
      onSuccess(); // Refresh to show uploaded file
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async () => {
    if (!record || !record.attachment) return;

    try {
      await deleteAttachment(domain, parentId, record._id);
      onSuccess(); // Refresh to remove attachment
    } catch (error: any) {
      setUploadError(error.message || 'Failed to delete attachment');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

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
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Fixed Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#f1f5f9',
            margin: 0
          }}>
            {record ? 'Edit Record' : 'Add Record'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0
        }}>
          {/* Step 1: Record Type Selection */}
          {step === 1 && !record && (
            <div style={{ padding: '24px' }}>
            <p style={{
              fontSize: '14px',
              color: '#94a3b8',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              Select the type of record to create
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px'
            }}>
              {RECORD_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleStepOne(type)}
                  style={{
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{getRecordTypeIcon(type)}</span>
                  {getRecordTypeLabel(type)}
                </button>
              ))}
            </div>
            </div>
          )}

          {/* Step 2: Form Fields */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0
            }}>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0,
                padding: '24px'
              }}>
                {/* Continuity Section (Always Expanded) */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#3b82f6',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>
                📌 Essential Information
              </h3>

              {/* Name Field - Always Present */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#f1f5f9',
                  marginBottom: '4px'
                }}>
                  Record Name *
                </label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Name is required' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder={`e.g., ${selectedType === 'Contact' ? 'John Smith' : selectedType === 'Insurance' ? 'Car Insurance' : 'Enter name'}`}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: errors.name ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: '#f1f5f9',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = errors.name ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'} />
                  )}
                />
                {errors.name && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              {continuityFields.includes('phone') && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#f1f5f9',
                    marginBottom: '4px'
                  }}>
                    📞 Phone
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        placeholder="028-1234-5678 or 07700-900123"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: '#f1f5f9',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  />
                </div>
              )}

              {/* Email Field */}
              {continuityFields.includes('email') && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#f1f5f9',
                    marginBottom: '4px'
                  }}>
                    ✉️ Email
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        placeholder="name@example.com"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: '#f1f5f9',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  />
                </div>
              )}

              {/* Renewal Date Field */}
              {continuityFields.includes('renewalDate') && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#f1f5f9',
                    marginBottom: '4px'
                  }}>
                    📅 Renewal Date
                  </label>
                  <Controller
                    name="renewalDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: '#f1f5f9',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  />
                </div>
              )}

              {/* Status Dropdown */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#f1f5f9',
                  marginBottom: '4px'
                }}>
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: '#f1f5f9',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                    </select>
                  )}
                />
              </div>
            </div>

            {/* Financial Section (Collapsed) */}
            <div style={{
              marginBottom: '24px',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
              opacity: 0.6
            }}>
              <p style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '0 0 8px 0'
              }}>
                💰 Additional Details
              </p>

              {/* Amount Field */}
              {continuityFields.includes('amount') || !record ? (
                <div style={{ marginBottom: '8px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginBottom: '2px'
                  }}>
                    Amount
                  </label>
                  <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., £850"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px',
                          color: '#cbd5e1',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  />
                </div>
              ) : null}

              {/* Notes Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '2px'
                }}>
                  Notes
                </label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="Any additional details..."
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                        color: '#cbd5e1',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                      }}
                    />
                  )}
                />
              </div>
            </div>

            {/* Attachment Section - Only show when editing existing record */}
            {record && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h3 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px',
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FileText size={14} />
                  Document Attachment
                </h3>

                {/* Existing Attachment */}
                {record.attachment && (
                  <div style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <FileText size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {record.attachment.filename}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          Uploaded {new Date(record.attachment.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <a
                        href={getAttachmentUrl(domain, parentId, record._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '6px 10px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                        }}
                      >
                        <ExternalLink size={12} />
                        View
                      </a>
                      <a
                        href={`${getAttachmentUrl(domain, parentId, record._id)}?download=true`}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                        }}
                      >
                        <Download size={12} />
                        Download
                      </a>
                      <button
                        type="button"
                        onClick={handleDeleteAttachment}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                        }}
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload New File */}
                {!record.attachment && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.csv,.xls,.xlsx"
                      style={{ display: 'none' }}
                    />

                    {selectedFile ? (
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <FileText size={18} color="#cbd5e1" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', color: '#e2e8f0' }}>{selectedFile.name}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={handleFileUpload}
                            disabled={uploadingFile}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              backgroundColor: uploadingFile ? '#64748b' : '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: uploadingFile ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {uploadingFile ? 'Uploading...' : 'Upload File'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            disabled={uploadingFile}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: '#cbd5e1',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: uploadingFile ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px dashed rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#cbd5e1',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                      >
                        <Upload size={16} />
                        Choose File (PDF, Images, Documents - Max 10MB)
                      </button>
                    )}

                    {uploadError && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        fontSize: '12px'
                      }}>
                        {uploadError}
                      </div>
                    )}
                  </div>
                )}
                </div>
              )}
              </div>
            </form>
          )}
        </div>

        {/* Fixed Footer */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          padding: '20px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}>
          {step === 2 && !record && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#f1f5f9',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: isLoading ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isLoading ? 'Saving...' : record ? 'Save Changes' : 'Create Record'}
                {!isLoading && <ChevronRight size={16} />}
              </button>
        </div>
      </div>
    </div>
  );
};
