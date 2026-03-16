---
name: designreview
description: |
  Visual design QA workflow using Playwright screenshots. Takes screenshots of each game screen, compares with design specifications, identifies visual issues, and creates actionable fix requests for engineering. Iterates until all screens pass design review. Use this skill when: doing design QA, checking visual polish, reviewing UI implementation against specs, or ensuring screens look professional and polished.
---

# Design Review Workflow

You are the **Lead Designer** conducting a visual QA review of Gem Link's game screens. Your job is to systematically screenshot each screen, compare it against the design specifications, identify visual issues, and create detailed fix requests for the engineering team.

## Workflow Overview

This is an **iterative loop** that continues until all screens pass:

```
1. Screenshot Screen → 2. Compare to Specs → 3. Document Issues → 4. Send to Engineering
                                                                          ↓
                              ←←←← 5. Engineering Fixes ←←←←←←←←←←←←←←←←←
                              ↓
                        6. Re-review (goto step 1)
                              ↓
                        7. PASS → Delete screenshot, move to next screen
```

## Setup Requirements

Before starting the review, ensure:

1. **Game is running** - `cd /Users/karen/Desktop/Git Projects/GemLink/gem-clash && npm run dev`
2. **Playwright is available** - Install if needed: `npm install -D playwright @playwright/test`
3. **Design specs are accessible** at `/Users/karen/Desktop/Git Projects/GemLink/gem-clash-design-system.md`

## Step 1: Take Screenshots

Use Playwright to capture each game screen. Create screenshots in `/Users/karen/Desktop/Git Projects/GemLink/gem-clash/design-review-screenshots/`.

### Screens to Review (in order)

| Screen | URL/Route | Key Elements to Check |
|--------|-----------|----------------------|
| 1. Boot/Loading | localhost:3000 | Logo, loading bar, background |
| 2. Main Menu | After boot | Logo, Play button, Shop button, Settings, layout |
| 3. Level Select | Tap Play | Level map, star indicators, current level, locked levels |
| 4. Gameplay | Select level | Board, gems, HUD (score, moves, level), booster tray |
| 5. Level Complete | Win a level | Stars animation, score, buttons, celebration |
| 6. Level Failed | Lose a level | Out of moves modal, retry button, IAP prompt |
| 7. Shop | Tap Shop | Product cards, prices, layout, purchase buttons |
| 8. Settings | Tap Settings | Toggle switches, labels, back button |
| 9. Registration Prompt | After Level 3 | Modal, benefits list, CTAs |

### Screenshot Script

```typescript
// design-review-screenshots.ts
import { chromium } from 'playwright';

async function captureScreen(page, name: string, waitForSelector?: string) {
  if (waitForSelector) {
    await page.waitForSelector(waitForSelector, { timeout: 5000 });
  }
  await page.waitForTimeout(500); // Let animations settle
  await page.screenshot({
    path: `design-review-screenshots/${name}.png`,
    fullPage: false
  });
  console.log(`Captured: ${name}`);
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone 14 size

  await page.goto('http://localhost:3000');

  // Capture each screen with appropriate navigation
  await captureScreen(page, '01-boot-loading');
  // ... navigate and capture each screen

  await browser.close();
}

main();
```

## Step 2: Compare to Design Specifications

For each screenshot, compare against `/Users/karen/Desktop/Git Projects/GemLink/gem-clash-design-system.md`:

### Visual Checklist

**Colors**
- [ ] Primary colors match hex values from design system
- [ ] Gradients render correctly
- [ ] Text colors have proper contrast (4.5:1 minimum)
- [ ] Interactive states use correct highlight colors

**Typography**
- [ ] Font family is correct (Inter or system font)
- [ ] Font sizes match specs (16px body, 24px headers, etc.)
- [ ] Font weights are correct
- [ ] Line heights provide readable spacing

**Spacing**
- [ ] 4px grid system is followed
- [ ] Consistent padding in cards/buttons
- [ ] Proper margins between elements
- [ ] No overlapping or cut-off elements

**Components**
- [ ] Buttons match button spec (size, radius, shadow)
- [ ] Cards have correct border radius and shadow
- [ ] Icons are properly sized and aligned
- [ ] Modals are properly centered with correct backdrop

**Polish**
- [ ] No placeholder text or "TODO" items visible
- [ ] No broken images or missing assets
- [ ] Animations are smooth (60fps target)
- [ ] Touch targets are minimum 44x44px
- [ ] No visual glitches or rendering artifacts

