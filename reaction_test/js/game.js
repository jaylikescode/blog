/**
 * game.js - 반응 속도 테스트 게임 핵심 로직
 */

// 게임 관련 변수
let startTime = 0; // 시작 시간
let reactionTime = 0; // 반응 시간
let timeout; // 타임아웃 핸들
let ready = false; // 준비 상태
let round = 0; // 현재 라운드
let times = []; // 각 라운드별 시간 기록
let bestTime = Infinity; // 최고 기록
const maxRounds = 5; // 최대 라운드 수

/**
 * 테스트 시작 함수
 */
function startTest() {
  // DOM 요소 참조
  const box = document.getElementById('signal-box');
  const resultsDiv = document.getElementById('results');
  const recordsDiv = document.getElementById('reaction-records');
  const instructions = document.getElementById('instructions');
  
  // UI 초기화
  box.style.display = 'flex';
  box.textContent = window.gameTranslations.getText('waiting');
  
  // Reset all classes and add waiting state
  box.className = '';
  box.classList.add('waiting');
  box.classList.remove('clickable-start');
  
  resultsDiv.innerHTML = '';
  recordsDiv.innerHTML = ''; // 반응 기록 초기화
  instructions.style.display = 'none';
  
  // 변수 초기화
  round = 0;
  times = [];
  bestTime = Infinity;
  
  // 첫 라운드 시작 (약간의 딜레이를 주어 부드러운 전환)
  setTimeout(() => {
    nextRound();
  }, 300);
}

/**
 * 다음 라운드 시작 함수
 */
function nextRound() {
  const box = document.getElementById('signal-box');
  
  round++;
  ready = false;
  
  // 모든 라운드를 마친 경우
  if (round > maxRounds) {
    showResults();
    return;
  }
  
  // Update box state
  box.className = '';
  box.classList.add('ready');
  box.textContent = `${round}/${maxRounds} ${window.gameTranslations.getText('waiting')}`;
  
  // Add subtle pulse animation while waiting
  box.style.animation = 'pulse 2s infinite';
  
  // 랜덤 시간 후에 신호 표시 (2-5초 사이)
  const randomDelay = Math.floor(Math.random() * 3000) + 2000;
  timeout = setTimeout(showSignal, randomDelay);
}

/**
 * 신호 표시 함수
 */
function showSignal() {
  const box = document.getElementById('signal-box');
  
  if (round > maxRounds) return;
  
  // 클릭 가능 상태로 변경
  ready = true;
  
  // Update box state for clickable signal
  box.className = '';
  box.classList.add('clickable');
  box.textContent = window.gameTranslations.getText('click');
  
  // 시작 시간 저장
  startTime = Date.now();
  
  // Add subtle scale animation
  box.style.transform = 'scale(1.02)';
  
  // 소리 효과 재생 (선택적)
  if (window.gameAudio) {
    window.gameAudio.playTone(880, 0.2); // 높은 '도' 소리
  }
  
  // Add a subtle glow effect
  const glowEffect = document.createElement('div');
  glowEffect.className = 'signal-glow';
  box.appendChild(glowEffect);
  
  // Remove the glow effect after animation
  setTimeout(() => {
    if (box.contains(glowEffect)) {
      box.removeChild(glowEffect);
    }
  }, 1000);
}

/**
 * 박스 클릭 처리 함수
 */
function handleBoxClick() {
  const box = document.getElementById('signal-box');
  
  // 디버깅 로그: 박스 상태 출력
  console.log('Box clicked:', {
    classes: box.className,
    hasClickableStart: box.classList.contains('clickable-start'),
    round: round,
    ready: ready
  });
  
  // 게임 시작 전 상태
  if (box.classList.contains('clickable-start')) {
    console.log('Starting test...');
    startTest();
    return;
  }
  
  // 게임이 시작하지 않았거나 완료된 경우
  if (round === 0 || round > maxRounds) return;
  
  // 준비 완료 전에 클릭한 경우
  if (!ready) {
    handleEarlyClick();
    return;
  }
  
  // 반응 시간 측정
  reactionTime = Date.now() - startTime;
  
  // 클릭 효과 추가
  box.classList.add('clicked');
  
  // 100ms 후에 클릭 효과 제거
  setTimeout(() => {
    box.classList.remove('clicked');
  }, 100);
  
  // 결과 기록
  recordReaction();
  
  // 소리 효과 재생 (선택적)
  if (window.gameAudio) {
    window.gameAudio.playTone(587.33, 0.1);
  }
  
  // 다음 라운드 또는 결과 표시
  if (round < maxRounds) {
    // 다음 라운드로 전환하는 애니메이션
    box.className = '';
    box.classList.add('waiting');
    box.textContent = window.gameTranslations.getText('waiting');
    
    // 잠시 후 다음 라운드 시작 (애니메이션을 위한 딜레이)
    setTimeout(() => {
      nextRound();
    }, 800);
  } else {
    // 모든 라운드 완료 - 결과 표시
    box.className = '';
    box.classList.add('completed');
    box.textContent = window.gameTranslations.getText('completed');
    
    // 결과 표시 (약간의 딜레이 후)
    setTimeout(showResults, 500);
  }
}

