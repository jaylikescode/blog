/**
 * Input Manager
 * Handles keyboard, mouse, and touch input for the game
 */

// 클래스 정의
class InputManager {
    constructor() {
        console.log('InputManager 초기화 중...');
        
        // Key state tracking
        this.keys = {};
        this.lastKeys = {}; // Previous frame key state
        
        // Mouse state tracking
        this.mousePos = { x: 0, y: 0 };
        this.mouseDown = false;
        this.lastMouseDown = false;
        
        // Touch state tracking
        this.touchActive = false;
        this.touchPos = { x: 0, y: 0 };
        
        // Track binding status
        this.bindingsActive = false;
        
        console.log('InputManager 초기화 완료');
    }
    
    /**
     * Sets up event listeners for keyboard, mouse, and touch input
     * @param {HTMLElement} targetElement - Element to attach listeners to (usually canvas)
     */
    setupEventListeners(targetElement) {
        console.log('InputManager: 이벤트 리스너 설정 중...');
        
        if (!targetElement) {
            console.error('InputManager: 이벤트 리스너 설정 실패 - 대상 요소가 없습니다');
            return;
        }
        
        // Prevent binding multiple times
        if (this.bindingsActive) {
            console.warn('InputManager: 이벤트 리스너가 이미 설정되어 있습니다');
            return;
        }
        
        // Document-level keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Element-level mouse events
        targetElement.addEventListener('mousemove', (e) => this.updateMousePosition(e));
        targetElement.addEventListener('mousedown', () => { this.mouseDown = true; });
        targetElement.addEventListener('mouseup', () => { this.mouseDown = false; });
        
        // Element-level touch events
        targetElement.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        targetElement.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        targetElement.addEventListener('touchend', () => { this.touchActive = false; });
        
        // Mark as bound
        this.bindingsActive = true;
        console.log('InputManager: 이벤트 리스너 설정 완료');
    }
    
    /**
     * Handles key down events
     * @param {KeyboardEvent} e - The key event
     */
    handleKeyDown(e) {
        this.keys[e.key] = true;
        this.keys[e.code] = true;
        
        // Prevent default behavior for arrow keys and space to avoid page scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'].includes(e.key) ||
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
    }
    
    /**
     * Handles key up events
     * @param {KeyboardEvent} e - The key event
     */
    handleKeyUp(e) {
        this.keys[e.key] = false;
        this.keys[e.code] = false;
    }
    
    /**
     * Updates mouse position based on event
     * @param {MouseEvent} e - The mouse event
     */
    updateMousePosition(e) {
        const rect = e.target.getBoundingClientRect();
        const scaleX = e.target.width / rect.width;
        const scaleY = e.target.height / rect.height;
        
        this.mousePos.x = (e.clientX - rect.left) * scaleX;
        this.mousePos.y = (e.clientY - rect.top) * scaleY;
    }
    
    /**
     * Handles touch start events
     * @param {TouchEvent} e - The touch event
     */
    handleTouchStart(e) {
        e.preventDefault();
        this.touchActive = true;
        this.mouseDown = true; // Treat touch as mouse down
        this.updateTouchPosition(e);
    }
    
    /**
     * Handles touch move events
     * @param {TouchEvent} e - The touch event
     */
    handleTouchMove(e) {
        e.preventDefault();
        this.updateTouchPosition(e);
    }
    
    /**
     * Updates touch position based on event
     * @param {TouchEvent} e - The touch event
     */
    updateTouchPosition(e) {
        if (e.touches.length > 0) {
            const rect = e.target.getBoundingClientRect();
            const touch = e.touches[0];
            const scaleX = e.target.width / rect.width;
            const scaleY = e.target.height / rect.height;
            
            this.touchPos.x = (touch.clientX - rect.left) * scaleX;
            this.touchPos.y = (touch.clientY - rect.top) * scaleY;
            
            // Sync mouse position with touch for unified input handling
            this.mousePos.x = this.touchPos.x;
            this.mousePos.y = this.touchPos.y;
        }
    }
    
    /**
     * Updates input state before each frame
     */
    update() {
        // Save current state for next frame comparison
        this.lastKeys = {...this.keys};
        this.lastMouseDown = this.mouseDown;
    }
    
    /**
     * Checks if a key is currently pressed
     * @param {string} key - The key to check
     * @returns {boolean} True if the key is pressed
     */
    isKeyDown(key) {
        return this.keys[key] === true;
    }
    
    /**
     * Checks if a key was just pressed this frame
     * @param {string} key - The key to check
     * @returns {boolean} True if the key was just pressed
     */
    isKeyPressed(key) {
        return this.keys[key] === true && this.lastKeys[key] !== true;
    }
    
    /**
     * Checks if a key was just released this frame
     * @param {string} key - The key to check
     * @returns {boolean} True if the key was just released
     */
    isKeyReleased(key) {
        return this.keys[key] !== true && this.lastKeys[key] === true;
    }
    
    /**
     * Gets the current mouse position
     * @returns {Object} The mouse position {x, y}
     */
    getMousePosition() {
        return this.mousePos;
    }
    
    /**
     * Checks if mouse button is down
     * @returns {boolean} True if mouse button is down
     */
    isMouseDown() {
        return this.mouseDown;
    }
    
    /**
     * Checks if mouse button was just clicked this frame
     * @returns {boolean} True if mouse was just clicked
     */
    isMouseClicked() {
        return this.mouseDown && !this.lastMouseDown;
    }
    
    /**
     * Checks if touch is currently active
     * @returns {boolean} True if touch is active
     */
    isTouchActive() {
        return this.touchActive;
    }
}

// 전역 객체에 클래스 등록
window.InputManager = InputManager;
console.log('InputManager 클래스가 전역 객체에 등록되었습니다:', typeof window.InputManager !== 'undefined' ? '성공' : '실패');
