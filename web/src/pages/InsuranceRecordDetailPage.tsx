import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import InsuranceRecordDetail from '../components/insurance/InsuranceRecordDetail';
import InsuranceRecordForm from '../components/insurance/InsuranceRecordForm';
import Modal from '../components/shared/Modal';
import {
  useInsuranceRecord,
  useDeleteInsuranceRecord
} from '../hooks/useInsuranceRecords';

const InsuranceRecordDetailPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: record, isLoading } = useInsuranceRecord(recordId!);
  const deleteMutation = useDeleteInsuranceRecord();

  const handleDelete = async () => {
    if (!recordId) return;
    try {
      await deleteMutation.mutateAsync(recordId);
      navigate('/insurance');
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-slate-500">Record not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/insurance')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Insurance
      </button>

      <InsuranceRecordDetail
        record={record}
        onEdit={() => setIsEditOpen(true)}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Insurance Record"
      >
        <InsuranceRecordForm
          initialData={record}
          onSuccess={() => setIsEditOpen(false)}
          onCancel={() => setIsEditOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default InsuranceRecordDetailPage;
