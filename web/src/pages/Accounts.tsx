import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getEntries, Entry, deleteEntry } from "../api";
import AddAccountModal from "../components/AddAccountModal";
import EditAccountModal from "../components/EditAccountModal";
import AccountDetailModal from "../components/AccountDetailModal";
import AddUtilityModal from "../components/AddUtilityModal";
import EditUtilityModal from "../components/EditUtilityModal";
import AddPensionModal from "../components/AddPensionModal";
import EditPensionModal from "../components/EditPensionModal";

export default function Accounts() {
  const [searchParams] = useSearchParams();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Entry | null>(null);

  const typeFilter = searchParams.get("type");

  useEffect(() => {
    (async () => {
      try {
        const data = await getEntries();
        setEntries(data.entries);
      } catch (err: any) {
        setError(err.message || "Failed to load entries");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let filtered = entries;
    if (typeFilter) {
      switch (typeFilter) {
        case "account":
          filtered = entries.filter((entry) => entry.type === "account");
          break;
        case "investment":
          filtered = entries.filter(
            (entry) =>
              entry.title.toLowerCase().includes("investment") ||
              entry.title.toLowerCase().includes("401k") ||
              entry.title.toLowerCase().includes("ira") ||
              entry.title.toLowerCase().includes("roth") ||
              entry.title.toLowerCase().includes("brokerage") ||
              entry.accountDetails?.category === "investment"
          );
          break;
        case "property":
          filtered = entries.filter(
            (entry) =>
              entry.title.toLowerCase().includes("property") ||
              entry.title.toLowerCase().includes("house") ||
              entry.title.toLowerCase().includes("home") ||
              entry.title.toLowerCase().includes("residence") ||
              entry.title.toLowerCase().includes("real estate") ||
              entry.accountDetails?.category === "property"
          );
          break;
        case "utility":
          filtered = entries.filter((entry) => entry.type === "utility");
          break;
        case "pension":
          filtered = entries.filter((entry) => entry.type === "pension");
          break;
        default:
          filtered = entries;
      }
    }
    setFilteredEntries(filtered);
  }, [entries, typeFilter]);

  const getPageTitle = () => {
    switch (typeFilter) {
      case "account":
        return "Bank Accounts";
      case "investment":
        return "Investments";
      case "property":
        return "Properties";
      case "utility":
        return "Utilities";
      case "pension":
        return "Pensions";
      default:
        return "All Accounts";
    }
  };

  const getPageIcon = () => {
    switch (typeFilter) {
      case "account":
        return "savings";
      case "investment":
        return "trending_up";
      case "property":
        return "villa";
      case "utility":
        return "receipt_long";
      case "pension":
        return "savings";
      default:
        return "account_balance_wallet";
    }
  };

  const refreshEntries = async () => {
    try {
      const data = await getEntries();
      setEntries(data.entries);
    } catch (err: any) {
      setError(err.message || "Failed to refresh entries");
    }
  };

  const handleView = (account: Entry) => {
    setSelectedAccount(account);
    setShowDetailModal(true);
  };

  const handleEdit = (account: Entry) => {
    setSelectedAccount(account);
    setShowEditModal(true);
  };

  const handleDelete = async (account: Entry) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${account.title}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteEntry(account._id);
        refreshEntries();
      } catch (err: any) {
        setError(err.message || "Failed to delete account");
      }
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

  const cardStyle = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
  };

  const listItemStyle = {
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

  const emptyStateStyle = {
    textAlign: "center" as const,
    padding: "64px 20px",
    color: "#6b7280",
  };

  if (loading) {
    return (
      <>
        <div style={headerStyle}>
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "bold",
              color: "#1a1a1a",
              margin: 0,
            }}
          >
            Loading...
          </h1>
        </div>
        <div style={contentStyle}>
          <p>Loading your financial data...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div style={headerStyle}>
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "bold",
              color: "#1a1a1a",
              margin: 0,
            }}
          >
            Error
          </h1>
        </div>
        <div style={contentStyle}>
          <p style={{ color: "#dc2626" }}>Error: {error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "32px", color: "#3b82f6" }}
          >
            {getPageIcon()}
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
              {getPageTitle()}
            </h1>
            <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
              {filteredEntries.length}{" "}
              {filteredEntries.length === 1 ? "entry" : "entries"} found
            </p>
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

        {filteredEntries.length === 0 ? (
          <div style={emptyStateStyle}>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "64px",
                color: "#d1d5db",
                marginBottom: "16px",
                display: "block",
              }}
            >
              {getPageIcon()}
            </span>
            <h3 style={{ color: "#374151", marginBottom: "8px" }}>
              No {getPageTitle().toLowerCase()} found
            </h3>
            <p style={{ marginBottom: "24px" }}>
              Get started by adding your first entry.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredEntries.map((entry) => (
              <div
                key={entry._id}
                style={{
                  ...cardStyle,
                  position: "relative",
                }}
                onClick={() => handleView(entry)}
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
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "28px", color: "#3b82f6" }}
                >
                  {getPageIcon()}
                </span>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {entry.title}
                  </h3>
                  {entry.provider && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        margin: "0 0 4px 0",
                      }}
                    >
                      {entry.provider}
                    </p>
                  )}
                  {entry.notes && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#9ca3af",
                        margin: "0 0 4px 0",
                        lineHeight: "1.4",
                      }}
                    >
                      {entry.notes.length > 60
                        ? `${entry.notes.substring(0, 60)}...`
                        : entry.notes}
                    </p>
                  )}
                  <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {entry.createdAt && (
                      <p style={{ margin: "0 0 2px 0" }}>
                        Created:{" "}
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    )}
                    {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                      <p style={{ margin: 0 }}>
                        Updated:{" "}
                        {new Date(entry.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {entry.confidential && (
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "20px", color: "#f59e0b" }}
                    >
                      lock
                    </span>
                  )}
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(entry);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "4px",
                        color: "#6b7280",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#3b82f6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#6b7280")
                      }
                      title="Edit account"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "18px" }}
                      >
                        edit
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "4px",
                        color: "#6b7280",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#dc2626")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#6b7280")
                      }
                      title="Delete account"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "18px" }}
                      >
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {filteredEntries.map((entry) => (
              <div
                key={entry._id}
                style={listItemStyle}
                onClick={() => handleView(entry)}
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
                    style={{ fontSize: "24px", color: "#3b82f6" }}
                  >
                    {getPageIcon()}
                  </span>
                  <div>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#1a1a1a",
                        margin: "0 0 2px 0",
                      }}
                    >
                      {entry.title}
                    </h3>
                    {entry.provider && (
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          margin: "0 0 2px 0",
                        }}
                      >
                        {entry.provider}
                      </p>
                    )}
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                      {entry.createdAt && (
                        <span>
                          Created:{" "}
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {entry.updatedAt &&
                        entry.updatedAt !== entry.createdAt && (
                          <span
                            style={{
                              marginLeft: entry.createdAt ? "12px" : "0",
                            }}
                          >
                            Updated:{" "}
                            {new Date(entry.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {entry.confidential && (
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "20px", color: "#f59e0b" }}
                    >
                      lock
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(entry);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "4px",
                      color: "#6b7280",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#3b82f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#6b7280")
                    }
                    title="Edit account"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "18px" }}
                    >
                      edit
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(entry);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "4px",
                      color: "#6b7280",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#dc2626")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#6b7280")
                    }
                    title="Delete account"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "18px" }}
                    >
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          style={addButtonStyle}
          onClick={() => setShowAddModal(true)}
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
          title={`Add new ${typeFilter || "entry"}`}
        >
          <span className="material-symbols-outlined">add</span>
        </button>

        {typeFilter === "utility" ? (
          <AddUtilityModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={refreshEntries}
          />
        ) : typeFilter === "pension" ? (
          <AddPensionModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={refreshEntries}
          />
        ) : (
          <AddAccountModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={refreshEntries}
            accountType={typeFilter}
          />
        )}

        {typeFilter === "utility" ? (
          <EditUtilityModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedAccount(null);
            }}
            onSuccess={refreshEntries}
            utility={selectedAccount}
          />
        ) : typeFilter === "pension" ? (
          <EditPensionModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedAccount(null);
            }}
            onSuccess={refreshEntries}
            pension={selectedAccount}
          />
        ) : (
          <EditAccountModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedAccount(null);
            }}
            onSuccess={refreshEntries}
            account={selectedAccount}
          />
        )}

        <AccountDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAccount(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => {
            if (selectedAccount) {
              setShowDetailModal(false);
              handleDelete(selectedAccount);
              setSelectedAccount(null);
            }
          }}
          account={selectedAccount}
        />
      </div>
    </>
  );
}
