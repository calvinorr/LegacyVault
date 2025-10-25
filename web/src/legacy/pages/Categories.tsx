import React from "react";
import { FolderTree } from "lucide-react";
import CategoryManagement from "../components/CategoryManagement";

export default function Categories() {
  const containerStyle = {
    padding: "40px",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: "600" as const,
    color: "#0f172a",
    margin: "0",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const descriptionStyle = {
    fontSize: "16px",
    color: "#1e293b",
    marginBottom: "32px",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    lineHeight: "1.6",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <FolderTree size={32} color="#0f172a" strokeWidth={1.5} />
        <h1 style={titleStyle}>Categories</h1>
      </div>
      
      <p style={descriptionStyle}>
        Organize your financial data with hierarchical categories. Create parent categories 
        and subcategories to structure your accounts, bills, investments, and other entries 
        for better organization and reporting.
      </p>

      <CategoryManagement />
    </div>
  );
}