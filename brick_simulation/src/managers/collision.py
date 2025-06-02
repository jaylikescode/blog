"""
Collision manager - handles all collision detection and resolution
"""
import pygame
import math
import random

class CollisionManager:
    """
    Collision Manager handles all collision detection and physics
    Following the Single Responsibility Principle by separating collision logic
    """
    def __init__(self, config):
        self.config = config
    
    def check_ball_wall_collision(self, ball, screen_width, screen_height):
        """Check and handle ball collision with screen walls"""
        # Left and right walls
        if ball.x - ball.radius <= 0 or ball.x + ball.radius >= screen_width:
            ball.bounce_horizontal()
            # Adjust position to prevent getting stuck in wall
            if ball.x - ball.radius <= 0:
                ball.x = ball.radius
            else:
                ball.x = screen_width - ball.radius
            return True
        
        # Top wall
        if ball.y - ball.radius <= 0:
            ball.bounce_vertical()
            ball.y = ball.radius  # Adjust position
            return True
            
        # Bottom (ball lost)
        if ball.y + ball.radius >= screen_height:
            return "lost"
            
        return False
    
    def check_ball_paddle_collision(self, ball, paddle):
        """Check and handle ball collision with paddle"""
        # Quick check for possible collision (optimization)
        if (ball.y + ball.radius >= paddle.y and
            ball.x >= paddle.x and 
            ball.x <= paddle.x + paddle.width):
                
            # Precise collision check using Rect
            paddle_rect = paddle.get_rect()
            ball_rect = ball.get_rect()
            
            if paddle_rect.colliderect(ball_rect):
                # Ball hit the paddle
                
                # Calculate relative position of ball hit on paddle (from -1.0 to 1.0)
                # Where -1.0 is far left, 0.0 is center, 1.0 is far right
                relative_intersect = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2)
                
                # Bounce angle based on where the ball hit the paddle
                # Range is from -60 to 60 degrees
                bounce_angle = relative_intersect * 60
                
                # Set the new direction based on the bounce angle
                ball.set_direction(bounce_angle)
                
                # Ensure the ball is moving upward
                if ball.speed_y > 0:
                    ball.speed_y = -ball.speed_y
                
                # Position the ball on top of the paddle to prevent sticking
                ball.y = paddle.y - ball.radius
                
                return True
                
        return False
    
    def check_ball_brick_collision(self, ball, bricks):
        """
        Check and handle ball collision with bricks
        Returns tuple (hits, points, destroyed_brick)
        """
        hits = 0
        points = 0
        destroyed_brick = None
        
        # Check each active brick
        for brick in bricks:
            if not brick.is_active():
                continue
                
            # Check for collision
            if self._check_circle_rect_collision(ball, brick.get_rect()):
                # Handle hit and get results
                destroyed, brick_points = brick.hit()
                hits += 1
                points += brick_points
                
                # Determine bounce direction based on which side was hit
                collision_side = self._get_collision_side(ball, brick.get_rect())
                
                if collision_side in ('top', 'bottom'):
                    ball.bounce_vertical()
                else:  # 'left' or 'right'
                    ball.bounce_horizontal()
                
                # Remember the destroyed brick for item spawning
                if destroyed:
                    destroyed_brick = brick
                
                # Only handle one brick collision at a time
                break
                
        return hits, points, destroyed_brick
    
    def check_item_paddle_collision(self, items, paddle):
        """
        Check for collision between falling items and paddle
        Returns the colliding item or None
        """
        for item in items:
            if not item.is_active():
                continue
                
            if item.collides_with(paddle):
                return item
                
        return None
    
    def _check_circle_rect_collision(self, ball, rect):
        """
        Check collision between a circle (ball) and rectangle (brick/paddle)
        This is more accurate than rect-rect collision for a circle
        """
        # Find the closest point on the rectangle to the circle center
        closest_x = max(rect.left, min(ball.x, rect.right))
        closest_y = max(rect.top, min(ball.y, rect.bottom))
        
        # Calculate the distance between the closest point and circle center
        distance_x = ball.x - closest_x
        distance_y = ball.y - closest_y
        
        # If the distance is less than the circle's radius, there is a collision
        return (distance_x**2 + distance_y**2) < (ball.radius**2)
    
    def _get_collision_side(self, ball, rect):
        """Determine which side of the rect the ball collided with"""
        # Calculate the center of the ball
        ball_center_x = ball.x
        ball_center_y = ball.y
        
        # Calculate distances from ball center to rect edges
        dist_left = abs(ball_center_x - rect.left)
        dist_right = abs(ball_center_x - rect.right)
        dist_top = abs(ball_center_y - rect.top)
        dist_bottom = abs(ball_center_y - rect.bottom)
        
        # Find the minimum distance
        min_dist = min(dist_left, dist_right, dist_top, dist_bottom)
        
        # Return the corresponding side
        if min_dist == dist_left:
            return 'left'
        elif min_dist == dist_right:
            return 'right'
        elif min_dist == dist_top:
            return 'top'
        else:
            return 'bottom'
