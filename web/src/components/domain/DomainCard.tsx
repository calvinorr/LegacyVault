import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface Domain {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
}

interface DomainCardProps {
  domain: Domain;
  recordCount: number;
  isLoading: boolean;
}

const DomainCard: React.FC<DomainCardProps> = ({
  domain,
  recordCount,
  isLoading
}) => {
  const navigate = useNavigate();
  const Icon = domain.icon;

  const handleClick = () => {
    if (domain.enabled) {
      // Route to new parent entity pages (Epic 6)
      navigate(`/${domain.id}-new`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-6 rounded-xl border transition-all
        ${domain.enabled
          ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 border-slate-200 bg-white'
          : 'cursor-not-allowed opacity-50 border-slate-100 bg-slate-50'
        }
      `}
    >
      {!domain.enabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
          <span className="text-sm font-medium text-slate-800">
            Coming Soon
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-slate-100">
          <Icon className="w-6 h-6 text-slate-700" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {domain.name}
          </h3>
          <p className="text-sm text-slate-800 mb-3">
            {domain.description}
          </p>

          {domain.enabled && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-800">
                {isLoading ? '...' : `${recordCount} records`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DomainCard;
