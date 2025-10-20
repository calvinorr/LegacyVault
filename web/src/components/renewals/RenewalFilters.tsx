// web/src/components/renewals/RenewalFilters.tsx
// Filter controls for renewal dashboard

import React from 'react';

interface RenewalFiltersProps {
  filters: {
    domain: string;
    priority: string;
    timeRange: string;
  };
  onChange: (filters: any) => void;
}

const RenewalFilters: React.FC<RenewalFiltersProps> = ({ filters, onChange }) => {
  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, domain: e.target.value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, priority: e.target.value });
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, timeRange: e.target.value });
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="domain-filter" className="block text-sm font-medium text-slate-700 mb-2">
          Domain
        </label>
        <select
          id="domain-filter"
          value={filters.domain}
          onChange={handleDomainChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
        >
          <option value="all">All Domains</option>
          <option value="vehicles">Vehicles</option>
          <option value="properties">Properties</option>
          <option value="employments">Employments</option>
          <option value="services">Services</option>
        </select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label htmlFor="priority-filter" className="block text-sm font-medium text-slate-700 mb-2">
          Priority
        </label>
        <select
          id="priority-filter"
          value={filters.priority}
          onChange={handlePriorityChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
        >
          <option value="all">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="Important">Important</option>
          <option value="Standard">Standard</option>
        </select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label htmlFor="time-filter" className="block text-sm font-medium text-slate-700 mb-2">
          Time Range
        </label>
        <select
          id="time-filter"
          value={filters.timeRange}
          onChange={handleTimeRangeChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
        >
          <option value="7days">Next 7 Days</option>
          <option value="30days">Next 30 Days</option>
          <option value="90days">Next 90 Days</option>
          <option value="all">All Upcoming</option>
        </select>
      </div>
    </div>
  );
};

export default RenewalFilters;
