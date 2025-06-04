/**
 * Brick Simulation Game - Level Component
 * Handles level generation, brick layouts, and progression
 */

class Level {
    /**
     * Creates a new level
     * @param {number} levelNumber - The level number
     * @param {number} screenWidth - The width of the game screen
     * @param {number} screenHeight - The height of the game screen
     */
    constructor(levelNumber, screenWidth, screenHeight) {
        this.levelNumber = levelNumber;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.bricks = [];
        this.brickRows = CONFIG.BRICK_ROWS + Math.min(Math.floor(levelNumber / 2), 3); // Increase rows with level
        this.brickCols = CONFIG.BRICK_COLS;
        this.brickWidth = CONFIG.BRICK_WIDTH;
        this.brickHeight = CONFIG.BRICK_HEIGHT;
        this.brickMargin = CONFIG.BRICK_MARGIN;
        this.topMargin = CONFIG.BRICK_TOP_MARGIN;
        this.totalBricks = 0;
        this.brokeBricks = 0;
        this.bricksWithItems = 0;
        
        // Initialize level
        this.generateLevel();
    }
    
    /**
     * Generates the level layout with bricks
     */
    generateLevel() {
        this.bricks = [];
        this.brokeBricks = 0;
        
        // Calculate total width needed for bricks
        const totalBrickWidth = this.brickCols * (this.brickWidth + this.brickMargin) - this.brickMargin;
        // Calculate the left margin to center the bricks horizontally
        const leftMargin = (this.screenWidth - totalBrickWidth) / 2;
        
        // Track total number of breakable bricks
        let breakableBricks = 0;
        
        // Generate brick layout based on level
        for (let row = 0; row < this.brickRows; row++) {
            for (let col = 0; col < this.brickCols; col++) {
                // Skip some bricks for interesting patterns based on level
                if (this.shouldSkipBrick(row, col)) {
                    continue;
                }
                
                // Calculate brick position
                const x = leftMargin + col * (this.brickWidth + this.brickMargin);
                const y = this.topMargin + row * (this.brickHeight + this.brickMargin);
                
                // Determine brick type based on level and position
                const type = this.getBrickType(row, col);
                
                // Create the brick
                const brick = new Brick(
                    x, y, 
                    this.brickWidth, this.brickHeight, 
                    type, row, col
                );
                
                // Count breakable bricks
                if (type.name !== 'unbreakable') {
                    breakableBricks++;
                    
                    // Determine if this brick should have an item
                    if (this.shouldHaveItem(row, col)) {
                        const itemType = this.getRandomItemType();
                        brick.setItem(itemType);
                        this.bricksWithItems++;
                    }
                }
                
                this.bricks.push(brick);
            }
        }
        
        this.totalBricks = breakableBricks;
    }
    
    /**
     * Determines if a brick should be skipped based on level patterns
     * @param {number} row - The row index
     * @param {number} col - The column index
     * @returns {boolean} True if the brick should be skipped, false otherwise
     */
    shouldSkipBrick(row, col) {
        // Level 1: Simple full pattern
        if (this.levelNumber === 1) {
            return false;
        }
        
        // Level 2: Checkerboard pattern
        if (this.levelNumber === 2) {
            return (row + col) % 2 === 1;
        }
        
        // Level 3: Nested rectangles
        if (this.levelNumber === 3) {
            const distFromEdgeH = Math.min(col, this.brickCols - 1 - col);
            const distFromEdgeV = Math.min(row, this.brickRows - 1 - row);
            const minDist = Math.min(distFromEdgeH, distFromEdgeV);
            return minDist % 2 === 1;
        }
        
        // Level 4: Scattered pattern
        if (this.levelNumber === 4) {
            return (row * col + row + col) % 3 === 0;
        }
        
        // Level 5: Pyramid
        if (this.levelNumber === 5) {
            const midCol = Math.floor(this.brickCols / 2);
            const distFromCenter = Math.abs(col - midCol);
            return distFromCenter > row;
        }
        
        // Higher levels: More complex patterns
        // Tunnel pattern
        if (this.levelNumber === 6) {
            if (row === Math.floor(this.brickRows / 2)) {
                return true; // Leave a tunnel in the middle row
            }
            if (col === 0 || col === this.brickCols - 1 || row === 0 || row === this.brickRows - 1) {
                return false; // Always have bricks on the edges
            }
            // Random gaps
            return (row * col) % 4 === 0;
        }
        
        // Spiral pattern
        if (this.levelNumber === 7) {
            const centerRow = Math.floor(this.brickRows / 2);
            const centerCol = Math.floor(this.brickCols / 2);
            const dx = col - centerCol;
            const dy = row - centerRow;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return Math.floor(distance) % 2 === 0;
        }
        
        // Higher levels use a mix of patterns with increasing difficulty
        if (this.levelNumber >= 8) {
            // More dense patterns with fewer gaps
            const complexity = Math.min(this.levelNumber - 7, 5); // Max complexity of 5
            const pattern = (row * 3 + col * 2 + this.levelNumber) % (10 - complexity);
            return pattern === 0;
        }
        
        return false;
    }
    
