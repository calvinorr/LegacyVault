// web/src/pages/RenewalDashboardPage.tsx
// Main renewal dashboard page with timeline view

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Filter } from 'lucide-react';
import RenewalTimeline from '../components/renewals/RenewalTimeline';
import RenewalFilters from '../components/renewals/RenewalFilters';
import { useRenewals } from '../hooks/useRenewals';

const RenewalDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    domain: 'all',
    priority: 'all',
    timeRange: '90days'
  });

  // Apply URL query params to filters
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter === 'overdue') {
      setFilters({ domain: 'all', priority: 'all', timeRange: 'overdue' });
    } else if (urlFilter === '7days') {
      setFilters({ domain: 'all', priority: 'all', timeRange: '7days' });
    } else if (urlFilter === '30days') {
      setFilters({ domain: 'all', priority: 'all', timeRange: '30days' });
    }
  }, [searchParams]);

  // Convert filters to API query params
  const getApiFilters = () => {
    const apiFilters: any = {};

    if (filters.domain !== 'all') {
      apiFilters.domain = filters.domain;
    }

    if (filters.priority !== 'all') {
      apiFilters.priority = filters.priority;
    }

    // Time range filtering
    const now = new Date();
    if (filters.timeRange === '7days') {
      apiFilters.from = now.toISOString();
      apiFilters.to = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (filters.timeRange === '30days') {
      apiFilters.from = now.toISOString();
      apiFilters.to = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (filters.timeRange === '90days') {
      apiFilters.from = now.toISOString();
      apiFilters.to = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    } else if (filters.timeRange === 'overdue') {
      apiFilters.to = now.toISOString();
    }

    return apiFilters;
  };

  const { data: renewals, isLoading } = useRenewals(getApiFilters());

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100">
            <Calendar className="w-8 h-8 text-slate-700" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Upcoming Renewals
            </h1>
            <p className="text-slate-800">
              Track renewal dates across all your household domains
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-800" />
          <span className="text-sm text-slate-800">
            {renewals?.length || 0} renewals
          </span>
        </div>
      </header>

      <RenewalFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="text-center py-12 text-slate-800">
          Loading renewals...
        </div>
      ) : renewals?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-800 mb-4">
            No upcoming renewals. Add records with renewal dates to see them here.
          </p>
        </div>
      ) : (
        <RenewalTimeline renewals={renewals || []} />
      )}
    </div>
  );
};

export default RenewalDashboardPage;
