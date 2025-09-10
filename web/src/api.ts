// web/src/api.ts
// Small API client for the backend endpoints. Uses fetch with credentials included.

import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryTreeResponse,
  CategoryResponse,
  CategoryStatsResponse,
} from "./types/category";

export type User = {
  _id: string;
  googleId?: string;
  displayName?: string;
  email?: string;
  role?: string;
  approved?: boolean;
};

export type Entry = {
  _id: string;
  title: string;
  type?: string;
  provider?: string;
  notes?: string;
  // provider-specific structured details (account numbers, policy ids, etc.)
  accountDetails?: Record<string, any>;
  owner?: string;
  confidential?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

async function handleResponse(res: Response) {
  if (res.status === 401) {
    // Not authenticated - only redirect if not already on login page
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
    throw new Error("unauthenticated");
  }
  if (res.status === 403) {
    // Forbidden - user not approved
    throw new Error("Account not approved. Please contact an administrator.");
  }
  if (!res.ok) {
    try {
      const json = await res.json();
      throw new Error(json.error || `API error ${res.status}`);
    } catch (jsonError) {
      const txt = await res.text();
      throw new Error(txt || `API error ${res.status}`);
    }
  }
  return res.json();
}

export async function getMe(): Promise<{ user: User }> {
  const res = await fetch("/api/users/me", { credentials: "include" });
  return handleResponse(res);
}

export async function getEntries(): Promise<{ entries: Entry[] }> {
  const res = await fetch("/api/entries", { credentials: "include" });
  return handleResponse(res);
}

export async function createEntry(
  payload: Partial<Entry>
): Promise<{ entry: Entry }> {
  const res = await fetch("/api/entries", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getEntry(id: string): Promise<{ entry: Entry }> {
  const res = await fetch(`/api/entries/${id}`, { credentials: "include" });
  return handleResponse(res);
}

export async function updateEntry(
  id: string,
  payload: Partial<Entry>
): Promise<{ entry: Entry }> {
  const res = await fetch(`/api/entries/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteEntry(id: string): Promise<{ deleted: boolean }> {
  const res = await fetch(`/api/entries/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}

// User management functions
export async function getAllUsers(): Promise<{ users: User[] }> {
  const res = await fetch("/api/users", { credentials: "include" });
  return handleResponse(res);
}

export async function approveUser(id: string): Promise<{ user: User }> {
  const res = await fetch(`/api/users/${id}/approve`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(res);
}

// Category management functions
export async function getCategories(): Promise<CategoryTreeResponse> {
  const res = await fetch("/api/categories", { credentials: "include" });
  return handleResponse(res);
}

export async function createCategory(
  payload: CreateCategoryRequest
): Promise<CategoryResponse> {
  const res = await fetch("/api/categories", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getCategory(id: string): Promise<CategoryResponse> {
  const res = await fetch(`/api/categories/${id}`, { credentials: "include" });
  return handleResponse(res);
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryRequest
): Promise<CategoryResponse> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteCategory(
  id: string,
  deleteChildren: boolean = false
): Promise<{
  message: string;
  deletedCategory: { id: string; name: string };
  deletedChildrenCount: number;
}> {
  const url = deleteChildren
    ? `/api/categories/${id}?deleteChildren=true`
    : `/api/categories/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function getCategoryStats(): Promise<CategoryStatsResponse> {
  const res = await fetch("/api/categories/stats", { credentials: "include" });
  return handleResponse(res);
}
