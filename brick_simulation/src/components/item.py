"""
Item component - power-ups that can be collected by the player
"""
import pygame
from .game_object import GameObject
from ..utils.helpers import load_image

class Item(GameObject):
    """
    Item class represents power-ups that fall from destroyed bricks
    and can be caught by the paddle for various effects
    """
    def __init__(self, x, y, size, item_type, color, speed):
        super().__init__(x, y, size, size, color)
        self.item_type = item_type
        self.speed = speed
        # Try to load item sprite based on type (falls back to shape if not found)
        self.sprite = load_image(f"items/{item_type}.png")
        # Set symbol for fallback rendering
        self.symbol = self._get_symbol_for_type()
        
    def _get_symbol_for_type(self):
        """Get a symbol to display inside the item based on its type"""
        symbols = {
            "extend": "+",    # Extend paddle
            "slow": "S",      # Slow ball
            "multi": "M",     # Multiple balls
            "life": "♥",      # Extra life
            "laser": "L",     # Laser
            "fast": "F",      # Speed up
            "warp": "W",      # Warp to next level
        }
        return symbols.get(self.item_type, "?")
        
    def update(self):
        """Update item position (falling down)"""
        self.y += self.speed
        
    def render(self, screen):
        """Render the item using sprite or shape"""
        if self.sprite:
            # If we have a sprite, scale it to match item dimensions and draw it
            scaled_sprite = pygame.transform.scale(self.sprite, (self.width, self.height))
            screen.blit(scaled_sprite, (self.x, self.y))
        else:
            # Otherwise, draw a colored square with a symbol
            self.draw_shape(screen)
            
            # Add symbol text in the center
            font = pygame.font.SysFont(None, int(self.width * 0.8))
            text = font.render(self.symbol, True, (255, 255, 255))
            text_rect = text.get_rect(center=(self.x + self.width // 2, self.y + self.height // 2))
            screen.blit(text, text_rect)
    
    def apply_effect(self, game):
        """Apply the item's effect to the game"""
        if self.item_type == "extend":
            # Extend paddle
            game.paddle.extend()
            game.schedule_event(10000, game.paddle.reset_size)  # Reset after 10 sec
            
        elif self.item_type == "slow":
            # Slow down ball(s)
            for ball in game.balls:
                ball.decrease_speed(0.7)
            game.schedule_event(15000, lambda: [ball.increase_speed(1/0.7) for ball in game.balls])
            
        elif self.item_type == "multi":
            # Add 2 extra balls
            if len(game.balls) < 5:  # Limit total number of balls
                current_ball = game.balls[0]
                for angle in [30, -30]:
                    new_ball = game.create_ball(current_ball.x, current_ball.y)
                    new_ball.is_launched = True
                    new_ball.set_direction(angle)
                    game.balls.append(new_ball)
                    
        elif self.item_type == "life":
            # Add extra life
            game.lives += 1
            
        elif self.item_type == "laser":
            # Enable laser mode
            game.enable_laser_mode(10000)  # 10 seconds
            
        elif self.item_type == "fast":
            # Speed up game pace
            for ball in game.balls:
                ball.increase_speed(1.3)
            game.schedule_event(15000, lambda: [ball.decrease_speed(1/1.3) for ball in game.balls])
            
        elif self.item_type == "warp":
            # Skip to next level
            game.next_level()
        
        # Deactivate the item after applying its effect
        self.deactivate()
