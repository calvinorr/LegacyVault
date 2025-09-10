import React, { useState, useEffect } from "react";
import CategoryTree from "./CategoryTree";
import CategoryForm from "./CategoryForm";
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
  const [categories, setCategories] = useState<Category[]>([]);
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
      const [categoriesData, statsData] = await Promise.all([
        getCategories(),
        getCategoryStats(),
      ]);

      setCategories(categoriesData.categories);
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
      await loadData();
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
      await loadData();
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
      await loadData();
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
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "24px",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: "600" as const,
    color: "#1a1a1a",
    margin: 0,
  };

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#3b82f6",
    color: "white",
    border: "1px solid #3b82f6",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "white",
    color: "#374151",
    border: "1px solid #e5e7eb",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#ef4444",
    color: "white",
    border: "1px solid #ef4444",
  };

  const statsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  };

  const statCardStyle = {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    textAlign: "center" as const,
  };

  const errorStyle = {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "16px",
  };

  const loadingStyle = {
    textAlign: "center" as const,
    padding: "40px",
    color: "#6b7280",
  };

  const emptyStateStyle = {
    textAlign: "center" as const,
    padding: "40px",
    color: "#6b7280",
  };

  if (loading) {
    return (
      <div style={sectionStyle}>
        <div style={loadingStyle}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "48px", marginBottom: "16px" }}
          >
            folder_open
          </span>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  // Render different views based on mode
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div style={sectionStyle}>
        {error && <div style={errorStyle}>{error}</div>}

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
        <div style={{ maxWidth: "500px" }}>
          <h3 style={titleStyle}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "24px", color: "#ef4444" }}
            >
              delete
            </span>
            Delete Category
          </h3>

          <div style={{ margin: "20px 0" }}>
            <p
              style={{
                fontSize: "14px",
                color: "#374151",
                marginBottom: "12px",
              }}
            >
              Are you sure you want to delete "{selectedCategory.name}"?
            </p>

            {selectedCategory.children &&
              selectedCategory.children.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#fef3c7",
                    border: "1px solid #f59e0b",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "16px",
                  }}
                >
                  <p style={{ fontSize: "14px", color: "#92400e", margin: 0 }}>
                    ⚠️ This category has {selectedCategory.children.length}{" "}
                    child categories. What would you like to do with them?
                  </p>
                </div>
              )}

            {selectedCategory.entriesCount &&
              selectedCategory.entriesCount > 0 && (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #ef4444",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "16px",
                  }}
                >
                  <p style={{ fontSize: "14px", color: "#dc2626", margin: 0 }}>
                    ❌ Cannot delete this category because it has{" "}
                    {selectedCategory.entriesCount} entries assigned to it.
                    Please reassign these entries to other categories first.
                  </p>
                </div>
              )}
          </div>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
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
      {error && <div style={errorStyle}>{error}</div>}

      {/* Stats Section */}
      {stats && (
        <div style={sectionStyle}>
          <h3 style={titleStyle}>Category Overview</h3>
          <div style={statsStyle}>
            <div style={statCardStyle}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#3b82f6",
                }}
              >
                {stats.totalCategories}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Total Categories
              </div>
            </div>
            <div style={statCardStyle}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                {stats.rootCategories}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Root Categories
              </div>
            </div>
            <div style={statCardStyle}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#6b7280",
                }}
              >
                {stats.systemCategories}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                System Categories
              </div>
            </div>
            <div style={statCardStyle}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#f59e0b",
                }}
              >
                {stats.categoriesInUse}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                With Entries
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>Categories</h3>
          <button onClick={() => setViewMode("add")} style={primaryButtonStyle}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              add
            </span>
            Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <div style={emptyStateStyle}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "48px", marginBottom: "16px" }}
            >
              folder_off
            </span>
            <p>No categories found.</p>
            <button
              onClick={() => setViewMode("add")}
              style={primaryButtonStyle}
            >
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
