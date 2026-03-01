# TASK-006: CI/CD Pipeline Plan

> **Author:** DevOps Engineer
> **Status:** Awaiting PE Approval
> **Date:** 2026-02-27
> **Depends On:** TASK-002 (Project Scaffold)
> **Blocked By:** Nothing (scaffold already exists)

---

## 1. What I'll Build

### 1.1 Files Overview

| # | File | Purpose | Est. Lines | New/Modify |
|---|------|---------|-----------|------------|
| 1 | `gem-link/vite.config.ts` | Update Vite config for single-bundle output, asset inlining, hash filenames | ~55 | **Modify** |
| 2 | `gem-link/package.json` | Add `dev`, `build`, `build:zip`, `preview`, `size` scripts + archiver dep | ~30 | **Modify** |
| 3 | `gem-link/scripts/check-size.js` | Build size monitor with per-category breakdown and threshold enforcement | ~130 | **New** |
| 4 | `gem-link/scripts/create-archive.js` | Create gem-link.zip from dist/ for Jest upload | ~100 | **New** |

**Total new code: ~230 lines across 2 new files, plus modifications to 2 existing files.**

---

### 1.2 File Details

#### File 1: `gem-link/vite.config.ts` (Modify)

**Current state:** The existing config from TASK-002 already has `base: './'`, Phaser defines, dev server on port 3000, and a `manualChunks` config that splits Phaser into a separate chunk.

**Changes required:**

1. **Remove `manualChunks`** -- The current config splits Phaser into a separate chunk. The task requires a single bundle output to minimize HTTP requests in the Jest webview. All JS must land in one file.
2. **Add `build.rollupOptions.output.inlineDynamicImports: true`** -- Forces all dynamic imports into the single bundle. Ensures no code splitting occurs.
3. **Add `build.assetsInlineLimit: 4096`** -- Inline assets smaller than 4KB as base64 data URIs. Reduces HTTP requests for small sprites, icons, and sounds.
4. **Add `build.rollupOptions.output.entryFileNames` and `assetFileNames`** -- Hash filenames for cache busting: `assets/[name]-[hash].js`, `assets/[name]-[hash][extname]`.
5. **Keep existing** `base: './'` (Jest relative path requirement), `define` block (Phaser renderers), and `server` block (port 3000, open).

**Rationale for single bundle:** Jest games run in a sandboxed webview. Each HTTP request adds latency. A single JS bundle means one request for all application code + Phaser. The Phaser library is ~1-2MB; splitting it into a separate chunk saves nothing when both chunks load on the same page load. Single bundle is simpler and faster for this use case.

**Concern about the existing `manualChunks`:** The TASK-002 scaffold created this. Removing it is a deliberate architectural decision. I will document this clearly in the commit message and note it for PE review.

#### File 2: `gem-link/package.json` (Modify)

