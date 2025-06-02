"""
Local runner script for the Bric Game
This script allows running the game directly on the local machine for testing
"""
import os
import sys
import pygame

# Add the current directory to path to allow importing the src package
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the main game function
from src.main import main

if __name__ == "__main__":
    # Run the game
    main()
