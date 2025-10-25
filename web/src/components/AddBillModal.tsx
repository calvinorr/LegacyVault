import React, { useState } from "react";
import { createEntry } from "../api";
import CategorySelector from "./CategorySelector";

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  provider: string;
  accountDetails: {
    billType: string;
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
  categoryId: string;
  supplier: string;
  tags: string[];
  // Enhanced renewal tracking fields
  renewalInfo: {
    startDate: string;
    endDate: string;
    reviewDate: string;
    noticeDate: string;
    productType: string;
    productCategory: string;
    endDateType: string;
    renewalCycle: string;
    isAutoRenewal: boolean;
    requiresAction: boolean;
    noticePeriod: string;
    reminderDays: string;
    urgencyLevel: string;
    regulatoryType: string;
    complianceNotes: string;
    isActive: boolean;
  };
}

const initialFormData: FormData = {
  title: "",
  provider: "",
  accountDetails: {
    billType: "",
    customerNumber: "",
    meterNumber: "",
    tariffType: "",
    paymentMethod: "",
    billingFrequency: "Monthly",
    emergencyNumber: "",
    onlineAccountUrl: "",
    category: "bill",
  },
  notes: "",
  confidential: true,
  // Categorization fields
  categoryId: "",
  supplier: "",
  tags: [],
  // Enhanced renewal tracking fields
  renewalInfo: {
    startDate: "",
    endDate: "",
    reviewDate: "",
    noticeDate: "",
    productType: "",
    productCategory: "",
    endDateType: "hard_end",
    renewalCycle: "annual",
    isAutoRenewal: false,
    requiresAction: true,
    noticePeriod: "",
    reminderDays: "30,7",
    urgencyLevel: "important",
    regulatoryType: "",
    complianceNotes: "",
    isActive: false,
  },
};

