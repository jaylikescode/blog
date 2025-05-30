/**
 * CommentModel.js
 * 댓글 관련 데이터 모델 및 Firebase 상호작용을 담당하는 클래스
 * Firebase SDK v9 호환성 모드 사용
 */

/**
 * 댓글 모델 클래스
 * 단일 책임 원칙(SRP): Firebase 데이터베이스와의 상호 작용 및 댓글 데이터 관리만 담당
 */
class CommentModel {
  /**
   * 생성자
   * @param {Object} config - 설정 객체
   */
  constructor(config = {}) {
    this.dbRef = null;
    this.moderationRef = null;
    this.moderationConfig = null;
    this.currentUserId = null;
    this.init(config);
  }

  /**
   * 초기화 함수
   * @param {Object} config - 설정 객체
   * @returns {boolean} 초기화 성공 여부
   */
  init(config) {
    // Firebase 초기화 확인
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK가 로드되지 않았습니다.');
      return false;
    }

    try {
      debugLog('CommentModel', '댓글 데이터 검증 및 준비 시작');
      
      // 댓글 데이터베이스 참조 생성
      this.dbRef = firebase.database().ref('comments');
      
      // 모더레이션 설정 참조
      this.moderationRef = firebase.database().ref('moderation');
      
      // 사용자 ID 설정 또는 생성
      this.setCurrentUserId();
      
      // 모더레이션 설정 로드
      this.loadModerationConfig();
      
      debugLog('CommentModel', 'Firebase 데이터베이스 참조 생성 완료');
      return true;
    } catch (error) {
      debugLog('CommentModel', '댓글 모델 초기화 중 오류 발생', error);
      console.error('댓글 모델 초기화 중 오류:', error);
      return false;
    }
  }

  /**
   * 현재 사용자 ID 설정 또는 생성
   */
  setCurrentUserId() {
    // 로컬 스토리지에서 사용자 ID 가져오기
    let userId = localStorage.getItem('comment_user_id');
    
    // 사용자 ID가 없으면 새로 생성
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('comment_user_id', userId);
    }
    
    this.currentUserId = userId;
    return userId;
  }

  /**
   * 현재 사용자 ID 가져오기
   * @returns {string} 사용자 ID
   */
  getCurrentUserId() {
    return this.currentUserId;
  }

  /**
   * 모더레이션 설정 로드
   * @returns {Promise} 설정 로드 프로미스
   */
  loadModerationConfig() {
    return this.moderationRef.once('value')
      .then(snapshot => {
        this.moderationConfig = snapshot.val() || {
          banned_words: {
            ko: [],
            en: []
          },
          use_external_api: false
        };
        return this.moderationConfig;
      })
      .catch(error => {
        console.error('모더레이션 설정 로드 중 오류:', error);
        // 기본 설정 사용
        this.moderationConfig = {
          banned_words: {
            ko: [],
            en: []
          },
          use_external_api: false
        };
        return this.moderationConfig;
      });
  }

  /**
   * 댓글 목록 가져오기
   * @param {number} limit - 가져올 댓글 개수
   * @param {string} startAt - 이 키 이후부터 가져오기 (페이지네이션)
   * @returns {Promise<Array>} 댓글 목록
   */
  async getComments(limit = 10, startAt = null) {
    debugLog('CommentModel', '댓글 목록 조회 시작', { limit, startAt });
    let query = this.dbRef.orderByChild('timestamp').limitToLast(limit);
    
    if (startAt) {
      query = query.endAt(startAt);
    }
    
    debugLog('CommentModel', 'Firebase 데이터 조회 시작');
    const snapshot = await query.once('value');
    debugLog('CommentModel', 'Firebase 데이터 조회 완료', { dataExists: snapshot.exists() });
    
    const comments = [];
    
    snapshot.forEach((childSnapshot) => {
        const comment = childSnapshot.val();
        comment.id = childSnapshot.key;
        
        // created_at 필드가 없는 경우 생성
        if (!comment.created_at && comment.timestamp) {
          const date = new Date(comment.timestamp);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          comment.created_at = `${year}-${month}-${day} ${hours}:${minutes}`;
        }
        
        // 최상위 댓글만 가져오기 (depth === 0)
        if (comment.depth === 0) {
          comments.push(comment);
        }
      });
    
    debugLog('CommentModel', '가져온 댓글 수', comments.length);
    
    // 댓글 시간순 정렬
    comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    debugLog('CommentModel', '댓글 목록 조회 완료', comments);
    return comments;
  }

  /**
   * 대댓글 가져오기
   * @param {string} parentId - 부모 댓글 ID
   * @returns {Promise} 대댓글 데이터 프로미스
   */
  getReplies(parentId) {
    return this.dbRef.orderByChild('parent_id').equalTo(parentId).once('value')
      .then(snapshot => {
        const replies = [];
        snapshot.forEach(childSnapshot => {
          const reply = childSnapshot.val();
          reply.id = childSnapshot.key;
          
          // created_at 필드가 없는 경우 생성
          if (!reply.created_at && reply.timestamp) {
            const date = new Date(reply.timestamp);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            reply.created_at = `${year}-${month}-${day} ${hours}:${minutes}`;
          }
          
          replies.push(reply);
        });
        
        // 시간순 오름차순으로 정렬 (오래된 댓글이 먼저)
        replies.sort((a, b) => a.timestamp - b.timestamp);
        
        return replies;
      });
  }

  /**
   * 새 댓글 추가
   * @param {Object} commentData - 댓글 데이터
   * @returns {Promise<string>} 생성된 댓글 ID
   */
  async addComment(commentData) {
    debugLog('CommentModel', '댓글 추가 시작', commentData);
    
    try {
      // 필수 필드 확인
      if (!commentData.author || !commentData.content) {
        throw new Error('이름과 내용은 필수입니다.');
      }
      
      // 내용 필터링 (금지어 확인) - 개방-폐쇄 원칙(OCP)에 따라 확장 가능한 필터링 로직
      const filterResult = this.filterContent(commentData.content);
      if (!filterResult.passed) {
        throw new Error('금지된 단어가 포함되어 있습니다: ' + filterResult.word);
      }
      
      // 필터링된 내용으로 교체
      commentData.content = this._filterBannedWords(commentData.content);
      debugLog('CommentModel', '금지어 필터링 후', commentData.content);
      
      // 현재 날짜 및 시간 구현 - 리스코프 적용 방식으로 분리
      const formattedDateTime = this._getFormattedDateTime();
      
      // IP 해싱 (제공된 경우)
      if (commentData.ip) {
        commentData.ip_hash = this.hashIpAddress(commentData.ip);
        delete commentData.ip; // 원본 IP 삭제
      }
      
      // 댓글 데이터 완성
      const newComment = {
        author: commentData.author,
        content: commentData.content,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        created_at: formattedDateTime, // 사람이 읽기 쉽게 포맷팅된 시간
        email: commentData.email || '',
        parent_id: commentData.parent_id || null,
        depth: commentData.parent_id ? (commentData.depth || 1) : 0,
        ip_hash: commentData.ip_hash || '',
        has_replies: false
      };
      
      // 날짜 관련 배열 생성 (Optional)
      if (commentData.date) {
        newComment.date = commentData.date;
      }
      
      debugLog('CommentModel', 'Firebase에 댓글 저장 시작', newComment);
      
      // Firebase에 댓글 저장 - async/await 사용하여 더 가독성 좋게 변경
      const snapshot = await this.dbRef.push(newComment);
      const commentId = snapshot.key;
      debugLog('CommentModel', '댓글 저장 성공', { commentId });
      
      // 대댓글인 경우 부모 댓글의 has_replies를 true로 설정
      if (commentData.parent_id) {
        await this.dbRef.child(commentData.parent_id).update({ has_replies: true });
      }
      
      return commentId;
    } catch (error) {
      debugLog('CommentModel', '댓글 추가 중 오류 발생', error);
      throw error; // async 함수이뮼로 Promise.reject 대신 throw 사용
    }
  }
  
  /**
   * 현재 날짜와 시간을 서식화된 문자열로 반환
   * @returns {string} YYYY-MM-DD HH:MM 형식의 날짜/시간 문자열
   * @private
   */
  _getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  /**
   * 댓글 수정
   * @param {string} commentId - 댓글 ID
   * @param {Object} updatedData - 수정된 데이터
   * @returns {Promise} 업데이트 프로미스
   */
  updateComment(commentId, updatedData) {
    // 수정할 수 있는 필드만 선택
    const updates = {};
    if (updatedData.content) updates.content = updatedData.content;
    if (updatedData.email !== undefined) updates.email = updatedData.email;
    
    // 금지어 필터링
    debugLog('CommentModel', '금지어 필터링 전', updatedData.content);
    updates.content = this._filterBannedWords(updatedData.content);
    debugLog('CommentModel', '금지어 필터링 후', updates.content);
    
    // 현재 날짜 및 시간 포맷팅 (YYYY-MM-DD HH:MM 형식)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
    
    // 수정 시간 추가
    updates.edited_timestamp = firebase.database.ServerValue.TIMESTAMP;
    updates.edited_at = formattedDateTime; // 사람이 읽기 쉬운 형식의 수정 시간 추가
    
    return this.dbRef.child(commentId).update(updates);
  }

  /**
   * 댓글 삭제
   * @param {string} commentId - 댓글 ID
   * @returns {Promise} 삭제 프로미스
   */
  deleteComment(commentId) {
    return this.dbRef.child(commentId).update({
      deleted: true,
      content: '삭제된 댓글입니다.',
      author: '삭제됨'
    });
  }

  /**
   * 댓글 내용 필터링 (금지어 확인)
   * @param {string} content - 댓글 내용
   * @param {string} language - 언어 코드
   * @returns {Object} 필터링 결과
   */
  filterContent(content, language = 'ko') {
    if (!this.moderationConfig) {
      return { passed: true };
    }
    
    const bannedWords = this.moderationConfig.banned_words[language] || [];
    
    // 금지어 확인
    for (const word of bannedWords) {
      if (content.toLowerCase().includes(word.toLowerCase())) {
        return { 
          passed: false, 
          reason: 'banned_word',
          word: word
        };
      }
    }
    
    return { passed: true };
  }
  
  /**
   * 댓글 내용에서 금지어 필터링 (내부 함수)
   * @param {string} content - 댓글 내용
   * @returns {string} 필터링된 내용
   * @private
   */
  _filterBannedWords(content) {
    if (!content || !this.moderationConfig) {
      return content;
    }
    
    const bannedWords = this.moderationConfig.banned_words['ko'] || [];
    let filteredContent = content;
    
    // 금지어 검색 및 바꿀
    for (const word of bannedWords) {
      if (filteredContent.toLowerCase().includes(word.toLowerCase())) {
        // 금지어를 '*' 문자로 바꿈
        const replacement = '*'.repeat(word.length);
        filteredContent = filteredContent.replace(new RegExp(word, 'gi'), replacement);
      }
    }
    
    return filteredContent;
  }

  /**
   * IP 주소 해싱 (개인정보 보호)
   * @param {string} ipAddress - IP 주소
   * @returns {string} 해시된 IP 주소
   */
  hashIpAddress(ipAddress) {
    // 간단한 해싱 구현 (실제로는 더 강력한 해싱 알고리즘 사용 권장)
    let hash = 0;
    for (let i = 0; i < ipAddress.length; i++) {
      const char = ipAddress.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit 정수로 변환
    }
    return 'ip_' + Math.abs(hash).toString(16);
  }

  /**
   * 실시간 댓글 업데이트 리스너 설정
   * @param {Function} callback - 콜백 함수
   * @param {number} limit - 가져올 댓글 수 (기본값 10)
   * @returns {Object} 리스너 참조
   */
  onCommentsUpdate(callback, limit = 10) {
    debugLog('CommentModel', '실시간 댓글 업데이트 리스너 설정', { limit });
    
    // 인터페이스 분리 원칙(ISP)에 따라 콜백이 함수인지 확인
    if (typeof callback !== 'function') {
      console.error('콜백은 반드시 함수여야 합니다.');
      return null;
    }
    
    try {
      const query = this.dbRef.orderByChild('timestamp').limitToLast(limit);
      
      const listener = query.on('value', snapshot => {
        const comments = [];
        snapshot.forEach(childSnapshot => {
          const comment = childSnapshot.val();
          comment.id = childSnapshot.key;
          comments.push(comment);
        });
        
        // 시간순 정렬 (최신순)
        comments.sort((a, b) => b.timestamp - a.timestamp);
        
        // 콜백 호출 전 디버그 로그
        debugLog('CommentModel', '실시간 댓글 업데이트 받음', { count: comments.length });
        
        callback(comments);
      }, error => {
        // 오류 처리 개선
        console.error('댓글 업데이트 리스너 오류:', error);
        debugLog('CommentModel', '댓글 업데이트 리스너 오류 발생', error);
      });
      
      // 리스너 정보 반환 - 후에 제거하기 위한 필수 정보 포함
      return { ref: query, event: 'value', callback: listener };
    } catch (error) {
      debugLog('CommentModel', '리스너 설정 오류', error);
      console.error('리스너 설정 중 오류가 발생했습니다:', error);
      return null;
    }
  }

  /**
   * 리스너 제거
   * @param {Object} listener - 리스너 참조
   * @returns {boolean} 제거 성공 여부
   */
  removeListener(listener) {
    debugLog('CommentModel', '리스너 제거 시도');
    
    try {
      if (listener && listener.ref && listener.event && listener.callback) {
        listener.ref.off(listener.event, listener.callback);
        debugLog('CommentModel', '리스너 제거 성공');
        return true;
      } else {
        debugLog('CommentModel', '리스너 제거 실패 - 유효하지 않은 리스너 객체');
        return false;
      }
    } catch (error) {
      debugLog('CommentModel', '리스너 제거 오류', error);
      console.error('리스너 제거 중 오류가 발생했습니다:', error);
      return false;
    }
  }
}

// 전역으로 모델 노출
window.CommentModel = CommentModel;
