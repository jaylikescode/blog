/**
 * Brick Simulation Game - Collision Manager
 * Handles collision detection and resolution between game objects
 */

class CollisionManager {
    /**
     * Creates a new collision manager
     */
    constructor() {
        this.collisionEvents = []; // For tracking collision events
    }
    
    /**
     * Detects and handles collisions between ball and paddle
     * @param {Ball} ball - The ball to check
     * @param {Paddle} paddle - The paddle to check against
     * @returns {boolean} True if collision occurred, false otherwise
     */
    checkBallPaddleCollision(ball, paddle) {
        if (!ball.active || !paddle.active || ball.attached) {
            return false;
        }
        
        // Get bounds for collision checking
        const ballBounds = ball.getBounds();
        const paddleBounds = paddle.getBounds();
        
        // Check for collision using circle-rect collision
        const collision = circleRectCollision(ballBounds, paddleBounds);
        
        if (collision && collision.collision) {
            // Ball hit the paddle
            
            // Make sure the ball is moving downward before collision response
            // This prevents the ball from getting stuck in the paddle
            if (ball.velocityY > 0) {
                // Let the paddle calculate the bounce angle based on hit position
                paddle.calculateBallBounce(ball);
                
                // Ensure ball is moving upward after hitting paddle
                ball.velocityY = -Math.abs(ball.velocityY);
                
                // Position the ball just above the paddle to prevent sticking
                ball.y = paddle.y - ball.height - 1;
                
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Detects and handles collisions between ball and bricks
     * @param {Ball} ball - The ball to check
     * @param {Array} bricks - The array of bricks to check against
     * @param {Level} level - The current level object
     * @returns {Object} Collision result with broken brick and item info
     */
    checkBallBrickCollisions(ball, bricks, level) {
        if (!ball.active) {
            return { collision: false, broken: false, points: 0, item: null, brick: null };
        }
        
        // Get ball bounds for collision checking
        const ballBounds = ball.getBounds();
        
        // Check each brick for collision
        for (let i = 0; i < bricks.length; i++) {
            const brick = bricks[i];
            
            if (!brick.active || brick.broken) {
                continue;
            }
            
            // Get brick bounds for collision checking
            const brickBounds = brick.getBounds();
            
            // Check for collision using circle-rect collision
            const collision = circleRectCollision(ballBounds, brickBounds);
            
            if (collision && collision.collision) {
                // Ball hit the brick
                
                // Handle the hit and get the result
                const hitResult = level.hitBrick(i);
                
                // Determine the bounce direction based on collision side
                if (collision.side === 'left' || collision.side === 'right') {
                    // Horizontal collision - reverse X velocity
                    ball.velocityX = -ball.velocityX;
                } else {
                    // Vertical collision - reverse Y velocity
                    ball.velocityY = -ball.velocityY;
                }
                
                // Return the collision result
                return {
                    collision: true,
                    broken: hitResult.broken,
                    points: hitResult.points,
                    item: hitResult.item,
                    brick: brick
                };
            }
        }
        
        // No collisions detected
        return { collision: false, broken: false, points: 0, item: null, brick: null };
    }
    
    /**
     * Detects and handles collisions between items and paddle
     * @param {Array} items - The array of items to check
     * @param {Paddle} paddle - The paddle to check against
     * @returns {Object} Collision result with collected item info
     */
    checkItemPaddleCollisions(items, paddle) {
        const collectedItems = [];
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            if (!item.active || item.collected) {
                continue;
            }
            
            // Check for collision using rect-rect intersection
            if (item.collidesWith(paddle)) {
                // Item hit the paddle - collect it
                const itemType = item.collect();
                
                if (itemType) {
                    collectedItems.push({
                        type: itemType,
                        index: i
                    });
                }
            }
        }
        
        return collectedItems;
    }
    
    /**
     * Detects if the ball is out of bounds (below the screen)
     * @param {Ball} ball - The ball to check
     * @returns {boolean} True if the ball is out of bounds, false otherwise
     */
    isBallOutOfBounds(ball) {
        return ball.isOutOfBounds();
    }
    
    /**
     * Clears all tracked collision events
     */
    clearEvents() {
        this.collisionEvents = [];
    }
}

// 전역 객체에 클래스 등록
window.CollisionManager = CollisionManager;
console.log('CollisionManager 클래스가 전역 객체에 등록되었습니다:', typeof window.CollisionManager !== 'undefined' ? '성공' : '실패');