**Current scripts block:**
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit"
}
```

**New scripts block:**
```json
{
  "dev": "vite --port 3000",
  "build": "tsc --noEmit && vite build",
  "build:zip": "npm run build && node scripts/create-archive.js",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "size": "node scripts/check-size.js"
}
```

**Changes explained:**

| Script | Change | Reason |
|--------|--------|--------|
| `dev` | Add explicit `--port 3000` | Task spec requires port 3000. The vite.config already sets this, but making it explicit in the script provides clarity and allows CLI override. |
| `build` | Change `tsc` to `tsc --noEmit` | The existing `build` script runs `tsc` which emits JS to `outDir: ./dist`. This conflicts with Vite's build output. The `--noEmit` flag performs type checking without emitting files, then Vite handles the actual build. **This is a bug fix** -- the current scaffold's `tsc && vite build` would write TS compiler output into dist/ before Vite overwrites it. |
| `build:zip` | New | Runs production build then creates the zip archive for Jest upload. Sequential: build must complete before archive. |
| `preview` | No change | Already correct. |
| `typecheck` | No change | Already correct. |
| `size` | New | Runs the build size checker against dist/. Can be run independently after any build. |

**New devDependency:**

- `archiver` (~0.5KB, well-maintained) -- Node.js streaming zip library for `create-archive.js`. Preferred over `child_process` calls to `zip` because it works cross-platform (macOS, Linux, Windows CI) and provides programmatic control over archive contents.

No other dependencies needed. `check-size.js` uses only Node.js built-ins (`fs`, `path`).

#### File 3: `gem-link/scripts/check-size.js` (New, ~130 lines)

**Purpose:** Analyze the `dist/` directory after build. Report total size and per-category breakdown. Enforce size thresholds. Exit with code 1 if the build exceeds the hard limit.

**Design:**

```
Input:  dist/ directory (must exist; script fails fast if missing)
Output: Console report with [BuildSize] prefix on every line
Exit:   0 = pass or warn, 1 = blocked (>10MB)
```

**Algorithm:**

1. Verify `dist/` exists. If not, print `[BuildSize] ERROR: dist/ directory not found. Run "npm run build" first.` and exit 1.
2. Recursively walk `dist/`, collecting every file's size and categorizing by extension:
   - **JS:** `.js`, `.mjs`
   - **CSS:** `.css`
   - **Images:** `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.gif`, `.svg`, `.ico`
   - **Audio:** `.mp3`, `.ogg`, `.wav`, `.m4a`, `.aac`
   - **Other:** everything else (`.html`, `.json`, `.woff2`, `.map`, etc.)
3. Sum total size.
4. Print report:
   ```
   [BuildSize] === Build Size Report ===
   [BuildSize]
   [BuildSize]   JS:      1,245,678 bytes (1.19 MB)
   [BuildSize]   CSS:        12,340 bytes (0.01 MB)
   [BuildSize]   Images:  2,345,678 bytes (2.24 MB)
   [BuildSize]   Audio:   1,500,000 bytes (1.43 MB)
   [BuildSize]   Other:      45,000 bytes (0.04 MB)
   [BuildSize]   ----------------------------------------
   [BuildSize]   TOTAL:   5,148,696 bytes (4.91 MB)
   [BuildSize]
   [BuildSize]   Status: GREEN (under 6 MB)
   [BuildSize]
   ```
5. Apply thresholds (from `game.types.ts` constants):
   - **GREEN** (< 6 MB): `[BuildSize] PASS -- Build is well within budget.`
   - **YELLOW** (6-8 MB): `[BuildSize] WARNING -- Build approaching limit. Review assets.`
   - **RED** (8-10 MB): `[BuildSize] DANGER -- Build near maximum. Immediate action needed.`
   - **BLOCKED** (> 10 MB): `[BuildSize] BLOCKED -- Build exceeds 10 MB hard limit. Cannot deploy.` Exit code 1.

**Threshold constants defined in-script:** While `game.types.ts` exports `BUILD_SIZE_WARN_MB = 8` and `BUILD_SIZE_MAX_MB = 10`, this script is plain JS (not TS, no bundler in the scripts/ pipeline). I will hardcode the thresholds with a comment referencing the canonical values in `game.types.ts`. The four-tier system (GREEN/YELLOW/RED/BLOCKED at 6/8/10 boundaries) provides more granularity than the two constants in types.

**File count report:** Also print the number of files per category to help diagnose bloat (e.g., "Images: 47 files" signals sprite atlas opportunity).

#### File 4: `gem-link/scripts/create-archive.js` (New, ~100 lines)

**Purpose:** Create `gem-link.zip` from `dist/` directory. Ensure the archive is structured correctly for Jest upload (index.html at root, all paths relative, no hidden files).

**Design:**

```
Input:  dist/ directory (must exist)
Output: gem-link.zip in project root (gem-link/gem-link.zip)
Logs:   [Archive] prefix on every line
Exit:   0 = success, 1 = failure
```

**Algorithm:**

1. Verify `dist/` exists. If not: `[Archive] ERROR: dist/ directory not found.` Exit 1.
2. Verify `dist/index.html` exists. If not: `[Archive] ERROR: dist/index.html not found. Build may have failed.` Exit 1.
3. Create a writable stream to `gem-link.zip` in the project root.
4. Initialize `archiver` with `{ zlib: { level: 9 } }` (maximum compression).
5. Walk `dist/` recursively. For each file:
   - **Skip** hidden files: any file or directory name starting with `.` (e.g., `.DS_Store`, `.gitkeep`).
   - **Skip** source maps: `*.map` files (not needed in production archive).
   - Compute the relative path from `dist/` to the file (ensures `index.html` is at archive root, not `dist/index.html`).
   - Add file to archive with the relative path as the archive entry name.
6. Finalize the archive.
7. Report results:
   ```
   [Archive] === Archive Created ===
   [Archive]
   [Archive]   Output: gem-link.zip
   [Archive]   Files:  23
   [Archive]   Size:   4,823,456 bytes (4.60 MB)
   [Archive]
   [Archive]   Validation:
   [Archive]     index.html at root: YES
   [Archive]     Hidden files excluded: YES
   [Archive]     All paths relative: YES
   [Archive]
   [Archive]   Ready for Jest upload.
   ```
8. If archive size > 10 MB, print warning: `[Archive] WARNING: Archive exceeds 10 MB. Jest upload may be rejected.`

**Why `archiver` instead of native `zip`:**
- Cross-platform (no dependency on system `zip` binary)
- Programmatic control: can filter files, verify paths, report per-file details
- Streaming: memory-efficient for large builds
- Well-maintained: 20M+ weekly npm downloads

**Output location:** `gem-link/gem-link.zip` (project root, not dist/). This keeps it separate from the build output and matches the naming convention for Jest upload.

**Source map exclusion rationale:** Source maps are useful for debugging but should not be uploaded to Jest. They increase archive size and expose source code. The build can still generate them (controlled by Vite config), but the archive skips them.

---

## 2. Integration Points

### 2.1 Dependencies on TASK-002 (Project Scaffold)

| Scaffold Artifact | How TASK-006 Uses It | Status |
|-------------------|---------------------|--------|
| `package.json` | Modify scripts block, add `archiver` devDependency | Exists -- will modify |
| `vite.config.ts` | Modify build output settings | Exists -- will modify |
| `tsconfig.json` | No changes needed | Exists -- untouched |
| `index.html` | No changes needed | Exists -- untouched |
| `src/types/game.types.ts` | Reference `BUILD_SIZE_WARN_MB` and `BUILD_SIZE_MAX_MB` constants | Exists -- read-only reference |
| `src/utils/Logger.ts` | Not used by build scripts (Logger is runtime, scripts are build-time) | Exists -- untouched |
| `src/utils/EventBus.ts` | Not used by build scripts | Exists -- untouched |
| `scripts/` directory | Already created by scaffold (empty) | Exists -- will add files |
| `assets/` directory | Must exist for Vite build; currently empty subdirs | Exists -- untouched |

### 2.2 How Build Scripts Connect

```
npm run dev
  --> vite --port 3000
  --> Starts HMR dev server on localhost:3000
  --> Uses vite.config.ts (base: './', Phaser defines, no build)

