/**
 * ui.js - UI 관련 함수 모듈
 */

/**
 * 언어 버튼 상태 업데이트
 */
function updateLanguageButtons() {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    if (btn.getAttribute('data-lang') === window.gameTranslations.currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * 언어 버튼 이벤트 설정
 */
function setupLanguageEvents() {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      window.gameTranslations.changeLanguage(lang);
      updateLanguageButtons();
      window.gameTranslations.updateAllText();
    });
  });
}

/**
 * 접이식 메뉴 기능 설정
 */
function setupCollapsibleMenu() {
  const collapsible = document.getElementById('how-to-play-btn');
  
  if (collapsible) {
    // 페이지 로드 시 기본적으로 접혀 있는 상태로 시작
    const content = document.getElementById('instructions');
    if (content) {
      content.style.maxHeight = '0px';
    }
    
    // 클릭 이벤트 추가
    collapsible.addEventListener('click', function() {
      this.classList.toggle('active');
      
      // 토글 아이콘 변경
      const toggleIcon = this.querySelector('.toggle-icon');
      if (toggleIcon) {
        if (this.classList.contains('active')) {
          toggleIcon.textContent = '-';
        } else {
          toggleIcon.textContent = '+';
        }
      }
      
      // 내용 표시/숨김 처리
      const content = document.getElementById('instructions');
      if (content) {
        if (this.classList.contains('active')) {
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.padding = '15px';
        } else {
          content.style.maxHeight = '0px';
          content.style.padding = '0px';
        }
      }
    });
  }
}

/**
 * UI 모듈 초기화
 */
function initUI() {
  // Set up collapsible menu and language events
  setupCollapsibleMenu();
  setupLanguageEvents();
  
  // Update the language buttons to reflect the current language
  updateLanguageButtons();
  
  // Also update the active state when the page is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLanguageButtons);
  } else {
    // In case the DOM is already loaded
    updateLanguageButtons();
  }
}

// 모듈 내보내기
window.gameUI = {
  updateLanguageButtons,
  setupLanguageEvents,
  setupCollapsibleMenu,
  initUI
};
