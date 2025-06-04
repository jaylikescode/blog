/**
 * Brick Simulation Game - Ball Component
 * Handles ball movement, collision, and physics
 */

class Ball extends GameObject {
    /**
     * Creates a new ball
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {number} radius - The radius of the ball
     * @param {string} color - The color of the ball
     * @param {number} velocityX - Initial horizontal velocity
     * @param {number} velocityY - Initial vertical velocity
     * @param {number} screenWidth - The width of the game screen
     * @param {number} screenHeight - The height of the game screen
     */
    constructor(x, y, radius, color, velocityX, velocityY, screenWidth, screenHeight) {
        // Ball uses radius for size, but we'll treat it as width/height for GameObject
        super(x - radius, y - radius, radius * 2, radius * 2, color);
        
        this.radius = radius;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.attached = false; // Used when ball is attached to paddle at start
        this.attachedTo = null; // Reference to object ball is attached to
        this.attachOffsetX = 0; // Offset from attachment point
        this.isLaunched = false; // Whether the ball has been launched
        this.trail = []; // Array to store recent positions for trail effect
        this.trailMaxLength = 5; // Maximum number of positions to store
    }
    
    /**
     * Updates the ball state
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // If ball is attached to another object (like the paddle), update position based on that
        if (this.attached && this.attachedTo) {
            this.x = this.attachedTo.x + this.attachOffsetX;
            this.y = this.attachedTo.y - this.radius * 2;
            return;
        }
        
        // Store current position for trail effect
        if (this.trail.length >= this.trailMaxLength) {
            this.trail.shift(); // Remove oldest position
        }
        this.trail.push({ x: this.x + this.radius, y: this.y + this.radius });
        
        // Update position based on velocity
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Check for wall collisions
        this.handleWallCollisions();
    }
    
    /**
     * Handles collisions with screen boundaries
     */
    handleWallCollisions() {
        // Left and right wall collisions
        if (this.x <= 0) {
            this.x = 0;
            this.velocityX = -this.velocityX;
        } else if (this.x + this.width >= this.screenWidth) {
            this.x = this.screenWidth - this.width;
            this.velocityX = -this.velocityX;
        }
        
        // Top wall collision
        if (this.y <= 0) {
            this.y = 0;
            this.velocityY = -this.velocityY;
        }
        
        // No bottom wall collision handling here - that's handled by the game class
        // to detect when a ball is lost
    }
    
    /**
     * Checks if the ball is below the bottom of the screen
     * @returns {boolean} True if the ball is below the screen, false otherwise
     */
    isOutOfBounds() {
        return this.y > this.screenHeight;
    }
    
    /**
     * Attaches the ball to an object (like the paddle)
     * @param {GameObject} object - The object to attach to
     * @param {number} offsetX - The x-offset from the object's left edge
     */
    attachTo(object, offsetX) {
        this.attached = true;
        this.attachedTo = object;
        this.attachOffsetX = offsetX;
        this.isLaunched = false;
    }
    
    /**
     * Launches the ball if it is attached
     * @param {number} initialVelocityX - Initial horizontal velocity
     * @param {number} initialVelocityY - Initial vertical velocity
     */
    launch(initialVelocityX, initialVelocityY) {
        if (this.attached) {
            this.attached = false;
            this.attachedTo = null;
            this.velocityX = initialVelocityX;
            this.velocityY = initialVelocityY;
            this.isLaunched = true;
        }
    }
    
    /**
     * Resets the ball to its initial state
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {number} velocityX - Initial horizontal velocity
     * @param {number} velocityY - Initial vertical velocity
     */
    reset(x, y, velocityX, velocityY) {
        this.x = x - this.radius;
        this.y = y - this.radius;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.attached = false;
        this.attachedTo = null;
        this.isLaunched = false;
        this.trail = [];
    }
    
    /**
     * Changes the ball speed
     * @param {number} factor - The factor to multiply speed by
     */
    changeSpeed(factor) {
        this.velocityX *= factor;
        this.velocityY *= factor;
    }
    
    /**
     * Gets the bounds of the ball for collision detection
     * @returns {Object} The bounds {x, y, radius}
     */
    getBounds() {
        return {
            x: this.x + this.radius,
            y: this.y + this.radius,
            radius: this.radius
        };
    }
    
    /**
     * Renders the ball with a trail effect
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        if (!this.visible) return;
        
        // Draw trail
        if (this.trail.length > 0 && this.isLaunched) {
            for (let i = 0; i < this.trail.length; i++) {
                const pos = this.trail[i];
                const alpha = i / this.trail.length * 0.3; // Fade out older positions
                const size = (i / this.trail.length) * this.radius; // Smaller older positions
                
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            }
        }
        
        // Draw ball
        if (this.sprite) {
            // Render sprite if available
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            // Draw a circle with gradient and shadow
            ctx.save();
            
            // Add shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Create gradient
            const gradient = ctx.createRadialGradient(
                this.x + this.radius, this.y + this.radius * 0.7, this.radius * 0.3,
                this.x + this.radius, this.y + this.radius, this.radius
            );
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(1, this.color);
            
            // Draw circle
            ctx.beginPath();
            ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            ctx.restore();
        }
    }
}
