/**
 * Brick Simulation Game - Menu System
 * Handles game menus, screens, and UI state
 */

class MenuSystem {
    /**
     * Creates a new menu system
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} width - The width of the canvas
     * @param {number} height - The height of the canvas
     */
    constructor(ctx, width, height) {
        console.log('[DEBUG] MenuSystem 생성자 호출됨');
        
        if (!ctx) {
            console.error('[ERROR] MenuSystem 생성자에 ctx가 null 또는 undefined로 전달됨');
            return;
        }
        
        try {
            this.ctx = ctx;
            this.width = width;
            this.height = height;
            this.textRenderer = new TextRenderer(ctx);
            this.currentScreen = 'main'; // 'main', 'paused', 'gameOver', etc.
            this.buttons = [];
            this.fadeAlpha = 0;
            this.fadeDirection = 'none'; // 'in', 'out', 'none'
            this.fadeSpeed = 0.05;
            this.fadeCallback = null;
            this.animationTime = 0;
            this.buttonHighlight = -1;
            this.canvas = ctx.canvas;
            
            console.log('[DEBUG] MenuSystem 초기화 성공');
            console.log('[DEBUG] MenuSystem 크기:', width, 'x', height);
            console.log('[DEBUG] MenuSystem 현재 화면:', this.currentScreen);
            
            // Set up event listeners
            this.setupEventListeners();
        } catch (error) {
            console.error('[ERROR] MenuSystem 생성자 초기화 중 오류 발생:', error);
        }
    }
    
