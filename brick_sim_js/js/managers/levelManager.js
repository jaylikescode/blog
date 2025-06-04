/**
 * Brick Simulation Game - Level Manager
 * Handles level creation, progression, and difficulty scaling
 */

class LevelManager {
    /**
     * Creates a new level manager
     * @param {number} screenWidth - The width of the game screen
     * @param {number} screenHeight - The height of the game screen
     * @param {number} maxLevels - The maximum number of levels
     */
    constructor(screenWidth, screenHeight, maxLevels = CONFIG.MAX_LEVELS) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.currentLevelNum = 1;
        this.currentLevel = null;
        this.maxLevels = maxLevels;
        this.levelTransition = false;
        this.transitionTimer = 0;
        this.transitionDuration = 2000; // milliseconds
        this.difficultyFactor = 1.0;
    }
    
    /**
     * Initializes the first level
     */
    initialize() {
        this.currentLevelNum = 1;
        this.currentLevel = new Level(this.currentLevelNum, this.screenWidth, this.screenHeight);
        this.difficultyFactor = 1.0;
    }
    
    /**
     * Advances to the next level
     * @returns {boolean} True if there is a next level, false if the game is complete
     */
    nextLevel() {
        if (this.currentLevelNum >= this.maxLevels) {
            // Game complete - no more levels
            return false;
        }
        
        // Increment level number
        this.currentLevelNum++;
        
        // Increase difficulty
        this.difficultyFactor = 1.0 + (this.currentLevelNum - 1) * 0.1; // 10% increase per level
        
        // Create new level
        this.currentLevel = new Level(this.currentLevelNum, this.screenWidth, this.screenHeight);
        
        // Start transition
        this.startLevelTransition();
        
        return true;
    }
    
    /**
     * Starts the level transition animation
     */
    startLevelTransition() {
        this.levelTransition = true;
        this.transitionTimer = 0;
    }
    
    /**
     * Updates the level manager
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    update(deltaTime) {
        if (this.levelTransition) {
            this.transitionTimer += deltaTime;
            
            if (this.transitionTimer >= this.transitionDuration) {
                this.levelTransition = false;
            }
        }
        
        // Update the current level
        if (this.currentLevel) {
            this.currentLevel.update(deltaTime);
        }
    }
    
    /**
     * Checks if the current level is cleared
     * @returns {boolean} True if the level is cleared, false otherwise
     */
    isLevelCleared() {
        return this.currentLevel && this.currentLevel.isCleared();
    }
    
    /**
     * Gets the completion percentage of the current level
     * @returns {number} The percentage of bricks broken (0-100)
     */
    getLevelProgress() {
        return this.currentLevel ? this.currentLevel.getCompletionPercentage() : 0;
    }
    
    /**
     * Gets the current level
     * @returns {Level} The current level
     */
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    /**
     * Gets the current level number
     * @returns {number} The current level number
     */
    getCurrentLevelNumber() {
        return this.currentLevelNum;
    }
    
    /**
     * Checks if a level transition is in progress
     * @returns {boolean} True if a transition is in progress, false otherwise
     */
    isInTransition() {
        return this.levelTransition;
    }
    
    /**
     * Gets the transition progress
     * @returns {number} The transition progress (0-1)
     */
    getTransitionProgress() {
        if (!this.levelTransition) return 1;
        return this.transitionTimer / this.transitionDuration;
    }
    
    /**
     * Renders the current level
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        if (this.currentLevel) {
            this.currentLevel.render(ctx);
        }
        
        // Render level transition if active
        if (this.levelTransition) {
            this.renderLevelTransition(ctx);
        }
    }
    
    /**
     * Renders the level transition
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    renderLevelTransition(ctx) {
        const progress = this.transitionTimer / this.transitionDuration;
        
        // First half: fade out with clear message
        if (progress < 0.5) {
            const alpha = progress * 2;
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
            ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
            
            const textAlpha = Math.min(1, progress * 4);
            ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Level cleared message
            ctx.font = `38px ${CONFIG.FONT_FAMILY}`;
            ctx.fillText(getText('levelCleared'), this.screenWidth / 2, this.screenHeight / 2 - 30);
            
            // Level number
            ctx.font = `26px ${CONFIG.FONT_FAMILY}`;
            ctx.fillText(
                `${getText('level')} ${this.currentLevelNum - 1} ${getText('completed')}`,
                this.screenWidth / 2,
                this.screenHeight / 2 + 20
            );
        }
        // Second half: fade in new level
        else {
            const alpha = (1 - progress) * 2;
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
            ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
            
            const textAlpha = Math.min(1, (1 - progress) * 4);
            ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Next level message
            ctx.font = `38px ${CONFIG.FONT_FAMILY}`;
            ctx.fillText(
                `${getText('level')} ${this.currentLevelNum}`,
                this.screenWidth / 2,
                this.screenHeight / 2 - 30
            );
            
            // Get ready message
            ctx.font = `26px ${CONFIG.FONT_FAMILY}`;
            ctx.fillText(
                getText('getReady'),
                this.screenWidth / 2,
                this.screenHeight / 2 + 20
            );
        }
    }
    
    /**
     * Gets the current difficulty factor
     * @returns {number} The difficulty factor (1.0+)
     */
    getDifficultyFactor() {
        return this.difficultyFactor;
    }
    
    /**
     * Resets the level manager to the first level
     */
    reset() {
        this.currentLevelNum = 1;
        this.currentLevel = new Level(this.currentLevelNum, this.screenWidth, this.screenHeight);
        this.difficultyFactor = 1.0;
        this.levelTransition = false;
        this.transitionTimer = 0;
    }
}

// 전역 객체에 클래스 등록
window.LevelManager = LevelManager;
console.log('LevelManager 클래스가 전역 객체에 등록되었습니다:', typeof window.LevelManager !== 'undefined' ? '성공' : '실패');
