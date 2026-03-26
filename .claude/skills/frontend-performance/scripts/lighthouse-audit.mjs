/**
 * Lighthouse Performance Audit Script
 *
 * Runs a Lighthouse performance audit against a live URL and outputs
 * Core Web Vitals scores and opportunities.
 *
 * Prerequisites:
 *   npm install lighthouse chrome-launcher
 *
 * Usage:
 *   node lighthouse-audit.mjs <url> [--category performance,accessibility] [--output report.json]
 *
 * Examples:
 *   node lighthouse-audit.mjs https://example.com
 *   node lighthouse-audit.mjs https://example.com --category performance
 *   node lighthouse-audit.mjs https://example.com --output perf-report.json
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { writeFileSync } from 'fs';

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(`
Usage: node lighthouse-audit.mjs <url> [options]

Options:
  --category <cats>   Comma-separated categories (default: performance)
                      Options: performance, accessibility, best-practices, seo
  --output <file>     Save full report to JSON file
  --device <type>     Device type: mobile or desktop (default: mobile)
  --help              Show this help message

Examples:
  node lighthouse-audit.mjs https://example.com
  node lighthouse-audit.mjs https://example.com --category performance,accessibility
  node lighthouse-audit.mjs https://example.com --device desktop --output report.json
  `);
  process.exit(0);
}

const url = args[0];
const categoryIndex = args.indexOf('--category');
const outputIndex = args.indexOf('--output');
const deviceIndex = args.indexOf('--device');

const categories = categoryIndex !== -1 && args[categoryIndex + 1]
  ? args[categoryIndex + 1].split(',')
  : ['performance'];

const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : null;
const device = deviceIndex !== -1 ? args[deviceIndex + 1] : 'mobile';

async function runAudit() {
  console.log(`\nLighthouse Performance Audit`);
  console.log(`${'='.repeat(60)}`);
  console.log(`URL: ${url}`);
  console.log(`Categories: ${categories.join(', ')}`);
  console.log(`Device: ${device}`);
  console.log(`${'='.repeat(60)}\n`);

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox'],
  });

  try {
    console.log('Running Lighthouse audit...\n');

    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: categories,
      port: chrome.port,
      formFactor: device,
      screenEmulation: device === 'desktop'
        ? { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1 }
        : undefined,
      throttling: device === 'desktop'
        ? { cpuSlowdownMultiplier: 1 }
        : undefined,
    };

    const result = await lighthouse(url, options);
    const report = JSON.parse(result.report);

    // Category scores
    console.log('Category Scores');
    console.log(`${'-'.repeat(40)}`);

    for (const [key, category] of Object.entries(report.categories)) {
      const score = Math.round(category.score * 100);
      const indicator = score >= 90 ? 'PASS' : score >= 50 ? 'NEEDS WORK' : 'POOR';
      console.log(`  ${category.title}: ${score}/100 [${indicator}]`);
    }
    console.log();

    // Core Web Vitals (if performance category was run)
    if (categories.includes('performance')) {
      const metrics = report.audits;

      console.log('Core Web Vitals');
      console.log(`${'-'.repeat(40)}`);

      const cwv = [
        { key: 'largest-contentful-paint', label: 'LCP (Largest Contentful Paint)' },
        { key: 'cumulative-layout-shift', label: 'CLS (Cumulative Layout Shift)' },
        { key: 'total-blocking-time', label: 'TBT (Total Blocking Time)' },
        { key: 'first-contentful-paint', label: 'FCP (First Contentful Paint)' },
        { key: 'speed-index', label: 'Speed Index' },
        { key: 'interactive', label: 'Time to Interactive' },
      ];

      cwv.forEach(({ key, label }) => {
        const audit = metrics[key];
        if (audit) {
          const score = audit.score !== null ? Math.round(audit.score * 100) : 'N/A';
          console.log(`  ${label}: ${audit.displayValue || 'N/A'} (score: ${score})`);
        }
      });
      console.log();

      // Opportunities
      const opportunities = Object.values(metrics)
        .filter((a) => a.details && a.details.type === 'opportunity' && a.score !== null && a.score < 1)
        .sort((a, b) => (a.score || 0) - (b.score || 0));

      if (opportunities.length > 0) {
        console.log('Opportunities');
        console.log(`${'-'.repeat(40)}`);

        opportunities.forEach((opp) => {
          const savings = opp.details.overallSavingsMs
            ? `${Math.round(opp.details.overallSavingsMs)}ms`
            : opp.details.overallSavingsBytes
              ? `${Math.round(opp.details.overallSavingsBytes / 1024)}KB`
              : '';
          console.log(`  - ${opp.title}${savings ? ` (save ~${savings})` : ''}`);
        });
        console.log();
      }

      // Diagnostics
      const diagnostics = Object.values(metrics)
        .filter((a) => a.details && a.details.type === 'table' && a.score !== null && a.score < 1)
        .filter((a) => !opportunities.includes(a))
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 10);

      if (diagnostics.length > 0) {
        console.log('Diagnostics');
        console.log(`${'-'.repeat(40)}`);

        diagnostics.forEach((diag) => {
          console.log(`  - ${diag.title}: ${diag.displayValue || ''}`);
        });
        console.log();
      }
    }

    // Save full report
    if (outputFile) {
      writeFileSync(outputFile, JSON.stringify(report, null, 2));
      console.log(`Full report saved to: ${outputFile}`);
    }

    // Exit code based on performance score
    const perfCategory = report.categories.performance;
    if (perfCategory) {
      const score = Math.round(perfCategory.score * 100);
      if (score >= 90) {
        console.log(`\nResult: PASS — Performance score ${score}/100`);
        process.exitCode = 0;
      } else if (score >= 50) {
        console.log(`\nResult: NEEDS WORK — Performance score ${score}/100`);
        process.exitCode = 1;
      } else {
        console.log(`\nResult: POOR — Performance score ${score}/100`);
        process.exitCode = 2;
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 2;
  } finally {
    await chrome.kill();
  }
}

runAudit();
