import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, AlertCircle } from 'lucide-react';
import { PropertyRecord } from '../../services/api/domains';

interface PropertyRecordCardProps {
  record: PropertyRecord;
}

const PropertyRecordCard: React.FC<PropertyRecordCardProps> = ({ record }) => {
  const navigate = useNavigate();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Important':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div
      onClick={() => navigate(`/property/${record._id}`)}
      className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Home className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {record.name}
            </h3>
            {record.provider && (
              <p className="text-sm text-slate-600 mt-0.5">
                {record.provider}
              </p>
            )}
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(record.priority)}`}>
          {record.priority}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        {record.recordType && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Type:</span>
            <span className="capitalize">{record.recordType.replace('-', ' ')}</span>
          </div>
        )}
        {record.renewalDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Renewal: {formatDate(record.renewalDate)}</span>
          </div>
        )}
        {record.monthlyAmount && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Monthly:</span>
            <span className="font-medium text-slate-900">£{record.monthlyAmount.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyRecordCard;
