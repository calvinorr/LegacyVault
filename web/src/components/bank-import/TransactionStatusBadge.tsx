import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

type TransactionStatus = 'pending' | 'record_created' | 'ignored';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  recordId?: string;
  recordDomain?: string;
  ignoredReason?: string;
}

export default function TransactionStatusBadge({
  status,
  recordId,
  recordDomain,
  ignoredReason,
}: TransactionStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'record_created':
        return {
          icon: <CheckCircle size={14} strokeWidth={2} />,
          label: 'Entry Created',
          backgroundColor: '#dcfce7',
          color: '#16a34a',
          tooltip: recordId
            ? `Record created in ${recordDomain} domain (ID: ${recordId.slice(-6)})`
            : 'Entry Created',
        };
      case 'ignored':
        return {
          icon: <XCircle size={14} strokeWidth={2} />,
          label: 'Ignored',
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          tooltip: ignoredReason ? `Ignored: ${ignoredReason}` : 'Ignored',
        };
      case 'pending':
      default:
        return {
          icon: <Clock size={14} strokeWidth={2} />,
          label: 'Pending Review',
          backgroundColor: '#fef3c7',
          color: '#d97706',
          tooltip: 'Pending Review - Needs action',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      title={config.tooltip}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '500',
        backgroundColor: config.backgroundColor,
        color: config.color,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
