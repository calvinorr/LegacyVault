import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ModernDashboard from "./pages/ModernDashboard";
import EntryDetail from "./pages/EntryDetail";
import AuthRedirect from "./pages/AuthRedirect";
import Login from "./pages/Login";
import Accounts from "./pages/Accounts";
import Bills from "./pages/Bills";
import Categories from "./pages/Categories";
import Contacts from "./pages/Contacts";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import { useAuth, ProtectedRoute } from "./hooks/useAuth";

export default function App(): JSX.Element {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  // For login page, render without header
  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Layout user={user} onSignOut={signOut}>
      <Routes>
        {/* Dev redirect route: forward /auth/google to backend OAuth entrypoint */}
        <Route path="/auth/google" element={<AuthRedirect />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ModernDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <Contacts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entry/:id"
          element={
            <ProtectedRoute>
              <EntryDetail />
            </ProtectedRoute>
          }
        />
        {/* Keep old dashboard available for comparison */}
        <Route
          path="/old-dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}