    /**
     * Sets up event listeners for menu interaction
     */
    setupEventListeners() {
        // Mouse move event for button highlighting
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            
            // Check which button is being hovered
            this.buttonHighlight = -1;
            for (let i = 0; i < this.buttons.length; i++) {
                const button = this.buttons[i];
                if (mouseX >= button.x && mouseX <= button.x + button.width &&
                    mouseY >= button.y && mouseY <= button.y + button.height) {
                    this.buttonHighlight = i;
                    break;
                }
            }
        });
        
        // Click event for button activation
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            
            // Check which button was clicked
            for (const button of this.buttons) {
                if (mouseX >= button.x && mouseX <= button.x + button.width &&
                    mouseY >= button.y && mouseY <= button.y + button.height) {
                    if (button.onClick) {
                        button.onClick();
                    }
                    break;
                }
            }
        });
    }
    
    /**
     * Updates the menu system
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    update(deltaTime) {
        // Update animation time
        this.animationTime += deltaTime;
        
        // Handle fading transitions
        if (this.fadeDirection === 'in') {
            this.fadeAlpha += this.fadeSpeed;
            if (this.fadeAlpha >= 1) {
                this.fadeAlpha = 1;
                this.fadeDirection = 'none';
                if (this.fadeCallback) {
                    this.fadeCallback();
                    this.fadeCallback = null;
                }
            }
        } else if (this.fadeDirection === 'out') {
            this.fadeAlpha -= this.fadeSpeed;
            if (this.fadeAlpha <= 0) {
                this.fadeAlpha = 0;
                this.fadeDirection = 'none';
                if (this.fadeCallback) {
                    this.fadeCallback();
                    this.fadeCallback = null;
                }
            }
        }
    }
    
    /**
     * Renders the current menu screen
     */
    render() {
        // 디버그 로그 추가
        if (!this.renderCalled) {
            console.log('[DEBUG] MenuSystem.render() 처음 호출됨');
            console.log('[DEBUG] MenuSystem ctx 상태:', this.ctx ? '정상' : '없음');
            console.log('[DEBUG] MenuSystem 현재 화면:', this.currentScreen);
            console.log('[DEBUG] MenuSystem 캔버스 크기:', this.width, 'x', this.height);
            this.renderCalled = true;
        }
        
        try {
            // Clear buttons array for this frame
            this.buttons = [];
            
            // Render the appropriate screen
            switch (this.currentScreen) {
                case 'main':
                    console.log('[DEBUG] MenuSystem.renderMainMenu() 호출');
                    this.renderMainMenu();
                    break;
                case 'paused':
                    console.log('[DEBUG] MenuSystem.renderPauseMenu() 호출');
                    this.renderPauseMenu();
                    break;
                case 'gameOver':
                    console.log('[DEBUG] MenuSystem.renderGameOverMenu() 호출');
                    this.renderGameOverMenu();
                    break;
                case 'levelComplete':
                    console.log('[DEBUG] MenuSystem.renderLevelCompleteMenu() 호출');
                    this.renderLevelCompleteMenu();
                    break;
                case 'gameComplete':
                    console.log('[DEBUG] MenuSystem.renderGameCompleteMenu() 호출');
                    this.renderGameCompleteMenu();
                    break;
                default:
                    console.log('[DEBUG] MenuSystem 알 수 없는 화면:', this.currentScreen);
                    break;
            }
            
            // Render buttons
            console.log(`[DEBUG] MenuSystem.renderButtons() 호출 - 버튼 ${this.buttons.length}개`);
            this.renderButtons();
            
            // Render fade overlay if active
            if (this.fadeAlpha > 0) {
                this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
        } catch (error) {
            console.error('[ERROR] MenuSystem.render() 오류 발생:', error);
        }
    }
    
    /**
     * Renders the main menu screen
     */
    renderMainMenu() {
        console.log('[DEBUG] MenuSystem.renderMainMenu() 시작');
        
        try {
            // Semi-transparent background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Game title
            this.textRenderer.drawOutlinedText('BRICK SIMULATION', this.width / 2, 100, {
                fontSize: 48,
                align: 'center',
                fontWeight: 'bold',
                fillColor: CONFIG.COLOR_BLUE,
                strokeColor: '#000000'
            });
            
            // Create menu buttons
            this.addButton(
                this.width / 2 - 100,
                this.height / 2 - 30,
                200,
                50,
                getText('startGame'),
                () => {
                    this.fadeOut(() => {
                        this.currentScreen = 'none'; // Exit menu mode
                        // The game will handle starting the game
                        window.dispatchEvent(new CustomEvent('menuAction', {
                            detail: { action: 'startGame' }
                        }));
                    });
                }
            );
            
            // Instructions button
            this.addButton(
                this.width / 2 - 100,
                this.height / 2 + 40,
                200,
                50,
                getText('instructions'),
                () => {
                    // Show instructions screen
                    alert(getText('instructionsText')); // Simplified, could be a proper screen
                }
            );
            
            // Language toggle button
            this.addButton(
                this.width / 2 - 100,
                this.height / 2 + 110,
                200,
                50,
                CONFIG.CURRENT_LANGUAGE === 'en' ? '한국어' : 'English',
                () => {
                    // Toggle language
                    const newLang = CONFIG.CURRENT_LANGUAGE === 'en' ? 'ko' : 'en';
                    setLanguage(newLang);
                    // Force re-render
                    this.render();
                }
            );
        } catch (error) {
            console.error('[ERROR] renderMainMenu() 오류:', error);
        }
    }
    
    /**
     * Renders the pause menu screen
     */
    renderPauseMenu() {
        console.log('[DEBUG] MenuSystem.renderPauseMenu() 시작');
        try {
            // Semi-transparent background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Pause title
            this.textRenderer.drawOutlinedText(getText('paused'), this.width / 2, 150, {
                fontSize: 48,
                align: 'center',
                fontWeight: 'bold',
                fillColor: CONFIG.COLOR_YELLOW
            });
            
            // Resume button
            this.addButton(
                this.width / 2 - 100,
                this.height / 2 - 30,
                200,
                50,
                getText('resume'),
                () => {
                    this.fadeOut(() => {
                        this.currentScreen = 'none';
                        window.dispatchEvent(new CustomEvent('menuAction', {
                            detail: { action: 'resumeGame' }
                        }));
                    });
                }
            );
            
            // Restart button
            this.addButton(
                this.width / 2 - 100,
                this.height / 2 + 40,
                200,
                50,
                getText('restart'),
                () => {
                    this.fadeOut(() => {
                        this.currentScreen = 'none';
                        window.dispatchEvent(new CustomEvent('menuAction', {
                            detail: { action: 'restartGame' }
                        }));
                    });
                }
            );
            
            // Exit button
            this.addButton(
                this.width / 2 - 100,
                this.height / 2 + 110,
                200,
                50,
                getText('exitToMenu'),
                () => {
                    this.fadeOut(() => {
                        this.currentScreen = 'main';
                        window.dispatchEvent(new CustomEvent('menuAction', {
                            detail: { action: 'exitToMenu' }
                        }));
                    });
                }
            );
        } catch (error) {
            console.error('[ERROR] renderPauseMenu() 오류:', error);
        }
    }
    
    /**
     * Renders the game over menu screen
     */
    renderGameOverMenu() {
        console.log('[DEBUG] MenuSystem.renderGameOverMenu() 시작');
        try {
            // Semi-transparent background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Game Over text
            this.textRenderer.drawOutlinedText(getText('gameOver'), this.width / 2, 150, {
                fontSize: 48,
                align: 'center',
                fontWeight: 'bold',
                fillColor: CONFIG.COLOR_RED
            });
            
            // Score display
            const score = window.gameScore || 0;
            this.textRenderer.drawText(`${getText('finalScore')}: ${score}`, this.width / 2, 220, {
                fontSize: 24,
                align: 'center',
                color: CONFIG.COLOR_WHITE
            });
            
            // High score display
            const highScore = window.gameHighScore || 0;
            this.textRenderer.drawText(`${getText('highScore')}: ${highScore}`, this.width / 2, 260, {
                fontSize: 24,
                align: 'center',
                color: CONFIG.COLOR_YELLOW
            });
            // Try Again button
            this.addButton(
                this.width / 2 - 100,
                this.height / 2 + 40,
                200,
                50,
                getText('tryAgain'),
                () => {
                    this.fadeOut(() => {
                        this.currentScreen = 'none';
                        window.dispatchEvent(new CustomEvent('menuAction', {
                            detail: { action: 'restartGame' }
                        }));
                    });
                }
            );
            
            // Exit button
            this.addButton(
                this.width / 2 - 100,
                this.height / 2 + 110,
                200,
                50,
                getText('exitToMenu'),
                () => {
                    this.fadeOut(() => {
                        this.currentScreen = 'main';
                        window.dispatchEvent(new CustomEvent('menuAction', {
                            detail: { action: 'exitToMenu' }
                        }));
                    });
                }
            );
        } catch (error) {
            console.error('[ERROR] renderGameOverMenu() 오류:', error);
        }
    }
    
    /**
     * Renders the level complete menu screen
     */
    renderLevelCompleteMenu() {
        console.log('[DEBUG] MenuSystem.renderLevelCompleteMenu() 시작');
        try {
            // This is handled by the level manager's transition system
            // Just pass through to the game
            this.currentScreen = 'none';
        } catch (error) {
            console.error('[ERROR] renderLevelCompleteMenu() 오류:', error);
        }
    }
    
    /**
     * Renders the game complete menu screen
     */
    renderGameCompleteMenu() {
        console.log('[DEBUG] MenuSystem.renderGameCompleteMenu() 시작');
        try {
            // Semi-transparent background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Congratulations message
            this.textRenderer.drawOutlinedText(getText('congratulations'), this.width / 2, 130, {
                fontSize: 48,
                align: 'center',
                fontWeight: 'bold',
                fillColor: CONFIG.COLOR_GREEN
            });
            
            this.textRenderer.drawText(getText('gameCompleted'), this.width / 2, 200, {
                fontSize: 32,
                align: 'center',
                color: CONFIG.COLOR_WHITE
            });
            
            // Score display
            const score = window.gameScore || 0;
            this.textRenderer.drawText(`${getText('finalScore')}: ${score}`, this.width / 2, 260, {
                fontSize: 24,
                align: 'center',
                color: CONFIG.COLOR_WHITE
            });
            
            // High score display
            const highScore = window.gameHighScore || 0;
            this.textRenderer.drawText(`${getText('highScore')}: ${highScore}`, this.width / 2, 300, {
                fontSize: 24,
                align: 'center',
                color: CONFIG.COLOR_YELLOW
            });
            
            // Play Again button
            this.addButton(
                this.width / 2 - 100,
                this.height / 2 + 80,
                200,
                50,
                getText('playAgain'),
                () => {
                    this.fadeOut(() => {
                        this.currentScreen = 'none';
                        window.dispatchEvent(new CustomEvent('menuAction', {
                            detail: { action: 'restartGame' }
                        }));
                    });
                }
            );
            
            // Exit button
            this.addButton(
                this.width / 2 - 100,
                this.height / 2 + 150,
                200,
                50,
                getText('exitToMenu'),
                () => {
                    this.fadeOut(() => {
                        this.currentScreen = 'main';
                        window.dispatchEvent(new CustomEvent('menuAction', {
                            detail: { action: 'exitToMenu' }
                        }));
                    });
                }
            );
        } catch (error) {
            console.error('[ERROR] renderGameCompleteMenu() 오류:', error);
        }
    }
    
    /**
     * Adds a button to the current menu screen
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {number} width - The width of the button
     * @param {number} height - The height of the button
     * @param {string} text - The button text
     * @param {Function} onClick - The click handler function
     */
    addButton(x, y, width, height, text, onClick) {
        this.buttons.push({
            x, y, width, height, text, onClick
        });
    }
    
    /**
     * Renders all buttons for the current menu screen
     */
    renderButtons() {
        try {
            console.log(`[DEBUG] MenuSystem.renderButtons() 시작 - 버튼 ${this.buttons.length}개 랜더링`);
            for (let i = 0; i < this.buttons.length; i++) {
                const button = this.buttons[i];
                const isHighlighted = i === this.buttonHighlight;
                
                // Draw button background
                this.ctx.save();
                
                // Button shadow
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 5;
                this.ctx.shadowOffsetX = 3;
                this.ctx.shadowOffsetY = 3;
                
                // Button background gradient
                const gradient = this.ctx.createLinearGradient(
                    button.x,
                    button.y,
                    button.x,
                    button.y + button.height
                );
                
                if (isHighlighted) {
                    // Highlighted state
                    gradient.addColorStop(0, '#4488FF');
                    gradient.addColorStop(1, '#2266DD');
                } else {
                    // Normal state
                    gradient.addColorStop(0, '#336699');
                    gradient.addColorStop(1, '#224477');
                }
                
                // Draw rounded rectangle
                const radius = 5;
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.moveTo(button.x + radius, button.y);
                this.ctx.lineTo(button.x + button.width - radius, button.y);
                this.ctx.quadraticCurveTo(button.x + button.width, button.y, button.x + button.width, button.y + radius);
                this.ctx.lineTo(button.x + button.width, button.y + button.height - radius);
                this.ctx.quadraticCurveTo(button.x + button.width, button.y + button.height, button.x + button.width - radius, button.y + button.height);
                this.ctx.lineTo(button.x + radius, button.y + button.height);
                this.ctx.quadraticCurveTo(button.x, button.y + button.height, button.x, button.y + button.height - radius);
                this.ctx.lineTo(button.x, button.y + radius);
                this.ctx.quadraticCurveTo(button.x, button.y, button.x + radius, button.y);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Button border
                this.ctx.strokeStyle = isHighlighted ? '#66AAFF' : '#5588CC';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                this.ctx.restore();
                
                // Draw button text
                this.textRenderer.drawText(button.text, button.x + button.width / 2, button.y + button.height / 2, {
                    fontSize: 20,
                    color: '#FFFFFF',
                    align: 'center',
                    baseline: 'middle',
                    fontWeight: 'bold'
                });
            }
        } catch (error) {
            console.error('[ERROR] renderButtons() 오류:', error);
        }
    }
    
    /**
     * Sets the current menu screen
     * @param {string} screen - The screen to show
     */
    setScreen(screen) {
        console.log(`[DEBUG] MenuSystem.setScreen('${screen}') 호출됨 (이전 화면: '${this.currentScreen}')`);
        this.currentScreen = screen;
        this.fadeIn();
    }
    
    /**
     * Checks if the menu is currently active
     * @returns {boolean} True if a menu is active, false otherwise
     */
    isActive() {
        const isActive = this.currentScreen !== 'none';
        // 처음 호출시에만 로그 출력
        if (!this.isActiveLogged) {
            console.log(`[DEBUG] MenuSystem.isActive() = ${isActive} (currentScreen = '${this.currentScreen}')`);
            this.isActiveLogged = true;
        }
        return isActive;
    }
    
    /**
     * Gets the current screen name
     * @returns {string} The current screen name
     */
    getCurrentScreen() {
        return this.currentScreen;
    }
    
    /**
     * Fades in the current menu
     * @param {Function} callback - Called when fade in completes
     */
    fadeIn(callback) {
        this.fadeDirection = 'in';
        this.fadeCallback = callback;
    }
    
    /**
     * Fades out the current menu
     * @param {Function} callback - Called when fade out completes
     */
    fadeOut(callback) {
        this.fadeDirection = 'out';
        this.fadeCallback = callback;
    }
}
