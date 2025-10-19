import React from "react";
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
  Wrench
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
    fontWeight: isActive ? "600" : "500",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: isActive ? "#0f172a" : "transparent",
    color: isActive ? "#ffffff" : "#64748b",
    border: `1px solid ${isActive ? "#0f172a" : "transparent"}`,
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
          <Link to="/" style={navLinkStyle(isPathActive("/"))}>
            <LayoutDashboard size={18} strokeWidth={1.5} />
            Home
          </Link>
          {/* Parent Entity Links */}
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
            to="/domains"
            style={navLinkStyle(isPathActive("/domains"))}
          >
            <Layers size={18} strokeWidth={1.5} />
            Admin
          </Link>
          <Link
            to="/bank-import"
            style={navLinkStyle(isPathActive("/bank-import"))}
          >
            <Upload size={18} strokeWidth={1.5} />
            Bank Import
          </Link>
          <Link
            to="/transactions"
            style={navLinkStyle(isPathActive("/transactions"))}
          >
            <List size={18} strokeWidth={1.5} />
            Transactions
          </Link>
          <Link
            to="/renewals"
            style={navLinkStyle(isPathActive("/renewals"))}
          >
            <Calendar size={18} strokeWidth={1.5} />
            Renewals
          </Link>
          <Link
            to="/emergency"
            style={{
              ...navLinkStyle(isPathActive("/emergency")),
              backgroundColor: isPathActive("/emergency") ? "#dc2626" : "#fef2f2",
              color: isPathActive("/emergency") ? "#ffffff" : "#dc2626",
              border: "1px solid #fecaca",
            }}
          >
            <AlertCircle size={18} strokeWidth={1.5} />
            Emergency
          </Link>
          <Link
            to="/settings"
            style={navLinkStyle(isPathActive("/settings"))}
          >
            <Settings size={18} strokeWidth={1.5} />
            Settings
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin/domains"
              style={navLinkStyle(isPathActive("/admin/domains"))}
            >
              <Shield size={18} strokeWidth={1.5} />
              Admin
            </Link>
          )}
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
