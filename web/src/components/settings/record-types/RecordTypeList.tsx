import React from 'react';

interface RecordType {
  _id: string;
  name: string;
  domain: string;
}

interface RecordTypeListProps {
  domain: string;
  recordTypes: RecordType[];
  onEdit: (recordType: RecordType) => void;
  onDelete: (id: string) => void;
}

const RecordTypeList: React.FC<RecordTypeListProps> = ({ domain, recordTypes, onEdit, onDelete }) => {
  return (
    <div>
      <h4 className="font-medium text-base mb-3">{domain}</h4>
      {recordTypes.length === 0 ? (
        <p className="text-sm text-slate-500 italic">No record types defined</p>
      ) : (
        <div className="space-y-2">
          {recordTypes.map(recordType => (
            <div
              key={recordType._id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="text-sm">{recordType.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(recordType)}
                  className="px-3 py-1 text-sm text-slate-700 hover:text-slate-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(recordType._id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordTypeList;
