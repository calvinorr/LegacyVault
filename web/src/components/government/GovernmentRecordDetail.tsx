import React, { useState } from 'react';
import { Pencil, Trash2, FileText } from 'lucide-react';
import type { GovernmentRecord } from '../../services/api/domains';

interface GovernmentRecordDetailProps {
  record: GovernmentRecord;
  onEdit: () => void;
  onDelete: () => void;
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  'ni-number': 'National Insurance',
  'tax': 'Tax',
  'passport': 'Passport',
  'driving-licence': 'Driving Licence',
  'vehicle-tax': 'Vehicle Tax',
  'tv-licence': 'TV Licence',
  'other-licence': 'Other Licence'
};

const GovernmentRecordDetail: React.FC<GovernmentRecordDetailProps> = ({
  record,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        return 'bg-slate-100 text-slate-600';
    }
  };

  const isExpiringSoon = (dateString?: string) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    return expiryDate < today;
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
            <FileText className="w-8 h-8 text-slate-700" />
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

      {/* Expiry Warning */}
      {record.expiryDate && (
        <div className="mb-6">
          {isExpired(record.expiryDate) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                This document expired on {formatDate(record.expiryDate)}
              </p>
            </div>
          )}
          {!isExpired(record.expiryDate) && isExpiringSoon(record.expiryDate) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 font-medium">
                This document expires soon on {formatDate(record.expiryDate)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Details Grid */}
      <div className="space-y-6">
        {/* Document Details */}
        {(record.referenceNumber || record.niNumber) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Document Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.referenceNumber && (
                <div>
                  <p className="text-sm text-slate-600">Reference Number</p>
                  <p className="text-slate-900 font-medium">{record.referenceNumber}</p>
                </div>
              )}
              {record.niNumber && (
                <div>
                  <p className="text-sm text-slate-600">National Insurance Number</p>
                  <p className="text-slate-900 font-medium">{record.niNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Date Information */}
        {(record.issueDate || record.expiryDate || record.renewalDate) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Date Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {record.issueDate && (
                <div>
                  <p className="text-sm text-slate-600">Issue Date</p>
                  <p className="text-slate-900 font-medium">{formatDate(record.issueDate)}</p>
                </div>
              )}
              {record.expiryDate && (
                <div>
                  <p className="text-sm text-slate-600">Expiry Date</p>
                  <p
                    className={`font-medium ${
                      isExpired(record.expiryDate)
                        ? 'text-red-700'
                        : isExpiringSoon(record.expiryDate)
                        ? 'text-amber-700'
                        : 'text-slate-900'
                    }`}
                  >
                    {formatDate(record.expiryDate)}
                  </p>
                </div>
              )}
              {record.renewalDate && (
                <div>
                  <p className="text-sm text-slate-600">Renewal Date</p>
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

export default GovernmentRecordDetail;
