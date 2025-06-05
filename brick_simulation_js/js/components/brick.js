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
     * @param {number} scaleFactor - Optional scale factor for 3D effects
     */
    constructor(posX, posY, width, height, color, scaleFactor = 1) {
        this.position = {
            x: posX,
            y: posY
        };
        this.width = width;
        this.height = height;
        this.color = color;
        this.active = true; // Flag to track if brick is active (not destroyed)
        this.scaleFactor = scaleFactor;
    }
    
    /**
     * Draw the brick on the canvas if active
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    draw(ctx) {
        if (!this.active) return; // Don't draw if brick is destroyed
        
        // Calculate the highlight and shadow size based on scale factor
        // but ensure minimum size for visibility
        const effectSize = Math.max(1, Math.round(2 * this.scaleFactor));
        
        // Main brick body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // Add a 3D effect with a lighter highlight
        ctx.fillStyle = this.getLighterColor(this.color);
        // Top highlight
        ctx.fillRect(
            this.position.x, 
            this.position.y, 
            this.width, 
            effectSize
        );
        // Left highlight
        ctx.fillRect(
            this.position.x, 
            this.position.y, 
            effectSize, 
            this.height
        );
        
        // Add a darker shadow
        ctx.fillStyle = this.getDarkerColor(this.color);
        // Right shadow
        ctx.fillRect(
            this.position.x + this.width - effectSize, 
            this.position.y, 
            effectSize, 
            this.height
        );
        // Bottom shadow
        ctx.fillRect(
            this.position.x, 
            this.position.y + this.height - effectSize, 
            this.width, 
            effectSize
        );
    }
    
    /**
     * Get a darker shade of a color for 3D effect
     * @param {string} color - The base color
     * @returns {string} A darker shade of the color
     */
    getDarkerColor(color) {
        // Simple implementation - create a semi-transparent black overlay
        return 'rgba(0, 0, 0, 0.3)';
    }
    
    /**
     * Get a lighter shade of a color for 3D effect
     * @param {string} color - The base color
     * @returns {string} A lighter shade of the color
     */
    getLighterColor(color) {
        // Simple implementation - create a semi-transparent white overlay
        return 'rgba(255, 255, 255, 0.5)';
    }
    
    /**
     * Resize the brick based on new canvas dimensions and scale factor
     * @param {number} posX - New X position
     * @param {number} posY - New Y position
     * @param {number} width - New width
     * @param {number} height - New height
     * @param {number} scaleFactor - Scale factor for 3D effects
     */
    resize(posX, posY, width, height, scaleFactor) {
        this.position.x = posX;
        this.position.y = posY;
        this.width = width;
        this.height = height;
        this.scaleFactor = scaleFactor;
    }
}
