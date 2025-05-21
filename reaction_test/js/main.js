/**
 * main.js - 모든 모듈을 초기화하고 연결하는 메인 진입점
 */

// 페이지 로드 완료 시 실행
function initializeApp() {
  console.log('앱 초기화 시작...');
  
  // 모듈 로드 상태 로그
  console.log('모듈 로드 상태:', {
    translations: !!window.gameTranslations,
    leaderboard: !!window.gameLeaderboard,
    core: !!window.gameCore,
    ui: !!window.gameUI
  });
  
  // 각 모듈 존재 여부 확인
  if (!window.gameTranslations || !window.gameLeaderboard || !window.gameCore || !window.gameUI) {
    console.error('필요한 모듈이 로드되지 않았습니다. 새로고침해보세요.');
    // 5초 후 자동으로 새로 고침
    setTimeout(() => {
      console.log('필요한 모듈이 로드되지 않아 자동으로 새로고침합니다.');
      //location.reload();
    }, 5000);
    return;
  }
  
  // 이벤트 리스너 설정 (가장 먼저 설정)
  window.gameUI.setupLanguageEvents();
  
  // UI 초기화
  window.gameUI.initUI();
  
  // 초기 언어 설정 (UI 초기화 후에 설정)
  const savedLanguage = localStorage.getItem('selected_language') || 'en'; // 기본값을 영어로 설정
  window.gameTranslations.changeLanguage(savedLanguage);
  
  // UI 업데이트
  window.gameUI.updateLanguageButtons();
  
  // DOM 참조 초기화
  if (window.gameCore.initDomReferences) {
    console.log('DOM 참조 초기화 시작...');
    window.gameCore.initDomReferences();
  }
  
  // 게임 및 리더보드 이벤트 설정
  window.gameCore.setupGameEvents();
  window.gameLeaderboard.setupLeaderboardEvents();
  
  // 순위표 초기화 및 표시
  window.gameLeaderboard.initLeaderboard();
  
  console.log('모든 게임 모듈이 초기화되었습니다.');
}

// DOM이 완전히 로드되면 앱 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM이 이미 로드된 경우 즉시 초기화
  setTimeout(initializeApp, 0);
}
