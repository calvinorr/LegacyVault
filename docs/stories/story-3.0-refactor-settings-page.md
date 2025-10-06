# Story 3.0: Refactor Settings Page

## Status: Ready for Dev

## Story
**As a** user,
**I want** the Settings page to be consistent with the modern design and architecture of the application,
**so that** I have a seamless and intuitive experience.

## Acceptance Criteria
1. The `Settings.tsx` page is refactored to use the modern layout and components (e.g., `<Card>`) from the premium design system.
2. All references to legacy components like `CategoryManagement` and old inline styles are completely removed.
3. The navigation within the settings page is simplified and updated to reflect current and future features.
4. A placeholder section for the upcoming "Record Type Management" feature is added.
5. Existing, non-legacy functionality (like viewing user profile information) is preserved within the new structure.
6. The refactored page is covered by a basic rendering test.

## Tasks / Subtasks
- [ ] **Task 1: Refactor `Settings.tsx`**
  - [ ] Replace the entire content of `web/src/pages/Settings.tsx` with a new, modern structure.
  - [ ] Use the `<Card>` and other UI components consistent with the rest of the application.
  - [ ] Remove all legacy code, especially the `CategoryManagement` component and the old sidebar navigation.
- [ ] **Task 2: Add Placeholder for Record Type Management**
  - [ ] Add a new `<Card>` component that will house the UI for Story 3.1.
- [ ] **Task 3: Write Basic Test**
  - [ ] Create a new test file `tests/frontend/Settings.test.tsx`.
  - [ ] Write a simple test to ensure the refactored `Settings` page renders without crashing.
