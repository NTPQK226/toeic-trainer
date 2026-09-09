/**
 * TOEIC Writing Part 2 - Application Controller
 * Handles Full Test Simulation (2 questions: Q6 & Q7, ETS mỗi câu 10 phút riêng biệt)
 * and Instant Practice Mode.
 */

(function () {
  'use strict';

  // --- Icon SVGs (Lucide Style) ---
  const ICONS = {
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    check: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--success); vertical-align: -2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    cross: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--danger); vertical-align: -2px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    alert: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--warning); vertical-align: -2px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    info: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-light); vertical-align: -2px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    sparkle: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`
  };

  // --- Constants ---
  const CATEGORY_MAP = {
    'inquiry': 'Hỏi thông tin',
    'complaint': 'Khiếu nại',
    'invitation': 'Lời mời',
    'booking': 'Đặt chỗ',
    'job': 'Ứng tuyển',
    'service': 'Hỗ trợ KH',
    'welcome': 'Chào đón',
    'feedback': 'Phản hồi',
    'event': 'Sự kiện'
  };

  const TASK_LABELS = {
    'ask_question': 'câu hỏi',
    'make_suggestion': 'gợi ý',
    'explain_problem': 'vấn đề',
    'provide_information': 'thông tin',
    'make_request': 'yêu cầu',
    'describe_qualification': 'năng lực',
    'give_opinion': 'ý kiến',
    'suggest_topic': 'chủ đề'
  };

  // --- State Variables ---
  let questions = [];
  let currentMode = 'full'; // 'full' | 'practice'

  // Full Test Mode State
  let testCurrentIndex = 0; // 0 to 14 (Tests 1 to 15)
  let testQuestions = []; // 2 questions for current test
  let testActiveQIndex = 0; // 0 to 1 within current test
  let testAnswers = {}; // { [qId]: string }
  // ETS-authentic: Q6 and Q7 EACH get their own independent 10:00 countdown.
  // Only the ACTIVE question's clock ticks; switching pauses one and resumes the other.
  // When the active Q6 clock hits 0 → Q6 is locked (answers frozen) and app forces to Q7.
  // When the active Q7 clock hits 0 → auto-submit. Free toggling stays (relaxed for practice).
  const TEST_Q_SECONDS = 10 * 60; // 600 seconds (10 minutes) per question
  let testTimers = [TEST_Q_SECONDS, TEST_Q_SECONDS]; // remaining per qIndex (0=Q6, 1=Q7)
  let testLocks = [false, false]; // true once that question's own clock has expired
  let testTimerInterval = null;
  let testIsRunning = false;
  let testIsSubmitted = false;

  // Practice Mode State
  let practiceActiveIndex = 0; // index in questions array
  let practiceAnswers = {}; // { [qId]: string }
  let practiceEvaluations = {}; // { [qId]: evaluationResult }
  let filteredIndices = [];

  // --- DOM Elements Cache ---
  const el = {
    // Mode Switcher
    modeFullBtn: document.getElementById('modeFullBtn'),
    modePracticeBtn: document.getElementById('modePracticeBtn'),
    fullTestTab: document.getElementById('fullTestTab'),
    practiceTab: document.getElementById('practiceTab'),

    // Header
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    rubricBtn: document.getElementById('rubricBtn'),
    tipsBtn: document.getElementById('tipsBtn'),
    aiConfigBtn: document.getElementById('aiConfigBtn'),

    // Modals
    rubricModal: document.getElementById('rubricModal'),
    tipsModal: document.getElementById('tipsModal'),
    submitModal: document.getElementById('submitModal'),
    aiConfigModal: document.getElementById('aiConfigModal'),
    cancelSubmitBtn: document.getElementById('cancelSubmitBtn'),
    confirmSubmitBtn: document.getElementById('confirmSubmitBtn'),
    submitWarningText: document.getElementById('submitWarningText'),
    submitAiNotice: document.getElementById('submitAiNotice'),
    
    // AI Config
    aiApiKeyInput: document.getElementById('aiApiKeyInput'),
    aiModelSelect: document.getElementById('aiModelSelect'),
    saveAiConfigBtn: document.getElementById('saveAiConfigBtn'),
    testAiConfigBtn: document.getElementById('testAiConfigBtn'),
    clearAiConfigBtn: document.getElementById('clearAiConfigBtn'),
    aiTestStatus: document.getElementById('aiTestStatus'),

    // Full Test Tab
    testSelect: document.getElementById('testSelect'),
    startTestBtn: document.getElementById('startTestBtn'),
    timerWidget: document.getElementById('timerWidget'),
    timerText: document.getElementById('timerText'),
    testTimerCaption: document.getElementById('testTimerCaption'),
    aiToggleSwitchFull: document.getElementById('aiToggleSwitchFull'),
    aiStatusTextFull: document.getElementById('aiStatusTextFull'),
    testActiveWorkspace: document.getElementById('testActiveWorkspace'),
    testReportView: document.getElementById('testReportView'),
    testQuestionBadge: document.getElementById('testQuestionBadge'),
    testCategoryBadge: document.getElementById('testCategoryBadge'),
    testSecBadge: document.getElementById('testSecBadge'),
    
    // Email Display (Test)
    testEmailFrom: document.getElementById('testEmailFrom'),
    testEmailTo: document.getElementById('testEmailTo'),
    testEmailSubject: document.getElementById('testEmailSubject'),
    testEmailDate: document.getElementById('testEmailDate'),
    testEmailBody: document.getElementById('testEmailBody'),
    testDirectionsText: document.getElementById('testDirectionsText'),
    testTaskBadges: document.getElementById('testTaskBadges'),
    
    testTextarea: document.getElementById('testTextarea'),
    testWordCount: document.getElementById('testWordCount'),
    testCharCount: document.getElementById('testCharCount'),
    testSentenceCount: document.getElementById('testSentenceCount'),
    testPrevBtn: document.getElementById('testPrevBtn'),
    testNextBtn: document.getElementById('testNextBtn'),
    testSubmitBtn: document.getElementById('testSubmitBtn'),
    testPalette: document.getElementById('testPalette'),
    
    // Report
    reportScoreNumber: document.getElementById('reportScoreNumber'),
    reportBadge: document.getElementById('reportBadge'),
    reportSummaryText: document.getElementById('reportSummaryText'),
    reportQuestionsList: document.getElementById('reportQuestionsList'),
    reportRetakeBtn: document.getElementById('reportRetakeBtn'),
    reportNextTestBtn: document.getElementById('reportNextTestBtn'),

    // Practice Tab
    practiceCategoryFilter: document.getElementById('practiceCategoryFilter'),
    practiceQuestionSelect: document.getElementById('practiceQuestionSelect'),
    practiceRandomBtn: document.getElementById('practiceRandomBtn'),
    aiToggleSwitch: document.getElementById('aiToggleSwitch'),
    aiStatusText: document.getElementById('aiStatusText'),
    practiceQuestionBadge: document.getElementById('practiceQuestionBadge'),
    practiceCategoryBadge: document.getElementById('practiceCategoryBadge'),
    practiceSecBadge: document.getElementById('practiceSecBadge'),
    
    // Email Display (Practice)
    practiceEmailFrom: document.getElementById('practiceEmailFrom'),
    practiceEmailTo: document.getElementById('practiceEmailTo'),
    practiceEmailSubject: document.getElementById('practiceEmailSubject'),
    practiceEmailDate: document.getElementById('practiceEmailDate'),
    practiceEmailBody: document.getElementById('practiceEmailBody'),
    practiceDirectionsText: document.getElementById('practiceDirectionsText'),
    practiceTaskBadges: document.getElementById('practiceTaskBadges'),
    
    practiceTextarea: document.getElementById('practiceTextarea'),
    practiceWordCount: document.getElementById('practiceWordCount'),
    practiceCharCount: document.getElementById('practiceCharCount'),
    practiceSentenceCount: document.getElementById('practiceSentenceCount'),
    practicePrevBtn: document.getElementById('practicePrevBtn'),
    checkAnswerBtn: document.getElementById('checkAnswerBtn'),
    showAnswerBtn: document.getElementById('showAnswerBtn'),
    clearPracticeBtn: document.getElementById('clearPracticeBtn'),
    practiceNextBtn: document.getElementById('practiceNextBtn'),

    // Email Avatar Elements
    testSenderAvatar: document.getElementById('testSenderAvatar'),
    practiceSenderAvatar: document.getElementById('practiceSenderAvatar'),

    // Feedback
    instantFeedbackBox: document.getElementById('instantFeedbackBox'),
    feedbackScoreBadge: document.getElementById('feedbackScoreBadge'),
    feedbackLabel: document.getElementById('feedbackLabel'),
    feedbackTaskCompletion: document.getElementById('feedbackTaskCompletion'),
    feedbackCriteria: document.getElementById('feedbackCriteria'),
    feedbackMessages: document.getElementById('feedbackMessages'),
    feedbackImprovedBox: document.getElementById('feedbackImprovedBox'),
    feedbackImprovedText: document.getElementById('feedbackImprovedText'),
    feedbackSampleBox: document.getElementById('feedbackSampleBox'),
    feedbackSampleText: document.getElementById('feedbackSampleText'),
    toggleSampleBtn: document.getElementById('toggleSampleBtn')
  };

  // --- Helper Functions ---
  function countWords(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  }

  function countSentences(str) {
    if (!str || !str.trim()) return 0;
    const matches = str.match(/[^.!?]+[.!?]+(\s|$)/g);
    if (!matches) {
      return str.trim().length > 0 ? 1 : 0;
    }
    return matches.length;
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function renderTasks(container, tasks) {
    if (!container) return;
    container.innerHTML = '';
    tasks.forEach(task => {
      const badge = document.createElement('span');
      badge.className = 'task-badge';
      const countLabel = task.count > 1 ? `${task.count} ` : '';
      badge.textContent = `${countLabel}${TASK_LABELS[task.type] || task.type}`;
      container.appendChild(badge);
    });
  }

  function getInitials(name) {
    if (!name) return 'TO';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // --- Theme Management ---
  function updateThemeUI(theme) {
    if (el.themeToggleBtn) {
      el.themeToggleBtn.innerHTML = (theme === 'dark') ? ICONS.sun : ICONS.moon;
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('toeic_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = (current === 'light') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('toeic_theme', next);
    updateThemeUI(next);
  }

  // --- Modals Management ---
  function openModal(modalEl) {
    if (modalEl) modalEl.classList.add('active');
  }

  function closeModal(modalEl) {
    if (modalEl) modalEl.classList.remove('active');
  }

  function initModals() {
    if(el.rubricBtn) el.rubricBtn.addEventListener('click', () => openModal(el.rubricModal));
    if(el.tipsBtn) el.tipsBtn.addEventListener('click', () => openModal(el.tipsModal));

    const openAiConfig = () => {
      if (window.ToeicP2LlmEvaluator) {
        if (el.aiApiKeyInput) el.aiApiKeyInput.value = window.ToeicP2LlmEvaluator.getUserKey();
        if (el.aiModelSelect) el.aiModelSelect.value = window.ToeicP2LlmEvaluator.getModel() || 'gemini-flash-lite-latest';
      }
      if (el.aiTestStatus) el.aiTestStatus.style.display = 'none';
      openModal(el.aiConfigModal);
    };

    if (el.aiConfigBtn) el.aiConfigBtn.addEventListener('click', openAiConfig);

    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.target.getAttribute('data-close');
        if (modalId && el[modalId]) closeModal(el[modalId]);
        else if (e.target.closest('.modal-overlay')) {
          closeModal(e.target.closest('.modal-overlay'));
        }
      });
    });

    [el.rubricModal, el.tipsModal, el.submitModal, el.aiConfigModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeModal(modal);
        });
      }
    });

    if(el.cancelSubmitBtn) el.cancelSubmitBtn.addEventListener('click', () => closeModal(el.submitModal));
  }

  // --- AI Config Management ---
  function initAiConfig() {
    if (!window.ToeicP2LlmEvaluator) return;

    if (el.aiApiKeyInput) el.aiApiKeyInput.value = window.ToeicP2LlmEvaluator.getUserKey();
    if (el.aiModelSelect) el.aiModelSelect.value = window.ToeicP2LlmEvaluator.getModel();
    const isEnabled = window.ToeicP2LlmEvaluator.isEnabled();
    updateAiToggleUI(isEnabled);

    if (el.aiToggleSwitch) {
      el.aiToggleSwitch.addEventListener('click', () => {
        const nextState = !window.ToeicP2LlmEvaluator.isEnabled();
        window.ToeicP2LlmEvaluator.setEnabled(nextState);
        updateAiToggleUI(nextState);
      });
    }

    if (el.aiToggleSwitchFull) {
      el.aiToggleSwitchFull.addEventListener('click', () => {
        const nextState = !window.ToeicP2LlmEvaluator.isEnabled();
        window.ToeicP2LlmEvaluator.setEnabled(nextState);
        updateAiToggleUI(nextState);
      });
    }

    if (el.saveAiConfigBtn) {
      el.saveAiConfigBtn.addEventListener('click', () => {
        const key = el.aiApiKeyInput.value.trim();
        const model = el.aiModelSelect.value;
        if (key) {
          window.ToeicP2LlmEvaluator.setApiKey(key);
        }
        window.ToeicP2LlmEvaluator.setModel(model);
        window.ToeicP2LlmEvaluator.setEnabled(true);
        updateAiToggleUI(true);
        showAiStatus('Đã lưu cấu hình và kích hoạt Giám Khảo AI thành công!', 'success');
        setTimeout(() => closeModal(el.aiConfigModal), 1000);
      });
    }

    if (el.clearAiConfigBtn) {
      el.clearAiConfigBtn.addEventListener('click', () => {
        window.ToeicP2LlmEvaluator.clearApiKey();
        if (el.aiApiKeyInput) el.aiApiKeyInput.value = '';
        updateAiToggleUI(window.ToeicP2LlmEvaluator.isEnabled());
        showAiStatus('Đã xoá Key cá nhân. Hệ thống tự động chuyển sang Key dùng thử miễn phí chung.', 'info');
      });
    }

    if (el.testAiConfigBtn) {
      el.testAiConfigBtn.addEventListener('click', async () => {
        const key = el.aiApiKeyInput.value.trim();
        const model = el.aiModelSelect.value;

        el.testAiConfigBtn.disabled = true;
        el.testAiConfigBtn.textContent = 'Đang kiểm tra...';
        showAiStatus('Đang gửi truy vấn thử nghiệm tới Google Gemini...', 'info');

        try {
          await window.ToeicP2LlmEvaluator.testConnection(key, model);
          showAiStatus(`Kết nối thành công 100%! API Key hợp lệ và sẵn sàng chấm thi.`, 'success');
        } catch (err) {
          showAiStatus(`Lỗi kết nối: ${err.message}`, 'error');
        } finally {
          el.testAiConfigBtn.disabled = false;
          el.testAiConfigBtn.textContent = 'Kiểm Tra Kết Nối';
        }
      });
    }
  }

  function updateAiToggleUI(enabled) {
    if (el.aiToggleSwitch) {
      el.aiToggleSwitch.classList.toggle('active', enabled);
      if (el.aiStatusText) {
        el.aiStatusText.textContent = enabled ? 'ON' : 'OFF';
      }
    }
    if (el.aiToggleSwitchFull) {
      el.aiToggleSwitchFull.classList.toggle('active', enabled);
      if (el.aiStatusTextFull) {
        el.aiStatusTextFull.textContent = enabled ? 'ON' : 'OFF';
      }
    }
  }

  function showAiStatus(msg, type) {
    if (!el.aiTestStatus) return;
    el.aiTestStatus.style.display = 'block';
    
    const colors = {
      success: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
      error: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
      warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
      info: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8' }
    };
    
    const c = colors[type] || colors.info;
    el.aiTestStatus.style.backgroundColor = c.bg;
    el.aiTestStatus.style.color = c.text;
    el.aiTestStatus.style.padding = '0.75rem 1rem';
    el.aiTestStatus.style.borderRadius = '8px';
    el.aiTestStatus.style.fontWeight = '600';
    el.aiTestStatus.style.fontSize = '0.86rem';
    el.aiTestStatus.style.lineHeight = '1.4';
    el.aiTestStatus.textContent = msg;
  }

  // --- Mode Switching ---
  function switchMode(mode) {
    currentMode = mode;
    if (mode === 'full') {
      if(el.modeFullBtn) el.modeFullBtn.classList.add('active');
      if(el.modePracticeBtn) el.modePracticeBtn.classList.remove('active');
      if(el.fullTestTab) el.fullTestTab.classList.add('active');
      if(el.practiceTab) el.practiceTab.classList.remove('active');

      // Sync from Practice to Test: Keep the active question
      if (typeof practiceActiveIndex === 'number' && practiceActiveIndex >= 0 && practiceActiveIndex < questions.length) {
        const targetTestIdx = Math.floor(practiceActiveIndex / 2);
        const targetQIdx = practiceActiveIndex % 2;
        if (el.testSelect) el.testSelect.value = targetTestIdx;
        if (!testIsRunning || testCurrentIndex !== targetTestIdx) {
          startTest(targetTestIdx);
          testActiveQIndex = targetQIdx;
          renderTestPalette();
          renderTestQuestion();
        } else {
          testActiveQIndex = targetQIdx;
          renderTestPalette();
          renderTestQuestion();
        }
      }
    } else {
      if(el.modeFullBtn) el.modeFullBtn.classList.remove('active');
      if(el.modePracticeBtn) el.modePracticeBtn.classList.add('active');
      if(el.fullTestTab) el.fullTestTab.classList.remove('active');
      if(el.practiceTab) el.practiceTab.classList.add('active');

      // Sync from Test to Practice: Keep the active question
      if (typeof testCurrentIndex === 'number') {
        const calculatedIdx = testCurrentIndex * 2 + (testActiveQIndex || 0);
        if (calculatedIdx >= 0 && calculatedIdx < questions.length) {
          practiceActiveIndex = calculatedIdx;
        }
      }

      // Ensure question is visible in practice filter
      if (el.practiceCategoryFilter && el.practiceCategoryFilter.value !== 'all') {
        const curQ = questions[practiceActiveIndex];
        if (curQ && curQ.category !== el.practiceCategoryFilter.value) {
          el.practiceCategoryFilter.value = 'all';
          filteredIndices = questions.map((_, i) => i);
          populateQuestionSelect();
        }
      }
      if (el.practiceQuestionSelect) el.practiceQuestionSelect.value = practiceActiveIndex;
      renderPracticeView();
    }
  }

  // =========================================================================
  // FULL TEST SIMULATION LOGIC
  // =========================================================================

  function populateTestSelect() {
    if(!el.testSelect) return;
    el.testSelect.innerHTML = '';

    const secCount = questions.filter(q => q.set === 'sec').length;
    const coreCount = questions.filter(q => q.set === 'core').length;
    const secTests = Math.ceil(secCount / 2);
    const coreTests = Math.ceil(coreCount / 2);

    const secGroup = document.createElement('optgroup');
    secGroup.label = `Bộ Đề SEC (Question 6 & 7 - ${secTests} Đề Thi Mới)`;

    const coreGroup = document.createElement('optgroup');
    coreGroup.label = `Bộ ${coreCount} Đề Luyện Tập Chuẩn Hóa ETS (${coreTests} Đề Thi)`;

    const totalTests = Math.ceil(questions.length / 2);
    for (let i = 0; i < totalTests; i++) {
      const q1 = questions[i * 2];
      const q2 = questions[i * 2 + 1];
      const topic1 = q1 ? (CATEGORY_MAP[q1.category] || q1.category) : '';
      const topic2 = q2 ? (CATEGORY_MAP[q2.category] || q2.category) : '';
      const topicStr = (topic1 && topic2) ? ` • [${topic1} + ${topic2}]` : '';

      const opt = document.createElement('option');
      opt.value = i;
      
      if (i < secTests) {
        opt.textContent = `[SEC] Đề thi số ${String(i + 1).padStart(2, '0')} (Q6 & Q7)${topicStr}`;
        secGroup.appendChild(opt);
      } else {
        opt.textContent = `Đề thi số ${String(i + 1).padStart(2, '0')} (Q6 & Q7)${topicStr}`;
        coreGroup.appendChild(opt);
      }
    }

    if (secCount > 0) el.testSelect.appendChild(secGroup);
    if (coreCount > 0) el.testSelect.appendChild(coreGroup);
  }

  function startTest(testIdx) {
    testCurrentIndex = parseInt(testIdx, 10) || 0;
    const start = testCurrentIndex * 2;
    testQuestions = questions.slice(start, start + 2);
    testActiveQIndex = 0;
    testAnswers = {};
    testIsSubmitted = false;

    // Reset timers: each question gets its own 10 minutes (ETS)
    clearInterval(testTimerInterval);
    testTimers = [TEST_Q_SECONDS, TEST_Q_SECONDS];
    testLocks = [false, false];
    testIsRunning = true;
    updateTimerDisplay();

    testTimerInterval = setInterval(() => {
      if (!testIsRunning) return;
      // Only the ACTIVE question's clock ticks down
      testTimers[testActiveQIndex]--;
      updateTimerDisplay();
      if (testTimers[testActiveQIndex] <= 0) {
        testTimers[testActiveQIndex] = 0;
        handleTestQuestionTimeout();
      }
    }, 1000);

    if(el.testActiveWorkspace) el.testActiveWorkspace.style.display = 'block';
    if(el.testReportView) {
      el.testReportView.classList.remove('active');
      el.testReportView.style.display = 'none';
    }

    renderTestPalette();
    renderTestQuestion();
  }

  // Called when the ACTIVE question's own 10:00 runs out.
  function handleTestQuestionTimeout() {
    const idx = testActiveQIndex;
    testLocks[idx] = true;
    testAnswers[testQuestions[idx].id] = el.testTextarea ? el.testTextarea.value : (testAnswers[testQuestions[idx].id] || '');
    if (idx === 0) {
      // Q6 finished → lock Q6, move to Q7 (Q7 keeps its own remaining clock)
      if (testLocks[1]) {
        // Q7 had already run out earlier — whole test done
        clearInterval(testTimerInterval);
        testTimerInterval = null;
        if (window.ToeicUi) {
          window.ToeicUi.toast('Cả 2 câu đã hết giờ! Hệ thống tự động thu bài và chấm điểm.', 'warning');
        } else {
          alert('Cả 2 câu đã hết giờ! Hệ thống tự động thu bài và chấm điểm.');
        }
        finalizeSubmitTest();
        return;
      }
      if (window.ToeicUi) {
        window.ToeicUi.toast('Hết 10 phút câu 6! Câu 6 đã bị khóa. Chuyển sang câu 7.', 'warning');
      } else {
        alert('Hết 10 phút câu 6! Câu 6 đã bị khóa. Chuyển sang câu 7.');
      }
      testActiveQIndex = 1;
      renderTestPalette();
      renderTestQuestion();
    } else {
      // Q7 finished → auto submit the whole test
      clearInterval(testTimerInterval);
      testTimerInterval = null;
      if (window.ToeicUi) {
        window.ToeicUi.toast('Hết 10 phút câu 7! Hệ thống tự động thu bài và chấm điểm.', 'warning');
      } else {
        alert('Hết 10 phút câu 7! Hệ thống tự động thu bài và chấm điểm.');
      }
      finalizeSubmitTest();
    }
  }

  function updateTimerDisplay() {
    if(!el.timerText) return;
    const active = testTimers[testActiveQIndex] >= 0 ? testTimers[testActiveQIndex] : 0;
    el.timerText.textContent = formatTime(active);
    if(el.timerWidget) el.timerWidget.classList.remove('warning', 'danger');

    if (active <= 60) {
      if(el.timerWidget) el.timerWidget.classList.add('danger');
    } else if (active <= 120) {
      if(el.timerWidget) el.timerWidget.classList.add('warning');
    }

    // Per-question chips: Q6 & Q7 each show own remaining time (ETS 10'+10')
    if (el.testTimerCaption) {
      if (testQuestions && testQuestions.length >= 2 && testIsRunning) {
        el.testTimerCaption.style.display = 'inline-flex';
        el.testTimerCaption.innerHTML = '';
        testQuestions.forEach((q, idx) => {
          const chip = document.createElement('span');
          chip.className = 'tt-q' + (idx === testActiveQIndex ? ' active' : '') + (testLocks[idx] ? ' locked' : '');
          chip.textContent = (idx === 0 ? 'Q6' : 'Q7') + ' ' + formatTime(testTimers[idx] || 0) + (testLocks[idx] ? ' 🔒' : '');
          el.testTimerCaption.appendChild(chip);
        });
      } else {
        el.testTimerCaption.style.display = 'none';
      }
    }
  }

  function renderTestPalette() {
    if(!el.testPalette) return;
    el.testPalette.innerHTML = '';
    testQuestions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = 'palette-btn';
      const qNum = idx === 0 ? 'Q6' : 'Q7';
      btn.textContent = qNum;
      btn.title = `Question ${idx + 6} • còn ${formatTime(testTimers[idx] || 0)}`;

      const isLocked = !!testLocks[idx];
      const ans = testAnswers[q.id];
      if (ans && ans.trim().length > 0) {
        btn.classList.add('answered');
      }
      if (isLocked) {
        btn.classList.add('locked');
        btn.disabled = true;
      }
      if (idx === testActiveQIndex) {
        btn.classList.add('current');
      }

      btn.addEventListener('click', () => {
        if (testLocks[idx]) {
          if (window.ToeicUi) window.ToeicUi.toast('Câu này đã hết giờ và bị khóa.', 'warning');
          return;
        }
        if (idx === testActiveQIndex) return;
        saveCurrentTestAnswer();
        testActiveQIndex = idx;
        renderTestPalette();
        renderTestQuestion();
      });

      el.testPalette.appendChild(btn);
    });
  }

  function renderTestQuestion() {
    const q = testQuestions[testActiveQIndex];
    if (!q) return;

    const qNum = testActiveQIndex === 0 ? 'Question 6' : 'Question 7';
    if(el.testQuestionBadge) {
      el.testQuestionBadge.textContent = `${qNum} • ID #${q.id}`;
    }
    if(el.testCategoryBadge) {
      el.testCategoryBadge.textContent = CATEGORY_MAP[q.category] || q.category_vi || q.category;
    }

    // Toggle SEC badge
    if (el.testSecBadge) {
      if (q.set === 'sec') {
        el.testSecBadge.style.display = 'inline-flex';
        el.testSecBadge.textContent = `SEC ${String(q.sec_id || '').padStart(2, '0')}`;
      } else {
        el.testSecBadge.style.display = 'none';
      }
    }

    if(el.testSenderAvatar) el.testSenderAvatar.textContent = getInitials(q.email.from);
    if(el.testEmailFrom) el.testEmailFrom.textContent = q.email.from;
    if(el.testEmailTo) el.testEmailTo.textContent = q.email.to;
    if(el.testEmailSubject) el.testEmailSubject.textContent = q.email.subject;
    if(el.testEmailDate) el.testEmailDate.textContent = q.email.date;
    if(el.testEmailBody) {
      el.testEmailBody.innerHTML = q.email.body.replace(/\n/g, '<br>');
    }
    
    if(el.testDirectionsText) el.testDirectionsText.textContent = q.directions;
    renderTasks(el.testTaskBadges, q.tasks || []);

    // Textarea value
    if(el.testTextarea) {
      el.testTextarea.value = testAnswers[q.id] || '';
    }
    updateTestWritingStats();

    // Prev / Next button states (respect per-question locks)
    if(el.testPrevBtn) {
      const target = testActiveQIndex - 1;
      el.testPrevBtn.disabled = !(target >= 0 && !testLocks[target]);
    }
    if(el.testNextBtn) {
      const target = testActiveQIndex + 1;
      el.testNextBtn.disabled = !(target < testQuestions.length && !testLocks[target]);
    }
  }

  // Navigate to a question index, refusing to enter a locked question.
  function navigateTestTo(targetIdx) {
    if (targetIdx < 0 || targetIdx >= testQuestions.length) return;
    if (testLocks[targetIdx]) {
      if (window.ToeicUi) window.ToeicUi.toast('Câu này đã hết giờ và bị khóa.', 'warning');
      return;
    }
    saveCurrentTestAnswer();
    testActiveQIndex = targetIdx;
    renderTestPalette();
    renderTestQuestion();
  }

  function saveCurrentTestAnswer() {
    const q = testQuestions[testActiveQIndex];
    if (q && el.testTextarea) {
      testAnswers[q.id] = el.testTextarea.value;
    }
  }

  function updateTestWritingStats() {
    if(!el.testTextarea) return;
    const text = el.testTextarea.value;
    const words = countWords(text);
    const chars = text.length;
    const sents = countSentences(text);

    if(el.testWordCount) el.testWordCount.textContent = words;
    if(el.testCharCount) el.testCharCount.textContent = chars;
    if(el.testSentenceCount) el.testSentenceCount.textContent = sents;

    // Update answer state
    const q = testQuestions[testActiveQIndex];
    if (q) {
      testAnswers[q.id] = text;
      const paletteBtns = el.testPalette ? el.testPalette.querySelectorAll('.palette-btn') : [];
      if (paletteBtns[testActiveQIndex]) {
        if (text.trim().length > 0) {
          paletteBtns[testActiveQIndex].classList.add('answered');
        } else {
          paletteBtns[testActiveQIndex].classList.remove('answered');
        }
      }
    }
  }

  function promptSubmitTest() {
    saveCurrentTestAnswer();
    const answeredCount = testQuestions.filter(q => (testAnswers[q.id] || '').trim().length > 0).length;
    
    if(el.submitWarningText) {
      if (answeredCount < testQuestions.length) {
        el.submitWarningText.innerHTML = `Bạn mới chỉ hoàn thành <strong>${answeredCount}/${testQuestions.length} câu</strong>.<br>Bạn có chắc chắn muốn nộp bài ngay bây giờ?`;
      } else {
        el.submitWarningText.innerHTML = `Bạn đã hoàn thành đầy đủ <strong>${testQuestions.length}/${testQuestions.length} câu</strong>.<br>Hệ thống sẽ tiến hành chấm điểm chuẩn ETS.`;
      }
    }

    const isAi = window.ToeicP2LlmEvaluator && window.ToeicP2LlmEvaluator.isEnabled();
    if (el.submitAiNotice) {
      if (isAi) {
        el.submitAiNotice.style.background = 'rgba(139, 92, 246, 0.15)';
        el.submitAiNotice.style.color = '#a855f7';
        el.submitAiNotice.innerHTML = `Giám khảo AI Gemini đang <strong>BẬT</strong>. Bài viết sẽ được chấm chi tiết theo tiêu chí ETS.`;
      } else {
        el.submitAiNotice.style.background = 'rgba(245, 158, 11, 0.15)';
        el.submitAiNotice.style.color = '#f59e0b';
        el.submitAiNotice.innerHTML = `Giám khảo AI đang <strong>TẮT</strong>. Hệ thống sẽ chấm tự động bằng bộ quy tắc chuẩn ETS.`;
      }
    }

    openModal(el.submitModal);
  }

  if (el.confirmSubmitBtn) {
    el.confirmSubmitBtn.addEventListener('click', () => {
      closeModal(el.submitModal);
      finalizeSubmitTest();
    });
  }

  async function finalizeSubmitTest() {
    clearInterval(testTimerInterval);
    testIsRunning = false;
    testIsSubmitted = true;
    saveCurrentTestAnswer();

    if (el.confirmSubmitBtn) {
      el.confirmSubmitBtn.disabled = true;
      el.confirmSubmitBtn.textContent = 'Đang Chấm Điểm...';
    }

    const isAi = window.ToeicP2LlmEvaluator && window.ToeicP2LlmEvaluator.isEnabled();

    if(el.testActiveWorkspace) el.testActiveWorkspace.style.display = 'none';
    if(el.testReportView) {
      el.testReportView.style.display = 'block';
      el.testReportView.classList.add('active');
    }

    const evaluatedQuestions = [];
    let totalScore = 0;

    try {
      for (let i = 0; i < testQuestions.length; i++) {
        const q = testQuestions[i];
        const userResp = testAnswers[q.id] || '';
        let evalResult;

        if (isAi) {
          try {
            evalResult = await window.ToeicP2LlmEvaluator.evaluate(userResp, q);
          } catch (err) {
            console.warn('AI evaluation error, using fallback:', err);
            evalResult = window.ToeicP2Evaluator.evaluate(userResp, q);
          }
        } else {
          evalResult = window.ToeicP2Evaluator.evaluate(userResp, q);
        }

        totalScore += evalResult.score;
        evaluatedQuestions.push({
          question: q,
          userResp: userResp,
          evalResult: evalResult,
          qIndex: i === 0 ? 'Question 6' : 'Question 7'
        });
      }

      // Render Summary
      if(el.reportScoreNumber) el.reportScoreNumber.textContent = `${totalScore} / 8`;
      
      if(el.reportBadge && el.reportSummaryText) {
        el.reportBadge.className = 'score-badge';
        if (totalScore >= 7) {
          el.reportBadge.classList.add('score-4');
          el.reportBadge.textContent = 'Score 4/4 - Xuất Sắc';
          el.reportSummaryText.textContent = isAi
            ? 'Kỹ năng viết của bạn rất tuyệt vời! Giám khảo AI đã đánh giá thư của bạn rất xuất sắc.'
            : 'Bạn đã hoàn thành xuất sắc các yêu cầu đề ra với ngôn ngữ phong phú và chính xác.';
        } else if (totalScore >= 5) {
          el.reportBadge.classList.add('score-3');
          el.reportBadge.textContent = 'Score 3/4 - Tốt';
          el.reportSummaryText.textContent = 'Bạn đã hoàn thành tốt bài thi. Các yêu cầu trong đề đã được giải quyết cơ bản tốt.';
        } else if (totalScore >= 3) {
          el.reportBadge.classList.add('score-2');
          el.reportBadge.textContent = 'Score 2/4 - Đạt Yêu Cầu';
          el.reportSummaryText.textContent = 'Bạn trả lời được một số ý nhưng cần rèn luyện thêm cách triển khai thư và từ vựng.';
        } else if (totalScore >= 1) {
          el.reportBadge.classList.add('score-1');
          el.reportBadge.textContent = 'Score 1/4 - Yếu';
          el.reportSummaryText.textContent = 'Bài viết còn nhiều lỗi hoặc chưa trả lời đúng trọng tâm. Cần cải thiện thêm.';
        } else {
          el.reportBadge.classList.add('score-0');
          el.reportBadge.textContent = 'Score 0/4 - Chưa Đạt';
          el.reportSummaryText.textContent = 'Bài viết quá ngắn hoặc không liên quan đến chủ đề email.';
        }
      }

      if(el.reportQuestionsList) {
        el.reportQuestionsList.innerHTML = '';
        evaluatedQuestions.forEach(item => {
          const div = document.createElement('div');
          div.className = 'report-question-item';

          const scoreClass = `score-${item.evalResult.score}`;
          const critHtml = item.evalResult.criteria.map(c => `
            <li class="feedback-item">
              <span>${c.passed ? ICONS.check : ICONS.cross}</span>
              <div>
                <strong>${c.name}:</strong> ${c.detail}
              </div>
            </li>
          `).join('');
          
          let taskHtml = '';
          if(item.evalResult.tasks && item.evalResult.tasks.length > 0) {
            taskHtml = item.evalResult.tasks.map(t => {
               return `<span class="task-badge ${t.completed ? 'matched' : ''}">${t.completed ? ICONS.check : ICONS.cross} ${TASK_LABELS[t.type]||t.type}</span>`;
            }).join(' ');
          }

          div.innerHTML = `
            <div>
              <div style="font-weight: 700; margin-bottom: 0.5rem;">${item.qIndex} • ID #${item.question.id}</div>
              <div style="font-size: 0.9rem; border: 1px solid var(--border-color); padding: 0.5rem; border-radius: var(--radius-sm); margin-bottom: 0.5rem; background: var(--bg-card);">
                 <strong>From:</strong> ${item.question.email.from}<br>
                 <strong>To:</strong> ${item.question.email.to}<br>
                 <strong>Subject:</strong> ${item.question.email.subject}
              </div>
              <div style="margin-top: 0.5rem;">
                <span class="score-badge ${scoreClass}" style="width: 100%; justify-content: center; font-size: 0.88rem;">
                  ${item.evalResult.isAi ? '<span class="ai-badge">AI Gemini</span> ' : ''}${item.evalResult.label} (Điểm: ${item.evalResult.score})
                </span>
              </div>
            </div>
            <div>
              <div style="margin-bottom: 0.5rem; font-size: 0.88rem; color: var(--text-muted);">
                <strong>Yêu cầu:</strong> ${item.question.directions}
              </div>
              <div style="margin-bottom: 0.5rem;">
                ${taskHtml}
              </div>
              <div style="background: var(--bg-main); padding: 0.75rem 1rem; border-radius: var(--radius-md); border-left: 4px solid var(--primary); margin-bottom: 0.75rem; white-space: pre-wrap;">
                <strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 0.2rem;">Email của bạn:</strong>
                <span style="font-size: 1.05rem;">${item.userResp || '<em style="color: var(--danger); font-weight: 400;">(Chưa nhập câu trả lời)</em>'}</span>
              </div>
              <ul class="feedback-list" style="margin-bottom: 0.75rem;">
                ${critHtml}
              </ul>
              ${item.evalResult.messages && item.evalResult.messages.length > 0 ? `<div style="margin-bottom: 0.75rem;">${item.evalResult.messages.map(m=>`<div class="feedback-message message-${m.type}">${m.text}</div>`).join('')}</div>` : ''}
              <div class="sample-answer-box">
                <strong>BÀI MẪU THAM KHẢO:</strong><br>
                ${(item.question.sample_answer || '').replace(/\n/g, '<br>')}
              </div>
              ${item.evalResult.improved ? `
              <div class="sample-answer-box" style="margin-top: 0.5rem; background: rgba(139, 92, 246, 0.08); border-left-color: #8b5cf6;">
                <strong>GỢI Ý VIẾT LẠI CHUẨN BẢN XỨ (Giám khảo AI):</strong><br>
                ${item.evalResult.improved.replace(/\n/g, '<br>')}
              </div>` : ''}
            </div>
          `;
          el.reportQuestionsList.appendChild(div);
        });
      }
    } finally {
      if (el.confirmSubmitBtn) {
        el.confirmSubmitBtn.disabled = false;
        el.confirmSubmitBtn.textContent = 'Đồng Ý Nộp Bài';
      }
    }
  }

  // =========================================================================
  // INSTANT PRACTICE MODE LOGIC
  // =========================================================================

  function populatePracticeDropdown() {
    if(!el.practiceQuestionSelect) return;
    el.practiceQuestionSelect.innerHTML = '';

    const secCount = questions.filter(q => q.set === 'sec').length;
    const coreCount = questions.filter(q => q.set === 'core').length;

    const secGroup = document.createElement('optgroup');
    secGroup.label = `Bộ Đề SEC (${secCount} Câu Mới)`;

    const coreGroup = document.createElement('optgroup');
    coreGroup.label = `Bộ Đề Luyện Tập Cơ Bản (${coreCount} Câu)`;

    const totalLen = questions.length;
    questions.forEach((q, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      const cat = CATEGORY_MAP[q.category] || q.category_vi || q.category;
      const subj = q.email && q.email.subject ? ` - ${q.email.subject}` : '';

      if (q.set === 'sec') {
        opt.textContent = `[SEC ${String(q.sec_id || idx + 1).padStart(2, '0')}] Câu ${String(idx + 1).padStart(2, '0')} • [${cat}]${subj}`;
        secGroup.appendChild(opt);
      } else {
        opt.textContent = `Câu ${String(idx + 1).padStart(2, '0')}/${totalLen} • [${cat}]${subj}`;
        coreGroup.appendChild(opt);
      }
    });

    if (secCount > 0) el.practiceQuestionSelect.appendChild(secGroup);
    if (coreCount > 0) el.practiceQuestionSelect.appendChild(coreGroup);
  }

  function filterPracticeQuestions() {
    if(!el.practiceCategoryFilter) return;
    const filter = el.practiceCategoryFilter.value;

    filteredIndices = [];
    questions.forEach((q, idx) => {
      if (filter === 'sec') {
        if (q.set !== 'sec') return;
      } else if (filter === 'core') {
        if (q.set !== 'core') return;
      } else if (filter !== 'all' && q.category !== filter) {
        return;
      }
      filteredIndices.push(idx);
    });

    if (filteredIndices.length > 0 && !filteredIndices.includes(practiceActiveIndex)) {
      practiceActiveIndex = filteredIndices[0];
    }
    renderPracticeView();
  }

  function renderPracticeView() {
    const q = questions[practiceActiveIndex];
    if (!q) return;

    if(el.practiceQuestionSelect) el.practiceQuestionSelect.value = practiceActiveIndex;
    
    if(el.practiceQuestionBadge) {
      const totalLen = questions.length;
      if (q.set === 'sec') {
        el.practiceQuestionBadge.textContent = `Câu ${String(practiceActiveIndex + 1).padStart(2, '0')}/${totalLen} • ID #${q.id} [SEC ${String(q.sec_id || '').padStart(2, '0')}]`;
      } else {
        el.practiceQuestionBadge.textContent = `Câu ${String(practiceActiveIndex + 1).padStart(2, '0')}/${totalLen} • ID #${q.id}`;
      }
    }

    if(el.practiceCategoryBadge) {
      el.practiceCategoryBadge.textContent = CATEGORY_MAP[q.category] || q.category_vi || q.category;
    }

    // Toggle SEC Badge
    if (el.practiceSecBadge) {
      if (q.set === 'sec') {
        el.practiceSecBadge.style.display = 'inline-flex';
        el.practiceSecBadge.textContent = `SEC ${String(q.sec_id || '').padStart(2, '0')}`;
      } else {
        el.practiceSecBadge.style.display = 'none';
      }
    }

    if(el.practiceSenderAvatar) el.practiceSenderAvatar.textContent = getInitials(q.email.from);
    
    if(el.practiceEmailFrom) el.practiceEmailFrom.textContent = q.email.from;
    if(el.practiceEmailTo) el.practiceEmailTo.textContent = q.email.to;
    if(el.practiceEmailSubject) el.practiceEmailSubject.textContent = q.email.subject;
    if(el.practiceEmailDate) el.practiceEmailDate.textContent = q.email.date;
    if(el.practiceEmailBody) {
      el.practiceEmailBody.innerHTML = q.email.body.replace(/\n/g, '<br>');
    }
    
    if(el.practiceDirectionsText) el.practiceDirectionsText.textContent = q.directions;
    
    renderTasks(el.practiceTaskBadges, q.tasks || []);

    if(el.practiceTextarea) {
      el.practiceTextarea.value = practiceAnswers[q.id] || '';
    }
    updatePracticeWritingStats();
    
    // Hide feedback & sample answer
    if(el.instantFeedbackBox) el.instantFeedbackBox.style.display = 'none';
    if(el.feedbackSampleBox) el.feedbackSampleBox.style.display = 'none';

    // Update button states
    let currentPool = filteredIndices.length > 0 ? filteredIndices : questions.map((_, i) => i);
    let poolIdx = currentPool.indexOf(practiceActiveIndex);

    if (el.practicePrevBtn) {
      el.practicePrevBtn.disabled = (poolIdx <= 0);
    }
    if (el.practiceNextBtn) {
      el.practiceNextBtn.disabled = (poolIdx >= currentPool.length - 1);
    }

    // If evaluated before, show feedback
    if (practiceEvaluations[q.id]) {
      renderPracticeFeedback(practiceEvaluations[q.id]);
    }
  }

  function updatePracticeWritingStats() {
    if(!el.practiceTextarea) return;
    const text = el.practiceTextarea.value;
    const words = countWords(text);
    const chars = text.length;
    const sents = countSentences(text);

    if(el.practiceWordCount) el.practiceWordCount.textContent = words;
    if(el.practiceCharCount) el.practiceCharCount.textContent = chars;
    if(el.practiceSentenceCount) el.practiceSentenceCount.textContent = sents;
    
    if (questions[practiceActiveIndex]) {
      practiceAnswers[questions[practiceActiveIndex].id] = text;
    }
  }

  async function handleCheckAnswer() {
    const q = questions[practiceActiveIndex];
    if (!q) return;

    const userResp = el.practiceTextarea ? el.practiceTextarea.value.trim() : '';
    if (!userResp) {
      if (window.ToeicUi) {
        window.ToeicUi.toast('Vui lòng viết email phản hồi của bạn trước khi chấm điểm!', 'warning');
      } else {
        alert('Vui lòng viết email phản hồi của bạn trước khi chấm điểm!');
      }
      return;
    }

    const isAi = window.ToeicP2LlmEvaluator && window.ToeicP2LlmEvaluator.isEnabled();

    if(el.checkAnswerBtn) {
      el.checkAnswerBtn.disabled = true;
      el.checkAnswerBtn.innerHTML = isAi 
        ? '<span class="ai-loading-spinner"></span> AI Đang Chấm...' 
        : 'Đang chấm...';
    }

    try {
      let result;
      if (isAi) {
        try {
          result = await window.ToeicP2LlmEvaluator.evaluate(userResp, q);
        } catch (err) {
          console.warn('AI eval error in practice, using offline fallback:', err);
          result = window.ToeicP2Evaluator.evaluate(userResp, q);
          if (err.message && err.message.includes('QUOTA_EXCEEDED')) {
            const cleanMsg = err.message.replace('QUOTA_EXCEEDED: ', '');
            if (window.ToeicUi) {
              window.ToeicUi.toast(cleanMsg, 'warning', 6000);
            } else {
              alert(cleanMsg);
            }
            openModal(el.aiConfigModal);
          } else {
            if (window.ToeicUi) {
              window.ToeicUi.toast('Không thể gọi Giám Khảo AI. Đã tự động dùng bộ chấm Offline.', 'error');
            } else {
              alert(`Không thể gọi Giám Khảo AI (${err.message}). Đã tự động dùng bộ chấm Offline.`);
            }
          }
        }
      } else {
        result = window.ToeicP2Evaluator.evaluate(userResp, q);
      }

      practiceEvaluations[q.id] = result;
      renderPracticeFeedback(result);
    } finally {
      if(el.checkAnswerBtn) {
        el.checkAnswerBtn.disabled = false;
        el.checkAnswerBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          <span>Chấm Điểm Ngay</span>
        `;
      }
    }
  }

  function renderPracticeFeedback(result) {
    if(!el.instantFeedbackBox) return;
    el.instantFeedbackBox.style.display = 'block';
    el.instantFeedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if(el.feedbackScoreBadge) {
      el.feedbackScoreBadge.className = `score-badge score-${result.score}`;
      el.feedbackScoreBadge.innerHTML = `${result.isAi ? '<span class="ai-badge">AI Gemini</span> ' : ''}${result.score} / 4`;
    }
    if(el.feedbackLabel) {
      el.feedbackLabel.textContent = result.label;
    }

    // Task Completion
    if(el.feedbackTaskCompletion && result.tasks) {
      el.feedbackTaskCompletion.innerHTML = result.tasks.map(t => {
        return `<span class="task-badge ${t.completed ? 'matched' : ''}">${t.completed ? ICONS.check : ICONS.cross} ${TASK_LABELS[t.type]||t.type}</span>`;
      }).join(' ');
    }

    if(el.feedbackCriteria) {
      el.feedbackCriteria.innerHTML = result.criteria.map(c => `
        <li class="feedback-item">
          <span>${c.passed ? ICONS.check : ICONS.cross}</span>
          <div>
            <strong>${c.name}:</strong> ${c.detail}
          </div>
        </li>
      `).join('');
    }
    
    if(el.feedbackMessages) {
      if(result.messages && result.messages.length > 0) {
        el.feedbackMessages.innerHTML = result.messages.map(m => `
          <div class="feedback-message message-${m.type}">${m.text}</div>
        `).join('');
      } else {
        el.feedbackMessages.innerHTML = '';
      }
    }

    if(el.feedbackImprovedBox && el.feedbackImprovedText) {
      if (result.improved) {
        el.feedbackImprovedBox.style.display = 'block';
        el.feedbackImprovedText.innerHTML = result.improved.replace(/\n/g, '<br>');
      } else {
        el.feedbackImprovedBox.style.display = 'none';
      }
    }
  }

  // --- Initialization ---
  function init() {
    initTheme();

    if (window.TOEIC_PART2_QUESTIONS) {
      questions = window.TOEIC_PART2_QUESTIONS;
      populateTestSelect();
      populatePracticeDropdown();
    } else {
      console.error('TOEIC_PART2_QUESTIONS not found. Ensure part2_data.js is loaded.');
    }

    // Event Listeners
    if(el.themeToggleBtn) el.themeToggleBtn.addEventListener('click', toggleTheme);

    if(el.modeFullBtn) el.modeFullBtn.addEventListener('click', () => switchMode('full'));
    if(el.modePracticeBtn) el.modePracticeBtn.addEventListener('click', () => switchMode('practice'));

    if(el.testSelect) el.testSelect.addEventListener('change', () => {
      // Option chosen, can start
    });
    if(el.startTestBtn) el.startTestBtn.addEventListener('click', async () => {
      const idx = parseInt(el.testSelect.value, 10) || 0;
      const q1 = questions[idx * 2];
      const topic = q1 ? (CATEGORY_MAP[q1.category] || q1.category_vi || '') : '';
      const ok = window.ToeicUi
        ? await window.ToeicUi.confirm(
            `Sắp bắt đầu Bài thi Part 2 — 2 email (Q6 & Q7).${topic ? ` Chủ đề: ${topic}.` : ''}\n\n⏱ Thời gian: MỖI câu 10 phút riêng. Đồng hồ sẽ chạy ngay và không thể tạm dừng.`,
            { title: 'Bắt đầu bài thi?', okText: 'Bắt Đầu', cancelText: 'Để sau' }
          )
        : true;
      if (ok) startTest(idx);
    });
    
    if(el.testPrevBtn) el.testPrevBtn.addEventListener('click', () => {
      navigateTestTo(testActiveQIndex - 1);
    });
    
    if(el.testNextBtn) el.testNextBtn.addEventListener('click', () => {
      navigateTestTo(testActiveQIndex + 1);
    });

    if(el.testTextarea) {
      el.testTextarea.addEventListener('input', updateTestWritingStats);
    }
    if(el.testSubmitBtn) el.testSubmitBtn.addEventListener('click', promptSubmitTest);

    if(el.reportRetakeBtn) el.reportRetakeBtn.addEventListener('click', () => startTest(testCurrentIndex));
    if(el.reportNextTestBtn) el.reportNextTestBtn.addEventListener('click', () => {
      if (testCurrentIndex < Math.ceil(questions.length / 2) - 1) {
        if(el.testSelect) el.testSelect.value = testCurrentIndex + 1;
        startTest(testCurrentIndex + 1);
      } else {
        if (window.ToeicUi) {
          window.ToeicUi.toast('Đã hết bộ đề!', 'info');
        } else {
          alert('Đã hết bộ đề!');
        }
      }
    });

    if(el.practiceCategoryFilter) el.practiceCategoryFilter.addEventListener('change', filterPracticeQuestions);
    if(el.practiceQuestionSelect) el.practiceQuestionSelect.addEventListener('change', (e) => {
      practiceActiveIndex = parseInt(e.target.value, 10);
      renderPracticeView();
    });
    
    if(el.practiceRandomBtn) el.practiceRandomBtn.addEventListener('click', () => {
      let pool = filteredIndices.length > 0 ? filteredIndices : questions.map((_, i) => i);
      if (pool.length > 1) {
        let newIdx = practiceActiveIndex;
        while (newIdx === practiceActiveIndex) {
          newIdx = pool[Math.floor(Math.random() * pool.length)];
        }
        practiceActiveIndex = newIdx;
        renderPracticeView();
      }
    });

    if(el.practiceTextarea) {
      el.practiceTextarea.addEventListener('input', updatePracticeWritingStats);
    }

    if(el.checkAnswerBtn) el.checkAnswerBtn.addEventListener('click', handleCheckAnswer);
    
    if(el.showAnswerBtn) el.showAnswerBtn.addEventListener('click', () => {
      const q = questions[practiceActiveIndex];
      if (!q || !el.feedbackSampleBox || !el.feedbackSampleText) return;
      if (el.instantFeedbackBox) el.instantFeedbackBox.style.display = 'block';
      el.feedbackSampleBox.style.display = 'block';
      el.feedbackSampleText.style.display = 'block';
      el.feedbackSampleText.innerHTML = (q.sample_answer || '').replace(/\n/g, '<br>');
      if (el.toggleSampleBtn) el.toggleSampleBtn.textContent = 'Ẩn Bài Mẫu';
      el.feedbackSampleBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    if(el.toggleSampleBtn) el.toggleSampleBtn.addEventListener('click', () => {
      if(el.feedbackSampleText) {
        const isHidden = el.feedbackSampleText.style.display === 'none';
        el.feedbackSampleText.style.display = isHidden ? 'block' : 'none';
        el.toggleSampleBtn.textContent = isHidden ? 'Ẩn Bài Mẫu' : 'Hiện Bài Mẫu';
      }
    });
    
    if(el.clearPracticeBtn) el.clearPracticeBtn.addEventListener('click', async () => {
      let ok = false;
      if (window.ToeicUi) {
        ok = await window.ToeicUi.confirm('Bạn có chắc muốn xoá nội dung đã nhập?', { title: 'Xoá nội dung', okText: 'Xoá', cancelText: 'Huỷ', danger: true });
      } else {
        ok = confirm('Bạn có chắc muốn xoá nội dung đã nhập?');
      }
      if (ok) {
        if(el.practiceTextarea) el.practiceTextarea.value = '';
        updatePracticeWritingStats();
        if(el.instantFeedbackBox) el.instantFeedbackBox.style.display = 'none';
        if(el.feedbackSampleBox) el.feedbackSampleBox.style.display = 'none';
        delete practiceEvaluations[questions[practiceActiveIndex].id];
      }
    });

    if(el.practicePrevBtn) {
      el.practicePrevBtn.addEventListener('click', () => {
        let currentPool = filteredIndices.length > 0 ? filteredIndices : questions.map((_, i) => i);
        let poolIdx = currentPool.indexOf(practiceActiveIndex);
        if (poolIdx > 0) {
          practiceActiveIndex = currentPool[poolIdx - 1];
          renderPracticeView();
        }
      });
    }

    if(el.practiceNextBtn) {
      el.practiceNextBtn.addEventListener('click', () => {
        let currentPool = filteredIndices.length > 0 ? filteredIndices : questions.map((_, i) => i);
        let poolIdx = currentPool.indexOf(practiceActiveIndex);
        if (poolIdx >= 0 && poolIdx < currentPool.length - 1) {
          practiceActiveIndex = currentPool[poolIdx + 1];
        } else if (practiceActiveIndex < questions.length - 1) {
          practiceActiveIndex++;
        }
        renderPracticeView();
      });
    }

    // --- Global Keyboard Shortcuts ---
    document.addEventListener('keydown', (e) => {
      // Ctrl + Enter: Check answer in practice or submit in test
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (currentMode === 'practice') {
          handleCheckAnswer();
        } else if (currentMode === 'full' && testIsRunning) {
          promptSubmitTest();
        }
        return;
      }

      // Ctrl + ArrowLeft or Alt + ArrowLeft: Previous question
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentMode === 'practice' && el.practicePrevBtn && !el.practicePrevBtn.disabled) {
          el.practicePrevBtn.click();
        } else if (currentMode === 'full' && testIsRunning) {
          navigateTestTo(testActiveQIndex - 1);
        }
        return;
      }

      // Ctrl + ArrowRight or Alt + ArrowRight: Next question
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentMode === 'practice' && el.practiceNextBtn && !el.practiceNextBtn.disabled) {
          el.practiceNextBtn.click();
        } else if (currentMode === 'full' && testIsRunning) {
          navigateTestTo(testActiveQIndex + 1);
        }
        return;
      }
    });

    initModals();
    initAiConfig();
    
    // Initial Render
    filterPracticeQuestions();
  }

  // --- Run Initialization when DOM is ready ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
