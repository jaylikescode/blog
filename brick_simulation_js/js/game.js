import Paddle from './components/paddle.js';
import Ball from './components/ball.js';
import Brick from './components/brick.js';
import { detectBrickCollision, handleBrickCollision } from './utils/collision.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the canvas and get the rendering context
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Failed to get 2D context");
        return;
    }
    
    // Set canvas dimensions
    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 600;
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    // Initialize game objects
    const paddle = new Paddle(GAME_WIDTH, GAME_HEIGHT);
    const ball = new Ball(GAME_WIDTH, GAME_HEIGHT, paddle);
    
    // Brick grid configuration
    const brickRowCount = 5;
    const brickColumnCount = 9;
    const brickWidth = 80;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 60;
    const brickOffsetLeft = 30;
    
    // Brick colors for alternating rows
    const brickColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C'];
    
    // Create bricks array
    let bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            // Use color based on row
            const color = brickColors[r % brickColors.length];
            bricks[c][r] = new Brick(brickX, brickY, brickWidth, brickHeight, color);
        }
    }
    
    // Input Handler
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a': // Adding 'a' key as alternative
                paddle.moveLeft();
                break;
            case 'ArrowRight':
            case 'd': // Adding 'd' key as alternative
                paddle.moveRight();
                break;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                if (paddle.speed < 0) paddle.stop();
                break;
            case 'ArrowRight':
            case 'd':
                if (paddle.speed > 0) paddle.stop();
                break;
        }
    });
    
    // NOTE: detectBrickCollision and handleBrickCollision functions have been moved to utils/collision.js
    // and are now imported at the top of the file
    
    let lastTime = 0;
    
    /**
     * Main game loop
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     */
    function gameLoop(timestamp) {
        // Calculate time elapsed since last frame
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        // Clear canvas
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Update game objects
        paddle.update(deltaTime);
        ball.update(deltaTime);
        
        // Check ball collision with bricks
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const brick = bricks[c][r];
                if (brick.active && detectBrickCollision(ball, brick)) {
                    // Using the imported collision detection utilities
                    const hitSide = handleBrickCollision(ball, brick);
                    
                    // Future enhancement: We could use hitSide for visual effects or scoring modifiers
                }
            }
        }
        
        // Draw all game objects
        paddle.draw(ctx);
        ball.draw(ctx);
        
        // Draw all active bricks
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r].draw(ctx);
            }
        }
        
        // Continue the game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
    
    console.log("Classic Bricks JS initialized. Phase 1 implementation complete.");
});
