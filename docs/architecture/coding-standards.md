# Coding Standards

## File Structure
- **Models:** `src/models/` - Mongoose schemas
- **Routes:** `src/routes/` - Express routers
- **Controllers:** `src/controllers/` - Business logic
- **Middleware:** `src/middleware/` - Auth, validation
- **Utils:** `src/utils/` - Helper functions
- **Services:** `src/services/` - External integrations

## Naming Conventions
- **Files:** kebab-case (e.g., `user-service.js`)
- **Models:** PascalCase (e.g., `UserSchema`, `PropertyRecord`)
- **Routes:** lowercase with hyphens (e.g., `/api/domains/property/records`)
- **Variables:** camelCase (e.g., `userId`, `recordType`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `VALID_DOMAINS`)

## Code Style
- **Indentation:** 2 spaces (no tabs)
- **Quotes:** Single quotes for strings
- **Semicolons:** Always use
- **Async/Await:** Prefer over promises
- **Error Handling:** Always use try-catch in async routes

## Mongoose Patterns
- Always include `{ timestamps: true }` in schemas
- Use `Schema.Types.ObjectId` for references
- Use enums for fixed value sets
- Add indexes for frequently queried fields
- Use `required: true` for mandatory fields

## API Conventions
- **Authentication:** Use `ensureAuthenticated` middleware
- **Error Responses:** `{ error: 'message' }` format
- **Success Responses:** Return created/updated object
- **Status Codes:**
  - 200: Success
  - 201: Created
  - 400: Bad request/validation error
  - 404: Not found
  - 500: Server error

## Comments
- Add JSDoc comments for exported functions
- Explain "why" not "what" in inline comments
- Document complex business logic
- Keep comments updated with code changes
