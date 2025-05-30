/**
 * CommentController.js
 * 댓글 시스템의 Model과 View를 연결하는 컨트롤러 클래스
 */

class CommentController {
  /**
   * 생성자
   * @param {CommentModel} model - 댓글 모델 인스턴스
   * @param {CommentView} view - 댓글 뷰 인스턴스
   * @param {Object} config - 설정 객체
   */
  constructor(model, view, config = {}) {
    debugLog('CommentController', '생성자 호출', { modelExists: !!model, viewExists: !!view });
    
    this.model = model;
    this.view = view;
    
    // 뷰 객체 메서드 검사
    if (this.view) {
      debugLog('CommentController', '뷰 객체 메서드 검사', {
        showLoading: typeof this.view.showLoading,
        setCommentsLoading: typeof this.view.setCommentsLoading,
        showLoadMoreButton: typeof this.view.showLoadMoreButton,
        updateLoadMoreButton: typeof this.view.updateLoadMoreButton,
        prototype: Object.getPrototypeOf(this.view).constructor.name
      });
    } else {
      debugLog('CommentController', '뷰 객체가 null임');
    }
    
    this.config = Object.assign({
      commentsPerPage: 10,
      maxDepth: 10,
      autoRefresh: false,
      refreshInterval: 30000 // 30초
    }, config);
    
    this.lastCommentTimestamp = null;
    this.commentsListener = null;
    this.init();
  }

