"""
Configuration file for Fruit Harvest Rehabilitation Game
Contains all game constants, thresholds, and settings
"""

# Screen Settings
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
FPS = 30

# Game Modes
FULL_RANGE = "full_range"
HORIZONTAL_ONLY = "horizontal_only"

# Item Types
GOOD_ITEMS = ["apple", "banana", "orange"]
BAD_ITEMS = ["bomb", "fish_bone"]

# Spawn Settings
ITEM_SIZE = 80
COLLISION_RADIUS = 70  # pixels
DWELL_TIME_FRAMES = 9  # 0.3 seconds at 30 FPS
ITEM_LIFETIME = 8.0  # seconds

# Item Distribution
GOOD_ITEM_PROBABILITY = 0.7  # 70% good items
GUARANTEED_GOOD_ITEMS = 5  # First 5 items are always good

# Spawn Heights (Full Range Mode) - Y coordinates (lower = higher on screen)
SPAWN_HEIGHTS = {
    1: (600, 650),  # Waist - always reachable
    2: (500, 550),  # Chest
    3: (350, 400),  # Shoulder - most common
    4: (200, 250),  # Head
    5: (50, 100),   # Overhead - stretch goal
}

# Spawn height probabilities (most items at shoulder level)
HEIGHT_PROBABILITIES = {
    1: 0.15,  # 15%
    2: 0.25,  # 25%
    3: 0.40,  # 40%
    4: 0.15,  # 15%
    5: 0.05,  # 5%
}

# Horizontal spawn range (as percentage of screen width)
FULL_RANGE_X_MIN = 0.20  # 20%
FULL_RANGE_X_MAX = 0.80  # 80%
HORIZONTAL_ONLY_X_MIN = 0.10  # 10%
HORIZONTAL_ONLY_X_MAX = 0.90  # 90%

# Fixed height for horizontal only mode
HORIZONTAL_FIXED_Y = 400

# Item Movement
FULL_RANGE_FALL_SPEED = 50  # pixels per second
HORIZONTAL_DRIFT_SPEED = 30  # pixels per second

# Scoring
CATCH_GOOD_POINTS = 10
AVOID_BAD_POINTS = 5
CATCH_BAD_PENALTY = -5

# Hand Tracking
HAND_LANDMARK_INDEX = 9  # Middle finger MCP joint
MIN_DETECTION_CONFIDENCE = 0.7
MIN_TRACKING_CONFIDENCE = 0.5
HAND_DETECTION_REQUIRED_FRAMES = 90  # 3 seconds at 30 FPS

# Hand Cursor
CURSOR_RADIUS = 25
TRAIL_LENGTH = 15

# Calibration
MIN_VERTICAL_RANGE_FOR_FULL_MODE = 200  # pixels

# Session Settings
SESSION_DURATION = 120  # seconds (2 minutes)
ITEM_GOAL = 20  # or collect 20 good items

# Colors (RGB)
COLOR_WHITE = (255, 255, 255)
COLOR_BLACK = (0, 0, 0)
COLOR_GRAY = (128, 128, 128)
COLOR_LIGHT_GRAY = (200, 200, 200)
COLOR_DARK_GRAY = (50, 50, 50)
COLOR_RED = (220, 50, 50)
COLOR_GREEN = (50, 220, 50)
COLOR_BLUE = (50, 150, 220)
COLOR_YELLOW = (255, 215, 0)
COLOR_ORANGE = (255, 165, 0)
COLOR_BROWN = (139, 69, 19)
COLOR_LIGHT_BROWN = (210, 180, 140)

# UI
FONT_SIZE_LARGE = 48
FONT_SIZE_MEDIUM = 32
FONT_SIZE_SMALL = 24
HEADER_HEIGHT = 80
FOOTER_HEIGHT = 60

# Data Logging
CSV_COLUMNS = [
    'session_id', 'timestamp', 'game_mode', 'avatar_gender', 
    'item_type', 'item_height_level', 'item_x_spawn',
    'hand_max_y_pixel', 'hand_max_x_pixel', 'hand_min_x_pixel',
    'reaction_time_sec', 'outcome', 'score_change', 
    'tremor_score', 'session_score_final', 'session_duration_sec'
]

# Audio (placeholder - sounds will be generated)
ENABLE_SOUND = True
