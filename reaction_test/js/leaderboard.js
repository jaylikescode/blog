/**
 * leaderboard.js - Firebase 기반 리더보드 관리 모듈
 * 
 * 이전 GitHub Gist 관련 기능들은 제거되었습니다.
 * 모든 리더보드 관련 기능은 이제 Firebase를 통해 처리됩니다.
 */

// Firebase 저장소 상수 추가 (기존 STORAGE_METHOD는 leaderboard-core.js에 이미 정의됨)
// STORAGE_METHOD 객체에 FIREBASE 옵션 추가
if (!STORAGE_METHOD.FIREBASE) {
  STORAGE_METHOD.FIREBASE = 'firebase';
}

// Firebase를 기본 저장소로 사용 (변수는 leaderboard-core.js에 이미 선언됨)
// 전역 변수 사용 - 중복 선언 방지
if (typeof primaryStorageMethod !== 'undefined') {
  primaryStorageMethod = STORAGE_METHOD.FIREBASE;
}
if (typeof fallbackStorageMethod !== 'undefined') {
  fallbackStorageMethod = STORAGE_METHOD.LOCALSTORAGE;
}

// 스토리지 관련 상수는 leaderboard-storage.js에서 이미 정의됨
// 순위표 관련 상수와 변수는 leaderboard-core.js에서 정의됨
// 여기에서는 그 변수들을 사용만 함

// 추가 순위표 관련 상수 - leaderboard-core.js에서 정의된 값 사용
// 중복 선언 방지를 위해 새로 선언하지 않음

// Firebase로 마이그레이션됨
let hasAttemptedMigration = false; // 첫 로드 시 데이터 마이그레이션 여부

/**
 * 새로운 점수를 순위표에 추가하는 함수
 * @param {string} playerName 플레이어 이름
 * @param {number} score 반응 속도 점수(ms)
 * @return {Promise<number>} 새로 추가된 기록의 순위 (1부터 시작)
 */
function addScoreToLeaderboard(playerName, score) {
  return new Promise((resolve, reject) => {
    if (score <= 0) {
      reject(new Error('Invalid score'));
      return;
    }
    
    // 이름 없으면 기본값 사용
    if (!playerName || playerName.trim() === '') {
      playerName = '익명';
    }
    
    // 새 기록 객체 생성
    const now = new Date();
    const record = {
      id: `${currentUserId || generateUserId()}_${now.getTime()}`,
      playerName: playerName.trim(),
      score: score,
      timestamp: now.getTime(),
      date: now.toISOString().split('T')[0]
    };
    
    // 기록 저장
    saveRecord(record, (success) => {
      if (success) {
        // 현재 저장된 리더보드에서 순위 찾기
        const rank = leaderboardCache.findIndex(r => r.id === record.id) + 1;
        resolve(rank > 0 ? rank : null);
      } else {
        reject(new Error('Failed to save record'));
      }
    });
  });
}

/**
 * 순위표 화면에 표시하는 함수
 * @param {boolean} showMore 추가 기록 표시 여부
 * @param {Array} leaderboardData 선택적으로 사용할 순위표 데이터
 */
function displayLeaderboard(showMore = false, leaderboardData = null) {
  // 표시 상태 업데이트
  isMoreRecordsVisible = showMore;
  
  // 테이블 요소 가져오기
  const leaderboardBody = document.getElementById('leaderboard-body');
  if (!leaderboardBody) return;
  
  // 데이터 선택 (전달받은 데이터 또는 캐시된 데이터)
  const data = leaderboardData || leaderboardCache;
  if (!data || data.length === 0) {
    leaderboardBody.innerHTML = '<tr><td colspan="4" class="no-records">No records yet</td></tr>';
    return;
  }
  
  // 사용할 데이터를 캐시
  leaderboardCache = data;
  
  // 표시할 개수 결정
  const displayCount = showMore ? maxLeaderboardRank : visibleRecords;
  const recordsToDisplay = data.slice(0, displayCount);
  
  // 테이블 내용 생성
  leaderboardBody.innerHTML = '';
  
  recordsToDisplay.forEach((record, index) => {
    const row = document.createElement('tr');
    
    // 현재 사용자의 기록인지 확인
    const isCurrentUser = record.id && record.id.startsWith(currentUserId);
    if (isCurrentUser) {
      row.className = 'current-user';
    }
    
    // 순위
    const rankCell = document.createElement('td');
    rankCell.textContent = (index + 1);
    row.appendChild(rankCell);
    
    // 이름
    const nameCell = document.createElement('td');
    nameCell.textContent = record.playerName;
    row.appendChild(nameCell);
    
    // 점수
    const scoreCell = document.createElement('td');
    scoreCell.textContent = record.score + 'ms';
    row.appendChild(scoreCell);
    
    // 날짜
    const dateCell = document.createElement('td');
    dateCell.textContent = record.date || '-';
    row.appendChild(dateCell);
    
    leaderboardBody.appendChild(row);
  });
  
  // 더 보기/접기 버튼 텍스트 업데이트
  updateShowMoreButton(showMore);
}

/**
 * 더 보기/접기 버튼 텍스트 업데이트
 * @param {boolean} showMore 현재 표시 상태
 */
