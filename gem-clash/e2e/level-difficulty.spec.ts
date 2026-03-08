/**
 * GemLink — Automated Level Difficulty Assessment
 *
 * Plays through levels 1-15 with a greedy AI player and reports
 * difficulty metrics: score, moves used, stars, pass/fail, cascades.
 *
 * The AI uses a greedy strategy: for each move, it evaluates all possible
 * swaps and picks the one that clears the most gems. This simulates a
 * "reasonably skilled" player who makes obvious good moves but doesn't
 * plan multi-step combos.
 */

import { test, expect } from '@playwright/test';

// ── Board / game constants (must match game code) ──
const GRID_ROWS = 8;
const GRID_COLS = 8;
const GEM_SIZE = 44;
const GEM_SPACING = 4;
const CELL_SIZE = GEM_SIZE + GEM_SPACING; // 48
const GAME_WIDTH = 390;
const GAMEPLAY_BOARD_Y = 90;
const BOARD_WIDTH = GRID_COLS * CELL_SIZE; // 384
const BOARD_X = Math.round(GAME_WIDTH / 2 - BOARD_WIDTH / 2); // 3

// ── Types ──
interface GemInfo {
  id: string;
  color: string;
  specialType: string;
  row: number;
  col: number;
}

interface GridPos {
  row: number;
  col: number;
}

interface LevelMetrics {
  levelId: number;
  levelName: string;
  passed: boolean;
  finalScore: number;
  stars: number;
  movesUsed: number;
  movesLimit: number;
  totalCascades: number;
  scoreTarget: number;
  starThresholds: number[];
  scorePerMove: number;
  validMovesAtStart: number;
  attemptCount: number;
  extraMovesAt3Star: number;
}

// ── Match detection (pure logic) ──

function findAllMatchesOnGrid(grid: (GemInfo | null)[][]): GridPos[] {
  const matched = new Set<string>();

  for (let row = 0; row < GRID_ROWS; row++) {
    let col = 0;
    while (col < GRID_COLS) {
      const gem = grid[row][col];
      if (!gem) { col++; continue; }
      const color = gem.color;
      const positions: GridPos[] = [{ row, col }];
      col++;
      while (col < GRID_COLS && grid[row][col]?.color === color) {
        positions.push({ row, col });
        col++;
      }
      if (positions.length >= 3) {
        for (const p of positions) matched.add(`${p.row},${p.col}`);
      }
    }
  }

  for (let col = 0; col < GRID_COLS; col++) {
    let row = 0;
    while (row < GRID_ROWS) {
      const gem = grid[row][col];
      if (!gem) { row++; continue; }
      const color = gem.color;
      const positions: GridPos[] = [{ row, col }];
      row++;
      while (row < GRID_ROWS && grid[row][col]?.color === color) {
        positions.push({ row, col });
        row++;
      }
      if (positions.length >= 3) {
        for (const p of positions) matched.add(`${p.row},${p.col}`);
      }
    }
  }

  return [...matched].map(k => {
    const [r, c] = k.split(',').map(Number);
    return { row: r, col: c };
  });
}

function countMatchesAfterSwap(
  grid: (GemInfo | null)[][],
  from: GridPos,
  to: GridPos,
): number {
  const copy: (GemInfo | null)[][] = grid.map(row => row.map(g => g ? { ...g } : null));
  const temp = copy[from.row][from.col];
  copy[from.row][from.col] = copy[to.row][to.col];
  copy[to.row][to.col] = temp;
  return findAllMatchesOnGrid(copy).length;
}

function findBestMove(grid: (GemInfo | null)[][]): { from: GridPos; to: GridPos; score: number } | null {
  let best: { from: GridPos; to: GridPos; score: number } | null = null;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (!grid[row][col]) continue;

      if (col + 1 < GRID_COLS && grid[row][col + 1]) {
        const s = countMatchesAfterSwap(grid, { row, col }, { row, col: col + 1 });
        if (s > 0 && (!best || s > best.score)) {
          best = { from: { row, col }, to: { row, col: col + 1 }, score: s };
        }
      }
      if (row + 1 < GRID_ROWS && grid[row + 1]?.[col]) {
        const s = countMatchesAfterSwap(grid, { row, col }, { row: row + 1, col });
        if (s > 0 && (!best || s > best.score)) {
          best = { from: { row, col }, to: { row: row + 1, col }, score: s };
        }
      }
    }
  }

  return best;
}