/**
 * 너무 일찍 클릭한 경우 처리
 */
function handleEarlyClick() {
  const box = document.getElementById('signal-box');
  
  // 타이머 취소
  clearTimeout(timeout);
  
  // 상태 업데이트 및 애니메이션 적용
  box.className = '';
  box.classList.add('too-early');
  box.textContent = window.gameTranslations.getText('too-early');
  
  // 흔들림 효과를 위한 클래스 추가
  box.classList.add('shaking');
  
  // 흔들림 효과가 끝나면 클래스 제거
  setTimeout(() => {
    box.classList.remove('shaking');
  }, 1000);
  
  // 소리 효과 재생 (선택적)
  if (window.gameAudio) {
    window.gameAudio.playTone(220, 0.3);
  }
  
  // 잠시 후 같은 라운드 다시 시작 (애니메이션을 위한 충분한 시간 확보)
  setTimeout(() => {
    box.className = '';
    box.classList.add('waiting');
    nextRound();
  }, 1500);
}

/**
 * 반응 시간 기록 함수
 */
function recordReaction() {
  const recordsDiv = document.getElementById('reaction-records');
  
  // 반응 시간 기록
  times.push(reactionTime);
  
  // 최고 기록 갱신
  if (reactionTime < bestTime) {
    bestTime = reactionTime;
  }
  
  // 현재 라운드 결과 표시 - 오른쪽 탭에 추가
  const resultItem = document.createElement('div');
  resultItem.className = 'record-item';
  // 더 좋은 시간이면 하이라이트
  if (reactionTime === bestTime && times.length > 1) {
    resultItem.classList.add('best-time');
  }
  resultItem.innerHTML = `<span class="round-number">${round}</span><span class="round-time">${reactionTime}ms</span>`;
  recordsDiv.appendChild(resultItem);
}

/**
 * 결과 표시 함수
 */
function showResults() {
  const box = document.getElementById('signal-box');
  const resultsDiv = document.getElementById('results');
  const instructions = document.getElementById('instructions');
  
  // 게임 완료 표시
  box.style.backgroundColor = '#E0E0E0';
  box.textContent = window.gameTranslations.getText('completed');
  
  // 최종 결과 표시
  resultsDiv.innerHTML = '';
  
  // 최고 기록 표시
  const bestDiv = document.createElement('div');
  bestDiv.className = 'average';
  bestDiv.textContent = `${window.gameTranslations.getText('best')}: ${bestTime} ${window.gameTranslations.getText('ms')}`;
  resultsDiv.appendChild(bestDiv);
  
  // 성과 메시지 결정
  let message = '';
  if (bestTime < 200) {
    message = window.gameTranslations.getText('amazing');
    if (window.gameAudio) window.gameAudio.playTone(880, 0.5);
  } else if (bestTime < 250) {
    message = window.gameTranslations.getText('very-fast');
    if (window.gameAudio) window.gameAudio.playTone(783.99, 0.5);
  } else if (bestTime < 300) {
    message = window.gameTranslations.getText('excellent');
    if (window.gameAudio) window.gameAudio.playTone(659.25, 0.5);
  } else if (bestTime < 350) {
    message = window.gameTranslations.getText('above-average');
  } else {
    message = window.gameTranslations.getText('keep-practicing');
  }
  
  // 성과 메시지 표시
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.textContent = message;
  resultsDiv.appendChild(messageDiv);
  
  // 이름 입력 필드 및 점수 저장 UI 생성
  createNameInputForm(bestTime);
  
  // 게임 재시작 설정
  box.classList.add('clickable-start');
  box.textContent = window.gameTranslations.getText('click-to-start');
  
  // 인스트럭션 표시
  instructions.style.display = 'block';
}

/**
 * 이름 입력 폼 생성 함수 - 단순화된 인터페이스
 * @param {number} score - 저장할 점수
 */
