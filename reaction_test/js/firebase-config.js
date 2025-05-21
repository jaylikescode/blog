/**
 * firebase-config.js - Firebase 구성 및 초기화
 * 이 파일은 ES 모듈이 아닌 일반 스크립트로 로드됩니다.
 */

// 전역 변수로 구성 객체 선언
// 이 값은 중복 선언을 방지하기 위해 window 객체에 저장
// 다른 JS 파일에서 이 변수에 접근 가능

// 기존 값이 있는지 확인하고 없으면 초기화
if (!window.firebaseConfig) {
  window.firebaseConfig = {
    apiKey: "AIzaSyBdKiejBgTitVGFaZeNSnoh5ueQ134Uz3Y",
    authDomain: "reaction-speed-test-e27db.firebaseapp.com",
    projectId: "reaction-speed-test-e27db",
    storageBucket: "reaction-speed-test-e27db.appspot.com",
    databaseURL: "https://reaction-speed-test-e27db-default-rtdb.firebaseio.com",
    messagingSenderId: "190376860464",
    appId: "1:190376860464:web:25233ce11804d4e2b146f5",
    measurementId: "G-0W1GHK01FM"
  };
}

/**
 * Firebase 초기화 함수
 * firebaseConfig 객체를 사용하여 Firebase를 초기화합니다.
 */
function initializeFirebase() {
  try {
    // 이미 초기화되었는지 확인
    if (firebase.apps.length > 0) {
      console.log("Firebase가 이미 초기화되었습니다.");
      window.database = firebase.database();
      return;
    }
    
    // 처음 초기화하는 경우
    firebase.initializeApp(window.firebaseConfig);
    console.log("Firebase 초기화 성공");
    
    // Firebase 데이터베이스 참조 생성
    window.database = firebase.database();
    
    // 데이터베이스 연결 테스트
    const testRef = firebase.database().ref('.info/connected');
    testRef.on('value', (snap) => {
      if (snap.val() === true) {
        console.log('Firebase 데이터베이스에 연결되었습니다.');
      } else {
        console.warn('Firebase 데이터베이스에 연결할 수 없습니다.');
      }
    });
  } catch (e) {
    console.error("Firebase 초기화 실패:", e);
    // Firebase가 없어도 기본 기능은 작동하도록 처리
    window.firebase = window.firebase || {
      apps: [],
      database: () => ({
        ref: () => ({
          once: () => Promise.resolve({ val: () => null }),
          set: () => Promise.resolve(),
          on: (event, callback) => callback({ val: () => false })
        })
      })
    };
    
    // 기본 데이터베이스 객체 생성
    window.database = window.firebase.database();
  }
}

// 페이지 로드가 완료되면 Firebase 초기화
// DOMContentLoaded 이벤트 후 Firebase 초기화 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM 로드 완료, Firebase 초기화 시작');
  // 1초 지연 후 초기화 - 기타 스크립트가 모두 로드되도록
  setTimeout(initializeFirebase, 1000);
});

// 이미 DOM이 로드되었을 경우 바로 초기화
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('DOM이 이미 로드됨, 2초 뒤 Firebase 초기화 시작');
  setTimeout(initializeFirebase, 2000);
}
