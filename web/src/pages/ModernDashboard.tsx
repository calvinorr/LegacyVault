import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEntries, getMe, Entry, User } from "../api";
import { 
  Landmark, 
  TrendingUp, 
  Building2, 
  Receipt, 
  PiggyBank
} from "lucide-react";

// Generate audit trail from recent database entries
const generateAuditTrail = (entries: Entry[], currentUser: User | null) => {
  return entries
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || "").getTime() -
        new Date(a.updatedAt || a.createdAt || "").getTime()
    )
    .slice(0, 5)
    .map((entry, index) => {
      const wasUpdated = entry.updatedAt && entry.updatedAt !== entry.createdAt;
      const timestamp = new Date(
        wasUpdated ? entry.updatedAt! : entry.createdAt!
      );

      const getCategoryName = (type: string, title: string) => {
        if (type === "account") return "Bank Accounts";
        if (type === "utility" || type === "bill") return "Bills";
        if (type === "policy") return "Insurance";
        if (
          title.toLowerCase().includes("investment") ||
          title.toLowerCase().includes("isa")
        )
          return "Investments";
        if (
          title.toLowerCase().includes("property") ||
          title.toLowerCase().includes("house")
        )
          return "Property";
        return "Other";
      };

      return {
        id: index + 1,
        timestamp: timestamp.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        user: currentUser?.displayName || "Unknown User",
        category: getCategoryName(entry.type || "other", entry.title),
        action: wasUpdated ? "UPDATED" : "CREATED",
        details: wasUpdated
          ? `Updated '${entry.title}' details.`
          : `Added '${entry.title}' account.`,
        actionType: wasUpdated ? "updated" : "created",
      };
    });
};

