#!/usr/bin/env python3
"""
Gem Link -- Asset Preparation Script
=====================================
Copies existing high-quality rendered PNGs to their expected asset-key filenames
and generates placeholder PNGs for any missing assets.

Expected directory structure after running:
  public/assets/gems/gem_heart.png      (128x128 RGBA)
  public/assets/gems/gem_diamond.png    (128x128 RGBA)
  public/assets/gems/gem_square.png     (128x128 RGBA)
  public/assets/gems/gem_triangle.png   (128x128 RGBA)
  public/assets/gems/gem_circle.png     (128x128 RGBA)
  public/assets/gems/gem_star.png       (128x128 RGBA)
  public/assets/ui/ui_bomb.png          (64x64  RGBA)
  public/assets/ui/ui_rainbow.png       (64x64  RGBA)
  public/assets/ui/ui_coin.png          (64x64  RGBA)
  public/assets/ui/ui_star.png          (64x64  RGBA)
  public/assets/ui/ui_hammer.png        (64x64  RGBA)
  public/assets/ui/ui_chest_closed.png  (128x128 RGBA)
  public/assets/ui/ui_chest_open.png    (128x128 RGBA)
  public/assets/ui/ui_heart.png         (64x64  RGBA)
  public/assets/ui/ui_gem.png           (128x128 RGBA)
  public/assets/ui/ui_logo.png          (256x128 RGBA)
  public/assets/ui/circle_rainbow.png   (128x128 RGBA)
"""

import os
import shutil
import math
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEMS_DIR = os.path.join(PROJECT_ROOT, "public", "assets", "gems")
UI_DIR = os.path.join(PROJECT_ROOT, "public", "assets", "ui")

