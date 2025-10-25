import React, { useState } from 'react';
import { Settings, Plus } from 'lucide-react';
import DomainConfigList from '../components/admin/DomainConfigList';
import CustomRecordTypeForm from '../components/admin/CustomRecordTypeForm';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminDomains: React.FC = () => {
  const { user, loading } = useAuth();
  const [isCustomTypeFormOpen, setIsCustomTypeFormOpen] = useState(false);

  // Check authentication and admin role
  if (loading) {
    return (
      <div
        style={{
          padding: '20px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        Checking authentication…
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleCustomTypeFormClose = () => {
    setIsCustomTypeFormOpen(false);
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
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  };

  const buttonHoverStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#1e293b',
  };

  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{
        maxWidth: '1400px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Settings
                  size={24}
                  style={{
                    color: '#0f172a',
                  }}
                />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    margin: '0',
                    color: '#0f172a',
                  }}
                >
                  Domain Configuration
                </h1>
              </div>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#1e293b',
                margin: '0',
                marginTop: '8px',
              }}
            >
              Configure which record types are available for each parent domain and manage custom record types.
            </p>
          </div>

          <button
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, buttonHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, buttonStyle);
            }}
            onClick={() => setIsCustomTypeFormOpen(true)}
            style={buttonStyle}
          >
            <Plus size={18} />
            Create Custom Type
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px',
        }}
      >
        {/* Domain Config List */}
        <DomainConfigList />
      </div>

      {/* Custom Record Type Form Modal */}
      {isCustomTypeFormOpen && (
        <CustomRecordTypeForm onClose={handleCustomTypeFormClose} />
      )}
    </div>
  );
};

export default AdminDomains;
