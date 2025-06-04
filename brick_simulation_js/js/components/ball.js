/**
 * Ball.js
 * Represents the ball in the game
 */
import { detectPaddleCollision, handlePaddleCollision } from '../utils/collision.js';

export default class Ball {
    /**
     * Create a ball
     * @param {number} gameWidth - Width of the game area
     * @param {number} gameHeight - Height of the game area
     * @param {object} paddle - Reference to the paddle object
     */
    constructor(gameWidth, gameHeight, paddle) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.paddle = paddle;
        this.radius = 8;
        this.initialSpeed = 5; // Base speed for calculating new speeds after collisions
        
        this.reset();
    }
    
    /**
     * Reset the ball to its starting position
     */
    reset() {
        this.position = {
            x: this.gameWidth / 2,
            y: this.gameHeight / 2
        };
        
        // Randomize initial launch angle (between -45 and +45 degrees)
        const angle = (Math.random() * 90 - 45) * Math.PI / 180;
        this.speed = {
            x: this.initialSpeed * Math.sin(angle),
            y: -this.initialSpeed * Math.cos(angle)
        };
    }
    
    /**
     * Draw the ball on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    draw(ctx) {
        ctx.fillStyle = '#FF3860';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    
    /**
     * Update the ball's position and handle collisions
     * @param {number} deltaTime - Time passed since the last update
     */
    update(deltaTime) {
        if (!deltaTime) return;
        
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        
        // Wall collision detection (left and right)
        if (this.position.x - this.radius < 0 || 
            this.position.x + this.radius > this.gameWidth) {
            this.speed.x = -this.speed.x;
            // Ensure the ball stays within bounds
            if (this.position.x - this.radius < 0) {
                this.position.x = this.radius;
            } else if (this.position.x + this.radius > this.gameWidth) {
                this.position.x = this.gameWidth - this.radius;
            }
        }
        
        // Wall collision detection (top)
        if (this.position.y - this.radius < 0) {
            this.speed.y = -this.speed.y;
            this.position.y = this.radius; // Ensure ball stays within bounds
        }
        
        // Ball falls below bottom edge - reset ball
        if (this.position.y + this.radius > this.gameHeight) {
            this.reset();
        }
        
        // Paddle collision detection
        if (detectPaddleCollision(this, this.paddle)) {
            handlePaddleCollision(this, this.paddle);
        }
    }
}
