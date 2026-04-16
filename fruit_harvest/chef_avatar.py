"""
Chef Avatar Module
Manages chef character animation and arm following
"""

import pygame
import math
from config import *


class ChefAvatar:
    """Animated chef character that follows hand cursor"""
    
    def __init__(self, gender, screen_width, screen_height):
        """
        Initialize chef avatar.
        
        Args:
            gender: 'male' or 'female'
            screen_width: Width of game screen
            screen_height: Height of game screen
        """
        self.gender = gender
        self.x = screen_width // 2
        self.y = screen_height - 150  # Bottom-center of screen
        
        self.state = 'idle'  # 'idle', 'happy', 'sad'
        self.state_timer = 0
        self.state_duration = 1.0  # seconds
        
        # Arm following
        self.arm_angle = 0
        self.arm_length = 80
        
        # Create surfaces
        self.surfaces = self._create_surfaces()
        
    def _create_surfaces(self):
        """Create placeholder chef graphics"""
        surfaces = {}
        
        # Chef body dimensions
        body_width = 80
        body_height = 100
        
        # Colors based on gender
        if self.gender == 'male':
            apron_color = (100, 150, 220)  # Blue
            skin_color = (255, 220, 177)
        else:
            apron_color = (220, 100, 100)  # Red
            skin_color = (255, 220, 177)
        
        # IDLE state
        idle_surface = pygame.Surface((body_width, body_height), pygame.SRCALPHA)
        # Body (apron)
        pygame.draw.rect(idle_surface, apron_color, (10, 30, 60, 70))
        # Head
        pygame.draw.circle(idle_surface, skin_color, (body_width//2, 20), 20)
        # Chef hat
        pygame.draw.rect(idle_surface, COLOR_WHITE, (20, 0, 40, 15))
        pygame.draw.rect(idle_surface, COLOR_WHITE, (15, 15, 50, 10))
        
        if self.gender == 'male':
            # Mustache
            pygame.draw.ellipse(idle_surface, (50, 30, 10), (30, 25, 20, 8))
        
        surfaces['idle'] = idle_surface
        
        # HAPPY state (copy idle and add smile)
        happy_surface = idle_surface.copy()
        pygame.draw.arc(happy_surface, COLOR_BLACK, (30, 20, 20, 15), 
                       3.14, 6.28, 2)  # Smile
        # Sparkles
        for offset in [(-25, -10), (25, -15), (-20, 5)]:
            x = body_width//2 + offset[0]
            y = 20 + offset[1]
            pygame.draw.circle(happy_surface, COLOR_YELLOW, (x, y), 3)
        surfaces['happy'] = happy_surface
        
        # SAD state (copy idle and add frown)
        sad_surface = idle_surface.copy()
        pygame.draw.arc(sad_surface, COLOR_BLACK, (30, 28, 20, 12), 
                       0, 3.14, 2)  # Frown
        surfaces['sad'] = sad_surface
        
        return surfaces
    
    def update(self, dt, hand_x, hand_y):
        """
        Update avatar state and arm position.
        
        Args:
            dt: Delta time in seconds
            hand_x, hand_y: Current hand cursor position
        """
        # Update state timer
        self.state_timer += dt
        if self.state_timer >= self.state_duration:
            self.state = 'idle'
        
        # Calculate arm angle to point toward hand cursor
        if hand_x is not None and hand_y is not None:
            dx = hand_x - self.x
            dy = hand_y - self.y
            self.arm_angle = math.atan2(dy, dx)
    
    def set_state(self, state, duration=1.0):
        """
        Set avatar emotional state.
        
        Args:
            state: 'happy' or 'sad'
            duration: How long to show this state
        """
        self.state = state
        self.state_timer = 0
        self.state_duration = duration
    
    def draw(self, screen, hand_x=None, hand_y=None):
        """
        Draw chef avatar and arm.
        
        Args:
            screen: Pygame surface
            hand_x, hand_y: Hand cursor position (for arm)
        """
        # Draw arm (if hand is detected)
        if hand_x is not None and hand_y is not None:
            # Calculate arm endpoint
            # Arm extends from chef's shoulder toward hand cursor
            shoulder_x = self.x
            shoulder_y = self.y - 30  # Shoulder is near top of body
            
            # Calculate distance to hand
            dx = hand_x - shoulder_x
            dy = hand_y - shoulder_y
            distance = math.sqrt(dx**2 + dy**2)
            
            # Limit arm length
            max_arm_length = 120
            if distance > max_arm_length:
                # Extend arm to max length in direction of cursor
                ratio = max_arm_length / distance
                end_x = shoulder_x + dx * ratio
                end_y = shoulder_y + dy * ratio
            else:
                # Arm reaches cursor
                end_x = hand_x
                end_y = hand_y
            
            # Draw arm (thick line)
            arm_color = (255, 220, 177) if self.gender == 'male' else (255, 220, 177)
            pygame.draw.line(screen, arm_color, 
                           (shoulder_x, shoulder_y), (end_x, end_y), 8)
            
            # Draw hand at end of arm
            pygame.draw.circle(screen, arm_color, (int(end_x), int(end_y)), 10)
        
        # Draw chef body
        current_surface = self.surfaces[self.state]
        screen.blit(current_surface, 
                   (self.x - current_surface.get_width()//2,
                    self.y - current_surface.get_height()//2))


def draw_hand_cursor(screen, hand_x, hand_y, cursor_color, trail_positions):
    """
    Draw hand cursor with trail effect.
    
    Args:
        screen: Pygame surface
        hand_x, hand_y: Hand position
        cursor_color: Current cursor color
        trail_positions: List of previous positions
    """
    # Draw trail (fading dots)
    if trail_positions:
        for i, pos in enumerate(trail_positions):
            alpha = int(255 * (i / len(trail_positions)))
            trail_surface = pygame.Surface((10, 10), pygame.SRCALPHA)
            pygame.draw.circle(trail_surface, (*cursor_color, alpha), (5, 5), 5)
            screen.blit(trail_surface, (pos[0]-5, pos[1]-5))
    
    # Draw main cursor
    pygame.draw.circle(screen, cursor_color, (hand_x, hand_y), CURSOR_RADIUS)
    pygame.draw.circle(screen, COLOR_WHITE, (hand_x, hand_y), CURSOR_RADIUS, 3)
    
    # Draw crosshair
    pygame.draw.line(screen, COLOR_WHITE, 
                    (hand_x - 15, hand_y), (hand_x + 15, hand_y), 2)
    pygame.draw.line(screen, COLOR_WHITE,
                    (hand_x, hand_y - 15), (hand_x, hand_y + 15), 2)


def draw_dwell_progress(screen, hand_x, hand_y, progress):
    """
    Draw visual progress indicator for dwell time.
    
    Args:
        screen: Pygame surface
        hand_x, hand_y: Hand position
        progress: 0.0 to 1.0
    """
    if progress is None or progress <= 0:
        return
    
    # Draw progress ring around cursor
    radius = CURSOR_RADIUS + 10
    angle = progress * 360
    
    # Draw arc
    rect = pygame.Rect(hand_x - radius, hand_y - radius, radius*2, radius*2)
    
    # Pygame doesn't have easy arc drawing, so we'll draw segments
    num_segments = int(angle / 5)
    for i in range(num_segments):
        start_angle = math.radians(i * 5 - 90)  # Start from top
        end_angle = math.radians((i + 1) * 5 - 90)
        
        start_x = hand_x + radius * math.cos(start_angle)
        start_y = hand_y + radius * math.sin(start_angle)
        end_x = hand_x + radius * math.cos(end_angle)
        end_y = hand_y + radius * math.sin(end_angle)
        
        pygame.draw.line(screen, COLOR_GREEN, (start_x, start_y), (end_x, end_y), 4)
