/**
 * Speed Tester - 반응 속도 테스트 게임
 * 웹표준 준수(HTML5, CSS3, Vanilla JS)
 * 모바일·데스크탑 브라우저 모두 지원
 * 다국어 지원 (EN/KO)
 * 로컬 저장소를 이용한 순위표 기능 추가
 */

// Language translations
const translations = {
  'en': {
    'title': 'Faster than Jay?',
    'game-description': 'A simple game to test your reaction speed:',
    'instruction-1': 'Press the Start button',
    'instruction-2': 'Wait until the screen turns green',
    'instruction-3': 'Click the screen as soon as it turns green',
    'instruction-4': 'After 5 rounds, your average reaction time will be displayed',
    'warning': 'Caution: Don\'t click before it turns green!',
    'start-button': 'Start Test',
    'ready': 'Ready',
    'waiting': 'Wait...',
    'click': 'Click!',
    'too-early': 'Too early!',
    'round': 'Round',
    'average': 'Average',
    'retry': 'Try Again',
    'ms': 'ms',
    'completed': 'Completed!',
    'amazing': 'Amazing speed!',
    'very-fast': 'Very fast!',
    'excellent': 'Excellent!',
    'above-average': 'Above average!',
    'keep-practicing': 'Keep practicing!',
    'player-name-label': 'Name:',
    'player-name-placeholder': 'Enter your name',
    'save-score': 'Save Score',
    'view-leaderboard': 'View Leaderboard',
    'hide-leaderboard': 'Hide Leaderboard',
    'leaderboard-title': 'Leaderboard',
    'loading': 'Loading...',
    'rank': 'Rank',
    'name': 'Name',
    'score': 'Score',
    'date': 'Date',
    'show-more': 'Show More',
    'average-scores': 'Average Scores',
    'best-scores': 'Best Scores',
    'enter-name': 'Enter your name to save your score:',
    'record-type': 'Record Type',
    'average': 'Average',
    'best': 'Best',
    'score-saved': 'Your score has been saved!',
    'save-error': 'Error saving score. Please try again.',
    'anonymous': 'Anonymous',
    'no-records': 'No records yet. Be the first!',
    'saving': 'Saving your score...',
    'your-rank': 'Your rank',
    'player-details': 'Player Details',
    'back-to-leaderboard': 'Back to Leaderboard',
    'restart-game': 'Restart Game',
    'see-more': 'Do you want to see more?'
  },
  'ko': {
    'title': '지석이보다 빠르다고?',
    'game-description': '반응 속도를 테스트하는 간단한 게임입니다:',
    'instruction-1': '시작하기 버튼을 누르세요',
    'instruction-2': '화면이 녹색으로 바뀔 때까지 기다리세요',
    'instruction-3': '녹색으로 바뀌는 즉시 화면을 클릭하세요',
    'instruction-4': '5회 반복 후 평균 반응 시간이 표시됩니다',
    'warning': '주의: 녹색으로 바뀌기 전에 클릭하면 안 됩니다!',
    'start-button': '시작하기',
    'ready': '준비',
    'waiting': '준비 중...',
    'click': '클릭!',
    'too-early': '너무 일찍 클릭했습니다!',
    'round': '회',
    'average': '평균',
    'retry': '다시 하기',
    'ms': 'ms',
    'completed': '완료!',
    'amazing': '놀라운 속도!',
    'very-fast': '매우 빠릅니다!',
    'excellent': '훌륭합니다!',
    'above-average': '평균 이상입니다!',
    'keep-practicing': '연습하면 빨라집니다!',
    'player-name-label': '이름:',
    'player-name-placeholder': '이름을 입력하세요',
    'save-score': '기록 저장',
    'view-leaderboard': '순위표 보기',
    'hide-leaderboard': '순위표 숨기기',
    'leaderboard-title': '순위표',
    'loading': '로딩 중...',
    'rank': '순위',
    'name': '이름',
    'score': '반응속도',
    'date': '날짜',
    'show-more': '더 보기',
    'average-scores': '평균 기록',
    'best-scores': '최고 기록',
    'enter-name': '이름을 입력하여 기록을 저장하세요:',
    'record-type': '기록 유형',
    'average': '평균',
    'best': '최고',
    'score-saved': '기록이 저장되었습니다!',
    'save-error': '저장 오류. 다시 시도해주세요.',
    'anonymous': '익명',
    'no-records': '저장된 기록이 없습니다. 처음으로 기록을 생성해보세요!',
    'saving': '기록 저장 중...',
    'your-rank': '당신의 순위',
    'player-details': '플레이어 정보',
    'back-to-leaderboard': '순위표로 돌아가기',
    'restart-game': '게임 다시 시작하기',
    'see-more': '더 보고 싶으세요?'
  }
};

