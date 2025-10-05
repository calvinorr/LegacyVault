import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useFinanceRecord, useDeleteFinanceRecord } from '../hooks/useFinanceRecords';
import FinanceRecordDetail from '../components/finance/FinanceRecordDetail';
import FinanceRecordForm from '../components/finance/FinanceRecordForm';

const FinanceRecordDetailPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: record, isLoading } = useFinanceRecord(recordId!);
  const deleteMutation = useDeleteFinanceRecord();

  const handleDelete = async () => {
    if (!recordId) return;

    try {
      await deleteMutation.mutateAsync(recordId);
      navigate('/finance');
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-slate-500">Loading record...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Finance record not found</p>
          <button
            onClick={() => navigate('/finance')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Back to Finance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/finance')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Finance
      </button>

      {/* Detail View */}
      {!isEditMode ? (
        <FinanceRecordDetail
          record={record}
          onEdit={() => setIsEditMode(true)}
          onDelete={handleDelete}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Edit Finance Record</h2>
          <FinanceRecordForm
            initialData={record}
            onSuccess={() => setIsEditMode(false)}
            onCancel={() => setIsEditMode(false)}
          />
        </div>
      )}
    </div>
  );
};

export default FinanceRecordDetailPage;
