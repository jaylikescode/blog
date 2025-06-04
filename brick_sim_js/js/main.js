/**
 * Main entry point for the Brick Simulation game
 */
console.log('main.js가 로드되었습니다. 페이지 로딩 상태:', document.readyState);

// DOM 컨텐츠가 로드되었을 때 로그 출력
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded 이벤트 발생. 페이지 로딩 상태:', document.readyState);
    console.log('현재 canvas 요소 존재 여부:', document.getElementById('game-canvas') ? '존재함' : '존재하지 않음');
    
    // DOM 요소 검사 함수
    function inspectDOM() {
        console.log('DOM 검사 중... 페이지 로딩 상태:', document.readyState);
        console.log('현재 body에 있는 모든 요소:');
        console.log(document.body.innerHTML);
        
        const canvasElements = document.querySelectorAll('canvas');
        console.log(`canvas 요소 수: ${canvasElements.length}개`);
        canvasElements.forEach((canvas, index) => {
            console.log(`Canvas #${index+1} - id: "${canvas.id}", width: ${canvas.width}, height: ${canvas.height}`);
        });
        
        // ID가 있는 모든 요소 출력
        const elementsWithId = document.querySelectorAll('[id]');
        console.log(`ID가 있는 요소 수: ${elementsWithId.length}개`);
        elementsWithId.forEach(el => {
            console.log(`ID: "${el.id}", 태그: ${el.tagName.toLowerCase()}`);
        });
    }
    
    // DOM 검사 실행
    inspectDOM();
    
    // 폰트 로딩 후 게임 초기화
    document.fonts.ready.then(() => {
        console.log('폰트 로딩 완료. 게임 초기화 시작...');
        initGame();
    });
});

// 페이지가 완전히 로드된 후에도 검사
window.addEventListener('load', () => {
    console.log('window.load 이벤트 발생. 페이지 로딩 상태:', document.readyState);
    console.log('페이지 완전 로드 후 canvas 요소 존재 여부:', document.getElementById('game-canvas') ? '존재함' : '존재하지 않음');
});

/**
 * Initialize the game
 */
