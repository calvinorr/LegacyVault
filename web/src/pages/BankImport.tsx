import React, { useState, useEffect } from "react";
import { Upload, Building2, TrendingUp, AlertTriangle, CheckCircle, Clock, Calendar, FileText, Trash2, List } from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ImportTimeline from "../components/bank-import/ImportTimeline";

interface ImportSession {
  _id: string;
  filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  processing_stage?: string;
  bank_name?: string;
  statistics?: {
    total_transactions: number;
    date_range_days: number;
    total_debits: number;
    total_credits: number;
  };
  createdAt: string;
  expires_at: string;
}

export default function BankImport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ImportSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [timelineMonths, setTimelineMonths] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Redirect non-admin users
  if (user && user.role !== "admin") {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fefefe',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            backgroundColor: '#fef2f2',
            borderRadius: '16px',
            margin: '0 auto 24px'
          }}>
            <AlertTriangle size={28} color="#dc2626" strokeWidth={1.5} />
          </div>
          <h1 style={{ 
            fontSize: '24px',
            fontWeight: '600',
            color: '#0f172a', 
            marginBottom: '8px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}>
            Access Denied
          </h1>
          <p style={{ 
            fontSize: '16px',
            color: '#64748b',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            lineHeight: '1.5'
          }}>
            This feature is only available to administrators.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadSessions();
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const response = await fetch("/api/import/timeline", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load timeline");
      }

      const data = await response.json();
      setTimelineMonths(data.timeline || []);
    } catch (err: any) {
      console.error("Error loading timeline:", err);
    }
  };

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

      const sessions = data.sessions || [];
      setSessions(sessions);
    } catch (err: any) {
      console.error("Error loading sessions:", err);
      setError(err.message || "Failed to load import sessions");
      setSessions([]); // Ensure we don't leave sessions in an undefined state
    } finally {
      setLoading(false);
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

  const handleMonthClick = (month: string) => {
    setSelectedMonth(month === selectedMonth ? null : month);
  };

  // Filter sessions based on selected month
  const filteredSessions = selectedMonth
    ? sessions.filter((session) => {
        const sessionDate = new Date(session.createdAt);
        const sessionMonth = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
        return sessionMonth === selectedMonth;
      })
    : sessions;

  const pageStyle = {
    minHeight: '100vh',
    background: '#fefefe',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#0f172a'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px'
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #f1f5f9',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const buttonStyle = {
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginRight: '8px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: '1px solid #0f172a'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: '1px solid #dc2626'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#059669";
      case "processing":
        return "#d97706";
      case "failed":
        return "#dc2626";
      default:
        return "#64748b";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={14} strokeWidth={2} />;
      case "processing":
        return <Clock size={14} strokeWidth={2} />;
      case "failed":
        return <AlertTriangle size={14} strokeWidth={2} />;
      default:
        return <FileText size={14} strokeWidth={2} />;
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
      <div style={pageStyle}>
        <div style={containerStyle}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: '#0f172a',
                borderRadius: '8px'
              }}>
                <Building2 size={18} color="#ffffff" strokeWidth={2} />
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0',
                letterSpacing: '-0.025em'
              }}>
                Bank Statement Import
              </h1>
            </div>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              fontWeight: '400',
              margin: '0',
              lineHeight: '1.5'
            }}>
              Loading import sessions...
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                backgroundColor: '#f1f5f9',
                borderRadius: '16px',
                margin: '0 auto 24px'
              }}>
                <Clock size={28} color="#64748b" strokeWidth={1.5} />
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '500',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                Loading...
              </div>
              <div style={{
                fontSize: '14px',
                color: '#64748b'
              }}>
                Fetching import sessions
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: '#0f172a',
              borderRadius: '8px'
            }}>
              <Building2 size={18} color="#ffffff" strokeWidth={2} />
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0',
              letterSpacing: '-0.025em'
            }}>
              Bank Statement Import
            </h1>
          </div>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            fontWeight: '400',
            margin: '0',
            lineHeight: '1.5'
          }}>
            Upload and manage your bank statement imports
          </p>
        </div>
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={20} color="#dc2626" strokeWidth={1.5} />
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '4px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                Error
              </div>
              <div style={{
                fontSize: '14px',
                color: '#dc2626',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Upload size={20} color="#0f172a" strokeWidth={1.5} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0'
            }}>
              Upload Bank Statement
            </h3>
          </div>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            Upload a PDF bank statement to parse transactions and detect patterns across imports.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                flex: 1,
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                backgroundColor: '#ffffff'
              }}
            />
            <button
              style={
                selectedFile
                  ? primaryButtonStyle
                  : { ...buttonStyle, cursor: 'not-allowed', opacity: 0.5 }
              }
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Statement'}
            </button>
          </div>

          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <TrendingUp size={20} color="#0ea5e9" strokeWidth={1.5} />
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#0ea5e9',
                marginBottom: '4px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                Auto-Detection
              </div>
              <div style={{
                fontSize: '14px',
                color: '#0ea5e9',
                lineHeight: '1.4',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                System supports major UK banks including NatWest, Barclays, and HSBC. Automatically detects British Gas, Council Tax, Netflix, and more.
              </div>
            </div>
          </div>

          {selectedFile && (
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}>
              Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </div>
          )}
        </div>

        {/* Import Timeline */}
        {timelineMonths.length > 0 && (
          <div style={cardStyle}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={20} color="#0f172a" strokeWidth={1.5} />
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0'
                }}>
                  Import Timeline
                </h3>
              </div>
              <button
                style={{
                  ...primaryButtonStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={() => navigate('/transactions')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e293b';
                  e.currentTarget.style.borderColor = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f172a';
                  e.currentTarget.style.borderColor = '#0f172a';
                }}
              >
                <List size={18} strokeWidth={1.5} />
                View All Transactions
              </button>
            </div>
            <ImportTimeline
              months={timelineMonths}
              onMonthClick={handleMonthClick}
              selectedMonth={selectedMonth}
            />
            {selectedMonth && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#0ea5e9',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>
                  Showing imports from {new Date(selectedMonth + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    border: '1px solid #0ea5e9',
                    backgroundColor: 'transparent',
                    color: '#0ea5e9',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                  }}
                  onClick={() => setSelectedMonth(null)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0ea5e9';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#0ea5e9';
                  }}
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Import Sessions */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={20} color="#0f172a" strokeWidth={1.5} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0'
              }}>
                Import Sessions
              </h3>
            </div>
            <button 
              style={buttonStyle} 
              onClick={loadSessions}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              Refresh
            </button>
          </div>

          {sessions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 40px',
              color: '#64748b'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                backgroundColor: '#f1f5f9',
                borderRadius: '16px',
                margin: '0 auto 24px'
              }}>
                <FileText size={28} color="#64748b" strokeWidth={1.5} />
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                margin: '0',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                No import sessions found. Upload a bank statement to get started.
              </p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 40px',
              color: '#64748b'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                backgroundColor: '#f1f5f9',
                borderRadius: '16px',
                margin: '0 auto 24px'
              }}>
                <FileText size={28} color="#64748b" strokeWidth={1.5} />
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                margin: '0 0 8px 0',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                No imports found for selected month
              </p>
              <button
                style={{
                  ...buttonStyle,
                  marginRight: 0
                }}
                onClick={() => setSelectedMonth(null)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                Show All Sessions
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {filteredSessions.map((session) => (
                <div
                  key={session._id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}
                  >
                    <div>
                      <div>
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#0f172a',
                          margin: '0 0 8px 0',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          {session.filename}
                        </h4>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px'
                        }}>
                          <Calendar size={14} color="#64748b" strokeWidth={1.5} />
                          <span style={{
                            fontSize: '14px',
                            color: '#64748b',
                            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                          }}>
                            {new Date(session.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        {session.bank_name && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <Building2 size={14} color="#64748b" strokeWidth={1.5} />
                            <span style={{
                              fontSize: '14px',
                              color: '#64748b',
                              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                            }}>
                              {session.bank_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        backgroundColor: `${getStatusColor(session.status)}15`,
                        color: getStatusColor(session.status),
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                      }}>
                        {getStatusIcon(session.status)}
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </div>
                      <button
                        style={{
                          ...dangerButtonStyle,
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onClick={() => deleteSession(session._id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#b91c1c';
                          e.currentTarget.style.borderColor = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                          e.currentTarget.style.borderColor = '#dc2626';
                        }}
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                        Delete
                      </button>
                    </div>
                  </div>

                  {session.statistics && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '16px'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9'
                      }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '600',
                          color: '#0f172a',
                          marginBottom: '4px',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          {session.statistics.total_transactions}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b',
                          fontWeight: '500',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          Transactions
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'center',
                        padding: '16px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '12px',
                        border: '1px solid #fecaca'
                      }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '600',
                          color: '#dc2626',
                          marginBottom: '4px',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          {formatCurrency(session.statistics.total_debits)}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#dc2626',
                          fontWeight: '500',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          Debits
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'center',
                        padding: '16px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '12px',
                        border: '1px solid #dcfce7'
                      }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '600',
                          color: '#059669',
                          marginBottom: '4px',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          {formatCurrency(session.statistics.total_credits)}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#16a34a',
                          fontWeight: '500',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          Credits
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View Transactions Link */}
                  {session.statistics && session.statistics.total_transactions > 0 && (
                    <div style={{
                      marginTop: '20px',
                      padding: '16px',
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#0f172a',
                          marginBottom: '4px',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          {session.statistics.total_transactions} transactions imported
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#64748b',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          View and process transactions in the Transaction History page
                        </div>
                      </div>
                      <button
                        style={{
                          ...primaryButtonStyle,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginRight: 0
                        }}
                        onClick={() => navigate('/transactions')}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1e293b';
                          e.currentTarget.style.borderColor = '#1e293b';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#0f172a';
                          e.currentTarget.style.borderColor = '#0f172a';
                        }}
                      >
                        <List size={16} strokeWidth={1.5} />
                        View Transactions
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
