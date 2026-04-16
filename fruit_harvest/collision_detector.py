"""
Collision Detector Module
Handles catch/avoid detection with dwell time for good items
and instant collision for bad items
"""

import math
import time
from config import *


class CollisionDetector:
    """Manages collision detection between hand and items"""
    
    def __init__(self):
        self.dwell_timer = 0
        self.currently_dwelling_item = None
        self.interaction_start_time = None
        
        # Track hand position for tremor calculation during interaction
        self.hand_positions_during_interaction = []
        
    def check_interaction(self, hand_x, hand_y, item, game_mode):
        """
        Check if hand is interacting with item.
        
        Args:
            hand_x: Hand X position in pixels
            hand_y: Hand Y position in pixels (ignored in horizontal mode)
            item: Item object to check collision with
            game_mode: Current game mode
            
        Returns:
            tuple: (outcome, tremor_score)
                outcome: 'caught', 'mistake', 'in_zone', 'no_interaction', 'avoided', 'missed'
                tremor_score: Standard deviation of hand movement during interaction
        """
        # Handle game mode - ignore vertical movement in horizontal mode
        if game_mode == HORIZONTAL_ONLY:
            # Only check X distance, Y is fixed
            distance = abs(hand_x - item.x)
        else:
            # Full range - check both X and Y
            distance = math.sqrt((hand_x - item.x)**2 + (hand_y - item.y)**2)
        
        # Check if within collision zone
        if distance < COLLISION_RADIUS:
            # Store hand position for tremor calculation
            self.hand_positions_during_interaction.append((hand_x, hand_y))
            
            # BAD ITEMS: Instant collision (no dwell time)
            if not item.is_good:
                tremor = self._calculate_tremor()
                self._reset_dwell()
                return ('mistake', tremor)
            
            # GOOD ITEMS: Require dwell time
            if self.currently_dwelling_item != item:
                # Just entered zone, start dwelling
                self.currently_dwelling_item = item
                self.dwell_timer = 0
                self.interaction_start_time = time.time()
                self.hand_positions_during_interaction = [(hand_x, hand_y)]
            
            # Increment dwell timer
            self.dwell_timer += 1
            
            if self.dwell_timer >= DWELL_TIME_FRAMES:
                # Successfully caught after dwelling
                tremor = self._calculate_tremor()
                self._reset_dwell()
                return ('caught', tremor)
            else:
                # Still dwelling (show green glow)
                return ('in_zone', 0.0)
        
        else:
            # Hand not in collision zone
            self._reset_dwell()
            
            # Check if item expired (timeout)
            if item.is_expired():
                if item.is_good:
                    return ('missed', 0.0)  # Missed catching good item
                else:
                    return ('avoided', 0.0)  # Successfully avoided bad item
            
            return ('no_interaction', 0.0)
    
    def _reset_dwell(self):
        """Reset dwell timer and tracking"""
        self.dwell_timer = 0
        self.currently_dwelling_item = None
        self.hand_positions_during_interaction = []
    
    def _calculate_tremor(self):
        """
        Calculate tremor score from hand positions during interaction.
        
        Returns:
            float: Standard deviation of hand movement
        """
        if len(self.hand_positions_during_interaction) < 3:
            return 0.0
        
        import numpy as np
        positions = np.array(self.hand_positions_during_interaction)
        
        # Calculate standard deviation
        x_std = np.std(positions[:, 0])
        y_std = np.std(positions[:, 1])
        
        tremor_score = math.sqrt(x_std**2 + y_std**2)
        return round(tremor_score, 2)
    
    def get_dwell_progress(self):
        """
        Get current dwell progress for visual feedback.
        
        Returns:
            float: 0.0 to 1.0, or None if not dwelling
        """
        if self.dwell_timer > 0:
            return min(self.dwell_timer / DWELL_TIME_FRAMES, 1.0)
        return None


def get_hand_item_distance(hand_x, hand_y, item, game_mode):
    """
    Calculate distance between hand and item.
    
    Args:
        hand_x, hand_y: Hand position
        item: Item object
        game_mode: Game mode (affects distance calculation)
        
    Returns:
        float: Distance in pixels
    """
    if game_mode == HORIZONTAL_ONLY:
        # Only horizontal distance matters
        return abs(hand_x - item.x)
    else:
        # Full Euclidean distance
        return math.sqrt((hand_x - item.x)**2 + (hand_y - item.y)**2)


def get_cursor_color(item, distance):
    """
    Determine cursor color based on proximity to items.
    
    Args:
        item: Current item (or None)
        distance: Distance to item
        
    Returns:
        tuple: RGB color
    """
    if item is None:
        return COLOR_BLUE  # Default blue when no item
    
    if distance < COLLISION_RADIUS:
        if item.is_good:
            return COLOR_GREEN  # Green near good items
        else:
            return COLOR_RED  # Red near bad items (WARNING!)
    
    return COLOR_BLUE  # Blue when not in range
