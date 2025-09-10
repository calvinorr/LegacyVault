import React, { useState, useEffect } from "react";
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
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "24px",
    maxWidth: "500px",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    marginBottom: "16px",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 8px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "16px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#374151",
    marginBottom: "6px",
  };

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
    transition: "all 0.2s",
    marginRight: "8px",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: loading ? "#9ca3af" : "#3b82f6",
    color: "white",
    border: "1px solid transparent",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "white",
    color: "#374151",
    border: "1px solid #e5e7eb",
  };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: "600" as const,
    color: "#1a1a1a",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3 style={titleStyle}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "24px", color: "#3b82f6" }}
        >
          {category ? "edit" : "add"}
        </span>
        {category ? "Edit Category" : "Add Category"}
        {parentCategory && (
          <span
            style={{ fontSize: "14px", color: "#6b7280", fontWeight: "normal" }}
          >
            under "{parentCategory.name}"
          </span>
        )}
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
          marginTop: "24px",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={secondaryButtonStyle}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={primaryButtonStyle}
          disabled={loading || !name.trim()}
        >
          {loading ? "Saving..." : category ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
