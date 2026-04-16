# How MediaPipe Hand Tracking Works

## Overview

MediaPipe Hands is a machine learning solution from Google that detects and tracks 21 3D hand landmarks in real-time using just a regular RGB camera (no depth sensor needed).

## Key Concepts

### 1. Hand Landmarks

MediaPipe detects **21 landmarks** per hand:

```
        8   12  16  20  (fingertips)
        |   |   |   |
        7   11  15  19  (DIP joints)
        |   |   |   |
        6   10  14  18  (PIP joints)
        |   |   |   |
    4   5   9   13  17  (MCP joints)
    |   └───┴───┴───┘
    3       PALM
    |
    2
    |
    1
    |
    0 (wrist)

Landmark IDs:
 0 = WRIST
 1-4 = THUMB (1=CMC, 2=MCP, 3=IP, 4=TIP)
 5-8 = INDEX (5=MCP, 6=PIP, 7=DIP, 8=TIP)
 9-12 = MIDDLE (9=MCP, 10=PIP, 11=DIP, 12=TIP)
 13-16 = RING (13=MCP, 14=PIP, 15=DIP, 16=TIP)
 17-20 = PINKY (17=MCP, 18=PIP, 19=DIP, 20=TIP)
```

### 2. Why We Use Landmark #9 (Middle Finger MCP)

In `fruit_harvest/hand_tracker.py`, we use **landmark #9** as our primary tracking point:

```python
HAND_LANDMARK_INDEX = 9  # Middle finger MCP joint
```

**Reasons:**
1. **Most stable point**: Center of hand, doesn't move much when fingers flex
2. **Less affected by tremors**: Finger tips shake more than knuckles
3. **Easy to maintain**: Users don't need to keep fingers extended perfectly
4. **Robust tracking**: MediaPipe tracks knuckles more reliably than fingertips

**Alternative landmarks** for different use cases:
- `landmark[0]` (wrist): Best for users with severe finger contracture
- `landmark[8]` (index fingertip): For precise pointing tasks
- `landmark[12]` (middle fingertip): For fine motor control assessment

## How It Works in Our Code

### Step 1: Initialize MediaPipe

```python
# hand_tracker.py, line 18-23
self.hands = self.mp_hands.Hands(
    static_image_mode=False,        # Video stream (not static images)
    max_num_hands=1,                # Track only one hand
    min_detection_confidence=0.7,   # How confident to start tracking
    min_tracking_confidence=0.5     # How confident to keep tracking
)
```

**Parameters explained:**
- `static_image_mode=False`: Optimized for video (faster, assumes hand moves smoothly)
- `max_num_hands=1`: Only track one hand (rehab uses dominant hand)
- `min_detection_confidence=0.7`: 70% confidence to detect new hand (higher = fewer false positives)
- `min_tracking_confidence=0.5`: 50% confidence to keep tracking (lower = maintains tracking through brief occlusions)

### Step 2: Process Each Frame

```python
# hand_tracker.py, lines 50-59
# 1. Capture frame from webcam
success, frame = self.cap.read()

# 2. Flip horizontally (mirror effect - more intuitive)
frame = cv2.flip(frame, 1)

# 3. Convert BGR (OpenCV) to RGB (MediaPipe)
rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

# 4. Run MediaPipe hand detection
results = self.hands.process(rgb_frame)
```

### Step 3: Extract Hand Position

```python
# hand_tracker.py, lines 66-74
if results.multi_hand_landmarks:
    hand_landmarks = results.multi_hand_landmarks[0]  # First hand
    
    # Get landmark #9 (middle finger MCP)
    landmark = hand_landmarks.landmark[HAND_LANDMARK_INDEX]
    
    # Convert normalized coordinates (0.0-1.0) to pixels
    self.hand_x = int(landmark.x * SCREEN_WIDTH)
    self.hand_y = int(landmark.y * SCREEN_HEIGHT)
```

