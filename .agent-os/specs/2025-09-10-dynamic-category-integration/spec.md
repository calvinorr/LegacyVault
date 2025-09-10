# Spec Requirements Document

> Spec: Dynamic Category Integration
> Created: 2025-09-10
> Status: Planning

## Overview

Replace hard-coded category arrays in form components with dynamic API calls to the newly implemented hierarchical category management system, ensuring seamless integration across all entry creation and editing forms while maintaining backward compatibility and user experience.

## User Stories

### Form Category Loading

As a user creating or editing financial entries, I want the category dropdown to automatically load current categories from the database, so that I can select from up-to-date category options without having to restart the application when categories are modified.

**Detailed Workflow:** When a user opens any entry form (Add/Edit Utility, Pension, Account), the category dropdown should fetch categories from `/api/categories`, display them in hierarchical order, and automatically select appropriate defaults. Sub-categories should dynamically update based on parent category selection.

### Terminology Consistency

As a UK user managing household bills, I want consistent terminology that reflects how I think about my expenses, so that the interface feels intuitive and matches my mental model of financial organization.

**Detailed Workflow:** All references to "Utilities" should be evaluated for consistency with UK terminology preferences, potentially renaming to "Bills" if this better reflects user expectations. This change should be applied consistently across forms, navigation, and database category seeds.

### Backward Compatibility

As an existing user with stored entries using legacy categories, I want my existing data to remain accessible and properly categorized, so that I don't lose organization or have to manually recategorize all my entries.

**Detailed Workflow:** When forms load existing entries, they should gracefully handle cases where stored categories don't match current dynamic categories, providing fallback behavior and potentially suggesting category migration paths.

## Spec Scope

1. **Form Component Integration** - Replace hard-coded `getCategoryOptions()` functions in AddUtilityModal, EditUtilityModal, AddPensionModal, and EditPensionModal with API calls to `/api/categories`
2. **Dynamic Sub-category Loading** - Implement dynamic sub-category population based on selected parent categories using the hierarchical structure
3. **Terminology Evaluation** - Assess and potentially implement "Utilities" to "Bills" terminology change across codebase and seed data
4. **Loading States** - Add proper loading indicators and error handling for category API calls
5. **Default Category Selection** - Implement intelligent default category selection based on entry type and user patterns

## Out of Scope

- Creating new category management UI components (already exists)
- Modifying the core category API endpoints (already implemented)
- Implementing bulk category migration tools for existing entries
- Advanced category recommendation algorithms

## Expected Deliverable

1. **Dynamic Category Loading** - All form components load categories from API with proper loading states and error handling
2. **Consistent Sub-category Behavior** - Sub-category dropdowns update dynamically based on parent category selection across all forms
3. **Terminology Consistency** - Unified terminology (either "Utilities" or "Bills") used consistently across all components and seed data
4. **Backward Compatible Entry Loading** - Existing entries load correctly even with legacy category references