npm run build
  --> tsc --noEmit (type check only, no JS emit)
  --> vite build (production bundle to dist/)
  --> Uses vite.config.ts (single bundle, asset hashing, inlining)

npm run build:zip
  --> npm run build (full production build)
  --> node scripts/create-archive.js (zip dist/ into gem-link.zip)

npm run preview
  --> vite preview (serve dist/ locally for manual testing)

npm run size
  --> node scripts/check-size.js (analyze dist/, report sizes, enforce limits)
  --> Requires dist/ to exist (run after build)

npm run typecheck
  --> tsc --noEmit (type check without build, unchanged from scaffold)
```

### 2.3 CI/CD Upload Integration (Future)

The `builds.md` documentation shows Jest supports programmatic uploads via:
```
POST /api/management/games/:id/upload-build
Headers: x-build-version, x-game-upload-token
Body: multipart/form-data with file=@gem-link.zip
```

This task does NOT implement the upload step. It creates the archive that the upload step will consume. A future task (or the Release Manager) will handle:
- Reading `JEST_GAME_ID` and `JEST_UPLOAD_TOKEN` from environment variables
- Calling the upload API with the zip
- Activating the uploaded version

The `build:zip` script produces the artifact (`gem-link.zip`) that this future upload step needs.

---

## 3. Logging Strategy

### 3.1 Prefix Convention

Build scripts use console output (not the runtime Logger class, which is a TypeScript module for Phaser scenes). The prefix convention for build scripts:

| Script | Prefix | Example |
|--------|--------|---------|
| `check-size.js` | `[BuildSize]` | `[BuildSize] TOTAL: 5,148,696 bytes (4.91 MB)` |
| `create-archive.js` | `[Archive]` | `[Archive] Output: gem-link.zip` |

### 3.2 Log Levels in Build Scripts

Build scripts use three output levels via standard console methods:

- **`console.log`** with prefix: Normal operational output (report, file listing, status)
- **`console.warn`** with prefix: Yellow/Red threshold warnings
- **`console.error`** with prefix: Fatal errors (missing dist/, missing index.html)

### 3.3 Why Not Use Logger.ts

The `Logger` class from `src/utils/Logger.ts` is a TypeScript module designed for the Phaser runtime (browser context). Build scripts are Node.js scripts that run at build time. Using Logger.ts would require either:
- Compiling it separately for Node.js (unnecessary complexity)
- Duplicating it as JS (violates DRY)

Simple `console.log('[BuildSize] ...')` is the correct approach for build-time scripts. This matches standard Node.js build tooling conventions.

---

## 4. Verification

### 4.1 `npm run dev` Verification

**Run:** `npm run dev`

**Expected output:**
```
  VITE v5.x.x  ready in XXX ms

  -->  Local:   http://localhost:3000/
  -->  Network: use --host to expose
