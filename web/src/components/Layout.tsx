import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Calendar,
  AlertCircle,
  Settings,
  User,
  Layers,
  Upload,
  List,
  Car,
  Home,
  Briefcase,
  Wrench,
  Landmark,
  LogOut,
  ChevronDown,
  MoreHorizontal
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Helper function to check if a nav item is active
  const isPathActive = (path: string): boolean => {
    if (path === '/') {
      // Home is active only on exact match OR domain detail pages (property, vehicles, etc.)
      return location.pathname === '/' ||
             /^\/(property|vehicles|finance|employment|government|insurance|legal|services)(\/|$)/.test(location.pathname);
    }
    // For other paths, check if current path starts with the nav path
    return location.pathname.startsWith(path);
  };

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
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: "500",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    textDecoration: "none",
  };

  const navLinkStyle = (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "12px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: isActive ? "600" : "500",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: isActive ? "#0f172a" : "transparent",
    color: isActive ? "#ffffff" : "#64748b",
    border: `1px solid ${isActive ? "#0f172a" : "transparent"}`,
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  });

  const utilityLinkStyle = (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: isActive ? "600" : "500",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: isActive ? "#f1f5f9" : "transparent",
    color: isActive ? "#0f172a" : "#64748b",
    border: `1px solid ${isActive ? "#e2e8f0" : "transparent"}`,
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

        {/* Main Navigation Links */}
        <div style={navLinksStyle}>
          <Link to="/" style={navLinkStyle(isPathActive("/"))}>
            <LayoutDashboard size={18} strokeWidth={1.5} />
            Home
          </Link>
          <Link
            to="/vehicles-new"
            style={navLinkStyle(isPathActive("/vehicles-new"))}
          >
            <Car size={18} strokeWidth={1.5} />
            Vehicles
          </Link>
          <Link
            to="/properties-new"
            style={navLinkStyle(isPathActive("/properties-new"))}
          >
            <Home size={18} strokeWidth={1.5} />
            Properties
          </Link>
          <Link
            to="/employments-new"
            style={navLinkStyle(isPathActive("/employments-new"))}
          >
            <Briefcase size={18} strokeWidth={1.5} />
            Employments
          </Link>
          <Link
            to="/services-new"
            style={navLinkStyle(isPathActive("/services-new"))}
          >
            <Wrench size={18} strokeWidth={1.5} />
            Services
          </Link>
          <Link
            to="/finance-new"
            style={navLinkStyle(isPathActive("/finance-new"))}
          >
            <Landmark size={18} strokeWidth={1.5} />
            Finance
          </Link>
        </div>
      </div>

      {/* Utility Navigation & User Info */}
      <div style={rightSideStyle}>
        {/* Utility Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {/* Dropdown Menu for Tools */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              style={{
                ...utilityLinkStyle(
                  isPathActive("/bank-import") ||
                  isPathActive("/transactions") ||
                  isPathActive("/renewals")
                ),
                cursor: "pointer",
                border: "1px solid #e2e8f0",
              }}
            >
              <MoreHorizontal size={16} strokeWidth={1.5} />
              Tools
              <ChevronDown size={14} strokeWidth={1.5} />
            </button>

            {isDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  right: 0,
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  minWidth: "180px",
                  zIndex: 50,
                  overflow: "hidden",
                }}
              >
                <Link
                  to="/bank-import"
                  onClick={() => setIsDropdownOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: isPathActive("/bank-import") ? "#0f172a" : "#64748b",
                    backgroundColor: isPathActive("/bank-import") ? "#f8fafc" : "transparent",
                    transition: "all 0.2s",
                    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!isPathActive("/bank-import")) {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                      e.currentTarget.style.color = "#0f172a";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPathActive("/bank-import")) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#64748b";
                    }
                  }}
                >
                  <Upload size={16} strokeWidth={1.5} />
                  Bank Import
                </Link>
                <Link
                  to="/transactions"
                  onClick={() => setIsDropdownOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: isPathActive("/transactions") ? "#0f172a" : "#64748b",
                    backgroundColor: isPathActive("/transactions") ? "#f8fafc" : "transparent",
                    transition: "all 0.2s",
                    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!isPathActive("/transactions")) {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                      e.currentTarget.style.color = "#0f172a";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPathActive("/transactions")) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#64748b";
                    }
                  }}
                >
                  <List size={16} strokeWidth={1.5} />
                  Transactions
                </Link>
                <Link
                  to="/renewals"
                  onClick={() => setIsDropdownOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: isPathActive("/renewals") ? "#0f172a" : "#64748b",
                    backgroundColor: isPathActive("/renewals") ? "#f8fafc" : "transparent",
                    transition: "all 0.2s",
                    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!isPathActive("/renewals")) {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                      e.currentTarget.style.color = "#0f172a";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPathActive("/renewals")) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#64748b";
                    }
                  }}
                >
                  <Calendar size={16} strokeWidth={1.5} />
                  Renewals
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/emergency"
            style={{
              ...utilityLinkStyle(isPathActive("/emergency")),
              backgroundColor: isPathActive("/emergency") ? "#dc2626" : "#fef2f2",
              color: isPathActive("/emergency") ? "#ffffff" : "#dc2626",
              border: "1px solid #fecaca",
            }}
          >
            <AlertCircle size={16} strokeWidth={1.5} />
            Emergency
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin/domains"
              style={utilityLinkStyle(isPathActive("/admin/domains"))}
            >
              <Shield size={16} strokeWidth={1.5} />
              Admin
            </Link>
          )}
        </div>

        {/* User Menu */}
        {user ? (
          <>
            <Link
              to="/settings"
              style={{
                ...utilityLinkStyle(isPathActive("/settings")),
                padding: "8px 14px",
              }}
            >
              <Settings size={16} strokeWidth={1.5} />
              Settings
            </Link>
            <div style={userInfoStyle}>
              <User size={16} color="#64748b" strokeWidth={1.5} />
              <span style={userNameStyle}>{user.displayName}</span>
            </div>
            <a
              href="/auth/logout"
              style={signOutButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.color = "#475569";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              <LogOut size={16} strokeWidth={1.5} />
              Logout
            </a>
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
