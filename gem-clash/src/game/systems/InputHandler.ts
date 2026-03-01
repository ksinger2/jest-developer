/**
 * Gem Link — Input Handler
 * Owner: Game Engineer
 *
 * Handles touch/click input on the game board.
 * Supports two interaction modes:
 * 1. Tap-to-select: Tap a gem to select it, tap an adjacent gem to swap
 * 2. Drag-to-swap: Press and drag to an adjacent cell to swap
 *
 * Emits swap requests via callback — does NOT execute swaps directly.
 */

import Phaser from 'phaser';
import { Logger } from '../../utils/Logger';
import { GridPosition, SwapAction, GRID_ROWS, GRID_COLS } from '../../types/game.types';
import { GEM_SIZE, GEM_SPACING } from '../../utils/Constants';

const logger = new Logger('InputHandler');

/** Minimum drag distance to trigger a swap (pixels) */
const MIN_DRAG_DISTANCE = 20;

/** Callback type for swap requests */
export type SwapCallback = (swap: SwapAction) => void;

export class InputHandler {
  private scene: Phaser.Scene;

  /** Board origin in screen coordinates */
  private boardX: number = 0;
  private boardY: number = 0;

  /** Cell size (gem + spacing) */
  private cellSize: number;

  /** Currently selected gem (tap mode) */
  private selectedPos: GridPosition | null = null;

  /** Drag state */
  private isDragging: boolean = false;
  private dragStartPos: GridPosition | null = null;
  private dragStartPixel: { x: number; y: number } | null = null;

  /** Whether input is enabled (disabled during animations) */
  private enabled: boolean = true;

  /** Callback for when a valid swap is requested */
  private onSwap: SwapCallback | null = null;

  /** Callback for when a gem is selected (for visual feedback) */
  private onSelect: ((pos: GridPosition | null) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cellSize = GEM_SIZE + GEM_SPACING;
    logger.info('constructor', 'InputHandler created');
  }

  /**
   * Initialize the input handler with board coordinates and callbacks.
   */
  init(
    boardX: number,
    boardY: number,
    onSwap: SwapCallback,
    onSelect?: (pos: GridPosition | null) => void,
  ): void {
    this.boardX = boardX;
    this.boardY = boardY;
    this.onSwap = onSwap;
    this.onSelect = onSelect ?? null;
    this.selectedPos = null;
    this.isDragging = false;
    this.enabled = true;

    // Set up pointer events on the scene
    this.scene.input.on('pointerdown', this.handlePointerDown, this);
    this.scene.input.on('pointermove', this.handlePointerMove, this);
    this.scene.input.on('pointerup', this.handlePointerUp, this);

    logger.info('init', 'Input handler initialized', { boardX, boardY, cellSize: this.cellSize });
  }

  /**
   * Enable or disable input processing.
   * Disabled during animations/cascades.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clearSelection();
      this.isDragging = false;
      this.dragStartPos = null;
      this.dragStartPixel = null;
    }
    logger.debug('setEnabled', `Input ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get the currently selected position (for rendering highlight).
   */
  getSelectedPos(): GridPosition | null {
    return this.selectedPos;
  }

  /**
   * Clear the current selection.
   */
  clearSelection(): void {
    if (this.selectedPos) {
      logger.debug('clearSelection', 'Selection cleared');
      this.selectedPos = null;
      this.onSelect?.(null);
    }
  }

  /**
   * Convert screen coordinates to grid position.
   * Returns null if outside the board.
   */
  private screenToGrid(x: number, y: number): GridPosition | null {
    const col = Math.floor((x - this.boardX) / this.cellSize);
    const row = Math.floor((y - this.boardY) / this.cellSize);

    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
      return null;
    }