// Current language - default to Korean
let currentLang = 'ko';

// DOM 요소 참조
const startBtn = document.getElementById('start-btn');
const box = document.getElementById('signal-box');
const resultsDiv = document.getElementById('results');
const instructions = document.getElementById('instructions');
const leaderboardLoading = document.getElementById('leaderboard-loading');
const leaderboardBody = document.getElementById('leaderboard-body');
const leaderboardTable = document.getElementById('leaderboard-table');
const showMoreBtn = document.getElementById('show-more-btn');

// 언어 선택 버튼
const langButtons = document.querySelectorAll('.lang-btn');

// 게임 관련 변수
let startTime = 0; // 시작 시간
let reactionTime = 0; // 반응 시간
let timeout; // 타임아웃 허들
let ready = false; // 준비 상태
let round = 0; // 현재 라운드
let times = []; // 각 라운드별 시간 기록
const maxRounds = 5; // 최대 라운드 수

// 순위표 관련 변수
let leaderboardPage = 1; // 현재 페이지
let hasMoreRecords = false; // 더 보기 가능 여부
const visibleRecords = 20; // 초기 표시 기록 수
const maxLeaderboardRank = 100; // 최대 순위 수
let isMoreRecordsVisible = false; // 추가 기록 표시 여부

// 로컬 스토리지 키
const LEADERBOARD_KEY = 'reaction_game_leaderboard';

// 현재 사용자 관련 변수
let currentUserId = null;
let currentBestScore = 0;

// Google Sheets API 관련 변수
const googleSheetsApiUrl = 'https://script.google.com/macros/s/AKfycbz6UbYyk-Z1JEEP1BQDmYwGn12PR-b2M8GAakEJAg1_SzixO20UoeA96PggFaHfc5d3/exec'; // 여기에 배포한 Google Apps Script 웹 앱 URL을 입력하세요

// 소리 효과용 AudioContext (선택적으로 사용)
let audioContext;
try {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
  console.log('Web Audio API가 지원되지 않습니다');
}

// 이벤트 리스너 등록
startBtn.addEventListener('click', startTest);
box.addEventListener('click', handleBoxClick);

// 언어 버튼 이벤트 리스너 등록
langButtons.forEach(button => {
  button.addEventListener('click', () => {
    changeLanguage(button.dataset.lang);
  });
});

// 순위표 탭 이벤트 리스너 등록
averageTab.addEventListener('click', () => switchLeaderboardTab('average'));
bestTab.addEventListener('click', () => switchLeaderboardTab('best'));

// 더 보기 버튼 이벤트 리스너
averageShowMoreBtn.addEventListener('click', () => {
  averageLeaderboardPage++;
  fetchLeaderboard('average', false); // 기존 데이터 유지
});

bestShowMoreBtn.addEventListener('click', () => {
  bestLeaderboardPage++;
  fetchLeaderboard('best', false); // 기존 데이터 유지
});

/**
 * 순위표 탭 전환 함수
 * @param {string} tabType - 순위표 유형 ('average' 또는 'best')
 */
function switchLeaderboardTab(tabType) {
  // 현재 탭 갱신
  currentLeaderboardType = tabType;
  
  // 탭 활성화 상태 변경
  if (tabType === 'average') {
    averageTab.classList.add('active');
    bestTab.classList.remove('active');
    averageLeaderboard.classList.remove('hidden');
    bestLeaderboard.classList.add('hidden');
    
    // 데이터가 없으면 로드
    if (averageLeaderboardBody.children.length === 0) {
      fetchLeaderboard('average', true);
    }
  } else {
    bestTab.classList.add('active');
    averageTab.classList.remove('active');
    bestLeaderboard.classList.remove('hidden');
    averageLeaderboard.classList.add('hidden');
    
    // 데이터가 없으면 로드
    if (bestLeaderboardBody.children.length === 0) {
      fetchLeaderboard('best', true);
    }
  }
}

