import React, { useEffect } from "react";

// Simple page that redirects the browser to the backend OAuth entrypoint.
// This helps when someone navigates to /auth/google on the frontend dev server.
export default function AuthRedirect() {
  useEffect(() => {
    // Backend OAuth entrypoint (explicit host & port for local dev)
    window.location.href = "http://localhost:3000/auth/google";
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Signing in…</h2>
      <p>
        If you are not redirected automatically,{" "}
        <a href="http://localhost:3000/auth/google">
          click here to sign in with Google
        </a>
        .
      </p>
    </div>
  );
}
