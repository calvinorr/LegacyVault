import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';
import type { LegalRecord } from '../../services/api/domains';

interface LegalRecordCardProps {
  record: LegalRecord;
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  'will': 'Will',
  'power-of-attorney': 'Power of Attorney',
  'deed': 'Deed',
  'trust': 'Trust',
  'legal-agreement': 'Legal Agreement'
};

const LegalRecordCard: React.FC<LegalRecordCardProps> = ({ record }) => {
  const navigate = useNavigate();

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

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div
      onClick={() => navigate(`/legal/${record._id}`)}
      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Scale className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{record.name}</h3>
            <p className="text-sm text-slate-800">
              {RECORD_TYPE_LABELS[record.recordType] || record.recordType}
            </p>
          </div>
        </div>
        {record.priority !== 'Standard' && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
              record.priority
            )}`}
          >
            {record.priority}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {record.solicitorName && (
          <div className="text-sm">
            <span className="text-slate-800">Solicitor: </span>
            <span className="text-slate-900 font-medium">{record.solicitorName}</span>
          </div>
        )}

        {record.referenceNumber && (
          <div className="text-sm">
            <span className="text-slate-800">Reference: </span>
            <span className="text-slate-900">{record.referenceNumber}</span>
          </div>
        )}

        {record.reviewDate && (
          <div className="text-sm">
            <span className="text-slate-800">Review Date: </span>
            <span className="text-slate-900">{formatDate(record.reviewDate)}</span>
          </div>
        )}

        {record.location && (
          <div className="text-sm">
            <span className="text-slate-800">Location: </span>
            <span className="text-slate-900">{record.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalRecordCard;
