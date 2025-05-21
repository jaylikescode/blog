/**
 * translations.js - 언어 번역 관련 모듈
 */

// Language translations - 전역 변수로 선언 (export 키워드 제거)
const translations = {
  'en': {
    // Blog sections
    'blog-title': 'My Blog',
    'blog-subtitle': 'Welcome to my personal space',
    'menu-home': 'Home',
    'menu-about': 'About',
    'menu-thoughts': 'Thoughts/Ideas',
    'menu-games': 'My Games',
    'menu-contact': 'Contact',
    'home-title': 'Home',
    'home-welcome': 'Welcome to my blog! Here you can find an introduction to Jay, my thoughts and ideas, and images I want to share.',
    'about-title': 'About Me',
    'about-greeting': 'Hello! I am Jay.',
    'about-description': 'This is where Jay can write his self-introduction. It can include Jay\'s interests, expertise, hobbies, etc.',
    'about-instruction': 'To add a self-introduction, replace this text with information about Jay.',
    'thoughts-title': 'Thoughts & Ideas',
    'thought-1-title': 'First Thought',
    'thought-1-content-1': 'Write here about Jay\'s first thought or idea.',
    'thought-1-content-2': 'This can be a blog post, thought, idea, or anything Jay wants to share.',
    'thought-1-date': 'Date: May 18, 2025',
    'thought-2-title': 'Second Thought',
    'thought-2-content-1': 'Write here about Jay\'s second thought or idea.',
    'thought-2-content-2': 'Feel free to add your thoughts and ideas.',
    'thought-2-date': 'Date: May 18, 2025',
    'comments-title': 'Comments',
    'comments-form-title': 'Leave a Comment',
    'comments-name-label': 'Name:',
    'comments-content-label': 'Comment:',
    'comments-submit-button': 'Submit Comment',
    'comments-list-title': 'Comments List',
    'comments-visitor': 'Visitor',
    'comments-example': 'This is an example first comment. Jay\'s blog is really cool!',
    'comments-date': 'May 18, 2025',
    'games-title': 'My Games',
    'games-intro': 'Play games I made. Have fun!',
    'reaction-game-title': 'Reaction Speed Test',
    'reaction-game-desc': 'A game to test your reaction speed. Click when the screen turns green. Compete with Jay!',
    
    // Game translations
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
    'restart-game': 'Restart Game',
    'smoke-game-title': 'Smoke Game',
    'smoke-game-desc': 'Use arrow keys to move and attack. Defeat the enemy before your health runs out!',
    'game-modal-title': 'Game Modal',
    'game-loading': 'Game loading...',
    'game-close': 'Close Game',
    'click-to-play': 'Click to play',
    'play-game': 'Play Game',
    'game-error': 'Failed to load game',
    'game-container': 'Game Container',
    'game-wrapper': 'Game Wrapper',
    'game-iframe': 'Game Frame',
    'game-content': 'Game Content',
    'game-close-button': 'Close Game Button'
  },
  'ko': {
    // Blog sections
    'blog-title': '내 블로그',
    'blog-subtitle': '내 개인 공간에 오신 것을 환영합니다',
    'menu-home': '홈',
    'menu-about': '소개',
    'menu-thoughts': '생각/아이디어',
    'menu-games': '내 게임들',
    'menu-contact': '연락처',
    'home-title': '홈',
    'home-welcome': '제 블로그에 오신 것을 환영합니다! 이곳에서 Jay에 대한 소개, 제 생각과 아이디어, 그리고 제가 공유하고 싶은 이미지들을 찾아보실 수 있습니다.',
    'about-title': '자기소개',
    'about-greeting': '안녕하세요! 저는 Jay입니다.',
    'about-description': '이곳은 나중에 Jay의 자기소개를 작성할 수 있는 공간입니다. Jay의 관심사, 전문 분야, 취미 등을 포함할 수 있습니다.',
    'about-instruction': '자기소개를 추가하려면 이 텍스트를 Jay에 관한 정보로 대체하세요.',
    'thoughts-title': '생각 및 아이디어',
    'thought-1-title': '첫 번째 생각',
    'thought-1-content-1': '여기에 Jay의 첫 번째 생각이나 아이디어에 대한 내용을 작성하세요.',
    'thought-1-content-2': '이것은 블로그 포스트, 생각, 아이디어 또는 Jay가 공유하고 싶은 내용이 될 수 있습니다.',
    'thought-1-date': '작성일: 2025년 5월 18일',
    'thought-2-title': '두 번째 생각',
    'thought-2-content-1': '여기에 Jay의 두 번째 생각이나 아이디어에 대한 내용을 작성하세요.',
    'thought-2-content-2': '당신의 생각과 아이디어를 자유롭게 추가하세요.',
    'thought-2-date': '작성일: 2025년 5월 18일',
    'comments-title': '댓글',
    'comments-form-title': '댓글 남기기',
    'comments-name-label': '이름:',
    'comments-content-label': '댓글:',
    'comments-submit-button': '댓글 작성',
    'comments-list-title': '댓글 목록',
    'comments-visitor': '방문자',
    'comments-example': '첫 번째 댓글 예시입니다. Jay의 블로그가 정말 멋져요!',
    'comments-date': '2025년 5월 18일',
    'games-title': '내 게임들',
    'games-intro': '제가 직접 만든 게임들을 플레이해보세요. 즐거운 시간 보내세요!',
    'reaction-game-title': '반응 속도 테스트',
    'reaction-game-desc': '반응 속도를 테스트하는 게임입니다. 화면이 녹색으로 변할 때 클릭하세요. Jay와 경쟁해보세요!',
    
    // Game translations
    'title': '지석이보다 빠르다고?',
    'smoke-game-title': '연기 게임',
    'smoke-game-desc': '화살표 키를 사용하여 이동하고 공격하세요. 체력이 다 떨어지기 전에 적을 물리쳐보세요!',
    'game-modal-title': '게임 모달',
    'game-loading': '게임 로딩 중...',
    'game-close': '게임 닫기',
    'click-to-play': '클릭하여 플레이',
    'play-game': '게임 하기',
    'game-error': '게임 로드 실패',
    'game-container': '게임 컨테이너',
    'game-wrapper': '게임 래퍼',
    'game-iframe': '게임 프레임',
    'game-content': '게임 콘텐츠',
    'game-close-button': '게임 닫기 버튼',
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
  }
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
