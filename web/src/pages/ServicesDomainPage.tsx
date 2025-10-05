import React, { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import ServicesRecordCard from '../components/services/ServicesRecordCard';
import ServicesRecordForm from '../components/services/ServicesRecordForm';
import Modal from '../components/shared/Modal';
import { useServicesRecords } from '../hooks/useServicesRecords';

const ServicesDomainPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: records, isLoading } = useServicesRecords();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100">
            <Wrench className="w-8 h-8 text-slate-700" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Household Services
            </h1>
            <p className="text-slate-600">
              Manage tradespeople, cleaners, gardeners, and service providers
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Record
        </button>
      </header>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">
          Loading records...
        </div>
      ) : records?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">
            No service records yet. Add your first record to get started.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add First Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records?.map((record) => (
            <ServicesRecordCard key={record._id} record={record} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add Service Record"
      >
        <ServicesRecordForm
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ServicesDomainPage;
