/**
 * leaderboard.js - 순위표 관리 모듈 (Firebase 사용)
 */

// Firebase 초기화
const firebaseConfig = {
  // Firebase 프로젝트 설정 - 실제 프로젝트에서는 이 값을 실제 Firebase 설정으로 변경해야 합니다
  apiKey: "AIzaSyDpxbVnXPSrcr1NYwkLa-qLJM-6UkHx_1Y",
  authDomain: "reaction-test-leaderboard-demo.firebaseapp.com",
  databaseURL: "https://reaction-test-leaderboard-demo-default-rtdb.firebaseio.com",
  projectId: "reaction-test-leaderboard-demo",
  storageBucket: "reaction-test-leaderboard-demo.appspot.com",
  messagingSenderId: "763485269092",
  appId: "1:763485269092:web:bda7e32efadddb4fc83efb"
};

// Firebase 앱 초기화 에러 처리
// 한 번만 초기화하고 에러 발생 시 로컬 스토리지 사용 대체 모드 활성화
let isFirebaseInitialized = false;
let useFallbackMode = false;

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    isFirebaseInitialized = true;
    console.log('Firebase initialized successfully');
  } else {
    isFirebaseInitialized = true;
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  useFallbackMode = true;
  alert(window.gameTranslations.getText('firebase-error') || 'Failed to connect to leaderboard service. Local storage will be used instead.');
}

// Firebase 데이터베이스 참조 (필요할 때만 초기화)
let db;
let leaderboardRef;

// 로컬스토리지 관련 상수
const LEADERBOARD_KEY = 'reaction_game_leaderboard';

// 순위표 관련 상수와 변수
const visibleRecords = 20; // 초기 표시 기록 수
const maxLeaderboardRank = 100; // 최대 순위 수
let isMoreRecordsVisible = false; // 추가 기록 표시 여부

// 현재 사용자 관련 변수
let currentUserId = null;
let leaderboardCache = []; // 캐시된 리더보드 데이터

/**
 * 로컬 스토리지에서 순위표 데이터 가져오기
 * @return {Array} 순위표 레코드 배열
 */
function getLeaderboardFromStorage() {
  const leaderboardData = localStorage.getItem(LEADERBOARD_KEY);
  if (leaderboardData) {
    try {
      return JSON.parse(leaderboardData);
    } catch (e) {
      console.error('Error parsing leaderboard data:', e);
      return [];
    }
  }
  return [];
}

/**
 * 로컬 스토리지에 순위표 데이터 저장
 * @param {Array} leaderboard 순위표 레코드 배열
 */
function saveLeaderboardToStorage(leaderboard) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  } catch (e) {
    console.error('Error saving leaderboard data:', e);
  }
}

/**
 * 순위표 데이터 불러오기 (자동으로 Firebase 또는 localStorage 사용)
 * @param {Function} callback 데이터를 받아 처리할 콜백 함수
 */
function fetchLeaderboardFromFirebase(callback) {
  // 로딩 표시
  const loadingEl = document.getElementById('leaderboard-loading');
  if (loadingEl) loadingEl.classList.remove('hidden');

  // 폴백 모드가 활성화되어 있으면 localStorage 사용
  if (useFallbackMode) {
    setTimeout(() => {
      if (loadingEl) loadingEl.classList.add('hidden');
      const leaderboard = getLeaderboardFromStorage();
      leaderboardCache = leaderboard;
      if (callback) callback(leaderboard);
    }, 300);
    return;
  }
  
  // Firebase 초기화 안 되어 있으면 초기화
  if (!isFirebaseInitialized && !useFallbackMode) {
    try {
      db = firebase.database();
      leaderboardRef = db.ref('leaderboard');
      isFirebaseInitialized = true;
    } catch (error) {
      console.error('Error initializing Firebase database:', error);
      useFallbackMode = true;
      // 로컬스토리지로 대체
      setTimeout(() => {
        if (loadingEl) loadingEl.classList.add('hidden');
        const leaderboard = getLeaderboardFromStorage();
        leaderboardCache = leaderboard;
        if (callback) callback(leaderboard);
      }, 300);
      return;
    }
  }

  // Firebase에서 데이터 가져오기 (점수 오름차순으로 정렬)
  try {
    leaderboardRef.orderByChild('score')
      .limitToFirst(maxLeaderboardRank)
      .once('value')
      .then((snapshot) => {
        // 로딩 종료
        if (loadingEl) loadingEl.classList.add('hidden');
        
        const data = snapshot.val() || {};
        const leaderboard = Object.values(data);
        
        // 점수순 정렬 (오름차순)
        leaderboard.sort((a, b) => a.score - b.score);
        
        // 캐시 업데이트
        leaderboardCache = leaderboard;
        
        // 저장된 데이터를 로컬에도 백업 저장
        saveLeaderboardToStorage(leaderboard);
        
        // 콜백 호출
        if (callback) callback(leaderboard);
      })
      .catch((error) => {
        console.error('Error fetching leaderboard from Firebase:', error);
        // Firebase 실패 시 로컬스토리지로 대체
        if (loadingEl) loadingEl.classList.add('hidden');
        const leaderboard = getLeaderboardFromStorage();
        leaderboardCache = leaderboard;
        if (callback) callback(leaderboard);
      });
  } catch (error) {
    console.error('Exception while fetching from Firebase:', error);
    // 예외 발생 시 로컬스토리지로 대체
    if (loadingEl) loadingEl.classList.add('hidden');
    const leaderboard = getLeaderboardFromStorage();
    leaderboardCache = leaderboard;
    if (callback) callback(leaderboard);
  }
}

