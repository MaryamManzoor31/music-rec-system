#!/bin/bash

# Music Chatbot Setup Script for macOS/Linux

echo ""
echo "===================================="
echo "Music Recommendation Chatbot Setup"
echo "===================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

echo "[1/4] Python found. Creating virtual environment..."
cd backend
python3 -m venv venv

echo "[2/4] Activating virtual environment..."
source venv/bin/activate

echo "[3/4] Installing dependencies..."
pip install -r requirements.txt

echo "[4/4] Setup complete!"
echo ""
echo "===================================="
echo "Next Steps:"
echo "===================================="
echo ""
echo "1. Keep this terminal open and run:"
echo "   python app.py"
echo ""
echo "2. Open another terminal in the frontend folder and run:"
echo "   python -m http.server 8000"
echo ""
echo "3. Open http://localhost:8000 in your browser"
echo ""
echo "===================================="
echo ""
