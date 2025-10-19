import React, { useState } from 'react';
import { Plus, Car, Home, Briefcase, Wrench, DollarSign, Upload, X } from 'lucide-react';
import ParentEntityCard from './ParentEntityCard';
import { useParentEntities } from '../../hooks/useParentEntities';
import { ParentEntity, DomainType, uploadEntityImage } from '../../services/api/parentEntities';

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploadingExample, setIsUploadingExample] = useState(false);

  const displayInfo = getDomainDisplay(domain);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

  // Empty state (including loading for first time)
  if (!data || data.entities.length === 0) {
    return (
      <>
        <style>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '2px dashed #cbd5e1'
          }}
        >
          {/* Loading Indicator */}
          {isLoading && (
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #0f172a',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <p style={{ color: '#64748b', marginTop: '12px', fontSize: '14px' }}>Loading...</p>
            </div>
          )}

        {/* Icon and Message */}
        <div style={{ margin: '0 auto 24px' }}>{displayInfo.icon}</div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '8px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          No {displayInfo.title.toLowerCase()} yet
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '32px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            maxWidth: '400px',
            margin: '0 auto 32px'
          }}
        >
          {displayInfo.emptyMessage}
        </p>

        {/* Image Preview Section */}
        <div
          style={{
            margin: '32px auto',
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            maxWidth: '300px'
          }}
        >
          {previewImage ? (
            <div style={{ position: 'relative' }}>
              <img
                src={previewImage}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}
              />
              <button
                onClick={() => setPreviewImage(null)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <X size={16} />
              </button>
              <p
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  margin: '8px 0 0 0',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                }}
              >
                This image will be attached to your new {displayInfo.title.slice(0, -1).toLowerCase()}
              </p>
            </div>
          ) : (
            <label
              style={{
                display: 'block',
                cursor: 'pointer',
                padding: '32px 16px',
                textAlign: 'center'
              }}
            >
              <Upload size={32} color="#cbd5e1" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#334155',
                  margin: '8px 0 4px 0',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                }}
              >
                Upload an image
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  margin: 0,
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                }}
              >
                Click to add a photo of your {displayInfo.title.slice(0, -1).toLowerCase()}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onCreateNew} style={buttonStyle}>
            <Plus size={20} strokeWidth={2} />
            Add First {displayInfo.title.slice(0, -1)}
          </button>
        </div>
      </div>
      </>
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
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ParentEntityList;
