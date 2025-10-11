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

  // Styles are omitted for brevity but would be the same as the original file

  return (
    <div className="overlay-style" onClick={onClose}>
      <div className="modal-style" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Vehicle Record</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Name */}
          <div>
            <label>Name *</label>
            <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., Family Car, Work Van" />
            {errors.name && <p>{errors.name}</p>}
          </div>

          {/* Record Type */}
          <div>
            <label>Record Type *</label>
            <select value={formData.recordType} onChange={(e) => handleChange('recordType', e.target.value)} disabled={recordTypesLoading}>
              <option value="">Select type...</option>
              {recordTypes.map((type) => (
                <option key={type._id} value={type.name}>{type.name}</option>
              ))}
            </select>
            {errors.recordType && <p>{errors.recordType}</p>}
          </div>

          {/* Other form fields... */}

          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRecordForm;