import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { GovernmentRecord } from '../../services/api/domains';

interface GovernmentRecordCardProps {
  record: GovernmentRecord;
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

const GovernmentRecordCard: React.FC<GovernmentRecordCardProps> = ({ record }) => {
  const navigate = useNavigate();

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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

  return (
    <div
      onClick={() => navigate(`/government/${record._id}`)}
      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <FileText className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{record.name}</h3>
            <p className="text-sm text-slate-600">
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
        {record.referenceNumber && (
          <div className="text-sm">
            <span className="text-slate-600">Reference: </span>
            <span className="text-slate-900 font-medium">{record.referenceNumber}</span>
          </div>
        )}

        {record.expiryDate && (
          <div className="text-sm">
            <span className="text-slate-600">Expiry: </span>
            <span
              className={`font-medium ${
                isExpired(record.expiryDate)
                  ? 'text-red-700'
                  : isExpiringSoon(record.expiryDate)
                  ? 'text-amber-700'
                  : 'text-slate-900'
              }`}
            >
              {formatDate(record.expiryDate)}
            </span>
            {isExpired(record.expiryDate) && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                Expired
              </span>
            )}
            {!isExpired(record.expiryDate) && isExpiringSoon(record.expiryDate) && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                Expiring Soon
              </span>
            )}
          </div>
        )}

        {record.niNumber && (
          <div className="text-sm">
            <span className="text-slate-600">NI Number: </span>
            <span className="text-slate-900 font-medium">{record.niNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentRecordCard;
