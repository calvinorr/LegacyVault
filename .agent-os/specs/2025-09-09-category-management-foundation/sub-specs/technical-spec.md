# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-09-category-management-foundation/spec.md

## Technical Requirements

### Backend Requirements

- **Category Model** - MongoDB/Mongoose schema in `src/models/category.js` with fields: name, description, parentId (ObjectId reference), userId (owner), isSystemCategory (boolean), createdAt, updatedAt
- **Hierarchical Structure** - Support unlimited nesting levels using parent-child ObjectId references with population support
- **API Routes** - RESTful endpoints at `/api/categories/*` following existing pattern in codebase
- **Validation** - Prevent circular references, enforce unique names within same parent level, validate required fields
- **Soft Delete Support** - Mark categories as deleted rather than hard delete to maintain entry relationships
- **Authentication Integration** - Use existing Passport.js middleware for protected routes

### Frontend Requirements

- **Category Management Component** - New section in existing Settings page (`web/src/pages/Settings.tsx`)
- **Tree Display Component** - Hierarchical tree view showing parent-child relationships with expand/collapse functionality
- **CRUD Forms** - Add/Edit category forms with parent selection dropdown (populated from existing categories)
- **State Management** - Use React hooks for local state, API integration following existing patterns in codebase
- **TypeScript Interfaces** - Define Category type interfaces in `web/src/types/` directory
- **Error Handling** - User-friendly error messages for validation failures and network issues

### UI/UX Specifications

- **Settings Integration** - Add "Category Management" tab/section to existing Settings page navigation
- **Tree View** - Indented list or tree component showing category hierarchy with visual parent-child indicators
- **Form Design** - Modal dialogs or inline forms for Add/Edit operations consistent with existing UI patterns
- **Confirmation Dialogs** - Warning dialogs when deleting categories, especially if they have child categories
- **Loading States** - Proper loading indicators during API operations
- **UK Terminology** - Use UK-appropriate financial category names and descriptions

### Integration Requirements

- **Entry Model Preparation** - Add optional `categoryId` field to existing Entry model for future category assignment
- **Seeding Script** - Create initial UK financial categories (Banking, Current Accounts, Savings, Utilities, Council Tax, Insurance, etc.)
- **API Error Handling** - Follow existing error response patterns in codebase
- **Database Indexing** - Add indexes on parentId and userId fields for query performance