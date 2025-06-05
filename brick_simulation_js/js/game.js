import Paddle from './components/paddle.js';
import Ball from './components/ball.js';
import Brick from './components/brick.js';
import { detectBrickCollision, handleBrickCollision } from './utils/collision.js';
import { setupResizeHandler, getScaleFactor, setupTouchControls, checkIframe } from './utils/responsive.js';

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
    
    // Base game dimensions (reference size)
    const BASE_WIDTH = 800;
    const BASE_HEIGHT = 600;
    
    // Current actual dimensions (will be updated on resize)
    let GAME_WIDTH = BASE_WIDTH;
    let GAME_HEIGHT = BASE_HEIGHT;
    
    // Scale factor for game elements relative to base size
    let scaleFactor = 1;
    
    // Check if game is running in an iframe
    const isInIframe = checkIframe();
    if (isInIframe) {
        document.body.classList.add('in-iframe');
        document.querySelector('.game-container').classList.add('in-iframe');
    }
    
    // Function to resize canvas and update game dimensions
    function resizeCanvas() {
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Set canvas display size to match container's CSS size
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerHeight}px`;
        
        // Update canvas internal dimensions
        GAME_WIDTH = containerWidth;
        GAME_HEIGHT = containerHeight;
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        
        // Calculate scale factor based on base dimensions
        scaleFactor = getScaleFactor(BASE_WIDTH, BASE_HEIGHT, GAME_WIDTH, GAME_HEIGHT);
        
        // Update game elements with new dimensions and scale
        if (paddle) paddle.resize(GAME_WIDTH, GAME_HEIGHT, scaleFactor);
        if (ball) ball.resize(GAME_WIDTH, GAME_HEIGHT, scaleFactor);
        
        // Only rebuild bricks if they exist
        if (bricks && bricks.length > 0) {
            // Preserve brick state during resize
            rebuildBricks(true);
        }
        
        // Log resize information
        console.log(`Game resized: ${GAME_WIDTH}x${GAME_HEIGHT}, Scale Factor: ${scaleFactor.toFixed(2)}`);
        
        // Update touch controls position if they exist
        const touchControls = document.querySelector('.touch-controls');
        if (touchControls) {
            const controlsHeight = Math.min(80 * scaleFactor, 120); // Scale but cap at reasonable size
            touchControls.style.height = `${controlsHeight}px`;
        }
    }
    
    // Initialize game objects
    const paddle = new Paddle(GAME_WIDTH, GAME_HEIGHT);
    const ball = new Ball(GAME_WIDTH, GAME_HEIGHT, paddle);
    
    // Brick grid configuration
    const brickRowCount = 5;
    const brickColumnCount = 9;
    // Base brick sizes that will be scaled
    const baseBrickWidth = 80;
    const baseBrickHeight = 20;
    const baseBrickPadding = 10;
    const baseBrickOffsetTop = 60;
    const baseBrickOffsetLeft = 30;
    
    // Current scaled brick dimensions
    let brickWidth = baseBrickWidth;
    let brickHeight = baseBrickHeight;
    let brickPadding = baseBrickPadding;
    let brickOffsetTop = baseBrickOffsetTop;
    let brickOffsetLeft = baseBrickOffsetLeft;
    
    // Brick colors for alternating rows
    const brickColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C'];
    
    // Create bricks array
    let bricks = [];
    
    // Function to rebuild bricks with current scale factor
    function rebuildBricks(preserveState = false) {
        // Scale brick dimensions based on current scale factor
        brickWidth = baseBrickWidth * scaleFactor;
        brickHeight = baseBrickHeight * scaleFactor;
        brickPadding = baseBrickPadding * scaleFactor;
        brickOffsetTop = baseBrickOffsetTop * scaleFactor;
        
        // Calculate the total grid width and center it in the canvas
        const totalGridWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
        brickOffsetLeft = (GAME_WIDTH - totalGridWidth) / 2;
        
        // Store active state of existing bricks if needed
        const brickActiveState = [];
        if (preserveState && bricks.length > 0) {
            for (let c = 0; c < brickColumnCount; c++) {
                brickActiveState[c] = [];
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c] && bricks[c][r]) {
                        brickActiveState[c][r] = bricks[c][r].active;
                    } else {
                        brickActiveState[c][r] = true; // Default to active
                    }
                }
            }
        }
        
        // Create or resize existing bricks
        const needNewArray = !preserveState || bricks.length === 0;
        
        if (needNewArray) {
            // Clear existing bricks
            bricks = [];
        }
        
        // Rebuild bricks with new dimensions
        for (let c = 0; c < brickColumnCount; c++) {
            if (needNewArray) {
                bricks[c] = [];
            }
            
            for (let r = 0; r < brickRowCount; r++) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                const color = brickColors[r % brickColors.length];
                
                if (needNewArray) {
                    // Create new brick
                    bricks[c][r] = new Brick(brickX, brickY, brickWidth, brickHeight, color, scaleFactor);
                } else {
                    // Resize existing brick, preserving its active state
                    bricks[c][r].resize(brickX, brickY, brickWidth, brickHeight, scaleFactor);
                    
                    // Restore active state if preserving
                    if (preserveState) {
                        bricks[c][r].active = brickActiveState[c][r];
                    }
                }
            }
        }
    }
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
    
    // Initial creation of bricks
    rebuildBricks();
    
    // Input Handlers for keyboard
    function setupKeyboardControls() {
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
                case ' ': // Space to restart if game over
                    if (gameState === 'gameover') resetGame();
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
    }
    
    // Setup all event handlers
    setupKeyboardControls();
    
    // Check if device has touch capability
    const hasTouchCapability = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Setup touch controls for mobile devices
    if (hasTouchCapability) {
        setupTouchControls(paddle, document.querySelector('.game-controls'));
    }
    
    // Setup resize handler
    setupResizeHandler(resizeCanvas);
    
    // Initial resize to set up canvas dimensions
    resizeCanvas();
    
    // NOTE: detectBrickCollision and handleBrickCollision functions have been moved to utils/collision.js
    // and are now imported at the top of the file
    
    // Game state management
    let gameState = 'playing'; // 'playing', 'paused', 'gameover'
    let score = 0;
    let lives = 3;
    
    function resetGame() {
        score = 0;
        lives = 3;
        gameState = 'playing';
        
        // Reset paddle and ball
        paddle.reset(GAME_WIDTH, GAME_HEIGHT, scaleFactor);
        ball.reset(GAME_WIDTH, GAME_HEIGHT, paddle);
        
        // Rebuild bricks
        rebuildBricks();
    }
    
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
        
        // Apply proper scaling to rendering context
        ctx.save();
        
        // Update and draw based on game state
        if (gameState === 'playing') {
            // Update game objects
            paddle.update(deltaTime);
            ball.update(deltaTime);
            
            // Check for ball going out of bounds
            if (ball.position.y > GAME_HEIGHT) {
                lives--;
                if (lives <= 0) {
                    gameState = 'gameover';
                } else {
                    // Reset ball position but keep bricks and score
                    ball.reset(GAME_WIDTH, GAME_HEIGHT, paddle);
                }
            }
            
            // Check ball collision with bricks
            let allBricksDestroyed = true;
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    const brick = bricks[c][r];
                    
                    // Skip inactive bricks
                    if (!brick.active) continue;
                    
                    allBricksDestroyed = false; // At least one brick is still active
                    
                    if (detectBrickCollision(ball, brick)) {
                        // Using the imported collision detection utilities
                        const hitSide = handleBrickCollision(ball, brick);
                        score += 10; // Increase score when brick is hit
                    }
                }
            }
            
            // Check if all bricks are destroyed for win condition
            if (allBricksDestroyed) {
                // Could implement a level completion or win state here
                rebuildBricks();
                score += 50; // Bonus for completing a level
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
        
        // Draw UI elements with proper scaling
        drawUI();
        
        ctx.restore();
        
        // Continue the game loop
        requestAnimationFrame(gameLoop);
    }
    
    /**
     * Draw UI elements like score, lives, and game state messages
     */
    function drawUI() {
        // Set font size scaled to canvas
        const fontSize = Math.max(16 * scaleFactor, 12);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'left';
        
        // Draw score
        ctx.fillText(`Score: ${score}`, 10, 20);
        
        // Draw lives
        ctx.textAlign = 'right';
        ctx.fillText(`Lives: ${lives}`, GAME_WIDTH - 10, 20);
        
        // Draw game over message if applicable
        if (gameState === 'gameover') {
            ctx.textAlign = 'center';
            ctx.font = `${fontSize * 2}px Arial`;
            ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2);
            
            ctx.font = `${fontSize}px Arial`;
            ctx.fillText('Press SPACE to play again', GAME_WIDTH / 2, GAME_HEIGHT / 2 + fontSize * 2);
        }
    }
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
    
    console.log("Classic Bricks JS initialized. Phase 1 implementation complete.");
});
