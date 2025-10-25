import React, { useState } from 'react';
import { Pencil, Trash2, Shield } from 'lucide-react';
import type { InsuranceRecord } from '../../services/api/domains';

interface InsuranceRecordDetailProps {
  record: InsuranceRecord;
  onEdit: () => void;
  onDelete: () => void;
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  'life-insurance': 'Life Insurance',
  'income-protection': 'Income Protection',
  'critical-illness': 'Critical Illness Cover',
  'warranty': 'Warranty',
  'gap-insurance': 'GAP Insurance'
};

const InsuranceRecordDetail: React.FC<InsuranceRecordDetailProps> = ({
  record,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return null;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'Important':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
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
            <Shield className="w-8 h-8 text-slate-700" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{record.name}</h2>
            <p className="text-slate-800 mt-1">
              {RECORD_TYPE_LABELS[record.recordType] || record.recordType}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-colors ${
              showDeleteConfirm
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'text-slate-800 hover:text-red-700 hover:bg-red-50'
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
        {/* Policy Details */}
        {(record.provider || record.policyNumber) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Policy Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.provider && (
                <div>
                  <p className="text-sm text-slate-800">Provider</p>
                  <p className="text-slate-900 font-medium">{record.provider}</p>
                </div>
              )}
              {record.policyNumber && (
                <div>
                  <p className="text-sm text-slate-800">Policy Number</p>
                  <p className="text-slate-900 font-medium">{record.policyNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Details */}
        {((record.coverageAmount !== undefined && record.coverageAmount !== null) ||
          (record.monthlyPremium !== undefined && record.monthlyPremium !== null)) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Financial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.coverageAmount !== undefined && record.coverageAmount !== null && (
                <div>
                  <p className="text-sm text-slate-800">Coverage Amount</p>
                  <p className="text-slate-900 font-semibold text-lg">
                    {formatCurrency(record.coverageAmount)}
                  </p>
                </div>
              )}
              {record.monthlyPremium !== undefined && record.monthlyPremium !== null && (
                <div>
                  <p className="text-sm text-slate-800">Monthly Premium</p>
                  <p className="text-slate-900 font-semibold text-lg">
                    {formatCurrency(record.monthlyPremium)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Date Information */}
        {(record.startDate || record.renewalDate) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Important Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.startDate && (
                <div>
                  <p className="text-sm text-slate-800">Start Date</p>
                  <p className="text-slate-900 font-medium">{formatDate(record.startDate)}</p>
                </div>
              )}
              {record.renewalDate && (
                <div>
                  <p className="text-sm text-slate-800">Renewal Date</p>
                  <p className="text-slate-900 font-medium">{formatDate(record.renewalDate)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {(record.contactPhone || record.contactEmail) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.contactPhone && (
                <div>
                  <p className="text-sm text-slate-800">Phone</p>
                  <p className="text-slate-900">{record.contactPhone}</p>
                </div>
              )}
              {record.contactEmail && (
                <div>
                  <p className="text-sm text-slate-800">Email</p>
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

export default InsuranceRecordDetail;
