#!/usr/bin/env python3
"""
Script to run the FastAPI server
"""
import uvicorn
import sys
import os

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import the app
from app.main import app

if __name__ == "__main__":
    print(f"Starting server from {current_dir}")
    print(f"Python path: {sys.path}")
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=False,  # Disable auto-reload for now
        log_level="debug"
    )

