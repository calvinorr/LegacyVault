import React, { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import type { Category } from '../types/category';

interface CategoryOption {
  id: string;
  name: string;
  fullPath: string; // "Insurance > Car Insurance"
  isParent: boolean;
  level: number;
}

interface CategorySelectorProps {
  value: string; // categoryId
  onChange: (categoryId: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function CategorySelector({
  value,
  onChange,
  placeholder = "Select category",
  required = false,
  disabled = false,
  style,
  className
}: CategorySelectorProps) {
  const { categories, loading, error, isUsingFallback } = useCategories();

  const categoryOptions = useMemo(() => {
    const flattenCategories = (cats: Category[], level: number = 0, parentPath: string = ''): CategoryOption[] => {
      const options: CategoryOption[] = [];
      
      cats.forEach(category => {
        const currentPath = parentPath ? `${parentPath} > ${category.name}` : category.name;
        
        // Add the current category
        options.push({
          id: category._id,
          name: category.name,
          fullPath: currentPath,
          isParent: !!(category.children && category.children.length > 0),
          level
        });
        
        // Add children recursively
        if (category.children && category.children.length > 0) {
          options.push(...flattenCategories(category.children, level + 1, currentPath));
        }
      });
      
      return options;
    };

    return flattenCategories(categories);
  }, [categories]);

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    paddingRight: '40px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='1.5'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    ...style
  };

  const focusStyle: React.CSSProperties = {
    borderColor: '#0f172a',
    boxShadow: '0 0 0 3px rgba(15, 23, 42, 0.1)'
  };

  const loadingStyle: React.CSSProperties = {
    opacity: 0.6,
    cursor: 'not-allowed'
  };

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    Object.assign(e.target.style, focusStyle);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow = 'none';
  };

  const finalStyle = {
    ...selectStyle,
    ...(loading || disabled ? loadingStyle : {})
  };

  if (error && !isUsingFallback) {
    return (
      <select
        style={finalStyle}
        disabled
        className={className}
      >
        <option>Failed to load categories</option>
      </select>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={loading || disabled}
        style={finalStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className}
      >
        <option value="">
          {loading ? 'Loading categories...' : placeholder}
        </option>
        {categoryOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.level > 0 ? '  '.repeat(option.level) : ''}{option.fullPath}
          </option>
        ))}
      </select>
      
      {isUsingFallback && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          fontSize: '12px',
          color: '#f59e0b',
          marginTop: '4px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}>
          Using offline categories
        </div>
      )}
    </div>
  );
}

// Export utility function to get category display name by ID
export const getCategoryDisplayName = (categoryId: string, categories: Category[]): string => {
  const findCategory = (cats: Category[], id: string, parentPath: string = ''): string | null => {
    for (const cat of cats) {
      const currentPath = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
      
      if (cat._id === id) {
        return currentPath;
      }
      
      if (cat.children) {
        const found = findCategory(cat.children, id, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  return findCategory(categories, categoryId) || 'Unknown Category';
};