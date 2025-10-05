import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Car, Calendar, Pencil, Trash2, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useVehicleRecord, useDeleteVehicleRecord } from '../hooks/useVehicleRecords';

const VehicleRecordDetailPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const { data: record, isLoading } = useVehicleRecord(recordId!);
  const deleteMutation = useDeleteVehicleRecord();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!recordId) return;

    try {
      await deleteMutation.mutateAsync(recordId);
      navigate('/vehicles');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
      case 'Important':
        return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' };
      default:
        return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
    }
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return {
        icon: AlertCircle,
        color: '#dc2626',
        bg: '#fef2f2',
        border: '#fecaca',
        label: 'Expired'
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        icon: Clock,
        color: '#ea580c',
        bg: '#fff7ed',
        border: '#fed7aa',
        label: `Expiring in ${daysUntilExpiry} days`
      };
    } else {
      return {
        icon: CheckCircle,
        color: '#16a34a',
        bg: '#f0fdf4',
        border: '#bbf7d0',
        label: 'Valid'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1000px' }}>
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
          Loading vehicle...
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1000px' }}>
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
          Vehicle record not found
        </div>
      </div>
    );
  }

  const priorityColors = getPriorityColor(record.priority);
  const motStatus = getExpiryStatus(record.motExpiryDate);
  const insuranceStatus = getExpiryStatus(record.insuranceRenewalDate);
  const taxStatus = getExpiryStatus(record.roadTaxExpiryDate);

  return (
    <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1000px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={16} />
        <Link to="/vehicles" style={{ color: '#64748b', textDecoration: 'none' }}>Vehicles</Link>
        <ChevronRight size={16} />
        <span style={{ color: '#0f172a', fontWeight: '500' }}>{record.name}</span>
      </div>

      {/* Header */}
      <header style={{
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        marginBottom: '24px',
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Car size={32} color="#0f172a" strokeWidth={1.5} />
            </div>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 8px 0',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.025em'
              }}>
                {record.name}
              </h1>
              {record.registration && (
                <p style={{
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  color: '#64748b',
                  margin: '0 0 8px 0',
                }}>
                  {record.registration}
                </p>
              )}
              {record.make && record.model && (
                <p style={{
                  fontSize: '15px',
                  color: '#64748b',
                  margin: '0 0 12px 0',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}>
                  {record.make} {record.model}
                </p>
              )}
              <span style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500',
                borderRadius: '8px',
                backgroundColor: priorityColors.bg,
                color: priorityColors.text,
                border: `1px solid ${priorityColors.border}`,
                display: 'inline-block'
              }}>
                {record.priority}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {/* TODO: Implement edit */}}
              style={{
                padding: '10px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              <Pencil size={16} />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '10px 20px',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </header>

      {/* Expiry Status Cards */}
      {(motStatus || insuranceStatus || taxStatus) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {motStatus && (
            <div style={{
              backgroundColor: motStatus.bg,
              border: `1px solid ${motStatus.border}`,
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <motStatus.icon size={24} color={motStatus.color} />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>MOT</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: motStatus.color }}>
                    {motStatus.label}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    {formatDate(record.motExpiryDate)}
                  </div>
                </div>
              </div>
            </div>
          )}
          {insuranceStatus && (
            <div style={{
              backgroundColor: insuranceStatus.bg,
              border: `1px solid ${insuranceStatus.border}`,
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <insuranceStatus.icon size={24} color={insuranceStatus.color} />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Insurance</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: insuranceStatus.color }}>
                    {insuranceStatus.label}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    {formatDate(record.insuranceRenewalDate)}
                  </div>
                </div>
              </div>
            </div>
          )}
          {taxStatus && (
            <div style={{
              backgroundColor: taxStatus.bg,
              border: `1px solid ${taxStatus.border}`,
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <taxStatus.icon size={24} color={taxStatus.color} />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Road Tax</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: taxStatus.color }}>
                    {taxStatus.label}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    {formatDate(record.roadTaxExpiryDate)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#0f172a',
          marginBottom: '24px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}>
          Vehicle Details
        </h2>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#64748b',
              marginBottom: '6px',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}>
              Record Type
            </label>
            <p style={{
              fontSize: '15px',
              color: '#0f172a',
              margin: 0,
              textTransform: 'capitalize',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}>
              {record.recordType?.replace('-', ' ') || 'Not specified'}
            </p>
          </div>

          {record.purchaseDate && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#64748b',
                marginBottom: '6px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Purchase Date
              </label>
              <p style={{
                fontSize: '15px',
                color: '#0f172a',
                margin: 0,
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}>
                {formatDate(record.purchaseDate)}
              </p>
            </div>
          )}

          {record.financeProvider && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#64748b',
                marginBottom: '6px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}>
                Finance Provider
              </label>
              <p style={{
                fontSize: '15px',
                color: '#0f172a',
                margin: 0,
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}>
                {record.financeProvider}
              </p>
            </div>
          )}

          {record.financeMonthlyPayment !== undefined && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#64748b',
                marginBottom: '6px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}>
                Monthly Finance Payment
              </label>
              <p style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0f172a',
                margin: 0,
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}>
                £{record.financeMonthlyPayment.toFixed(2)}
              </p>
            </div>
          )}

          {record.notes && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#64748b',
                marginBottom: '6px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}>
                Notes
              </label>
              <p style={{
                fontSize: '15px',
                color: '#0f172a',
                margin: 0,
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                whiteSpace: 'pre-wrap'
              }}>
                {record.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '12px',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}>
              Delete Vehicle Record?
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              marginBottom: '24px',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}>
              Are you sure you want to delete "{record.name}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: deleteMutation.isPending ? 0.6 : 1,
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRecordDetailPage;