const getBadgeStyle = (actionType: string) => {
  switch (actionType) {
    case "created":
      return { backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" };
    case "updated":
      return { backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" };
    case "uploaded":
      return { backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#a855f7" };
    case "deleted":
      return { backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" };
    default:
      return { backgroundColor: "rgba(107, 114, 128, 0.1)", color: "#6b7280" };
  }
};

export default function ModernDashboard() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [entriesData, userData] = await Promise.all([
          getEntries(),
          getMe(),
        ]);
        setEntries(entriesData.entries);
        setCurrentUser(userData.user);
        setAuditData(generateAuditTrail(entriesData.entries, userData.user));
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Calculate category counts based on actual entries and data model
  const categoryCounts = {
    accounts: entries.filter((e) => e.type === "account").length,
    investments: entries.filter(
      (e) =>
        e.title.toLowerCase().includes("investment") ||
        e.title.toLowerCase().includes("401k") ||
        e.title.toLowerCase().includes("ira") ||
        e.title.toLowerCase().includes("roth") ||
        e.title.toLowerCase().includes("brokerage") ||
        e.accountDetails?.category === "investment"
    ).length,
    properties: entries.filter(
      (e) =>
        e.title.toLowerCase().includes("property") ||
        e.title.toLowerCase().includes("house") ||
        e.title.toLowerCase().includes("home") ||
        e.title.toLowerCase().includes("residence") ||
        e.title.toLowerCase().includes("real estate") ||
        e.accountDetails?.category === "property"
    ).length,
    utilities: entries.filter((e) => e.type === "utility" || e.type === "bill").length,
    pensions: entries.filter((e) => e.type === "pension").length,
  };

  // Always use actual counts from MongoDB - no fallback placeholders
  const displayCounts = {
    accounts: categoryCounts.accounts,
    investments: categoryCounts.investments,
    properties: categoryCounts.properties,
    utilities: categoryCounts.utilities,
    pensions: categoryCounts.pensions,
  };

  const headerStyle = {
    borderBottom: "1px solid #f1f5f9",
    padding: "32px",
    background: "#ffffff",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const cardStyle = {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "28px 32px",
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "16px",
    boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.08)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const tableContainerStyle = {
    width: "100%",
    border: "1px solid #f1f5f9",
    borderRadius: "16px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    maxHeight: "400px", // Limits to about 5-6 rows plus header
    boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.08)",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const tableBodyStyle = {
    maxHeight: "320px", // About 5 rows of content
    overflowY: "auto" as const,
    display: "block",
  };

  const tableHeaderStyle = {
    display: "block",
    backgroundColor: "#f8fafc",
    position: "sticky" as const,
    top: 0,
    zIndex: 1,
  };

  const tableRowStyle = {
    display: "flex",
    width: "100%",
    borderBottom: "1px solid #e5e7eb",
  };

  const tableCellStyle = (width: string) => ({
    padding: "12px 16px",
    fontSize: "14px",
    flex: width,
    minWidth: 0,
  });

  return (
    <>
      {/* Header */}
      <div style={headerStyle}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "600",
            color: "#0f172a",
            margin: "0",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.025em",
          }}
        >
          Dashboard
        </h1>
      </div>

      <div style={{ padding: "40px", background: "#fefefe", minHeight: "calc(100vh - 104px)" }}>
        {/* Account Categories */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#334155",
            margin: "0 0 24px 0",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.025em",
          }}
        >
          Vault Items
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          <div
            style={cardStyle}
            onClick={() => navigate("/accounts?type=account")}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 10px 25px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 1px 3px 0 rgba(15, 23, 42, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#f1f5f9";
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: "48px",
              height: "48px",
              backgroundColor: "#f1f5f9",
              borderRadius: "12px"
            }}>
              <Landmark size={24} color="#475569" strokeWidth={1.5} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#64748b",
                  margin: "0 0 8px 0",
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                Bank Accounts
              </p>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#0f172a",
                  margin: 0,
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                {displayCounts.accounts} accounts
              </p>
            </div>
          </div>
          <div
            style={cardStyle}
            onClick={() => navigate("/accounts?type=investment")}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 10px 25px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 1px 3px 0 rgba(15, 23, 42, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#f1f5f9";
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: "48px",
              height: "48px",
              backgroundColor: "#f1f5f9",
              borderRadius: "12px"
            }}>
              <TrendingUp size={24} color="#475569" strokeWidth={1.5} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#64748b",
                  margin: "0 0 8px 0",
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                Investments
              </p>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#0f172a",
                  margin: 0,
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                {displayCounts.investments} accounts
              </p>
            </div>
          </div>
          <div
            style={cardStyle}
            onClick={() => navigate("/accounts?type=property")}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 10px 25px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 1px 3px 0 rgba(15, 23, 42, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#f1f5f9";
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: "48px",
              height: "48px",
              backgroundColor: "#f1f5f9",
              borderRadius: "12px"
            }}>
              <Building2 size={24} color="#475569" strokeWidth={1.5} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#64748b",
                  margin: "0 0 8px 0",
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                Property
              </p>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#0f172a",
                  margin: 0,
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                {displayCounts.properties} properties
              </p>
            </div>
          </div>
          <div
            style={cardStyle}
            onClick={() => navigate("/accounts?type=utility")}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 10px 25px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 1px 3px 0 rgba(15, 23, 42, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#f1f5f9";
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: "48px",
              height: "48px",
              backgroundColor: "#f1f5f9",
              borderRadius: "12px"
            }}>
              <Receipt size={24} color="#475569" strokeWidth={1.5} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#64748b",
                  margin: "0 0 8px 0",
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                Bills
              </p>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#0f172a",
                  margin: 0,
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                {displayCounts.utilities} accounts
              </p>
            </div>
          </div>
          <div
            style={cardStyle}
            onClick={() => navigate("/accounts?type=pension")}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 10px 25px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 1px 3px 0 rgba(15, 23, 42, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#f1f5f9";
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: "48px",
              height: "48px",
              backgroundColor: "#f1f5f9",
              borderRadius: "12px"
            }}>
              <PiggyBank size={24} color="#475569" strokeWidth={1.5} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#64748b",
                  margin: "0 0 8px 0",
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                Pensions
              </p>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#0f172a",
                  margin: 0,
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}
              >
                {displayCounts.pensions} pensions
              </p>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#334155",
            margin: "0 0 24px 0",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.025em",
          }}
        >
          Audit Trail
        </h2>
        <div style={tableContainerStyle}>
          <div style={tableHeaderStyle}>
            <div style={tableRowStyle}>
              <div
                style={{
                  ...tableCellStyle("2"),
                  fontWeight: "500",
                  color: "#6b7280",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Timestamp
              </div>
              <div
                style={{
                  ...tableCellStyle("1"),
                  fontWeight: "500",
                  color: "#6b7280",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                User
              </div>
              <div
                style={{
                  ...tableCellStyle("1"),
                  fontWeight: "500",
                  color: "#6b7280",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Category
              </div>
              <div
                style={{
                  ...tableCellStyle("1"),
                  fontWeight: "500",
                  color: "#6b7280",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Action
              </div>
              <div
                style={{
                  ...tableCellStyle("3"),
                  fontWeight: "500",
                  color: "#6b7280",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Details
              </div>
            </div>
          </div>
          <div style={tableBodyStyle}>
            {auditData.map((row) => (
              <div key={row.id} style={tableRowStyle}>
                <div style={{ ...tableCellStyle("2"), color: "#1a1a1a" }}>
                  {row.timestamp}
                </div>
                <div style={{ ...tableCellStyle("1"), color: "#1a1a1a" }}>
                  {row.user}
                </div>
                <div style={{ ...tableCellStyle("1"), color: "#1a1a1a" }}>
                  {row.category}
                </div>
                <div style={{ ...tableCellStyle("1"), color: "#1a1a1a" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: "500",
                      borderRadius: "9999px",
                      ...getBadgeStyle(row.actionType),
                    }}
                  >
                    {row.action}
                  </span>
                </div>
                <div style={{ ...tableCellStyle("3"), color: "#6b7280" }}>
                  {row.details}
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Error or Loading states */}
        {loading && (
          <div style={{ ...cardStyle, marginTop: "24px" }}>
            <p style={{ color: "#6b7280", margin: 0 }}>
              Loading your financial data...
            </p>
          </div>
        )}

        {error && (
          <div style={{ ...cardStyle, marginTop: "24px" }}>
            <p style={{ color: "#dc2626", margin: 0 }}>Error: {error}</p>
          </div>
        )}
      </div>
    </>
  );
}
