# 블로그 댓글 시스템 구현 계획

## 1. 프로젝트 준비 및 Firebase 설정

### 1.1 Firebase 프로젝트 확인
- 기존 Reaction Test에서 사용 중인 Firebase 프로젝트 확인
- Firebase Realtime Database 구조 설계
- 보안 규칙 설정 (읽기: 모두 허용, 쓰기: 인증된 사용자만)

### 1.2 Firebase SDK 통합
- 필요한 Firebase 모듈 확인 (database, auth)
- 기존 SDK 코드 재사용 및 확장
- Firebase 초기화 코드 작성
```
// Firebase SDK snippet
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCinlrgQvNZu4OzIkEzVibffi7yUofoeh4",
  authDomain: "jay-blog-comment.firebaseapp.com",
  projectId: "jay-blog-comment",
  storageBucket: "jay-blog-comment.firebasestorage.app",
  messagingSenderId: "89428938336",
  appId: "1:89428938336:web:651098e8adbf2c8b873d05",
  measurementId: "G-E6GGXP1Y1H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

### 1.3 데이터 모델 설계
```javascript
// 댓글 데이터 구조
{
  "comments": {
    "comment_id_1": {
      "author": "작성자 이름",
      "content": "댓글 내용",
      "timestamp": 1621500000000,
      "parent_id": null,  // 최상위 댓글
      "depth": 0,        // 댓글 깊이
      "ip_hash": "해시된 IP 주소" // 차단 목적
    },
    "comment_id_2": {
      "author": "대댓글 작성자",
      "content": "대댓글 내용",
      "timestamp": 1621500100000,
      "parent_id": "comment_id_1", // 부모 댓글 ID
      "depth": 1,        // 대댓글 깊이
      "ip_hash": "해시된 IP 주소"
    }
  },
  "blocked_users": {
    "ip_hash_1": true,
    "name_1": true
  },
  "moderation": {
    "banned_words": {
      "ko": ["금지어목록"],
      "en": ["banned words list"]
    },
    "use_external_api": true,
    "last_updated": 1621500000000
  }
}
```

## 2. 기본 UI 컴포넌트 개발

### 2.1 댓글 섹션 HTML 구조
```html
<div class="comment-section">
  <!-- 댓글 입력 폼 -->
  <div class="comment-form">
    <h3>댓글 남기기</h3>
    <input type="text" id="comment-author" placeholder="이름" maxlength="30">
    <textarea id="comment-content" placeholder="댓글을 입력하세요 (최대 200자)" maxlength="200"></textarea>
    <div class="comment-form-footer">
      <span class="char-count">0/200</span>
      <button id="submit-comment">등록</button>
    </div>
  </div>
  
  <!-- 댓글 목록 -->
  <div class="comments-container">
    <h3>댓글 목록</h3>
    <div id="comments-list"></div>
    <button id="load-more-comments" class="hidden">더보기</button>
  </div>
</div>
```

### 2.2 댓글 카드 템플릿
```html
<!-- 단일 댓글 템플릿 -->
<div class="comment-card" data-id="${commentId}" data-depth="${depth}">
  <div class="comment-header">
    <span class="comment-author">${author}</span>
    <span class="comment-date">${formattedDate}</span>
  </div>
  <div class="comment-body">
    <p class="comment-content">${processedContent}</p>
    <!-- 이미지가 있는 경우 -->
    <div class="comment-media">${mediaHTML}</div>
  </div>
  <div class="comment-footer">
    <button class="reply-button">답글</button>
    <!-- 작성자인 경우에만 표시 -->
    <button class="edit-button hidden">수정</button>
    <button class="delete-button hidden">삭제</button>
  </div>
  <!-- 대댓글 컨테이너 -->
  <div class="replies-container"></div>
  <!-- 대댓글 입력폼 (숨김 상태로 시작) -->
  <div class="reply-form hidden"></div>
</div>
```

### 2.3 CSS 스타일링
- 댓글 섹션 기본 스타일 정의
- 댓글 카드 디자인 구현
- 중첩 댓글 시각적 계층 구조 구현 (들여쓰기, 경계선)
- 반응형 디자인 적용 (모바일 및 데스크톱)
- 라이트/다크 모드 지원 (전체 사이트 테마 연동)

## 3. 핵심 기능 구현

### 3.1 댓글 모듈 초기화
```javascript
/**
 * 댓글 시스템 초기화 함수
 */
