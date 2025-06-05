/**
 * Responsive utilities for the Brick Simulator game
 * Handles resize events, touch controls, and scaling calculations
 */

/**
 * Sets up the resize handler for responsive canvas
 * @param {Function} resizeCallback - Function to call when resize occurs
 */
export function setupResizeHandler(resizeCallback) {
    // Initial resize
    if (resizeCallback) resizeCallback();
    
    // Handle window resize events
    window.addEventListener('resize', () => {
        if (resizeCallback) resizeCallback();
    });
    
    // Handle device orientation changes
    window.addEventListener('orientationchange', () => {
        // Short delay to allow the orientation change to complete
        setTimeout(() => {
            if (resizeCallback) resizeCallback();
        }, 100);
    });
    
    // Listen for iframe resize messages if in iframe
    if (isInIframe()) {
        window.addEventListener('message', (event) => {
            // Check if message is from parent and contains resize info
            if (event.data && event.data.type === 'resize') {
                if (resizeCallback) resizeCallback();
            }
        });
    }
}

/**
 * Get scale factor based on base dimensions and current dimensions
 * @param {number} baseWidth - Original/base width
 * @param {number} baseHeight - Original/base height
 * @param {number} currentWidth - Current width
 * @param {number} currentHeight - Current height
 * @returns {number} - Scale factor to apply to game elements
 */
export function getScaleFactor(baseWidth, baseHeight, currentWidth, currentHeight) {
    // Calculate scale factors for width and height
    const widthScale = currentWidth / baseWidth;
    const heightScale = currentHeight / baseHeight;
    
    // Use the smaller scale to ensure everything fits
    return Math.min(widthScale, heightScale);
}

/**
 * Set up touch controls for mobile devices
 * @param {Object} paddle - The paddle object to control
 * @param {HTMLElement} controlsContainer - Container element for touch controls
 */
export function setupTouchControls(paddle, controlsContainer) {
    // Make sure the controls container exists
    if (!controlsContainer) return;
    
    // Create the controls container
    const touchContainer = document.createElement('div');
    touchContainer.className = 'touch-controls-container';
    
    // Create left control
    const leftControl = document.createElement('div');
    leftControl.className = 'touch-control left-control';
    leftControl.innerHTML = '←';
    leftControl.setAttribute('aria-label', 'Move Left');
    
    // Create right control
    const rightControl = document.createElement('div');
    rightControl.className = 'touch-control right-control';
    rightControl.innerHTML = '→';
    rightControl.setAttribute('aria-label', 'Move Right');
    
    // Add controls to container
    touchContainer.appendChild(leftControl);
    touchContainer.appendChild(rightControl);
    controlsContainer.appendChild(touchContainer);
    
    // Handle touch events for left control
    leftControl.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        paddle.moveLeft();
    });
    
    leftControl.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (paddle.speed < 0) paddle.stop();
    });
    
    // Handle touch events for right control
    rightControl.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        paddle.moveRight();
    });
    
    rightControl.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (paddle.speed > 0) paddle.stop();
    });
    
    // Make controls visible
    controlsContainer.style.display = 'block';
    
    // Also handle direct canvas touch for paddle movement
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.addEventListener('touchstart', handleCanvasTouch);
        canvas.addEventListener('touchmove', handleCanvasTouch);
        
        function handleCanvasTouch(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const canvasRect = canvas.getBoundingClientRect();
            const touchX = touch.clientX - canvasRect.left;
            
            // Move paddle based on touch position relative to canvas center
            if (touchX < canvasRect.width / 2) {
                paddle.moveLeft();
            } else {
                paddle.moveRight();
            }
        }
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            paddle.stop();
        });
    }
}

/**
 * Check if the game is running within an iframe
 * @returns {boolean} - True if in iframe, false otherwise
 */
export function checkIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        // If we can't access window.top due to same-origin policy, we're in an iframe
        return true;
    }
}

/**
 * Check if the device is in portrait or landscape mode
 * @returns {string} - 'portrait' or 'landscape'
 */
export function getOrientation() {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

/**
 * Send a message to the parent iframe if available
 * @param {Object} message - Message object to send
 */
export function sendMessageToParent(message) {
    if (isInIframe()) {
        try {
            window.parent.postMessage(message, '*');
        } catch (e) {
            console.warn('Could not send message to parent:', e);
        }
    }
}

/**
 * Helper function to check if in iframe
 * @returns {boolean} - True if in iframe
 */
function isInIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
