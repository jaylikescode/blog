"""
Main game class for Bric Game - handles game loop and core logic
"""
import pygame
import time
import random
from .components.paddle import Paddle
from .components.ball import Ball
from .components.brick import Brick
from .components.item import Item
from .components.level import Level
from .managers.collision import CollisionManager
from .managers.sprite_manager import SpriteManager
from .ui.text import TextRenderer

class Game:
    """
    Main game class that orchestrates all game components
    """
    def __init__(self, config):
        """Initialize game with configuration"""
        self.config = config
        pygame.init()
        
        # Set up the game window
        self.screen = pygame.display.set_mode((config.SCREEN_WIDTH, config.SCREEN_HEIGHT))
        pygame.display.set_caption(config.SCREEN_TITLE)
        
        # Create game clock
        self.clock = pygame.time.Clock()
        
        # Initialize managers
        self.sprite_manager = SpriteManager()
        self.collision_manager = CollisionManager(config)
        self.text_renderer = TextRenderer(config)
        
        # Game state
        self.state = "start"  # start, playing, paused, level_cleared, game_over
        self.score = 0
        self.lives = config.STARTING_LIVES
        self.level_number = 1
        self.scheduled_events = []  # [(time_to_execute, callback), ...]
        
        # Game objects
        self.paddle = None
        self.balls = []
        self.bricks = []
        self.items = []
        self.level = None
        
        # Initialize game objects
        self._init_game_objects()
        
        # Try to load sprites
        self.sprite_manager.load_sprites()
    
    def _init_game_objects(self):
        """Initialize all game objects"""
        # Create paddle
        paddle_x = self.config.SCREEN_WIDTH // 2 - self.config.PADDLE_WIDTH // 2
        paddle_y = self.config.SCREEN_HEIGHT - self.config.PADDLE_BOTTOM_MARGIN - self.config.PADDLE_HEIGHT
        self.paddle = Paddle(
            paddle_x, paddle_y, 
            self.config.PADDLE_WIDTH, self.config.PADDLE_HEIGHT,
            self.config.PADDLE_COLOR,
            self.config.PADDLE_SPEED,
            self.config.SCREEN_WIDTH
        )
        
        # Create ball
        self._create_initial_ball()
        
        # Create level and bricks
        self.level = Level(self.config, self.level_number)
        self.bricks = self.level.create_bricks(Brick)
    
    def _create_initial_ball(self):
        """Create initial ball positioned on the paddle"""
        # Clear any existing balls
        self.balls.clear()
        
        # Create a new ball
        ball_x = self.paddle.x + self.paddle.width // 2
        ball_y = self.paddle.y - self.config.BALL_RADIUS
        ball = Ball(
            ball_x, ball_y,
            self.config.BALL_RADIUS,
            self.config.BALL_COLOR,
            self.config.BALL_SPEED_X,
            self.config.BALL_SPEED_Y,
            self.config.BALL_MAX_SPEED
        )
        self.balls.append(ball)
    
    def create_ball(self, x, y):
        """Create a new ball at the specified position (for multi-ball power-up)"""
        ball = Ball(
            x, y,
            self.config.BALL_RADIUS,
            self.config.BALL_COLOR,
            self.config.BALL_SPEED_X,
            self.config.BALL_SPEED_Y,
            self.config.BALL_MAX_SPEED
        )
        return ball
    
    def create_item(self, x, y, item_type):
        """Create a random item that falls from a destroyed brick"""
        # Choose item color based on type
        item_colors = {
            "extend": self.config.COLOR_GREEN,
            "slow": self.config.COLOR_BLUE,
            "multi": self.config.COLOR_YELLOW,
            "life": self.config.COLOR_RED,
            "laser": self.config.COLOR_PURPLE,
            "fast": self.config.COLOR_ORANGE,
            "warp": self.config.COLOR_CYAN
        }
        color = item_colors.get(item_type, self.config.COLOR_WHITE)
        
        item = Item(x, y, self.config.ITEM_SIZE, item_type, color, self.config.ITEM_SPEED)
        self.items.append(item)
    
    def run(self):
        """Main game loop"""
        running = True
        
        while running:
            # Process events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                
                # Key press events
                if event.type == pygame.KEYDOWN:
                    self._handle_key_press(event.key)
            
            # Update game state
            if self.state == "playing":
                self._update()
                
            # Process scheduled events
            self._process_scheduled_events()
                
            # Render game
            self._render()
            
            # Cap the frame rate
            self.clock.tick(self.config.FPS)
        
        # Clean up
        pygame.quit()
    
    def _handle_key_press(self, key):
        """Handle key press events"""
        if key == pygame.K_ESCAPE:
            # Quit game
            pygame.event.post(pygame.event.Event(pygame.QUIT))
            
        elif key == pygame.K_SPACE:
            if self.state == "start":
                # Start game
                self.state = "playing"
            elif self.state == "playing":
                # Launch ball if not launched
                for ball in self.balls:
                    if not ball.is_launched:
                        ball.launch()
                        
        elif key == pygame.K_p:
            # Toggle pause
            if self.state == "playing":
                self.state = "paused"
            elif self.state == "paused":
                self.state = "playing"
                
        elif key == pygame.K_RETURN:
            if self.state == "game_over":
                # Restart game
                self._reset_game()
                self.state = "start"
    
    def _update(self):
        """Update game state for a single frame"""
        # Update paddle
        self.paddle.update()
        
        # Update balls and check for collisions
        self._update_balls()
        
        # Update items
        self._update_items()
        
        # Check if level is cleared
        if self._is_level_cleared():
            self.state = "level_cleared"
            # Schedule level transition
            self.schedule_event(3000, self._start_next_level)
            
        # Update UI
        self.text_renderer.update_timed_messages()
    
    def _update_balls(self):
        """Update all balls and handle ball-related logic"""
        # Update all balls
        balls_to_remove = []
        
        for ball in self.balls:
            # If ball is not launched yet, position it on the paddle
            if not ball.is_launched:
                ball.x = self.paddle.x + self.paddle.width // 2
                ball.y = self.paddle.y - ball.radius
                continue
                
            # Update ball position
            ball.update()
            
            # Check for wall collisions
            wall_collision = self.collision_manager.check_ball_wall_collision(
                ball, self.config.SCREEN_WIDTH, self.config.SCREEN_HEIGHT)
                
            if wall_collision == "lost":
                # Ball was lost
                balls_to_remove.append(ball)
                continue
                
            # Check for paddle collision
            paddle_collision = self.collision_manager.check_ball_paddle_collision(
                ball, self.paddle)
                
            # Check for brick collisions
            hits, points, destroyed_brick = self.collision_manager.check_ball_brick_collision(
                ball, self.bricks)
                
            # Add score from brick hits
            self.score += points
            
            # If a brick was destroyed, potentially spawn an item
            if destroyed_brick and destroyed_brick.should_drop_item():
                # Choose a random item type based on probabilities
                item_candidates = []
                for item_config in self.config.ITEM_TYPES:
                    if random.random() < item_config["probability"]:
                        item_candidates.append(item_config["name"])
                
                if item_candidates:
                    item_type = random.choice(item_candidates)
                    item_x = destroyed_brick.x + destroyed_brick.width // 2 - self.config.ITEM_SIZE // 2
                    item_y = destroyed_brick.y
                    self.create_item(item_x, item_y, item_type)
        
        # Remove lost balls
        for ball in balls_to_remove:
            self.balls.remove(ball)
            
        # If all balls are lost, lose a life
        if not self.balls and self.state == "playing":
            self.lives -= 1
            
            if self.lives <= 0:
                # Game over
                self.state = "game_over"
            else:
                # Reset with a new ball
                self._create_initial_ball()
                # Show message
                self.text_renderer.add_timed_message(
                    "Ball lost! Press SPACE to launch", 
                    self.config.FONT_SIZE_MEDIUM, 2000)
    
    def _update_items(self):
        """Update all items and handle item-related logic"""
        # Update all items
        items_to_remove = []
        
        for item in self.items:
            item.update()
            
            # Check if item is off the bottom of the screen
            if item.y > self.config.SCREEN_HEIGHT:
                items_to_remove.append(item)
                continue
                
            # Check for collision with paddle
            if self.collision_manager.check_item_paddle_collision([item], self.paddle):
                # Apply item effect
                item.apply_effect(self)
                items_to_remove.append(item)
                
                # Show message about item effect
                message = f"Power-up: {item.item_type.upper()}"
                self.text_renderer.add_timed_message(
                    message, self.config.FONT_SIZE_SMALL, 2000, 
                    y=50, color=item.color)
        
        # Remove used or lost items
        for item in items_to_remove:
            if item in self.items:  # Defensive check
                self.items.remove(item)
    
    def _is_level_cleared(self):
        """Check if all breakable bricks are destroyed"""
        return self.level.get_breakable_brick_count() == 0
    
    def _start_next_level(self):
        """Start the next level"""
        self.level_number += 1
        
        # Create a new level
        self.level = Level(self.config, self.level_number)
        self.bricks = self.level.create_bricks(Brick)
        
        # Reset paddle and create a new ball
        self.paddle.reset_size()
        self._create_initial_ball()
        
        # Clear items
        self.items.clear()
        
        # Update game state
        self.state = "playing"
        
        # Display level message
        self.text_renderer.add_timed_message(
            f"Level {self.level_number}", 
            self.config.FONT_SIZE_LARGE, 2000)
    
    def _render(self):
        """Render game to the screen"""
        # Clear the screen
        self.screen.fill(self.config.COLOR_BLACK)
        
        # Draw game objects
        self._draw_game_objects()
        
        # Draw UI based on game state
        self._draw_ui()
        
        # Update display
        pygame.display.flip()
    
    def _draw_game_objects(self):
        """Draw all game objects"""
        # Draw paddle
        self.paddle.render(self.screen)
        
        # Draw balls
        for ball in self.balls:
            ball.render(self.screen)
        
        # Draw bricks
        for brick in self.bricks:
            if brick.is_active():
                brick.render(self.screen)
        
        # Draw items
        for item in self.items:
            item.render(self.screen)
    
    def _draw_ui(self):
        """Draw UI elements based on game state"""
        if self.state == "start":
            # Draw start screen
            self.text_renderer.draw_start_screen(self.screen)
            
        elif self.state == "playing" or self.state == "paused":
            # Draw score, lives, level
            self.text_renderer.draw_score(self.screen, self.score)
            self.text_renderer.draw_lives(self.screen, self.lives)
            self.text_renderer.draw_level(self.screen, self.level_number)
            
            # Draw any timed messages
            self.text_renderer.draw_timed_messages(self.screen)
            
            # Draw pause overlay if paused
            if self.state == "paused":
                self.text_renderer.draw_pause_screen(self.screen)
                
        elif self.state == "level_cleared":
            # Draw level cleared screen
            self.text_renderer.draw_level_cleared(
                self.screen, self.level_number, self.score)
                
        elif self.state == "game_over":
            # Draw game over screen
            self.text_renderer.draw_game_over(self.screen, self.score)
    
    def _reset_game(self):
        """Reset game to initial state"""
        self.score = 0
        self.lives = self.config.STARTING_LIVES
        self.level_number = 1
        
        # Reset game objects
        self._init_game_objects()
        
        # Clear items
        self.items.clear()
        
        # Clear scheduled events
        self.scheduled_events.clear()
    
    def schedule_event(self, delay_ms, callback):
        """Schedule an event to occur after the specified delay"""
        execution_time = pygame.time.get_ticks() + delay_ms
        self.scheduled_events.append((execution_time, callback))
    
    def _process_scheduled_events(self):
        """Process any scheduled events that are due"""
        current_time = pygame.time.get_ticks()
        events_to_execute = []
        events_to_keep = []
        
        # Split events into those ready to execute and those to keep
        for event_time, callback in self.scheduled_events:
            if current_time >= event_time:
                events_to_execute.append(callback)
            else:
                events_to_keep.append((event_time, callback))
        
        # Update scheduled events
        self.scheduled_events = events_to_keep
        
        # Execute ready events
        for callback in events_to_execute:
            callback()
    
    def next_level(self):
        """Advance to the next level (called from item effect)"""
        self.state = "level_cleared"
        self.schedule_event(1000, self._start_next_level)
    
    def enable_laser_mode(self, duration_ms):
        """Enable laser mode for the paddle (called from item effect)"""
        # This is a placeholder for a potential feature
        # Implementation would involve adding laser functionality to the paddle
        self.text_renderer.add_timed_message(
            "Laser mode activated!", 
            self.config.FONT_SIZE_SMALL, 2000, 
            y=80, color=self.config.COLOR_PURPLE)
