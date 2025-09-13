import React, { useState } from "react";
import { ChevronRight, Folder, Plus, Edit, Trash2 } from 'lucide-react';
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
    padding: "12px 16px",
    marginLeft: `${level * 24}px`,
    backgroundColor: isSelected ? "#f0f9ff" : "transparent",
    borderRadius: "12px",
    border: isSelected ? "1px solid #0ea5e9" : "1px solid transparent",
    marginBottom: "6px",
    cursor: hasChildren ? "pointer" : "default",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  });

  const categoryInfoStyle = {
    flex: 1,
    marginLeft: "12px",
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const categoryNameStyle = {
    fontSize: "15px",
    fontWeight: "500" as const,
    color: "#0f172a",
    margin: "0 0 4px 0",
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    lineHeight: '1.2'
  };

  const categoryDescStyle = {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    lineHeight: '1.3'
  };

  const actionButtonStyle = {
    padding: "8px",
    fontSize: "14px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#64748b",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "6px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const systemBadgeStyle = {
    fontSize: "11px",
    padding: "4px 8px",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    borderRadius: "12px",
    marginLeft: "12px",
    fontWeight: '500' as const,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    border: '1px solid #f1f5f9'
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div>
      {categories.map((category) => {
        const isSelected = category._id === selectedCategoryId;
        const hasChildren = Boolean(category.children && category.children.length > 0);
        const isExpanded = expandedCategories.has(category._id);

        return (
          <div key={category._id}>
            <div
              style={treeItemStyle(isSelected, hasChildren)}
              onClick={() => hasChildren && toggleExpanded(category._id)}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {/* Expand/Collapse Icon */}
              {hasChildren ? (
                <ChevronRight
                  size={16}
                  color="#64748b"
                  strokeWidth={1.5}
                  style={{
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                />
              ) : (
                <span style={{ width: "16px", display: "inline-block" }} />
              )}

              {/* Category Icon */}
              <Folder
                size={18}
                color={category.isSystemCategory ? "#64748b" : "#0ea5e9"}
                strokeWidth={1.5}
                style={{ marginLeft: '6px' }}
              />

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
                      fontSize: "12px",
                      padding: "4px 8px",
                      backgroundColor: "#f0fdf4",
                      color: "#16a34a",
                      borderRadius: "12px",
                      marginRight: "12px",
                      fontWeight: '500' as const,
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      border: '1px solid #dcfce7'
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <Plus size={14} strokeWidth={1.5} />
                </button>

                <button
                  style={actionButtonStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(category);
                  }}
                  title="Edit category"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <Edit size={14} strokeWidth={1.5} />
                </button>

                {!category.isSystemCategory && (
                  <button
                    style={{
                      ...actionButtonStyle,
                      borderColor: "#fecaca",
                      color: "#dc2626",
                      backgroundColor: '#fef2f2'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(category);
                    }}
                    title="Delete category"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                      e.currentTarget.style.borderColor = '#fca5a5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                      e.currentTarget.style.borderColor = '#fecaca';
                    }}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
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
