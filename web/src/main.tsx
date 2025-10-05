import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";
import { CategoriesProvider } from "./hooks/useCategories";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CategoriesProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CategoriesProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