export default function AddBillModal({
  isOpen,
  onClose,
  onSuccess,
}: AddBillModalProps) {
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
        type: "bill" as const,
        provider: formData.provider,
        accountDetails: formData.accountDetails,
        notes: formData.notes,
        confidential: formData.confidential,
        // Categorization fields
        categoryId: formData.categoryId,
        supplier: formData.supplier,
        tags: formData.tags,
        // Enhanced renewal tracking
        renewalInfo: formData.renewalInfo.isActive ? {
          ...formData.renewalInfo,
          startDate: formData.renewalInfo.startDate ? new Date(formData.renewalInfo.startDate) : undefined,
          endDate: formData.renewalInfo.endDate ? new Date(formData.renewalInfo.endDate) : undefined,
          reviewDate: formData.renewalInfo.reviewDate ? new Date(formData.renewalInfo.reviewDate) : undefined,
          noticeDate: formData.renewalInfo.noticeDate ? new Date(formData.renewalInfo.noticeDate) : undefined,
          noticePeriod: formData.renewalInfo.noticePeriod ? parseInt(formData.renewalInfo.noticePeriod) : undefined,
          reminderDays: formData.renewalInfo.reminderDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d)),
        } : undefined,
      };

      await createEntry(payload);

      // Reset form and close modal
      setFormData(initialFormData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create bill account");
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

  const handleRenewalInfoChange = (
    field: keyof FormData["renewalInfo"],
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      renewalInfo: {
        ...prev.renewalInfo,
        [field]: value,
      },
    }));
  };

  const getBillTypeOptions = () => [
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
    width: "95%",
    maxWidth: "1200px",
    minWidth: "80vw",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column" as const,
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  };

  const headerStyle = {
    padding: "24px 24px 16px 24px",
    borderBottom: "1px solid #e5e7eb",
    flexShrink: 0,
  };

  const contentStyle = {
    flex: 1,
    overflowY: "auto" as const,
    minHeight: 0,
    padding: "24px 24px 0 24px",
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

  const footerStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    padding: "16px 24px 24px 24px",
    borderTop: "1px solid #e5e7eb",
    flexShrink: 0,
    backgroundColor: "white",
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
              Add Bill/Service
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
          <form id="bill-form" onSubmit={handleSubmit}>
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
                htmlFor="service-name"
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
                id="service-name"
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
                  htmlFor="provider"
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
                  id="provider"
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
                  htmlFor="bill-type"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "4px",
                  }}
                >
                  Bill Type *
                </label>
                <select
                  id="bill-type"
                  value={formData.accountDetails.billType}
                  onChange={(e) =>
                    handleAccountDetailChange("billType", e.target.value)
                  }
                  required
                  style={selectStyle}
                >
                  <option value="">Select bill type</option>
                  {getBillTypeOptions().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="category-select"
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
                <CategorySelector
                  value={formData.categoryId}
                  onChange={(categoryId) => handleInputChange("categoryId", categoryId)}
                  placeholder="Select category"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    fontSize: '15px',
                    marginBottom: '16px'
                  }}
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

            {/* Enhanced Renewal Tracking Section */}
            <div style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #0f172a",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px"
              }}>
                <input
                  type="checkbox"
                  id="renewal-tracking"
                  checked={formData.renewalInfo.isActive}
                  onChange={(e) => handleRenewalInfoChange("isActive", e.target.checked)}
                  style={{ width: "16px", height: "16px", marginRight: "8px" }}
                />
                <label htmlFor="renewal-tracking" style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a202c",
                  cursor: "pointer"
                }}>
                  Enable Renewal Tracking
                </label>
              </div>

              {formData.renewalInfo.isActive && (
                <>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px"
                  }}>
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "4px"
                      }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.renewalInfo.startDate}
                        onChange={(e) => handleRenewalInfoChange("startDate", e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "4px"
                      }}>
                        End/Renewal Date *
                      </label>
                      <input
                        type="date"
                        value={formData.renewalInfo.endDate}
                        onChange={(e) => handleRenewalInfoChange("endDate", e.target.value)}
                        required={formData.renewalInfo.isActive}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "4px"
                      }}>
                        Review Date
                      </label>
                      <input
                        type="date"
                        value={formData.renewalInfo.reviewDate}
                        onChange={(e) => handleRenewalInfoChange("reviewDate", e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px"
                  }}>
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "4px"
                      }}>
                        End Date Type
                      </label>
                      <select
                        value={formData.renewalInfo.endDateType}
                        onChange={(e) => handleRenewalInfoChange("endDateType", e.target.value)}
                        style={selectStyle}
                      >
                        <option value="hard_end">Contract End</option>
                        <option value="auto_renewal">Auto-Renewal</option>
                        <option value="review_date">Review Date</option>
                        <option value="expiry_date">Expiry Date</option>
                        <option value="notice_deadline">Notice Deadline</option>
                      </select>
                    </div>
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "4px"
                      }}>
                        Renewal Cycle
                      </label>
                      <select
                        value={formData.renewalInfo.renewalCycle}
                        onChange={(e) => handleRenewalInfoChange("renewalCycle", e.target.value)}
                        style={selectStyle}
                      >
                        <option value="annual">Annual</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="one_time">One Time</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "4px"
                      }}>
                        Urgency Level
                      </label>
                      <select
                        value={formData.renewalInfo.urgencyLevel}
                        onChange={(e) => handleRenewalInfoChange("urgencyLevel", e.target.value)}
                        style={selectStyle}
                      >
                        <option value="critical">Critical</option>
                        <option value="important">Important</option>
                        <option value="strategic">Strategic</option>
                      </select>
                    </div>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px"
                  }}>
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "4px"
                      }}>
                        Notice Period (days)
                      </label>
                      <input
                        type="number"
                        value={formData.renewalInfo.noticePeriod}
                        onChange={(e) => handleRenewalInfoChange("noticePeriod", e.target.value)}
                        placeholder="e.g., 30"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "4px"
                      }}>
                        Reminder Days (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.renewalInfo.reminderDays}
                        onChange={(e) => handleRenewalInfoChange("reminderDays", e.target.value)}
                        placeholder="e.g., 60,30,14,7"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    gap: "24px",
                    marginBottom: "16px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="checkbox"
                        id="auto-renewal"
                        checked={formData.renewalInfo.isAutoRenewal}
                        onChange={(e) => handleRenewalInfoChange("isAutoRenewal", e.target.checked)}
                        style={{ width: "16px", height: "16px" }}
                      />
                      <label htmlFor="auto-renewal" style={{
                        fontSize: "14px",
                        color: "#374151",
                        cursor: "pointer"
                      }}>
                        Auto-Renewal
                      </label>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="checkbox"
                        id="requires-action"
                        checked={formData.renewalInfo.requiresAction}
                        onChange={(e) => handleRenewalInfoChange("requiresAction", e.target.checked)}
                        style={{ width: "16px", height: "16px" }}
                      />
                      <label htmlFor="requires-action" style={{
                        fontSize: "14px",
                        color: "#374151",
                        cursor: "pointer"
                      }}>
                        Requires Action
                      </label>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "4px"
                    }}>
                      Compliance Notes
                    </label>
                    <textarea
                      value={formData.renewalInfo.complianceNotes}
                      onChange={(e) => handleRenewalInfoChange("complianceNotes", e.target.value)}
                      placeholder="Special compliance requirements, legal obligations, etc."
                      style={{
                        ...textareaStyle,
                        minHeight: "60px"
                      }}
                    />
                  </div>
                </>
              )}
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
                id="confidential-bill"
                checked={formData.confidential}
                onChange={(e) =>
                  handleInputChange("confidential", e.target.checked)
                }
                style={{ width: "16px", height: "16px" }}
              />
              <label
                htmlFor="confidential-bill"
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Mark as confidential
              </label>
            </div>

          </form>
        </div>

        {/* Fixed Footer */}
        <div style={footerStyle}>
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
            form="bill-form"
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
            {loading ? "Creating..." : "Create Bill Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