/**
 * 언어 변경 함수
 * @param {string} lang - 새로운 언어 코드 ('en' 또는 'ko')
 */
function changeLanguage(lang) {
  // 유효한 언어인지 확인
  if (!translations[lang]) return;
  
  // 현재 언어 업데이트
  currentLang = lang;
  
  // 버튼 활성화 상태 업데이트
  langButtons.forEach(btn => {
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // 모든 텍스트 업데이트
  updateAllText();
}

/**
 * 모든 텍스트 요소를 현재 언어로 업데이트
 */
function updateAllText() {
  // data-text 속성이 있는 모든 요소 선택
  const elements = document.querySelectorAll('[data-text]');
  
  // 각 요소의 텍스트 업데이트
  elements.forEach(element => {
    const textKey = element.dataset.text;
    if (translations[currentLang][textKey]) {
      element.textContent = translations[currentLang][textKey];
    }
  });
  
  // 특정 요소들 업데이트
  if (!gameActive) {
    box.textContent = translations[currentLang]['ready'];
  }
}

/**
 * 텍스트 가져오기 유틸리티 함수
 * @param {string} key - 번역 키
 * @returns {string} - 번역된 텍스트
 */
function getText(key) {
  return translations[currentLang][key] || key;
}

/**
 * 테스트 시작 함수
 */
function startTest() {
  // 게임 상태 초기화
  times = [];
  round = 0;
  gameActive = true;
  resultsDiv.innerHTML = '';
  instructions.classList.add('hidden');
  startBtn.classList.add('hidden');
  
  // 첫 라운드 시작
  nextRound();
}

/**
 * 다음 라운드 시작 함수
 */
function nextRound() {
  // 대기 상태로 변경
  isWaiting = true;
  tooEarly = false;
  box.style.backgroundColor = '#ccc';
  box.textContent = getText('waiting');
  
  // 1~3초 사이의 랜덤 대기 시간
  const delay = Math.random() * 2000 + 1000;
  waitTime = setTimeout(showSignal, delay);
}

/**
 * 신호 표시 함수
 */
function showSignal() {
  if (!gameActive) return;
  
  // 대기 종료, 클릭 수집 시작
  isWaiting = false;
  box.style.backgroundColor = '#4caf50';
  box.textContent = getText('click');
  startTime = Date.now();
  
  // 소리 효과 (선택적)
  playTone(880, 0.2);
}

/**
 * 박스 클릭 처리 함수
 */
function handleBoxClick() {
  // 게임이 활성화되지 않은 경우 무시
  if (!gameActive) return;
  
  // 대기 중 너무 일찍 클릭한 경우
  if (isWaiting) {
    tooEarly = true;
    clearTimeout(waitTime);
    handleEarlyClick();
    return;
  }
  
  // 타이머가 없는 경우 무시 (이미 클릭했거나 오류)
  if (!startTime) return;
  
  recordReaction();
}

/**
 * 너무 일찍 클릭한 경우 처리
 */
function handleEarlyClick() {
  box.style.backgroundColor = '#f44336';
  box.textContent = getText('too-early');
  playTone(220, 0.3); // 실패 소리
  
  // 1.5초 후 다음 라운드
  setTimeout(() => {
    if (gameActive) nextRound();
  }, 1500);
}

/**
 * 반응 시간 기록 함수
 */
function recordReaction() {
  // 반응 시간 계산
  const reaction = Date.now() - startTime;
  times.push(reaction);
  round++;
  startTime = null;
  
  // 최고 시간 기록 갱신 (최소값)
  if (bestRound === 0 || reaction < bestRound) {
    bestRound = reaction;
  }
  
  // 결과 표시
  box.textContent = `${reaction}${getText('ms')}`;
  playTone(1200, 0.1); // 성공 소리
  
  // 다음 라운드 또는 결과 표시
  if (round < 5) {
    setTimeout(() => {
      if (gameActive) nextRound();
    }, 1000);
  } else {
    setTimeout(showResults, 1000);
  }
}

/**
 * 결과 표시 함수
 */
function showResults() {
  gameActive = false;
  box.style.backgroundColor = '#ccc';
  box.textContent = getText('completed');
  
  // 평균 계산
  const avg = Math.round(times.reduce((a, b) => a + b) / times.length);
  lastScore = avg; // 최종 점수 저장
  
  let speedText = '';
  
  // 속도에 따른 피드백
  if (avg < 200) speedText = getText('amazing');
  else if (avg < 300) speedText = getText('very-fast');
  else if (avg < 400) speedText = getText('excellent');
  else if (avg < 500) speedText = getText('above-average');
  else speedText = getText('keep-practicing');
  
  // 랜덤 도시 이름 생성
  const randomCityName = getRandomCityName();
  tempUserId = Date.now().toString(); // 임시 사용자 ID 생성
  
  // 결과 HTML 생성
  resultsDiv.innerHTML = `
    <ul class="result-list">
      ${times.map((t, i) => `<li class="result-item">${i+1} ${getText('round')}: ${t}${getText('ms')}</li>`).join('')}
    </ul>
    <div class="average">${getText('average')}: ${avg}${getText('ms')}</div>
    <div class="best">${getText('best')}: ${bestRound}${getText('ms')}</div>
    <div>${speedText}</div>

    <!-- 이름 입력 란 (게임 종료 후 입력) -->
    <div class="player-info">
      <label for="player-name-input" data-text="enter-name">${getText('enter-name')}</label>
      <input type="text" id="player-name-input" class="player-name-input" maxlength="20" placeholder="${getText('player-name-placeholder')}" value="${randomCityName}">
    </div>
    
    <div class="result-actions">
      <button id="save-score" class="save-record-btn">${getText('save-score')}</button>
      <button id="retry">${getText('retry')}</button>
    </div>
  `;
  
  // 자동으로 average 점수 저장 (배경에서 처리)
  saveScore(randomCityName, avg, bestRound, 'average', tempUserId, true);
  
  // 자동으로 best 점수 저장 (배경에서 처리)
  saveScore(randomCityName, avg, bestRound, 'best', tempUserId, true);
  
  // 자동으로 순위표 표시
  setTimeout(() => {
    toggleLeaderboard('average');
    leaderboardShowing = true;
  }, 500);
  
  // 점수 저장 버튼 이벤트 리스너 (이름 업데이트용)
  document.getElementById('save-score').addEventListener('click', () => {
    const playerNameInput = document.getElementById('player-name-input');
    const playerName = playerNameInput.value.trim() || randomCityName;
    
    // average 점수 업데이트
    saveScore(playerName, avg, bestRound, 'average', tempUserId, false);
    
    // best 점수 업데이트
    saveScore(playerName, avg, bestRound, 'best', tempUserId, false);
  });
  
  // 다시 시작 버튼 이벤트 리스너
  document.getElementById('retry').addEventListener('click', () => {
    // 지침 표시 상태 복원
    instructions.classList.remove('hidden');
    startBtn.classList.remove('hidden');
    resultsDiv.innerHTML = '';
    
    // 순위표 숨김
    leaderboardSection.classList.add('hidden');
    leaderboardShowing = false;
    
    // 게임 변수 초기화
    bestRound = 0;
    tempUserId = null;
  });
}

/**
 * 소리 재생 함수 (선택적)
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

/**
 * 점수 저장 함수 - Google Sheets API로 점수 저장
 * @param {string} playerName - 플레이어 이름
 * @param {number} avgScore - 평균 반응 속도 점수(ms)
 * @param {number} bestScore - 최고 반응 속도 점수(ms)
 * @param {string} recordType - 저장할 기록 유형 ('average', 'best')
 * @param {string} userId - 사용자 임시 ID (이름 변경 시 필요)
 * @param {boolean} silentMode - 조용한 모드 (로딩 메시지 없음, 자동 저장용)
 */
function saveScore(playerName, avgScore, bestScore, recordType = null, userId = null, silentMode = false) {
  // 오류 처리
  if (!playerName) {
    playerName = getText('anonymous');
  }
  
  // 저장할 기록 유형 확인
  const saveRecordType = recordType || 'average';
  
  // 저장할 점수 값 결정
  const scoreValue = saveRecordType === 'average' ? avgScore : bestScore;
  
  // 일반 모드에서만 저장 중 메시지 표시
  let savingMsg;
  if (!silentMode) {
    savingMsg = document.createElement('div');
    savingMsg.className = 'saving-message';
    savingMsg.textContent = getText('saving');
    resultsDiv.appendChild(savingMsg);
  }
  
  // Google Sheets API URL을 통한 저장 요청 만들기
  let apiUrl = `${googleSheetsApiUrl}?operation=saveScore&playerName=${encodeURIComponent(playerName)}&score=${scoreValue}&recordType=${saveRecordType}`;
  
  // 사용자 ID가 있으면 이름 업데이트 모드
  if (userId) {
    apiUrl += `&userId=${userId}&updateMode=true`;
  }
  
  // API 요청
  fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // 일반 모드에서만 메시지 처리
    if (!silentMode) {
      // 저장 중 메시지 제거
      if (savingMsg && savingMsg.parentNode) {
        resultsDiv.removeChild(savingMsg);
      }
      
      // 저장 성공 메시지 표시
      if (data.success) {
        const successMsg = document.createElement('div');
        successMsg.className = 'save-success';
        successMsg.textContent = getText('score-saved');
        
        if (data.rank > 0) {
          successMsg.textContent += ` ${getText('your-rank')}: ${data.rank}`;
        }
        
        successMsg.setAttribute('data-record-type', saveRecordType);
        resultsDiv.appendChild(successMsg);
      } else {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'save-error';
        errorMsg.textContent = getText('save-error');
        if (data.error) {
          errorMsg.textContent += `: ${data.error}`;
        }
        resultsDiv.appendChild(errorMsg);
      }
    }
    
    // 성공 여부와 상관없이 항상 순위표 갱신
    if (data.success || (!silentMode)) {
      fetchLeaderboard(saveRecordType, true);
    }
  })
  .catch(error => {
    console.error('Error saving score:', error);
    
    // 일반 모드에서만 오류 메시지 표시
    if (!silentMode) {
      // 저장 중 메시지 제거
      if (savingMsg && savingMsg.parentNode) {
        resultsDiv.removeChild(savingMsg);
      }
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'save-error';
      errorMsg.textContent = getText('save-error');
      resultsDiv.appendChild(errorMsg);
    }
  });
}

