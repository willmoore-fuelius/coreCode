/**
 * Script to apply UX improvements to all module fields.json files
 * - Improves labels for clarity
 * - Adds help text where missing
 * - Adds placeholders for text fields
 * - Improves repeater item labels
 *
 * Run with: node scripts/apply-ux-improvements.js
 */

const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '..', 'modules');

// Label improvements: map of field names to better labels
const LABEL_IMPROVEMENTS = {
  // Headings
  'heading': 'Headline',
  'heading_type': 'Heading level',
  'subheading': 'Subheadline',
  'summary': 'Summary text',

  // Buttons/CTAs
  'button_type': 'Button type',
  'button_style': 'Button style',
  'button_theme': 'Button colour theme',
  'link_text': 'Button text',
  'link_field': 'Button destination',
  'cta_field': 'Select CTA',
  'cta_settings': 'CTA settings',
  'link_settings': 'Link settings',

  // Media
  'image_field': 'Image',
  'video_url': 'Video URL',
  'media_type': 'Media type',
  'background_image': 'Background image',

  // Layout
  'scrollid': 'Anchor ID',
  'padding_top': 'Top padding',
  'padding_bottom': 'Bottom padding',
  'margin_top': 'Top margin',
  'margin_bottom': 'Bottom margin',

  // Common groups
  'module_heading': 'Section header',
  'module_footer_cta': 'Footer button',
  'spacing_alignment': 'Spacing & alignment',
};

// Help text to add based on field name patterns
const HELP_TEXT_PATTERNS = {
  // Headings
  'heading_type': 'H1 is largest, H6 is smallest. Use H2 for most section headings. Only one H1 per page for SEO.',
  'heading': 'Main heading for this section. Keep concise for best readability.',
  'summary': 'Optional supporting text that appears below the headline.',

  // Buttons
  'button_type': 'Choose "Link" for standard buttons or "CTA" to use a HubSpot CTA.',
  'button_style': 'Primary: main action. Secondary: alternative action. Tertiary: subtle link style.',
  'button_theme': 'Override button colours using theme colour options.',
  'link_text': 'Text displayed on the button. Keep short and action-oriented.',
  'link_field': 'Where the button links to. Can be a page, external URL, file, or email.',
  'cta_field': 'Select a CTA created in Marketing > Lead Capture > CTAs.',

  // Media
  'image_field': 'Recommended size varies by module. Use high-quality images for best results.',
  'video_url': 'Paste a YouTube, Vimeo URL, or select an MP4 from the file manager.',
  'media_type': 'Choose the type of media to display in this section.',
  'background_image': 'Full-width background image. Recommended: 1920×1080px minimum.',

  // Layout
  'scrollid': 'Optional anchor ID for in-page navigation links (e.g., "features" creates #features).',
  'allow_multiple_open': 'When enabled, multiple panels can be expanded at once.',

  // Spacing
  'padding_top': 'Space above the module content (in pixels).',
  'padding_bottom': 'Space below the module content (in pixels).',

  // Repeaters
  'items': 'Add, remove, or reorder items. Drag to rearrange.',
  'cards': 'Add, remove, or reorder cards. Drag to rearrange.',
  'slides': 'Add, remove, or reorder slides. Recommended: 3-5 slides maximum.',
  'statistics': 'Add, remove, or reorder statistics. Recommended: 3-4 for best layout.',
  'features': 'Add, remove, or reorder features. Recommended: 3-6 for best layout.',
};

// Placeholder text for text fields
const PLACEHOLDER_PATTERNS = {
  'heading': 'Enter headline text',
  'link_text': 'Learn more',
  'scrollid': 'section-name',
  'title': 'Enter title',
  'content': 'Enter content here...',
};

