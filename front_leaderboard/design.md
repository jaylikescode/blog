# 메인 페이지 우측 리더보드 섹션 설계 문서

## 개발 접근 방식
이 문서는 메인 페이지 우측에 게임 리더보드 섹션을 구현하기 위한 설계 및 개발 접근 방식을 설명합니다. 핵심 기능부터 단계적으로 구현하여 기본 기능을 먼저 확보한 후 점진적으로 기능을 확장하는 방식으로 진행합니다.

## 개발 우선순위 및 단계

### 1단계: 기본 구조 및 레이아웃 구현 (핵심)
- **HTML 구조 추가**
  - `blog/index.html`에 우측 세로 리더보드 섹션을 위한 기본 컨테이너 추가
  - "명예의 전당" 제목 및 기본 UI 요소 배치
  - 리액션 테스트 리더보드 테이블 구조 설정

- **CSS 스타일 기본 구현**
  - 우측 세로 섹션 기본 레이아웃 스타일 적용
  - 메인 콘텐츠와 리더보드 섹션의 너비 비율 조정
  - 테이블 기본 스타일링

- **반응형 디자인 기본 구조**
  - 데스크톱에서는 우측 배치, 모바일에서는 하단 배치 구현
  - 기본적인 미디어 쿼리 설정

### 2단계: 데이터 연동 및 기본 기능 구현 (핵심)
- **Firebase 연동**
  - 리액션 테스트의 기존 Firebase 데이터베이스 연결 코드 활용
  - 리더보드 데이터 가져오기 기능 구현

- **기본 리더보드 표시 기능**
  - 상위 10명의 기록 표시 기능 구현
  - 순위, 이름, 점수, 날짜 정보 표시
  - 현재 사용자 기록 강조 표시

- **"더 보기" 버튼 기능 구현**
  - 버튼 클릭 시 리액션 테스트 게임 페이지로 이동 기능

### 3단계: 다국어 지원 및 UI 개선 (중요)
- **다국어 지원 구현**
  - 기존 번역 시스템과 연동
  - 리더보드 관련 텍스트에 대한 번역도 추가
  - 언어 전환 시 리더보드 텍스트 업데이트 기능

- **UI 개선 및 사용자 경험 향상**
  - 데이터 로딩 중 상태 표시
  - 오류 발생 시 대체 UI 표시
  - 트랜지션 및 애니메이션 효과 추가

### 4단계: 확장성 및 추가 기능 구현 (선택적)
- **확장 가능한 게임 리더보드 구조 구현**
  - 여러 게임의 리더보드를 추가할 수 있는 구조 설계
  - 게임별 탭 또는 선택 메뉴 구현

- **성능 최적화**
  - 데이터 캐싱 메커니즘 구현
  - 비동기 로딩 및 렌더링 최적화
  - 불필요한 리렌더링 방지

- **추가 기능 구현 (향후)**
  - 시간별 필터링 (일간/주간/월간/전체)
  - 사용자별 필터링 (본인 순위 중심)
  - 결과 공유 기능

## 기술적 설계

### HTML 구조
```html
<!-- 메인 컨텐츠 영역과 리더보드 섹션을 감싸는 컨테이너 -->
<div class="main-content-wrapper">
  <!-- 기존 메인 컨텐츠 -->
  <main class="main-content">
    <!-- 기존 컨텐츠 유지 -->
  </main>
  
  <!-- 새로운 우측 리더보드 섹션 -->
  <aside class="leaderboard-sidebar">
    <h2 data-text="hall-of-fame">명예의 전당</h2>
    
    <!-- 리액션 테스트 리더보드 -->
    <div class="game-leaderboard" id="reaction-leaderboard">
      <h3 data-text="reaction-leaderboard">리액션 테스트</h3>
      
      <!-- 로딩 상태 표시 -->
      <div class="leaderboard-loading" id="sidebar-leaderboard-loading" data-text="loading">로딩 중...</div>
      
      <!-- 리더보드 테이블 -->
      <table class="sidebar-leaderboard-table">
        <thead>
          <tr>
            <th data-text="rank">순위</th>
            <th data-text="name">이름</th>
            <th data-text="score">기록</th>
            <th data-text="date">날짜</th>
          </tr>
        </thead>
        <tbody id="sidebar-leaderboard-body">
          <!-- 리더보드 데이터가 여기에 삽입됩니다 -->
        </tbody>
      </table>
      
      <!-- 더 보기 버튼 -->
      <div class="show-more-container">
        <button class="show-more-btn" data-game="reaction" data-text="show-more">더 보기</button>
      </div>
    </div>
    
    <!-- 추가 게임 리더보드는 이 아래에 배치됩니다 -->
  </aside>
</div>
```

