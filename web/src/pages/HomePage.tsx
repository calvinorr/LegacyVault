import React from 'react';
import DomainGrid from '../components/domain/DomainGrid';
import DomainCard from '../components/domain/DomainCard';
import RenewalSummaryWidget from '../components/renewals/RenewalSummaryWidget';
import { useDomainStats } from '../hooks/useDomainStats';
import {
  Home,
  Car,
  Briefcase,
  FileText,
  Banknote,
  Shield,
  Scale,
  Wrench,
  DollarSign
} from 'lucide-react';

const DOMAINS = [
  {
    id: 'vehicles',
    name: 'Vehicles',
    description: 'Manage vehicles and track insurance, finance, MOT, and service history',
    icon: Car,
    enabled: true
  },
  {
    id: 'properties',
    name: 'Properties',
    description: 'Manage properties and track insurance, utilities, and maintenance',
    icon: Home,
    enabled: true
  },
  {
    id: 'employments',
    name: 'Employments',
    description: 'Manage employment details and track pensions, benefits, and contacts',
    icon: Briefcase,
    enabled: true
  },
  {
    id: 'services',
    name: 'Service Providers',
    description: 'Manage tradespeople and service providers for easy access in emergencies',
    icon: Wrench,
    enabled: true
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Manage bank accounts, credit cards, investments, pensions, and loans',
    icon: DollarSign,
    enabled: true
  }
];

const HomePage: React.FC = () => {
  const { data: stats, isLoading } = useDomainStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Life Domains
        </h1>
        <p className="text-slate-600 mt-2">
          Organize your household information by life area
        </p>
      </header>

      <RenewalSummaryWidget />

      <DomainGrid>
        {DOMAINS.map((domain) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            recordCount={stats?.[domain.id] || 0}
            isLoading={isLoading}
          />
        ))}
      </DomainGrid>
    </div>
  );
};

export default HomePage;