function countValidMoves(grid: (GemInfo | null)[][]): number {
  let count = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (!grid[row][col]) continue;
      if (col + 1 < GRID_COLS && grid[row][col + 1]) {
        if (countMatchesAfterSwap(grid, { row, col }, { row, col: col + 1 }) > 0) count++;
      }
      if (row + 1 < GRID_ROWS && grid[row + 1]?.[col]) {
        if (countMatchesAfterSwap(grid, { row, col }, { row: row + 1, col }) > 0) count++;
      }
    }
  }
  return count;
}

// ── Helpers ──

/** Convert game-space coordinate to actual viewport pixel (accounts for Phaser Scale.FIT) */
async function getScaleFactor(page: any): Promise<{ scaleX: number; scaleY: number; offsetX: number; offsetY: number }> {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    // Phaser game dimensions
    const gameW = 390;
    const gameH = 600;
    return {
      scaleX: rect.width / gameW,
      scaleY: rect.height / gameH,
      offsetX: rect.left,
      offsetY: rect.top,
    };
  });
}

function gameToScreen(
  gameX: number,
  gameY: number,
  scale: { scaleX: number; scaleY: number; offsetX: number; offsetY: number },
): { x: number; y: number } {
  return {
    x: scale.offsetX + gameX * scale.scaleX,
    y: scale.offsetY + gameY * scale.scaleY,
  };
}

function gridToGameCoord(row: number, col: number): { x: number; y: number } {
  return {
    x: BOARD_X + col * CELL_SIZE + CELL_SIZE / 2,
    y: GAMEPLAY_BOARD_Y + row * CELL_SIZE + CELL_SIZE / 2,
  };
}

// ── Shared: initialize game and return scale factor ──

async function initGame(page: any): Promise<{ scaleX: number; scaleY: number; offsetX: number; offsetY: number }> {
  console.log('[QA] Loading game...');
  await page.goto('/');

  await page.waitForFunction(() => {
    const g = (window as any).__GAME__;
    return g && g.scene && g.scene.scenes && g.scene.scenes.length > 0;
  }, { timeout: 15_000 });
  console.log('[QA] Phaser game instance detected');

  await page.waitForFunction(() => {
    const g = (window as any).__GAME__;
    const scene = g?.scene?.getScene?.('MainMenuScene');
    return scene && scene.scene.isActive();
  }, { timeout: 20_000 });
  console.log('[QA] MainMenuScene is active — game fully loaded');

  await page.evaluate(() => {
    const g = (window as any).__GAME__;
    for (const s of g.scene.scenes) {
      if (s.registry) {
        const progress = s.registry.get('playerProgress');
        if (progress) {
          progress.currentLevel = 30;
          progress.lives = 99;
          s.registry.set('playerProgress', progress);
        }
        break;
      }
    }
  });
  console.log('[QA] Player progress unlocked (all levels, 99 lives)');

  await page.evaluate(() => {
    const g = (window as any).__GAME__;
    if (g.loop) g.loop.targetFps = 240;
    for (const scene of g.scene.scenes) {
      if (scene.tweens) scene.tweens.timeScale = 4;
      if (scene.time) scene.time.timeScale = 4;
    }
  });
  console.log('[QA] Animation speed set to 4x');

  const scale = await getScaleFactor(page);
  console.log(`[QA] Scale: ${scale.scaleX.toFixed(2)}x${scale.scaleY.toFixed(2)}, offset: (${scale.offsetX.toFixed(0)},${scale.offsetY.toFixed(0)})`);
  return scale;
}

// ── Shared: play a range of levels and collect metrics ──

