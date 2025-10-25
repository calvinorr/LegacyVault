import React, { useState } from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import { useDomainConfigs } from '../../hooks/useDomainConfig';
import RecordTypeSelector from './RecordTypeSelector';
import { DomainConfig } from '../../hooks/useDomainConfig';

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  Vehicle: '🚗',
  Property: '🏠',
  Employment: '💼',
  Services: '🔧',
  Finance: '🏦',
};

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  Vehicle: 'Cars, motorcycles, and other vehicles',
  Property: 'Houses, apartments, and real estate',
  Employment: 'Jobs and employment relationships',
  Services: 'Tradespeople and service providers',
  Finance: 'Financial products and accounts',
};

const DomainConfigList: React.FC = () => {
  const { data: configs, isLoading, error } = useDomainConfigs();
  const [selectedDomain, setSelectedDomain] = useState<DomainConfig | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleConfigure = (config: DomainConfig) => {
    setSelectedDomain(config);
    setIsSelectorOpen(true);
  };

  const handleSelectorClose = () => {
    setIsSelectorOpen(false);
    setSelectedDomain(null);
  };

  if (isLoading) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#1e293b',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        Loading domain configurations…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        <AlertCircle size={20} style={{ color: '#dc2626', marginTop: '2px' }} />
        <div style={{ color: '#991b1b' }}>
          <strong>Error loading domain configurations</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  if (!configs || configs.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#1e293b',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        No domain configurations available.
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {configs.map((config) => (
          <div
            key={config.domainType}
            style={{
              padding: '20px',
              backgroundColor: '#ffffff',
              border: '1px solid #0f172a',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Domain Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                }}
              >
                {DOMAIN_ICONS[config.domainType] || '📦'}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0',
                    color: '#0f172a',
                  }}
                >
                  {config.domainType}
                </h3>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#1e293b',
                    margin: '4px 0 0 0',
                  }}
                >
                  {DOMAIN_DESCRIPTIONS[config.domainType] || 'Domain'}
                </p>
              </div>
            </div>

            {/* Record Types Count */}
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  color: '#475569',
                  margin: '0',
                }}
              >
                <span style={{ fontWeight: '600' }}>{config.allowedRecordTypes.length}</span>
                {' '}
                record type{config.allowedRecordTypes.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Record Types Display */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              {config.allowedRecordTypes.map((recordType) => (
                <span
                  key={recordType}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {recordType}
                </span>
              ))}
            </div>

            {/* Configure Button */}
            <button
              onClick={() => handleConfigure(config)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 16px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0f172a';
              }}
            >
              <Settings size={16} />
              Configure
            </button>
          </div>
        ))}
      </div>

      {/* Record Type Selector Modal */}
      {isSelectorOpen && selectedDomain && (
        <RecordTypeSelector config={selectedDomain} onClose={handleSelectorClose} />
      )}
    </>
  );
};

export default DomainConfigList;
