import React, { useState } from 'react';
import { X, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useUpdateDomainConfig } from '../../hooks/useDomainConfig';
import { DomainConfig } from '../../hooks/useDomainConfig';

const DEFAULT_RECORD_TYPES = [
  'Contact',
  'ServiceHistory',
  'Finance',
  'Insurance',
  'Government',
  'Pension',
];

interface RecordTypeSelectorProps {
  config: DomainConfig;
  onClose: () => void;
}

const RecordTypeSelector: React.FC<RecordTypeSelectorProps> = ({ config, onClose }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(config.allowedRecordTypes);
  const [isSaving, setIsSaving] = useState(false);
  const updateMutation = useUpdateDomainConfig();

  const handleToggle = (recordType: string) => {
    setSelectedTypes((prev) =>
      prev.includes(recordType)
        ? prev.filter((t) => t !== recordType)
        : [...prev, recordType]
    );
  };

  const handleSave = async () => {
    if (selectedTypes.length === 0) {
      alert('At least one record type must be selected');
      return;
    }

    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        domain: config.domainType.toLowerCase(),
        allowedRecordTypes: selectedTypes,
      });

      // Show success toast (simplified version)
      alert(`${config.domainType} configuration updated successfully`);
      onClose();
    } catch (error) {
      alert(`Error updating configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const allTypes = Array.from(
    new Set([
      ...DEFAULT_RECORD_TYPES,
      ...config.customRecordTypes.map((t) => t.name),
    ])
  );

  const hasChanges =
    JSON.stringify(selectedTypes.sort()) !== JSON.stringify(config.allowedRecordTypes.sort());

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
            borderBottom: '1px solid #e2e8f0',
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
              Configure {config.domainType} Record Types
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: '#64748b',
                margin: '4px 0 0 0',
              }}
            >
              Select which record types are available for {config.domainType.toLowerCase()} entries
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
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
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Record Types List */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '12px',
            }}
          >
            {allTypes.map((recordType) => {
              const isSelected = selectedTypes.includes(recordType);
              const isCustom = config.customRecordTypes.some((t) => t.name === recordType);

              return (
                <label
                  key={recordType}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected ? '#f0f9ff' : '#ffffff';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(recordType)}
                    style={{
                      display: 'none',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      color: isSelected ? '#0369a1' : '#cbd5e1',
                    }}
                  >
                    {isSelected ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Circle size={20} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#0f172a',
                      }}
                    >
                      {recordType}
                      {isCustom && (
                        <span
                          style={{
                            marginLeft: '8px',
                            fontSize: '11px',
                            fontWeight: '500',
                            color: '#f59e0b',
                            backgroundColor: '#fef3c7',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          Custom
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Info Message */}
          {selectedTypes.length === 0 && (
            <div
              style={{
                marginTop: '16px',
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
              <div>At least one record type must be selected</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            position: 'sticky',
            bottom: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving || selectedTypes.length === 0}
            style={{
              padding: '10px 20px',
              backgroundColor:
                !hasChanges || isSaving || selectedTypes.length === 0
                  ? '#cbd5e1'
                  : '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor:
                !hasChanges || isSaving || selectedTypes.length === 0
                  ? 'not-allowed'
                  : 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
            onMouseEnter={(e) => {
              if (hasChanges && !isSaving && selectedTypes.length > 0) {
                e.currentTarget.style.backgroundColor = '#1e293b';
              }
            }}
            onMouseLeave={(e) => {
              if (hasChanges && !isSaving && selectedTypes.length > 0) {
                e.currentTarget.style.backgroundColor = '#0f172a';
              }
            }}
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordTypeSelector;
