# 댓글 시스템 고급 기능 설계 (선택사항)

## 1. 미디어 지원 기능

### 1.1 URL 자동 감지
- 정규식을 사용한 이미지/GIF URL 감지
- 지원 형식 확인 (jpg, jpeg, png, gif, webp)

### 1.2 미디어 렌더링
- 감지된 이미지 URL을 `<img>` 태그로 변환
- 반응형 이미지 크기 조정
- 이미지 로딩 오류 처리

## 2. 고급 보안 및 모더레이션

### 2.1 콘텐츠 모더레이션
- 금지어 리스트 활용
- 자동 스팸 감지 및 필터링
- 고급 문장 분석을 통한 유해 콘텐츠 필터링

### 2.2 사용자 보안 강화
- IP 해싱 및 익명화
- 사용자 신원 찾기 용도로 토큰 사용
- 해시된 값을 활용한 신원 확인 막기 위한 영구 차단

## 3. 실시간 알림 시스템

### 3.1 Firebase Cloud Functions 구현
```javascript
// 새 댓글이 추가될 때 이메일 알림 보내기
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// 이메일 전송을 위한 트랜스포터 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-service-account@gmail.com', 
    pass: 'your-app-password' 
  }
});

// 새로운 댓글이 추가될 때 이메일 알림 보내기
exports.sendNewCommentNotification = functions.database.ref('/comments/{commentId}')
  .onCreate(async (snapshot, context) => {
    const comment = snapshot.val();
    
    // 새로운 댓글 정보 가져오기
    const commentId = context.params.commentId;
    const pageUrl = comment.pageUrl || 'Unknown Page';
    const author = comment.author || 'Anonymous';
    const content = comment.content || 'No content';
    const createdAt = comment.created_at || new Date().toISOString();
    
    // 부모 댓글 정보 가져오기 (대댓글인 경우)
    let parentCommentInfo = '';
    if (comment.parent_id) {
      const parentCommentSnapshot = await admin.database().ref(`/comments/${comment.parent_id}`).once('value');
      const parentComment = parentCommentSnapshot.val();
      
      if (parentComment) {
        parentCommentInfo = `
        <div style="margin-left: 20px; padding-left: 10px; border-left: 2px solid #ccc;">
          <p><strong>원본 댓글:</strong></p>
          <p><strong>작성자:</strong> ${parentComment.author}</p>
          <p><strong>내용:</strong> ${parentComment.content}</p>
          <p><strong>작성 시간:</strong> ${parentComment.created_at}</p>
        </div>`;
      }
    }
    
    // 이메일 내용 구성
    const mailOptions = {
      from: '\"Blog Comment Notification\" <your-service-account@gmail.com>',
      to: 'fromsnowman14@gmail.com', // 고정된 관리자 이메일 주소
      subject: `새 댓글 알림: ${author}가 댓글을 남기셨습니다`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>새로운 댓글이 작성되었습니다</h2>
          <p><strong>페이지:</strong> <a href="${pageUrl}">${pageUrl}</a></p>
          <p><strong>작성자:</strong> ${author}</p>
          <p><strong>내용:</strong> ${content}</p>
          <p><strong>작성 시간:</strong> ${createdAt}</p>
          <p><strong>댓글 ID:</strong> ${commentId}</p>
          ${parentCommentInfo}
          <p>
            <a href="${pageUrl}" style="display: inline-block; padding: 10px 15px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 4px;">댓글 확인하기</a>
          </p>
        </div>
      `
    };
    
    // 이메일 보내기
    try {
      await transporter.sendMail(mailOptions);
      console.log('New comment notification email sent successfully');
      return null;
    } catch (error) {
      console.error('Error sending email:', error);
      return null;
    }
  });
```

### 3.2 답글 알림 기능
```javascript
// 댓글 작성자에게 답글 알림 전송 함수
exports.sendReplyNotification = functions.database.ref('/comments/{commentId}')
  .onCreate(async (snapshot, context) => {
    const reply = snapshot.val();
    
    // 대댓글인 경우만 처리
    if (!reply.parent_id) return null;
    
    // 부모 댓글 정보 조회
    const parentCommentSnapshot = await admin.database().ref(`/comments/${reply.parent_id}`).once('value');
    const parentComment = parentCommentSnapshot.val();
    
    // 부모 댓글이 존재하고 이메일이 있어야만 알림 전송
    if (!parentComment || !parentComment.email) return null;
    
    // 이메일 내용 구성
    const mailOptions = {
      from: '\"Blog Comment Notification\" <your-service-account@gmail.com>',
      to: parentComment.email,
      subject: `답글 알림: ${reply.author}가 회원님의 댓글에 답뉣을 남기셨습니다`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>회원님의 댓글에 새로운 답글이 작성되었습니다</h2>
          <p><strong>답글 작성자:</strong> ${reply.author}</p>
          <p><strong>답글 내용:</strong> ${reply.content}</p>
          <p><strong>작성 시간:</strong> ${reply.created_at}</p>
          <div style="margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-left: 4px solid #ccc;">
            <p><strong>회원님의 원본 댓글:</strong></p>
            <p>${parentComment.content}</p>
          </div>
          <p>
            <a href="${reply.pageUrl || '#'}" style="display: inline-block; padding: 10px 15px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 4px;">댓글 확인하기</a>
          </p>
          <p style="font-size: 12px; color: #666; margin-top: 30px;">
            이 이메일은 회원님의 댓글에 답글이 달렸을 때 자동으로 전송됩니다.<br>
            더 이상 알림을 받고 싶지 않으시면 댓글 작성 시 이메일 정보를 입력하지 않으시면 됩니다.
          </p>
        </div>
      `
    };
    
    // 이메일 보내기
    try {
      await transporter.sendMail(mailOptions);
      console.log('Reply notification email sent successfully');
      return null;
    } catch (error) {
      console.error('Error sending reply notification email:', error);
      return null;
    }
  });
```

## 4. 고급 성능 최적화

### 4.1 데이터베이스 지연 최소화
- 데이터 캡슈화 방식 사용
- 데이터베이스 인덱스 활용
- 데이터 일괄 가져오기 제한

### 4.2 로깅 및 오류 추적
- 상세한 로깅 시스템 구현
- 에러 추적 및 모니터링 시스템
- 사용자 행동 분석 및 추적

## 5. 확장 고려사항

### 5.1 다국어 확장
- 추가 언어 지원 (en, ja, zh 등)
- 언어별 금지어 리스트 관리
- 인터페이스 현지화 기능

### 5.2 관리자 대시보드
- 관리자 인증 및 접근 제어
- 댓글 통계 및 분석 대시보드
- 필터 및 차단 설정 관리 페이지

### 5.3 호환성 검토
- 다양한 브라우저 호환성 테스트
- 모바일 기기 호환성 확인
- 개발/운영 환경 구분 및 테스트 프로세스

## 6. 참고 자료

### 6.1 한국어 금지어 소스
- 방송통신심의위원회 제공 청소년 유해단어 목록
- 주요 포털 사이트 (네이버, 다음)의 금지어 필터링 참조
- 교육부 학교폭력 예방 관련 부적절 언어 목록
- 여성가족부 청소년보호 관련 유해단어 목록