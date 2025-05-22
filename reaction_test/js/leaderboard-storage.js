/**
 * leaderboard-storage.js - 로컬 스토리지 관리 (localStorage, IndexedDB)
 */

// 스토리지 관련 상수
const LEADERBOARD_KEY = 'reaction_game_leaderboard';
const LEADERBOARD_LAST_SYNC_KEY = 'reaction_game_last_sync';

/**
 * 로컬 스토리지에서 순위표 데이터 가져오기
 * @return {Array} 순위표 레코드 배열
 */
function getLeaderboardFromStorage() {
  try {
    // localStorage에서 먼저 시도
    const dataStr = localStorage.getItem(LEADERBOARD_KEY);
    if (dataStr) {
      return JSON.parse(dataStr);
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
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
    return true;
  } catch (e) {
    console.error('Error saving to localStorage:', e);
    return false;
  }
}

/**
 * 순위표 데이터 불러오기 (Firebase, GitHub Gist, IndexedDB 또는 localStorage 사용)
 * @param {Function} callback 데이터를 받아 처리할 콜백 함수
 */
function fetchLeaderboard(callback) {
  // 캐시된 데이터가 있으면 빠르게 반환
  if (leaderboardCache && leaderboardCache.length > 0) {
    callback(leaderboardCache);
  }
  
  // 스토리지 타입에 따라 적절한 방법으로 불러오기
  switch (primaryStorageMethod) {
    case STORAGE_METHOD.FIREBASE:
      // Firebase에서 데이터 가져오기 (비동기)
      if (window.leaderboardFirebase && window.leaderboardFirebase.fetchFromFirebase) {
        window.leaderboardFirebase.fetchFromFirebase()
          .then(firebaseData => {
            if (firebaseData && firebaseData.length > 0) {
              // 로컬 데이터와 병합
              const localData = getLeaderboardFromStorage();
              const mergedData = window.leaderboardFirebase.mergeLeaderboardData(localData, firebaseData);
              
              // 캐시 및 저장
              leaderboardCache = mergedData;
              saveLeaderboardToStorage(mergedData);
              callback(mergedData);
            } else {
              // Firebase 데이터가 없으면 로컬 데이터 사용
              fetchFromLocalStorage();
            }
          })
          .catch(error => {
            console.error("Error fetching from Firebase:", error);
            fetchFromLocalStorage();
          });
      } else {
        // Firebase 모듈이 로드되지 않았으면 로컬 스토리지 사용
        fetchFromLocalStorage();
      }
      break;
      
    case STORAGE_METHOD.GIST:
      // Gist에서 데이터 가져오기 (비동기)
      if (window.leaderboardGist && window.leaderboardGist.fetchFromGist) {
        window.leaderboardGist.fetchFromGist()
          .then(gistData => {
            if (gistData && gistData.length > 0) {
              // 로컬 데이터와 병합
              const localData = getLeaderboardFromStorage();
              const mergedData = mergeLeaderboardData(localData, gistData);
              
              // 캐시 및 저장
              leaderboardCache = mergedData;
              saveLeaderboardToStorage(mergedData);
              callback(mergedData);
            } else {
              // Gist 데이터가 없으면 로컬 데이터 사용
              fetchFromLocalStorage();
            }
          })
          .catch(error => {
            console.error("Error fetching from Gist:", error);
            fetchFromLocalStorage();
          });
      } else {
        // Gist 모듈이 로드되지 않았으면 로컬 스토리지 사용
        fetchFromLocalStorage();
      }
      break;
    
    case STORAGE_METHOD.INDEXEDDB:
      // IndexedDB에서 데이터 가져오기
      if (window.gameDB && window.gameDB.getLeaderboard) {
        window.gameDB.getLeaderboard(data => {
          leaderboardCache = data;
          callback(data);
        });
      } else {
        fetchFromLocalStorage();
      }
      break;
    
    case STORAGE_METHOD.LOCALSTORAGE:
    default:
      // localStorage에서 데이터 가져오기
      fetchFromLocalStorage();
      break;
  }
  
  // localStorage에서 데이터 가져오는 내부 함수
  function fetchFromLocalStorage() {
    const data = getLeaderboardFromStorage();
    leaderboardCache = data;
    callback(data);
  }
}

/**
 * 새 점수 저장 (Firebase, GitHub Gist, IndexedDB 또는 localStorage)
 * @param {Object} record 저장할 레코드 객체
 * @param {Function} callback 저장 후 호출할 콜백 함수
 */
function saveRecord(record, callback) {
  // 먼저 로컬에 저장
  getLeaderboardFromStorage()
    .then(currentData => {
      // 기존 데이터 없으면 빈 배열 사용
      if (!Array.isArray(currentData)) {
        currentData = [];
      }
      
      // 새 기록 추가
      currentData.push(record);
      
      // 점수 기준 정렬 (낮은 값이 더 좋음 - 반응 속도가 빠른 것)
      currentData.sort((a, b) => a.score - b.score);
      
      // 최대 개수 제한
      if (currentData.length > maxLeaderboardRank) {
        currentData = currentData.slice(0, maxLeaderboardRank);
      }
      
      // 캐시 업데이트
      leaderboardCache = currentData;
      
      // 스토리지 타입에 따라 적절한 방법으로 저장
      switch (primaryStorageMethod) {
        case STORAGE_METHOD.FIREBASE:
          // 로컬에 먼저 저장
          saveLeaderboardToStorage(currentData);
          
          // Firebase에 동기화
          if (window.leaderboardFirebase && window.leaderboardFirebase.addRecord) {
            window.leaderboardFirebase.addRecord(record)
              .then(() => {
                callback(true);
              })
              .catch(error => {
                console.error("Error saving to Firebase:", error);
                callback(true); // 로컬 저장은 성공했으므로 true 반환
              });
          } else {
            callback(true);
          }
          break;
          
        case STORAGE_METHOD.GIST:
          // 로컬에 먼저 저장
          saveLeaderboardToStorage(currentData);
          
          // GitHub Gist에 동기화
          if (window.leaderboardGist && window.leaderboardGist.saveToGist) {
            window.leaderboardGist.saveToGist(currentData)
              .then(() => {
                callback(true);
              })
              .catch(error => {
                console.error("Error saving to Gist:", error);
                callback(true); // 로컬 저장은 성공했으므로 true 반환
              });
          } else {
            callback(true);
          }
          break;
        
        case STORAGE_METHOD.INDEXEDDB:
          // IndexedDB에 저장
          if (window.gameDB && window.gameDB.saveLeaderboard) {
            window.gameDB.saveLeaderboard(currentData, success => {
              callback(success);
            });
          } else {
            saveToLocalStorage(currentData, callback);
          }
          break;
        
        case STORAGE_METHOD.LOCALSTORAGE:
        default:
          // localStorage에 저장
          saveToLocalStorage(currentData, callback);
          break;
      }
    })
    .catch(error => {
      console.error('Error getting current leaderboard:', error);
      callback(false);
    });
  
  // localStorage에 저장하는 내부 함수
  function saveToLocalStorage(data, cb) {
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data));
      
      // 순위표 화면 업데이트
      displayLeaderboard(isMoreRecordsVisible, data);
      
      cb(true);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      cb(false);
    }
  }
}

