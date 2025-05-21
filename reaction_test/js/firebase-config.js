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
    firebase.initializeApp(firebaseConfig);
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
    window.firebase = {
      database: () => ({
        ref: () => ({
          once: () => Promise.resolve({ val: () => null }),
          set: () => Promise.resolve(),
          on: (event, callback) => callback({ val: () => false })
        })
      })
    };
    
    // 기본 데이터베이스 객체 생성
    window.database = firebase.database();
  }
}

// 로딩이 진행 중인지 확인
// script를 통해 자동으로 초기화되지 않은 경우 상위 코드에서 initializeFirebase 호출
// 이 부분은 로딩 중이고 위에서 자동으로 초기화하지 않았을 경우를 위한 백업
// 5초 후에 아직 초기화되지 않았다면 기본 구성으로 초기화
 setTimeout(() => {
  if (typeof window.database === 'undefined') {
    console.warn('자동 로드 실패, 기본 구성으로 초기화');
    initializeFirebase();
  }
}, 5000);
