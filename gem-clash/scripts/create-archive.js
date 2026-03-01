/**
 * Archive Creator — Gem Link CI/CD Pipeline
 *
 * Creates a zip archive of the dist/ folder for Jest upload.
 * Uses the "archiver" npm package with maximum compression.
 *
 * Usage: node scripts/create-archive.js
 * Exit 0 on success, exit 1 on any error.
 */

import { stat, readdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const PROJECT_ROOT = join(__filename, '..', '..');
const DIST_DIR = join(PROJECT_ROOT, 'dist');
const OUTPUT_PATH = join(PROJECT_ROOT, 'gem-link.zip');

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
 * Recursively collect files from a directory, skipping hidden files/dirs and source maps.
 * Returns array of { absolutePath, relativePath }.
 */
async function collectFiles(dir, baseDir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip hidden files and directories
    if (entry.name.startsWith('.')) continue;

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await collectFiles(fullPath, baseDir);
      results.push(...subFiles);
    } else if (entry.isFile()) {
      // Skip source maps
      if (entry.name.endsWith('.map')) continue;

      const relPath = relative(baseDir, fullPath);
      results.push({ absolutePath: fullPath, relativePath: relPath });
    }
  }

  return results;
}

/**
 * Main entry point
 */
async function main() {
  // Verify dist/ exists
  try {
    const distStat = await stat(DIST_DIR);
    if (!distStat.isDirectory()) {
      console.log('[Archive] ERROR: dist/ is not a directory. Run "npm run build" first.');
      process.exit(1);
    }
  } catch {
    console.log('[Archive] ERROR: dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Verify dist/index.html exists
  try {
    const indexStat = await stat(join(DIST_DIR, 'index.html'));
    if (!indexStat.isFile()) {
      console.log('[Archive] ERROR: dist/index.html is not a file.');
      process.exit(1);
    }
  } catch {
    console.log('[Archive] ERROR: dist/index.html not found. Build may be broken.');
    process.exit(1);
  }

  // Collect files to archive
  const files = await collectFiles(DIST_DIR, DIST_DIR);

  // Create archive
  const output = createWriteStream(OUTPUT_PATH);
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Wait for the archive to finish writing
  const archivePromise = new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);
  });

  archive.pipe(output);

  // Add each file with its relative path
  for (const file of files) {
    archive.file(file.absolutePath, { name: file.relativePath });
  }

  await archive.finalize();
  await archivePromise;

  // Get archive size
  const archiveStat = await stat(OUTPUT_PATH);
  const archiveSize = archiveStat.size;

  // Validation checks
  const hasIndexAtRoot = files.some((f) => f.relativePath === 'index.html');
  const hasHiddenFiles = files.some((f) => {
    const parts = f.relativePath.split('/');
    return parts.some((p) => p.startsWith('.'));
  });
  const hasSourceMaps = files.some((f) => f.relativePath.endsWith('.map'));
  const allRelative = files.every((f) => !f.relativePath.startsWith('/'));

  // Print report
  console.log('[Archive] === Archive Created ===');
  console.log('[Archive]');
  console.log(`[Archive]   Output: gem-link.zip`);
  console.log(`[Archive]   Files:  ${files.length}`);
  console.log(`[Archive]   Size:   ${formatNumber(archiveSize)} bytes (${formatMB(archiveSize)} MB)`);
  console.log('[Archive]');
  console.log('[Archive]   Validation:');
  console.log(`[Archive]     index.html at root: ${hasIndexAtRoot ? 'YES' : 'NO'}`);
  console.log(`[Archive]     Hidden files excluded: ${hasHiddenFiles ? 'NO' : 'YES'}`);
  console.log(`[Archive]     Source maps excluded: ${hasSourceMaps ? 'NO' : 'YES'}`);
  console.log(`[Archive]     All paths relative: ${allRelative ? 'YES' : 'NO'}`);
  console.log('[Archive]');

  // Size warning
  if (archiveSize > 10 * 1024 * 1024) {
    console.log('[Archive]   WARNING: Archive exceeds 10 MB!');
    console.log('[Archive]');
  }

  console.log('[Archive]   Ready for Jest upload.');
}

main().catch((err) => {
  console.log(`[Archive] FATAL: ${err.message}`);
  process.exit(1);
});
