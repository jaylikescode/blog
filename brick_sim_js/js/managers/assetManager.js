/**
 * Brick Simulation Game - Asset Manager
 * Handles loading, caching and providing game assets (images, audio)
 * Following Single Responsibility Principle - only manages asset loading
 * 
 * Enhanced with fallback generation for missing assets:
 * - Creates procedurally generated canvas graphics for missing images
 * - Synthesizes audio using Web Audio API for missing sound files
 */

class AssetManager {
    /**
     * Creates a new asset manager
     * @param {Object} options - Configuration options
     * @param {boolean} options.fallbackOnly - Whether to use only fallback assets without loading external files
     */
    constructor(options = {}) {
        this.images = new Map(); // Map of image assets
        this.audio = new Map();  // Map of audio assets
        this.totalAssets = 0;    // Total number of assets to load
        this.loadedAssets = 0;   // Number of assets loaded
        this.loadingErrors = 0;  // Number of loading errors
        this.onProgress = null;  // Callback for loading progress
        this.onComplete = null;  // Callback for loading completion
        this.audioContext = null; // Web Audio API context
        this.muted = false;      // Whether audio is muted
        this.fallbackOnly = options.fallbackOnly || false; // Whether to use only fallback assets
        
        // Initialize Audio Context if available
        this.initAudioContext();
        
        if (this.fallbackOnly) {
            console.log('AssetManager: 에셋 로딩을 건너뛰고 프로그래밍 방식의 에셋만 사용합니다.');
        }
    }
    
    /**
     * Sets the callback functions for asset loading
     * @param {Function} progressCallback - Called when an asset is loaded with progress percentage
     * @param {Function} completeCallback - Called when all assets are loaded
     */
    setCallbacks(progressCallback, completeCallback) {
        this.onProgress = progressCallback;
        this.onComplete = completeCallback;
    }
    
    /**
     * Loads a collection of image assets
     * @param {Object} imageAssets - Map of image names to file paths
     */
    loadImages(imageAssets) {
        this.totalAssets += Object.keys(imageAssets).length;
        
        // If in fallbackOnly mode, skip external loading and use fallback assets
        if (this.fallbackOnly) {
            for (const [name, path] of Object.entries(imageAssets)) {
                // Create fallback image immediately without loading attempt
                const fallbackImg = this.createFallbackImage(name);
                this.images.set(name, fallbackImg);
                this.assetLoaded();
                console.log(`Creating fallback for image: ${name} (no loading attempt)`);
            }
            return;
        }
        
        // Standard external asset loading path
        for (const [name, path] of Object.entries(imageAssets)) {
            const img = new Image();
            
            img.onload = () => {
                this.images.set(name, img);
                this.assetLoaded();
            };
            
            img.onerror = () => {
                console.warn(`Failed to load image: ${path}, creating fallback`);
                // Create fallback image
                const fallbackImg = this.createFallbackImage(name);
                this.images.set(name, fallbackImg);
                this.assetLoaded();
            };
            
            img.src = path;
        }
    }
    
    /**
     * Loads a collection of audio assets
     * @param {Object} audioAssets - Map of audio names to file paths
     */
    loadAudio(audioAssets) {
        this.totalAssets += Object.keys(audioAssets).length;
        
        // If in fallbackOnly mode, skip external loading and use fallback assets
        if (this.fallbackOnly) {
            for (const [name, path] of Object.entries(audioAssets)) {
                // Create fallback audio immediately without loading attempt
                const fallbackAudio = this.createFallbackAudio(name);
                this.audio.set(name, fallbackAudio);
                this.assetLoaded();
                console.log(`Creating fallback for audio: ${name} (no loading attempt)`);
            }
            return;
        }
        
        // Standard external asset loading path
        for (const [name, path] of Object.entries(audioAssets)) {
            const audio = new Audio();
            
            audio.oncanplaythrough = () => {
                this.audio.set(name, audio);
                this.assetLoaded();
                // Remove the event to prevent multiple triggers
                audio.oncanplaythrough = null;
            };
            
            audio.onerror = () => {
                console.warn(`Failed to load audio: ${path}, creating fallback`);
                // Create fallback audio
                const fallbackAudio = this.createFallbackAudio(name);
                this.audio.set(name, fallbackAudio);
                this.assetLoaded();
            };
            
            // Add a timeout in case the audio loading hangs
            setTimeout(() => {
                if (!this.audio.has(name) && audio.oncanplaythrough) {
                    console.warn(`Audio loading timed out: ${path}`);
                    this.audio.set(name, audio); // Store it anyway
                    this.assetLoaded();
                    audio.oncanplaythrough = null;
                }
            }, 5000);
            
            audio.src = path;
            audio.load();
        }
    }
    
