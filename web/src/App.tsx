import React from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PropertyDomainPage from "./pages/PropertyDomainPage";
import PropertyRecordDetailPage from "./pages/PropertyRecordDetailPage";
import VehiclesDomainPage from "./pages/VehiclesDomainPage";
import VehicleRecordDetailPage from "./pages/VehicleRecordDetailPage";
// Legacy Finance pages removed - using new hierarchical system (Finance.tsx, FinanceDetail.tsx)
// import FinanceDomainPage from "./pages/FinanceDomainPage";
// import FinanceRecordDetailPage from "./pages/FinanceRecordDetailPage";
import EmploymentDomainPage from "./pages/EmploymentDomainPage";
import EmploymentRecordDetailPage from "./pages/EmploymentRecordDetailPage";
import GovernmentDomainPage from "./pages/GovernmentDomainPage";
import GovernmentRecordDetailPage from "./pages/GovernmentRecordDetailPage";
import InsuranceDomainPage from "./pages/InsuranceDomainPage";
import InsuranceRecordDetailPage from "./pages/InsuranceRecordDetailPage";
import LegalDomainPage from "./pages/LegalDomainPage";
import LegalRecordDetailPage from "./pages/LegalRecordDetailPage";
import ServicesDomainPage from "./pages/ServicesDomainPage";
import ServicesRecordDetailPage from "./pages/ServicesRecordDetailPage";
import RenewalDashboardPage from "./pages/RenewalDashboardPage";
import EmergencyViewPage from "./pages/EmergencyViewPage";
import DomainsPage from "./pages/DomainsPage";
import EntryDetail from "./pages/EntryDetail";
import AuthRedirect from "./pages/AuthRedirect";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import BankImport from "./pages/BankImport";
import TransactionHistory from "./pages/TransactionHistory";
// New parent entity pages
import Vehicles from "./pages/Vehicles";
import Properties from "./pages/Properties";
import Employments from "./pages/Employments";
import Services from "./pages/Services";
import Finance from "./pages/Finance";
// Parent entity detail pages
import { VehicleDetail } from "./pages/VehicleDetail";
import { PropertyDetail } from "./pages/PropertyDetail";
import { EmploymentDetail } from "./pages/EmploymentDetail";
import { ServiceDetail } from "./pages/ServiceDetail";
import { FinanceDetail } from "./pages/FinanceDetail";
// Admin pages
import AdminDomains from "./pages/AdminDomains";
import AdminSystemStatus from "./pages/AdminSystemStatus";
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
              <HomePage />
            </ProtectedRoute>
          }
        />
        {/* /dashboard redirects to home - using HomePage as unified dashboard */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        {/* New parent entity routes */}
        <Route
          path="/vehicles-new"
          element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties-new"
          element={
            <ProtectedRoute>
              <Properties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employments-new"
          element={
            <ProtectedRoute>
              <Employments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services-new"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance-new"
          element={
            <ProtectedRoute>
              <Finance />
            </ProtectedRoute>
          }
        />
        {/* Parent entity detail routes */}
        <Route
          path="/vehicles/:id"
          element={
            <ProtectedRoute>
              <VehicleDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <ProtectedRoute>
              <PropertyDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employments/:id"
          element={
            <ProtectedRoute>
              <EmploymentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/:id"
          element={
            <ProtectedRoute>
              <ServiceDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/:id"
          element={
            <ProtectedRoute>
              <FinanceDetail />
            </ProtectedRoute>
          }
        />
        {/* Redirects from old routes to new hierarchical structure (Epic 6 migration) */}
        <Route path="/vehicles" element={<Navigate to="/vehicles-new" replace />} />
        <Route path="/property" element={<Navigate to="/properties-new" replace />} />
        <Route path="/employment" element={<Navigate to="/employments-new" replace />} />
        <Route path="/services" element={<Navigate to="/services-new" replace />} />

        {/* Legacy domain routes (deprecated - redirects added above for main views) */}
        {/* Keeping detail routes temporarily for any existing bookmarks */}
        <Route
          path="/property/:recordId"
          element={
            <ProtectedRoute>
              <PropertyRecordDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles/:recordId"
          element={
            <ProtectedRoute>
              <VehicleRecordDetailPage />
            </ProtectedRoute>
          }
        />
        {/* Legacy Finance routes - redirect to new hierarchical system */}
        <Route path="/finance" element={<Navigate to="/finance-new" replace />} />
        <Route path="/finance/:recordId" element={<Navigate to="/finance-new" replace />} />
        <Route
          path="/government"
          element={
            <ProtectedRoute>
              <GovernmentDomainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government/:recordId"
          element={
            <ProtectedRoute>
              <GovernmentRecordDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insurance"
          element={
            <ProtectedRoute>
              <InsuranceDomainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insurance/:recordId"
          element={
            <ProtectedRoute>
              <InsuranceRecordDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/legal"
          element={
            <ProtectedRoute>
              <LegalDomainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/legal/:recordId"
          element={
            <ProtectedRoute>
              <LegalRecordDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/:recordId"
          element={
            <ProtectedRoute>
              <ServicesRecordDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/domains"
          element={
            <ProtectedRoute>
              <DomainsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/renewals"
          element={
            <ProtectedRoute>
              <RenewalDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency"
          element={
            <ProtectedRoute>
              <EmergencyViewPage />
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
          path="/admin/domains"
          element={
            <ProtectedRoute>
              <AdminDomains />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/system-status"
          element={
            <ProtectedRoute>
              <AdminSystemStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank-import"
          element={
            <ProtectedRoute>
              <BankImport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionHistory />
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
      </Routes>
    </Layout>
  );
}
