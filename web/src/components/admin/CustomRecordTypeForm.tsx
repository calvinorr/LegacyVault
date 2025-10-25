import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useCreateCustomRecordType } from '../../hooks/useDomainConfig';

interface CustomRecordTypeFormProps {
  onClose: () => void;
}

const COMMON_ICONS = [
  'Phone',
  'Mail',
  'Calendar',
  'DollarSign',
  'Shield',
  'Wrench',
  'Home',
  'Car',
  'Briefcase',
  'Users',
  'FileText',
  'Clock',
  'AlertCircle',
  'CheckCircle',
  'Heart',
  'Award',
];

const COMMON_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

const CustomRecordTypeForm: React.FC<CustomRecordTypeFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'FileText',
    color: '#3b82f6',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateCustomRecordType();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (formData.name.length > 50) {
      setError('Name must be less than 50 characters');
      return;
    }

    if (!formData.icon.trim()) {
      setError('Icon is required');
      return;
    }

    if (!formData.color.match(/^#[0-9a-f]{6}$/i)) {
      setError('Color must be a valid hex color (e.g., #3b82f6)');
      return;
    }

    setIsSaving(true);
    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        icon: formData.icon.trim(),
        color: formData.color,
        description: formData.description.trim(),
        requiredFields: [],
      });

      alert('Custom record type created successfully');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom record type');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            borderBottom: '1px solid #0f172a',
            position: 'sticky',
            top: 0,
            backgroundColor: '#ffffff',
            zIndex: 10,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0',
                color: '#0f172a',
              }}
            >
              Create Custom Record Type
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: '#1e293b',
                margin: '4px 0 0 0',
              }}
            >
              Add a new record type for your organization
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1e293b',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#1e293b';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px' }}>
            {/* Error Message */}
            {error && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#991b1b',
                }}
              >
                <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>{error}</div>
              </div>
            )}

            {/* Name Field */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '6px',
                }}
              >
                Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Warranty"
                maxLength={50}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #0f172a',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0369a1';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#0f172a';
                }}
              />
              <p
                style={{
                  fontSize: '12px',
                  color: '#1e293b',
                  margin: '4px 0 0 0',
                }}
              >
                {formData.name.length}/50 characters
              </p>
            </div>

            {/* Icon Field */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '6px',
                }}
              >
                Icon <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    icon: e.target.value,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #0f172a',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0369a1';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#0f172a';
                }}
              >
                <option value="">Select an icon</option>
                {COMMON_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
              <p
                style={{
                  fontSize: '12px',
                  color: '#1e293b',
                  margin: '4px 0 0 0',
                }}
              >
                Lucide React icon name
              </p>
            </div>

            {/* Color Field */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '6px',
                }}
              >
                Color <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: formData.color,
                    borderRadius: '8px',
                    border: '2px solid #0f172a',
                  }}
                />
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="#3b82f6"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #0f172a',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0369a1';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#0f172a';
                  }}
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}
              >
                {COMMON_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        color,
                      }))
                    }
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      backgroundColor: color,
                      border:
                        formData.color === color
                          ? '3px solid #0f172a'
                          : '1px solid #0f172a',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (formData.color !== color) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Description Field */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '6px',
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What is this record type for?"
                maxLength={200}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '10px 12px',
                  border: '1px solid #0f172a',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0369a1';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#0f172a';
                }}
              />
              <p
                style={{
                  fontSize: '12px',
                  color: '#1e293b',
                  margin: '4px 0 0 0',
                }}
              >
                {formData.description.length}/200 characters
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px',
              borderTop: '1px solid #0f172a',
              backgroundColor: '#f8fafc',
              position: 'sticky',
              bottom: 0,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #0f172a',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '10px 20px',
                backgroundColor: isSaving ? '#1e293b' : '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#1e293b';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#0f172a';
                }
              }}
            >
              {isSaving ? 'Creating…' : 'Create Record Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomRecordTypeForm;
