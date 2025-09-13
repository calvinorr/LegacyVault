import React, { useState, useEffect } from "react";
import { updateEntry, Entry } from "../api";

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: Entry | null;
}

interface FormData {
  title: string;
  provider: string;
  accountDetails: {
    accountType: string;
    accountNumber: string;
    sortCode: string;
    branch: string;
    category: string;
  };
  notes: string;
  confidential: boolean;
}

export default function EditAccountModal({
  isOpen,
  onClose,
  onSuccess,
  account,
}: EditAccountModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    provider: "",
    accountDetails: {
      accountType: "",
      accountNumber: "",
      sortCode: "",
      branch: "",
      category: "",
    },
    notes: "",
    confidential: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account && isOpen) {
      setFormData({
        title: account.title || "",
        provider: account.provider || "",
        accountDetails: {
          accountType: account.accountDetails?.accountType || "",
          accountNumber: account.accountDetails?.accountNumber || "",
          sortCode:
            account.accountDetails?.sortCode ||
            account.accountDetails?.routingNumber ||
            "",
          branch: account.accountDetails?.branch || "",
          category: account.accountDetails?.category || "",
        },
        notes: account.notes || "",
        confidential:
          account.confidential !== undefined ? account.confidential : true,
      });
      setError(null);
    } else if (!account || !isOpen) {
      // Reset form when modal is closed or no account is selected
      setFormData({
        title: "",
        provider: "",
        accountDetails: {
          accountType: "",
          accountNumber: "",
          sortCode: "",
          branch: "",
          category: "",
        },
        notes: "",
        confidential: true,
      });
      setError(null);
    }
  }, [account, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    setError(null);
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        provider: formData.provider,
        accountDetails: formData.accountDetails,
        notes: formData.notes,
        confidential: formData.confidential,
      };

      await updateEntry(account._id, payload);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAccountDetailChange = (
    field: keyof FormData["accountDetails"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      accountDetails: {
        ...prev.accountDetails,
        [field]: value,
      },
    }));
  };

  const getAccountTypeOptions = () => {
    const category = account?.accountDetails?.category || "account";
    switch (category) {
      case "account":
        return [
          "Current Account",
          "Savings Account",
          "Credit Card",
          "Overdraft",
          "Mortgage",
          "Personal Loan",
          "Business Account",
        ];
      case "investment":
        return [
          "ISA",
          "SIPP",
          "Pension",
          "Investment Account",
          "Stocks & Shares ISA",
          "Premium Bonds",
        ];
      case "property":
        return [
          "Primary Residence",
          "Buy-to-Let Property",
          "Commercial Property",
          "Land",
        ];
      case "utility":
      case "bill":
        return [
          "Electricity",
          "Gas",
          "Water",
          "Council Tax",
          "Internet",
          "Mobile Phone",
          "TV Licence",
          "Insurance",
        ];
      default:
        return [
          "Current Account",
          "Savings Account",
          "Credit Card",
          "ISA",
          "Property",
          "Utility",
        ];
    }
  };

  if (!isOpen || !account) return null;

  const overlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  };

  const headerStyle = {
    padding: "24px 24px 0 24px",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "24px",
  };

  const contentStyle = {
    padding: "0 24px 24px 24px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "16px",
    marginBottom: "16px",
    boxSizing: "border-box" as const,
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "16px",
    paddingRight: "40px",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: "80px",
    resize: "vertical" as const,
    fontFamily: "inherit",
  };

  const buttonStyle = {
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "none",
    marginRight: "8px",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#3b82f6",
    color: "white",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "white",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
  };

  const checkboxContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "24px",
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#1a1a1a",
                margin: 0,
              }}
            >
              Edit Account
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#6b7280",
                padding: "4px",
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div style={contentStyle}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Account Name *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Chase Checking Account"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Bank/Building Society *
              </label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => handleInputChange("provider", e.target.value)}
                placeholder="e.g., Barclays, Nationwide"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Account Type
              </label>
              <select
                value={formData.accountDetails.accountType}
                onChange={(e) =>
                  handleAccountDetailChange("accountType", e.target.value)
                }
                style={selectStyle}
              >
                <option value="">Select account type</option>
                {getAccountTypeOptions().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "4px",
                  }}
                >
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.accountNumber}
                  onChange={(e) =>
                    handleAccountDetailChange("accountNumber", e.target.value)
                  }
                  placeholder="12345678"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "4px",
                  }}
                >
                  Sort Code
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.sortCode}
                  onChange={(e) =>
                    handleAccountDetailChange("sortCode", e.target.value)
                  }
                  placeholder="12-34-56"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Branch/Location
              </label>
              <input
                type="text"
                value={formData.accountDetails.branch}
                onChange={(e) =>
                  handleAccountDetailChange("branch", e.target.value)
                }
                placeholder="Branch name or location"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional information about this account..."
                style={textareaStyle}
              />
            </div>

            <div style={checkboxContainerStyle}>
              <input
                type="checkbox"
                id="confidential-edit"
                checked={formData.confidential}
                onChange={(e) =>
                  handleInputChange("confidential", e.target.checked)
                }
                style={{ width: "16px", height: "16px" }}
              />
              <label
                htmlFor="confidential-edit"
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Mark as confidential
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingTop: "16px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.provider}
                style={{
                  ...primaryButtonStyle,
                  opacity:
                    loading || !formData.title || !formData.provider ? 0.5 : 1,
                  cursor:
                    loading || !formData.title || !formData.provider
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