    /**
     * Called when an asset is loaded
     */
    assetLoaded() {
        this.loadedAssets++;
        
        // Calculate loading progress
        const progress = Math.floor((this.loadedAssets / this.totalAssets) * 100);
        
        // Call progress callback if provided
        if (this.onProgress) {
            this.onProgress(progress, this.loadedAssets, this.totalAssets);
        }
        
        // Check if all assets are loaded
        if (this.loadedAssets === this.totalAssets && this.onComplete) {
            this.onComplete(this.loadingErrors === 0);
        }
    }
    
    /**
     * Gets an image asset by name
     * @param {string} name - The name of the image
     * @returns {HTMLImageElement|null} The image, or null if not found
     */
    getImage(name) {
        return this.images.get(name) || null;
    }
    
    /**
     * Gets an audio asset by name
     * @param {string} name - The name of the audio
     * @returns {HTMLAudioElement|null} The audio, or null if not found
     */
    getAudio(name) {
        return this.audio.get(name) || null;
    }
    
    /**
     * Plays an audio asset
     * @param {string} name - The name of the audio to play
     * @param {number} volume - The volume (0.0 to 1.0)
     * @param {boolean} loop - Whether to loop the audio
     */
    playAudio(name, volume = 1.0, loop = false) {
        const audio = this.getAudio(name);
        
        if (!audio) {
            return;
        }
        
        // Create a clone to allow for overlapping sounds
        const sound = audio.cloneNode();
        sound.volume = volume;
        sound.loop = loop;
        sound.play().catch(error => {
            console.warn(`Error playing audio ${name}:`, error);
        });
    }
    
    /**
     * Stops a looping audio asset
     * @param {string} name - The name of the audio to stop
     */
    stopAudio(name) {
        const audio = this.getAudio(name);
        
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
    
    /**
     * Checks if all assets have been loaded
     * @returns {boolean} True if all assets are loaded, false otherwise
     */
    isLoaded() {
        return this.loadedAssets === this.totalAssets;
    }
    
    /**
     * Gets the current loading progress
     * @returns {number} The loading progress as a percentage (0-100)
     */
    getProgress() {
        return Math.floor((this.loadedAssets / this.totalAssets) * 100);
    }
    
    /**
     * Initializes Web Audio API context
     */
    initAudioContext() {
        try {
            // Use AudioContext or webkitAudioContext (for older browsers)
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
            }
        } catch (e) {
            console.warn('Web Audio API not supported in this browser');
        }
    }
    
