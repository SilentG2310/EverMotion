# INSTALLATION GUIDE - Fruit Harvest Rehabilitation Game

## ⚡ FASTEST METHOD (Windows)

1. Double-click `install_windows.bat`
2. Wait for installation to complete
3. Webcam test will start automatically
4. Close webcam test window (press 'Q')
5. Run: `python main.py`

## ⚡ FASTEST METHOD (Mac/Linux)

1. Open Terminal
2. Navigate to fruit_harvest folder: `cd path/to/fruit_harvest`
3. Run: `bash install_mac_linux.sh`
4. Wait for installation to complete
5. Webcam test will start automatically
6. Close webcam test window (press 'Q')
7. Run: `python main.py`

---

## 📋 MANUAL INSTALLATION (if scripts don't work)

### Windows

```cmd
# 1. Open Command Prompt (Win + R, type "cmd")

# 2. Navigate to project folder
cd C:\Users\YourName\Downloads\fruit_harvest

# 3. Create virtual environment
python -m venv venv

# 4. Activate virtual environment
venv\Scripts\activate

# 5. You should see (venv) at the start of your command line

# 6. Install dependencies
pip install opencv-python mediapipe numpy pygame pandas pillow

# 7. Test webcam
python hand_tracker.py

# If you see webcam feed and hand detection, press Q and continue

# 8. Run the game
python main.py
```

### Mac

```bash
# 1. Open Terminal (Cmd + Space, type "Terminal")

# 2. Navigate to project folder
cd ~/Downloads/fruit_harvest

# 3. Create virtual environment
python3 -m venv venv

# 4. Activate virtual environment
source venv/bin/activate

# 5. You should see (venv) at the start of your prompt

# 6. Install dependencies
pip install opencv-python mediapipe numpy pygame pandas pillow

# 7. Test webcam
python hand_tracker.py

# If you see webcam feed and hand detection, press Q and continue

# 8. Run the game
python main.py
```

### Linux (Ubuntu/Debian)

```bash
# 1. Open Terminal (Ctrl + Alt + T)

# 2. Install system dependencies first
sudo apt-get update
sudo apt-get install python3-pip python3-venv libsdl2-dev

# 3. Navigate to project folder
cd ~/Downloads/fruit_harvest

# 4. Create virtual environment
python3 -m venv venv

# 5. Activate virtual environment
source venv/bin/activate

# 6. Install Python dependencies
pip install opencv-python mediapipe numpy pygame pandas pillow

# 7. Test webcam
python hand_tracker.py

# 8. Run the game
python main.py
```

---

## 🔍 VERIFICATION CHECKLIST

After installation, verify each step:

### Step 1: Python Version
```bash
python --version
# Should show Python 3.8 or higher
```

### Step 2: Virtual Environment Active
```bash
# Your command prompt should show (venv) at the beginning
# Windows: (venv) C:\Users\...
# Mac/Linux: (venv) username@computer:~$
```

### Step 3: Dependencies Installed
```bash
pip list
# Should show: opencv-python, mediapipe, numpy, pygame, pandas, pillow
```

### Step 4: Webcam Test
```bash
python hand_tracker.py
# Should show:
# - Webcam feed in a window
# - Green text "Hand Detected!" when you show your hand
# - Hand skeleton drawn on your hand
# - Press Q to quit
```

### Step 5: Individual Module Tests
```bash
# Test each module (optional but recommended)
python item_spawner.py      # Should print spawn test results
python collision_detector.py # Should print collision test results
python chef_avatar.py       # Should show chef animation window
python data_logger.py       # Should print data logger test results
```

### Step 6: Run Full Game
```bash
python main.py
# Should show:
# - Welcome screen with chef selection
# - Mode selection screen
# - Calibration screen with webcam feed
# - Game starts when hand detected for 3 seconds
```

---

## ❗ TROUBLESHOOTING

### Problem: "python is not recognized" (Windows)

**Solution:**
1. Install Python from https://www.python.org/downloads/
2. During installation, CHECK "Add Python to PATH"
3. Restart Command Prompt
4. Try again

### Problem: "No module named 'cv2'"

**Solution:**
```bash
pip install opencv-python
```

### Problem: "Could not open webcam"

**Diagnostic Steps:**
1. Check if webcam LED is on
2. Close other apps using webcam (Zoom, Skype, Teams, etc.)
3. Try different camera index:
   - Edit `hand_tracker.py`
   - Find line 41: `self.cap = cv2.VideoCapture(camera_index)`
   - The default is `camera_index=0`
   - Try: `initialize_camera(1)` or `initialize_camera(2)`

### Problem: "Hand not detected" during webcam test

