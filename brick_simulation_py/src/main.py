"""
Main entry point for the Bric Game
"""
import pygame
import sys
import os
from . import config
from .game import Game

def main():
    """Main function to run the game"""
    # Set up pygame
    pygame.init()
    
    # Initialize and run the game
    game = Game(config)
    game.run()
    
    # Clean up
    pygame.quit()

if __name__ == "__main__":
    main()
