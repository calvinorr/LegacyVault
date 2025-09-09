import React, { useState } from "react";
import { createEntry } from "../api";

interface AddPensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  provider: string;
  accountDetails: {
    pensionType: string;
    policyNumber: string;
    niNumber: string;
    employerName: string;
    contributionRate: string;
    employerContribution: string;
    annualAllowance: string;
    pensionAge: string;
    transferValue: string;
    onlineAccountUrl: string;
    category: string;
  };
  notes: string;
  confidential: boolean;
  // Categorization fields
  category: string;
  subCategory: string;
  supplier: string;
  tags: string[];
}

const initialFormData: FormData = {
  title: "",
  provider: "",
  accountDetails: {
    pensionType: "",
    policyNumber: "",
    niNumber: "",
    employerName: "",
    contributionRate: "",
    employerContribution: "",
    annualAllowance: "",
    pensionAge: "",
    transferValue: "",
    onlineAccountUrl: "",
    category: "pension",
  },
  notes: "",
  confidential: true,
  // Categorization fields
  category: "Pensions",
  subCategory: "",
  supplier: "",
  tags: [],
};

export default function AddPensionModal({
  isOpen,
  onClose,
  onSuccess,
}: AddPensionModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        type: "pension" as const,
        provider: formData.provider,
        accountDetails: formData.accountDetails,
        notes: formData.notes,
        confidential: formData.confidential,
        // Categorization fields
        category: formData.category,
        subCategory: formData.subCategory,
        supplier: formData.supplier,
        tags: formData.tags,
      };

      await createEntry(payload);

      // Reset form and close modal
      setFormData(initialFormData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create pension account");
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

  const getPensionTypeOptions = () => [
    "State Pension",
    "Workplace Pension",
    "Personal Pension",
    "SIPP (Self-Invested Personal Pension)",
    "Stakeholder Pension",
    "Final Salary Pension (DB)",
    "Career Average Pension (DB)",
    "Group Personal Pension",
    "Executive Pension Plan",
    "Retirement Annuity Contract",
    "Other",
  ];

  const getPensionAgeOptions = () => [
    "55",
    "57",
    "60",
    "65",
    "66",
    "67",
    "68",
    "Other",
  ];

  const getCategoryOptions = () => [
    "Banking",
    "Insurance",
    "Utilities",
    "Subscriptions",
    "Investments",
    "Property",
    "Pensions",
    "Other",
  ];

  const getSubCategoryOptions = (category: string) => {
    switch (category) {
      case "Pensions":
        return [
          "State Pension",
          "Workplace Pension",
          "Personal Pension",
          "SIPP",
          "Final Salary",
        ];
      case "Investments":
        return ["ISA", "Stocks & Shares", "Bonds", "Funds", "Premium Bonds"];
      default:
        return [];
    }
  };

  const getCommonProviders = () => [
    "Legal & General",
    "Aviva",
    "Scottish Widows",
    "Prudential",
    "Standard Life",
    "Aegon",
    "Hargreaves Lansdown",
    "AJ Bell",
    "Fidelity",
    "Vanguard",
    "Other",
  ];

  if (!isOpen) return null;

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
    maxWidth: "600px",
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
              Add Pension
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
                Pension Name *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Company Workplace Pension"
                required
                style={inputStyle}
              />
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
                  Provider/Administrator *
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) =>
                    handleInputChange("provider", e.target.value)
                  }
                  required
                  style={selectStyle}
                >
                  <option value="">Select provider</option>
                  {getCommonProviders().map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
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
                  Pension Type *
                </label>
                <select
                  value={formData.accountDetails.pensionType}
                  onChange={(e) =>
                    handleAccountDetailChange("pensionType", e.target.value)
                  }
                  required
                  style={selectStyle}
                >
                  <option value="">Select pension type</option>
                  {getPensionTypeOptions().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
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
                  Policy/Scheme Number
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.policyNumber}
                  onChange={(e) =>
                    handleAccountDetailChange("policyNumber", e.target.value)
                  }
                  placeholder="Policy or scheme number"
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
                  National Insurance Number
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.niNumber}
                  onChange={(e) =>
                    handleAccountDetailChange("niNumber", e.target.value)
                  }
                  placeholder="XX 12 34 56 A"
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
                Employer Name
              </label>
              <input
                type="text"
                value={formData.accountDetails.employerName}
                onChange={(e) =>
                  handleAccountDetailChange("employerName", e.target.value)
                }
                placeholder="Current or former employer"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
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
                  Your Contribution %
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.contributionRate}
                  onChange={(e) =>
                    handleAccountDetailChange(
                      "contributionRate",
                      e.target.value
                    )
                  }
                  placeholder="5%"
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
                  Employer Contribution %
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.employerContribution}
                  onChange={(e) =>
                    handleAccountDetailChange(
                      "employerContribution",
                      e.target.value
                    )
                  }
                  placeholder="3%"
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
                  Pension Age
                </label>
                <select
                  value={formData.accountDetails.pensionAge}
                  onChange={(e) =>
                    handleAccountDetailChange("pensionAge", e.target.value)
                  }
                  style={selectStyle}
                >
                  <option value="">Select age</option>
                  {getPensionAgeOptions().map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>
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
                  Annual Allowance
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.annualAllowance}
                  onChange={(e) =>
                    handleAccountDetailChange("annualAllowance", e.target.value)
                  }
                  placeholder="£40,000"
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
                  Transfer Value
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.transferValue}
                  onChange={(e) =>
                    handleAccountDetailChange("transferValue", e.target.value)
                  }
                  placeholder="Current pot value"
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
                Online Account URL
              </label>
              <input
                type="url"
                value={formData.accountDetails.onlineAccountUrl}
                onChange={(e) =>
                  handleAccountDetailChange("onlineAccountUrl", e.target.value)
                }
                placeholder="https://mypension.provider.co.uk"
                style={inputStyle}
              />
            </div>

            {/* Categorization Section */}
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "16px",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  margin: "0 0 16px 0",
                }}
              >
                Categorization
              </h3>

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
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    style={selectStyle}
                  >
                    {getCategoryOptions().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
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
                    Sub-Category
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) =>
                      handleInputChange("subCategory", e.target.value)
                    }
                    style={selectStyle}
                  >
                    <option value="">Select sub-category</option>
                    {getSubCategoryOptions(formData.category).map(
                      (subCategory) => (
                        <option key={subCategory} value={subCategory}>
                          {subCategory}
                        </option>
                      )
                    )}
                  </select>
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
                  Provider Group
                </label>
                <select
                  value={formData.supplier}
                  onChange={(e) =>
                    handleInputChange("supplier", e.target.value)
                  }
                  style={selectStyle}
                >
                  <option value="">Select provider group</option>
                  {getCommonProviders().map((supplier) => (
                    <option key={supplier} value={supplier}>
                      {supplier}
                    </option>
                  ))}
                </select>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  Group pensions by the same provider for reporting
                </p>
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
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Benefit statements, contact details, important dates..."
                style={textareaStyle}
              />
            </div>

            <div style={checkboxContainerStyle}>
              <input
                type="checkbox"
                id="confidential-pension"
                checked={formData.confidential}
                onChange={(e) =>
                  handleInputChange("confidential", e.target.checked)
                }
                style={{ width: "16px", height: "16px" }}
              />
              <label
                htmlFor="confidential-pension"
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
                {loading ? "Creating..." : "Create Pension"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
