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

// DOM 요소 참조 가넥성 향상
// 공통으로 사용되는 요소들을 전역 변수로 설정
let resultsContentDiv = null;
let recordsListDiv = null;

// DOM 요소 참조 초기화 함수
function initDomReferences() {
  // DOM 요소 선택
  resultsContentDiv = document.getElementById('results-content');
  recordsListDiv = document.getElementById('records-list');
  
  // 요소가 없는 경우 오류 방지를 위한 추가 로직
  if (!resultsContentDiv) {
    // results-content 엘리먼트가 없다면 생성
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
      console.log('[Game] results-content 요소 생성 중...');
      // 원래 내용 보존
      const originalContent = resultsDiv.innerHTML;
      // 구조 생성
      resultsDiv.innerHTML = '<h3 data-text="result-title">테스트 결과</h3><div id="results-content"></div>';
      // 다시 참조 갱신
      resultsContentDiv = document.getElementById('results-content');
      // 원래 내용이 있다면 내용 복원
      if (originalContent && originalContent.trim() !== '') {
        resultsContentDiv.innerHTML = originalContent;
      }
    }
  }
  
  if (!recordsListDiv) {
    // records-list 엘리먼트가 없다면 생성
    const recordsDiv = document.getElementById('reaction-records');
    if (recordsDiv) {
      console.log('[Game] records-list 요소 생성 중...');
      // 원래 내용 보존
      const originalContent = recordsDiv.innerHTML;
      // 구조 생성
      recordsDiv.innerHTML = '<h3 data-text="records-title">기록</h3><div id="records-list"></div>';
      // 다시 참조 갱신
      recordsListDiv = document.getElementById('records-list');
      // 원래 내용이 있다면 내용 복원
      if (originalContent && originalContent.trim() !== '') {
        recordsListDiv.innerHTML = originalContent;
      }
    }
  }
  
  // 초기화 결과 로그
  console.log('[Game] DOM 참조 초기화 결과:', { 
    resultsContent: !!resultsContentDiv,
    recordsList: !!recordsListDiv
  });
  
  // 요소가 여전히 없는 경우에는 비움 객체 생성
  if (!resultsContentDiv) {
    console.warn('[Game] results-content 요소를 찾을 수 없어 비움 객체 생성');
    resultsContentDiv = { innerHTML: '' };
  }
  
  if (!recordsListDiv) {
    console.warn('[Game] records-list 요소를 찾을 수 없어 비움 객체 생성');
    recordsListDiv = { appendChild: () => {}, innerHTML: '' };
  }
}

/**
 * 테스트 시작 함수
 */
function startTest() {
  // DOM 요소 재초기화
  initDomReferences();
  
  // 추가 DOM 요소 참조
  const box = document.getElementById('signal-box');
  const instructions = document.getElementById('instructions');
  
<<<<<<< Updated upstream
  // UI 초기화
  box.style.display = 'flex';
  box.textContent = window.gameTranslations.getText('waiting');
  
  // Reset all classes and add waiting state
  box.className = '';
  box.classList.add('waiting');
  box.classList.remove('clickable-start');
  
  // 결과 및 기록 초기화 - 새 구조 반영
  if (resultsContentDiv) {
    resultsContentDiv.innerHTML = '';
  } else {
    document.getElementById('results').innerHTML = '<h3 data-text="result-title">테스트 결과</h3><div id="results-content"></div>';
  }
  
  if (recordsListDiv) {
    recordsListDiv.innerHTML = '';
  } else {
    document.getElementById('reaction-records').innerHTML = '<h3 data-text="records-title">기록</h3><div id="records-list"></div>';
  }
  
  instructions.style.display = 'none';
=======
  // UI 초기화 (null 체크 추가)
  if (startBtn) {
    startBtn.style.display = 'none';
  }
  
  if (box) {
    box.style.display = 'flex';
    box.textContent = window.gameTranslations.getText('waiting');
    
    // Reset all classes and add waiting state
    box.className = '';
    box.classList.add('waiting');
  } else {
    console.error('Signal box element not found. Game cannot start.');
    return; // 박스가 없으면 게임을 시작할 수 없음
  }
  
  // 결과 영역이 존재하는지 확인 후 초기화
  if (resultsDiv) {
    resultsDiv.innerHTML = '';
  } else {
    console.warn('Results div not found. Creating a new one...');
    // 결과 영역이 없으면 생성
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
      const newResultsDiv = document.createElement('div');
      newResultsDiv.id = 'results';
      gameScreen.parentNode.insertBefore(newResultsDiv, gameScreen.nextSibling);
      // 전역 참조 업데이트
      window.resultsDiv = newResultsDiv;
    }
  }
  
  // 게임 설명 영역 (존재하는 경우만 숨김)
  if (instructions) {
    instructions.style.display = 'none';
  }
