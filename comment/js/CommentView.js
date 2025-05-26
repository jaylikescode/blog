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
    // 컨테이너 요소 설정
    this.container = config.container || document.getElementById('comments');
    if (!this.container) {
      console.error('댓글 컨테이너를 찾을 수 없습니다.');
      return false;
    }

    // 폼 및 목록 컨테이너 찾기
    this.formContainer = this.container.querySelector('.comment-form');
    this.listContainer = this.container.querySelector('.comments-list');

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
    // 댓글 폼 UI 생성
    this.renderCommentForm();
    
    // 댓글 목록 컨테이너 초기화
    if (this.listContainer) {
      const commentsList = this.listContainer.querySelector('.comments-container') || document.createElement('div');
      commentsList.className = 'comments-container';
      if (!this.listContainer.contains(commentsList)) {
        this.listContainer.appendChild(commentsList);
      }
      this.commentsContainer = commentsList;
    }
    
    // 로딩 인디케이터 생성
    this.createLoadingIndicator();
    
    // "더 보기" 버튼 생성
    this.createLoadMoreButton();
  }

  /**
   * 댓글 폼 UI 렌더링
   */
  renderCommentForm() {
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
    
    // 글자 수 제한 이벤트 설정
    const textarea = form.querySelector('textarea');
    const charCount = form.querySelector('.char-count');
    
    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        const count = textarea.value.length;
        charCount.textContent = `${count}/${this.charLimit}`;
        
        // 글자 수 초과 시 시각적 피드백
        if (count > this.charLimit) {
          charCount.classList.add('exceeded');
          textarea.classList.add('exceeded');
        } else {
          charCount.classList.remove('exceeded');
          textarea.classList.remove('exceeded');
        }
      });
    }
  }

  /**
   * 입력 필드 생성 헬퍼 함수
   * @param {string} type - 입력 타입
   * @param {string} id - 요소 ID
   * @param {string} labelText - 라벨 텍스트
   * @param {boolean} required - 필수 입력 여부
   * @returns {HTMLElement} 입력 필드 컨테이너
   */
  createInput(type, id, labelText, required = false) {
    const container = document.createElement('div');
    container.className = 'input-group';
    
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = labelText;
    label.setAttribute('data-text', id + '-label');
    
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.required = required;
    input.maxLength = type === 'text' ? 30 : null; // 이름 입력 길이 제한
    
    container.appendChild(label);
    container.appendChild(input);
    
    return container;
  }

  /**
   * 텍스트영역 생성 헬퍼 함수
   * @param {string} id - 요소 ID
   * @param {string} labelText - 라벨 텍스트
   * @param {number} maxLength - 최대 길이
   * @returns {HTMLElement} 텍스트영역 컨테이너
   */
  createTextarea(id, labelText, maxLength) {
    const container = document.createElement('div');
    container.className = 'input-group';
    
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = labelText;
    label.setAttribute('data-text', id + '-label');
    
    const textarea = document.createElement('textarea');
    textarea.id = id;
    textarea.required = true;
    textarea.rows = 4;
    textarea.placeholder = this.getText('comment-placeholder');
    textarea.maxLength = maxLength * 2; // 실제로는 JS로 제한하므로 HTML 제한은 더 크게 설정
    
    container.appendChild(label);
    container.appendChild(textarea);
    
    return container;
  }

  /**
   * 폼 푸터 (글자 수, 제출 버튼) 생성
   * @returns {HTMLElement} 폼 푸터 요소
   */
  createFormFooter() {
    const footer = document.createElement('div');
    footer.className = 'comment-form-footer';
    
    const charCount = document.createElement('span');
    charCount.className = 'char-count';
    charCount.textContent = `0/${this.charLimit}`;
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = this.getText('comments-submit-button');
    submitButton.setAttribute('data-text', 'comments-submit-button');
    
    footer.appendChild(charCount);
    footer.appendChild(submitButton);
    
    return footer;
  }

  /**
   * 로딩 인디케이터 생성
   */
  createLoadingIndicator() {
    const loading = document.createElement('div');
    loading.className = 'comments-loading hidden';
    loading.textContent = this.getText('loading');
    loading.setAttribute('data-text', 'loading');
    
    if (this.listContainer) {
      this.listContainer.appendChild(loading);
      this.loadingIndicator = loading;
    }
  }

  /**
   * "더 보기" 버튼 생성
   */
  createLoadMoreButton() {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'load-more-comments hidden';
    loadMoreBtn.textContent = this.getText('load-more');
    loadMoreBtn.setAttribute('data-text', 'load-more');
    
    if (this.listContainer) {
      this.listContainer.appendChild(loadMoreBtn);
      this.loadMoreButton = loadMoreBtn;
    }
  }

  /**
   * 로딩 인디케이터 표시/숨김
   * @param {boolean} show - 표시 여부
   */
  showLoading(show) {
    if (this.loadingIndicator) {
      if (show) {
        this.loadingIndicator.classList.remove('hidden');
      } else {
        this.loadingIndicator.classList.add('hidden');
      }
    }
  }

  /**
   * "더 보기" 버튼 표시/숨김
   * @param {boolean} show - 표시 여부
   */
  showLoadMoreButton(show) {
    if (this.loadMoreButton) {
      if (show) {
        this.loadMoreButton.classList.remove('hidden');
      } else {
        this.loadMoreButton.classList.add('hidden');
      }
    }
  }

  /**
   * 댓글 목록 렌더링
   * @param {Array} comments - 댓글 데이터 배열
   * @param {boolean} append - 기존 목록에 추가 여부
   */
  renderComments(comments, append = false) {
    if (!this.commentsContainer) return;
    
    // 로딩 인디케이터 숨김
    this.showLoading(false);
    
    // 댓글이 없는 경우
    if (!comments || comments.length === 0) {
      if (!append) {
        this.commentsContainer.innerHTML = `<div class="no-comments">${this.getText('no-comments')}</div>`;
      }
      this.showLoadMoreButton(false);
      return;
    }
    
    // 기존 목록 유지 또는 초기화
    if (!append) {
      this.commentsContainer.innerHTML = '';
    }
    
    // 댓글 카드 생성 및 추가
    comments.forEach(comment => {
      if (comment.depth === 0) { // 최상위 댓글만 처리
        const commentCard = this.createCommentCard(comment);
        this.commentsContainer.appendChild(commentCard);
      }
    });
  }

  /**
   * 댓글 카드 생성
   * @param {Object} comment - 댓글 데이터
   * @returns {HTMLElement} 댓글 카드 요소
   */
  createCommentCard(comment) {
    const card = document.createElement('div');
    card.className = 'comment-card';
    card.dataset.id = comment.id;
    card.dataset.depth = comment.depth || 0;
    
    // 헤더 (작성자, 날짜)
    const header = document.createElement('div');
    header.className = 'comment-header';
    
    const author = document.createElement('span');
    author.className = 'comment-author';
    author.textContent = comment.author;
    
    const date = document.createElement('span');
    date.className = 'comment-date';
    date.textContent = this.formatDate(comment.timestamp);
    
    header.appendChild(author);
    header.appendChild(date);
    
    // 본문
    const body = document.createElement('div');
    body.className = 'comment-body';
    
    const content = document.createElement('p');
    content.className = 'comment-content';
    content.innerHTML = this.processContent(comment.content);
    
    body.appendChild(content);
    
    // 미디어가 있는 경우 처리
    const mediaUrls = this.extractMediaUrls(comment.content);
    if (mediaUrls.length > 0) {
      const mediaContainer = document.createElement('div');
      mediaContainer.className = 'comment-media';
      
      mediaUrls.forEach(url => {
        const mediaElement = this.createMediaElement(url);
        if (mediaElement) {
          mediaContainer.appendChild(mediaElement);
        }
      });
      
      if (mediaContainer.children.length > 0) {
        body.appendChild(mediaContainer);
      }
    }
    
    // 푸터 (답글, 수정, 삭제 버튼)
    const footer = document.createElement('div');
    footer.className = 'comment-footer';
    
    const replyButton = document.createElement('button');
    replyButton.className = 'reply-button';
    replyButton.textContent = this.getText('reply-button');
    replyButton.setAttribute('data-text', 'reply-button');
    
    footer.appendChild(replyButton);
    
    // 현재 사용자의 댓글인 경우 수정/삭제 버튼 표시
    if (comment.user_id === this.getCurrentUserId()) {
      const editButton = document.createElement('button');
      editButton.className = 'edit-button';
      editButton.textContent = this.getText('edit-button');
      editButton.setAttribute('data-text', 'edit-button');
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
      deleteButton.textContent = this.getText('delete-button');
      deleteButton.setAttribute('data-text', 'delete-button');
      
      footer.appendChild(editButton);
      footer.appendChild(deleteButton);
    }
    
    // 대댓글 컨테이너
    const repliesContainer = document.createElement('div');
    repliesContainer.className = 'replies-container';
    
    // 대댓글 입력 폼 (기본적으로 숨김)
    const replyForm = document.createElement('div');
    replyForm.className = 'reply-form hidden';
    
    // 카드에 모든 요소 추가
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    card.appendChild(repliesContainer);
    card.appendChild(replyForm);
    
    return card;
  }

  /**
   * 대댓글 렌더링
   * @param {Array} replies - 대댓글 데이터 배열
   * @param {string} parentId - 부모 댓글 ID
   */
  renderReplies(replies, parentId) {
    const parentCard = this.commentsContainer.querySelector(`.comment-card[data-id="${parentId}"]`);
    if (!parentCard) return;
    
    const repliesContainer = parentCard.querySelector('.replies-container');
    if (!repliesContainer) return;
    
    // 기존 대댓글 초기화
    repliesContainer.innerHTML = '';
    
    // 대댓글이 없는 경우
    if (!replies || replies.length === 0) {
      return;
    }
    
    // 대댓글 카드 생성 및 추가
    replies.forEach(reply => {
      const replyCard = this.createCommentCard(reply);
      replyCard.classList.add('reply');
      repliesContainer.appendChild(replyCard);
    });
  }

  /**
   * 대댓글 폼 렌더링
   * @param {string} parentId - 부모 댓글 ID
   * @param {number} depth - 댓글 깊이
   */
  renderReplyForm(parentId, depth) {
    const parentCard = this.commentsContainer.querySelector(`.comment-card[data-id="${parentId}"]`);
    if (!parentCard) return;
    
    const replyFormContainer = parentCard.querySelector('.reply-form');
    if (!replyFormContainer) return;
    
    // 이미 폼이 있는 경우 토글
    if (replyFormContainer.children.length > 0) {
      replyFormContainer.classList.toggle('hidden');
      return;
    }
    
    // 새 폼 생성
    const form = document.createElement('form');
    form.className = 'comment-input-form reply-input-form';
    
    const nameInput = this.createInput('text', `reply-author-${parentId}`, this.getText('comments-name-label'), true);
    const contentTextarea = this.createTextarea(`reply-content-${parentId}`, this.getText('comments-content-label'), this.charLimit);
    const formFooter = this.createFormFooter();
    
    // 취소 버튼 추가
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'cancel-reply-button';
    cancelButton.textContent = this.getText('cancel-button');
    cancelButton.setAttribute('data-text', 'cancel-button');
    formFooter.insertBefore(cancelButton, formFooter.lastChild);
    
    // 부모 ID 및 깊이 정보 저장
    const hiddenParentId = document.createElement('input');
    hiddenParentId.type = 'hidden';
    hiddenParentId.name = 'parent_id';
    hiddenParentId.value = parentId;
    
    const hiddenDepth = document.createElement('input');
    hiddenDepth.type = 'hidden';
    hiddenDepth.name = 'depth';
    hiddenDepth.value = depth + 1;
    
    form.appendChild(nameInput);
    form.appendChild(contentTextarea);
    form.appendChild(hiddenParentId);
    form.appendChild(hiddenDepth);
    form.appendChild(formFooter);
    
    replyFormContainer.innerHTML = '';
    replyFormContainer.appendChild(form);
    replyFormContainer.classList.remove('hidden');
    
    // 자동 포커스
    setTimeout(() => {
      const authorInput = form.querySelector('input[type="text"]');
      if (authorInput) authorInput.focus();
    }, 100);
    
    // 글자 수 제한 이벤트 설정
    const textarea = form.querySelector('textarea');
    const charCount = form.querySelector('.char-count');
    
    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        const count = textarea.value.length;
        charCount.textContent = `${count}/${this.charLimit}`;
        
        if (count > this.charLimit) {
          charCount.classList.add('exceeded');
          textarea.classList.add('exceeded');
        } else {
          charCount.classList.remove('exceeded');
          textarea.classList.remove('exceeded');
        }
      });
    }
    
    // 취소 버튼 이벤트
    cancelButton.addEventListener('click', (e) => {
      e.preventDefault();
      replyFormContainer.classList.add('hidden');
    });
  }

  /**
   * 댓글 내용 처리 (링크, 이모지 등)
   * @param {string} content - 댓글 내용
   * @returns {string} 처리된 HTML
   */
  processContent(content) {
    if (!content) return '';
    
    // XSS 방지를 위한 이스케이프
    let processedContent = this.escapeHtml(content);
    
    // URL을 링크로 변환
    processedContent = this.convertUrlsToLinks(processedContent);
    
    // 줄바꿈 처리
    processedContent = processedContent.replace(/\n/g, '<br>');
    
    return processedContent;
  }

  /**
   * HTML 이스케이프
   * @param {string} html - 원본 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * URL을 링크로 변환
   * @param {string} text - 원본 텍스트
   * @returns {string} 링크가 포함된 텍스트
   */
  convertUrlsToLinks(text) {
    const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return text.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  /**
   * 미디어 URL 추출
   * @param {string} content - 댓글 내용
   * @returns {Array} 미디어 URL 배열
   */
  extractMediaUrls(content) {
    if (!content) return [];
    
    const imageUrlPattern = /https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)(\?[^"'\s]*)?/gi;
    const matches = content.match(imageUrlPattern) || [];
    
    // 중복 제거 및 최대 3개로 제한
    return [...new Set(matches)].slice(0, 3);
  }

  /**
   * 미디어 요소 생성
   * @param {string} url - 미디어 URL
   * @returns {HTMLElement} 미디어 요소
   */
  createMediaElement(url) {
    const isImage = /\.(jpg|jpeg|png|webp)(\?[^"'\s]*)?$/i.test(url);
    const isGif = /\.gif(\?[^"'\s]*)?$/i.test(url);
    
    if (isImage || isGif) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Comment media';
      img.className = 'comment-media-item';
      
      // 로딩 오류 처리
      img.onerror = function() {
        this.style.display = 'none';
      };
      
      return img;
    }
    
    return null;
  }

  /**
   * 날짜 형식화
   * @param {number} timestamp - 타임스탬프
   * @returns {string} 형식화된 날짜
   */
  formatDate(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    // 상대적 시간 표시
    if (diffDay === 0) {
      if (diffHour === 0) {
        if (diffMin === 0) {
          return this.getText('just-now');
        }
        return `${diffMin}${this.getText('minutes-ago')}`;
      }
      return `${diffHour}${this.getText('hours-ago')}`;
    } else if (diffDay === 1) {
      return this.getText('yesterday');
    } else if (diffDay < 7) {
      return `${diffDay}${this.getText('days-ago')}`;
    }
    
    // 절대 날짜 표시
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * 현재 사용자 ID 가져오기
   * @returns {string} 사용자 ID
   */
  getCurrentUserId() {
    return localStorage.getItem('comment_user_id') || '';
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
