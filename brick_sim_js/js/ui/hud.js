/**
 * Brick Simulation Game - Heads Up Display (HUD)
 * Displays game information like score, lives, and level
 */

class HUD {
    /**
     * Creates a new HUD
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} width - The width of the canvas
     * @param {number} height - The height of the canvas
     */
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.textRenderer = new TextRenderer(ctx);
        this.padding = 10;
        this.lastScore = 0;
        this.scoreAnimationTime = 0;
        this.scoreAnimationDuration = 300; // ms
        this.flashMessage = null;
        this.flashMessageTime = 0;
        this.flashMessageDuration = 2000; // ms
    }
    
    /**
     * Updates the HUD
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     * @param {number} score - Current score
     * @param {number} lives - Remaining lives
     * @param {number} level - Current level
     */
    update(deltaTime, score, lives, level) {
        // Check for score change animation
        if (score !== this.lastScore) {
            this.lastScore = score;
            this.scoreAnimationTime = this.scoreAnimationDuration;
        }
        
        // Update score animation
        if (this.scoreAnimationTime > 0) {
            this.scoreAnimationTime -= deltaTime;
            if (this.scoreAnimationTime < 0) {
                this.scoreAnimationTime = 0;
            }
        }
        
        // Update flash message
        if (this.flashMessage) {
            this.flashMessageTime -= deltaTime;
            if (this.flashMessageTime <= 0) {
                this.flashMessage = null;
            }
        }
    }
    
    /**
     * Sets a flash message to display temporarily
     * @param {string} message - The message to display
     * @param {number} duration - How long to show the message (ms)
     */
    setFlashMessage(message, duration = 2000) {
        this.flashMessage = message;
        this.flashMessageTime = duration;
        this.flashMessageDuration = duration;
    }
    
    /**
     * Renders the HUD
     * @param {number} score - Current score
     * @param {number} highScore - High score
     * @param {number} lives - Remaining lives
     * @param {number} level - Current level
     * @param {number} time - Current game time (for animations)
     */
    render(score, highScore, lives, level, time) {
        this.renderTopBar(score, highScore, level, time);
        this.renderLives(lives);
        this.renderFlashMessage();
    }
    
    /**
     * Renders the top information bar (score, level)
     * @param {number} score - Current score
     * @param {number} highScore - High score
     * @param {number} level - Current level
     * @param {number} time - Current game time
     */
    renderTopBar(score, highScore, level, time) {
        // Semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.width, 40);
        
        // Score text
        let scoreText = `${getText('score')}: ${score}`;
        let scoreColor = CONFIG.COLOR_WHITE;
        let scoreSize = 20;
        
        // Apply score animation if active
        if (this.scoreAnimationTime > 0) {
            const animProgress = this.scoreAnimationTime / this.scoreAnimationDuration;
            scoreColor = CONFIG.COLOR_YELLOW;
            scoreSize = 20 + Math.floor(animProgress * 6);
        }
        
        this.textRenderer.drawText(scoreText, this.padding, 12, {
            fontSize: scoreSize,
            color: scoreColor,
            fontWeight: 'bold'
        });
        
        // High score
        const highScoreText = `${getText('highScore')}: ${highScore}`;
        this.textRenderer.drawText(highScoreText, this.width / 2, 12, {
            fontSize: 20,
            color: CONFIG.COLOR_YELLOW,
            align: 'center',
            fontWeight: 'bold'
        });
        
        // Level indicator
        const levelText = `${getText('level')}: ${level}`;
        this.textRenderer.drawText(levelText, this.width - this.padding, 12, {
            fontSize: 20,
            color: CONFIG.COLOR_BLUE,
            align: 'right',
            fontWeight: 'bold'
        });
    }
    
    /**
     * Renders the lives indicator
     * @param {number} lives - Remaining lives
     */
    renderLives(lives) {
        // Position at bottom-left corner
        const startX = this.padding;
        const startY = this.height - 30;
        
        // Hearts icon size
        const heartSize = 24;
        const spacing = heartSize + 5;
        
        // Heart background (slightly transparent dark red)
        const bgColor = 'rgba(100, 0, 0, 0.5)';
        
        // Heart foreground (bright red)
        const fgColor = '#FF3333';
        
        // Draw text label
        this.textRenderer.drawText(`${getText('lives')}:`, startX, startY + 6, {
            fontSize: 20,
            color: CONFIG.COLOR_WHITE,
            fontWeight: 'bold'
        });
        
        // Draw heart icons
        const textWidth = this.textRenderer.measureText(`${getText('lives')}:`, { fontSize: 20, fontWeight: 'bold' });
        const heartsStartX = startX + textWidth + 10;
        
        for (let i = 0; i < lives; i++) {
            const x = heartsStartX + i * spacing;
            const y = startY;
            this.drawHeart(x, y, heartSize, fgColor);
        }
    }
    
    /**
     * Draws a heart icon
     * @param {number} x - X position (center)
     * @param {number} y - Y position (top)
     * @param {number} size - Size of the heart
     * @param {string} color - Heart color
     */
    drawHeart(x, y, size, color) {
        const halfSize = size / 2;
        
        this.ctx.save();
        this.ctx.fillStyle = color;
        
        // Draw heart shape using bezier curves
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + halfSize);
        
        // Left curve
        this.ctx.bezierCurveTo(
            x - halfSize * 0.5, y, // Control point 1
            x - halfSize, y + halfSize * 0.5, // Control point 2
            x, y + size // End point
        );
        
        // Right curve
        this.ctx.bezierCurveTo(
            x + halfSize, y + halfSize * 0.5, // Control point 1
            x + halfSize * 0.5, y, // Control point 2
            x, y + halfSize // End point
        );
        
        this.ctx.fill();
        this.ctx.restore();
    }
    
    /**
     * Renders the flash message if active
     */
    renderFlashMessage() {
        if (!this.flashMessage) return;
        
        // Calculate opacity based on remaining time
        const opacity = Math.min(1, this.flashMessageTime / (this.flashMessageDuration * 0.3));
        
        this.ctx.save();
        
        // Semi-transparent background
        this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.6})`;
        this.ctx.fillRect(0, this.height / 2 - 40, this.width, 80);
        
        // Message text
        this.textRenderer.drawText(this.flashMessage, this.width / 2, this.height / 2, {
            fontSize: 28,
            color: `rgba(255, 255, 255, ${opacity})`,
            align: 'center',
            baseline: 'middle',
            fontWeight: 'bold'
        });
        
        this.ctx.restore();
    }
    
    /**
     * Shows a "Ready" message
     */
    showReadyMessage() {
        this.setFlashMessage(getText('getReady'), 2000);
    }
    
    /**
     * Shows a "Level Complete" message
     * @param {number} level - The completed level
     */
    showLevelCompleteMessage(level) {
        this.setFlashMessage(`${getText('level')} ${level} ${getText('completed')}`, 2000);
    }
    
    /**
     * Shows a countdown message
     * @param {number} number - The number to display
     */
    showCountdown(number) {
        this.setFlashMessage(number.toString(), 1000);
    }
    
    /**
     * Shows a "Game Over" message
     */
    showGameOverMessage() {
        this.setFlashMessage(getText('gameOver'), 3000);
    }
}
