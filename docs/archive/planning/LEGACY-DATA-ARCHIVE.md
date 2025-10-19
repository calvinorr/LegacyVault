# Legacy Data Archive - Story 2.5

**Status:** ✅ Complete
**Date:** 2025-10-05
**Epic:** Epic 2 - Legacy System Retirement

---

## Overview

Epic 2 retired the legacy Bills/Accounts/Categories system in favor of the new Life Domain Architecture (Epic 1). To ensure data safety and reversibility, legacy data has been **archived** (not deleted).

---

## What Was Archived

### Legacy Collections:
1. **entries** - Legacy bills/accounts records
2. **categories** - Legacy category definitions
3. **contacts** - Legacy contact records
4. **recurringdetectionrules** - Legacy detection rules (preserved for Bank Import compatibility)

### Legacy Code (Story 2.2):
- Routes: `src/legacy/routes/*.js` (5 files)
- Pages: `web/src/legacy/pages/*.tsx` (5 files)

---

## Archive Method

### Data Archiving (Story 2.5):
```javascript
// Documents marked with _archived flag
{
  _archived: true,
  _archivedAt: Date,
  _archivedBy: "Story 2.5 - Legacy System Retirement"
}
```

### API Routes:
- Legacy routes **removed** from `src/server.js` (Story 2.2)
- Requests to `/api/entries`, `/api/categories`, etc. return **404 Not Found**
- Data remains in MongoDB but is not exposed via API

---

## Data Access

### If You Need Legacy Data:

#### Option 1: MongoDB Shell
```bash
# Connect to MongoDB
mongosh <your-mongodb-connection-string>

# Find archived entries
db.entries.find({ _archived: true }).limit(10)

# Count archived documents
db.entries.countDocuments({ _archived: true })
```

#### Option 2: Restore Temporarily
```javascript
// Remove _archived flag to restore
db.entries.updateMany(
  { _archived: true },
  { $unset: { _archived: "", _archivedAt: "", _archivedBy: "" } }
)
```

#### Option 3: Export to JSON
```bash
# Export archived entries to JSON file
mongoexport --uri="<connection-string>" \
  --collection=entries \
  --query='{"_archived":true}' \
  --out=archived_entries.json
```

---

## Storage Implications

### MongoDB Storage:
- Archived data **remains in MongoDB**
- Counts toward storage limits (512MB free tier)
- Not automatically deleted
- Can be manually purged if storage is needed

### Database Statistics:
Run archive script to see storage usage:
```bash
node src/scripts/archive-legacy-data.js
```

---

## Migration Path

### From Legacy to Domain Records:

1. **Manual Migration** (if needed):
   - Identify legacy entry by provider/category
   - Create equivalent domain record (Property, Vehicles, etc.)
   - Link documents using GridFS documentIds
   - Mark legacy entry as migrated

2. **Bank Import** (automated):
   - Story 2.3/2.4: Bank Import now creates domain records
   - Old transactions → legacy entries (archived)
   - New transactions → domain records (active)

---

## Reversibility

### Full Rollback (if needed):

1. **Restore Legacy Routes**:
   ```bash
   # Move routes back from legacy/
   mv src/legacy/routes/*.js src/routes/
   ```

2. **Re-register Routes** in `src/server.js`:
   ```javascript
   app.use('/api/entries', require('./routes/entries'));
   app.use('/api/categories', require('./routes/categories'));
   // etc.
   ```

3. **Unarchive Data**:
   ```javascript
   db.entries.updateMany(
     { _archived: true },
     { $unset: { _archived: "", _archivedAt: "", _archivedBy: "" } }
   )
   ```

4. **Restore Frontend Pages**:
   ```bash
   mv web/src/legacy/pages/*.tsx web/src/pages/
   ```

---

## Database Backup

### Before Archive (Recommended):

```bash
# Full database backup
mongodump --uri="<connection-string>" --out=./backup-before-epic-2

# Backup specific collections
mongodump --uri="<connection-string>" \
  --collection=entries \
  --collection=categories \
  --out=./backup-legacy-collections
```

### Restore from Backup:
```bash
mongorestore --uri="<connection-string>" ./backup-before-epic-2
```

---

## Testing Archive

### Test Archive Script:
```bash
# Dry run (check what will be archived)
node src/scripts/archive-legacy-data.js

# Actual archive (only runs if you execute it)
npm run archive:legacy
```

### Verify Archive:
```bash
# Check entries are archived
mongosh <uri> --eval "db.entries.countDocuments({ _archived: true })"

# Check legacy routes return 404
curl http://localhost:3000/api/entries
```

---

## FAQ

**Q: Can I delete archived data to save storage?**
A: Yes, but **not recommended** until you're certain you don't need it. Use MongoDB queries to delete specific collections:
```javascript
db.entries.deleteMany({ _archived: true })
```

**Q: How do I see what was archived?**
A: Run the archive script to see statistics, or query MongoDB directly.

**Q: Does archiving affect Bank Import?**
A: No. Bank Import now creates domain records (Story 2.3/2.4), not legacy entries.

**Q: Can I restore just one archived entry?**
A: Yes, remove the `_archived` flag from that specific document.

---

## Epic 2 Summary

### Stories Completed:
- ✅ Story 2.1: Navigation cleanup (removed legacy nav items)
- ✅ Story 2.2: Legacy route removal (archived code)
- ✅ Story 2.3: Bank Import schema migration (creates domain records)
- ✅ Story 2.4: Bank Import domain intelligence (100% accuracy)
- ✅ Story 2.5: Legacy data archive (THIS DOCUMENT)

### Result:
- Clean domain-first navigation
- Bank Import creates domain records automatically
- Legacy data safely archived and reversible
- Storage usage monitored
- Full rollback capability documented

---

**Last Updated:** 2025-10-05
**Maintainer:** PM Agent (John) / Dev Agent (James)
**Status:** Epic 2 Complete ✅
