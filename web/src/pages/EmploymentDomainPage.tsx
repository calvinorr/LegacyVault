import React, { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import EmploymentRecordCard from '../components/employment/EmploymentRecordCard';
import EmploymentRecordForm from '../components/employment/EmploymentRecordForm';
import Modal from '../components/shared/Modal';
import { useEmploymentRecords } from '../hooks/useEmploymentRecords';

const EmploymentDomainPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: records, isLoading } = useEmploymentRecords();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100">
            <Briefcase className="w-8 h-8 text-slate-700" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Employment
            </h1>
            <p className="text-slate-600">
              Manage payroll, pension, workplace benefits
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
            No employment records yet. Add your first record to get started.
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
            <EmploymentRecordCard key={record._id} record={record} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add Employment Record"
      >
        <EmploymentRecordForm
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default EmploymentDomainPage;
