// web/src/components/emergency/EmergencySearch.tsx
import React from 'react';
import { Search } from 'lucide-react';

interface EmergencySearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
}

const DOMAINS = [
  { value: 'all', label: 'All Domains' },
  { value: 'property', label: 'Property' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'finance', label: 'Finance' },
  { value: 'employment', label: 'Employment' },
  { value: 'government', label: 'Government' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'legal', label: 'Legal' },
  { value: 'services', label: 'Services' },
];

const EmergencySearch: React.FC<EmergencySearchProps> = ({
  searchQuery,
  onSearchChange,
  selectedDomain,
  onDomainChange,
}) => {
  return (
    <div className="mb-8 space-y-4 no-print">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-700" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search critical records..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Domain Filter */}
      <div className="flex flex-wrap gap-2">
        {DOMAINS.map((domain) => (
          <button
            key={domain.value}
            onClick={() => onDomainChange(domain.value)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedDomain === domain.value
                ? 'bg-red-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {domain.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmergencySearch;
