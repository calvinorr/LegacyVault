import React from "react";
import { Entry } from "../api";

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  account: Entry | null;
}

export default function AccountDetailModal({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  account,
}: AccountDetailModalProps) {
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

  const sectionStyle = {
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "4px",
    display: "block",
  };

  const valueStyle = {
    fontSize: "16px",
    color: "#1a1a1a",
    marginBottom: "12px",
    wordBreak: "break-word" as const,
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

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#dc2626",
    color: "white",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "white",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
  };

  const formatAccountType = (type: string) => {
    switch (account.accountDetails?.category) {
      case "account":
        return "Bank Account";
      case "investment":
        return "Investment Account";
      case "property":
        return "Property";
      case "utility":
        return "Utility Account";
      default:
        return "Account";
    }
  };

  const maskSensitiveInfo = (value: string) => {
    if (!value) return "Not provided";
    if (value.length <= 4) return value;
    return "*".repeat(value.length - 4) + value.slice(-4);
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "32px", color: "#3b82f6" }}
              >
                account_balance_wallet
              </span>
              <div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    margin: "0 0 4px 0",
                  }}
                >
                  {account.title}
                </h2>
                <p style={{ fontSize: "16px", color: "#6b7280", margin: 0 }}>
                  {formatAccountType(account.type || "account")}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {account.confidential && (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "24px", color: "#f59e0b" }}
                >
                  lock
                </span>
              )}
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
        </div>

        <div style={contentStyle}>
          {/* Basic Information */}
          <div style={sectionStyle}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1a1a1a",
                margin: "0 0 16px 0",
              }}
            >
              Basic Information
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Account Name</label>
                <div style={valueStyle}>{account.title}</div>
              </div>
              <div>
                <label style={labelStyle}>Bank/Building Society</label>
                <div style={valueStyle}>
                  {account.provider || "Not specified"}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Account Type</label>
                <div style={valueStyle}>
                  {account.accountDetails?.accountType || "Not specified"}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Branch/Location</label>
                <div style={valueStyle}>
                  {account.accountDetails?.branch || "Not specified"}
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          {(account.accountDetails?.accountNumber ||
            account.accountDetails?.sortCode ||
            account.accountDetails?.routingNumber) && (
            <div style={sectionStyle}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  margin: "0 0 16px 0",
                }}
              >
                Account Details
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                {account.accountDetails?.accountNumber && (
                  <div>
                    <label style={labelStyle}>Account Number</label>
                    <div style={valueStyle}>
                      {maskSensitiveInfo(account.accountDetails.accountNumber)}
                    </div>
                  </div>
                )}
                {(account.accountDetails?.sortCode ||
                  account.accountDetails?.routingNumber) && (
                  <div>
                    <label style={labelStyle}>Sort Code</label>
                    <div style={valueStyle}>
                      {maskSensitiveInfo(
                        account.accountDetails.sortCode ||
                          account.accountDetails.routingNumber ||
                          ""
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {account.notes && (
            <div style={sectionStyle}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  margin: "0 0 16px 0",
                }}
              >
                Notes
              </h3>
              <div
                style={{
                  ...valueStyle,
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                }}
              >
                {account.notes}
              </div>
            </div>
          )}

          {/* Audit Information */}
          <div style={sectionStyle}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1a1a1a",
                margin: "0 0 16px 0",
              }}
            >
              Audit Trail
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {account.createdAt && (
                <div>
                  <label style={labelStyle}>Created</label>
                  <div style={valueStyle}>
                    {new Date(account.createdAt).toLocaleString()}
                  </div>
                </div>
              )}
              {account.updatedAt && (
                <div>
                  <label style={labelStyle}>Last Updated</label>
                  <div style={valueStyle}>
                    {new Date(account.updatedAt).toLocaleString()}
                  </div>
                </div>
              )}
              <div>
                <label style={labelStyle}>Security</label>
                <div style={valueStyle}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500",
                      backgroundColor: account.confidential
                        ? "#fef3c7"
                        : "#dcfce7",
                      color: account.confidential ? "#92400e" : "#166534",
                    }}
                  >
                    {account.confidential ? "Confidential" : "Standard"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "16px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <button onClick={onDelete} style={dangerButtonStyle}>
              Delete Account
            </button>
            <div>
              <button onClick={onClose} style={secondaryButtonStyle}>
                Close
              </button>
              <button onClick={onEdit} style={primaryButtonStyle}>
                Edit Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
