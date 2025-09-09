import React, { useState, useEffect } from "react";
import { getMe, getAllUsers, approveUser, User } from "../api";
import BankImport from "./BankImport";

type SettingsSection =
  | "profile"
  | "security"
  | "sharing"
  | "notifications"
  | "data"
  | "audit"
  | "bankimport";

export default function Settings() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userData = await getMe();
      setUser(userData.user);

      // Only load all users if current user is admin
      if (userData.user.role === "admin") {
        try {
          const usersData = await getAllUsers();
          setAllUsers(usersData.users);
        } catch (err) {
          // Non-admin users will get 403, which is expected
          console.log("Cannot load users - not admin");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load settings data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId);
      // Reload data to refresh user list
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to approve user");
    }
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
    display: "grid",
    gridTemplateColumns: "250px 1fr",
    gap: "32px",
  };

  const sidebarStyle = {
    borderRight: "1px solid #e5e7eb",
    paddingRight: "24px",
  };

  const navButtonStyle = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: active ? "#f0f9ff" : "transparent",
    color: active ? "#3b82f6" : "#6b7280",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "left" as const,
    transition: "all 0.2s",
    marginBottom: "4px",
  });

  const sectionStyle = {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "24px",
  };

  const cardStyle = {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
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

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    marginBottom: "16px",
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
              settings
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
                Settings
              </h1>
              <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
                Loading...
              </p>
            </div>
          </div>
        </div>
        <div style={contentStyle}>
          <p>Loading your settings...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "32px", color: "#3b82f6" }}
            >
              settings
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
                Settings
              </h1>
              <p style={{ color: "#dc2626", margin: 0, fontSize: "16px" }}>
                Error: {error}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const renderProfileSection = () => (
    <div>
      <div style={sectionStyle}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a1a1a",
            marginBottom: "16px",
          }}
        >
          Profile Information
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              Display Name
            </label>
            <input
              style={inputStyle}
              type="text"
              value={user.displayName || "Not provided"}
              readOnly
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              Email Address
            </label>
            <input
              style={inputStyle}
              type="email"
              value={user.email || "Not provided"}
              readOnly
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              Role
            </label>
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: "#f3f4f6",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "16px",
              }}
            >
              {user.role === "admin" ? "Administrator" : "User"}
            </div>
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              Member Since
            </label>
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: "#f3f4f6",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "16px",
              }}
            >
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-GB")
                : "Not available"}
            </div>
          </div>
        </div>
        <button style={primaryButtonStyle}>Update Profile</button>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div>
      <div style={sectionStyle}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a1a1a",
            marginBottom: "16px",
          }}
        >
          Security Settings
        </h3>
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
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
                Two-Factor Authentication
              </h4>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Add an extra layer of security to your account
              </p>
            </div>
            <button style={buttonStyle}>Enable</button>
          </div>
        </div>
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
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
                Session Management
              </h4>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Manage active sessions across devices
              </p>
            </div>
            <button style={buttonStyle}>View Sessions</button>
          </div>
        </div>
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
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
                Login Notifications
              </h4>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Get notified of new login attempts
              </p>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                defaultChecked
                style={{ marginRight: "8px" }}
              />
              <span style={{ fontSize: "14px", color: "#374151" }}>
                Enabled
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSharingSection = () => (
    <div>
      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
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
            {user?.role === "admin" ? "User Management" : "Family Members"}
          </h3>
          {user?.role === "admin" && (
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              Total Users: {allUsers.length}
            </div>
          )}
        </div>
        <div style={{ display: "grid", gap: "12px" }}>
          {(user?.role === "admin" ? allUsers : [user]).map((member) => (
            <div
              key={member._id}
              style={{
                ...cardStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "32px",
                    color: member.approved ? "#10b981" : "#f59e0b",
                  }}
                >
                  account_circle
                </span>
                <div>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1a1a1a",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {member.displayName || "Unknown User"}
                    {member.role === "admin" && (
                      <span
                        style={{
                          marginLeft: "8px",
                          padding: "2px 6px",
                          backgroundColor: "#3b82f620",
                          color: "#3b82f6",
                          fontSize: "12px",
                          borderRadius: "4px",
                        }}
                      >
                        Admin
                      </span>
                    )}
                  </h4>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      margin: "0 0 2px 0",
                    }}
                  >
                    {member.email}
                  </p>
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                    Joined:{" "}
                    {member.createdAt
                      ? new Date(member.createdAt).toLocaleDateString("en-GB")
                      : "Unknown"}
                  </p>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    backgroundColor: member.approved
                      ? "#10b98120"
                      : "#f59e0b20",
                    color: member.approved ? "#10b981" : "#f59e0b",
                  }}
                >
                  {member.approved ? "Approved" : "Pending"}
                </span>
                {user?.role === "admin" &&
                  member._id !== user._id &&
                  !member.approved && (
                    <button
                      style={primaryButtonStyle}
                      onClick={() => handleApproveUser(member._id)}
                    >
                      Approve
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div>
      <div style={sectionStyle}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a1a1a",
            marginBottom: "16px",
          }}
        >
          Data Management
        </h3>
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
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
                Export Data
              </h4>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Download all your account data in JSON format
              </p>
            </div>
            <button style={buttonStyle}>Export</button>
          </div>
        </div>
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
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
                Data Backup
              </h4>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Automatic daily backups of your vault data
              </p>
            </div>
            <span
              style={{
                padding: "4px 8px",
                backgroundColor: "#10b98120",
                color: "#10b981",
                fontSize: "12px",
                fontWeight: "500",
                borderRadius: "12px",
              }}
            >
              Active
            </span>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ marginBottom: "16px" }}>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: "500",
                color: "#ef4444",
                margin: "0 0 8px 0",
              }}
            >
              Danger Zone
            </h4>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "16px",
              }}
            >
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button style={dangerButtonStyle}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );

  const sectionComponents = {
    profile: renderProfileSection,
    security: renderSecuritySection,
    sharing: renderSharingSection,
    notifications: () => (
      <div style={sectionStyle}>
        <p>Notification settings coming soon...</p>
      </div>
    ),
    data: renderDataSection,
    audit: () => (
      <div style={sectionStyle}>
        <p>Audit logs coming soon...</p>
      </div>
    ),
    bankimport: () => <BankImport />,
  };

  const navigationItems = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "security", label: "Security", icon: "security" },
    { id: "sharing", label: "Family & Sharing", icon: "group" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "data", label: "Data & Privacy", icon: "storage" },
    { id: "audit", label: "Audit Logs", icon: "history" },
    ...(user?.role === "admin" ? [{ id: "bankimport", label: "Bank Import", icon: "upload_file" }] : []),
  ];

  return (
    <>
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "32px", color: "#3b82f6" }}
          >
            settings
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
              Settings
            </h1>
            <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
              Manage your account preferences and security
            </p>
          </div>
        </div>
      </div>

      <div style={contentStyle}>
        {/* Sidebar Navigation */}
        <div style={sidebarStyle}>
          <nav>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                style={navButtonStyle(activeSection === item.id)}
                onClick={() => setActiveSection(item.id as SettingsSection)}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px" }}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div>{sectionComponents[activeSection]()}</div>
      </div>
    </>
  );
}
