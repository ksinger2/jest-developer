# Next Steps

**Last Updated:** 2026-03-20
**Last Session By:** Claude (Engineering Session)

---

## Project Status

### Current Phase
Shop and Purchase Modal polish - **COMPLETE** ✅

### What Was Accomplished This Session
- **Fixed Purchase Modal UI:**
  - Removed coin icon from price display
  - Now shows USD price (e.g., "$0.99") instead of tokens
  - Added more spacing (48px) before "Buy Now" button for better layout
- **Added priceUSD to Product Catalog:**
  - Updated `ProductInfo` interface with `priceUSD` field
  - Added USD prices to all 11 products in PRODUCT_CATALOG
- **Removed Free Gift celebration popup** - No more blue popup in top left when claiming
- **Fixed Shop button hit area** - Now uses pixel-perfect hit detection so only the visible button outline is clickable (not the full rectangular bounding box)

### Current State
The shop and purchase modal are polished and ready for testing. USD prices display correctly, spacing is improved, and the shop button hit area matches its visual outline.

---

## Immediate Next Actions

### Priority 1 (Do Now)
- Test purchase modal on real device to verify USD display
- Verify shop button hit area feels correct on touch
- Continue any remaining UI polish

### Priority 2 (Do After)
- Test on actual Jest platform
- Visual QA pass on all screens
- Continue implementation of remaining features

---

## Known Issues / Blockers

### Resolved ✅
- ~~Blurry rendering~~ - FIXED with DPR-scaled canvas + camera zoom
- ~~Purchase modal shows tokens instead of USD~~ - FIXED
- ~~Shop button hit area too large~~ - FIXED with pixel-perfect detection

### P1 - High
- Dev server keeps changing ports (3000, 3001, 3002) - need to kill old processes

---

## Context for Specific Agents

### For Engineers
- **CRITICAL:** All scenes MUST call `setupHighDPICamera(this)` in create()
- Use `GAME_WIDTH/HEIGHT` (390×600) for positioning in scenes
- Use `CANVAS_WIDTH/HEIGHT` only in main.ts Phaser config
- See `gem-clash/docs/jest-phaser-high-dpi-guide.md` for full details
- Product prices now have both `priceInTokens` and `priceUSD` fields

### For Designers
- Purchase modal now displays real USD prices
- Shop button has pixel-perfect hit detection
- See `docs/mobile-game-design-best-practices.md` for design guidelines

### For QA
- Test purchase modal displays correct USD prices for all products
- Verify shop button only responds when clicking the visible button (not surrounding area)
- Verify no blue popup appears when claiming free gift

---

## Files Changed This Session

- `src/types/game.types.ts` - Added `priceUSD` field to ProductInfo, updated PRODUCT_CATALOG with USD prices
- `src/game/scenes/ShopScene.ts` - Updated modal to show USD, removed free gift celebration popup
- `src/game/scenes/MainMenuScene.ts` - Shop button now uses pixel-perfect hit detection

---

## Session Handoff Notes

The purchase modal and shop button fixes are complete. Key changes:
1. ProductInfo now has `priceUSD` (string like "$0.99") alongside `priceInTokens`
2. Confirmation modal shows USD price without coin icon
3. Free gift no longer triggers `CelebrationSystem.celebratePurchase()`
4. Shop button uses `pixelPerfect: true, alphaTolerance: 128` for hit detection

---

**Instructions for Agents:** Update this file at the END of every session before signing off. Keep entries concise but complete enough that a fresh agent can pick up where you left off.
