/**
 * TOEIC Writing Part 3 — Opinion Essay (Q8) Application Controller
 * ---------------------------------------------------------------------------
 * Handles:
 *  - Full test simulation: 1 essay, 30-minute countdown (ETS standard)
 *  - Practice mode: browse prompts, write, grade (offline 0-5 or Gemini AI)
 */
(function () {
  'use strict';

  // --- SVG Icons (Lucide style) ---
  const ICONS = {
    sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
    moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
    check: '<svg class="icon icon-success" style="width:16px;height:16px;stroke:#10b981;fill:none;stroke-width:2.5;vertical-align:-2px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    cross: '<svg class="icon icon-danger" style="width:16px;height:16px;stroke:#ef4444;fill:none;stroke-width:2.5;vertical-align:-2px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    alert: '<svg class="icon icon-warning" style="width:16px;height:16px;stroke:#f59e0b;fill:none;stroke-width:2;vertical-align:-2px;" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg class="icon icon-info" style="width:16px;height:16px;stroke:#16a34a;fill:none;stroke-width:2;vertical-align:-2px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    bulb: '<svg class="icon" style="width:16px;height:16px;stroke:#f59e0b;fill:none;stroke-width:2;vertical-align:-2px;" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    sparkle: '<svg class="icon" style="width:16px;height:16px;stroke:#22c55e;fill:none;stroke-width:2;vertical-align:-2px;" viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>'
  };

  // --- State ---
  let questions = [];
  let currentMode = 'full'; // 'full' | 'practice'

  // Full test state (single essay, 30 min)
  let testQuestion = null;
  let testTimerSeconds = 30 * 60;
  let testTimerInterval = null;
  let testIsRunning = false;
  let testIsSubmitted = false;

  // Practice state
  let practiceActiveIndex = 0;
  let practiceFilter = 'all';
  let filteredIndices = [];
  let practiceText = '';

  // --- DOM cache ---
  const el = {
    modeFullBtn: document.getElementById('modeFullBtn'),
    modePracticeBtn: document.getElementById('modePracticeBtn'),
    fullTestTab: document.getElementById('fullTestTab'),
    practiceTab: document.getElementById('practiceTab'),

    themeToggleBtn: document.getElementById('themeToggleBtn'),
    rubricBtn: document.getElementById('rubricBtn'),
    tipsBtn: document.getElementById('tipsBtn'),
    aiConfigBtn: document.getElementById('aiConfigBtn'),

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

    testSelect: document.getElementById('testSelect'),
    startTestBtn: document.getElementById('startTestBtn'),
    timerWidget: document.getElementById('timerWidget'),
    timerText: document.getElementById('timerText'),
    testActiveWorkspace: document.getElementById('testActiveWorkspace'),
    testReportView: document.getElementById('testReportView'),
    testQuestionBadge: document.getElementById('testQuestionBadge'),
    testCategoryBadge: document.getElementById('testCategoryBadge'),
    testPromptText: document.getElementById('testPromptText'),
    testPromptViText: document.getElementById('testPromptViText'),
    testTextarea: document.getElementById('testTextarea'),
    testWordCount: document.getElementById('testWordCount'),
    testParagraphCount: document.getElementById('testParagraphCount'),
    testSentenceCount: document.getElementById('testSentenceCount'),
    testSubmitBtn: document.getElementById('testSubmitBtn'),

    reportScoreNumber: document.getElementById('reportScoreNumber'),
    reportBadge: document.getElementById('reportBadge'),
    reportSummaryText: document.getElementById('reportSummaryText'),
    reportCriteria: document.getElementById('reportCriteria'),
    reportMessages: document.getElementById('reportMessages'),
    reportImprovedBox: document.getElementById('reportImprovedBox'),
    reportImprovedText: document.getElementById('reportImprovedText'),
    reportRetakeBtn: document.getElementById('reportRetakeBtn'),
    reportNextTestBtn: document.getElementById('reportNextTestBtn'),

    practiceCategoryFilter: document.getElementById('practiceCategoryFilter'),
    practiceQuestionSelect: document.getElementById('practiceQuestionSelect'),
    practiceRandomBtn: document.getElementById('practiceRandomBtn'),
    practiceQuestionBadge: document.getElementById('practiceQuestionBadge'),
    practiceCategoryBadge: document.getElementById('practiceCategoryBadge'),
    practicePromptText: document.getElementById('practicePromptText'),
    practicePromptViText: document.getElementById('practicePromptViText'),
    practiceTextarea: document.getElementById('practiceTextarea'),
    practiceWordCount: document.getElementById('practiceWordCount'),
    practiceParagraphCount: document.getElementById('practiceParagraphCount'),
    practiceSentenceCount: document.getElementById('practiceSentenceCount'),
    checkAnswerBtn: document.getElementById('checkAnswerBtn'),
    showAnswerBtn: document.getElementById('showAnswerBtn'),
    clearPracticeBtn: document.getElementById('clearPracticeBtn'),
    instantFeedbackBox: document.getElementById('instantFeedbackBox'),
    feedbackScoreBadge: document.getElementById('feedbackScoreBadge'),
    feedbackLabel: document.getElementById('feedbackLabel'),
    feedbackStats: document.getElementById('feedbackStats'),
    feedbackCriteria: document.getElementById('feedbackCriteria'),
    feedbackMessages: document.getElementById('feedbackMessages'),
    feedbackImprovedBox: document.getElementById('feedbackImprovedBox'),
    feedbackImprovedText: document.getElementById('feedbackImprovedText'),
    feedbackSampleBox: document.getElementById('feedbackSampleBox'),
    feedbackSampleText: document.getElementById('feedbackSampleText'),
    toggleSampleBtn: document.getElementById('toggleSampleBtn'),
    practicePrevBtn: document.getElementById('practicePrevBtn'),
    practiceNextBtn: document.getElementById('practiceNextBtn')
  };

  // --- Helpers ---
  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function countWords(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  }

  function countSentences(str) {
    if (!str || !str.trim()) return 0;
    const matches = str.replace(/\b(mr|mrs|ms|dr|vs|etc|e\.g|i\.e)\./gi, '$1_dot_').split(/[.!?]+/).filter(s => s.trim().length > 0);
    return matches.length;
  }

  function countParagraphs(str) {
    if (!str) return 0;
    return str.split(/\n\s*\n/).filter(p => countWords(p) >= 2).length;
  }

  // --- Theme ---
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
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('toeic_theme', next);
    updateThemeUI(next);
  }

  // --- Modals ---
  function openModal(modalEl) { if (modalEl) modalEl.classList.add('active'); }
  function closeModal(modalEl) { if (modalEl) modalEl.classList.remove('active'); }
  function initModals() {
    const modals = [el.rubricModal, el.tipsModal, el.submitModal, el.aiConfigModal];
    if (el.rubricBtn) el.rubricBtn.addEventListener('click', () => openModal(el.rubricModal));
    if (el.tipsBtn) el.tipsBtn.addEventListener('click', () => openModal(el.tipsModal));
    if (el.aiConfigBtn) {
      el.aiConfigBtn.addEventListener('click', () => {
        if (window.ToeicP3LlmEvaluator && el.aiApiKeyInput) {
          el.aiApiKeyInput.value = window.ToeicP3LlmEvaluator.getUserKey();
        }
        if (el.aiTestStatus) el.aiTestStatus.style.display = 'none';
        openModal(el.aiConfigModal);
      });
    }
    document.querySelectorAll('.close-btn[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.getAttribute('data-close'));
        if (target) closeModal(target);
      });
    });
    modals.forEach(modal => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });
    if (el.cancelSubmitBtn) el.cancelSubmitBtn.addEventListener('click', () => closeModal(el.submitModal));
  }

  // --- AI config ---
  function updateAiToggleUI() {
    if (!window.ToeicP3LlmEvaluator) return;
    const enabled = window.ToeicP3LlmEvaluator.isEnabled();
    if (el.aiToggleSwitch) {
      el.aiToggleSwitch.classList.toggle('active', enabled);
      const st = el.aiToggleSwitch.querySelector('strong');
      if (st) st.textContent = enabled ? 'ON' : 'OFF';
    }
    if (el.aiToggleSwitchFull) {
      el.aiToggleSwitchFull.classList.toggle('active', enabled);
      const st = el.aiToggleSwitchFull.querySelector('strong');
      if (st) st.textContent = enabled ? 'ON' : 'OFF';
    }
  }

  function showAiStatus(msg, type) {
    if (!el.aiTestStatus) return;
    el.aiTestStatus.style.display = 'block';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const config = {
      success: { bg: 'rgba(16,185,129,0.15)', border: '#10b981', color: isDark ? '#34d399' : '#059669' },
      error: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', color: isDark ? '#f87171' : '#dc2626' },
      warning: { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', color: isDark ? '#fbbf24' : '#d97706' },
      info: { bg: 'rgba(22,163,74,0.15)', border: '#16a34a', color: isDark ? '#4ade80' : '#15803d' }
    };
    const c = config[type] || config.info;
    el.aiTestStatus.style.background = c.bg;
    el.aiTestStatus.style.border = '1px solid ' + c.border;
    el.aiTestStatus.style.color = c.color;
    el.aiTestStatus.style.padding = '0.6rem 0.85rem';
    el.aiTestStatus.style.borderRadius = '8px';
    el.aiTestStatus.innerHTML = msg;
  }

  function initAiConfig() {
    if (!window.ToeicP3LlmEvaluator) return;
    const enabled = window.ToeicP3LlmEvaluator.isEnabled();
    if (el.aiApiKeyInput) el.aiApiKeyInput.value = window.ToeicP3LlmEvaluator.getUserKey();
    if (el.aiModelSelect) el.aiModelSelect.value = window.ToeicP3LlmEvaluator.getModel();
    updateAiToggleUI();

    if (el.aiToggleSwitch) el.aiToggleSwitch.addEventListener('click', () => {
      const next = !window.ToeicP3LlmEvaluator.isEnabled();
      window.ToeicP3LlmEvaluator.setEnabled(next);
      updateAiToggleUI();
    });
    if (el.aiToggleSwitchFull) el.aiToggleSwitchFull.addEventListener('click', () => {
      const next = !window.ToeicP3LlmEvaluator.isEnabled();
      window.ToeicP3LlmEvaluator.setEnabled(next);
      updateAiToggleUI();
    });

    if (el.saveAiConfigBtn) {
      el.saveAiConfigBtn.addEventListener('click', () => {
        const key = (el.aiApiKeyInput.value || '').trim();
        const model = el.aiModelSelect.value;
        if (key) window.ToeicP3LlmEvaluator.setApiKey(key);
        window.ToeicP3LlmEvaluator.setModel(model);
        window.ToeicP3LlmEvaluator.setEnabled(true);
        updateAiToggleUI();
        showAiStatus('Đã lưu cấu hình và kích hoạt Giám Khảo AI thành công!', 'success');
        setTimeout(() => closeModal(el.aiConfigModal), 900);
      });
    }

    if (el.testAiConfigBtn) {
      el.testAiConfigBtn.addEventListener('click', async () => {
        const key = (el.aiApiKeyInput.value || '').trim();
        const model = el.aiModelSelect.value;
        el.testAiConfigBtn.disabled = true;
        showAiStatus('Đang kiểm tra kết nối tới Google Gemini...', 'info');
        try {
          await window.ToeicP3LlmEvaluator.testConnection(key, model);
          showAiStatus('Kết nối thành công 100%! API Key hợp lệ và sẵn sàng chấm thi.', 'success');
        } catch (err) {
          showAiStatus('Kết nối thất bại: ' + err.message, 'error');
        } finally {
          el.testAiConfigBtn.disabled = false;
        }
      });
    }

    if (el.clearAiConfigBtn) {
      el.clearAiConfigBtn.addEventListener('click', () => {
        window.ToeicP3LlmEvaluator.clearApiKey();
        if (el.aiApiKeyInput) el.aiApiKeyInput.value = '';
        updateAiToggleUI();
        showAiStatus('Đã xoá Key cá nhân. Hệ thống tự động chuyển sang Key dùng thử miễn phí chung.', 'info');
      });
    }
  }

  // --- Mode switch ---
  function switchMode(mode) {
    currentMode = mode;
    if (mode === 'full') {
      el.modeFullBtn.classList.add('active');
      el.modePracticeBtn.classList.remove('active');
      el.fullTestTab.classList.add('active');
      el.practiceTab.classList.remove('active');

      // Keep active question when switching from Practice to Test
      if (typeof practiceActiveIndex === 'number' && practiceActiveIndex >= 0 && practiceActiveIndex < questions.length) {
        if (el.testSelect) el.testSelect.value = practiceActiveIndex;
        if (!testIsRunning || (testQuestion && questions.indexOf(testQuestion) !== practiceActiveIndex)) {
          startTest(practiceActiveIndex);
        }
      }
    } else {
      el.modePracticeBtn.classList.add('active');
      el.modeFullBtn.classList.remove('active');
      el.practiceTab.classList.add('active');
      el.fullTestTab.classList.remove('active');

      // Keep active question when switching from Test to Practice
      if (testQuestion) {
        const tIdx = questions.indexOf(testQuestion);
        if (tIdx >= 0) practiceActiveIndex = tIdx;
      } else if (el.testSelect) {
        const sIdx = parseInt(el.testSelect.value, 10);
        if (!isNaN(sIdx) && sIdx >= 0 && sIdx < questions.length) practiceActiveIndex = sIdx;
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

  // --- Populate selects ---
  function populateCategoryFilter() {
    if (!el.practiceCategoryFilter) return;
    const cats = {};
    questions.forEach(q => {
      const key = q.category || 'general';
      if (!cats[key]) cats[key] = q.category_vi || key;
    });
    el.practiceCategoryFilter.innerHTML = '<option value="all">Tất cả đề (' + questions.length + ')</option>';
    Object.entries(cats).forEach(([key, label]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = label;
      el.practiceCategoryFilter.appendChild(opt);
    });
  }

  function populateQuestionSelect() {
    if (!el.practiceQuestionSelect) return;
    el.practiceQuestionSelect.innerHTML = '';
    filteredIndices.forEach((qIdx, pos) => {
      const q = questions[qIdx];
      const opt = document.createElement('option');
      opt.value = qIdx;
      opt.textContent = `Bài ${String(qIdx + 1).padStart(2, '0')} • ${q.topic || q.category_vi || ''}`;
      el.practiceQuestionSelect.appendChild(opt);
    });
  }

  function filterPracticeQuestions() {
    const q = el.practiceCategoryFilter ? el.practiceCategoryFilter.value : 'all';
    filteredIndices = questions.map((_, i) => i).filter(i => {
      const item = questions[i];
      if (q !== 'all' && item.category !== q) return false;
      return true;
    });
    if (filteredIndices.length === 0) filteredIndices = [0];
    populateQuestionSelect();
    if (filteredIndices.indexOf(practiceActiveIndex) === -1) practiceActiveIndex = filteredIndices[0];
    renderPracticeView();
  }

  // --- Full test ---
  function populateTestSelect() {
    if (!el.testSelect) return;
    el.testSelect.innerHTML = '';
    questions.forEach((q, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `Đề luận ${String(idx + 1).padStart(2, '0')} • ${q.topic || q.category_vi}`;
      el.testSelect.appendChild(opt);
    });
  }

  function startTest(testIdx) {
    const q = questions[testIdx];
    if (!q) return;
    testQuestion = q;
    testIsSubmitted = false;

    // Reset timer: 30 minutes
    clearInterval(testTimerInterval);
    testTimerSeconds = 30 * 60;
    testIsRunning = true;
    if (el.timerText) el.timerText.textContent = formatTime(testTimerSeconds);
    if (el.timerWidget) { el.timerWidget.classList.remove('warning', 'danger'); }

    testTimerInterval = setInterval(() => {
      if (testTimerSeconds > 0) {
        testTimerSeconds--;
        if (el.timerText) el.timerText.textContent = formatTime(testTimerSeconds);
        if (el.timerWidget) {
          if (testTimerSeconds <= 60) {
            el.timerWidget.classList.add('danger');
            el.timerWidget.classList.remove('warning');
          } else if (testTimerSeconds <= 300) {
            el.timerWidget.classList.add('warning');
            el.timerWidget.classList.remove('danger');
          }
        }
      } else {
        clearInterval(testTimerInterval);
        if (window.ToeicUi) {
          window.ToeicUi.toast('Hết giờ làm bài! Hệ thống tự động thu bài và chấm điểm.', 'warning');
        } else {
          alert('Hết giờ làm bài! Hệ thống tự động thu bài và chấm điểm.');
        }
        finalizeSubmitTest(true);
      }
    }, 1000);

    renderTestQuestion();

    if (el.testActiveWorkspace) el.testActiveWorkspace.style.display = 'block';
    if (el.testReportView) {
      el.testReportView.classList.remove('active');
      el.testReportView.style.display = 'none';
    }
  }

  function renderTestQuestion() {
    if (!testQuestion) return;
    if (el.testQuestionBadge) el.testQuestionBadge.textContent = 'Question 8 • Opinion Essay';
    if (el.testCategoryBadge) el.testCategoryBadge.textContent = testQuestion.category_vi || testQuestion.category || '';
    if (el.testPromptText) el.testPromptText.textContent = testQuestion.prompt || '';
    if (el.testPromptViText) {
      if (testQuestion.prompt_vi) el.testPromptViText.textContent = testQuestion.prompt_vi;
      else el.testPromptViText.textContent = '(Chưa có bản dịch)';
    }
    if (el.testTextarea) {
      el.testTextarea.value = '';
      updateTestStats();
    }
    el.testSubmitBtn.style.display = 'inline-flex';
    el.testSubmitBtn.disabled = false;
    el.testSubmitBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px; margin-right:3px;"><path d="M22 2 11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg><span>NỘP BÀI & CHẤM ĐIỂM (Ctrl + Enter)</span>';
  }

  function updateTestStats() {
    if (!el.testTextarea) return;
    const text = el.testTextarea.value;
    if (el.testWordCount) el.testWordCount.textContent = countWords(text);
    if (el.testParagraphCount) el.testParagraphCount.textContent = countParagraphs(text);
    if (el.testSentenceCount) el.testSentenceCount.textContent = countSentences(text);
  }

  // --- Submit test ---
  function promptSubmitTest() {
    if (testIsSubmitted) return;
    if (!el.testTextarea) return;
    const words = countWords(el.testTextarea.value);
    let warn = `Bạn đã viết ${words} từ. `;
    if (words < 100) warn += 'Bài còn khá ngắn so với chuẩn ~300 từ. ';
    warn += 'Bạn có chắc chắn muốn nộp bài?';
    if (el.submitWarningText) el.submitWarningText.textContent = warn;
    openModal(el.submitModal);
  }

  async function finalizeSubmitTest(force) {
    if (testIsSubmitted && !force) return;
    testIsSubmitted = true;
    clearInterval(testTimerInterval);
    testIsRunning = false;
    closeModal(el.submitModal);

    const essay = el.testTextarea ? el.testTextarea.value : '';
    const isAi = window.ToeicP3LlmEvaluator && window.ToeicP3LlmEvaluator.isEnabled();

    const btn = el.testSubmitBtn;
    let result;
    if (isAi) {
      const orig = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="ai-loading-spinner"></span> Giám khảo AI đang chấm...'; }
      try {
        result = await window.ToeicP3LlmEvaluator.evaluate(essay, testQuestion);
      } catch (err) {
        console.warn('AI error, fallback offline:', err);
        result = window.ToeicP3Evaluator.evaluate(essay, testQuestion);
        if (window.ToeicUi) window.ToeicUi.toast('Giám khảo AI lỗi — dùng bộ chấm Offline.', 'error');
      }
      if (btn) { btn.disabled = false; btn.innerHTML = orig; }
    } else {
      result = window.ToeicP3Evaluator.evaluate(essay, testQuestion);
    }

    renderReport(result, testQuestion);
  }

  function renderReport(result, q) {
    if (el.testActiveWorkspace) el.testActiveWorkspace.style.display = 'none';
    if (el.testReportView) {
      el.testReportView.style.display = 'block';
      el.testReportView.classList.add('active');
    }
    if (el.reportScoreNumber) el.reportScoreNumber.textContent = `${result.score} / 5`;
    if (el.reportBadge) {
      el.reportBadge.className = 'score-badge ' + (result.scoreClass || 'score-0');
      el.reportBadge.innerHTML = (result.isAi ? '<span class="ai-badge">AI Gemini</span> ' : '') + (result.badge || result.label || '');
    }
    if (el.reportSummaryText) {
      const words = result.wordCount || countWords(el.testTextarea.value);
      el.reportSummaryText.textContent = `Bài của bạn: ${words} từ • ${result.sentenceCount || 0} câu • ${result.paragraphCount || 0} đoạn. ${result.reasoning || ''}`;
    }
    // Criteria
    if (el.reportCriteria) {
      el.reportCriteria.innerHTML = '';
      if (result.criteria && result.criteria.length) {
        const ul = document.createElement('ul');
        ul.className = 'criteria-list';
        result.criteria.forEach(c => {
          const li = document.createElement('li');
          li.className = 'feedback-item';
          li.innerHTML = `<span>${c.passed ? ICONS.check : ICONS.cross}</span><div><strong>${c.name}:</strong> ${c.detail}</div>`;
          ul.appendChild(li);
        });
        el.reportCriteria.appendChild(ul);
      }
    }
    // Messages
    if (el.reportMessages) {
      el.reportMessages.innerHTML = '';
      const msgs = result.messages || result.feedback || [];
      if (msgs.length) {
        const box = document.createElement('div');
        box.className = 'feedback-messages';
        msgs.forEach(m => {
          const type = m.type === 'success' || m.type === 'pass' ? 'success' : m.type === 'error' || m.type === 'fail' ? 'error' : m.type === 'warning' ? 'warning' : 'info';
          const d = document.createElement('div');
          d.className = 'message-' + type;
          d.textContent = m.text || '';
          box.appendChild(d);
        });
        el.reportMessages.appendChild(box);
      }
    }
    // Improved
    const improved = result.improved || result.nativeUpgrade || '';
    if (el.reportImprovedBox && el.reportImprovedText) {
      if (improved) {
        el.reportImprovedBox.style.display = 'block';
        el.reportImprovedText.innerHTML = improved.replace(/\n/g, '<br>');
      } else {
        el.reportImprovedBox.style.display = 'none';
      }
    }
  }

  // --- Practice mode ---
  function renderPracticeView() {
    const q = questions[practiceActiveIndex];
    if (!q) return;
    if (el.practiceQuestionBadge) el.practiceQuestionBadge.textContent = `Question 8 • Bài ${String(practiceActiveIndex + 1).padStart(2, '0')}`;
    if (el.practiceCategoryBadge) el.practiceCategoryBadge.textContent = q.category_vi || q.category || '';
    if (el.practicePromptText) el.practicePromptText.textContent = q.prompt || '';
    if (el.practicePromptViText) el.practicePromptViText.textContent = q.prompt_vi || '(Chưa có bản dịch)';
    if (el.practiceQuestionSelect) el.practiceQuestionSelect.value = practiceActiveIndex;

    const saved = sessionStorage.getItem('toeic_p3_practice_' + q.id) || '';
    if (el.practiceTextarea) {
      el.practiceTextarea.value = saved;
      updatePracticeStats();
    }
    if (el.instantFeedbackBox) el.instantFeedbackBox.style.display = 'none';
    if (el.feedbackSampleBox) el.feedbackSampleBox.style.display = 'none';
    if (el.feedbackSampleText) el.feedbackSampleText.style.display = 'none';
    if (el.toggleSampleBtn) el.toggleSampleBtn.textContent = 'Hiện Bài Mẫu';
  }

  function updatePracticeStats() {
    if (!el.practiceTextarea) return;
    const text = el.practiceTextarea.value;
    sessionStorage.setItem('toeic_p3_practice_' + (questions[practiceActiveIndex] ? questions[practiceActiveIndex].id : ''), text);
    if (el.practiceWordCount) el.practiceWordCount.textContent = countWords(text);
    if (el.practiceParagraphCount) el.practiceParagraphCount.textContent = countParagraphs(text);
    if (el.practiceSentenceCount) el.practiceSentenceCount.textContent = countSentences(text);
  }

  async function checkPracticeAnswer() {
    const q = questions[practiceActiveIndex];
    if (!q) return;
    const essay = el.practiceTextarea ? el.practiceTextarea.value : '';
    if (countWords(essay) < 40) {
      if (window.ToeicUi) window.ToeicUi.toast('Vui lòng viết bài luận (tối thiểu ~40 từ) trước khi chấm điểm!', 'warning');
      else alert('Vui lòng viết bài luận trước khi chấm điểm!');
      return;
    }

    const isAi = window.ToeicP3LlmEvaluator && window.ToeicP3LlmEvaluator.isEnabled();
    const btn = el.checkAnswerBtn;
    const orig = btn ? btn.innerHTML : '';

    if (btn) { btn.disabled = true; btn.innerHTML = isAi ? '<span class="ai-loading-spinner"></span> Giám khảo AI đang chấm...' : 'Đang chấm...'; }

    let result;
    try {
      if (isAi) {
        try {
          result = await window.ToeicP3LlmEvaluator.evaluate(essay, q);
        } catch (err) {
          console.warn('AI error, fallback offline:', err);
          result = window.ToeicP3Evaluator.evaluate(essay, q);
          if (err.message && err.message.includes('QUOTA_EXCEEDED')) {
            const cleanMsg = err.message.replace('QUOTA_EXCEEDED: ', '');
            if (window.ToeicUi) {
              window.ToeicUi.toast(cleanMsg, 'warning', 6000);
            } else {
              alert(cleanMsg);
            }
            openModal(el.aiConfigModal);
          } else {
            if (window.ToeicUi) window.ToeicUi.toast('Giám khảo AI lỗi — đã dùng bộ chấm Offline.', 'error');
            else alert(`Giám khảo AI lỗi (${err.message}) — đã dùng bộ chấm Offline.`);
          }
        }
      } else {
        result = window.ToeicP3Evaluator.evaluate(essay, q);
      }
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = orig; }
    }

    displayFeedback(result, q);
  }

  function displayFeedback(result, q) {
    if (el.instantFeedbackBox) el.instantFeedbackBox.style.display = 'block';
    if (el.feedbackScoreBadge) {
      el.feedbackScoreBadge.className = 'score-badge ' + (result.scoreClass || 'score-0');
      el.feedbackScoreBadge.innerHTML = (result.isAi ? '<span class="ai-badge">AI Gemini</span> ' : '') + (result.badge || result.label || '');
    }
    if (el.feedbackLabel) el.feedbackLabel.textContent = '';
    if (el.feedbackStats) {
      el.feedbackStats.innerHTML = '';
      const stats = `${result.wordCount || 0} từ • ${result.sentenceCount || 0} câu • ${result.paragraphCount || 0} đoạn`;
      const d = document.createElement('div');
      d.className = 'feedback-stats-inner';
      d.textContent = stats;
      el.feedbackStats.appendChild(d);
    }
    if (el.feedbackCriteria) {
      el.feedbackCriteria.innerHTML = '';
      if (result.criteria && result.criteria.length) {
        result.criteria.forEach(c => {
          const li = document.createElement('li');
          li.className = 'feedback-item';
          li.innerHTML = `<span>${c.passed ? ICONS.check : ICONS.cross}</span><div><strong>${c.name}:</strong> ${c.detail}</div>`;
          el.feedbackCriteria.appendChild(li);
        });
      }
    }
    if (el.feedbackMessages) {
      el.feedbackMessages.innerHTML = '';
      const msgs = result.messages || result.feedback || [];
      msgs.forEach(m => {
        const type = m.type === 'success' || m.type === 'pass' ? 'success' : m.type === 'error' || m.type === 'fail' ? 'error' : m.type === 'warning' ? 'warning' : 'info';
        const d = document.createElement('div');
        d.className = 'message-' + type;
        d.textContent = m.text || '';
        el.feedbackMessages.appendChild(d);
      });
    }
    const improved = result.improved || result.nativeUpgrade || '';
    if (el.feedbackImprovedBox && el.feedbackImprovedText) {
      if (improved) {
        el.feedbackImprovedBox.style.display = 'block';
        el.feedbackImprovedText.innerHTML = improved.replace(/\n/g, '<br>');
      } else {
        el.feedbackImprovedBox.style.display = 'none';
      }
    }
    if (el.feedbackSampleBox && el.feedbackSampleText) {
      if (q.sample_answer) {
        el.feedbackSampleBox.style.display = 'block';
        el.feedbackSampleText.style.display = 'none';
        el.feedbackSampleText.innerHTML = q.sample_answer.replace(/\n/g, '<br>');
        if (el.toggleSampleBtn) { el.toggleSampleBtn.style.display = ''; el.toggleSampleBtn.textContent = 'Hiện Bài Mẫu'; }
      } else {
        // Đề chưa có bài mẫu → ẩn hẳn khối bài mẫu trong feedback
        el.feedbackSampleBox.style.display = 'none';
      }
    }
  }

  // --- Events ---
  function initEvents() {
    if (el.themeToggleBtn) el.themeToggleBtn.addEventListener('click', toggleTheme);

    if (el.modeFullBtn) el.modeFullBtn.addEventListener('click', () => switchMode('full'));
    if (el.modePracticeBtn) el.modePracticeBtn.addEventListener('click', () => switchMode('practice'));

    if (el.startTestBtn) el.startTestBtn.addEventListener('click', () => {
      const idx = parseInt(el.testSelect.value, 10);
      startTest(idx);
    });
    if (el.testSelect) el.testSelect.addEventListener('change', () => {
      startTest(parseInt(el.testSelect.value, 10));
    });

    if (el.testTextarea) el.testTextarea.addEventListener('input', updateTestStats);
    if (el.testSubmitBtn) el.testSubmitBtn.addEventListener('click', promptSubmitTest);

    if (el.confirmSubmitBtn) el.confirmSubmitBtn.addEventListener('click', () => finalizeSubmitTest(false));

    if (el.reportRetakeBtn) el.reportRetakeBtn.addEventListener('click', () => startTest(questions.indexOf(testQuestion)));
    if (el.reportNextTestBtn) el.reportNextTestBtn.addEventListener('click', () => {
      const cur = questions.indexOf(testQuestion);
      if (cur < questions.length - 1) {
        if (el.testSelect) el.testSelect.value = cur + 1;
        startTest(cur + 1);
      } else {
        if (window.ToeicUi) window.ToeicUi.toast('Đã hết bộ đề luận!', 'info');
        else alert('Đã hết bộ đề!');
      }
    });

    if (el.practiceCategoryFilter) el.practiceCategoryFilter.addEventListener('change', filterPracticeQuestions);
    if (el.practiceQuestionSelect) el.practiceQuestionSelect.addEventListener('change', (e) => {
      practiceActiveIndex = parseInt(e.target.value, 10);
      renderPracticeView();
    });
    if (el.practiceRandomBtn) el.practiceRandomBtn.addEventListener('click', () => {
      if (questions.length < 2) return;
      let newIdx = practiceActiveIndex;
      while (newIdx === practiceActiveIndex) newIdx = Math.floor(Math.random() * questions.length);
      practiceActiveIndex = newIdx;
      renderPracticeView();
    });

    if (el.practiceTextarea) el.practiceTextarea.addEventListener('input', updatePracticeStats);
    if (el.checkAnswerBtn) el.checkAnswerBtn.addEventListener('click', checkPracticeAnswer);

    if (el.showAnswerBtn) el.showAnswerBtn.addEventListener('click', () => {
      const q = questions[practiceActiveIndex];
      if (!q) return;
      if (el.instantFeedbackBox) el.instantFeedbackBox.style.display = 'block';
      if (el.feedbackSampleBox && el.feedbackSampleText) {
        el.feedbackSampleBox.style.display = 'block';
        el.feedbackSampleText.style.display = 'block';
        if (q.sample_answer) {
          el.feedbackSampleText.innerHTML = q.sample_answer.replace(/\n/g, '<br>');
          if (el.toggleSampleBtn) { el.toggleSampleBtn.style.display = ''; el.toggleSampleBtn.textContent = 'Ẩn Bài Mẫu'; }
        } else {
          el.feedbackSampleText.innerHTML = '<em>Đề này chưa có bài mẫu. Bạn hãy tự viết rồi bấm "Chấm Điểm" để nhận phản hồi chi tiết nhé!</em>';
          if (el.toggleSampleBtn) el.toggleSampleBtn.style.display = 'none';
        }
      }
    });
    if (el.toggleSampleBtn) el.toggleSampleBtn.addEventListener('click', () => {
      const hidden = el.feedbackSampleText.style.display === 'none';
      el.feedbackSampleText.style.display = hidden ? 'block' : 'none';
      el.toggleSampleBtn.textContent = hidden ? 'Ẩn Bài Mẫu' : 'Hiện Bài Mẫu';
    });

    if (el.clearPracticeBtn) el.clearPracticeBtn.addEventListener('click', async () => {
      let ok = false;
      if (window.ToeicUi) ok = await window.ToeicUi.confirm('Bạn có chắc muốn xoá nội dung đã viết?', { title: 'Xoá nội dung', okText: 'Xoá', cancelText: 'Huỷ', danger: true });
      else ok = confirm('Bạn có chắc muốn xoá nội dung đã viết?');
      if (ok) {
        if (el.practiceTextarea) { el.practiceTextarea.value = ''; updatePracticeStats(); }
        if (el.instantFeedbackBox) el.instantFeedbackBox.style.display = 'none';
        if (el.feedbackSampleBox) el.feedbackSampleBox.style.display = 'none';
      }
    });

    if (el.practicePrevBtn) el.practicePrevBtn.addEventListener('click', () => {
      if (practiceActiveIndex > 0) { practiceActiveIndex--; renderPracticeView(); }
    });
    if (el.practiceNextBtn) el.practiceNextBtn.addEventListener('click', () => {
      if (practiceActiveIndex < questions.length - 1) { practiceActiveIndex++; renderPracticeView(); }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const active = document.activeElement;
        if (active === el.testTextarea && !testIsSubmitted) {
          e.preventDefault();
          promptSubmitTest();
        } else if (active === el.practiceTextarea || el.practiceTab.classList.contains('active')) {
          e.preventDefault();
          if (el.practiceTab.classList.contains('active')) checkPracticeAnswer();
        }
      }
    });
  }

  // --- Init ---
  function initApp() {
    initTheme();
    initModals();
    initAiConfig();

    let data = [];
    if (window.TOEIC_PART3_QUESTIONS && Array.isArray(window.TOEIC_PART3_QUESTIONS) && window.TOEIC_PART3_QUESTIONS.length) {
      data = window.TOEIC_PART3_QUESTIONS;
    } else if (window.TOEIC_PART3_DATA && Array.isArray(window.TOEIC_PART3_DATA) && window.TOEIC_PART3_DATA.length) {
      data = window.TOEIC_PART3_DATA;
    } else if (typeof TOEIC_PART3_DATA !== 'undefined' && Array.isArray(TOEIC_PART3_DATA)) {
      data = TOEIC_PART3_DATA;
    }

    if (data && data.length) {
      questions = data;
      setupWithQuestions();
    } else {
      if (el.testSelect) el.testSelect.innerHTML = '<option>Chưa có dữ liệu đề — thêm vào part3_data.js</option>';
      console.warn('No Part 3 question data found. Add items to part3_data.js');
    }
  }

  function setupWithQuestions() {
    populateTestSelect();
    populateCategoryFilter();
    filteredIndices = questions.map((_, i) => i);
    populateQuestionSelect();
    initEvents();
    practiceActiveIndex = 0;
    startTest(0);
    renderPracticeView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
