// web/src/pages/EmergencyViewPage.tsx
import React, { useState } from 'react';
import { AlertCircle, Printer, Download } from 'lucide-react';
import EmergencyRecordCard from '../components/emergency/EmergencyRecordCard';
import EmergencyChecklist from '../components/emergency/EmergencyChecklist';
import EmergencySearch from '../components/emergency/EmergencySearch';
import { useCriticalRecords } from '../hooks/useCriticalRecords';

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

const EmergencyViewPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const { data, isLoading } = useCriticalRecords();

  const criticalRecords = data?.criticalRecords || [];

  // Filter records by search query and domain
  const filteredRecords = criticalRecords.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'all' || record.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  // Group by domain
  const groupedRecords = filteredRecords.reduce((groups, record) => {
    if (!groups[record.domain]) groups[record.domain] = [];
    groups[record.domain].push(record);
    return groups;
  }, {} as Record<string, typeof criticalRecords>);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // PDF export placeholder
    alert('PDF download feature coming soon');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-red-50">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Emergency Information
            </h1>
            <p className="text-slate-800">Quick access to critical household information</p>
          </div>
        </div>

        <div className="flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
          >
            <Printer className="w-5 h-5" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
          >
            <Download className="w-5 h-5" />
            PDF
          </button>
        </div>
      </header>

      {/* Search & Filter */}
      <EmergencySearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDomain={selectedDomain}
        onDomainChange={setSelectedDomain}
      />

      {/* Emergency Checklist */}
      <EmergencyChecklist className="mb-8" />

      {/* Critical Records */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-800">Loading critical records...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-800 mb-2">
            {criticalRecords.length === 0
              ? 'No critical records found.'
              : 'No records match your search criteria.'}
          </p>
          <p className="text-sm text-slate-800">
            {criticalRecords.length === 0
              ? "Mark important records as 'Critical' priority in each domain to see them here."
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRecords).map(([domain, records]) => (
            <div key={domain}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 capitalize">
                {DOMAIN_LABELS[domain] || domain} ({records.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {records.map((record) => (
                  <EmergencyRecordCard key={record.id} record={record} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyViewPage;
