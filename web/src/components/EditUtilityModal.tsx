import React, { useState, useEffect } from "react";
import { updateEntry, Entry } from "../api";

interface EditUtilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  utility: Entry | null;
}

interface FormData {
  title: string;
  provider: string;
  accountDetails: {
    utilityType: string;
    customerNumber: string;
    meterNumber: string;
    tariffType: string;
    paymentMethod: string;
    billingFrequency: string;
    emergencyNumber: string;
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

export default function EditUtilityModal({
  isOpen,
  onClose,
  onSuccess,
  utility,
}: EditUtilityModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    provider: "",
    accountDetails: {
      utilityType: "",
      customerNumber: "",
      meterNumber: "",
      tariffType: "",
      paymentMethod: "",
      billingFrequency: "Monthly",
      emergencyNumber: "",
      onlineAccountUrl: "",
      category: "utility",
    },
    notes: "",
    confidential: true,
    // Categorization fields
    category: "Utilities",
    subCategory: "",
    supplier: "",
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (utility && isOpen) {
      setFormData({
        title: utility.title || "",
        provider: utility.provider || "",
        accountDetails: {
          utilityType: utility.accountDetails?.utilityType || "",
          customerNumber: utility.accountDetails?.customerNumber || "",
          meterNumber: utility.accountDetails?.meterNumber || "",
          tariffType: utility.accountDetails?.tariffType || "",
          paymentMethod: utility.accountDetails?.paymentMethod || "",
          billingFrequency:
            utility.accountDetails?.billingFrequency || "Monthly",
          emergencyNumber: utility.accountDetails?.emergencyNumber || "",
          onlineAccountUrl: utility.accountDetails?.onlineAccountUrl || "",
          category: utility.accountDetails?.category || "utility",
        },
        notes: utility.notes || "",
        confidential:
          utility.confidential !== undefined ? utility.confidential : true,
        // Categorization fields
        category: (utility as any).category || "Utilities",
        subCategory: (utility as any).subCategory || "",
        supplier: (utility as any).supplier || "",
        tags: (utility as any).tags || [],
      });
      setError(null);
    }
  }, [utility, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utility) return;

    setError(null);
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
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

      await updateEntry(utility._id, payload);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update utility account");
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

  const getUtilityTypeOptions = () => [
    "Electricity",
    "Gas",
    "Water",
    "Council Tax",
    "Internet/Broadband",
    "Mobile Phone",
    "Landline Phone",
    "TV Licence",
    "Sky TV/Satellite",
    "Virgin Media",
    "BT Sport",
    "Home Insurance",
    "Contents Insurance",
    "Life Insurance",
    "Travel Insurance",
    "Car Insurance",
    "Motorbike Insurance",
    "Health/Medical Insurance",
    "Pet Insurance",
    "Gym Membership",
    "Netflix/Streaming",
    "Spotify/Music",
    "Amazon Prime",
    "Other Subscription",
    "Other",
  ];

  const getPaymentMethodOptions = () => [
    "Direct Debit",
    "Standing Order",
    "Monthly Payment",
    "Quarterly Payment",
    "Annual Payment",
    "Prepayment/Top-up",
    "Cash/Cheque",
  ];

  const getBillingFrequencyOptions = () => [
    "Monthly",
    "Quarterly",
    "Annually",
    "Bi-annually",
    "Weekly",
    "As Required",
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
      case "Insurance":
        return [
          "Home Insurance",
          "Car Insurance",
          "Life Insurance",
          "Travel Insurance",
          "Health Insurance",
        ];
      case "Utilities":
        return [
          "Energy",
          "Water",
          "Council Services",
          "Communications",
          "Entertainment",
        ];
      case "Subscriptions":
        return [
          "Streaming",
          "Software",
          "Fitness",
          "News & Media",
          "Cloud Storage",
        ];
      default:
        return [];
    }
  };