/**
 * 순위표 가져오기 함수
 * @param {string} recordType - 점수 유형 ('average' 또는 'best')
 * @param {boolean} reset - 페이지 초기화 여부
 */
function fetchLeaderboard(recordType = 'average', reset = false) {
  // 순위표 유형에 따라 변수 설정
  const isAverage = recordType === 'average';
  let currentPage = isAverage ? averageLeaderboardPage : bestLeaderboardPage;
  const leaderboardBody = isAverage ? averageLeaderboardBody : bestLeaderboardBody;
  const leaderboardTable = isAverage ? averageLeaderboardTable : bestLeaderboardTable;
  const showMoreBtn = isAverage ? averageShowMoreBtn : bestShowMoreBtn;
  
  // 페이지 초기화
  if (reset) {
    if (isAverage) {
      averageLeaderboardPage = 1;
      currentPage = 1;
    } else {
      bestLeaderboardPage = 1;
      currentPage = 1;
    }
    leaderboardBody.innerHTML = '';
  }
  
  // 로딩 상태 표시
  leaderboardSection.classList.remove('hidden');
  leaderboardLoading.classList.remove('hidden');
  leaderboardTable.classList.add('hidden');
  showMoreBtn.classList.add('hidden');
  
  // Google Sheets API URL 생성
  const apiUrl = `${googleSheetsApiUrl}?operation=getLeaderboard&recordType=${recordType}&page=${currentPage}&perPage=${leaderboardPerPage}&maxRank=${maxLeaderboardRank}`;
  
  // API 요청
  fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // 로딩 상태 숨김
    leaderboardLoading.classList.add('hidden');
    leaderboardTable.classList.remove('hidden');
    
    if (data.success && data.records && data.records.length > 0) {
      // 순위표 데이터 표시
      renderLeaderboard(data.records, recordType);
      
      // 더 보기 버튼 표시 여부
      const hasMore = data.hasMore || false;
      
      if (isAverage) {
        hasMoreAverageRecords = hasMore;
      } else {
        hasMoreBestRecords = hasMore;
      }
      
      if (hasMore && currentPage * leaderboardPerPage < maxLeaderboardRank) {
        showMoreBtn.classList.remove('hidden');
      } else {
        showMoreBtn.classList.add('hidden');
      }
    } else if (currentPage === 1) {
      // 데이터 없음 메시지
      leaderboardBody.innerHTML = `<tr><td colspan="4">${getText('no-records')}</td></tr>`;
    }
  })
  .catch(error => {
    console.error('Error fetching leaderboard:', error);
    leaderboardLoading.classList.add('hidden');
    leaderboardBody.innerHTML = `<tr><td colspan="4">${getText('save-error')}</td></tr>`;
  });
}

