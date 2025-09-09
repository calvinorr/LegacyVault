import React, { useState, useRef } from "react";

type Document = {
  _id: string;
  filename: string;
  category: "statement" | "policy" | "contract" | "receipt" | "tax" | "other";
  linkedAccount?: string;
  uploadDate: string;
  size: number;
  type: string;
  notes?: string;
  url?: string;
};

// Sample documents data for demonstration
const sampleDocuments: Document[] = [
  {
    _id: "1",
    filename: "Chase_Statement_March_2024.pdf",
    category: "statement",
    linkedAccount: "Chase Checking Account",
    uploadDate: "2024-03-15",
    size: 245760,
    type: "application/pdf",
    notes: "Monthly account statement",
  },
  {
    _id: "2",
    filename: "Home_Insurance_Policy.pdf",
    category: "policy",
    linkedAccount: "Main Residence Property",
    uploadDate: "2024-02-20",
    size: 890432,
    type: "application/pdf",
    notes: "Annual home insurance policy renewal",
  },
  {
    _id: "3",
    filename: "Tax_Return_2023.pdf",
    category: "tax",
    uploadDate: "2024-04-10",
    size: 156890,
    type: "application/pdf",
    notes: "2023 Federal tax return",
  },
  {
    _id: "4",
    filename: "Car_Purchase_Contract.pdf",
    category: "contract",
    uploadDate: "2024-01-15",
    size: 423680,
    type: "application/pdf",
    notes: "Vehicle purchase agreement",
  },
  {
    _id: "5",
    filename: "Grocery_Receipt_03_20.jpg",
    category: "receipt",
    uploadDate: "2024-03-20",
    size: 89420,
    type: "image/jpeg",
    notes: "Business meal expense",
  },
];