**Fixes:**
1. **Lighting**: Make sure room is well-lit
2. **Background**: Avoid sitting in front of bright window (backlighting)
3. **Distance**: Sit 3-5 feet from camera
4. **Angle**: Camera should see you from waist-up
5. **Contrast**: Wear dark clothing if you have light skin, or vice versa
6. **Movement**: Move hand slowly in front of camera

### Problem: "Permission denied" when running install script (Mac/Linux)

**Solution:**
```bash
chmod +x install_mac_linux.sh
bash install_mac_linux.sh
```

### Problem: Game window is too large/small

**Solution:**
- Edit `config.py`
- Change `SCREEN_WIDTH` and `SCREEN_HEIGHT`
- Common resolutions: 1280x720, 1920x1080, 800x600

### Problem: Game runs slowly (laggy)

**Solutions:**

1. **Reduce webcam resolution** (edit `hand_tracker.py`, lines 54-55):
```python
self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)   # Was 640
self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)  # Was 480
```

2. **Reduce trail length** (edit `config.py`):
```python
HAND_TRAIL_LENGTH = 5  # Was 15
```

3. **Close other applications** to free up CPU/GPU

### Problem: "ImportError: DLL load failed" (Windows)

**Solution:**
1. Download Microsoft Visual C++ Redistributable:
   - https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Install it
3. Restart computer
4. Try again

### Problem: Emoji not showing in game

**Solution:**
- This is OK! The game works fine without emojis
- Items are drawn as colored circles
- Gameplay is not affected

---

## 🎮 PLAYING THE GAME

### First Time Playing

1. **Welcome Screen**: Choose chef gender (Male/Female)
2. **Mode Selection**: 
   - Full Range: Items appear at different heights (harder)
   - Horizontal Only: Items stay at same height (easier)
3. **Calibration**: Hold hand in front of camera for 3 seconds
4. **Game Starts!**

### During Gameplay

**Good Items (Catch These):**
- 🍎 Red circles = Apples
- 🍌 Yellow circles = Bananas
- 🍊 Orange circles = Oranges
- Have GREEN glow around them
- Hold hand over item for 0.3 seconds to catch
- +10 points per catch

**Bad Items (Avoid These):**
- 💣 Black circles = Bombs
- 🐟 White circles = Fish Bones
- Have RED glow around them
- Touching them instantly loses points
- -5 points per mistake

**Controls:**
- Move your hand to control blue cursor
- Hand cursor turns GREEN near good items
- Hand cursor turns RED near bad items
- ESC = Pause/Resume

**Session Ends When:**
- 2 minutes elapsed, OR
- 20 good items caught

**After Session:**
- See your score and stats
- CSV file saved to `session_data/` folder
- Click "Play Again" or "Exit"

---

## 📊 UNDERSTANDING YOUR DATA

CSV files in `session_data/` contain detailed metrics:

- **ROM Metrics**: How high/wide you reached
- **Reaction Time**: How fast you responded
- **Tremor Score**: Hand stability (lower is better)
- **Accuracy**: % of correct actions

**Use for:**
- Tracking improvement over weeks
- Showing progress to therapist
- Adjusting difficulty based on performance

---

## 🔧 ADVANCED CONFIGURATION

### Adjust Game Difficulty

Edit `config.py`:

```python
# Make items stay longer (easier)
ITEM_LIFETIME = 12.0  # Was 8.0

# Make collision zone larger (easier)
COLLISION_RADIUS = 100  # Was 70

# Change dwell time for catching (harder = more frames)
DWELL_TIME_FRAMES = 15  # Was 9 (0.3 seconds at 30 FPS)
```

### Change Scoring

```python
# More reward for catching
SCORE_CATCH_GOOD = 20  # Was 10

# Less penalty for mistakes
SCORE_CATCH_BAD = -2  # Was -5
```

### Adjust Session Length

```python
# Longer sessions
SESSION_DURATION = 180  # Was 120 (3 minutes instead of 2)

# More items required
TARGET_ITEMS = 30  # Was 20
```

---

## 📞 GETTING HELP

If nothing works:

1. **Check Python version**: Must be 3.8 or higher
2. **Verify webcam works in other apps** (Photo Booth, Camera app, etc.)
3. **Try on different computer** to isolate hardware issues
4. **Check system requirements**:
   - Windows 10/11, macOS 10.14+, or Ubuntu 20.04+
   - 4GB RAM minimum
   - Webcam (720p or better)
   - Python 3.8+

---

## ✅ READY TO DEMO?

Before showing to your lecturer, test:

- [ ] Game launches without errors
- [ ] Welcome screen appears
- [ ] Mode selection works
- [ ] Calibration detects hand
- [ ] Gameplay is smooth (30 FPS)
- [ ] Items spawn correctly
- [ ] Collision detection works
- [ ] Chef avatar moves with hand
- [ ] Score updates correctly
- [ ] Session ends properly
- [ ] CSV file is created
- [ ] Can play multiple sessions

**Good luck with your demo!**
