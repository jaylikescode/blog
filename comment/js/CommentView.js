/**
 * CommentView.js
 * 댓글 UI 렌더링 및 사용자 인터랙션을 담당하는 클래스
 */

class CommentView {
  /**
   * 생성자
   * @param {Object} config - 설정 객체
   */
  constructor(config = {}) {
    this.container = null;
    this.formContainer = null;
    this.listContainer = null;
    this.translations = {};
    this.currentLanguage = 'ko';
    this.charLimit = config.charLimit || 200;
    this.init(config);
  }

  /**
   * 초기화 함수
   * @param {Object} config - 설정 객체
   */
  init(config) {
    debugLog('CommentView', '뷰 초기화 시작', config);
    
    // 컨테이너 요소 설정
    this.container = config.container || document.getElementById('comments');
    if (!this.container) {
      console.error('댓글 컨테이너를 찾을 수 없습니다.');
      debugLog('CommentView', '댓글 컨테이너를 찾을 수 없음');
      return false;
    }
    
    debugLog('CommentView', '댓글 컨테이너 찾음', { containerId: this.container.id });

    // 폼 및 목록 컨테이너 찾기
    this.formContainer = this.container.querySelector('.comment-form');
    this.listContainer = this.container.querySelector('.comments-list');
    
    debugLog('CommentView', '컨테이너 참조', { 
      formContainer: this.formContainer ? true : false, 
      listContainer: this.listContainer ? true : false 
    });
    
    // 폼 컨테이너가 없는 경우 생성
    if (!this.formContainer) {
      debugLog('CommentView', '폼 컨테이너 없음, 생성 시작');
      this.formContainer = document.createElement('div');
      this.formContainer.className = 'comment-form';
      
      const formTitle = document.createElement('h3');
      formTitle.setAttribute('data-text', 'comments-form-title');
      formTitle.textContent = this.getText('comments-form-title') || '댓글 남기기';
      
      this.formContainer.appendChild(formTitle);
      this.container.insertBefore(this.formContainer, this.container.firstChild);
      debugLog('CommentView', '폼 컨테이너 생성 완료');
    }
    
    // 목록 컨테이너가 없는 경우 생성
    if (!this.listContainer) {
      debugLog('CommentView', '목록 컨테이너 없음, 생성 시작');
      this.listContainer = document.createElement('div');
      this.listContainer.className = 'comments-list';
      
      const listTitle = document.createElement('h3');
      listTitle.setAttribute('data-text', 'comments-list-title');
      listTitle.textContent = this.getText('comments-list-title') || '댓글 목록';
      
      this.listContainer.appendChild(listTitle);
      this.container.appendChild(this.listContainer);
      debugLog('CommentView', '목록 컨테이너 생성 완료');
    }

    // 번역 데이터 설정
    this.translations = config.translations || window.translations || {};
    this.currentLanguage = document.documentElement.lang || 'ko';

    // 초기 UI 설정
    this.setupUI();
    
    return true;
  }

  /**
   * UI 초기 설정
   */
  setupUI() {
    debugLog('CommentView', 'UI 초기 설정 시작');
    
    // 댓글 폼 UI 생성
    this.renderCommentForm();
    debugLog('CommentView', '폼 UI 생성 완료');
    
    // 댓글 목록 컨테이너 초기화
    if (this.listContainer) {
      debugLog('CommentView', '댓글 목록 컨테이너 초기화');
      const commentsList = this.listContainer.querySelector('.comments-container') || document.createElement('div');
      commentsList.className = 'comments-container';
      if (!this.listContainer.contains(commentsList)) {
        this.listContainer.appendChild(commentsList);
      }
      this.commentsContainer = commentsList;
      debugLog('CommentView', '댓글 목록 컨테이너 초기화 완료');
    }
    
    // 로딩 인디케이터 생성
    this.createLoadingIndicator();
    
    // "더 보기" 버튼 생성
    this.createLoadMoreButton();
    
    debugLog('CommentView', 'UI 초기 설정 완료');
  }

