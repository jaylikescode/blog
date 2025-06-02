"""
Base GameObject class that all game entities will inherit from
"""
import pygame
from abc import ABC, abstractmethod

class GameObject(ABC):
    """
    Abstract base class for all game objects with position, size, and rendering capabilities.
    Following the Single Responsibility Principle, this class handles only the common
    properties and behaviors of game objects.
    """
    def __init__(self, x, y, width, height, color):
        """Initialize the game object with position, size and color"""
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.color = color
        self.sprite = None
        self.sprite_id = None
        self.active = True
        
    def update(self):
        """Update method to be overridden by subclasses"""
        pass
        
    @abstractmethod
    def render(self, screen):
        """
        All game objects must implement a render method
        This allows for easy replacement of rendering with sprites later
        """
        pass
        
    def draw_shape(self, screen):
        """Default implementation draws a rectangle with the object's color"""
        pygame.draw.rect(screen, self.color, (self.x, self.y, self.width, self.height))
    
    def set_sprite(self, sprite_id, sprite):
        """Set a sprite for this game object"""
        self.sprite_id = sprite_id
        self.sprite = sprite
    
    def get_rect(self):
        """Return a pygame Rect representing this object"""
        return pygame.Rect(self.x, self.y, self.width, self.height)
    
    def collides_with(self, other):
        """Check if this object collides with another object"""
        return self.get_rect().colliderect(other.get_rect())
    
    def is_active(self):
        """Check if this object is active in the game"""
        return self.active
    
    def deactivate(self):
        """Deactivate this object (remove from game)"""
        self.active = False
    
    def activate(self):
        """Activate this object (add to game)"""
        self.active = True