/**
 * 새 점수 저장 (Firebase 또는 localStorage)
 * @param {Object} record 저장할 레코드 객체
 * @param {Function} callback 저장 후 호출할 콜백 함수
 */
function saveRecordToFirebase(record, callback) {
  // 폴백 모드가 활성화되어 있으면 localStorage에 저장
  if (useFallbackMode) {
    try {
      // 현재 순위표 가져오기
      let leaderboard = getLeaderboardFromStorage();
      
      // 순위표에 추가
      leaderboard.push(record);
      
      // 점수순으로 정렬 (오름차순)
      leaderboard.sort((a, b) => a.score - b.score);
      
      // 최대 기록 수 제한
      if (leaderboard.length > maxLeaderboardRank) {
        leaderboard = leaderboard.slice(0, maxLeaderboardRank);
      }
      
      // 로컬 스토리지에 저장
      saveLeaderboardToStorage(leaderboard);
      
      // 캐시 업데이트
      leaderboardCache = leaderboard;
      
      // 콜백 호출 (성공)
      if (callback) callback(true);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      if (callback) callback(false);
    }
    return;
  }
  
  // Firebase 초기화 필요 시 초기화
  if (!isFirebaseInitialized && !useFallbackMode) {
    try {
      db = firebase.database();
      leaderboardRef = db.ref('leaderboard');
      isFirebaseInitialized = true;
    } catch (error) {
      console.error('Error initializing Firebase database for save:', error);
      useFallbackMode = true;
      // 로컬스토리지로 저장 시도
      saveRecordToFirebase(record, callback);
      return;
    }
  }

  try {
    // Firebase에 새 레코드 추가 (고유 키로 저장)
    const newRecordRef = leaderboardRef.push();
    
    newRecordRef.set(record)
      .then(() => {
        // 성공적으로 Firebase에 저장했으니, 로컬스토리지에도 백업
        try {
          let leaderboard = getLeaderboardFromStorage();
          leaderboard.push(record);
          leaderboard.sort((a, b) => a.score - b.score);
          if (leaderboard.length > maxLeaderboardRank) {
            leaderboard = leaderboard.slice(0, maxLeaderboardRank);
          }
          saveLeaderboardToStorage(leaderboard);
        } catch (e) {
          console.error('Error backing up to localStorage:', e);
        }
        
        if (callback) callback(true);
      })
      .catch((error) => {
        console.error('Error saving record to Firebase:', error);
        
        // Firebase 저장 실패 시 로컬스토리지로 대체
        try {
          let leaderboard = getLeaderboardFromStorage();
          leaderboard.push(record);
          leaderboard.sort((a, b) => a.score - b.score);
          if (leaderboard.length > maxLeaderboardRank) {
            leaderboard = leaderboard.slice(0, maxLeaderboardRank);
          }
          saveLeaderboardToStorage(leaderboard);
          leaderboardCache = leaderboard;
          if (callback) callback(true);
        } catch (e) {
          console.error('Error saving to localStorage fallback:', e);
          if (callback) callback(false);
        }
      });
  } catch (error) {
    console.error('Exception during Firebase save:', error);
    
    // 예외 발생 시 로컬스토리지로 대체
    try {
      let leaderboard = getLeaderboardFromStorage();
      leaderboard.push(record);
      leaderboard.sort((a, b) => a.score - b.score);
      if (leaderboard.length > maxLeaderboardRank) {
        leaderboard = leaderboard.slice(0, maxLeaderboardRank);
      }
      saveLeaderboardToStorage(leaderboard);
      leaderboardCache = leaderboard;
      if (callback) callback(true);
    } catch (e) {
      console.error('Error saving to localStorage fallback:', e);
      if (callback) callback(false);
    }
  }
}

/**
 * 새로운 점수를 순위표에 추가하는 함수
 * @param {string} playerName 플레이어 이름
 * @param {number} score 반응 속도 점수(ms)
 * @return {Promise<number>} 새로 추가된 기록의 순위 (1부터 시작)
 */
