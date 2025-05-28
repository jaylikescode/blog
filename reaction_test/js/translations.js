// translations.js - English only translation module

const translations = {
  'en': {
    'title': 'Faster than Jay?',
    'game-description': 'A simple game to test your reaction speed:',
    'click-to-start': 'Click here to start',
    'instruction-1': 'Click on the game area',
    'instruction-2': 'Wait until the screen turns green',
    'instruction-3': 'Click the screen as soon as it turns green',
    'instruction-4': 'After 5 rounds, your best reaction time will be recorded',
    'warning': 'Caution: Don\'t click before it turns green!',
    'start-button': 'Start Test',
    'ready': 'Ready',
    'waiting': 'Wait...',
    'click': 'Click!',
    'too-early': 'Too early!',
    'round': 'Round',
    'best': 'Best',
    'retry': 'Try Again',
    'ms': 'ms',
    'completed': 'Completed!',
    'amazing': 'Amazing speed!',
    'very-fast': 'Very fast!',
    'excellent': 'Excellent!',
    'above-average': 'Above average!',
    'keep-practicing': 'Keep practicing!',
    'player-name-label': 'Name:',
    'player-name-placeholder': 'Enter your name',
    'save-score': 'Save Score',
    'leaderboard-title': 'Leaderboard',
    'loading': 'Loading...',
    'rank': 'Rank',
    'name': 'Name',
    'score': 'Score',
    'date': 'Date',
    'show-more': 'Show More',
    'best-scores': 'Best Scores',
    'enter-name': 'Enter your name to save your score:',
    'anonymous': 'Anonymous',
    'no-records': 'No records yet. Be the first!',
    'saving': 'Saving your score...',
    'your-rank': 'Your rank',
    'restart-game': 'Restart Game'
  }
/** No Korean translations. English only.
    'title': '지석이보다 빠르다고?',
    'game-description': '반응 속도를 테스트하는 간단한 게임입니다:',
    'click-to-start': '화면을 클릭하여 시작하세요',
    'instruction-1': '게임 화면을 클릭하세요',
    'instruction-2': '화면이 녹색으로 바뀔 때까지 기다리세요',
    'instruction-3': '녹색으로 바뀌는 즉시 화면을 클릭하세요',
    'instruction-4': '5회 반복 후 최고 반응 시간이 기록됩니다',
    'warning': '주의: 녹색으로 바뀌기 전에 클릭하면 안 됩니다!',
    'start-button': '시작하기',
    'ready': '준비',
    'waiting': '준비 중...',
    'click': '클릭!',
    'too-early': '너무 일찍 클릭했습니다!',
    'round': '회',
    'best': '최고',
    'retry': '다시 하기',
    'ms': 'ms',
    'completed': '완료!',
    'amazing': '놀라운 속도!',
    'very-fast': '매우 빠릅니다!',
    'excellent': '훌륭합니다!',
    'above-average': '평균 이상입니다!',
    'keep-practicing': '연습하면 빨라집니다!',
    'player-name-label': '이름:',
    'player-name-placeholder': '이름을 입력하세요',
    'save-score': '기록 저장',
    'leaderboard-title': '순위표',
    'loading': '로딩 중...',
    'rank': '순위',
    'name': '이름',
    'score': '반응속도',
    'date': '날짜',
    'show-more': '더 보기',
    'best-scores': '최고 기록',
    'enter-name': '이름을 입력하여 기록을 저장하세요:',
    'anonymous': '익명',
    'no-records': '저장된 기록이 없습니다. 처음으로 기록을 생성해보세요!',
    'saving': '기록 저장 중...',
    'your-rank': '당신의 순위',
    'restart-game': '게임 다시 시작하기'
*/
  };

// 현재 언어 - 기본값은 영어
let currentLang = 'en';

/**
 * 텍스트 가져오기 유틸리티 함수
 * @param {string} key - 번역 키
 * @returns {string} - 번역된 텍스트
 */
function getText(key) {
  if (translations[currentLang] && translations[currentLang][key]) {
    return translations[currentLang][key];
  }
  return key;
}

/**
 * 언어 변경 함수
 * @param {string} lang - 새로운 언어 코드 ('en' 또는 'ko')
 */
function changeLanguage(lang) {
  if (lang !== 'en' && lang !== 'ko') {
    lang = 'en'; // 기본값은 영어
  }
  
  currentLang = lang;
  
  // 설정 저장
  localStorage.setItem('selected_language', lang);
}

/**
 * 모든 텍스트 요소를 현재 언어로 업데이트
 */
function updateAllText() {
  // data-text 속성을 가진 모든 요소 선택
  const textElements = document.querySelectorAll('[data-text]');
  
  textElements.forEach(el => {
    const textKey = el.getAttribute('data-text');
    if (textKey) {
      el.textContent = getText(textKey);
    }
  });
}

// 모듈 내보내기
window.gameTranslations = {
  translations,
  currentLang,
  getText,
  changeLanguage,
  updateAllText
};
