import React, { useState, useEffect } from "react";
import { Plus, Edit2, ChevronDown } from 'lucide-react';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/category";

interface CategoryFormProps {
  category?: Category; // If provided, this is an edit form
  parentCategory?: Category; // If provided, this will be the parent
  allCategories: Category[];
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void;
  onCancel: () => void;
  loading: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  parentCategory,
  allCategories,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Populate form when category prop changes
  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
      setSelectedParentId(category.parentId || null);
    } else {
      setName("");
      setDescription("");
      setSelectedParentId(parentCategory?._id || null);
    }
  }, [category, parentCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: selectedParentId || null,
    };

    onSubmit(data);
  };

  // Flatten categories for parent selection (exclude current category and its descendants)
  const flattenCategories = (
    cats: Category[],
    level = 0
  ): Array<Category & { level: number }> => {
    const result: Array<Category & { level: number }> = [];

    for (const cat of cats) {
      // Don't include the category being edited or its descendants
      if (
        category &&
        (cat._id === category._id || isDescendantOf(cat, category))
      ) {
        continue;
      }

      result.push({ ...cat, level });

      if (cat.children) {
        result.push(...flattenCategories(cat.children, level + 1));
      }
    }

    return result;
  };

  // Check if a category is a descendant of another
  const isDescendantOf = (potential: Category, ancestor: Category): boolean => {
    if (!ancestor.children) return false;

    for (const child of ancestor.children) {
      if (child._id === potential._id) return true;
      if (isDescendantOf(potential, child)) return true;
    }

    return false;
  };

  const flatCategories = flattenCategories(allCategories);

  const formStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "600px",
    boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
    marginBottom: "20px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 16px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "16px",
    paddingRight: '48px'
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#0f172a",
    marginBottom: "8px",
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const buttonStyle = {
    padding: "12px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    marginRight: "12px",
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: loading ? "#334155" : "#0f172a",
    color: "#ffffff",
    border: "1px solid transparent",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#ffffff",
    color: "#1e293b",
    border: "1px solid #e2e8f0",
  };

  const titleStyle = {
    fontSize: "20px",
    fontWeight: "600" as const,
    color: "#0f172a",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3 style={titleStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          backgroundColor: category ? '#f0f9ff' : '#f0fdf4',
          borderRadius: '8px'
        }}>
          {category ? (
            <Edit2 size={18} color="#0ea5e9" strokeWidth={1.5} />
          ) : (
            <Plus size={18} color="#16a34a" strokeWidth={1.5} />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span>{category ? "Edit Category" : "Add Category"}</span>
          {parentCategory && (
            <span
              style={{ 
                fontSize: "14px", 
                color: "#1e293b", 
                fontWeight: "400",
                marginTop: '2px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}
            >
              under "{parentCategory.name}"
            </span>
          )}
        </div>
      </h3>

      <div>
        <label style={labelStyle} htmlFor="category-name">
          Category Name *
        </label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
          style={inputStyle}
          disabled={loading}
          required
          onFocus={(e) => {
            e.target.style.borderColor = '#0ea5e9';
            e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="category-description">
          Description
        </label>
        <textarea
          id="category-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
          style={{ ...inputStyle, resize: "vertical" as const }}
          disabled={loading}
          onFocus={(e) => {
            e.target.style.borderColor = '#0ea5e9';
            e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="category-parent">
          Parent Category
        </label>
        <select
          id="category-parent"
          value={selectedParentId || ""}
          onChange={(e) => setSelectedParentId(e.target.value || null)}
          style={selectStyle}
          disabled={loading}
          onFocus={(e) => {
            e.target.style.borderColor = '#0ea5e9';
            e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="">None (Root Level)</option>
          {flatCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {"—".repeat(cat.level)} {cat.name}
              {cat.isSystemCategory ? " (System)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "32px",
          gap: '12px'
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={secondaryButtonStyle}
          disabled={loading}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={primaryButtonStyle}
          disabled={loading || !name.trim()}
          onMouseEnter={(e) => {
            if (!loading && name.trim()) {
              e.currentTarget.style.backgroundColor = '#1e293b';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && name.trim()) {
              e.currentTarget.style.backgroundColor = '#0f172a';
            }
          }}
        >
          {loading ? "Saving..." : category ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
