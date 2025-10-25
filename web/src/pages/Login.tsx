import React from "react";
import { Shield, Lock, Heart, FileText, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px"
        }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "3px solid rgba(255, 255, 255, 0.1)",
              borderTopColor: "#ffffff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <div style={{ fontSize: "16px", fontWeight: "500", color: "#ffffff" }}>
            Loading...
          </div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Animated background pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, rgba(34, 211, 238, 0.03) 0%, transparent 50%)`,
          animation: "float 20s ease-in-out infinite",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          opacity: 0.5,
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-20px, 20px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "48px",
          }}
        >
          {/* Hero Section */}
          <div style={{
            textAlign: "center",
            animation: "fadeInUp 0.8s ease-out",
          }}>
            {/* Logo */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "96px",
                height: "96px",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                borderRadius: "24px",
                marginBottom: "32px",
                boxShadow: "0 20px 60px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                position: "relative",
              }}
            >
              <Shield size={48} color="#ffffff" strokeWidth={1.5} />
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "20px",
                  height: "20px",
                  background: "#10b981",
                  borderRadius: "50%",
                  border: "3px solid #0f172a",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "56px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #ffffff 0%, #0f172a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                margin: "0 0 16px 0",
                letterSpacing: "-0.03em",
                lineHeight: "1.1",
              }}
            >
              LegacyLock
            </h1>

            <p
              style={{
                fontSize: "20px",
                color: "#1e293b",
                margin: "0 0 8px 0",
                lineHeight: "1.6",
                fontWeight: "400",
              }}
            >
              Your UK Household Financial Vault
            </p>

            <p
              style={{
                fontSize: "16px",
                color: "#334155",
                margin: "0 auto",
                lineHeight: "1.6",
                maxWidth: "600px",
              }}
            >
              Store and manage bank accounts, utilities, insurance policies, and household finances securely in one place
            </p>
          </div>

          {/* Login Card */}
          <div
            style={{
              maxWidth: "480px",
              margin: "0 auto",
              width: "100%",
              animation: "fadeInUp 0.8s ease-out 0.2s both",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                borderRadius: "24px",
                padding: "48px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "72px",
                    height: "72px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "18px",
                    marginBottom: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <Lock size={32} color="#ffffff" strokeWidth={1.5} />
                </div>
                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: "600",
                    color: "#ffffff",
                    margin: "0 0 12px 0",
                    letterSpacing: "-0.025em",
                  }}
                >
                  Welcome Back
                </h2>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#1e293b",
                    margin: 0,
                    lineHeight: "1.6",
                  }}
                >
                  Sign in securely with your Google account
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
                  padding: "16px 32px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  opacity: loading ? 0.5 : 1,
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
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
                  padding: "20px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <Sparkles size={18} color="#34d399" strokeWidth={2} />
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#1e293b",
                      margin: 0,
                      fontWeight: "500",
                    }}
                  >
                    Secure OAuth 2.0 Authentication
                  </p>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#334155",
                    margin: 0,
                    lineHeight: "1.5",
                  }}
                >
                  New users require admin approval • All data encrypted at rest
                </p>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              maxWidth: "1000px",
              margin: "0 auto",
              width: "100%",
              animation: "fadeInUp 0.8s ease-out 0.4s both",
            }}
          >
            {[
              { icon: "🏦", title: "Bank Accounts", desc: "Current accounts, ISAs, and savings" },
              { icon: "🏠", title: "Property", desc: "Utilities, Council Tax, and bills" },
              { icon: "🚗", title: "Vehicles", desc: "MOT, insurance, and vehicle tax" },
              { icon: "💼", title: "Insurance", desc: "Life, health, and home policies" },
              { icon: "📊", title: "Bank Import", desc: "Parse PDF statements automatically" },
              { icon: "🔄", title: "Pattern Detection", desc: "Smart recurring payment tracking" },
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                  }}
                >
                  {feature.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#ffffff",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {feature.title}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#334155",
                      margin: 0,
                      lineHeight: "1.4",
                    }}
                  >
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              paddingTop: "24px",
              animation: "fadeInUp 0.8s ease-out 0.6s both",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "#1e293b",
                margin: 0,
              }}
            >
              Built for UK households • Secure • Private • Always free for couples
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