function updateShowMoreButton(showMore) {
  const showMoreBtn = document.getElementById('show-more-btn');
  if (showMoreBtn) {
    // 다국어 지원
    if (window.gameTranslations) {
      const btnText = window.gameTranslations.getText(showMore ? 'show-less' : 'show-more');
      showMoreBtn.textContent = btnText;
    } else {
      showMoreBtn.textContent = showMore ? '접기' : '더 보기';
    }
  }
}

/**
 * 순위표 관련 이벤트 설정
 */
function setupLeaderboardEvents() {
  // 더 보기/접기 버튼 이벤트
  const showMoreBtn = document.getElementById('show-more-btn');
  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', () => {
      displayLeaderboard(!isMoreRecordsVisible);
    });
  }
}

/**
 * 모듈 초기화
 */
function initLeaderboard() {
  console.log('Initializing leaderboard module...');
  
  // 사용자 ID 설정 (없으면 새로 생성)
  try {
    currentUserId = localStorage.getItem('reaction_game_user_id');
    if (!currentUserId) {
      currentUserId = generateUserId();
      localStorage.setItem('reaction_game_user_id', currentUserId);
    }
  } catch (e) {
    console.error('Error managing user ID:', e);
    currentUserId = generateUserId();
  }
  
  // Firebase 익명 인증 상태 확인
  if (window.leaderboardFirebase && window.leaderboardFirebase.initFirebase) {
    console.log('Firebase 익명 인증 상태 확인 중...');
    if (window.leaderboardFirebase.initFirebase()) {
      console.log('Firebase 익명 인증 상태: 로그인됨');
    } else {
      console.log('Firebase 익명 인증 상태: 로그인되지 않음, 자동 로그인 시도');
      // Firebase 익명 인증은 initFirebase 함수 내에서 처리됩니다.
      console.log('[DEBUG] Firebase 인증 시도');
    }
  }
  
  // 초기 데이터 로드 및 표시
  fetchLeaderboard(data => {
    console.log('Leaderboard data loaded successfully');
    displayLeaderboard(false, data);
  });
}

/**
 * 리더보드 데이터 가져오기
 * @param {Function} callback 데이터 로드 후 호출될 콜백
 */
function fetchLeaderboard(callback) {
  // Firebase 사용 시 Firebase에서 데이터 가져오기
  if (primaryStorageMethod === STORAGE_METHOD.FIREBASE && window.leaderboardFirebase) {
    console.log('Fetching leaderboard from Firebase...');
    window.leaderboardFirebase.fetchFromFirebase()
      .then(data => {
        callback(data);
      })
      .catch(error => {
        console.error('Error fetching from Firebase:', error);
        fetchFromLocalStorage(callback);
      });
  } else {
    // Firebase가 아닌 경우 로컬 저장소에서 가져오기
    fetchFromLocalStorage(callback);
  }
}

/**
 * 로컬 저장소에서 리더보드 데이터 가져오기
 * @param {Function} callback 데이터 로드 후 호출될 콜백
 */
function fetchFromLocalStorage(callback) {
  console.log('Fetching leaderboard from localStorage...');
  try {
    const storedData = localStorage.getItem(LEADERBOARD_KEY);
    if (storedData) {
      const data = JSON.parse(storedData);
      callback(data);
    } else {
      callback([]);
    }
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    callback([]);
  }
}

/**
 * 기록 저장
 * @param {Object} record 저장할 기록 객체
 * @param {Function} callback 저장 완료 후 호출될 콜백
 */
function saveRecord(record, callback) {
  // 현재 리더보드 가져오기
  fetchLeaderboard(currentData => {
    // 새 기록 추가
    currentData.push(record);
    
    // 점수 기준 정렬 (낮은 값이 더 좋음 - 반응 속도가 빠른 것)
    currentData.sort((a, b) => a.score - b.score);
    
    // 최대 순위 수로 제한
    const trimmedData = currentData.slice(0, maxLeaderboardRank);
    
    // 캐시 업데이트
    leaderboardCache = trimmedData;
    
    // Firebase에 저장
    if (primaryStorageMethod === STORAGE_METHOD.FIREBASE && window.leaderboardFirebase) {
      console.log('Saving record to Firebase...');
      window.leaderboardFirebase.addRecord(record)
        .then(() => {
          saveToLocalStorage(trimmedData);
          callback(true);
        })
        .catch(error => {
          console.error('Error saving to Firebase:', error);
          saveToLocalStorage(trimmedData);
          callback(true);
        });
    } else {
      // Firebase가 아닌 경우 로컬 저장소에 저장
      saveToLocalStorage(trimmedData);
      callback(true);
    }
  });
}

/**
 * 로컬 저장소에 리더보드 데이터 저장
 * @param {Array} data 저장할 리더보드 데이터
 */
function saveToLocalStorage(data) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data));
    console.log('Data saved to localStorage');
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

/**
 * 사용자 ID 생성 함수
 * @return {string} 새 사용자 ID
 */
function generateUserId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

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
console.log('[DEBUG] Firebase check: window.leaderboardFirebase =', !!window.leaderboardFirebase);
if (window.leaderboardFirebase) {
  console.log('Firebase Realtime Database 초기화 완료');
} else {
  console.error('[ERROR] leaderboardFirebase 모듈을 찾을 수 없습니다.');
}