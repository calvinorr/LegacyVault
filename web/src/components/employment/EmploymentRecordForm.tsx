import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateEmploymentRecord, useUpdateEmploymentRecord } from '../../hooks/useEmploymentRecords';
import type { EmploymentRecord } from '../../services/api/domains';

import { useRecordTypes } from '../../hooks/useRecordTypes';

interface EmploymentFormData {
  name: string;
  recordType: string;
  employerName?: string;
  jobTitle?: string;
  salary?: number;
  pensionScheme?: string;
  pensionContribution?: number;
  contactPhone?: string;
  contactEmail?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
}

interface EmploymentRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<EmploymentRecord>;
}

const EmploymentRecordForm: React.FC<EmploymentRecordFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const { recordTypes, loading: recordTypesLoading } = useRecordTypes('Employment');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<EmploymentFormData>({
    defaultValues: initialData || { priority: 'Standard' }
  });

  const [apiError, setApiError] = useState('');
  const createMutation = useCreateEmploymentRecord();
  const updateMutation = useUpdateEmploymentRecord();

  const isEditing = !!initialData?._id;

  const onSubmit = async (data: EmploymentFormData) => {
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
      setApiError(error.message || 'Failed to save employment record');
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
          placeholder="e.g., Current Employment"
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
            Employer Name
          </label>
          <input
            {...register('employerName')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="Company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Job Title
          </label>
          <input
            {...register('jobTitle')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="Position title"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Annual Salary (£)
          </label>
          <input
            type="number"
            step="0.01"
            {...register('salary')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Pension Contribution (%)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('pensionContribution')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="0.0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Pension Scheme
        </label>
        <input
          {...register('pensionScheme')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          placeholder="e.g., NEST, Aviva"
        />
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
            placeholder="hr@company.com"
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

export default EmploymentRecordForm;
