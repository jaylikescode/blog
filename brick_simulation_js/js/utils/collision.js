/**
 * collision.js
 * Utility functions for collision detection and handling
 * Updated with support for responsive scaling
 */

/**
 * Check if a ball collides with a paddle
 * @param {object} ball - The ball object with position and radius
 * @param {object} paddle - The paddle object with position and dimensions
 * @returns {boolean} True if collision detected
 */
export function detectPaddleCollision(ball, paddle) {
    // Check if the ball is in the same vertical range as the paddle
    const paddleTopY = paddle.position.y;
    const paddleBottomY = paddle.position.y + paddle.height;
    const ballBottomY = ball.position.y + ball.radius;
    
    // Check if the ball is in the same horizontal range as the paddle
    const paddleLeftX = paddle.position.x;
    const paddleRightX = paddle.position.x + paddle.width;
    
    return (
        ballBottomY >= paddleTopY && 
        ball.position.y <= paddleBottomY &&
        ball.position.x >= paddleLeftX && 
        ball.position.x <= paddleRightX &&
        ball.speed.y > 0  // Ball is moving downward
    );
}

/**
 * Handle ball collision with paddle including advanced angle reflection
 * @param {object} ball - The ball object with position, radius and speed
 * @param {object} paddle - The paddle object with position and dimensions
 */
export function handlePaddleCollision(ball, paddle) {
    // Calculate where on the paddle the ball hit (normalized from -1 to 1)
    const hitPosition = (ball.position.x - (paddle.position.x + paddle.width / 2)) / (paddle.width / 2);
    
    // Adjust angle based on where the ball hit the paddle
    // Maximum angle is 60 degrees (π/3 radians)
    const maxBounceAngle = Math.PI / 3;
    const bounceAngle = hitPosition * maxBounceAngle;
    
    // Calculate the base ball speed adjusted for the current scale factor
    // This ensures consistent physics feel across different screen sizes
    let ballSpeed = Math.sqrt(ball.speed.x * ball.speed.x + ball.speed.y * ball.speed.y);
    
    // Apply a small speed boost on paddle hit for better gameplay
    // but ensure the speed doesn't exceed a maximum based on scale factor
    const speedBoost = 0.05;
    const maxSpeed = ball.initialSpeed * 1.5;
    
    ballSpeed = Math.min(ballSpeed * (1 + speedBoost), maxSpeed);
    
    // Calculate new velocity based on the bounce angle
    ball.speed.x = ballSpeed * Math.sin(bounceAngle);
    ball.speed.y = -ballSpeed * Math.cos(bounceAngle);
    
    // Ensure the ball is above the paddle after collision with a small offset based on scaling
    const safetyOffset = 1 * (ball.scaleFactor || 1); // Small extra offset to prevent immediate re-collision
    ball.position.y = paddle.position.y - ball.radius - safetyOffset;
}

/**
 * Check if a ball collides with a brick
 * @param {object} ball - The ball object with position and radius
 * @param {object} brick - The brick object with position and dimensions
 * @returns {boolean} True if collision detected
 */
export function detectBrickCollision(ball, brick) {
    if (!brick.active) return false;
    
    const ballLeft = ball.position.x - ball.radius;
    const ballRight = ball.position.x + ball.radius;
    const ballTop = ball.position.y - ball.radius;
    const ballBottom = ball.position.y + ball.radius;
    
    const brickLeft = brick.position.x;
    const brickRight = brick.position.x + brick.width;
    const brickTop = brick.position.y;
    const brickBottom = brick.position.y + brick.height;
    
    // Check if the ball and brick overlap
    return (
        ballRight > brickLeft && 
        ballLeft < brickRight && 
        ballBottom > brickTop && 
        ballTop < brickBottom
    );
}

/**
 * Handle collision response between ball and brick
 * @param {object} ball - The ball object with position and speed
 * @param {object} brick - The brick object with position and dimensions
 * @returns {string} Which side of the brick was hit
 */
export function handleBrickCollision(ball, brick) {
    // Determine which side of the brick was hit
    const ballCenterX = ball.position.x;
    const ballCenterY = ball.position.y;
    const brickCenterX = brick.position.x + brick.width / 2;
    const brickCenterY = brick.position.y + brick.height / 2;
    
    // Calculate difference between centers
    const dx = ballCenterX - brickCenterX;
    const dy = ballCenterY - brickCenterY;
    
    // Calculate the absolute width and height differences
    const width = (ball.radius + brick.width / 2);
    const height = (ball.radius + brick.height / 2);
    
    let bounceDirection;
    
    // Determine which side was hit based on overlap, accounting for brick's aspect ratio
    if(Math.abs(dx) * brick.height > Math.abs(dy) * brick.width) {
        // Hit on the left or right side
        bounceDirection = (dx > 0) ? 'left' : 'right';
        ball.speed.x = Math.abs(ball.speed.x) * (dx > 0 ? 1 : -1);
        
        // Ensure ball is properly positioned outside the brick
        const safetyOffset = 0.5 * (ball.scaleFactor || 1);
        if(dx > 0) { // hit from right side
            ball.position.x = brickCenterX + brick.width/2 + ball.radius + safetyOffset;
        } else { // hit from left side
            ball.position.x = brickCenterX - brick.width/2 - ball.radius - safetyOffset;
        }
    } else {
        // Hit on the top or bottom side
        bounceDirection = (dy > 0) ? 'top' : 'bottom';
        ball.speed.y = Math.abs(ball.speed.y) * (dy > 0 ? 1 : -1);
        
        // Ensure ball is properly positioned outside the brick
        const safetyOffset = 0.5 * (ball.scaleFactor || 1);
        if(dy > 0) { // hit from bottom
            ball.position.y = brickCenterY + brick.height/2 + ball.radius + safetyOffset;
        } else { // hit from top
            ball.position.y = brickCenterY - brick.height/2 - ball.radius - safetyOffset;
        }
    }
    
    // Apply a small random variation to the ball speed to make gameplay more interesting
    // but ensure we respect the scale factor for consistent feel across screen sizes
    const speedVariation = 0.03 * (ball.scaleFactor || 1);
    const baseSpeed = Math.sqrt(ball.speed.x * ball.speed.x + ball.speed.y * ball.speed.y);
    const newSpeed = baseSpeed * (1 + (Math.random() * speedVariation - speedVariation/2));
    
    // Normalize the speed vector and apply the new speed
    const speedMagnitude = Math.sqrt(ball.speed.x * ball.speed.x + ball.speed.y * ball.speed.y);
    ball.speed.x = (ball.speed.x / speedMagnitude) * newSpeed;
    ball.speed.y = (ball.speed.y / speedMagnitude) * newSpeed;
    
    // Deactivate the brick
    brick.active = false;
    
    return bounceDirection;
}
