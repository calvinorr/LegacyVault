import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import type { ServicesRecord } from '../../services/api/domains';

interface ServicesRecordCardProps {
  record: ServicesRecord;
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  'tradesperson': 'Tradesperson',
  'cleaner': 'Cleaner',
  'gardener': 'Gardener',
  'pest-control': 'Pest Control',
  'other-service': 'Other Service'
};

const ServicesRecordCard: React.FC<ServicesRecordCardProps> = ({ record }) => {
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

  return (
    <div
      onClick={() => navigate(`/services/${record._id}`)}
      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Wrench className="w-5 h-5 text-slate-700" />
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
        {record.serviceProvider && (
          <div className="text-sm">
            <span className="text-slate-800">Provider: </span>
            <span className="text-slate-900 font-medium">{record.serviceProvider}</span>
          </div>
        )}

        {record.serviceType && (
          <div className="text-sm">
            <span className="text-slate-800">Type: </span>
            <span className="text-slate-900">{record.serviceType}</span>
          </div>
        )}

        {record.hourlyRate !== undefined && record.hourlyRate !== null && (
          <div className="text-sm">
            <span className="text-slate-800">Rate: </span>
            <span className="text-slate-900 font-semibold">
              {formatRate(record.hourlyRate)}/hour
            </span>
          </div>
        )}

        {record.nextServiceDate && (
          <div className="text-sm">
            <span className="text-slate-800">Next Service: </span>
            <span className="text-slate-900">{formatDate(record.nextServiceDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesRecordCard;
