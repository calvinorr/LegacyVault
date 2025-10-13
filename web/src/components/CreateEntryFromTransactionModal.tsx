import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';
import { useRecordTypes } from "../hooks/useRecordTypes";

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

// Domain configuration - values MUST match backend RecordType.js VALID_DOMAINS
const DOMAINS = [
  { value: "Property", label: "Property", description: "Utilities, Council Tax, Rent/Mortgage", apiPath: "property" },
  { value: "Vehicle", label: "Vehicles", description: "Car Insurance, MOT, Vehicle Tax", apiPath: "vehicles" },
  { value: "Finance", label: "Finance", description: "Bank Accounts, Loans, Credit Cards", apiPath: "finance" },
  { value: "Employment", label: "Employment", description: "Payroll, Pensions, Benefits", apiPath: "employment" },
  { value: "Government", label: "Government", description: "Tax, TV Licence, Passports", apiPath: "government" },
  { value: "Insurance", label: "Insurance", description: "Life, Health, Home Insurance", apiPath: "insurance" },
  { value: "Legal", label: "Legal", description: "Solicitors, Legal Services", apiPath: "legal" },
  { value: "Services", label: "Services", description: "Subscriptions, Broadband, Mobile", apiPath: "services" },
];

// Smart domain suggestion based on transaction description
// Returns capitalized domain names to match RecordType.js VALID_DOMAINS
function suggestDomain(description: string): string {
  const desc = description.toLowerCase();

  // Property/Utilities
  if (desc.includes('gas') || desc.includes('electric') || desc.includes('water') ||
      desc.includes('council tax') || desc.includes('rent') || desc.includes('mortgage')) {
    return 'Property';
  }

  // Vehicles
  if (desc.includes('car') || desc.includes('vehicle') || desc.includes('mot') ||
      desc.includes('insurance') && (desc.includes('car') || desc.includes('motor'))) {
    return 'Vehicle';
  }

  // Services/Subscriptions
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('amazon') ||
      desc.includes('broadband') || desc.includes('mobile') || desc.includes('phone') ||
      desc.includes('sky') || desc.includes('virgin') || desc.includes('bt ')) {
    return 'Services';
  }

  // Government
  if (desc.includes('tv licence') || desc.includes('hmrc') || desc.includes('dvla') ||
      desc.includes('passport')) {
    return 'Government';
  }

  // Insurance (general)
  if (desc.includes('insurance') || desc.includes('policy')) {
    return 'Insurance';
  }

  // Finance (default for payments/transfers)
  return 'Finance';
}

