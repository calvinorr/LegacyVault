import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import type { EmploymentRecord } from '../../services/api/domains';

interface EmploymentRecordCardProps {
  record: EmploymentRecord;
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  'employment-details': 'Employment Details',
  'pension': 'Pension',
  'payroll': 'Payroll',
  'benefits': 'Benefits'
};

const EmploymentRecordCard: React.FC<EmploymentRecordCardProps> = ({ record }) => {
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

  const formatSalary = (salary?: number) => {
    if (salary === undefined || salary === null) return null;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(salary);
  };

  return (
    <div
      onClick={() => navigate(`/employment/${record._id}`)}
      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Briefcase className="w-5 h-5 text-slate-700" />
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
        {record.employerName && (
          <div className="text-sm">
            <span className="text-slate-800">Employer: </span>
            <span className="text-slate-900 font-medium">{record.employerName}</span>
          </div>
        )}

        {record.jobTitle && (
          <div className="text-sm">
            <span className="text-slate-800">Job Title: </span>
            <span className="text-slate-900">{record.jobTitle}</span>
          </div>
        )}

        {record.salary !== undefined && record.salary !== null && (
          <div className="text-sm">
            <span className="text-slate-800">Salary: </span>
            <span className="text-slate-900 font-semibold">
              {formatSalary(record.salary)}
            </span>
          </div>
        )}

        {record.pensionScheme && (
          <div className="text-sm">
            <span className="text-slate-800">Pension: </span>
            <span className="text-slate-900">{record.pensionScheme}</span>
            {record.pensionContribution && (
              <span className="text-slate-800"> ({record.pensionContribution}%)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmploymentRecordCard;
