import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, AlertCircle } from 'lucide-react';
import { maskAccountNumber, maskSortCode } from '../../utils/dataMasking';
import type { FinanceRecord } from '../../services/api/domains';

interface FinanceRecordCardProps {
  record: FinanceRecord;
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

const FinanceRecordCard: React.FC<FinanceRecordCardProps> = ({ record }) => {
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

  const formatBalance = (balance?: number) => {
    if (balance === undefined || balance === null) return null;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(balance);
  };

  return (
    <div
      onClick={() => navigate(`/finance/${record._id}`)}
      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Banknote className="w-5 h-5 text-slate-700" />
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
        {record.institution && (
          <div className="text-sm">
            <span className="text-slate-800">Institution: </span>
            <span className="text-slate-900 font-medium">{record.institution}</span>
          </div>
        )}

        {record.sortCode && (
          <div className="text-sm">
            <span className="text-slate-800">Sort Code: </span>
            <span className="text-slate-900 font-mono">
              {maskSortCode(record.sortCode)}
            </span>
          </div>
        )}

        {record.accountNumber && (
          <div className="text-sm">
            <span className="text-slate-800">Account: </span>
            <span className="text-slate-900 font-mono">
              {maskAccountNumber(record.accountNumber)}
            </span>
          </div>
        )}

        {record.currentBalance !== undefined && record.currentBalance !== null && (
          <div className="text-sm">
            <span className="text-slate-800">Balance: </span>
            <span className="text-slate-900 font-semibold">
              {formatBalance(record.currentBalance)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceRecordCard;
