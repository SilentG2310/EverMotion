"""
Item Spawner Module
Generates kitchen items (fruits and bad items) at randomized positions
"""

import random
import time
import pygame
from config import *


class Item:
    """Represents a single item (fruit or bad item)"""
    
    def __init__(self, item_type, x, y, height_level, game_mode):
        self.type = item_type
        self.x = x
        self.y = y
        self.height_level = height_level
        self.game_mode = game_mode
        
        # Timing
        self.spawn_time = time.time()
        self.lifetime = 0.0
        
        # Movement
        self.velocity_y = FULL_RANGE_FALL_SPEED if game_mode == FULL_RANGE else 0
        self.velocity_x = HORIZONTAL_DRIFT_SPEED if game_mode == HORIZONTAL_ONLY else 0
        self.drift_direction = random.choice([-1, 1])  # Left or right
        
        # State
        self.is_good = item_type in GOOD_ITEMS
        self.is_collected = False
        self.is_avoided = False
        
        # Surface for rendering
        self.surface = self._create_surface()
        
    def _create_surface(self):
        """Create visual representation of item (placeholder graphics)"""
        surface = pygame.Surface((ITEM_SIZE, ITEM_SIZE), pygame.SRCALPHA)
        
        if self.type == "apple":
            # Red circle with brown stem
            pygame.draw.circle(surface, (220, 50, 50), (ITEM_SIZE//2, ITEM_SIZE//2), 35)
            pygame.draw.rect(surface, (101, 67, 33), (ITEM_SIZE//2-3, 5, 6, 15))
            # Highlight
            pygame.draw.circle(surface, (255, 150, 150), (ITEM_SIZE//2-10, ITEM_SIZE//2-10), 12)
            
        elif self.type == "banana":
            # Yellow curved shape
            points = [
                (20, 40), (30, 20), (50, 15), (70, 20), (75, 35),
                (70, 50), (50, 60), (30, 55), (25, 45)
            ]
            pygame.draw.polygon(surface, (255, 215, 0), points)
            pygame.draw.polygon(surface, (200, 180, 0), points, 2)
            
        elif self.type == "orange":
            # Orange circle with texture
            pygame.draw.circle(surface, (255, 140, 0), (ITEM_SIZE//2, ITEM_SIZE//2), 35)
            # Texture dots
            for _ in range(15):
                x = random.randint(15, ITEM_SIZE-15)
                y = random.randint(15, ITEM_SIZE-15)
                pygame.draw.circle(surface, (230, 120, 0), (x, y), 2)
            
        elif self.type == "bomb":
            # Black sphere with fuse
            pygame.draw.circle(surface, (30, 30, 30), (ITEM_SIZE//2, ITEM_SIZE//2), 30)
            # Fuse
            pygame.draw.line(surface, (101, 67, 33), 
                           (ITEM_SIZE//2, ITEM_SIZE//2-30), 
                           (ITEM_SIZE//2+15, ITEM_SIZE//2-45), 5)
            # Spark
            pygame.draw.circle(surface, (255, 100, 0), 
                             (ITEM_SIZE//2+15, ITEM_SIZE//2-45), 5)
            
        elif self.type == "fish_bone":
            # White skeleton
            # Spine
            pygame.draw.line(surface, COLOR_WHITE, (20, ITEM_SIZE//2), (ITEM_SIZE-20, ITEM_SIZE//2), 4)
            # Ribs
            for x in range(25, ITEM_SIZE-20, 10):
                pygame.draw.line(surface, COLOR_WHITE, (x, ITEM_SIZE//2), (x-5, ITEM_SIZE//2-10), 2)
                pygame.draw.line(surface, COLOR_WHITE, (x, ITEM_SIZE//2), (x-5, ITEM_SIZE//2+10), 2)
        
        return surface
    
    def update(self, dt):
        """Update item position and lifetime"""
        self.lifetime += dt
        
        # Move based on game mode
        if self.game_mode == FULL_RANGE:
            self.y += self.velocity_y * dt
        elif self.game_mode == HORIZONTAL_ONLY:
            self.x += self.velocity_x * self.drift_direction * dt
            # Bounce off edges
            if self.x < 50 or self.x > SCREEN_WIDTH - 50:
                self.drift_direction *= -1
    
    def is_expired(self):
        """Check if item has been on screen too long"""
        return self.lifetime >= ITEM_LIFETIME
    
    def get_rect(self):
        """Get bounding rectangle for collision detection"""
        return pygame.Rect(
            self.x - ITEM_SIZE//2,
            self.y - ITEM_SIZE//2,
            ITEM_SIZE,
            ITEM_SIZE
        )


class ItemSpawner:
    """Manages item spawning and tracking"""
    
    def __init__(self, game_mode):
        self.game_mode = game_mode
        self.items_spawned = 0
        self.good_items_spawned = 0
        
    def spawn_item(self):
        """
        Generate a new item at random position.
        
        Returns:
            Item: Newly spawned item
        """
        # Determine item type
        if self.items_spawned < GUARANTEED_GOOD_ITEMS:
            # First 5 items are always good
            item_type = random.choice(GOOD_ITEMS)
        else:
            # Random based on probability
            if random.random() < GOOD_ITEM_PROBABILITY:
                item_type = random.choice(GOOD_ITEMS)
            else:
                item_type = random.choice(BAD_ITEMS)
        
        # Determine spawn position based on game mode
        if self.game_mode == FULL_RANGE:
            # Random height level
            height_level = random.choices(
                list(HEIGHT_PROBABILITIES.keys()),
                weights=list(HEIGHT_PROBABILITIES.values())
            )[0]
            
            # Don't spawn bad items at max reach (Level 5)
            if item_type in BAD_ITEMS and height_level == 5:
                height_level = 4
            
            # Get Y position for this level
            y_min, y_max = SPAWN_HEIGHTS[height_level]
            y = random.randint(y_min, y_max)
            
            # Random X position
            x = int(random.uniform(
                SCREEN_WIDTH * FULL_RANGE_X_MIN,
                SCREEN_WIDTH * FULL_RANGE_X_MAX
            ))
            
        else:  # HORIZONTAL_ONLY
            height_level = "FIXED"
            y = HORIZONTAL_FIXED_Y
            
            # Wider X range for horizontal mode
            x = int(random.uniform(
                SCREEN_WIDTH * HORIZONTAL_ONLY_X_MIN,
                SCREEN_WIDTH * HORIZONTAL_ONLY_X_MAX
            ))
        
        # Create and track item
        item = Item(item_type, x, y, height_level, self.game_mode)
        self.items_spawned += 1
        if item_type in GOOD_ITEMS:
            self.good_items_spawned += 1
        
        return item
    
    def reset(self):
        """Reset spawner counters"""
        self.items_spawned = 0
        self.good_items_spawned = 0


def draw_item_with_glow(screen, item, warning_pulse=False):
    """
    Draw item with appropriate glow effect.
    
    Args:
        screen: Pygame surface
        item: Item object
        warning_pulse: Whether item is about to expire
    """
    # Draw glow/warning
    if item.is_good:
        # Green sparkles for good items
        glow_color = COLOR_GREEN
        glow_radius = ITEM_SIZE//2 + 10
    else:
        # Red glow for bad items
        glow_color = COLOR_RED
        glow_radius = ITEM_SIZE//2 + 15
        
        # Warning icon above bad items
        font = pygame.font.Font(None, 40)
        warning_text = font.render("⚠", True, COLOR_RED)
        screen.blit(warning_text, (item.x - 10, item.y - ITEM_SIZE//2 - 30))
    
    # Pulsing glow
    pulse_factor = abs(pygame.time.get_ticks() % 1000 - 500) / 500.0
    current_radius = int(glow_radius * (0.8 + 0.2 * pulse_factor))
    
    glow_surface = pygame.Surface((current_radius*2, current_radius*2), pygame.SRCALPHA)
    pygame.draw.circle(glow_surface, (*glow_color, 60), 
                      (current_radius, current_radius), current_radius)
    screen.blit(glow_surface, 
               (item.x - current_radius, item.y - current_radius))
    
    # Yellow pulse if about to expire
    if warning_pulse:
        warning_surface = pygame.Surface((ITEM_SIZE+20, ITEM_SIZE+20), pygame.SRCALPHA)
        pygame.draw.circle(warning_surface, (*COLOR_YELLOW, 100),
                         (ITEM_SIZE//2+10, ITEM_SIZE//2+10), ITEM_SIZE//2+10)
        screen.blit(warning_surface,
                   (item.x - ITEM_SIZE//2 - 10, item.y - ITEM_SIZE//2 - 10))
    
    # Draw the item itself
    screen.blit(item.surface, 
               (item.x - ITEM_SIZE//2, item.y - ITEM_SIZE//2))
