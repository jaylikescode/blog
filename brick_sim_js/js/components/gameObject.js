/**
 * Brick Simulation Game - GameObject Base Class
 * Provides common functionality for all game objects
 */

class GameObject {
    /**
     * Creates a new game object
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {number} width - The width of the object
     * @param {number} height - The height of the object
     * @param {string} color - The color of the object
     */
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.velocityX = 0;
        this.velocityY = 0;
        this.active = true;
        this.visible = true;
        this.sprite = null;
        this.id = Math.random().toString(36).substr(2, 9); // Generate unique ID
    }

    /**
     * Updates the game object state
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    update(deltaTime) {
        if (!this.active) return;

        // Update position based on velocity
        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    /**
     * Renders the game object
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        if (!this.visible) return;

        if (this.sprite) {
            // Render sprite if available
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback to rectangle rendering
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    /**
     * Sets the position of the game object
     * @param {number} x - The new x-coordinate
     * @param {number} y - The new y-coordinate
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Sets the velocity of the game object
     * @param {number} vx - The new x-velocity
     * @param {number} vy - The new y-velocity
     */
    setVelocity(vx, vy) {
        this.velocityX = vx;
        this.velocityY = vy;
    }

    /**
     * Sets the sprite for the game object
     * @param {HTMLImageElement} sprite - The sprite image
     */
    setSprite(sprite) {
        this.sprite = sprite;
    }

    /**
     * Gets the bounds of the game object for collision detection
     * @returns {Object} The bounds {x, y, width, height}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Checks if this object collides with another object
     * @param {GameObject} other - The other game object
     * @returns {boolean} True if the objects collide, false otherwise
     */
    collidesWith(other) {
        return rectIntersect(this.getBounds(), other.getBounds());
    }

    /**
     * Activates or deactivates the game object
     * @param {boolean} active - Whether the object is active
     */
    setActive(active) {
        this.active = active;
    }

    /**
     * Shows or hides the game object
     * @param {boolean} visible - Whether the object is visible
     */
    setVisible(visible) {
        this.visible = visible;
    }
}
