import React, { useState } from 'react';
import { Pencil, Trash2, Wrench } from 'lucide-react';
import type { ServicesRecord } from '../../services/api/domains';

interface ServicesRecordDetailProps {
  record: ServicesRecord;
  onEdit: () => void;
  onDelete: () => void;
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  'tradesperson': 'Tradesperson',
  'cleaner': 'Cleaner',
  'gardener': 'Gardener',
  'pest-control': 'Pest Control',
  'other-service': 'Other Service'
};

const ServicesRecordDetail: React.FC<ServicesRecordDetailProps> = ({
  record,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatRate = (rate?: number) => {
    if (rate === undefined || rate === null) return null;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(rate);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'Important':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-slate-100">
            <Wrench className="w-8 h-8 text-slate-700" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{record.name}</h2>
            <p className="text-slate-600 mt-1">
              {RECORD_TYPE_LABELS[record.recordType] || record.recordType}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-colors ${
              showDeleteConfirm
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'text-slate-600 hover:text-red-700 hover:bg-red-50'
            }`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Priority Badge */}
      {record.priority !== 'Standard' && (
        <div className="mb-6">
          <span
            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
              record.priority
            )}`}
          >
            {record.priority}
          </span>
        </div>
      )}

      {/* Details Grid */}
      <div className="space-y-6">
        {/* Service Details */}
        {(record.serviceProvider || record.serviceType) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Service Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.serviceProvider && (
                <div>
                  <p className="text-sm text-slate-600">Service Provider</p>
                  <p className="text-slate-900 font-medium">{record.serviceProvider}</p>
                </div>
              )}
              {record.serviceType && (
                <div>
                  <p className="text-sm text-slate-600">Service Type</p>
                  <p className="text-slate-900 font-medium">{record.serviceType}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Details */}
        {record.hourlyRate !== undefined && record.hourlyRate !== null && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Hourly Rate</p>
                <p className="text-slate-900 font-semibold text-lg">
                  {formatRate(record.hourlyRate)}/hour
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Service Dates */}
        {(record.lastServiceDate || record.nextServiceDate) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Service History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.lastServiceDate && (
                <div>
                  <p className="text-sm text-slate-600">Last Service Date</p>
                  <p className="text-slate-900 font-medium">{formatDate(record.lastServiceDate)}</p>
                </div>
              )}
              {record.nextServiceDate && (
                <div>
                  <p className="text-sm text-slate-600">Next Service Date</p>
                  <p className="text-slate-900 font-medium">{formatDate(record.nextServiceDate)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {(record.contactName || record.contactPhone || record.contactEmail) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.contactName && (
                <div>
                  <p className="text-sm text-slate-600">Contact Name</p>
                  <p className="text-slate-900">{record.contactName}</p>
                </div>
              )}
              {record.contactPhone && (
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="text-slate-900">{record.contactPhone}</p>
                </div>
              )}
              {record.contactEmail && (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="text-slate-900">{record.contactEmail}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Notes</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{record.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesRecordDetail;
