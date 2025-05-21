// Firebase 구성 - 안전한 버전 (로컬 개발 용도)
// 실제 API 키는 firebase-secrets.js 파일에 보관하고 .gitignore에 추가하여 GitHub에 업로드되지 않도록 함

// 기본 Firebase 구성 객체 (아래 값들은 실제 API 키가 아니며 반드시 변경해야 함)
let firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

// 실제 키가 있는 파일을 로드하려고 시도
// 이 방식은 로컬 테스트에서만 작동하며, GitHub에는 이 파일을 제외하고 업로드해야 함
try {
  // 비밀 파일을 로드하고 성공하면 구성 대체
  const scriptElement = document.createElement('script');
  scriptElement.src = 'js/firebase-secrets.js';
  scriptElement.onload = function() {
    // firebase-secrets.js가 성공적으로 로드되면 내부 구성 대체
    if (typeof firebaseSecrets !== 'undefined') {
      firebaseConfig = firebaseSecrets;
      // Firebase 초기화
      initializeFirebase();
    }
  };
  scriptElement.onerror = function() {
    console.warn('비밀 Firebase 구성을 로드할 수 없습니다. 기본 구성 사용');
    initializeFirebase();
  };
  document.head.appendChild(scriptElement);
} catch (e) {
  console.warn('비밀 Firebase 구성을 로드할 수 없습니다. 기본 구성 사용:', e);
  initializeFirebase();
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
