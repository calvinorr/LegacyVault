// web/src/components/parent-entities/ParentEntityDetail.tsx
// Main detail page for viewing and managing a parent entity and its child records

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Car, Home, Briefcase, Wrench, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { useParentEntity, useDeleteParentEntity } from '../../hooks/useParentEntities';
import { DomainType } from '../../services/api/parentEntities';
import ParentEntityForm from './ParentEntityForm';
import DeleteConfirmModal from './DeleteConfirmModal';
import { ChildRecordList } from '../child-records/ChildRecordList';

interface ParentEntityDetailProps {
  domain: DomainType;
  parentId: string;
}

const getDomainIcon = (domainType: string) => {
  switch (domainType) {
    case 'Vehicle':
      return <Car size={32} strokeWidth={1.5} />;
    case 'Property':
      return <Home size={32} strokeWidth={1.5} />;
    case 'Employment':
      return <Briefcase size={32} strokeWidth={1.5} />;
    case 'Services':
      return <Wrench size={32} strokeWidth={1.5} />;
    case 'Finance':
      return <DollarSign size={32} strokeWidth={1.5} />;
    default:
      return <Car size={32} strokeWidth={1.5} />;
  }
};

const getDomainLabel = (domain: DomainType) => {
  const labels: Record<DomainType, string> = {
    vehicles: 'Vehicle',
    properties: 'Property',
    employments: 'Employment',
    services: 'Service Provider',
    finance: 'Finance'
  };
  return labels[domain] || domain;
};

const getDomainRoute = (domain: DomainType) => {
  const routes: Record<DomainType, string> = {
    vehicles: '/vehicles-new',
    properties: '/properties-new',
    employments: '/employments-new',
    services: '/services-new',
    finance: '/finance'
  };
  return routes[domain] || '/vehicles-new';
};

const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export const ParentEntityDetail: React.FC<ParentEntityDetailProps> = ({
  domain,
  parentId
}) => {
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: parentEntity, isLoading, error } = useParentEntity(domain, parentId);
  const deleteParentMutation = useDeleteParentEntity(domain);

  const handleDeleteSuccess = () => {
    navigate(getDomainRoute(domain));
  };

  const handleDelete = async () => {
    await deleteParentMutation.mutateAsync(parentId);
    handleDeleteSuccess();
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#64748b'
      }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <p>Loading {getDomainLabel(domain).toLowerCase()}...</p>
      </div>
    );
  }

  if (error || !parentEntity) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '24px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#991b1b'
      }}>
        <AlertCircle size={32} style={{ marginBottom: '16px' }} />
        <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
          {getDomainLabel(domain)} not found
        </p>
        <p style={{ fontSize: '14px', marginBottom: '16px' }}>
          {error?.message || 'Unable to load this entity'}
        </p>
        <Link
          to={getDomainRoute(domain)}
          style={{
            color: '#dc2626',
            textDecoration: 'underline',
            fontSize: '14px'
          }}
        >
          Back to {getDomainLabel(domain)}s
        </Link>
      </div>
    );
  }

  const childRecordCount = parentEntity.childRecords
    ? Object.values(parentEntity.childRecords).flat().length
    : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Breadcrumbs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px',
        fontSize: '14px',
        color: '#64748b'
      }}>
        <Link
          to={getDomainRoute(domain)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#3b82f6',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
        >
          <ArrowLeft size={16} />
          Back to {getDomainLabel(domain)}s
        </Link>
        <span>/</span>
        <span>{parentEntity.name}</span>
      </div>

      {/* Header Section */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '24px',
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px'
      }}>
        {/* Icon and Name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flex: 1
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getDomainIcon(parentEntity.domainType)}
          </div>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#f1f5f9',
              margin: '0 0 8px 0'
            }}>
              {parentEntity.name}
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#94a3b8',
              margin: 0
            }}>
              {getDomainLabel(parentEntity.domainType)} • {childRecordCount} record{childRecordCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <button
            onClick={() => setShowEditForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Entity Details Grid */}
      {Object.keys(parentEntity.fields || {}).length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {Object.entries(parentEntity.fields).map(([key, value]) => (
            <div
              key={key}
              style={{
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }}
            >
              <p style={{
                fontSize: '12px',
                color: '#94a3b8',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {formatKey(key)}
              </p>
              <p style={{
                fontSize: '14px',
                color: '#f1f5f9',
                margin: 0,
                wordBreak: 'break-word'
              }}>
                {value ? String(value) : '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Child Records Section */}
      <ChildRecordList
        domain={domain}
        parentId={parentId}
        childRecords={parentEntity.childRecords}
        onAddRecord={(recordType) => {
          // TODO: Open ChildRecordForm modal for creating new record
          console.log('Add record:', recordType);
        }}
        onEditRecord={(recordType, record) => {
          // TODO: Open ChildRecordForm modal for editing record
          console.log('Edit record:', recordType, record);
        }}
        onDeleteRecord={(recordType, recordId) => {
          // TODO: Open DeleteChildRecordModal
          console.log('Delete record:', recordType, recordId);
        }}
      />

      {/* Modals */}
      <ParentEntityForm
        key={parentEntity._id} // Force remount when editing different entity
        domain={domain}
        entity={parentEntity}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={() => setShowEditForm(false)}
      />

      {showDeleteModal && (
        <DeleteConfirmModal
          entity={parentEntity}
          childRecordCount={childRecordCount}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={deleteParentMutation.isPending}
        />
      )}
    </div>
  );
};
