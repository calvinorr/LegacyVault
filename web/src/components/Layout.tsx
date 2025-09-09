import React from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  onSignOut?: () => void;
}

interface TopNavigationProps {
  user?: any;
  onSignOut?: () => void;
}

function TopNavigation({ user, onSignOut }: TopNavigationProps) {
  const location = useLocation();

  const navStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    backgroundColor: "white",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.08)",
  };

  const leftSideStyle = {
    display: "flex",
    alignItems: "center",
    gap: "40px",
  };

  const logoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const navLinksStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const rightSideStyle = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const userInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "6px 12px",
    borderRadius: "6px",
    backgroundColor: "#f9fafb",
  };

  const userNameStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  };

  const signOutButtonStyle = {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "white",
    color: "#6b7280",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const navLinkStyle = (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease-in-out",
    backgroundColor: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
    color: isActive ? "#3b82f6" : "#6b7280",
    border: "1px solid transparent",
  });

  return (
    <nav style={navStyle}>
      <div style={leftSideStyle}>
        {/* Logo */}
        <div style={logoStyle}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "28px", color: "#3b82f6" }}
          >
            shield_lock
          </span>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1a1a1a",
              margin: 0,
            }}
          >
            LegacyLock
          </h1>
        </div>

        {/* Navigation Links */}
        <div style={navLinksStyle}>
          <Link to="/" style={navLinkStyle(location.pathname === "/")}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              dashboard
            </span>
            Dashboard
          </Link>
          <Link
            to="/accounts"
            style={navLinkStyle(location.pathname === "/accounts")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              account_balance_wallet
            </span>
            Accounts
          </Link>
          <Link
            to="/contacts"
            style={navLinkStyle(location.pathname === "/contacts")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              group
            </span>
            Contacts
          </Link>
          <Link
            to="/documents"
            style={navLinkStyle(location.pathname === "/documents")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              description
            </span>
            Documents
          </Link>
          <Link
            to="/settings"
            style={navLinkStyle(location.pathname === "/settings")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              settings
            </span>
            Settings
          </Link>
        </div>
      </div>

      {/* User Info */}
      <div style={rightSideStyle}>
        {user ? (
          <>
            <div style={userInfoStyle}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px", color: "#6b7280" }}
              >
                account_circle
              </span>
              <span style={userNameStyle}>{user.displayName}</span>
            </div>
            <button onClick={onSignOut} style={signOutButtonStyle}>
              Sign out
            </button>
          </>
        ) : (
          <Link to="/login" style={signOutButtonStyle}>
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

export default function Layout({ children, user, onSignOut }: LayoutProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: 'Inter, "Noto Sans", sans-serif',
        background: "white",
        color: "#1a1a1a",
      }}
    >
      <TopNavigation user={user} onSignOut={onSignOut} />
      <main style={{ background: "white", minHeight: "calc(100vh - 80px)" }}>
        {children}
      </main>
    </div>
  );
}
