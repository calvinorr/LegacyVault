import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Calendar,
  AlertCircle,
  Settings,
  User,
  Car,
  Home,
  Briefcase,
  Wrench,
  Landmark,
  ChevronDown,
  Upload,
  List,
  Database,
  Activity
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
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Check if any admin path is active
  const isAdminSectionActive = (): boolean => {
    return location.pathname.startsWith('/bank-import') ||
           location.pathname.startsWith('/transactions') ||
           location.pathname.startsWith('/admin') ||
           location.pathname.startsWith('/domains') ||
           location.pathname.startsWith('/settings');
  };

  const navStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 40px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #0f172a",
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
    gap: "8px",
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
    border: "1px solid #0f172a",
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
    border: "1px solid #0f172a",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    color: "#1e293b",
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
    color: isActive ? "#ffffff" : "#1e293b",
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

          <Link to="/vehicles" style={navLinkStyle(isPathActive("/vehicles"))}>
            <Car size={18} strokeWidth={1.5} />
            Vehicles
          </Link>

          <Link to="/properties" style={navLinkStyle(isPathActive("/properties"))}>
            <Home size={18} strokeWidth={1.5} />
            Properties
          </Link>

          <Link to="/employments" style={navLinkStyle(isPathActive("/employments"))}>
            <Briefcase size={18} strokeWidth={1.5} />
            Employments
          </Link>

          <Link to="/services" style={navLinkStyle(isPathActive("/services"))}>
            <Wrench size={18} strokeWidth={1.5} />
            Services
          </Link>

          <Link to="/finance" style={navLinkStyle(isPathActive("/finance"))}>
            <Landmark size={18} strokeWidth={1.5} />
            Finance
          </Link>

          <Link to="/renewals" style={navLinkStyle(isPathActive("/renewals"))}>
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

          {/* Admin Dropdown - Only visible for admin users */}
          {user?.role === 'admin' && (
            <div style={{ position: "relative" }} ref={adminDropdownRef}>
              <button
                onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                style={{
                  ...navLinkStyle(isAdminSectionActive()),
                  cursor: "pointer",
                  border: `1px solid ${isAdminSectionActive() ? "#0f172a" : "transparent"}`,
                }}
              >
                <Shield size={18} strokeWidth={1.5} />
                Admin
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: isAdminDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Admin Dropdown Menu */}
              {isAdminDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: "0",
                    backgroundColor: "#ffffff",
                    border: "1px solid #0f172a",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.1)",
                    minWidth: "220px",
                    padding: "8px",
                    zIndex: 1000,
                  }}
                >
                  <Link
                    to="/bank-import"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: isPathActive("/bank-import") ? "#0f172a" : "#1e293b",
                      backgroundColor: isPathActive("/bank-import") ? "#f8fafc" : "transparent",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setIsAdminDropdownOpen(false)}
                  >
                    <Upload size={18} strokeWidth={1.5} />
                    Bank Import
                  </Link>

                  <Link
                    to="/transactions"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: isPathActive("/transactions") ? "#0f172a" : "#1e293b",
                      backgroundColor: isPathActive("/transactions") ? "#f8fafc" : "transparent",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setIsAdminDropdownOpen(false)}
                  >
                    <List size={18} strokeWidth={1.5} />
                    Transactions
                  </Link>

                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#0f172a",
                      margin: "8px 0",
                    }}
                  />

                  <Link
                    to="/domains"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: isPathActive("/domains") ? "#0f172a" : "#1e293b",
                      backgroundColor: isPathActive("/domains") ? "#f8fafc" : "transparent",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setIsAdminDropdownOpen(false)}
                  >
                    <Database size={18} strokeWidth={1.5} />
                    Domain Management
                  </Link>

                  <Link
                    to="/admin/system-status"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: isPathActive("/admin/system-status") ? "#0f172a" : "#1e293b",
                      backgroundColor: isPathActive("/admin/system-status") ? "#f8fafc" : "transparent",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setIsAdminDropdownOpen(false)}
                  >
                    <Activity size={18} strokeWidth={1.5} />
                    System Status
                  </Link>

                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#0f172a",
                      margin: "8px 0",
                    }}
                  />

                  <Link
                    to="/settings"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: isPathActive("/settings") ? "#0f172a" : "#1e293b",
                      backgroundColor: isPathActive("/settings") ? "#f8fafc" : "transparent",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setIsAdminDropdownOpen(false)}
                  >
                    <Settings size={18} strokeWidth={1.5} />
                    Settings
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div style={rightSideStyle}>
        {user ? (
          <>
            <div style={userInfoStyle}>
              <User size={16} color="#1e293b" strokeWidth={1.5} />
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
