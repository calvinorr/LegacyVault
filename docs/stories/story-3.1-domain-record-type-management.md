# Story 3.1: Domain Record Type Management

## Status: Ready for Dev

## Story
**As an** administrator,
**I want** to manage the list of Record Types available for each domain,
**so that** I can customize data entry options and ensure consistency.

## Acceptance Criteria
1. A new "Record Type Management" section is available on the Settings page for admin users.
2. In this new section, an administrator can **Create, Read, Update, and Delete** record types.
3. Each record type must be associated with one of the 8 specific life domains.
4. The UI must group the record types by their parent domain (e.g., show all 'Property' record types together).
5. When a user creates or edits a record (e.g., a 'Property' record), the 'Record Type' input field is now a dropdown menu.
6. This dropdown menu is populated with the record types associated with that specific domain.
7. The `<LegacyDataViewer />` component is completely removed from the Settings page.
8. All new backend API endpoints and frontend components are covered by unit and integration tests.

## Dev Notes

### Backend Implementation
- **New Model:** Create a new Mongoose schema in `src/models/RecordType.js`.
  - Schema should contain: `name: String`, `domain: String` (enum of the 8 domains), `user: ObjectId`.
  - Follow conventions in `coding-standards.md` (timestamps, indexes).
- **New Controller:** Create `src/controllers/recordTypeController.js` to handle the business logic for CRUD operations.
- **New Routes:** Create `src/routes/recordTypes.js` to define the API endpoints.
  - `GET /api/record-types` (queries by domain, e.g., `/api/record-types?domain=property`)
  - `POST /api/record-types`
  - `PUT /api/record-types/:id`
  - `DELETE /api/record-types/:id`
  - Secure these routes to be admin-only where appropriate.
- **Data Model Update:** The `recordType` field in the existing domain models (e.g., `PropertyRecord.js`) should remain a String. The frontend will enforce selection from the managed list.

### Frontend Implementation
- **File Location:** New components should be created in `web/src/components/settings/record-types/`.
- **New Components:**
  - `RecordTypeManager.tsx`: Main component to hold the new UI.
  - `RecordTypeList.tsx`: To display record types, grouped by domain.
  - `RecordTypeForm.tsx`: A modal form for adding/editing a record type.
- **API Integration:** Use a new hook, `useRecordTypes`, to fetch and manage data from the new API endpoints.
- **Form Modification:** Update the existing domain record forms (e.g., `web/src/components/records/PropertyRecordForm.tsx`) to replace the text input for `recordType` with a `<select>` dropdown.
- **Settings Page:**
  - Add the new `<RecordTypeManager />` component to `web/src/pages/SettingsPage.tsx`.
  - **Remove** the `<LegacyDataViewer />` component from `SettingsPage.tsx`.

### Testing
- **Backend:** Add `tests/api/recordTypes.test.js` to test the new API endpoints using Supertest.
- **Frontend:** Add unit tests for the new React components using React Testing Library.

## Tasks / Subtasks

### Backend
- [x] **Task 1: Create `RecordType` Model**
  - [x] Define schema in `src/models/RecordType.js` with `name`, `domain`, and `user` fields.
- [x] **Task 2: Implement Controller Logic**
  - [x] Create `src/controllers/recordTypeController.js` with functions for list, create, update, delete.
- [x] **Task 3: Create API Routes**
  - [x] Create `src/routes/recordTypes.js` and register it in `server.js`.
  - [x] Implement GET, POST, PUT, DELETE endpoints.
  - [x] Add admin-level security middleware to modifying routes.
- [x] **Task 4: Write Backend Tests**
  - [x] Create `tests/api/recordTypes.test.js`.
  - [x] Write tests for all CRUD operations, including auth protection.

### Frontend
- [ ] **Task 5: Build Record Type Management UI**
  - [ ] Create `RecordTypeManager.tsx`, `RecordTypeList.tsx`, and `RecordTypeForm.tsx`.
  - [ ] UI should display types grouped by domain and allow add/edit/delete actions.
- [ ] **Task 6: Integrate Frontend with API**
  - [ ] Create `useRecordTypes` hook to fetch and manage data.
  - [ ] Connect the UI components to the hook.
- [ ] **Task 7: Update Domain Record Forms**
  - [ ] Modify the `recordType` field in all 8 domain forms to be a dropdown.
  - [ ] Populate dropdowns by fetching record types for the relevant domain.
- [ ] **Task 8: Update Settings Page**
  - [ ] Add the `<RecordTypeManager />` to `SettingsPage.tsx`.
  - [ ] **Delete** the `<LegacyDataViewer />` component and any related code from `SettingsPage.tsx`.
- [ ] **Task 9: Write Frontend Tests**
  - [ ] Add tests for the new `RecordTypeManager` components.
  - [ ] Add a test to verify the record form dropdown is populated correctly.

