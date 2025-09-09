# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-07-utility-forms-enhancement/spec.md

## Endpoints

### GET /api/utilities

**Purpose:** Retrieve all utilities for the authenticated user
**Parameters:** 
- `type` (optional): Filter by utility type (council-tax, gas-electric, water, tv-licence, internet-phone, insurance)
- `shared` (optional): Include utilities shared with the user
**Response:** Array of utility objects with full details
**Errors:** 401 Unauthorized if not authenticated

### POST /api/utilities

**Purpose:** Create a new utility entry
**Parameters:** Utility object in request body (see database schema for required fields)
**Response:** Created utility object with generated ID
**Errors:** 
- 400 Bad Request for validation errors
- 401 Unauthorized if not authenticated

### GET /api/utilities/:id

**Purpose:** Retrieve a specific utility by ID
**Parameters:** 
- `id`: MongoDB ObjectId of the utility
**Response:** Single utility object
**Errors:** 
- 404 Not Found if utility doesn't exist or user lacks access
- 401 Unauthorized if not authenticated

### PUT /api/utilities/:id

**Purpose:** Update an existing utility entry
**Parameters:** 
- `id`: MongoDB ObjectId of the utility
- Request body: Partial utility object with fields to update
**Response:** Updated utility object
**Errors:** 
- 400 Bad Request for validation errors
- 404 Not Found if utility doesn't exist or user lacks access
- 401 Unauthorized if not authenticated

### DELETE /api/utilities/:id

**Purpose:** Delete a utility entry
**Parameters:** 
- `id`: MongoDB ObjectId of the utility
**Response:** Success confirmation message
**Errors:** 
- 404 Not Found if utility doesn't exist or user lacks access
- 401 Unauthorized if not authenticated

## Controllers

### UtilitiesController Actions

**getAllUtilities**
- Query utilities owned by user or shared with user
- Apply type filtering if specified
- Return formatted utility data with provider contact details

**createUtility**
- Validate required fields based on utility type
- Set owner to authenticated user ID
- Apply UK-specific validation (Council Tax bands, meter number formats)
- Save to utilities collection

**getUtilityById**
- Verify user has access (owner or shared recipient)
- Return full utility details including contact and payment information
- Handle not found cases gracefully

**updateUtility**
- Verify user has ownership or write access
- Apply partial updates while maintaining data integrity
- Re-validate UK-specific fields after updates
- Update metadata (updatedAt timestamp)

**deleteUtility**
- Verify user has ownership
- Handle cascade deletion of related references
- Return confirmation of deletion

## Integration Points

**Authentication Middleware**
- All utility endpoints require authenticated user session
- User ID extracted from session for ownership verification

**Validation Middleware**
- UK utility-specific validation for Council Tax bands, meter numbers
- Required field validation based on utility type
- Format validation for account numbers and policy references

**Authorization Middleware** 
- Ownership verification for create/update/delete operations
- Shared access verification for read operations
- Admin override capabilities for user management scenarios