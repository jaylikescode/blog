/**
 * Brick Simulation Game - Main Game Controller
 * Manages the game loop, object updates, and rendering
 */

class Game {
    /**
     * Creates a new Game instance
     * @param {HTMLCanvasElement} canvas - The canvas element
     */
    constructor(canvas) {
        // Canvas and rendering context
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Game state
        this.state = 'loading'; // 'loading', 'menu', 'playing', 'paused', 'gameOver'
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 60 FPS
        this.running = false;
        this.paused = false;
        
        // Game objects and managers
        this.paddle = null;
        this.balls = [];
        this.items = [];
        
        // Input tracking
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.mouseDown = false;
        this.touchActive = false;
        
        // Game stats and settings
        this.lives = CONFIG.INITIAL_LIVES;
        this.gameTime = 0;
        this.elapsedSinceLastFrame = 0;
        this.debugMode = false;
        this.soundEnabled = true;
        
        // Initialize the game
        this.init();
    }
    
    /**
     * Canvas 요소 존재 여부 확인 및 복구 시도
     * @returns {boolean} 캔버스 초기화 성공 여부
     */
    ensureCanvasExists() {
        console.log('게임 캔버스 확인 중...');
        
        // 이미 캔버스가 존재하는 경우
        if (this.canvas && this.ctx) {
            console.log('캔버스가 이미 초기화되어 있습니다:', this.canvas.id);
            return true;
        }
        
        console.log('캔버스를 재초기화 시도합니다...');
        
        // 다양한 방법으로 캔버스 요소 찾기 시도
        let canvas = null;
        
        // 1. ID로 찾기
        canvas = document.getElementById('game-canvas');
        if (canvas) {
            console.log('game-canvas ID로 캔버스를 찾았습니다.');
        } else {
            // 2. querySelector로 찾기
            canvas = document.querySelector('#game-canvas');
            if (canvas) {
                console.log('querySelector로 #game-canvas 캔버스를 찾았습니다.');
            } else {
                // 3. 첫 번째 캔버스 요소 사용
                const canvases = document.getElementsByTagName('canvas');
                if (canvases.length > 0) {
                    canvas = canvases[0];
                    canvas.id = 'game-canvas'; // ID 설정
                    console.log('첫 번째 캔버스 요소를 사용합니다. ID를 game-canvas로 설정했습니다.');
                } else {
                    // 4. 새 캔버스 동적 생성
                    console.log('캔버스가 없습니다. 새로 생성합니다.');
                    try {
                        const container = document.querySelector('.game-container');
                        if (!container) {
                            console.error('.game-container를 찾을 수 없습니다!'); 
                            return false;
                        }
                        
                        canvas = document.createElement('canvas');
                        canvas.id = 'game-canvas';
                        canvas.width = 800;
                        canvas.height = 600;
                        
                        // 캔버스를 컨테이너에 추가
                        container.prepend(canvas);
                        console.log('새 캔버스 요소를 생성하여 DOM에 추가했습니다.');
                    } catch (e) {
                        console.error('캔버스 생성 중 오류:', e);
                        return false;
                    }
                }
            }
        }
        
        // 캔버스 초기화
        if (canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.width = canvas.width;
            this.height = canvas.height;
            console.log('캔버스 초기화 성공!', canvas.width, 'x', canvas.height);
            return true;
        }
        
        console.error('캔버스 초기화 실패!');
        return false;
    }
    
