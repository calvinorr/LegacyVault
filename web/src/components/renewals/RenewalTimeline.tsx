// web/src/components/renewals/RenewalTimeline.tsx
// Timeline view component for renewals grouped by time period

import React from 'react';
import RenewalItem from './RenewalItem';
import { groupRenewalsByPeriod } from '../../utils/renewalHelpers';
import { Renewal } from '../../services/api/renewals';

interface RenewalTimelineProps {
  renewals: Renewal[];
}

const RenewalTimeline: React.FC<RenewalTimelineProps> = ({ renewals }) => {
  const grouped = groupRenewalsByPeriod(renewals);

  const sections = [
    { key: 'overdue', title: 'Overdue', color: 'red', data: grouped.overdue },
    { key: 'next7days', title: 'Next 7 Days', color: 'red', data: grouped.next7days },
    { key: 'next30days', title: 'Next 30 Days', color: 'amber', data: grouped.next30days },
    { key: 'next90days', title: 'Next 90 Days', color: 'green', data: grouped.next90days },
    { key: 'beyond', title: 'Beyond 90 Days', color: 'blue', data: grouped.beyond }
  ];

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        if (section.data.length === 0) return null;

        return (
          <div key={section.key}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-1 h-6 rounded bg-${section.color}-500`} />
              <h2 className="text-lg font-semibold text-slate-900">
                {section.title}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({section.data.length})
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.data.map((renewal) => (
                <RenewalItem key={renewal.id} renewal={renewal} urgency={section.color} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RenewalTimeline;
