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
        // Base dimensions that will be scaled
        this.baseRadius = 8;
        this.baseInitialSpeed = 5;
        
        // Current dimensions
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.paddle = paddle;
        this.radius = this.baseRadius;
        this.initialSpeed = this.baseInitialSpeed;
        this.scaleFactor = 1;
        
        this.reset();
    }
    
    /**
     * Reset the ball to its starting position
     * @param {number} gameWidth - Width of the game area
     * @param {number} gameHeight - Height of the game area
     * @param {object} paddle - Reference to the paddle object
     */
    reset(gameWidth, gameHeight, paddle) {
        // Update dimensions if provided
        if (gameWidth) this.gameWidth = gameWidth;
        if (gameHeight) this.gameHeight = gameHeight;
        if (paddle) this.paddle = paddle;
        
        // Position ball in the center of the canvas
        this.position = {
            x: this.gameWidth / 2,
            y: this.gameHeight / 2
        };
        
        // Randomize initial launch angle (between -45 and +45 degrees)
        const angle = (Math.random() * 90 - 45) * Math.PI / 180;
        // Use scaled speed
        const speedMagnitude = this.initialSpeed;
        this.speed = {
            x: speedMagnitude * Math.sin(angle),
            y: -speedMagnitude * Math.cos(angle)
        };
    }
    
    /**
     * Resize the ball when the canvas size changes
     * @param {number} gameWidth - New game width
     * @param {number} gameHeight - New game height
     * @param {number} scaleFactor - Scale factor to apply to ball dimensions
     */
    resize(gameWidth, gameHeight, scaleFactor) {
        // Store position ratios
        const positionRatioX = this.position ? (this.position.x / this.gameWidth) : 0.5;
        const positionRatioY = this.position ? (this.position.y / this.gameHeight) : 0.5;
        
        // Update dimensions
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.scaleFactor = scaleFactor;
        
        // Scale ball dimensions
        this.radius = this.baseRadius * scaleFactor;
        this.initialSpeed = this.baseInitialSpeed * Math.sqrt(scaleFactor);
        
        // Maintain the ball's relative position in the game area
        if (this.position) {
            this.position = {
                x: positionRatioX * gameWidth,
                y: positionRatioY * gameHeight
            };
            
            // Also scale current speed if it exists
            if (this.speed) {
                const currentSpeedMagnitude = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
                const directionX = this.speed.x / currentSpeedMagnitude;
                const directionY = this.speed.y / currentSpeedMagnitude;
                
                const newSpeedMagnitude = this.initialSpeed;
                this.speed = {
                    x: directionX * newSpeedMagnitude,
                    y: directionY * newSpeedMagnitude
                };
            }
        }
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