export default function Documents() {
  const [documents] = useState<Document[]>(sampleDocuments);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCategoryColor = (category: Document["category"]) => {
    switch (category) {
      case "statement":
        return "#3b82f6";
      case "policy":
        return "#10b981";
      case "contract":
        return "#8b5cf6";
      case "receipt":
        return "#f59e0b";
      case "tax":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getCategoryIcon = (category: Document["category"]) => {
    switch (category) {
      case "statement":
        return "receipt_long";
      case "policy":
        return "security";
      case "contract":
        return "contract_edit";
      case "receipt":
        return "shopping_cart";
      case "tax":
        return "calculate";
      default:
        return "description";
    }
  };

  const getCategoryLabel = (category: Document["category"]) => {
    switch (category) {
      case "statement":
        return "Statement";
      case "policy":
        return "Policy";
      case "contract":
        return "Contract";
      case "receipt":
        return "Receipt";
      case "tax":
        return "Tax Document";
      default:
        return "Other";
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "picture_as_pdf";
    if (type.includes("image")) return "image";
    if (type.includes("word") || type.includes("document")) return "article";
    if (type.includes("excel") || type.includes("spreadsheet"))
      return "table_chart";
    return "description";
  };

  const filteredDocuments =
    selectedCategory === "all"
      ? documents
      : documents.filter((doc) => doc.category === selectedCategory);

  const categoryOptions = [
    { value: "all", label: "All Documents", count: documents.length },
    {
      value: "statement",
      label: "Statements",
      count: documents.filter((d) => d.category === "statement").length,
    },
    {
      value: "policy",
      label: "Policies",
      count: documents.filter((d) => d.category === "policy").length,
    },
    {
      value: "contract",
      label: "Contracts",
      count: documents.filter((d) => d.category === "contract").length,
    },
    {
      value: "receipt",
      label: "Receipts",
      count: documents.filter((d) => d.category === "receipt").length,
    },
    {
      value: "tax",
      label: "Tax Documents",
      count: documents.filter((d) => d.category === "tax").length,
    },
    {
      value: "other",
      label: "Other",
      count: documents.filter((d) => d.category === "other").length,
    },
  ];

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      console.log("Uploading file:", file.name);
      // TODO: Implement actual file upload logic
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
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
  };

  const filtersStyle = {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    marginBottom: "24px",
  };

  const filterButtonStyle = (active: boolean) => ({
    padding: "8px 12px",
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    backgroundColor: active ? "#3b82f6" : "white",
    color: active ? "white" : "#6b7280",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    whiteSpace: "nowrap" as const,
  });

  const viewToggleStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "24px",
  };

  const toggleButtonStyle = (active: boolean) => ({
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    backgroundColor: active ? "#3b82f6" : "white",
    color: active ? "white" : "#6b7280",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.2s",
  });

  const uploadZoneStyle = {
    border: `2px dashed ${dragOver ? "#3b82f6" : "#e5e7eb"}`,
    borderRadius: "10px",
    padding: "40px 20px",
    textAlign: "center" as const,
    backgroundColor: dragOver ? "#f0f9ff" : "#f9fafb",
    marginBottom: "24px",
    transition: "all 0.2s",
    cursor: "pointer",
  };

  const documentCardStyle = {
    padding: "20px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
  };

  const documentListStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "8px",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
  };

  return (
    <>
      <div style={headerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "32px", color: "#3b82f6" }}
            >
              description
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
                Documents
              </h1>
              <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
                {documents.length} documents stored securely
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={contentStyle}>
        {/* File Upload Zone */}
        <div
          style={uploadZoneStyle}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "48px",
              color: dragOver ? "#3b82f6" : "#d1d5db",
              marginBottom: "12px",
              display: "block",
            }}
          >
            cloud_upload
          </span>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            {dragOver ? "Drop files here" : "Upload Documents"}
          </p>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            Drag and drop files here, or click to browse
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>

        {/* Category Filters */}
        <div style={filtersStyle}>
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              style={filterButtonStyle(selectedCategory === option.value)}
              onClick={() => setSelectedCategory(option.value)}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div style={viewToggleStyle}>
          <button
            style={toggleButtonStyle(viewMode === "grid")}
            onClick={() => setViewMode("grid")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              grid_view
            </span>
            Grid
          </button>
          <button
            style={toggleButtonStyle(viewMode === "list")}
            onClick={() => setViewMode("list")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              list
            </span>
            List
          </button>
        </div>

        {/* Documents Display */}
        {filteredDocuments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 20px",
              color: "#6b7280",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "64px",
                color: "#d1d5db",
                marginBottom: "16px",
                display: "block",
              }}
            >
              description
            </span>
            <h3 style={{ color: "#374151", marginBottom: "8px" }}>
              No documents found
            </h3>
            <p>Upload your first document to get started.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredDocuments.map((doc) => (
              <div
                key={doc._id}
                style={documentCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "32px",
                      color: getCategoryColor(doc.category),
                    }}
                  >
                    {getFileIcon(doc.type)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1a1a1a",
                        margin: "0 0 4px 0",
                        wordBreak: "break-word",
                      }}
                    >
                      {doc.filename}
                    </h3>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        backgroundColor: `${getCategoryColor(doc.category)}20`,
                        color: getCategoryColor(doc.category),
                        fontSize: "11px",
                        fontWeight: "500",
                      }}
                    >
                      {getCategoryLabel(doc.category)}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      margin: "2px 0",
                    }}
                  >
                    📁 {formatFileSize(doc.size)}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      margin: "2px 0",
                    }}
                  >
                    📅 {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                  {doc.linkedAccount && (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        margin: "2px 0",
                      }}
                    >
                      🔗 {doc.linkedAccount}
                    </p>
                  )}
                </div>

                {doc.notes && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#9ca3af",
                      margin: "0",
                      lineHeight: "1.4",
                    }}
                  >
                    {doc.notes.length > 60
                      ? `${doc.notes.substring(0, 60)}...`
                      : doc.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {filteredDocuments.map((doc) => (
              <div
                key={doc._id}
                style={documentListStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "24px",
                      color: getCategoryColor(doc.category),
                    }}
                  >
                    {getFileIcon(doc.type)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "2px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1a1a1a",
                          margin: 0,
                        }}
                      >
                        {doc.filename}
                      </h3>
                      <div
                        style={{
                          padding: "2px 6px",
                          borderRadius: "8px",
                          backgroundColor: `${getCategoryColor(
                            doc.category
                          )}20`,
                          color: getCategoryColor(doc.category),
                          fontSize: "10px",
                          fontWeight: "500",
                        }}
                      >
                        {getCategoryLabel(doc.category)}
                      </div>
                    </div>
                    <p
                      style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}
                    >
                      {formatFileSize(doc.size)} •{" "}
                      {new Date(doc.uploadDate).toLocaleDateString()}
                      {doc.linkedAccount && ` • ${doc.linkedAccount}`}
                    </p>
                  </div>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px", color: "#9ca3af" }}
                >
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
