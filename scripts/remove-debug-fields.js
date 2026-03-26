/**
 * Script to remove debug mode fields (debug_mode, cta_id, portal_id) from all module fields.json files
 *
 * Run with: node scripts/remove-debug-fields.js
 */

const fs = require('fs');
const path = require('path');

// Modules directory
const modulesDir = path.join(__dirname, '..', 'modules');

// Fields to remove from cta_settings groups
const DEBUG_FIELD_NAMES = ['debug_mode', 'cta_id', 'portal_id'];

/**
 * Recursively process fields array to remove debug fields
 */
function removeDebugFields(fields) {
  if (!Array.isArray(fields)) return fields;

  return fields
    .filter(field => {
      // Remove debug fields by name
      if (DEBUG_FIELD_NAMES.includes(field.name)) {
        return false;
      }
      return true;
    })
    .map(field => {
      // Process children recursively
      if (field.children && Array.isArray(field.children)) {
        field.children = removeDebugFields(field.children);
      }

      // Update cta_field visibility - remove the condition that hides it when debug_mode is true
      if (field.name === 'cta_field' && field.visibility) {
        // The visibility was: show when debug_mode NOT_EQUAL true (i.e., show when debug is off)
        // Now we always want to show it, so remove the visibility rule
        delete field.visibility;
      }

      // Clean up default values that reference debug fields
      if (field.default !== undefined) {
        field.default = cleanDefaults(field.default);
      }

      return field;
    });
}

/**
 * Recursively clean default values to remove debug field references
 */
function cleanDefaults(defaultValue) {
  if (defaultValue === null || defaultValue === undefined) {
    return defaultValue;
  }

  if (Array.isArray(defaultValue)) {
    return defaultValue.map(item => cleanDefaults(item));
  }

  if (typeof defaultValue === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(defaultValue)) {
      // Skip debug field keys
      if (DEBUG_FIELD_NAMES.includes(key)) {
        continue;
      }
      cleaned[key] = cleanDefaults(value);
    }
    return cleaned;
  }

  return defaultValue;
}

/**
 * Find all fields.json files in the modules directory
 */
function findFieldsJsonFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === 'fields.json') {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Process a single fields.json file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fields = JSON.parse(content);

    // Check if file contains debug fields
    const contentStr = JSON.stringify(fields);
    if (!contentStr.includes('"debug_mode"') && !contentStr.includes('"cta_id"') && !contentStr.includes('"portal_id"')) {
      return { path: filePath, status: 'skipped', reason: 'No debug fields found' };
    }

    // Process fields
    const cleanedFields = removeDebugFields(fields);

    // Write back with same formatting (2-space indent)
    fs.writeFileSync(filePath, JSON.stringify(cleanedFields, null, 2) + '\n', 'utf8');

    return { path: filePath, status: 'updated' };
  } catch (error) {
    return { path: filePath, status: 'error', reason: error.message };
  }
}

// Main execution
console.log('Removing debug fields from module fields.json files...\n');

const fieldsFiles = findFieldsJsonFiles(modulesDir);
console.log(`Found ${fieldsFiles.length} fields.json files\n`);

let updated = 0;
let skipped = 0;
let errors = 0;

for (const file of fieldsFiles) {
  const result = processFile(file);
  const relativePath = path.relative(process.cwd(), result.path);

  if (result.status === 'updated') {
    console.log(`✅ Updated: ${relativePath}`);
    updated++;
  } else if (result.status === 'skipped') {
    console.log(`⏭️  Skipped: ${relativePath} (${result.reason})`);
    skipped++;
  } else {
    console.log(`❌ Error: ${relativePath} - ${result.reason}`);
    errors++;
  }
}

console.log(`\n--- Summary ---`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
console.log(`Errors: ${errors}`);
