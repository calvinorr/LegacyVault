import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Car,
  Home,
  Briefcase,
  Wrench,
  ChevronRight,
  ChevronLeft,
  Plus,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useQueryClient } from '@tantml:react-query';
import { useParentEntities } from '../hooks/useParentEntities';
import { useDomainConfigs } from '../hooks/useDomainConfig';
import { DomainType } from '../services/api/parentEntities';

interface Transaction {
  _id: string;
  date: string;
  description: string;
  amount: number;
  originalText: string;
  recordCreated?: boolean;
  patternMatched?: boolean;
  patternConfidence?: number;
  patternId?: string;
}

interface CreateEntryFromTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction | null;
  sessionId?: string;
  transactionIndex?: number;
}

// Epic 6 Domain configuration
const DOMAINS = [
  {
    value: 'vehicles',
    label: 'Vehicles',
    description: 'Cars, Motorcycles',
    icon: Car,
    color: '#3b82f6',
  },
  {
    value: 'properties',
    label: 'Properties',
    description: 'Houses, Flats',
    icon: Home,
    color: '#10b981',
  },
  {
    value: 'employments',
    label: 'Employment',
    description: 'Jobs, Positions',
    icon: Briefcase,
    color: '#8b5cf6',
  },
  {
    value: 'services',
    label: 'Services',
    description: 'Tradespeople, Providers',
    icon: Wrench,
    color: '#f59e0b',
  },
];

// Base child record types (Story 1.6)
const BASE_RECORD_TYPES = [
  { value: 'Contact', label: 'Contact', description: 'Key contact person' },
  {
    value: 'ServiceHistory',
    label: 'Service History',
    description: 'Maintenance, repairs, MOT',
  },
  { value: 'Finance', label: 'Finance', description: 'Loans, payments' },
  { value: 'Insurance', label: 'Insurance', description: 'Insurance policies' },
  {
    value: 'Government',
    label: 'Government',
    description: 'Tax, licenses, permits',
  },
  { value: 'Pension', label: 'Pension', description: 'Pension schemes' },
];

// Smart domain and record type suggestion
function suggestDomainAndType(description: string): {
  domain: string;
  recordType: string;
} {
  const desc = description.toLowerCase();

  // Vehicle-related
  if (desc.includes('car') || desc.includes('vehicle') || desc.includes('mot')) {
    if (desc.includes('insurance')) return { domain: 'vehicles', recordType: 'Insurance' };
    if (desc.includes('tax') || desc.includes('dvla'))
      return { domain: 'vehicles', recordType: 'Government' };
    if (desc.includes('finance') || desc.includes('loan'))
      return { domain: 'vehicles', recordType: 'Finance' };
    if (desc.includes('service') || desc.includes('mot') || desc.includes('repair'))
      return { domain: 'vehicles', recordType: 'ServiceHistory' };
    return { domain: 'vehicles', recordType: 'Finance' };
  }

  // Property utilities
  if (
    desc.includes('gas') ||
    desc.includes('electric') ||
    desc.includes('water') ||
    desc.includes('council tax') ||
    desc.includes('rent') ||
    desc.includes('mortgage')
  ) {
    return { domain: 'properties', recordType: 'Finance' };
  }

  // Services/Subscriptions
  if (
    desc.includes('netflix') ||
    desc.includes('spotify') ||
    desc.includes('amazon') ||
    desc.includes('broadband') ||
    desc.includes('mobile') ||
    desc.includes('phone') ||
    desc.includes('plumber') ||
    desc.includes('electrician')
  ) {
    return { domain: 'services', recordType: 'Finance' };
  }

  // Default
  return { domain: 'services', recordType: 'Finance' };
}

// Extract provider name from transaction description
function extractProvider(description: string): string {
  const cleanDesc = description
    .replace(/PAYMENT|DD|DIRECT DEBIT|CARD|ONLINE|TO /gi, '')
    .trim();
  const words = cleanDesc.split(' ');
  return words.length >= 2 ? words.slice(0, 2).join(' ') : words[0];
}

