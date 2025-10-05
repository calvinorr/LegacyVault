import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SensitiveDataFieldProps {
  label: string;
  value?: string;
  maskedValue?: string;
  className?: string;
}

const SensitiveDataField: React.FC<SensitiveDataFieldProps> = ({
  label,
  value,
  maskedValue,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!value) return null;

  const displayValue = isVisible ? value : (maskedValue || value);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
        >
          {isVisible ? (
            <>
              <EyeOff className="w-3 h-3" />
              Hide
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              Show
            </>
          )}
        </button>
      </div>
      <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-900">
        {displayValue}
      </div>
    </div>
  );
};

export default SensitiveDataField;
