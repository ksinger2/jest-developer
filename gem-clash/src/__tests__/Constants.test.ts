/**
 * Gem Link — Constants Validation Test Suite
 * Owner: QA Engineer
 *
 * Tests for type safety, constant validation, and product catalog integrity.
 */

import { describe, it, expect } from 'vitest';
import {
  GRADIENT_BUTTON_PRIMARY,
  GRADIENT_BUTTON_SUCCESS,
  GRADIENT_BUTTON_GOLD,
  GRADIENT_BUTTON_DANGER,
  GRADIENT_BOARD_BG,
  FONT_SIZE_XS,
  FONT_SIZE_SMALL,
  FONT_SIZE_MEDIUM,
  FONT_SIZE_LARGE,
  FONT_SIZE_XL,
  FONT_SIZE_XXL,
  GEM_COLORS,
  GEM_SHAPE_COLORS,
} from '../utils/Constants';
import { ProductSKU, PRODUCT_CATALOG } from '../types/game.types';

describe('Constants Validation', () => {
  describe('Gradient Arrays', () => {
    it('GRADIENT_BUTTON_PRIMARY has exactly 2 elements', () => {
      expect(GRADIENT_BUTTON_PRIMARY).toHaveLength(2);
    });

    it('GRADIENT_BUTTON_SUCCESS has exactly 2 elements', () => {
      expect(GRADIENT_BUTTON_SUCCESS).toHaveLength(2);
    });

    it('GRADIENT_BUTTON_GOLD has exactly 2 elements', () => {
      expect(GRADIENT_BUTTON_GOLD).toHaveLength(2);
    });

    it('GRADIENT_BUTTON_DANGER has exactly 2 elements', () => {
      expect(GRADIENT_BUTTON_DANGER).toHaveLength(2);
    });

    it('GRADIENT_BOARD_BG has exactly 2 elements', () => {
      expect(GRADIENT_BOARD_BG).toHaveLength(2);
    });

    it('all gradient values are valid hex numbers', () => {
      const allGradients = [
        ...GRADIENT_BUTTON_PRIMARY,
        ...GRADIENT_BUTTON_SUCCESS,
        ...GRADIENT_BUTTON_GOLD,
        ...GRADIENT_BUTTON_DANGER,
        ...GRADIENT_BOARD_BG,
      ];

      for (const color of allGradients) {
        expect(color).toBeGreaterThanOrEqual(0x000000);
        expect(color).toBeLessThanOrEqual(0xffffff);
        expect(Number.isInteger(color)).toBe(true);
      }
    });

    it('gradient top color is lighter than bottom color (generally)', () => {
      // This is a heuristic check — top should typically be lighter
      // Not always true for all gradients, but good sanity check
      expect(GRADIENT_BUTTON_PRIMARY[0]).toBeGreaterThan(GRADIENT_BUTTON_PRIMARY[1]);
      expect(GRADIENT_BUTTON_SUCCESS[0]).toBeGreaterThan(GRADIENT_BUTTON_SUCCESS[1]);
      expect(GRADIENT_BUTTON_GOLD[0]).toBeGreaterThan(GRADIENT_BUTTON_GOLD[1]);
      expect(GRADIENT_BUTTON_DANGER[0]).toBeGreaterThan(GRADIENT_BUTTON_DANGER[1]);
    });
  });

  describe('Font Sizes', () => {
    it('all font sizes are positive numbers', () => {
      const fontSizes = [
        FONT_SIZE_XS,
        FONT_SIZE_SMALL,
        FONT_SIZE_MEDIUM,
        FONT_SIZE_LARGE,
        FONT_SIZE_XL,
        FONT_SIZE_XXL,
      ];

      for (const size of fontSizes) {
        expect(size).toBeGreaterThan(0);
        expect(Number.isFinite(size)).toBe(true);
      }
    });

    it('font sizes are in ascending order', () => {
      expect(FONT_SIZE_XS).toBeLessThan(FONT_SIZE_SMALL);
      expect(FONT_SIZE_SMALL).toBeLessThan(FONT_SIZE_MEDIUM);
      expect(FONT_SIZE_MEDIUM).toBeLessThan(FONT_SIZE_LARGE);
      expect(FONT_SIZE_LARGE).toBeLessThan(FONT_SIZE_XL);
      expect(FONT_SIZE_XL).toBeLessThan(FONT_SIZE_XXL);
    });

    it('font sizes are reasonable pixel values', () => {
      expect(FONT_SIZE_XS).toBeGreaterThanOrEqual(8);
      expect(FONT_SIZE_XS).toBeLessThan(100);

      expect(FONT_SIZE_XXL).toBeGreaterThan(0);
      expect(FONT_SIZE_XXL).toBeLessThan(200); // Sanity check
    });
  });

  describe('Color Values', () => {
    it('all GEM_COLORS are valid hex numbers', () => {
      const colors = Object.values(GEM_COLORS);

      for (const color of colors) {
        expect(color).toBeGreaterThanOrEqual(0x000000);
        expect(color).toBeLessThanOrEqual(0xffffff);
        expect(Number.isInteger(color)).toBe(true);
      }
    });

    it('all GEM_SHAPE_COLORS are valid hex numbers', () => {
      const colors = Object.values(GEM_SHAPE_COLORS);

      for (const color of colors) {
        expect(color).toBeGreaterThanOrEqual(0x000000);
        expect(color).toBeLessThanOrEqual(0xffffff);
        expect(Number.isInteger(color)).toBe(true);
      }
    });

    it('GEM_COLORS has exactly 6 colors', () => {
      expect(Object.keys(GEM_COLORS)).toHaveLength(6);
    });

    it('GEM_SHAPE_COLORS has exactly 6 shapes', () => {
      expect(Object.keys(GEM_SHAPE_COLORS)).toHaveLength(6);
    });

    it('gem color names are correct', () => {
      expect(GEM_COLORS).toHaveProperty('red');
      expect(GEM_COLORS).toHaveProperty('blue');
      expect(GEM_COLORS).toHaveProperty('green');
      expect(GEM_COLORS).toHaveProperty('yellow');
      expect(GEM_COLORS).toHaveProperty('purple');
      expect(GEM_COLORS).toHaveProperty('white');
    });

    it('gem shape names are correct', () => {
      expect(GEM_SHAPE_COLORS).toHaveProperty('heart');
      expect(GEM_SHAPE_COLORS).toHaveProperty('diamond');
      expect(GEM_SHAPE_COLORS).toHaveProperty('triangle');
      expect(GEM_SHAPE_COLORS).toHaveProperty('square');
      expect(GEM_SHAPE_COLORS).toHaveProperty('circle');
      expect(GEM_SHAPE_COLORS).toHaveProperty('star');
    });
  });

  describe('Product Catalog Integrity', () => {
    it('every ProductSKU has a corresponding PRODUCT_CATALOG entry', () => {
      const catalogSKUs = new Set(PRODUCT_CATALOG.map(p => p.sku));

      for (const sku of Object.values(ProductSKU)) {
        expect(catalogSKUs.has(sku)).toBe(true);
      }
    });

    it('PRODUCT_CATALOG has no duplicate SKUs', () => {
      const skus = PRODUCT_CATALOG.map(p => p.sku);
      const uniqueSKUs = new Set(skus);

      expect(skus.length).toBe(uniqueSKUs.size);
    });

    it('all products have non-empty names', () => {
      for (const product of PRODUCT_CATALOG) {
        expect(product.name.trim().length).toBeGreaterThan(0);
      }
    });

    it('all products have non-empty descriptions', () => {
      for (const product of PRODUCT_CATALOG) {
        expect(product.description.trim().length).toBeGreaterThan(0);
      }
    });

    it('all products have positive prices', () => {
      for (const product of PRODUCT_CATALOG) {
        expect(product.priceInTokens).toBeGreaterThan(0);
        expect(Number.isFinite(product.priceInTokens)).toBe(true);
      }
    });

    it('PRODUCT_CATALOG contains exactly 11 products', () => {
      // Based on ProductSKU enum: 4 base + 4 packs + 3 boosters = 11
      expect(PRODUCT_CATALOG).toHaveLength(11);
    });

    it('specific products exist in catalog', () => {
      const skuSet = new Set(PRODUCT_CATALOG.map(p => p.sku));

      expect(skuSet.has(ProductSKU.EXTRA_MOVES)).toBe(true);
      expect(skuSet.has(ProductSKU.LIVES_REFILL)).toBe(true);
      expect(skuSet.has(ProductSKU.STARTER_PACK)).toBe(true);
      expect(skuSet.has(ProductSKU.REMAP)).toBe(true);
      expect(skuSet.has(ProductSKU.PACK_BEGINNER)).toBe(true);
      expect(skuSet.has(ProductSKU.PACK_JUMBO)).toBe(true);
      expect(skuSet.has(ProductSKU.PACK_SUPER)).toBe(true);
      expect(skuSet.has(ProductSKU.PACK_MEGA)).toBe(true);
      expect(skuSet.has(ProductSKU.HAMMER)).toBe(true);
      expect(skuSet.has(ProductSKU.BOMB_BOOSTER)).toBe(true);
      expect(skuSet.has(ProductSKU.RAINBOW)).toBe(true);
    });

    it('product prices are reasonable (1-20 tokens)', () => {
      for (const product of PRODUCT_CATALOG) {
        expect(product.priceInTokens).toBeGreaterThanOrEqual(1);
        expect(product.priceInTokens).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('ProductSKU Enum', () => {
    it('has exactly 11 SKUs', () => {
      const skuValues = Object.values(ProductSKU);
      expect(skuValues).toHaveLength(11);
    });

    it('all SKUs follow gc_ prefix convention', () => {
      for (const sku of Object.values(ProductSKU)) {
        expect(sku).toMatch(/^gc_/);
      }
    });

    it('all SKUs are lowercase with underscores', () => {
      for (const sku of Object.values(ProductSKU)) {
        expect(sku).toMatch(/^[a-z0-9_]+$/);
      }
    });
  });

  describe('Type Safety Checks', () => {
    it('gradient arrays are readonly tuples', () => {
      // TypeScript compile-time check — runtime verification
      expect(Array.isArray(GRADIENT_BUTTON_PRIMARY)).toBe(true);
      expect(Object.isFrozen(GRADIENT_BUTTON_PRIMARY)).toBe(false); // readonly in TS, not frozen
    });

    it('color constants are numbers', () => {
      expect(typeof GEM_COLORS.red).toBe('number');
      expect(typeof GEM_SHAPE_COLORS.heart).toBe('number');
    });

    it('font size constants are numbers', () => {
      expect(typeof FONT_SIZE_SMALL).toBe('number');
      expect(typeof FONT_SIZE_XXL).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    it('no color constant is pure black (0x000000)', () => {
      const allColors = [
        ...Object.values(GEM_COLORS),
        ...Object.values(GEM_SHAPE_COLORS),
      ];

      for (const color of allColors) {
        expect(color).toBeGreaterThan(0x000000);
      }
    });

    it('no color constant is pure white (0xffffff)', () => {
      const allColors = [
        ...Object.values(GEM_COLORS),
        ...Object.values(GEM_SHAPE_COLORS),
      ];

      // Allow white gem color to be close to white
      const nonWhiteColors = allColors.filter(c => c !== GEM_COLORS.white);

      for (const color of nonWhiteColors) {
        expect(color).toBeLessThan(0xffffff);
      }
    });

    it('gradient pairs have different colors', () => {
      expect(GRADIENT_BUTTON_PRIMARY[0]).not.toBe(GRADIENT_BUTTON_PRIMARY[1]);
      expect(GRADIENT_BUTTON_SUCCESS[0]).not.toBe(GRADIENT_BUTTON_SUCCESS[1]);
      expect(GRADIENT_BUTTON_GOLD[0]).not.toBe(GRADIENT_BUTTON_GOLD[1]);
      expect(GRADIENT_BUTTON_DANGER[0]).not.toBe(GRADIENT_BUTTON_DANGER[1]);
      expect(GRADIENT_BOARD_BG[0]).not.toBe(GRADIENT_BOARD_BG[1]);
    });
  });
});