function initCommentSystem() {
  // Firebase 초기화 확인
  if (!firebase || !firebase.database) {
    console.error("Firebase가 초기화되지 않았습니다.");
    return;
  }
  
  // 댓글 데이터베이스 참조 생성
  commentsRef = firebase.database().ref('comments');
  
  // 이벤트 리스너 설정
  setupCommentEventListeners();
  
  // 초기 댓글 로드
  loadComments();
}
```

### 3.2 댓글 작성 기능
- 사용자 입력 검증 (이름, 내용, 금지어 필터링)
- 댓글 객체 생성 및 Firebase에 저장
- 이미지/GIF URL 감지 및 미리보기 생성
- 작성 완료 후 폼 초기화

### 3.3 댓글 로드 및 표시
- 최신순 정렬로 댓글 로드
- 계층 구조로 대댓글 표시
- 페이지네이션 구현 (초기 10개 로드, 더보기 버튼)
- 날짜 형식 변환 (상대적 표시: "5분 전", "어제" 등)

### 3.4 댓글 실시간 업데이트
- Firebase 실시간 이벤트 리스너 설정
- 새 댓글 추가 시 DOM 업데이트
- 수정/삭제 이벤트 처리

## 4. 대댓글 기능 구현

### 4.1 대댓글 입력 UI
- 답글 버튼 클릭 시 입력 폼 표시
- 부모 댓글 ID 및 깊이 정보 저장
- 최대 10단계 깊이 제한 설정

### 4.2 대댓글 표시 로직
- 댓글 트리 구조 생성 알고리즘 구현
- 깊이에 따른 시각적 구분 적용
- 대댓글 접기/펼치기 기능

## 5. 미디어 지원 기능

### 5.1 URL 자동 감지
- 정규식을 사용한 이미지/GIF URL 감지
- 지원 형식 확인 (jpg, jpeg, png, gif, webp)

### 5.2 미디어 렌더링
- 감지된 이미지 URL을 `<img>` 태그로 변환
- 반응형 이미지 크기 조정
- 이미지 로딩 오류 처리

## 6. 관리자 및 콘텐츠 모더레이션 기능 구현

### 6.1 관리자 인터페이스
- 관리자 인증 메커니즘 구현
- 댓글 관리 패널 UI 설계
- 차단된 사용자 관리 인터페이스

### 6.2 모더레이션 기능
- 댓글 숨김/삭제 기능
- 사용자 차단 기능 (IP 해시, 이름 기반)
- 금지어 필터 관리

### 6.3 콘텐츠 모더레이션 통합

#### 6.3.1 콘텐츠 필터링 접근 방식

아동 친화적인 블로그를 위한 콘텐츠 모더레이션은 다중 레이어 접근 방식으로 구현합니다:

1. **기본 금지어 필터**: 한국어 및 영어 기반 부적절한 단어 목록 사용
2. **패턴 인식**: 변형된 욕설, 회피 시도 감지 (예: 자음만 사용, 특수문자 대체)
3. **AI 기반 콘텐츠 분석**: 제3자 API 서비스 활용
4. **자동 + 수동 모더레이션**: 의심스러운 콘텐츠는 관리자 검토 대기열에 추가

#### 6.3.2 콘텐츠 모더레이션 서비스 옵션

**Firebase 기반 솔루션:**
- **Firebase Cloud Functions + Google Cloud Natural Language API**: 텍스트 분석을 통한 부적절한 콘텐츠 감지
- 구현 예시:
  ```javascript
  // Cloud Function으로 댓글 필터링 구현
  exports.moderateComment = functions.database.ref('/comments/{commentId}')
      .onCreate(async (snapshot, context) => {
          const comment = snapshot.val();
          const text = comment.content;
          
          // 1. 기본 금지어 필터 확인
          if(containsBannedWords(text)) {
              return snapshot.ref.update({flagged: true, visible: false});
          }
          
          // 2. Google Cloud Natural Language API로 콘텐츠 분석
          try {
              const result = await analyzeTextWithNLP(text);
              if(result.inappropriate) {
                  return snapshot.ref.update({flagged: true, visible: false});
              }
          } catch (error) {
              console.error('Content moderation error:', error);
          }
          
          return null;
      });
  ```

**무료/오픈소스 옵션:**
- **bad-words**: 다국어 부적절한 단어 감지 JavaScript 라이브러리
- **profanity-filter**: 한국어 지원이 포함된 확장 가능한 필터 라이브러리
- 커스텀 단어 목록: 한국 정부 기관 및 교육부의 청소년 유해 단어 목록 활용

**상용 서비스 (API 기반):**
- **Sightengine**: 텍스트 및 이미지 모더레이션 API 제공, 다국어 지원
- **ModerationAPI.com**: Firebase 전용 확장 기능 제공, 기본 모더레이션 100% 무료
- **Microsoft Azure Content Moderator**: 텍스트, 이미지, 비디오 모더레이션 서비스

#### 6.3.3 한국어 금지어 목록 소스
- 방송통신심의위원회 제공 청소년 유해단어 목록
- 주요 포털 사이트 (네이버, 다음)의 금지어 필터링 참조
- 교육부 학교폭력 예방 관련 부적절 언어 목록
- 여성가족부 청소년보호 관련 유해단어 목록

#### 6.3.4 구현 방법

**클라이언트 측 1차 필터링:**
```javascript
// 기본 금지어 목록으로 1차 필터링
function filterInappropriateContent(text) {
  // 금지어 목록 로드 (Firebase에서 가져옴)
  const bannedWords = currentLanguage === 'ko' ? bannedWordsKo : bannedWordsEn;
  
  // 기본 텍스트 매칭
  for (const word of bannedWords) {
    if (text.toLowerCase().includes(word)) {
      return { passed: false, reason: 'banned_word' };
    }
  }
  
  // 패턴 매칭 (자음만 사용한 욕설 등 변형 감지)
  const koreanConsonantPatterns = generateKoreanConsonantPatterns();
  for (const pattern of koreanConsonantPatterns) {
    if (pattern.test(text)) {
      return { passed: false, reason: 'pattern_match' };
    }
  }
  
  return { passed: true };
}
```

**서버 측 2차 필터링 (Cloud Functions):**
```javascript
// Firebase Cloud Functions로 구현되는 서버 측 필터링
exports.moderateNewComment = functions.database.ref('/comments/{commentId}')
  .onCreate(async (snapshot, context) => {
    const comment = snapshot.val();
    
    // 1차 필터링 (로컬 필터 재확인)
    if (!filterInappropriateContent(comment.content).passed) {
      return snapshot.ref.update({ flagged: true, visible: false });
    }
    
    // 2차 필터링 (외부 API 사용)
    if (comment.content.length > 0 && config.use_external_api) {
      try {
        // Sightengine API 사용 예시
        const moderationResult = await moderateWithSightengine(comment.content);
        
        if (!moderationResult.passed) {
          return snapshot.ref.update({ 
            flagged: true, 
            visible: false,
            flagReason: moderationResult.reason 
          });
        }
      } catch (error) {
        console.error('External moderation API error:', error);
        // API 오류 시 관리자 검토 대기열에 추가
        return snapshot.ref.update({ needsReview: true });
      }
    }
    
    return null;
  });
```

## 7. 최적화 및 테스트

### 7.1 성능 최적화
- 댓글 로딩 지연 최소화
- 이미지 지연 로딩 구현
- DOM 조작 최적화

### 7.2 테스트
- 다양한 브라우저 호환성 테스트
- 모바일 환경 테스트
- 대량 댓글 처리 성능 테스트
- 오류 처리 테스트

## 8. 통합 및 배포

### 8.1 블로그 통합
- 메인 페이지 (`index.html`)에 댓글 섹션에 추가
- 필요한 스크립트 및 스타일 파일 연결
- 기존 Firebase 설정과 충돌 방지

### 8.2 최종 테스트 및 배포
- 통합 테스트 수행
- 오류 수정 및 디버깅
- 최종 배포

## 9. 추가 고려사항

### 9.1 확장성
- 다국어 지원 준비 (i18n)
- 알림 기능 확장 가능성
- API 구조화 (향후 다른 페이지에서도 사용 가능하도록)

### 9.2 유지 보수
- 코드 문서화
- 로깅 시스템 구현
- 정기적인 백업 메커니즘