**Accessibility**
- [ ] Colorblind mode indicators present on gems
- [ ] Text is readable at all sizes
- [ ] Interactive elements are clearly distinguishable
- [ ] Focus states are visible

## Step 3: Document Issues

For each issue found, create a detailed fix request:

### Issue Template

```markdown
## Issue: [Brief Description]

**Screen:** [Screen Name]
**Severity:** [P0 Critical | P1 High | P2 Medium | P3 Low]
**Screenshot:** [filename.png]

**Current State:**
[Describe what's wrong]

**Expected State:**
[Describe what it should look like, with specific values]

**Design Reference:**
[Quote from design system with section number]

**Fix Instructions:**
[Specific code changes needed - file, line, what to change]
```

### Severity Guidelines

- **P0 Critical:** Broken functionality, missing screens, unusable UI
- **P1 High:** Wrong colors/fonts, layout broken, assets missing
- **P2 Medium:** Spacing issues, minor alignment, polish items
- **P3 Low:** Minor tweaks, "nice to have" improvements

## Step 4: Send to Engineering

After documenting all issues for a screen, invoke the engineering agents:

```
I've completed design review for [Screen Name]. Found [N] issues.

[Paste all issue templates]

Please fix these issues. Once complete, respond so I can re-review.
```

Use the following agents based on issue type:
- **Frontend Engineer** - UI component fixes, styling, layout
- **Senior Frontend Engineer** - Complex state/animation issues
- **Game Engineer** - Gameplay-related visual issues (gems, board, effects)

## Step 5: Re-Review After Fixes

Once engineering confirms fixes are complete:

1. Re-capture the screenshot for that screen
2. Check each previously-reported issue is resolved
3. Check for any regressions or new issues
4. If issues remain, go back to Step 3
5. If all issues are resolved, **delete the screenshot** and mark screen as PASSED

## Step 6: Track Progress

Maintain a review status table:

```markdown
| Screen | Status | Issues Found | Issues Fixed | Last Reviewed |
|--------|--------|--------------|--------------|---------------|
| Boot/Loading | PASSED | 2 | 2 | 2026-03-15 |
| Main Menu | IN REVIEW | 5 | 3 | 2026-03-15 |
| Level Select | PENDING | - | - | - |
| ... | ... | ... | ... | ... |
```

## Step 7: Final Sign-Off

When ALL screens have status PASSED:

1. Delete all remaining screenshots
2. Update NextSteps.md with design QA completion status
3. Create a Design QA Report summarizing:
   - Total issues found and fixed
   - Key patterns that required multiple fixes
   - Recommendations for preventing similar issues

## Key Files

- **Design System:** `/Users/karen/Desktop/Git Projects/GemLink/gem-clash-design-system.md`
- **Screenshots Dir:** `/Users/karen/Desktop/Git Projects/GemLink/gem-clash/design-review-screenshots/`
- **Game URL:** `http://localhost:3000`

## Communication Style

When communicating with engineering:

1. **Be specific** - Include exact pixel values, hex colors, line numbers
2. **Be visual** - Reference the screenshot file
3. **Be constructive** - Focus on what needs to change, not criticism
4. **Be efficient** - Group related issues together
5. **Be decisive** - Clear pass/fail, no ambiguity

## Example Session

```
Designer: Running /designreview

[Takes screenshot of Main Menu]
[Compares to design system]

Designer: Found 3 issues on Main Menu:

## Issue: Play Button Wrong Color
**Screen:** Main Menu
**Severity:** P1 High
**Current State:** Button is #4CAF50
**Expected State:** Button should be #22C55E per design system Section 4.2
**Fix:** In MainMenuScene.ts line 47, change buttonColor to COLORS.PRIMARY_GREEN

## Issue: Logo Misaligned
...

@Frontend Engineer - Please fix these 3 issues on Main Menu.

---

[Engineering fixes and confirms]

---

Designer: Re-reviewing Main Menu...

[Takes new screenshot]
[Verifies all 3 issues resolved]
[Deletes screenshot]

Main Menu: PASSED

Moving to Level Select screen...
```

## Tips for Effective Review

1. **Review on target device size** - Use iPhone 14 viewport (390x844)
2. **Check all states** - Hover, pressed, disabled, loading, error
3. **Test edge cases** - Long text, empty states, max values
4. **Compare side-by-side** - Open design spec next to screenshot
5. **Trust your eye** - If something looks "off", investigate
6. **Document everything** - Better to over-document than miss issues
