/**
 * Brick Simulation Game - Brick Component
 * Handles brick behavior, types, and interactions
 */

class Brick extends GameObject {
    /**
     * Creates a new brick
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {number} width - The width of the brick
     * @param {number} height - The height of the brick
     * @param {Object} type - The brick type configuration object
     * @param {number} row - The row index of the brick
     * @param {number} col - The column index of the brick
     */
    constructor(x, y, width, height, type, row, col) {
        super(x, y, width, height, type.color);
        this.type = type.name;
        this.points = type.points;
        this.maxHits = type.hits;
        this.hits = 0;
        this.broken = false;
        this.row = row;
        this.col = col;
        this.animationTime = 0;
        this.animationDuration = 300; // milliseconds
        this.breaking = false;
        this.hasItem = false;
        this.itemType = null;
    }
    
    /**
     * Updates the brick state
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    update(deltaTime) {
        if (!this.active || this.broken) return;
        
        // If brick is breaking, update animation
        if (this.breaking) {
            this.animationTime += deltaTime;
            if (this.animationTime >= this.animationDuration) {
                this.broken = true;
                this.visible = false;
                this.active = false;
            }
        }
    }
    
    /**
     * Handles a hit on the brick
     * @returns {Object} Hit result {broken, points, item}
     */
    hit() {
        if (this.broken || !this.active) {
            return { broken: false, points: 0, item: null };
        }
        
        // Increment hit count
        this.hits++;
        
        // Check if brick is broken
        let broken = false;
        let earnedPoints = 0;
        let droppedItem = null;
        
        // Unbreakable bricks never break
        if (this.type === 'unbreakable') {
            earnedPoints = this.points;
        } 
        // Other bricks break based on hit count
        else if (this.maxHits > 0 && this.hits >= this.maxHits) {
            this.breaking = true;
            broken = true;
            earnedPoints = this.points;
            
            // Check if this brick should drop an item
            if (this.hasItem) {
                droppedItem = this.itemType;
            }
        } 
        // Handle multi-hit bricks
        else if (this.maxHits > 1) {
            // Decrease color brightness to show damage
            this.updateAppearanceForDamage();
            earnedPoints = Math.floor(this.points / 2);
        }
        
        return {
            broken: broken,
            points: earnedPoints,
            item: droppedItem
        };
    }
    
    /**
     * Updates the brick appearance based on damage level
     */
    updateAppearanceForDamage() {
        if (this.maxHits <= 1) return;
        
        // Calculate damage percentage
        const damagePercent = this.hits / this.maxHits;
        
        // Adjust color based on damage
        if (this.type === 'strong') {
            // Transition from yellow to orange to red as damage increases
            if (damagePercent <= 0.5) {
                this.color = "#FFA500"; // Orange
            } else {
                this.color = "#FF0000"; // Red
            }
        }
    }
    
    /**
     * Sets whether this brick contains an item
     * @param {string} itemType - The type of item to contain
     */
    setItem(itemType) {
        this.hasItem = true;
        this.itemType = itemType;
    }
    
    /**
     * Renders the brick with visual effects based on type and state
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        if (!this.visible || this.broken) return;
        
        // If brick is breaking, render break animation
        if (this.breaking) {
            const progress = this.animationTime / this.animationDuration;
            const scale = 1 + progress * 0.3;
            const alpha = 1 - progress;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
            
            this.renderBrick(ctx);
            
            ctx.restore();
            return;
        }
        
        this.renderBrick(ctx);
    }
    
    /**
     * Renders the brick with appropriate style for its type
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    renderBrick(ctx) {
        if (this.sprite) {
            // Render sprite if available
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.save();
            
            // Different visual styles based on brick type
            switch (this.type) {
                case 'unbreakable':
                    // Metallic look with gradient
                    const metalGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
                    metalGradient.addColorStop(0, "#A0A0A0");
                    metalGradient.addColorStop(0.5, "#E0E0E0");
                    metalGradient.addColorStop(1, "#808080");
                    ctx.fillStyle = metalGradient;
                    break;
                    
                case 'strong':
                    // Stronger brick with more vivid color and border
                    const strongGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
                    strongGradient.addColorStop(0, this.color);
                    strongGradient.addColorStop(1, darkenColor(this.color, 30));
                    ctx.fillStyle = strongGradient;
                    break;
                    
                default:
                    // Basic brick with simple gradient
                    const normalGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
                    normalGradient.addColorStop(0, lightenColor(this.color, 20));
                    normalGradient.addColorStop(1, this.color);
                    ctx.fillStyle = normalGradient;
            }
            
            // Draw main brick shape with slightly rounded corners
            const radius = 2;
            ctx.beginPath();
            ctx.moveTo(this.x + radius, this.y);
            ctx.lineTo(this.x + this.width - radius, this.y);
            ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + radius);
            ctx.lineTo(this.x + this.width, this.y + this.height - radius);
            ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - radius, this.y + this.height);
            ctx.lineTo(this.x + radius, this.y + this.height);
            ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - radius);
            ctx.lineTo(this.x, this.y + radius);
            ctx.quadraticCurveTo(this.x, this.y, this.x + radius, this.y);
            ctx.closePath();
            ctx.fill();
            
            // Draw highlight on top edge
            ctx.beginPath();
            ctx.moveTo(this.x + radius, this.y + 1);
            ctx.lineTo(this.x + this.width - radius, this.y + 1);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw shadow on bottom edge
            ctx.beginPath();
            ctx.moveTo(this.x + radius, this.y + this.height - 1);
            ctx.lineTo(this.x + this.width - radius, this.y + this.height - 1);
            ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Add item indicator if brick contains an item
            if (this.hasItem) {
                // Draw a small circle or dot in the center of the brick
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 3, 0, Math.PI * 2);
                ctx.fillStyle = "#FFFFFF";
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
}

// Helper functions for color manipulation

/**
 * Lightens a color by the given percentage
 * @param {string} color - The color in hex format
 * @param {number} percent - The percentage to lighten by
 * @returns {string} The lightened color in hex format
 */
function lightenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const r = Math.min(255, Math.floor((num >> 16) + 2.55 * percent));
    const g = Math.min(255, Math.floor((num >> 8 & 0x00FF) + 2.55 * percent));
    const b = Math.min(255, Math.floor((num & 0x0000FF) + 2.55 * percent));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

/**
 * Darkens a color by the given percentage
 * @param {string} color - The color in hex format
 * @param {number} percent - The percentage to darken by
 * @returns {string} The darkened color in hex format
 */
function darkenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const r = Math.max(0, Math.floor((num >> 16) - 2.55 * percent));
    const g = Math.max(0, Math.floor((num >> 8 & 0x00FF) - 2.55 * percent));
    const b = Math.max(0, Math.floor((num & 0x0000FF) - 2.55 * percent));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
