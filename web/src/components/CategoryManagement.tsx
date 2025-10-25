import React, { useState, useEffect } from "react";
import { FolderOpen, Plus, Trash2, AlertTriangle, BarChart3, Folder, FolderTree, Tags } from 'lucide-react';
import CategoryTree from "./CategoryTree";
import CategoryForm from "./CategoryForm";
import { useCategories } from "../hooks/useCategories";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
} from "../api";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryStats,
} from "../types/category";

type ViewMode = "list" | "add" | "edit" | "delete";

const CategoryManagement: React.FC = () => {
  const { categories, loading: categoriesLoading, clearCache } = useCategories();
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [parentForNewCategory, setParentForNewCategory] =
    useState<Category | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const statsData = await getCategoryStats();
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (data: CreateCategoryRequest) => {
    try {
      setActionLoading(true);
      await createCategory(data);
      await Promise.all([clearCache(), loadData()]);
      setViewMode("list");
      setParentForNewCategory(null);
    } catch (err: any) {
      setError(err.message || "Failed to create category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async (data: UpdateCategoryRequest) => {
    if (!selectedCategory) return;

    try {
      setActionLoading(true);
      await updateCategory(selectedCategory._id, data);
      await Promise.all([clearCache(), loadData()]);
      setViewMode("list");
      setSelectedCategory(null);
    } catch (err: any) {
      setError(err.message || "Failed to update category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (deleteChildren: boolean = false) => {
    if (!selectedCategory) return;

    try {
      setActionLoading(true);
      await deleteCategory(selectedCategory._id, deleteChildren);
      await Promise.all([clearCache(), loadData()]);
      setViewMode("list");
      setSelectedCategory(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddChild = (parent: Category) => {
    setParentForNewCategory(parent);
    setViewMode("add");
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setViewMode("edit");
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setViewMode("delete");
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedCategory(null);
    setParentForNewCategory(null);
    setError(null);
  };

  const sectionStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #0f172a',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px'
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: '#0f172a',
    margin: '0',
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
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: '1px solid #0f172a'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ffffff',
    color: '#1e293b',
    border: '1px solid #0f172a'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: '1px solid #dc2626'
  };

  const statsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  };

  const statCardStyle = {
    backgroundColor: '#f8fafc',
    border: '1px solid #0f172a',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center' as const
  };

  const errorStyle = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const loadingStyle = {
    textAlign: 'center' as const,
    padding: '80px 40px',
    color: '#1e293b'
  };

  const emptyStateStyle = {
    textAlign: 'center' as const,
    padding: '80px 40px',
    color: '#1e293b'
  };

  if (loading || categoriesLoading) {
    return (
      <div style={sectionStyle}>
        <div style={loadingStyle}>
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
          <p style={{
            fontSize: '16px',
            fontWeight: '500',
            margin: '0',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}>Loading categories...</p>
        </div>
      </div>
    );
  }

  // Render different views based on mode
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div style={sectionStyle}>
        {error && (
          <div style={errorStyle}>
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

        <CategoryForm
          category={
            viewMode === "edit" ? selectedCategory || undefined : undefined
          }
          parentCategory={parentForNewCategory || undefined}
          allCategories={categories}
          onSubmit={
            viewMode === "add" ? handleCreateCategory : handleUpdateCategory
          }
          onCancel={handleCancel}
          loading={actionLoading}
        />
      </div>
    );
  }

  if (viewMode === "delete" && selectedCategory) {
    return (
      <div style={sectionStyle}>
        <div style={{ maxWidth: '500px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: '#fef2f2',
              borderRadius: '8px'
            }}>
              <Trash2 size={18} color="#dc2626" strokeWidth={1.5} />
            </div>
            <h3 style={titleStyle}>
              Delete Category
            </h3>
          </div>

          <div style={{ margin: '24px 0' }}>
            <p style={{
              fontSize: '16px',
              color: '#334155',
              marginBottom: '16px',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}>
              Are you sure you want to delete "{selectedCategory.name}"?
            </p>

            {selectedCategory.children &&
              selectedCategory.children.length > 0 && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <AlertTriangle size={20} color="#d97706" strokeWidth={1.5} />
                  <p style={{
                    fontSize: '14px',
                    color: '#92400e',
                    margin: '0',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                  }}>
                    This category has {selectedCategory.children.length} child categories. What would you like to do with them?
                  </p>
                </div>
              )}

            {selectedCategory.entriesCount &&
              selectedCategory.entriesCount > 0 && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <AlertTriangle size={20} color="#dc2626" strokeWidth={1.5} />
                  <p style={{
                    fontSize: '14px',
                    color: '#dc2626',
                    margin: '0',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                  }}>
                    Cannot delete this category because it has {selectedCategory.entriesCount} entries assigned to it. Please reassign these entries to other categories first.
                  </p>
                </div>
              )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              onClick={handleCancel}
              style={secondaryButtonStyle}
              disabled={actionLoading}
            >
              Cancel
            </button>

            {(!selectedCategory.entriesCount ||
              selectedCategory.entriesCount === 0) && (
              <>
                {selectedCategory.children &&
                  selectedCategory.children.length > 0 && (
                    <button
                      onClick={() => handleDeleteCategory(true)}
                      style={dangerButtonStyle}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Deleting..." : "Delete All"}
                    </button>
                  )}

                <button
                  onClick={() => handleDeleteCategory(false)}
                  style={dangerButtonStyle}
                  disabled={
                    actionLoading ||
                    (selectedCategory.children &&
                      selectedCategory.children.length > 0)
                  }
                >
                  {actionLoading ? "Deleting..." : "Delete Category"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div>
      {error && (
        <div style={errorStyle}>
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

      {/* Stats Section */}
      {stats && (
        <div style={sectionStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <BarChart3 size={20} color="#0f172a" strokeWidth={1.5} />
            <h3 style={titleStyle}>Category Overview</h3>
          </div>
          <div style={statsStyle}>
            <div style={{
              ...statCardStyle,
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#0ea5e9',
                marginBottom: '8px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                {stats.totalCategories}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#0ea5e9',
                fontWeight: '500',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                Total Categories
              </div>
            </div>
            <div style={{
              ...statCardStyle,
              backgroundColor: '#f0fdf4',
              border: '1px solid #dcfce7'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#16a34a',
                marginBottom: '8px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                {stats.rootCategories}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#16a34a',
                fontWeight: '500',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                Root Categories
              </div>
            </div>
            <div style={{
              ...statCardStyle,
              backgroundColor: '#f8fafc',
              border: '1px solid #0f172a'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                {stats.systemCategories}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#1e293b',
                fontWeight: '500',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                System Categories
              </div>
            </div>
            <div style={{
              ...statCardStyle,
              backgroundColor: '#fef3c7',
              border: '1px solid #fef08a'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#d97706',
                marginBottom: '8px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                {stats.categoriesInUse}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#d97706',
                fontWeight: '500',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                With Entries
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FolderTree size={20} color="#0f172a" strokeWidth={1.5} />
            <h3 style={titleStyle}>Categories</h3>
          </div>
          <button 
            onClick={() => setViewMode('add')} 
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e293b';
              e.currentTarget.style.borderColor = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0f172a';
              e.currentTarget.style.borderColor = '#0f172a';
            }}
          >
            <Plus size={16} strokeWidth={1.5} />
            Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <div style={emptyStateStyle}>
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
              <Folder size={28} color="#1e293b" strokeWidth={1.5} />
            </div>
            <p style={{
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '24px',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}>No categories found.</p>
            <button
              onClick={() => setViewMode('add')}
              style={primaryButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1e293b';
                e.currentTarget.style.borderColor = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0f172a';
                e.currentTarget.style.borderColor = '#0f172a';
              }}
            >
              <Plus size={16} strokeWidth={1.5} />
              Create your first category
            </button>
          </div>
        ) : (
          <CategoryTree
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onAddChild={handleAddChild}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
