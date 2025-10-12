import React from "react";
import { Shield, Lock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login(): JSX.Element {
  const { signIn, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#fefefe",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #fefefe 100%)",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
        }}
      >
        {/* Logo and Brand */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              backgroundColor: "#0f172a",
              borderRadius: "20px",
              marginBottom: "24px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
            }}
          >
            <Shield size={40} color="#ffffff" strokeWidth={1.5} />
          </div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#0f172a",
              margin: "0 0 8px 0",
              letterSpacing: "-0.025em",
            }}
          >
            LegacyLock
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#64748b",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            Secure household finance management for couples
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "40px",
            border: "1px solid #f1f5f9",
            boxShadow:
              "0 25px 50px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05)",
            marginBottom: "32px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "64px",
                height: "64px",
                backgroundColor: "#f8fafc",
                borderRadius: "16px",
                marginBottom: "16px",
                border: "1px solid #f1f5f9",
              }}
            >
              <Lock size={28} color="#0f172a" strokeWidth={1.5} />
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#0f172a",
                margin: "0 0 8px 0",
                letterSpacing: "-0.025em",
              }}
            >
              Sign In
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              Access your secure household finance vault
            </p>
          </div>

          <button
            onClick={signIn}
            disabled={loading}
            style={{
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "14px 24px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.08)",
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.boxShadow = "0 4px 12px 0 rgba(15, 23, 42, 0.12)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(15, 23, 42, 0.08)";
              }
            }}
          >
            <svg style={{ width: "20px", height: "20px" }} viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #f1f5f9",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#64748b",
                margin: "0 0 4px 0",
                textAlign: "center",
                lineHeight: "1.5",
              }}
            >
              🔒 Secure authentication via Google OAuth
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#64748b",
                margin: 0,
                textAlign: "center",
                lineHeight: "1.5",
              }}
            >
              New users require admin approval
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                flexShrink: 0,
              }}
            >
              🏦
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a",
                  margin: "0 0 2px 0",
                }}
              >
                Bank Accounts
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: 0,
                }}
              >
                Secure storage
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                flexShrink: 0,
              }}
            >
              🏠
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a",
                  margin: "0 0 2px 0",
                }}
              >
                Property
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: 0,
                }}
              >
                Utilities & bills
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                flexShrink: 0,
              }}
            >
              🚗
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a",
                  margin: "0 0 2px 0",
                }}
              >
                Vehicles
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: 0,
                }}
              >
                Insurance & tax
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                flexShrink: 0,
              }}
            >
              💼
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f172a",
                  margin: "0 0 2px 0",
                }}
              >
                Insurance
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: 0,
                }}
              >
                Policies & cover
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
