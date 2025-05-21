/**
 * main.js - 모든 모듈을 초기화하고 연결하는 메인 진입점
 */

// Firebase 초기화 함수
function initializeFirebaseForApp() {
  // firebase-secrets.js에서 가져온 초기화 함수가 있는지 확인
  if (typeof window.initializeFirebase === 'function') {
    console.log('Firebase 초기화 중...');
    try {
      // Firebase 초기화
      const firebaseInstance = window.initializeFirebase();
      
      if (firebaseInstance.isInitialized) {
        console.log('Firebase가 성공적으로 초기화되었습니다.');
      } else {
        console.warn('Firebase 초기화 실패, 로컬 스토리지 사용 모드로 전환합니다.');
      }
      
      return firebaseInstance.isInitialized;
    } catch (error) {
      console.error('Firebase 초기화 중 오류 발생:', error);
      return false;
    }
  } else {
    console.warn('Firebase 초기화 함수를 찾을 수 없습니다. firebase-config.js가 제대로 로드되었는지 확인하세요.');
    return false;
  }
}

// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
  // 각 모듈 존재 여부 확인
  if (!window.gameTranslations || !window.gameLeaderboard || !window.gameCore || !window.gameUI) {
    console.error('필요한 모듈이 로드되지 않았습니다.');
    return;
  }
  
  // Firebase 초기화
  initializeFirebaseForApp();
  
  // 초기 언어 설정
  const savedLanguage = localStorage.getItem('selected_language') || 'ko';
  window.gameTranslations.changeLanguage(savedLanguage);
  
  // UI 초기화
  window.gameUI.initUI();
  
  // 이벤트 리스너 설정
  window.gameUI.setupLanguageEvents();
  window.gameCore.setupGameEvents();
  window.gameLeaderboard.setupLeaderboardEvents();
  
  // 순위표 초기화 및 표시
  window.gameLeaderboard.initLeaderboard();
  
  console.log('모든 게임 모듈이 초기화되었습니다.');
});
