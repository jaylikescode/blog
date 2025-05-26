/**
 * Firebase 초기화 및 설정
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

// Firebase 초기화
function initializeFirebase() {
  // Firebase SDK가 로드되었는지 확인
  if (typeof firebase !== 'undefined') {
    // 이미 초기화되었는지 확인
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    // Analytics 초기화 (선택적)
    if (typeof firebase.analytics === 'function') {
      firebase.analytics();
    }
    
    console.log('Firebase가 성공적으로 초기화되었습니다.');
    return true;
  } else {
    console.error('Firebase SDK가 로드되지 않았습니다.');
    return false;
  }
}

// 페이지 로드 시 Firebase 초기화
document.addEventListener('DOMContentLoaded', function() {
  initializeFirebase();
});
