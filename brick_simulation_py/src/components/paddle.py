"""
Paddle component - controlled by the player to bounce the ball
"""
import pygame
from .game_object import GameObject
from ..utils.helpers import clamp, load_image

class Paddle(GameObject):
    """
    Paddle class represents the player-controlled rectangle at the bottom of the screen
    """
    def __init__(self, x, y, width, height, color, speed, screen_width):
        super().__init__(x, y, width, height, color)
        self.speed = speed
        self.screen_width = screen_width
        self.original_width = width
        # Try to load paddle sprite (falls back to shape if not found)
        self.sprite = load_image("paddle/paddle.png")
        
    def update(self):
        # Get keyboard state
        keys = pygame.key.get_pressed()
        
        # Move paddle left/right
        if keys[pygame.K_LEFT]:
            self.x -= self.speed
        if keys[pygame.K_RIGHT]:
            self.x += self.speed
            
        # Keep the paddle within screen bounds
        self.x = clamp(self.x, 0, self.screen_width - self.width)
    
    def render(self, screen):
        """Render the paddle using sprite or shape"""
        if self.sprite:
            # If we have a sprite, scale it to match paddle dimensions and draw it
            scaled_sprite = pygame.transform.scale(self.sprite, (self.width, self.height))
            screen.blit(scaled_sprite, (self.x, self.y))
        else:
            # Otherwise, draw a colored rectangle
            self.draw_shape(screen)
    
    def extend(self):
        """Extend paddle width (power-up effect)"""
        self.width = min(self.width * 1.5, self.screen_width / 2)
    
    def reset_size(self):
        """Reset paddle to original size"""
        self.width = self.original_width
        
    def get_center_x(self):
        """Get the x-coordinate of the center of the paddle"""
        return self.x + (self.width / 2)
        
    def handle_ball_collision(self, ball):
        """
        Handle collision with ball by changing ball direction based on where it hit the paddle
        This gives the player some control over the ball direction
        """
        # Calculate relative position of ball hit on paddle (from -1.0 to 1.0)
        relative_intersect = (ball.x - self.get_center_x()) / (self.width / 2)
        
        # Bounce angle based on where the ball hit the paddle
        # Range is from -60 to 60 degrees (converted to radians in the ball class)
        bounce_angle = relative_intersect * 60