    /**
     * Initializes the game
     */
    init() {
        console.log('Game.init 시작');
        
        // 캔버스 요소 확인 및 초기화
        if (!this.ensureCanvasExists()) {
            console.error('캔버스 초기화 실패로 게임을 시작할 수 없습니다.');
            const errorMsg = '캔버스 초기화 실패. 브라우저가 HTML5 Canvas를 지원하는지 확인하세요.';
            if (typeof showError === 'function') {
                showError(errorMsg);
            } else {
                alert(errorMsg);
            }
            return;
        }
        
        // Initialize managers
        // Using fallbackOnly mode to ensure all assets are procedurally generated
        this.assetManager = new AssetManager({ fallbackOnly: true });
        this.levelManager = new LevelManager(this);
        this.inputManager = new InputManager();
        this.uiManager = new UIManager(this);
        this.collisionManager = new CollisionManager();
        this.scoreManager = new ScoreManager();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up asset manager callbacks before loading assets
        console.log('[DEBUG] Game: 에셋 매니저 콜백 설정...');
        this.assetManager.setCallbacks(
            // Progress callback
            (progress) => {
                console.log(`[DEBUG] 에셋 로딩 진행률: ${progress}%`);
                // Update loading progress display
                this.renderLoadingScreen(progress);
            },
            // Complete callback
            (success) => {
                console.log(`[DEBUG] 에셋 로딩 완료 콜백 실행됨! 성공: ${success}`);
                if (success) {
                    // Show main menu
                    console.log('[DEBUG] 게임 상태를 menu로 변경...');
                    this.state = 'menu';
                    
                    console.log('[DEBUG] menuSystem:', this.menuSystem ? '정의됨' : '정의되지 않음');
                    if (this.menuSystem) {
                        console.log('[DEBUG] 메인 메뉴 화면 표시 시도...');
                        this.menuSystem.setScreen('main');
                        console.log('[DEBUG] 현재 메뉴 화면:', this.menuSystem.currentScreen);
                    } else {
                        console.error('[DEBUG] menuSystem이 정의되지 않아 메뉴를 표시할 수 없습니다!');
                    }
                } else {
                    // Show error
                    console.error('[DEBUG] 에셋 로딩 실패!');
                    showError(getText('loadingError'));
                }
                
                // Hide loading overlay
                console.log('[DEBUG] 로딩 오버레이 숨김 시도...');
                try {
                    hideLoading();
                    console.log('[DEBUG] 로딩 화면 숨기기 성공');
                } catch (error) {
                    console.error('[DEBUG] hideLoading 호출 오류:', error);
                }
                console.log('[DEBUG] 현재 게임 상태:', this.state);
            }
        );

        // Initial resize to set up the canvas correctly
        this.handleResize();
        
        // Load assets (this must be called AFTER setting callbacks)
        this.loadAssets();
        
        console.log('[DEBUG] Game.init 완료');
    }
    
    /**
     * Sets up event listeners for keyboard, mouse, and touch input
     */
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Handle pause toggle with Escape key
            if (e.code === 'Escape' && this.state === 'playing') {
                this.togglePause();
            }
            
            // Prevent default behavior for game control keys
            if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            this.updateMousePosition(e);
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            // Launch ball if it's attached to paddle
            if (this.state === 'playing') {
                this.launchBallIfAttached();
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchActive = true;
            this.updateTouchPosition(e);
            // Launch ball if it's attached to paddle
            if (this.state === 'playing') {
                this.launchBallIfAttached();
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.updateTouchPosition(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchActive = false;
        }, { passive: false });
        
        // Window resize event
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Menu action events
        window.addEventListener('menuAction', (e) => {
            this.handleMenuAction(e.detail.action);
        });
    }
    
    /**
     * Updates mouse position
     * @param {MouseEvent} e - The mouse event
     */
    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.mousePos = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    /**
     * Updates touch position
     * @param {TouchEvent} e - The touch event
     */
    updateTouchPosition(e) {
        if (e.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            this.mousePos = {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
    }
    
    /**
     * Handles window resize events
     */
    handleResize() {
        // Update canvas size based on parent container size
        const container = this.canvas.parentElement;
        const containerStyle = window.getComputedStyle(container);
        const paddingX = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);
        const paddingY = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom);
        
        const availableWidth = container.clientWidth - paddingX;
        const availableHeight = container.clientHeight - paddingY;
        
        // Calculate aspect ratio
        const gameAspectRatio = CONFIG.SCREEN_WIDTH / CONFIG.SCREEN_HEIGHT;
        const containerAspectRatio = availableWidth / availableHeight;
        
        let newWidth, newHeight;
        
        if (containerAspectRatio > gameAspectRatio) {
            // Container is wider than game aspect ratio
            newHeight = availableHeight;
            newWidth = newHeight * gameAspectRatio;
        } else {
            // Container is taller than game aspect ratio
            newWidth = availableWidth;
            newHeight = newWidth / gameAspectRatio;
        }
        
        // Update canvas size
        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;
    }
    
