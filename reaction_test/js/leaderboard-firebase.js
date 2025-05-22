/**
 * leaderboard-firebase.js - Firebase Realtime Database 동기화 기능
 */

// 기존 ES6 모듈 형식에서 일반 스크립트 형식으로 변경

console.log('[DEBUG] leaderboard-firebase.js 초기화 시작');

// Firebase SDK가 이미 로드되었는지 확인
if (typeof window.firebase === 'undefined') {
  console.error('[ERROR] Firebase SDK not loaded yet! Make sure Firebase scripts are loaded first.');
  // Firebase가 로드되지 않은 경우 기본 객체 생성
  window.leaderboardFirebase = {
    init: function() { console.error('[ERROR] Firebase not initialized'); return false; },
    fetchLeaderboard: function() { return []; },
    saveLeaderboard: function() { return false; },
    isAvailable: function() { return false; }
  };
}

// Firebase 레퍼런스 - database는 firebase-config.js에서 설정됨
let leaderboardRef;

// Firebase 초기화 확인
try {
  if (typeof firebase !== 'undefined' && firebase && firebase.database) {
    leaderboardRef = firebase.database().ref('leaderboard');
    console.log('[DEBUG] Firebase leaderboard reference created successfully');
  } else {
    console.error('[ERROR] Firebase database not available');
  }
} catch (error) {
  console.error('[ERROR] Firebase initialization error:', error);
}

// 동기화 상태 변수
let syncInProgress = false;
let pendingChanges = false;

// 이미 전역 변수로 존재하는 변수들은 중복 선언하지 않고 사용
// leaderboardCache, currentUserId, isMoreRecordsVisible는 이미 leaderboard-core.js에서 정의됨

/**
 * Firebase에서 리더보드 데이터 가져오기
 * @return {Promise<Array>} 리더보드 데이터 배열
 */
