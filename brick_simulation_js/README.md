# Classic Bricks JS (JavaScript/HTML5 Breakout/Arkanoid)

A classic brick-breaking game, inspired by Breakout and Arkanoid, implemented using JavaScript and the HTML5 Canvas API. This project aims to recreate the core mechanics of the original arcade games for modern web browsers, with a focus on clean code, modularity, and phased development.

This game is being developed for direct browser play and eventual integration into a personal blog.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Project Status](#project-status)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
- [How to Play](#how-to-play)
- [Controls](#controls)
- [Development Plan](#development-plan)
- [Requirements](#requirements)
- [Future Enhancements](#future-enhancements)

## Overview

"Classic Bricks JS" is a 2D arcade game where the player controls a paddle to bounce a ball and destroy bricks arranged at the top of the screen. The primary goal is to clear all breakable bricks to advance through levels. The game is built entirely with vanilla JavaScript and HTML5 Canvas, without external game engines or libraries, to ensure it's lightweight and to provide a deep dive into game development fundamentals.

## Features

- **Paddle Control**: Smooth paddle movement controlled by keyboard input.
- **Ball Physics**: Basic ball movement, bouncing off walls and the paddle.
- **Brick System**: Multiple bricks arranged in a grid, with collision detection and destruction.
- **Scoring System**: Points awarded for destroying bricks (to be implemented).
- **Lives System**: Player loses a life if the ball goes past the paddle (to be implemented).
- **Canvas Rendering**: All game elements (paddle, ball, bricks) are drawn using the HTML5 Canvas API. Phase 1 focuses on Canvas-only rendering, with image assets planned for a later phase.
- **Modular Code**: Game components (Paddle, Ball, Brick) are organized into separate JavaScript modules.

## Project Status

This project is currently under active development. Core mechanics such as paddle movement, ball movement, wall collisions, and basic brick rendering are implemented.

Key next steps include:
- Ball-brick collision detection and brick destruction.
- Scoring and lives system.
- Multiple levels and increasing difficulty.

For a detailed breakdown of development phases, see the [Development Plan](#development-plan).

## Technology Stack

-   **Programming Language**: JavaScript (ES6+)
-   **Core Technology**: HTML5 (Canvas API for rendering)
-   **Styling**: CSS3
-   **Version Control**: Git
-   **No external game engines or libraries** are used in the core implementation to keep it lightweight and focus on fundamental concepts.

## Directory Structure

```
brick_simulation_js/
├── index.html             // Main HTML file, entry point for the game
├── css/
│   └── style.css          // CSS styles for the game page
├── js/
│   ├── game.js            // Main game loop, state management, and rendering orchestration
│   ├── components/        // Reusable game objects
│   │   ├── paddle.js      // Paddle class and logic
│   │   ├── ball.js        // Ball class and logic
│   │   ├── brick.js       // Brick class and logic
│   │   └── (item.js)      // (Planned) Item class for power-ups
│   └── utils/
│       ├── (collision.js) // (Planned) Collision detection utilities
│       └── (helpers.js)   // (Planned) General helper functions
├── assets/                // For images and sounds (to be used in later phases)
│   ├── images/
│   └── sounds/
├── README.md              // This file
├── requirement.md         // Detailed functional and non-functional requirements
└── development_plan.md    // Phased development plan and timeline
```

## How to Play

1.  Clone this repository or download the project files.
2.  Open the `index.html` file in a modern web browser (e.g., Chrome, Firefox, Safari, Edge).
3.  The game will load in the canvas, and you can start playing.

## Controls

-   **Move Paddle Left**: Left Arrow Key or 'A' Key
-   **Move Paddle Right**: Right Arrow Key or 'D' Key
-   **(Planned) Launch Ball**: Spacebar or Enter Key
-   **(Planned) Pause Game**: 'P' Key

## Development Plan

A detailed, phased development plan is available in `development_plan.md`. This plan outlines each stage of development, from initial setup to final integration, including the decision to defer image and sound asset usage until core gameplay mechanics are complete using Canvas-only rendering.

## Requirements

Detailed functional and non-functional requirements for this game are documented in `requirement.md`.

## Future Enhancements

(Based on `requirement.md` and `development_plan.md`)

-   **Multiple Levels**: Different brick layouts and increasing difficulty.
-   **Power-ups/Items**: Special items dropping from bricks (e.g., paddle extend, multi-ball, slow ball).
-   **Sound Effects and Music**: Adding audio feedback for game events.
-   **Image Assets**: Replacing Canvas-drawn elements with sprite images for a more polished look.
-   **Advanced UI**: Start screens, game over screens, level transitions with Canvas.
-   **Mobile Responsiveness**: Adapting controls and layout for touch devices.
-   **Blog Integration**: Embedding the final game into a personal blog.

