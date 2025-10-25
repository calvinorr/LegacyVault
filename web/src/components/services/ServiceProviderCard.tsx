import React from 'react';
import { Phone, Mail, Calendar } from 'lucide-react';
import ServiceTypeBadge, { ServiceType } from './ServiceTypeBadge';

interface ServiceProvider {
  _id: string;
  name: string;
  serviceType?: ServiceType;
  phone?: string;
  email?: string;
  lastServiceDate?: string;
}

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  onClick?: () => void;
}

export default function ServiceProviderCard({
  provider,
  onClick,
}: ServiceProviderCardProps) {
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (provider.phone) {
      window.location.href = `tel:${provider.phone}`;
    }
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (provider.email) {
      window.location.href = `mailto:${provider.email}`;
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #0f172a',
        borderRadius: '16px',
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow =
            '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(15, 23, 42, 0.05)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '8px',
            letterSpacing: '-0.025em',
          }}
        >
          {provider.name}
        </h3>
        {provider.serviceType && (
          <ServiceTypeBadge type={provider.serviceType} size="sm" />
        )}
      </div>

      {/* Contact Info */}
      {(provider.phone || provider.email) && (
        <div style={{ marginBottom: '16px' }}>
          {provider.phone && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <Phone size={16} strokeWidth={1.5} style={{ color: '#1e293b' }} />
              <span
                style={{
                  fontSize: '15px',
                  color: '#0f172a',
                  fontWeight: '500',
                }}
              >
                {provider.phone}
              </span>
              <button
                onClick={handleCall}
                style={{
                  marginLeft: 'auto',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #0f172a',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#0f172a';
                }}
              >
                Call
              </button>
            </div>
          )}
          {provider.email && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Mail size={16} strokeWidth={1.5} style={{ color: '#1e293b' }} />
              <span
                style={{
                  fontSize: '15px',
                  color: '#0f172a',
                  fontWeight: '500',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {provider.email}
              </span>
              <button
                onClick={handleEmail}
                style={{
                  marginLeft: 'auto',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #0f172a',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#0f172a';
                }}
              >
                Email
              </button>
            </div>
          )}
        </div>
      )}

      {/* Last Service Date */}
      {provider.lastServiceDate && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #0f172a',
          }}
        >
          <Calendar size={14} strokeWidth={1.5} style={{ color: '#1e293b' }} />
          <span style={{ fontSize: '13px', color: '#1e293b' }}>
            Last service:{' '}
            <span style={{ fontWeight: '500', color: '#0f172a' }}>
              {new Date(provider.lastServiceDate).toLocaleDateString('en-GB')}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