    /**
     * Loads game assets (images and sounds)
     */
    loadAssets() {
        console.log('[DEBUG] Game.loadAssets() 시작');
        // Show loading overlay
        console.log('[DEBUG] showLoading() 호출...');
        try {
            showLoading();
            console.log('[DEBUG] 로딩 오버레이 표시됨');
        } catch (error) {
            console.error('[DEBUG] 로딩 오버레이 표시 중 오류 발생:', error);
        }
        
        // COMMENTED OUT: Original external asset loading
        // Future improvement: Uncomment and add proper assets when they're available
        /*
        // Define image assets to load
        const imageAssets = {
            'paddle': 'assets/images/paddle.png',
            'ball': 'assets/images/ball.png',
            'brick_normal': 'assets/images/brick_normal.png',
            'brick_strong': 'assets/images/brick_strong.png',
            'brick_unbreakable': 'assets/images/brick_unbreakable.png',
            'item_extend': 'assets/images/item_extend.png',
            'item_life': 'assets/images/item_life.png',
            'item_multi': 'assets/images/item_multi.png',
            'item_slow': 'assets/images/item_slow.png',
            'background': 'assets/images/background.png'
        };
        // Define audio assets to load
        const audioAssets = {
            'paddle_hit': 'assets/sounds/paddle_hit.mp3',
            'brick_hit': 'assets/sounds/brick_hit.mp3',
            'brick_break': 'assets/sounds/brick_break.mp3',
            'item_collect': 'assets/sounds/item_collect.mp3',
            'level_complete': 'assets/sounds/level_complete.mp3',
            'game_over': 'assets/sounds/game_over.mp3',
            'life_lost': 'assets/sounds/life_lost.mp3'
        };
        
        // Load assets (fallbacks will be generated for missing files by our enhanced AssetManager)
        console.log('\ub85c\ub529 \uc2dc\uc791 - \uc678\ubd80 \ud30c\uc77c \uc5c6\uc744 \uacbd\uc6b0 \uc790\ub3d9\uc73c\ub85c \uc0dd\uc131\ub429\ub2c8\ub2e4');
        this.assetManager.loadImages(imageAssets);
        this.assetManager.loadAudio(audioAssets);
        */
        
        // IMPLEMENTATION: Use programmatically generated assets instead of external files
        // This approach allows the game to run without any external asset files
        console.log('[DEBUG] 에셋 생성 시작 - 프로그래밍 방식으로만 생성');
        
        // Register all required asset names so they can be generated by the AssetManager
        console.log('[DEBUG] registerRequiredAssets() 호출...');
        this.registerRequiredAssets();
        console.log('[DEBUG] 필요한 에셋 등록 완료');
        
        // Check if all expected assets are properly registered
        console.log('[DEBUG] 이미지 에셋 등록 확인:', Array.from(this.assetManager.images.keys()));
        console.log('[DEBUG] 오디오 에셋 등록 확인:', Array.from(this.assetManager.audio.keys()));
        
        // Check if onComplete is actually set
        console.log('[DEBUG] this.assetManager.onComplete 설정됨?', !!this.assetManager.onComplete);
        
        // Call the asset loading completion callback manually since we're not loading external files
        if (this.assetManager.onComplete) {
            console.log('[DEBUG] 500ms 후 onComplete 콜백 호출 예정...');
            setTimeout(() => {
                // Small timeout to simulate loading and allow the UI to render
                console.log('[DEBUG] 500ms 타임아웃 후 onComplete 호출 중...');
                this.assetManager.onComplete(true); // Explicitly pass success=true
                console.log('[DEBUG] onComplete 호출 완료');

                // Additional logging to check game state after callback
                console.log('[DEBUG] onComplete 후 게임 상태:', this.state);
                console.log('[DEBUG] 현재 메뉴 화면:', this.menuSystem ? this.menuSystem.currentScreen : '메뉴시스템 없음');
            }, 500);
        } else {
            console.error('[DEBUG] this.assetManager.onComplete이 설정되지 않았습니다! 로딩 완료를 알릴 수 없습니다.');
        }

        console.log('[DEBUG] Game.loadAssets() 종료');
    }

