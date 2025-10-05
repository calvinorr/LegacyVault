// web/src/components/emergency/QuickActionButton.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  href: string;
  color?: 'green' | 'blue' | 'red';
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  label,
  href,
  color = 'blue'
}) => {
  const colorClasses = {
    green: 'bg-green-100 hover:bg-green-200 text-green-700',
    blue: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    red: 'bg-red-100 hover:bg-red-200 text-red-700'
  };

  return (
    <a
      href={href}
      className={`flex items-center gap-3 p-3 rounded-lg transition min-h-[48px] ${colorClasses[color]}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
};

export default QuickActionButton;
