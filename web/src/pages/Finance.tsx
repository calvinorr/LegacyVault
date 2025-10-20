import React, { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import ParentEntityList from '../components/parent-entities/ParentEntityList';
import ParentEntityForm from '../components/parent-entities/ParentEntityForm';
import DeleteConfirmModal from '../components/parent-entities/DeleteConfirmModal';
import { ParentEntity } from '../services/api/parentEntities';

const Finance: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<ParentEntity | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);

  const handleCreateNew = (imageFile?: File) => {
    setSelectedEntity(null);
    setPendingImage(imageFile || null);
    setIsFormOpen(true);
  };

  const handleEdit = (entity: ParentEntity) => {
    setSelectedEntity(entity);
    setIsFormOpen(true);
  };

  const handleDelete = (entity: ParentEntity) => {
    setSelectedEntity(entity);
    setIsDeleteModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedEntity(null);
  };

  const handleDeleteClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedEntity(null);
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

  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{
        maxWidth: '1400px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
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
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DollarSign size={28} color="#0f172a" strokeWidth={1.5} />
              </div>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.025em'
                }}
              >
                Finance
              </h1>
            </div>
            <p
              style={{
                fontSize: '15px',
                color: '#64748b',
                margin: 0
              }}
            >
              Manage your financial accounts including banks, credit cards, investments, and pensions
            </p>
          </div>

          <button onClick={handleCreateNew} style={buttonStyle}>
            <Plus size={20} strokeWidth={2} />
            Add Account
          </button>
        </div>
      </header>

      {/* Parent Entity List */}
      <ParentEntityList
        domain="finance"
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <ParentEntityForm
        domain="finance"
        entity={selectedEntity}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormClose}
        pendingImage={pendingImage}
        onImageProcessed={() => setPendingImage(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        entity={selectedEntity}
        domain="finance"
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteClose}
        childRecordCount={selectedEntity?.childRecordCount || 0}
      />
    </div>
  );
};

export default Finance;