    /**
     * Creates a fallback image using canvas
     * @param {string} name - The name of the image to create
     * @returns {HTMLCanvasElement} A canvas element with the generated image
     */
    createFallbackImage(name) {
        // Create a canvas element as a fallback
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let width = 50;
        let height = 50;
        
        // Set size based on the type of asset
        if (name.includes('brick')) {
            width = 50;
            height = 20;
        } else if (name === 'paddle') {
            width = 80;
            height = 20;
        } else if (name === 'ball') {
            width = 16;
            height = 16;
        } else if (name === 'background') {
            width = 800;
            height = 600;
        } else if (name.includes('item')) {
            width = 30;
            height = 30;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Set color based on the name of the asset
        let color = '#FFFFFF';
        
        if (name.includes('brick')) {
            if (name.includes('red')) color = '#FF0000';
            else if (name.includes('green')) color = '#00FF00';
            else if (name.includes('blue')) color = '#0000FF';
            else if (name.includes('yellow')) color = '#FFFF00';
            else if (name.includes('purple')) color = '#800080';
            else if (name.includes('orange')) color = '#FFA500';
            else color = '#888888';
        } else if (name === 'paddle') {
            color = '#00AAFF';
        } else if (name === 'ball') {
            color = '#FFFFFF';
        } else if (name === 'background') {
            ctx.fillStyle = '#000022';
            ctx.fillRect(0, 0, width, height);
            
            // Draw some stars
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const radius = Math.random() * 1.5;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            return canvas;
        } else if (name.includes('item')) {
            if (name.includes('extend')) color = '#00FFFF';
            else if (name.includes('multi')) color = '#FF00FF';
            else if (name.includes('life')) color = '#FF0000';
            else if (name.includes('slow')) color = '#FFFF00';
            else color = '#FFFFFF';
        }
        
        // Draw the shape based on the type
        ctx.fillStyle = color;
        
        if (name === 'ball') {
            // Draw a circle for the ball
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (name.includes('item')) {
            // Draw a diamond for items
            ctx.beginPath();
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width, height / 2);
            ctx.lineTo(width / 2, height);
            ctx.lineTo(0, height / 2);
            ctx.closePath();
            ctx.fill();
            
            // Add a letter in the middle
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let letter = '?';
            if (name.includes('extend')) letter = 'E';
            else if (name.includes('multi')) letter = 'M';
            else if (name.includes('life')) letter = 'L';
            else if (name.includes('slow')) letter = 'S';
            
            ctx.fillText(letter, width / 2, height / 2);
        } else {
            // Draw a rectangle for everything else
            ctx.fillRect(0, 0, width, height);
            
            // Add some detail
            if (name.includes('brick')) {
                // Add a border
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeRect(1, 1, width - 2, height - 2);
                
                // Add highlight
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(2, 2, width - 4, height / 3);
            } else if (name === 'paddle') {
                // Add a border and highlights
                ctx.strokeStyle = '#0066AA';
                ctx.lineWidth = 2;
                ctx.strokeRect(1, 1, width - 2, height - 2);
                
                // Add highlight
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.fillRect(2, 2, width - 4, height / 3);
            }
        }
        
        return canvas;
    }
    
    /**
     * Creates a fallback audio using Web Audio API
     * @param {string} name - The name of the audio to create
     * @returns {Object} An object with play/pause methods mimicking Audio API
     */
    createFallbackAudio(name) {
        // If Web Audio API is not available, return a dummy audio object
        if (!this.audioContext) {
            return this.createDummyAudio();
        }
        
        // Create a synthesized sound based on the name
        let duration = 0.3; // seconds
        let type = 'sine';
        let frequency = 440; // Hz
        let fadeOut = true;
        
        if (name === 'brick_hit') {
            type = 'square';
            frequency = 300;
            duration = 0.1;
        } else if (name === 'brick_break') {
            type = 'sawtooth';
            frequency = 200;
            duration = 0.2;
        } else if (name === 'item_collect') {
            type = 'sine';
            frequency = 600;
            duration = 0.2;
        } else if (name === 'life_lost') {
            type = 'sawtooth';
            frequency = 150;
            duration = 0.5;
        } else if (name === 'level_complete') {
            type = 'sine';
            frequency = 440;
            duration = 1.0;
        } else if (name === 'game_over') {
            type = 'sawtooth';
            frequency = 100;
            duration = 1.2;
        }
        
        // Create an object that mimics the Audio interface
        const synth = {
            play: (volume = 1.0) => {
                if (this.muted) return Promise.resolve();
                
                try {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.type = type;
                    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
                    
                    if (fadeOut) {
                        gainNode.gain.exponentialRampToValueAtTime(
                            0.01, this.audioContext.currentTime + duration
                        );
                    }
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + duration);
                    
                    return Promise.resolve();
                } catch (e) {
                    console.warn('Error playing synthesized audio:', e);
                    return Promise.resolve();
                }
            },
            pause: () => {},
            currentTime: 0,
            volume: 1,
            cloneNode: () => synth
        };
        
        return synth;
    }
    
    /**
     * Creates a dummy audio object that does nothing (fallback for fallback)
     * @returns {Object} An object with play/pause methods that do nothing
     */
    createDummyAudio() {
        return {
            play: () => Promise.resolve(),
            pause: () => {},
            currentTime: 0,
            volume: 1,
            cloneNode: function() { return this; }
        };
    }
    
    /**
     * Sets the mute state for all audio
     * @param {boolean} muted - Whether audio should be muted
     */
    setMute(muted) {
        this.muted = muted;
    }
}

// 전역 객체에 클래스 등록
window.AssetManager = AssetManager;
console.log('AssetManager 클래스가 전역 객체에 등록되었습니다:', typeof window.AssetManager !== 'undefined' ? '성공' : '실패');
