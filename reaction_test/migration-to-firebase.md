# Reaction Game: GitHub Gist에서 Firebase Realtime Database로 마이그레이션 계획

## 개요

이 문서는 반응 속도 게임(Reaction Game)의 리더보드 시스템을 GitHub Gist에서 Firebase Realtime Database로 마이그레이션하는 계획을 설명합니다. 이 마이그레이션은 모든 사용자가 개별 인증 없이도 전역 리더보드에 접근하고 업데이트할 수 있도록 하는 것을 목표로 합니다.

## 현재 시스템의 문제점

현재 GitHub Gist 기반 리더보드 시스템의 주요 문제점:

1. GitHub API는 쓰기 작업을 위해 항상 인증 토큰을 요구함
2. 토큰을 클라이언트 코드에 포함하면 보안 위험이 발생하고 GitHub 푸시 보호 규칙에 위배됨
3. 각 사용자가 개별 토큰을 제공하는 것은 사용자 경험 측면에서 비실용적임

## Firebase Realtime Database 장점

Firebase Realtime Database는 다음과 같은 장점을 제공합니다:

1. 익명 인증을 통해 개별 사용자 인증 없이도 데이터 읽기/쓰기 가능
2. 실시간 데이터 동기화 지원으로 여러 사용자 간 즉각적인 리더보드 업데이트
3. 클라이언트 측 JavaScript SDK로 간단한 통합
4. 무료 티어로 시작 가능하며 사용량에 따라 확장 가능
5. 데이터 보안 규칙으로 무단 액세스 방지 가능

## 마이그레이션 단계

### 1. Firebase 프로젝트 설정

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Realtime Database 서비스 활성화
3. 보안 규칙 설정 (초기에는 테스트 모드로 시작 가능)
4. 웹 앱 등록 및 Firebase 구성 정보 획득

### 2. 프로젝트에 Firebase SDK 추가

```html
<!-- Firebase SDK 추가 -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js"></script>

<!-- Firebase 초기화 스크립트 -->
<script src="js/firebase-config.js"></script>
```

`firebase-config.js` 파일 생성:

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBdKiejBgTitVGFaZeNSnoh5ueQ134Uz3Y",
  authDomain: "reaction-speed-test-e27db.firebaseapp.com",
  projectId: "reaction-speed-test-e27db",
  storageBucket: "reaction-speed-test-e27db.firebasestorage.app",
  messagingSenderId: "190376860464",
  appId: "1:190376860464:web:25233ce11804d4e2b146f5",
  measurementId: "G-0W1GHK01FM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
databaseURL="https://reaction-speed-test-e27db-default-rtdb.firebaseio.com"
```

### 3. 새로운 Firebase 리더보드 모듈 생성

새로운 `leaderboard-firebase.js` 모듈을 생성하여 Firebase Realtime Database와 상호 작용하는 기능 구현:

```javascript
/**
 * leaderboard-firebase.js - Firebase Realtime Database 동기화 기능
 */

// Firebase 레퍼런스
const db = firebase.database();
const leaderboardRef = db.ref('leaderboard');
let currentUserRef = null;

// 동기화 상태 변수
let syncInProgress = false;
let pendingChanges = false;

/**
 * Firebase에서 리더보드 데이터 가져오기
 * @return {Promise<Array>} 리더보드 데이터 배열
 */
function fetchLeaderboardFromFirebase() {
  return new Promise((resolve, reject) => {
    leaderboardRef.once('value')
      .then(snapshot => {
        const data = snapshot.val();
        if (!data) {
          resolve([]);
          return;
        }
        
        // 객체를 배열로 변환
        const leaderboardArray = Object.values(data);
        resolve(leaderboardArray);
      })
      .catch(error => {
        console.error('Error fetching from Firebase:', error);
        resolve([]);
      });
  });
}

/**
 * 리더보드 데이터를 Firebase에 저장
 * @param {Array} leaderboard 리더보드 데이터 배열
 * @return {Promise<boolean>} 성공 여부
 */
