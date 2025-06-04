/**
 * Brick Simulation Game - Helper Utilities
 * Contains common utility functions used throughout the game
 */

/**
 * Clamps a value between a minimum and maximum value
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {number} The clamped value
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random integer between min and max
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random float between min and max
 */
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Checks if a probability test passes
 * @param {number} probability - The probability of success (0.0 to 1.0)
 * @returns {boolean} True if the test passes, false otherwise
 */
function probabilityTest(probability) {
    return Math.random() < probability;
}

/**
 * Loads an image asynchronously
 * @param {string} src - The source path of the image
 * @returns {Promise<HTMLImageElement>} A promise that resolves with the loaded image
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

/**
 * Loads an audio file
 * @param {string} src - The source path of the audio file
 * @returns {HTMLAudioElement} The audio element
 */
function loadAudio(src) {
    const audio = new Audio();
    audio.src = src;
    return audio;
}

/**
 * Detects the user's preferred language
 * @returns {string} The detected language code (e.g., 'en', 'ko')
 */
function detectLanguage() {
    const storedLang = localStorage.getItem('brickSimLanguage');
    if (storedLang) {
        return storedLang;
    }
    
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('ko')) {
        return 'ko';
    }
    
    return 'en'; // Default to English
}

/**
 * Sets the game language
 * @param {string} langCode - The language code to set ('en' or 'ko')
 */
function setLanguage(langCode) {
    if (CONFIG.LANGUAGES[langCode]) {
        CONFIG.CURRENT_LANGUAGE = langCode;
        localStorage.setItem('brickSimLanguage', langCode);
        document.body.className = `lang-${langCode}`;
    }
}

/**
 * Gets a localized text string
 * @param {string} key - The key of the text string to get
 * @returns {string} The localized text string
 */
function getText(key) {
    const lang = CONFIG.CURRENT_LANGUAGE;
    return CONFIG.LANGUAGES[lang][key] || key;
}

/**
 * Shows the loading overlay
 * @param {string} message - The message to display
 */
function showLoading(message) {
    const overlay = document.getElementById('loading-overlay');
    const text = document.getElementById('loading-text');
    text.textContent = message;
    overlay.style.display = 'flex';
}

/**
 * Hides the loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'none';
}

/**
 * Shows an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    hideLoading();
}

// Initialize language based on user preference or browser language
window.addEventListener('DOMContentLoaded', () => {
    setLanguage(detectLanguage());
});