```

**Verify:**
- Server starts on port 3000 (not Vite's default 5173)
- Browser opens automatically (`open: true` in config)
- Changes to `.ts` files trigger HMR reload

### 4.2 `npm run build` Verification

**Run:** `npm run build`

**Expected output:**
```
# TypeScript check (no errors)

vite v5.x.x building for production...
transforming...
rendering chunks...
computing gzip size...

dist/index.html                  0.XX kB | gzip: 0.XX kB
dist/assets/index-XXXXXXXX.js    X,XXX.XX kB | gzip: X,XXX.XX kB

built in XXXms
```

**Verify:**
- No TypeScript errors (tsc --noEmit passes)
- `dist/` directory created with `index.html` at root
- **Single JS file** in `dist/assets/` (no separate `phaser-XXXXX.js` chunk)
- Asset filenames contain hashes (e.g., `index-a1b2c3d4.js`)
- `dist/index.html` references assets with relative paths (`./assets/...`)

### 4.3 `npm run build:zip` Verification

**Run:** `npm run build:zip`

**Expected output:**
```
# (build output from above)

[Archive] === Archive Created ===
[Archive]
[Archive]   Output: gem-link.zip
[Archive]   Files:  X
[Archive]   Size:   X,XXX,XXX bytes (X.XX MB)
[Archive]
[Archive]   Validation:
[Archive]     index.html at root: YES
[Archive]     Hidden files excluded: YES
[Archive]     All paths relative: YES
[Archive]
[Archive]   Ready for Jest upload.
```

**Verify:**
- `gem-link.zip` created in `gem-link/` project root
- Unzipping produces `index.html` at the top level (not inside a `dist/` subfolder)
- No `.DS_Store` or other hidden files inside the zip
- No `.map` source map files inside the zip
- All asset paths in `index.html` are relative (start with `./` or just the filename, never `/`)

**Manual verification command:**
```bash
unzip -l gem-link.zip  # List contents -- verify no dist/ prefix, no hidden files
unzip -o gem-link.zip -d /tmp/gem-link-test  # Extract and inspect
```

### 4.4 `npm run preview` Verification

**Run:** `npm run build && npm run preview`

**Expected output:**
```
  -->  Local:   http://localhost:4173/
  -->  Network: use --host to expose
