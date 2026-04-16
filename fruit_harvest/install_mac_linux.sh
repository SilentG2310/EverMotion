#!/bin/bash

echo "============================================"
echo "Fruit Harvest - Rehabilitation Game Setup"
echo "============================================"
echo ""

echo "Step 1: Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create virtual environment"
    echo "Make sure Python 3 is installed"
    exit 1
fi

echo "Step 2: Activating virtual environment..."
source venv/bin/activate

echo "Step 3: Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo ""
echo "To test your webcam, run:"
echo "  python hand_tracker.py"
echo ""
echo "To start the game, run:"
echo "  python main.py"
echo ""
echo "Press Enter to test webcam now..."
read

python hand_tracker.py
