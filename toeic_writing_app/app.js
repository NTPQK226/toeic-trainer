/**
 * TOEIC Writing Part 1 - Application Controller
 * Handles Full Test Simulation (5 questions / 8 mins) and Instant Practice Mode.
 */

(function () {
  'use strict';

  // --- SVG Icons (Lucide Style) ---
  const ICONS = {
    sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
    moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
    check: '<svg class="icon icon-success" style="width:16px;height:16px;stroke:#10b981;fill:none;stroke-width:2.5;vertical-align:-2px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    cross: '<svg class="icon icon-danger" style="width:16px;height:16px;stroke:#ef4444;fill:none;stroke-width:2.5;vertical-align:-2px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    alert: '<svg class="icon icon-warning" style="width:16px;height:16px;stroke:#f59e0b;fill:none;stroke-width:2;vertical-align:-2px;" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg class="icon icon-info" style="width:16px;height:16px;stroke:#6366f1;fill:none;stroke-width:2;vertical-align:-2px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    bulb: '<svg class="icon" style="width:16px;height:16px;stroke:#f59e0b;fill:none;stroke-width:2;vertical-align:-2px;" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    sparkle: '<svg class="icon" style="width:16px;height:16px;stroke:#8b5cf6;fill:none;stroke-width:2;vertical-align:-2px;" viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>'
  };

  // --- State Variables ---
  let questions = [];
  let currentMode = 'full'; // 'full' | 'practice'

  // Full Test Mode State
  let testCurrentIndex = 0; // 0 to 30 (Tests 1 to 31)
  let testQuestions = []; // 5 questions for current test
  let testActiveQIndex = 0; // 0 to 4 within current test
  let testAnswers = {}; // { [qId]: string }
  let testVariants = {}; // { [qId]: 1 or 2 }
  let testTimerSeconds = 8 * 60; // 480 seconds (8 minutes)
  let testTimerInterval = null;
  let testIsRunning = false;
  let testIsSubmitted = false;

  // Practice Mode State
  let practiceActiveIndex = 0; // index in questions array
  let practiceAnswers = {}; // { [qId]: string }
  let practiceVariants = {}; // { [qId]: 1 or 2 }
  let practiceEvaluations = {}; // { [qId]: evaluationResult }
  let practiceFilter = 'all';
  let filteredIndices = [];

  // --- DOM Elements Cache ---
  const el = {
    // Mode Switcher
    modeFullBtn: document.getElementById('modeFullBtn'),
    modePracticeBtn: document.getElementById('modePracticeBtn'),
    fullTestTab: document.getElementById('fullTestTab'),
    practiceTab: document.getElementById('practiceTab'),

    // Header Controls
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    rubricBtn: document.getElementById('rubricBtn'),
    tipsBtn: document.getElementById('tipsBtn'),
    aiConfigBtn: document.getElementById('aiConfigBtn'),

    // Modals
    rubricModal: document.getElementById('rubricModal'),
    tipsModal: document.getElementById('tipsModal'),
    submitModal: document.getElementById('submitModal'),
    cancelSubmitBtn: document.getElementById('cancelSubmitBtn'),
    confirmSubmitBtn: document.getElementById('confirmSubmitBtn'),
    submitWarningText: document.getElementById('submitWarningText'),
    aiConfigModal: document.getElementById('aiConfigModal'),
    aiApiKeyInput: document.getElementById('aiApiKeyInput'),
    aiModelSelect: document.getElementById('aiModelSelect'),
    saveAiConfigBtn: document.getElementById('saveAiConfigBtn'),
    testAiConfigBtn: document.getElementById('testAiConfigBtn'),
    clearAiConfigBtn: document.getElementById('clearAiConfigBtn'),
    aiTestStatus: document.getElementById('aiTestStatus'),
    aiToggleSwitch: document.getElementById('aiToggleSwitch'),
    aiStatusText: document.getElementById('aiStatusText'),
    aiToggleSwitchFull: document.getElementById('aiToggleSwitchFull'),
    aiStatusTextFull: document.getElementById('aiStatusTextFull'),
    submitAiNotice: document.getElementById('submitAiNotice'),
    feedbackAiUpgradeBox: document.getElementById('feedbackAiUpgradeBox'),
    feedbackAiUpgradeText: document.getElementById('feedbackAiUpgradeText'),

    // Full Test Elements
    testSelect: document.getElementById('testSelect'),
    startTestBtn: document.getElementById('startTestBtn'),
    timerWidget: document.getElementById('timerWidget'),
    timerText: document.getElementById('timerText'),
    testActiveWorkspace: document.getElementById('testActiveWorkspace'),
    testReportView: document.getElementById('testReportView'),
    testQuestionBadge: document.getElementById('testQuestionBadge'),
    testCategoryBadge: document.getElementById('testCategoryBadge'),
    testImage: document.getElementById('testImage'),
    testKeywordsDisplay: document.getElementById('testKeywordsDisplay'),
    testVariantContainer: document.getElementById('testVariantContainer'),
    testVariantToggle: document.getElementById('testVariantToggle'),
    testTextarea: document.getElementById('testTextarea'),
    testWordCount: document.getElementById('testWordCount'),
    testCharCount: document.getElementById('testCharCount'),
    testSentenceCount: document.getElementById('testSentenceCount'),
    testFormatWarning: document.getElementById('testFormatWarning'),
    testPrevBtn: document.getElementById('testPrevBtn'),
    testNextBtn: document.getElementById('testNextBtn'),
    testPalette: document.getElementById('testPalette'),
    testSubmitBtn: document.getElementById('testSubmitBtn'),

    // Report Elements
    reportScoreNumber: document.getElementById('reportScoreNumber'),
    reportBadge: document.getElementById('reportBadge'),
    reportSummaryText: document.getElementById('reportSummaryText'),
    reportQuestionsList: document.getElementById('reportQuestionsList'),
    reportRetakeBtn: document.getElementById('reportRetakeBtn'),
    reportNextTestBtn: document.getElementById('reportNextTestBtn'),

    // Practice Elements
    practiceCategoryFilter: document.getElementById('practiceCategoryFilter'),
    practiceQuestionSelect: document.getElementById('practiceQuestionSelect'),
    practiceSearchInput: document.getElementById('practiceSearchInput'),
    practiceRandomBtn: document.getElementById('practiceRandomBtn'),
    practiceSecBadge: document.getElementById('practiceSecBadge'),
    practiceQuestionBadge: document.getElementById('practiceQuestionBadge'),
    practiceCategoryBadge: document.getElementById('practiceCategoryBadge'),
    practiceImage: document.getElementById('practiceImage'),
    practiceKeywordsDisplay: document.getElementById('practiceKeywordsDisplay'),
    practiceVariantContainer: document.getElementById('practiceVariantContainer'),
    practiceVariantToggle: document.getElementById('practiceVariantToggle'),
    practiceTextarea: document.getElementById('practiceTextarea'),
    practiceWordCount: document.getElementById('practiceWordCount'),
    practiceCharCount: document.getElementById('practiceCharCount'),
    practiceSentenceCount: document.getElementById('practiceSentenceCount'),
    practiceFormatWarning: document.getElementById('practiceFormatWarning'),
    practicePrevBtn: document.getElementById('practicePrevBtn'),
    checkAnswerBtn: document.getElementById('checkAnswerBtn'),
    showAnswerBtn: document.getElementById('showAnswerBtn'),
    clearPracticeBtn: document.getElementById('clearPracticeBtn'),
    instantFeedbackBox: document.getElementById('instantFeedbackBox'),
    feedbackScoreBadge: document.getElementById('feedbackScoreBadge'),
    feedbackCriteriaList: document.getElementById('feedbackCriteriaList'),
    feedbackSampleBox: document.getElementById('feedbackSampleBox'),
    feedbackSampleText: document.getElementById('feedbackSampleText'),
    feedbackTipBox: document.getElementById('feedbackTipBox'),
    feedbackTipText: document.getElementById('feedbackTipText'),
    practiceNextBtn: document.getElementById('practiceNextBtn')
  };

  // --- Helper Functions ---
  function getPrompt(q, variant) {
    if (!q || !q.prompts || q.prompts.length === 0) {
      return {
        keywords_display: 'action / picture',
        keywords: ['action', 'picture'],
        sample_answer: 'People are interacting in the scene.'
      };
    }
    const idx = (variant === 2 && q.prompts.length > 1) ? 1 : 0;
    return q.prompts[idx] || q.prompts[0];
  }

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

  // --- Theme Management ---
  function updateThemeUI(theme) {
    if (el.themeToggleBtn) el.themeToggleBtn.innerHTML = (theme === 'dark') ? ICONS.sun : ICONS.moon;
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
    if (el.rubricBtn) el.rubricBtn.addEventListener('click', () => openModal(el.rubricModal));
    if (el.tipsBtn) el.tipsBtn.addEventListener('click', () => openModal(el.tipsModal));

    const openAiConfig = () => {
      if (window.ToeicLlmEvaluator) {
        if (el.aiApiKeyInput) el.aiApiKeyInput.value = window.ToeicLlmEvaluator.getApiKey();
        if (el.aiModelSelect) el.aiModelSelect.value = window.ToeicLlmEvaluator.getModel();
      }
      if (el.aiTestStatus) el.aiTestStatus.style.display = 'none';
      openModal(el.aiConfigModal);
    };

    if (el.aiConfigBtn) el.aiConfigBtn.addEventListener('click', openAiConfig);

    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.target.getAttribute('data-close');
        if (modalId && el[modalId]) closeModal(el[modalId]);
      });
    });

    [el.rubricModal, el.tipsModal, el.submitModal, el.aiConfigModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeModal(modal);
        });
      }
    });

    if (el.cancelSubmitBtn) el.cancelSubmitBtn.addEventListener('click', () => closeModal(el.submitModal));
    if (el.confirmSubmitBtn) el.confirmSubmitBtn.addEventListener('click', () => {
      finalizeSubmitTest();
    });
  }

  // --- AI Config Controller ---
  function initAiConfig() {
    if (!window.ToeicLlmEvaluator) return;

    if (el.aiApiKeyInput) el.aiApiKeyInput.value = window.ToeicLlmEvaluator.getApiKey();
    if (el.aiModelSelect) el.aiModelSelect.value = window.ToeicLlmEvaluator.getModel();
    updateAiToggleUI();

    function handleAiToggle() {
      if (!window.ToeicLlmEvaluator.hasApiKey()) {
        openModal(el.aiConfigModal);
        showAiStatus('Vui lòng dán Gemini API Key của bạn để kích hoạt Giám Khảo AI nhé!', 'warning');
        return;
      }
      const currentlyEnabled = window.ToeicLlmEvaluator.isEnabled();
      window.ToeicLlmEvaluator.setEnabled(!currentlyEnabled);
      updateAiToggleUI();
    }

    if (el.aiToggleSwitch) {
      el.aiToggleSwitch.addEventListener('click', handleAiToggle);
    }
    if (el.aiToggleSwitchFull) {
      el.aiToggleSwitchFull.addEventListener('click', handleAiToggle);
    }

    if (el.saveAiConfigBtn) {
      el.saveAiConfigBtn.addEventListener('click', () => {
        const key = el.aiApiKeyInput.value.trim();
        const model = el.aiModelSelect.value;
        if (!key) {
          showAiStatus('Vui lòng nhập hoặc dán Gemini API Key trước khi lưu!', 'warning');
          return;
        }

        window.ToeicLlmEvaluator.setApiKey(key);
        window.ToeicLlmEvaluator.setModel(model);
        window.ToeicLlmEvaluator.setEnabled(true);
        updateAiToggleUI();

        const origHtml = el.saveAiConfigBtn.innerHTML;
        el.saveAiConfigBtn.innerHTML = `${ICONS.check} Đã Lưu!`;
        el.saveAiConfigBtn.style.backgroundColor = '#10b981';
        el.saveAiConfigBtn.style.borderColor = '#10b981';

        showAiStatus('Đã lưu cấu hình và kích hoạt Giám Khảo AI thành công!', 'success');
        setTimeout(() => {
          el.saveAiConfigBtn.innerHTML = origHtml;
          el.saveAiConfigBtn.style.backgroundColor = '';
          el.saveAiConfigBtn.style.borderColor = '';
          closeModal(el.aiConfigModal);
        }, 900);
      });
    }

    if (el.testAiConfigBtn) {
      el.testAiConfigBtn.addEventListener('click', async () => {
        const key = el.aiApiKeyInput.value.trim();
        const model = el.aiModelSelect.value;
        if (!key) {
          showAiStatus('Vui lòng nhập API Key trước khi kiểm tra kết nối!', 'warning');
          return;
        }

        const origHtml = el.testAiConfigBtn.innerHTML;
        el.testAiConfigBtn.disabled = true;
        el.testAiConfigBtn.innerHTML = '<span class="ai-loading-spinner"></span> Đang kiểm tra...';
        showAiStatus('Đang gửi truy vấn kiểm tra tới máy chủ Google Gemini...', 'info');

        try {
          await window.ToeicLlmEvaluator.testConnection(key, model);
          showAiStatus('Kết nối thành công 100%! API Key hợp lệ và sẵn sàng chấm thi.', 'success');
        } catch (err) {
          showAiStatus(`Kết nối thất bại: ${err.message}`, 'error');
        } finally {
          el.testAiConfigBtn.disabled = false;
          el.testAiConfigBtn.innerHTML = origHtml;
        }
      });
    }

    if (el.clearAiConfigBtn) {
      el.clearAiConfigBtn.addEventListener('click', () => {
        el.aiApiKeyInput.value = '';
        window.ToeicLlmEvaluator.setApiKey('');
        window.ToeicLlmEvaluator.setEnabled(false);
        updateAiToggleUI();
        showAiStatus('Đã xoá API Key khỏi thiết bị và chuyển AI về trạng thái TẮT.', 'info');
      });
    }
  }

  function updateAiToggleUI() {
    if (!window.ToeicLlmEvaluator) return;
    const enabled = window.ToeicLlmEvaluator.isEnabled();

    // Practice tab toggle
    if (el.aiToggleSwitch) {
      el.aiToggleSwitch.classList.toggle('active', enabled);
    }
    if (el.aiStatusText) {
      el.aiStatusText.textContent = enabled ? 'ON' : 'OFF';
      el.aiStatusText.style.color = enabled ? '#8b5cf6' : 'var(--text-muted)';
    }

    // Full test tab toggle
    if (el.aiToggleSwitchFull) {
      el.aiToggleSwitchFull.classList.toggle('active', enabled);
    }
    if (el.aiStatusTextFull) {
      el.aiStatusTextFull.textContent = enabled ? 'ON' : 'OFF';
      el.aiStatusTextFull.style.color = enabled ? '#8b5cf6' : 'var(--text-muted)';
    }
  }

  function showAiStatus(msg, type) {
    if (!el.aiTestStatus) return;
    el.aiTestStatus.style.display = 'block';

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const config = {
      success: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', color: isDark ? '#34d399' : '#059669', icon: ICONS.check },
      error: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: isDark ? '#f87171' : '#dc2626', icon: ICONS.cross },
      warning: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', color: isDark ? '#fbbf24' : '#d97706', icon: ICONS.alert },
      info: { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', color: isDark ? '#a5b4fc' : '#4f46e5', icon: ICONS.info }
    };

    const c = config[type] || config.info;
    el.aiTestStatus.style.background = c.bg;
    el.aiTestStatus.style.border = `1px solid ${c.border}`;
    el.aiTestStatus.style.color = c.color;
    el.aiTestStatus.style.padding = '0.75rem 1rem';
    el.aiTestStatus.style.borderRadius = '8px';
    el.aiTestStatus.style.fontWeight = '600';
    el.aiTestStatus.style.fontSize = '0.86rem';
    el.aiTestStatus.style.lineHeight = '1.4';
    el.aiTestStatus.innerHTML = `${c.icon} ${msg}`;
  }

  // --- Mode Switching ---
  function switchMode(mode) {
    currentMode = mode;
    if (mode === 'full') {
      el.modeFullBtn.classList.add('active');
      el.modePracticeBtn.classList.remove('active');
      el.fullTestTab.classList.add('active');
      el.practiceTab.classList.remove('active');
    } else {
      el.modeFullBtn.classList.remove('active');
      el.modePracticeBtn.classList.add('active');
      el.fullTestTab.classList.remove('active');
      el.practiceTab.classList.add('active');
      renderPracticeView();
    }
  }

  // =========================================================================
  // FULL TEST SIMULATION LOGIC
  // =========================================================================

  function populateTestSelect() {
    el.testSelect.innerHTML = '';

    // Optgroup 1: Bộ 100 Câu Cơ Bản (20 Đề)
    const coreGroup = document.createElement('optgroup');
    coreGroup.label = 'Bộ 100 Câu Cơ Bản (20 Đề Thi)';
    for (let i = 0; i < 20; i++) {
      const start = i * 5 + 1;
      const end = (i + 1) * 5;
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Đề thi số ${String(i + 1).padStart(2, '0')} (Câu ${start} - ${end})`;
      coreGroup.appendChild(opt);
    }
    el.testSelect.appendChild(coreGroup);

    // Optgroup 2: Bộ Đề SEC (55 Câu Mới - 11 Đề)
    const totalTests = Math.ceil(questions.length / 5);
    if (totalTests > 20) {
      const secGroup = document.createElement('optgroup');
      secGroup.label = 'Bộ Đề SEC (55 Câu Mới - 11 Đề Thi)';
      for (let i = 20; i < totalTests; i++) {
        const secTestNum = i - 20 + 1;
        const secStart = (secTestNum - 1) * 5 + 1;
        const secEnd = Math.min(secTestNum * 5, 55);
        const globalStart = i * 5 + 1;
        const globalEnd = Math.min((i + 1) * 5, questions.length);
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `[SEC] Đề SEC ${String(secTestNum).padStart(2, '0')} (SEC #${secStart}-${secEnd} • ID #${globalStart}-${globalEnd})`;
        secGroup.appendChild(opt);
      }
      el.testSelect.appendChild(secGroup);
    }
  }

  function startTest(testIdx) {
    testCurrentIndex = testIdx;
    const start = testIdx * 5;
    testQuestions = questions.slice(start, start + 5);
    testActiveQIndex = 0;
    testAnswers = {};
    testVariants = {};
    testIsSubmitted = false;

    // Reset Timer: 8 minutes
    clearInterval(testTimerInterval);
    testTimerSeconds = 8 * 60;
    testIsRunning = true;
    updateTimerDisplay();

    testTimerInterval = setInterval(() => {
      if (testTimerSeconds > 0) {
        testTimerSeconds--;
        updateTimerDisplay();
      } else {
        clearInterval(testTimerInterval);
        if (window.ToeicUi) {
          window.ToeicUi.toast('Hết giờ làm bài! Hệ thống tự động thu bài và chấm điểm.', 'warning');
        } else {
          alert('Hết giờ làm bài! Hệ thống tự động thu bài và chấm điểm.');
        }
        finalizeSubmitTest();
      }
    }, 1000);

    // Switch view to active workspace
    el.testActiveWorkspace.style.display = 'block';
    el.testReportView.classList.remove('active');
    el.testReportView.style.display = 'none';

    renderTestPalette();
    renderTestQuestion();
  }

  function updateTimerDisplay() {
    el.timerText.textContent = formatTime(testTimerSeconds);
    el.timerWidget.classList.remove('warning', 'danger');

    if (testTimerSeconds <= 60) {
      el.timerWidget.classList.add('danger');
    } else if (testTimerSeconds <= 120) {
      el.timerWidget.classList.add('warning');
    }
  }

  function renderTestPalette() {
    el.testPalette.innerHTML = '';
    testQuestions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = 'palette-btn';
      btn.textContent = idx + 1;

      const ans = testAnswers[q.id];
      if (ans && ans.trim().length > 0) {
        btn.classList.add('answered');
      }
      if (idx === testActiveQIndex) {
        btn.classList.add('current');
      }

      btn.addEventListener('click', () => {
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

    if (q.set === 'sec') {
      el.testQuestionBadge.innerHTML = `<span class="sec-tag">SEC</span> Đề SEC ${String(testCurrentIndex - 20 + 1).padStart(2, '0')} • Câu ${testActiveQIndex + 1}/5 (SEC #${q.sec_id} • ID #${q.id})`;
    } else {
      el.testQuestionBadge.textContent = `Câu ${testActiveQIndex + 1}/5 • ID #${String(q.id).padStart(2, '0')}`;
    }
    el.testCategoryBadge.textContent = q.category || 'Tranh Người';
    el.testImage.src = q.image;

    // Variant selector
    const currentVariant = testVariants[q.id] || 1;
    if (q.prompts && q.prompts.length > 1) {
      el.testVariantContainer.style.display = 'block';
      el.testVariantToggle.innerHTML = '';
      q.prompts.forEach((p, pIdx) => {
        const vBtn = document.createElement('button');
        vBtn.className = `variant-btn ${currentVariant === (pIdx + 1) ? 'active' : ''}`;
        vBtn.textContent = `Đề ${pIdx === 0 ? 'A' : 'B'}: ${p.keywords_display}`;
        vBtn.addEventListener('click', () => {
          testVariants[q.id] = pIdx + 1;
          renderTestQuestion();
        });
        el.testVariantToggle.appendChild(vBtn);
      });
    } else {
      el.testVariantContainer.style.display = 'none';
    }

    // Render Keywords
    const prompt = getPrompt(q, currentVariant);
    renderKeywordsBadge(el.testKeywordsDisplay, prompt.keywords, testAnswers[q.id] || '');

    // Render Textarea Answer
    el.testTextarea.value = testAnswers[q.id] || '';
    updateTestWritingStats();

    // Prev / Next button states
    el.testPrevBtn.disabled = (testActiveQIndex === 0);
    el.testNextBtn.disabled = (testActiveQIndex === testQuestions.length - 1);
  }

  function saveCurrentTestAnswer() {
    const q = testQuestions[testActiveQIndex];
    if (q) {
      testAnswers[q.id] = el.testTextarea.value;
    }
  }

  function renderKeywordsBadge(container, keywords, currentSentence) {
    container.innerHTML = '';
    const tokens = window.ToeicEvaluator ? window.ToeicEvaluator.tokenize(currentSentence) : [];

    keywords.forEach(kw => {
      const badge = document.createElement('span');
      badge.className = 'keyword-badge';

      let isMatched = false;
      if (window.ToeicEvaluator && currentSentence.trim()) {
        const check = window.ToeicEvaluator.checkKeywordMatch(kw, currentSentence, tokens);
        isMatched = check.found;
      }

      if (isMatched) {
        badge.classList.add('matched');
        badge.innerHTML = `<span>${ICONS.check}</span> <strong>${kw}</strong>`;
      } else {
        badge.innerHTML = `<span>•</span> <strong>${kw}</strong>`;
      }

      container.appendChild(badge);
    });
  }

  function updateTestWritingStats() {
    const text = el.testTextarea.value;
    const words = countWords(text);
    const chars = text.length;
    const sents = countSentences(text);

    el.testWordCount.textContent = words;
    el.testCharCount.textContent = chars;
    el.testSentenceCount.textContent = sents;

    if (sents > 1) {
      el.testFormatWarning.style.display = 'inline';
    } else {
      el.testFormatWarning.style.display = 'none';
    }

    // Re-highlight keywords
    const q = testQuestions[testActiveQIndex];
    if (q) {
      const currentVariant = testVariants[q.id] || 1;
      const prompt = getPrompt(q, currentVariant);
      renderKeywordsBadge(el.testKeywordsDisplay, prompt.keywords, text);
    }
  }

  function promptSubmitTest() {
    saveCurrentTestAnswer();
    let answered = 0;
    testQuestions.forEach(q => {
      if (testAnswers[q.id] && testAnswers[q.id].trim().length > 0) answered++;
    });

    const unanswered = testQuestions.length - answered;
    if (unanswered > 0) {
      el.submitWarningText.textContent = `Bạn vẫn còn ${unanswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài thi ngay bây giờ không?`;
    } else {
      el.submitWarningText.textContent = `Bạn đã hoàn thành đủ 5/5 câu hỏi! Bấm "Đồng Ý Nộp Bài" để xem điểm số và lời giải chi tiết.`;
    }

    const isAi = window.ToeicLlmEvaluator && window.ToeicLlmEvaluator.isEnabled();
    if (el.submitAiNotice) {
      if (isAi) {
        el.submitAiNotice.style.background = 'rgba(139, 92, 246, 0.1)';
        el.submitAiNotice.style.color = '#8b5cf6';
        el.submitAiNotice.innerHTML = '<strong>Chế độ chấm:</strong> Giám Khảo AI Gemini đang BẬT (Đọc ảnh & chấm 5 câu chuẩn ETS).';
      } else {
        el.submitAiNotice.style.background = 'rgba(100, 116, 139, 0.1)';
        el.submitAiNotice.style.color = 'var(--text-muted)';
        el.submitAiNotice.innerHTML = '<strong>Chế độ chấm:</strong> Bộ chấm Offline (Bật công tắc Giám Khảo AI nếu muốn chấm chi tiết).';
      }
    }

    openModal(el.submitModal);
  }

  async function finalizeSubmitTest() {
    clearInterval(testTimerInterval);
    saveCurrentTestAnswer();
    testIsSubmitted = true;

    // Show loading state if AI is evaluating
    const isAi = window.ToeicLlmEvaluator && window.ToeicLlmEvaluator.isEnabled();
    if (el.confirmSubmitBtn) {
      el.confirmSubmitBtn.disabled = true;
      el.confirmSubmitBtn.innerHTML = isAi
        ? '<span class="ai-loading-spinner"></span> Giám khảo AI đang chấm 5 câu...'
        : '<span class="ai-loading-spinner"></span> Đang tổng hợp điểm...';
    }

    try {
      const evaluationPromises = testQuestions.map(async (q, idx) => {
        const userSentence = testAnswers[q.id] || '';
        const currentVariant = testVariants[q.id] || 1;
        const prompt = getPrompt(q, currentVariant);

        let evalResult;
        if (isAi && userSentence.trim()) {
          try {
            evalResult = await window.ToeicLlmEvaluator.evaluate(userSentence, prompt, q);
          } catch (err) {
            console.warn('AI eval error in test submit, using offline fallback:', err);
            evalResult = window.ToeicEvaluator.evaluate(userSentence, prompt, q);
          }
        } else {
          evalResult = window.ToeicEvaluator.evaluate(userSentence, prompt, q);
        }

        return {
          qIndex: idx + 1,
          question: q,
          variant: currentVariant,
          prompt: prompt,
          userSentence: userSentence,
          evalResult: evalResult
        };
      });

      const evaluatedQuestions = await Promise.all(evaluationPromises);
      let totalScore = 0;
      evaluatedQuestions.forEach(item => {
        totalScore += item.evalResult.score;
      });

      closeModal(el.submitModal);

      // Display Report
      el.testActiveWorkspace.style.display = 'none';
      el.testReportView.style.display = 'block';
      el.testReportView.classList.add('active');

      el.reportScoreNumber.textContent = `${totalScore} / 15`;

      // Grade badge
      el.reportBadge.className = 'score-badge';
      if (totalScore >= 14) {
        el.reportBadge.classList.add('score-3');
        el.reportBadge.textContent = 'XUẤT SẮC - ĐẠT CHUẨN ETS CAO NHẤT';
        el.reportSummaryText.textContent = isAi
          ? 'Kỹ năng viết của bạn rất tuyệt vời! Giám khảo AI đã kiểm duyệt và đánh giá đạt chuẩn người bản xứ.'
          : 'Kỹ năng viết của bạn rất tuyệt vời! Các câu văn chuẩn ngữ pháp, dùng từ chính xác và miêu tả sắc sảo.';
      } else if (totalScore >= 11) {
        el.reportBadge.classList.add('score-2');
        el.reportBadge.textContent = 'KHÁ TỐT - ĐẠT ĐIỂM CAO';
        el.reportSummaryText.textContent = 'Bạn đã hoàn thành tốt bài thi. Hãy xem lại nhận xét chi tiết từng câu bên dưới để tối ưu điểm số.';
      } else if (totalScore >= 8) {
        el.reportBadge.classList.add('score-2');
        el.reportBadge.textContent = 'ĐẠT YÊU CẦU CƠ BẢN';
        el.reportSummaryText.textContent = 'Bạn đã nắm được cách đặt câu với từ khoá. Cần chú ý hơn đến cấu trúc thì, mạo từ và sự tương thích với tranh.';
      } else {
        el.reportBadge.classList.add('score-1');
        el.reportBadge.textContent = 'CẦN CẢI THIỆN THÊM';
        el.reportSummaryText.textContent = 'Hãy ôn lại các cấu trúc ngữ pháp mẫu và đảm bảo sử dụng đủ 2 từ khoá bắt buộc trong 1 câu duy nhất miêu tả đúng tranh.';
      }

      // Render detailed breakdown
      el.reportQuestionsList.innerHTML = '';
      evaluatedQuestions.forEach(item => {
        const div = document.createElement('div');
        div.className = 'report-question-item';

        const isSec = item.question.set === 'sec';
        const secBadgeHtml = isSec ? '<span class="sec-tag">SEC</span> ' : '';
        const idLabel = isSec ? `SEC #${item.question.sec_id} • ID #${item.question.id}` : `ID #${item.question.id}`;

        const scoreClass = `score-${item.evalResult.score}`;
        const critHtml = item.evalResult.criteria.map(c => `
          <li class="feedback-item">
            <span>${c.passed ? ICONS.check : ICONS.cross}</span>
            <div>
              <strong>${c.name}:</strong> ${c.detail}
            </div>
          </li>
        `).join('');

        div.innerHTML = `
          <div>
            <div style="font-weight: 700; margin-bottom: 0.5rem;">${secBadgeHtml}Câu ${item.qIndex} • ${idLabel}</div>
            <img src="${item.question.image}" alt="Q${item.question.id}" style="width: 100%; border-radius: var(--radius-md); object-fit: cover;">
            <div style="margin-top: 0.5rem;">
              <span class="score-badge ${scoreClass}" style="width: 100%; justify-content: center; font-size: 0.88rem;">
                ${item.evalResult.isAi ? '<span class="ai-badge">AI Gemini</span> ' : ''}${item.evalResult.label}
              </span>
            </div>
          </div>
          <div>
            <div style="margin-bottom: 0.5rem; font-size: 0.88rem; color: var(--text-muted);">
              <strong>Từ khoá bắt buộc:</strong> ${item.prompt.keywords_display}
            </div>
            <div style="background: var(--bg-main); padding: 0.75rem 1rem; border-radius: var(--radius-md); border-left: 4px solid var(--primary); margin-bottom: 0.75rem;">
              <strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 0.2rem;">Câu của bạn:</strong>
              <span style="font-size: 1.05rem; font-weight: 600;">${item.userSentence || '<em style="color: var(--danger); font-weight: 400;">(Chưa nhập câu trả lời)</em>'}</span>
            </div>
            <ul class="feedback-list" style="margin-bottom: 0.75rem;">
              ${critHtml}
            </ul>
            <div class="sample-answer-box">
              <strong>Câu Mẫu Chuẩn Điểm 3:</strong>
              ${item.prompt.sample_answer}
            </div>
            ${item.evalResult.nativeUpgrade ? `
            <div class="sample-answer-box" style="margin-top: 0.5rem; background: rgba(139, 92, 246, 0.08); border-left-color: #8b5cf6;">
              <strong>Gợi Ý Viết Lại Chuẩn Bản Xứ (Giám khảo AI):</strong>
              ${item.evalResult.nativeUpgrade}
            </div>` : ''}
            <div class="grammar-tip-box" style="margin-top: 0.5rem;">
              <strong>Điểm Ngữ Pháp Chú Ý:</strong>
              ${item.question.grammar_tip || 'Chú ý chia thì hiện tại tiếp diễn và dùng mạo từ chính xác.'}
            </div>
          </div>
        `;

        el.reportQuestionsList.appendChild(div);
      });
    } finally {
      if (el.confirmSubmitBtn) {
        el.confirmSubmitBtn.disabled = false;
        el.confirmSubmitBtn.innerHTML = 'Đồng Ý Nộp Bài';
      }
    }
  }

  // =========================================================================
  // INSTANT PRACTICE MODE LOGIC
  // =========================================================================

  function populatePracticeDropdown() {
    el.practiceQuestionSelect.innerHTML = '';

    const coreGroup = document.createElement('optgroup');
    coreGroup.label = 'Bộ 100 Câu Cơ Bản (ID #1 - #100)';

    const secGroup = document.createElement('optgroup');
    secGroup.label = 'Bộ Đề SEC (55 Câu Mới - SEC #01 - #55)';

    questions.forEach((q, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      const kw = (q.prompts && q.prompts[0]) ? q.prompts[0].keywords_display : '';
      if (q.set === 'sec') {
        opt.textContent = `[SEC ${String(q.sec_id).padStart(2, '0')}] Câu ${idx + 1} (ID #${q.id}) - ${kw}`;
        secGroup.appendChild(opt);
      } else {
        opt.textContent = `Câu ${idx + 1} (ID #${q.id}) - ${kw}`;
        coreGroup.appendChild(opt);
      }
    });

    el.practiceQuestionSelect.appendChild(coreGroup);
    if (secGroup.children.length > 0) {
      el.practiceQuestionSelect.appendChild(secGroup);
    }
  }

  function filterPracticeQuestions() {
    const filter = el.practiceCategoryFilter.value;
    const query = el.practiceSearchInput.value.toLowerCase().trim();

    filteredIndices = [];
    questions.forEach((q, idx) => {
      // Set & Category filters
      if (filter === 'sec' && q.set !== 'sec') return;
      if (filter === 'core' && q.set !== 'core') return;
      if (filter === 'people' && q.category_id !== 'people') return;
      if (filter === 'objects_scenes' && q.category_id !== 'objects_scenes') return;

      const ans = practiceAnswers[q.id] || '';
      const evalRes = practiceEvaluations[q.id];

      if (filter === 'unanswered' && ans.trim().length > 0) return;
      if (filter === 'score3' && (!evalRes || evalRes.score !== 3)) return;
      if (filter === 'retry' && (!evalRes || evalRes.score >= 3)) return;

      // Text query filter (ID or keywords or sample answer or SEC ID)
      if (query) {
        const idMatch = String(q.id) === query || String(idx + 1) === query || (q.sec_id && String(q.sec_id) === query);
        const kwMatch = (q.prompts || []).some(p => (p.keywords_display || '').toLowerCase().includes(query));
        const ansMatch = (q.prompts || []).some(p => (p.sample_answer || '').toLowerCase().includes(query));
        const secMatch = query === 'sec' && q.set === 'sec';
        if (!idMatch && !kwMatch && !ansMatch && !secMatch) return;
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

    el.practiceQuestionSelect.value = practiceActiveIndex;

    // SEC tag display
    if (el.practiceSecBadge) {
      el.practiceSecBadge.style.display = (q.set === 'sec') ? 'inline-block' : 'none';
    }

    if (q.set === 'sec') {
      el.practiceQuestionBadge.textContent = `[SEC ${String(q.sec_id).padStart(2, '0')}] Câu ${practiceActiveIndex + 1} / ${questions.length} • ID #${q.id}`;
    } else {
      el.practiceQuestionBadge.textContent = `Câu ${practiceActiveIndex + 1} / ${questions.length} • ID #${String(q.id).padStart(2, '0')}`;
    }
    el.practiceCategoryBadge.textContent = q.category || 'Tranh Người';
    el.practiceImage.src = q.image;

    // Variant selector
    const currentVariant = practiceVariants[q.id] || 1;
    if (q.prompts && q.prompts.length > 1) {
      el.practiceVariantContainer.style.display = 'block';
      el.practiceVariantToggle.innerHTML = '';
      q.prompts.forEach((p, pIdx) => {
        const vBtn = document.createElement('button');
        vBtn.className = `variant-btn ${currentVariant === (pIdx + 1) ? 'active' : ''}`;
        vBtn.textContent = `Đề ${pIdx === 0 ? 'A' : 'B'}: ${p.keywords_display}`;
        vBtn.addEventListener('click', () => {
          practiceVariants[q.id] = pIdx + 1;
          renderPracticeView();
        });
        el.practiceVariantToggle.appendChild(vBtn);
      });
    } else {
      el.practiceVariantContainer.style.display = 'none';
    }

    const prompt = getPrompt(q, currentVariant);
    const userSentence = practiceAnswers[q.id] || '';
    renderKeywordsBadge(el.practiceKeywordsDisplay, prompt.keywords, userSentence);

    el.practiceTextarea.value = userSentence;
    updatePracticeStats();

    // Show previous evaluation if available
    const prevEval = practiceEvaluations[q.id];
    if (prevEval) {
      displayPracticeFeedback(prevEval, prompt, q);
    } else {
      el.instantFeedbackBox.style.display = 'none';
    }

    // Update Prev / Next button states
    let currentPool = filteredIndices.length > 0 ? filteredIndices : questions.map((_, i) => i);
    let poolIdx = currentPool.indexOf(practiceActiveIndex);

    if (el.practicePrevBtn) {
      el.practicePrevBtn.disabled = (poolIdx <= 0);
    }
    if (el.practiceNextBtn) {
      el.practiceNextBtn.disabled = (poolIdx >= currentPool.length - 1);
    }
  }

  function updatePracticeStats() {
    const text = el.practiceTextarea.value;
    const words = countWords(text);
    const chars = text.length;
    const sents = countSentences(text);

    el.practiceWordCount.textContent = words;
    el.practiceCharCount.textContent = chars;
    el.practiceSentenceCount.textContent = sents;

    if (sents > 1) {
      el.practiceFormatWarning.style.display = 'inline';
    } else {
      el.practiceFormatWarning.style.display = 'none';
    }

    const q = questions[practiceActiveIndex];
    if (q) {
      const currentVariant = practiceVariants[q.id] || 1;
      const prompt = getPrompt(q, currentVariant);
      renderKeywordsBadge(el.practiceKeywordsDisplay, prompt.keywords, text);
    }
  }

  async function checkPracticeAnswer() {
    const q = questions[practiceActiveIndex];
    if (!q) return;

    const userSentence = el.practiceTextarea.value;
    practiceAnswers[q.id] = userSentence;

    const currentVariant = practiceVariants[q.id] || 1;
    const prompt = getPrompt(q, currentVariant);

    const isAi = window.ToeicLlmEvaluator && window.ToeicLlmEvaluator.isEnabled();

    if (isAi) {
      const origHtml = el.checkAnswerBtn.innerHTML;
      el.checkAnswerBtn.innerHTML = '<span class="ai-loading-spinner"></span> Giám khảo AI đang chấm...';
      el.checkAnswerBtn.disabled = true;

      try {
        const evalResult = await window.ToeicLlmEvaluator.evaluate(userSentence, prompt, q);
        practiceEvaluations[q.id] = evalResult;
        displayPracticeFeedback(evalResult, prompt, q);
      } catch (err) {
        console.warn('AI evaluation error, falling back to offline engine:', err);
        const fallback = window.ToeicEvaluator.evaluate(userSentence, prompt, q);
        practiceEvaluations[q.id] = fallback;
        displayPracticeFeedback(fallback, prompt, q);
        if (window.ToeicUi) {
          window.ToeicUi.toast('Không thể gọi Giám Khảo AI. Đã tự động dùng bộ chấm Offline.', 'error');
        } else {
          alert(`Không thể gọi Giám Khảo AI (${err.message}). Đã tự động dùng bộ chấm Offline.`);
        }
      } finally {
        el.checkAnswerBtn.innerHTML = origHtml;
        el.checkAnswerBtn.disabled = false;
      }
    } else {
      const evalResult = window.ToeicEvaluator.evaluate(userSentence, prompt, q);
      practiceEvaluations[q.id] = evalResult;
      displayPracticeFeedback(evalResult, prompt, q);
    }
  }

  function displayPracticeFeedback(evalResult, prompt, question) {
    el.instantFeedbackBox.style.display = 'block';

    // Badge
    el.feedbackScoreBadge.className = `score-badge score-${evalResult.score}`;
    el.feedbackScoreBadge.innerHTML = (evalResult.isAi ? '<span class="ai-badge">AI Gemini</span> ' : '') + evalResult.label;

    // Criteria list
    el.feedbackCriteriaList.innerHTML = evalResult.criteria.map(c => `
      <li class="feedback-item">
        <span>${c.passed ? ICONS.check : ICONS.cross}</span>
        <div>
          <strong>${c.name}:</strong> ${c.detail}
        </div>
      </li>
    `).join('');

    // Sample Answer
    el.feedbackSampleText.textContent = prompt.sample_answer;

    // Grammar tip
    el.feedbackTipText.textContent = question.grammar_tip || 'Chú ý chia thì và dùng mạo từ đúng chuẩn.';

    // AI Native Upgrade box
    if (evalResult.nativeUpgrade && el.feedbackAiUpgradeBox && el.feedbackAiUpgradeText) {
      el.feedbackAiUpgradeBox.style.display = 'block';
      el.feedbackAiUpgradeText.textContent = evalResult.nativeUpgrade;
    } else if (el.feedbackAiUpgradeBox) {
      el.feedbackAiUpgradeBox.style.display = 'none';
    }
  }

  function showSampleAnswer() {
    const q = questions[practiceActiveIndex];
    if (!q) return;
    const currentVariant = practiceVariants[q.id] || 1;
    const prompt = getPrompt(q, currentVariant);

    el.instantFeedbackBox.style.display = 'block';
    el.feedbackScoreBadge.className = 'score-badge score-3';
    el.feedbackScoreBadge.textContent = 'Đáp Án Tham Khảo Chuyên Gia';
    el.feedbackCriteriaList.innerHTML = `
      <li class="feedback-item">
        <span>${ICONS.bulb}</span>
        <div><strong>Gợi ý:</strong> Bạn hãy đọc kỹ câu mẫu dưới đây, sau đó tự viết lại câu tương đương nhé.</div>
      </li>
    `;
    el.feedbackSampleText.textContent = prompt.sample_answer;
    el.feedbackTipText.textContent = question.grammar_tip || '';
  }

  // --- Event Listeners Setup ---
  function initEvents() {
    // Theme toggle
    el.themeToggleBtn.addEventListener('click', toggleTheme);

    // Mode Switcher
    el.modeFullBtn.addEventListener('click', () => switchMode('full'));
    el.modePracticeBtn.addEventListener('click', () => switchMode('practice'));

    // Test Selection & Start
    el.startTestBtn.addEventListener('click', () => {
      startTest(parseInt(el.testSelect.value, 10));
    });
    el.testSelect.addEventListener('change', () => {
      startTest(parseInt(el.testSelect.value, 10));
    });

    // Test Navigation
    el.testPrevBtn.addEventListener('click', () => {
      if (testActiveQIndex > 0) {
        saveCurrentTestAnswer();
        testActiveQIndex--;
        renderTestPalette();
        renderTestQuestion();
      }
    });

    el.testNextBtn.addEventListener('click', () => {
      if (testActiveQIndex < testQuestions.length - 1) {
        saveCurrentTestAnswer();
        testActiveQIndex++;
        renderTestPalette();
        renderTestQuestion();
      }
    });

    el.testSubmitBtn.addEventListener('click', promptSubmitTest);

    // Report Actions
    el.reportRetakeBtn.addEventListener('click', () => {
      startTest(testCurrentIndex);
    });
    el.reportNextTestBtn.addEventListener('click', () => {
      const nextIdx = (testCurrentIndex + 1) % Math.ceil(questions.length / 5);
      el.testSelect.value = nextIdx;
      startTest(nextIdx);
    });

    // Live Textarea Input
    el.testTextarea.addEventListener('input', () => {
      updateTestWritingStats();
      saveCurrentTestAnswer();
      renderTestPalette();
    });

    el.practiceTextarea.addEventListener('input', () => {
      updatePracticeStats();
      const q = questions[practiceActiveIndex];
      if (q) practiceAnswers[q.id] = el.practiceTextarea.value;
    });

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl + Enter: Check answer in practice or advance/submit in test
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (currentMode === 'practice') {
          if (el.checkAnswerBtn) el.checkAnswerBtn.click();
        } else if (currentMode === 'full' && testIsRunning) {
          if (testActiveQIndex < testQuestions.length - 1) {
            saveCurrentTestAnswer();
            testActiveQIndex++;
            renderTestPalette();
            renderTestQuestion();
          } else {
            promptSubmitTest();
          }
        }
        return;
      }

      // Ctrl + ArrowLeft or Alt + ArrowLeft: Previous question
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentMode === 'practice' && el.practicePrevBtn && !el.practicePrevBtn.disabled) {
          el.practicePrevBtn.click();
        } else if (currentMode === 'full' && testIsRunning && testActiveQIndex > 0) {
          saveCurrentTestAnswer();
          testActiveQIndex--;
          renderTestPalette();
          renderTestQuestion();
        }
        return;
      }

      // Ctrl + ArrowRight or Alt + ArrowRight: Next question
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentMode === 'practice' && el.practiceNextBtn && !el.practiceNextBtn.disabled) {
          el.practiceNextBtn.click();
        } else if (currentMode === 'full' && testIsRunning && testActiveQIndex < testQuestions.length - 1) {
          saveCurrentTestAnswer();
          testActiveQIndex++;
          renderTestPalette();
          renderTestQuestion();
        }
        return;
      }
    });

    // Practice Actions
    el.checkAnswerBtn.addEventListener('click', checkPracticeAnswer);
    el.showAnswerBtn.addEventListener('click', showSampleAnswer);
    el.clearPracticeBtn.addEventListener('click', () => {
      el.practiceTextarea.value = '';
      const q = questions[practiceActiveIndex];
      if (q) {
        practiceAnswers[q.id] = '';
        delete practiceEvaluations[q.id];
      }
      updatePracticeStats();
      el.instantFeedbackBox.style.display = 'none';
      el.practiceTextarea.focus();
    });

    if (el.practicePrevBtn) {
      el.practicePrevBtn.addEventListener('click', () => {
        let currentPool = filteredIndices.length > 0 ? filteredIndices : questions.map((_, i) => i);
        let poolIdx = currentPool.indexOf(practiceActiveIndex);
        if (poolIdx > 0) {
          practiceActiveIndex = currentPool[poolIdx - 1];
          renderPracticeView();
        }
      });
    }

    if (el.practiceNextBtn) {
      el.practiceNextBtn.addEventListener('click', () => {
        if (filteredIndices.length > 0) {
          const currentPos = filteredIndices.indexOf(practiceActiveIndex);
          if (currentPos >= 0 && currentPos < filteredIndices.length - 1) {
            practiceActiveIndex = filteredIndices[currentPos + 1];
            renderPracticeView();
            return;
          }
        }
        if (practiceActiveIndex < questions.length - 1) {
          practiceActiveIndex++;
          renderPracticeView();
        }
      });
    }

    // Practice Filter & Search
    el.practiceCategoryFilter.addEventListener('change', filterPracticeQuestions);
    el.practiceSearchInput.addEventListener('input', filterPracticeQuestions);
    el.practiceQuestionSelect.addEventListener('change', () => {
      practiceActiveIndex = parseInt(el.practiceQuestionSelect.value, 10);
      renderPracticeView();
    });

    el.practiceRandomBtn.addEventListener('click', () => {
      practiceActiveIndex = Math.floor(Math.random() * questions.length);
      renderPracticeView();
    });
  }

  // --- Initializer ---
  function initApp() {
    initTheme();
    initModals();
    initAiConfig();

    // Check if questions data is present on window
    if (window.TOEIC_PART1_QUESTIONS && Array.isArray(window.TOEIC_PART1_QUESTIONS) && window.TOEIC_PART1_QUESTIONS.length > 0) {
      questions = window.TOEIC_PART1_QUESTIONS;
      setupWithQuestions();
    } else {
      // Fetch toeic_questions.json fallback
      fetch('./toeic_questions.json')
        .then(res => res.json())
        .then(data => {
          questions = data;
          setupWithQuestions();
        })
        .catch(err => {
          console.warn('Could not load questions data yet:', err);
        });
    }
  }

  function setupWithQuestions() {
    populateTestSelect();
    populatePracticeDropdown();
    initEvents();

    // Start with Test 1
    startTest(0);
    renderPracticeView();
  }

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();

