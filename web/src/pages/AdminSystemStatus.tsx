// web/src/pages/AdminSystemStatus.tsx
// Admin system status page showing database health, collections, and Epic 6 migration status

import React, { useState, useEffect } from 'react';
import { Database, Activity, CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface SystemStatus {
  timestamp: string;
  database: {
    connected: boolean;
    readyState: number;
    readyStateLabel: string;
    host: string;
    name: string;
  };
  collections: Record<string, number>;
  domainConfigs: {
    total: number;
    expected: number;
    configured: string[];
    missing: string[];
    details: Array<{
      domainType: string;
      allowedRecordTypes: string[];
      customRecordTypesCount: number;
      updatedAt: string;
    }>;
  };
  parentEntities: {
    total: number;
    byDomain: Record<string, number>;
  };
  childRecords: {
    total: number;
    byType: Record<string, number>;
  };
  users: {
    total: number;
    admins: number;
    approved: number;
    pending: number;
  };
}

export default function AdminSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/system-status', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load system status');
    } finally {
      setLoading(false);
    }
  };

  const seedConfigs = async () => {
    setSeeding(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/system-status/seed-configs', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to seed configs');
      }

      // Refresh status after seeding
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to seed domain configs');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px'
  };

  const statBoxStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center'
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#1e293b'
      }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <p>Loading system status...</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 16px'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '24px',
          color: '#991b1b',
          textAlign: 'center'
        }}>
          <AlertCircle size={48} style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Failed to load system status</h2>
          <p style={{ marginBottom: '16px' }}>{error || 'Unknown error occurred'}</p>
          <button
            onClick={fetchStatus}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} style={{ marginRight: '8px', verticalAlign: 'text-top' }} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const configsHealthy = status.domainConfigs.missing.length === 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 8px 0' }}>
            System Status
          </h1>
          <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>
            Epic 6 Migration Status & Database Health
          </p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
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
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Database Status */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Database size={24} color="#3b82f6" strokeWidth={1.5} />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>
            Database Connection
          </h2>
          {status.database.connected ? (
            <CheckCircle size={20} color="#10b981" strokeWidth={2} />
          ) : (
            <AlertCircle size={20} color="#ef4444" strokeWidth={2} />
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={statBoxStyle}>
            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Status
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: status.database.connected ? '#10b981' : '#ef4444' }}>
              {status.database.readyStateLabel}
            </div>
          </div>
          <div style={statBoxStyle}>
            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Database
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
              {status.database.name}
            </div>
          </div>
          <div style={statBoxStyle}>
            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Host
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9' }}>
              {status.database.host || 'localhost'}
            </div>
          </div>
        </div>
      </div>

      {/* Domain Configs Status */}
      <div style={{ ...cardStyle, marginBottom: '24px', borderColor: configsHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={24} color={configsHealthy ? '#10b981' : '#ef4444'} strokeWidth={1.5} />
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>
              Domain Configurations
            </h2>
            {configsHealthy ? (
              <CheckCircle size={20} color="#10b981" strokeWidth={2} />
            ) : (
              <AlertCircle size={20} color="#ef4444" strokeWidth={2} />
            )}
          </div>
          {!configsHealthy && (
            <button
              onClick={seedConfigs}
              disabled={seeding}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: seeding ? 'not-allowed' : 'pointer',
                opacity: seeding ? 0.6 : 1
              }}
            >
              {seeding && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              Seed Missing Configs
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div style={statBoxStyle}>
            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Configured
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>
              {status.domainConfigs.total} / {status.domainConfigs.expected}
            </div>
          </div>
          <div style={statBoxStyle}>
            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Missing
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: status.domainConfigs.missing.length > 0 ? '#ef4444' : '#10b981' }}>
              {status.domainConfigs.missing.length}
            </div>
          </div>
        </div>

        {status.domainConfigs.missing.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '14px', color: '#fca5a5', fontWeight: '500', marginBottom: '8px' }}>
              Missing Configurations:
            </div>
            <div style={{ fontSize: '14px', color: '#f1f5f9' }}>
              {status.domainConfigs.missing.join(', ')}
            </div>
          </div>
        )}

        {status.domainConfigs.details.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '14px', color: '#334155', marginBottom: '12px', fontWeight: '500' }}>
              Configured Domains:
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {status.domainConfigs.details.map(config => (
                <div
                  key={config.domainType}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>
                      {config.domainType}
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155' }}>
                      {config.allowedRecordTypes.length} record types
                      {config.customRecordTypesCount > 0 && ` (${config.customRecordTypesCount} custom)`}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#1e293b' }}>
                    Updated: {new Date(config.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Parent Entities */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>
            Parent Entities
          </h3>
          <div style={{ ...statBoxStyle, marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total
            </div>
            <div style={{ fontSize: '36px', fontWeight: '600', color: '#3b82f6' }}>
              {status.parentEntities.total}
            </div>
          </div>
          {Object.keys(status.parentEntities.byDomain).length > 0 && (
            <div>
              {Object.entries(status.parentEntities.byDomain).map(([domain, count]) => (
                <div
                  key={domain}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '14px'
                  }}
                >
                  <span style={{ color: '#334155' }}>{domain}</span>
                  <span style={{ color: '#f1f5f9', fontWeight: '500' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Child Records */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>
            Child Records
          </h3>
          <div style={{ ...statBoxStyle, marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total
            </div>
            <div style={{ fontSize: '36px', fontWeight: '600', color: '#10b981' }}>
              {status.childRecords.total}
            </div>
          </div>
          {Object.keys(status.childRecords.byType).length > 0 && (
            <div>
              {Object.entries(status.childRecords.byType).map(([type, count]) => (
                <div
                  key={type}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '14px'
                  }}
                >
                  <span style={{ color: '#334155' }}>{type}</span>
                  <span style={{ color: '#f1f5f9', fontWeight: '500' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>
            Users
          </h3>
          <div style={{ ...statBoxStyle, marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total
            </div>
            <div style={{ fontSize: '36px', fontWeight: '600', color: '#8b5cf6' }}>
              {status.users.total}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '14px' }}>
              <span style={{ color: '#334155' }}>Admins</span>
              <span style={{ color: '#f1f5f9', fontWeight: '500' }}>{status.users.admins}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '14px' }}>
              <span style={{ color: '#334155' }}>Approved</span>
              <span style={{ color: '#f1f5f9', fontWeight: '500' }}>{status.users.approved}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '14px' }}>
              <span style={{ color: '#334155' }}>Pending</span>
              <span style={{ color: status.users.pending > 0 ? '#f59e0b' : '#10b981', fontWeight: '500' }}>{status.users.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Overview */}
      <div style={{ ...cardStyle, marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>
          Database Collections
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {Object.entries(status.collections).map(([name, count]) => (
            <div
              key={name}
              style={{
                ...statBoxStyle,
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px', fontFamily: 'monospace' }}>
                {name}
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#f1f5f9' }}>
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamp */}
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#1e293b' }}>
        Last updated: {new Date(status.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
