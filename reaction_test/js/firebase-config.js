/**
 * firebase-config.js - Firebase 설정
 */

// Firebase 설정 객체
const firebaseConfig = {
  apiKey: "AIzaSyBdKiejBgTitVGFaZeNSnoh5ueQ134Uz3Y",
  authDomain: "reaction-speed-test-e27db.firebaseapp.com",
  projectId: "reaction-speed-test-e27db",
  storageBucket: "reaction-speed-test-e27db.firebasestorage.app",
  messagingSenderId: "190376860464",
  appId: "1:190376860464:web:25233ce11804d4e2b146f5",
  measurementId: "G-0W1GHK01FM"
};

// Firebase 초기화 함수 (window.initializeFirebase로 전역에 노출)
function initializeFirebase() {
  try {
    // Firebase 초기화 (Firebase SDK v8.x 버전용)
    if (typeof firebase !== 'undefined') {
      firebase.initializeApp(firebaseConfig);
      console.log('Firebase가 성공적으로 초기화되었습니다 (SDK v8.x).');
      return { isInitialized: true };
    } 
    // Firebase SDK v9.x를 위한 초기화 시도
    else if (window.firebaseModules && window.firebaseModules.initializeApp) {
      const app = window.firebaseModules.initializeApp(firebaseConfig);
      const analytics = window.firebaseModules.getAnalytics(app);
      console.log('Firebase가 성공적으로 초기화되었습니다 (SDK v9.x).');
      return { isInitialized: true };
    } else {
      console.error('Firebase SDK를 찾을 수 없습니다.');
      return { isInitialized: false };
    }
  } catch (error) {
    console.error('Firebase 초기화 중 오류 발생:', error);
    return { isInitialized: false };
  }
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig, initializeFirebase };
}

// 전역 객체에 할당 (웹에서의 호환성을 위해)
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
  window.initializeFirebase = initializeFirebase;
}
