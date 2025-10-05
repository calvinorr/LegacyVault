import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { VehicleRecord } from '../../services/api/domains';

interface VehicleRecordCardProps {
  record: VehicleRecord;
}

const VehicleRecordCard: React.FC<VehicleRecordCardProps> = ({ record }) => {
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

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { icon: AlertCircle, color: 'text-red-600', label: 'Expired' };
    } else if (daysUntilExpiry <= 30) {
      return { icon: Clock, color: 'text-amber-600', label: `${daysUntilExpiry} days` };
    } else {
      return { icon: CheckCircle, color: 'text-green-600', label: 'Valid' };
    }
  };

  const motStatus = getExpiryStatus(record.motExpiryDate);
  const insuranceStatus = getExpiryStatus(record.insuranceRenewalDate);
  const taxStatus = getExpiryStatus(record.roadTaxExpiryDate);

  return (
    <div
      onClick={() => navigate(`/vehicles/${record._id}`)}
      className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Car className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {record.name}
            </h3>
            {record.registration && (
              <p className="text-sm font-mono text-slate-600 mt-0.5">
                {record.registration}
              </p>
            )}
            {record.make && record.model && (
              <p className="text-sm text-slate-500 mt-0.5">
                {record.make} {record.model}
              </p>
            )}
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(record.priority)}`}>
          {record.priority}
        </span>
      </div>

      {(motStatus || insuranceStatus || taxStatus) && (
        <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
          {motStatus && (
            <div className="flex items-center gap-2">
              <motStatus.icon className={`w-4 h-4 ${motStatus.color}`} />
              <span className="text-xs text-slate-600">MOT: {motStatus.label}</span>
            </div>
          )}
          {insuranceStatus && (
            <div className="flex items-center gap-2">
              <insuranceStatus.icon className={`w-4 h-4 ${insuranceStatus.color}`} />
              <span className="text-xs text-slate-600">Insurance: {insuranceStatus.label}</span>
            </div>
          )}
          {taxStatus && (
            <div className="flex items-center gap-2">
              <taxStatus.icon className={`w-4 h-4 ${taxStatus.color}`} />
              <span className="text-xs text-slate-600">Tax: {taxStatus.label}</span>
            </div>
          )}
        </div>
      )}

      {record.financeMonthlyPayment && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Monthly Finance:</span>
            <span className="text-sm font-medium text-slate-900">£{record.financeMonthlyPayment.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRecordCard;