function saveLeaderboardToFirebase(leaderboard) {
  return new Promise((resolve, reject) => {
    if (syncInProgress) {
      pendingChanges = true;
      resolve(false);
      return;
    }
    
    syncInProgress = true;
    
    // 익명 인증 사용
    ensureAnonymousAuth()
      .then(() => {
        // 리더보드 데이터 객체 생성 (각 항목에 고유 ID 할당)
        const leaderboardData = {};
        leaderboard.forEach((item, index) => {
          // ID가 없으면 타임스탬프 기반 ID 생성
          const itemId = item.id || `entry_${Date.now()}_${index}`;
          item.id = itemId;
          leaderboardData[itemId] = item;
        });
        
        // Firebase에 데이터 저장
        return leaderboardRef.set(leaderboardData);
      })
      .then(() => {
        syncInProgress = false;
        console.log('Leaderboard saved to Firebase successfully');
        
        // 대기 중인 변경 사항 있으면 다시 실행
        if (pendingChanges) {
          pendingChanges = false;
          // 다음 틱에서 처리하여 재귀 호출 방지
          setTimeout(() => saveLeaderboardToFirebase(leaderboard), 0);
        }
        
        resolve(true);
      })
      .catch(error => {
        syncInProgress = false;
        console.error('Error saving to Firebase:', error);
        resolve(false);
      });
  });
}

/**
 * 익명 인증 상태 확인 및 필요시 인증 수행
 * @return {Promise} 인증 완료 프라미스
 */
function ensureAnonymousAuth() {
  return new Promise((resolve, reject) => {
    if (firebase.auth().currentUser) {
      resolve();
      return;
    }
    
    firebase.auth().signInAnonymously()
      .then(userCredential => {
        console.log('Anonymous auth successful');
        resolve();
      })
      .catch(error => {
        console.error('Anonymous auth failed:', error);
        reject(error);
      });
  });
}

/**
 * 리더보드 데이터 Firebase와 동기화
 * @return {Promise<boolean>} 성공 여부
 */
function syncWithFirebase() {
  return new Promise((resolve, reject) => {
    fetchLeaderboardFromFirebase()
      .then(firebaseData => {
        if (!firebaseData || firebaseData.length === 0) {
          // Firebase에 데이터가 없으면 현재 데이터 업로드
          console.log('No data found in Firebase, uploading current data');
          return saveLeaderboardToFirebase(leaderboardCache);
        } else {
          // 데이터가 있으면 병합
          const mergedData = mergeLeaderboardData(leaderboardCache, firebaseData);
          leaderboardCache = mergedData;
          
          // 새로 디스플레이
          if (typeof displayLeaderboard === 'function') {
            displayLeaderboard(isMoreRecordsVisible, mergedData);
          }
          
          // 업데이트된 데이터를 Firebase에 저장
          return saveLeaderboardToFirebase(mergedData);
        }
      })
      .then(success => {
        console.log('Firebase sync completed ' + (success ? 'successfully' : 'with issues'));
        resolve(true);
      })
      .catch(error => {
        console.error('Firebase sync failed:', error);
        resolve(false);
      });
  });
}

/**
 * Firebase 실시간 리스너 설정
 * 다른 사용자가 리더보드를 업데이트할 때 자동으로 UI 업데이트
 */
function setupFirebaseListeners() {
  leaderboardRef.on('value', snapshot => {
    const data = snapshot.val();
    if (!data) return;
    
    // 동기화 중이 아닐 때만 업데이트 (자체 변경사항 무시)
    if (!syncInProgress) {
      const leaderboardArray = Object.values(data);
      leaderboardCache = leaderboardArray;
      
      // UI 업데이트
      if (typeof displayLeaderboard === 'function') {
        displayLeaderboard(isMoreRecordsVisible, leaderboardArray);
      }
      
      console.log('Leaderboard updated from Firebase realtime event');
    }
  });
}

/**
 * 초기화 함수
 */
function initFirebaseLeaderboard() {
  // 익명 인증 시작
  ensureAnonymousAuth()
    .then(() => {
      console.log('Firebase leaderboard module initialized');
      setupFirebaseListeners();
    })
    .catch(error => {
      console.error('Firebase initialization failed:', error);
    });
}

// Firebase 기능을 전역 객체로 노출
window.leaderboardFirebase = {
  fetchFromFirebase: fetchLeaderboardFromFirebase,
  saveToFirebase: saveLeaderboardToFirebase,
  syncWithFirebase: syncWithFirebase,
  initFirebase: initFirebaseLeaderboard
};
```

### 4. 기존 리더보드 모듈 업데이트

기존 `leaderboard.js` 파일을 수정하여 Firebase를 기본 저장소로 사용하도록 변경:

```javascript
// 스토리지 메서드 상수 업데이트
const STORAGE_METHOD = {
  LOCALSTORAGE: 'localstorage',
  INDEXEDDB: 'indexeddb',
  FIREBASE: 'firebase' // 새로운 스토리지 메서드 추가
};

