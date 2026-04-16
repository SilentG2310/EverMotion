# 🎮 FRUIT HARVEST - QUICK START GUIDE

## ⚡ 45-MINUTE SETUP - START HERE!

### Windows Users

1. **Double-click** `install_windows.bat`
2. Wait for installation (3-5 minutes)
3. Webcam test will start automatically
4. Press 'Q' when you see your hand detected
5. Run: `python main.py`
6. **You're ready to play!**

### Mac/Linux Users

1. Open Terminal
2. Navigate to folder: `cd path/to/fruit_harvest`
3. Run: `bash install_mac_linux.sh`
4. Wait for installation (3-5 minutes)
5. Webcam test will start automatically
6. Press 'Q' when you see your hand detected
7. Run: `python main.py`
8. **You're ready to play!**

---

## 📁 PROJECT FILES

### Core Game Files (7 files)
- `main.py` - Main game loop and UI
- `hand_tracker.py` - MediaPipe hand tracking
- `item_spawner.py` - Item generation
- `collision_detector.py` - Collision detection
- `chef_avatar.py` - Chef character animation
- `data_logger.py` - CSV data export
- `config.py` - Game constants

### Documentation (6 files)
- `README.md` - Complete documentation
- `INSTALLATION_GUIDE.md` - Detailed installation steps
- `MEDIAPIPE_EXPLAINED.md` - How hand tracking works
- `THIS FILE` - Quick start guide
- `requirements.txt` - Python dependencies
- `install_windows.bat` / `install_mac_linux.sh` - Auto-install scripts

### Auto-Generated
- `session_data/` - Folder for CSV files (created on first run)

---

## ✅ CRITICAL REQUIREMENTS CHECKLIST

All requirements from your specification are implemented:

✅ **Mode selection screen appears BEFORE gameplay**
   - Welcome screen → Mode selection → Calibration → Game

✅ **Horizontal Only mode IGNORES vertical hand movement**
   - Only tracks X-axis, Y-axis is fixed at shoulder height
   - See `collision_detector.py`, line 37-40

✅ **Bad items (bombs, fish bones) have INSTANT collision**
   - No dwell time for bad items
   - See `collision_detector.py`, line 44-46

✅ **Chef avatar arm visually follows hand cursor position**
   - Real-time IK-style arm animation
   - See `chef_avatar.py`, line 36-51

✅ **CSV logs every single item interaction**
   - Every catch, avoid, mistake, and miss logged
   - See `data_logger.py` and `session_data/` folder

---

## 🎯 GAME FLOW

```
START
  ↓
Welcome Screen (Choose chef gender)
  ↓
Mode Selection (Full Range OR Horizontal Only)
  ↓
Calibration (Hold hand for 3 seconds)
  ↓
GAMEPLAY (2 minutes or 20 items)
  ↓
Session Complete (View stats, save CSV)
  ↓
Play Again OR Exit
```

---

## 🎮 HOW TO PLAY

### Good Items (Catch these!)
- 🍎 Red = Apple
- 🍌 Yellow = Banana  
- 🍊 Orange = Orange
- **Green glow** around them
- **Hold hand over item for 0.3 seconds** to catch
- **+10 points** per catch

### Bad Items (Avoid these!)
- 💣 Black = Bomb
- 🐟 White = Fish Bone
- **Red glow** around them
- **Instantly lose points** if touched
- **-5 points** per mistake

### Controls
- **Move hand** = Control blue cursor
- **ESC** = Pause/Resume
- **Mouse** = Navigate menus

---

## 🔧 TESTING BEFORE DEMO

Run these tests before showing to your lecturer:

### 1. Webcam Test
```bash
python hand_tracker.py
```
**Expected:** Window shows webcam feed, hand skeleton appears when you show your hand

### 2. Module Tests
```bash
python item_spawner.py       # Should print item spawn test
python collision_detector.py # Should print collision test
python chef_avatar.py        # Should show animated chef
python data_logger.py        # Should print data logger test
```

