# Bric Game (Python Breakout/Arkanoid)

A classic brick-breaking game implemented in Python with Pygame, designed to be run both locally and on the web via Pyodide.

![Bric Game Screenshot](assets/images/screenshot.png)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Development](#development)
- [Testing](#testing)
- [Graphics Customization](#graphics-customization)
- [Web Integration](#web-integration)
- [Directory Structure](#directory-structure)
- [Controls](#controls)
- [Extending the Game](#extending-the-game)

## Overview

Bric Game is a Python implementation of the classic Breakout/Arkanoid arcade game. The player controls a paddle at the bottom of the screen to bounce a ball and break bricks. The game features multiple levels, power-ups, and progressive difficulty.

## Features

- Simple, clean implementation using Python and Pygame
- Multiple game levels with different brick patterns
- Various brick types (normal, strong, unbreakable)
- Power-up items with different effects
- Extensible architecture for easy customization
- Web browser compatibility via Pyodide

## Development

### Requirements

- Python 3.6+
- Pygame

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd Bric_game
   ```

2. Install dependencies:
   ```
   pip install pygame
   ```

3. Run the game locally:
   ```
   python run_game.py
   ```

## Testing

Testing the game can be done in two ways:

1. **Local Testing**:
   Run the game directly with Python using the `run_game.py` script.
   ```
   python run_game.py
   ```

2. **Web Integration Testing**:
   To test the web integration:
   - Set up a local web server (e.g., using Python's built-in server)
   ```
   python -m http.server
   ```
   - Open your browser and navigate to `http://localhost:8000/`
   - Note: Web integration testing requires a modern browser with WebAssembly support

## Graphics Customization

The game is designed with a simple but extensible graphics system:

### Current Implementation
- All game elements are rendered using basic shapes (rectangles, circles)
- Different colors are used to distinguish between various game elements

### Adding Custom Graphics
1. **Create graphics assets**:
   - Place PNG or GIF files in the appropriate folders under `assets/images/`:
     - `paddle/`: Paddle graphics
     - `ball/`: Ball graphics
     - `bricks/`: Brick graphics (use naming pattern: `normal.png`, `strong.png`, etc.)
     - `items/`: Item graphics (use naming pattern: `extend.png`, `slow.png`, etc.)

2. **Automatic detection**:
   - The game's `SpriteManager` automatically detects and uses image files when present
   - If an image is not found, the game falls back to shape rendering
   - No code changes are needed when adding or updating images

3. **Recommended image sizes**:
   - Paddle: 100x20 pixels
   - Ball: 20x20 pixels
   - Bricks: 75x20 pixels
   - Items: 20x20 pixels

4. **Transparent backgrounds**:
   - Use PNG files with transparency for best results

## Web Integration

The game is designed to run in web browsers using Pyodide, which translates Python/Pygame code to JavaScript/WebAssembly.

### Embedding in a Blog

1. Copy the following files to your blog directory:
   - `index.html` (rename as needed)
   - `game.js`
   - `web_integration.py`
   - The entire `src` directory
   - The `assets` directory (if you have custom graphics)

2. Include the game in your blog by embedding an iframe or linking to the game page:
   ```html
   <iframe src="bric_game/index.html" width="820" height="620" frameborder="0"></iframe>
   ```

3. Ensure the Pyodide CDN script is properly loaded (already included in the provided HTML).

## Directory Structure

```
Bric_game/
├── assets/
│   ├── images/
│   │   ├── paddle/
│   │   ├── ball/
│   │   ├── bricks/
│   │   └── items/
│   ├── fonts/
│   └── sounds/
├── src/
│   ├── components/
│   │   ├── __init__.py
│   │   ├── ball.py
│   │   ├── brick.py
│   │   ├── game_object.py
│   │   ├── item.py
│   │   ├── level.py
│   │   └── paddle.py
│   ├── managers/
│   │   ├── __init__.py
│   │   ├── collision.py
│   │   └── sprite_manager.py
│   ├── ui/
│   │   ├── __init__.py
│   │   └── text.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── helpers.py
│   ├── __init__.py
│   ├── config.py
│   ├── game.py
│   └── main.py
├── development_plan.md
├── game.js
├── index.html
├── README.md
├── run_game.py
└── web_integration.py
```

## Controls

- **Left/Right Arrow Keys**: Move the paddle
- **Space**: Start game / Launch ball
- **P**: Pause / Resume game
- **Enter**: Restart after Game Over
- **Esc**: Quit game

## Extending the Game

### Adding New Levels
Modify or extend the `Level` class in `src/components/level.py` to add new brick patterns.

### Adding New Items
Add new items by extending the `Item` class in `src/components/item.py` and adding the corresponding effect in the `apply_effect` method.

### Customizing Difficulty
Adjust game parameters in `src/config.py` to change game difficulty, speeds, and other settings.
