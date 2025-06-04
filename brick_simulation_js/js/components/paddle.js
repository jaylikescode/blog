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
        this.width = 100;
        this.height = 20;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        
        // Position paddle at the bottom center of the screen
        this.position = {
            x: gameWidth / 2 - this.width / 2,
            y: gameHeight - this.height - 10
        };
        
        this.speed = 0;
        this.maxSpeed = 7;
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