    /**
     * Determines the brick type based on level and position
     * @param {number} row - The row index
     * @param {number} col - The column index
     * @returns {Object} The brick type configuration object
     */
    getBrickType(row, col) {
        const brickTypes = CONFIG.BRICK_TYPES;
        
        // Level 1: All normal bricks
        if (this.levelNumber === 1) {
            return brickTypes[0];
        }
        
        // Higher levels: Mix of brick types
        // Top rows get stronger bricks
        if (row === 0) {
            // Unbreakable bricks on top row corners for higher levels
            if ((col === 0 || col === this.brickCols - 1) && this.levelNumber >= 5) {
                return brickTypes[2]; // Unbreakable
            }
            
            // Strong bricks on top row for level 3+
            if (this.levelNumber >= 3) {
                return brickTypes[1]; // Strong
            }
        }
        
        // Level 4+: Some strong bricks throughout
        if (this.levelNumber >= 4) {
            if ((row + col) % 5 === 0) {
                return brickTypes[1]; // Strong
            }
        }
        
        // Level 6+: More unbreakable bricks
        if (this.levelNumber >= 6) {
            // Unbreakable bricks in strategic positions
            if (row === 0 && col % 3 === 0) {
                return brickTypes[2]; // Unbreakable
            }
        }
        
        // Level 8+: More complex patterns with stronger bricks
        if (this.levelNumber >= 8) {
            if (row % 3 === 0 && col % 2 === 0) {
                return brickTypes[1]; // Strong
            }
            if (row === Math.floor(this.brickRows / 2) && (col === 0 || col === this.brickCols - 1)) {
                return brickTypes[2]; // Unbreakable
            }
        }
        
        // Default to normal brick
        return brickTypes[0];
    }
    
    /**
     * Determines if a brick should have an item
     * @param {number} row - The row index
     * @param {number} col - The column index
     * @returns {boolean} True if the brick should have an item, false otherwise
     */
    shouldHaveItem(row, col) {
        // Calculate a probability based on level
        // Higher levels have slightly more items
        const baseProb = 0.1;
        const levelBonus = 0.02 * Math.min(this.levelNumber, 5);
        const probability = baseProb + levelBonus;
        
        // Always put some items in specific positions for early levels
        if (this.levelNumber <= 3) {
            // Put items in middle columns
            const midCol = Math.floor(this.brickCols / 2);
            if (col === midCol || col === midCol - 1 || col === midCol + 1) {
                return Math.random() < 0.3;
            }
        }
        
        // Random chance for items
        return Math.random() < probability;
    }
    
    /**
     * Gets a random item type based on probabilities
     * @returns {string} The randomly selected item type
     */
    getRandomItemType() {
        const itemTypes = CONFIG.ITEM_TYPES;
        const totalProbability = itemTypes.reduce((sum, item) => sum + item.probability, 0);
        let random = Math.random() * totalProbability;
        
        for (const item of itemTypes) {
            if (random < item.probability) {
                return item.name;
            }
            random -= item.probability;
        }
        
        // Default to the first item type
        return itemTypes[0].name;
    }
    
    /**
     * Updates all bricks in the level
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    update(deltaTime) {
        for (const brick of this.bricks) {
            brick.update(deltaTime);
        }
    }
    
    /**
     * Renders all bricks in the level
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        for (const brick of this.bricks) {
            brick.render(ctx);
        }
    }
    
    /**
     * Handles a brick being hit
     * @param {number} index - The index of the brick in the bricks array
     * @returns {Object} Hit result {broken, points, item, brick}
     */
    hitBrick(index) {
        if (index < 0 || index >= this.bricks.length) {
            return { broken: false, points: 0, item: null, brick: null };
        }
        
        const brick = this.bricks[index];
        const result = brick.hit();
        
        if (result.broken) {
            this.brokeBricks++;
        }
        
        return {
            broken: result.broken,
            points: result.points,
            item: result.item,
            brick: brick
        };
    }
    
    /**
     * Checks if all breakable bricks are broken
     * @returns {boolean} True if all breakable bricks are broken, false otherwise
     */
    isCleared() {
        return this.brokeBricks >= this.totalBricks;
    }
    
    /**
     * Gets the completion percentage of the level
     * @returns {number} The percentage of bricks broken (0-100)
     */
    getCompletionPercentage() {
        if (this.totalBricks === 0) return 100;
        return Math.floor((this.brokeBricks / this.totalBricks) * 100);
    }
}
