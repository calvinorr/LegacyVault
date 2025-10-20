import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit, Trash2, Car, Home, Briefcase, Wrench, DollarSign } from 'lucide-react';
import { ParentEntity, getEntityImageUrl } from '../../services/api/parentEntities';
import { formatDistanceToNow } from 'date-fns';

interface ParentEntityCardProps {
  entity: ParentEntity;
  onEdit: (entity: ParentEntity) => void;
  onDelete: (entity: ParentEntity) => void;
  childRecordCount?: number;
}

const getDomainIcon = (domainType: string) => {
  switch (domainType) {
    case 'Vehicle':
      return <Car size={24} strokeWidth={1.5} />;
    case 'Property':
      return <Home size={24} strokeWidth={1.5} />;
    case 'Employment':
      return <Briefcase size={24} strokeWidth={1.5} />;
    case 'Services':
      return <Wrench size={24} strokeWidth={1.5} />;
    case 'Finance':
      return <DollarSign size={24} strokeWidth={1.5} />;
    default:
      return <Car size={24} strokeWidth={1.5} />;
  }
};

const getDomainRoute = (domainType: string, id: string) => {
  const domainMap: Record<string, string> = {
    'Vehicle': 'vehicles',
    'Property': 'properties',
    'Employment': 'employments',
    'Services': 'services',
    'Finance': 'finance'
  };
  const domain = domainMap[domainType] || 'vehicles';
  return `/${domain}/${id}`;
};

const ParentEntityCard: React.FC<ParentEntityCardProps> = ({
  entity,
  onEdit,
  onDelete,
  childRecordCount = 0
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action menu
    if ((e.target as HTMLElement).closest('.action-menu')) {
      return;
    }
    navigate(getDomainRoute(entity.domainType, entity._id));
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(entity);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(entity);
  };

  const timeAgo = formatDistanceToNow(new Date(entity.updatedAt), { addSuffix: true });

  const getDomainMap = (): Record<string, string> => {
    return {
      'Vehicle': 'vehicles',
      'Property': 'properties',
      'Employment': 'employments',
      'Services': 'services',
      'Finance': 'finance'
    };
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        position: 'relative',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      {/* Image */}
      {entity.image && (
        <img
          src={getEntityImageUrl(getDomainMap()[entity.domainType] as any, entity._id)}
          alt={entity.name}
          style={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      )}

      {/* Content Wrapper */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Action Menu */}
        <div className="action-menu" style={{ position: 'absolute', top: '4px', right: '4px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f1f5f9';
            e.currentTarget.style.color = '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <MoreVertical size={20} />
        </button>

        {showMenu && (
          <div
            style={{
              position: 'absolute',
              top: '32px',
              right: '0',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              minWidth: '140px',
              zIndex: 10
            }}
          >
            <button
              onClick={handleEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#0f172a',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#ef4444',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Domain Icon */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          background: '#f1f5f9',
          borderRadius: '12px',
          color: '#0f172a',
          marginBottom: '16px'
        }}
      >
        {getDomainIcon(entity.domainType)}
      </div>

      {/* Entity Name */}
      <h3
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#0f172a',
          margin: '0 0 12px 0',
          lineHeight: '1.4',
          letterSpacing: '-0.01em'
        }}
      >
        {entity.name}
      </h3>

      {/* Domain-Specific Fields */}
      <div style={{ marginBottom: '16px', flex: 1 }}>
        {entity.domainType === 'Vehicle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {entity.fields?.make && entity.fields?.model && (
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, fontWeight: '500' }}>
                {entity.fields.make} {entity.fields.model}
              </p>
            )}
            {entity.fields?.year && (
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Year: {entity.fields.year}
              </p>
            )}
            {entity.fields?.registration && (
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Reg: {entity.fields.registration}
              </p>
            )}
          </div>
        )}
        {entity.domainType === 'Property' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {entity.fields?.address && (
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, fontWeight: '500' }}>
                {entity.fields.address}
              </p>
            )}
            {entity.fields?.type && (
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                {entity.fields.type}
              </p>
            )}
          </div>
        )}
        {entity.domainType === 'Employment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {entity.fields?.employer && (
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, fontWeight: '500' }}>
                {entity.fields.employer}
              </p>
            )}
            {entity.fields?.jobTitle && (
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                {entity.fields.jobTitle}
              </p>
            )}
          </div>
        )}
        {entity.domainType === 'Services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {entity.fields?.businessName && (
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, fontWeight: '500' }}>
                {entity.fields.businessName}
              </p>
            )}
            {entity.fields?.serviceType && (
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                {entity.fields.serviceType}
              </p>
            )}
          </div>
        )}
        {entity.domainType === 'Finance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {entity.fields?.institution && (
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, fontWeight: '500' }}>
                {entity.fields.institution}
              </p>
            )}
            {entity.fields?.accountType && (
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                {entity.fields.accountType}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Child Record Count Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: childRecordCount > 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
          borderRadius: '8px',
          marginBottom: '12px'
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: childRecordCount > 0 ? '#3b82f6' : '#94a3b8'
          }}
        />
        <span
          style={{
            fontSize: '13px',
            fontWeight: '500',
            color: childRecordCount > 0 ? '#3b82f6' : '#94a3b8'
          }}
        >
          {childRecordCount} {childRecordCount === 1 ? 'record' : 'records'}
        </span>
      </div>

      {/* Last Updated */}
      <p
        style={{
          fontSize: '13px',
          color: '#94a3b8',
          margin: 0
        }}
      >
        Updated {timeAgo}
      </p>
      </div>
      {/* End Content Wrapper */}
    </div>
  );
};

export default ParentEntityCard;
