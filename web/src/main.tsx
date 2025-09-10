import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";
import { CategoriesProvider } from "./hooks/useCategories";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <CategoriesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CategoriesProvider>
    </AuthProvider>
  </React.StrictMode>
);
