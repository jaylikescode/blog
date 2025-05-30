/**
 * CommentSystem.js
 * 블로그 댓글 시스템의 메인 초기화 및 조정 모듈
 * Firebase SDK v9 호환성 모드 사용
 */

// 디버그 모드 설정 (1: 활성화, 0: 비활성화)
const DEBUG_MODE = 1;

/**
 * 디버그 로그 출력 함수 - 단일 책임 원칙(SRP)에 따라 로깅만 담당
 * @param {string} source - 로그 출처
 * @param {string} message - 로그 메시지
 * @param {any} data - 로그 데이터 (선택적)
 */
function debugLog(source, message, data = null) {
  if (DEBUG_MODE === 1) {
    const timestamp = new Date().toISOString();
    const prefix = `[DEBUG][${timestamp}][${source}]`;
    
    try {
      if (data !== null) {
        console.log(prefix, message, data);
      } else {
        console.log(prefix, message);
      }
    } catch (error) {
      // 로깅 중 오류 방지
      console.log(`${prefix} 로깅 오류: ${error.message}`);
    }
  }
}

/**
 * 댓글 시스템 팩토리 - 의존성 주입 원칙(DIP)을 따름
 * 의존성(Model, View, Controller)을 외부에서 주입받아 결합도를 낮춤
 */
class CommentSystemFactory {
  /**
   * 새로운 댓글 시스템 인스턴스 생성
   * @param {Object} config - 댓글 시스템 설정
   * @returns 댓글 시스템 인스턴스
   */
  static create(config = {}) {
    debugLog('CommentSystemFactory', '새 댓글 시스템 인스턴스 생성', config);
    return new BlogCommentSystem(config);
  }
}

/**
 * 댓글 시스템 클래스 - 모듈성과 재사용성 향상
 */
class BlogCommentSystem {
  /**
   * 댓글 시스템 생성자
   * @param {Object} customConfig - 사용자 정의 설정
   */
  constructor(customConfig = {}) {
    // 구성 요소
    this.model = null;
    this.view = null;
    this.controller = null;
    
    // 기본 설정
    this.config = {
      commentsPerPage: 10,
      maxDepth: 10,
      autoRefresh: false,
      refreshInterval: 30000,
      charLimit: 200
    };
    
    // 사용자 설정으로 기본 설정 덮어쓰기
    this.config = Object.assign(this.config, customConfig);
    
    // 다국어 번역 초기화
    this.translations = this._initializeTranslations();
    
    debugLog('BlogCommentSystem', '인스턴스 생성됨', this.config);
  }
  
