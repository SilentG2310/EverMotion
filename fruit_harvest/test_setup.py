"""
Quick setup test to verify all dependencies are installed correctly
Run this before running the main game
"""

import sys

print("="*60)
print("FRUIT HARVEST - Setup Test")
print("="*60)
print("\nChecking dependencies...\n")

# Check Python version
print(f"Python version: {sys.version}")
if sys.version_info < (3, 7):
    print("❌ ERROR: Python 3.7 or higher required")
    sys.exit(1)
else:
    print("✅ Python version OK\n")

# Check each dependency
dependencies = {
    'opencv-python': 'cv2',
    'mediapipe': 'mediapipe',
    'numpy': 'numpy',
    'pygame': 'pygame',
    'pandas': 'pandas',
    'pillow': 'PIL'
}

missing = []

for package_name, import_name in dependencies.items():
    try:
        __import__(import_name)
        print(f"✅ {package_name}")
    except ImportError:
        print(f"❌ {package_name} - NOT INSTALLED")
        missing.append(package_name)

if missing:
    print("\n" + "="*60)
    print("MISSING DEPENDENCIES")
    print("="*60)
    print("\nInstall missing packages with:")
    print(f"pip install {' '.join(missing)}")
    print("\nOr install all at once with:")
    print("pip install -r requirements.txt")
    sys.exit(1)

print("\n" + "="*60)
print("All dependencies installed! ✅")
print("="*60)

# Test webcam
print("\nTesting webcam...")
try:
    import cv2
    cap = cv2.VideoCapture(0)
    if cap.isOpened():
        print("✅ Webcam detected!")
        ret, frame = cap.read()
        if ret:
            print(f"✅ Camera resolution: {frame.shape[1]}x{frame.shape[0]}")
            print("   (720p or higher recommended)")
        cap.release()
    else:
        print("❌ Cannot open webcam")
        print("   Make sure:")
        print("   1. Webcam is connected")
        print("   2. No other app is using it")
        print("   3. You have camera permissions")
except Exception as e:
    print(f"❌ Webcam test failed: {e}")

print("\n" + "="*60)
print("Setup test complete!")
print("="*60)
print("\nTo test hand tracking, run:")
print("  python hand_tracker.py")
print("\nTo start the game, run:")
print("  python main.py")
print("="*60)