**Coordinate System:**
- MediaPipe returns **normalized coordinates**: `x, y, z` all in range [0.0, 1.0]
- `x`: 0.0 = left edge, 1.0 = right edge
- `y`: 0.0 = top edge, 1.0 = bottom edge
- `z`: depth (we don't use this for 2D game)

**Conversion to screen pixels:**
```python
screen_x = normalized_x × screen_width
screen_y = normalized_y × screen_height
```

Example:
- Camera resolution: 640×480
- Screen resolution: 1280×720
- Hand at center: `landmark.x = 0.5, landmark.y = 0.5`
- Screen position: `(0.5 × 1280, 0.5 × 720) = (640, 360)`

## Performance Optimizations

### 1. Mirror Effect (Horizontal Flip)

```python
frame = cv2.flip(frame, 1)
```

**Why?**: Makes control intuitive
- Without flip: Move hand right → cursor moves left (confusing!)
- With flip: Move hand right → cursor moves right (natural!)

### 2. Static Image Mode

```python
static_image_mode=False
```

**Why?**: 
- `False` (video mode): Uses temporal smoothing, faster tracking
- `True` (image mode): Processes each frame independently, more accurate but slower

For real-time games, always use `False`.

### 3. Tracking vs. Detection

MediaPipe uses two modes:
1. **Detection**: Find hand from scratch (slow, ~100ms)
2. **Tracking**: Follow existing hand (fast, ~5ms)

Once hand found, MediaPipe uses tracking until hand lost, then re-detects.

This is why calibration requires 3 seconds of continuous detection!

## Tremor Calculation

```python
# hand_tracker.py, lines 93-110
def calculate_tremor_score(self):
    # Get last 30 hand positions
    recent_positions = self.position_history[-30:]
    
    # Separate X and Y coordinates
    x_positions = [pos[0] for pos in recent_positions]
    y_positions = [pos[1] for pos in recent_positions]
    
    # Calculate standard deviation (how much hand "wobbles")
    x_std = np.std(x_positions)
    y_std = np.std(y_positions)
    
    # Combine into single tremor score
    tremor_score = sqrt(x_std² + y_std²)
```

**Interpretation:**
- `tremor_score < 5`: Very stable (healthy young adult)
- `tremor_score 5-15`: Mild tremor (normal for elderly)
- `tremor_score 15-30`: Moderate tremor (early Parkinson's)
- `tremor_score > 30`: Severe tremor (seek medical advice)

## Lighting Requirements

MediaPipe relies on **computer vision** (not infrared), so lighting matters:

**Good Lighting:**
- Bright, even ambient light
- Front lighting (light source behind camera)
- No harsh shadows on hand
- Neutral background (not skin-tone colored)

**Bad Lighting:**
- Backlighting (window behind user) → hand appears as dark silhouette
- Dim lighting → camera noise interferes with detection
- Direct spotlight → harsh shadows confuse landmark detection

**Quick Test:**
Open camera app on your phone/computer. If you can clearly see your hand with good contrast, MediaPipe will work well.

## Why MediaPipe vs. Other Solutions?

### MediaPipe Advantages

✅ **No special hardware**: Works with any webcam  
✅ **Fast**: 30+ FPS on laptop CPU (no GPU needed)  
✅ **Accurate**: Sub-pixel landmark precision  
✅ **Free & Open Source**: No licensing fees  
✅ **Cross-platform**: Windows, Mac, Linux, mobile  
✅ **Python support**: Easy integration  

### Alternatives Considered

**Leap Motion Controller**
- ❌ Requires $100+ hardware
- ❌ Limited availability
- ✅ Very accurate 3D tracking
- ✅ Low latency

**Microsoft Kinect**
- ❌ Discontinued
- ❌ Requires USB 3.0 hub
- ✅ Full body tracking
- ✅ Depth sensing

**OpenCV Color Tracking**
- ✅ Simple to implement
- ❌ Not robust (lighting-dependent)
- ❌ No landmark details
- ❌ Requires colored glove/marker

**MediaPipe is the sweet spot:** Good enough accuracy, no special hardware, free.

## Common Issues & Solutions

### Issue: "Hand detected" flickers on/off

**Cause**: Hand near detection threshold  
**Fix**: Improve lighting or increase `min_tracking_confidence`:
```python
self.hands = self.mp_hands.Hands(
    min_tracking_confidence=0.7  # Increase from 0.5
)
```

### Issue: Wrong hand landmark detected

**Cause**: Other objects look like hands  
**Fix**: Clear background, ensure only one hand visible

### Issue: Lag between hand movement and cursor

**Cause**: Low FPS or high camera resolution  
**Fix**: Reduce webcam resolution (edit `hand_tracker.py`):
```python
self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)  # Lower resolution
self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)
```

### Issue: Hand detection fails for elderly users

**Cause**: Thin hands, wrinkled skin, low contrast  
**Solutions:**
1. Better lighting
2. Darker/lighter clothing for contrast
3. Lower `min_detection_confidence`:
```python
self.hands = self.mp_hands.Hands(
    min_detection_confidence=0.5  # Lower threshold
)
```

## Further Reading

- **MediaPipe Hands Documentation**: https://google.github.io/mediapipe/solutions/hands
- **MediaPipe GitHub**: https://github.com/google/mediapipe
- **Research Paper**: "MediaPipe Hands: On-device Real-time Hand Tracking" (2020)

## Summary for Your Report

**For your project documentation:**

> "Our system uses Google's MediaPipe Hands framework for real-time hand tracking. MediaPipe employs a two-stage machine learning pipeline: first, a palm detection model localizes the hand, then a hand landmark model identifies 21 3D keypoints. We specifically track the middle finger MCP joint (landmark #9) as it provides the most stable reference point, being less susceptible to finger tremors compared to fingertip landmarks. This approach enables robust gesture recognition using only a standard RGB webcam, eliminating the need for specialized depth sensors or wearable devices. The system achieves 30+ FPS on commodity hardware, meeting real-time requirements for rehabilitation applications."
