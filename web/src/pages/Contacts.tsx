import React, { useState } from "react";

type Contact = {
  _id: string;
  name: string;
  role:
    | "financial-advisor"
    | "insurance-agent"
    | "lawyer"
    | "accountant"
    | "bank-rep"
    | "other";
  company: string;
  email?: string;
  phone?: string;
  notes?: string;
  linkedAccounts?: string[];
};

// Sample contacts data for demonstration
const sampleContacts: Contact[] = [
  {
    _id: "1",
    name: "Sarah Johnson",
    role: "financial-advisor",
    company: "Johnson Financial Services",
    email: "sarah@johnsonfs.com",
    phone: "(555) 123-4567",
    notes: "Primary financial advisor, handles investment portfolio",
    linkedAccounts: ["Vanguard 401k"],
  },
  {
    _id: "2",
    name: "Mike Chen",
    role: "insurance-agent",
    company: "State Farm Insurance",
    email: "mike.chen@statefarm.com",
    phone: "(555) 987-6543",
    notes: "Auto and home insurance agent",
    linkedAccounts: ["Car Insurance Policy"],
  },
  {
    _id: "3",
    name: "Jennifer Rodriguez",
    role: "accountant",
    company: "Rodriguez & Associates CPA",
    email: "jennifer@rodriguezCPA.com",
    phone: "(555) 555-0123",
    notes: "Tax preparation and business accounting",
  },
  {
    _id: "4",
    name: "David Kim",
    role: "bank-rep",
    company: "Chase Bank",
    email: "david.kim@chase.com",
    phone: "(555) 444-7890",
    notes: "Personal banker, handles account questions",
  },
];

export default function Contacts() {
  const [contacts] = useState<Contact[]>(sampleContacts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const getRoleColor = (role: Contact["role"]) => {
    switch (role) {
      case "financial-advisor":
        return "#3b82f6";
      case "insurance-agent":
        return "#10b981";
      case "lawyer":
        return "#8b5cf6";
      case "accountant":
        return "#f59e0b";
      case "bank-rep":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getRoleIcon = (role: Contact["role"]) => {
    switch (role) {
      case "financial-advisor":
        return "trending_up";
      case "insurance-agent":
        return "security";
      case "lawyer":
        return "gavel";
      case "accountant":
        return "calculate";
      case "bank-rep":
        return "account_balance";
      default:
        return "person";
    }
  };

  const getRoleLabel = (role: Contact["role"]) => {
    switch (role) {
      case "financial-advisor":
        return "Financial Advisor";
      case "insurance-agent":
        return "Insurance Agent";
      case "lawyer":
        return "Lawyer";
      case "accountant":
        return "Accountant";
      case "bank-rep":
        return "Bank Representative";
      default:
        return "Other";
    }
  };

  const headerStyle = {
    borderBottom: "1px solid #e5e7eb",
    padding: "20px 32px",
    background: "white",
  };

  const contentStyle = {
    padding: "20px 32px 32px 32px",
    background: "white",
    minHeight: "calc(100vh - 160px)",
  };

  const viewToggleStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "24px",
  };

  const toggleButtonStyle = (active: boolean) => ({
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    backgroundColor: active ? "#3b82f6" : "white",
    color: active ? "white" : "#6b7280",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.2s",
  });

  const addButtonStyle = {
    position: "fixed" as const,
    bottom: "24px",
    right: "24px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px 0 rgba(59, 130, 246, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    transition: "all 0.2s",
  };

  const contactCardStyle = {
    padding: "24px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
  };

  const contactListStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "8px",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
  };

  return (
    <>
      <div style={headerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "32px", color: "#3b82f6" }}
            >
              group
            </span>
            <div>
              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  color: "#1a1a1a",
                  margin: "0 0 4px 0",
                }}
              >
                Contacts
              </h1>
              <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
                {contacts.length} financial contacts
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={contentStyle}>
        <div style={viewToggleStyle}>
          <button
            style={toggleButtonStyle(viewMode === "grid")}
            onClick={() => setViewMode("grid")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              grid_view
            </span>
            Grid
          </button>
          <button
            style={toggleButtonStyle(viewMode === "list")}
            onClick={() => setViewMode("list")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              list
            </span>
            List
          </button>
        </div>

        {viewMode === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {contacts.map((contact) => (
              <div
                key={contact._id}
                style={contactCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "32px",
                      color: getRoleColor(contact.role),
                    }}
                  >
                    {getRoleIcon(contact.role)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#1a1a1a",
                        margin: "0 0 4px 0",
                      }}
                    >
                      {contact.name}
                    </h3>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        backgroundColor: `${getRoleColor(contact.role)}20`,
                        color: getRoleColor(contact.role),
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {getRoleLabel(contact.role)}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {contact.company}
                  </p>
                  {contact.email && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        margin: "2px 0",
                      }}
                    >
                      📧 {contact.email}
                    </p>
                  )}
                  {contact.phone && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        margin: "2px 0",
                      }}
                    >
                      📞 {contact.phone}
                    </p>
                  )}
                </div>

                {contact.notes && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#9ca3af",
                      margin: "0 0 12px 0",
                      lineHeight: "1.4",
                    }}
                  >
                    {contact.notes}
                  </p>
                )}

                {contact.linkedAccounts &&
                  contact.linkedAccounts.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#6b7280",
                          margin: "0 0 4px 0",
                        }}
                      >
                        Linked Accounts:
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                        }}
                      >
                        {contact.linkedAccounts.map((account, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: "inline-block",
                              padding: "2px 6px",
                              borderRadius: "8px",
                              backgroundColor: "#f3f4f6",
                              color: "#6b7280",
                              fontSize: "11px",
                            }}
                          >
                            {account}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {contacts.map((contact) => (
              <div
                key={contact._id}
                style={contactListStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "24px",
                      color: getRoleColor(contact.role),
                    }}
                  >
                    {getRoleIcon(contact.role)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "2px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#1a1a1a",
                          margin: 0,
                        }}
                      >
                        {contact.name}
                      </h3>
                      <div
                        style={{
                          padding: "2px 6px",
                          borderRadius: "8px",
                          backgroundColor: `${getRoleColor(contact.role)}20`,
                          color: getRoleColor(contact.role),
                          fontSize: "10px",
                          fontWeight: "500",
                        }}
                      >
                        {getRoleLabel(contact.role)}
                      </div>
                    </div>
                    <p
                      style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}
                    >
                      {contact.company} • {contact.email || contact.phone}
                    </p>
                  </div>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px", color: "#9ca3af" }}
                >
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          style={addButtonStyle}
          onClick={() => setShowAddForm(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow =
              "0 8px 25px 0 rgba(59, 130, 246, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px 0 rgba(59, 130, 246, 0.4)";
          }}
          title="Add new contact"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </>
  );
}
