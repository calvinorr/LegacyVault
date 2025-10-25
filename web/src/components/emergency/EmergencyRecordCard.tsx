// web/src/components/emergency/EmergencyRecordCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Copy, ExternalLink } from 'lucide-react';
import QuickActionButton from './QuickActionButton';
import { useClipboard } from '../../hooks/useClipboard';
import { CriticalRecord } from '../../services/api/emergency';

interface EmergencyRecordCardProps {
  record: CriticalRecord;
}

const EmergencyRecordCard: React.FC<EmergencyRecordCardProps> = ({ record }) => {
  const navigate = useNavigate();
  const { copyToClipboard, copied } = useClipboard();

  const handleCopyNotes = () => {
    if (record.notes) {
      copyToClipboard(record.notes);
    }
  };

  return (
    <div className="p-5 rounded-xl border-2 border-red-200 bg-red-50 no-print-border">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">
            {record.name}
          </h3>
          <p className="text-sm text-slate-800 capitalize">
            {record.recordType.replace(/-/g, ' ')}
          </p>
        </div>
        <button
          onClick={() => navigate(record.domainUrl)}
          className="p-2 rounded-lg hover:bg-red-100 transition no-print"
          aria-label="View full details"
        >
          <ExternalLink className="w-5 h-5 text-slate-800" />
        </button>
      </div>

      {(record.contactPhone || record.contactEmail) && (
        <div className="space-y-2 mb-4">
          {record.contactPhone && (
            <QuickActionButton
              icon={Phone}
              label={record.contactPhone}
              href={`tel:${record.contactPhone}`}
              color="green"
            />
          )}
          {record.contactEmail && (
            <QuickActionButton
              icon={Mail}
              label={record.contactEmail}
              href={`mailto:${record.contactEmail}`}
              color="blue"
            />
          )}
        </div>
      )}

      {record.notes && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <div className="flex items-start justify-between">
            <p className="text-sm text-slate-700 flex-1">{record.notes}</p>
            <button
              onClick={handleCopyNotes}
              className="ml-2 p-1 rounded hover:bg-red-100 transition no-print"
              aria-label={copied ? 'Copied!' : 'Copy notes'}
              title={copied ? 'Copied!' : 'Copy notes'}
            >
              <Copy className={`w-4 h-4 ${copied ? 'text-green-600' : 'text-slate-800'}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyRecordCard;
