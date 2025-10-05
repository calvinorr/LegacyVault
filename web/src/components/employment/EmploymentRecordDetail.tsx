import React, { useState } from 'react';
import { Pencil, Trash2, Briefcase } from 'lucide-react';
import type { EmploymentRecord } from '../../services/api/domains';

interface EmploymentRecordDetailProps {
  record: EmploymentRecord;
  onEdit: () => void;
  onDelete: () => void;
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  'employment-details': 'Employment Details',
  'pension': 'Pension',
  'payroll': 'Payroll',
  'benefits': 'Benefits'
};

const EmploymentRecordDetail: React.FC<EmploymentRecordDetailProps> = ({
  record,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatSalary = (salary?: number) => {
    if (salary === undefined || salary === null) return null;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(salary);
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
            <Briefcase className="w-8 h-8 text-slate-700" />
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
        {/* Employment Details */}
        {(record.employerName || record.jobTitle) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Employment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.employerName && (
                <div>
                  <p className="text-sm text-slate-600">Employer Name</p>
                  <p className="text-slate-900 font-medium">{record.employerName}</p>
                </div>
              )}
              {record.jobTitle && (
                <div>
                  <p className="text-sm text-slate-600">Job Title</p>
                  <p className="text-slate-900 font-medium">{record.jobTitle}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Details */}
        {(record.salary !== undefined && record.salary !== null) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Financial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Annual Salary</p>
                <p className="text-slate-900 font-semibold text-lg">
                  {formatSalary(record.salary)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pension Details */}
        {(record.pensionScheme || record.pensionContribution) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Pension Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.pensionScheme && (
                <div>
                  <p className="text-sm text-slate-600">Pension Scheme</p>
                  <p className="text-slate-900 font-medium">{record.pensionScheme}</p>
                </div>
              )}
              {record.pensionContribution && (
                <div>
                  <p className="text-sm text-slate-600">Contribution Rate</p>
                  <p className="text-slate-900 font-medium">{record.pensionContribution}%</p>
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
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="text-slate-900">{record.contactPhone}</p>
                </div>
              )}
              {record.contactEmail && (
                <div>
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

export default EmploymentRecordDetail;