// 기본 스토리지 메서드를 Firebase로 변경
let primaryStorageMethod = STORAGE_METHOD.FIREBASE;
let fallbackStorageMethod = STORAGE_METHOD.LOCALSTORAGE;
```

### 5. 스토리지 처리 함수 업데이트

`leaderboard-storage.js`를 수정하여 Firebase 스토리지 방식 지원:

```javascript
// 저장소 함수 업데이트
function saveLeaderboardToStorage(leaderboard) {
  // Firebase가 기본 저장 방식인 경우
  if (primaryStorageMethod === STORAGE_METHOD.FIREBASE) {
    return window.leaderboardFirebase.saveToFirebase(leaderboard)
      .catch(error => {
        console.error('Error saving to Firebase:', error);
        // 폴백으로 로컬 저장소 사용
        return saveLeaderboardToLocalStorage(leaderboard);
      });
  }
  
  // 기존 저장 로직...
}

// 불러오기 함수 업데이트
function loadLeaderboardFromStorage() {
  // Firebase가 기본 저장 방식인 경우
  if (primaryStorageMethod === STORAGE_METHOD.FIREBASE) {
    return window.leaderboardFirebase.fetchFromFirebase()
      .catch(error => {
        console.error('Error loading from Firebase:', error);
        // 폴백으로 로컬 저장소 사용
        return loadLeaderboardFromLocalStorage();
      });
  }
  
  // 기존 불러오기 로직...
}
```

### 6. HTML 파일 업데이트

`react_test.html` 파일에 Firebase 스크립트 추가:

```html
<!-- 기존 스크립트 -->
<script src="js/leaderboard-core.js"></script>
<script src="js/leaderboard-storage.js"></script>
<script src="js/leaderboard-gist.js"></script>

<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js"></script>
<script src="js/firebase-config.js"></script>

<!-- Firebase 리더보드 모듈 -->
<script src="js/leaderboard-firebase.js"></script>

<!-- 메인 리더보드 스크립트 -->
<script src="js/leaderboard.js"></script>
```

### 7. 기존 Gist 데이터 마이그레이션

기존 Gist의 데이터를 Firebase로 마이그레이션하는 일회성 스크립트:

```javascript
/**
 * Gist에서 Firebase로 데이터 마이그레이션
 */
function migrateFromGistToFirebase() {
  console.log('Starting migration from Gist to Firebase...');
  
  // Gist에서 데이터 가져오기
  window.leaderboardGist.fetchFromGist()
    .then(gistData => {
      if (!gistData || gistData.length === 0) {
        console.log('No data found in Gist, migration skipped');
        return Promise.resolve(true);
      }
      
      console.log(`Migrating ${gistData.length} records from Gist to Firebase`);
      
      // Firebase에 데이터 저장
      return window.leaderboardFirebase.saveToFirebase(gistData);
    })
    .then(success => {
      if (success) {
        console.log('Migration completed successfully!');
      } else {
        console.warn('Migration completed with issues');
      }
    })
    .catch(error => {
      console.error('Migration failed:', error);
    });
}

// 페이지 로드 시 실행 (필요시 주석 해제)
// document.addEventListener('DOMContentLoaded', migrateFromGistToFirebase);
```

## 보안 고려사항

### Firebase 보안 규칙 설정

Realtime Database의 보안 규칙을 설정하여 무단 액세스 방지:

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

이 규칙은:
- 모든 사용자가 리더보드 데이터를 읽을 수 있도록 허용
- 인증된 사용자(익명 포함)만 쓰기 가능하도록 제한

### API 키 보호

Firebase API 키는 클라이언트 측 코드에 포함되어야 하지만, Firebase 콘솔에서 다음 설정으로 보호 가능:
- 애플리케이션 도메인 제한 설정
- API 키 사용량 쿼터 설정

## 비용 고려사항

Firebase Realtime Database는 무료 티어(Spark 플랜)를 제공하며:
- 1GB의 저장 공간
- 10GB/월 데이터 전송량
- 동시 연결 100개

리더보드와 같은 작은 애플리케이션의 경우 이 제한은 충분할 것으로 예상됩니다.

## 향후 개선 사항

1. 사용자 식별을 위한 기본적인 등록 시스템 추가
2. 관리자 전용 기능 구현 (부정 기록 삭제 등)
3. 데이터 캐싱 최적화로 Firebase 호출 줄이기
4. 오프라인 모드 지원
5. 배치 업데이트를 통한 성능 최적화

## 마이그레이션 일정

1. Firebase 프로젝트 설정: 1일
2. 기본 Firebase 통합 구현: 2일
3. 기존 코드 리팩토링 및 Firebase 어댑터 구현: 2일
4. 데이터 마이그레이션 및 테스트: 1일
5. 보안 규칙 설정 및 최종 테스트: 1일

총 예상 소요 시간: 약 7일