function createNameInputForm(score) {
  const resultsDiv = document.getElementById('results');
  
  // 이름 입력 컨테이너 - 수평 레이아웃
  const nameDiv = document.createElement('div');
  nameDiv.className = 'player-info horizontal-form';
  
  // 간단한 설명
  const scoreInfo = document.createElement('span');
  scoreInfo.className = 'score-info';
  scoreInfo.textContent = `${score}ms: `;
  
  // 이름 입력 필드 - 다른 요소와 한 줄에 표시
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'player-name-input';
  nameInput.placeholder = window.gameTranslations.getText('player-name-placeholder');
  
  // 저장 버튼
  const saveButton = document.createElement('button');
  saveButton.className = 'save-record-btn';
  saveButton.textContent = window.gameTranslations.getText('save-score');
  
  // 저장 버튼 클릭 이벤트
  saveButton.addEventListener('click', function() {
    // 저장 중임을 표시
    saveButton.disabled = true;
    saveButton.textContent = window.gameTranslations.getText('saving') || 'Saving...';
    
    // 이름을 입력하지 않은 경우 'Anonymous'로 설정
    const playerName = nameInput.value.trim() || window.gameTranslations.getText('anonymous');
    
    // 순위표에 기록 저장 (Promise 처리)
    window.gameLeaderboard.addScoreToLeaderboard(playerName, score)
      .then(rank => {
        // 저장 성공 메시지 - 한 줄로 표시
        nameDiv.innerHTML = '';
        nameDiv.className = 'player-info horizontal-form';
        
        const successMsg = document.createElement('span');
        successMsg.className = 'save-success';
        successMsg.textContent = `${window.gameTranslations.getText('score-saved')} (${window.gameTranslations.getText('rank')}: ${rank})`;
        nameDiv.appendChild(successMsg);
        
        // 다시하기 버튼
        const retryBtn = document.createElement('button');
        retryBtn.id = 'retry';
        retryBtn.textContent = window.gameTranslations.getText('retry');
        retryBtn.addEventListener('click', startTest);
        nameDiv.appendChild(retryBtn);
      })
      .catch(error => {
        // 오류 발생 시 메시지 표시
        console.error('Error saving score:', error);
        nameDiv.innerHTML = '';
        const errorMsg = document.createElement('div');
        errorMsg.className = 'save-error';
        errorMsg.textContent = window.gameTranslations.getText('save-error') || 'Error saving score. Please try again.';
        nameDiv.appendChild(errorMsg);
        
        // 재시도 버튼
        const retryBtn = document.createElement('button');
        retryBtn.textContent = window.gameTranslations.getText('try-again') || 'Try Again';
        retryBtn.addEventListener('click', () => createNameInputForm(score));
        nameDiv.appendChild(retryBtn);
      });
  });
  
  // 요소들을 한 줄로 추가 (개행 없음)
  nameDiv.appendChild(scoreInfo);
  nameDiv.appendChild(nameInput);
  nameDiv.appendChild(saveButton);
  
  resultsDiv.appendChild(nameDiv);
}

/**
 * 게임 관련 이벤트 설정
 */
function setupGameEvents() {
  console.log('게임 이벤트 설정 시작...');
  const box = document.getElementById('signal-box');
  
  // 시그널 박스(게임 화면) 클릭 이벤트 - 게임 시작과 플레이 모두 처리
  if (box) {
    console.log('시그널 박스 발견:', box);
    
    // 이전 클릭 이벤트 제거 (중복 방지)
    box.removeEventListener('click', handleBoxClick);
    
    // 처음에 클릭하여 시작하도록 표시
    box.className = ''; // 클래스 초기화
    box.classList.add('clickable-start');
    
    // 텍스트 업데이트
    try {
      box.textContent = window.gameTranslations.getText('click-to-start');
    } catch (e) {
      console.error('텍스트 설정 오류:', e);
      box.textContent = '화면을 클릭하여 시작하세요';
    }
    
    // 클릭 이벤트 추가 - 직접 함수 사용하여 클릭 시 시작하도록 설정
    box.addEventListener('click', function(event) {
      console.log('박스 클릭됨:', event);
      handleBoxClick();
    });
    
    // 추가 - 직접 시작 버튼 추가
    const startButton = document.createElement('button');
    startButton.id = 'manual-start-button';
    startButton.textContent = '게임 시작하기';
    startButton.className = 'start-button';
    startButton.style.marginTop = '15px';
    startButton.style.padding = '10px 15px';
    startButton.style.backgroundColor = '#4a89dc';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '5px';
    startButton.style.cursor = 'pointer';
    startButton.style.fontWeight = 'bold';
    
    startButton.addEventListener('click', function() {
      console.log('시작 버튼 클릭됨');
      startTest();
    });
    
    // 박스 아래에 버튼 추가
    box.parentNode.insertBefore(startButton, box.nextSibling);
  } else {
    console.error('시그널 박스를 찾을 수 없습니다!');
  }
}

// 모듈 내보내기
window.gameCore = {
  startTest,
  setupGameEvents,
  getBestTime: () => bestTime
};
