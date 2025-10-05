import React, { useState } from 'react';
import { Plus, Car } from 'lucide-react';
import VehicleRecordCard from '../components/vehicles/VehicleRecordCard';
import VehicleRecordForm from '../components/vehicles/VehicleRecordForm';
import { useVehicleRecords } from '../hooks/useVehicleRecords';

const VehiclesDomainPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: records, isLoading } = useVehicleRecords();

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

  return (
    <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Car size={28} color="#0f172a" strokeWidth={1.5} />
              </div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '600',
                color: '#0f172a',
                margin: 0,
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.025em'
              }}>
                Vehicles
              </h1>
            </div>
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              margin: 0,
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}>
              Manage vehicle details, MOT, insurance, road tax, and finance
            </p>
          </div>

          <button onClick={() => setIsFormOpen(true)} style={buttonStyle}>
            <Plus size={20} strokeWidth={2} />
            Add Vehicle
          </button>
        </div>
      </header>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
          Loading vehicles...
        </div>
      ) : !records || records.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          backgroundColor: '#fefefe',
          borderRadius: '16px',
          border: '2px dashed #e2e8f0'
        }}>
          <Car size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '20px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}>
            No vehicle records yet. Add your first vehicle to get started.
          </p>
          <button onClick={() => setIsFormOpen(true)} style={buttonStyle}>
            <Plus size={20} strokeWidth={2} />
            Add First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <VehicleRecordCard key={record._id} record={record} />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <VehicleRecordForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default VehiclesDomainPage;