function initGame() {
    console.log('[DEBUG] initGame 함수 실행 시작');
    
    // 필수 클래스 로딩 확인
    console.log('[DEBUG] 필수 클래스 로딩 확인:');
    const requiredClasses = ['InputManager', 'AssetManager', 'UIManager', 'CollisionManager', 'Game'];
    let allClassesLoaded = true;
    
    requiredClasses.forEach(className => {
        const isLoaded = window[className] !== undefined;
        console.log(`[DEBUG] - ${className}: ${isLoaded ? '로드됨 ✓' : '로드되지 않음 ✗'}`);
        if (!isLoaded) {
            allClassesLoaded = false;
        }
    });
    
    if (!allClassesLoaded) {
        console.error('[DEBUG] 필수 클래스가 로드되지 않았습니다. 게임을 초기화할 수 없습니다.');
        alert('게임 초기화에 필요한 스크립트가 로드되지 않았습니다. 페이지를 새로고침해 주세요.');
        return;
    }
    
    // Canvas 요소를 여러 방법으로 찾기 시도
    console.log('[DEBUG] Canvas 요소 검색 시도...');
    let canvas = null;
    
    // window.gameCanvas 확인 (인라인 스크립트에서 설정됨)
    if (window.gameCanvas) {
        console.log('[DEBUG] window.gameCanvas 발견!');
        canvas = window.gameCanvas;
    } else {
        // 방법 1: ID로 찾기
        canvas = document.getElementById('game-canvas');
        console.log('[DEBUG] 방법 1 (getElementById): 결과 =', canvas ? '성공' : '실패');
        
        // 방법 2: querySelector 사용
        if (!canvas) {
            canvas = document.querySelector('#game-canvas');
            console.log('[DEBUG] 방법 2 (querySelector): 결과 =', canvas ? '성공' : '실패');
        }
        
        // 방법 3: querySelector로 태그로 찾기
        if (!canvas) {
            canvas = document.querySelector('canvas');
            console.log('[DEBUG] 방법 3 (querySelector by tag): 결과 =', canvas ? '성공' : '실패');
        }
        
        // 방법 4: getElementsByTagName 사용
        if (!canvas) {
            const canvases = document.getElementsByTagName('canvas');
            if (canvases.length > 0) {
                canvas = canvases[0];
                console.log('[DEBUG] 방법 4 (getElementsByTagName): 결과 =', canvas ? '성공' : '실패');
            }
        }
    }
    
    // Canvas를 찾지 못한 경우
    if (!canvas) {
        console.error('[DEBUG] Canvas element not found after all attempts!');
        
        // 디버깅을 위해 DOM에 존재하는 모든 요소 ID 출력
        console.log('[DEBUG] 존재하는 모든 요소 ID 목록:');
        document.querySelectorAll('[id]').forEach(el => console.log(el.id));
        
        // Canvas를 만들어서 추가하려는 시도
        try {
            console.log('[DEBUG] 새 Canvas 요소 동적 생성 시도...');
            const container = document.querySelector('.game-container');
            
            if (container) {
                // 기존 Canvas가 있는지 확인
                const existingCanvas = container.querySelector('canvas');
                if (existingCanvas) {
                    console.log('[DEBUG] 기존 Canvas가 존재함. ID 설정 시도');
                    existingCanvas.id = 'game-canvas';
                    canvas = existingCanvas;
                } else {
                    // 새 Canvas 생성
                    canvas = document.createElement('canvas');
                    canvas.id = 'game-canvas';
                    canvas.width = 800;
                    canvas.height = 600;
                    
                    // 요소의 새 배치 순서 처리
                    const loadingOverlay = container.querySelector('#loading-overlay');
                    if (loadingOverlay) {
                        container.insertBefore(canvas, loadingOverlay);
                    } else {
                        container.appendChild(canvas);
                    }
                    console.log('[DEBUG] 새 Canvas 생성 완료!');
                }
            } else {
                console.error('[DEBUG] .game-container를 찾을 수 없음');
            }
        } catch (e) {
            console.error('[DEBUG] Canvas 동적 생성 중 오류:', e);
        }
        
        // 여전히 Canvas가 없는 경우 중단
        if (!canvas) {
            console.error('[DEBUG] Canvas를 찾거나 생성할 수 없어 게임 초기화를 중단합니다.');
            alert('Canvas 요소를 초기화할 수 없습니다. 브라우저가 HTML5 Canvas를 지원하는지 확인하세요.');
            return;
        }
    }
    
    console.log('[DEBUG] 캔버스 요소 찾음:', canvas.id, `(${canvas.width}x${canvas.height})`);
    
    try {
        // Set initial canvas size based on container
        const container = canvas.parentElement;
        console.log('[DEBUG] Canvas 크기 조정 시도...');
        resizeCanvas(canvas, container);
        console.log('[DEBUG] Canvas 크기 조정 완료:', `${canvas.width}x${canvas.height}`);
        
        // Game 인스턴스 생성 및 시작
        console.log('[DEBUG] Game 인스턴스 생성 시작...');
        window.game = new Game(canvas);
        console.log('[DEBUG] Game 인스턴스 생성 완료');
        
        console.log('[DEBUG] 게임 시작...');
        window.game.start();
        console.log('[DEBUG] 게임 시작 완료');
        
        // Handle window resize
        window.addEventListener('resize', () => {
            resizeCanvas(canvas, container);
            if (window.game) {
                window.game.handleResize(canvas.width, canvas.height);
            }
        });
        
        // Add keyboard shortcuts for debugging
        window.addEventListener('keydown', (e) => {
            // Only in development mode (remove or disable in production)
            if (e.code === 'KeyD' && e.ctrlKey && window.game) {
                window.game.toggleDebugMode();
            }
        });
    } catch (error) {
        console.error('[DEBUG] 게임 초기화 중 오류 발생:', error);
        console.error('[DEBUG] 오류 스택:', error.stack);
        alert(`게임 초기화 중 오류가 발생했습니다: ${error.message}`);
    }
}

/**
 * Resize the canvas to fit its container while maintaining aspect ratio
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {HTMLElement} container - The container element
 */
function resizeCanvas(canvas, container) {
    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Define game aspect ratio (16:9 or 4:3)
    const aspectRatio = 16 / 9;
    
    // Calculate canvas size to fit in container while maintaining aspect ratio
    let canvasWidth = containerWidth;
    let canvasHeight = containerWidth / aspectRatio;
    
    // If height exceeds container, scale down
    if (canvasHeight > containerHeight) {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * aspectRatio;
    }
    
    // Round to integer values
    canvasWidth = Math.floor(canvasWidth);
    canvasHeight = Math.floor(canvasHeight);
    
    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}
