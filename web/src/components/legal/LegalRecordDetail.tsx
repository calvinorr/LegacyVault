import React, { useState } from 'react';
import { Pencil, Trash2, Scale } from 'lucide-react';
import type { LegalRecord } from '../../services/api/domains';

interface LegalRecordDetailProps {
  record: LegalRecord;
  onEdit: () => void;
  onDelete: () => void;
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  'will': 'Will',
  'power-of-attorney': 'Power of Attorney',
  'deed': 'Deed',
  'trust': 'Trust',
  'legal-agreement': 'Legal Agreement'
};

const LegalRecordDetail: React.FC<LegalRecordDetailProps> = ({
  record,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-GB', {
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
            <Scale className="w-8 h-8 text-slate-700" />
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
        {/* Document Information */}
        {(record.documentType || record.solicitorName || record.referenceNumber) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Document Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.documentType && (
                <div>
                  <p className="text-sm text-slate-600">Document Type</p>
                  <p className="text-slate-900 font-medium">{record.documentType}</p>
                </div>
              )}
              {record.solicitorName && (
                <div>
                  <p className="text-sm text-slate-600">Solicitor Name</p>
                  <p className="text-slate-900 font-medium">{record.solicitorName}</p>
                </div>
              )}
              {record.referenceNumber && (
                <div>
                  <p className="text-sm text-slate-600">Reference Number</p>
                  <p className="text-slate-900 font-medium">{record.referenceNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Date Information */}
        {(record.dateCreated || record.reviewDate) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Important Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.dateCreated && (
                <div>
                  <p className="text-sm text-slate-600">Date Created</p>
                  <p className="text-slate-900 font-medium">{formatDate(record.dateCreated)}</p>
                </div>
              )}
              {record.reviewDate && (
                <div>
                  <p className="text-sm text-slate-600">Review Date</p>
                  <p className="text-slate-900 font-medium">{formatDate(record.reviewDate)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Storage Location */}
        {record.location && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Physical Storage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Location</p>
                <p className="text-slate-900 font-medium">{record.location}</p>
              </div>
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

export default LegalRecordDetail;
