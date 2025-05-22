/**
 * leaderboard-core.js - 순위표 기본 기능 (UI 및 데이터 관리)
 */

// 저장소 관련 옵션
const STORAGE_METHOD = {
  INDEXEDDB: 'indexeddb',
  LOCALSTORAGE: 'localstorage',
  FIREBASE: 'firebase' // Gist에서 Firebase로 변경
};

// 기본적으로 Firebase 사용, 그레도 부족하면 다른 저장소 사용
let primaryStorageMethod = STORAGE_METHOD.FIREBASE;
let fallbackStorageMethod = STORAGE_METHOD.LOCALSTORAGE;

// IndexedDB 지원 여부 확인
let indexedDBSupported = window.gameDB && window.gameDB.isIndexedDBSupported();
if (!indexedDBSupported) {
  fallbackStorageMethod = STORAGE_METHOD.LOCALSTORAGE;
}

// 순위표 관련 상수와 변수
const visibleRecords = 20; // 초기 표시 기록 수
const maxLeaderboardRank = 100; // 최대 순위 수
let isMoreRecordsVisible = false; // 추가 기록 표시 여부

// 현재 사용자 관련 변수
let currentUserId = null;
let leaderboardCache = []; // 캐시된 리더보드 데이터

/**
 * 리더보드 데이터 합치기 (Firebase와 로컬 데이터 병합)
 * @param {Array} localData 로컬 데이터
 * @param {Array} firebaseData Firebase 데이터
 * @return {Array} 병합된 데이터
 */
function mergeLeaderboardData(localData, firebaseData) {
  // 모든 레코드를 합치고 중복 제거
  const allRecords = [...localData, ...firebaseData];
  
  // 중복 제거를 위한 맵 (ID 기준)
  const recordMap = new Map();
  
  // 중복 제거 및 최신 기록 유지
  allRecords.forEach(record => {
    const existingRecord = recordMap.get(record.id);
    
    // 기존 기록이 없거나, 현재 기록이 더 최신이면 업데이트
    if (!existingRecord || record.timestamp > existingRecord.timestamp) {
      recordMap.set(record.id, record);
    }
  });
  
  // 맵에서 배열로 변환
  const mergedData = Array.from(recordMap.values());
  
  // 점수 기준 정렬 (낮은 값이 더 좋음 - 반응 속도가 빠른 것)
  mergedData.sort((a, b) => a.score - b.score);
  
  return mergedData;
}

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
  // 캐시된 데이터가 없으면 빠른 반환
  if (!leaderboardData && (!leaderboardCache || leaderboardCache.length === 0)) {
    return;
  }
  
  // 표시 상태 업데이트
  isMoreRecordsVisible = showMore;
  
  // 테이블 요소 가져오기
  const leaderboardBody = document.getElementById('leaderboard-body');
  if (!leaderboardBody) return;
  
  // 데이터 선택 (전달받은 데이터 또는 캐시된 데이터)
  const data = leaderboardData || leaderboardCache;
  
  // 표시할 개수 결정
  const displayCount = showMore ? maxLeaderboardRank : visibleRecords;
  const recordsToDisplay = data.slice(0, displayCount);
  
  // 테이블 내용 비우기
  leaderboardBody.innerHTML = '';
  
  // 기록이 없으면 안내 메시지 표시
  if (recordsToDisplay.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.setAttribute('colspan', '4');
    td.classList.add('no-records');
    
    // 다국어 지원
    const noRecordsText = window.gameTranslations ? 
      window.gameTranslations.getText('no-records') : '아직 기록이 없습니다!';
    
    td.textContent = noRecordsText;
    tr.appendChild(td);
    leaderboardBody.appendChild(tr);
    return;
  }
  
  // 순위표 테이블 채우기
  recordsToDisplay.forEach((record, index) => {
    const tr = document.createElement('tr');
    
    // 현재 사용자의 기록은 강조 표시
    if (record.id && record.id.startsWith(currentUserId)) {
      tr.classList.add('current-user');
    }
    
    // 순위
    const rankTd = document.createElement('td');
    rankTd.textContent = (index + 1).toString();
    tr.appendChild(rankTd);
    
    // 이름
    const nameTd = document.createElement('td');
    nameTd.textContent = record.playerName;
    tr.appendChild(nameTd);
    
    // 점수
    const scoreTd = document.createElement('td');
    scoreTd.textContent = `${record.score}ms`;
    tr.appendChild(scoreTd);
    
    // 날짜
    const dateTd = document.createElement('td');
    dateTd.textContent = record.date;
    tr.appendChild(dateTd);
    
    // 테이블에 행 추가
    leaderboardBody.appendChild(tr);
  });
  
  // 더 보기/접기 버튼 상태 업데이트
  const showMoreBtn = document.getElementById('show-more-btn');
  if (showMoreBtn) {
    if (data.length <= visibleRecords) {
      showMoreBtn.style.display = 'none';
    } else {
      showMoreBtn.style.display = 'block';
      
      // 다국어 지원
      if (window.gameTranslations) {
        const btnText = showMore ? 
          window.gameTranslations.getText('show-less') : 
          window.gameTranslations.getText('show-more');
        
        showMoreBtn.textContent = btnText;
      } else {
        showMoreBtn.textContent = showMore ? '접기' : '더 보기';
      }
    }
  }
}

/**
 * 내보내기/가져오기 버튼 추가
 */
function addExportImportButtons() {
  const leaderboardPanel = document.querySelector('.leaderboard-panel');
  if (!leaderboardPanel) return;
  
  // 버튼 컨테이너
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'export-import-container';
  
  // 내보내기 버튼
  const exportBtn = document.createElement('button');
  exportBtn.className = 'export-btn';
  
  // 다국어 지원
  if (window.gameTranslations) {
    exportBtn.textContent = window.gameTranslations.getText('export');
  } else {
    exportBtn.textContent = '내보내기';
  }
  
  exportBtn.addEventListener('click', () => {
    // IndexedDB 또는 localStorage에 저장된 데이터 내보내기
    const exportData = JSON.stringify(leaderboardCache);
    
    // 다운로드 링크 생성
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    a.href = url;
    a.download = `reaction-game-leaderboard-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    
    // 정리
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  });
  
  // 가져오기 버튼
  const importBtn = document.createElement('button');
  importBtn.className = 'import-btn';
  
  // 다국어 지원
  if (window.gameTranslations) {
    importBtn.textContent = window.gameTranslations.getText('import');
  } else {
    importBtn.textContent = '가져오기';
  }
  
  importBtn.addEventListener('click', () => {
    // 파일 선택기 생성
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    
    // 파일 선택 이벤트
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
              // IndexedDB 또는 localStorage에 저장
              if (window.gameLeaderboard) {
                window.gameLeaderboard.importLeaderboard(importedData);
              }
            }
          } catch (error) {
            console.error('Failed to parse imported data:', error);
          }
        };
        
        reader.readAsText(file);
      }
    };
    
    // 가져오기 버튼 클릭 시 파일 선택 대화상자 표시
    fileInput.click();
  });
  
  // 버튼 추가
  buttonContainer.appendChild(exportBtn);
  buttonContainer.appendChild(importBtn);
  
  // 레이아웃에 버튼 추가
  leaderboardPanel.appendChild(buttonContainer);
}

/**
 * 사용자 ID 생성 함수
 * @return {string} 새 사용자 ID
 */
function generateUserId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
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
function initLeaderboardCore() {
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
  
  // 내보내기/가져오기 버튼 추가
  addExportImportButtons();
  
  // 이벤트 설정
  setupLeaderboardEvents();
}