    /**
     * Registers all required assets to the asset manager for procedural generation
     * This allows for easy extensibility when adding new assets in the future
     */
    registerRequiredAssets() {
        console.log('[DEBUG] Game.registerRequiredAssets() 시작');

        try {
            // Define required image assets (these will be procedurally generated)
            const requiredImages = [
                'paddle',
                'ball',
                'brick_normal',
                'brick_strong',
                'brick_unbreakable',
                'item_extend',
                'item_life',
                'item_multi',
                'item_slow',
                'background'
            ];

            // Define required audio assets (these will be synthesized)
            const requiredAudio = [
                'paddle_hit',
                'brick_hit',
                'brick_break',
                'item_collect',
                'level_complete',
                'game_over',
                'life_lost'
            ];

            console.log(`[DEBUG] 필요한 이미지 에셋: ${requiredImages.length}개, 오디오 에셋: ${requiredAudio.length}개`);

            // Register image assets with the asset manager
            console.log('[DEBUG] 이미지 에셋 등록 중...');
            requiredImages.forEach(name => {
                console.log(`[DEBUG] ${name} 이미지 에셋 생성 중...`);
                const fallbackImage = this.assetManager.createFallbackImage(name);
                this.assetManager.images.set(name, fallbackImage);
            });
            console.log('[DEBUG] 모든 이미지 에셋이 성공적으로 등록됨');

            // Register audio assets with the asset manager
            console.log('[DEBUG] 오디오 에셋 등록 중...');
            requiredAudio.forEach(name => {
                console.log(`[DEBUG] ${name} 오디오 에셋 생성 중...`);
                const fallbackAudio = this.assetManager.createFallbackAudio(name);
                this.assetManager.audio.set(name, fallbackAudio);
            });
            console.log('[DEBUG] 모든 오디오 에셋이 성공적으로 등록됨');
            
            const totalAssets = requiredImages.length + requiredAudio.length;
            console.log(`[DEBUG] 프로그래밍 방식으로 총 ${totalAssets}개 에셋 생성 완료 (이미지: ${requiredImages.length}, 오디오: ${requiredAudio.length})`);
        } catch (error) {
            console.error('[DEBUG] 에셋 등록 중 오류 발생:', error);
        }
        
        console.log('[DEBUG] Game.registerRequiredAssets() 종료');
    }

    /**
     * Renders the loading screen
     * @param {number} progress - Loading progress (0-100)
     */
    renderLoadingScreen(progress) {
        // Clear canvas
        this.ctx.fillStyle = CONFIG.COLOR_BLACK;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw loading text
        this.ctx.fillStyle = CONFIG.COLOR_WHITE;
        this.ctx.font = `24px ${CONFIG.FONT_FAMILY}`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(getText('loading'), this.width / 2, this.height / 2 - 50);
        
        // Draw progress bar background
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(this.width / 2 - 100, this.height / 2 - 10, 200, 20);
        
        // Draw progress bar fill
        this.ctx.fillStyle = CONFIG.COLOR_BLUE;
        this.ctx.fillRect(this.width / 2 - 100, this.height / 2 - 10, progress * 2, 20);
        
        // Draw progress percentage
        this.ctx.fillStyle = CONFIG.COLOR_WHITE;
        this.ctx.fillText(`${progress}%`, this.width / 2, this.height / 2 + 30);
    }

