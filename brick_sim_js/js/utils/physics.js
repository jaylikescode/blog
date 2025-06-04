/**
 * Brick Simulation Game - Physics Utilities
 * Contains collision detection and physics-related functions
 */

/**
 * Detects collision between two rectangles
 * @param {Object} rect1 - The first rectangle {x, y, width, height}
 * @param {Object} rect2 - The second rectangle {x, y, width, height}
 * @returns {boolean} True if the rectangles collide, false otherwise
 */
function rectIntersect(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

/**
 * Detects collision between a circle and a rectangle
 * @param {Object} circle - The circle {x, y, radius}
 * @param {Object} rect - The rectangle {x, y, width, height}
 * @returns {Object|null} Collision data or null if no collision
 */
function circleRectCollision(circle, rect) {
    // Find the closest point to the circle within the rectangle
    const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
    const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
    
    // Calculate the distance between the circle's center and the closest point
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    // If the distance is less than the circle's radius, an intersection occurs
    const collision = distanceSquared <= (circle.radius * circle.radius);
    
    if (!collision) {
        return null;
    }
    
    // Determine which side of the rectangle the collision occurred on
    // This helps determine the bounce direction
    const dx = circle.x - rect.x;
    const dy = circle.y - rect.y;
    const width = rect.width;
    const height = rect.height;
    
    // Calculate relative position of collision
    const relX = dx / width;
    const relY = dy / height;
    
    // Determine collision side
    let side;
    if (Math.abs(relX - 0.5) > Math.abs(relY - 0.5)) {
        // Horizontal collision (left or right)
        side = relX < 0.5 ? 'left' : 'right';
    } else {
        // Vertical collision (top or bottom)
        side = relY < 0.5 ? 'top' : 'bottom';
    }
    
    return { 
        collision: true, 
        side: side,
        x: closestX,
        y: closestY,
        distance: Math.sqrt(distanceSquared)
    };
}

/**
 * Calculates the bounce angle for a ball hitting the paddle
 * @param {Object} ball - The ball object {x, y, radius, velocityX, velocityY}
 * @param {Object} paddle - The paddle object {x, y, width, height}
 * @returns {number} The new X velocity for the ball
 */
function calculatePaddleBounce(ball, paddle) {
    // Calculate where the ball hit the paddle
    // 0 = left edge, 1 = right edge
    const hitPosition = (ball.x - paddle.x) / paddle.width;
    
    // Calculate bounce angle between -60 and 60 degrees
    const bounceAngle = (hitPosition * 120 - 60) * (Math.PI / 180);
    
    // Calculate new velocity components
    const speed = Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY);
    
    // Return the new X velocity (Y velocity will be set by the collision handler)
    return Math.sin(bounceAngle) * speed;
}

/**
 * Reflects a vector based on a normal vector
 * @param {number} vx - X component of the vector to reflect
 * @param {number} vy - Y component of the vector to reflect
 * @param {number} nx - X component of the normal vector
 * @param {number} ny - Y component of the normal vector
 * @returns {Object} The reflected vector {x, y}
 */
function reflectVector(vx, vy, nx, ny) {
    // Calculate dot product
    const dot = vx * nx + vy * ny;
    
    // Calculate reflection
    const rx = vx - 2 * dot * nx;
    const ry = vy - 2 * dot * ny;
    
    return { x: rx, y: ry };
}

/**
 * Detects whether a point is inside a rectangle
 * @param {number} x - X coordinate of the point
 * @param {number} y - Y coordinate of the point
 * @param {Object} rect - The rectangle {x, y, width, height}
 * @returns {boolean} True if the point is inside the rectangle, false otherwise
 */
function pointInRect(x, y, rect) {
    return (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
    );
}
