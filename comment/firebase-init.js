/**
 * Firebase 초기화 및 설정
 * Firebase SDK v9 호환성 모드 사용
 */

// Firebase 구성
const firebaseConfig = {
  apiKey: "AIzaSyCinlrgQvNZu4OzIkEzVibffi7yUofoeh4",
  authDomain: "jay-blog-comment.firebaseapp.com",
  projectId: "jay-blog-comment",
  storageBucket: "jay-blog-comment.firebasestorage.app",
  messagingSenderId: "89428938336",
  appId: "1:89428938336:web:651098e8adbf2c8b873d05",
  measurementId: "G-E6GGXP1Y1H",
  databaseURL: "https://jay-blog-comment-default-rtdb.firebaseio.com"
};

/**
 * Firebase 서비스 초기화를 담당하는 클래스
 * 단일 책임 원칙(SRP)에 따라 Firebase 초기화만 담당
 */
class FirebaseInitializer {
  constructor(config) {
    this.config = config;
    this.initialized = false;
  }
  
  /**
   * Firebase 앱 초기화
   * @returns {boolean} 초기화 성공 여부
   */
  initialize() {
    try {
      // Firebase SDK가 로드되었는지 확인
      if (typeof firebase === 'undefined') {
        console.error('Firebase SDK가 로드되지 않았습니다.');
        return false;
      }
      
      // 이미 초기화되었는지 확인
      if (!firebase.apps.length) {
        firebase.initializeApp(this.config);
      }
      
      // Analytics 초기화 (선택적)
      if (typeof firebase.analytics === 'function') {
        firebase.analytics();
      }
      
      this.initialized = true;
      console.log('Firebase가 성공적으로 초기화되었습니다.');
      return true;
    } catch (error) {
      console.error('Firebase 초기화 중 오류가 발생했습니다:', error);
      return false;
    }
  }
  
  /**
   * 초기화 상태 확인
   * @returns {boolean} 초기화 여부
   */
  isInitialized() {
    return this.initialized;
  }
}

// Firebase 초기화 인스턴스 생성 및 내보내기
const firebaseInitializer = new FirebaseInitializer(firebaseConfig);

// 페이지 로드 시 Firebase 초기화
document.addEventListener('DOMContentLoaded', function() {
  firebaseInitializer.initialize();
});

// 전역으로 초기화 함수 노출
window.initializeFirebase = function() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded. Loading from CDN...');
    // Firebase SDK를 동적으로 로드 (필요한 경우)
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js';
    script.onload = function() {
      // Firebase 로드 후 추가 SDK 로드
      const analyticsScript = document.createElement('script');
      analyticsScript.src = 'https://www.gstatic.com/firebasejs/9.6.0/firebase-analytics-compat.js';
      analyticsScript.onload = function() {
        const databaseScript = document.createElement('script');
        databaseScript.src = 'https://www.gstatic.com/firebasejs/9.6.0/firebase-database-compat.js';
        databaseScript.onload = function() {
          // 초기화 지연 실행
          setTimeout(() => firebaseInitializer.initialize(), 500);
        };
        document.head.appendChild(databaseScript);
      };
      document.head.appendChild(analyticsScript);
    };
    document.head.appendChild(script);
    return false;
  }
  return firebaseInitializer.initialize();
};