os.makedirs(GEMS_DIR, exist_ok=True)
os.makedirs(UI_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. Copy / rename existing assets to match expected texture keys
# ---------------------------------------------------------------------------
# Format: (source_relative_to_public/assets, destination_relative_to_public/assets)
RENAME_MAP = [
    # Gems
    ("gems/heart.png",           "gems/gem_heart.png"),
    ("gems/diamond_blue.png",    "gems/gem_diamond.png"),
    ("gems/square.png",          "gems/gem_square.png"),
    ("gems/triangle.png",        "gems/gem_triangle.png"),
    ("gems/diamond_purple.png",  "gems/gem_circle.png"),   # purple gem for "circle" slot
    ("gems/circle_rainbow.png",  "ui/circle_rainbow.png"), # rainbow circle goes to UI dir
    # UI
    ("ui/bomb.png",              "ui/ui_bomb.png"),
    ("ui/rainbow.png",           "ui/ui_rainbow.png"),
    ("ui/coin.png",              "ui/ui_coin.png"),
    ("ui/star.png",              "ui/ui_star.png"),
    ("ui/hammer.png",            "ui/ui_hammer.png"),
    ("ui/chest_closed.png",      "ui/ui_chest_closed.png"),
    ("ui/chest_open_full.png",   "ui/ui_chest_open.png"),
    ("ui/gem_cluster.png",       "ui/ui_gem.png"),
    ("ui/logo.png",              "ui/ui_logo.png"),
]

ASSETS_BASE = os.path.join(PROJECT_ROOT, "public", "assets")

print("[AssetPrep] Starting asset preparation...")

copied = 0
skipped = 0
for src_rel, dst_rel in RENAME_MAP:
    src = os.path.join(ASSETS_BASE, src_rel)
    dst = os.path.join(ASSETS_BASE, dst_rel)
    if not os.path.exists(src):
        print(f"[AssetPrep] WARNING: Source not found, skipping: {src_rel}")
        skipped += 1
        continue
    shutil.copy2(src, dst)
    print(f"[AssetPrep] Copied {src_rel} -> {dst_rel}")
    copied += 1

print(f"[AssetPrep] Copied {copied} assets, skipped {skipped}")

# ---------------------------------------------------------------------------
# 2. Generate missing assets
# ---------------------------------------------------------------------------
# Missing: gem_star (white/silver star gem, 128x128)
#          ui_heart (red heart icon, 64x64)

def draw_star(draw, cx, cy, outer_r, inner_r, points, fill_color):
    """Draw a filled star polygon."""
    coords = []
    for i in range(points * 2):
        angle = math.radians(-90 + i * 180 / points)
        r = outer_r if i % 2 == 0 else inner_r
        coords.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(coords, fill=fill_color)


def draw_heart(draw, cx, cy, size, fill_color):
    """Draw a filled heart shape using two circles and a triangle."""
    r = size * 0.3
    offset_x = size * 0.22
    offset_y = -size * 0.08
    # Left circle
    draw.ellipse(
        [cx - offset_x - r, cy + offset_y - r, cx - offset_x + r, cy + offset_y + r],
        fill=fill_color,
    )
    # Right circle
    draw.ellipse(
        [cx + offset_x - r, cy + offset_y - r, cx + offset_x + r, cy + offset_y + r],
        fill=fill_color,
    )
    # Bottom triangle
    tip_y = cy + size * 0.45
    left_x = cx - offset_x - r * 0.7
    right_x = cx + offset_x + r * 0.7
    top_y = cy + offset_y
    draw.polygon([(left_x, top_y), (right_x, top_y), (cx, tip_y)], fill=fill_color)
    # Fill gap rectangle
    draw.rectangle(
        [cx - offset_x, cy + offset_y - r * 0.3, cx + offset_x, cy + offset_y + r * 0.5],
        fill=fill_color,
    )


def generate_gem_star(path):
    """Generate a white/silver star gem placeholder, 128x128 RGBA."""
    size = 128
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = size // 2, size // 2

    # Outer glow circle (subtle)
    glow_r = 56
    draw.ellipse(
        [cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r],
        fill=(200, 200, 240, 40),
    )

    # Star body -- silver/white with slight blue tint
    draw_star(draw, cx, cy, outer_r=48, inner_r=22, points=5, fill_color=(220, 225, 255, 255))

    # Lighter inner star for depth
    draw_star(draw, cx - 2, cy - 2, outer_r=34, inner_r=16, points=5, fill_color=(240, 242, 255, 255))

    # Bright highlight
    draw_star(draw, cx - 4, cy - 5, outer_r=18, inner_r=9, points=5, fill_color=(255, 255, 255, 255))

    img.save(path, "PNG")
    print(f"[AssetPrep] Generated {os.path.relpath(path, ASSETS_BASE)}")


def generate_ui_heart(path):
    """Generate a red heart UI icon, 64x64 RGBA."""
    size = 64
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = size // 2, size // 2

    # Main heart -- bright red
    draw_heart(draw, cx, cy, size * 0.8, (255, 68, 102, 255))

    # Highlight heart -- lighter, offset up-left
    draw_heart(draw, cx - 2, cy - 3, size * 0.45, (255, 120, 140, 200))

    img.save(path, "PNG")
    print(f"[AssetPrep] Generated {os.path.relpath(path, ASSETS_BASE)}")


# Check and generate missing gems
gem_star_path = os.path.join(GEMS_DIR, "gem_star.png")
if not os.path.exists(gem_star_path):
    generate_gem_star(gem_star_path)
else:
    print(f"[AssetPrep] gem_star.png already exists, skipping generation")

# Check and generate missing UI
ui_heart_path = os.path.join(UI_DIR, "ui_heart.png")
if not os.path.exists(ui_heart_path):
    generate_ui_heart(ui_heart_path)
else:
    print(f"[AssetPrep] ui_heart.png already exists, skipping generation")

# ---------------------------------------------------------------------------
# 3. Verify all expected assets exist
# ---------------------------------------------------------------------------
print("\n[AssetPrep] === Verification ===")

EXPECTED = [
    ("gems/gem_heart.png", 128),
    ("gems/gem_diamond.png", 128),
    ("gems/gem_square.png", 128),
    ("gems/gem_triangle.png", 128),
    ("gems/gem_circle.png", 128),
    ("gems/gem_star.png", 128),
    ("ui/ui_bomb.png", 64),
    ("ui/ui_rainbow.png", 64),
    ("ui/ui_coin.png", 64),
    ("ui/ui_star.png", 64),
    ("ui/ui_hammer.png", 64),
    ("ui/ui_chest_closed.png", 128),
    ("ui/ui_chest_open.png", 128),
    ("ui/ui_heart.png", 64),
    ("ui/ui_gem.png", 128),
    ("ui/ui_logo.png", 256),
    ("ui/circle_rainbow.png", 128),
]

all_ok = True
total_bytes = 0
for rel, expected_w in EXPECTED:
    full = os.path.join(ASSETS_BASE, rel)
    if not os.path.exists(full):
        print(f"  MISSING: {rel}")
        all_ok = False
        continue
    img = Image.open(full)
    fsize = os.path.getsize(full)
    total_bytes += fsize
    w, h = img.size
    mode = img.mode
    status = "OK" if mode == "RGBA" else f"WARN mode={mode}"
    print(f"  {status}: {rel:40s}  {w}x{h}  {fsize/1024:.1f}KB  {mode}")

print(f"\n[AssetPrep] Total asset size: {total_bytes/1024:.1f}KB ({total_bytes/1024/1024:.2f}MB)")
if all_ok:
    print("[AssetPrep] All 17 expected assets present.")
else:
    print("[AssetPrep] ERROR: Some assets are missing!")
    exit(1)

print("[AssetPrep] Done.")