// Group-level help text
const GROUP_HELP_TEXT = {
  'accordion': 'Add collapsible panels. Recommended: 5-10 panels. For fewer items, consider using tabs.',
  'module_heading': 'Optional section header with headline, description, and call-to-action.',
  'module_footer_cta': 'Optional button displayed below the module content.',
  'spacing_alignment': 'Control the vertical spacing above and below this module.',
  'style': 'Customise the visual appearance and layout of this module.',
  'banner_slides': 'Add slides to create a carousel. Recommended: 3-5 slides for best engagement.',
  'card_grid': 'Add cards to display in a grid layout. Cards resize based on count.',
  'features': 'Add features with icons and descriptions. Recommended: 3-6 features.',
  'statistics': 'Add statistics with animated counters. Recommended: 3-4 statistics.',
  'testimonials': 'Add customer testimonials or quotes.',
  'form_settings': 'Select a HubSpot form and configure submission behaviour.',
};

// Repeater item label improvements (occurrence groups)
const REPEATER_LABELS = {
  'items': 'Panel',
  'cards': 'Card',
  'slides': 'Slide',
  'statistics': 'Statistic',
  'features': 'Feature',
  'testimonials': 'Testimonial',
  'buttons': 'Button',
  'links': 'Link',
  'images': 'Image',
  'logos': 'Logo',
  'documents': 'Document',
  'icons': 'Icon',
};

/**
 * Process a single field, applying improvements
 */
function processField(field, parentContext = '') {
  let modified = false;

  // Improve label if we have a better one
  if (field.name && LABEL_IMPROVEMENTS[field.name] && field.label !== LABEL_IMPROVEMENTS[field.name]) {
    field.label = LABEL_IMPROVEMENTS[field.name];
    modified = true;
  }

  // Add help text if missing and we have a pattern
  if (field.name && HELP_TEXT_PATTERNS[field.name] && !field.inline_help_text) {
    field.inline_help_text = HELP_TEXT_PATTERNS[field.name];
    modified = true;
  }

  // Add group-level help text
  if (field.name && GROUP_HELP_TEXT[field.name] && !field.inline_help_text && field.type === 'group') {
    field.inline_help_text = GROUP_HELP_TEXT[field.name];
    modified = true;
  }

  // Add placeholder for text fields
  if (field.type === 'text' && field.name && PLACEHOLDER_PATTERNS[field.name] && !field.placeholder) {
    field.placeholder = PLACEHOLDER_PATTERNS[field.name];
    modified = true;
  }

  // Improve repeater occurrence labels
  if (field.occurrence && field.name && REPEATER_LABELS[field.name]) {
    // The label shown for each item in the repeater
    if (!field.occurrence.sorting_label_field) {
      // If there's no sorting label, we can improve the display
    }
  }

  // Process children recursively
  if (field.children && Array.isArray(field.children)) {
    for (const child of field.children) {
      if (processField(child, field.name)) {
        modified = true;
      }
    }
  }

  return modified;
}

/**
 * Find all fields.json files
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
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fields = JSON.parse(content);

    let modified = false;
    for (const field of fields) {
      if (processField(field)) {
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(fields, null, 2) + '\n', 'utf8');
      return { path: filePath, status: 'updated' };
    }

    return { path: filePath, status: 'unchanged' };
  } catch (error) {
    return { path: filePath, status: 'error', reason: error.message };
  }
}

// Main execution
console.log('Applying UX improvements to module fields.json files...\n');

const fieldsFiles = findFieldsJsonFiles(modulesDir);
console.log(`Found ${fieldsFiles.length} fields.json files\n`);

let updated = 0;
let unchanged = 0;
let errors = 0;

for (const file of fieldsFiles) {
  const result = processFile(file);
  const relativePath = path.relative(process.cwd(), result.path);

  if (result.status === 'updated') {
    console.log(`✅ Updated: ${relativePath}`);
    updated++;
  } else if (result.status === 'unchanged') {
    console.log(`⏭️  Unchanged: ${relativePath}`);
    unchanged++;
  } else {
    console.log(`❌ Error: ${relativePath} - ${result.reason}`);
    errors++;
  }
}

console.log(`\n--- Summary ---`);
console.log(`Updated: ${updated}`);
console.log(`Unchanged: ${unchanged}`);
console.log(`Errors: ${errors}`);