async function playLevels(
  page: any,
  scale: { scaleX: number; scaleY: number; offsetX: number; offsetY: number },
  startLevel: number,
  endLevel: number,
): Promise<LevelMetrics[]> {
  const allMetrics: LevelMetrics[] = [];

  for (let levelId = startLevel; levelId <= endLevel; levelId++) {
    console.log(`\n[QA] ═══ Starting Level ${levelId} ═══`);
    const maxAttempts = 2;
    let bestResult: LevelMetrics | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await page.evaluate((lvl: number) => {
        const g = (window as any).__GAME__;
        for (const s of g.scene.scenes) {
          if (s.registry) {
            const progress = s.registry.get('playerProgress');
            if (progress) {
              progress.lives = 99;
              progress.currentLevel = 30;
              s.registry.set('playerProgress', progress);
            }
            break;
          }
        }
        const activeKeys = g.scene.scenes.filter((s: any) => s.scene.isActive()).map((s: any) => s.scene.key);
        for (const key of activeKeys) {
          if (key !== 'GameplayScene') g.scene.stop(key);
        }
        g.scene.start('GameplayScene', { levelId: lvl });
      }, levelId);

      const sceneReady = await page.waitForFunction(() => {
        const g = (window as any).__GAME__;
        const scene = g?.scene?.getScene?.('GameplayScene');
        return scene && scene.scene.isActive() && (scene as any).playState === 'idle';
      }, { timeout: 10_000 }).then(() => true).catch(() => false);

      if (!sceneReady) {
        console.log(`[QA] Level ${levelId} attempt ${attempt}: failed to reach IDLE state`);
        continue;
      }

      await page.evaluate(() => {
        const g = (window as any).__GAME__;
        const scene = g?.scene?.getScene?.('GameplayScene');
        if (scene) {
          if (scene.tweens) scene.tweens.timeScale = 4;
          if (scene.time) scene.time.timeScale = 4;
        }
      });

      await page.waitForTimeout(200);

      const levelInfo = await page.evaluate(() => {
        const g = (window as any).__GAME__;
        const scene = g.scene.getScene('GameplayScene');
        const lm = (scene as any).levelManager;
        return {
          name: lm?.currentLevel?.name || 'Unknown',
          moveLimit: lm?.currentLevel?.moveLimit || 0,
          scoreTarget: lm?.currentLevel?.objectives?.target || 0,
          starThresholds: lm?.currentLevel?.starThresholds || [0, 0, 0],
        };
      });

      console.log(`[QA] Level ${levelId} "${levelInfo.name}" | Moves: ${levelInfo.moveLimit} | Target: ${levelInfo.scoreTarget} | Stars: [${levelInfo.starThresholds}]`);

      const initialGrid = await getGrid(page);
      const validMovesAtStart = initialGrid.length > 0 ? countValidMoves(initialGrid) : 0;
      console.log(`[QA] Board ready — ${validMovesAtStart} valid moves available`);

      let movesUsed = 0;
      let noMoveCount = 0;
      let extraMovesAt3Star = -1;
      const threeStarThreshold = levelInfo.starThresholds[2] || 0;

      while (noMoveCount < 3) {
        const state = await page.evaluate(() => {
          const g = (window as any).__GAME__;
          const scene = g?.scene?.getScene?.('GameplayScene');
          if (!scene || !scene.scene.isActive()) return { playState: 'gone', score: 0, movesRemaining: 0 };
          return {
            playState: (scene as any).playState as string,
            score: (scene as any).scoreSystem?.getScore?.() ?? 0,
            movesRemaining: (scene as any).levelManager?.getMovesRemaining?.() ?? 0,
          };
        });

        if (state.playState === 'gone' || state.playState === 'game_over') break;
        if (state.movesRemaining <= 0) break;

        if (state.playState !== 'idle') {
          await page.waitForFunction(() => {
            const g = (window as any).__GAME__;
            const scene = g?.scene?.getScene?.('GameplayScene');
            if (!scene || !scene.scene.isActive()) return true;
            const ps = (scene as any).playState;
            return ps === 'idle' || ps === 'game_over';
          }, { timeout: 10_000 }).catch(() => {});
          continue;
        }

        const grid = await getGrid(page);
        if (grid.length === 0) break;

        const move = findBestMove(grid);
        if (!move) {
          noMoveCount++;
          await page.waitForTimeout(200);
          continue;
        }
        noMoveCount = 0;

        const fromGame = gridToGameCoord(move.from.row, move.from.col);
        const toGame = gridToGameCoord(move.to.row, move.to.col);
        const fromScreen = gameToScreen(fromGame.x, fromGame.y, scale);
        const toScreen = gameToScreen(toGame.x, toGame.y, scale);

        await page.mouse.move(fromScreen.x, fromScreen.y);
        await page.mouse.down();
        for (let i = 1; i <= 4; i++) {
          await page.mouse.move(
            fromScreen.x + (toScreen.x - fromScreen.x) * (i / 4),
            fromScreen.y + (toScreen.y - fromScreen.y) * (i / 4),
          );
        }
        await page.mouse.up();
        movesUsed++;

        await page.waitForFunction(() => {
          const g = (window as any).__GAME__;
          const scene = g?.scene?.getScene?.('GameplayScene');
          if (!scene || !scene.scene.isActive()) return true;
          const ps = (scene as any).playState;
          return ps === 'idle' || ps === 'game_over';
        }, { timeout: 10_000 }).catch(() => {});

        if (extraMovesAt3Star < 0 && threeStarThreshold > 0) {
          const postSwap = await page.evaluate(() => {
            const g = (window as any).__GAME__;
            const scene = g?.scene?.getScene?.('GameplayScene');
            if (!scene || !scene.scene.isActive()) return { score: 0, movesRemaining: 0 };
            return {
              score: (scene as any).scoreSystem?.getScore?.() ?? 0,
              movesRemaining: (scene as any).levelManager?.getMovesRemaining?.() ?? 0,
            };
          });
          if (postSwap.score >= threeStarThreshold) {
            extraMovesAt3Star = postSwap.movesRemaining;
            console.log(`[QA] 3-star threshold (${threeStarThreshold}) reached! Moves remaining: ${extraMovesAt3Star}`);
          }
        }

        await page.waitForTimeout(50);
      }

      await page.waitForTimeout(1000);

      const result = await page.evaluate(() => {
        const g = (window as any).__GAME__;
        const gps = g?.scene?.getScene?.('GameplayScene');
        if (gps) {
          const ss = (gps as any).scoreSystem;
          const lm = (gps as any).levelManager;
          if (ss && lm) {
            return {
              score: ss.getScore?.() ?? 0,
              stars: ss.calculateStars?.() ?? 0,
              cascades: ss.getTotalCascades?.() ?? 0,
              movesRemaining: lm.getMovesRemaining?.() ?? 0,
              passed: (ss.calculateStars?.() ?? 0) > 0,
            };
          }
        }
        return { score: 0, stars: 0, cascades: 0, movesRemaining: 0, passed: false };
      });

      const metrics: LevelMetrics = {
        levelId,
        levelName: levelInfo.name,
        passed: result.passed,
        finalScore: result.score,
        stars: result.stars,
        movesUsed,
        movesLimit: levelInfo.moveLimit,
        totalCascades: result.cascades,
        scoreTarget: levelInfo.scoreTarget,
        starThresholds: levelInfo.starThresholds,
        scorePerMove: movesUsed > 0 ? Math.round(result.score / movesUsed) : 0,
        validMovesAtStart,
        attemptCount: attempt,
        extraMovesAt3Star,
      };

      console.log(`[QA] Attempt ${attempt}: Score ${result.score} | Stars ${result.stars} | Moves ${movesUsed}/${levelInfo.moveLimit} | ${result.passed ? 'PASS' : 'FAIL'}`);

      if (!bestResult || metrics.finalScore > bestResult.finalScore) {
        bestResult = metrics;
      }

      if (result.passed) break;
      await page.waitForTimeout(500);
    }

    allMetrics.push(bestResult!);
  }

  return allMetrics;
}

