// 게임 관련 번역 데이터
const translations = {
  'ko': {
    'title': '반응 속도 테스트',
    'reaction-game-title': '반응 속도 테스트 게임',
    'smoke-game-title': '스모크 게임',
    'game-description': '얼마나 빠르게 반응할 수 있는지 테스트해보세요!',
    'play-now': '지금 플레이하기'
  },
  'en': {
    'title': 'Reaction Speed Test',
    'reaction-game-title': 'Reaction Speed Test Game',
    'smoke-game-title': 'Smoke Game',
    'game-description': 'Test how quickly you can react!',
    'play-now': 'Play Now'
  }
};

// 게임 컴포넌트는 별도 로드합니다. (window 객체로 노출됨)
// 게임 페이지가 로드될 때 초기화됩니다.

// Language handling
function changeLanguage(lang) {
    try {
        document.documentElement.lang = lang;
        
        // Update text content for elements with data-text attribute
        document.querySelectorAll('[data-text]').forEach(element => {
            const textKey = element.getAttribute('data-text');
            if (translations[lang] && translations[lang][textKey]) {
                element.textContent = translations[lang][textKey];
            }
        });
        
        // Update language button states
        document.querySelectorAll('.language-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Save current language to localStorage
        localStorage.setItem('selectedLanguage', lang);
        
        // Update game translations if game is loaded
        if (window.gameTranslations && typeof window.gameTranslations.changeLanguage === 'function') {
            console.log('게임 번역 업데이트:', lang);
            window.gameTranslations.changeLanguage(lang);
            if (typeof window.gameTranslations.updateAllText === 'function') {
                window.gameTranslations.updateAllText();
            }
        }
    } catch (error) {
        console.error('언어 변경 중 오류 발생:', error);
    }
}

// Initialize language from localStorage
const savedLang = localStorage.getItem('selectedLanguage') || 'ko';
changeLanguage(savedLang);

// Language button click handlers
document.querySelectorAll('.language-btn').forEach(button => {
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
        modal.classList.remove('active');
        gameIframe.src = '';
    });
}

// Close modal when clicking outside the content
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.classList.remove('active');
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
            modal.classList.add('active');
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
