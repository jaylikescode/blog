// Firebase 설정
// 기존 ES6 모듈 형식에서 일반 스크립트 형식으로 변경

// Firebase 구성 정보
const firebaseConfig = {
  apiKey: "AIzaSyBdKiejBgTitVGFaZeNSnoh5ueQ134Uz3Y",
  authDomain: "reaction-speed-test-e27db.firebaseapp.com",
  databaseURL: "https://reaction-speed-test-e27db-default-rtdb.firebaseio.com",
  projectId: "reaction-speed-test-e27db",
  storageBucket: "reaction-speed-test-e27db.firebasestorage.app",
  messagingSenderId: "190376860464",
  appId: "1:190376860464:web:25233ce11804d4e2b146f5",
  measurementId: "G-0W1GHK01FM"
};

// Firebase SDK 스크립트 로드 - 스크립트 태그로 이미 로드해야 함
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"></script>

// Firebase 초기화
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// 익명 인증 함수
window.signInAnonymous = async function() {
  try {
    // Firebase v8 SDK에서는 signInAnonymously를 직접 호출합니다
    const userCredential = await auth.signInAnonymously();
    console.log("Anonymous sign-in successful", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Anonymous sign-in error:", error);
    return null;
  }
}

// 글로벌 변수로 노출
window.firebaseApp = app;
window.firebaseDatabase = database;
window.firebaseAuth = auth;

console.log('[DEBUG] Firebase config initialized');
