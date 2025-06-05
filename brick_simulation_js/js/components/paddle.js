/**
 * Paddle.js
 * Represents the player-controlled paddle in the game
 */
export default class Paddle {
    /**
     * Create a paddle
     * @param {number} gameWidth - Width of the game area
     * @param {number} gameHeight - Height of the game area
     */
    constructor(gameWidth, gameHeight) {
        // Base dimensions (will be scaled based on canvas size)
        this.baseWidth = 100;
        this.baseHeight = 20;
        this.baseMaxSpeed = 7;
        
        // Current dimensions
        this.width = this.baseWidth;
        this.height = this.baseHeight;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        
        // Position paddle at the bottom center of the screen
        this.position = {
            x: gameWidth / 2 - this.width / 2,
            y: gameHeight - this.height - 10
        };
        
        this.speed = 0;
        this.maxSpeed = this.baseMaxSpeed;
        this.scaleFactor = 1;
    }
    
    /**
     * Move the paddle to the left
     */
    moveLeft() {
        this.speed = -this.maxSpeed;
    }
    
    /**
     * Move the paddle to the right
     */
    moveRight() {
        this.speed = this.maxSpeed;
    }
    
    /**
     * Stop the paddle movement
     */
    stop() {
        this.speed = 0;
    }
    
    /**
     * Draw the paddle on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    draw(ctx) {
        ctx.fillStyle = '#0095DD';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    
    /**
     * Resize the paddle when the canvas size changes
     * @param {number} gameWidth - New game width
     * @param {number} gameHeight - New game height
     * @param {number} scaleFactor - Scale factor to apply to paddle dimensions
     */
    resize(gameWidth, gameHeight, scaleFactor) {
        // Store the old position ratio (where was the paddle relative to screen width)
        const positionRatio = this.position.x / this.gameWidth;
        
        // Update game dimensions
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.scaleFactor = scaleFactor;
        
        // Scale paddle dimensions
        this.width = this.baseWidth * scaleFactor;
        this.height = this.baseHeight * scaleFactor;
        this.maxSpeed = this.baseMaxSpeed * scaleFactor;
        
        // Update position based on new dimensions
        this.position = {
            x: positionRatio * gameWidth, // Maintain relative x-position
            y: gameHeight - this.height - (10 * scaleFactor) // Keep at bottom with scaled padding
        };
        
        // Ensure paddle stays within bounds after resize
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > this.gameWidth) {
            this.position.x = this.gameWidth - this.width;
        }
    }
    
    /**
     * Reset the paddle to its initial state with updated dimensions
     * @param {number} gameWidth - Current game width
     * @param {number} gameHeight - Current game height
     * @param {number} scaleFactor - Current scale factor
     */
    reset(gameWidth, gameHeight, scaleFactor) {
        // Update dimensions
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.scaleFactor = scaleFactor;
        
        // Reset paddle dimensions
        this.width = this.baseWidth * scaleFactor;
        this.height = this.baseHeight * scaleFactor;
        
        // Reset paddle position to bottom center
        this.position = {
            x: gameWidth / 2 - this.width / 2,
            y: gameHeight - this.height - (10 * scaleFactor)
        };
        
        // Reset movement
        this.speed = 0;
        this.maxSpeed = this.baseMaxSpeed * scaleFactor;
    }
    
    /**
     * Update the paddle's position based on its speed
     * @param {number} deltaTime - Time passed since the last update
     */
    update(deltaTime) {
        if (!deltaTime) return;
        
        this.position.x += this.speed;
        
        // Boundary detection - don't let paddle move off screen
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > this.gameWidth) {
            this.position.x = this.gameWidth - this.width;
        }
    }
}
