import React, { useState, useEffect } from 'react';

interface RecordTypeFormProps {
  onClose: () => void;
  onSubmit: (data: { name: string; domain: string }) => void;
  initialData?: { _id: string; name: string; domain: string } | null;
  domains: string[];
}

const RecordTypeForm: React.FC<RecordTypeFormProps> = ({
  onClose,
  onSubmit,
  initialData,
  domains,
}) => {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDomain(initialData.domain);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && domain) {
      onSubmit({ name: name.trim(), domain });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {initialData ? 'Edit Record Type' : 'Add Record Type'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              placeholder="e.g., Mortgage, Rent, Car Loan"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              disabled={!!initialData}
              required
            >
              <option value="">Select a domain</option>
              {domains.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              {initialData ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordTypeForm;
