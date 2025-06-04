/**
 * Brick Simulation Game - Item Component
 * Handles power-up items dropped by broken bricks
 */

class Item extends GameObject {
    /**
     * Creates a new item
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {number} size - The size of the item
     * @param {string} type - The type of item
     * @param {number} speed - The falling speed of the item
     * @param {number} screenHeight - The height of the game screen
     */
    constructor(x, y, size, type, speed, screenHeight) {
        let color;
        
        // Set color based on item type
        switch (type) {
            case 'extend':
                color = '#00FF00'; // Green
                break;
            case 'slow':
                color = '#00FFFF'; // Cyan
                break;
            case 'multi':
                color = '#FF00FF'; // Magenta
                break;
            case 'life':
                color = '#FF0000'; // Red
                break;
            case 'laser':
                color = '#FFFF00'; // Yellow
                break;
            case 'fast':
                color = '#FFA500'; // Orange
                break;
            case 'warp':
                color = '#9932CC'; // Purple
                break;
            default:
                color = '#FFFFFF'; // White
        }
        
        super(x, y, size, size, color);
        
        this.type = type;
        this.velocityY = speed;
        this.screenHeight = screenHeight;
        this.collected = false;
        this.animationTime = 0;
        this.blinkRate = 200; // milliseconds
        this.rotationAngle = 0;
        this.symbolScale = 0.6; // Scale of the symbol relative to item size
    }
    
    /**
     * Updates the item state
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    update(deltaTime) {
        if (!this.active || this.collected) return;
        
        // Update animation time for blinking effect
        this.animationTime += deltaTime;
        
        // Update rotation angle for spinning effect
        this.rotationAngle = (this.rotationAngle + 0.05) % (Math.PI * 2);
        
        // Update position
        super.update(deltaTime);
        
        // Check if item is out of bounds (bottom of screen)
        if (this.y > this.screenHeight) {
            this.active = false;
            this.visible = false;
        }
    }
    
    /**
     * Collects the item
     * @returns {string} The type of item collected
     */
    collect() {
        if (!this.active || this.collected) return null;
        
        this.collected = true;
        this.active = false;
        this.visible = false;
        
        return this.type;
    }
    
    /**
     * Renders the item with visual effects
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        if (!this.visible || this.collected) return;
        
        if (this.sprite) {
            // Render sprite if available
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.save();
            
            // Make items blink by alternating opacity
            const blinkState = Math.floor(this.animationTime / this.blinkRate) % 2;
            ctx.globalAlpha = blinkState ? 0.7 : 1;
            
            // Draw item background
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw white border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 - 1, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw symbol based on item type
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotationAngle);
            ctx.fillStyle = '#FFFFFF';
            
            const symbolSize = this.width * this.symbolScale;
            
            switch (this.type) {
                case 'extend':
                    // Draw a horizontal bar (paddle extension)
                    ctx.fillRect(-symbolSize / 2, -symbolSize / 6, symbolSize, symbolSize / 3);
                    break;
                    
                case 'slow':
                    // Draw an arrow pointing down
                    ctx.beginPath();
                    ctx.moveTo(0, symbolSize / 2);
                    ctx.lineTo(-symbolSize / 2, -symbolSize / 2);
                    ctx.lineTo(symbolSize / 2, -symbolSize / 2);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                case 'multi':
                    // Draw multiple small circles (multi-ball)
                    const circleRadius = symbolSize / 6;
                    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
                        const circleX = Math.cos(angle) * (symbolSize / 2 - circleRadius);
                        const circleY = Math.sin(angle) * (symbolSize / 2 - circleRadius);
                        ctx.beginPath();
                        ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.beginPath();
                    ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'life':
                    // Draw a heart
                    ctx.beginPath();
                    const heartSize = symbolSize / 2;
                    ctx.moveTo(0, heartSize / 4);
                    ctx.bezierCurveTo(heartSize / 2, -heartSize / 2, heartSize, 0, 0, heartSize);
                    ctx.bezierCurveTo(-heartSize, 0, -heartSize / 2, -heartSize / 2, 0, heartSize / 4);
                    ctx.fill();
                    break;
                    
                case 'laser':
                    // Draw a laser/lightning bolt
                    ctx.beginPath();
                    ctx.moveTo(-symbolSize / 2, -symbolSize / 2);
                    ctx.lineTo(0, 0);
                    ctx.lineTo(-symbolSize / 4, 0);
                    ctx.lineTo(symbolSize / 2, symbolSize / 2);
                    ctx.lineTo(0, 0);
                    ctx.lineTo(symbolSize / 4, 0);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                case 'fast':
                    // Draw an arrow pointing up
                    ctx.beginPath();
                    ctx.moveTo(0, -symbolSize / 2);
                    ctx.lineTo(-symbolSize / 2, symbolSize / 2);
                    ctx.lineTo(symbolSize / 2, symbolSize / 2);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                case 'warp':
                    // Draw a star
                    ctx.beginPath();
                    const spikes = 5;
                    const outerRadius = symbolSize / 2;
                    const innerRadius = symbolSize / 4;
                    
                    for (let i = 0; i < spikes * 2; i++) {
                        const radius = i % 2 === 0 ? outerRadius : innerRadius;
                        const angle = (i * Math.PI) / spikes;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
            
            ctx.restore();
        }
    }
}