// ── Tests ──

test('Play levels 1-15 and assess difficulty progression', async ({ page }) => {
  const scale = await initGame(page);
  const allMetrics = await playLevels(page, scale, 1, 15);

  printReport(allMetrics, 'Levels 1-15');

  const threeStarViolations = allMetrics.filter(m => m.extraMovesAt3Star > 8);
  if (threeStarViolations.length > 0) {
    console.warn(`\n[QA WARNING] ${threeStarViolations.length} level(s) have too many spare moves at 3-star (max 8 allowed):`);
    for (const v of threeStarViolations) {
      console.warn(`  Level ${v.levelId}: ${v.extraMovesAt3Star} spare moves (expected <= 8)`);
    }
  }

  const tutorialPassed = allMetrics.filter(m => m.levelId <= 5 && m.passed).length;
  expect(tutorialPassed).toBeGreaterThanOrEqual(3);
});

test('Play levels 16-30 and assess difficulty progression', async ({ page }) => {
  const scale = await initGame(page);
  const allMetrics = await playLevels(page, scale, 16, 30);

  printReport(allMetrics, 'Levels 16-30');

  const threeStarViolations = allMetrics.filter(m => m.extraMovesAt3Star > 8);
  if (threeStarViolations.length > 0) {
    console.warn(`\n[QA WARNING] ${threeStarViolations.length} level(s) have too many spare moves at 3-star (max 8 allowed):`);
    for (const v of threeStarViolations) {
      console.warn(`  Level ${v.levelId}: ${v.extraMovesAt3Star} spare moves (expected <= 8)`);
    }
  }

  // Mid-to-late game levels: at least 80% should be passable by greedy AI
  const passCount = allMetrics.filter(m => m.passed).length;
  expect(passCount).toBeGreaterThanOrEqual(12);
});

