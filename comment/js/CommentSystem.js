/**
 * CommentSystem.js
 * 블로그 댓글 시스템의 메인 초기화 및 조정 모듈
 */

// 댓글 시스템 전역 객체
const BlogCommentSystem = {
  // 구성 요소
  model: null,
  view: null,
  controller: null,
  
  // 설정
  config: {
    commentsPerPage: 10,
    maxDepth: 10,
    autoRefresh: false,
    refreshInterval: 30000,
    charLimit: 200
  },
  
  // 다국어 번역 확장
  translations: {
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
  },
  
  /**
   * 댓글 시스템 초기화
   * @param {Object} customConfig - 사용자 정의 설정
   */
  init: function(customConfig = {}) {
    // Firebase SDK 로드 상태 확인
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK가 로드되지 않았습니다. 댓글 시스템을 초기화할 수 없습니다.');
      return false;
    }
    
    // 사용자 정의 설정 병합
    this.config = Object.assign(this.config, customConfig);
    
    try {
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
      this.model = new CommentModel();
      
      // 뷰 초기화
      this.view = new CommentView({
        container: document.getElementById('comments'),
        translations: window.translations,
        charLimit: this.config.charLimit
      });
      
      // 컨트롤러 초기화
      this.controller = new CommentController(this.model, this.view, this.config);
      
      // 언어 변경 이벤트 리스너 추가
      this.setupLanguageChangeListener();
      
      console.log('댓글 시스템이 성공적으로 초기화되었습니다.');
      return true;
    } catch (error) {
      console.error('댓글 시스템 초기화 중 오류 발생:', error);
      return false;
    }
  },
  
  /**
   * 언어 변경 리스너 설정
   */
  setupLanguageChangeListener: function() {
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

// DOM 콘텐츠 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  // Firebase가 로드된 후 댓글 시스템 초기화
  if (typeof firebase !== 'undefined') {
    BlogCommentSystem.init();
  } else {
    // Firebase가 지연 로드되는 경우 대기
    window.addEventListener('load', function() {
      setTimeout(() => BlogCommentSystem.init(), 1000);
    });
  }
});