```

**Verify:**
- Serves the production build from dist/
- Game loads in browser (may show blank canvas if no game scenes exist yet -- that is expected at this stage)
- No 404 errors for assets in browser DevTools

### 4.5 `npm run size` Verification

**Run:** `npm run build && npm run size`

**Expected output (with current minimal scaffold):**
```
[BuildSize] === Build Size Report ===
[BuildSize]
[BuildSize]   JS:      XXX,XXX bytes (X.XX MB)
[BuildSize]   CSS:           0 bytes (0.00 MB)
[BuildSize]   Images:        0 bytes (0.00 MB)
[BuildSize]   Audio:         0 bytes (0.00 MB)
[BuildSize]   Other:     X,XXX bytes (0.XX MB)
[BuildSize]   ----------------------------------------
[BuildSize]   TOTAL:   XXX,XXX bytes (X.XX MB)
[BuildSize]
[BuildSize]   Status: GREEN (under 6 MB)
[BuildSize]
[BuildSize]   PASS -- Build is well within budget.
```

**Expected at scaffold stage:** Total should be ~1-2 MB (mostly Phaser library). Status should be GREEN.

**Verify exit codes:**
```bash
npm run size; echo "Exit code: $?"
# Should print: Exit code: 0 (for GREEN/YELLOW/RED)
# Would print: Exit code: 1 (only if BLOCKED > 10 MB)
```

### 4.6 Error Case Verification

| Scenario | Expected Behavior |
|----------|------------------|
| Run `npm run size` without building first | `[BuildSize] ERROR: dist/ directory not found.` Exit 1. |
| Run `npm run build:zip` with broken TS | `tsc --noEmit` fails, Vite build never runs, archive never created. Non-zero exit. |
| Build produces >10 MB | `npm run size` prints `BLOCKED` and exits 1. `build:zip` still creates the archive (size check is a separate command, not a gate in the build pipeline). |
| `dist/` has no `index.html` | `create-archive.js` prints error and exits 1. |

---

## 5. Risks & Mitigations

### 5.1 Build Size Creep

**Risk:** As game assets (sprites, audio, levels) are added in subsequent tasks, the build could silently grow past thresholds.

**Mitigations:**
- `npm run size` provides instant feedback after any build. Developers should run it regularly.
- The four-tier threshold system (GREEN/YELLOW/RED/BLOCKED) provides early warning before the hard limit is hit.
- YELLOW at 6 MB gives a 4 MB buffer before the 10 MB block threshold.
- Future enhancement: integrate `npm run size` into a pre-commit hook or CI step (out of scope for this task).

**Recommendation for PE:** Consider making `npm run size` a mandatory step in the PR review checklist.

### 5.2 Archive Format Issues

**Risk:** The zip archive structure could be rejected by Jest if paths are wrong (e.g., `index.html` nested inside a `dist/` directory instead of at root).

**Mitigations:**
- `create-archive.js` explicitly strips the `dist/` prefix when adding files to the archive.
- The script validates that `index.html` exists at the archive root after creation.
- The validation report confirms "index.html at root: YES" in every run.
- Manual verification via `unzip -l` is documented in Section 4.3.

### 5.3 Path Resolution Across OS

**Risk:** Path separators (`/` vs `\`) could cause issues on Windows CI runners or developer machines.

**Mitigations:**
- Use `path.join()` and `path.relative()` from Node.js `path` module everywhere.
- Normalize path separators to `/` before adding to zip (archiver handles this, but we will explicitly normalize).
- Test on macOS (primary dev environment). Note: Windows testing is lower priority since the team appears to be macOS-based.

### 5.4 Single Bundle Size

**Risk:** Forcing all code into a single JS bundle (removing the Phaser chunk split) could make the initial page load slower if the single file is very large.

**Mitigations:**
- Phaser 3.80.1 custom build is ~1-2 MB. Game code will be <1 MB. Total JS should be 2-3 MB.
- 2-3 MB is well within acceptable range for a single bundle in a webview (comparable to a moderate image).
- The Jest webview loads from CDN -- a single request for 2-3 MB is faster than two requests for 1.5 MB each due to connection overhead.
- If JS exceeds 5 MB, revisit this decision (but that would indicate a bigger problem with code size, not a chunking issue).

### 5.5 `tsc --noEmit` vs `tsc` Build Conflict

**Risk:** The current scaffold's `build` script runs `tsc` (which emits compiled JS to `dist/`) followed by `vite build` (which also writes to `dist/`). Vite would overwrite the tsc output, but the tsc step is wasteful and could cause transient file conflicts.

**Mitigation:** Change to `tsc --noEmit && vite build`. This is a correction, not a new risk. The `--noEmit` flag makes tsc perform type checking only, which is its intended role in a Vite project (Vite handles all transpilation via esbuild).

### 5.6 `archiver` Dependency

**Risk:** Adding a new npm dependency (`archiver`) increases the supply chain surface.

**Mitigations:**
- `archiver` is a devDependency only (not shipped in the game build).
- It has 20M+ weekly downloads on npm and is actively maintained.
- It is used only by a build script, not by runtime game code.
- Alternative (native `zip` via `child_process`) would be macOS/Linux-only and harder to control programmatically.

### 5.7 Source Maps in Production Archive

**Risk:** Accidentally including `.map` files in the archive would expose source code and inflate archive size.

**Mitigation:** `create-archive.js` explicitly skips `*.map` files. The Vite config can continue to generate source maps for local debugging (`sourcemap: true` in tsconfig), but they will not appear in the Jest upload archive.

---

## 6. Open Questions for PE

1. **Confirm single-bundle decision:** The existing `vite.config.ts` splits Phaser into a separate chunk (`manualChunks: { phaser: ['phaser'] }`). My plan removes this to create a single bundle. Please confirm this is acceptable or if you prefer to keep the chunk split.

2. **Source map generation:** Should `vite build` generate source maps at all for production builds? Currently `tsconfig.json` has `sourceMap: true`. Options:
   - Keep generating them (useful for debugging production issues) -- they will be excluded from the archive regardless.
   - Disable them in production (smaller/faster build, no risk of accidental inclusion).

3. **Archive output location:** I plan to write `gem-link.zip` to the project root (`gem-link/gem-link.zip`). Alternative: write to `gem-link/dist/gem-link.zip`. Which do you prefer? The project root keeps it visibly separate from build output.

4. **`npm run size` as build gate:** Currently `npm run build:zip` does NOT run the size checker. It builds and archives. `npm run size` is a separate command. Should `build:zip` automatically fail if the build exceeds 10 MB? This would change the pipeline to: `build:zip` = `build` + `size` (fail if blocked) + `archive`. I chose to keep them separate for flexibility, but can chain them if preferred.

5. **Git-ignoring the archive:** Should `gem-link.zip` be added to `.gitignore`? It is a build artifact and should not be committed. I will add it if confirmed.

---

## 7. Implementation Order

1. **Modify `vite.config.ts`** -- Single bundle config, asset inlining, hash filenames.
2. **Modify `package.json`** -- Add scripts, add `archiver` devDependency.
3. **Create `scripts/check-size.js`** -- Build size monitor.
4. **Create `scripts/create-archive.js`** -- Archive creator.
5. **Run `npm install`** -- Install `archiver`.
6. **Verify all five commands** -- Run each command from Section 4 and confirm expected output.

**Estimated implementation time:** 2-3 hours.

---

*Awaiting PE approval before writing code.*

---

## 8. PE Approval

**Reviewer:** Principal Engineer
**Date:** 2026-02-27
**Status:** ✅ APPROVED — Proceed to implementation

### PE Assessment

Solid plan with clear rationale for every decision. The `tsc --noEmit` fix is a correct bug catch — good eye. The four-tier size threshold system (GREEN/YELLOW/RED/BLOCKED) is smarter than the two constants in game.types.ts. The archiver justification is sound. The verification section is thorough with both happy-path and error-case coverage.

### Answers to Open Questions

**Q1: Confirm single-bundle decision?**
**A: Confirmed — remove `manualChunks`, single bundle.** Your rationale is correct. Jest's sandboxed webview loads everything on one page load, so splitting Phaser into a separate chunk adds an HTTP request with no cache benefit (there's no cross-page navigation). Current build is ~1.47MB total — a single bundle is fine. If we ever exceed 5MB of JS (unlikely), we'll revisit. **Remove `manualChunks` and add `inlineDynamicImports: true`.**

**Q2: Source map generation?**
**A: Keep generating source maps for now.** They're useful for debugging production issues, especially when Jest webview error traces reference minified code. Your archive script already excludes `*.map` files, so there's zero risk of accidental inclusion. The extra build time is negligible. We can disable them later if build speed becomes an issue. **Keep `sourceMap: true` in tsconfig.json. No changes needed.**

**Q3: Archive output location?**
**A: Project root — `gem-link/gem-link.zip`.** Your reasoning is correct: keeping it separate from `dist/` makes it clearly a deployable artifact, not a build intermediate. The `.gitignore` already has `*.zip` (confirmed — line 8 of .gitignore). **Write to project root as planned.**

**Q4: `npm run size` as build gate?**
**A: Keep them separate.** `build:zip` should always produce the archive — even if the build is over 10MB, we want the artifact to exist for debugging. The Release Manager (or a future CI step) will run `npm run size` and gate the upload. Coupling them now adds complexity and prevents useful debugging workflows. **Keep `build:zip` = `build` + `archive` only. `size` is a separate command.**

**Q5: Git-ignoring the archive?**
**A: Already handled.** The existing `.gitignore` has `*.zip` on line 8, which covers `gem-link.zip`. No changes needed. ✅

### PE Modifications Required

1. **No additional modifications needed.** The plan is approved as-written.
2. **Note on `scripts/` directory:** Verify the `scripts/` directory exists before creating files. If not, create it. (The scaffold agent may or may not have created it.)

### PE Checklist

- [x] File paths match project structure (`scripts/`, `vite.config.ts`, `package.json`)
- [x] No circular dependencies (build scripts are standalone Node.js, no TS imports)
- [x] Build-time logging with `[BuildSize]` and `[Archive]` prefixes (correct — not using runtime Logger)
- [x] No file ownership overlaps (all `scripts/*` owned by DevOps; `vite.config.ts` and `package.json` are shared but modifications are non-conflicting)
- [x] Constants reference `game.types.ts` canonical values (documented in comments)
- [x] `.gitignore` already covers `*.zip`

### Authorization

**DevOps Engineer: You are cleared to begin implementation of TASK-006.** Modify `vite.config.ts` and `package.json`, create both scripts in `scripts/`, run `npm install` to add `archiver`, and verify all 5 commands from Section 4. All TypeScript must compile with `tsc --noEmit` and the build must pass with `vite build`.
