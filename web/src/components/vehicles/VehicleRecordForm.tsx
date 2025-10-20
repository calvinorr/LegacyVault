import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateVehicleRecord } from '../../hooks/useVehicleRecords';
import { VehicleRecord } from '../../services/api/domains';
import { isValidUKRegistration } from '../../utils/ukValidation';
import { useRecordTypes } from '../../hooks/useRecordTypes';

interface VehicleRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VehicleRecordForm: React.FC<VehicleRecordFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { recordTypes, loading: recordTypesLoading } = useRecordTypes('Vehicle');
  const createMutation = useCreateVehicleRecord();
  const [formData, setFormData] = useState<Partial<VehicleRecord>>({
    name: '',
    recordType: '',
    registration: '',
    make: '',
    model: '',
    purchaseDate: '',
    financeProvider: '',
    financeMonthlyPayment: undefined,
    motExpiryDate: '',
    insuranceRenewalDate: '',
    roadTaxExpiryDate: '',
    priority: 'Standard',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof VehicleRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.recordType) newErrors.recordType = 'Record type is required';
    if (formData.registration && !isValidUKRegistration(formData.registration)) {
      newErrors.registration = 'Invalid UK/NI registration plate format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync(formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create vehicle record' });
    }
  };

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '95%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '15px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#0f172a', // Dark text color for visibility
    backgroundColor: '#ffffff'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '6px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
              Add Vehicle Record
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={24} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errors.submit && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              {errors.submit}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              style={inputStyle}
              placeholder="e.g., Family Car, Work Van"
            />
            {errors.name && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '4px' }}>{errors.name}</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Record Type *</label>
            <select
              value={formData.recordType}
              onChange={(e) => handleChange('recordType', e.target.value)}
              style={inputStyle}
              disabled={recordTypesLoading}
            >
              <option value="">Select type...</option>
              {recordTypes.map((type) => (
                <option key={type._id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.recordType && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '4px' }}>{errors.recordType}</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Registration</label>
            <input
              type="text"
              value={formData.registration}
              onChange={(e) => handleChange('registration', e.target.value.toUpperCase())}
              style={inputStyle}
              placeholder="e.g., AB12 CDE"
            />
            {errors.registration && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '4px' }}>{errors.registration}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Make</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                style={inputStyle}
                placeholder="e.g., Ford"
              />
            </div>
            <div>
              <label style={labelStyle}>Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                style={inputStyle}
                placeholder="e.g., Focus"
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Purchase Date</label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleChange('purchaseDate', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Finance Provider</label>
            <input
              type="text"
              value={formData.financeProvider}
              onChange={(e) => handleChange('financeProvider', e.target.value)}
              style={inputStyle}
              placeholder="e.g., Santander Consumer Finance"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Finance Monthly Payment (£)</label>
            <input
              type="number"
              step="0.01"
              value={formData.financeMonthlyPayment || ''}
              onChange={(e) => handleChange('financeMonthlyPayment', e.target.value ? parseFloat(e.target.value) : undefined)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>MOT Expiry Date</label>
            <input
              type="date"
              value={formData.motExpiryDate}
              onChange={(e) => handleChange('motExpiryDate', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Insurance Renewal Date</label>
            <input
              type="date"
              value={formData.insuranceRenewalDate}
              onChange={(e) => handleChange('insuranceRenewalDate', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Road Tax Expiry Date</label>
            <input
              type="date"
              value={formData.roadTaxExpiryDate}
              onChange={(e) => handleChange('roadTaxExpiryDate', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value as 'Critical' | 'Important' | 'Standard')}
              style={inputStyle}
            >
              <option value="Standard">Standard</option>
              <option value="Important">Important</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: createMutation.isPending ? 0.6 : 1,
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              {createMutation.isPending ? 'Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRecordForm;
