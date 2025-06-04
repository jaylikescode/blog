/**
 * Brick Simulation Game - Score Manager
 * Handles score tracking, high scores, and score-related game events
 */

class ScoreManager {
    /**
     * Creates a new score manager
     */
    constructor() {
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.combo = 0;
        this.comboTimer = 0;
        this.comboTimeout = 2000; // milliseconds
        this.comboMultiplier = 1;
        this.scoreEvents = [];
    }
    
    /**
     * Adds points to the current score
     * @param {number} points - The points to add
     * @param {boolean} isCombo - Whether this is part of a combo
     * @returns {number} The points added (may be modified by combo multiplier)
     */
    addPoints(points, isCombo = false) {
        let finalPoints = points;
        
        // Apply combo multiplier if this is part of a combo
        if (isCombo && this.combo > 0) {
            this.comboMultiplier = Math.min(4, 1 + this.combo * 0.1);
            finalPoints = Math.floor(points * this.comboMultiplier);
            
            // Add a score event for display
            this.scoreEvents.push({
                points: finalPoints,
                x: 0, // Will be set by game
                y: 0, // Will be set by game
                text: `${finalPoints} pts (${this.comboMultiplier.toFixed(1)}x)`,
                time: 0,
                duration: 1000
            });
        } else {
            // Add a regular score event
            this.scoreEvents.push({
                points: finalPoints,
                x: 0, // Will be set by game
                y: 0, // Will be set by game
                text: `${finalPoints} pts`,
                time: 0,
                duration: 1000
            });
        }
        
        // Update the score
        this.score += finalPoints;
        
        // Update high score if needed
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        return finalPoints;
    }
    
    /**
     * Adds to the current combo count and resets the combo timer
     */
    addCombo() {
        this.combo++;
        this.comboTimer = 0;
    }
    
    /**
     * Updates the combo timer and handles combo expiration
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    update(deltaTime) {
        // Update combo timer
        if (this.combo > 0) {
            this.comboTimer += deltaTime;
            
            // Reset combo if timer expired
            if (this.comboTimer >= this.comboTimeout) {
                this.resetCombo();
            }
        }
        
        // Update score events
        for (let i = this.scoreEvents.length - 1; i >= 0; i--) {
            const event = this.scoreEvents[i];
            event.time += deltaTime;
            
            // Remove expired events
            if (event.time >= event.duration) {
                this.scoreEvents.splice(i, 1);
            }
        }
    }
    
    /**
     * Resets the current combo count
     */
    resetCombo() {
        this.combo = 0;
        this.comboTimer = 0;
        this.comboMultiplier = 1;
    }
    
    /**
     * Gets the current score
     * @returns {number} The current score
     */
    getScore() {
        return this.score;
    }
    
    /**
     * Gets the current high score
     * @returns {number} The high score
     */
    getHighScore() {
        return this.highScore;
    }
    
    /**
     * Resets the current score to zero
     */
    resetScore() {
        this.score = 0;
        this.resetCombo();
    }
    
    /**
     * Loads the high score from local storage
     * @returns {number} The loaded high score, or 0 if none exists
     */
    loadHighScore() {
        const stored = localStorage.getItem('brickSimHighScore');
        return stored ? parseInt(stored, 10) : 0;
    }
    
    /**
     * Saves the current high score to local storage
     */
    saveHighScore() {
        localStorage.setItem('brickSimHighScore', this.highScore.toString());
    }
    
    /**
     * Renders score events (floating score indicators)
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    renderScoreEvents(ctx) {
        ctx.save();
        ctx.font = `18px ${CONFIG.FONT_FAMILY}`;
        
        for (const event of this.scoreEvents) {
            // Calculate opacity based on time (fade out)
            const opacity = 1 - (event.time / event.duration);
            
            // Calculate y position (float upward)
            const floatDistance = 30 * (event.time / event.duration);
            const y = event.y - floatDistance;
            
            // Draw text with fade effect
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.textAlign = 'center';
            ctx.fillText(event.text, event.x, y);
        }
        
        ctx.restore();
    }
    
    /**
     * Adds a score event at a specific position
     * @param {number} points - The points to display
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     */
    addScoreEvent(points, x, y) {
        this.scoreEvents.push({
            points: points,
            x: x,
            y: y,
            text: `${points} pts`,
            time: 0,
            duration: 1000
        });
    }
}
