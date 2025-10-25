import React from 'react';
import { CheckCircle, Clock, Calendar } from 'lucide-react';

interface ImportMonth {
  month: string; // Format: 'YYYY-MM'
  imported: boolean;
  sessionId?: string;
  transactionCount?: number;
  recordsCreated?: number;
  pendingCount?: number;
  importDate?: string;
}

interface ImportTimelineProps {
  months: ImportMonth[];
  onMonthClick?: (month: ImportMonth) => void;
  selectedMonth?: string | null;
}

export default function ImportTimeline({ months, onMonthClick, selectedMonth }: ImportTimelineProps) {
  // Group months by year
  const monthsByYear = months.reduce((acc, month) => {
    const year = month.month.split('-')[0];
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(month);
    return acc;
  }, {} as Record<string, ImportMonth[]>);

  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-GB', { month: 'short' });
  };

  const totalStats = months.reduce(
    (acc, m) => ({
      imports: acc.imports + (m.imported ? 1 : 0),
      transactions: acc.transactions + (m.transactionCount || 0),
      recordsCreated: acc.recordsCreated + (m.recordsCreated || 0),
      pending: acc.pending + (m.pendingCount || 0),
    }),
    { imports: 0, transactions: 0, recordsCreated: 0, pending: 0 }
  );

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #0f172a',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Calendar size={20} color="#0f172a" strokeWidth={1.5} />
        <h3
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0',
          }}
        >
          Import Timeline
        </h3>
      </div>

      {/* Summary Stats */}
      {totalStats.imports > 0 && (
        <div
          style={{
            fontSize: '14px',
            color: '#1e293b',
            marginBottom: '20px',
            lineHeight: '1.5',
          }}
        >
          {totalStats.imports} imports | {totalStats.transactions} total transactions |{' '}
          {totalStats.recordsCreated} records created | {totalStats.pending} pending
        </div>
      )}

      {/* Timeline */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
        {Object.entries(monthsByYear)
          .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Newest year first
          .map(([year, yearMonths]) => (
            <div key={year} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Year Label */}
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b',
                  minWidth: '50px',
                }}
              >
                [{year}]
              </div>

              {/* Months for this year */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {yearMonths
                  .sort((a, b) => a.month.localeCompare(b.month))
                  .map((month) => {
                    const isSelected = selectedMonth === month.month;
                    const isClickable = month.imported && onMonthClick;

                    return (
                      <div
                        key={month.month}
                        onClick={() => isClickable && onMonthClick(month)}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                          border: isSelected ? '1px solid #0ea5e9' : '1px solid transparent',
                          cursor: isClickable ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (isClickable) {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        title={
                          month.imported
                            ? `${formatMonthDisplay(month.month)} ${year}\nImported: ${new Date(
                                month.importDate || ''
                              ).toLocaleDateString('en-GB')}\n${month.transactionCount} transactions | ${
                                month.recordsCreated
                              } records created | ${month.pendingCount} pending`
                            : `${formatMonthDisplay(month.month)} ${year}\nNot imported yet`
                        }
                      >
                        {/* Month Name */}
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: month.imported ? '#0f172a' : '#1e293b',
                          }}
                        >
                          {formatMonthDisplay(month.month)}
                        </div>

                        {/* Status Icon */}
                        {month.imported ? (
                          <CheckCircle size={16} color="#059669" strokeWidth={2} />
                        ) : (
                          <Clock size={16} color="#1e293b" strokeWidth={1.5} />
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>

      {/* Empty State */}
      {months.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#1e293b',
          }}
        >
          <Calendar size={48} color="#1e293b" strokeWidth={1.5} style={{ margin: '0 auto 16px' }} />
          <p
            style={{
              fontSize: '14px',
              margin: '0',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            No imports yet. Upload your first bank statement to get started.
          </p>
        </div>
      )}
    </div>
  );
}
