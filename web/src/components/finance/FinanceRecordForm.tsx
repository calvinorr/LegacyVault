import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { isValidSortCode } from '../../utils/ukValidation';
import { useCreateFinanceRecord, useUpdateFinanceRecord } from '../../hooks/useFinanceRecords';
import type { FinanceRecord } from '../../services/api/domains';

import { useRecordTypes } from '../../hooks/useRecordTypes';

interface FinanceFormData {
  name: string;
  recordType: string;
  institution: string;
  accountNumber?: string;
  sortCode?: string;
  currentBalance?: number;
  interestRate?: number;
  monthlyPayment?: number;
  creditLimit?: number;
  maturityDate?: string;
  contactPhone?: string;
  contactEmail?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
}

interface FinanceRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<FinanceRecord>;
}

const FinanceRecordForm: React.FC<FinanceRecordFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const { recordTypes, loading: recordTypesLoading } = useRecordTypes('finance');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FinanceFormData>({
    defaultValues: initialData || { priority: 'Standard' }
  });

  const [apiError, setApiError] = useState('');
  const createMutation = useCreateFinanceRecord();
  const updateMutation = useUpdateFinanceRecord();

  const recordType = watch('recordType');
  const isEditing = !!initialData?._id;

  const onSubmit = async (data: FinanceFormData) => {
    setApiError('');

    // UK sort code validation
    if (data.sortCode && !isValidSortCode(data.sortCode)) {
      setApiError('Invalid UK sort code format (should be XX-XX-XX)');
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: initialData._id!,
          data
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error: any) {
      setApiError(error.message || 'Failed to save finance record');
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
          Account Name *
        </label>
        <input
          {...register('name', { required: 'Name is required' })}
          placeholder="e.g., Main Current Account"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Account Type *
        </label>
        <select
          {...register('recordType', { required: 'Account type is required' })}
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
          Financial Institution *
        </label>
        <input
          {...register('institution', { required: 'Institution is required' })}
          placeholder="e.g., HSBC, Barclays, NatWest"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
        />
        {errors.institution && (
          <p className="mt-1 text-sm text-red-600">{errors.institution.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Account Number
          </label>
          <input
            {...register('accountNumber')}
            type="password"
            placeholder="12345678"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Sort Code
          </label>
          <input
            {...register('sortCode')}
            placeholder="12-34-56"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Current Balance (£)
        </label>
        <input
          {...register('currentBalance', { valueAsNumber: true })}
          type="number"
          step="0.01"
          placeholder="0.00"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
        />
      </div>

      {(recordType === 'savings-account' || recordType === 'isa') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Interest Rate (%)
          </label>
          <input
            {...register('interestRate', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="e.g., 4.5"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
        </div>
      )}

      {(recordType === 'loan' || recordType === 'credit-card') && (
        <div className="border-t border-slate-200 pt-4 mt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment Details</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monthly Payment (£)
              </label>
              <input
                {...register('monthlyPayment', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>
            {recordType === 'credit-card' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Credit Limit (£)
                </label>
                <input
                  {...register('creditLimit', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {(recordType === 'savings-account' || recordType === 'isa') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Maturity Date
          </label>
          <input
            {...register('maturityDate')}
            type="date"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
        </div>
      )}

      <div className="border-t border-slate-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact Information</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contact Phone
            </label>
            <input
              {...register('contactPhone')}
              type="tel"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contact Email
            </label>
            <input
              {...register('contactEmail')}
              type="email"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
        <select
          {...register('priority')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
        >
          <option value="Standard">Standard</option>
          <option value="Important">Important</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          placeholder="Additional information..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Account' : 'Save Account'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default FinanceRecordForm;
