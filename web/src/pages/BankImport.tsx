import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import CreateEntryFromTransactionModal from "../components/CreateEntryFromTransactionModal";

interface ImportSession {
  _id: string;
  filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  processing_stage?: string;
  bank_name?: string;
  statistics?: {
    total_transactions: number;
    recurring_detected: number;
    date_range_days: number;
    total_debits: number;
    total_credits: number;
  };
  recurring_payments?: RecurringPaymentSuggestion[];
  createdAt: string;
  expires_at: string;
}

interface TransactionData {
  session_id: string;
  filename: string;
  bank_name?: string;
  transaction_count: number;
  transactions: {
    date: string;
    description: string;
    amount: number;
    balance?: number;
    originalText: string;
    status?: "pending" | "processed" | "skipped";
  }[];
}

interface RecurringPaymentSuggestion {
  payee: string;
  category: string;
  subcategory?: string;
  amount: number;
  frequency: string;
  confidence: number;
  transactions: any[];
  suggested_entry: {
    title: string;
    provider: string;
    type: string;
  };
  status: "pending" | "accepted" | "rejected";
}

export default function BankImport() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ImportSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transactionData, setTransactionData] = useState<{
    [sessionId: string]: TransactionData;
  }>({});
  const [selectedTransactions, setSelectedTransactions] = useState<{
    [sessionId: string]: Set<number>;
  }>({});
  const [createEntryModal, setCreateEntryModal] = useState<{
    isOpen: boolean;
    transaction: any | null;
  }>({
    isOpen: false,
    transaction: null,
  });

  // Debug auth state
  console.log("BankImport - user:", user);
  console.log("BankImport - user role:", user?.role);

  // Redirect non-admin users
  if (user && user.role !== "admin") {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        <h1 style={{ color: "#ef4444", marginBottom: "16px" }}>
          Access Denied
        </h1>
        <p style={{ color: "#6b7280" }}>
          This feature is only available to administrators.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      console.log("Loading sessions...");
      const response = await fetch("/api/import/sessions", {
        credentials: "include",
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to load sessions: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Sessions data:", data);

      // Debug the recurring payments data structure
      if (data.sessions) {
        data.sessions.forEach((session, i) => {
          console.log(`Session ${i}:`, session.filename);
          if (session.recurring_payments) {
            session.recurring_payments.forEach((suggestion, j) => {
              console.log(`  Suggestion ${j}:`, {
                payee: suggestion.payee,
                transactions: suggestion.transactions,
                transactionCount: suggestion.transactions?.length || 0,
              });
              if (
                suggestion.transactions &&
                suggestion.transactions.length > 0
              ) {
                console.log(
                  `    First transaction:`,
                  suggestion.transactions[0]
                );
              }
            });
          }
        });
      }

      const sessions = data.sessions || [];
      setSessions(sessions);

      // Load transaction data for completed sessions
      for (const session of sessions) {
        if (session.status === "completed") {
          loadSessionTransactions(session._id);
        }
      }
    } catch (err: any) {
      console.error("Error loading sessions:", err);
      setError(err.message || "Failed to load import sessions");
      setSessions([]); // Ensure we don't leave sessions in an undefined state
    } finally {
      setLoading(false);
    }
  };

  const loadSessionTransactions = async (sessionId: string) => {
    try {
      console.log(`Loading transactions for session ${sessionId}...`);
      const response = await fetch(
        `/api/import/sessions/${sessionId}/transactions`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load transactions: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(
        `Loaded ${data.transaction_count} transactions for session ${sessionId}:`,
        data
      );

      setTransactionData((prev) => ({
        ...prev,
        [sessionId]: data,
      }));
    } catch (err: any) {
      console.error(
        `Error loading transactions for session ${sessionId}:`,
        err
      );
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("statement", selectedFile);

      const response = await fetch("/api/import/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Upload failed: ${response.statusText}`
        );
      }

      const result = await response.json();
      setSelectedFile(null);

      // Refresh sessions list
      await loadSessions();
    } catch (err: any) {
      setError(err.message || "Failed to upload statement");
    } finally {
      setUploading(false);
    }
  };

  const confirmSuggestions = async (
    sessionId: string,
    confirmations: any[]
  ) => {
    try {
      const response = await fetch(
        `/api/import/sessions/${sessionId}/confirm`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ confirmations }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to confirm suggestions");
      }

      // Refresh sessions
      await loadSessions();
    } catch (err: any) {
      setError(err.message || "Failed to confirm suggestions");
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this import session?")) {
      return;
    }

    try {
      const response = await fetch(`/api/import/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete session");
      }

      // Refresh sessions
      await loadSessions();
    } catch (err: any) {
      setError(err.message || "Failed to delete session");
    }
  };

  // Transaction selection helpers
  const toggleTransactionSelection = (sessionId: string, transactionIndex: number) => {
    setSelectedTransactions(prev => {
      const sessionSelections = prev[sessionId] || new Set();
      const newSelections = new Set(sessionSelections);
      
      if (newSelections.has(transactionIndex)) {
        newSelections.delete(transactionIndex);
      } else {
        newSelections.add(transactionIndex);
      }
      
      return {
        ...prev,
        [sessionId]: newSelections
      };
    });
  };

  const toggleSelectAll = (sessionId: string) => {
    const sessionData = transactionData[sessionId];
    if (!sessionData) return;

    setSelectedTransactions(prev => {
      const sessionSelections = prev[sessionId] || new Set();
      const allSelected = sessionSelections.size === sessionData.transactions.length;
      
      if (allSelected) {
        // Deselect all
        return {
          ...prev,
          [sessionId]: new Set()
        };
      } else {
        // Select all
        const allIndices = new Set(sessionData.transactions.map((_, index) => index));
        return {
          ...prev,
          [sessionId]: allIndices
        };
      }
    });
  };

  const handleCreateEntry = (sessionId: string, transactionIndex: number) => {
    const sessionData = transactionData[sessionId];
    if (!sessionData) return;
    
    const transaction = sessionData.transactions[transactionIndex];
    console.log('Creating entry for transaction:', transaction);
    
    setCreateEntryModal({
      isOpen: true,
      transaction: transaction,
    });
  };

  const handleBulkCreateEntries = (sessionId: string) => {
    const sessionData = transactionData[sessionId];
    const selections = selectedTransactions[sessionId];
    if (!sessionData || !selections || selections.size === 0) return;

    const selectedTransactionData = Array.from(selections).map(index => sessionData.transactions[index]);
    console.log('Creating bulk entries for transactions:', selectedTransactionData);
    // TODO: Open bulk creation interface
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

  const cardStyle = {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "16px",
  };

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    color: "#374151",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    marginRight: "8px",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#3b82f6",
    color: "white",
    border: "1px solid #3b82f6",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#ef4444",
    color: "white",
    border: "1px solid #ef4444",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "processing":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(Math.abs(amount));
  };

  if (loading) {
    return (
      <>
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "32px", color: "#3b82f6" }}
            >
              upload_file
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
                Bank Import
              </h1>
              <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
                Loading import sessions...
              </p>
            </div>
          </div>
        </div>
        <div style={contentStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "18px",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                Loading...
              </div>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                Fetching import sessions
              </div>
            </div>
          </div>
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
            upload_file
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
              Bank Import
            </h1>
            <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
              Import bank statements and detect recurring payments
            </p>
          </div>
        </div>
      </div>

      <div style={contentStyle}>
        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
              color: "#dc2626",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Upload Section */}
        <div style={cardStyle}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a1a1a",
              marginBottom: "16px",
            }}
          >
            Upload Bank Statement
          </h3>
          <p
            style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}
          >
            Upload a PDF bank statement to automatically detect recurring
            payments like utilities, subscriptions, and council tax.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                flex: 1,
              }}
            />
            <button
              style={
                selectedFile
                  ? primaryButtonStyle
                  : { ...buttonStyle, cursor: "not-allowed", opacity: 0.5 }
              }
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Uploading..." : "Upload Statement"}
            </button>
          </div>

          {/* Demo notice */}
          <div
            style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #bfdbfe",
              borderRadius: "6px",
              padding: "12px",
              fontSize: "14px",
              color: "#1e40af",
            }}
          >
            <strong>Demo Mode:</strong> Upload a PDF bank statement to
            automatically detect recurring payments like British Gas, Council
            Tax, Netflix, and more. The system supports major UK banks including
            NatWest, Barclays, and HSBC.
          </div>

          {selectedFile && (
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              Selected: {selectedFile.name} (
              {Math.round(selectedFile.size / 1024)} KB)
            </div>
          )}
        </div>

        {/* Import Sessions */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1a1a1a",
                margin: 0,
              }}
            >
              Import Sessions
            </h3>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={buttonStyle} onClick={loadSessions}>
                Refresh
              </button>
              <button
                style={buttonStyle}
                onClick={async () => {
                  try {
                    const response = await fetch("/api/import/sessions", {
                      credentials: "include",
                    });
                    const data = await response.json();
                    alert(
                      `API Test: ${
                        response.ok ? "Success" : "Failed"
                      }\n${JSON.stringify(data, null, 2)}`
                    );
                  } catch (err: any) {
                    alert(`API Test Failed: ${err.message}`);
                  }
                }}
              >
                Test API
              </button>
            </div>
          </div>

          {sessions.length === 0 ? (
            <p
              style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}
            >
              No import sessions found. Upload a bank statement to get started.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {sessions.map((session) => (
                <div
                  key={session._id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          fontSize: "16px",
                          fontWeight: "500",
                          color: "#1a1a1a",
                          margin: "0 0 4px 0",
                        }}
                      >
                        {session.filename}
                      </h4>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          margin: 0,
                        }}
                      >
                        Uploaded:{" "}
                        {new Date(session.createdAt).toLocaleDateString(
                          "en-GB"
                        )}
                        {session.bank_name && ` • ${session.bank_name}`}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          backgroundColor: `${getStatusColor(
                            session.status
                          )}20`,
                          color: getStatusColor(session.status),
                        }}
                      >
                        {session.status.charAt(0).toUpperCase() +
                          session.status.slice(1)}
                      </span>
                      <button
                        style={dangerButtonStyle}
                        onClick={() => deleteSession(session._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {session.statistics && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          padding: "8px",
                          backgroundColor: "#f8fafc",
                          borderRadius: "4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#1a1a1a",
                          }}
                        >
                          {session.statistics.total_transactions}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          Transactions
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "8px",
                          backgroundColor: "#f8fafc",
                          borderRadius: "4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#10b981",
                          }}
                        >
                          {session.statistics.recurring_detected}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          Recurring
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "8px",
                          backgroundColor: "#f8fafc",
                          borderRadius: "4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#ef4444",
                          }}
                        >
                          {formatCurrency(session.statistics.total_debits)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          Debits
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "8px",
                          backgroundColor: "#f8fafc",
                          borderRadius: "4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#10b981",
                          }}
                        >
                          {formatCurrency(session.statistics.total_credits)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          Credits
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Debug Raw Session Data */}
                  <div style={{ marginBottom: "16px" }}>
                    <h5
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1a1a1a",
                        marginBottom: "8px",
                      }}
                    >
                      Debug: Raw Session Data
                    </h5>
                    <div
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e5e7eb",
                        borderRadius: "4px",
                        padding: "12px",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(session, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* All Parsed Transactions Table */}
                  {transactionData[session._id] && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <h5
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#1a1a1a",
                            margin: 0,
                          }}
                        >
                          All Parsed Transactions (
                          {transactionData[session._id].transaction_count} total)
                        </h5>
                        {selectedTransactions[session._id] && selectedTransactions[session._id].size > 0 && (
                          <button
                            style={{
                              ...primaryButtonStyle,
                              fontSize: "12px",
                              padding: "6px 12px",
                            }}
                            onClick={() => handleBulkCreateEntries(session._id)}
                          >
                            Create Entries ({selectedTransactions[session._id].size})
                          </button>
                        )}
                      </div>
                      <div
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          overflow: "hidden",
                          maxHeight: "400px",
                          overflowY: "auto",
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            fontSize: "12px",
                            borderCollapse: "collapse",
                          }}
                        >
                          <thead>
                            <tr
                              style={{
                                backgroundColor: "#f8fafc",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "center",
                                  fontWeight: "600",
                                  color: "#374151",
                                  width: "40px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedTransactions[session._id]?.size === 
                                    transactionData[session._id].transactions.length &&
                                    transactionData[session._id].transactions.length > 0
                                  }
                                  onChange={() => toggleSelectAll(session._id)}
                                  style={{ cursor: "pointer" }}
                                />
                              </th>
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "left",
                                  fontWeight: "600",
                                  color: "#374151",
                                }}
                              >
                                Date
                              </th>
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "left",
                                  fontWeight: "600",
                                  color: "#374151",
                                }}
                              >
                                Description
                              </th>
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "right",
                                  fontWeight: "600",
                                  color: "#374151",
                                }}
                              >
                                Amount
                              </th>
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "left",
                                  fontWeight: "600",
                                  color: "#374151",
                                  fontSize: "11px",
                                }}
                              >
                                Original Text
                              </th>
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "center",
                                  fontWeight: "600",
                                  color: "#374151",
                                  width: "120px",
                                }}
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactionData[session._id].transactions
                              .sort(
                                (a, b) =>
                                  new Date(a.date).getTime() -
                                  new Date(b.date).getTime()
                              )
                              .map((transaction, txIndex) => {
                                const isSelected = selectedTransactions[session._id]?.has(txIndex) || false;
                                const isProcessed = transaction.status === "processed";
                                
                                return (
                                  <tr
                                    key={txIndex}
                                    style={{ 
                                      borderBottom: "1px solid #f3f4f6",
                                      backgroundColor: isSelected ? "#f0f9ff" : isProcessed ? "#f8fafc" : "transparent"
                                    }}
                                  >
                                    <td
                                      style={{
                                        padding: "6px 12px",
                                        textAlign: "center",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleTransactionSelection(session._id, txIndex)}
                                        disabled={isProcessed}
                                        style={{ cursor: isProcessed ? "not-allowed" : "pointer" }}
                                      />
                                    </td>
                                    <td
                                      style={{
                                        padding: "6px 12px",
                                        color: "#374151",
                                      }}
                                    >
                                      {new Date(
                                        transaction.date
                                      ).toLocaleDateString("en-GB")}
                                    </td>
                                    <td
                                      style={{
                                        padding: "6px 12px",
                                        color: "#374151",
                                        maxWidth: "200px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: "11px",
                                          color: "#6b7280",
                                          wordWrap: "break-word",
                                        }}
                                      >
                                        {transaction.description}
                                      </div>
                                    </td>
                                    <td
                                      style={{
                                        padding: "6px 12px",
                                        textAlign: "right",
                                        fontWeight: "500",
                                        color:
                                          transaction.amount < 0
                                            ? "#dc2626"
                                            : "#059669",
                                      }}
                                    >
                                      {formatCurrency(transaction.amount)}
                                    </td>
                                    <td
                                      style={{
                                        padding: "6px 12px",
                                        fontSize: "10px",
                                        color: "#6b7280",
                                        maxWidth: "150px",
                                        wordWrap: "break-word",
                                        fontFamily: "monospace",
                                      }}
                                    >
                                      {transaction.originalText}
                                    </td>
                                    <td
                                      style={{
                                        padding: "6px 12px",
                                        textAlign: "center",
                                      }}
                                    >
                                      {isProcessed ? (
                                        <span
                                          style={{
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            fontSize: "10px",
                                            fontWeight: "500",
                                            backgroundColor: "#10b98120",
                                            color: "#10b981",
                                          }}
                                        >
                                          Entry Created
                                        </span>
                                      ) : (
                                        <button
                                          style={{
                                            ...primaryButtonStyle,
                                            fontSize: "10px",
                                            padding: "4px 8px",
                                            marginRight: 0,
                                          }}
                                          onClick={() => handleCreateEntry(session._id, txIndex)}
                                        >
                                          Create Entry
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {session.recurring_payments &&
                    session.recurring_payments.length > 0 && (
                      <div>
                        <h5
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#1a1a1a",
                            marginBottom: "8px",
                          }}
                        >
                          Recurring Payment Suggestions
                        </h5>
                        <div style={{ display: "grid", gap: "8px" }}>
                          {session.recurring_payments.map(
                            (suggestion, index) => (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "8px 12px",
                                  backgroundColor: "#f8fafc",
                                  borderRadius: "4px",
                                  border: "1px solid #e5e7eb",
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      fontWeight: "500",
                                      fontSize: "14px",
                                      color: "#1a1a1a",
                                    }}
                                  >
                                    {suggestion.payee}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#6b7280",
                                    }}
                                  >
                                    {suggestion.category} •{" "}
                                    {suggestion.frequency} •{" "}
                                    {formatCurrency(suggestion.amount)} •{" "}
                                    {Math.round(suggestion.confidence * 100)}%
                                    confident •{" "}
                                    {suggestion.transactions?.length || 0}{" "}
                                    transactions
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: "4px" }}>
                                  {suggestion.status === "pending" && (
                                    <>
                                      <button
                                        style={{
                                          ...primaryButtonStyle,
                                          fontSize: "12px",
                                          padding: "4px 8px",
                                        }}
                                        onClick={() =>
                                          confirmSuggestions(session._id, [
                                            { index, action: "accept" },
                                          ])
                                        }
                                      >
                                        Accept
                                      </button>
                                      <button
                                        style={{
                                          ...buttonStyle,
                                          fontSize: "12px",
                                          padding: "4px 8px",
                                        }}
                                        onClick={() =>
                                          confirmSuggestions(session._id, [
                                            { index, action: "reject" },
                                          ])
                                        }
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {suggestion.status !== "pending" && (
                                    <span
                                      style={{
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontSize: "10px",
                                        fontWeight: "500",
                                        backgroundColor:
                                          suggestion.status === "accepted"
                                            ? "#10b98120"
                                            : "#f59e0b20",
                                        color:
                                          suggestion.status === "accepted"
                                            ? "#10b981"
                                            : "#f59e0b",
                                      }}
                                    >
                                      {suggestion.status
                                        .charAt(0)
                                        .toUpperCase() +
                                        suggestion.status.slice(1)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateEntryFromTransactionModal
        isOpen={createEntryModal.isOpen}
        onClose={() => setCreateEntryModal({ isOpen: false, transaction: null })}
        onSuccess={() => {
          setCreateEntryModal({ isOpen: false, transaction: null });
          // Refresh the page data to reflect the new entry
          loadSessions();
        }}
        transaction={createEntryModal.transaction}
      />
    </>
  );
}
