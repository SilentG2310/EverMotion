"""
Hand Tracker Module - MediaPipe Hand Tracking Wrapper
Provides hand position detection and tracking functionality
"""

import cv2
import mediapipe as mp
import numpy as np
from config import (
    HAND_LANDMARK_INDEX, 
    MIN_DETECTION_CONFIDENCE, 
    MIN_TRACKING_CONFIDENCE,
    SCREEN_WIDTH,
    SCREEN_HEIGHT
)


class HandTracker:
    """
    Wrapper for MediaPipe hand tracking.
    Detects hand position and returns pixel coordinates.
    """
    
    def __init__(self):
        """Initialize MediaPipe hand tracking"""
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,  # Track only one hand
            min_detection_confidence=MIN_DETECTION_CONFIDENCE,
            min_tracking_confidence=MIN_TRACKING_CONFIDENCE
        )
        self.mp_draw = mp.solutions.drawing_utils
        
        # State tracking
        self.is_hand_detected = False
        self.hand_position = None
        self.all_landmarks = None
        
        # For tremor calculation
        self.position_history = []
        self.max_history_length = 30  # Last 1 second at 30 FPS
        
    def process_frame(self, frame):
        """
        Process camera frame and detect hand.
        
        Args:
            frame: BGR image from webcam (OpenCV format)
            
        Returns:
            tuple: (hand_x_pixel, hand_y_pixel) or (None, None) if no hand
        """
        # Convert BGR to RGB (MediaPipe uses RGB)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process frame with MediaPipe
        results = self.hands.process(rgb_frame)
        
        # Check if hand detected
        if results.multi_hand_landmarks:
            # Get first (and only) hand
            hand_landmarks = results.multi_hand_landmarks[0]
            self.all_landmarks = hand_landmarks
            
            # Get the middle finger MCP landmark (index 9)
            landmark = hand_landmarks.landmark[HAND_LANDMARK_INDEX]
            
            # Convert normalized coordinates (0-1) to pixel coordinates
            # Note: MediaPipe X is left-to-right, Y is top-to-bottom
            hand_x = int(landmark.x * SCREEN_WIDTH)
            hand_y = int(landmark.y * SCREEN_HEIGHT)
            
            self.is_hand_detected = True
            self.hand_position = (hand_x, hand_y)
            
            # Store in history for tremor calculation
            self.position_history.append((hand_x, hand_y))
            if len(self.position_history) > self.max_history_length:
                self.position_history.pop(0)
            
            return hand_x, hand_y
        else:
            self.is_hand_detected = False
            self.hand_position = None
            self.all_landmarks = None
            return None, None
    
    def get_hand_position(self):
        """Get current hand position"""
        return self.hand_position
    
    def is_detected(self):
        """Check if hand is currently detected"""
        return self.is_hand_detected
    
    def draw_landmarks(self, frame):
        """
        Draw hand landmarks on frame for debugging.
        
        Args:
            frame: BGR image to draw on
            
        Returns:
            frame with landmarks drawn
        """
        if self.all_landmarks:
            self.mp_draw.draw_landmarks(
                frame,
                self.all_landmarks,
                self.mp_hands.HAND_CONNECTIONS
            )
        return frame
    
    def calculate_tremor_score(self):
        """
        Calculate tremor score based on position variance.
        Higher score = shakier movement.
        
        Returns:
            float: Standard deviation of hand positions (tremor score)
        """
        if len(self.position_history) < 10:
            return 0.0
        
        # Calculate standard deviation of X and Y coordinates
        positions = np.array(self.position_history)
        x_std = np.std(positions[:, 0])
        y_std = np.std(positions[:, 1])
        
        # Combined tremor score
        tremor_score = np.sqrt(x_std**2 + y_std**2)
        return round(tremor_score, 2)
    
    def get_calibration_data(self):
        """
        Get range of motion data for calibration.
        
        Returns:
            dict: {max_y, min_y, max_x, min_x} in pixels
        """
        if len(self.position_history) < 10:
            return None
        
        positions = np.array(self.position_history)
        return {
            'max_y': int(np.max(positions[:, 1])),
            'min_y': int(np.min(positions[:, 1])),
            'max_x': int(np.max(positions[:, 0])),
            'min_x': int(np.min(positions[:, 0]))
        }
    
    def reset_position_history(self):
        """Clear position history (used at start of new session)"""
        self.position_history = []
    
    def release(self):
        """Release MediaPipe resources"""
        self.hands.close()


def test_webcam():
    """
    Simple function to test if webcam is working.
    Shows video feed with hand landmarks if detected.
    Press 'q' to quit.
    
    Returns:
        bool: True if webcam works, False otherwise
    """
    print("Testing webcam...")
    print("Press 'q' to quit")
    
    # Try to open webcam
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("ERROR: Cannot open webcam")
        print("Possible fixes:")
        print("1. Check if webcam is connected")
        print("2. Check if another application is using the webcam")
        print("3. Try changing camera index (0, 1, 2)")
        return False
    
    # Initialize hand tracker
    tracker = HandTracker()
    
    print("Webcam opened successfully!")
    print("Move your hand in front of the camera")
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("ERROR: Cannot read frame from webcam")
            break
        
        # Flip frame horizontally (mirror view)
        frame = cv2.flip(frame, 1)
        
        # Process hand tracking
        hand_x, hand_y = tracker.process_frame(frame)
        
        # Draw landmarks
        frame = tracker.draw_landmarks(frame)
        
        # Show hand position
        if hand_x is not None:
            cv2.putText(frame, f"Hand: ({hand_x}, {hand_y})", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.7, (0, 255, 0), 2)
            cv2.circle(frame, (hand_x, hand_y), 10, (0, 255, 0), -1)
        else:
            cv2.putText(frame, "No hand detected", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.7, (0, 0, 255), 2)
        
        # Display
        cv2.imshow('Webcam Test - Press Q to quit', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    tracker.release()
    
    print("Webcam test completed successfully!")
    return True


if __name__ == "__main__":
    # Run webcam test when module is run directly
    test_webcam()
