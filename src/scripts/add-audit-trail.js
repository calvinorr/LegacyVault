/**
 * Script to add audit trail fields to domain schemas
 * Run with: node src/scripts/add-audit-trail.js
 */

const fs = require('fs');
const path = require('path');

const auditFields = `
  // Audit trail fields
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  history: [{
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: { type: Date, default: Date.now },
    changes: { type: Map, of: Schema.Types.Mixed }
  }]`;

const auditMiddleware = `
// Middleware to track modifications
SCHEMA_NAME.pre('save', function(next) {
  // Track creation
  if (this.isNew && this.user) {
    this.createdBy = this.user;
  }

  // Track modifications
  if (this.isModified() && !this.isNew) {
    const changes = {};
    this.modifiedPaths().forEach(path => {
      if (path !== 'history' && path !== 'lastModifiedBy' && path !== 'updatedAt') {
        changes[path] = this[path];
      }
    });

    if (Object.keys(changes).length > 0) {
      this.history.push({
        modifiedBy: this.lastModifiedBy || this.user,
        modifiedAt: new Date(),
        changes
      });
    }
  }
  next();
});
`;

const domainModels = [
  'PropertyRecord',
  'VehicleRecord',
  'EmploymentRecord',
  'GovernmentRecord',
  'InsuranceRecord',
  'LegalRecord',
  'ServicesRecord'
];

domainModels.forEach(modelName => {
  const filePath = path.join(__dirname, '../models/domain', `${modelName}.js`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has audit fields
    if (content.includes('createdBy')) {
      console.log(`✓ ${modelName} already has audit fields`);
      return;
    }

    // Add audit fields before }, { timestamps: true });
    content = content.replace(
      /(\s+notes: \{ type: String \},?)\n(}, \{ timestamps: true \})/,
      `$1\n${auditFields}\n$2`
    );

    // Add audit middleware before module.exports
    const schemaVarName = modelName.charAt(0).toLowerCase() + modelName.slice(1) + 'Schema';
    const middleware = auditMiddleware.replace(/SCHEMA_NAME/g, schemaVarName);

    content = content.replace(
      /(propertyRecordSchema|vehicleRecordSchema|employmentRecordSchema|governmentRecordSchema|insuranceRecordSchema|legalRecordSchema|servicesRecordSchema)\.index\([^)]+\);?\n+module\.exports/,
      `$1.index$&\n${middleware}\nmodule.exports`.replace('module.exportsmodule.exports', 'module.exports')
    );

    // Better approach - insert before final module.exports
    if (!content.includes('Middleware to track modifications')) {
      content = content.replace(
        /\nmodule\.exports = mongoose\.model/,
        `${middleware.replace('SCHEMA_NAME', schemaVarName)}\nmodule.exports = mongoose.model`
      );
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated ${modelName}`);

  } catch (error) {
    console.error(`✗ Error updating ${modelName}:`, error.message);
  }
});

console.log('\n✅ Audit trail migration complete');
