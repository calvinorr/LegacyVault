import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateGovernmentRecord, useUpdateGovernmentRecord } from '../../hooks/useGovernmentRecords';
import { isValidNINumber } from '../../utils/ukValidation';
import type { GovernmentRecord } from '../../services/api/domains';

interface GovernmentFormData {
  name: string;
  recordType: string;
  referenceNumber?: string;
  niNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  contactPhone?: string;
  contactEmail?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
}

interface GovernmentRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<GovernmentRecord>;
}

const RECORD_TYPES = [
  { value: 'ni-number', label: 'National Insurance' },
  { value: 'tax', label: 'Tax' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving-licence', label: 'Driving Licence' },
  { value: 'vehicle-tax', label: 'Vehicle Tax' },
  { value: 'tv-licence', label: 'TV Licence' },
  { value: 'other-licence', label: 'Other Licence' }
];

const GovernmentRecordForm: React.FC<GovernmentRecordFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<GovernmentFormData>({
    defaultValues: initialData || { priority: 'Standard' }
  });

  const [apiError, setApiError] = useState('');
  const [niValidationError, setNiValidationError] = useState('');
  const createMutation = useCreateGovernmentRecord();
  const updateMutation = useUpdateGovernmentRecord();

  const isEditing = !!initialData?._id;
  const niNumber = watch('niNumber');

  const validateNI = (value?: string) => {
    if (!value) {
      setNiValidationError('');
      return true;
    }
    if (!isValidNINumber(value)) {
      setNiValidationError('Invalid NI number format');
      return false;
    }
    setNiValidationError('');
    return true;
  };

  const onSubmit = async (data: GovernmentFormData) => {
    setApiError('');

    // Validate NI number if present
    if (data.niNumber && !validateNI(data.niNumber)) {
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          recordId: initialData._id!,
          data
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error: any) {
      setApiError(error.message || 'Failed to save government record');
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {apiError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Record Name *
        </label>
        <input
          {...register('name', { required: 'Record name is required' })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          placeholder="e.g., Current Passport"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Record Type *
        </label>
        <select
          {...register('recordType', { required: 'Record type is required' })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          disabled={recordTypesLoading}
        >
          <option value="">Select type...</option>
          {recordTypes.map((type) => (
            <option key={type._id} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>
        {errors.recordType && (
          <p className="mt-1 text-sm text-red-600">{errors.recordType.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Reference Number
        </label>
        <input
          {...register('referenceNumber')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          placeholder="Document or reference number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          National Insurance Number
        </label>
        <input
          {...register('niNumber')}
          onBlur={(e) => validateNI(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          placeholder="AB 12 34 56 C"
        />
        {niValidationError && (
          <p className="mt-1 text-sm text-red-600">{niValidationError}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Issue Date
          </label>
          <input
            type="date"
            {...register('issueDate')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            {...register('expiryDate')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Renewal Date
          </label>
          <input
            type="date"
            {...register('renewalDate')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contact Phone
          </label>
          <input
            type="tel"
            {...register('contactPhone')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="01234 567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            {...register('contactEmail')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="contact@gov.uk"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Priority
        </label>
        <select
          {...register('priority')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
        >
          <option value="Critical">Critical</option>
          <option value="Important">Important</option>
          <option value="Standard">Standard</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          placeholder="Additional information..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-700 hover:text-slate-900"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default GovernmentRecordForm;