    /**
     * Starts the game
     */
    start() {
        if (this.running) return;
        
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Stops the game
     */
    stop() {
        this.running = false;
    }

    /**
     * The main game loop
     * @param {number} timestamp - The current timestamp
     */
    gameLoop(timestamp) {
        if (!this.running) return;
        
        // Calculate time since last frame
        const currentTime = timestamp;
        let deltaTime = currentTime - this.lastTime;
        
        // Cap deltaTime to avoid spiral of death with large delays
        if (deltaTime > 200) deltaTime = 200;
        
        this.lastTime = currentTime;
        this.elapsedSinceLastFrame = deltaTime;
        
        // Add to accumulator and update as many times as needed
        this.accumulator += deltaTime;
        
        // Update game state
        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulator -= this.timeStep;
        }
        
        // Render at screen refresh rate
        this.render();
        
        // Update game time
        this.gameTime += deltaTime;
        
        // Continue the loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Updates the game state
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    update(deltaTime) {
        // Skip updates if paused or in menu
        if (this.state === 'paused' || this.state === 'menu') {
            // Only update UI in these states
            this.menuSystem.update(deltaTime);
            return;
        }
        
        // Update game based on current state
        switch (this.state) {
            case 'playing':
                this.updatePlaying(deltaTime);
                break;
                
            case 'levelComplete':
                this.updateLevelComplete(deltaTime);
                break;
                
            case 'gameOver':
                this.updateGameOver(deltaTime);
                break;
                
            case 'gameComplete':
                this.updateGameComplete(deltaTime);
                break;
        }
    }

    /**
     * Updates the game during gameplay
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    updatePlaying(deltaTime) {
        // Update score manager
        this.scoreManager.update(deltaTime);
        
        // Update level manager
        this.levelManager.update(deltaTime);
        
        // Update paddle
        this.paddle.update(deltaTime, this.keys, this.mousePos);
        
        // Update balls
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            
            if (ball.active) {
                ball.update(deltaTime);
                
                // Check for ball-paddle collision
                this.collisionManager.checkBallPaddleCollision(ball, this.paddle);
                
                // Check for ball-brick collisions
                const brickCollision = this.collisionManager.checkBallBrickCollisions(
                    ball,
                    this.levelManager.getCurrentLevel().bricks
                );
                
                // Handle brick collision results
                if (brickCollision.collision) {
                    // Play sound
                    if (this.soundEnabled) {
                        if (brickCollision.broken) {
                            this.assetManager.playAudio('brick_break', 0.5);
                        } else {
                            this.assetManager.playAudio('brick_hit', 0.3);
                        }
                    }
                    
                    // Add points
                    if (brickCollision.points > 0) {
                        // Add combo if a brick was broken
                        if (brickCollision.broken) {
                            this.scoreManager.addCombo();
                        }
                        
                        // Add score with position of the brick
                        const points = this.scoreManager.addPoints(
                            brickCollision.points, 
                            this.scoreManager.combo > 1
                        );
                        
                        // Create a score event at the brick's position
                        if (brickCollision.brick) {
                            this.scoreManager.addScoreEvent(
                                points,
                                brickCollision.brick.x + brickCollision.brick.width / 2,
                                brickCollision.brick.y
                            );
                        }
                    }
                    
                    // Check for new item
                    if (brickCollision.item) {
                        this.items.push(brickCollision.item);
                    }
                }
                
                // Check if ball is out of bounds
                if (this.collisionManager.isBallOutOfBounds(ball)) {
                    // Remove ball
                    ball.active = false;
                    
                    // Play sound
                    if (this.soundEnabled) {
                        this.assetManager.playAudio('life_lost', 0.5);
                    }
                    
                    // Check if it was the last ball
                    if (this.getActiveBallCount() === 0) {
                        // Lose a life
                        this.lives--;
                        
                        if (this.lives <= 0) {
                            // Game over
                            this.gameOver();
                        } else {
                            // Reset for next life
                            this.resetBallAndPaddle();
                        }
                    }
                }
            }
        }
        
        // Update items
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            
            if (item.active) {
                item.update(deltaTime);
                
                // Check if item is out of bounds
                if (item.y > this.height) {
                    item.active = false;
                }
            }
        }
        
        // Check for item-paddle collisions
        const collectedItems = this.collisionManager.checkItemPaddleCollisions(this.items, this.paddle);
        
        // Handle collected items
        for (const item of collectedItems) {
            // Play sound
            if (this.soundEnabled) {
                this.assetManager.playAudio('item_collect', 0.5);
            }
            
            // Apply item effect
            this.applyItemEffect(item.type);
        }
        
        // Check if level is cleared
        if (this.levelManager.isLevelCleared()) {
            // Level complete
            if (this.soundEnabled) {
                this.assetManager.playAudio('level_complete', 0.5);
            }
            
            // Check if this was the last level
            if (this.levelManager.getCurrentLevelNumber() >= CONFIG.MAX_LEVELS) {
                // Game complete
                this.gameComplete();
            } else {
                // Next level
                this.levelComplete();
            }
        }
        
        // Update HUD
        this.hud.update(
            deltaTime,
            this.scoreManager.getScore(),
            this.lives,
            this.levelManager.getCurrentLevelNumber()
        );
    }
    
    /**
     * Updates during level complete state
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    updateLevelComplete(deltaTime) {
        // Update level manager to handle transition
        this.levelManager.update(deltaTime);
        
        // When transition is complete, start the next level
        if (!this.levelManager.isInTransition()) {
            this.startNextLevel();
        }
    }

    /**
     * Updates during game over state
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    updateGameOver(deltaTime) {
        // Update menu system
        this.menuSystem.update(deltaTime);
    }

    /**
     * Updates during game complete state
     * @param {number} deltaTime - The time passed since the last update in milliseconds
     */
    updateGameComplete(deltaTime) {
        // Update menu system
        this.menuSystem.update(deltaTime);
    }
    
    /**
     * Renders the game
     */
    render() {
        // Clear the canvas
        this.ctx.fillStyle = CONFIG.COLOR_BLACK;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw background
        const backgroundImage = this.assetManager.getImage('background');
        if (backgroundImage) {
            this.ctx.globalAlpha = 0.2;
            this.ctx.drawImage(backgroundImage, 0, 0, this.width, this.height);
            this.ctx.globalAlpha = 1.0;
        }
        
        // Only render game elements if not in menu
        if (this.state !== 'menu') {
            // Render level (bricks)
            if (this.levelManager.getCurrentLevel()) {
                this.levelManager.render(this.ctx);
            }
            
            // Render items
            for (const item of this.items) {
                if (item.active) {
                    item.render(this.ctx);
                }
            }
            
            // Render paddle
            if (this.paddle) {
                this.paddle.render(this.ctx);
            }
            
            // Render balls
            for (const ball of this.balls) {
                if (ball.active) {
                    ball.render(this.ctx);
                }
            }
            
            // Render HUD
            this.hud.render(
                this.ctx,
                this.scoreManager.getScore(),
                this.scoreManager.getHighScore(),
                this.lives,
                this.levelManager.getCurrentLevelNumber()
            );
            
            // Render score events
            this.scoreManager.renderScoreEvents(this.ctx);
        }
        
        // Render menu if active
        if (this.menuSystem.isActive()) {
            this.menuSystem.render(this.ctx);
        }
        
        // Debug rendering
        if (this.debugMode) {
            this.renderDebug();
        }
    }
    
    /**
     * Renders debug information
     */
    renderDebug() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, 200, 120);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        this.ctx.fillText(`FPS: ${Math.round(1000 / this.elapsedSinceLastFrame)}`, 10, 20);
        this.ctx.fillText(`Objects: B:${this.balls.length} I:${this.items.length}`, 10, 40);
        this.ctx.fillText(`State: ${this.state}`, 10, 60);
        this.ctx.fillText(`Level: ${this.levelManager.getCurrentLevelNumber()}`, 10, 80);
        this.ctx.fillText(`Combo: ${this.scoreManager.combo}x`, 10, 100);
        