  /**
   * 번역 데이터 초기화
   * @returns 번역 데이터 객체
   * @private
   */
  _initializeTranslations() {
    return {
    'ko': {
      'loading': '로딩 중...',
      'load-more': '더보기',
      'no-comments': '아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!',
      'comment-placeholder': '댓글을 입력하세요 (최대 200자)',
      'reply-button': '답글',
      'edit-button': '수정',
      'delete-button': '삭제',
      'cancel-button': '취소',
      'save-button': '저장',
      'submitting': '저장 중...',
      'saving': '저장 중...',
      'name-label': '이름:',
      'email-label': '이메일:',
      'comment-label': '내용:',
      'name-placeholder': '이름을 입력하세요 (필수)',
      'email-placeholder': '답글 알림을 받으려면 이메일을 입력하세요 (선택)',
      'comments-submit-button': '댓글 작성',
      'comments-form-title': '댓글 남기기',
      'comments-list-title': '댓글 목록',
      'comments-title': '댓글',
      'required-fields': '이름과 댓글 내용을 모두 입력해주세요.',
      'content-too-long': '댓글 내용이 너무 깁니다. 최대 200자까지 입력 가능합니다.',
      'content-contains-banned-word': '금지된 단어가 포함되어 있습니다',
      'max-depth-reached': '더 이상 중첩된 답글을 작성할 수 없습니다.',
      'comment-added': '댓글이 추가되었습니다.',
      'reply-added': '답글이 추가되었습니다.',
      'comment-error': '댓글 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      'error-empty-name': '이름을 입력해주세요.',
      'error-empty-comment': '댓글 내용을 입력해주세요.',
      'error-comment-too-long': '댓글은 {limit}자 이내로 작성해주세요.',
      'error-banned-word': '부적절한 단어가 포함되어 있습니다.',
      'error-max-depth': '최대 답글 깊이에 도달했습니다.',
      'error-comment-save': '댓글 저장 중 오류가 발생했습니다.',
      'error-comment-update': '댓글 수정 중 오류가 발생했습니다.',
      'error-comment-delete': '댓글 삭제 중 오류가 발생했습니다.',
      'confirm-delete': '정말 이 댓글을 삭제하시겠습니까?',
      'deleted-comment': '삭제된 댓글입니다.',
      'deleted-user': '삭제됨',
      'just-now': '방금 전',
      'minutes-ago': '분 전',
      'hours-ago': '시간 전',
      'yesterday': '어제',
      'days-ago': '일 전'
    },
    'en': {
      'loading': 'Loading...',
      'load-more': 'Load More',
      'no-comments': 'No comments yet. Be the first to leave a comment!',
      'comment-placeholder': 'Enter your comment (max 200 characters)',
      'reply-button': 'Reply',
      'edit-button': 'Edit',
      'delete-button': 'Delete',
      'cancel-button': 'Cancel',
      'save-button': 'Save',
      'submitting': 'Submitting...',
      'saving': 'Saving...',
      'name-label': 'Name:',
      'email-label': 'Email:',
      'comment-label': 'Comment:',
      'name-placeholder': 'Enter your name (required)',
      'email-placeholder': 'Enter your email for reply notifications (optional)',
      'comments-submit-button': 'Leave a Comment',
      'comments-form-title': 'Leave a Comment',
      'comments-list-title': 'Comments',
      'comments-title': 'Comments',
      'required-fields': 'Please enter both name and comment.',
      'content-too-long': 'Comment is too long. Maximum 200 characters allowed.',
      'content-contains-banned-word': 'Contains banned word',
      'max-depth-reached': 'Maximum reply depth reached.',
      'comment-added': 'Comment added successfully.',
      'reply-added': 'Reply added successfully.',
      'comment-error': 'Error occurred while saving comment. Please try again later.',
      'error-empty-name': 'Please enter your name.',
      'error-empty-comment': 'Please enter a comment.',
      'error-comment-too-long': 'Comment must be within {limit} characters.',
      'error-banned-word': 'Comment contains inappropriate content.',
      'error-max-depth': 'Maximum reply depth reached.',
      'error-comment-save': 'Error occurred while saving comment.',
      'error-comment-update': 'Error occurred while updating comment.',
      'error-comment-delete': 'Error occurred while deleting comment.',
      'confirm-delete': 'Are you sure you want to delete this comment?',
      'deleted-comment': 'This comment has been deleted.',
      'deleted-user': 'Deleted',
      'just-now': 'just now',
      'minutes-ago': ' min ago',
      'hours-ago': ' hours ago',
      'yesterday': 'yesterday',
      'days-ago': ' days ago'
    }
  }
  
  /**
   * 댓글 시스템 초기화
   * @param {Object} customConfig - 사용자 정의 설정
   * @returns 초기화 성공 여부
   */
  init(customConfig = {}) {
    debugLog('CommentSystem', '댓글 시스템 초기화 시작');
    
    // Firebase SDK 로드 상태 확인
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK가 로드되지 않았습니다. SDK 로드를 시도합니다.');
      debugLog('CommentSystem', 'Firebase SDK 로드 시도');
      
      if (typeof window.initializeFirebase === 'function') {
        window.initializeFirebase();
        // 재귀적으로 1초 후에 다시 초기화 시도
        setTimeout(() => this.init(customConfig), 1000);
      }
      return false;
    }
    
    debugLog('CommentSystem', 'Firebase SDK 로드됨');
    
    // 사용자 정의 설정 병합
    this.config = Object.assign(this.config, customConfig);
    
    try {
      debugLog('CommentSystem', '설정 초기화 시작', this.config);
      
      // 기존 번역 데이터와 병합
      if (window.translations) {
        for (const lang in this.translations) {
          if (!window.translations[lang]) {
            window.translations[lang] = {};
          }
          
          // 댓글 관련 번역 추가
          for (const key in this.translations[lang]) {
            window.translations[lang][key] = this.translations[lang][key];
          }
        }
      }
      
      // 모델 초기화
      debugLog('CommentSystem', '모델 초기화 시작');
      this.model = new CommentModel();
      debugLog('CommentSystem', '모델 초기화 완료');
      
      // 뷰 초기화
      debugLog('CommentSystem', '뷰 초기화 시작');
      
      // CommentView 프로토타입에 메서드가 없으면 직접 추가 (오류 방지)
      if (typeof CommentView.prototype.showLoading !== 'function') {
        debugLog('CommentSystem', 'CommentView 프로토타입에 showLoading 메서드 추가');
        CommentView.prototype.showLoading = function(show) {
          if (typeof this.setCommentsLoading === 'function') {
            this.setCommentsLoading(show);
          } else {
            debugLog('CommentView', 'setCommentsLoading 메서드도 없음');
          }
        };
      }
      
      if (typeof CommentView.prototype.showLoadMoreButton !== 'function') {
        debugLog('CommentSystem', 'CommentView 프로토타입에 showLoadMoreButton 메서드 추가');
        CommentView.prototype.showLoadMoreButton = function(show) {
          if (typeof this.updateLoadMoreButton === 'function') {
            this.updateLoadMoreButton(show);
          } else {
            debugLog('CommentView', 'updateLoadMoreButton 메서드도 없음');
          }
        };
      }
      
      // createCommentCard 메서드가 없으면 추가
      if (typeof CommentView.prototype.createCommentCard !== 'function') {
        debugLog('CommentSystem', 'CommentView 프로토타입에 createCommentCard 메서드 추가');
        CommentView.prototype.createCommentCard = function(comment) {
          debugLog('CommentView', 'createCommentCard 메서드 실행', comment);
          
          // 댓글 카드 생성
          const card = document.createElement('div');
          card.className = 'comment-card';
          card.dataset.commentId = comment.id;
          
          // 댓글 작성자 및 시간
          const header = document.createElement('div');
          header.className = 'comment-header';
          
          const author = document.createElement('span');
          author.className = 'comment-author';
          author.textContent = comment.author || '익명';
          
          const time = document.createElement('span');
          time.className = 'comment-time';
          const timestamp = comment.timestamp ? new Date(comment.timestamp) : new Date();
          time.textContent = timestamp.toLocaleString();
          
          header.appendChild(author);
          header.appendChild(time);
          
          // 댓글 내용
          const content = document.createElement('div');
          content.className = 'comment-content';
          content.textContent = comment.content || '';
          
          // 답글 버튼 추가
          const replyButton = document.createElement('button');
          replyButton.className = 'reply-button';
          replyButton.setAttribute('data-text', 'reply-button');
          replyButton.textContent = this.getText('reply-button') || '답글';
          replyButton.dataset.parentId = comment.id;
          
          // 버튼 컨테이너
          const actions = document.createElement('div');
          actions.className = 'comment-actions';
          actions.appendChild(replyButton);
          
          // 카드에 구성요소 추가
          card.appendChild(header);
          card.appendChild(content);
          card.appendChild(actions);
          
          // 댓글 깊이에 따라 들여쓰기 적용
          if (comment.depth > 0) {
            card.classList.add('comment-reply');
            card.style.marginLeft = `${comment.depth * 20}px`;
          }
          
          return card;
        };
      }
      
      this.view = new CommentView({
        container: document.getElementById('comments'),
        translations: window.translations,
        charLimit: this.config.charLimit
      });
      
      // 뷰 객체 메서드 검사
      debugLog('CommentSystem', '뷰 객체 검사', {
        viewExists: !!this.view,
        showLoadingMethod: this.view ? typeof this.view.showLoading : 'undefined',
        setCommentsLoadingMethod: this.view ? typeof this.view.setCommentsLoading : 'undefined',
        showLoadMoreButtonMethod: this.view ? typeof this.view.showLoadMoreButton : 'undefined',
        updateLoadMoreButtonMethod: this.view ? typeof this.view.updateLoadMoreButton : 'undefined',
        viewPrototype: Object.getPrototypeOf(this.view).constructor.name
      });
      
      debugLog('CommentSystem', '뷰 초기화 완료');
      
      // 컨트롤러 초기화
      debugLog('CommentSystem', '컨트롤러 초기화 시작');
      this.controller = new CommentController(this.model, this.view, this.config);
      debugLog('CommentSystem', '컨트롤러 초기화 완료');
      
      // 언어 변경 이벤트 리스너 추가
      this.setupLanguageChangeListener();
      
      debugLog('CommentSystem', '댓글 시스템 초기화 완료');
      console.log('댓글 시스템이 성공적으로 초기화되었습니다.');
      return true;
    } catch (error) {
      debugLog('CommentSystem', '댓글 시스템 초기화 중 오류 발생', error);
      console.error('댓글 시스템 초기화 중 오류 발생:', error);
      return false;
    }
  }
  
