import React from "react";
import { useAuth } from "../hooks/useAuth";

export default function Login(): JSX.Element {
  const { signIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-background text-foreground"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      {/* Mobile header - visible on mobile only */}
      <div className="block md:hidden bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-primary-500" style={{ fontSize: "24px" }}>
            🛡️
          </div>
          <h1 className="text-base font-bold text-foreground">LegacyLock</h1>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar - hidden on mobile */}
        <aside className="hidden md:flex h-screen flex-col justify-between border-r border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2 p-2">
              <div className="text-primary-500" style={{ fontSize: "32px" }}>
                🛡️
              </div>
              <h1 className="text-lg font-bold text-foreground">LegacyLock</h1>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-md bg-primary-500/10 px-3 py-2 text-primary-500">
                <span style={{ fontSize: "20px" }}>📊</span>
                <p className="text-sm font-medium">Dashboard</p>
              </div>
              <div className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
                <span style={{ fontSize: "20px" }}>💳</span>
                <p className="text-sm font-medium">Accounts</p>
              </div>
              <div className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
                <span style={{ fontSize: "20px" }}>👥</span>
                <p className="text-sm font-medium">Contacts</p>
              </div>
              <div className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
                <span style={{ fontSize: "20px" }}>📄</span>
                <p className="text-sm font-medium">Documents</p>
              </div>
            </nav>
          </div>

          {/* Settings at bottom */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
              <span style={{ fontSize: "20px" }}>⚙️</span>
              <p className="text-sm font-medium">Settings</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border p-6">
            <h1 className="text-3xl font-bold">Welcome to LegacyLock</h1>
            <p className="text-muted-foreground">
              Secure household finance management for couples
            </p>
          </div>

          {/* Login Content */}
          <div className="p-6">
            <div className="mx-auto max-w-md">
              <div className="rounded-md border border-border bg-card p-8 text-center">
                <div className="mb-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10">
                    <span className="text-2xl text-primary-500">🛡️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground">
                    Sign In
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Access your secure household finance vault
                  </p>
                </div>

                <button
                  onClick={signIn}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="mt-6 text-xs text-muted-foreground">
                  <p>Secure authentication via Google OAuth</p>
                  <p className="mt-1">New users require admin approval</p>
                </div>
              </div>

              {/* Feature Preview Cards */}
              <div className="mt-8 grid gap-4">
                <div className="flex items-center gap-4 rounded-md border border-border bg-card p-4">
                  <span
                    className="text-primary-500"
                    style={{ fontSize: "24px" }}
                  >
                    💰
                  </span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Bank Accounts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Securely store account details
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-md border border-border bg-card p-4">
                  <span
                    className="text-primary-500"
                    style={{ fontSize: "24px" }}
                  >
                    📈
                  </span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Investments
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Track investment accounts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-md border border-border bg-card p-4">
                  <span
                    className="text-primary-500"
                    style={{ fontSize: "24px" }}
                  >
                    🏠
                  </span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Property
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Manage property information
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-md border border-border bg-card p-4">
                  <span
                    className="text-primary-500"
                    style={{ fontSize: "24px" }}
                  >
                    ⚡
                  </span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Bills
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Store bill and service details
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
