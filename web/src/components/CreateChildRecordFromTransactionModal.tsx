import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';
import { useParentEntities } from "../hooks/useParentEntities";
import { DomainType } from "../services/api/parentEntities";

interface Transaction {
  _id: string;
  date: string;
  description: string;
  amount: number;
  originalText: string;
  recordCreated?: boolean;
}

interface CreateChildRecordFromTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction | null;
  sessionId?: string;
}

// Epic 6 Parent Entity domains
const DOMAINS = [
  { value: "Vehicle", label: "Vehicles", apiPath: "vehicles" },
  { value: "Property", label: "Properties", apiPath: "properties" },
  { value: "Employment", label: "Employment", apiPath: "employments" },
  { value: "Services", label: "Services", apiPath: "services" },
  { value: "Finance", label: "Finance", apiPath: "finance" },
];

// Child Record Types (Epic 6 continuity-focused)
const CHILD_RECORD_TYPES = [
  { value: "Finance", label: "Finance", description: "Loans, payments, subscriptions" },
  { value: "Insurance", label: "Insurance", description: "Insurance policies" },
  { value: "ServiceHistory", label: "Service History", description: "Maintenance, repairs" },
  { value: "Government", label: "Government", description: "Tax, licenses" },
  { value: "Contact", label: "Contact", description: "Key contact person" },
  { value: "Pension", label: "Pension", description: "Pension schemes" },
];

// Smart domain/type suggestion
function suggestDomainAndType(description: string): { domain: string; recordType: string } {
  const desc = description.toLowerCase();

  if (desc.includes('car') || desc.includes('vehicle')) {
    if (desc.includes('insurance')) return { domain: 'Vehicle', recordType: 'Insurance' };
    if (desc.includes('finance') || desc.includes('loan')) return { domain: 'Vehicle', recordType: 'Finance' };
    if (desc.includes('service') || desc.includes('mot')) return { domain: 'Vehicle', recordType: 'ServiceHistory' };
    return { domain: 'Vehicle', recordType: 'Finance' };
  }

  if (desc.includes('gas') || desc.includes('electric') || desc.includes('water') ||
      desc.includes('council tax') || desc.includes('mortgage') || desc.includes('rent')) {
    return { domain: 'Property', recordType: 'Finance' };
  }

  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('broadband') ||
      desc.includes('phone') || desc.includes('mobile')) {
    return { domain: 'Services', recordType: 'Finance' };
  }

  return { domain: 'Finance', recordType: 'Finance' };
}

