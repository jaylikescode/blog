/**
 * main.js - 모든 모듈을 초기화하고 연결하는 메인 진입점
 */

// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
  // 각 모듈 존재 여부 확인
  if (!window.gameTranslations || !window.gameLeaderboard || !window.gameCore || !window.gameUI) {
    console.error('필요한 모듈이 로드되지 않았습니다.');
    return;
  }
  
  // UI 초기화
  window.gameUI.initUI();
  
  // 초기 언어 설정 (UI 초기화 후에 설정)
  const savedLanguage = localStorage.getItem('selected_language') || 'ko';
  window.gameTranslations.changeLanguage(savedLanguage);
  
  // UI 업데이트
  window.gameUI.updateLanguageButtons();
  
  // 이벤트 리스너 설정
  window.gameUI.setupLanguageEvents();
  window.gameCore.setupGameEvents();
  window.gameLeaderboard.setupLeaderboardEvents();
  
  // 순위표 초기화 및 표시
  window.gameLeaderboard.initLeaderboard();
  
  console.log('모든 게임 모듈이 초기화되었습니다.');
});
