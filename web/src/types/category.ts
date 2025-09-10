// web/src/types/category.ts
// TypeScript interfaces for Category types

export interface Category {
  _id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  userId: string;
  isSystemCategory: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  // Additional fields for detailed view
  fullPath?: string;
  childrenCount?: number;
  entriesCount?: number;

  // For tree structure
  children?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: string | null;
}

export interface CategoryStats {
  totalCategories: number;
  rootCategories: number;
  systemCategories: number;
  categoriesInUse: number;
  categoryUsage: Array<{
    _id: string;
    entriesCount: number;
  }>;
}

export interface CategoryTreeResponse {
  categories: Category[];
  total: number;
}

export interface CategoryResponse {
  category: Category;
  children?: Category[];
  message?: string;
}

export interface CategoryStatsResponse {
  totalCategories: number;
  rootCategories: number;
  systemCategories: number;
  categoriesInUse: number;
  categoryUsage: Array<{
    _id: string;
    entriesCount: number;
  }>;
}
