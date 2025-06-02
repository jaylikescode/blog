"""
Brick component - destructible objects that the ball hits
"""
import pygame
import random
from .game_object import GameObject
from ..utils.helpers import load_image

class Brick(GameObject):
    """
    Brick class represents the blocks that can be destroyed by the ball
    """
    def __init__(self, x, y, width, height, color, brick_type="normal", points=10):
        super().__init__(x, y, width, height, color)
        self.brick_type = brick_type
        self.points = points
        self.hits_required = self._get_hits_required()
        self.current_hits = 0
        # Try to load brick sprite based on type (falls back to shape if not found)
        self.sprite = load_image(f"bricks/{brick_type}.png")
        
    def _get_hits_required(self):
        """Determine how many hits this brick can take based on type"""
        if self.brick_type == "normal":
            return 1
        elif self.brick_type == "strong":
            return 2
        elif self.brick_type == "unbreakable":
            return float('inf')  # Can't be broken
        return 1
        
    def hit(self):
        """
        Process a hit on this brick
        Returns:
            bool: True if brick is destroyed, False otherwise
            int: Points earned from this hit
        """
        # If brick is unbreakable, no effect
        if self.brick_type == "unbreakable":
            return False, 0
            
        # Increment hit counter
        self.current_hits += 1
        
        # Check if brick is destroyed
        if self.current_hits >= self.hits_required:
            self.deactivate()
            return True, self.points
            
        # Update appearance for damaged brick
        if self.brick_type == "strong" and self.current_hits == 1:
            self.color = (self.color[0] * 0.7, self.color[1] * 0.7, self.color[2] * 0.7)
            # Try to load damaged sprite
            damaged_sprite = load_image(f"bricks/{self.brick_type}_damaged.png")
            if damaged_sprite:
                self.sprite = damaged_sprite
        
        # Not destroyed yet, return no points
        return False, 0
        
    def render(self, screen):
        """Render the brick using sprite or shape"""
        if self.sprite:
            # If we have a sprite, scale it to match brick dimensions and draw it
            scaled_sprite = pygame.transform.scale(self.sprite, (self.width, self.height))
            screen.blit(scaled_sprite, (self.x, self.y))
        else:
            # Otherwise, draw a colored rectangle
            self.draw_shape(screen)
            
            # For strong bricks, draw a visual indicator of remaining hits
            if self.brick_type == "strong" and self.current_hits > 0:
                # Draw a crack pattern or some visual indicator
                crack_color = (255, 255, 255)  # White cracks
                pygame.draw.line(screen, crack_color, 
                                (self.x + 10, self.y + 10), 
                                (self.x + self.width - 10, self.y + self.height - 10), 2)
                pygame.draw.line(screen, crack_color, 
                                (self.x + self.width - 10, self.y + 10), 
                                (self.x + 10, self.y + self.height - 10), 2)
    
    def should_drop_item(self, item_probability=0.2):
        """
        Determine if this brick should drop an item when destroyed.
        Only normal and strong bricks have a chance to drop items.
        """
        if self.brick_type == "unbreakable":
            return False
        return random.random() < item_probability
