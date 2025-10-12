import React from 'react';

interface PatternBadgeProps {
  confidence: number; // 0-1 (e.g., 0.87 = 87%)
  onClick?: () => void;
}

export default function PatternBadge({ confidence, onClick }: PatternBadgeProps) {
  const percentage = Math.round(confidence * 100);

  // Color-coded based on confidence thresholds
  const getStyles = () => {
    if (confidence >= 0.85) {
      // High confidence - Green
      return {
        backgroundColor: '#dcfce7',
        color: '#16a34a',
        label: 'Strong Match',
      };
    } else if (confidence >= 0.65) {
      // Medium confidence - Yellow
      return {
        backgroundColor: '#fef3c7',
        color: '#d97706',
        label: 'Likely Match',
      };
    } else {
      // Low confidence - Gray
      return {
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
        label: 'Possible Match',
      };
    }
  };

  const styles = getStyles();

  return (
    <span
      onClick={onClick}
      title={`${styles.label} - ${percentage}% confidence`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '10px',
        fontWeight: '600',
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.0)';
        }
      }}
    >
      🔄 {percentage}%
    </span>
  );
}
