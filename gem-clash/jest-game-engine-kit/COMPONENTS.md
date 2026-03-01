# Component Reference

## Button Component
Interactive element with hitbox.

| Property | Type | Description |
|----------|------|-------------|
| shape | string | circle, square, rectangle, oval |
| width | number | Width in pixels |
| height | number | Height in pixels |
| x | number | X position from left |
| y | number | Y position from top |
| imageUrl | string | Optional image (replaces shape) |
| triggerBehavior | string | What happens on interaction |

### Trigger Behavior Examples
```
On click: open shop
On click: start level
Long press: show tooltip
On click: play sound "click.mp3"
On click: navigate to screen "Settings"
```

---

## UI Element Component
Decorative, non-interactive element.

| Property | Type | Description |
|----------|------|-------------|
| shape | string | circle, square, rectangle, oval |
| width | number | Width in pixels |
| height | number | Height in pixels |
| x | number | X position from left |
| y | number | Y position from top |
| imageUrl | string | Optional image |

---

## Text Component
Display text with custom styling.

| Property | Type | Description |
|----------|------|-------------|
| content | string | Text to display |
| fontSize | number | Font size in pixels |
| color | string | Hex color code |
| fontFamily | string | Font name (if custom uploaded) |
| width | number | Container width |
| height | number | Container height |
| x | number | X position |
| y | number | Y position |

---

## Counter Component
Dynamic number display.

| Property | Type | Description |
|----------|------|-------------|
| initialValue | number | Starting value |
| format | string | Display format (e.g., "{value}") |
| behavior | string | Description of counter logic |
| backgroundColor | string | Background color |
| textColor | string | Text color |
| width | number | Width in pixels |
| height | number | Height in pixels |
| x | number | X position |
| y | number | Y position |

### Format Examples
```
{value}           → 1000
${value}          → $1000
{value} pts       → 1000 pts
Level {value}     → Level 1000
```

---

## Game Board Component
Grid-based game area.

| Property | Type | Description |
|----------|------|-------------|
| rows | number | Number of rows |
| cols | number | Number of columns |
| cellSize | number | Size of each cell |
| mechanics | string | Description of gameplay |
| width | number | Total width |
| height | number | Total height |
| x | number | X position |
| y | number | Y position |

### Mechanics Examples
```
Match-3 puzzle: Swap adjacent gems to match 3+
Tap game: Tap cells to clear before timer ends
Memory: Flip cards to find matching pairs
```

---

## Color Variables

| ID | Label | Default | Usage |
|----|-------|---------|-------|
| bg | Background | #1a1a2e | Screen background |
| accent | Accent | #7c3aed | Highlights, selected states |
| button | Buttons | #4f46e5 | Button backgrounds |
| text | Text | #ffffff | Primary text |
| secondary | Secondary | #6b7280 | Secondary text, borders |

Custom colors can be added via the prompt window.

---

## Asset Handling

### Supported Formats
- PNG (recommended for transparency)
- JPG
- SVG

### Transparency
Pure black pixels (#000000) are treated as transparent. Use this for sprites with black backgrounds.

### Asset Library
Uploaded assets appear in the Asset Library section. Click an asset while a button/UI element is selected to apply it.
