/**
 * main.js - 모든 모듈을 초기화하고 연결하는 메인 진입점
 */

// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('[DEBUG] DOMContentLoaded event fired');
  
  // 모듈 확인 및 초기화
  console.log('[DEBUG] Module check: gameTranslations =', !!window.gameTranslations);
  console.log('[DEBUG] Module check: gameLeaderboard =', !!window.gameLeaderboard);
  console.log('[DEBUG] Module check: gameCore =', !!window.gameCore);
  console.log('[DEBUG] Module check: gameUI =', !!window.gameUI);
  console.log('[DEBUG] Module check: gameDB =', !!window.gameDB);
  console.log('[DEBUG] Module check: leaderboardFirebase =', !!window.leaderboardFirebase);

  // 모듈 종속성 검사
  const requiredModules = {
    translations: window.gameTranslations,
    core: window.gameCore,
    ui: window.gameUI,
    db: window.gameDB
  };

  // 필수 모듈 확인
  let allRequired = true;
  for (const [name, module] of Object.entries(requiredModules)) {
    if (!module) {
      console.error(`[ERROR] Required module '${name}' is missing`);
      allRequired = false;
    }
  }

  // Firebase 리더보드 초기화 시도
  if (window.leaderboardFirebase && typeof window.leaderboardFirebase.initFirebase === 'function') {
    console.log('[DEBUG] Initializing Firebase leaderboard...');
    try {
      window.leaderboardFirebase.initFirebase();
    } catch (e) {
      console.error('[ERROR] Failed to initialize Firebase leaderboard:', e);
    }
  }

  // 비필수 모듈 확인 및 경고
  if (!window.gameLeaderboard) {
    console.warn('[WARNING] gameLeaderboard 모듈이 없어 순위표 기능이 제한될 수 있습니다.');
  }

  if (!window.gameDB) {
    console.warn('[WARNING] gameDB 모듈이 없어 점수 저장 기능이 제한될 수 있습니다.');
  }

  // 초기 언어 설정
  const savedLanguage = localStorage.getItem('selected_language') || 'ko';
  window.gameTranslations.changeLanguage(savedLanguage);
  
  // UI 초기화
  window.gameUI.initUI();
  
  // 이벤트 리스너 설정
  window.gameUI.setupLanguageEvents();
  window.gameCore.setupGameEvents();
  
  // gameLeaderboard 모듈이 있을 때만 관련 함수 호출
  if (window.gameLeaderboard) {
    console.log('[DEBUG] Setting up leaderboard events and initializing leaderboard');
    try {
      window.gameLeaderboard.setupLeaderboardEvents();
      window.gameLeaderboard.initLeaderboard();
    } catch (error) {
      console.error('[ERROR] Error initializing leaderboard:', error);
      console.warn('[WARNING] Game will continue without leaderboard functionality');
    }
  } else {
    console.warn('[WARNING] Leaderboard module not available, continuing without leaderboard functionality');
  }
  
  console.log('모든 게임 모듈이 초기화되었습니다.');
});
