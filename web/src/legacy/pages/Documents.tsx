import React, { useState, useEffect, useRef } from "react";
import { FileText, Upload, Grid3X3, List, Search, Filter, Download, Trash2, Eye, Plus, FolderOpen, AlertTriangle } from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import DocumentUploadModal from "../components/DocumentUploadModal";

type Document = {
  _id: string;
  title: string;
  description?: string;
  category: "Financial" | "Legal" | "Insurance" | "Property" | "Medical" | "Tax" | "Personal" | "Other";
  tags: string[];
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  owner: string;
  sharedWith: string[];
  isArchived: boolean;
  metadata?: any;
};

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Redirect non-admin users (if needed)
  if (user && user.role !== "admin" && user.role !== "user") {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fefefe',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            backgroundColor: '#fef2f2',
            borderRadius: '16px',
            margin: '0 auto 24px'
          }}>
            <AlertTriangle size={28} color="#dc2626" strokeWidth={1.5} />
          </div>
          <h1 style={{ 
            fontSize: '24px',
            fontWeight: '600',
            color: '#0f172a', 
            marginBottom: '8px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}>
            Access Denied
          </h1>
          <p style={{ 
            fontSize: '16px',
            color: '#1e293b',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            lineHeight: '1.5'
          }}>
            You need proper permissions to access documents.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/documents", {
        credentials: "include",
      });

      if (!response.ok) {
        // Check if the response is JSON before trying to parse it
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to load documents: ${response.statusText}`);
          } catch (jsonError) {
            throw new Error(`Failed to load documents: ${response.statusText}`);
          }
        } else {
          // If response is not JSON (likely HTML redirect), handle appropriately
          if (response.status === 401) {
            throw new Error("Please sign in to access documents");
          }
          throw new Error(`Failed to load documents: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err: any) {
      console.error("Error loading documents:", err);
      setError(err.message || "Failed to load documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    // Open modal with selected files
    setSelectedFiles(Array.from(files));
    setUploadModalOpen(true);
  };

  const handleModalUpload = async (files: File[], metadata: any) => {
    try {
      setUploading(true);
      setError(null);
      
      // Upload files one at a time with metadata
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        // Add metadata to form data
        if (metadata.title) formData.append('title', metadata.title);
        if (metadata.description) formData.append('description', metadata.description);
        if (metadata.category) formData.append('category', metadata.category);
        if (metadata.tags && metadata.tags.length > 0) formData.append('tags', JSON.stringify(metadata.tags));
        if (metadata.linkedEntryId) formData.append('linkedEntryId', metadata.linkedEntryId);
        formData.append('confidential', metadata.confidential.toString());

        const response = await fetch("/api/documents", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
        }
      }

      // Refresh documents list after all uploads complete
      await loadDocuments();
      setSelectedFiles([]);
    } catch (err: any) {
      console.error("Error uploading documents:", err);
      throw err; // Let modal handle the error display
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document'; // The server should provide the filename in headers
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Failed to download document");
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Delete failed");
      }

      // Refresh documents list
      await loadDocuments();
    } catch (err: any) {
      setError(err.message || "Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Financial":
        return "#0ea5e9";
      case "Legal":
        return "#8b5cf6";
      case "Insurance":
        return "#059669";
      case "Property":
        return "#d97706";
      case "Medical":
        return "#dc2626";
      case "Tax":
        return "#7c3aed";
      case "Personal":
        return "#16a34a";
      default:
        return "#1e293b";
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
    return "📄";
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

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.originalFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch && !doc.isArchived;
  });

  const categoryOptions = [
    { value: "all", label: "All Documents", count: documents.filter(d => !d.isArchived).length },
    { value: "Financial", label: "Financial", count: documents.filter(d => d.category === "Financial" && !d.isArchived).length },
    { value: "Legal", label: "Legal", count: documents.filter(d => d.category === "Legal" && !d.isArchived).length },
    { value: "Insurance", label: "Insurance", count: documents.filter(d => d.category === "Insurance" && !d.isArchived).length },
    { value: "Property", label: "Property", count: documents.filter(d => d.category === "Property" && !d.isArchived).length },
    { value: "Medical", label: "Medical", count: documents.filter(d => d.category === "Medical" && !d.isArchived).length },
    { value: "Tax", label: "Tax", count: documents.filter(d => d.category === "Tax" && !d.isArchived).length },
    { value: "Personal", label: "Personal", count: documents.filter(d => d.category === "Personal" && !d.isArchived).length },
    { value: "Other", label: "Other", count: documents.filter(d => d.category === "Other" && !d.isArchived).length },
  ];

  const pageStyle = {
    minHeight: '100vh',
    background: '#fefefe',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#0f172a'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px'
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #0f172a',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const buttonStyle = {
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    border: '1px solid #0f172a',
    backgroundColor: '#ffffff',
    color: '#1e293b'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: '1px solid #0f172a'
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={{
              textAlign: 'center' as const,
              padding: '80px 40px',
              color: '#1e293b'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                backgroundColor: '#0f172a',
                borderRadius: '16px',
                margin: '0 auto 24px'
              }}>
                <FileText size={28} color="#1e293b" strokeWidth={1.5} />
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                margin: '0',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>Loading documents...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: '#0f172a',
              borderRadius: '8px'
            }}>
              <FileText size={18} color="#ffffff" strokeWidth={2} />
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0',
              letterSpacing: '-0.025em'
            }}>
              Documents
            </h1>
          </div>
          <p style={{
            fontSize: '16px',
            color: '#1e293b',
            fontWeight: '400',
            margin: '0',
            lineHeight: '1.5'
          }}>
            {documents.filter(d => !d.isArchived).length} documents stored securely
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={20} color="#dc2626" strokeWidth={1.5} />
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '4px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                Error
              </div>
              <div style={{
                fontSize: '14px',
                color: '#dc2626',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* File Upload Zone */}
        <div style={{
          ...cardStyle,
          border: `2px dashed ${dragOver ? '#0f172a' : '#0f172a'}`,
          backgroundColor: dragOver ? '#f8fafc' : '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}>
          <div style={{ textAlign: 'center' as const }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              margin: '0 auto 24px'
            }}>
              <Upload size={28} color={dragOver ? '#0f172a' : '#1e293b'} strokeWidth={1.5} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '8px',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}>
              {dragOver ? 'Drop files here' : (uploading ? 'Uploading...' : 'Upload Documents')}
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#1e293b',
              marginBottom: '16px',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}>
              {uploading ? 'Processing your documents...' : 'Drag and drop files here, or click to browse'}
            </p>
            <p style={{
              fontSize: '14px',
              color: '#334155',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}>
              Supports PDF, Word, Excel, images up to 10MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            disabled={uploading}
          />
        </div>

        {/* Controls */}
        <div style={cardStyle}>
          {/* Search */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10
              }}>
                <Search size={20} color="#1e293b" strokeWidth={1.5} />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '12px',
                  border: '1px solid #0f172a',
                  fontSize: '14px',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  backgroundColor: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Category Filters */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: '8px',
            marginBottom: '24px'
          }}>
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                style={{
                  ...buttonStyle,
                  backgroundColor: selectedCategory === option.value ? '#0f172a' : '#ffffff',
                  color: selectedCategory === option.value ? '#ffffff' : '#1e293b',
                  borderColor: selectedCategory === option.value ? '#0f172a' : '#0f172a'
                }}
                onClick={() => setSelectedCategory(option.value)}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: viewMode === 'grid' ? '#0f172a' : '#ffffff',
                color: viewMode === 'grid' ? '#ffffff' : '#1e293b',
                borderColor: viewMode === 'grid' ? '#0f172a' : '#0f172a'
              }}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={16} strokeWidth={1.5} />
              Grid
            </button>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: viewMode === 'list' ? '#0f172a' : '#ffffff',
                color: viewMode === 'list' ? '#ffffff' : '#1e293b',
                borderColor: viewMode === 'list' ? '#0f172a' : '#0f172a'
              }}
              onClick={() => setViewMode('list')}
            >
              <List size={16} strokeWidth={1.5} />
              List
            </button>
          </div>
        </div>

        {/* Documents Display */}
        <div style={cardStyle}>
          {filteredDocuments.length === 0 ? (
            <div style={{
              textAlign: 'center' as const,
              padding: '80px 40px',
              color: '#1e293b'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                backgroundColor: '#0f172a',
                borderRadius: '16px',
                margin: '0 auto 24px'
              }}>
                <FolderOpen size={28} color="#1e293b" strokeWidth={1.5} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '8px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                No documents found
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#1e293b',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                {searchQuery ? 'Try adjusting your search or filters' : 'Upload your first document to get started'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {filteredDocuments.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    padding: '24px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #0f172a',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(15, 23, 42, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      lineHeight: '1'
                    }}>
                      {getFileIcon(doc.mimeType)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: '0 0 8px 0',
                        wordBreak: 'break-word',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                      }}>
                        {doc.title}
                      </h3>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        backgroundColor: getCategoryColor(doc.category) + '15',
                        color: getCategoryColor(doc.category),
                        fontSize: '12px',
                        fontWeight: '500',
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                      }}>
                        {doc.category}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#1e293b',
                      margin: '4px 0',
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                    }}>
                      📁 {formatFileSize(doc.fileSize)}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#1e293b',
                      margin: '4px 0',
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                    }}>
                      📅 {new Date(doc.uploadDate).toLocaleDateString('en-GB')}
                    </p>
                  </div>

                  {doc.description && (
                    <p style={{
                      fontSize: '14px',
                      color: '#1e293b',
                      margin: '0 0 16px 0',
                      lineHeight: '1.4',
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                    }}>
                      {doc.description.length > 100 
                        ? `${doc.description.substring(0, 100)}...` 
                        : doc.description}
                    </p>
                  )}

                  {doc.tags.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap' as const,
                      gap: '4px',
                      marginBottom: '16px'
                    }}>
                      {doc.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '6px',
                            backgroundColor: '#0f172a',
                            color: '#1e293b',
                            fontSize: '11px',
                            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: '#0f172a',
                          color: '#1e293b',
                          fontSize: '11px',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                        }}>
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      style={{
                        ...buttonStyle,
                        padding: '8px 12px',
                        fontSize: '12px'
                      }}
                      onClick={() => handleDownload(doc._id)}
                    >
                      <Download size={14} strokeWidth={1.5} />
                      Download
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        padding: '8px 12px',
                        fontSize: '12px',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        border: '1px solid #dc2626'
                      }}
                      onClick={() => handleDelete(doc._id)}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {filteredDocuments.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #0f172a',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flex: 1,
                    minWidth: 0
                  }}>
                    <div style={{ fontSize: '24px' }}>
                      {getFileIcon(doc.mimeType)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '4px'
                      }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#0f172a',
                          margin: 0,
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {doc.title}
                        </h3>
                        <div style={{
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: getCategoryColor(doc.category) + '15',
                          color: getCategoryColor(doc.category),
                          fontSize: '11px',
                          fontWeight: '500',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          whiteSpace: 'nowrap'
                        }}>
                          {doc.category}
                        </div>
                      </div>
                      <p style={{
                        fontSize: '14px',
                        color: '#1e293b',
                        margin: 0,
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                      }}>
                        {formatFileSize(doc.fileSize)} • {new Date(doc.uploadDate).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      style={{
                        ...buttonStyle,
                        padding: '8px',
                        minWidth: 'auto'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(doc._id);
                      }}
                    >
                      <Download size={16} strokeWidth={1.5} />
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        padding: '8px',
                        minWidth: 'auto',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        border: '1px solid #dc2626'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc._id);
                      }}
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleModalUpload}
        selectedFiles={selectedFiles}
      />
    </div>
  );
}