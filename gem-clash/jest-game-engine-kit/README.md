# Jest Game Design Engine

A comprehensive visual design engine for creating Jest platform games.

## Features

### Project Management
- **Editable project name** - Double-click to rename
- **Save to localStorage** - Persists between sessions
- **Export to JSON** - Download full project file

### Screen Management
- **Multiple screens** - Add unlimited screens
- **Tab navigation** - Click to switch screens
- **Per-screen elements** - Each screen maintains its own components
- **Per-screen background color** - Different background per screen
- **Rename screens** - Double-click tab to rename
- **Delete screens** - X button on hover

### Component Types

#### Buttons
- Shape options: Circle, Square, Rectangle, Oval
- Upload image to replace shape (black backgrounds = transparent)
- Width/Height sliders
- Trigger behavior textarea (e.g., "On click: open shop")
- Hitbox = entire outline

#### UI Elements
- Decorative non-interactive elements
- Same controls as buttons (no trigger)

#### Text
- Custom content input
- Font size slider
- Color picker
- Font file upload (.ttf, .otf, .woff, .woff2)

#### Counters
- Initial value input
- Display format (e.g., "{value}" becomes "1000")
- Behavior description
- Background and text colors

#### Game Board
- Grid rows/columns controls
- Cell size slider
- Mechanics description textarea
- Visual grid preview

### All Components Have
- Width/Height sliders
- X/Y position inputs
- Click and drag to move
- Resize handles (corners)
- Delete button
- Unique auto-generated ID
- Double-click label to rename

### Claude Code Prompt Window
In the Colors section, type natural language prompts like:
- "add a lightning strike effect color"
- "add a health bar color control"

The engine parses the prompt and adds a new color row.

### Asset Library
- Upload PNG, JPG, SVG
- Click asset to apply to selected button/UI element
- Pure black (#000000) = transparent
- Visual grid of uploaded assets

### Preview Panel
- Phone-sized preview (390x600)
- Phone frame with notch
- Dot grid background
- Click to select, drag to move
- Resize handles when selected

### Properties Panel (Right)
- Position (X, Y)
- Size (Width, Height)
- Component-specific properties
- Element ID display

### Export Format
```json
{
  "projectName": "My Game",
  "screens": [
    {
      "id": "screen_1",
      "name": "Main Menu",
      "backgroundColor": "#1a1a2e",
      "elements": [
        {
          "id": "elem_1",
          "type": "button",
          "shape": "rectangle",
          "x": 100,
          "y": 200,
          "width": 180,
          "height": 50,
          "triggerBehavior": "On click: start game"
        }
      ]
    }
  ],
  "colors": [...],
  "assets": [...]
}
```

## Usage

1. Open `jest-game-engine.html` in a browser
2. Double-click "Untitled Game" to name your project
3. Add screens using "+ Add Screen"
4. Add components from the left panel
5. Drag and resize on the preview
6. Set trigger behaviors for buttons
7. Export JSON when done

## Files

- `jest-game-engine.html` - Main engine (self-contained)
- `README.md` - This file

## Technical Notes

- Single HTML file with embedded CSS/JS
- No external dependencies
- localStorage persistence
- ~2,600 lines of code
- Dark theme with purple accents
