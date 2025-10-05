// web/src/components/emergency/EmergencyChecklist.tsx
import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useEmergencyChecklist } from '../../hooks/useCriticalRecords';

interface EmergencyChecklistProps {
  className?: string;
}

const DOMAIN_LABELS: Record<string, string> = {
  property: 'Property',
  vehicles: 'Vehicles',
  finance: 'Finance',
  employment: 'Employment',
  government: 'Government',
  insurance: 'Insurance',
  legal: 'Legal',
  services: 'Services',
};

const EmergencyChecklist: React.FC<EmergencyChecklistProps> = ({ className = '' }) => {
  const { data, isLoading } = useEmergencyChecklist();

  if (isLoading) {
    return (
      <div className={`p-6 rounded-xl bg-slate-50 border border-slate-200 ${className}`}>
        <p className="text-slate-600">Loading checklist...</p>
      </div>
    );
  }

  const checklist = data?.checklist || {};
  const totalCritical = Object.values(checklist).reduce(
    (sum, domain) => sum + domain.criticalCount,
    0
  );

  return (
    <div className={`p-6 rounded-xl bg-slate-50 border border-slate-200 no-print ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Emergency Preparedness</h2>
        </div>
        <div className="text-sm text-slate-600">
          {totalCritical} critical {totalCritical === 1 ? 'record' : 'records'}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(checklist).map(([domain, info]) => (
          <div
            key={domain}
            className={`p-3 rounded-lg border-2 ${
              info.criticalCount > 0
                ? 'border-green-200 bg-green-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700 capitalize">
                {DOMAIN_LABELS[domain] || domain}
              </span>
              {info.criticalCount > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="text-xs text-slate-600">
              {info.criticalCount} critical
            </div>
          </div>
        ))}
      </div>

      {totalCritical === 0 && (
        <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Tip:</strong> Mark important records as "Critical" priority in each domain to
            see them in this emergency view.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmergencyChecklist;
