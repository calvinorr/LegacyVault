# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-07-bank-import-functionality/spec.md

> Created: 2025-09-07
> Version: 1.0.0

## Endpoints

### POST /api/import/upload

**Purpose:** Upload and process PDF bank statement
**Parameters:** 
- `file` (multipart/form-data): PDF bank statement file
- `deleteAfterProcessing` (boolean, optional): Auto-delete source data after processing
**Response:** 
```json
{
  "success": true,
  "sessionId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "status": "processing",
  "message": "PDF uploaded successfully, processing transactions..."
}
```
**Errors:** 
- 400: Invalid file format or size
- 413: File too large
- 500: Processing error

### GET /api/import/session/:sessionId

**Purpose:** Get import session status and results
**Parameters:** 
- `sessionId` (URL param): Import session ID
**Response:** 
```json
{
  "success": true,
  "session": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fileName": "statement-march-2025.pdf",
    "status": "completed",
    "uploadedAt": "2025-09-07T10:30:00Z",
    "processedAt": "2025-09-07T10:31:30Z",
    "transactionCount": 145,
    "recurringDetected": 12
  },
  "detectedRecurring": [
    {
      "id": "temp_001",
      "payee": "British Gas",
      "normalizedPayee": "British Gas",
      "category": "utility",
      "subcategory": "gas",
      "frequency": "monthly",
      "averageAmount": 89.50,
      "transactionCount": 3,
      "firstSeen": "2025-01-15T00:00:00Z",
      "lastSeen": "2025-03-15T00:00:00Z",
      "confidence": 95
    }
  ]
}
```
**Errors:** 
- 404: Session not found or expired
- 403: Unauthorized access to session

### POST /api/import/session/:sessionId/confirm

**Purpose:** Confirm selected recurring payments for creation as vault entries
**Parameters:** 
- `sessionId` (URL param): Import session ID
- `confirmations` (JSON body): Array of confirmation objects
```json
{
  "confirmations": [
    {
      "detectedId": "temp_001",
      "action": "accept", // "accept", "reject", "edit"
      "edits": {
        "name": "British Gas Energy",
        "category": "utility",
        "amount": 89.50,
        "frequency": "monthly",
        "notes": "Gas bill for property"
      }
    }
  ]
}
```
**Response:** 
```json
{
  "success": true,
  "created": [
    {
      "entryId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "British Gas Energy",
      "type": "utility"
    }
  ],
  "rejected": 0,
  "errors": []
}
```
**Errors:** 
- 400: Invalid confirmation data
- 404: Session not found

### DELETE /api/import/session/:sessionId

**Purpose:** Delete import session and all associated data
**Parameters:** 
- `sessionId` (URL param): Import session ID
**Response:** 
```json
{
  "success": true,
  "message": "Import session and all associated data deleted"
}
```
**Errors:** 
- 404: Session not found
- 403: Unauthorized access

### GET /api/import/sessions

**Purpose:** Get list of user's import sessions
**Parameters:** 
- `limit` (query, optional): Number of sessions to return (default: 10)
- `status` (query, optional): Filter by status
**Response:** 
```json
{
  "success": true,
  "sessions": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fileName": "statement-march-2025.pdf",
      "status": "completed",
      "uploadedAt": "2025-09-07T10:30:00Z",
      "transactionCount": 145,
      "recurringDetected": 12
    }
  ],
  "total": 5
}
```

### GET /api/import/detection-rules

**Purpose:** Get current detection rules for recurring payment categorization
**Parameters:** None
**Response:** 
```json
{
  "success": true,
  "rules": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "ruleName": "British Gas",
      "category": "utility",
      "subcategory": "gas",
      "payeePatterns": ["BRITISH GAS", "BT GAS", "BRITISHGAS"],
      "keywords": ["gas", "energy"],
      "confidence": 95,
      "enabled": true
    }
  ]
}
```

## Controllers

### ImportController

**uploadStatement(req, res)**
- Validates uploaded PDF file
- Creates new ImportSession document
- Initiates background processing of PDF
- Returns session ID for polling

**getSessionStatus(req, res)**
- Retrieves import session by ID
- Validates user ownership
- Returns processing status and detected recurring payments
- Handles expired sessions gracefully

**confirmSuggestions(req, res)**
- Processes user confirmations for detected recurring payments
- Creates new Entry documents for accepted suggestions
- Updates import session with confirmation results
- Handles bulk operations efficiently

**deleteSession(req, res)**
- Removes import session and all associated temporary data
- Ensures complete data cleanup for privacy
- Validates user ownership before deletion

**getUserSessions(req, res)**
- Returns paginated list of user's import sessions
- Filters by status if requested
- Includes summary statistics for each session

### DetectionRulesController

**getDetectionRules(req, res)**
- Returns current set of detection rules
- Filters enabled rules only
- Provides rule metadata for client-side categorization

**Background Processing Functions**

**processImportedPDF(sessionId)**
- Extracts text from uploaded PDF using pdf2json
- Parses transaction data with bank-specific format handlers
- Runs recurring payment detection algorithm
- Updates session status and stores results
- Handles errors and timeouts gracefully

**detectRecurringPayments(transactions)**
- Groups transactions by payee using fuzzy matching
- Analyzes payment frequency and amount consistency
- Applies detection rules for categorization
- Calculates confidence scores for each detection
- Returns structured recurring payment suggestions