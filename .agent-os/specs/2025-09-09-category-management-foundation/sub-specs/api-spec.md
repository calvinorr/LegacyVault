# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-09-category-management-foundation/spec.md

## Base Route

All category endpoints are prefixed with `/api/categories`

## Endpoints

### GET /api/categories

**Purpose:** Retrieve all categories for the authenticated user in hierarchical structure
**Authentication:** Required (Passport session)
**Parameters:** None
**Query Parameters:**
- `includeSystem` (optional, boolean) - Include system categories in response (default: true)
- `includeDeleted` (optional, boolean) - Include soft-deleted categories (admin only, default: false)

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "_id": "ObjectId",
      "name": "Banking",
      "description": "Bank accounts and related services",
      "parentId": null,
      "userId": "ObjectId",
      "isSystemCategory": true,
      "children": [
        {
          "_id": "ObjectId",
          "name": "Current Accounts",
          "description": "Day-to-day banking accounts",
          "parentId": "ObjectId",
          "userId": "ObjectId",
          "isSystemCategory": true,
          "children": []
        }
      ]
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized (user not authenticated)
- `500` - Server error

### POST /api/categories

**Purpose:** Create a new category
**Authentication:** Required (Passport session)
**Parameters:**
```json
{
  "name": "string (required, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "parentId": "ObjectId (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "category": {
    "_id": "ObjectId",
    "name": "New Category",
    "description": "Category description",
    "parentId": "ObjectId or null",
    "userId": "ObjectId",
    "isSystemCategory": false,
    "createdAt": "ISO Date",
    "updatedAt": "ISO Date"
  }
}
```

**Errors:**
- `400` - Validation errors (missing name, circular reference, duplicate name within parent)
- `401` - Unauthorized
- `404` - Parent category not found
- `500` - Server error

### GET /api/categories/:id

**Purpose:** Retrieve a specific category with its details
**Authentication:** Required (Passport session)
**Parameters:** `id` (ObjectId) - Category ID

**Response:**
```json
{
  "success": true,
  "category": {
    "_id": "ObjectId",
    "name": "Category Name",
    "description": "Category description",
    "parentId": "ObjectId or null",
    "userId": "ObjectId",
    "isSystemCategory": false,
    "parent": {
      "_id": "ObjectId",
      "name": "Parent Category Name"
    },
    "childrenCount": 3
  }
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Category not found or not accessible to user
- `500` - Server error

### PUT /api/categories/:id

**Purpose:** Update an existing category
**Authentication:** Required (Passport session)
**Parameters:** `id` (ObjectId) - Category ID
**Body:**
```json
{
  "name": "string (optional, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "parentId": "ObjectId (optional, null to remove parent)"
}
```

**Response:**
```json
{
  "success": true,
  "category": {
    "_id": "ObjectId",
    "name": "Updated Name",
    "description": "Updated description",
    "parentId": "ObjectId or null",
    "userId": "ObjectId",
    "isSystemCategory": false,
    "updatedAt": "ISO Date"
  }
}
```

**Errors:**
- `400` - Validation errors (circular reference, duplicate name, cannot modify system category)
- `401` - Unauthorized
- `403` - Forbidden (trying to modify system category as regular user)
- `404` - Category not found
- `500` - Server error

### DELETE /api/categories/:id

**Purpose:** Soft delete a category (mark as deleted)
**Authentication:** Required (Passport session)
**Parameters:** `id` (ObjectId) - Category ID

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Errors:**
- `400` - Cannot delete category with children (must handle children first)
- `401` - Unauthorized
- `403` - Forbidden (trying to delete system category as regular user)
- `404` - Category not found
- `409` - Conflict (category has linked entries)
- `500` - Server error

### GET /api/categories/tree

**Purpose:** Get categories in hierarchical tree structure for UI components
**Authentication:** Required (Passport session)
**Parameters:** None

**Response:**
```json
{
  "success": true,
  "tree": [
    {
      "_id": "ObjectId",
      "name": "Banking",
      "level": 0,
      "hasChildren": true,
      "children": [
        {
          "_id": "ObjectId",
          "name": "Current Accounts",
          "level": 1,
          "hasChildren": false,
          "children": []
        }
      ]
    }
  ]
}
```

## Controllers

### Category Controller (`src/controllers/categoryController.js`)

**Methods:**
- `getAllCategories` - Handle GET /api/categories with hierarchical building
- `createCategory` - Handle POST /api/categories with validation
- `getCategoryById` - Handle GET /api/categories/:id with population
- `updateCategory` - Handle PUT /api/categories/:id with circular reference validation
- `deleteCategory` - Handle DELETE /api/categories/:id with soft delete
- `getCategoryTree` - Handle GET /api/categories/tree with tree structure building

**Business Logic:**
- **Circular Reference Prevention** - Validate parent-child relationships before updates
- **User Ownership** - Ensure users can only access their own categories plus system categories
- **System Category Protection** - Prevent regular users from modifying system categories
- **Hierarchical Queries** - Efficient population of parent-child relationships
- **Soft Delete Logic** - Mark categories as deleted rather than removing from database

## Authentication Integration

All endpoints use existing Passport.js middleware:
- `ensureAuthenticated` - Verify user session
- User context available via `req.user`
- Follow existing authentication patterns in codebase