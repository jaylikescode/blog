"""
Level component - manages brick layouts for different stages
"""
import random
from ..utils.helpers import calculate_brick_position

class Level:
    """
    Level class manages the brick layout and difficulty for each game stage
    """
    def __init__(self, config, level_number=1):
        self.config = config
        self.level_number = level_number
        self.bricks = []
    
    def create_bricks(self, brick_class):
        """
        Create bricks based on the level number
        Returns a list of Brick objects
        """
        self.bricks = []
        
        # Choose a pattern based on level number
        if self.level_number % 5 == 1:
            self._create_standard_pattern(brick_class)
        elif self.level_number % 5 == 2:
            self._create_pyramid_pattern(brick_class)
        elif self.level_number % 5 == 3:
            self._create_checkerboard_pattern(brick_class)
        elif self.level_number % 5 == 4:
            self._create_mixed_pattern(brick_class)
        else:  # level % 5 == 0
            self._create_fortress_pattern(brick_class)
            
        return self.bricks
    
    def _create_standard_pattern(self, brick_class):
        """Create a standard rectangular pattern of bricks"""
        rows = min(self.config.BRICK_ROWS, 5 + self.level_number // 3)
        
        for row in range(rows):
            for col in range(self.config.BRICK_COLS):
                x, y = calculate_brick_position(row, col, self.config)
                
                # Determine brick type based on row and level
                if self.level_number > 3 and row == 0:
                    brick_type = "strong"
                    color = self.config.BRICK_COLORS["strong"]
                    points = 20
                else:
                    brick_type = "normal"
                    # Different colors for different rows
                    color_values = [(255, 0, 0), (255, 165, 0), (255, 255, 0), 
                                   (0, 255, 0), (0, 0, 255)]
                    color = color_values[row % len(color_values)]
                    points = 10
                
                brick = brick_class(x, y, self.config.BRICK_WIDTH, self.config.BRICK_HEIGHT, 
                                  color, brick_type, points)
                self.bricks.append(brick)
    
    def _create_pyramid_pattern(self, brick_class):
        """Create a pyramid-like pattern of bricks"""
        max_cols = self.config.BRICK_COLS
        
        for row in range(6):
            # Calculate how many bricks in this row and their starting column
            bricks_in_row = max_cols - row * 2
            if bricks_in_row <= 0:
                break
                
            start_col = (max_cols - bricks_in_row) // 2
            
            for col in range(start_col, start_col + bricks_in_row):
                x, y = calculate_brick_position(row, col, self.config)
                
                # Special bricks at the top of the pyramid
                if row == 0 and (col == start_col or col == start_col + bricks_in_row - 1):
                    brick_type = "strong"
                    color = self.config.BRICK_COLORS["strong"]
                    points = 20
                else:
                    brick_type = "normal"
                    # Gradient colors from red to blue
                    red = max(0, 255 - row * 50)
                    blue = min(255, row * 50)
                    color = (red, 0, blue)
                    points = 10
                
                brick = brick_class(x, y, self.config.BRICK_WIDTH, self.config.BRICK_HEIGHT, 
                                  color, brick_type, points)
                self.bricks.append(brick)
    
    def _create_checkerboard_pattern(self, brick_class):
        """Create a checkerboard pattern of bricks"""
        rows = min(8, 5 + self.level_number // 2)
        
        for row in range(rows):
            for col in range(self.config.BRICK_COLS):
                # Skip every other brick in a checkerboard pattern
                if (row + col) % 2 == 0:
                    continue
                    
                x, y = calculate_brick_position(row, col, self.config)
                
                # Add some strong bricks in higher levels
                if self.level_number > 5 and random.random() < 0.2:
                    brick_type = "strong"
                    color = self.config.BRICK_COLORS["strong"]
                    points = 20
                else:
                    brick_type = "normal"
                    # Alternate colors for visual effect
                    colors = [(0, 128, 255), (255, 0, 128)]
                    color = colors[(row + col) % len(colors)]
                    points = 10
                
                brick = brick_class(x, y, self.config.BRICK_WIDTH, self.config.BRICK_HEIGHT, 
                                  color, brick_type, points)
                self.bricks.append(brick)
    
    def _create_mixed_pattern(self, brick_class):
        """Create a mixed pattern with some unbreakable bricks"""
        rows = 6
        special_layout = [
            "NNNNNNNNNN",
            "N--N--N--N",
            "NNNNNNNNNN",
            "N-NN--NN-N",
            "N--NNNN--N",
            "NNNNNNNNNN"
        ]
        
        # Add unbreakable bricks for higher levels
        if self.level_number > 6:
            special_layout[1] = "N-UN-UN-UN"
            
        for row, layout_row in enumerate(special_layout[:rows]):
            for col, cell in enumerate(layout_row[:self.config.BRICK_COLS]):
                if cell == "-":
                    continue  # Skip this position
                    
                x, y = calculate_brick_position(row, col, self.config)
                
                if cell == "U":
                    brick_type = "unbreakable"
                    color = self.config.BRICK_COLORS["unbreakable"]
                    points = 0
                elif cell == "S" or (self.level_number > 8 and random.random() < 0.3):
                    brick_type = "strong"
                    color = self.config.BRICK_COLORS["strong"]
                    points = 20
                else:
                    brick_type = "normal"
                    # Color based on position
                    hue = (row * 30 + col * 20) % 360
                    # Simple HSV to RGB conversion for variety
                    if hue < 60:
                        r, g, b = 255, int(255 * hue / 60), 0
                    elif hue < 120:
                        r, g, b = int(255 * (120 - hue) / 60), 255, 0
                    elif hue < 180:
                        r, g, b = 0, 255, int(255 * (hue - 120) / 60)
                    elif hue < 240:
                        r, g, b = 0, int(255 * (240 - hue) / 60), 255
                    elif hue < 300:
                        r, g, b = int(255 * (hue - 240) / 60), 0, 255
                    else:
                        r, g, b = 255, 0, int(255 * (360 - hue) / 60)
                    color = (r, g, b)
                    points = 10
                
                brick = brick_class(x, y, self.config.BRICK_WIDTH, self.config.BRICK_HEIGHT, 
                                  color, brick_type, points)
                self.bricks.append(brick)
    
    def _create_fortress_pattern(self, brick_class):
        """Create a fortress-like pattern with unbreakable outer wall"""
        rows = 8
        cols = self.config.BRICK_COLS
        
        for row in range(rows):
            for col in range(cols):
                # Create an outer wall of unbreakable bricks
                if row == 0 or row == rows-1 or col == 0 or col == cols-1:
                    brick_type = "unbreakable"
                    color = self.config.BRICK_COLORS["unbreakable"]
                    points = 0
                # Random strong bricks inside
                elif random.random() < 0.3:
                    brick_type = "strong"
                    color = self.config.BRICK_COLORS["strong"]
                    points = 20
                else:
                    brick_type = "normal"
                    color = self.config.BRICK_COLORS["normal"]
                    points = 10
                
                x, y = calculate_brick_position(row, col, self.config)
                brick = brick_class(x, y, self.config.BRICK_WIDTH, self.config.BRICK_HEIGHT, 
                                  color, brick_type, points)
                self.bricks.append(brick)
    
    def get_breakable_brick_count(self):
        """Count how many breakable bricks are in the level"""
        return sum(1 for brick in self.bricks 
                  if brick.brick_type != "unbreakable" and brick.is_active())
    
    def increase_difficulty(self):
        """Increase level difficulty by incrementing level number"""
        self.level_number += 1
