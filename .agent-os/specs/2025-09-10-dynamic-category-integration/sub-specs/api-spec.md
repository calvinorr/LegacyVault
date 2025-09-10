# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-10-dynamic-category-integration/spec.md

## Endpoints

### GET /api/categories

**Purpose:** Retrieve hierarchical category tree for form dropdown population
**Parameters:** None
**Response:** CategoryTreeResponse with nested category structure
**Errors:** 401 (unauthenticated), 403 (not approved), 500 (server error)

**Integration Notes:** This endpoint already exists and will be used by form components to replace hard-coded category arrays. The hierarchical response structure supports both parent categories and sub-categories for dynamic dropdown population.

### Potential New Endpoint: GET /api/categories/flat

**Purpose:** Retrieve flattened category list optimized for form dropdowns (if hierarchical parsing becomes complex)
**Parameters:** 
- `?includeSubcategories=true` - Include sub-categories in flat list
- `?type=entry_type` - Filter categories relevant to specific entry types
**Response:** Array of category objects with parent-child relationships flattened
**Errors:** 401 (unauthenticated), 403 (not approved), 500 (server error)

**Note:** This endpoint is optional and only needed if the existing hierarchical `/api/categories` proves difficult to parse for form dropdown needs.

## Controllers

### CategoryController Integration

**Action:** Form components will use existing `CategoryController.getCategories` method
**Business Logic:** No changes needed to existing controller logic
**Error Handling:** Frontend components must handle API errors gracefully with fallback to hard-coded categories

## Frontend API Integration

**getCategories() Function:** Already exists in `api.ts` and returns `CategoryTreeResponse`
**Form Integration:** Each form component will call `getCategories()` on mount and handle the hierarchical response structure for dropdown population
**Caching Strategy:** Implement component-level or context-level caching to avoid repeated API calls across form opens