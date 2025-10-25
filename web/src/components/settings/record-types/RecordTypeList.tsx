import React from 'react';

interface RecordType {
  _id: string;
  name: string;
  domain: string;
}

interface RecordTypeListProps {
  domain: string;
  recordTypes: RecordType[];
  recordCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (recordType: RecordType) => void;
  onDelete: (id: string) => void;
  onAddForDomain: () => void;
}

const RecordTypeList: React.FC<RecordTypeListProps> = ({
  domain,
  recordTypes,
  recordCount,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddForDomain,
}) => {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Domain Header - Collapsible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-150 transition-colors border-l-4 border-slate-400"
      >
        <div className="flex items-center gap-3">
          {/* Chevron Icon */}
          <span
            className="text-slate-800 transition-transform duration-200"
            style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          >
            ▼
          </span>
          {/* Domain Name with Count Badge */}
          <h4 className="font-semibold text-base text-slate-900">
            {domain}
            <span className="ml-2 text-slate-800 font-normal text-sm">
              ({recordCount})
            </span>
          </h4>
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 bg-white">
          {recordTypes.length === 0 ? (
            // Empty State with Inline Add Button
            <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <p className="text-sm text-slate-700 italic">
                No record types defined. Add your first {domain.toLowerCase()} type...
              </p>
              <button
                onClick={onAddForDomain}
                className="px-3 py-1 text-sm bg-slate-900 text-white rounded hover:bg-slate-800"
              >
                + Add
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recordTypes.map(recordType => (
                <div
                  key={recordType._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span className="text-sm text-slate-900">{recordType.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(recordType)}
                      className="px-3 py-1 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(recordType._id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordTypeList;