// ── Helper: read grid from game ──
async function getGrid(page: any): Promise<(GemInfo | null)[][]> {
  return page.evaluate(() => {
    const g = (window as any).__GAME__;
    const scene = g?.scene?.getScene?.('GameplayScene');
    if (!scene || !scene.scene.isActive()) return [];
    const bm = (scene as any).boardManager;
    if (!bm) return [];
    const raw = bm.getGrid();
    return raw.map((row: any[]) =>
      row.map((gem: any) =>
        gem ? { id: gem.id, color: gem.color, specialType: gem.specialType, row: gem.row, col: gem.col } : null
      )
    );
  });
}

// ── Report printer ──
function printReport(allMetrics: LevelMetrics[], label: string = 'All Levels') {
  console.log('\n' + '='.repeat(100));
  console.log(`  GEM LINK — LEVEL DIFFICULTY ASSESSMENT (${label})`);
  console.log('  AI Strategy: Greedy (picks move clearing most gems)');
  console.log('='.repeat(100));

  console.log('\n┌─────┬────────────────────┬────────┬────────┬───────┬───────────┬───────────┬─────────┬──────────┬──────────┐');
  console.log('│ Lvl │ Name               │ Result │ Score  │ Stars │ Moves     │ Target    │ Sc/Move │ Cascades │ 3★ Spare │');
  console.log('├─────┼────────────────────┼────────┼────────┼───────┼───────────┼───────────┼─────────┼──────────┼──────────┤');

  for (const m of allMetrics) {
    const result = m.passed ? 'PASS' : 'FAIL';
    const name = m.levelName.padEnd(18).substring(0, 18);
    const score = String(m.finalScore).padStart(6);
    const starStr = '*'.repeat(m.stars) + '-'.repeat(3 - m.stars);
    const moves = `${m.movesUsed}/${m.movesLimit}`.padStart(9);
    const target = String(m.scoreTarget).padStart(9);
    const spm = String(m.scorePerMove).padStart(7);
    const cascades = String(m.totalCascades).padStart(8);
    const spare = m.extraMovesAt3Star >= 0 ? String(m.extraMovesAt3Star).padStart(8) : '       -';

    console.log(`| ${String(m.levelId).padStart(3)} | ${name} | ${result.padStart(6)} | ${score} | ${starStr} | ${moves} | ${target} |${spm} | ${cascades} | ${spare} |`);
  }

  console.log('└─────┴────────────────────┴────────┴────────┴───────┴───────────┴───────────┴─────────┴──────────┴──────────┘');

  // Zone analysis
  console.log('\n-- ZONE ANALYSIS --\n');

  const zoneNames: Record<number, string> = {
    1: 'Tutorial', 2: 'Tutorial', 3: 'Tutorial', 4: 'Tutorial', 5: 'Tutorial',
    6: 'Foundation', 7: 'Foundation', 8: 'Foundation', 9: 'Foundation', 10: 'Foundation',
    11: 'Expansion', 12: 'Expansion', 13: 'Expansion', 14: 'Expansion', 15: 'Expansion',
    16: 'Challenge', 17: 'Challenge', 18: 'Challenge', 19: 'Challenge', 20: 'Challenge',
    21: 'Advanced', 22: 'Advanced', 23: 'Advanced', 24: 'Advanced', 25: 'Advanced',
    26: 'Expert', 27: 'Expert', 28: 'Expert', 29: 'Expert', 30: 'Expert',
  };
  const zoneRanges: Record<string, string> = {
    'Tutorial': '1-5', 'Foundation': '6-10', 'Expansion': '11-15',
    'Challenge': '16-20', 'Advanced': '21-25', 'Expert': '26-30',
  };

  const zoneGroups = new Map<string, LevelMetrics[]>();
  for (const m of allMetrics) {
    const zn = zoneNames[m.levelId] || 'Unknown';
    if (!zoneGroups.has(zn)) zoneGroups.set(zn, []);
    zoneGroups.get(zn)!.push(m);
  }

  const zones = [...zoneGroups.entries()].map(([name, levels]) => ({
    name: `${name} (${zoneRanges[name] || '?'})`,
    levels,
  }));

  for (const zone of zones) {
    const zonePass = zone.levels.filter(l => l.passed).length;
    const avgScore = Math.round(zone.levels.reduce((s, l) => s + l.finalScore, 0) / zone.levels.length);
    const avgStars = (zone.levels.reduce((s, l) => s + l.stars, 0) / zone.levels.length).toFixed(1);
    const avgSPM = Math.round(zone.levels.reduce((s, l) => s + l.scorePerMove, 0) / zone.levels.length);
    console.log(`  ${zone.name}:`);
    console.log(`    Pass rate: ${zonePass}/${zone.levels.length}`);
    console.log(`    Avg score: ${avgScore} | Avg stars: ${avgStars} | Avg score/move: ${avgSPM}`);
  }

  // Score vs target
  console.log('\n-- SCORE vs TARGET --\n');
  for (const m of allMetrics) {
    const ratio = m.scoreTarget > 0 ? (m.finalScore / m.scoreTarget * 100).toFixed(0) : 'N/A';
    const threeStarRatio = m.starThresholds[2] > 0 ? (m.finalScore / m.starThresholds[2] * 100).toFixed(0) : 'N/A';
    console.log(`  Lvl ${String(m.levelId).padStart(2)}: ${ratio}% of 1-star | ${threeStarRatio}% of 3-star | ${m.passed ? 'PASS' : 'FAIL'}`);
  }

  // 3-Star ease validation
  console.log('\n-- 3-STAR EASE VALIDATION (max 8 spare moves allowed) --\n');
  const tooEasyLevels: { levelId: number; spare: number }[] = [];
  for (const m of allMetrics) {
    if (m.extraMovesAt3Star >= 0) {
      if (m.extraMovesAt3Star > 8) {
        console.log(`  ! Lvl ${String(m.levelId).padStart(2)}: TOO EASY - ${m.extraMovesAt3Star} spare moves (max 8 allowed)`);
        tooEasyLevels.push({ levelId: m.levelId, spare: m.extraMovesAt3Star });
      } else {
        console.log(`  Lvl ${String(m.levelId).padStart(2)}: OK - ${m.extraMovesAt3Star} spare moves at 3-star`);
      }
    } else {
      console.log(`  Lvl ${String(m.levelId).padStart(2)}: 3-star not reached`);
    }
  }
  if (tooEasyLevels.length > 0) {
    console.log(`\n  WARNING: ${tooEasyLevels.length} level(s) flagged as too easy for 3-star achievement`);
  } else {
    console.log('\n  All levels within acceptable 3-star difficulty range');
  }

  // Difficulty progression
  console.log('\n-- DIFFICULTY PROGRESSION --\n');
  let prevSPM = Infinity;
  let issues = 0;
  for (const m of allMetrics) {
    const requiredSPM = m.movesLimit > 0 ? Math.round(m.scoreTarget / m.movesLimit) : 0;
    const margin = m.scorePerMove - requiredSPM;
    const easier = m.levelId > 1 && m.scorePerMove > prevSPM * 1.2;
    if (easier) {
      console.log(`  ! Level ${m.levelId} may be EASIER than Level ${m.levelId - 1}`);
      issues++;
    }
    console.log(`  Lvl ${String(m.levelId).padStart(2)}: Need ${requiredSPM} pts/move, Got ${m.scorePerMove} pts/move, Margin: ${margin >= 0 ? '+' : ''}${margin}`);
    prevSPM = m.scorePerMove;
  }

  const passRate = (allMetrics.filter(m => m.passed).length / allMetrics.length * 100).toFixed(0);
  console.log(`\n  Overall: ${passRate}% pass rate | ${issues} difficulty regressions`);
  console.log('\n' + '='.repeat(100));
}
