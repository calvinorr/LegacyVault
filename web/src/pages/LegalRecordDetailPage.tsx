import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LegalRecordDetail from '../components/legal/LegalRecordDetail';
import LegalRecordForm from '../components/legal/LegalRecordForm';
import Modal from '../components/shared/Modal';
import {
  useLegalRecord,
  useDeleteLegalRecord
} from '../hooks/useLegalRecords';

const LegalRecordDetailPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: record, isLoading } = useLegalRecord(recordId!);
  const deleteMutation = useDeleteLegalRecord();

  const handleDelete = async () => {
    if (!recordId) return;
    try {
      await deleteMutation.mutateAsync(recordId);
      navigate('/legal');
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-slate-800">Loading...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-slate-800">Record not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/legal')}
        className="flex items-center gap-2 text-slate-800 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Legal
      </button>

      <LegalRecordDetail
        record={record}
        onEdit={() => setIsEditOpen(true)}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Legal Record"
      >
        <LegalRecordForm
          initialData={record}
          onSuccess={() => setIsEditOpen(false)}
          onCancel={() => setIsEditOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default LegalRecordDetailPage;