export default function CreateChildRecordFromTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  sessionId,
}: CreateChildRecordFromTransactionModalProps) {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedRecordType, setSelectedRecordType] = useState("");
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Get API path for selected domain
  const selectedDomainConfig = DOMAINS.find(d => d.value === selectedDomain);
  const apiPath = selectedDomainConfig?.apiPath as DomainType;

  // Load parent entities for selected domain
  const { data: parentEntitiesData, isLoading: parentEntitiesLoading } = useParentEntities(
    apiPath,
    { limit: 100 }
  );

  const parentEntities = parentEntitiesData?.entities || [];

  // Auto-populate on transaction change
  useEffect(() => {
    if (transaction && isOpen) {
      const suggested = suggestDomainAndType(transaction.description);
      setSelectedDomain(suggested.domain);
      setSelectedRecordType(suggested.recordType);

      const cleanDesc = transaction.description.replace(/PAYMENT|DD|DIRECT DEBIT|CARD|ONLINE|TO /gi, '').trim();
      const words = cleanDesc.split(' ');
      const extractedProvider = words.length >= 2 ? words.slice(0, 2).join(' ') : words[0];

      setProvider(extractedProvider || cleanDesc);
      setName(`${extractedProvider || cleanDesc} Payment`);
      setAmount(Math.abs(transaction.amount).toFixed(2));
      setNotes(`From transaction: ${transaction.originalText}\nDate: ${new Date(transaction.date).toLocaleDateString('en-GB')}`);
    }
  }, [transaction, isOpen]);

  // Reset when domain changes
  useEffect(() => {
    setSelectedParentId("");
  }, [selectedDomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!selectedDomain) throw new Error("Please select a domain");
      if (!selectedParentId) throw new Error("Please select which " + selectedDomain.toLowerCase() + " this belongs to");
      if (!selectedRecordType) throw new Error("Please select a record type");

      const payload: any = {
        recordType: selectedRecordType,
        name,
        provider,
        notes,
        status: "active",
      };

      if (amount) payload.amount = parseFloat(amount);
      if (frequency) payload.frequency = frequency;
      if (phone) payload.phone = phone;
      if (email) payload.email = email;

      payload.metadata = {
        source: 'bank_import',
        created_from_transaction: true,
        original_description: transaction?.description,
        transaction_amount: transaction?.amount,
        transaction_date: transaction?.date,
      };

      const domainConfig = DOMAINS.find(d => d.value === selectedDomain);
      const apiPath = domainConfig?.apiPath || selectedDomain.toLowerCase();

      const response = await fetch(`/api/v2/${apiPath}/${selectedParentId}/records`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create record');
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
        } catch (err) {
          console.error('Failed to update transaction status:', err);
        }
      }

      // Invalidate caches - use prefix matching to catch all variants
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Invalidate ALL parent-entities queries for this domain (regardless of options)
      queryClient.invalidateQueries({
        queryKey: ['parent-entities', apiPath],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ queryKey: ['parent-entity', apiPath, selectedParentId] });
      queryClient.invalidateQueries({ queryKey: ['child-records', apiPath, selectedParentId] });
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['import-session', sessionId] });
      }

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
    setSelectedParentId("");
    setSelectedRecordType("");
    setName("");
    setProvider("");
    setAmount("");
    setFrequency("monthly");
    setPhone("");
    setEmail("");
    setNotes("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !transaction) return null;

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #0f172a",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#fefefe",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500" as const,
    color: "#334155",
    marginBottom: "6px",
  };

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
        fontFamily: "Inter, sans-serif",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          border: "1px solid #0f172a",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "28px 28px 20px 28px", borderBottom: "1px solid #0f172a" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#0f172a", margin: 0 }}>
              Create Record from Transaction
            </h2>
            <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#1e293b", padding: "6px" }}>
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Transaction Preview */}
          <div style={{ backgroundColor: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #0f172a" }}>
            <div style={{ fontSize: "12px", color: "#1e293b", marginBottom: "4px" }}>Transaction:</div>
            <div style={{ fontWeight: "600", color: "#0f172a", marginBottom: "2px" }}>
              {transaction.description} • £{Math.abs(transaction.amount).toFixed(2)}
            </div>
            <div style={{ fontSize: "11px", color: "#334155" }}>
              {new Date(transaction.date).toLocaleDateString('en-GB')}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "28px", overflowY: "auto", flex: 1 }}>
          {error && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px" }}>
              {error}
            </div>
          )}

          {/* Step 1: Domain */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              <Sparkles size={14} style={{ display: "inline", marginRight: "6px", color: "#f59e0b" }} />
              Domain *
            </label>
            <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} required style={inputStyle}>
              <option value="">Select Domain</option>
              {DOMAINS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Parent Entity */}
          {selectedDomain && (
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Which {selectedDomain}? *</label>
              {parentEntitiesLoading ? (
                <div style={{ ...inputStyle, color: "#334155" }}>Loading...</div>
              ) : parentEntities.length === 0 ? (
                <div style={{ ...inputStyle, color: "#dc2626", backgroundColor: "#fef2f2" }}>
                  No {selectedDomain.toLowerCase()}s found. Create one first in the {selectedDomain} page.
                </div>
              ) : (
                <select value={selectedParentId} onChange={(e) => setSelectedParentId(e.target.value)} required style={inputStyle}>
                  <option value="">Select {selectedDomain}</option>
                  {parentEntities.map((p: any) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Step 3: Record Type */}
          {selectedParentId && (
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Record Type *</label>
              <select value={selectedRecordType} onChange={(e) => setSelectedRecordType(e.target.value)} required style={inputStyle}>
                <option value="">Select Type</option>
                {CHILD_RECORD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label} - {t.description}</option>
                ))}
              </select>
            </div>
          )}

          {/* Fields */}
          {selectedRecordType && (
            <>
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} placeholder="e.g., British Gas Bill" />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Provider</label>
                <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} style={inputStyle} placeholder="e.g., British Gas" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "18px" }}>
                <div>
                  <label style={labelStyle}>Amount (£)</label>
                  <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Frequency</label>
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={inputStyle}>
                    <option value="one-time">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" as const }} />
              </div>
            </>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "20px", borderTop: "1px solid #0f172a" }}>
            <button type="button" onClick={handleClose} disabled={loading} style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer", border: "1px solid #0f172a", backgroundColor: "#ffffff", color: "#1e293b", fontFamily: "inherit" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !selectedDomain || !selectedParentId || !selectedRecordType || !name} style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: loading || !name ? "not-allowed" : "pointer", border: "none", backgroundColor: "#0f172a", color: "#ffffff", fontFamily: "inherit", opacity: loading || !name ? 0.5 : 1 }}>
              {loading ? "Creating..." : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
