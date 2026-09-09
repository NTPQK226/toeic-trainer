/**
 * TOEIC Writing - AI Assistant Widget & Prompt Generator
 * Supports Gemini, ChatGPT, and Claude.
 * Works seamlessly across Part 1, Part 2, and Part 3.
 */
(function (window) {
  'use strict';

  const PLATFORMS = {
    gemini: {
      name: 'Google Gemini',
      url: 'https://gemini.google.com/app',
      color: '#8b5cf6'
    },
    chatgpt: {
      name: 'OpenAI ChatGPT',
      url: 'https://chatgpt.com',
      color: '#10a37f'
    },
    claude: {
      name: 'Anthropic Claude',
      url: 'https://claude.ai/new',
      color: '#d97706'
    }
  };

  /**
   * Determine current active part, mode (Test vs Practice), and question context
   */
  function getQuestionContext() {
    const isP3 = window.location.pathname.includes('/part3') || (document.body && document.body.dataset && document.body.dataset.part === '3');
    const isP2 = window.location.pathname.includes('/part2') || (document.body && document.body.dataset && document.body.dataset.part === '2');
    
    // Check whether user is currently in Test Mode or Practice Mode
    const fullTestTab = document.getElementById('fullTestTab');
    const isTestMode = Boolean(fullTestTab && fullTestTab.classList.contains('active'));
    
    let partName = 'Part 1: Viết Câu Miêu Tả Tranh';
    let partId = 1;
    let questionInfo = '';
    let promptDetail = '';
    let studentAnswer = '';

    if (isP3) {
      partName = 'Part 3: Viết Bài Luận Ý Kiến (Opinion Essay - Q8)';
      partId = 3;

      if (isTestMode) {
        // Test Simulation Mode
        const badge = document.getElementById('testQuestionBadge');
        questionInfo = badge ? badge.textContent.trim() : 'Question 8 • Opinion Essay';
        
        const promptEl = document.getElementById('testPromptText');
        if (promptEl) promptDetail = promptEl.textContent.trim();
        
        const promptViEl = document.getElementById('testPromptViText');
        if (promptViEl && promptViEl.textContent.trim() && !promptViEl.textContent.includes('Chưa có bản dịch')) {
          promptDetail += '\n\nBản dịch tiếng Việt đề bài:\n' + promptViEl.textContent.trim();
        }

        const ta = document.getElementById('testTextarea');
        if (ta) studentAnswer = ta.value.trim();
      } else {
        // Practice Mode
        const badge = document.getElementById('practiceQuestionBadge');
        questionInfo = badge ? badge.textContent.trim() : 'Part 3 Essay';

        const promptEl = document.getElementById('practicePromptText');
        if (promptEl) promptDetail = promptEl.textContent.trim();

        const promptViEl = document.getElementById('practicePromptViText');
        if (promptViEl && promptViEl.textContent.trim() && !promptViEl.textContent.includes('Chưa có bản dịch')) {
          promptDetail += '\n\nBản dịch tiếng Việt đề bài:\n' + promptViEl.textContent.trim();
        }

        const ta = document.getElementById('practiceTextarea');
        if (ta) studentAnswer = ta.value.trim();
      }
    } else if (isP2) {
      partName = 'Part 2: Trả Lời Email Yêu Cầu (Question 6-7)';
      partId = 2;

      if (isTestMode) {
        // Test Simulation Mode
        const badge = document.getElementById('testQuestionBadge');
        questionInfo = badge ? badge.textContent.trim() : 'Part 2 Email';

        const emailFrom = document.getElementById('testEmailFrom');
        const emailTo = document.getElementById('testEmailTo');
        const emailSubj = document.getElementById('testEmailSubject');
        const emailBody = document.getElementById('testEmailBody');
        const dirText = document.getElementById('testDirectionsText');

        let details = [];
        if (emailFrom && emailTo && emailSubj) {
          details.push(`From: ${emailFrom.textContent.trim()} | To: ${emailTo.textContent.trim()} | Subject: ${emailSubj.textContent.trim()}`);
        }
        if (emailBody) details.push('Nội dung Email:\n' + emailBody.textContent.trim());
        if (dirText) details.push('Yêu cầu trả lời (Directions):\n' + dirText.textContent.trim());
        promptDetail = details.join('\n\n');

        const ta = document.getElementById('testTextarea');
        if (ta) studentAnswer = ta.value.trim();
      } else {
        // Practice Mode
        const badge = document.getElementById('practiceQuestionBadge');
        questionInfo = badge ? badge.textContent.trim() : 'Part 2 Email';

        const emailFrom = document.getElementById('practiceEmailFrom');
        const emailTo = document.getElementById('practiceEmailTo');
        const emailSubj = document.getElementById('practiceEmailSubject');
        const emailBody = document.getElementById('practiceEmailBody');
        const dirText = document.getElementById('practiceDirectionsText');

        let details = [];
        if (emailFrom && emailTo && emailSubj) {
          details.push(`From: ${emailFrom.textContent.trim()} | To: ${emailTo.textContent.trim()} | Subject: ${emailSubj.textContent.trim()}`);
        }
        if (emailBody) details.push('Nội dung Email:\n' + emailBody.textContent.trim());
        if (dirText) details.push('Yêu cầu trả lời (Directions):\n' + dirText.textContent.trim());
        promptDetail = details.join('\n\n');

        const ta = document.getElementById('practiceTextarea');
        if (ta) studentAnswer = ta.value.trim();
      }
    } else {
      partName = 'Part 1: Viết 1 Câu Miêu Tả Tranh (Question 1-5)';
      partId = 1;

      if (isTestMode) {
        // Test Simulation Mode
        const badge = document.getElementById('testQuestionBadge');
        questionInfo = badge ? badge.textContent.trim() : 'Part 1 Picture';

        const kwContainer = document.getElementById('testKeywordsDisplay');
        if (kwContainer) {
          const kws = Array.from(kwContainer.querySelectorAll('.keyword-badge strong')).map(s => s.textContent.trim());
          if (kws.length > 0) {
            promptDetail = '2 từ khoá bắt buộc: ' + kws.join(', ');
          }
        }

        const ta = document.getElementById('testTextarea');
        if (ta) studentAnswer = ta.value.trim();
      } else {
        // Practice Mode
        const badge = document.getElementById('practiceQuestionBadge');
        questionInfo = badge ? badge.textContent.trim() : 'Part 1 Picture';

        const kwContainer = document.getElementById('practiceKeywordsDisplay');
        if (kwContainer) {
          const kws = Array.from(kwContainer.querySelectorAll('.keyword-badge strong')).map(s => s.textContent.trim());
          if (kws.length > 0) {
            promptDetail = '2 từ khoá bắt buộc: ' + kws.join(', ');
          }
        }

        const ta = document.getElementById('practiceTextarea');
        if (ta) studentAnswer = ta.value.trim();
      }
    }

    return {
      partName,
      partId,
      isTestMode,
      questionInfo,
      promptDetail,
      studentAnswer
    };
  }

  /**
   * Build complete prompt string for specified template
   */
  function buildPrompt(templateType) {
    const ctx = getQuestionContext();
    
    let base = `Bạn là một chuyên gia khảo thí và giáo viên luyện thi TOEIC Writing chuẩn ETS / SEC.\n\n`;
    base += `=== THÔNG TIN BÀI THI TOEIC WRITING ===\n`;
    base += `Phần thi: ${ctx.partName} (${ctx.isTestMode ? 'Chế độ Thi Thử' : 'Chế độ Luyện Tập'})\n`;
    if (ctx.questionInfo) base += `Câu hỏi: ${ctx.questionInfo}\n`;
    if (ctx.promptDetail) base += `Đề bài / Yêu cầu:\n${ctx.promptDetail}\n`;
    if (ctx.studentAnswer) {
      base += `\nBài làm của tôi:\n"${ctx.studentAnswer}"\n`;
    } else {
      base += `\nBài làm của tôi: (Chưa nhập bài làm)\n`;
    }
    base += `=======================================\n\n`;

    if (templateType === 'grammar') {
      base += `YÊU CẦU CỦA TÔI:\n`;
      base += `1. Phân tích ngữ pháp và các cấu trúc câu tối ưu nhất cho đề bài này.\n`;
      base += `2. Cung cấp danh sách các từ vựng/collocations ăn điểm cao (C1/B2) liên quan trực tiếp đến đề bài.\n`;
      base += `3. Nêu các lỗi sai phổ biến mà thí sinh hay mắc phải và cách khắc phục.`;
    } else if (templateType === 'samples') {
      base += `YÊU CẦU CỦA TÔI:\n`;
      base += `1. Hãy viết 3 bài/câu mẫu đạt điểm tối đa ETS (Band cao nhất) với các phong cách diễn đạt khác nhau.\n`;
      base += `2. Giải thích chi tiết vì sao các câu/bài mẫu này đạt điểm tối đa (từ nối, ngữ pháp, độ mượt mà).\n`;
      base += `3. Dịch nghĩa tiếng Việt từng câu mẫu.`;
    } else if (templateType === 'review') {
      base += `YÊU CẦU CỦA TÔI:\n`;
      if (ctx.studentAnswer) {
        base += `1. Chấm điểm bài làm của tôi theo thang điểm chính thức của ETS / SEC.\n`;
        base += `2. Chỉ rõ các lỗi sai về ngữ pháp, dùng từ, mạo từ, thì, hoặc tính mạch lạc.\n`;
        base += `3. Viết lại bài làm của tôi thành một phiên bản chuẩn người bản xứ (Native Polish) điểm tuyệt đối.`;
      } else {
        base += `1. Hướng dẫn tôi từng bước viết câu trả lời chuẩn chỉnh đạt điểm tối đa cho đề bài trên.\n`;
        base += `2. Cho tôi dàn ý chi tiết và các từ nối quan trọng cần dùng.`;
      }
    } else {
      base += `YÊU CẦU CỦA TÔI:\n`;
      base += `Giải thích chi tiết và gợi ý cách làm tối ưu nhất cho đề bài trên.`;
    }

    return base;
  }

  /**
   * Synchronously and reliably copy text to clipboard across all browsers
   */
  function copyTextSynchronously(text) {
    let success = false;
    
    // Method 1: execCommand with a temporary textarea (executes synchronously within user click stack)
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      success = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {
      console.warn('execCommand copy error:', e);
    }

    // Method 2: Modern Async Clipboard API as an additional background ensure
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(err => {
        console.warn('navigator.clipboard writeText error:', err);
      });
    }

    return success;
  }

  /**
   * Launch AI Platform with Prompt copied safely
   */
  function launchPlatform(platformKey, customText) {
    const p = PLATFORMS[platformKey] || PLATFORMS.gemini;
    const prompt = (customText && customText.trim()) ? customText.trim() : buildPrompt('review');

    // 1. Copy text to clipboard immediately in the user gesture
    copyTextSynchronously(prompt);

    // 2. Display Toast feedback
    if (window.ToeicUi) {
      window.ToeicUi.toast(`Đã sao chép Prompt! Hãy nhấn Ctrl + V trên ${p.name} để nhận giải đáp ngay.`, 'success', 6000);
    }

    // 3. Open target AI page in new tab
    window.open(p.url, '_blank');
  }

  /**
   * Initialize UI Controller
   */
  function initAiAssistant() {
    const floatingAiBtn = document.getElementById('floatingAiBtn') || document.getElementById('floatingAiWidget') || document.getElementById('aiMainTriggerBtn');
    const aiAssistantModal = document.getElementById('aiAssistantModal');
    const aiPromptTextarea = document.getElementById('aiPromptTextarea');
    const aiQuestionSummary = document.getElementById('aiQuestionSummary');
    const aiCopyPromptBtn = document.getElementById('aiCopyPromptBtn');

    // Main button opens full prompt modal
    function openPromptModal() {
      if (!aiAssistantModal) return;
      
      const ctx = getQuestionContext();
      if (aiQuestionSummary) {
        aiQuestionSummary.textContent = `${ctx.partName} • ${ctx.questionInfo || 'Câu hỏi hiện tại'}`;
      }

      // Default prompt template: review (if answered) or grammar (if not answered)
      const defaultTemplate = ctx.studentAnswer ? 'review' : 'grammar';
      if (aiPromptTextarea) {
        aiPromptTextarea.value = buildPrompt(defaultTemplate);
      }

      // Reset template buttons active state
      document.querySelectorAll('.ai-template-btn').forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('data-template') === defaultTemplate) {
          b.classList.add('active');
        }
      });

      aiAssistantModal.classList.add('active');
    }

    function closePromptModal() {
      if (aiAssistantModal) aiAssistantModal.classList.remove('active');
    }

    if (floatingAiBtn) {
      floatingAiBtn.addEventListener('click', openPromptModal);
    }

    document.querySelectorAll('.close-btn[data-close="aiAssistantModal"]').forEach(btn => {
      btn.addEventListener('click', closePromptModal);
    });

    if (aiAssistantModal) {
      aiAssistantModal.addEventListener('click', (e) => {
        if (e.target === aiAssistantModal) closePromptModal();
      });
    }

    // Template switcher buttons inside modal
    document.querySelectorAll('.ai-template-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ai-template-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tType = btn.getAttribute('data-template');
        if (aiPromptTextarea) {
          aiPromptTextarea.value = buildPrompt(tType);
        }
      });
    });

    // Modal launch buttons
    document.querySelectorAll('[data-modal-ai-platform]').forEach(btn => {
      btn.addEventListener('click', () => {
        const platform = btn.getAttribute('data-modal-ai-platform');
        const customPrompt = aiPromptTextarea ? aiPromptTextarea.value.trim() : '';
        launchPlatform(platform, customPrompt);
        closePromptModal();
      });
    });

    // Copy Prompt Button inside modal
    if (aiCopyPromptBtn) {
      aiCopyPromptBtn.addEventListener('click', () => {
        const text = aiPromptTextarea ? aiPromptTextarea.value.trim() : buildPrompt('grammar');
        copyTextSynchronously(text);
        if (window.ToeicUi) {
          window.ToeicUi.toast('Đã sao chép nội dung Prompt vào bộ nhớ tạm! (Ctrl + V để dán)', 'success');
        } else {
          alert('Đã sao chép nội dung Prompt vào bộ nhớ tạm! (Ctrl + V để dán)');
        }
      });
    }
  }

  // Export to window
  window.ToeicAiAssistant = {
    init: initAiAssistant,
    open: function () {
      const modal = document.getElementById('aiAssistantModal');
      if (modal) modal.classList.add('active');
    },
    launch: launchPlatform,
    buildPrompt,
    copyText: copyTextSynchronously
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAiAssistant);
  } else {
    initAiAssistant();
  }

})(typeof window !== 'undefined' ? window : global);
