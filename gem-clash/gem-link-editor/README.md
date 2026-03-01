# Gem Link Design Editor

A visual design editor for the Gem Link match-3 game.

## Features

### Per-Screen Component Sizing
Each screen (Menu, Gameplay, Shop, Levels) maintains its own slider values. Button sizes on Menu can be different from Gameplay, etc.

### Screens
- **Menu**: Logo, gem preview, Play/Shop buttons, Free Gift banner
- **Gameplay**: HUD bar, game board, booster tray
- **Shop**: Shop title, product cards
- **Levels**: Level title, level grid

### Component Size Controls
- Free Gift Banner: Width, Height
- Game Board: Width, Height, Padding, Columns, Rows
- HUD Bar: Height
- Boosters: Size
- Shop Cards: Height
- Buttons: Width, Height

### Visual Editing
- Click any element to select
- Drag resize handles to resize
- Drag element to move
- Properties panel on right for precise values

### Asset Library
- Upload images (PNG, JPG, SVG)
- Drag assets onto preview to place them
- Assets appear as new elements

### Colors
- Background gradient (2 colors)
- Accent color
- Button color

### Export
- Exports JSON with all element positions, sizes, and properties
- Per-screen state included

## Usage

1. Open `design-editor.html` in a browser
2. Select a screen using the tabs
3. Adjust sliders or drag elements
4. Switch screens - values are saved per-screen
5. Click "Export Design" to download JSON

## Files

- `design-editor.html` - Main editor (self-contained)
- `README.md` - This file