  /**
   * 댓글 폼 렌더링
   */
  renderCommentForm() {
    debugLog('CommentView', '댓글 폼 렌더링 시작');
    
    if (!this.formContainer) {
      debugLog('CommentView', '폼 컨테이너가 없음');
      return false;
    }
    
    // 기존 폼이 있는지 확인
    const existingForm = this.formContainer.querySelector('form');
    if (existingForm) {
      debugLog('CommentView', '폼이 이미 있음, 새로 생성하지 않음');
      return true;
    }
    
    debugLog('CommentView', '새 폼 생성 시작');
    
    // 폼 생성
    const form = document.createElement('form');
    form.className = 'comment-form';
    
    // 이름 입력 필드
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    
    const nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'commenter-name');
    nameLabel.className = 'input-label';
    nameLabel.textContent = 'Name: ';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'commenter-name';
    nameInput.name = 'commenter-name';
    nameInput.required = true;
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    
    // 내용 입력 필드
    const contentGroup = document.createElement('div');
    contentGroup.className = 'form-group';
    
    const contentLabel = document.createElement('label');
    contentLabel.setAttribute('for', 'comment-content');
    contentLabel.className = 'input-label';
    contentLabel.textContent = 'Comment: ';
    
    const contentTextarea = document.createElement('textarea');
    contentTextarea.id = 'comment-content';
    contentTextarea.name = 'comment-content';
    contentTextarea.required = true;
    contentTextarea.maxLength = this.charLimit;
    
    contentGroup.appendChild(contentLabel);
    contentGroup.appendChild(contentTextarea);
    
    // 제출 버튼
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.setAttribute('data-text', 'comments-submit-button');
    submitButton.textContent = this.getText('comments-submit-button') || '댓글 작성';
    
    // 부모 ID (댓글 용)
    const parentIdInput = document.createElement('input');
    parentIdInput.type = 'hidden';
    parentIdInput.name = 'parent-id';
    parentIdInput.value = '';
    
    // 폼에 요소 추가
    form.appendChild(nameGroup);
    form.appendChild(contentGroup);
    form.appendChild(parentIdInput);
    form.appendChild(submitButton);
    
    // 폼을 컨테이너에 추가
    this.formContainer.appendChild(form);
    
