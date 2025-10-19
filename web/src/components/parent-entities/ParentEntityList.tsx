import React, { useState } from 'react';
import { Plus, Car, Home, Briefcase, Wrench, DollarSign } from 'lucide-react';
import ParentEntityCard from './ParentEntityCard';
import { useParentEntities } from '../../hooks/useParentEntities';
import { ParentEntity, DomainType } from '../../services/api/parentEntities';

interface ParentEntityListProps {
  domain: DomainType;
  onCreateNew: () => void;
  onEdit: (entity: ParentEntity) => void;
  onDelete: (entity: ParentEntity) => void;
}

const getDomainDisplay = (domain: DomainType): { title: string; icon: JSX.Element; emptyMessage: string } => {
  const iconSize = 48;
  const iconColor = '#94a3b8';

  switch (domain) {
    case 'vehicles':
      return {
        title: 'Vehicles',
        icon: <Car size={iconSize} color={iconColor} />,
        emptyMessage: 'No vehicles yet. Add your first vehicle to start tracking maintenance, insurance, and service history.'
      };
    case 'properties':
      return {
        title: 'Properties',
        icon: <Home size={iconSize} color={iconColor} />,
        emptyMessage: 'No properties yet. Add your first property to organize household information for continuity planning.'
      };
    case 'employments':
      return {
        title: 'Employments',
        icon: <Briefcase size={iconSize} color={iconColor} />,
        emptyMessage: 'No employments yet. Add employment details to track pension, benefits, and contact information.'
      };
    case 'services':
      return {
        title: 'Services',
        icon: <Wrench size={iconSize} color={iconColor} />,
        emptyMessage: 'No service providers yet. Add tradespeople and service contacts for easy access in emergencies.'
      };
    case 'finance':
      return {
        title: 'Finance',
        icon: <DollarSign size={iconSize} color={iconColor} />,
        emptyMessage: 'No financial accounts yet. Add bank accounts, savings, investments, and other financial products.'
      };
    default:
      return {
        title: domain,
        icon: <Car size={iconSize} color={iconColor} />,
        emptyMessage: 'No items yet. Add your first item to get started.'
      };
  }
};

const ParentEntityList: React.FC<ParentEntityListProps> = ({
  domain,
  onCreateNew,
  onEdit,
  onDelete
}) => {
  const { data, isLoading, error } = useParentEntities(domain, {
    limit: 50,
    sort: '-updatedAt'
  });

  const displayInfo = getDomainDisplay(domain);

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
          padding: '24px 0'
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: '#e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              height: '200px',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '64px 24px',
          backgroundColor: '#fef2f2',
          borderRadius: '16px',
          border: '2px solid #fecaca'
        }}
      >
        <p
          style={{
            fontSize: '16px',
            color: '#dc2626',
            marginBottom: '20px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          Failed to load {displayInfo.title.toLowerCase()}. Please try again.
        </p>
        <p
          style={{
            fontSize: '14px',
            color: '#7f1d1d',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  // Empty state
  if (!data || data.entities.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '64px 24px',
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          border: '2px dashed #cbd5e1'
        }}
      >
        <div style={{ margin: '0 auto 16px' }}>{displayInfo.icon}</div>
        <p
          style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '20px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            maxWidth: '400px',
            margin: '0 auto 20px'
          }}
        >
          {displayInfo.emptyMessage}
        </p>
        <button onClick={onCreateNew} style={buttonStyle}>
          <Plus size={20} strokeWidth={2} />
          Add First {displayInfo.title.slice(0, -1)}
        </button>
      </div>
    );
  }

  // List view with grid
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)',
        gap: '24px',
        padding: '24px 0'
      }}
      className="parent-entity-grid"
    >
      {data.entities.map((entity) => (
        <ParentEntityCard
          key={entity._id}
          entity={entity}
          onEdit={onEdit}
          onDelete={onDelete}
          childRecordCount={0} // TODO: Get actual count from API
        />
      ))}

      <style>{`
        @media (min-width: 768px) {
          .parent-entity-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .parent-entity-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default ParentEntityList;
