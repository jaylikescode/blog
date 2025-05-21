/**
 * firebase-keys.js - Firebase 설정 키(일반 스크립트로 로드)
 * 이 파일은 ES 모듈이 아닌 일반 스크립트로 로드됩니다.
 */

// 디버깅용 로그 함수
function logFirebaseInit(message, data) {
  console.log(`[Firebase Keys] ${message}`, data || '');
}

logFirebaseInit('Firebase 설정 초기화 시작');

// Firebase 설정 키 (전역 변수로 설정)
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

// 호환성을 위해 두 변수 이름 모두 사용 가능
// 나중에 firebaseSecrets를 참조하는 코드를 위해 변수 유지
window.firebaseSecrets = window.firebaseConfig;

logFirebaseInit('Firebase 설정 로드 완료');

