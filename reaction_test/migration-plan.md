# Firebase에서 로컬 파일 스토리지로의 마이그레이션 계획

## 개요
이 문서는 반응 속도 테스트 애플리케이션의 순위표(리더보드) 기능을 Firebase에서 로컬 파일 스토리지로 마이그레이션하기 위한 계획을 설명합니다.

## 현재 아키텍처 분석
현재 시스템은 다음과 같은 구조로 되어 있습니다:

1. **Firebase Realtime Database**를 사용하여 순위표 데이터 저장 및 검색
2. Firebase 연결 실패 시 **localStorage**를 폴백(fallback) 메커니즘으로 사용
3. 실시간 업데이트 기능 (Firebase 'child_added' 이벤트 활용)
4. 최대 100개의 순위 기록 유지
5. 점수별 정렬 (오름차순)

## 마이그레이션 목표
1. Firebase 의존성 제거
2. 모든 순위표 데이터를 로컬 파일에 저장
3. 기존 기능 유지 (정렬, 필터링, 표시)
4. 사용자 경험 유지 (지연 시간, UI 등)
5. 안정적인 데이터 보존 및 무결성 보장

## 구현 전략

### 1. 로컬 파일 시스템 액세스 방식
웹 애플리케이션에서 로컬 파일 시스템에 직접 액세스하는 것은 보안상의 제한이 있습니다. 다음과 같은 접근 방법을 사용할 수 있습니다:

#### 옵션 A: Electron 래퍼 사용 (데스크톱 애플리케이션으로 변환)
* 장점: 파일 시스템에 직접 접근 가능
* 단점: 배포 및 설치 방식 변경, 추가 종속성

#### 옵션 B: IndexedDB 활용 (브라우저 내장 기능)
* 장점: 모든 현대 브라우저 지원, 큰 데이터에 적합, 웹 형태 유지
* 단점: localStorage보다 복잡한 API

#### 옵션 C: 내보내기/가져오기 기능 추가
* 장점: 사용자가 명시적으로 데이터 백업 가능
* 단점: 자동 저장은 여전히 클라이언트 스토리지 필요

**권장 접근법: 옵션 B + 옵션 C 조합**
IndexedDB를 주 저장소로 사용하고, 사용자가 수동으로 데이터를 내보내고 가져올 수 있는 기능 추가

### 2. 데이터 모델 및 마이그레이션
현재 데이터 구조는 유지하되, Firebase 참조 대신 IndexedDB 객체 저장소를 사용합니다:

```javascript
{
  player_name: String,
  score: Number,
  datetime: String (ISO format),
  user_id: String
}
```

### 3. API 및 인터페이스 변경
기존 API 함수명과 인터페이스를 유지하여 변경 최소화:
- `fetchLeaderboardFromFirebase` → `fetchLeaderboard`
- `saveRecordToFirebase` → `saveRecord`

### 4. UI 업데이트
- Firebase 연결 상태 표시 제거
- 내보내기/가져오기 버튼 추가 (선택적)
- 로딩 인디케이터 유지 (IndexedDB 작업도 비동기)

## 개발 단계

### 1단계: 기반 코드 준비 (1일)
- IndexedDB 래퍼 클래스 구현
- 테스트 유틸리티 개발

### 2단계: 핵심 기능 구현 (2일)
- `leaderboard.js` 재구성
- 데이터 저장 및 검색 로직 전환
- 레거시 코드 제거 (Firebase 관련)

### 3단계: 추가 기능 및 테스트 (1일)
- 내보내기/가져오기 기능 구현
- 실시간 업데이트 대체 방안 구현
- 엣지 케이스 처리

### 4단계: QA 및 문서화 (1일)
- 철저한 테스트
- 문서 업데이트
- 최종 코드 정리

## 구현 세부 사항