    return { row, col };
  }

  /**
   * Check if two positions are adjacent.
   */
  private areAdjacent(a: GridPosition, b: GridPosition): boolean {
    const dr = Math.abs(a.row - b.row);
    const dc = Math.abs(a.col - b.col);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  }

  /**
   * Handle pointer down — start a potential tap or drag.
   */
  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled) return;

    const gridPos = this.screenToGrid(pointer.x, pointer.y);
    if (!gridPos) return;

    this.isDragging = true;
    this.dragStartPos = gridPos;
    this.dragStartPixel = { x: pointer.x, y: pointer.y };

    logger.debug('handlePointerDown', `Pointer down at grid (${gridPos.row},${gridPos.col})`);
  }

  /**
   * Handle pointer move — detect drag direction for swap.
   */
  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled || !this.isDragging || !this.dragStartPixel || !this.dragStartPos) return;

    const dx = pointer.x - this.dragStartPixel.x;
    const dy = pointer.y - this.dragStartPixel.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= MIN_DRAG_DISTANCE) {
      // Determine drag direction (dominant axis)
      let targetPos: GridPosition;
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal drag
        const colDir = dx > 0 ? 1 : -1;
        targetPos = { row: this.dragStartPos.row, col: this.dragStartPos.col + colDir };
      } else {
        // Vertical drag
        const rowDir = dy > 0 ? 1 : -1;
        targetPos = { row: this.dragStartPos.row + rowDir, col: this.dragStartPos.col };
      }

      // Validate target is on the board
      if (
        targetPos.row >= 0 &&
        targetPos.row < GRID_ROWS &&
        targetPos.col >= 0 &&
        targetPos.col < GRID_COLS
      ) {
        logger.info('handlePointerMove', `Drag swap: (${this.dragStartPos.row},${this.dragStartPos.col}) → (${targetPos.row},${targetPos.col})`);

        // Clear any tap selection
        this.clearSelection();

        // Request the swap
        this.onSwap?.({
          from: this.dragStartPos,
          to: targetPos,
        });
      }

      // Reset drag state
      this.isDragging = false;
      this.dragStartPos = null;
      this.dragStartPixel = null;
    }
  }

  /**
   * Handle pointer up — complete a tap-to-select/swap.
   */
  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled) return;

    const gridPos = this.screenToGrid(pointer.x, pointer.y);

    // Only process as a tap if we didn't already process a drag swap
    if (this.isDragging && this.dragStartPos && gridPos) {
      // Check if this was a tap (minimal movement)
      const dx = this.dragStartPixel ? pointer.x - this.dragStartPixel.x : 0;
      const dy = this.dragStartPixel ? pointer.y - this.dragStartPixel.y : 0;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MIN_DRAG_DISTANCE) {
        this.handleTap(gridPos);
      }
    }

    this.isDragging = false;
    this.dragStartPos = null;
    this.dragStartPixel = null;
  }

  /**
   * Process a tap on a grid position.
   */
  private handleTap(pos: GridPosition): void {
    if (this.selectedPos === null) {
      // No selection yet — select this gem
      this.selectedPos = pos;
      this.onSelect?.(pos);
      logger.debug('handleTap', `Selected gem at (${pos.row},${pos.col})`);
    } else if (this.selectedPos.row === pos.row && this.selectedPos.col === pos.col) {
      // Tapped same gem — deselect
      this.clearSelection();
    } else if (this.areAdjacent(this.selectedPos, pos)) {
      // Tapped adjacent gem — swap
      logger.info('handleTap', `Tap swap: (${this.selectedPos.row},${this.selectedPos.col}) → (${pos.row},${pos.col})`);
      const swap: SwapAction = { from: this.selectedPos, to: pos };
      this.clearSelection();
      this.onSwap?.(swap);
    } else {
      // Tapped non-adjacent gem — move selection
      this.selectedPos = pos;
      this.onSelect?.(pos);
      logger.debug('handleTap', `Re-selected gem at (${pos.row},${pos.col})`);
    }
  }

  /**
   * Clean up event listeners.
   */
  destroy(): void {
    this.scene.input.off('pointerdown', this.handlePointerDown, this);
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    this.onSwap = null;
    this.onSelect = null;
    logger.info('destroy', 'InputHandler destroyed');
  }
}
