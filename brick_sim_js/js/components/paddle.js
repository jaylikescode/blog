/**
 * Brick Simulation Game - Paddle Component
 * Handles player-controlled paddle movement and ball interactions
 */

class Paddle extends GameObject {
    /**
     * Creates a new paddle
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {number} width - The width of the paddle
     * @param {number} height - The height of the paddle
     * @param {string} color - The color of the paddle
     * @param {number} speed - The movement speed of the paddle
     * @param {number} screenWidth - The width of the game screen
     */
    constructor(x, y, width, height, color, speed, screenWidth) {
        super(x, y, width, height, color);
        this.speed = speed;
        this.screenWidth = screenWidth;
        this.originalWidth = width;
        this.originalSpeed = speed;
        this.extendTimer = 0;
        this.inputHandler = this.handleInput.bind(this);
        this.keys = {
            left: false,
            right: false
        };
        
        // Set up input event listeners
        this.setupInputHandlers();
    }
    
    /**
     * Sets up keyboard event listeners
     */
    setupInputHandlers() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                this.keys.left = true;
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                this.keys.right = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                this.keys.left = false;
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                this.keys.right = false;
            }
        });
        
        // Add touch/mouse support for mobile devices
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    }
    
    /**
     * Handles mouse movement
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseMove(e) {
        // Get canvas position and scale
        const canvas = document.getElementById('game-canvas');
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        
        // Calculate paddle position based on mouse position
        let mouseX = (e.clientX - rect.left) * scaleX;
        this.x = mouseX - (this.width / 2);
        
        // Clamp paddle position to screen bounds
        this.x = clamp(this.x, 0, this.screenWidth - this.width);
    }
    
    /**
     * Handles touch movement
     * @param {TouchEvent} e - The touch event
     */
    handleTouchMove(e) {
        // Prevent scrolling when touching the game
        e.preventDefault();
        
        if (e.touches.length > 0) {
            const canvas = document.getElementById('game-canvas');
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            
            // Calculate paddle position based on touch position
            let touchX = (e.touches[0].clientX - rect.left) * scaleX;
            this.x = touchX - (this.width / 2);
            
            // Clamp paddle position to screen bounds
            this.x = clamp(this.x, 0, this.screenWidth - this.width);
        }
    }
    
    /**
     * Handles keyboard input
     */
    handleInput() {
        if (this.keys.left) {
            this.x -= this.speed;
        }
        if (this.keys.right) {
            this.x += this.speed;
        }
        
        // Clamp paddle position to screen bounds
        this.x = clamp(this.x, 0, this.screenWidth - this.width);
    }
    
    /**
     * Updates the paddle state
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Handle input
        this.handleInput();
        
        // Update extend timer if active
        if (this.extendTimer > 0) {
            this.extendTimer -= deltaTime;
            if (this.extendTimer <= 0) {
                this.resetSize();
            }
        }
    }
    
    /**
     * Extends the paddle size (power-up effect)
     * @param {number} factor - The factor to increase the paddle size by
     * @param {number} duration - The duration of the effect in milliseconds
     */
    extend(factor, duration) {
        this.width = this.originalWidth * factor;
        this.extendTimer = duration;
    }
    
    /**
     * Resets the paddle to its original size
     */
    resetSize() {
        this.width = this.originalWidth;
        this.extendTimer = 0;
    }
    
    /**
     * Calculates how the ball should bounce off the paddle
     * @param {Ball} ball - The ball that hit the paddle
     */
    calculateBallBounce(ball) {
        // Calculate bounce based on where the ball hit the paddle
        const hitPosition = (ball.x - this.x) / this.width;
        
        // Adjust ball velocity based on hit position
        ball.velocityX = calculatePaddleBounce(ball, this);
        
        // Ensure ball is moving upward after hitting paddle
        ball.velocityY = -Math.abs(ball.velocityY);
        
        // Slightly increase ball speed with each hit, up to max speed
        const currentSpeed = Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY);
        if (currentSpeed < CONFIG.BALL_MAX_SPEED) {
            const speedFactor = 1.05;
            ball.velocityX *= speedFactor;
            ball.velocityY *= speedFactor;
        }
    }
    
    /**
     * Renders the paddle with a more appealing visual style
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        if (!this.visible) return;
        
        if (this.sprite) {
            // Render sprite if available
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            // Create a more visually appealing paddle with gradient and rounded corners
            ctx.save();
            
            // Create gradient
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, "#005599");
            
            // Draw rounded rectangle
            const radius = this.height / 2;
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.moveTo(this.x + radius, this.y);
            ctx.lineTo(this.x + this.width - radius, this.y);
            ctx.arc(this.x + this.width - radius, this.y + radius, radius, -Math.PI/2, Math.PI/2, false);
            ctx.lineTo(this.x + radius, this.y + this.height);
            ctx.arc(this.x + radius, this.y + radius, radius, Math.PI/2, -Math.PI/2, false);
            ctx.closePath();
            ctx.fill();
            
            // Add highlight
            ctx.beginPath();
            ctx.moveTo(this.x + radius, this.y + 2);
            ctx.lineTo(this.x + this.width - radius, this.y + 2);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    /**
     * Cleans up event listeners when the paddle is no longer needed
     */
    cleanup() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('touchmove', this.handleTouchMove);
    }
}