### IndexedDB 초기화
```javascript
function initLeaderboardDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ReactionGameDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // leaderboard 객체 저장소 생성
      if (!db.objectStoreNames.contains('leaderboard')) {
        const store = db.createObjectStore('leaderboard', { keyPath: 'user_id' });
        store.createIndex('by_score', 'score', { unique: false });
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject('IndexedDB 초기화 실패: ' + event.target.errorCode);
    };
  });
}
```

### 데이터 저장
```javascript
function saveRecord(record) {
  return new Promise((resolve, reject) => {
    const dbPromise = initLeaderboardDB();
    dbPromise.then(db => {
      const tx = db.transaction('leaderboard', 'readwrite');
      const store = tx.objectStore('leaderboard');
      store.put(record);
      
      tx.oncomplete = () => {
        resolve(true);
      };
      
      tx.onerror = () => {
        reject(tx.error);
      };
    });
  });
}
```

### 데이터 검색
```javascript
function fetchLeaderboard() {
  return new Promise((resolve, reject) => {
    const dbPromise = initLeaderboardDB();
    dbPromise.then(db => {
      const tx = db.transaction('leaderboard', 'readonly');
      const store = tx.objectStore('leaderboard');
      const index = store.index('by_score');
      const request = index.getAll();
      
      request.onsuccess = () => {
        // 점수별 오름차순 정렬
        const result = request.result.sort((a, b) => a.score - b.score);
        // 상위 100개만 유지
        const limitedResult = result.slice(0, 100);
        resolve(limitedResult);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  });
}
```

### 파일 내보내기/가져오기
```javascript
function exportLeaderboard() {
  fetchLeaderboard().then(data => {
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reaction_game_leaderboard.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  });
}

function importLeaderboard(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // 가져온 데이터 저장
        const dbPromise = initLeaderboardDB();
        dbPromise.then(db => {
          const tx = db.transaction('leaderboard', 'readwrite');
          const store = tx.objectStore('leaderboard');
          
          // 기존 데이터 삭제
          store.clear();
          
          // 새 데이터 추가
          data.forEach(record => {
            store.put(record);
          });
          
          tx.oncomplete = () => {
            resolve(true);
          };
          
          tx.onerror = () => {
            reject(tx.error);
          };
        });
      } catch (e) {
        reject('유효하지 않은 JSON 형식: ' + e.message);
      }
    };
    
    reader.onerror = () => {
      reject('파일 읽기 오류');
    };
    
    reader.readAsText(file);
  });
}
```

## 리스크 및 완화 방안

### 1. 브라우저 호환성
- **리스크**: 일부 구형 브라우저는 IndexedDB를 지원하지 않음
- **완화**: localStorage 폴백 메커니즘 유지 또는 IndexedDB 폴리필 사용

### 2. 데이터 마이그레이션
- **리스크**: 기존 Firebase 사용자 데이터 손실
- **완화**: 첫 실행 시 Firebase에서 데이터 가져와서 로컬 DB에 저장

### 3. 저장 공간 제한
- **리스크**: 브라우저 저장소 할당량 초과
- **완화**: 데이터 크기 모니터링 및 필요시 레코드 수 축소

### 4. 다중 기기 사용
- **리스크**: 사용자가 여러 기기에서 사용 시 데이터 분산
- **완화**: 내보내기/가져오기 기능으로 수동 동기화 지원

## 테스트 계획
1. 단위 테스트: 각 함수의 독립적 테스트
2. 통합 테스트: 전체 리더보드 기능 테스트
3. 엣지 케이스: 대용량 데이터, 오류 상황 등
4. 사용자 테스트: 실제 사용 시나리오

## 결론
이 마이그레이션은 애플리케이션을 Firebase 의존성으로부터 해방시키고, 사용자의 데이터를 로컬에서 완전히 제어할 수 있게 합니다. IndexedDB를 사용하면 기존 기능을 유지하면서도 로컬 파일 시스템과 비슷한 수준의 데이터 저장 기능을 제공할 수 있습니다.
