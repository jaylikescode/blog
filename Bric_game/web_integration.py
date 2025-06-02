"""
Web integration module for the Bric Game
This module adapts the Pygame-based game for running in a web browser using Pyodide
"""
import asyncio
import pygame
from src import config
from src.game import Game

# Flag to track if we're running in the browser
is_browser = False

try:
    from pyodide import create_proxy
    from js import document, window, requestAnimationFrame, console
    is_browser = True
except ImportError:
    pass  # Not running in browser/Pyodide

# Canvas element for Pygame to target
canvas = None
ctx = None
game = None
running = False

def init_web():
    """Initialize the web environment for the game"""
    global canvas, ctx, game
    
    # Get the canvas element
    canvas = document.getElementById('game-canvas')
    ctx = canvas.getContext('2d')
    
    # Configure pygame for web
    pygame.display.init()
    pygame.font.init()
    
    # Create a pygame Surface that matches the canvas size
    surface = pygame.Surface((config.SCREEN_WIDTH, config.SCREEN_HEIGHT))
    
    # Store the surface in pygame's display system
    pygame.display.set_mode((config.SCREEN_WIDTH, config.SCREEN_HEIGHT), 
                          pygame.SRCALPHA, 
                          surface=surface)
    
    # Initialize the game
    game = Game(config)
    
    # Set up event handling for web
    setup_event_handlers()
    
    # Start the game loop
    start_web_game_loop()

def setup_event_handlers():
    """Set up keyboard and mouse event handlers for the web version"""
    # Keyboard events
    def keydown_handler(event):
        # Convert JavaScript key code to pygame key code
        key_map = {
            'ArrowLeft': pygame.K_LEFT,
            'ArrowRight': pygame.K_RIGHT,
            'Space': pygame.K_SPACE,
            ' ': pygame.K_SPACE,
            'p': pygame.K_p,
            'P': pygame.K_p,
            'Enter': pygame.K_RETURN,
            'Escape': pygame.K_ESCAPE
        }
        
        key = key_map.get(event.key, None)
        if key is not None:
            # Create a pygame key down event
            pg_event = pygame.event.Event(pygame.KEYDOWN, {'key': key})
            pygame.event.post(pg_event)
            
            # Prevent default browser behavior (like scrolling)
            event.preventDefault()
    
    def keyup_handler(event):
        # Similar conversion for key up events
        key_map = {
            'ArrowLeft': pygame.K_LEFT,
            'ArrowRight': pygame.K_RIGHT,
            'Space': pygame.K_SPACE,
            ' ': pygame.K_SPACE
        }
        
        key = key_map.get(event.key, None)
        if key is not None:
            # Create a pygame key up event
            pg_event = pygame.event.Event(pygame.KEYUP, {'key': key})
            pygame.event.post(pg_event)
            
            # Prevent default browser behavior
            event.preventDefault()
    
    # Create proxies for the event handlers
    keydown_proxy = create_proxy(keydown_handler)
    keyup_proxy = create_proxy(keyup_handler)
    
    # Attach the event listeners
    document.addEventListener('keydown', keydown_proxy)
    document.addEventListener('keyup', keyup_proxy)

def process_pygame_events():
    """Process and handle pygame events in the web context"""
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            global running
            running = False
        elif event.type == pygame.KEYDOWN:
            game._handle_key_press(event.key)

def render_to_canvas():
    """Copy the pygame surface to the HTML canvas"""
    # Get the pygame surface
    surface = pygame.display.get_surface()
    
    # Convert the surface to an image data URL
    image_data = pygame.image.tostring(surface, 'RGBA')
    
    # Create an ImageData object and put it on the canvas
    import js
    uint8_array = js.Uint8ClampedArray.new(len(image_data))
    for i in range(len(image_data)):
        uint8_array[i] = image_data[i]
    
    image_data = js.ImageData.new(
        uint8_array, 
        config.SCREEN_WIDTH,
        config.SCREEN_HEIGHT
    )
    
    ctx.putImageData(image_data, 0, 0)

def web_game_loop(timestamp):
    """Main game loop for the web version"""
    global running
    
    if not running:
        return
    
    # Process events
    process_pygame_events()
    
    # Update game state
    if game.state == "playing":
        game._update()
    
    # Process scheduled events
    game._process_scheduled_events()
    
    # Render game
    game._render()
    
    # Copy to canvas
    render_to_canvas()
    
    # Schedule next frame
    request_id = requestAnimationFrame(create_proxy(web_game_loop))

def start_web_game_loop():
    """Start the game loop for the web version"""
    global running
    running = True
    requestAnimationFrame(create_proxy(web_game_loop))

def stop_web_game_loop():
    """Stop the game loop for the web version"""
    global running
    running = False

# Export functions for JavaScript to call
if is_browser:
    window.init_bric_game = create_proxy(init_web)
    window.stop_bric_game = create_proxy(stop_web_game_loop)
