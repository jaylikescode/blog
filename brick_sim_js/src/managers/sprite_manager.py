"""
Sprite manager - handles loading and managing game graphics
"""
import os
import pygame
from ..utils.helpers import load_image

class SpriteManager:
    """
    Sprite Manager handles loading, caching and managing game graphics
    Following the Single Responsibility Principle by centralizing sprite management
    """
    def __init__(self):
        self.sprites = {}
        self.use_shapes = True  # Default to shapes for development
        
    def load_sprites(self):
        """
        Attempt to load all game sprites.
        If sprites are not found, the game will fall back to shape rendering.
        """
        # Check if any sprites exist
        if os.path.exists("assets/images") and os.listdir("assets/images"):
            self.use_shapes = False
            
            # Try to load all common sprite types
            self._load_sprite("paddle", "paddle/paddle.png")
            self._load_sprite("ball", "ball/ball.png")
            
            # Load brick sprites
            brick_types = ["normal", "strong", "strong_damaged", "unbreakable"]
            for brick_type in brick_types:
                self._load_sprite(f"brick_{brick_type}", f"bricks/{brick_type}.png")
            
            # Load item sprites
            item_types = ["extend", "slow", "multi", "life", "laser", "fast", "warp"]
            for item_type in item_types:
                self._load_sprite(f"item_{item_type}", f"items/{item_type}.png")
                
        else:
            print("No sprites found. Falling back to shape rendering.")
            self.use_shapes = True
    
    def _load_sprite(self, sprite_id, path):
        """Load a single sprite and store it in the cache"""
        sprite = load_image(path)
        if sprite:
            self.sprites[sprite_id] = sprite
            print(f"Loaded sprite: {sprite_id}")
        else:
            print(f"Failed to load sprite: {path}")
    
    def get_sprite(self, sprite_id):
        """Get a sprite by ID, returns None if not found"""
        return self.sprites.get(sprite_id)
    
    def render(self, screen, sprite_id, x, y, width, height, color=None, fallback_func=None):
        """
        Render a sprite or fallback to shape rendering
        
        Parameters:
            screen: pygame surface to draw on
            sprite_id: ID of sprite to render
            x, y: position to render
            width, height: size to render
            color: color for shape rendering fallback
            fallback_func: custom function for shape rendering
        """
        if not self.use_shapes and sprite_id in self.sprites:
            # Use sprite rendering
            sprite = self.sprites[sprite_id]
            scaled_sprite = pygame.transform.scale(sprite, (width, height))
            screen.blit(scaled_sprite, (x, y))
            return True
        else:
            # Fall back to shape rendering
            if fallback_func:
                fallback_func(screen, x, y, width, height, color)
            elif color:
                pygame.draw.rect(screen, color, (x, y, width, height))
            return False
            
    def render_circle(self, screen, sprite_id, x, y, radius, color=None):
        """Special case rendering for circular objects like the ball"""
        if not self.use_shapes and sprite_id in self.sprites:
            # Use sprite rendering
            sprite = self.sprites[sprite_id]
            diameter = radius * 2
            scaled_sprite = pygame.transform.scale(sprite, (diameter, diameter))
            screen.blit(scaled_sprite, (x - radius, y - radius))
            return True
        else:
            # Fall back to shape rendering
            if color:
                pygame.draw.circle(screen, color, (int(x), int(y)), radius)
            return False
    
    def is_using_sprites(self):
        """Check if we're using sprite rendering or shape rendering"""
        return not self.use_shapes
