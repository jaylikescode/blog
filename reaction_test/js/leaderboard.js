/**
 * leaderboard.js - Firebase 기반 리더보드 관리 모듈
 * 
 * 이전 GitHub Gist 관련 기능들은 제거되었습니다.
 * 모든 리더보드 관련 기능은 이제 Firebase를 통해 처리됩니다.
 */

// 스토리지 방법 상수
const STORAGE_METHOD = {
  LOCALSTORAGE: 'localstorage',
  FIREBASE: 'firebase'
};

// Firebase를 기본 저장소로 사용
let primaryStorageMethod = STORAGE_METHOD.FIREBASE;
let fallbackStorageMethod = STORAGE_METHOD.LOCALSTORAGE;

// 스토리지 관련 상수
const LEADERBOARD_KEY = 'reaction_game_leaderboard';

// 순위표 관련 상수와 변수
const visibleRecords = 20; // 초기 표시 기록 수
const maxLeaderboardRank = 100; // 최대 순위 수
let isMoreRecordsVisible = false; // 추가 기록 표시 여부
let leaderboardCache = []; // 캐시된 리더보드 데이터
let currentUserId = null;

// Firebase로 마이그레이션됨
let hasAttemptedMigration = false; // 첫 로드 시 데이터 마이그레이션 여부

// 모듈 내보내기
window.gameLeaderboard = {
  addScoreToLeaderboard,
  displayLeaderboard,
  setupLeaderboardEvents,
  initLeaderboard,
  getCurrentUserId: () => currentUserId,
  exportLeaderboard: () => window.gameDB ? window.gameDB.exportLeaderboard() : null,
  importLeaderboard: (file) => window.gameDB ? window.gameDB.importLeaderboard(file) : null,
  
  // Firebase로 마이그레이션하면서 토큰 관련 기능 제거
  
  // 저장소 타입 설정
  setStorageMethod: (method) => {
    if (method === 'firebase') {
      primaryStorageMethod = STORAGE_METHOD.FIREBASE;
      console.log('Storage method set to Firebase');
      return true;
    } else if (method === 'localstorage') {
      primaryStorageMethod = STORAGE_METHOD.LOCALSTORAGE;
      console.log('Storage method set to localStorage');
      return true;
    }
    return false;
  }
};

// Firebase로 마이그레이션하면서 GitHub Gist 및 토큰 관련 기능을 제거함
// 기본 저장소 방식을 Firebase로 설정
window.gameLeaderboard.setStorageMethod(STORAGE_METHOD.FIREBASE);

// Firebase 사용 시작
if (window.firebaseHandler) {
  console.log('Firebase Realtime Database 초기화 완료');
}