/**
 * 모듈 초기화
 */
function initLeaderboardStorage() {
  // Firebase 초기화 확인
  if (window.leaderboardFirebase && window.leaderboardFirebase.initFirebase) {
    window.leaderboardFirebase.initFirebase()
      .then(success => {
        console.log('Firebase initialized:', success ? 'success' : 'failed');
      })
      .catch(error => {
        console.error('Firebase initialization error:', error);
        // Firebase 초기화 실패 시 localStorage로 가는 여유 작업
        if (primaryStorageMethod === STORAGE_METHOD.FIREBASE) {
          console.log('Falling back to localStorage');
          primaryStorageMethod = STORAGE_METHOD.LOCALSTORAGE;
        }
      });
  } else {
    // Firebase 모듈이 없으면 localStorage로 대체
    if (primaryStorageMethod === STORAGE_METHOD.FIREBASE) {
      console.log('Firebase module not available, falling back to localStorage');
      primaryStorageMethod = STORAGE_METHOD.LOCALSTORAGE;
    }
  }
  
  // IndexedDB 지원 여부 확인하고 필요시 fallback 설정
  if (window.gameDB && window.gameDB.isIndexedDBSupported()) {
    console.log('IndexedDB is supported');
  } else {
    console.log('IndexedDB is not supported, falling back to localStorage');
    if (primaryStorageMethod === STORAGE_METHOD.INDEXEDDB) {
      primaryStorageMethod = STORAGE_METHOD.LOCALSTORAGE;
    }
  }
}
