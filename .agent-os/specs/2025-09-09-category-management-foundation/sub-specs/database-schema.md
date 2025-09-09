# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-09-category-management-foundation/spec.md

## Category Schema

### New Category Model (`src/models/category.js`)

```javascript
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isSystemCategory: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure unique names within same parent level for same user
categorySchema.index({ name: 1, parentId: 1, userId: 1 }, { unique: true });

// Index for hierarchical queries
categorySchema.index({ parentId: 1, userId: 1 });
categorySchema.index({ userId: 1, isDeleted: 1 });
```

### Entry Model Updates (`src/models/entry.js`)

Add optional category reference to existing Entry schema:

```javascript
// Add this field to existing Entry schema
categoryId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category',
  default: null
}
```

## Validation Rules

### Category Validation
- **Name**: Required, max 100 characters, trimmed
- **Description**: Optional, max 500 characters, trimmed
- **Parent Relationship**: Cannot create circular references (category cannot be parent of itself or ancestor)
- **Unique Constraint**: Category names must be unique within same parent level for same user
- **System Category Protection**: System categories cannot be deleted by regular users

### Hierarchical Integrity
- **Circular Reference Prevention**: Validate that parentId does not create circular dependency
- **Orphan Prevention**: When deleting category with children, require explicit handling (move children or delete cascade)
- **Depth Limitation**: Optional maximum nesting depth (recommend 5 levels for performance)

## Indexing Strategy

### Performance Indexes
- `{ name: 1, parentId: 1, userId: 1 }` - Unique constraint and name lookups
- `{ parentId: 1, userId: 1 }` - Child category queries
- `{ userId: 1, isDeleted: 1 }` - User category listing with soft delete filtering
- `{ userId: 1, isSystemCategory: 1 }` - System vs user category separation

## Migration Considerations

### Initial Data Seeding
- Create system-level UK financial categories during application startup
- Default categories: Banking, Current Accounts, Savings Accounts, Credit Cards, Utilities, Council Tax, Insurance, Pensions
- System categories owned by system user or marked with `isSystemCategory: true`

### Future Compatibility
- Entry model prepared for category assignment without breaking existing functionality
- Soft delete approach maintains data integrity for historical entries
- Schema designed to support future multi-user household sharing features