/**
 * 순위표 렌더링 함수
 * @param {Array} records - 순위표 레코드 배열
 * @param {string} recordType - 기록 유형 ('average' 또는 'best')
 */
/**
 * 플레이어 이름 클릭 핸들러 함수
 * @param {Event} event - 클릭 이벤트
 */
function handlePlayerNameClick(event) {
  // 현재 컨테이너 내용 저장
  const mainContainer = document.querySelector('.container');
  const mainContent = mainContainer.innerHTML;
  
  // 플레이어 데이터 추출
  const playerName = event.currentTarget.getAttribute('data-player-name');
  const score = event.currentTarget.getAttribute('data-score');
  const rank = event.currentTarget.getAttribute('data-rank');
  
  // 상세 정보 화면 생성
  mainContainer.innerHTML = `
    <div class="player-detail">
      <h2 data-text="player-details">${getText('player-details')}</h2>
      <div class="detail-card">
        <div class="detail-item">
          <span class="detail-label" data-text="name">${getText('name')}:</span> 
          <span class="detail-value">${playerName}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label" data-text="rank">${getText('rank')}:</span> 
          <span class="detail-value">${rank}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label" data-text="score">${getText('score')}:</span> 
          <span class="detail-value">${score}${getText('ms')}</span>
        </div>
      </div>
      
      <div class="detail-buttons">
        <button id="back-to-leaderboard" class="detail-btn" data-text="back-to-leaderboard">${getText('back-to-leaderboard')}</button>
        <button id="restart-game" class="detail-btn" data-text="restart-game">${getText('restart-game')}</button>
        <a href="https://jaylikescode.wordpress.com" target="_blank" class="detail-btn see-more-btn" data-text="see-more">${getText('see-more')}</a>
      </div>
    </div>
  `;
  
  // 버튼 이벤트 리스너
  document.getElementById('back-to-leaderboard').addEventListener('click', () => {
    // 원래 내용으로 복원
    mainContainer.innerHTML = mainContent;
    
    // 이벤트 다시 연결
    attachPlayerNameClickEvents();
  });
  
  document.getElementById('restart-game').addEventListener('click', () => {
    // 게임 다시 시작
    location.reload();
  });
}

