// Firebase 설정
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// 익명 인증 함수
export async function signInAnonymous() {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log("Anonymous sign-in successful", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Anonymous sign-in error:", error);
    return null;
  }
}

export { app, database, auth };
