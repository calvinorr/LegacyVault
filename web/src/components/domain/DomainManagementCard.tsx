import React, { useState } from 'react';
import { LucideIcon, ChevronDown, ChevronUp, Plus, Edit2, Trash2 } from 'lucide-react';

interface RecordType {
  _id: string;
  name: string;
  domain: string;
}

interface DomainManagementCardProps {
  domain: {
    id: string;
    name: string;
    icon: LucideIcon;
  };
  recordTypes: RecordType[];
  onEdit: (recordType: RecordType) => void;
  onDelete: (id: string) => void;
  onAddForDomain: (domain: string) => void;
}

const DomainManagementCard: React.FC<DomainManagementCardProps> = ({
  domain,
  recordTypes,
  onEdit,
  onDelete,
  onAddForDomain
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = domain.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md overflow-hidden">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-100 shrink-0">
            <Icon className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 mb-0.5">
              {domain.name}
            </h3>
            <p className="text-xs text-slate-800">
              {recordTypes.length} {recordTypes.length === 1 ? 'type' : 'types'}
            </p>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-800 hover:text-slate-900 hover:bg-slate-100
                     rounded-lg transition-all shrink-0"
            title={isExpanded ? "Close" : "Manage record types"}
          >
            {isExpanded ? (
              <ChevronUp size={20} strokeWidth={2} />
            ) : (
              <ChevronDown size={20} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50/50">
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Record Types
              </h4>
              <button
                onClick={() => onAddForDomain(domain.name)}
                className="px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900
                         rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1"
              >
                <Plus size={13} strokeWidth={2.5} />
                Add
              </button>
            </div>

            {recordTypes.length === 0 ? (
              <div className="text-center py-6 text-slate-800 text-sm">
                No record types yet. Click Add to create one.
              </div>
            ) : (
              <div className="space-y-1.5">
                {recordTypes.map((recordType) => (
                  <div
                    key={recordType._id}
                    className="flex items-center justify-between p-2.5 bg-white rounded-lg
                             border border-slate-200 hover:border-slate-300 transition-all group"
                  >
                    <span className="text-sm font-medium text-slate-900">
                      {recordType.name}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(recordType)}
                        className="p-1.5 text-slate-800 hover:text-slate-900 hover:bg-slate-100
                                 rounded transition-all"
                        title="Edit"
                      >
                        <Edit2 size={13} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => onDelete(recordType._id)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50
                                 rounded transition-all"
                        title="Delete"
                      >
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainManagementCard;
