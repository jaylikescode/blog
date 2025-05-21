/**
 * db.js - 로컬 데이터베이스 관리 모듈 (IndexedDB 사용)
 */

// IndexedDB 상수
const DB_NAME = 'ReactionGameDB';
const DB_VERSION = 1;
const STORE_NAME = 'leaderboard';

// IndexedDB 초기화
function initLeaderboardDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // leaderboard 객체 저장소 생성
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'user_id' });
        store.createIndex('by_score', 'score', { unique: false });
        console.log('IndexedDB store created successfully');
      }
    };
    
    request.onsuccess = (event) => {
      console.log('IndexedDB initialized successfully');
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      console.error('IndexedDB 초기화 실패:', event.target.errorCode);
      reject('IndexedDB 초기화 실패: ' + event.target.errorCode);
    };
  });
}

/**
 * 데이터 저장
 * @param {Object} record 저장할 레코드 객체
 * @returns {Promise<boolean>} 저장 성공 여부
 */
function saveRecord(record) {
  return new Promise((resolve, reject) => {
    initLeaderboardDB().then(db => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      const request = store.put(record);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Record save error:', event.target.error);
        reject(event.target.error);
      };
      
      tx.oncomplete = () => {
        db.close();
      };
    }).catch(error => {
      console.error('Database transaction error:', error);
      reject(error);
    });
  });
}

/**
 * 순위표 데이터 검색
 * @returns {Promise<Array>} 점수순으로 정렬된 레코드 배열
 */
function fetchLeaderboard() {
  return new Promise((resolve, reject) => {
    initLeaderboardDB().then(db => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('by_score');
      const request = index.getAll();
      
      request.onsuccess = () => {
        // 점수별 오름차순 정렬 (낮은 점수가 더 좋음)
        const result = request.result.sort((a, b) => a.score - b.score);
        // 상위 100개만 유지
        const limitedResult = result.slice(0, 100);
        resolve(limitedResult);
      };
      
      request.onerror = (event) => {
        console.error('Leaderboard fetch error:', event.target.error);
        reject(event.target.error);
      };
      
      tx.oncomplete = () => {
        db.close();
      };
    }).catch(error => {
      console.error('Database transaction error:', error);
      reject(error);
    });
  });
}

/**
 * 파일로 순위표 내보내기
 */
function exportLeaderboard() {
  return fetchLeaderboard().then(data => {
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reaction_game_leaderboard.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  });
}

/**
 * 파일에서 순위표 가져오기
 * @param {File} file 가져올 JSON 파일
 * @returns {Promise<boolean>} 가져오기 성공 여부
 */
function importLeaderboard(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // 유효성 검사 - 배열인지 확인
        if (!Array.isArray(data)) {
          reject('유효하지 않은 리더보드 데이터 형식');
          return;
        }
        
        // 가져온 데이터 저장
        initLeaderboardDB().then(db => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          
          // 기존 데이터 삭제
          store.clear();
          
          // 새 데이터 추가
          let completed = 0;
          data.forEach(record => {
            // 필수 필드가 있는지 확인
            if (record.player_name && record.score && record.datetime && record.user_id) {
              const request = store.put(record);
              request.onsuccess = () => {
                completed++;
                if (completed === data.length) {
                  resolve(true);
                }
              };
              request.onerror = (event) => {
                console.error('Record import error:', event.target.error);
              };
            }
          });
          
          tx.oncomplete = () => {
            db.close();
            resolve(true);
          };
          
          tx.onerror = (event) => {
            reject('가져오기 중 오류 발생: ' + event.target.error);
          };
        });
      } catch (e) {
        reject('유효하지 않은 JSON 형식: ' + e.message);
      }
    };
    
    reader.onerror = () => {
      reject('파일 읽기 오류');
    };
    
    reader.readAsText(file);
  });
}

/**
 * Firebase에서 데이터 마이그레이션
 * @param {Array} firebaseData Firebase에서 가져온 데이터
 * @returns {Promise<boolean>} 마이그레이션 성공 여부
 */
function migrateFromFirebase(firebaseData) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(firebaseData) || firebaseData.length === 0) {
      resolve(false);
      return;
    }
    
    initLeaderboardDB().then(db => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      let completed = 0;
      firebaseData.forEach(record => {
        const request = store.put(record);
        request.onsuccess = () => {
          completed++;
          if (completed === firebaseData.length) {
            console.log('Firebase data migration completed');
          }
        };
      });
      
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      
      tx.onerror = (event) => {
        reject('마이그레이션 중 오류 발생: ' + event.target.error);
      };
    }).catch(error => {
      reject(error);
    });
  });
}

// IndexedDB 지원 여부 확인
function isIndexedDBSupported() {
  return 'indexedDB' in window;
}

// 모듈 내보내기
window.gameDB = {
  initLeaderboardDB,
  saveRecord,
  fetchLeaderboard,
  exportLeaderboard,
  importLeaderboard,
  migrateFromFirebase,
  isIndexedDBSupported,
};
