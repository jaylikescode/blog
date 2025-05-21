/**
 * firebase-config.template.js - Firebase 설정 템플릿
 * 
 * 이 파일은 개발자를 위한 템플릿입니다.
 * 아래 내용을 복사하여 firebase-config.js 파일을 생성하고 
 * 여러분의 Firebase 프로젝트 정보로 값을 채워넣으세요.
 * firebase-config.js 파일은 .gitignore에 등록되어 저장소에 올라가지 않습니다.
 */

// Firebase 설정 객체 - 여러분의 Firebase 프로젝트 정보로 업데이트하세요
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBdKiejBgTitVGFaZeNSnoh5ueQ134Uz3Y",
  authDomain: "reaction-speed-test-e27db.firebaseapp.com",
  projectId: "reaction-speed-test-e27db",
  storageBucket: "reaction-speed-test-e27db.firebasestorage.app",
  messagingSenderId: "190376860464",
  appId: "1:190376860464:web:25233ce11804d4e2b146f5",
  measurementId: "G-0W1GHK01FM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// 모듈 내보내기
export default firebaseConfig;

// 전역 객체에 할당 (웹에서의 호환성을 위해)
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
}
