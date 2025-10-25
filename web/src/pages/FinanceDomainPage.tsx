import React, { useState, useMemo } from 'react';
import { Plus, Banknote } from 'lucide-react';
import FinanceRecordCard from '../components/finance/FinanceRecordCard';
import FinanceRecordForm from '../components/finance/FinanceRecordForm';
import { useFinanceRecords } from '../hooks/useFinanceRecords';

const RECORD_TYPE_LABELS: Record<string, string> = {
  'current-account': 'Current Accounts',
  'savings-account': 'Savings Accounts',
  'isa': 'ISAs',
  'credit-card': 'Credit Cards',
  'loan': 'Loans',
  'investment': 'Investments',
  'premium-bonds': 'Premium Bonds',
  'pension': 'Pensions'
};

const FinanceDomainPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: records, isLoading } = useFinanceRecords();

  // Group records by type
  const groupedRecords = useMemo(() => {
    if (!records) return {};

    return records.reduce((groups, record) => {
      const type = record.recordType;
      if (!groups[type]) groups[type] = [];
      groups[type].push(record);
      return groups;
    }, {} as Record<string, typeof records>);
  }, [records]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100">
            <Banknote className="w-8 h-8 text-slate-700" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">Finance</h1>
            <p className="text-slate-800">
              Manage bank accounts, savings, ISAs, and investments
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </header>

      {isLoading ? (
        <div className="text-center py-12 text-slate-800">Loading accounts...</div>
      ) : records?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-800 mb-4">
            No finance records yet. Add your first account to get started.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Add First Account
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRecords).map(([type, typeRecords]) => (
            <div key={type}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {RECORD_TYPE_LABELS[type] || type}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeRecords.map((record) => (
                  <FinanceRecordCard key={record._id} record={record} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-900">Add Finance Record</h2>
            </div>
            <div className="p-6">
              <FinanceRecordForm
                onSuccess={() => setIsFormOpen(false)}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDomainPage;
