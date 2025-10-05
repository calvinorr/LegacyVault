// web/src/components/renewals/RenewalSummaryWidget.tsx
// Homepage summary widget for upcoming renewals

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, AlertCircle } from 'lucide-react';
import { useRenewalSummary } from '../../hooks/useRenewalSummary';

const RenewalSummaryWidget: React.FC = () => {
  const { data: summary, isLoading } = useRenewalSummary();

  if (isLoading || !summary || summary.total === 0) return null;

  return (
    <div className="p-6 rounded-xl border border-slate-200 bg-white mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6 text-slate-700" />
        <h2 className="text-lg font-semibold text-slate-900">
          Upcoming Renewals
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {summary.overdue > 0 && (
          <Link
            to="/renewals?filter=overdue"
            className="text-center p-3 rounded-lg bg-red-50 hover:bg-red-100 transition"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-2xl font-semibold text-red-600">
                {summary.overdue}
              </span>
            </div>
            <p className="text-xs text-red-700">Overdue</p>
          </Link>
        )}

        <Link
          to="/renewals?filter=7days"
          className="text-center p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition"
        >
          <div className="text-2xl font-semibold text-amber-600 mb-1">
            {summary.next7Days}
          </div>
          <p className="text-xs text-amber-700">Next 7 Days</p>
        </Link>

        <Link
          to="/renewals?filter=30days"
          className="text-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
        >
          <div className="text-2xl font-semibold text-blue-600 mb-1">
            {summary.next30Days}
          </div>
          <p className="text-xs text-blue-700">Next 30 Days</p>
        </Link>
      </div>

      <Link
        to="/renewals"
        className="block w-full text-center py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition"
      >
        View All Renewals
      </Link>
    </div>
  );
};

export default RenewalSummaryWidget;