/**
 * 순위표의 플레이어 이름에 클릭 이벤트 연결
 */
function attachPlayerNameClickEvents() {
  const playerNames = document.querySelectorAll('.player-name-clickable');
  
  playerNames.forEach(nameElement => {
    // 기존 이벤트 제거 후 다시 연결 (중복 방지)
    nameElement.removeEventListener('click', handlePlayerNameClick);
    nameElement.addEventListener('click', handlePlayerNameClick);
  });
}

function renderLeaderboard(records, recordType = 'average') {
  // 순위표 유형에 따른 변수 설정
  const isAverage = recordType === 'average';
  const currentPage = isAverage ? averageLeaderboardPage : bestLeaderboardPage;
  const leaderboardBody = isAverage ? averageLeaderboardBody : bestLeaderboardBody;
  
  // 이전 데이터 새로 그릴 때는 테이블 지우기
  if (currentPage === 1) {
    leaderboardBody.innerHTML = '';
  }
  
  records.forEach((record, index) => {
    const rank = (currentPage - 1) * leaderboardPerPage + index + 1;
    
    // 최대 100등까지만 표시
    if (rank > maxLeaderboardRank) return;
    
    const row = document.createElement('tr');
    
    // 현재 사용자의 기록인지 확인 (userId를 통해)
    const isCurrentUser = tempUserId && record.user_id === tempUserId;
    
    // 상위 3등은 특별하게 표시
    if (rank <= 3) {
      row.classList.add('top-three');
      if (rank === 1) row.classList.add('first-place');
      else if (rank === 2) row.classList.add('second-place');
      else if (rank === 3) row.classList.add('third-place');
    }
    
    // 현재 사용자 기록은 특별하게 표시
    if (isCurrentUser) {
      row.classList.add('current-user-score');
    }
    
    // 날짜 포맷팅
    const recordDate = new Date(record.datetime);
    const formattedDate = recordDate.toLocaleDateString() + ' ' + 
                          recordDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 플레이어 이름 표시 (현재 플레이어라면 색상 강조)
    const playerNameDisplay = isCurrentUser ? 
      `<span class="current-user-name player-name-clickable" data-player-name="${record.player_name}" data-score="${record.score}" data-rank="${rank}">${record.player_name}</span>` : 
      `<span class="player-name-clickable" data-player-name="${record.player_name}" data-score="${record.score}" data-rank="${rank}">${record.player_name}</span>`;
    
    // 행 내용 생성
    row.innerHTML = `
      <td>${rank}</td>
      <td>${playerNameDisplay}</td>
      <td>${record.score}${getText('ms')}</td>
      <td>${formattedDate}</td>
    `;
    
    leaderboardBody.appendChild(row);
  });
  
  // 이름 클릭 이벤트 연결
  attachPlayerNameClickEvents();
}

