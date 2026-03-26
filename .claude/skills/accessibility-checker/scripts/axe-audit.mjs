/**
 * axe-core Accessibility Audit Script
 *
 * Runs an automated WCAG 2.2 AA accessibility audit against a live URL
 * using axe-core via Playwright.
 *
 * Prerequisites:
 *   npm install @axe-core/playwright playwright
 *
 * Usage:
 *   node axe-audit.mjs <url> [--tags wcag2a,wcag2aa,wcag22aa] [--output report.json]
 *
 * Examples:
 *   node axe-audit.mjs https://example.com
 *   node axe-audit.mjs https://example.com --tags wcag2aa,wcag22aa
 *   node axe-audit.mjs https://example.com --output accessibility-report.json
 */

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'fs';

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(`
Usage: node axe-audit.mjs <url> [options]

Options:
  --tags <tags>     Comma-separated axe tags (default: wcag2a,wcag2aa,wcag22aa,best-practice)
  --output <file>   Save full report to JSON file
  --help            Show this help message

Examples:
  node axe-audit.mjs https://example.com
  node axe-audit.mjs https://example.com --tags wcag2aa
  node axe-audit.mjs https://example.com --output report.json
  `);
  process.exit(0);
}

const url = args[0];
const tagsIndex = args.indexOf('--tags');
const outputIndex = args.indexOf('--output');

const tags = tagsIndex !== -1 && args[tagsIndex + 1]
  ? args[tagsIndex + 1].split(',')
  : ['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'];

const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : null;

async function runAudit() {
  console.log(`\nAccessibility Audit`);
  console.log(`${'='.repeat(60)}`);
  console.log(`URL: ${url}`);
  console.log(`Tags: ${tags.join(', ')}`);
  console.log(`${'='.repeat(60)}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    console.log('Loading page...');
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded. Running axe-core audit...\n');

    const results = await new AxeBuilder({ page })
      .withTags(tags)
      .analyze();

    // Summary
    const violations = results.violations;
    const passes = results.passes;
    const incomplete = results.incomplete;

    console.log(`Results Summary`);
    console.log(`${'-'.repeat(40)}`);
    console.log(`Violations:  ${violations.length}`);
    console.log(`Passes:      ${passes.length}`);
    console.log(`Incomplete:  ${incomplete.length}`);
    console.log();

    // Violations detail
    if (violations.length > 0) {
      console.log(`VIOLATIONS`);
      console.log(`${'='.repeat(60)}\n`);

      violations.forEach((violation, i) => {
        const impact = (violation.impact || 'unknown').toUpperCase();
        console.log(`${i + 1}. [${impact}] ${violation.id}`);
        console.log(`   ${violation.description}`);
        console.log(`   Help: ${violation.helpUrl}`);
        console.log(`   WCAG: ${violation.tags.filter(t => t.startsWith('wcag')).join(', ')}`);
        console.log(`   Affected elements (${violation.nodes.length}):`);

        violation.nodes.slice(0, 5).forEach((node) => {
          console.log(`     - ${node.target.join(' > ')}`);
          if (node.failureSummary) {
            const summary = node.failureSummary.split('\n')[0];
            console.log(`       ${summary}`);
          }
        });

        if (violation.nodes.length > 5) {
          console.log(`     ... and ${violation.nodes.length - 5} more`);
        }
        console.log();
      });
    } else {
      console.log('No violations found!\n');
    }

    // Incomplete checks
    if (incomplete.length > 0) {
      console.log(`NEEDS MANUAL REVIEW (${incomplete.length})`);
      console.log(`${'-'.repeat(40)}`);
      incomplete.forEach((item) => {
        console.log(`  - ${item.id}: ${item.description} (${item.nodes.length} elements)`);
      });
      console.log();
    }

    // Save full report
    if (outputFile) {
      const report = {
        url,
        timestamp: new Date().toISOString(),
        tags,
        summary: {
          violations: violations.length,
          passes: passes.length,
          incomplete: incomplete.length,
        },
        violations,
        incomplete,
        passes: passes.map((p) => ({ id: p.id, description: p.description })),
      };
      writeFileSync(outputFile, JSON.stringify(report, null, 2));
      console.log(`Full report saved to: ${outputFile}`);
    }

    // Exit code based on violations
    if (violations.length > 0) {
      const critical = violations.filter((v) => v.impact === 'critical').length;
      const serious = violations.filter((v) => v.impact === 'serious').length;
      console.log(`\nResult: FAIL — ${critical} critical, ${serious} serious violations`);
      process.exitCode = 1;
    } else {
      console.log('\nResult: PASS — No accessibility violations detected');
      process.exitCode = 0;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
}

runAudit();
