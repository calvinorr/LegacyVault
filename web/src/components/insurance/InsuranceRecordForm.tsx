import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateInsuranceRecord, useUpdateInsuranceRecord } from '../../hooks/useInsuranceRecords';
import type { InsuranceRecord } from '../../services/api/domains';

interface InsuranceFormData {
  name: string;
  recordType: string;
  provider?: string;
  policyNumber?: string;
  coverageAmount?: number;
  monthlyPremium?: number;
  startDate?: string;
  renewalDate?: string;
  contactPhone?: string;
  contactEmail?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
}

interface InsuranceRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<InsuranceRecord>;
}

const RECORD_TYPES = [
  { value: 'life-insurance', label: 'Life Insurance' },
  { value: 'income-protection', label: 'Income Protection' },
  { value: 'critical-illness', label: 'Critical Illness Cover' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'gap-insurance', label: 'GAP Insurance' }
];

const InsuranceRecordForm: React.FC<InsuranceRecordFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<InsuranceFormData>({
    defaultValues: initialData || { priority: 'Standard' }
  });

  const [apiError, setApiError] = useState('');
  const createMutation = useCreateInsuranceRecord();
  const updateMutation = useUpdateInsuranceRecord();

  const isEditing = !!initialData?._id;

  const onSubmit = async (data: InsuranceFormData) => {
    setApiError('');

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
      setApiError(error.message || 'Failed to save insurance record');
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
          placeholder="e.g., Life Insurance Policy"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Provider
          </label>
          <input
            {...register('provider')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="Insurance company"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Policy Number
          </label>
          <input
            {...register('policyNumber')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="Policy reference"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Coverage Amount (£)
          </label>
          <input
            type="number"
            step="0.01"
            {...register('coverageAmount')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Monthly Premium (£)
          </label>
          <input
            type="number"
            step="0.01"
            {...register('monthlyPremium')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            {...register('startDate')}
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
            placeholder="support@provider.com"
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

export default InsuranceRecordForm;
fault InsuranceRecordForm;