### CSS 스타일 (기본)
```css
/* 메인 컨텐츠와 리더보드 섹션 레이아웃 */
.main-content-wrapper {
  display: flex;
  flex-direction: row;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  flex: 1;
  min-width: 0; /* 텍스트 오버플로우 방지 */
}

.leaderboard-sidebar {
  width: 300px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  padding: 15px;
  margin-bottom: 30px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content-wrapper {
    flex-direction: column;
  }
  
  .leaderboard-sidebar {
    width: 100%;
    margin-top: 20px;
  }
}

/* 리더보드 테이블 스타일 */
.sidebar-leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-top: 10px;
}

.sidebar-leaderboard-table th,
.sidebar-leaderboard-table td {
  padding: 6px 4px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.sidebar-leaderboard-table th {
  font-weight: bold;
  color: #4a89dc;
}

/* 현재 사용자 강조 표시 */
.sidebar-leaderboard-table tr.current-user {
  background-color: #f0f7ff;
  font-weight: bold;
}

/* 더 보기 버튼 */
.show-more-btn {
  background-color: #4a89dc;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  width: 100%;
  transition: background-color 0.3s ease;
}

.show-more-btn:hover {
  background-color: #3b78cc;
}

/* 로딩 상태 표시 */
.leaderboard-loading {
  text-align: center;
  padding: 10px;
  color: #777;
  font-style: italic;
}

.leaderboard-loading.hidden {
  display: none;
}
```

### JavaScript 모듈 (핵심 기능)
```javascript
// 메인 페이지 리더보드 모듈
const sidebarLeaderboard = {
  // 초기화
  init: function() {
    // Firebase 초기화 확인
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK is not loaded');
      this.showError('리더보드를 불러올 수 없습니다');
      return;
    }
    
    // 이벤트 리스너 설정
    this.setupEventListeners();
    
    // 리더보드 데이터 로드
    this.loadLeaderboardData();
  },
  
  // 이벤트 리스너 설정
  setupEventListeners: function() {
    // 더 보기 버튼 클릭 이벤트
    const showMoreBtn = document.querySelector('.leaderboard-sidebar .show-more-btn');
    if (showMoreBtn) {
      showMoreBtn.addEventListener('click', function() {
        const game = this.getAttribute('data-game');
        if (game === 'reaction') {
          // 리액션 테스트 게임 페이지로 이동
          window.location.href = 'reaction_test/react_test.html';
        }
      });
    }
    
    // 언어 변경 이벤트 감지 및 처리
    document.querySelectorAll('.language-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // 언어 변경 후 텍스트 업데이트
        setTimeout(() => this.updateTranslations(), 100);
      });
    });
  },
  
  // 리더보드 데이터 로드
  loadLeaderboardData: function() {
    // 로딩 상태 표시
    this.showLoading(true);
    
    // Firebase에서 리더보드 데이터 가져오기
    const leaderboardRef = firebase.database().ref('leaderboard');
    leaderboardRef.orderByChild('score').limitToFirst(10).once('value')
      .then(snapshot => {
        const data = [];
        snapshot.forEach(childSnapshot => {
          data.push(childSnapshot.val());
        });
        
        // 점수 기준 정렬 (낮은 값이 더 좋음 - 반응 속도가 빠른 것)
        data.sort((a, b) => a.score - b.score);
        
        // 리더보드 표시
        this.displayLeaderboard(data);
        this.showLoading(false);
      })
      .catch(error => {
        console.error('Error loading leaderboard data:', error);
        this.showError('리더보드 데이터를 불러오는 중 오류가 발생했습니다');
      });
  },
  
  // 리더보드 표시
  displayLeaderboard: function(data) {
    const leaderboardBody = document.getElementById('sidebar-leaderboard-body');
    if (!leaderboardBody) return;
    
    // 데이터가 없는 경우
    if (!data || data.length === 0) {
      leaderboardBody.innerHTML = '<tr><td colspan="4" class="no-records" data-text="no-records">기록이 없습니다</td></tr>';
      return;
    }
    
    // 테이블 내용 생성
    leaderboardBody.innerHTML = '';
    
    data.forEach((record, index) => {
      const row = document.createElement('tr');
      
      // 현재 사용자의 기록인지 확인
      const currentUserId = this.getCurrentUserId();
      const isCurrentUser = record.id && record.id.startsWith(currentUserId);
      if (isCurrentUser) {
        row.className = 'current-user';
      }
      
      // 순위
      const rankCell = document.createElement('td');
      rankCell.textContent = (index + 1);
      row.appendChild(rankCell);
      
      // 이름
      const nameCell = document.createElement('td');
      nameCell.textContent = record.playerName;
      row.appendChild(nameCell);
      
      // 점수
      const scoreCell = document.createElement('td');
      scoreCell.textContent = record.score + 'ms';
      row.appendChild(scoreCell);
      
      // 날짜
      const dateCell = document.createElement('td');
      dateCell.textContent = record.date;
      row.appendChild(dateCell);
      
      leaderboardBody.appendChild(row);
    });
    
    // 번역 업데이트
    this.updateTranslations();
  },
  
  // 로딩 상태 표시/숨김
  showLoading: function(show) {
    const loadingElement = document.getElementById('sidebar-leaderboard-loading');
    if (loadingElement) {
      if (show) {
        loadingElement.classList.remove('hidden');
      } else {
        loadingElement.classList.add('hidden');
      }
    }
  },
  
  // 오류 메시지 표시
  showError: function(message) {
    const leaderboardBody = document.getElementById('sidebar-leaderboard-body');
    if (leaderboardBody) {
      this.showLoading(false);
      leaderboardBody.innerHTML = `<tr><td colspan="4" class="error-message">${message}</td></tr>`;
    }
  },
  
  // 현재 사용자 ID 가져오기
  getCurrentUserId: function() {
    // 기존 리액션 테스트 게임에서 사용자 ID 가져오기
    if (window.gameLeaderboard && typeof window.gameLeaderboard.getCurrentUserId === 'function') {
      return window.gameLeaderboard.getCurrentUserId();
    }
    
    // 로컬 스토리지에서 가져오기
    let userId = localStorage.getItem('reaction_game_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('reaction_game_user_id', userId);
    }
    return userId;
  },
  
  // 번역 업데이트
  updateTranslations: function() {
    // 현재 언어 가져오기
    const currentLang = document.documentElement.lang || 'ko';
    
    // 번역 적용
    document.querySelectorAll('[data-text]').forEach(element => {
      const key = element.getAttribute('data-text');
      if (window.translations && window.translations[currentLang] && window.translations[currentLang][key]) {
        element.textContent = window.translations[currentLang][key];
      }
    });
  }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  // Firebase SDK가 로드된 후 초기화
  if (typeof firebase !== 'undefined') {
    sidebarLeaderboard.init();
  } else {
    // Firebase SDK가 아직 로드되지 않은 경우, 로드 완료 후 초기화
    window.addEventListener('load', function() {
      setTimeout(() => sidebarLeaderboard.init(), 500);
    });
  }
});
```

