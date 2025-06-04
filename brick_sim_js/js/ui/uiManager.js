/**
 * UI Manager
 * Manages UI components, menus, and HUD for the game
 */

class UIManager {
    /**
     * Creates a new UI Manager
     * @param {Game} game - Reference to the game instance
     */
    constructor(game) {
        console.log('UIManager 초기화 중...');
        
        this.game = game;
        
        // UI components
        this.hud = null;
        this.menuSystem = null;
        
        // Modal overlay for menus
        this.modalOverlay = document.querySelector('.modal-overlay');
        if (!this.modalOverlay) {
            console.log('모달 오버레이 요소를 생성합니다.');
            this.createModalOverlay();
        }
        
        // Create UI components
        this.createComponents();
        
        console.log('UIManager 초기화 완료');
    }
    
    /**
     * Creates modal overlay if it doesn't exist
     */
    createModalOverlay() {
        this.modalOverlay = document.createElement('div');
        this.modalOverlay.className = 'modal-overlay';
        this.modalOverlay.style.position = 'absolute';
        this.modalOverlay.style.top = '0';
        this.modalOverlay.style.left = '0';
        this.modalOverlay.style.width = '100%';
        this.modalOverlay.style.height = '100%';
        this.modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.modalOverlay.style.display = 'none';
        this.modalOverlay.style.zIndex = '10';
        
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.appendChild(this.modalOverlay);
        } else {
            document.body.appendChild(this.modalOverlay);
        }
    }
    
    /**
     * Creates UI components
     */
    createComponents() {
        try {
            // Create HUD
            if (typeof HUD !== 'undefined') {
                this.hud = new HUD(this.game.ctx, this.game.width, this.game.height);
                console.log('HUD 생성 완료');
            } else {
                console.error('HUD 클래스가 정의되지 않았습니다');
            }
            
            // Create menu system
            if (typeof MenuSystem !== 'undefined') {
                try {
                    // Always use the standard MenuSystem constructor with context parameter
                    // Make sure we're passing a valid canvas rendering context
                    if (this.game && this.game.ctx && typeof this.game.ctx.fillRect === 'function') {
                        // Use game's context directly
                        this.menuSystem = new MenuSystem(this.game.ctx, this.game.width, this.game.height);
                        console.log('MenuSystem 생성 완료 (게임 컨텍스트 사용)');
                    } else if (this.game && this.game.canvas) {
                        // Try to get a fresh context from canvas
                        const ctx = this.game.canvas.getContext('2d');
                        this.menuSystem = new MenuSystem(ctx, this.game.canvas.width, this.game.canvas.height);
                        console.log('MenuSystem 생성 완료 (캔버스에서 새 컨텍스트 생성)');
                    } else {
                        // Last resort - create a temporary canvas
                        console.warn('게임 컨텍스트를 찾을 수 없어 임시 캔버스를 생성합니다');
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = 800;
                        tempCanvas.height = 600;
                        const ctx = tempCanvas.getContext('2d');
                        this.menuSystem = new MenuSystem(ctx, tempCanvas.width, tempCanvas.height);
                        console.log('MenuSystem 생성 완료 (임시 캔버스 사용)');
                    }
                } catch (error) {
                    console.error('MenuSystem 생성 중 오류:', error);
                }
            } else {
                console.error('MenuSystem 클래스가 정의되지 않았습니다');
            }
            
            // Store references in game object for easier access
            this.game.hud = this.hud;
            this.game.menuSystem = this.menuSystem;
        } catch (error) {
            console.error('UI 컴포넌트 생성 중 오류:', error);
        }
    }
    
    /**
     * Shows a menu screen
     * @param {string} screenId - ID of the menu screen to show
     */
    showMenu(screenId) {
        this.menuSystem.setScreen(screenId);
    }
    
    /**
     * Hides the current menu
     */
    hideMenu() {
        this.menuSystem.setScreen('none');
    }
    
    /**
     * Shows a flash message on the HUD
     * @param {string} message - Message to display
     * @param {number} duration - Duration in milliseconds
     */
    showFlashMessage(message, duration = 2000) {
        this.hud.showFlashMessage(message, duration);
    }
    
    /**
     * Updates UI components
     * @param {number} deltaTime - Time passed since last update
     */
    update(deltaTime) {
        if (this.hud) {
            this.hud.update(deltaTime);
        }
        
        if (this.menuSystem) {
            this.menuSystem.update(deltaTime);
        }
    }
    
    /**
     * Renders UI components
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // HUD is always rendered when the game is playing
        if (this.hud && this.game.state === 'playing') {
            this.hud.render(ctx);
        }
        
        // Menu system renders itself when active
        if (this.menuSystem) {
            this.menuSystem.render(ctx);
        }
    }
    
    /**
     * Updates language strings after language change
     */
    updateLanguage() {
        if (this.hud) {
            this.hud.updateLanguage();
        }
        
        if (this.menuSystem) {
            this.menuSystem.updateLanguage();
        }
    }
}

// 전역 객체에 클래스 등록
window.UIManager = UIManager;
console.log('UIManager 클래스가 전역 객체에 등록되었습니다:', typeof window.UIManager !== 'undefined' ? '성공' : '실패');