  const getCommonSuppliers = () => [
    "Sky",
    "British Gas",
    "EDF Energy",
    "E.ON",
    "Octopus Energy",
    "Ovo Energy",
    "SSE",
    "Scottish Power",
    "Thames Water",
    "Anglian Water",
    "United Utilities",
    "BT",
    "Virgin Media",
    "TalkTalk",
    "Plusnet",
    "Three",
    "O2",
    "EE",
    "Vodafone",
    "Aviva",
    "Direct Line",
    "Admiral",
    "Netflix",
    "Amazon",
    "Spotify",
    "Other",
  ];

  if (!isOpen || !utility) return null;

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
    width: "95%",
    maxWidth: "1200px",
    minWidth: "80vw",
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
              Edit Utility/Service
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
                Service Name *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., British Gas Electricity"
                required
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
                  Provider/Supplier *
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) =>
                    handleInputChange("provider", e.target.value)
                  }
                  placeholder="e.g., British Gas, EDF Energy"
                  required
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
                  Utility Type *
                </label>
                <select
                  value={formData.accountDetails.utilityType}
                  onChange={(e) =>
                    handleAccountDetailChange("utilityType", e.target.value)
                  }
                  required
                  style={selectStyle}
                >
                  <option value="">Select utility type</option>
                  {getUtilityTypeOptions().map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                  Customer Number
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.customerNumber}
                  onChange={(e) =>
                    handleAccountDetailChange("customerNumber", e.target.value)
                  }
                  placeholder="Account reference number"
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
                  Meter Number / Policy Number
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.meterNumber}
                  onChange={(e) =>
                    handleAccountDetailChange("meterNumber", e.target.value)
                  }
                  placeholder="Meter serial or policy number"
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
                  Tariff/Plan Type
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.tariffType}
                  onChange={(e) =>
                    handleAccountDetailChange("tariffType", e.target.value)
                  }
                  placeholder="e.g., Fixed Rate, Variable, Standard"
                  style={inputStyle}
                />
              </div>
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
                  Payment Method
                </label>
                <select
                  value={formData.accountDetails.paymentMethod}
                  onChange={(e) =>
                    handleAccountDetailChange("paymentMethod", e.target.value)
                  }
                  style={selectStyle}
                >
                  <option value="">Select payment method</option>
                  {getPaymentMethodOptions().map((method) => (
                    <option key={method} value={method}>
                      {method}
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
                  Billing Frequency
                </label>
                <select
                  value={formData.accountDetails.billingFrequency}
                  onChange={(e) =>
                    handleAccountDetailChange(
                      "billingFrequency",
                      e.target.value
                    )
                  }
                  style={selectStyle}
                >
                  {getBillingFrequencyOptions().map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequency}
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
                  Emergency Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.accountDetails.emergencyNumber}
                  onChange={(e) =>
                    handleAccountDetailChange("emergencyNumber", e.target.value)
                  }
                  placeholder="e.g., 0800 123 4567 (24hr emergency)"
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
                  Online Account URL
                </label>
                <input
                  type="url"
                  value={formData.accountDetails.onlineAccountUrl}
                  onChange={(e) =>
                    handleAccountDetailChange(
                      "onlineAccountUrl",
                      e.target.value
                    )
                  }
                  placeholder="https://myaccount.provider.co.uk"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Additional Information Section */}
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
                Additional Information
              </h3>

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
                  Supplier Group
                </label>
                <select
                  value={formData.supplier}
                  onChange={(e) =>
                    handleInputChange("supplier", e.target.value)
                  }
                  style={selectStyle}
                >
                  <option value="">Select supplier group (optional)</option>
                  {getCommonSuppliers().map((supplier) => (
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
                  Group services by the same company (e.g., Sky for both TV and
                  Mobile)
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
                placeholder="Contract end date, renewal reminders, special arrangements..."
                style={textareaStyle}
              />
            </div>

            <div style={checkboxContainerStyle}>
              <input
                type="checkbox"
                id="confidential-utility-edit"
                checked={formData.confidential}
                onChange={(e) =>
                  handleInputChange("confidential", e.target.checked)
                }
                style={{ width: "16px", height: "16px" }}
              />
              <label
                htmlFor="confidential-utility-edit"
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