## 구현 계획 (시간순)

### 1주차: 기본 구조 및 레이아웃 (핵심)
- HTML 구조 추가 - 메인 페이지에 우측 세로 섹션 추가
- 기본 CSS 스타일 적용 - 레이아웃 및 반응형 디자인 구현
- 리더보드 테이블 기본 스타일링

### 2주차: 데이터 연동 및 기본 기능 (핵심)
- Firebase 연동 코드 구현
- 리더보드 데이터 로드 및 표시 기능 구현
- 현재 사용자 강조 표시 기능 구현
- "더 보기" 버튼 기능 구현

### 3주차: 다국어 지원 및 UI 개선 (중요)
- 다국어 지원 구현 - 번역 키 추가 및 적용
- 로딩 및 오류 상태 UI 구현
- 전반적인 UI 개선 및 애니메이션 효과 추가

### 4주차 이후: 확장성 및 추가 기능 (선택적)
- 확장 가능한 게임 리더보드 구조 구현
- 캐싱 메커니즘 구현 및 성능 최적화
- 추가 필터링 옵션 구현 (시간별, 사용자별)
- 결과 공유 기능 등 추가 기능 구현

## 테스트 및 배포

1. **단위 테스트**
   - Firebase 연동 기능 테스트
   - 리더보드 데이터 로드 및 표시 기능 테스트
   - 다국어 지원 테스트

2. **통합 테스트**
   - 메인 페이지와의 통합 테스트
   - 다양한 화면 크기에서의 반응형 디자인 테스트
   - 기존 기능과의 충돌 여부 확인

3. **배포 및 모니터링**
   - 구현 완료 후 페이지 배포
   - 사용자 피드백 수집 및 개선 사항 식별
   - 추가 기능에 대한 우선순위 조정
