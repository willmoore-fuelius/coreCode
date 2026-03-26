---
name: client-handover-guide
description: Generate a self-contained usage guide for a HubSpot CMS module or feature, written for non-technical client content editors. Use this skill whenever the user has built a module, component, or feature and needs to write handover documentation, a user guide, training notes, or usage instructions for the client. Also trigger when the user says "write a guide for the client", "document this module for handover", "explain how to use this module", "training doc", "client documentation", or mentions that a client needs to know how to use something that was built. Covers any scenario where a developer needs to produce end-user instructions for content editors working in HubSpot's page editor.
argument-hint: module-path or description
---

# Client Handover Guide

You are writing a usage guide for a non-technical client who will be editing content in HubSpot's page editor. The guide must be completely self-contained - assume the reader may have limited experience with HubSpot and no one will be available to answer follow-up questions.

## Input

The user will provide one or more of:

- A **module path** (e.g. `modules/page/accordion.module`) — read the module's `fields.json`, `meta.json`, and `module.html` to extract field names, types, labels, and structure automatically
- A description of the module or feature that was built
- The module's field structure (field names, types, purposes)
- Screenshots or visual references
- Context about what the module does on the page

**If a module path is provided:** Read the module files first. Extract all field labels, types, and `inline_help_text` values from `fields.json`. Use `meta.json` for the module label. Use `module.html` to understand the rendered structure and which fields control what. This gives you accurate, complete information without needing to ask.

If the input does not provide enough detail to write accurate instructions (e.g. no module path and field names or types are missing), ask before drafting. Do not invent field names or guess at module behaviour.

## Output Format

Produce a structured guide in markdown format suitable for posting on a Jira ticket, Confluence page, or Google Doc.

### Structure

```
# [Module/Feature Name] - Usage Guide

## Overview
One or two sentences explaining what this module does and where it appears on the site.

## How to Edit

Step-by-step instructions for editing the module's content, covering each field.

## Field Reference
A table or list of all editable fields with their purpose and any constraints.

## Tips and Notes
Any non-obvious behaviour, limitations, or best practices the client should know.
```

Adapt this structure based on the complexity of the module. A simple text-and-image module may only need the overview and editing steps. A complex multi-tab module may need the full structure with sub-sections.

## Writing Rules

### Language and Tone

1. **Write for someone who is not technical.** No code, no developer terminology, no references to HubL, HTML, CSS, fields.json, or module internals.

2. **Use the language of the HubSpot editor.** Reference what the client sees:
   - "Click the module" not "select the component"
   - "The text editor" not "the rich text field"
   - "The image picker" not "the image field"
   - "Toggle" or "switch" not "boolean field"
   - "Dropdown" not "choice field"

3. **Be specific about locations.** "In the left sidebar" or "in the module settings panel" rather than vague references.

4. **UK English** throughout.

### Instructions

5. **Number each step.** Use sequential numbered steps for the editing process.

6. **One action per step.** Each step should describe exactly one thing to do.
   - Good: "1. Click on the module in the page editor to select it."
   - Good: "2. In the left sidebar, enter your heading text in the Heading field."
   - Bad: "1. Click on the module and enter your heading text."

7. **Describe what happens after each action** when it is not obvious. For example: "Click on the module in the page editor. The module settings will appear in the left sidebar."

8. **Cover common editor actions when relevant.** When a field requires knowledge of HubSpot's editor, include brief instructions:
   - **Rich text / text editor:** How to format text (bold, italic, links), how to add a link
   - **Image upload:** How to select an image from the file manager or upload a new one, mention recommended image dimensions if known
   - **Links:** How to paste a URL or link to an internal page
   - **Repeating items:** How to add, remove, and reorder items if the module uses a repeater

9. **Include image dimensions and constraints** if known. For example: "Recommended image size: 800 x 600 pixels. Larger images will be resized automatically."

### What Not To Do

- Do not reference the codebase, file structure, or technical implementation
- Do not use conditional language about features ("if this field is available") - describe what exists
- Do not include troubleshooting steps unless the user specifically requests them
- Do not assume knowledge of HubSpot beyond basic page editing (clicking, typing, saving)
- Do not add marketing language or subjective commentary about the module's design
- Do not pad the guide with unnecessary context - keep each section focused

## Field Reference Format

When listing fields, use a simple table:

| Field | What it does | Notes |
|-------|-------------|-------|
| Heading | The main heading displayed above the content | Leave empty to hide the heading |
| Background Image | The full-width image behind the text | Recommended size: 1920 x 800px |
| Button Text | The label shown on the button | Keep to 2-3 words |
| Button Link | Where the button takes the user | Can be a page on your site or an external URL |

## Scaling to Larger Deliverables

When documenting multiple modules or a broader feature set:

- Add a table of contents at the top
- Group related modules under section headings
- Maintain consistent formatting across all module guides
- Add a "General Editing Tips" section at the start covering shared concepts (saving, previewing, publishing) so they are not repeated in every module guide

## Example

### Input
"Built a testimonial carousel module. Has a repeater for testimonials - each one has a quote (rich text), author name (text), author role (text), and author photo (image). Also has a heading field above the carousel and a background colour picker."

### Output

# Testimonial Carousel - Usage Guide

## Overview
This module displays a rotating carousel of client testimonials. It appears as a full-width section with a heading, followed by testimonial cards that visitors can scroll through.

## How to Edit

1. Click on the testimonial carousel module in the page editor to select it. The module settings will appear in the left sidebar.

2. In the **Heading** field, enter the text you would like to display above the testimonials. For example: "What Our Clients Say". Leave this field empty if you do not want a heading.

3. To change the background colour, click the **Background Colour** swatch and select your preferred colour from the picker.

4. Scroll down to the **Testimonials** section. You will see a list of your existing testimonials.

5. To edit an existing testimonial, click on it to expand its fields:
   - **Quote** - Enter the testimonial text. You can use the text editor toolbar to add bold or italic formatting.
   - **Author Name** - Enter the person's full name.
   - **Author Role** - Enter their job title or role. For example: "Marketing Director, Acme Ltd".
   - **Author Photo** - Click "Select an image" to choose a photo from your file manager, or upload a new one. Recommended size: 200 x 200 pixels (square).

6. To add a new testimonial, click the **Add** button at the bottom of the testimonials list. A new blank testimonial will appear for you to fill in.

7. To remove a testimonial, hover over it and click the delete icon.

8. To reorder testimonials, drag and drop them into your preferred order.

9. Click **Apply changes** in the sidebar, then preview your page to check the carousel looks correct before publishing.

## Field Reference

| Field | What it does | Notes |
|-------|-------------|-------|
| Heading | Text displayed above the carousel | Leave empty to hide |
| Background Colour | The section's background colour | Use the colour picker to select |
| Quote | The testimonial text | Supports bold and italic formatting |
| Author Name | The person's name | Displayed below the quote |
| Author Role | Their job title and company | Displayed below their name |
| Author Photo | A photo of the person | Recommended: 200 x 200px, square |

## Tips and Notes

- The carousel will automatically rotate between testimonials. Visitors can also navigate manually using the arrow controls.
- We recommend including at least 3 testimonials for the carousel to work well visually.
- If you add only 1 testimonial, it will display as a static block without carousel navigation.
