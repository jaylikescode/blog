"""
Ball component - moves around the screen and bounces off objects
"""
import pygame
import math
from .game_object import GameObject
from ..utils.helpers import load_image

class Ball(GameObject):
    """
    Ball class represents the moving ball that bounces around and breaks bricks
    """
    def __init__(self, x, y, radius, color, speed_x, speed_y, max_speed):
        # For circle, width and height are both diameter (2*radius)
        super().__init__(x, y, radius * 2, radius * 2, color)
        self.radius = radius
        self.speed_x = speed_x
        self.speed_y = speed_y
        self.max_speed = max_speed
        self.initial_x = x
        self.initial_y = y
        self.initial_speed_x = speed_x
        self.initial_speed_y = speed_y
        self.is_launched = False
        # Try to load ball sprite (falls back to shape if not found)
        self.sprite = load_image("ball/ball.png")
        
    def update(self):
        # Only move if the ball is launched
        if self.is_launched:
            # Update position based on speed
            self.x += self.speed_x
            self.y += self.speed_y
    
    def render(self, screen):
        """Render the ball using sprite or shape"""
        if self.sprite:
            # If we have a sprite, scale it to match ball dimensions and draw it
            scaled_sprite = pygame.transform.scale(self.sprite, (self.radius * 2, self.radius * 2))
            screen.blit(scaled_sprite, (self.x - self.radius, self.y - self.radius))
        else:
            # Otherwise, draw a colored circle
            pygame.draw.circle(screen, self.color, (int(self.x), int(self.y)), self.radius)
    
    def reset(self, paddle_x=None, paddle_width=None):
        """Reset ball to initial state"""
        if paddle_x is not None and paddle_width is not None:
            # Position ball on top of paddle
            self.x = paddle_x + paddle_width / 2
        else:
            self.x = self.initial_x
        
        self.y = self.initial_y
        self.speed_x = self.initial_speed_x
        self.speed_y = self.initial_speed_y
        self.is_launched = False
    
    def launch(self):
        """Launch the ball if it's not already moving"""
        if not self.is_launched:
            self.is_launched = True
    
    def get_rect(self):
        """Override get_rect to properly handle circle collision area"""
        return pygame.Rect(self.x - self.radius, self.y - self.radius, 
                          self.radius * 2, self.radius * 2)
    
    def bounce_horizontal(self):
        """Bounce horizontally (reverse x speed)"""
        self.speed_x = -self.speed_x
    
    def bounce_vertical(self):
        """Bounce vertically (reverse y speed)"""
        self.speed_y = -self.speed_y
    
    def set_direction(self, angle_degrees):
        """Set ball direction based on angle in degrees"""
        # Convert angle to radians
        angle_radians = math.radians(angle_degrees)
        
        # Calculate speed from angle while maintaining overall speed magnitude
        current_speed = math.sqrt(self.speed_x**2 + self.speed_y**2)
        self.speed_x = current_speed * math.sin(angle_radians)
        # Negative because y increases downward in pygame
        self.speed_y = -current_speed * math.cos(angle_radians)
    
    def increase_speed(self, factor=1.1):
        """Increase ball speed by the given factor"""
        speed = math.sqrt(self.speed_x**2 + self.speed_y**2)
        if speed * factor <= self.max_speed:
            self.speed_x *= factor
            self.speed_y *= factor
            
    def decrease_speed(self, factor=0.8):
        """Decrease ball speed by the given factor"""
        self.speed_x *= factor
        self.speed_y *= factor
