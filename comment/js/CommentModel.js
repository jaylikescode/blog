/**
 * CommentModel.js
 * 댓글 관련 데이터 모델 및 Firebase 상호작용을 담당하는 클래스
 */

class CommentModel {
  /**
   * 생성자
   * @param {Object} config - 설정 객체
   */
  constructor(config = {}) {
    this.dbRef = null;
    this.moderationConfig = null;
    this.currentUserId = null;
    this.init(config);
  }

  /**
   * 초기화 함수
   * @param {Object} config - 설정 객체
   */
  init(config) {
    // Firebase 초기화 확인
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK가 로드되지 않았습니다.');
      return false;
    }

    try {
      debugLog('CommentModel', '댓글 데이터 검증 및 준비 시작');
      // 댓글 데이터 검증 및 준비참조 생성
      this.dbRef = firebase.database().ref('comments');
      
      // 모더레이션 설정 참조
      this.moderationRef = firebase.database().ref('moderation');
      
      // 사용자 ID 설정 또는 생성
      this.setCurrentUserId();
      
      // 모더레이션 설정 로드
      this.loadModerationConfig();
      
      return true;
    } catch (error) {
      debugLog('CommentModel', '댓글 추가 중 오류 발생', error);
      console.error('댓글 추가 중 오류:', error);
      throw error;
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
          replies.push(reply);
        });
        
        // 시간순 정렬
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
    // 새 댓글 ID 생성
    const newCommentRef = this.dbRef.push();
    
    // 기본 데이터와 사용자 입력 병합
    const comment = {
      author: commentData.author,
      content: commentData.content,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      parent_id: commentData.parent_id || null,
      depth: commentData.depth || 0,
      ip_hash: this.hashIpAddress(commentData.ipAddress || '0.0.0.0'),
      user_id: this.currentUserId
    };
    
    // Firebase에 저장
    const processedData = { ...comment };
    debugLog('CommentModel', 'Firebase 댓글 저장 중', { refKey: newCommentRef.key, data: processedData });
    await newCommentRef.set(processedData);
    
    debugLog('CommentModel', 'Firebase 댓글 저장 완료', newCommentRef.key);
    return newCommentRef.key;
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
    
    // 금지어 필터링
    debugLog('CommentModel', '금지어 필터링 전', updatedData.content);
    updates.content = this._filterBannedWords(updatedData.content);
    debugLog('CommentModel', '금지어 필터링 후', updates.content);
    
    // 수정 시간 추가
    updates.edited_timestamp = firebase.database.ServerValue.TIMESTAMP;
    
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
   * @returns {Object} 리스너 참조
   */
  onCommentsUpdate(callback) {
    const listener = this.dbRef.orderByChild('timestamp').limitToLast(10).on('value', snapshot => {
      const comments = [];
      snapshot.forEach(childSnapshot => {
        const comment = childSnapshot.val();
        comment.id = childSnapshot.key;
        comments.push(comment);
      });
      
      // 시간순 정렬 (최신순)
      comments.sort((a, b) => b.timestamp - a.timestamp);
      
      callback(comments);
    });
    
    return { ref: this.dbRef, event: 'value', callback: listener };
  }

  /**
   * 리스너 제거
   * @param {Object} listener - 리스너 참조
   */
  removeListener(listener) {
    if (listener && listener.ref) {
      listener.ref.off(listener.event, listener.callback);
    }
  }
}

// 전역으로 모델 노출
window.CommentModel = CommentModel;
