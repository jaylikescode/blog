/**
 * firebase-config.template.js - Firebase 설정 템플릿
 * 
 * 이 파일은 개발자를 위한 템플릿입니다.
 * 아래 내용을 복사하여 firebase-config.js 파일을 생성하고 
 * 여러분의 Firebase 프로젝트 정보로 값을 채워넣으세요.
 * firebase-config.js 파일은 .gitignore에 등록되어 저장소에 올라가지 않습니다.
 */

// Firebase 설정 객체 - 여러분의 Firebase 프로젝트 정보로 업데이트하세요
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};

// 모듈 내보내기
export default firebaseConfig;

// 전역 객체에 할당 (웹에서의 호환성을 위해)
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
}
