"""
Helper utilities for Bric game
"""
import os
import pygame

def load_image(filename, alpha=True):
    """
    Attempts to load an image from the assets directory.
    Returns None if the file doesn't exist.
    """
    try:
        asset_path = os.path.join("assets", "images", filename)
        if not os.path.exists(asset_path):
            return None
        
        if alpha:
            return pygame.image.load(asset_path).convert_alpha()
        else:
            return pygame.image.load(asset_path).convert()
    except (pygame.error, FileNotFoundError):
        return None
        
def calculate_brick_position(row, col, config):
    """
    Calculate the position of a brick based on its row and column.
    """
    x = col * (config.BRICK_WIDTH + config.BRICK_MARGIN) + config.BRICK_MARGIN
    y = row * (config.BRICK_HEIGHT + config.BRICK_MARGIN) + config.BRICK_TOP_MARGIN
    return x, y

def clamp(value, min_value, max_value):
    """
    Clamp a value between min and max.
    """
    return max(min(value, max_value), min_value)

def draw_text(screen, text, size, x, y, color=(255, 255, 255), align="center"):
    """
    Draw text on the screen with specified alignment.
    """
    font = pygame.font.SysFont(None, size)
    text_surface = font.render(text, True, color)
    text_rect = text_surface.get_rect()
    
    if align == "center":
        text_rect.center = (x, y)
    elif align == "left":
        text_rect.left = x
        text_rect.centery = y
    elif align == "right":
        text_rect.right = x
        text_rect.centery = y
        
    screen.blit(text_surface, text_rect)
    return text_rect
