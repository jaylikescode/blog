/**
 * Brick Simulation Game - Configuration
 * Contains all game constants and settings
 */

const CONFIG = {
    // Screen settings
    SCREEN_WIDTH: 800,
    SCREEN_HEIGHT: 600,
    SCREEN_TITLE: "Brick Simulation",
    FPS: 60,
    
    // Colors
    COLOR_BLACK: "#000000",
    COLOR_WHITE: "#FFFFFF",
    COLOR_RED: "#FF0000",
    COLOR_GREEN: "#00FF00",
    COLOR_BLUE: "#0088FF",
    COLOR_YELLOW: "#FFFF00",
    COLOR_ORANGE: "#FFA500",
    COLOR_PURPLE: "#800080",
    COLOR_CYAN: "#00FFFF",
    COLOR_GRAY: "#808080",
    
    // Paddle settings
    PADDLE_WIDTH: 100,
    PADDLE_HEIGHT: 20,
    PADDLE_COLOR: "#0088FF",
    PADDLE_SPEED: 8,
    PADDLE_BOTTOM_MARGIN: 30,
    
    // Ball settings
    BALL_RADIUS: 10,
    BALL_COLOR: "#FFFFFF",
    BALL_SPEED_X: 4,
    BALL_SPEED_Y: -4,
    BALL_MAX_SPEED: 15,
    
    // Brick settings
    BRICK_WIDTH: 75,
    BRICK_HEIGHT: 20,
    BRICK_MARGIN: 5,
    BRICK_ROWS: 5,
    BRICK_COLS: 10,
    BRICK_TOP_MARGIN: 50,
    
    // Brick types and colors
    BRICK_TYPES: [
        { name: "normal", color: "#FF0000", points: 10, hits: 1 },
        { name: "strong", color: "#FFFF00", points: 20, hits: 2 },
        { name: "unbreakable", color: "#808080", points: 50, hits: -1 }
    ],
    
    // Item settings
    ITEM_SIZE: 20,
    ITEM_SPEED: 3,
    
    // Item types and probabilities
    ITEM_TYPES: [
        { name: "extend", probability: 0.3 },  // Extend paddle
        { name: "slow", probability: 0.3 },    // Slow ball
        { name: "multi", probability: 0.2 },   // Multi-ball
        { name: "life", probability: 0.1 },    // Extra life
        { name: "laser", probability: 0.2 },   // Laser power
        { name: "fast", probability: 0.2 },    // Fast ball
        { name: "warp", probability: 0.05 }    // Warp to next level
    ],
    
    // Game settings
    STARTING_LIVES: 3,
    
    // Text settings
    FONT_SIZE_SMALL: 16,
    FONT_SIZE_MEDIUM: 24,
    FONT_SIZE_LARGE: 36,
    FONT_FAMILY: "Arial, sans-serif",
    
    // Level settings
    MAX_LEVELS: 10,
    LEVEL_BRICK_INCREASE: 5,  // Additional bricks per level
    
    // Multilingual support
    LANGUAGES: {
        en: {
            start: "Press SPACE to start",
            pause: "PAUSED - Press P to resume",
            gameOver: "GAME OVER - Press ENTER to restart",
            levelCleared: "LEVEL CLEARED!",
            score: "Score: ",
            lives: "Lives: ",
            level: "Level: ",
            ball_lost: "Ball lost! Press SPACE to launch"
        },
        ko: {
            start: "시작하려면 스페이스 바를 누르세요",
            pause: "일시 중지 - 계속하려면 P를 누르세요",
            gameOver: "게임 오버 - 다시 시작하려면 ENTER를 누르세요",
            levelCleared: "레벨 클리어!",
            score: "점수: ",
            lives: "생명: ",
            level: "레벨: ",
            ball_lost: "공을 잃었습니다! 발사하려면 스페이스 바를 누르세요"
        }
    },
    
    // Current language (default: en)
    CURRENT_LANGUAGE: "en"
};
