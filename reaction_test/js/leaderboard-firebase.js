/**
 * leaderboard-firebase.js - Firebase Realtime Database 동기화 기능
 */

import { database, signInAnonymous } from './firebase-config.js';
import { ref, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Firebase 레퍼런스
const leaderboardRef = ref(database, 'leaderboard');

// 동기화 상태 변수
let syncInProgress = false;
let pendingChanges = false;
let leaderboardCache = [];
let currentUserId = null;
let isMoreRecordsVisible = false;

/**
 * Firebase에서 리더보드 데이터 가져오기
 * @return {Promise<Array>} 리더보드 데이터 배열
 */
export async function fetchLeaderboardFromFirebase() {
  try {
    const snapshot = await get(leaderboardRef);
    if (!snapshot.exists()) {
      return [];
    }
    
    // 데이터베이스에서 가져온 객체를 배열로 변환
    const data = snapshot.val();
    const leaderboardArray = Array.isArray(data) ? data : Object.values(data);
    
    // 점수 기준으로 정렬
    leaderboardArray.sort((a, b) => a.score - b.score);
    
    return leaderboardArray;
  } catch (error) {
    console.error('Error fetching from Firebase:', error);
    return [];
  }
}

/**
 * 리더보드 데이터를 Firebase에 저장
 * @param {Array} leaderboard 리더보드 데이터 배열
 * @return {Promise<boolean>} 성공 여부
 */
export async function saveLeaderboardToFirebase(leaderboard) {
  if (syncInProgress) {
    pendingChanges = true;
    return false;
  }
  
  syncInProgress = true;
  
  try {
    // 익명 인증 확인
    await ensureAnonymousAuth();
    
    // 데이터 저장
    await set(leaderboardRef, leaderboard);
    
    syncInProgress = false;
    console.log('Leaderboard saved to Firebase successfully');
    
    // 대기 중인 변경 사항 처리
    if (pendingChanges) {
      pendingChanges = false;
      setTimeout(() => saveLeaderboardToFirebase(leaderboard), 0);
    }
    
    return true;
  } catch (error) {
    syncInProgress = false;
    console.error('Error saving to Firebase:', error);
    return false;
  }
}

/**
 * 익명 인증 상태 확인 및 필요시 인증 수행
 */
async function ensureAnonymousAuth() {
  if (!currentUserId) {
    const user = await signInAnonymous();
    if (user) {
      currentUserId = user.uid;
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
export function mergeLeaderboardData(localData, remoteData) {
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
export async function syncWithFirebase() {
  try {
    // Firebase에서 데이터 가져오기
    const firebaseData = await fetchLeaderboardFromFirebase();
    
    if (!firebaseData || firebaseData.length === 0) {
      // Firebase에 데이터가 없으면 현재 데이터 업로드
      console.log('No data found in Firebase, uploading current data');
      if (leaderboardCache.length > 0) {
        await saveLeaderboardToFirebase(leaderboardCache);
      }
    } else {
      // 데이터가 있으면 병합
      const mergedData = mergeLeaderboardData(leaderboardCache, firebaseData);
      leaderboardCache = mergedData;
      
      // 업데이트된 데이터를 Firebase에 저장
      await saveLeaderboardToFirebase(mergedData);
      
      // 디스플레이 업데이트 (외부 함수 호출)
      if (window.displayLeaderboard) {
        window.displayLeaderboard(isMoreRecordsVisible, mergedData);
      }
    }
    
    console.log('Firebase sync completed successfully');
    return true;
  } catch (error) {
    console.error('Firebase sync failed:', error);
    return false;
  }
}

/**
 * 새 기록 추가
 * @param {Object} record 새 기록 객체 {name, score, date}
 */
export async function addRecord(record) {
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
export function setupFirebaseListeners() {
  onValue(leaderboardRef, (snapshot) => {
    if (syncInProgress) return; // 동기화 중이면 무시
    
    const data = snapshot.val();
    if (!data) return;
    
    // 데이터베이스에서 가져온 객체를 배열로 변환
    const leaderboardArray = Array.isArray(data) ? data : Object.values(data);
    
    // 점수로 정렬
    leaderboardArray.sort((a, b) => a.score - b.score);
    
    // 캐시 업데이트
    leaderboardCache = leaderboardArray;
    
    // UI 업데이트
    if (window.displayLeaderboard) {
      window.displayLeaderboard(isMoreRecordsVisible, leaderboardArray);
    }
    
    console.log('Leaderboard updated from Firebase realtime event');
  });
}

/**
 * 초기화 함수
 */
export async function initFirebaseLeaderboard() {
  try {
    // 익명 인증
    await ensureAnonymousAuth();
    
    // 실시간 리스너 설정
    setupFirebaseListeners();
    
    // 초기 데이터 로드
    await syncWithFirebase();
    
    console.log('Firebase leaderboard module initialized');
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return false;
  }
}

// 전역 객체에 기능 노출
window.leaderboardFirebase = {
  fetchFromFirebase: fetchLeaderboardFromFirebase,
  saveToFirebase: saveLeaderboardToFirebase,
  syncWithFirebase: syncWithFirebase,
  addRecord: addRecord,
  initFirebase: initFirebaseLeaderboard
};
