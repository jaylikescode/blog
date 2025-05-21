// Firebase 구성
// Firebase SDK v8.x (CDN 방식)에서 사용하는 구성 방식
const firebaseConfig = {
  apiKey: "AIzaSyBdKiejBgTitVGFaZeNSnoh5ueQ134Uz3Y",
  authDomain: "reaction-speed-test-e27db.firebaseapp.com",
  projectId: "reaction-speed-test-e27db",
  storageBucket: "reaction-speed-test-e27db.appspot.com", // 일반적인 형식으로 수정
  databaseURL: "https://reaction-speed-test-e27db-default-rtdb.firebaseio.com", // Realtime Database URL 추가
  messagingSenderId: "190376860464",
  appId: "1:190376860464:web:25233ce11804d4e2b146f5",
  measurementId: "G-0W1GHK01FM"
};

// Firebase 초기화
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase 초기화 성공");
} catch (e) {
  console.error("Firebase 초기화 실패:", e);
  // Firebase가 없어도 기본 기능은 작동하도록 처리
  window.firebase = {
    database: () => ({
      ref: () => ({
        once: () => Promise.resolve({ val: () => null }),
        set: () => Promise.resolve()
      })
    })
  };
}

// Firebase 데이터베이스 참조
const database = firebase.database();