### 3. Full Game Test
```bash
python main.py
```
**Test checklist:**
- [ ] Welcome screen appears
- [ ] Can select chef gender
- [ ] Can select game mode
- [ ] Calibration shows webcam feed
- [ ] Game starts after 3 seconds
- [ ] Hand cursor follows your hand
- [ ] Chef arm follows cursor
- [ ] Items spawn
- [ ] Can catch good items (hold hand)
- [ ] Bad items instantly subtract points
- [ ] Session ends after 2 minutes
- [ ] Summary screen shows stats
- [ ] CSV file created in `session_data/`

---

## 📊 SESSION DATA (CSV Files)

Every game session creates a CSV file with these columns:

- `session_id` - Unique identifier (timestamp)
- `timestamp` - When interaction happened
- `game_mode` - full_range or horizontal_only
- `avatar_gender` - male or female
- `item_type` - apple, banana, orange, bomb, fish_bone
- `item_height_level` - 1-5 for full_range, FIXED for horizontal
- `item_x_spawn` - Where item appeared (pixels)
- `hand_max_y_pixel` - Highest reach (lower = higher)
- `hand_max_x_pixel` - Rightmost reach
- `hand_min_x_pixel` - Leftmost reach
- `reaction_time_sec` - How fast you responded
- `outcome` - caught, avoided, mistake, missed
- `score_change` - +10, +5, -5, or 0
- `tremor_score` - Hand stability (lower = better)
- `session_score_final` - Running total
- `session_duration_sec` - Time played

**Use for:** Tracking rehabilitation progress, showing improvement to therapist

---

## ❗ COMMON ISSUES

### "python is not recognized"
**Fix:** Install Python from python.org, check "Add to PATH" during installation

### "Could not open webcam"
**Fix:** 
1. Close other apps using webcam (Zoom, Skype, etc.)
2. Try different camera index (edit `main.py`, change `initialize_camera(0)` to `(1)` or `(2)`)

### "Hand not detected"
**Fix:**
1. Better lighting (avoid backlighting from windows)
2. Sit 3-5 feet from camera
3. Clear background
4. Move hand slowly

### Game runs slowly
**Fix:**
1. Close other applications
2. Lower webcam resolution (edit `hand_tracker.py`, lines 54-55)

**See `INSTALLATION_GUIDE.md` for complete troubleshooting**

---

## 📖 DOCUMENTATION FILES

- **README.md** - Complete game documentation
- **INSTALLATION_GUIDE.md** - Step-by-step installation with troubleshooting
- **MEDIAPIPE_EXPLAINED.md** - How hand tracking works (for your report)
- **This file** - Quick start guide

---

## 🎓 FOR YOUR LECTURER

**Key Technical Points:**

1. **Hand Tracking**: MediaPipe Hands (landmark #9 - middle finger MCP)
2. **Collision Detection**: Dwell time (0.3s) for good items, instant for bad items
3. **Game Modes**: Full range (X+Y tracking) vs. Horizontal only (X-only)
4. **Data Collection**: CSV export with ROM, tremor, and reaction time metrics
5. **No External Assets**: All graphics procedurally generated (runs immediately)
6. **Performance**: 30 FPS on mid-range hardware

**Clinical Relevance:**
- Target users: Post-stroke, early Parkinson's, arthritis
- Measures: Range of motion, reaction time, tremor, decision-making
- Safety: Bad items never spawn at max reach, self-paced gameplay

---

## 🚀 YOU'RE READY!

**Your 45-minute checklist:**

- [ ] Downloaded/extracted fruit_harvest folder
- [ ] Ran install script
- [ ] Webcam test passed
- [ ] Ran `python main.py`
- [ ] Played through one session
- [ ] CSV file created

**If all checked:** You have a working prototype!

**Demo tip:** Play one session yourself first to get familiar with controls, then show your lecturer.

---

## 📞 NEED HELP?

1. Check `INSTALLATION_GUIDE.md` troubleshooting section
2. Check `README.md` for detailed explanations
3. Test each module individually (`python [module_name].py`)
4. Verify Python version: `python --version` (need 3.8+)
5. Verify webcam works in other apps first

**Good luck with your demo! 🎉**