export default function CreateEntryFromTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  sessionId,
}: CreateEntryFromTransactionModalProps) {
  // Wizard steps: 1=Domain, 2=Parent, 3=RecordType, 4=Form, 5=Success
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Domain selection
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  // Step 2: Parent entity selection
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [showInlineParentForm, setShowInlineParentForm] = useState(false);
  const [newParentName, setNewParentName] = useState('');
  const [creatingParent, setCreatingParent] = useState(false);

  // Step 3: Record type selection
  const [selectedRecordType, setSelectedRecordType] = useState<string>('');

  // Step 4: Child record form fields
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('active');

  // Step 5: Success data
  const [createdRecordData, setCreatedRecordData] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Load parent entities for selected domain
  const {
    data: parentEntitiesData,
    isLoading: parentEntitiesLoading,
    refetch: refetchParents,
  } = useParentEntities(
    selectedDomain as DomainType,
    { limit: 100 }
  );

  const parentEntities = parentEntitiesData?.entities || [];

  // Load domain configurations
  const { data: domainConfigs, isLoading: domainConfigsLoading } = useDomainConfigs();

  // Get allowed record types for selected domain
  const allowedRecordTypes = React.useMemo(() => {
    if (!selectedDomain || !domainConfigs) return BASE_RECORD_TYPES;

    const config = domainConfigs.find(
      (c) => c.domainType.toLowerCase() === selectedDomain.toLowerCase()
    );

    if (!config || config.allowedRecordTypes.length === 0) return BASE_RECORD_TYPES;

    return BASE_RECORD_TYPES.filter((rt) =>
      config.allowedRecordTypes.includes(rt.value)
    );
  }, [selectedDomain, domainConfigs]);

  // Auto-populate form when transaction changes
  useEffect(() => {
    if (transaction && isOpen) {
      const suggested = suggestDomainAndType(transaction.description);
      setSelectedDomain(suggested.domain);
      setSelectedRecordType(suggested.recordType);

      const extractedProvider = extractProvider(transaction.description);
      setProvider(extractedProvider);
      setName(`${extractedProvider} Payment`);
      setAmount(Math.abs(transaction.amount).toFixed(2));
      setNotes(
        `Auto-generated from bank transaction:\n${transaction.originalText}\nDate: ${transaction.date}`
      );
    }
  }, [transaction, isOpen]);

  // Reset form
  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDomain('');
    setSelectedParentId('');
    setSelectedRecordType('');
    setShowInlineParentForm(false);
    setNewParentName('');
    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setProvider('');
    setAccountNumber('');
    setPolicyNumber('');
    setRenewalDate('');
    setAmount('');
    setFrequency('monthly');
    setNotes('');
    setStatus('active');
    setError(null);
    setCreatedRecordData(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Step 1: Select domain
  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain);
    setSelectedParentId('');
    setSelectedRecordType('');
    setCurrentStep(2);
  };

  // Step 2: Create inline parent entity
  const handleCreateParent = async () => {
    if (!newParentName.trim()) {
      setError('Parent name is required');
      return;
    }

    setCreatingParent(true);
    setError(null);

    try {
      const response = await fetch(`/api/v2/${selectedDomain}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newParentName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create parent entity');
      }

      const newParent = await response.json();
      setSelectedParentId(newParent._id);
      setShowInlineParentForm(false);
      setNewParentName('');

      // Refetch parent entities to show new one
      await refetchParents();

      // Advance to step 3
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to create parent entity');
    } finally {
      setCreatingParent(false);
    }
  };

  // Step 2: Select existing parent
  const handleParentSelect = (parentId: string) => {
    setSelectedParentId(parentId);
    setCurrentStep(3);
  };

  // Step 3: Select record type
  const handleRecordTypeSelect = (recordType: string) => {
    setSelectedRecordType(recordType);
    setCurrentStep(4);
  };

  // Step 4: Submit child record
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!selectedDomain || !selectedParentId || !selectedRecordType) {
        throw new Error('Missing required selections');
      }

      // Build child record payload
      const payload: any = {
        recordType: selectedRecordType,
        name,
        status,
        notes,
      };

      // Continuity fields
      if (contactName) payload.contactName = contactName;
      if (phone) payload.phone = phone;
      if (email) payload.email = email;
      if (accountNumber) payload.accountNumber = accountNumber;
      if (policyNumber) payload.policyNumber = policyNumber;
      if (renewalDate) payload.renewalDate = renewalDate;

      // Financial fields
      if (amount) payload.amount = parseFloat(amount);
      if (frequency) payload.frequency = frequency;

      // Provider
      if (provider) payload.provider = provider;

      // Metadata
      payload.metadata = {
        source: 'bank_import',
        created_from_transaction: true,
        original_description: transaction?.description,
        transaction_amount: transaction?.amount,
        transaction_date: transaction?.date,
        import_date: new Date().toISOString(),
      };

      // Create child record
      const response = await fetch(
        `/api/v2/${selectedDomain}/${selectedParentId}/records`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create child record');
      }

      const createdRecord = await response.json();

      // Update transaction status
      if (transaction?._id) {
        try {
          await fetch(`/api/transactions/${transaction._id}/status`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'record_created',
              recordId: createdRecord._id,
              domain: selectedDomain,
              parentId: selectedParentId,
            }),
          });
        } catch (statusError) {
          console.error('Failed to update transaction status:', statusError);
        }
      }

      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['parent-entities', selectedDomain] });
      queryClient.invalidateQueries({
        queryKey: ['parent-entity', selectedDomain, selectedParentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['child-records', selectedDomain, selectedParentId],
      });

      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['import-session', sessionId] });
        queryClient.invalidateQueries({
          queryKey: ['import-session-transactions', sessionId],
        });
      }

      // Store success data and show success screen
      setCreatedRecordData({
        record: createdRecord,
        parentId: selectedParentId,
        domain: selectedDomain,
      });
      setCurrentStep(5);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create child record');
    } finally {
      setLoading(false);
    }
  };

  // Success screen: View record
  const handleViewRecord = () => {
    const domainSingular = selectedDomain.slice(0, -1); // vehicles → vehicle
    window.location.href = `/${selectedDomain}/${selectedParentId}`;
    handleClose();
  };

  // Success screen: Create another
  const handleCreateAnother = () => {
    resetForm();
    if (transaction && isOpen) {
      const suggested = suggestDomainAndType(transaction.description);
      setSelectedDomain(suggested.domain);
      setSelectedRecordType(suggested.recordType);
    }
  };

  if (!isOpen || !transaction) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '90%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow:
            '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.05)',
          border: '1px solid #f1f5f9',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '32px 32px 24px 32px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.025em',
              }}
            >
              Create Record from Transaction
            </h2>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Progress Indicator */}
          {currentStep < 5 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor:
                      step <= currentStep ? '#0f172a' : '#e2e8f0',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              ))}
            </div>
          )}

          {/* Transaction Preview */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: '#64748b',
                marginBottom: '6px',
                fontWeight: '500',
              }}
            >
              Transaction:
            </div>
            <div
              style={{
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '4px',
              }}
            >
              {transaction.description} • £{Math.abs(transaction.amount).toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {new Date(transaction.date).toLocaleDateString('en-GB')} •{' '}
              {transaction.originalText}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div style={{ padding: '32px' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '24px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {/* STEP 1: Select Domain */}
          {currentStep === 1 && (
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '8px',
                }}
              >
                Select Domain
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginBottom: '24px',
                }}
              >
                Choose which area this transaction belongs to
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                }}
              >
                {DOMAINS.map((domain) => {
                  const Icon = domain.icon;
                  const isSelected = selectedDomain === domain.value;
                  return (
                    <button
                      key={domain.value}
                      onClick={() => handleDomainSelect(domain.value)}
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        border: isSelected
                          ? `2px solid ${domain.color}`
                          : '2px solid #e2e8f0',
                        backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                      }}
                    >
                      <Icon
                        size={32}
                        strokeWidth={1.5}
                        style={{ color: domain.color, marginBottom: '12px' }}
                      />
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#0f172a',
                          marginBottom: '4px',
                        }}
                      >
                        {domain.label}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {domain.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '32px',
                  paddingTop: '24px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  onClick={handleClose}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Parent Entity */}
          {currentStep === 2 && (
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '8px',
                }}
              >
                Select {DOMAINS.find((d) => d.value === selectedDomain)?.label}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginBottom: '24px',
                }}
              >
                Choose an existing item or create a new one
              </p>

              {parentEntitiesLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading...
                </div>
              ) : parentEntities.length === 0 && !showInlineParentForm ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '8px',
                    }}
                  >
                    No{' '}
                    {DOMAINS.find((d) => d.value === selectedDomain)?.label} Yet
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#64748b',
                      marginBottom: '20px',
                    }}
                  >
                    Create your first item to get started
                  </div>
                  <button
                    onClick={() => setShowInlineParentForm(true)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontFamily: 'inherit',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Plus size={18} strokeWidth={2} />
                    Create New
                  </button>
                </div>
              ) : (
                <>
                  {!showInlineParentForm && (
                    <div style={{ marginBottom: '16px' }}>
                      {parentEntities.map((parent) => (
                        <button
                          key={parent._id}
                          onClick={() => handleParentSelect(parent._id)}
                          style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            border:
                              selectedParentId === parent._id
                                ? '2px solid #0f172a'
                                : '2px solid #e2e8f0',
                            backgroundColor:
                              selectedParentId === parent._id
                                ? '#f8fafc'
                                : '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'left',
                            marginBottom: '12px',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#0f172a',
                            }}
                          >
                            {parent.name}
                          </div>
                        </button>
                      ))}

                      <button
                        onClick={() => setShowInlineParentForm(true)}
                        style={{
                          width: '100%',
                          padding: '16px',
                          borderRadius: '12px',
                          border: '2px dashed #cbd5e1',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center',
                          fontFamily: 'inherit',
                          fontSize: '15px',
                          fontWeight: '500',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Plus size={18} strokeWidth={2} />
                        Create New{' '}
                        {
                          DOMAINS.find((d) => d.value === selectedDomain)
                            ?.label
                        }
                      </button>
                    </div>
                  )}

                  {showInlineParentForm && (
                    <div
                      style={{
                        padding: '20px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        marginBottom: '16px',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#0f172a',
                          marginBottom: '16px',
                        }}
                      >
                        Create New{' '}
                        {
                          DOMAINS.find((d) => d.value === selectedDomain)
                            ?.label
                        }
                      </h4>
                      <input
                        type="text"
                        value={newParentName}
                        onChange={(e) => setNewParentName(e.target.value)}
                        placeholder="Enter name"
                        disabled={creatingParent}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '15px',
                          fontFamily: 'inherit',
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box',
                          marginBottom: '16px',
                        }}
                        autoFocus
                      />
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#64748b',
                          marginBottom: '16px',
                          fontStyle: 'italic',
                        }}
                      >
                        You can add more details later from the{' '}
                        {DOMAINS.find((d) => d.value === selectedDomain)?.label}{' '}
                        page
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => {
                            setShowInlineParentForm(false);
                            setNewParentName('');
                            setError(null);
                          }}
                          disabled={creatingParent}
                          style={{
                            padding: '12px 20px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: creatingParent ? 'not-allowed' : 'pointer',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#64748b',
                            fontFamily: 'inherit',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateParent}
                          disabled={creatingParent || !newParentName.trim()}
                          style={{
                            padding: '12px 20px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor:
                              creatingParent || !newParentName.trim()
                                ? 'not-allowed'
                                : 'pointer',
                            border: 'none',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            fontFamily: 'inherit',
                            opacity:
                              creatingParent || !newParentName.trim() ? 0.5 : 1,
                          }}
                        >
                          {creatingParent ? 'Creating...' : 'Create'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginTop: '32px',
                  paddingTop: '24px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  onClick={() => setCurrentStep(1)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <ChevronLeft size={18} strokeWidth={2} />
                  Back
                </button>
                <button
                  onClick={handleClose}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Record Type */}
          {currentStep === 3 && (
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '8px',
                }}
              >
                Select Record Type
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginBottom: '24px',
                }}
              >
                What kind of record is this?
              </p>

              {domainConfigsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading...
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                  }}
                >
                  {allowedRecordTypes.map((recordType) => {
                    const isSelected = selectedRecordType === recordType.value;
                    return (
                      <button
                        key={recordType.value}
                        onClick={() => handleRecordTypeSelect(recordType.value)}
                        style={{
                          padding: '20px',
                          borderRadius: '12px',
                          border: isSelected
                            ? '2px solid #0f172a'
                            : '2px solid #e2e8f0',
                          backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#0f172a',
                            marginBottom: '4px',
                          }}
                        >
                          {recordType.label}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {recordType.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginTop: '32px',
                  paddingTop: '24px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  onClick={() => setCurrentStep(2)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <ChevronLeft size={18} strokeWidth={2} />
                  Back
                </button>
                <button
                  onClick={handleClose}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Fill Child Record Form */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmit}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '8px',
                }}
              >
                Record Details
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginBottom: '24px',
                }}
              >
                Fill in the details for this {selectedRecordType} record
              </p>

              {/* Essential Fields Section */}
              <div
                style={{
                  marginBottom: '24px',
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h4
                  style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '16px',
                  }}
                >
                  Essential Information
                </h4>

                {/* Name */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#334155',
                      marginBottom: '8px',
                    }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Car Insurance"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Contact Name */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#334155',
                      marginBottom: '8px',
                    }}
                  >
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Key contact person"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#334155',
                      marginBottom: '8px',
                    }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contact phone number"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#334155',
                      marginBottom: '8px',
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contact email"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Provider */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#334155',
                      marginBottom: '8px',
                    }}
                  >
                    Provider
                  </label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="Company or organization"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Account/Policy Numbers */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#334155',
                        marginBottom: '8px',
                      }}
                    >
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account #"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '15px',
                        fontFamily: 'inherit',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#334155',
                        marginBottom: '8px',
                      }}
                    >
                      Policy Number
                    </label>
                    <input
                      type="text"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      placeholder="Policy #"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '15px',
                        fontFamily: 'inherit',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Renewal Date */}
                {selectedRecordType === 'Insurance' && (
                  <div style={{ marginTop: '16px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#334155',
                        marginBottom: '8px',
                      }}
                    >
                      Renewal Date
                    </label>
                    <input
                      type="date"
                      value={renewalDate}
                      onChange={(e) => setRenewalDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '15px',
                        fontFamily: 'inherit',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Financial Fields Section (Muted) */}
              <div style={{ marginBottom: '24px' }}>
                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#94a3b8',
                    marginBottom: '12px',
                  }}
                >
                  Financial Details
                </h4>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '400',
                        color: '#94a3b8',
                        marginBottom: '8px',
                      }}
                    >
                      Amount (£)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        backgroundColor: '#fefefe',
                        boxSizing: 'border-box',
                        color: '#64748b',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '400',
                        color: '#94a3b8',
                        marginBottom: '8px',
                      }}
                    >
                      Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        backgroundColor: '#fefefe',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage:
                          'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '14px',
                        paddingRight: '36px',
                        color: '#64748b',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annually">Annually</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '32px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155',
                    marginBottom: '8px',
                  }}
                >
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional information..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    backgroundColor: '#fefefe',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingTop: '24px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <ChevronLeft size={18} strokeWidth={2} />
                  Back
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '500',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      color: '#64748b',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !name}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: loading || !name ? 'not-allowed' : 'pointer',
                      border: 'none',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontFamily: 'inherit',
                      opacity: loading || !name ? 0.5 : 1,
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Record'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 5: Success Screen */}
          {currentStep === 5 && createdRecordData && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle
                size={64}
                strokeWidth={1.5}
                style={{ color: '#10b981', marginBottom: '24px' }}
              />
              <h3
                style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '16px',
                }}
              >
                Record Created Successfully
              </h3>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '32px',
                  textAlign: 'left',
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: '500',
                    }}
                  >
                    Domain:
                  </span>
                  <span
                    style={{
                      fontSize: '15px',
                      color: '#0f172a',
                      fontWeight: '600',
                      marginLeft: '8px',
                    }}
                  >
                    {DOMAINS.find((d) => d.value === selectedDomain)?.label}
                  </span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: '500',
                    }}
                  >
                    Record Type:
                  </span>
                  <span
                    style={{
                      fontSize: '15px',
                      color: '#0f172a',
                      fontWeight: '600',
                      marginLeft: '8px',
                    }}
                  >
                    {selectedRecordType}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: '500',
                    }}
                  >
                    Record Name:
                  </span>
                  <span
                    style={{
                      fontSize: '15px',
                      color: '#0f172a',
                      fontWeight: '600',
                      marginLeft: '8px',
                    }}
                  >
                    {createdRecordData.record.name}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <button
                  onClick={handleViewRecord}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  View Record
                  <ExternalLink size={18} strokeWidth={2} />
                </button>
                <button
                  onClick={handleCreateAnother}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontFamily: 'inherit',
                  }}
                >
                  Create Another
                </button>
                <button
                  onClick={handleClose}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontFamily: 'inherit',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
