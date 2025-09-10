# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-10-bank-import-bills-integration/spec.md

## Endpoints

### POST /api/entries/from-transaction

**Purpose:** Create entry from bank transaction data with smart category suggestion
**Parameters:** 
- transactionId: string
- sessionId: string
- categoryOverride: ObjectId (optional)
**Response:** Created entry object with suggested category
**Errors:** Transaction not found, invalid session, category suggestion failure

### PUT /api/import-sessions/:id/transactions/:transactionId/status

**Purpose:** Mark transaction as processed after entry creation
**Parameters:** 
- sessionId: string
- transactionId: string  
- status: "processed" | "pending" | "skipped"
**Response:** Updated transaction status
**Errors:** Session/transaction not found, invalid status

### POST /api/entries/bulk-from-transactions

**Purpose:** Create multiple entries from selected transactions
**Parameters:** 
- transactionIds: array[string]
- sessionId: string
- categoryMappings: object (transactionId -> categoryId)
**Response:** Array of created entries with processing results
**Errors:** Partial failures reported per transaction

### GET /api/categories/suggest/:payee

**Purpose:** Get category suggestions based on payee/description
**Parameters:** 
- payee: string (URL encoded)
- description: string (optional query param)
**Response:** Array of suggested categories with confidence scores
**Errors:** No suggestions found (empty array response)