        this.ctx.restore();
    }

    /**
     * Initializes a new game
     */
    initializeGame() {
        // Reset game state
        this.state = 'playing';
        this.lives = CONFIG.INITIAL_LIVES;
        this.scoreManager.resetScore();
        
        // Initialize level manager
        this.levelManager.initialize();
        
        // Create paddle
        this.paddle = new Paddle(
            this.width / 2 - CONFIG.PADDLE_WIDTH / 2,
            this.height - CONFIG.PADDLE_HEIGHT - 20,
            CONFIG.PADDLE_WIDTH,
            CONFIG.PADDLE_HEIGHT,
            CONFIG.PADDLE_SPEED,
            this.width
        );
        
        // Create initial ball
        this.createBall(true); // Attached to paddle
        
        // Clear items
        this.items = [];
        
        // Reset collisions
        this.collisionManager.clearEvents();
        
        // Show "Get Ready" message
        this.hud.showFlashMessage(getText('getReady'));
    }

    /**
     * Creates a new ball
     * @param {boolean} attached - Whether the ball starts attached to the paddle
     */
    createBall(attached = false) {
        const ball = new Ball(
            this.paddle.x + this.paddle.width / 2 - CONFIG.BALL_SIZE / 2,
            this.paddle.y - CONFIG.BALL_SIZE - 2,
            CONFIG.BALL_SIZE,
            CONFIG.BALL_SIZE,
            CONFIG.BALL_SPEED,
            this.width,
            this.height
        );
        
        if (attached) {
            ball.attachToPaddle(this.paddle);
        }
        
        this.balls.push(ball);
        return ball;
    }

    /**
     * Launches any attached balls
     */
    launchBallIfAttached() {
        let ballLaunched = false;
        
        for (const ball of this.balls) {
            if (ball.attached) {
                ball.launch();
                ballLaunched = true;
            }
        }
        
        return ballLaunched;
    }

    /**
     * Gets the count of active balls
     * @returns {number} The number of active balls
     */
    getActiveBallCount() {
        return this.balls.filter(ball => ball.active).length;
    }

    /**
     * Resets the ball and paddle for a new life
     */
    resetBallAndPaddle() {
        // Reset paddle position
        this.paddle.reset();
        
        // Create a new ball attached to the paddle
        this.createBall(true);
        
        // Remove any inactive balls
        this.balls = this.balls.filter(ball => ball.active);
        
        // Show "Get Ready" message
        this.hud.showFlashMessage(getText('getReady'));
    }

    /**
     * Applies the effect of a collected item
     * @param {string} itemType - The type of item
     */
    applyItemEffect(itemType) {
        switch (itemType) {
            case 'extend':
                // Extend paddle size
                this.paddle.extend();
                this.hud.showFlashMessage(getText('itemExtend'));
                break;
                
            case 'life':
                // Add an extra life
                this.lives = Math.min(this.lives + 1, CONFIG.MAX_LIVES);
                this.hud.showFlashMessage(getText('itemLife'));
                break;
                
            case 'multi':
                // Add an extra ball
                if (this.balls.length < CONFIG.MAX_BALLS) {
                    // Create a new ball at a random position on the paddle
                    const newBall = this.createBall();
                    newBall.x = this.paddle.x + Math.random() * this.paddle.width;
                    newBall.y = this.paddle.y - CONFIG.BALL_SIZE - 2;
                    newBall.launch();
                }
                this.hud.showFlashMessage(getText('itemMulti'));
                break;
                
            case 'slow':
                // Slow down all balls
                for (const ball of this.balls) {
                    ball.setSlowSpeed();
                }
                this.hud.showFlashMessage(getText('itemSlow'));
                break;
        }
    }

    /**
     * Toggles the pause state
     */
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.menuSystem.setScreen('pause');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.menuSystem.setScreen('none');
        }
    }

    /**
     * Transitions to level complete state
     */
    levelComplete() {
        this.state = 'levelComplete';
        this.levelManager.startLevelTransition();
        this.hud.showFlashMessage(getText('levelComplete') + ' ' + this.levelManager.getCurrentLevelNumber());
        
        // Store current score for the menu
        this.menuSystem.setScore(this.scoreManager.getScore(), this.scoreManager.getHighScore());
    }

    /**
     * Starts the next level
     */
    startNextLevel() {
        // Advance to next level
        const hasNextLevel = this.levelManager.nextLevel();
        
        if (hasNextLevel) {
            // Reset ball and paddle for new level
            this.resetBallAndPaddle();
            
            // Clear items
            this.items = [];
            
            // Back to playing state
            this.state = 'playing';
        } else {
            // No more levels, game complete
            this.gameComplete();
        }
    }

    /**
     * Transitions to game over state
     */
    gameOver() {
        this.state = 'gameOver';
        
        // Store current score for the menu
        this.menuSystem.setScore(this.scoreManager.getScore(), this.scoreManager.getHighScore());
        
        // Play game over sound
        if (this.soundEnabled) {
            this.assetManager.playAudio('game_over', 0.5);
        }
        
        // Show game over menu after a delay
        setTimeout(() => {
            this.menuSystem.setScreen('gameOver');
        }, 2000);
    }

    /**
     * Transitions to game complete state
     */
    gameComplete() {
        this.state = 'gameComplete';
        
        // Store current score for the menu
        this.menuSystem.setScore(this.scoreManager.getScore(), this.scoreManager.getHighScore());
        
        // Show game complete menu
        this.menuSystem.setScreen('gameComplete');
    }

    /**
     * Handles menu actions
     * @param {string} action - The menu action
     */
    handleMenuAction(action) {
        switch (action) {
            case 'startGame':
                this.initializeGame();
                break;
                
            case 'resumeGame':
                if (this.state === 'paused') {
                    this.state = 'playing';
                    this.menuSystem.setScreen('none');
                }
                break;
                
            case 'restartGame':
                this.initializeGame();
                break;
                
            case 'exitToMenu':
                this.state = 'menu';
                this.menuSystem.setScreen('main');
                break;
                
            case 'toggleSound':
                this.toggleSound();
                break;
                
            case 'toggleLanguage':
                const newLang = getCurrentLanguage() === 'en' ? 'ko' : 'en';
                setLanguage(newLang);
                this.menuSystem.updateLanguage();
                this.hud.updateLanguage();
                break;
        }
    }

    /**
     * Toggles debug mode
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        console.log(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
    }

    /**
     * Toggles sound
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        console.log(`Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`);
        
        // Mute/unmute all audio
        this.assetManager.setMute(!this.soundEnabled);
    }
}

// 전역 객체에 클래스 등록
window.Game = Game;
console.log('Game 클래스가 전역 객체에 등록되었습니다:', typeof window.Game !== 'undefined' ? '성공' : '실패');