/**
 * 순위표 표시 토글 함수
 * @param {string} tabType - 탭 유형 (선택적, 기본값은 현재 탭)
 */
function toggleLeaderboard(tabType = null) {
  if (leaderboardShowing) {
    leaderboardSection.classList.add('hidden');
    leaderboardShowing = false;
  } else {
    leaderboardShowing = true;
    
    // 탭 유형이 지정되지 않으면 현재 탭 사용
    if (tabType) {
      switchLeaderboardTab(tabType);
    } else {
      switchLeaderboardTab(currentLeaderboardType);
    }
  }
}

/**
 * 랜덤 도시 이름 생성 함수
 * @returns {string} 랜덤한 도시 이름
 */
function getRandomCityName() {
  const citiesEn = [
    'Seoul', 'Tokyo', 'Paris', 'London', 'New York', 'Sydney', 'Berlin', 'Rome', 'Cairo',
    'Toronto', 'Moscow', 'Madrid', 'Beijing', 'Amsterdam', 'Bangkok', 'Dubai', 'Singapore',
    'Athens', 'Vienna', 'Venice', 'Istanbul', 'Prague', 'Barcelona', 'Zurich', 'Munich',
    'Milan', 'Miami', 'Chicago', 'Montreal', 'Vancouver', 'Stockholm', 'Helsinki', 'Oslo',
    'Dublin', 'Brussels', 'Budapest', 'Warsaw', 'Lisbon', 'Copenhagen', 'Florence', 'Geneva'
  ];
  
  const citiesKo = [
    '서울', '뉴욕', '오사카', '키오토', '이스탄불', '베를를린', '마드리드', '로마',
    '토론토', '파리', '마우사', '바르셀로나', '쉼통가죽', '버민엇', '마닐라',
    '도켄', '임스테르런', '카이로', '두바이', '스토크홀름', '헬싱키',
    '오슬로', '더블린', '브부셀', '부다페스트', '바르샤바', '리스번', '코펜하겐',
    '플로렌스', '제네바', '만치안', '다라스', '셉빗디오'
  ];
  
  // 현재 언어에 따라 도시 목록 선택
  const cities = currentLang === 'en' ? citiesEn : citiesKo;
  
  // 랜덤 인덱스 선택
  const randomIndex = Math.floor(Math.random() * cities.length);
  
  return cities[randomIndex];
}

/**
 * 게임 종료 후 페이지 로드시 실행
*/
// 기본 언어 설정 초기화
(function() {
  // 만약 브라우저 언어가 영어라면 영어로 초기화
  if (navigator.language && navigator.language.startsWith('en')) {
    changeLanguage('en');
  } else {
    changeLanguage('ko'); // 기본값 한국어
  }
  
  // 더 보기 버튼 이벤트 연결
  showMoreBtn.addEventListener('click', () => {
    leaderboardPage++;
    fetchLeaderboard(false); // 기존 데이터 유지하면서 추가 로드
  });
})();
