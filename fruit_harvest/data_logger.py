"""
Data Logger Module
Handles CSV export of session data for therapist review
"""

import pandas as pd
import os
from datetime import datetime
from config import CSV_COLUMNS


class DataLogger:
    """Manages session data collection and CSV export"""
    
    def __init__(self, session_id, game_mode, avatar_gender):
        """
        Initialize data logger.
        
        Args:
            session_id: Unique session identifier
            game_mode: 'full_range' or 'horizontal_only'
            avatar_gender: 'male' or 'female'
        """
        self.session_id = session_id
        self.game_mode = game_mode
        self.avatar_gender = avatar_gender
        
        # Data storage
        self.interactions = []
        
        # Session tracking
        self.session_start_time = datetime.now()
        self.current_score = 0
        
        # ROM tracking
        self.max_y_reached = 0
        self.min_y_reached = 9999
        self.max_x_reached = 0
        self.min_x_reached = 9999
        
    def log_interaction(self, item, outcome, score_change, tremor_score, 
                       hand_max_y, hand_max_x, hand_min_x, reaction_time):
        """
        Log a single item interaction.
        
        Args:
            item: Item object
            outcome: 'caught', 'avoided', 'mistake', 'missed'
            score_change: Points added/subtracted
            tremor_score: Tremor measurement
            hand_max_y, hand_max_x, hand_min_x: ROM during interaction
            reaction_time: Time from spawn to interaction
        """
        self.current_score += score_change
        
        # Update ROM tracking
        self.max_y_reached = max(self.max_y_reached, hand_max_y)
        self.min_y_reached = min(self.min_y_reached, hand_max_y)
        self.max_x_reached = max(self.max_x_reached, hand_max_x)
        self.min_x_reached = min(self.min_x_reached, hand_min_x)
        
        # Create interaction record
        interaction = {
            'session_id': self.session_id,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'game_mode': self.game_mode,
            'avatar_gender': self.avatar_gender,
            'item_type': item.type,
            'item_height_level': item.height_level,
            'item_x_spawn': int(item.x),
            'hand_max_y_pixel': int(hand_max_y) if hand_max_y else None,
            'hand_max_x_pixel': int(hand_max_x) if hand_max_x else None,
            'hand_min_x_pixel': int(hand_min_x) if hand_min_x else None,
            'reaction_time_sec': round(reaction_time, 2),
            'outcome': outcome,
            'score_change': score_change,
            'tremor_score': tremor_score,
            'session_score_final': self.current_score,
            'session_duration_sec': self._get_session_duration()
        }
        
        self.interactions.append(interaction)
    
    def _get_session_duration(self):
        """Calculate current session duration"""
        return round((datetime.now() - self.session_start_time).total_seconds(), 1)
    
    def save_to_csv(self):
        """
        Save session data to CSV file.
        
        Returns:
            str: Path to saved CSV file
        """
        # Create session_data directory if it doesn't exist
        os.makedirs('session_data', exist_ok=True)
        
        # Generate filename
        timestamp = self.session_start_time.strftime('%Y%m%d_%H%M%S')
        filename = f'session_data/{timestamp}_{self.session_id}.csv'
        
        # Create DataFrame
        df = pd.DataFrame(self.interactions, columns=CSV_COLUMNS)
        
        # Save to CSV
        df.to_csv(filename, index=False)
        
        print(f"Session data saved to: {filename}")
        return filename
    
    def get_session_summary(self):
        """
        Generate end-of-session summary.
        
        Returns:
            dict: Summary statistics
        """
        if not self.interactions:
            return {
                'total_score': 0,
                'good_caught': 0,
                'good_total': 0,
                'bad_avoided': 0,
                'bad_total': 0,
                'avg_reaction_time': 0,
                'avg_tremor': 0,
                'rom_vertical': 0,
                'rom_horizontal': 0
            }
        
        df = pd.DataFrame(self.interactions)
        
        # Calculate statistics
        good_items = df[df['item_type'].isin(['apple', 'banana', 'orange'])]
        bad_items = df[df['item_type'].isin(['bomb', 'fish_bone'])]
        
        summary = {
            'total_score': self.current_score,
            'good_caught': len(good_items[good_items['outcome'] == 'caught']),
            'good_total': len(good_items),
            'bad_avoided': len(bad_items[bad_items['outcome'] == 'avoided']),
            'bad_total': len(bad_items),
            'avg_reaction_time': round(df['reaction_time_sec'].mean(), 2),
            'avg_tremor': round(df['tremor_score'].mean(), 2),
            'rom_vertical': self.max_y_reached - self.min_y_reached,
            'rom_horizontal': self.max_x_reached - self.min_x_reached,
            'duration': self._get_session_duration()
        }
        
        return summary
    
    def compare_with_previous_session(self):
        """
        Compare current session with previous session data.
        
        Returns:
            dict: Improvement metrics or None if no previous data
        """
        # Get all previous CSV files
        if not os.path.exists('session_data'):
            return None
        
        csv_files = [f for f in os.listdir('session_data') if f.endswith('.csv')]
        
        if len(csv_files) < 1:
            return None
        
        # Sort by date and get most recent (excluding current session)
        csv_files.sort(reverse=True)
        
        # Try to load previous session
        try:
            previous_file = os.path.join('session_data', csv_files[0])
            prev_df = pd.read_csv(previous_file)
            
            # Get last row (final state of previous session)
            prev_final = prev_df.iloc[-1]
            
            # Calculate improvements
            current_summary = self.get_session_summary()
            
            improvements = {
                'score_change': self.current_score - prev_final['session_score_final'],
                'tremor_improvement': round(
                    (prev_df['tremor_score'].mean() - current_summary['avg_tremor']) / 
                    prev_df['tremor_score'].mean() * 100, 1
                ),
                'reaction_improvement': round(
                    (prev_df['reaction_time_sec'].mean() - current_summary['avg_reaction_time']) /
                    prev_df['reaction_time_sec'].mean() * 100, 1
                )
            }
            
            return improvements
            
        except Exception as e:
            print(f"Could not load previous session: {e}")
            return None
