# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-10-dynamic-category-integration/spec.md

## Technical Requirements

- **Form Component Refactoring**: Replace static `getCategoryOptions()` functions with `useEffect` hooks that fetch categories from `/api/categories` endpoint
- **State Management**: Implement `useState` for categories, loading states, and error handling in each affected form component
- **Dynamic Sub-category Loading**: Create `useEffect` dependency on parent category selection to trigger sub-category API calls
- **Error Handling**: Implement fallback to hard-coded categories if API calls fail, with user-friendly error messages
- **Loading States**: Add loading spinners or skeleton UI for category dropdowns during API fetch operations
- **Caching Strategy**: Implement basic category data caching to avoid unnecessary API calls on form reopening
- **TypeScript Integration**: Ensure proper typing for category data structures using existing `Category` and `CategoryTreeResponse` types
- **Default Selection Logic**: Implement intelligent default category selection based on entry type (utility → Bills/Utilities, pension → Pensions)
- **Terminology Consistency**: Systematically replace "Utilities" with "Bills" across all components, routes, and seed data if determined appropriate
- **Backward Compatibility**: Handle cases where existing entry categories don't match current API categories, providing graceful degradation
- **React Hooks Pattern**: Use custom hooks pattern for category fetching to enable reuse across multiple form components