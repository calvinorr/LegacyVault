import React from 'react';
import {
  Droplet,
  Zap,
  Fuel,
  Sparkles,
  Leaf,
  Hammer,
  Wrench,
  LucideIcon,
} from 'lucide-react';

export type ServiceType =
  | 'plumber'
  | 'electrician'
  | 'oil_supplier'
  | 'cleaner'
  | 'gardener'
  | 'handyman'
  | 'other';

interface ServiceTypeConfig {
  value: ServiceType;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const SERVICE_TYPES: ServiceTypeConfig[] = [
  {
    value: 'plumber',
    label: 'Plumber',
    icon: Droplet,
    color: '#3b82f6',
    bgColor: '#dbeafe',
  },
  {
    value: 'electrician',
    label: 'Electrician',
    icon: Zap,
    color: '#eab308',
    bgColor: '#fef9c3',
  },
  {
    value: 'oil_supplier',
    label: 'Oil Supplier',
    icon: Fuel,
    color: '#f97316',
    bgColor: '#ffedd5',
  },
  {
    value: 'cleaner',
    label: 'Cleaner',
    icon: Sparkles,
    color: '#a855f7',
    bgColor: '#f3e8ff',
  },
  {
    value: 'gardener',
    label: 'Gardener',
    icon: Leaf,
    color: '#22c55e',
    bgColor: '#dcfce7',
  },
  {
    value: 'handyman',
    label: 'Handyman',
    icon: Hammer,
    color: '#6b7280',
    bgColor: '#f3f4f6',
  },
  {
    value: 'other',
    label: 'Other',
    icon: Wrench,
    color: '#64748b',
    bgColor: '#f1f5f9',
  },
];

interface ServiceTypeBadgeProps {
  type: ServiceType;
  size?: 'sm' | 'md' | 'lg';
}

export default function ServiceTypeBadge({
  type,
  size = 'md',
}: ServiceTypeBadgeProps) {
  const config = SERVICE_TYPES.find((t) => t.value === type) || SERVICE_TYPES[6]; // Default to 'other'
  const Icon = config.icon;

  const sizeStyles = {
    sm: {
      padding: '4px 10px',
      fontSize: '12px',
      iconSize: 14,
      gap: '6px',
    },
    md: {
      padding: '6px 14px',
      fontSize: '13px',
      iconSize: 16,
      gap: '8px',
    },
    lg: {
      padding: '8px 16px',
      fontSize: '14px',
      iconSize: 18,
      gap: '8px',
    },
  };

  const style = sizeStyles[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: style.gap,
        padding: style.padding,
        borderRadius: '20px',
        backgroundColor: config.bgColor,
        color: config.color,
        fontSize: style.fontSize,
        fontWeight: '500',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={style.iconSize} strokeWidth={2} />
      {config.label}
    </span>
  );
}
