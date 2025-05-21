import { translations } from './reaction_test/js/translations.js';
import { initializeUI } from './reaction_test/js/ui.js';
import { initializeGame } from './reaction_test/js/game.js';
import { initializeAudio } from './reaction_test/js/audio.js';
import { initializeLeaderboard } from './reaction_test/js/leaderboard.js';

// Initialize all components
initializeUI();
initializeGame();
initializeAudio();
initializeLeaderboard();

// Language handling
function changeLanguage(lang) {
    document.documentElement.lang = lang;
    
    // Update text content for elements with data-text attribute
    document.querySelectorAll('[data-text]').forEach(element => {
        const textKey = element.getAttribute('data-text');
        if (translations[lang] && translations[lang][textKey]) {
            element.textContent = translations[lang][textKey];
        }
    });
    
    // Update language button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Save current language to localStorage
    localStorage.setItem('selectedLanguage', lang);
    
    // Update game translations if game is loaded
    if (window.gameTranslations) {
        window.gameTranslations.changeLanguage(lang);
        window.gameTranslations.updateAllText();
    }
}

// Initialize language from localStorage
const savedLang = localStorage.getItem('selectedLanguage') || 'ko';
changeLanguage(savedLang);

// Language button click handlers
document.querySelectorAll('.lang-btn').forEach(button => {
    button.addEventListener('click', function() {
        const lang = this.getAttribute('data-lang');
        changeLanguage(lang);
    });
});

// Game modal handling
const modal = document.getElementById('embedded-game-container');
const modalTitle = document.getElementById('embedded-game-title');
const gameIframe = document.getElementById('embedded-game-iframe');
const closeButton = document.getElementById('close-embedded-game');

// Close button functionality
if (closeButton) {
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
        gameIframe.src = '';
    });
}

// Close modal when clicking outside the content
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        gameIframe.src = '';
    }
});

// Game button click handlers
document.querySelectorAll('.play-game-btn').forEach(button => {
    button.addEventListener('click', function() {
        const gameType = this.getAttribute('data-game');
        let gamePath = '';
        let gameTitle = '';
        
        // Set the appropriate game path and title
        if (gameType === 'reaction') {
            gamePath = 'reaction_test/react_test.html';
            gameTitle = translations[document.documentElement.lang]['title'] || 'Reaction Test';
        } else if (gameType === 'smoke') {
            gamePath = 'reaction_test/Smoke.html';
            gameTitle = translations[document.documentElement.lang]['smoke-game-title'] || 'Smoke Game';
        }
        
        // Only proceed if we have a valid game path
        if (gamePath) {
            // Update modal title and iframe source
            modalTitle.textContent = gameTitle;
            
            // Create URL with language parameter
            const lang = document.documentElement.lang;
            const gameUrl = `${gamePath}?lang=${lang}`;
            
            // Set iframe source
            gameIframe.src = gameUrl;
            
            // Show modal
            modal.style.display = 'flex';
        }
    });
});

// Game thumbnails click handlers (same as clicking the play button)
document.querySelectorAll('.game-thumbnail').forEach(thumbnail => {
    thumbnail.addEventListener('click', function() {
        // Find the closest game card and its play button
        const gameCard = this.closest('.game-card');
        if (gameCard) {
            const playButton = gameCard.querySelector('.play-game-btn');
            if (playButton) {
                playButton.click();
            }
        }
    });
});