>>>>>>> Stashed changes
  
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
  
  // DOM 참조 초기화 강제 실행 (오류 수정)
  initDomReferences();
  
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
  // 이미 화면을 클릭한 경우는 반응하지 않음
  if (round === 0 || waiting || reacted) return;

  reacted = true;
  const now = new Date().getTime();
  reactionTime = now - startTime;

  // 결과 저장
  times.push(reactionTime);
  
  // box 요소 확인
  const box = document.getElementById('signal-box');
  if (box) {
    box.textContent = reactionTime + ' ms';
  }
  
  // resultsDiv 확인
  let localResultsDiv = document.getElementById('results') || window.resultsDiv;
  if (localResultsDiv) {
    localResultsDiv.innerHTML += `<p>${window.gameTranslations.getText('round')} ${round}: <strong>${reactionTime} ms</strong></p>`;
  } else {
    console.warn('Results div not found in recordReaction, creating results element');
    // 결과 영역이 없으면 생성
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
      const newResultsDiv = document.createElement('div');
      newResultsDiv.id = 'results';
      gameScreen.parentNode.insertBefore(newResultsDiv, gameScreen.nextSibling);
      // 새로 만든 요소에 결과 표시
      newResultsDiv.innerHTML = `<p>${window.gameTranslations.getText('round')} ${round}: <strong>${reactionTime} ms</strong></p>`;
      // 전역 참조 업데이트
      window.resultsDiv = newResultsDiv;
    }
    }
  }

  // 다음 라운드로 이동
  setTimeout(nextRound, 1500);
}

/**
 * 결과 표시 함수
 */
function showResults() {
  const box = document.getElementById('signal-box');
  let resultsDiv = document.getElementById('results') || window.resultsDiv;
  const instructions = document.getElementById('instructions');
  
  // 게임 완료 표시 (box 요소 확인)
  if (box) {
    box.style.backgroundColor = '#E0E0E0';
    box.textContent = window.gameTranslations.getText('completed');
  } else {
    console.error('Signal box element not found in showResults');
  }
  
  // 결과 영역이 없는 경우 생성
  if (!resultsDiv) {
    console.warn('Results div not found in showResults. Creating a new one...');
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
      resultsDiv = document.createElement('div');
      resultsDiv.id = 'results';
      gameScreen.parentNode.insertBefore(resultsDiv, gameScreen.nextSibling);
      window.resultsDiv = resultsDiv;
    } else {
      console.error('Game screen not found. Cannot create results div');
      return; // 게임 화면이 없는 경우 함수 종료
    }
  }
  
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
>>>>>>> Stashed changes
  } else {
    // 하위호환성 유지
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
      resultsDiv.innerHTML = `<p>${window.gameTranslations.getText('round')} ${round}: <strong>${reactionTime} ms</strong></p>`;
      resultsDiv.innerHTML += `<p>${window.gameTranslations.getText('best-time')}: <strong>${bestTime} ms</strong></p>`;
    }
  }
  
  // 각 라운드 기록을 시각적으로 표시
  const recordItem = document.createElement('div');
  recordItem.className = 'record-item';
  recordItem.textContent = `#${round}: ${reactionTime}ms`;
  
  // 새 구조에 맞게 요소 추가
  if (recordsListDiv) {
    recordsListDiv.appendChild(recordItem);
  } else {
    // 하위호환성 유지
    const records = document.getElementById('reaction-records');
    if (records) {
      records.appendChild(recordItem);
    }
  }
  
  // 다음 라운드 시작
  setTimeout(nextRound, 1500);
}

/**
 * 이름 입력 폼 생성 함수 - 단순화된 인터페이스
 * @param {number} score - 저장할 점수
 */