    debugLog('CommentView', '폼 생성 완료');
    return true;
  }
  
  /**
   * 댓글 폼 초기화
   */
  resetCommentForm() {
    debugLog('CommentView', '댓글 폼 초기화 시작');
    if (!this.formContainer) return;
    
    // 기존 폼이 있는지 확인
    let form = this.formContainer.querySelector('form');
    
    // 폼이 없으면 새로 생성
    if (!form) {
      form = document.createElement('form');
      form.className = 'comment-input-form';
      
      const nameInput = this.createInput('text', 'comment-author', this.getText('comments-name-label'), true);
      const contentTextarea = this.createTextarea('comment-content', this.getText('comments-content-label'), this.charLimit);
      const formFooter = this.createFormFooter();
      
      form.appendChild(nameInput);
      form.appendChild(contentTextarea);
      form.appendChild(formFooter);
      
      this.formContainer.appendChild(form);
    }
    
    // 폼 초기화
    form.reset();
    debugLog('CommentView', '폼 reset 완료');
    
    // 부모 ID 제거 (대댓글 모드 해제)
    const parentIdInput = form.querySelector('[name="parent-id"]');
    if (parentIdInput) {
      parentIdInput.value = '';
      debugLog('CommentView', '부모 ID 입력 필드 초기화');
    }
  }

  /**
   * 댓글 폼 데이터 가져오기
   * @returns {Object|null} 폼 데이터 객체
   */
  getFormData() {
    debugLog('CommentView', '폼 데이터 가져오기 시작');
    if (!this.formContainer) return null;
    
    // 기존 폼이 있는지 확인
    let form = this.formContainer.querySelector('form');
    
    // 폼이 없으면 새로 생성
    if (!form) {
      form = document.createElement('form');
      form.className = 'comment-input-form';
      
      const nameInput = this.createInput('text', 'comment-author', this.getText('comments-name-label'), true);
      const contentTextarea = this.createTextarea('comment-content', this.getText('comments-content-label'), this.charLimit);
      const formFooter = this.createFormFooter();
      
      form.appendChild(nameInput);
      form.appendChild(contentTextarea);
      form.appendChild(formFooter);
      
      this.formContainer.appendChild(form);
    }
    
    // 입력값 가져오기
    const nameInput = form.querySelector('input[name="comment-author"]');
    const contentTextarea = form.querySelector('textarea[name="comment-content"]');
    const parentIdInput = form.querySelector('input[name="parent-id"]');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const content = contentTextarea ? contentTextarea.value.trim() : '';
    const parentId = parentIdInput ? parentIdInput.value : null;
    
    debugLog('CommentView', '폼 입력값', { name, content, parentId });
    
    // 필수 필드 검증
    if (!name || !content) {
      debugLog('CommentView', '필수 필드 유효성 검증 실패');
      return null;
    }
    
    // 사용자 ID 생성 (실제 서비스에서는 인증 시스템 사용 권장)
    debugLog('CommentView', '사용자 ID 생성 시작');
    const userId = this._generateUserId(name);
    
    return { name, content, parentId, userId };
  }

  /**
   * 제출 버튼 로딩 상태 설정
   * @param {boolean} isLoading - 로딩 상태 여부
   */
  setSubmitLoading(isLoading) {
    debugLog('CommentView', '제출 버튼 로딩 상태 설정', { isLoading });
    if (this.loadingIndicator) {
      if (isLoading) {
        this.loadingIndicator.classList.remove('hidden');
      } else {
        this.loadingIndicator.classList.add('hidden');
      }
    }
  }

  /**
   * 댓글 목록 컨테이너 참조 설정
   */
  initCommentsContainer() {
    debugLog('CommentView', '댓글 목록 컨테이너 초기화');
    this.commentsContainer = this.listContainer?.querySelector('.comments-content') || this.listContainer;
    
    if (!this.commentsContainer) {
      debugLog('CommentView', '댓글 목록 컨테이너를 찾을 수 없음, 생성 시도');
      if (this.listContainer) {
        this.commentsContainer = document.createElement('div');
        this.commentsContainer.className = 'comments-content';
        this.listContainer.appendChild(this.commentsContainer);
        debugLog('CommentView', '댓글 목록 컨테이너 생성됨');
      } else {
        debugLog('CommentView', '댓글 목록 컨테이너를 생성할 수 없음');
      }
    }
    
    return !!this.commentsContainer;
  }
  
  /**
   * 로딩 인디케이터 생성
   */
  createLoadingIndicator() {
    debugLog('CommentView', '로딩 인디케이터 생성 시작');
    
    if (!this.listContainer) {
      debugLog('CommentView', '로딩 인디케이터를 생성할 컨테이너가 없음');
      return;
    }
    
    // 기존 로딩 인디케이터 찾기
    let loadingIndicator = this.listContainer.querySelector('.comments-loading');
    
    // 없으면 생성
    if (!loadingIndicator) {
      loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'comments-loading hidden';
      loadingIndicator.setAttribute('data-text', 'loading');
      loadingIndicator.textContent = this.getText('loading') || '로딩 중...';
      
      this.listContainer.appendChild(loadingIndicator);
      debugLog('CommentView', '로딩 인디케이터 생성됨');
    }
    
    this.loadingIndicator = loadingIndicator;
  }
  
  /**
   * "더 보기" 버튼 생성
   */
  createLoadMoreButton() {
    debugLog('CommentView', '더보기 버튼 생성 시작');
    
    if (!this.listContainer) {
      debugLog('CommentView', '더보기 버튼을 생성할 컨테이너가 없음');
      return;
    }
    
    // 기존 버튼 찾기
    let loadMoreButton = this.listContainer.querySelector('.load-more-comments');
    
    // 없으면 생성
    if (!loadMoreButton) {
      loadMoreButton = document.createElement('button');
      loadMoreButton.className = 'load-more-comments hidden';
      loadMoreButton.setAttribute('data-text', 'load-more');
      loadMoreButton.textContent = this.getText('load-more') || '더 보기';
      
      this.listContainer.appendChild(loadMoreButton);
      debugLog('CommentView', '더보기 버튼 생성됨');
    }
    
    this.loadMoreButton = loadMoreButton;
  }
  
  /**
   * 로딩 상태 설정
   * @param {boolean} isLoading - 로딩 상태 여부
   */
  setCommentsLoading(isLoading) {
    debugLog('CommentView', '댓글 로딩 상태 설정', { isLoading });
    
    if (!this.loadingIndicator) {
      debugLog('CommentView', '로딩 인디케이터가 없음');
      return;
    }
    
    if (isLoading) {
      this.loadingIndicator.classList.remove('hidden');
    } else {
      this.loadingIndicator.classList.add('hidden');
    }
  }
  
  /**
   * 로딩 표시/숨김 - CommentController에서 호출하는 메서드
   * @param {boolean} show - 로딩 표시 여부
   */
  showLoading(show) {
    debugLog('CommentView', '로딩 표시/숨김 설정', { show });
    
    // 기존의 setCommentsLoading 메서드 활용
    this.setCommentsLoading(show);
  }
  
  /**
   * 더보기 버튼 상태 업데이트
   * @param {boolean} visible - 표시 여부
   */
  updateLoadMoreButton(visible) {
    debugLog('CommentView', '더보기 버튼 상태 업데이트', { visible });
    
    if (!this.loadMoreButton) {
      debugLog('CommentView', '더보기 버튼이 없음');
      return;
    }
    
    if (visible) {
      this.loadMoreButton.classList.remove('hidden');
    } else {
      this.loadMoreButton.classList.add('hidden');
    }
  }
  
  /**
   * 더보기 버튼 표시/숨김 - CommentController에서 호출하는 메서드
   * @param {boolean} show - 표시 여부
   */
  showLoadMoreButton(show) {
    debugLog('CommentView', '더보기 버튼 표시/숨김', { show });
    
    // 기존의 updateLoadMoreButton 메서드 활용
    this.updateLoadMoreButton(show);
  }
  
  /**
   * 댓글 렌더링
   * @param {Array} comments - 댓글 목록
   * @param {boolean} append - 기존 목록에 추가 여부
   */
  renderComments(comments, append = false) {
    debugLog('CommentView', '댓글 렌더링 시작', { commentCount: comments?.length || 0, append });
    
    if (!this.commentsContainer) {
      debugLog('CommentView', '댓글 컨테이너를 찾을 수 없음');
      return;
    }
    
    // 로딩 인디케이터 숨김
    this.setCommentsLoading(false);
    
    // 댓글이 없는 경우
    if (!comments || comments.length === 0) {
      debugLog('CommentView', '댓글이 없음');
      if (!append) {
        this.commentsContainer.innerHTML = `<div class="no-comments">${this.getText('no-comments') || '댓글이 없습니다. 처음으로 댓글을 남겨보세요!'}</div>`;
      }
      
      // 더보기 버튼 숨김
      this.updateLoadMoreButton(false);
      return;
    }
    
    // 기존 목록 초기화 또는 유지
    if (!append) {
      debugLog('CommentView', '기존 댓글 목록 초기화');
      this.commentsContainer.innerHTML = '';
    }
    
    // 댓글 추가
    comments.forEach(comment => {
      debugLog('CommentView', '댓글 카드 생성', { commentId: comment.id });
      const commentCard = this.createCommentCard(comment);
      this.commentsContainer.appendChild(commentCard);
    });
    
    debugLog('CommentView', '댓글 렌더링 완료');
  }

  /**
   * 번역 텍스트 가져오기
   * @param {string} key - 번역 키
   * @returns {string} 번역된 텍스트
   */
  getText(key) {
    const lang = this.currentLanguage;
    if (this.translations && this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    return key;
  }
  
  /**
   * 답글 폼 표시
   * @param {string} parentId - 부모 댓글 ID
   * @param {HTMLElement} parentCard - 부모 댓글 카드 요소
   */
  showReplyForm(parentId, parentCard) {
    debugLog('CommentView', '답글 폼 표시', { parentId });
    
    // 이미 열려있는 답글 폼 제거
    const existingReplyForms = document.querySelectorAll('.reply-form-container');
    existingReplyForms.forEach(form => form.remove());
    
    // 답글 폼 컨테이너 생성
    const replyFormContainer = document.createElement('div');
    replyFormContainer.className = 'reply-form-container';
    
    // 답글 폼 생성
    const replyForm = this.renderReplyForm(parentId);
    
    replyFormContainer.appendChild(replyForm);
    
    // 부모 댓글 다음에 답글 폼 삽입
    parentCard.after(replyFormContainer);
  }
  
  /**
   * 답글 폼 렌더링
   * @param {string} parentId - 부모 댓글 ID
   * @returns {HTMLElement} - 생성된 폼 요소
   */
  renderReplyForm(parentId) {
    debugLog('CommentView', '답글 폼 렌더링', { parentId });
    
    // 기본 폼 생성
    const form = document.createElement('form');
    form.className = 'comment-form reply-form';
    
    // 이름 입력 필드
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    
    const nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'reply-author');
    nameLabel.setAttribute('data-text', 'comments-name-label');
    nameLabel.textContent = this.getText('comments-name-label') || '이름:';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.name = 'commenter-name';
    nameInput.id = 'comment-author'; // 동일한 ID 사용
    nameInput.required = true;
    nameInput.placeholder = this.getText('comments-name-placeholder') || '이름을 입력하세요';
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    
    // 내용 입력 필드
    const contentGroup = document.createElement('div');
    contentGroup.className = 'form-group';
    
    const contentLabel = document.createElement('label');
    contentLabel.setAttribute('for', 'reply-content');
    contentLabel.setAttribute('data-text', 'comments-content-label');
    contentLabel.textContent = this.getText('comments-content-label') || '내용:';
    
    const contentTextarea = document.createElement('textarea');
    contentTextarea.name = 'comment-content';
    contentTextarea.id = 'comment-content'; // 동일한 ID 사용
    contentTextarea.required = true;
    contentTextarea.rows = 3; // 답글은 좌식 수 적게
    contentTextarea.placeholder = this.getText('comments-content-placeholder') || '내용을 입력하세요';
    
    contentGroup.appendChild(contentLabel);
    contentGroup.appendChild(contentTextarea);
    
    // 부모 ID 설정 (중요!)
    const parentIdInput = document.createElement('input');
    parentIdInput.type = 'hidden';
    parentIdInput.name = 'parent-id';
    parentIdInput.value = parentId;
    
    // 제출 버튼
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.setAttribute('data-text', 'reply-submit-button');
    submitButton.className = 'submit-reply-button';
    submitButton.textContent = this.getText('reply-button') || '답글 등록';
    
    // 취소 버튼
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'cancel-reply-button';
    cancelButton.textContent = this.getText('cancel-button') || '취소';
    
    // 버튼 그룹
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';
    buttonGroup.appendChild(submitButton);
    buttonGroup.appendChild(cancelButton);
    
    // 폼에 요소 추가
    form.appendChild(nameGroup);
    form.appendChild(contentGroup);
    form.appendChild(parentIdInput);
    form.appendChild(buttonGroup);
    
    return form;
  }

  /**
   * 언어 변경 시 UI 업데이트
   * @param {string} lang - 언어 코드
   */
  updateLanguage(lang) {
    this.currentLanguage = lang;
    
    // 모든 번역 키를 가진 요소 업데이트
    this.container.querySelectorAll('[data-text]').forEach(element => {
      const key = element.getAttribute('data-text');
      const translation = this.getText(key);
      if (translation) {
        element.textContent = translation;
      }
    });
  }
}

// 전역으로 뷰 노출
window.CommentView = CommentView;
