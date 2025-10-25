// web/src/components/renewals/RenewalItem.tsx
// Individual renewal card component

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Car,
  Wallet,
  Briefcase,
  Building2,
  Shield,
  FileText,
  Wrench,
  ExternalLink
} from 'lucide-react';
import { Renewal } from '../../services/api/renewals';
import { formatRelativeDate, formatUKDate } from '../../utils/dateHelpers';

interface RenewalItemProps {
  renewal: Renewal;
  urgency: string;
}

const DOMAIN_ICONS: Record<string, React.FC<{ className?: string }>> = {
  property: Home,
  vehicles: Car,
  finance: Wallet,
  employment: Briefcase,
  government: Building2,
  insurance: Shield,
  legal: FileText,
  services: Wrench
};

const DOMAIN_LABELS: Record<string, string> = {
  property: 'Property',
  vehicles: 'Vehicles',
  finance: 'Finance',
  employment: 'Employment',
  government: 'Government',
  insurance: 'Insurance',
  legal: 'Legal',
  services: 'Services'
};

const URGENCY_STYLES: Record<string, string> = {
  red: 'border-red-200 bg-red-50',
  amber: 'border-amber-200 bg-amber-50',
  green: 'border-green-200 bg-green-50',
  blue: 'border-blue-200 bg-blue-50'
};

const URGENCY_TEXT_STYLES: Record<string, string> = {
  red: 'text-red-700',
  amber: 'text-amber-700',
  green: 'text-green-700',
  blue: 'text-blue-700'
};

const RenewalItem: React.FC<RenewalItemProps> = ({ renewal, urgency }) => {
  const Icon = DOMAIN_ICONS[renewal.domain] || FileText;
  const domainLabel = DOMAIN_LABELS[renewal.domain] || renewal.domain;
  const cardStyle = URGENCY_STYLES[urgency] || URGENCY_STYLES.blue;
  const textStyle = URGENCY_TEXT_STYLES[urgency] || URGENCY_TEXT_STYLES.blue;

  return (
    <div className={`p-4 rounded-lg border-2 ${cardStyle} transition hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${textStyle}`} />
          <span className="text-xs font-medium text-slate-800 uppercase">
            {domainLabel}
          </span>
        </div>
        {renewal.priority && (
          <span className={`text-xs px-2 py-1 rounded ${
            renewal.priority === 'Critical' ? 'bg-red-100 text-red-700' :
            renewal.priority === 'Important' ? 'bg-amber-100 text-amber-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {renewal.priority}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
        {renewal.name}
      </h3>

      {renewal.recordType && (
        <p className="text-xs text-slate-800 mb-3 capitalize">
          {renewal.recordType.replace(/-/g, ' ')}
        </p>
      )}

      <div className="mb-3">
        <p className={`text-sm font-medium ${textStyle}`}>
          {formatRelativeDate(renewal.renewalDate)}
        </p>
        <p className="text-xs text-slate-800">
          {formatUKDate(renewal.renewalDate)}
        </p>
      </div>

      <Link
        to={renewal.domainUrl}
        className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900 font-medium transition"
      >
        View Record
        <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  );
};

export default RenewalItem;
