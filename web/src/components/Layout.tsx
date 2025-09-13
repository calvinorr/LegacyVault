import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Shield, 
  LayoutDashboard, 
  Wallet, 
  Receipt,
  FolderTree,
  Users, 
  FileText, 
  Settings,
  User
} from "lucide-react";

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
    padding: "20px 40px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #f1f5f9",
    boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.08)",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    backdropFilter: "blur(8px)",
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
    padding: "8px 16px",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
  };

  const userNameStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const signOutButtonStyle = {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "500",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const navLinkStyle = (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "12px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: isActive ? "#f1f5f9" : "transparent",
    color: isActive ? "#0f172a" : "#64748b",
    border: "1px solid transparent",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  });

  return (
    <nav style={navStyle}>
      <div style={leftSideStyle}>
        {/* Logo */}
        <div style={logoStyle}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            width: "32px",
            height: "32px",
            backgroundColor: "#0f172a",
            borderRadius: "8px"
          }}>
            <Shield size={18} color="#ffffff" strokeWidth={2} />
          </div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#0f172a",
              margin: 0,
              fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.025em",
            }}
          >
            LegacyLock
          </h1>
        </div>

        {/* Navigation Links */}
        <div style={navLinksStyle}>
          <Link to="/" style={navLinkStyle(location.pathname === "/")}>
            <LayoutDashboard size={18} strokeWidth={1.5} />
            Dashboard
          </Link>
          <Link
            to="/accounts"
            style={navLinkStyle(location.pathname === "/accounts")}
          >
            <Wallet size={18} strokeWidth={1.5} />
            Accounts
          </Link>
          <Link
            to="/bills"
            style={navLinkStyle(location.pathname === "/bills")}
          >
            <Receipt size={18} strokeWidth={1.5} />
            Bills
          </Link>
          <Link
            to="/categories"
            style={navLinkStyle(location.pathname === "/categories")}
          >
            <FolderTree size={18} strokeWidth={1.5} />
            Categories
          </Link>
          <Link
            to="/contacts"
            style={navLinkStyle(location.pathname === "/contacts")}
          >
            <Users size={18} strokeWidth={1.5} />
            Contacts
          </Link>
          <Link
            to="/documents"
            style={navLinkStyle(location.pathname === "/documents")}
          >
            <FileText size={18} strokeWidth={1.5} />
            Documents
          </Link>
          <Link
            to="/settings"
            style={navLinkStyle(location.pathname === "/settings")}
          >
            <Settings size={18} strokeWidth={1.5} />
            Settings
          </Link>
        </div>
      </div>

      {/* User Info */}
      <div style={rightSideStyle}>
        {user ? (
          <>
            <div style={userInfoStyle}>
              <User size={16} color="#64748b" strokeWidth={1.5} />
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
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        background: "#fefefe",
        color: "#0f172a",
      }}
    >
      <TopNavigation user={user} onSignOut={onSignOut} />
      <main style={{ background: "#fefefe", minHeight: "calc(100vh - 84px)" }}>
        {children}
      </main>
    </div>
  );
}
