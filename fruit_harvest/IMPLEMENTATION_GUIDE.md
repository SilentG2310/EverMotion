# FRUIT HARVEST - Complete Implementation Guide

## Overview

This is a complete, working implementation of the Fruit Harvest rehabilitation game. All code uses **procedurally generated graphics** (no external image files needed), so you can run it immediately after installing dependencies.

## Quick Start (45-Minute Setup)

### Step 1: Install Dependencies (5 minutes)

```bash
# Navigate to the fruit_harvest directory
cd fruit_harvest

# Install all dependencies
pip install -r requirements.txt
```

### Step 2: Verify Installation (2 minutes)

```bash
python test_setup.py
```

This checks:
- ✅ All Python packages installed
- ✅ Webcam detected and working
- ✅ Correct Python version

### Step 3: Test Hand Tracking (5 minutes)

```bash
python hand_tracker.py
```

This opens a window showing:
- Your webcam feed
- Hand landmarks (when detected)
- Hand position coordinates

**Tips for better detection:**
- Face a light source (don't sit with window behind you)
- Keep hand 3-5 feet from camera
- Spread fingers slightly
- Press 'q' to quit

### Step 4: Run the Game! (30 minutes of gameplay)

```bash
python main.py
```

## How MediaPipe Hand Tracking Works

### What is MediaPipe?

MediaPipe is Google's machine learning framework for real-time hand detection. It:

1. **Detects hands** in video frames using a neural network
2. **Identifies 21 landmarks** on each hand (fingertips, joints, palm)
3. **Returns normalized coordinates** (0.0 to 1.0) for each landmark

### Why We Use Landmark #9 (Middle Finger MCP)

The spec requires tracking the middle finger MCP (metacarpophalangeal) joint because:

- **Stability**: It's the most stable point during hand movement
- **Tremor resistance**: Less affected by finger tremors than fingertips
- **Central location**: Good representation of hand center
- **Accessibility**: Easy for patients with contractures (can't extend fingers)

### Coordinate Conversion

```python
# MediaPipe gives normalized coordinates (0.0 to 1.0)
landmark = hand_landmarks.landmark[9]  # Middle finger MCP
normalized_x = landmark.x  # e.g., 0.5 = center of frame
normalized_y = landmark.y

# Convert to pixel coordinates
hand_x = int(normalized_x * SCREEN_WIDTH)   # e.g., 0.5 * 1280 = 640px
hand_y = int(normalized_y * SCREEN_HEIGHT)  # e.g., 0.5 * 720 = 360px
```

### Code Flow

```
Camera Frame → MediaPipe → Hand Landmarks → Extract #9 → Pixel Coordinates → Game Logic
```

## Critical Implementation Details

### 1. Mode Selection BEFORE Gameplay ✅

The game flow ensures mode selection happens first:

```
WELCOME (choose avatar) → DIFFICULTY_SELECT (choose mode) → HAND_DETECTION → PLAYING
```

Users **cannot** start playing without selecting a mode.

### 2. Horizontal Only Mode Ignores Vertical Movement ✅

In `collision_detector.py`:

```python
if game_mode == HORIZONTAL_ONLY:
    # Only check X distance, Y is ignored
    distance = abs(hand_x - item.x)
else:
    # Full range - check both X and Y
    distance = math.sqrt((hand_x - item.x)**2 + (hand_y - item.y)**2)
```

Items in horizontal mode spawn at **fixed Y = 400px** regardless of hand vertical position.

### 3. Bad Items Have Instant Collision ✅

In `collision_detector.py`:

```python
if distance < COLLISION_RADIUS:
    # BAD ITEMS: Instant collision (no dwell time)
    if not item.is_good:
        return ('mistake', tremor)
    
    # GOOD ITEMS: Require dwell time
    self.dwell_timer += 1
    if self.dwell_timer >= DWELL_TIME_FRAMES:
        return ('caught', tremor)
```

- **Bombs/fish bones**: Caught immediately on contact
- **Fruits**: Require 0.3 seconds (9 frames at 30 FPS)

### 4. Chef Avatar Arm Follows Hand Cursor ✅

In `chef_avatar.py`:

```python
# Calculate distance to hand
dx = hand_x - shoulder_x
dy = hand_y - shoulder_y

# Extend arm toward cursor
end_x = shoulder_x + dx * ratio
end_y = shoulder_y + dy * ratio

# Draw arm line
pygame.draw.line(screen, arm_color, (shoulder_x, shoulder_y), (end_x, end_y), 8)
```

The chef's arm **dynamically points** toward the hand cursor in real-time.

### 5. CSV Logs Every Interaction ✅

In `data_logger.py`:

```python
def log_interaction(self, item, outcome, score_change, tremor_score, ...):
    interaction = {
        'session_id': self.session_id,
        'timestamp': datetime.now(),
        'item_type': item.type,
        'outcome': outcome,  # 'caught', 'avoided', 'mistake', 'missed'
        'score_change': score_change,
        'tremor_score': tremor_score,
        # ... all other fields
    }
    self.interactions.append(interaction)
```

Every single item interaction is logged, including:
- Successful catches
- Successful avoids
- Mistakes (caught bad items)
- Misses (good items that timeout)

## File Structure Explained

### config.py
Contains all game constants:
- Screen dimensions
- Item spawn rules
- Scoring values
- Colors
- Timing thresholds

**You can customize the game** by editing this file!

### hand_tracker.py
Wraps MediaPipe hand tracking:
- Initializes MediaPipe
- Processes camera frames
- Extracts hand position
- Calculates tremor score
- Includes standalone webcam test

### item_spawner.py
Manages item generation:
- Creates items at random positions
- Generates placeholder graphics (fruits, bombs, fish bones)
- Handles item movement (falling, drifting)
- Tracks spawn counts

### collision_detector.py
Handles interaction logic:
- Detects when hand touches items
- Implements dwell time for good items
- Instant collision for bad items
- Calculates distance based on game mode

### chef_avatar.py
Manages chef character:
- Three emotional states (idle, happy, sad)
- Arm following hand cursor
- Procedurally generated graphics
- Hand cursor with trail effect

### data_logger.py
Handles data export:
- Logs every interaction to memory
- Saves to CSV at end of session
- Generates session summary
- Compares with previous sessions

### main.py
Main game loop:
- State machine (welcome → mode select → calibration → playing → end)
- Camera integration
- Game logic
- UI rendering
- Event handling

## Common Errors and Fixes

### Error 1: ModuleNotFoundError

```
ModuleNotFoundError: No module named 'mediapipe'
```

**Fix:**
```bash
# Make sure virtual environment is activated
pip install -r requirements.txt
```

### Error 2: Webcam Not Opening

```
ERROR: Cannot open webcam
```

**Fixes:**
1. Close other apps using camera (Zoom, Teams, etc.)
2. Check camera permissions in OS settings
3. Try different camera index:
   ```python
   # In main.py, line ~60
   self.camera = cv2.VideoCapture(1)  # Try 0, 1, or 2
   ```

### Error 3: Hand Not Detected

**Symptoms:** Game stuck at "Detecting Hand..." screen

**Fixes:**
1. **Improve lighting** - face a window/lamp, don't sit with light behind you
2. **Move closer** - 3-5 feet is optimal
3. **Show full hand** - spread fingers, show palm
4. **Check confidence threshold** - lower it in config.py:
   ```python
   MIN_DETECTION_CONFIDENCE = 0.5  # Was 0.7
   ```

### Error 4: Slow Performance / Low FPS

**Symptoms:** Laggy cursor, choppy video

**Fixes:**
1. Close other programs
2. Reduce camera resolution:
   ```python
   # In main.py, after camera initialization
   self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
   self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
   ```

### Error 5: Items Not Spawning

**Check:**
- Session hasn't ended (2 minutes or 20 items)
- Previous item was collected/avoided
- No errors in console

### Error 6: CSV File Empty or Not Created

**Check:**
- `session_data/` directory exists (created automatically)
- Game reached end screen (data saved at session end)
- Check permissions for writing files

## Placeholder Graphics System

The game **generates all graphics in code** using Pygame primitives. No external PNG files needed!

### How It Works

Each item type is rendered using shapes:

**Apple:**
```python
pygame.draw.circle(surface, (220, 50, 50), (40, 40), 35)  # Red circle
pygame.draw.rect(surface, (101, 67, 33), (37, 5, 6, 15))  # Brown stem
```

**Bomb:**
```python
pygame.draw.circle(surface, (30, 30, 30), (40, 40), 30)   # Black sphere
pygame.draw.line(surface, (101, 67, 33), ...)              # Fuse
pygame.draw.circle(surface, (255, 100, 0), ...)            # Spark
```

**Benefits:**
- No external dependencies
- Works immediately
- Easy to customize colors
- Small file size

## Customization Guide

### Change Session Duration

Edit `config.py`:
```python
SESSION_DURATION = 180  # 3 minutes instead of 2
```

### Adjust Collision Radius

Make catching easier/harder:
```python
COLLISION_RADIUS = 100  # Easier (was 70)
COLLISION_RADIUS = 50   # Harder
```

### Change Dwell Time

Make good items require longer/shorter hold:
```python
DWELL_TIME_FRAMES = 15  # 0.5 seconds (was 0.3)
DWELL_TIME_FRAMES = 6   # 0.2 seconds
```

### Modify Item Colors

Edit in `item_spawner.py`, `_create_surface()` method:
```python
# Change apple color
pygame.draw.circle(surface, (100, 200, 100), ...)  # Green apple!
```

### Add More Item Types

1. Add to `config.py`:
   ```python
   GOOD_ITEMS = ["apple", "banana", "orange", "grape"]
   ```

2. Add rendering in `item_spawner.py`:
   ```python
   elif self.type == "grape":
       pygame.draw.circle(surface, (128, 0, 128), ...)
   ```

## Testing Checklist

Before presenting to your lecturer:

- [ ] Game runs at 30 FPS
- [ ] Mode selection screen appears first
- [ ] Both modes work correctly
- [ ] Horizontal mode ignores vertical movement
- [ ] Bad items have instant collision
- [ ] Good items require dwell time
- [ ] Chef arm follows cursor
- [ ] CSV file created in session_data/
- [ ] CSV contains all required columns
- [ ] End screen shows summary
- [ ] Can play multiple sessions
- [ ] Works on target hardware

## Performance Metrics

### Minimum Requirements
- CPU: i5 or equivalent
- RAM: 4GB
- Webcam: 720p
- OS: Windows 10, macOS 10.14+, Ubuntu 18.04+

### Expected Performance
- **FPS**: 30 (target)
- **Latency**: <100ms (hand to screen)
- **Session stability**: 2+ minutes without dropout

## Next Steps

1. **Run the game** and test both modes
2. **Review CSV output** - open in Excel to see data format
3. **Test with different lighting** conditions
4. **Show to lecturer** for clinical validation feedback
5. **Iterate based on feedback** (easy to customize via config.py)

## Support

If you encounter issues:

1. Run `python test_setup.py` to diagnose
2. Check this guide for common errors
3. Test webcam separately with `python hand_tracker.py`
4. Review console output for error messages

## Credits

Built with:
- Python 3.8+
- OpenCV 4.8+ (camera capture)
- MediaPipe 0.10+ (hand tracking)
- Pygame 2.5+ (graphics)
- Pandas 2.0+ (data export)

Designed for rehabilitation research - built in 2024.
