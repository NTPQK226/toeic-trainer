/**
 * TOEIC Writing - Unified Feedback & Support Handler
 * Supports Part 1, Part 2, and Part 3.
 * Handles Fast Feedback Form submission (Google Sheets / LocalStorage) and direct 1-1 contact.
 */
(function (window) {
  'use strict';

  const STORAGE_KEY_FEEDBACKS = 'toeic_user_feedbacks';
  const STORAGE_KEY_WEBHOOK = 'toeic_feedback_sheet_webhook';

  // Default Google Apps Script Webhook Endpoint (can be configured via localStorage)
  function getWebhookUrl() {
    return localStorage.getItem(STORAGE_KEY_WEBHOOK) || '';
  }

  function setWebhookUrl(url) {
    localStorage.setItem(STORAGE_KEY_WEBHOOK, (url || '').trim());
  }

  function getLocalFeedbacks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_FEEDBACKS) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveFeedbackLocally(feedbackItem) {
    const list = getLocalFeedbacks();
    list.unshift(feedbackItem);
    if (list.length > 50) list.length = 50;
    localStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(list));
  }

  /**
   * Determine current active question context (Part, question index, ID)
   */
  function getCurrentContext() {
    let partName = 'TOEIC Writing Part 1';
    let questionText = '';

    if (window.location.pathname.includes('/part3') || (document.body && document.body.dataset && document.body.dataset.part === '3')) {
      partName = 'TOEIC Writing Part 3';
    } else if (window.location.pathname.includes('/part2') || (document.body && document.body.dataset && document.body.dataset.part === '2')) {
      partName = 'TOEIC Writing Part 2';
    } else {
      partName = 'TOEIC Writing Part 1';
    }

    const badge = document.getElementById('practiceQuestionBadge') || document.getElementById('testQuestionBadge');
    if (badge && badge.textContent) {
      questionText = badge.textContent.trim();
    }

    return questionText ? `${partName} • ${questionText}` : partName;
  }

  /**
   * Initialize Feedback UI Elements & Event Listeners
   */
  function initFeedback() {
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackBtn = document.getElementById('feedbackBtn');
    const floatingFeedbackBtn = document.getElementById('floatingFeedbackBtn');
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackType = document.getElementById('feedbackType');
    const feedbackContext = document.getElementById('feedbackContext');
    const feedbackContent = document.getElementById('feedbackContent');
    const feedbackContact = document.getElementById('feedbackContact');
    const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
    const feedbackStatus = document.getElementById('feedbackStatus');

    function openFeedbackModal() {
      if (!feedbackModal) return;
      if (feedbackContext) {
        feedbackContext.value = getCurrentContext();
      }
      if (feedbackStatus) {
        feedbackStatus.style.display = 'none';
        feedbackStatus.innerHTML = '';
      }
      feedbackModal.classList.add('active');
      if (feedbackContent) {
        setTimeout(() => feedbackContent.focus(), 150);
      }
    }

    function closeFeedbackModal() {
      if (feedbackModal) {
        feedbackModal.classList.remove('active');
      }
    }

    if (feedbackBtn) feedbackBtn.addEventListener('click', openFeedbackModal);
    if (floatingFeedbackBtn) floatingFeedbackBtn.addEventListener('click', openFeedbackModal);

    // Close buttons
    document.querySelectorAll('.close-btn[data-close="feedbackModal"]').forEach(btn => {
      btn.addEventListener('click', closeFeedbackModal);
    });

    if (feedbackModal) {
      feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) closeFeedbackModal();
      });
    }

    // Submit handler
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = feedbackContent ? feedbackContent.value.trim() : '';
        if (!content) {
          if (window.ToeicUi) {
            window.ToeicUi.toast('Vui lòng nhập nội dung góp ý!', 'warning');
          } else {
            alert('Vui lòng nhập nội dung góp ý!');
          }
          if (feedbackContent) feedbackContent.focus();
          return;
        }

        const type = feedbackType ? feedbackType.value : 'other';
        const typeLabel = feedbackType && feedbackType.options[feedbackType.selectedIndex]
          ? feedbackType.options[feedbackType.selectedIndex].text
          : type;
        const context = feedbackContext ? feedbackContext.value.trim() : getCurrentContext();
        const contact = feedbackContact ? feedbackContact.value.trim() : '';
        const timestamp = new Date().toISOString();

        const feedbackData = {
          timestamp: new Date().toLocaleString('vi-VN'),
          isoTime: timestamp,
          type: typeLabel,
          context: context,
          content: content,
          contact: contact,
          url: window.location.href,
          userAgent: navigator.userAgent || ''
        };

        // Save backup to LocalStorage
        saveFeedbackLocally(feedbackData);

        const origBtnHtml = submitFeedbackBtn ? submitFeedbackBtn.innerHTML : '';
        if (submitFeedbackBtn) {
          submitFeedbackBtn.disabled = true;
          submitFeedbackBtn.innerHTML = '<span class="ai-loading-spinner"></span> Đang gửi...';
        }

        const webhookUrl = getWebhookUrl();
        if (webhookUrl) {
          try {
            await fetch(webhookUrl, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(feedbackData)
            });
          } catch (netErr) {
            console.warn('Webhook post failed, feedback saved locally:', netErr);
          }
        }

        if (submitFeedbackBtn) {
          submitFeedbackBtn.disabled = false;
          submitFeedbackBtn.innerHTML = origBtnHtml;
        }

        // Reset form inputs
        if (feedbackContent) feedbackContent.value = '';
        if (feedbackContact) feedbackContact.value = '';

        if (window.ToeicUi) {
          window.ToeicUi.toast('Cảm ơn bạn đã gửi góp ý! Ý kiến của bạn đã được ghi nhận thành công.', 'success', 5000);
        } else {
          alert('Cảm ơn bạn đã gửi góp ý! Ý kiến của bạn đã được ghi nhận thành công.');
        }

        closeFeedbackModal();
      });
    }
  }

  // Export to window
  window.ToeicFeedback = {
    init: initFeedback,
    open: function () {
      const modal = document.getElementById('feedbackModal');
      const ctx = document.getElementById('feedbackContext');
      if (ctx) ctx.value = getCurrentContext();
      if (modal) modal.classList.add('active');
    },
    close: function () {
      const modal = document.getElementById('feedbackModal');
      if (modal) modal.classList.remove('active');
    },
    getWebhookUrl,
    setWebhookUrl,
    getLocalFeedbacks
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeedback);
  } else {
    initFeedback();
  }

})(typeof window !== 'undefined' ? window : global);
