// web/src/hooks/useAuth.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe, User } from "../api";
import { Navigate } from "react-router-dom";

// Simple auth context and hook
type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await getMe();
      setUser(res.user);
    } catch (err: any) {
      setUser(null);
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function signIn() {
    // Redirect to backend OAuth entrypoint (proxied through Vite)
    window.location.href = "/auth/google";
  }

  function signOut() {
    // Hit backend logout which will clear session cookie then redirect to home
    window.location.href = "/logout";
  }

  const value: AuthContextValue = {
    user,
    loading,
    error,
    refresh,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// ProtectedRoute: React Router v6 wrapper component
export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading, signOut } = useAuth();

  if (loading)
    return <div style={{ padding: 20 }}>Checking authentication…</div>;

  if (!user) {
    // Not authenticated: redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (user && !user.approved) {
    // User is authenticated but not approved
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Account Pending Approval</h2>
        <p>
          Your account is waiting for admin approval. Please contact the
          administrator.
        </p>
        <p>
          <strong>User:</strong> {user.displayName} ({user.email})
        </p>
        <button
          onClick={signOut}
          style={{ marginTop: 16, padding: "8px 16px" }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return children;
}