async function fetchLeaderboardFromFirebase() {
  console.log('[DEBUG] Fetching leaderboard from Firebase');
  try {
    if (!leaderboardRef) {
      console.error('[ERROR] Firebase leaderboard reference not initialized');
      return [];
    }
    
    return new Promise((resolve, reject) => {
      leaderboardRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
          console.log('[DEBUG] No leaderboard data in Firebase');
          resolve([]);
          return;
        }
        
        // 데이터베이스에서 가져온 객체를 배열로 변환
        const data = snapshot.val();
        console.log('[DEBUG] Firebase data retrieved:', data ? 'success' : 'empty');
        const leaderboardArray = Array.isArray(data) ? data : Object.values(data);
        
        // 점수 기준으로 정렬
        leaderboardArray.sort((a, b) => a.score - b.score);
        
        resolve(leaderboardArray);
      }, (error) => {
        console.error('[ERROR] Error fetching from Firebase:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('[ERROR] Exception in fetchLeaderboardFromFirebase:', error);
    return [];
  }
}

/**
 * 리더보드 데이터를 Firebase에 저장
 * @param {Array} leaderboard 리더보드 데이터 배열
 * @return {Promise<boolean>} 성공 여부
 */
async function saveLeaderboardToFirebase(leaderboard) {
  console.log('[DEBUG] Saving leaderboard to Firebase');
  if (syncInProgress) {
    console.log('[DEBUG] Sync already in progress, queuing changes');
    pendingChanges = true;
    return false;
  }
  
  if (!leaderboardRef) {
    console.error('[ERROR] Firebase leaderboard reference not initialized');
    return false;
  }
  
  syncInProgress = true;
  
  try {
    // 익명 인증 확인
    await ensureAnonymousAuth();
    
    // 데이터 저장
    return new Promise((resolve, reject) => {
      leaderboardRef.set(leaderboard, (error) => {
        syncInProgress = false;
        
        if (error) {
          console.error('[ERROR] Error saving to Firebase:', error);
          reject(error);
          return;
        }
        
        console.log('[DEBUG] Leaderboard saved to Firebase successfully');
        
        // 대기 중인 변경 사항 처리
        if (pendingChanges) {
          pendingChanges = false;
          console.log('[DEBUG] Processing pending changes');
          setTimeout(() => saveLeaderboardToFirebase(leaderboard), 0);
        }
        
        resolve(true);
      });
    });
  } catch (error) {
    syncInProgress = false;
    console.error('[ERROR] Exception in saveLeaderboardToFirebase:', error);
    return false;
  }
}

/**
 * 익명 인증 상태 확인 및 필요시 인증 수행
 */
async function ensureAnonymousAuth() {
  console.log('[DEBUG] Checking anonymous auth state');
  if (!currentUserId) {
    try {
      if (firebase && firebase.auth) {
        const userCredential = await firebase.auth().signInAnonymously();
        if (userCredential.user) {
          currentUserId = userCredential.user.uid;
          console.log('[DEBUG] Anonymous sign-in successful', currentUserId);
        }
      } else {
        console.error('[ERROR] Firebase auth not available');
      }
    } catch (error) {
      console.error('[ERROR] Anonymous sign-in error:', error);
    }
  }
  return currentUserId;
}

/**
 * 리더보드 데이터 병합
 * @param {Array} localData 로컬 리더보드 데이터
 * @param {Array} remoteData 원격 리더보드 데이터
 * @return {Array} 병합된 리더보드 데이터
 */
function mergeLeaderboardData(localData, remoteData) {
  // 두 배열을 합치고 고유한 항목만 유지
  const combined = [...localData];
  
  remoteData.forEach(remoteItem => {
    const existingIndex = combined.findIndex(
      localItem => localItem.name === remoteItem.name && 
                  localItem.date === remoteItem.date
    );
    
    if (existingIndex === -1) {
      // 새 항목 추가
      combined.push(remoteItem);
    } else if (remoteItem.score < combined[existingIndex].score) {
      // 더 좋은 점수로 업데이트 (반응 속도는 낮을수록 좋음)
      combined[existingIndex] = remoteItem;
    }
  });
  
  // 점수로 정렬 (반응 속도는 낮을수록 좋음)
  combined.sort((a, b) => a.score - b.score);
  
  // 최대 개수만 유지
  return combined.slice(0, 100); // 상위 100개 기록만 유지
}

/**
 * 리더보드 데이터 Firebase와 동기화
 */
async function syncWithFirebase() {
  console.log('[DEBUG] Starting Firebase sync');
  
  if (!leaderboardRef) {
    console.error('[ERROR] Firebase reference not initialized');
    return false;
  }
  
  try {
    // Firebase에서 데이터 가져오기
    const firebaseData = await fetchLeaderboardFromFirebase();
    console.log('[DEBUG] Firebase data fetched', firebaseData ? firebaseData.length : 0, 'records');
    
    if (!firebaseData || firebaseData.length === 0) {
      // Firebase에 데이터가 없으면 현재 데이터 업로드
      console.log('[DEBUG] No data found in Firebase, uploading current data');
      if (leaderboardCache && leaderboardCache.length > 0) {
        console.log('[DEBUG] Uploading cached data to Firebase:', leaderboardCache.length, 'records');
        await saveLeaderboardToFirebase(leaderboardCache);
      } else {
        console.log('[DEBUG] No cached data to upload');
      }
    } else {
      // 데이터가 있으면 병합
      console.log('[DEBUG] Merging Firebase data with local cache');
      const mergedData = mergeLeaderboardData(leaderboardCache || [], firebaseData);
      leaderboardCache = mergedData;
      
      // 업데이트된 데이터를 Firebase에 저장
      console.log('[DEBUG] Saving merged data back to Firebase');
      await saveLeaderboardToFirebase(mergedData);
      
      // 디스플레이 업데이트 (외부 함수 호출)
      if (window.displayLeaderboard) {
        console.log('[DEBUG] Updating leaderboard display');
        window.displayLeaderboard(isMoreRecordsVisible, mergedData);
      } else {
        console.log('[DEBUG] displayLeaderboard function not available');
      }
    }
    
    console.log('[DEBUG] Firebase sync completed successfully');
    return true;
  } catch (error) {
    console.error('[ERROR] Firebase sync failed:', error);
    return false;
  }
}

/**
 * 새 기록 추가
 * @param {Object} record 새 기록 객체 {name, score, date}
 */
async function addRecord(record) {
  try {
    // 현재 리더보드 가져오기
    const currentLeaderboard = await fetchLeaderboardFromFirebase();
    
    // 새 기록 추가
    const updatedLeaderboard = [...currentLeaderboard, record];
    
    // 점수로 정렬 (반응 속도는 낮을수록 좋음)
    updatedLeaderboard.sort((a, b) => a.score - b.score);
    
    // 최대 개수만 유지
    const trimmedLeaderboard = updatedLeaderboard.slice(0, 100);
    
    // Firebase에 저장
    await saveLeaderboardToFirebase(trimmedLeaderboard);
    
    // 캐시 업데이트
    leaderboardCache = trimmedLeaderboard;
    
    return true;
  } catch (error) {
    console.error('Error adding record:', error);
    return false;
  }
}

/**
 * Firebase 실시간 리스너 설정
 * 다른 사용자가 리더보드를 업데이트할 때 자동으로 UI 업데이트
 */
function setupFirebaseListeners() {
  console.log('[DEBUG] Setting up Firebase realtime listeners');
  
  if (!leaderboardRef) {
    console.error('[ERROR] Cannot setup Firebase listeners - reference not initialized');
    return;
  }
  
  leaderboardRef.on('value', (snapshot) => {
    console.log('[DEBUG] Firebase realtime update received');
    if (syncInProgress) {
      console.log('[DEBUG] Ignoring Firebase update during sync');
      return; // 동기화 중이면 무시
    }
    
    const data = snapshot.val();
    if (!data) {
      console.log('[DEBUG] No data in Firebase update');
      return;
    }
    
    // 데이터베이스에서 가져온 객체를 배열로 변환
    const leaderboardArray = Array.isArray(data) ? data : Object.values(data);
    console.log('[DEBUG] Firebase update processed', leaderboardArray.length, 'records');
    
    // 점수로 정렬
    leaderboardArray.sort((a, b) => a.score - b.score);
    
    // 캠시 업데이트
    leaderboardCache = leaderboardArray;
    
    // UI 업데이트
    if (window.displayLeaderboard) {
      window.displayLeaderboard(isMoreRecordsVisible, leaderboardArray);
      console.log('[DEBUG] Leaderboard UI updated from Firebase realtime event');
    } else {
      console.log('[DEBUG] displayLeaderboard function not available');
    }
  }, (error) => {
    console.error('[ERROR] Firebase listener error:', error);
  });
}

/**
 * 초기화 함수
 */
async function initFirebaseLeaderboard() {
  console.log('[DEBUG] Initializing Firebase leaderboard module');
  try {
    if (!firebase || !firebase.database || !leaderboardRef) {
      console.error('[ERROR] Firebase is not properly initialized');
      return false;
    }
    
    // 익명 인증
    const user = await ensureAnonymousAuth();
    console.log('[DEBUG] Firebase auth state:', user ? 'authenticated' : 'not authenticated');
    
    // 실시간 리스너 설정
    setupFirebaseListeners();
    
    // 초기 데이터 로드
    try {
      await syncWithFirebase();
      console.log('[DEBUG] Initial Firebase sync completed');
    } catch (syncError) {
      console.error('[ERROR] Initial Firebase sync failed:', syncError);
      // 싱크에 실패해도 초기화는 계속 진행
    }
    
    console.log('[DEBUG] Firebase leaderboard module initialized successfully');
    return true;
  } catch (error) {
    console.error('[ERROR] Firebase initialization failed:', error);
    return false;
  }
}

// 모듈 내보내기 - 이미 모듈이 설정되어 있는지 확인
if (!window.leaderboardFirebase) {
  window.leaderboardFirebase = {
    // 이 파일에 정의된 함수 이름과 정확하게 일치시킴
    fetchFromFirebase: fetchLeaderboardFromFirebase,
    saveToFirebase: saveLeaderboardToFirebase,
    syncWithFirebase: syncWithFirebase,
    addRecord: addRecord,
    initFirebase: initFirebaseLeaderboard,
    mergeLeaderboardData: mergeLeaderboardData,
    isAvailable: function() { 
      return typeof firebase !== 'undefined' && !!firebase && !!firebase.database; 
    }
  };
  
  // 디버그 로그
  console.log('[DEBUG] leaderboardFirebase 모듈 초기화 완료');
} else {
  console.log('[DEBUG] leaderboardFirebase 모듈이 이미 존재합니다');
}
