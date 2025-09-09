import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const sidebarStyle = {
    background: "white",
    borderRight: "1px solid #e5e7eb",
    color: "#1a1a1a",
  };

  const activeStyle = {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    color: "#3b82f6",
  };

  const inactiveStyle = {
    color: "#6b7280",
  };

  return (
    <aside
      className="flex h-screen flex-col justify-between p-4"
      style={sidebarStyle}
    >
      <div className="flex flex-col gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 p-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "32px", color: "#3b82f6" }}
          >
            shield_lock
          </span>
          <h1 className="text-lg font-bold" style={{ color: "#1a1a1a" }}>
            LegacyLock
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors"
            style={location.pathname === "/" ? activeStyle : inactiveStyle}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <p className="text-sm font-medium">Dashboard</p>
          </Link>
          <Link
            to="/accounts"
            className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors"
            style={
              location.pathname === "/accounts" ? activeStyle : inactiveStyle
            }
          >
            <span className="material-symbols-outlined">
              account_balance_wallet
            </span>
            <p className="text-sm font-medium">Accounts</p>
          </Link>
          <Link
            to="/contacts"
            className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors"
            style={
              location.pathname === "/contacts" ? activeStyle : inactiveStyle
            }
          >
            <span className="material-symbols-outlined">group</span>
            <p className="text-sm font-medium">Contacts</p>
          </Link>
          <Link
            to="/documents"
            className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors"
            style={
              location.pathname === "/documents" ? activeStyle : inactiveStyle
            }
          >
            <span className="material-symbols-outlined">description</span>
            <p className="text-sm font-medium">Documents</p>
          </Link>
        </nav>
      </div>

      {/* Settings */}
      <div className="flex flex-col gap-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors"
          style={inactiveStyle}
        >
          <span className="material-symbols-outlined">settings</span>
          <p className="text-sm font-medium">Settings</p>
        </Link>
      </div>
    </aside>
  );
}
