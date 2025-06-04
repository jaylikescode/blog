"""
Text UI component - handles text rendering and messages
"""
import pygame
from ..utils.helpers import draw_text

class TextRenderer:
    """
    TextRenderer handles drawing text elements on screen
    """
    def __init__(self, config):
        self.config = config
        self.messages = []  # List of (text, position, size, color, duration, start_time)
        
    def draw_score(self, screen, score):
        """Draw the score at the top left of the screen"""
        draw_text(screen, f"Score: {score}", 
                 self.config.FONT_SIZE_SMALL,
                 10, 20, self.config.TEXT_COLOR, align="left")
    
    def draw_lives(self, screen, lives):
        """Draw the lives at the top right of the screen"""
        draw_text(screen, f"Lives: {lives}",
                 self.config.FONT_SIZE_SMALL,
                 self.config.SCREEN_WIDTH - 10, 20, 
                 self.config.TEXT_COLOR, align="right")
    
    def draw_level(self, screen, level):
        """Draw the current level at the top center of the screen"""
        draw_text(screen, f"Level {level}", 
                 self.config.FONT_SIZE_SMALL,
                 self.config.SCREEN_WIDTH // 2, 20, 
                 self.config.TEXT_COLOR, align="center")
    
    def draw_message(self, screen, text, size, y=None, color=None, align="center"):
        """Draw a message on the screen"""
        if y is None:
            y = self.config.SCREEN_HEIGHT // 2
        
        if color is None:
            color = self.config.TEXT_COLOR
            
        draw_text(screen, text, size, self.config.SCREEN_WIDTH // 2, y, color, align)
    
    def add_timed_message(self, text, size, duration, y=None, color=None):
        """Add a message that will be displayed for a specific duration"""
        if y is None:
            y = self.config.SCREEN_HEIGHT // 2
            
        if color is None:
            color = self.config.TEXT_COLOR
            
        # Store message with current time
        self.messages.append({
            'text': text,
            'size': size,
            'y': y,
            'color': color,
            'duration': duration,
            'start_time': pygame.time.get_ticks()
        })
    
    def update_timed_messages(self):
        """Update the timed messages and remove expired ones"""
        current_time = pygame.time.get_ticks()
        # Keep only messages that haven't expired
        self.messages = [msg for msg in self.messages 
                        if current_time - msg['start_time'] < msg['duration']]
    
    def draw_timed_messages(self, screen):
        """Draw all active timed messages"""
        for msg in self.messages:
            # Make the message fade out towards the end of its duration
            elapsed = pygame.time.get_ticks() - msg['start_time']
            remaining = msg['duration'] - elapsed
            
            # If less than 500ms left, start fading
            if remaining < 500:
                alpha = int(255 * remaining / 500)
            else:
                alpha = 255
                
            # Create a copy of the color with the new alpha
            color = list(msg['color'])
            if len(color) == 3:
                color.append(alpha)
            else:
                color[3] = alpha
                
            draw_text(screen, msg['text'], msg['size'], 
                     self.config.SCREEN_WIDTH // 2, msg['y'], color)
    
    def draw_game_over(self, screen, score):
        """Draw the game over screen"""
        self.draw_message(screen, "GAME OVER", 
                         self.config.FONT_SIZE_LARGE,
                         self.config.SCREEN_HEIGHT // 3)
        
        self.draw_message(screen, f"Final Score: {score}", 
                         self.config.FONT_SIZE_MEDIUM,
                         self.config.SCREEN_HEIGHT // 2)
        
        self.draw_message(screen, "Press ENTER to play again", 
                         self.config.FONT_SIZE_SMALL,
                         self.config.SCREEN_HEIGHT * 2 // 3)
    
    def draw_level_cleared(self, screen, level, score):
        """Draw the level cleared screen"""
        self.draw_message(screen, f"LEVEL {level} CLEARED!", 
                         self.config.FONT_SIZE_LARGE,
                         self.config.SCREEN_HEIGHT // 3)
        
        self.draw_message(screen, f"Score: {score}", 
                         self.config.FONT_SIZE_MEDIUM,
                         self.config.SCREEN_HEIGHT // 2)
        
        self.draw_message(screen, "Get Ready for Next Level...", 
                         self.config.FONT_SIZE_SMALL,
                         self.config.SCREEN_HEIGHT * 2 // 3)
    
    def draw_start_screen(self, screen):
        """Draw the game start screen"""
        self.draw_message(screen, "BRIC GAME", 
                         self.config.FONT_SIZE_LARGE,
                         self.config.SCREEN_HEIGHT // 3)
        
        self.draw_message(screen, "Break all the bricks to win!", 
                         self.config.FONT_SIZE_MEDIUM,
                         self.config.SCREEN_HEIGHT // 2)
        
        self.draw_message(screen, "Press SPACE to start", 
                         self.config.FONT_SIZE_SMALL,
                         self.config.SCREEN_HEIGHT * 2 // 3)
    
    def draw_pause_screen(self, screen):
        """Draw the pause screen overlay"""
        # Create a semi-transparent overlay
        overlay = pygame.Surface((self.config.SCREEN_WIDTH, self.config.SCREEN_HEIGHT))
        overlay.set_alpha(128)
        overlay.fill((0, 0, 0))
        screen.blit(overlay, (0, 0))
        
        self.draw_message(screen, "PAUSED", 
                         self.config.FONT_SIZE_LARGE,
                         self.config.SCREEN_HEIGHT // 2)
        
        self.draw_message(screen, "Press P to resume", 
                         self.config.FONT_SIZE_SMALL,
                         self.config.SCREEN_HEIGHT * 2 // 3)
