# Spec Tasks

## Tasks

- [ ] 1. Create Custom Hook for Category Management
  - [ ] 1.1 Write tests for useCategories hook functionality
  - [ ] 1.2 Implement useCategories hook with API integration and caching
  - [ ] 1.3 Add error handling and loading states to the hook
  - [ ] 1.4 Verify all hook tests pass

- [ ] 2. Assess and Implement Terminology Change (Utilities → Bills)
  - [ ] 2.1 Write tests for terminology consistency across components
  - [ ] 2.2 Update seed data from "Utilities" to "Bills" if needed
  - [ ] 2.3 Update hard-coded category references in form components
  - [ ] 2.4 Update display logic in dashboard and account pages
  - [ ] 2.5 Verify terminology consistency tests pass

- [ ] 3. Integrate Dynamic Categories in AddUtilityModal
  - [ ] 3.1 Write tests for dynamic category loading in AddUtilityModal
  - [ ] 3.2 Replace getCategoryOptions() with useCategories hook
  - [ ] 3.3 Implement dynamic sub-category loading based on parent selection
  - [ ] 3.4 Add loading states and error handling with fallback
  - [ ] 3.5 Verify all AddUtilityModal integration tests pass

- [ ] 4. Integrate Dynamic Categories in EditUtilityModal
  - [ ] 4.1 Write tests for dynamic category loading in EditUtilityModal
  - [ ] 4.2 Replace getCategoryOptions() with useCategories hook
  - [ ] 4.3 Handle backward compatibility for existing entries with legacy categories
  - [ ] 4.4 Add loading states and error handling with fallback
  - [ ] 4.5 Verify all EditUtilityModal integration tests pass

- [ ] 5. Integrate Dynamic Categories in Pension Modals
  - [ ] 5.1 Write tests for dynamic category loading in pension modals
  - [ ] 5.2 Replace getCategoryOptions() in AddPensionModal and EditPensionModal
  - [ ] 5.3 Implement consistent sub-category behavior across pension forms
  - [ ] 5.4 Add loading states and error handling with fallback
  - [ ] 5.5 Verify all pension modal integration tests pass