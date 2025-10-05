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
  Wrench
} from 'lucide-react';

const DOMAINS = [
  {
    id: 'property',
    name: 'Property',
    description: 'Mortgage, utilities, home insurance, rates',
    icon: Home,
    enabled: true
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    description: 'Car finance, MOT, insurance, road tax',
    icon: Car,
    enabled: true
  },
  {
    id: 'employment',
    name: 'Employment',
    description: 'Payroll, pension, workplace benefits',
    icon: Briefcase,
    enabled: true
  },
  {
    id: 'government',
    name: 'Government',
    description: 'NI number, tax, licences, passports',
    icon: FileText,
    enabled: true
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Bank accounts, savings, ISAs, loans',
    icon: Banknote,
    enabled: true
  },
  {
    id: 'insurance',
    name: 'Insurance & Protection',
    description: 'Life, income protection, warranties',
    icon: Shield,
    enabled: true
  },
  {
    id: 'legal',
    name: 'Legal & Estate',
    description: 'Wills, power of attorney, deeds',
    icon: Scale,
    enabled: true
  },
  {
    id: 'services',
    name: 'Household Services',
    description: 'Tradespeople, service providers',
    icon: Wrench,
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
