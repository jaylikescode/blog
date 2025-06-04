/**
 * Brick.js
 * Represents a brick in the game
 */
export default class Brick {
    /**
     * Create a brick
     * @param {number} posX - X position of the brick
     * @param {number} posY - Y position of the brick
     * @param {number} width - Width of the brick
     * @param {number} height - Height of the brick
     * @param {string} color - Color of the brick
     */
    constructor(posX, posY, width, height, color) {
        this.position = {
            x: posX,
            y: posY
        };
        this.width = width;
        this.height = height;
        this.color = color;
        this.active = true; // Flag to track if brick is active (not destroyed)
    }
    
    /**
     * Draw the brick on the canvas if active
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    draw(ctx) {
        if (!this.active) return; // Don't draw if brick is destroyed
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // Add a 3D effect with a lighter highlight
        ctx.fillStyle = this.getLighterColor(this.color);
        ctx.fillRect(
            this.position.x, 
            this.position.y, 
            this.width, 
            2
        );
        ctx.fillRect(
            this.position.x, 
            this.position.y, 
            2, 
            this.height
        );
        
        // Add a darker shadow
        ctx.fillStyle = this.getDarkerColor(this.color);
        ctx.fillRect(
            this.position.x + this.width - 2, 
            this.position.y, 
            2, 
            this.height
        );
        ctx.fillRect(
            this.position.x, 
            this.position.y + this.height - 2, 
            this.width, 
            2
        );
    }
    
    /**
     * Generate a lighter version of the given color for highlights
     * @param {string} color - Base color in hex format
     * @returns {string} Lighter color in hex format
     */
    getLighterColor(color) {
        // Simple implementation - create a semi-transparent white overlay
        return 'rgba(255, 255, 255, 0.5)';
    }
    
    /**
     * Generate a darker version of the given color for shadows
     * @param {string} color - Base color in hex format
     * @returns {string} Darker color in hex format
     */
    getDarkerColor(color) {
        // Simple implementation - create a semi-transparent black overlay
        return 'rgba(0, 0, 0, 0.3)';
    }
}
