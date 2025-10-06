import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateLegalRecord, useUpdateLegalRecord } from '../../hooks/useLegalRecords';
import type { LegalRecord } from '../../services/api/domains';

interface LegalFormData {
  name: string;
  recordType: string;
  documentType?: string;
  solicitorName?: string;
  referenceNumber?: string;
  dateCreated?: string;
  reviewDate?: string;
  location?: string;
  contactPhone?: string;
  contactEmail?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
}

interface LegalRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<LegalRecord>;
}

const LegalRecordForm: React.FC<LegalRecordFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const { recordTypes, loading: recordTypesLoading } = useRecordTypes('legal');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LegalFormData>({
    defaultValues: initialData || { priority: 'Standard' }
  });

  const [apiError, setApiError] = useState('');
  const createMutation = useCreateLegalRecord();
  const updateMutation = useUpdateLegalRecord();

  const isEditing = !!initialData?._id;

  const onSubmit = async (data: LegalFormData) => {
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
      setApiError(error.message || 'Failed to save legal record');
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
          placeholder="e.g., Last Will & Testament"
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
        >
          <option value="">Select type...</option>
          {RECORD_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
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
            Document Type
          </label>
          <input
            {...register('documentType')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="e.g., Original, Copy, Digital"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Solicitor Name
          </label>
          <input
            {...register('solicitorName')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="Solicitor or firm name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Reference Number
          </label>
          <input
            {...register('referenceNumber')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="Case or reference number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date Created
          </label>
          <input
            type="date"
            {...register('dateCreated')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Review Date
          </label>
          <input
            type="date"
            {...register('reviewDate')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Physical Storage Location
          </label>
          <input
            {...register('location')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="e.g., Safe deposit box, Home safe"
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
            placeholder="solicitor@firm.co.uk"
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

export default LegalRecordForm;
