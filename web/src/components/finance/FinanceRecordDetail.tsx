import React, { useState } from 'react';
import { Pencil, Trash2, Banknote } from 'lucide-react';
import { maskAccountNumber, maskSortCode } from '../../utils/dataMasking';
import SensitiveDataField from './SensitiveDataField';
import type { FinanceRecord } from '../../services/api/domains';

interface FinanceRecordDetailProps {
  record: FinanceRecord;
  onEdit: () => void;
  onDelete: () => void;
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  'current-account': 'Current Account',
  'savings-account': 'Savings Account',
  'isa': 'ISA',
  'credit-card': 'Credit Card',
  'loan': 'Loan',
  'investment': 'Investment',
  'premium-bonds': 'Premium Bonds',
  'pension': 'Pension / SIPP'
};

const FinanceRecordDetail: React.FC<FinanceRecordDetailProps> = ({
  record,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatBalance = (balance?: number) => {
    if (balance === undefined || balance === null) return null;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(balance);
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
            <Banknote className="w-8 h-8 text-slate-700" />
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
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-colors ${
              showDeleteConfirm
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
              record.priority
            )}`}
          >
            {record.priority} Priority
          </span>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>

        <div className="grid grid-cols-2 gap-4">
          {record.institution && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Institution
              </label>
              <p className="text-slate-900">{record.institution}</p>
            </div>
          )}

          {record.recordType && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Account Type
              </label>
              <p className="text-slate-900">
                {RECORD_TYPE_LABELS[record.recordType] || record.recordType}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sensitive Information */}
      {(record.accountNumber || record.sortCode) && (
        <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Account Details</h3>

          <div className="grid grid-cols-2 gap-4">
            {record.accountNumber && (
              <SensitiveDataField
                label="Account Number"
                value={record.accountNumber}
                maskedValue={maskAccountNumber(record.accountNumber)}
              />
            )}

            {record.sortCode && (
              <SensitiveDataField
                label="Sort Code"
                value={record.sortCode}
                maskedValue={maskSortCode(record.sortCode)}
              />
            )}
          </div>
        </div>
      )}

      {/* Financial Information */}
      <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Financial Details</h3>

        <div className="grid grid-cols-2 gap-4">
          {record.currentBalance !== undefined && record.currentBalance !== null && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Balance
              </label>
              <p className="text-slate-900 text-lg font-semibold">
                {formatBalance(record.currentBalance)}
              </p>
            </div>
          )}

          {record.interestRate !== undefined && record.interestRate !== null && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Interest Rate
              </label>
              <p className="text-slate-900">{record.interestRate}%</p>
            </div>
          )}

          {record.monthlyPayment !== undefined && record.monthlyPayment !== null && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monthly Payment
              </label>
              <p className="text-slate-900">{formatBalance(record.monthlyPayment)}</p>
            </div>
          )}

          {record.creditLimit !== undefined && record.creditLimit !== null && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Credit Limit
              </label>
              <p className="text-slate-900">{formatBalance(record.creditLimit)}</p>
            </div>
          )}

          {record.maturityDate && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Maturity Date
              </label>
              <p className="text-slate-900">{formatDate(record.maturityDate)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      {(record.contactPhone || record.contactEmail) && (
        <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>

          <div className="grid grid-cols-2 gap-4">
            {record.contactPhone && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <p className="text-slate-900">{record.contactPhone}</p>
              </div>
            )}

            {record.contactEmail && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <p className="text-slate-900">{record.contactEmail}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {record.notes && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Notes</h3>
          <p className="text-slate-800 whitespace-pre-wrap">{record.notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-6 pt-6 border-t border-slate-200 text-sm text-slate-800">
        <p>Created: {formatDate(record.createdAt)}</p>
        {record.updatedAt !== record.createdAt && (
          <p>Updated: {formatDate(record.updatedAt)}</p>
        )}
      </div>

      {/* Delete Confirmation Message */}
      {showDeleteConfirm && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Click delete again to confirm deletion
        </div>
      )}
    </div>
  );
};

export default FinanceRecordDetail;
