/**
 * Build Size Monitor — Gem Link CI/CD Pipeline
 *
 * Recursively walks dist/ and reports file sizes by category.
 * Applies four-tier thresholds (GREEN / YELLOW / RED / BLOCKED).
 *
 * Canonical size constants live in src/types/game.types.ts:
 *   BUILD_SIZE_WARN_MB = 8
 *   BUILD_SIZE_MAX_MB = 10
 *
 * Usage: node scripts/check-size.js
 * Exit 0 on GREEN / YELLOW / RED, exit 1 on BLOCKED (>10 MB).
 */

import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const PROJECT_ROOT = join(__filename, '..', '..');
const DIST_DIR = join(PROJECT_ROOT, 'dist');

// Thresholds in bytes (mirrors src/types/game.types.ts constants)
const GREEN_LIMIT = 6 * 1024 * 1024;   // 6 MB
const YELLOW_LIMIT = 8 * 1024 * 1024;  // 8 MB  (BUILD_SIZE_WARN_MB)
const RED_LIMIT = 10 * 1024 * 1024;    // 10 MB (BUILD_SIZE_MAX_MB)

// File extension categories
const JS_EXTS = new Set(['.js', '.mjs']);
const CSS_EXTS = new Set(['.css']);
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.ico']);
const AUDIO_EXTS = new Set(['.mp3', '.ogg', '.wav', '.m4a', '.aac']);

/**
 * Format a number with commas (e.g. 1245678 -> "1,245,678")
 */
function formatNumber(n) {
  return n.toLocaleString('en-US');
}

/**
 * Format bytes to MB with 2 decimal places
 */
function formatMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

/**
 * Classify a file extension into a category
 */
function classifyFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (JS_EXTS.has(ext)) return 'JS';
  if (CSS_EXTS.has(ext)) return 'CSS';
  if (IMAGE_EXTS.has(ext)) return 'Images';
  if (AUDIO_EXTS.has(ext)) return 'Audio';
  return 'Other';
}

/**
 * Recursively walk a directory and collect file info
 */
async function walkDir(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await walkDir(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      const fileStat = await stat(fullPath);
      files.push({ path: fullPath, size: fileStat.size });
    }
  }

  return files;
}

/**
 * Main entry point
 */
async function main() {
  // Verify dist/ exists
  try {
    const distStat = await stat(DIST_DIR);
    if (!distStat.isDirectory()) {
      console.log('[BuildSize] ERROR: dist/ is not a directory. Run "npm run build" first.');
      process.exit(1);
    }
  } catch {
    console.log('[BuildSize] ERROR: dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Collect all files
  const files = await walkDir(DIST_DIR);

  // Categorize files
  const categories = {
    JS:     { bytes: 0, count: 0 },
    CSS:    { bytes: 0, count: 0 },
    Images: { bytes: 0, count: 0 },
    Audio:  { bytes: 0, count: 0 },
    Other:  { bytes: 0, count: 0 },
  };

  for (const file of files) {
    const cat = classifyFile(file.path);
    categories[cat].bytes += file.size;
    categories[cat].count += 1;
  }

  // Calculate totals
  let totalBytes = 0;
  let totalFiles = 0;
  for (const cat of Object.values(categories)) {
    totalBytes += cat.bytes;
    totalFiles += cat.count;
  }

  // Print report
  console.log('[BuildSize] === Build Size Report ===');
  console.log('[BuildSize]');

  const categoryOrder = ['JS', 'CSS', 'Images', 'Audio', 'Other'];
  for (const name of categoryOrder) {
    const cat = categories[name];
    const label = (name + ':').padEnd(9);
    const bytesStr = formatNumber(cat.bytes).padStart(12);
    const mbStr = formatMB(cat.bytes);
    const countStr = `[${cat.count} files]`;
    console.log(`[BuildSize]   ${label} ${bytesStr} bytes (${mbStr} MB)  ${countStr}`);
  }

  console.log('[BuildSize]   ----------------------------------------');
  const totalBytesStr = formatNumber(totalBytes).padStart(12);
  const totalMBStr = formatMB(totalBytes);
  const totalCountStr = `[${totalFiles} files]`;
  console.log(`[BuildSize]   TOTAL:    ${totalBytesStr} bytes (${totalMBStr} MB)  ${totalCountStr}`);
  console.log('[BuildSize]');

  // Determine status
  let status;
  let message;
  let exitCode = 0;

  if (totalBytes > RED_LIMIT) {
    status = 'BLOCKED (over 10 MB)';
    message = 'BLOCKED -- Build exceeds 10 MB hard limit. Cannot deploy.';
    exitCode = 1;
  } else if (totalBytes > YELLOW_LIMIT) {
    status = 'RED (8-10 MB)';
    message = 'DANGER -- Build near maximum. Immediate action needed.';
  } else if (totalBytes > GREEN_LIMIT) {
    status = 'YELLOW (6-8 MB)';
    message = 'WARNING -- Build approaching limit. Review assets.';
  } else {
    status = 'GREEN (under 6 MB)';
    message = 'PASS -- Build is well within budget.';
  }

  console.log(`[BuildSize]   Status: ${status}`);
  console.log('[BuildSize]');
  console.log(`[BuildSize]   ${message}`);

  process.exit(exitCode);
}

main().catch((err) => {
  console.log(`[BuildSize] FATAL: ${err.message}`);
  process.exit(1);
});
