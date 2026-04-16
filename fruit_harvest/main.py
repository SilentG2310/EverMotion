"""
Fruit Harvest Rehabilitation Game - Main Entry Point
A hand-tracking game for motor rehabilitation of elderly users
"""

import pygame
import cv2
import sys
import time
import random
from datetime import datetime

from config import *
from hand_tracker import HandTracker
from item_spawner import ItemSpawner, Item, draw_item_with_glow
from collision_detector import CollisionDetector, get_hand_item_distance, get_cursor_color
from chef_avatar import ChefAvatar, draw_hand_cursor, draw_dwell_progress
from data_logger import DataLogger


class GameState:
    """Enum for game states"""
    WELCOME = "welcome"
    DIFFICULTY_SELECT = "difficulty_select"
    CALIBRATION = "calibration"
    HAND_DETECTION = "hand_detection"
    PLAYING = "playing"
    PAUSED = "paused"
    END_SESSION = "end_session"


class FruitHarvestGame:
    """Main game class"""
    
    def __init__(self):
        """Initialize game"""
        pygame.init()
        
        # Display
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Fruit Harvest - Rehabilitation Game")
        self.clock = pygame.time.Clock()
        
        # Fonts
        self.font_large = pygame.font.Font(None, FONT_SIZE_LARGE)
        self.font_medium = pygame.font.Font(None, FONT_SIZE_MEDIUM)
        self.font_small = pygame.font.Font(None, FONT_SIZE_SMALL)
        
        # Camera
        self.camera = cv2.VideoCapture(0)
        if not self.camera.isOpened():
            print("ERROR: Cannot open webcam!")
            sys.exit(1)
        
        # Components
        self.hand_tracker = HandTracker()
        self.collision_detector = CollisionDetector()
        
        # Game state
        self.state = GameState.WELCOME
        self.game_mode = None
        self.avatar_gender = None
        self.chef = None
        self.spawner = None
        self.data_logger = None
        
        # Game variables
        self.current_item = None
        self.score = 0
        self.good_items_caught = 0
        self.good_items_spawned = 0
        self.bad_items_avoided = 0
        self.bad_items_spawned = 0
        
        # Session
        self.session_start_time = None
        self.session_duration = 0
        
        # Hand tracking
        self.hand_detected_frames = 0
        self.hand_trail = []
        
        # Calibration
        self.calibration_step = 0
        self.calibration_data = {}
        
        # ROM tracking during interaction
        self.interaction_hand_positions = []
        
    def run(self):
        """Main game loop"""
        running = True
        
        while running:
            dt = self.clock.tick(FPS) / 1000.0  # Delta time in seconds
            
            # Event handling
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        if self.state == GameState.PLAYING:
                            self.state = GameState.PAUSED
                        elif self.state == GameState.PAUSED:
                            self.state = GameState.PLAYING
                        else:
                            running = False
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    self._handle_click(event.pos)
            
            # Update based on state
            if self.state == GameState.WELCOME:
                self._update_welcome()
            elif self.state == GameState.DIFFICULTY_SELECT:
                self._update_difficulty_select()
            elif self.state == GameState.CALIBRATION:
                self._update_calibration(dt)
            elif self.state == GameState.HAND_DETECTION:
                self._update_hand_detection(dt)
            elif self.state == GameState.PLAYING:
                self._update_playing(dt)
            elif self.state == GameState.PAUSED:
                self._update_paused()
            elif self.state == GameState.END_SESSION:
                self._update_end_session()
            
            # Render
            self._render()
            
            pygame.display.flip()
        
        # Cleanup
        self.cleanup()
    
    def _handle_click(self, pos):
        """Handle mouse clicks on buttons"""
        x, y = pos
        
        if self.state == GameState.WELCOME:
            # Avatar selection buttons
            male_button = pygame.Rect(SCREEN_WIDTH//2 - 200, 300, 150, 150)
            female_button = pygame.Rect(SCREEN_WIDTH//2 + 50, 300, 150, 150)
            
            if male_button.collidepoint(pos):
                self.avatar_gender = 'male'
                self.state = GameState.DIFFICULTY_SELECT
            elif female_button.collidepoint(pos):
                self.avatar_gender = 'female'
                self.state = GameState.DIFFICULTY_SELECT
        
        elif self.state == GameState.DIFFICULTY_SELECT:
            # Mode selection buttons
            full_button = pygame.Rect(SCREEN_WIDTH//2 - 250, 300, 200, 100)
            horizontal_button = pygame.Rect(SCREEN_WIDTH//2 + 50, 300, 200, 100)
            calibrate_button = pygame.Rect(SCREEN_WIDTH//2 - 100, 450, 200, 50)
            
            if full_button.collidepoint(pos):
                self.game_mode = FULL_RANGE
                self._start_game()
            elif horizontal_button.collidepoint(pos):
                self.game_mode = HORIZONTAL_ONLY
                self._start_game()
            elif calibrate_button.collidepoint(pos):
                self.state = GameState.CALIBRATION
                self.calibration_step = 0
        
        elif self.state == GameState.END_SESSION:
            # Play again or exit
            play_again_button = pygame.Rect(SCREEN_WIDTH//2 - 250, 500, 200, 50)
            exit_button = pygame.Rect(SCREEN_WIDTH//2 + 50, 500, 200, 50)
            
            if play_again_button.collidepoint(pos):
                self._reset_game()
                self.state = GameState.DIFFICULTY_SELECT
            elif exit_button.collidepoint(pos):
                sys.exit(0)
    
    def _start_game(self):
        """Initialize game session"""
        # Create chef avatar
        self.chef = ChefAvatar(self.avatar_gender, SCREEN_WIDTH, SCREEN_HEIGHT)
        
        # Create spawner
        self.spawner = ItemSpawner(self.game_mode)
        
        # Create data logger
        session_id = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.data_logger = DataLogger(session_id, self.game_mode, self.avatar_gender)
        
        # Reset game variables
        self.score = 0
        self.good_items_caught = 0
        self.good_items_spawned = 0
        self.bad_items_avoided = 0
        self.bad_items_spawned = 0
        self.current_item = None
        
        # Go to hand detection
        self.state = GameState.HAND_DETECTION
        self.hand_detected_frames = 0
        self.hand_tracker.reset_position_history()
    
    def _update_welcome(self):
        """Update welcome screen"""
        pass  # Just render
    
    def _update_difficulty_select(self):
        """Update difficulty selection"""
        pass  # Just render
    
    def _update_calibration(self, dt):
        """Update calibration process"""
        # Read camera frame
        ret, frame = self.camera.read()
        if not ret:
            return
        
        frame = cv2.flip(frame, 1)  # Mirror
        hand_x, hand_y = self.hand_tracker.process_frame(frame)
        
        # Track ROM during calibration
        if hand_x and hand_y:
            if 'max_y' not in self.calibration_data:
                self.calibration_data = {
                    'max_y': hand_y,
                    'min_y': hand_y,
                    'max_x': hand_x,
                    'min_x': hand_x
                }
            else:
                self.calibration_data['max_y'] = max(self.calibration_data['max_y'], hand_y)
                self.calibration_data['min_y'] = min(self.calibration_data['min_y'], hand_y)
                self.calibration_data['max_x'] = max(self.calibration_data['max_x'], hand_x)
                self.calibration_data['min_x'] = min(self.calibration_data['min_x'], hand_x)
    
    def _update_hand_detection(self, dt):
        """Wait for stable hand detection"""
        ret, frame = self.camera.read()
        if not ret:
            return
        
        frame = cv2.flip(frame, 1)
        hand_x, hand_y = self.hand_tracker.process_frame(frame)
        
        if hand_x and hand_y:
            self.hand_detected_frames += 1
            if self.hand_detected_frames >= HAND_DETECTION_REQUIRED_FRAMES:
                # Start playing
                self.session_start_time = time.time()
                self.current_item = self.spawner.spawn_item()
                self.state = GameState.PLAYING
        else:
            self.hand_detected_frames = 0
    
    def _update_playing(self, dt):
        """Update game logic"""
        # Read camera
        ret, frame = self.camera.read()
        if not ret:
            return
        
        frame = cv2.flip(frame, 1)
        hand_x, hand_y = self.hand_tracker.process_frame(frame)
        
        # Update session duration
        self.session_duration = time.time() - self.session_start_time
        
        # Check end conditions
        if self.session_duration >= SESSION_DURATION or \
           self.good_items_caught >= ITEM_GOAL:
            self._end_session()
            return
        
        # Update hand trail
        if hand_x and hand_y:
            self.hand_trail.append((hand_x, hand_y))
            if len(self.hand_trail) > TRAIL_LENGTH:
                self.hand_trail.pop(0)
            
            # Track positions during interaction
            self.interaction_hand_positions.append((hand_x, hand_y))
            if len(self.interaction_hand_positions) > 30:
                self.interaction_hand_positions.pop(0)
        else:
            # Hand lost - pause or warning
            self.hand_trail = []
            return
        
        # Update chef avatar
        self.chef.update(dt, hand_x, hand_y)
        
        # Update current item
        if self.current_item:
            self.current_item.update(dt)
            
            # Check interaction
            outcome, tremor = self.collision_detector.check_interaction(
                hand_x, hand_y, self.current_item, self.game_mode
            )
            
            if outcome in ['caught', 'mistake', 'avoided', 'missed']:
                # Interaction completed
                self._handle_item_outcome(outcome, tremor)
                
                # Spawn next item
                self.current_item = self.spawner.spawn_item()
    
    def _handle_item_outcome(self, outcome, tremor):
        """Handle item interaction outcome"""
        item = self.current_item
        
        # Calculate ROM during interaction
        if self.interaction_hand_positions:
            import numpy as np
            positions = np.array(self.interaction_hand_positions)
            hand_max_y = np.max(positions[:, 1])
            hand_max_x = np.max(positions[:, 0])
            hand_min_x = np.min(positions[:, 0])
        else:
            hand_max_y = hand_max_x = hand_min_x = 0
        
        # Calculate reaction time
        reaction_time = item.lifetime
        
        # Determine score change and update counters
        score_change = 0
        
        if outcome == 'caught':
            score_change = CATCH_GOOD_POINTS
            self.good_items_caught += 1
            self.chef.set_state('happy', 0.5)
        elif outcome == 'avoided':
            score_change = AVOID_BAD_POINTS
            self.bad_items_avoided += 1
        elif outcome == 'mistake':
            score_change = CATCH_BAD_PENALTY
            self.chef.set_state('sad', 0.5)
        elif outcome == 'missed':
            score_change = 0
        
        self.score += score_change
        
        # Track item counts
        if item.is_good:
            self.good_items_spawned += 1
        else:
            self.bad_items_spawned += 1
        
        # Log to CSV
        self.data_logger.log_interaction(
            item, outcome, score_change, tremor,
            hand_max_y, hand_max_x, hand_min_x, reaction_time
        )
        
        # Reset interaction tracking
        self.interaction_hand_positions = []
    
    def _update_paused(self):
        """Update pause state"""
        pass  # Just render
    
    def _update_end_session(self):
        """Update end session screen"""
        pass  # Just render
    
    def _end_session(self):
        """End game session"""
        # Save data
        self.data_logger.save_to_csv()
        self.state = GameState.END_SESSION
    
    def _reset_game(self):
        """Reset for new session"""
        self.current_item = None
        self.score = 0
        self.good_items_caught = 0
        self.good_items_spawned = 0
        self.bad_items_avoided = 0
        self.bad_items_spawned = 0
        self.hand_trail = []
    
    def _render(self):
        """Render current game state"""
        if self.state == GameState.WELCOME:
            self._render_welcome()
        elif self.state == GameState.DIFFICULTY_SELECT:
            self._render_difficulty_select()
        elif self.state == GameState.CALIBRATION:
            self._render_calibration()
        elif self.state == GameState.HAND_DETECTION:
            self._render_hand_detection()
        elif self.state == GameState.PLAYING:
            self._render_playing()
        elif self.state == GameState.PAUSED:
            self._render_paused()
        elif self.state == GameState.END_SESSION:
            self._render_end_session()
    
    def _render_welcome(self):
        """Render welcome screen"""
        self.screen.fill(COLOR_LIGHT_BROWN)
        
        # Title
        title = self.font_large.render("FRUIT HARVEST", True, COLOR_BROWN)
        self.screen.blit(title, (SCREEN_WIDTH//2 - title.get_width()//2, 100))
        
        subtitle = self.font_medium.render("Rehabilitation Game", True, COLOR_DARK_GRAY)
        self.screen.blit(subtitle, (SCREEN_WIDTH//2 - subtitle.get_width()//2, 160))
        
        # Instructions
        inst = self.font_small.render("Select Your Chef:", True, COLOR_BLACK)
        self.screen.blit(inst, (SCREEN_WIDTH//2 - inst.get_width()//2, 250))
        
        # Avatar selection buttons
        male_button = pygame.Rect(SCREEN_WIDTH//2 - 200, 300, 150, 150)
        female_button = pygame.Rect(SCREEN_WIDTH//2 + 50, 300, 150, 150)
        
        pygame.draw.rect(self.screen, COLOR_BLUE, male_button)
        pygame.draw.rect(self.screen, COLOR_RED, female_button)
        pygame.draw.rect(self.screen, COLOR_BLACK, male_button, 3)
        pygame.draw.rect(self.screen, COLOR_BLACK, female_button, 3)
        
        male_text = self.font_medium.render("Male", True, COLOR_WHITE)
        female_text = self.font_medium.render("Female", True, COLOR_WHITE)
        
        self.screen.blit(male_text, 
                        (male_button.centerx - male_text.get_width()//2,
                         male_button.centery - male_text.get_height()//2))
        self.screen.blit(female_text,
                        (female_button.centerx - female_text.get_width()//2,
                         female_button.centery - female_text.get_height()//2))
    
    def _render_difficulty_select(self):
        """Render difficulty selection"""
        self.screen.fill(COLOR_LIGHT_BROWN)
        
        title = self.font_large.render("Select Difficulty Mode", True, COLOR_BROWN)
        self.screen.blit(title, (SCREEN_WIDTH//2 - title.get_width()//2, 100))
        
        # Mode buttons
        full_button = pygame.Rect(SCREEN_WIDTH//2 - 250, 300, 200, 100)
        horizontal_button = pygame.Rect(SCREEN_WIDTH//2 + 50, 300, 200, 100)
        
        pygame.draw.rect(self.screen, COLOR_GREEN, full_button)
        pygame.draw.rect(self.screen, COLOR_ORANGE, horizontal_button)
        pygame.draw.rect(self.screen, COLOR_BLACK, full_button, 3)
        pygame.draw.rect(self.screen, COLOR_BLACK, horizontal_button, 3)
        
        full_text1 = self.font_small.render("Full Range", True, COLOR_BLACK)
        full_text2 = self.font_small.render("(Height + Width)", True, COLOR_BLACK)
        horiz_text1 = self.font_small.render("Horizontal Only", True, COLOR_BLACK)
        horiz_text2 = self.font_small.render("(Width Only)", True, COLOR_BLACK)
        
        self.screen.blit(full_text1, 
                        (full_button.centerx - full_text1.get_width()//2,
                         full_button.centery - 20))
        self.screen.blit(full_text2,
                        (full_button.centerx - full_text2.get_width()//2,
                         full_button.centery + 10))
        
        self.screen.blit(horiz_text1,
                        (horizontal_button.centerx - horiz_text1.get_width()//2,
                         horizontal_button.centery - 20))
        self.screen.blit(horiz_text2,
                        (horizontal_button.centerx - horiz_text2.get_width()//2,
                         horizontal_button.centery + 10))
        
        # Calibrate button
        calibrate_button = pygame.Rect(SCREEN_WIDTH//2 - 100, 450, 200, 50)
        pygame.draw.rect(self.screen, COLOR_GRAY, calibrate_button)
        pygame.draw.rect(self.screen, COLOR_BLACK, calibrate_button, 3)
        
        cal_text = self.font_small.render("Test My Range First", True, COLOR_WHITE)
        self.screen.blit(cal_text,
                        (calibrate_button.centerx - cal_text.get_width()//2,
                         calibrate_button.centery - cal_text.get_height()//2))
    
    def _render_calibration(self):
        """Render calibration screen"""
        self.screen.fill(COLOR_LIGHT_GRAY)
        
        title = self.font_medium.render("Calibration - Move Your Hand Around", True, COLOR_BLACK)
        self.screen.blit(title, (SCREEN_WIDTH//2 - title.get_width()//2, 50))
        
        if self.calibration_data:
            vertical_range = self.calibration_data['max_y'] - self.calibration_data['min_y']
            horizontal_range = self.calibration_data['max_x'] - self.calibration_data['min_x']
            
            vert_text = self.font_small.render(f"Vertical Range: {vertical_range}px", True, COLOR_BLACK)
            horiz_text = self.font_small.render(f"Horizontal Range: {horizontal_range}px", True, COLOR_BLACK)
            
            self.screen.blit(vert_text, (50, 150))
            self.screen.blit(horiz_text, (50, 200))
            
            # Recommendation
            if vertical_range >= MIN_VERTICAL_RANGE_FOR_FULL_MODE:
                rec = self.font_small.render("Recommended: Full Range Mode", True, COLOR_GREEN)
            else:
                rec = self.font_small.render("Recommended: Horizontal Only Mode", True, COLOR_ORANGE)
            
            self.screen.blit(rec, (50, 250))
        
        # Instructions
        inst = self.font_small.render("Press ESC to return to mode selection", True, COLOR_DARK_GRAY)
        self.screen.blit(inst, (SCREEN_WIDTH//2 - inst.get_width()//2, 600))
    
    def _render_hand_detection(self):
        """Render hand detection waiting screen"""
        self.screen.fill(COLOR_LIGHT_BROWN)
        
        title = self.font_large.render("Detecting Hand...", True, COLOR_BROWN)
        self.screen.blit(title, (SCREEN_WIDTH//2 - title.get_width()//2, 200))
        
        progress = self.hand_detected_frames / HAND_DETECTION_REQUIRED_FRAMES
        progress_text = self.font_medium.render(f"{int(progress*100)}%", True, COLOR_DARK_GRAY)
        self.screen.blit(progress_text, (SCREEN_WIDTH//2 - progress_text.get_width()//2, 300))
        
        # Progress bar
        bar_width = 400
        bar_height = 30
        bar_x = SCREEN_WIDTH//2 - bar_width//2
        bar_y = 350
        
        pygame.draw.rect(self.screen, COLOR_GRAY, (bar_x, bar_y, bar_width, bar_height))
        pygame.draw.rect(self.screen, COLOR_GREEN, 
                        (bar_x, bar_y, int(bar_width * progress), bar_height))
        pygame.draw.rect(self.screen, COLOR_BLACK, (bar_x, bar_y, bar_width, bar_height), 3)
        
        inst = self.font_small.render("Hold your hand visible for 3 seconds", True, COLOR_BLACK)
        self.screen.blit(inst, (SCREEN_WIDTH//2 - inst.get_width()//2, 450))
    
    def _render_playing(self):
        """Render main game screen"""
        # Background
        self._draw_kitchen_background()
        
        # Header
        self._draw_header()
        
        # Current item
        if self.current_item:
            warning = self.current_item.lifetime >= (ITEM_LIFETIME - 2)
            draw_item_with_glow(self.screen, self.current_item, warning)
        
        # Hand cursor and trail
        if self.hand_trail:
            hand_x, hand_y = self.hand_trail[-1]
            
            # Determine cursor color
            if self.current_item:
                distance = get_hand_item_distance(hand_x, hand_y, self.current_item, self.game_mode)
                cursor_color = get_cursor_color(self.current_item, distance)
            else:
                cursor_color = COLOR_BLUE
            
            draw_hand_cursor(self.screen, hand_x, hand_y, cursor_color, self.hand_trail[:-1])
            
            # Dwell progress indicator
            progress = self.collision_detector.get_dwell_progress()
            if progress:
                draw_dwell_progress(self.screen, hand_x, hand_y, progress)
            
            # Chef avatar with arm
            self.chef.draw(self.screen, hand_x, hand_y)
        else:
            # No hand detected - just draw chef
            self.chef.draw(self.screen)
        
        # Guide line for horizontal mode
        if self.game_mode == HORIZONTAL_ONLY:
            pygame.draw.line(self.screen, COLOR_YELLOW,
                           (0, HORIZONTAL_FIXED_Y), 
                           (SCREEN_WIDTH, HORIZONTAL_FIXED_Y), 2)
            pygame.draw.line(self.screen, COLOR_WHITE,
                           (0, HORIZONTAL_FIXED_Y), 
                           (SCREEN_WIDTH, HORIZONTAL_FIXED_Y), 1)
    
    def _render_paused(self):
        """Render pause overlay"""
        self._render_playing()
        
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 180))
        self.screen.blit(overlay, (0, 0))
        
        title = self.font_large.render("PAUSED", True, COLOR_WHITE)
        self.screen.blit(title, (SCREEN_WIDTH//2 - title.get_width()//2, 250))
        
        inst = self.font_medium.render("Press ESC to resume", True, COLOR_WHITE)
        self.screen.blit(inst, (SCREEN_WIDTH//2 - inst.get_width()//2, 350))
    
    def _render_end_session(self):
        """Render end session summary"""
        self.screen.fill(COLOR_LIGHT_BROWN)
        
        title = self.font_large.render("Session Complete!", True, COLOR_BROWN)
        self.screen.blit(title, (SCREEN_WIDTH//2 - title.get_width()//2, 50))
        
        # Summary
        summary = self.data_logger.get_session_summary()
        
        y_offset = 150
        stats = [
            f"Final Score: {summary['total_score']} points",
            f"Good Items Caught: {summary['good_caught']}/{summary['good_total']}",
            f"Bad Items Avoided: {summary['bad_avoided']}/{summary['bad_total']}",
            f"Average Reaction Time: {summary['avg_reaction_time']}s",
            f"Average Tremor: {summary['avg_tremor']}",
            f"Session Duration: {int(summary['duration'])}s"
        ]
        
        for stat in stats:
            text = self.font_medium.render(stat, True, COLOR_BLACK)
            self.screen.blit(text, (SCREEN_WIDTH//2 - text.get_width()//2, y_offset))
            y_offset += 40
        
        # Buttons
        play_again_button = pygame.Rect(SCREEN_WIDTH//2 - 250, 500, 200, 50)
        exit_button = pygame.Rect(SCREEN_WIDTH//2 + 50, 500, 200, 50)
        
        pygame.draw.rect(self.screen, COLOR_GREEN, play_again_button)
        pygame.draw.rect(self.screen, COLOR_RED, exit_button)
        pygame.draw.rect(self.screen, COLOR_BLACK, play_again_button, 3)
        pygame.draw.rect(self.screen, COLOR_BLACK, exit_button, 3)
        
        play_text = self.font_medium.render("Play Again", True, COLOR_WHITE)
        exit_text = self.font_medium.render("Exit", True, COLOR_WHITE)
        
        self.screen.blit(play_text,
                        (play_again_button.centerx - play_text.get_width()//2,
                         play_again_button.centery - play_text.get_height()//2))
        self.screen.blit(exit_text,
                        (exit_button.centerx - exit_text.get_width()//2,
                         exit_button.centery - exit_text.get_height()//2))
    
    def _draw_kitchen_background(self):
        """Draw kitchen scene background"""
        # Floor
        self.screen.fill(COLOR_LIGHT_BROWN)
        
        # Counter (bottom 25%)
        counter_y = SCREEN_HEIGHT - 180
        pygame.draw.rect(self.screen, COLOR_BROWN, 
                        (0, counter_y, SCREEN_WIDTH, 180))
        
        # Counter top edge
        pygame.draw.rect(self.screen, COLOR_DARK_GRAY,
                        (0, counter_y, SCREEN_WIDTH, 10))
        
        # Stove (simple rectangles)
        stove_x = SCREEN_WIDTH//2 - 100
        pygame.draw.rect(self.screen, COLOR_DARK_GRAY,
                        (stove_x, counter_y - 80, 200, 80))
        
        # Burners
        for i in range(2):
            for j in range(2):
                pygame.draw.circle(self.screen, COLOR_BLACK,
                                 (stove_x + 50 + i*100, counter_y - 40 + j*40), 15)
    
    def _draw_header(self):
        """Draw game header with stats"""
        # Header background
        pygame.draw.rect(self.screen, (240, 230, 220), (0, 0, SCREEN_WIDTH, HEADER_HEIGHT))
        pygame.draw.line(self.screen, COLOR_DARK_GRAY, 
                        (0, HEADER_HEIGHT), (SCREEN_WIDTH, HEADER_HEIGHT), 2)
        
        # Title
        title = self.font_medium.render("FRUIT HARVEST", True, COLOR_BROWN)
        self.screen.blit(title, (20, 10))
        
        mode_text = f"Mode: {'Full Range' if self.game_mode == FULL_RANGE else 'Horizontal Only'}"
        mode = self.font_small.render(mode_text, True, COLOR_DARK_GRAY)
        self.screen.blit(mode, (20, 45))
        
        # Score
        score_text = self.font_medium.render(f"Score: {self.score}", True, COLOR_BLACK)
        self.screen.blit(score_text, (SCREEN_WIDTH - 250, 10))
        
        # Time
        time_remaining = SESSION_DURATION - self.session_duration
        mins = int(time_remaining // 60)
        secs = int(time_remaining % 60)
        time_text = self.font_small.render(f"Time: {mins}:{secs:02d}", True, COLOR_BLACK)
        self.screen.blit(time_text, (SCREEN_WIDTH - 250, 45))
        
        # Items caught
        items_text = self.font_small.render(
            f"Good: {self.good_items_caught}/{self.good_items_spawned}  Bad Avoided: {self.bad_items_avoided}/{self.bad_items_spawned}",
            True, COLOR_DARK_GRAY
        )
        self.screen.blit(items_text, (SCREEN_WIDTH//2 - items_text.get_width()//2, 30))
    
    def cleanup(self):
        """Clean up resources"""
        self.camera.release()
        self.hand_tracker.release()
        cv2.destroyAllWindows()
        pygame.quit()


def main():
    """Main entry point"""
    print("="*60)
    print("FRUIT HARVEST - Rehabilitation Game")
    print("="*60)
    print("\nStarting game...")
    print("Make sure your webcam is connected and you have good lighting!")
    print("\nControls:")
    print("  - Use your hand to catch fruits")
    print("  - Avoid bombs and fish bones")
    print("  - ESC: Pause/Resume")
    print("="*60)
    
    game = FruitHarvestGame()
    game.run()


if __name__ == "__main__":
    main()
