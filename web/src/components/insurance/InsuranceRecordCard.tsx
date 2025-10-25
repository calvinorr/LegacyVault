import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import type { InsuranceRecord } from '../../services/api/domains';

interface InsuranceRecordCardProps {
  record: InsuranceRecord;
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  'life-insurance': 'Life Insurance',
  'income-protection': 'Income Protection',
  'critical-illness': 'Critical Illness Cover',
  'warranty': 'Warranty',
  'gap-insurance': 'GAP Insurance'
};

const InsuranceRecordCard: React.FC<InsuranceRecordCardProps> = ({ record }) => {
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

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return null;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div
      onClick={() => navigate(`/insurance/${record._id}`)}
      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Shield className="w-5 h-5 text-slate-700" />
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
        {record.provider && (
          <div className="text-sm">
            <span className="text-slate-800">Provider: </span>
            <span className="text-slate-900 font-medium">{record.provider}</span>
          </div>
        )}

        {record.policyNumber && (
          <div className="text-sm">
            <span className="text-slate-800">Policy: </span>
            <span className="text-slate-900">{record.policyNumber}</span>
          </div>
        )}

        {record.coverageAmount !== undefined && record.coverageAmount !== null && (
          <div className="text-sm">
            <span className="text-slate-800">Coverage: </span>
            <span className="text-slate-900 font-semibold">
              {formatCurrency(record.coverageAmount)}
            </span>
          </div>
        )}

        {record.monthlyPremium !== undefined && record.monthlyPremium !== null && (
          <div className="text-sm">
            <span className="text-slate-800">Premium: </span>
            <span className="text-slate-900 font-semibold">
              {formatCurrency(record.monthlyPremium)}/month
            </span>
          </div>
        )}

        {record.renewalDate && (
          <div className="text-sm">
            <span className="text-slate-800">Renewal: </span>
            <span className="text-slate-900">{formatDate(record.renewalDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceRecordCard;
