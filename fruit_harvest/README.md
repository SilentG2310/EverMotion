# Fruit Harvest - Rehabilitation Game

A hand-tracking rehabilitation game designed for elderly users with motor impairments. Players catch fruits while avoiding bad items using natural hand gestures tracked by a webcam.

## Important: Python Version Requirement

This project requires **Python 3.12** (not 3.14 or newer).

### Verified Working Versions:
- Python: 3.12.8
- opencv-python: 4.9.0.80
- mediapipe: 0.10.14
- numpy: 1.26.4
- pygame: 2.5.2
- pandas: 2.0.0+
- pillow: 10.0.0+

## Quick Start

### 1. Installation

**Windows:**
```bash
# Create virtual environment
python -m venv fruit_harvest_env
fruit_harvest_env\Scripts\activate

# Install dependencies
pip install opencv-python mediapipe numpy pygame pandas pillow
```

**Mac/Linux:**
```bash
# Create virtual environment
python3 -m venv fruit_harvest_env
source fruit_harvest_env/bin/activate

# Install dependencies
pip install opencv-python mediapipe numpy pygame pandas pillow
```

### 2. Test Your Webcam

Before running the game, test if your webcam works:

```bash
python hand_tracker.py
```

This will open a window showing your webcam feed with hand landmarks. Press 'q' to quit.

**Troubleshooting webcam:**
- Make sure no other application is using the webcam
- Ensure you have good lighting (no backlighting)
- Position yourself 3-5 feet from the camera
- If it doesn't work, try changing the camera index in the code (0, 1, or 2)

### 3. Run the Game

```bash
python main.py
```

## Game Modes

### Full Range Mode
- Items appear at varying heights (waist to overhead)
- Encourages vertical arm movement (shoulder flexion)
- Best for: Post-stroke patients, early arthritis

### Horizontal Only Mode
- Items appear at fixed shoulder height
- Only horizontal movement tracked
- Best for: Severe shoulder impairment, wheelchair users

## How to Play

1. **Select Your Chef**: Choose male or female avatar
2. **Select Difficulty Mode**: Full Range or Horizontal Only
3. **Hand Detection**: Hold your hand visible for 3 seconds to start
4. **Gameplay**:
   - Catch fruits (🍎🍌🍊) by holding your hand over them for 0.3 seconds
   - Avoid bombs (💣) and fish bones (🐟) - instant collision!
   - Session lasts 2 minutes or until 20 items collected

## Controls

- **Hand Movement**: Control cursor with your hand
- **ESC**: Pause/Resume game
- **Mouse**: Click buttons on menus

## Visual Feedback

- **Blue Cursor**: Hand detected, no items nearby
- **Green Cursor**: Near a good item (fruit)
- **Red Cursor**: WARNING - Near a bad item!
- **Progress Ring**: Shows dwell time progress on good items

## Data Tracking

All session data is saved to `session_data/` directory as CSV files.

Each file contains:
- Hand position measurements
- Reaction times
- Tremor scores
- Item catch/avoid accuracy
- Session duration and score

## File Structure

```
fruit_harvest/
├── main.py              # Main game file (run this)
├── hand_tracker.py      # Hand detection (test webcam)
├── item_spawner.py      # Item generation
├── collision_detector.py # Collision detection
├── chef_avatar.py       # Avatar animation
├── data_logger.py       # CSV data export
├── config.py            # Game settings
└── session_data/        # CSV files saved here
```

## Common Issues

### 1. Webcam not detected
```
ERROR: Cannot open webcam
```
**Fix:**
- Check if webcam is connected
- Close other apps using the camera (Zoom, Skype, etc.)
- Try changing camera index in main.py: `cv2.VideoCapture(0)` to `cv2.VideoCapture(1)`

### 2. Hand not detected
**Fix:**
- Improve lighting - face a light source, don't have window behind you
- Move closer to camera (3-5 feet is optimal)
- Make sure hand is fully visible
- Try spreading fingers slightly

### 3. Slow/laggy performance
**Fix:**
- Close other programs
- Reduce camera resolution in code
- Use better lighting (reduces processing load)

### 4. ModuleNotFoundError
```
ModuleNotFoundError: No module named 'mediapipe'
```
**Fix:**
- Make sure virtual environment is activated
- Run: `pip install mediapipe opencv-python pygame pandas numpy pillow`

### 5. "pip: command not found" on Mac/Linux
**Fix:**
- Use `pip3` instead of `pip`
- Use `python3` instead of `python`

## Customization

Edit `config.py` to customize:
- Session duration
- Item spawn rates
- Collision thresholds
- Scoring values
- Colors and UI settings

## Technical Details

### Hand Tracking
Uses MediaPipe Hands to detect 21 hand landmarks. The game tracks the middle finger MCP joint (landmark #9) as the main reference point because it's:
- Stable during movement
- Less affected by finger tremors
- Good representation of hand center

### Collision Detection
- **Good items (fruits)**: Require 0.3-second dwell time to prevent false catches from tremors
- **Bad items (bombs, bones)**: Instant collision to encourage controlled movement

### Game Modes
- **Full Range**: Tracks both X and Y coordinates
- **Horizontal Only**: Ignores Y coordinate, only tracks horizontal movement

## Credits

Designed for rehabilitation of elderly users with motor impairments (post-stroke, Parkinson's, arthritis).

Built with:
- Python 3.8+
- OpenCV (camera)
- MediaPipe (hand tracking)
- Pygame (graphics and game loop)
- Pandas (data logging)

## License

Educational/Research use