  /**
   * 초기화 함수
   */
  init() {
    debugLog('CommentController', '초기화 함수 호출');
    
    // Model과 View가 제대로 초기화되었는지 확인
    if (!this.model || !this.view) {
      console.error('댓글 컨트롤러 초기화 실패: Model 또는 View가 없습니다.');
      debugLog('CommentController', '초기화 실패', { modelExists: !!this.model, viewExists: !!this.view });
      return false;
    }
    
    debugLog('CommentController', 'Model과 View 감지 성공');
    
    // 뷰 객체 메서드 재검사
    if (this.view) {
      debugLog('CommentController', 'init에서 뷰 객체 메서드 재검사', {
        showLoading: typeof this.view.showLoading,
        setCommentsLoading: typeof this.view.setCommentsLoading,
        showLoadMoreButton: typeof this.view.showLoadMoreButton,
        updateLoadMoreButton: typeof this.view.updateLoadMoreButton,
        constructor: this.view.constructor.name,
        proto: Object.getPrototypeOf(this.view).constructor.name
      });
    }
    
    // 이벤트 리스너 설정
    this.setupEventListeners();
    
    debugLog('CommentController', '이벤트 리스너 설정 후 loadComments 호출 직전');
    
    // 초기 댓글 로드
    this.loadComments();
    
    // 자동 새로고침 설정 (선택적)
    if (this.config.autoRefresh) {
      this.setupAutoRefresh();
    }
    
    debugLog('CommentController', '초기화 함수 완료');
    return true;
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    debugLog('CommentController', '이벤트 리스너 설정 시작');
    
    // 폼 컨테이너 유효성 검사
    if (!this.view.formContainer) {
      debugLog('CommentController', '폼 컨테이너가 null임, 폼 생성 필요');
      // 뷰에 폼 렌더링 요청
      this.view.renderCommentForm();
      debugLog('CommentController', '폼 렌더링 요청 완료');
    }
    
    // 메인 댓글 폼 제출 이벤트
    if (this.view.formContainer) {
      const mainForm = this.view.formContainer.querySelector('form');
      if (mainForm) {
        debugLog('CommentController', '폼 제출 이벤트 리스너 추가');
        mainForm.addEventListener('submit', this.handleCommentSubmit.bind(this));
      } else {
        debugLog('CommentController', '폼을 찾을 수 없음, 폼 생성 필요');
        // 뷰에 폼 렌더링 요청
        this.view.renderCommentForm();
        
        // 새로 생성된 폼에 이벤트 리스너 추가
        const newForm = this.view.formContainer.querySelector('form');
        if (newForm) {
          debugLog('CommentController', '새 폼 제출 이벤트 리스너 추가');
          newForm.addEventListener('submit', this.handleCommentSubmit.bind(this));
        }
      }
    } else {
      debugLog('CommentController', '폼 컨테이너가 여전히 null임, 이벤트 리스너 추가 실패');
    }
    
    // "더 보기" 버튼 클릭 이벤트
    if (this.view.loadMoreButton) {
      debugLog('CommentController', '더보기 버튼 클릭 이벤트 리스너 추가');
      this.view.loadMoreButton.addEventListener('click', this.handleLoadMore.bind(this));
    }
    
    // 댓글 카드 내 버튼 이벤트 위임 (답글, 수정, 삭제)
    if (this.view.commentsContainer) {
      debugLog('CommentController', '댓글 카드 이벤트 리스너 추가');
      this.view.commentsContainer.addEventListener('click', this.handleCommentActions.bind(this));
      
      // 답글 취소 버튼 이벤트 처리
      this.view.commentsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('cancel-reply-button')) {
          const formContainer = event.target.closest('.reply-form-container');
          if (formContainer) {
            formContainer.remove();
          }
        }
      });
      
      // 답글 폼 제출 이벤트 처리
      this.view.commentsContainer.addEventListener('submit', (event) => {
        if (event.target.classList.contains('reply-form')) {
          event.preventDefault();
          this.handleCommentSubmit(event);
        }
      });
    }
    
    // 언어 변경 이벤트 감지
    document.querySelectorAll('.language-btn').forEach(btn => {
      debugLog('CommentController', '언어 변경 버튼 이벤트 리스너 추가');
      btn.addEventListener('click', () => {
        // 언어 변경 시 UI 업데이트
        setTimeout(() => {
          const lang = document.documentElement.lang || 'ko';
          debugLog('CommentController', '언어 변경 감지', { lang });
          this.view.updateLanguage(lang);
        }, 200);
      });
    });
    
    debugLog('CommentController', '이벤트 리스너 설정 완료');
  }

  /**
   * 댓글 제출 핸들러
   * @param {Event} event - 제출 이벤트
   */
  handleCommentSubmit(event) {
    debugLog('CommentController', '댓글 제출 핸들러 시작');
    event.preventDefault();
    
    const form = event.target;
    console.log('폼 요소:', form);
    console.log('폼 HTML:', form.outerHTML);
    
    // 폼 내부의 모든 입력 요소 확인
    const allInputs = form.querySelectorAll('input, textarea');
    console.log('모든 입력 요소:', allInputs);
    
    // 다양한 가능한 ID와 속성을 사용하여 작성자 입력 필드 찾기
    const authorInput = form.querySelector('#commenter-name') || 
                        form.querySelector('#comment-author') || 
                        form.querySelector('input[id^="commenter-name"]') || 
                        form.querySelector('input[id^="comment-author"]') || 
                        form.querySelector('input[name="commenter-name"]') || 
                        form.querySelector('input[name="comment-author"]');
    
    // 다양한 가능한 ID와 속성을 사용하여 내용 입력 필드 찾기
    const contentTextarea = form.querySelector('#comment-content') || 
                            form.querySelector('textarea[id^="comment-content"]') || 
                            form.querySelector('textarea[name="comment-content"]');
    
    // 이메일 입력 필드 찾기 (선택적 필드)
    const emailInput = form.querySelector('#commenter-email') || 
                       form.querySelector('input[id^="commenter-email"]') || 
                       form.querySelector('input[name="commenter-email"]');
    
    console.log('작성자 입력 필드:', authorInput);
    console.log('내용 입력 필드:', contentTextarea);
    console.log('이메일 입력 필드:', emailInput);

    if (!authorInput || !contentTextarea) {
      console.error('댓글 폼 요소를 찾을 수 없습니다. 필드 ID 확인 필요: 작성자=' + (authorInput ? '찾음' : '없음') + ', 내용=' + (contentTextarea ? '찾음' : '없음'));
      return;
    }
    
    const author = authorInput.value.trim();
    const content = contentTextarea.value.trim();
    const email = emailInput ? emailInput.value.trim() : null;
    
    // 입력 유효성 검사
    if (!author) {
      alert(this.view.getText('error-empty-name'));
      authorInput.focus();
      return;
    }
    
    if (!content) {
      alert(this.view.getText('error-empty-comment'));
      contentTextarea.focus();
      return;
    }
    
    // 이메일 유효성 검사 (이메일이 입력된 경우에만)
    if (email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert(this.view.getText('error-invalid-email') || '유효한 이메일 주소를 입력해주세요.');
        emailInput.focus();
        return;
      }
    }
    
    if (content.length > this.view.charLimit) {
      alert(this.view.getText('error-comment-too-long').replace('{limit}', this.view.charLimit));
      contentTextarea.focus();
      return;
    }
    
    // 금지어 필터링
    const filterResult = this.model.filterContent(content, this.view.currentLanguage);
    if (!filterResult.passed) {
      alert(this.view.getText('error-banned-word'));
      return;
    }
    
    // 댓글 데이터 구성
    const commentData = {
      author,
      email,  // 이메일 필드 추가 (선택적)
      content,
      // 대댓글인 경우 부모 ID와 깊이 정보 추가
      parent_id: form.querySelector('input[name="parent_id"]')?.value || null,
      depth: form.querySelector('input[name="depth"]')?.value || 0
    };
    
    // 제출 버튼 비활성화 및 로딩 표시
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = this.view.getText('submitting');
    }
    
    // 댓글 저장
    this.model.addComment(commentData)
      .then(savedComment => {
        debugLog('CommentController', '댓글 저장 성공', { savedComment });
        // 폼 초기화
        form.reset();
        
        // 글자 수 카운터 초기화
        const charCount = form.querySelector('.char-count');
        if (charCount) {
          charCount.textContent = `0/${this.view.charLimit}`;
        }
        
        // 새로운 댓글을 추가하거나 대댓글을 표시
        if (!commentData.parent_id) {
          // 최상위 댓글인 경우
          const comments = [savedComment];
          this.view.renderComments(comments, true);
          
          // 댓글 목록으로 스크롤
          this.view.commentsContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          // 대댓글인 경우
          this.loadReplies(commentData.parent_id);
          
          // 대댓글 폼 숨기기
          const replyForm = this.view.commentsContainer.querySelector(`.comment-card[data-id="${commentData.parent_id}"] .reply-form`);
          if (replyForm) {
            replyForm.classList.add('hidden');
          }
        }
        
        // 제출 버튼 재활성화
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = this.view.getText('comments-submit-button');
        }
      })
      .catch(error => {
        debugLog('CommentController', '댓글 저장 오류', error);
        console.error('댓글 저장 중 오류:', error);
        alert(this.view.getText('error-comment-save'));
        
        // 제출 버튼 재활성화
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = this.view.getText('comments-submit-button');
        }
      });
  }

  /**
   * 댓글 카드 내 버튼 액션 핸들러 (답글, 수정, 삭제)
   * @param {Event} event - 클릭 이벤트
   */
  handleCommentActions(event) {
    const target = event.target;
    
    // 가장 가까운 댓글 카드 찾기
    const commentCard = target.closest('.comment-card');
    if (!commentCard) return;
    
    debugLog('CommentController', '댓글 카드 액션', { target: target.className });
    
    // 댓글 ID 가져오기
    const commentId = commentCard.dataset.commentId;
    if (!commentId) {
      debugLog('CommentController', '댓글 ID가 없음');
      return;
    }
    
    // 답글 버튼
    if (target.classList.contains('reply-button') || target.closest('.reply-button')) {
      debugLog('CommentController', '답글 버튼 클릭', { commentId });
      
      // 깊이 확인 및 제한 (선택사항)
      const maxDepth = this.config.maxDepth || 3;
      const commentDepth = parseInt(commentCard.dataset.depth || '0', 10);
      
      if (commentDepth >= maxDepth - 1) {
        alert(this.view.getText('error-max-depth') || '최대 답글 깊이에 도달했습니다.');
        return;
      }
      
      // 대댓글 폼 표시
      this.view.showReplyForm(commentId, commentCard);
    }
    
    // 수정 버튼
    else if (target.classList.contains('edit-button')) {
      this.handleEditComment(commentCard);
    }
    
    // 삭제 버튼
    else if (target.classList.contains('delete-button')) {
      this.handleDeleteComment(commentId);
    }
    
    // 수정 취소 버튼
    else if (target.classList.contains('cancel-edit-button')) {
      this.cancelEditComment(commentCard);
    }
    
    // 수정 저장 버튼
    else if (target.classList.contains('save-edit-button')) {
      this.saveEditComment(commentCard);
    }
  }

  /**
   * 댓글 수정 핸들러
   * @param {HTMLElement} commentCard - 댓글 카드 요소
   */
  handleEditComment(commentCard) {
    const commentId = commentCard.dataset.id;
    const contentElement = commentCard.querySelector('.comment-content');
    if (!contentElement) return;
    
    // 이미 수정 모드인지 확인
    if (commentCard.classList.contains('editing')) return;
    
    // 원본 콘텐츠 저장
    const originalContent = contentElement.textContent;
    commentCard.dataset.originalContent = originalContent;
    
    // 수정 폼 생성
    const editTextarea = document.createElement('textarea');
    editTextarea.className = 'edit-textarea';
    editTextarea.value = originalContent;
    editTextarea.maxLength = this.view.charLimit * 2;
    
    // 글자 수 표시
    const charCount = document.createElement('div');
    charCount.className = 'char-count';
    charCount.textContent = `${originalContent.length}/${this.view.charLimit}`;
    
    // 버튼 컨테이너
    const editActions = document.createElement('div');
    editActions.className = 'edit-actions';
    
    // 취소 버튼
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-edit-button';
    cancelButton.textContent = this.view.getText('cancel-button');
    cancelButton.setAttribute('data-text', 'cancel-button');
    
    // 저장 버튼
    const saveButton = document.createElement('button');
    saveButton.className = 'save-edit-button';
    saveButton.textContent = this.view.getText('save-button');
    saveButton.setAttribute('data-text', 'save-button');
    
    // 버튼 추가
    editActions.appendChild(cancelButton);
    editActions.appendChild(saveButton);
    
    // 원본 콘텐츠 대체
    contentElement.innerHTML = '';
    contentElement.appendChild(editTextarea);
    contentElement.appendChild(charCount);
    contentElement.appendChild(editActions);
    
    // 수정 모드 클래스 추가
    commentCard.classList.add('editing');
    
    // 텍스트 영역에 포커스
    editTextarea.focus();
    
    // 글자 수 업데이트 이벤트
    editTextarea.addEventListener('input', () => {
      const count = editTextarea.value.length;
      charCount.textContent = `${count}/${this.view.charLimit}`;
      
      if (count > this.view.charLimit) {
        charCount.classList.add('exceeded');
        editTextarea.classList.add('exceeded');
      } else {
        charCount.classList.remove('exceeded');
        editTextarea.classList.remove('exceeded');
      }
    });
  }

  /**
   * 댓글 수정 취소 핸들러
   * @param {HTMLElement} commentCard - 댓글 카드 요소
   */
  cancelEditComment(commentCard) {
    const contentElement = commentCard.querySelector('.comment-content');
    if (!contentElement) return;
    
    // 원본 콘텐츠 복원
    const originalContent = commentCard.dataset.originalContent;
    contentElement.innerHTML = this.view.processContent(originalContent);
    
    // 수정 모드 클래스 제거
    commentCard.classList.remove('editing');
    
    // 데이터셋 정리
    delete commentCard.dataset.originalContent;
  }

  /**
   * 댓글 수정 저장 핸들러
   * @param {HTMLElement} commentCard - 댓글 카드 요소
   */
  saveEditComment(commentCard) {
    const commentId = commentCard.dataset.id;
    const editTextarea = commentCard.querySelector('.edit-textarea');
    if (!editTextarea) return;
    
    const newContent = editTextarea.value.trim();
    
    // 유효성 검사
    if (!newContent) {
      alert(this.view.getText('error-empty-comment'));
      editTextarea.focus();
      return;
    }
    
    if (newContent.length > this.view.charLimit) {
      alert(this.view.getText('error-comment-too-long').replace('{limit}', this.view.charLimit));
      editTextarea.focus();
      return;
    }
    
    // 금지어 필터링
    const filterResult = this.model.filterContent(newContent, this.view.currentLanguage);
    if (!filterResult.passed) {
      alert(this.view.getText('error-banned-word'));
      return;
    }
    
    // 변경 사항이 없으면 취소와 동일하게 처리
    if (newContent === commentCard.dataset.originalContent) {
      this.cancelEditComment(commentCard);
      return;
    }
    
    // 업데이트 중 UI 상태 변경
    const saveButton = commentCard.querySelector('.save-edit-button');
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = this.view.getText('saving');
    }
    
    // 댓글 업데이트
    this.model.updateComment(commentId, { content: newContent })
      .then(() => {
        debugLog('CommentController', '댓글 수정 저장 성공');
        // 콘텐츠 요소 업데이트
        const contentElement = commentCard.querySelector('.comment-content');
        if (contentElement) {
          contentElement.innerHTML = this.view.processContent(newContent);
        }
        
        // 수정 모드 클래스 제거
        commentCard.classList.remove('editing');
        
        // 데이터셋 정리
        delete commentCard.dataset.originalContent;
        
        // 미디어 URL이 있으면 미디어 컨테이너 업데이트
        const mediaUrls = this.view.extractMediaUrls(newContent);
        let mediaContainer = commentCard.querySelector('.comment-media');
        
        if (mediaUrls.length > 0) {
          // 미디어 컨테이너가 없으면 새로 생성
          if (!mediaContainer) {
            mediaContainer = document.createElement('div');
            mediaContainer.className = 'comment-media';
            contentElement.parentNode.appendChild(mediaContainer);
          } else {
            mediaContainer.innerHTML = '';
          }
          
          // 미디어 요소 추가
          mediaUrls.forEach(url => {
            const mediaElement = this.view.createMediaElement(url);
            if (mediaElement) {
              mediaContainer.appendChild(mediaElement);
            }
          });
        } else if (mediaContainer) {
          // 미디어 URL이 없는데 컨테이너가 있으면 제거
          mediaContainer.remove();
        }
      })
      .catch(error => {
        debugLog('CommentController', '댓글 수정 저장 오류', error);
        console.error('댓글 업데이트 중 오류:', error);
        alert(this.view.getText('error-comment-update'));
        
        // 버튼 상태 복원
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = this.view.getText('save-button');
        }
      });
  }

  /**
   * 댓글 삭제 핸들러
   * @param {string} commentId - 댓글 ID
   */
  handleDeleteComment(commentId) {
    // 삭제 확인
    if (!confirm(this.view.getText('confirm-delete'))) {
      return;
    }
    
    // 댓글 삭제
    this.model.deleteComment(commentId)
      .then(() => {
        debugLog('CommentController', '댓글 삭제 성공');
        // 댓글 카드 업데이트
        const commentCard = this.view.commentsContainer.querySelector(`.comment-card[data-id="${commentId}"]`);
        if (commentCard) {
          // 콘텐츠 요소 업데이트
          const contentElement = commentCard.querySelector('.comment-content');
          if (contentElement) {
            contentElement.textContent = this.view.getText('deleted-comment');
            contentElement.classList.add('deleted');
          }
          
          // 작성자 업데이트
          const authorElement = commentCard.querySelector('.comment-author');
          if (authorElement) {
            authorElement.textContent = this.view.getText('deleted-user');
            authorElement.classList.add('deleted');
          }
          
          // 버튼 제거
          const footer = commentCard.querySelector('.comment-footer');
          if (footer) {
            footer.innerHTML = '';
          }
          
          // 미디어 컨테이너 제거
          const mediaContainer = commentCard.querySelector('.comment-media');
          if (mediaContainer) {
            mediaContainer.remove();
          }
          
          // 삭제 상태 클래스 추가
          commentCard.classList.add('deleted-comment');
        }
      })
      .catch(error => {
        debugLog('CommentController', '댓글 삭제 오류', error);
        console.error('댓글 삭제 중 오류:', error);
        alert(this.view.getText('error-comment-delete'));
      });
  }

  /**
   * 더 많은 댓글 로드 핸들러
   */
  handleLoadMore() {
    if (!this.lastCommentTimestamp) return;
    
    // 로딩 표시 - 오류 방지
    if (this.view && typeof this.view.showLoading === 'function') {
      this.view.showLoading(true);
    } else if (this.view && typeof this.view.setCommentsLoading === 'function') {
      this.view.setCommentsLoading(true);
    } else {
      debugLog('CommentController', 'showLoading 메서드가 없음 - 건너뛬');
    }
    
    // 추가 댓글 로드
    this.model.getComments(this.config.commentsPerPage, this.lastCommentTimestamp)
      .then(comments => {
        debugLog('CommentController', '추가 댓글 로드 성공', { comments });
        // 로딩 숨김 - 오류 방지
        if (this.view && typeof this.view.showLoading === 'function') {
          this.view.showLoading(false);
        } else if (this.view && typeof this.view.setCommentsLoading === 'function') {
          this.view.setCommentsLoading(false);
        }
        
        if (comments.length > 0) {
          // 마지막 댓글의 타임스탬프 저장
          this.lastCommentTimestamp = comments[comments.length - 1].timestamp;
          
          // 댓글 렌더링 (추가 모드)
          this.view.renderComments(comments, true);
          
          // 더 불러올 댓글이 없으면 버튼 숨김 - 오류 방지
          if (comments.length < this.config.commentsPerPage) {
            if (this.view && typeof this.view.showLoadMoreButton === 'function') {
              this.view.showLoadMoreButton(false);
            } else if (this.view && typeof this.view.updateLoadMoreButton === 'function') {
              this.view.updateLoadMoreButton(false);
            } else {
              debugLog('CommentController', 'showLoadMoreButton 메서드가 없음 - 건너뛬');
            }
          }
        } else {
          // 더 이상 댓글이 없으면 버튼 숨김 - 오류 방지
          if (this.view && typeof this.view.showLoadMoreButton === 'function') {
            this.view.showLoadMoreButton(false);
          } else if (this.view && typeof this.view.updateLoadMoreButton === 'function') {
            this.view.updateLoadMoreButton(false);
          } else {
            debugLog('CommentController', 'showLoadMoreButton 메서드가 없음 - 건너뛬');
          }
        }
      })
      .catch(error => {
        debugLog('CommentController', '추가 댓글 로드 오류', error);
        console.error('추가 댓글 로드 중 오류:', error);
        this.view.showLoading(false);
      });
  }

  /**
   * 초기 댓글 로드
   */
  loadComments() {
    debugLog('CommentController', 'loadComments 호출 시작');
    
    // 뷰 객체 상태 확인
    debugLog('CommentController', 'loadComments에서 뷰 객체 상태 확인', {
      viewExists: !!this.view,
      viewType: this.view ? typeof this.view : 'undefined',
      viewConstructor: this.view ? this.view.constructor.name : 'undefined',
      viewProto: this.view ? Object.getPrototypeOf(this.view).constructor.name : 'undefined',
      hasShowLoading: this.view ? typeof this.view.showLoading === 'function' : false,
      hasSetCommentsLoading: this.view ? typeof this.view.setCommentsLoading === 'function' : false,
      viewProps: this.view ? Object.getOwnPropertyNames(this.view) : []  
    });
    
    // 로딩 표시 - 오류 방지
    if (this.view && typeof this.view.showLoading === 'function') {
      debugLog('CommentController', 'showLoading 메서드 호출');
      this.view.showLoading(true);
    } else if (this.view && typeof this.view.setCommentsLoading === 'function') {
      debugLog('CommentController', 'setCommentsLoading 메서드 대체 호출');
      this.view.setCommentsLoading(true);
    } else {
      debugLog('CommentController', 'showLoading 메서드가 없음 - 건너뛬');
    }
    
    // 댓글 로드
    this.model.getComments(this.config.commentsPerPage)
      .then(comments => {
        debugLog('CommentController', '초기 댓글 로드 성공', { comments });
        // 로딩 숨김 - 오류 방지
        if (this.view && typeof this.view.showLoading === 'function') {
          this.view.showLoading(false);
        } else if (this.view && typeof this.view.setCommentsLoading === 'function') {
          this.view.setCommentsLoading(false);
        }
        
        // 댓글 렌더링
        this.view.renderComments(comments);
        
        if (comments.length > 0) {
          // 마지막 댓글의 타임스탬프 저장
          this.lastCommentTimestamp = comments[comments.length - 1].timestamp;
          
          // 더 많은 댓글이 있을 수 있으면 버튼 표시 - 오류 방지
          if (comments.length >= this.config.commentsPerPage) {
            if (this.view && typeof this.view.showLoadMoreButton === 'function') {
              this.view.showLoadMoreButton(true);
            } else if (this.view && typeof this.view.updateLoadMoreButton === 'function') {
              this.view.updateLoadMoreButton(true);
            } else {
              debugLog('CommentController', 'showLoadMoreButton 메서드가 없음 - 건너뛬');
            }
          }
          
          // 최상위 댓글에 대한 대댓글 로드
          comments.forEach(comment => {
            this.loadReplies(comment.id);
          });
        }
      })
      .catch(error => {
        debugLog('CommentController', '초기 댓글 로드 오류', error);
        console.error('댓글 로드 중 오류:', error);
        this.view.showLoading(false);
      });
  }

  /**
   * 대댓글 로드
   * @param {string} parentId - 부모 댓글 ID
   */
  loadReplies(parentId) {
    this.model.getReplies(parentId)
      .then(replies => {
        debugLog('CommentController', '대댓글 로드 성공', { replies });
        if (replies.length > 0) {
          // 대댓글 렌더링
          this.view.renderReplies(replies, parentId);
        }
      })
      .catch(error => {
        console.error(`대댓글 로드 중 오류 (부모 ID: ${parentId}):`, error);
      });
  }

  /**
   * 자동 새로고침 설정
   */
  setupAutoRefresh() {
    if (this.commentsListener) {
      // 기존 리스너가 있으면 제거
      this.model.removeListener(this.commentsListener);
    }
    
    // 실시간 업데이트 리스너 설정
    this.commentsListener = this.model.onCommentsUpdate(comments => {
      // 댓글이 있는 경우에만 업데이트
      if (comments && comments.length > 0) {
        this.view.renderComments(comments);
        
        // 최상위 댓글에 대한 대댓글 로드
        comments.forEach(comment => {
          if (comment.depth === 0) {
            this.loadReplies(comment.id);
          }
        });
      }
    });
  }

  /**
   * 리소스 정리
   */
  cleanup() {
    // 실시간 리스너 제거
    if (this.commentsListener) {
      this.model.removeListener(this.commentsListener);
    }
    
    // 자동 새로고침 타이머 정리
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
}

// 전역으로 컨트롤러 노출
window.CommentController = CommentController;
