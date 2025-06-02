"""
Bric Game Configuration
Contains all game constants and settings
"""

# Screen settings
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
SCREEN_TITLE = "Bric Game"
FPS = 60

# Colors (RGB)
COLOR_BLACK = (0, 0, 0)
COLOR_WHITE = (255, 255, 255)
COLOR_GRAY = (150, 150, 150)
COLOR_RED = (255, 0, 0)
COLOR_GREEN = (0, 255, 0)
COLOR_BLUE = (0, 0, 255)
COLOR_YELLOW = (255, 255, 0)
COLOR_ORANGE = (255, 165, 0)
COLOR_PURPLE = (128, 0, 128)
COLOR_CYAN = (0, 255, 255)

# Game area settings
GAME_TOP_MARGIN = 50  # Space at top for score display

# Paddle settings
PADDLE_WIDTH = 100
PADDLE_HEIGHT = 20
PADDLE_COLOR = COLOR_CYAN
PADDLE_SPEED = 8
PADDLE_BOTTOM_MARGIN = 20  # Distance from bottom of screen

# Ball settings
BALL_RADIUS = 10
BALL_COLOR = COLOR_WHITE
BALL_SPEED_X = 5
BALL_SPEED_Y = -5
BALL_MAX_SPEED = 12

# Brick settings
BRICK_WIDTH = 75
BRICK_HEIGHT = 20
BRICK_MARGIN = 5  # Space between bricks
BRICK_ROWS = 5
BRICK_COLS = 10
BRICK_TOP_MARGIN = 100  # Distance from top of screen

# Brick colors by type
BRICK_COLORS = {
    "normal": COLOR_RED,
    "strong": COLOR_ORANGE,
    "unbreakable": COLOR_GRAY
}

# Game settings
STARTING_LIVES = 3
LEVEL_COUNT = 5

# Item settings
ITEM_SIZE = 20
ITEM_SPEED = 3
ITEM_TYPES = [
    {"name": "extend", "color": COLOR_GREEN, "probability": 0.1},
    {"name": "slow", "color": COLOR_BLUE, "probability": 0.1},
    {"name": "multi", "color": COLOR_YELLOW, "probability": 0.05},
    {"name": "life", "color": COLOR_RED, "probability": 0.03},
]

# UI settings
FONT_SIZE_SMALL = 20
FONT_SIZE_MEDIUM = 30
FONT_SIZE_LARGE = 50
TEXT_COLOR = COLOR_WHITE

# Asset paths (for future use)
ASSET_DIR = "assets/"
IMAGE_DIR = ASSET_DIR + "images/"
SOUND_DIR = ASSET_DIR + "sounds/"
FONT_DIR = ASSET_DIR + "fonts/"
