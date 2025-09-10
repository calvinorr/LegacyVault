import React, { useState } from "react";
import type { Category } from "../types/category";

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (parent: Category) => void;
  selectedCategoryId?: string;
  level?: number;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onEdit,
  onDelete,
  onAddChild,
  selectedCategoryId,
  level = 0,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const treeItemStyle = (isSelected: boolean, hasChildren: boolean) => ({
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    marginLeft: `${level * 20}px`,
    backgroundColor: isSelected ? "#f0f9ff" : "transparent",
    borderRadius: "6px",
    border: isSelected ? "1px solid #3b82f6" : "1px solid transparent",
    marginBottom: "4px",
    cursor: hasChildren ? "pointer" : "default",
    transition: "all 0.2s",
    hover: {
      backgroundColor: "#f9fafb",
    },
  });

  const categoryInfoStyle = {
    flex: 1,
    marginLeft: "8px",
  };

  const categoryNameStyle = {
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#1a1a1a",
    margin: "0 0 2px 0",
  };

  const categoryDescStyle = {
    fontSize: "12px",
    color: "#6b7280",
    margin: 0,
  };

  const actionButtonStyle = {
    padding: "4px 8px",
    fontSize: "12px",
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    color: "#374151",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "4px",
    transition: "all 0.2s",
  };

  const systemBadgeStyle = {
    fontSize: "10px",
    padding: "2px 6px",
    backgroundColor: "#6b728020",
    color: "#6b7280",
    borderRadius: "10px",
    marginLeft: "8px",
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div>
      {categories.map((category) => {
        const isSelected = category._id === selectedCategoryId;
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedCategories.has(category._id);

        return (
          <div key={category._id}>
            <div
              style={treeItemStyle(isSelected, hasChildren)}
              onClick={() => hasChildren && toggleExpanded(category._id)}
            >
              {/* Expand/Collapse Icon */}
              {hasChildren ? (
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "16px",
                    color: "#6b7280",
                    transition: "transform 0.2s",
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                >
                  chevron_right
                </span>
              ) : (
                <span style={{ width: "16px", display: "inline-block" }} />
              )}

              {/* Category Icon */}
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "18px",
                  color: category.isSystemCategory ? "#6b7280" : "#3b82f6",
                }}
              >
                folder
              </span>

              {/* Category Info */}
              <div style={categoryInfoStyle}>
                <div style={categoryNameStyle}>
                  {category.name}
                  {category.isSystemCategory && (
                    <span style={systemBadgeStyle}>System</span>
                  )}
                </div>
                {category.description && (
                  <p style={categoryDescStyle}>{category.description}</p>
                )}
              </div>

              {/* Entry Count Badge */}
              {category.entriesCount !== undefined &&
                category.entriesCount > 0 && (
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      backgroundColor: "#10b98120",
                      color: "#10b981",
                      borderRadius: "10px",
                      marginRight: "8px",
                    }}
                  >
                    {category.entriesCount}
                  </span>
                )}

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  style={actionButtonStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(category);
                  }}
                  title="Add child category"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}
                  >
                    add
                  </span>
                </button>

                <button
                  style={actionButtonStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(category);
                  }}
                  title="Edit category"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}
                  >
                    edit
                  </span>
                </button>

                {!category.isSystemCategory && (
                  <button
                    style={{
                      ...actionButtonStyle,
                      borderColor: "#ef4444",
                      color: "#ef4444",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(category);
                    }}
                    title="Delete category"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px" }}
                    >
                      delete
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Render Children */}
            {hasChildren && isExpanded && (
              <CategoryTree
                categories={category.children!}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                selectedCategoryId={selectedCategoryId}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryTree;