function createNameInputForm(score) {
  // 새 구조에 맞게 대상 요소 찾기
  const resultsContentDiv = document.getElementById('results-content');
  const targetDiv = resultsContentDiv || document.getElementById('results');
  
  if (!targetDiv) {
    console.error('이름 입력 폼을 표시할 요소를 찾을 수 없습니다.');
    return;
  }
  const nameDiv = document.createElement('div');
  nameDiv.className = 'player-info';
  
  // 안내 레이블
  const nameLabel = document.createElement('label');
  nameLabel.textContent = window.gameTranslations.getText('enter-name');
  
  // 이름 입력 필드
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'player-name-input';
  nameInput.placeholder = window.gameTranslations.getText('player-name-placeholder');
  nameInput.maxLength = 15;
  
  // 저장 버튼
  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'save-record-btn';
  saveButton.textContent = window.gameTranslations.getText('save-record');
  
  // 이름 입력 후 엔터 키 처리
  nameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const playerName = nameInput.value.trim();
      if (playerName.length > 0) {
        saveRecord(playerName, score);
      }
    }
  });
  
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
        // 저장 성공 메시지
        nameDiv.innerHTML = '';
        const successMsg = document.createElement('span');
        successMsg.className = 'save-success';
        successMsg.textContent = `${window.gameTranslations.getText('score-saved')} (${window.gameTranslations.getText('rank')}: ${rank})`;
        nameDiv.appendChild(successMsg);
        
        // 다시하기 버튼
        const retryBtn = document.createElement('button');
        retryBtn.className = 'retry-btn';
        retryBtn.textContent = window.gameTranslations.getText('try-again');
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
 * 게임 관련 디버깅 로그 출력
 */
function logGameDebug(message, data) {
  console.log(`[Game] ${message}`, data || '');
}

/**
 * 게임 관련 이벤트 설정
 */
function setupGameEvents() {
  logGameDebug('게임 이벤트 설정 시작');
  
  // DOM 요소 참조 초기화
  initDomReferences();
  
  const box = document.getElementById('signal-box');
  const gameContainer = document.getElementById('game-container');
  
  // 게임 시작 타이머 설정 (시작 버튼 클릭이 작동하지 않을 경우를 대비)
  window.gameStartTimers = window.gameStartTimers || [];
  
  // 이전 타이머 정리
  window.gameStartTimers.forEach(timer => clearTimeout(timer));
  window.gameStartTimers = [];
  
  // 3초 후 시작 버튼 클릭 아직도 작동하지 않는지 확인
  window.gameStartTimers.push(setTimeout(() => {
    logGameDebug('시작 버튼 작동 확인 시작');
    testClickHandling();
  }, 3000));
  
  // 시그널 박스(게임 화면) 클릭 이벤트 - 게임 시작과 플레이 모두 처리
  if (box) {
    logGameDebug('시그널 박스 발견', { 
      id: box.id, 
      display: box.style.display,
      classList: box.className
    });
    
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
      logGameDebug('시그널 박스 클릭됨', {
        target: event.target.id,
        timestamp: new Date().toISOString(),
        boxState: box.className
      });
      handleBoxClick();
    });
    
    // 이미 있는 시작 버튼 제거 (사용자 요구사항)
    let startButton = document.getElementById('manual-start-button');
    if (startButton) {
      logGameDebug('시작 버튼 제거 시작', { buttonId: startButton.id });
      startButton.remove();
      logGameDebug('시작 버튼이 제거됨');
    }
  } else {
    console.error('시그널 박스를 찾을 수 없습니다!');
    logGameDebug('시그널 박스 요소를 찾을 수 없음', { 'signal-box': !!document.getElementById('signal-box') });
  }
}

/**
 * 클릭 이벤트 작동 테스트 함수
 */
function testClickHandling() {
  logGameDebug('클릭 이벤트 테스트 시작');
  const box = document.getElementById('signal-box');
  const startButton = document.getElementById('manual-start-button');
  
  // 0. 요소 확인
  if (!box) {
    logGameDebug('signal-box 요소가 없음');
    return;
  }
  
  // 1. 박스 클래스 확인
  logGameDebug('박스 클래스 상태', { 
    className: box.className,
    hasClickableStart: box.classList.contains('clickable-start'),
    startButtonExists: !!startButton
  });
  
  // 2. 제대로 동작하지 않는 경우 추가 조치
  if (box.classList.contains('clickable-start')) {
    // 클릭 가능한 상태인데 아무것도 하지 않았다면
    logGameDebug('클릭 가능한 상태인데 아직 시작되지 않음');
    
    // 시작 버튼이 있는지 확인하고 강조
    if (startButton) {
      logGameDebug('시작 버튼이 있음 - 강조 추가');
      // 강조 효과
      startButton.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
      startButton.style.animation = 'pulse 2s infinite';
      
      // 5초 후 효과 제거
      setTimeout(() => {
        startButton.style.boxShadow = '';
        startButton.style.animation = '';
      }, 5000);
    }
  }
}

// 모듈 내보내기
window.gameCore = {
  startTest,
  setupGameEvents,
  getBestTime: () => bestTime,
  initDomReferences // DOM 요소 참조 초기화 함수 노출
};
