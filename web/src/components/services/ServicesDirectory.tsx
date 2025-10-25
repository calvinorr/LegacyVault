import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useParentEntities } from '../../hooks/useParentEntities';
import ServiceProviderCard from './ServiceProviderCard';
import { SERVICE_TYPES, ServiceType } from './ServiceTypeBadge';

export default function ServicesDirectory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ServiceType | 'all'>('all');

  // Fetch services from parent entities API
  const { data, isLoading, error } = useParentEntities('services', {
    limit: 100,
  });

  const services = data?.entities || [];

  // Filter and search logic
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.serviceType?.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType =
        filterType === 'all' || service.serviceType === filterType;

      return matchesSearch && matchesType;
    });
  }, [services, searchQuery, filterType]);

  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '8px',
            letterSpacing: '-0.025em',
          }}
        >
          Services Directory
        </h1>
        <p style={{ fontSize: '16px', color: '#1e293b' }}>
          Organize service providers by category (Tradespeople, Home Services, Professional Services, etc.)
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
          <Search
            size={18}
            strokeWidth={1.5}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#334155',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or service type..."
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              borderRadius: '12px',
              border: '1px solid #0f172a',
              fontSize: '15px',
              fontFamily: 'inherit',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0f172a';
              e.currentTarget.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#0f172a';
            }}
          />
        </div>

        {/* Filter Dropdown */}
        <div style={{ position: 'relative', minWidth: '200px' }}>
          <Filter
            size={18}
            strokeWidth={1.5}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#334155',
              pointerEvents: 'none',
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ServiceType | 'all')}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              borderRadius: '12px',
              border: '1px solid #0f172a',
              fontSize: '15px',
              fontFamily: 'inherit',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage:
                'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              backgroundSize: '16px',
              paddingRight: '48px',
              boxSizing: 'border-box',
            }}
          >
            <option value="all">All Types</option>
            {SERVICE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Add Service Provider Button */}
        <button
          onClick={() => navigate('/services-new')}
          style={{
            padding: '14px 24px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1e293b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0f172a';
          }}
        >
          <Plus size={18} strokeWidth={2} />
          Add Service Provider
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#1e293b',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '3px solid #0f172a',
              borderTopColor: '#0f172a',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>
            {`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}
          </style>
          <p style={{ marginTop: '16px', fontSize: '15px' }}>
            Loading service providers...
          </p>
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '16px',
          }}
        >
          <p style={{ fontSize: '16px', color: '#dc2626', fontWeight: '500' }}>
            Failed to load service providers
          </p>
          <p style={{ fontSize: '14px', color: '#ef4444', marginTop: '8px' }}>
            {error.message}
          </p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#f8fafc',
            border: '1px solid #0f172a',
            borderRadius: '16px',
          }}
        >
          {services.length === 0 ? (
            <>
              <div
                style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  opacity: 0.5,
                }}
              >
                🔧
              </div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '8px',
                }}
              >
                No Service Providers Yet
              </h3>
              <p
                style={{
                  fontSize: '15px',
                  color: '#1e293b',
                  marginBottom: '24px',
                  maxWidth: '480px',
                  margin: '0 auto 24px',
                }}
              >
                Add tradespeople and service contacts for emergencies and regular
                household maintenance.
              </p>
              <button
                onClick={() => navigate('/services-new')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Plus size={18} strokeWidth={2} />
                Add Your First Service Provider
              </button>
            </>
          ) : (
            <>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '8px',
                }}
              >
                No Results Found
              </h3>
              <p style={{ fontSize: '14px', color: '#1e293b' }}>
                Try adjusting your search or filter criteria
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', color: '#1e293b' }}>
              Showing{' '}
              <span style={{ fontWeight: '600', color: '#0f172a' }}>
                {filteredServices.length}
              </span>{' '}
              {filteredServices.length === 1
                ? 'service provider'
                : 'service providers'}
            </p>
          </div>

          {/* Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredServices.map((service) => (
              <ServiceProviderCard
                key={service._id}
                provider={{
                  _id: service._id,
                  name: service.name,
                  serviceType: service.serviceType as ServiceType,
                  phone: service.phone,
                  email: service.email,
                  lastServiceDate: service.lastServiceDate,
                }}
                onClick={() => navigate(`/services/${service._id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
