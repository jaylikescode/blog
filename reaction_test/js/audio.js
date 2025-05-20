/**
 * audio.js - 소리 효과 관련 모듈
 */

// 소리 효과용 AudioContext
let audioContext;
try {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
  console.log('Web Audio API가 지원되지 않습니다');
}

/**
 * 소리 재생 함수
 * @param {number} frequency - 주파수 (Hz)
 * @param {number} duration - 지속 시간 (초)
 */
function playTone(frequency, duration) {
  if (!audioContext) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    // 소리를 부드럽게 종료
    gainNode.gain.exponentialRampToValueAtTime(
      0.00001, audioContext.currentTime + duration
    );
    
    // 지정된 시간 후 소리 종료
    setTimeout(() => oscillator.stop(), duration * 1000);
  } catch (e) {
    console.log('소리 재생 실패:', e);
  }
}

// 모듈 내보내기
window.gameAudio = {
  playTone
};