function addScoreToLeaderboard(playerName, score) {
  return new Promise((resolve) => {
    // 새로운 사용자 ID 생성
    const userId = generateUserId();
    currentUserId = userId;
    
    // 새 기록 생성
    const newRecord = {
      player_name: playerName || window.gameTranslations.getText('anonymous'),
      score: score,
      datetime: new Date().toISOString(),
      user_id: userId
    };
    
    // Firebase에 저장
    saveRecordToFirebase(newRecord, () => {
      // 순위표 다시 불러오기
      fetchLeaderboardFromFirebase((leaderboard) => {
        // 현재 사용자의 순위 찾기
        const rank = leaderboard.findIndex(record => record.user_id === userId) + 1;
        
        // 순위표 갱신
        displayLeaderboard(false, leaderboard);
        
        resolve(rank);
      });
    });
  });
}

/**
 * 순위표 화면에 표시하는 함수
 * @param {boolean} showMore 추가 기록 표시 여부
 * @param {Array} leaderboardData 선택적으로 사용할 순위표 데이터
 */
function displayLeaderboard(showMore = false, leaderboardData = null) {
  // 표시할 데이터 결정 (전달된 데이터가 없으면 캐시 사용)
  const leaderboard = leaderboardData || leaderboardCache;
  
  // 출력할 기록 수 결정
  const recordsToShow = showMore ? maxLeaderboardRank : visibleRecords;
  isMoreRecordsVisible = showMore;
  
  // 테이블 본체 요소 가져오기
  const leaderboardBody = document.getElementById('leaderboard-body');
  const showMoreBtn = document.getElementById('show-more-btn');
  
  if (!leaderboardBody) return; // 요소가 없으면 종료
  
  // 테이블 본체 초기화
  leaderboardBody.innerHTML = '';
  
  if (leaderboard.length === 0) {
    // 데이터 없음 메시지
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `<td colspan="4">${window.gameTranslations.getText('no-records')}</td>`;
    leaderboardBody.appendChild(emptyRow);
    if (showMoreBtn) showMoreBtn.style.display = 'none';
    return;
  }
  
  // 표시할 레코드 수 결정
  const recordsCount = Math.min(recordsToShow, leaderboard.length);
  
  // 더 보기 버튼 상태 결정
  if (showMoreBtn) {
    if (leaderboard.length > visibleRecords && !showMore) {
      showMoreBtn.style.display = 'block';
    } else {
      showMoreBtn.style.display = 'none';
    }
  }
  
  // 기록 출력
  for (let i = 0; i < recordsCount; i++) {
    const record = leaderboard[i];
    const rank = i + 1;
    
    const row = document.createElement('tr');
    
    // 현재 사용자 기록인지 확인
    const isCurrentUser = currentUserId && record.user_id === currentUserId;
    
    // 상위 3등은 특별하게 표시
    if (rank <= 3) {
      row.classList.add('top-three');
      if (rank === 1) row.classList.add('first-place');
      else if (rank === 2) row.classList.add('second-place');
      else if (rank === 3) row.classList.add('third-place');
    }
    
    // 현재 사용자 기록은 특별하게 표시
    if (isCurrentUser) {
      row.classList.add('current-user-score');
    }
    
    // 날짜 포맷팅
    const recordDate = new Date(record.datetime);
    const formattedDate = recordDate.toLocaleDateString() + ' ' + 
                          recordDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 플레이어 이름 표시 (현재 플레이어라면 색상 강조)
    const playerNameDisplay = isCurrentUser ? 
      `<span class="current-user-name">${record.player_name}</span>` : 
      `<span>${record.player_name}</span>`;
    
    // 행 내용 생성
    row.innerHTML = `
      <td>${rank}</td>
      <td>${playerNameDisplay}</td>
      <td>${record.score}${window.gameTranslations.getText('ms')}</td>
      <td>${formattedDate}</td>
    `;
    
    leaderboardBody.appendChild(row);
  }
}

/**
 * 사용자 ID 생성 함수
 * @return {string} 새 사용자 ID
 */
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 순위표 관련 이벤트 설정
 */
function setupLeaderboardEvents() {
  const showMoreBtn = document.getElementById('show-more-btn');
  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', () => {
      displayLeaderboard(true);
    });
  }
}

/**
 * 모듈 초기화
 */
function initLeaderboard() {
  // 초기 데이터 로드 및 표시
  fetchLeaderboardFromFirebase((data) => {
    displayLeaderboard(false, data);
  });
  
  // Firebase가 초기화되었고 대체 모드가 아닌 경우에만 실시간 업데이트 설정
  if (isFirebaseInitialized && !useFallbackMode) {
    try {
      // 데이터 실시간 업데이트 감지
      leaderboardRef.on('child_added', () => {
        fetchLeaderboardFromFirebase((data) => {
          displayLeaderboard(isMoreRecordsVisible, data);
        });
      });
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
    }
  }
}

// 모듈 내보내기
window.gameLeaderboard = {
  addScoreToLeaderboard,
  displayLeaderboard,
  setupLeaderboardEvents,
  initLeaderboard,
  getCurrentUserId: () => currentUserId
};