  /**
   * 언어 변경 리스너 설정
   */
  setupLanguageChangeListener() {
    document.querySelectorAll('.language-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // 언어 변경 시 뷰 업데이트
        setTimeout(() => {
          const lang = document.documentElement.lang || 'ko';
          if (this.view) {
            this.view.updateLanguage(lang);
          }
        }, 100);
      });
    });
  }
};

// 디버그 로그 함수를 전역으로 노출
window.debugLog = debugLog;

// 전역 배포를 위한 객체 아리아스 (하위 호환성 유지)
window.BlogCommentSystem = BlogCommentSystem;

// 싱글턴 인스턴스
let commentSystem = null;

/**
 * 댓글 시스템 초기화 함수
 * @param {Object} config - 설정 객체
 * @returns 초기화된 댓글 시스템 인스턴스
 */
function initializeCommentSystem(config = {}) {
  if (!commentSystem) {
    debugLog('CommentSystem', '새 댓글 시스템 인스턴스 생성');
    commentSystem = CommentSystemFactory.create(config);
  }
  
  commentSystem.init(config);
  return commentSystem;
}

// DOM 콘텐츠 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  debugLog('CommentSystem', 'DOMContentLoaded 이벤트 발생');
  
  // Firebase가 로드된 후 댓글 시스템 초기화
  if (typeof firebase !== 'undefined') {
    debugLog('CommentSystem', 'Firebase SDK 이미 로드됨, 초기화 시작');
    initializeCommentSystem();
  } else {
    // Firebase가 지연 로드되는 경우 대기
    debugLog('CommentSystem', 'Firebase SDK 아직 로드되지 않음, load 이벤트 대기');
    window.addEventListener('load', function() {
      debugLog('CommentSystem', 'window load 이벤트 발생, 1초 후 초기화 예정');
      setTimeout(() => {
        debugLog('CommentSystem', '지연 초기화 시작');
        initializeCommentSystem();
      }, 1000);
    });
  }
});

// 버전 정보 추가
window.COMMENT_SYSTEM_VERSION = '1.1.0'; // Firebase SDK v9 호환성 지원
