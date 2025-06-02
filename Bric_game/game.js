/**
 * Bric Game - JavaScript loader for Pyodide integration
 * This file handles loading the Python game via Pyodide and initializing it
 */

// Main function to load and initialize the game
async function initGame() {
    try {
        // Get DOM elements
        const loadingOverlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        const canvas = document.getElementById('game-canvas');
        const errorMessage = document.getElementById('error-message');
        
        // Update loading message
        loadingText.textContent = 'Loading Pyodide...';
        
        // Load Pyodide
        const pyodide = await loadPyodide();
        
        // Update loading message
        loadingText.textContent = 'Setting up environment...';
        
        // Install required packages
        await pyodide.loadPackagesFromImports('import pygame');
        
        // Update loading message
        loadingText.textContent = 'Loading game files...';

        // Define the Python game files to load
        const gameFiles = [
            'config.py',
            'utils/helpers.py',
            'components/game_object.py',
            'components/paddle.py',
            'components/ball.py', 
            'components/brick.py',
            'components/item.py',
            'components/level.py',
            'managers/collision.py',
            'managers/sprite_manager.py',
            'ui/text.py',
            'game.py',
            'main.py',
            '__init__.py'
        ];
        
        // Create necessary directories in the Pyodide file system
        pyodide.runPython(`
            import os
            os.makedirs('src/components', exist_ok=True)
            os.makedirs('src/managers', exist_ok=True)
            os.makedirs('src/ui', exist_ok=True)
            os.makedirs('src/utils', exist_ok=True)
            os.makedirs('assets/images', exist_ok=True)
        `);
        
        // Fetch and load all game files
        for (const file of gameFiles) {
            try {
                const response = await fetch(`src/${file}`);
                if (!response.ok) {
                    console.warn(`Failed to load ${file}: ${response.status} ${response.statusText}`);
                    continue;
                }
                const content = await response.text();
                
                // Create necessary directories for this file
                const dir = `src/${file.substring(0, file.lastIndexOf('/'))}`; 
                if (file.includes('/')) {
                    pyodide.runPython(`os.makedirs('${dir}', exist_ok=True)`);
                }
                
                // Write the file content to the Pyodide filesystem
                pyodide.FS.writeFile(`src/${file}`, content);
                console.log(`Loaded: ${file}`);
            } catch (err) {
                console.error(`Error loading ${file}:`, err);
                // Continue with other files
            }
        }
        
        // Load the web integration file
        try {
            const response = await fetch('web_integration.py');
            if (response.ok) {
                const content = await response.text();
                pyodide.FS.writeFile('web_integration.py', content);
                console.log('Loaded web integration module');
            } else {
                throw new Error('Failed to load web integration module');
            }
        } catch (err) {
            console.error('Error loading web integration module:', err);
            showError('Failed to load game files. Please try again later.');
            return;
        }
        
        // Update loading message
        loadingText.textContent = 'Initializing game...';
        
        // Initialize pygame for web
        pyodide.runPython(`
            import web_integration
            web_integration.init_web()
        `);
        
        // Hide loading overlay
        loadingOverlay.style.display = 'none';
        
        console.log('Game initialized successfully');
        
    } catch (error) {
        console.error('Error initializing game:', error);
        showError('Failed to initialize the game. Please make sure your browser supports WebAssembly.');
    }
}

// Show error message
function showError(message) {
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorMessage = document.getElementById('error-message');
    
    loadingOverlay.style.display = 'none';
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Handle window resize to maintain aspect ratio and scaling
function handleResize() {
    const container = document.querySelector('.game-container');
    const canvas = document.getElementById('game-canvas');
    
    // Maintain aspect ratio for proper rendering
    const containerWidth = container.clientWidth;
    container.style.height = `${containerWidth * 0.75}px`; // 4:3 aspect ratio
}

// Initialize the game when page is loaded
window.addEventListener('load', () => {
    // Set up resize handler
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Initialize the game
    initGame().catch(err => {
        console.error('Failed to initialize the game:', err);
        showError('Failed to initialize the game. Please check console for details.');
    });
});

// Clean up when the page is unloaded
window.addEventListener('unload', () => {
    try {
        // Stop the game loop if it's running
        if (window.pyodide && window.stop_bric_game) {
            window.stop_bric_game();
        }
    } catch (e) {
        console.error('Error during cleanup:', e);
    }
});