export default function CreateEntryFromTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  sessionId,
  transactionIndex,
}: CreateEntryFromTransactionModalProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedRecordType, setSelectedRecordType] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
  const [monthlyAmount, setMonthlyAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline record type creation
  const [showAddRecordType, setShowAddRecordType] = useState(false);
  const [newRecordTypeName, setNewRecordTypeName] = useState("");
  const [creatingRecordType, setCreatingRecordType] = useState(false);
  const [recordTypeError, setRecordTypeError] = useState<string | null>(null);

  // Pattern enhancement state
  const [patternData, setPatternData] = useState<any>(null);
  const [loadingPattern, setLoadingPattern] = useState(false);
  const [rememberPattern, setRememberPattern] = useState(false);

  const queryClient = useQueryClient();
  const { recordTypes, loading: recordTypesLoading, addRecordType } = useRecordTypes(selectedDomain);

  // Load pattern data if pattern is detected
  useEffect(() => {
    const loadPatternData = async () => {
      if (transaction && isOpen && transaction.patternMatched && transaction.patternId) {
        try {
          setLoadingPattern(true);
          const response = await fetch(`/api/patterns/${transaction.patternId}/transactions`, {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            setPatternData(data.pattern);

            // Pre-populate from pattern if confidence >= 75%
            if (transaction.patternConfidence && transaction.patternConfidence >= 0.75) {
              if (data.pattern.suggestedDomain) {
                setSelectedDomain(data.pattern.suggestedDomain.charAt(0).toUpperCase() + data.pattern.suggestedDomain.slice(1));
              }
              if (data.pattern.suggestedRecordType) {
                setSelectedRecordType(data.pattern.suggestedRecordType);
              }
              setProvider(data.pattern.payee || '');
              setName(`${data.pattern.payee || ''} Payment`);
              setMonthlyAmount(Math.abs(data.pattern.averageAmount || transaction.amount).toFixed(2));
            }
          }
        } catch (err) {
          console.error('Failed to load pattern data:', err);
        } finally {
          setLoadingPattern(false);
        }
      }
    };

    loadPatternData();
  }, [transaction, isOpen]);

  // Auto-populate form when transaction changes
  useEffect(() => {
    if (transaction && isOpen) {
      // Only auto-populate if pattern didn't already populate
      if (!transaction.patternMatched || (transaction.patternConfidence && transaction.patternConfidence < 0.75)) {
        // Suggest domain
        const suggested = suggestDomain(transaction.description);
        setSelectedDomain(suggested);

        // Extract provider from description
        const cleanDesc = transaction.description
          .replace(/PAYMENT|DD|DIRECT DEBIT|CARD|ONLINE|TO /gi, '')
          .trim();
        const words = cleanDesc.split(' ');
        const extractedProvider = words.length >= 2 ? words.slice(0, 2).join(' ') : words[0];

        setProvider(extractedProvider || cleanDesc);
        setName(`${extractedProvider || cleanDesc} Payment`);
        setMonthlyAmount(Math.abs(transaction.amount).toFixed(2));
      }

      // Always set notes
      setNotes(`Auto-generated from bank transaction:\n${transaction.originalText}\nDate: ${transaction.date}`);
    }
  }, [transaction, isOpen]);

  // Reset selected record type when domain changes
  useEffect(() => {
    setSelectedRecordType("");
    setShowAddRecordType(false);
    setNewRecordTypeName("");
    setRecordTypeError(null);
  }, [selectedDomain]);

  // Handle inline record type creation
  const handleCreateRecordType = async () => {
    setRecordTypeError(null);

    // Validate name
    const trimmedName = newRecordTypeName.trim();
    if (!trimmedName) {
      setRecordTypeError("Record type name cannot be empty");
      return;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = recordTypes.some(
      rt => rt.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setRecordTypeError("A record type with this name already exists");
      return;
    }

    try {
      setCreatingRecordType(true);
      const newRecordType = await addRecordType({
        name: trimmedName,
        domain: selectedDomain,
      });

      // Auto-select the newly created record type
      setSelectedRecordType(newRecordType.name);

      // Reset inline form
      setShowAddRecordType(false);
      setNewRecordTypeName("");
      setRecordTypeError(null);
    } catch (err: any) {
      setRecordTypeError(err.message || "Failed to create record type");
    } finally {
      setCreatingRecordType(false);
    }
  };

  // Handle record type dropdown change
  const handleRecordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "__ADD_NEW__") {
      setShowAddRecordType(true);
      setSelectedRecordType("");
    } else {
      setSelectedRecordType(value);
      setShowAddRecordType(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!selectedDomain) {
        throw new Error("Please select a domain");
      }

      // Build payload based on domain
      const payload: any = {
        name,
        priority: "Standard",
        notes,
      };

      // Add recordType if selected (user-defined record type from Settings)
      if (selectedRecordType) {
        payload.recordType = selectedRecordType;
      }

      // Add domain-specific required fields with defaults
      // Each domain model has specific required fields that must be populated
      switch (selectedDomain) {
        case 'Finance':
          // FinanceRecord requires accountType
          payload.accountType = selectedRecordType || 'other'; // Use recordType or default to 'other'
          payload.institution = provider || 'Unknown';
          if (monthlyAmount) {
            payload.balance = parseFloat(monthlyAmount);
          }
          break;

        case 'Property':
          // PropertyRecord requires recordType
          payload.recordType = selectedRecordType || 'Other';
          payload.provider = provider;
          if (monthlyAmount) {
            payload.monthlyAmount = parseFloat(monthlyAmount);
          }
          break;

        case 'Vehicle':
          // VehicleRecord requires recordType
          payload.recordType = selectedRecordType || 'Other';
          payload.name = name;
          break;

        case 'Insurance':
          // InsuranceRecord requires policyType (not recordType)
          payload.policyType = selectedRecordType || 'other';
          payload.provider = provider;
          if (monthlyAmount) {
            payload.premium = parseFloat(monthlyAmount);
          }
          break;

        case 'Services':
          // ServicesRecord requires recordType (user-defined type from Settings)
          payload.recordType = selectedRecordType || 'Subscription';
          payload.serviceProvider = provider;
          if (monthlyAmount) {
            payload.monthlyFee = parseFloat(monthlyAmount);
          }
          break;

        case 'Government':
          // GovernmentRecord requires recordType
          payload.recordType = selectedRecordType || 'Other';
          payload.issuingAuthority = provider || 'Government';
          break;

        case 'Employment':
          // EmploymentRecord requires recordType
          payload.recordType = selectedRecordType || 'Employment';
          payload.employer = provider || 'Employer';
          break;

        case 'Legal':
          // LegalRecord requires documentType (not recordType)
          payload.documentType = selectedRecordType || 'other';
          payload.solicitorName = provider;
          break;

        default:
          // Generic fallback
          if (provider) {
            payload.provider = provider;
          }
          if (monthlyAmount) {
            payload.amount = parseFloat(monthlyAmount);
          }
      }

      // Add import metadata
      payload.import_metadata = {
        source: 'bank_import',
        created_from_transaction: true,
        original_description: transaction?.description,
        transaction_amount: transaction?.amount,
        transaction_date: transaction?.date,
        import_date: new Date().toISOString(),
      };

      // Get the API path for this domain (lowercase for API endpoints)
      const domainConfig = DOMAINS.find(d => d.value === selectedDomain);
      const apiPath = domainConfig?.apiPath || selectedDomain.toLowerCase();

      // Create record via domain-specific API
      const response = await fetch(`/api/domains/${apiPath}/records`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create ${selectedDomain} record`);
      }

      const createdRecord = await response.json();

      // Mark transaction as processed if we have session info
      if (sessionId && transactionIndex !== undefined) {
        try {
          await fetch(`/api/import/sessions/${sessionId}/transactions/${transactionIndex}/mark-processed`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recordId: createdRecord._id,
              domain: selectedDomain,
            }),
          });
        } catch (markError) {
          console.error('Failed to mark transaction as processed:', markError);
          // Don't fail the whole operation if this fails
        }
      }

      // Update pattern if rememberPattern is checked
      if (rememberPattern && patternData && transaction.patternId) {
        try {
          await fetch(`/api/patterns/${transaction.patternId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              autoSuggest: true,
              userConfirmed: true,
              suggestionAccepted: true,
              suggestedDomain: selectedDomain.toLowerCase(),
              suggestedRecordType: selectedRecordType,
            }),
          });
        } catch (patternError) {
          console.error('Failed to update pattern:', patternError);
          // Don't fail the whole operation if pattern update fails
        }
      }

      // Invalidate domain stats cache to refresh home page counts
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });

      // Invalidate import session cache to refresh transaction list badges
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['import-session', sessionId] });
        queryClient.invalidateQueries({ queryKey: ['import-session-transactions', sessionId] });
      }

      // Reset form and close modal
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create record");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDomain("");
    setSelectedRecordType("");
    setName("");
    setProvider("");
    setMonthlyAmount("");
    setNotes("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !transaction) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow:
            "0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.05)",
          border: "1px solid #f1f5f9",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "32px 32px 24px 32px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.025em",
              }}
            >
              Create Domain Record
            </h2>
            <button
              onClick={handleClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                padding: "8px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Pattern Indicator Banner */}
          {transaction.patternMatched && transaction.patternConfidence && transaction.patternConfidence >= 0.75 && patternData && (
            <div
              style={{
                backgroundColor: transaction.patternConfidence >= 0.85 ? '#dcfce7' : '#fef3c7',
                border: `1px solid ${transaction.patternConfidence >= 0.85 ? '#bbf7d0' : '#fde68a'}`,
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <Sparkles size={18} color={transaction.patternConfidence >= 0.85 ? '#15803d' : '#d97706'} strokeWidth={2} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                  🔄 Recurring Pattern Detected - {Math.round(transaction.patternConfidence * 100)}% confidence
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  Found {patternData.occurrences} similar transactions.
                  {patternData.frequency && ` Frequency: ${patternData.frequency}.`}
                  {patternData.suggestedDomain && patternData.suggestedRecordType && ` Suggested: ${patternData.suggestedDomain} > ${patternData.suggestedRecordType}.`}
                </div>
              </div>
            </div>
          )}

          {/* Transaction Preview */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #f1f5f9",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "6px",
                fontWeight: "500",
              }}
            >
              Transaction:
            </div>
            <div style={{ fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>
              {transaction.description} • £{Math.abs(transaction.amount).toFixed(2)}
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {new Date(transaction.date).toLocaleDateString('en-GB')} • {transaction.originalText}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "24px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* Domain Selection */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              <Sparkles size={16} strokeWidth={2} color="#f59e0b" />
              Domain *
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "15px",
                fontFamily: "inherit",
                backgroundColor: "#fefefe",
                cursor: "pointer",
                appearance: "none",
                backgroundImage:
                  "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 16px center",
                backgroundSize: "16px",
                paddingRight: "48px",
              }}
            >
              <option value="">Select Domain</option>
              {DOMAINS.map((domain) => (
                <option key={domain.value} value={domain.value}>
                  {domain.label} - {domain.description}
                </option>
              ))}
            </select>
          </div>

          {/* Record Type Selection (if domain selected) */}
          {selectedDomain && (
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                Record Type {recordTypesLoading && "(Loading...)"}
              </label>
              <select
                value={showAddRecordType ? "__ADD_NEW__" : selectedRecordType}
                onChange={handleRecordTypeChange}
                disabled={recordTypesLoading}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "15px",
                  fontFamily: "inherit",
                  backgroundColor: "#fefefe",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                  backgroundSize: "16px",
                  paddingRight: "48px",
                }}
              >
                <option value="">Select Record Type (Optional)</option>
                {recordTypes.map((rt) => (
                  <option key={rt._id} value={rt.name}>
                    {rt.name}
                  </option>
                ))}
                {recordTypes.length > 0 && (
                  <option disabled style={{ borderTop: "1px solid #e2e8f0" }}>
                    ─────────────────
                  </option>
                )}
                <option value="__ADD_NEW__">+ Add New Record Type</option>
              </select>

              {/* Inline Record Type Creation Form */}
              {showAddRecordType && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "16px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      New Record Type Name
                    </label>
                    <input
                      type="text"
                      value={newRecordTypeName}
                      onChange={(e) => setNewRecordTypeName(e.target.value)}
                      placeholder="e.g., Water Bill"
                      disabled={creatingRecordType}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateRecordType();
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "14px",
                        fontFamily: "inherit",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                      }}
                      autoFocus
                    />
                  </div>

                  {recordTypeError && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#dc2626",
                        marginBottom: "12px",
                        padding: "8px",
                        backgroundColor: "#fef2f2",
                        borderRadius: "6px",
                        border: "1px solid #fecaca",
                      }}
                    >
                      {recordTypeError}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddRecordType(false);
                        setNewRecordTypeName("");
                        setRecordTypeError(null);
                      }}
                      disabled={creatingRecordType}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: creatingRecordType ? "not-allowed" : "pointer",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#ffffff",
                        color: "#64748b",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateRecordType}
                      disabled={creatingRecordType || !newRecordTypeName.trim()}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: creatingRecordType || !newRecordTypeName.trim() ? "not-allowed" : "pointer",
                        border: "none",
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        fontFamily: "inherit",
                        opacity: creatingRecordType || !newRecordTypeName.trim() ? 0.5 : 1,
                      }}
                    >
                      {creatingRecordType ? "Creating..." : "Create"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., British Gas Energy Bill"
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "15px",
                fontFamily: "inherit",
                backgroundColor: "#fefefe",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Provider */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              Provider
            </label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g., British Gas"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "15px",
                fontFamily: "inherit",
                backgroundColor: "#fefefe",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Monthly Amount */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              Amount (£)
            </label>
            <input
              type="number"
              step="0.01"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(e.target.value)}
              placeholder="85.50"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "15px",
                fontFamily: "inherit",
                backgroundColor: "#fefefe",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "8px",
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
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "15px",
                fontFamily: "inherit",
                backgroundColor: "#fefefe",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          {/* Remember Pattern Checkbox */}
          {transaction.patternMatched && transaction.patternConfidence && transaction.patternConfidence >= 0.75 && patternData && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9',
                borderRadius: '12px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberPattern}
                  onChange={(e) => setRememberPattern(e.target.checked)}
                  style={{
                    marginTop: '2px',
                    cursor: 'pointer',
                  }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', marginBottom: '4px' }}>
                    Remember this pattern for future imports
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                    Future transactions from "{patternData.payee}" will be auto-suggested with these settings
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              paddingTop: "24px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "500",
                cursor: "pointer",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                color: "#64748b",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDomain || !name}
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: loading || !selectedDomain || !name ? "not-allowed" : "pointer",
                border: "none",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontFamily: "inherit",
                opacity: loading || !selectedDomain || !name ? 0.5 : 1,
              }}
            >
              {loading ? "Creating..." : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
