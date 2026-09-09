/**
 * TOEIC Writing FULL TEST — 58 phút chuẩn ETS (Q1–8, gồm 3 phần)
 *
 * Luật thời gian (chuẩn IIBC/ETS):
 *   - Part 1 (Q1–5): chung 8:00 — bấm qua lại tự do trong khối.
 *   - Part 2 (Q6): 10:00 riêng — sau khi chuyển sang Q7 thì không quay lại Q6.
 *   - Part 2 (Q7): 10:00 riêng — sau khi chuyển sang Q8 thì không quay lại.
 *   - Part 3 (Q8): 30:00 riêng — hết giờ tự nộp.
 * Tổng thời gian làm bài = 58:00.
 *
 * Chế độ EXAM-STRICT:
 *   - Không chấm/feedback/đáp án trong lúc thi.
 *   - Báo cáo tổng hợp (điểm thô x/28 + thang 0–200 ước tính) chỉ sau khi nộp.
 *   - AI Gemini tự chấm nếu người dùng đã bật + có key; ngược lại dùng evaluator cục bộ.
 */
(function (window) {
  'use strict';

  var toast = window.ToeicUi ? window.ToeicUi.toast : function (m, t) { alert(m); };
  var confirmDlg = window.ToeicUi ? window.ToeicUi.confirm : function (m) { return Promise.resolve(window.confirm(m)); };

  // ==========================================================================
  // DATA SOURCES (loaded via script tags in index.html)
  // ==========================================================================
  var P1_ALL = (window.TOEIC_PART1_QUESTIONS || []);
  var P2_ALL = (window.TOEIC_PART2_QUESTIONS || window.TOEIC_PART2_DATA || []);
  var P3_ALL = (window.TOEIC_PART3_QUESTIONS || window.TOEIC_PART3_DATA || []);

  // Image path: data stores "images/qN.jpg" (relative to toeic_writing_app/).
  // fulltest lives one folder deeper → prefix "../".
  function p1Image(q) { return (q && q.image) ? ('../' + q.image) : ''; }

  // ==========================================================================
  // TEST BANK GROUPING (mirrors each part's own app)
  // ==========================================================================
  // P1: tests of 5 by flat index → 20 core + 11 SEC = 31.
  // P2: tests of 2 by flat index → 5 SEC + 10 core = 15.
  // P3: each question = 1 essay test → 30.

  function buildP1Tests() {
    var tests = [];
    for (var i = 0; i < P1_ALL.length; i += 5) {
      tests.push(P1_ALL.slice(i, i + 5));
    }
    return tests; // 31
  }
  function buildP2Tests() {
    var tests = [];
    for (var i = 0; i < P2_ALL.length; i += 2) {
      tests.push(P2_ALL.slice(i, i + 2));
    }
    return tests; // 15
  }
  function buildP3Tests() {
    return P3_ALL.map(function (q) { return [q]; }); // 30
  }

  var P1_TESTS = buildP1Tests();
  var P2_TESTS = buildP2Tests();
  var P3_TESTS = buildP3Tests();

  // ==========================================================================
  // STATE
  // ==========================================================================
  var selection = { p1: 0, p2: 0, p3: 0 };       // selected test index per part
  var randCounters = { p1: 0, p2: 0, p3: 0 };

  var exam = null; // active exam state (created on start)

  // Current selected question map for the whole exam:
  // q1..q8 => { part:'p1'|'p2'|'p3', q, prompt?(for p1), key }
  // Built at start.

  var blocks = [
    { id: 'p1', label: 'Part 1 • Q1–5', key: 'block1', seconds: 8 * 60, qKeys: ['q1', 'q2', 'q3', 'q4', 'q5'], kind: 'photo', blockIntro: 'PHẦN 1 — Questions 1–5\nBạn có 8 phút cho cả 5 câu. Có thể bấm qua lại giữa các câu trong khối này để chỉnh sửa. Hết 8 phút (hoặc bấm "Chuyển sang Part 2") sẽ khóa toàn bộ 5 câu.' },
    { id: 'p2q6', label: 'Part 2 • Question 6', key: 'block2', seconds: 10 * 60, qKeys: ['q6'], kind: 'email', blockIntro: 'PHẦN 2 — Question 6\nBạn có 10 phút riêng cho email này. Sau khi chuyển sang Question 7 bạn không thể quay lại câu 6.' },
    { id: 'p2q7', label: 'Part 2 • Question 7', key: 'block3', seconds: 10 * 60, qKeys: ['q7'], kind: 'email', blockIntro: 'PHẦN 2 — Question 7\nBạn có 10 phút riêng cho email này. Sau khi chuyển sang Part 3 bạn không thể quay lại Part 2.' },
    { id: 'p3q8', label: 'Part 3 • Question 8', key: 'block4', seconds: 30 * 60, qKeys: ['q8'], kind: 'essay', blockIntro: 'PHẦN 3 — Question 8\nViết bài luận trình bày quan điểm (tối thiểu 300 từ). Bạn có 30 phút. Hết giờ hệ thống tự nộp bài.' }
  ];

  // qKey order for progress dots (1..8)
  var ALL_QS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];

  // Which qKeys belong to which block index
  function blockIndexOf(qKey) {
    for (var b = 0; b < blocks.length; b++) {
      if (blocks[b].qKeys.indexOf(qKey) >= 0) return b;
    }
    return -1;
  }

  // ==========================================================================
  // DOM CACHE
  // ==========================================================================
  var el = {};
  function cacheEls() {
    el.setupScreen = document.getElementById('setupScreen');
    el.examScreen = document.getElementById('examScreen');
    el.reportScreen = document.getElementById('reportScreen');
    el.p1TestSelect = document.getElementById('p1TestSelect');
    el.p2TestSelect = document.getElementById('p2TestSelect');
    el.p3TestSelect = document.getElementById('p3TestSelect');
    el.p1RandomBtn = document.getElementById('p1RandomBtn');
    el.p2RandomBtn = document.getElementById('p2RandomBtn');
    el.p3RandomBtn = document.getElementById('p3RandomBtn');
    el.randomAllBtn = document.getElementById('randomAllBtn');
    el.startFullBtn = document.getElementById('startFullBtn');
    el.examDots = document.getElementById('examDots');
    el.blockBadge = document.getElementById('blockBadge');
    el.timerLabel = document.getElementById('timerLabel');
    el.timerWidget = document.getElementById('timerWidget');
    el.timerText = document.getElementById('timerText');
    el.examBody = document.getElementById('examBody');
    el.reportRawScore = document.getElementById('reportRawScore');
    el.reportEst200 = document.getElementById('reportEst200');
    el.reportP1Score = document.getElementById('reportP1Score');
    el.reportP2Score = document.getElementById('reportP2Score');
    el.reportP3Score = document.getElementById('reportP3Score');
    el.reportDetailP1 = document.getElementById('reportDetailP1');
    el.reportDetailP2 = document.getElementById('reportDetailP2');
    el.reportDetailP3 = document.getElementById('reportDetailP3');
    el.reportRetakeBtn = document.getElementById('reportRetakeBtn');
    el.reportNewBtn = document.getElementById('reportNewBtn');
    el.reportSetupBtn = document.getElementById('reportSetupBtn');
    el.aiConfigBtn = document.getElementById('aiConfigBtn');
    el.rubricBtn = document.getElementById('rubricBtn');
    el.tipsBtn = document.getElementById('tipsBtn');
    el.feedbackBtn = document.getElementById('feedbackBtn');
    el.aiApiKeyInput = document.getElementById('aiApiKeyInput');
    el.aiModelSelect = document.getElementById('aiModelSelect');
    el.saveAiConfigBtn = document.getElementById('saveAiConfigBtn');
    el.testAiConfigBtn = document.getElementById('testAiConfigBtn');
    el.clearAiConfigBtn = document.getElementById('clearAiConfigBtn');
    el.themeToggleBtn = document.getElementById('themeToggleBtn');
    el.themeToggleIcon = document.getElementById('themeToggleIcon');
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================
  function fmtTime(totalSec) {
    var m = Math.floor(totalSec / 60);
    var s = totalSec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function countWords(text) {
    var t = (text || '').trim();
    if (!t) return 0;
    return t.split(/\s+/).length;
  }
  function nl2br(str) { return esc(str).replace(/\n/g, '<br>'); }

  // ==========================================================================
  // SCREEN SWITCH
  // ==========================================================================
  function showScreen(name) {
    el.setupScreen.classList.toggle('active', name === 'setup');
    el.examScreen.classList.toggle('active', name === 'exam');
    el.reportScreen.classList.toggle('active', name === 'report');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  // ==========================================================================
  // THEME (shared localStorage.toeic_theme)
  // ==========================================================================
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (el.themeToggleIcon) {
      var isDark = theme === 'dark';
      // moon -> sun icon toggle
      el.themeToggleIcon.innerHTML = isDark
        ? '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('toeic_theme', next); } catch (e) {}
    applyTheme(next);
  }
  function initTheme() {
    var saved = 'light';
    try { saved = localStorage.getItem('toeic_theme') || 'light'; } catch (e) {}
    applyTheme(saved);
  }

  // ==========================================================================
  // MODALS (rubric / tips / ai-config / feedback) — use .active (styles.css)
  // ==========================================================================
  var aiEnabledState = null; // lazy read from window.ToeicLlmEvaluator
  function isAiEnabled() {
    var ev = window.ToeicLlmEvaluator || window.ToeicP2LlmEvaluator || window.ToeicP3LlmEvaluator;
    if (ev && typeof ev.isEnabled === 'function') return !!ev.isEnabled();
    return false;
  }

  function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(function (ov) {
      ov.addEventListener('click', function (e) {
        if (e.target === ov) ov.classList.remove('active');
      });
      ov.querySelectorAll('[data-close]').forEach(function (btn) {
        btn.addEventListener('click', function () { ov.classList.remove('active'); });
      });
    });
    if (el.rubricBtn) {
      el.rubricBtn.addEventListener('click', function () {
        openModal('rubricModal');
      });
    }
    if (el.aiConfigBtn) {
      el.aiConfigBtn.addEventListener('click', function () {
        populateAiConfigModal();
        openModal('aiConfigModal');
      });
    }
    if (el.tipsBtn) {
      el.tipsBtn.addEventListener('click', function () { openModal('tipsModal'); });
    }
    if (el.feedbackBtn) {
      el.feedbackBtn.addEventListener('click', function () {
        // Reuse the same behavior as part pages: a lightweight toast guiding feedback
        if (window.ToeicUi) {
          window.ToeicUi.toast('Góp ý: bạn có thể gửi phản hồi qua Zalo / Facebook / email của trung tâm (thông tin ở footer).', 'info', 6000);
        }
      });
    }
  }
  function openModal(id) {
    var m = document.getElementById(id);
    if (m) m.classList.add('active');
  }

  // ---- AI Config (uses P1 ToeicLlmEvaluator storage = shared with all parts) ----
  function getAiEv() { return window.ToeicLlmEvaluator || window.ToeicP2LlmEvaluator || window.ToeicP3LlmEvaluator || null; }
  function aiGetUserKey() { var ev = getAiEv(); return ev && ev.getUserKey ? ev.getUserKey() : ''; }
  function aiGetModel() { var ev = getAiEv(); return ev && ev.getModel ? ev.getModel() : 'gemini-flash-lite-latest'; }
  function aiSetKey(k) { var ev = getAiEv(); if (ev && ev.setApiKey) ev.setApiKey(k); }
  function aiSetModel(m) { var ev = getAiEv(); if (ev && ev.setModel) ev.setModel(m); }
  function aiClearKey() { var ev = getAiEv(); if (ev && ev.clearApiKey) ev.clearApiKey(); }

  function populateAiConfigModal() {
    if (el.aiApiKeyInput) el.aiApiKeyInput.value = aiGetUserKey();
    if (el.aiModelSelect) el.aiModelSelect.value = aiGetModel();
    // reflect enabled state on a mini status row if present
    var st = document.getElementById('aiToggleStatusFull');
    if (st) {
      var on = isAiEnabled();
      st.textContent = on ? 'AI Gemini: ĐANG BẬT — bài sẽ được AI chấm chi tiết khi nộp.' : 'AI Gemini: ĐANG TẮT — hệ thống chấm bằng bộ quy tắc cục bộ.';
      st.style.color = on ? 'var(--success)' : 'var(--text-muted)';
    }
  }

  function wireAiConfig() {
    if (!el.saveAiConfigBtn || !el.testAiConfigBtn) return;
    el.saveAiConfigBtn.addEventListener('click', function () {
      var k = el.aiApiKeyInput ? el.aiApiKeyInput.value.trim() : '';
      var m = el.aiModelSelect ? el.aiModelSelect.value : 'gemini-flash-lite-latest';
      aiSetKey(k);
      aiSetModel(m);
      // enable AI by default after save
      var ev = getAiEv();
      if (ev && ev.setEnabled) ev.setEnabled(true);
      if (window.ToeicUi) window.ToeicUi.toast('Đã lưu cấu hình AI. AI sẽ chấm chi tiết khi bạn nộp bài.', 'success');
      closeModal('aiConfigModal');
    });
    el.testAiConfigBtn.addEventListener('click', async function () {
      var k = el.aiApiKeyInput ? el.aiApiKeyInput.value.trim() : '';
      var m = el.aiModelSelect ? el.aiModelSelect.value : 'gemini-flash-lite-latest';
      var ev = getAiEv();
      if (!ev || typeof ev.testConnection !== 'function') {
        setAiTestStatus('Không có bộ chấm AI — kiểm tra file llm_evaluator đã tải.', 'error');
        return;
      }
      if (el.testAiConfigBtn) { el.testAiConfigBtn.disabled = true; el.testAiConfigBtn.textContent = 'Đang kiểm tra...'; }
      try {
        var ok = await ev.testConnection(k || undefined, m);
        if (ok) setAiTestStatus('Kết nối thành công! AI sẵn sàng chấm chi tiết.', 'success');
        else setAiTestStatus('Không kết nối được. Kiểm tra lại key hoặc mạng.', 'error');
      } catch (e) {
        setAiTestStatus('Lỗi kết nối: ' + (e && e.message ? e.message : e), 'error');
      }
      if (el.testAiConfigBtn) { el.testAiConfigBtn.disabled = false; el.testAiConfigBtn.textContent = 'Kiểm Tra Kết Nối'; }
    });
    if (el.clearAiConfigBtn) {
      el.clearAiConfigBtn.addEventListener('click', function () {
        aiClearKey();
        if (el.aiApiKeyInput) el.aiApiKeyInput.value = '';
        if (window.ToeicUi) window.ToeicUi.toast('Đã xoá key cá nhân (dùng key chung mặc định).', 'info');
      });
    }
  }
  function setAiTestStatus(msg, type) {
    var st = document.getElementById('aiTestStatus');
    if (!st) return;
    st.style.display = 'block';
    st.innerHTML = msg;
    st.style.color = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--text-muted)';
  }
  function closeModal(id) {
    var m = document.getElementById(id);
    if (m) m.classList.remove('active');
  }

  // ==========================================================================
  // SETUP SCREEN — build test selectors
  // ==========================================================================
  function testLabelP1(testIdx) {
    var t = P1_TESTS[testIdx];
    if (!t) return 'Đề thi số ' + String(testIdx + 1).padStart(2, '0');
    var isSec = t[0] && t[0].set === 'sec';
    var first = t[0] ? t[0].id : '';
    var last = t[t.length - 1] ? t[t.length - 1].id : '';
    if (isSec) {
      var secNo = t[0].sec_id;
      return '[SEC] Đề thi số ' + String(testIdx + 1).padStart(2, '0') + ' (Câu ' + first + '-' + last + ') • SEC Đề ' + String(Math.floor((secNo - 1) / 5) + 1);
    }
    return 'Đề thi số ' + String(testIdx + 1).padStart(2, '0') + ' (Câu ' + first + '-' + last + ')';
  }
  function testLabelP2(testIdx) {
    var t = P2_TESTS[testIdx];
    if (!t) return 'Đề thi số ' + String(testIdx + 1).padStart(2, '0');
    var isSec = t[0] && t[0].set === 'sec';
    var topic = t.map(function (q) { return (q.category_vi || q.category || ''); }).filter(Boolean).join(' + ');
    if (isSec) return '[SEC] Đề thi số ' + String(testIdx + 1).padStart(2, '0') + ' (Q6 & Q7)' + (topic ? ' • [' + topic + ']' : '');
    return 'Đề thi số ' + String(testIdx + 1).padStart(2, '0') + ' (Q6 & Q7)' + (topic ? ' • [' + topic + ']' : '');
  }
  function testLabelP3(testIdx) {
    var q = P3_TESTS[testIdx] && P3_TESTS[testIdx][0];
    if (!q) return 'Đề luận ' + String(testIdx + 1).padStart(2, '0');
    return 'Đề luận ' + String(testIdx + 1).padStart(2, '0') + ' • ' + (q.topic || q.category_vi || '');
  }

  function fillSelect(sel, tests, labelFn, optGroups) {
    if (!sel) return;
    sel.innerHTML = '';
    if (optGroups) {
      optGroups.forEach(function (grp) {
        var og = document.createElement('optgroup');
        og.label = grp.label;
        for (var i = grp.start; i < grp.end; i++) {
          var opt = document.createElement('option');
          opt.value = i;
          opt.textContent = labelFn(i);
          og.appendChild(opt);
        }
        sel.appendChild(og);
      });
    } else {
      tests.forEach(function (_, i) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.textContent = labelFn(i);
        sel.appendChild(opt);
      });
    }
    // Preserve selection if valid
    var cur = parseInt(sel.value, 10);
    if (!(cur >= 0 && cur < tests.length)) {
      sel.selectedIndex = 0;
      sel.value = '0';
    }
  }

  function buildSetupSelects() {
    // P1: 20 core (0-19) + 11 sec (20-30)
    var p1SecStart = 20;
    fillSelect(el.p1TestSelect, P1_TESTS, testLabelP1, [
      { label: 'Bộ 100 Câu Cơ Bản (' + Math.min(20, P1_TESTS.length) + ' Đề Thi)', start: 0, end: Math.min(p1SecStart, P1_TESTS.length) },
      { label: 'Bộ Đề SEC (' + Math.max(0, P1_TESTS.length - p1SecStart) + ' Đề Thi Mới)', start: p1SecStart, end: P1_TESTS.length }
    ]);
    // P2: 5 sec (0-4) + 10 core (5-14)
    var p2SecCount = P2_ALL.filter(function (q) { return q.set === 'sec'; }).length;
    var p2SecTests = Math.ceil(p2SecCount / 2);
    fillSelect(el.p2TestSelect, P2_TESTS, testLabelP2, [
      { label: 'Bộ Đề SEC (' + p2SecTests + ' Đề Thi)', start: 0, end: Math.min(p2SecTests, P2_TESTS.length) },
      { label: 'Bộ Đề Luyện Tập Chuẩn ETS (' + Math.max(0, P2_TESTS.length - p2SecTests) + ' Đề Thi)', start: p2SecTests, end: P2_TESTS.length }
    ]);
    // P3: flat 30
    fillSelect(el.p3TestSelect, P3_TESTS, testLabelP3, null);
    // Store option count for validation
    el.p1Count = P1_TESTS.length;
    el.p2Count = P2_TESTS.length;
    el.p3Count = P3_TESTS.length;
  }

  function randomPick(max) { return Math.floor(Math.random() * max); }

  function setSelection(part, idx) {
    var sel = part === 'p1' ? el.p1TestSelect : part === 'p2' ? el.p2TestSelect : el.p3TestSelect;
    if (!sel) return;
    if (typeof idx !== 'number' || !(idx >= 0)) idx = randomPick(part === 'p1' ? P1_TESTS.length : part === 'p2' ? P2_TESTS.length : P3_TESTS.length);
    sel.value = String(idx);
    selection[part] = idx;
    updateStartState();
  }

  function updateStartState() {
    var p1 = parseInt(el.p1TestSelect.value, 10);
    var p2 = parseInt(el.p2TestSelect.value, 10);
    var p3 = parseInt(el.p3TestSelect.value, 10);
    var ok = p1 >= 0 && p1 < P1_TESTS.length && p2 >= 0 && p2 < P2_TESTS.length && p3 >= 0 && p3 < P3_TESTS.length;
    if (el.startFullBtn) el.startFullBtn.disabled = !ok;
    if (ok) { selection.p1 = p1; selection.p2 = p2; selection.p3 = p3; }
  }

  function wireSetup() {
    [el.p1TestSelect, el.p2TestSelect, el.p3TestSelect].forEach(function (s) {
      if (s) s.addEventListener('change', updateStartState);
    });
    if (el.p1RandomBtn) el.p1RandomBtn.addEventListener('click', function () {
      var i = randomPick(P1_TESTS.length);
      setSelection('p1', i);
      randCounters.p1++;
      if (el.p1RandLabel) el.p1RandLabel.textContent = 'Đã chọn: ' + testLabelP1(i);
      if (window.ToeicUi) window.ToeicUi.toast('Đã chọn ngẫu nhiên đề Part 1', 'success');
    });
    if (el.p2RandomBtn) el.p2RandomBtn.addEventListener('click', function () {
      var i = randomPick(P2_TESTS.length);
      setSelection('p2', i);
      randCounters.p2++;
      if (el.p2RandLabel) el.p2RandLabel.textContent = 'Đã chọn: ' + testLabelP2(i);
      if (window.ToeicUi) window.ToeicUi.toast('Đã chọn ngẫu nhiên đề Part 2', 'success');
    });
    if (el.p3RandomBtn) el.p3RandomBtn.addEventListener('click', function () {
      var i = randomPick(P3_TESTS.length);
      setSelection('p3', i);
      randCounters.p3++;
      if (el.p3RandLabel) el.p3RandLabel.textContent = 'Đã chọn: ' + testLabelP3(i);
      if (window.ToeicUi) window.ToeicUi.toast('Đã chọn ngẫu nhiên đề Part 3', 'success');
    });
    if (el.randomAllBtn) {
      el.randomAllBtn.addEventListener('click', function () {
        var i1 = randomPick(P1_TESTS.length);
        var i2 = randomPick(P2_TESTS.length);
        var i3 = randomPick(P3_TESTS.length);
        setSelection('p1', i1); setSelection('p2', i2); setSelection('p3', i3);
        randCounters.p1++; randCounters.p2++; randCounters.p3++;
        if (el.p1RandLabel) el.p1RandLabel.textContent = testLabelP1(i1);
        if (el.p2RandLabel) el.p2RandLabel.textContent = testLabelP2(i2);
        if (el.p3RandLabel) el.p3RandLabel.textContent = testLabelP3(i3);
        if (window.ToeicUi) window.ToeicUi.toast('Đã chọn ngẫu nhiên cả 3 phần', 'success');
      });
    }
    if (el.startFullBtn) el.startFullBtn.addEventListener('click', startExam);
  }

  // ==========================================================================
  // EXAM — build question set from selection
  // ==========================================================================
  function buildExamQuestions() {
    var p1q = P1_TESTS[selection.p1] || [];
    var p2q = P2_TESTS[selection.p2] || [];
    var p3q = P3_TESTS[selection.p3] || [];
    var map = {};
    var order = [];
    // q1..q5
    p1q.forEach(function (q, i) {
      var key = 'q' + (i + 1);
      map[key] = { key: key, part: 'p1', q: q, prompt: q.prompts && q.prompts[0] ? q.prompts[0] : null };
      order.push(key);
    });
    // q6, q7 (if p2q has 2; some sets could be 1 if odd — always 2 here)
    if (p2q[0]) { map.q6 = { key: 'q6', part: 'p2', q: p2q[0] }; order.push('q6'); }
    if (p2q[1]) { map.q7 = { key: 'q7', part: 'p2', q: p2q[1] }; order.push('q7'); }
    // q8
    if (p3q[0]) { map.q8 = { key: 'q8', part: 'p3', q: p3q[0] }; order.push('q8'); }
    return { map: map, order: order };
  }

  // bIdx = block index to enter. wasAdvance = moving from a finished/locked block.
  // showIntro = show the read-only instructions overlay before starting the clock.
  // ETS-faithful: after any transition (timeout or manual) the next block's clock starts
  // immediately; only the very first Part-1 start shows a pre-exam instructions screen.
  function enterBlock(bIdx, wasAdvance, showIntro) {
    if (!exam) return;
    exam.blockIdx = bIdx;
    var blk = blocks[bIdx];
    var qs = blk.qKeys;
    if (qs.indexOf(exam.activeQ) < 0) exam.activeQ = qs[0];

    if (!(exam.remaining[bIdx] > 0) && exam.remaining[bIdx] !== 0) {
      exam.remaining[bIdx] = blk.seconds;
    }

    renderBlockHeader();
    renderProgressDots();

    if (showIntro) {
      // Pre-exam instructions screen (only used for the initial Part-1 start).
      renderBlockIntro(blk, function () {
        renderQuestion(exam.activeQ);
        startTimerIfNeeded();
      });
    } else {
      renderQuestion(exam.activeQ);
      startTimerIfNeeded();
    }
  }

  function startExam() {
    if (exam && !exam.submitted) return; // guard: already running
    // Reset any prior exam fully
    stopTimer();
    var qmap = buildExamQuestions();
    if (!qmap.map.q1 || !qmap.map.q6 || !qmap.map.q8) {
      if (window.ToeicUi) window.ToeicUi.toast('Dữ liệu đề chưa đủ. Kiểm tra lại file dữ liệu.', 'error');
      return;
    }
    var answers = {};
    ALL_QS.forEach(function (k) { if (qmap.map[k]) answers[k] = ''; });
    var locked = {}; // qKey -> true once block passed
    var remaining = blocks.map(function (b) { return b.seconds; });

    exam = {
      qmap: qmap,
      answers: answers,
      locked: locked,
      blockIdx: 0,
      activeQ: 'q1',
      remaining: remaining,
      timerHandle: null,
      submitted: false
    };

    if (window.PartNav) window.PartNav.lock();
    setLeavingGuard(true);
    showScreen('exam');
    enterBlock(0, false, true); // first block: show intro before starting clock
  }

  function stopTimer() {
    if (exam && exam.timerHandle) { clearInterval(exam.timerHandle); exam.timerHandle = null; }
  }

  function startTimer() {
    stopTimer();
    if (!exam) return;
    exam.timerHandle = setInterval(tick, 1000);
  }

  function tick() {
    if (!exam || exam.submitted) return;
    var b = exam.blockIdx;
    exam.remaining[b]--;
    if (exam.remaining[b] <= 0) {
      exam.remaining[b] = 0;
      updateTimerDisplay();
      onBlockTimeout();
    } else {
      updateTimerDisplay();
    }
  }

  function onBlockTimeout() {
    if (!exam || exam.submitted) return;
    var b = exam.blockIdx;
    var blk = blocks[b];
    stopTimer();
    if (blk.id === 'p3q8') {
      // end of exam → submit
      if (window.ToeicUi) window.ToeicUi.toast('Hết giờ Part 3! Hệ thống tự thu bài.', 'warning');
      finalizeExam(true);
      return;
    }
    // Lock all questions in this block & move to next block's first question
    blk.qKeys.forEach(function (k) { exam.locked[k] = true; });
    var next = b + 1;
    if (next >= blocks.length) { finalizeExam(true); return; }
    enterBlock(next, true, false); // clock of next block starts immediately (ETS)
  }

  // ---- In-block navigation helpers (Part 1 has 5 questions; others single) ----
  function blockQuestions(block) {
    var keys = (block.qKeys || []).filter(function (k) { return exam.qmap.map[k]; });
    return keys;
  }
  function activeBlock() { return blocks[exam.blockIdx]; }
  function isLastInBlock(qKey) {
    var keys = blockQuestions(activeBlock());
    return keys.length ? keys[keys.length - 1] === qKey : true;
  }
  function nextQInBlock() {
    var keys = blockQuestions(activeBlock());
    var i = keys.indexOf(exam.activeQ);
    if (i >= 0 && i < keys.length - 1) return keys[i + 1];
    return null;
  }
  function prevQInBlock() {
    var keys = blockQuestions(activeBlock());
    var i = keys.indexOf(exam.activeQ);
    if (i > 0) return keys[i - 1];
    return null;
  }
  // Is the question before us in the exam order (locked/previous block) — used to block going back across parts.
  function canNavigateTo(qKey) {
    var bIdx = blockIndexOf(qKey);
    if (exam.locked[qKey]) return false;
    if (bIdx === exam.blockIdx) return true;                 // same block
    if (bIdx === exam.blockIdx - 1) return false;            // previous block (locked already)
    return false;                                            // future block
  }

  // Primary action button: "nộp câu hiện tại" = advance one step.
  // - In Part 1 (Q1-4): move to next question within the block (no lock).
  // - At the last question of a block (Q5, Q7, or single Q6): finish current block → next part.
  // - On Q8: submit the full exam.
  async function advanceBlock() {
    if (!exam || exam.submitted) return;
    var blk = activeBlock();
    saveCurrentAnswer();

    // Last question of the whole exam (Q8) → submit full test
    if (blk.id === 'p3q8') {
      var unanswered = ALL_QS.filter(function (k) { return exam.qmap.map[k] && !(exam.answers[k] || '').trim(); }).length;
      var ok = await confirmDlg(
        (unanswered > 0 ? 'Bạn còn ' + unanswered + ' câu chưa trả lời.\n\n' : '') +
        'Nộp bài và xem báo cáo tổng hợp? Sau khi nộp không thể chỉnh sửa.',
        { title: 'Nộp bài Full Writing Test', okText: 'Nộp bài', cancelText: 'Ở lại' });
      if (!ok) return;
      finalizeExam(false);
      return;
    }

    // In Part 1 with more questions ahead → just move to next câu (không khóa)
    var nx = nextQInBlock();
    if (nx) {
      exam.activeQ = nx;
      renderQuestion(nx);
      renderProgressDots();
      return;
    }

    // Finish current block → move to next part (locks this block's questions)
    var msg = blk.id === 'p1'
      ? 'Hoàn thành Part 1?\n\nQ1–5 sẽ bị KHÓA vĩnh viễn. Bạn không thể quay lại 5 câu này sau khi chuyển sang Part 2.'
      : blk.id === 'p2q6'
        ? 'Hoàn thành Question 6?\n\nQ6 sẽ bị KHÓA vĩnh viễn. Bạn không thể quay lại câu 6 sau khi chuyển sang Q7.'
        : 'Hoàn thành Question 7?\n\nQ7 sẽ bị KHÓA vĩnh viễn. Bạn không thể quay lại sau khi chuyển sang Part 3.';
    var ok2 = await confirmDlg(msg, { title: 'Chuyển phần (sẽ khóa các câu trước)', okText: 'Chuyển phần', cancelText: 'Ở lại' });
    if (!ok2) return;
    stopTimer();
    blk.qKeys.forEach(function (k) { exam.locked[k] = true; });
    var next = exam.blockIdx + 1;
    if (next >= blocks.length) { finalizeExam(false); return; }
    enterBlock(next, true, false); // clock starts immediately
  }

  // Contextual label for the primary advance button (per real part transition)
  function advanceBtnLabel() {
    if (!exam) return 'Tiếp tục';
    var blk = activeBlock();
    if (blk.id === 'p3q8') return 'Nộp Bài & Xem Kết Quả';
    if (nextQInBlock()) return 'Câu tiếp theo (Q' + nextQInBlock().replace('q', '') + ')';
    if (blk.id === 'p1') return 'Hoàn thành Part 1 → Chuyển sang Part 2';
    if (blk.id === 'p2q6') return 'Hoàn thành Q6 → Chuyển sang Q7';
    return 'Hoàn thành Q7 → Chuyển sang Part 3';
  }

  // Called when entering a block. If a block has multiple questions (Part 1), we show its first
  function startTimerIfNeeded() {
    if (!exam || exam.submitted) return;
    startTimer();
  }

  function renderBlockIntro(blk, cb) {
    if (!exam) return;
    stopTimer();
    var iconSvg =
      blk.kind === 'photo'
        ? '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>'
        : blk.kind === 'email'
          ? '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>'
          : '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>';
    var html =
      '<div class="card block-intro" style="grid-column: 1 / -1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem; min-height: 40vh; text-align:center;">' +
        '<div style="color: var(--primary);">' + iconSvg + '</div>' +
        '<h3>' + esc(blk.label) + '</h3>' +
        '<p style="white-space: pre-line; max-width: 560px; line-height:1.6; color: var(--text-muted);">' + esc(blk.blockIntro) + '</p>' +
        '<p style="font-weight:800; font-size:1.1rem; display:inline-flex; align-items:center; gap:0.4rem;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' + fmtTime(blk.seconds) + '</p>' +
        '<button id="startBlockBtn" class="btn btn-accent" style="padding:0.6rem 1.8rem; font-size:1rem;">Bắt đầu</button>' +
      '</div>';
    el.examBody.innerHTML = html;
    var btn = document.getElementById('startBlockBtn');
    if (btn) btn.addEventListener('click', function () {
      renderQuestion(exam.activeQ);
      startTimerIfNeeded();
    });
  }

  // Groups: Part 1 → q1..q5, Part 2 → q6..q7, Part 3 → q8
  var PROG_GROUPS = [
    { label: 'Part 1', cls: 'g1', keys: ['q1', 'q2', 'q3', 'q4', 'q5'] },
    { label: 'Part 2', cls: 'g2', keys: ['q6', 'q7'] },
    { label: 'Part 3', cls: 'g3', keys: ['q8'] }
  ];

  function renderProgressDots() {
    if (!el.examDots) return;
    el.examDots.innerHTML = '';
    PROG_GROUPS.forEach(function (grp) {
      var wrap = document.createElement('div');
      wrap.className = 'ep-group ' + grp.cls;
      var lab = document.createElement('span');
      lab.className = 'ep-group-label';
      lab.textContent = grp.label;
      wrap.appendChild(lab);
      var keys = grp.keys.filter(function (k) { return exam.qmap.map[k]; });
      keys.forEach(function (k) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'ep-dot';
        dot.textContent = k.replace('q', '');
        var bIdx = blockIndexOf(k);
        var isLocked = !!exam.locked[k];
        var isActive = k === exam.activeQ;
        var isAnswered = (exam.answers[k] || '').trim().length > 0;
        var isReachable = false;
        if (!isLocked && bIdx === exam.blockIdx) isReachable = true;
        if (isLocked) dot.classList.add('locked');
        if (isAnswered) dot.classList.add('answered');
        if (isActive) dot.classList.add('current');
        if (isReachable && !isLocked) {
          dot.title = 'Câu ' + k.replace('q', '') + ' — bấm để xem';
          dot.addEventListener('click', function () {
            if (exam.submitted) return;
            saveCurrentAnswer();
            if (blockIndexOf(k) === exam.blockIdx) {
              exam.activeQ = k;
              renderQuestion(k);
              renderProgressDots();
            } else {
              if (window.ToeicUi) window.ToeicUi.toast('Không thể quay lại câu đã khóa (khối trước).', 'warning');
            }
          });
        } else {
          dot.disabled = true;
        }
        wrap.appendChild(dot);
      });
      el.examDots.appendChild(wrap);
    });
  }

  function renderBlockHeader() {
    var blk = blocks[exam.blockIdx];
    if (el.blockBadge) el.blockBadge.textContent = blk.label;
    // badge class by part accent
    var partCls = blk.id === 'p1' ? ' p1' : (blk.id.indexOf('p2') === 0 ? ' p2' : ' p3');
    el.blockBadge.className = 'block-badge' + partCls;
    // timer label depends on block
    if (el.timerLabel) {
      if (blk.id === 'p1') el.timerLabel.textContent = 'Cả khối Q1–5 còn';
      else el.timerLabel.textContent = 'Câu này còn';
    }
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    if (!exam) return;
    var blk = blocks[exam.blockIdx];
    var secs = exam.remaining[exam.blockIdx];
    if (el.timerText) el.timerText.textContent = fmtTime(Math.max(0, secs));
    if (el.timerWidget) {
      el.timerWidget.classList.remove('warning', 'danger');
      if (secs <= 60) el.timerWidget.classList.add('danger');
      else if (secs <= 120) el.timerWidget.classList.add('warning');
    }
  }

  // ==========================================================================
  // RENDER QUESTION
  // ==========================================================================
  function saveCurrentAnswer() {
    var ta = document.getElementById('examAnswerTextarea');
    if (ta && exam && exam.activeQ) {
      exam.answers[exam.activeQ] = ta.value;
    }
  }

  function renderQuestion(qKey) {
    if (!exam) return;
    // NOTE: do NOT call saveCurrentAnswer() here — the previous question's text is still in
    // the (about-to-be-replaced) textarea. Answers are saved live via the input handler, and
    // any transition handler must call saveCurrentAnswer() BEFORE switching exam.activeQ.
    exam.activeQ = qKey;
    var item = exam.qmap.map[qKey];
    if (!item) return;
    var locked = !!exam.locked[qKey];

    // Build LEFT question card + RIGHT answer card as TWO siblings in .exam-body
    // (mirrors the 2-column layout of the part pages; NOT nested).
    var leftHtml = renderQuestionCard(item, qKey);
    var rightHtml = renderAnswerCard(item, qKey, locked);
    el.examBody.innerHTML = leftHtml + rightHtml;
    // Wire events
    var ta = document.getElementById('examAnswerTextarea');
    if (ta) {
      ta.value = exam.answers[qKey] || '';
      ta.disabled = locked;
      ta.addEventListener('input', function () {
        exam.answers[exam.activeQ] = ta.value;
        updateAnswerStats(ta);
        renderProgressDots();
      });
      updateAnswerStats(ta);
    }
    // Buttons
    var btn = document.getElementById('advanceBtn');
    if (btn) {
      btn.addEventListener('click', function () { advanceBlock(); });
    }
    var backBtn = document.getElementById('prevQBtn');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        var p = prevQInBlock();
        if (!p) return;
        saveCurrentAnswer();
        exam.activeQ = p;
        renderQuestion(p);
        renderProgressDots();
      });
    }
    renderBlockHeader();
    renderProgressDots();
  }

  function updateAnswerStats(ta) {
    var wc = document.getElementById('ftWordCount');
    var cc = document.getElementById('ftCharCount');
    var sc = document.getElementById('ftSentenceCount');
    if (wc) wc.textContent = countWords(ta.value);
    if (cc) cc.textContent = ta.value.length;
    if (sc) {
      var s = (ta.value.match(/[.!?]+(\s|$)/g) || []).length;
      sc.textContent = s;
    }
  }

  // ---- Part icons (small SVG inline, neutral) ----
  function partIcon(part) {
    if (part === 'p1') return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px;"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>';
    if (part === 'p2') return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px;"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>';
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
  }

  // LEFT card: question content (mirrors part pages: big image / email viewer / essay prompt)
  function renderQuestionCard(item, qKey) {
    var q = item.q;
    var part = item.part;
    var isSec = q.set === 'sec';
    var secTag = isSec ? '<span class="sec-tag" style="background:var(--accent-light);color:#b45309;">SEC #' + (q.sec_id != null ? q.sec_id : '') + '</span> ' : '<span class="sec-tag" style="background:var(--bg-subtle);color:var(--text-muted);"></span>';
    var idTag = '<span class="sec-tag" style="background:var(--bg-subtle);color:var(--text-muted);">ID #' + esc(q.id) + '</span>';

    if (part === 'p1') {
      var prompt = item.prompt || (q.prompts && q.prompts[0]) || { keywords: [], keywords_display: '', sample_answer: '' };
      var kws = (prompt.keywords || []).map(function (k) { return '<span class="kw-chip">' + esc(k) + '</span>'; }).join('');
      var qNum = qKey.replace('q', '');
      return (
        '<div class="card exam-question-card">' +
          '<div class="q-head">' +
            '<div class="q-title">' + partIcon('p1') + 'Question ' + qNum + ' <span class="q-part">Part 1 • Photos</span></div>' +
            '<div class="q-ids">' + secTag + idTag + '</div>' +
          '</div>' +
          '<div class="photo-box"><img src="' + esc(p1Image(q)) + '" alt="Bức tranh ' + q.id + '" loading="lazy"></div>' +
          '<div class="directions-box">' +
            '<div class="dir-title">Yêu cầu đề thi ETS</div>' +
            '<div>Viết <b>1 câu</b> miêu tả bức tranh dựa trên <b>2 từ/cụm từ</b> cho trước.</div>' +
          '</div>' +
          '<div class="kw-label">Từ khoá bắt buộc</div>' +
          '<div class="keywords-box">' + kws + '</div>' +
          (isSec ? '<div class="sec-note">Bộ đề SEC ' + (Math.floor((q.sec_id - 1) / 5) + 1) + ' — câu ' + ((q.sec_id - 1) % 5 + 1) + '/5</div>' : '') +
        '</div>'
      );
    }
    if (part === 'p2') {
      var qNum2 = qKey === 'q6' ? '6' : '7';
      var email = q.email || {};
      var body = (email.body || '').replace(/\n/g, '<br>');
      return (
        '<div class="card exam-question-card">' +
          '<div class="q-head">' +
            '<div class="q-title">' + partIcon('p2') + 'Question ' + qNum2 + ' <span class="q-part">Part 2 • Respond to Email</span></div>' +
            '<div class="q-ids">' + secTag + idTag + '</div>' +
          '</div>' +
          '<div class="email-viewer">' +
            '<div class="email-toolbar"><span class="email-toolbar-title">Thư Đến</span></div>' +
            '<div class="email-meta">' +
              '<div class="sender-avatar">' + esc((email.from || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase()) + '</div>' +
              '<div class="email-meta-details">' +
                '<div class="email-sender-line"><span class="sender-name">' + esc(email.from || '') + '</span><span class="email-date">' + esc(email.date || '') + '</span></div>' +
                '<div class="email-recipient">To: <span>' + esc(email.to || '') + '</span></div>' +
                '<div class="email-subject-line">Subject: <span>' + esc(email.subject || '') + '</span></div>' +
              '</div>' +
            '</div>' +
            '<div class="email-body-content">' + body + '</div>' +
          '</div>' +
          '<div class="directions-box">' +
            '<div class="dir-title">Yêu cầu làm bài (Directions)</div>' +
            '<div>' + esc(q.directions || '') + '</div>' +
          '</div>' +
        '</div>'
      );
    }
    // p3 essay
    return (
      '<div class="card exam-question-card">' +
        '<div class="q-head">' +
          '<div class="q-title">' + partIcon('p3') + 'Question 8 <span class="q-part">Part 3 • Opinion Essay</span></div>' +
          '<div class="q-ids">' + idTag + '</div>' +
        '</div>' +
        '<div class="essay-prompt">' + esc(q.prompt || '') + '</div>' +
        (q.prompt_vi ? '<div class="essay-sub">' + esc(q.prompt_vi) + '</div>' : '') +
        '<div class="directions-box">' +
          '<div class="dir-title">Mục tiêu</div>' +
          '<div>Bài luận hiệu quả thường có <b>tối thiểu 300 từ</b>, gồm mở bài – thân bài – kết luận. Trình bày, giải thích và hỗ trợ quan điểm bằng lý do / ví dụ.</div>' +
        '</div>' +
      '</div>'
    );
  }

  // RIGHT card: answer editor + actions (sibling of question card)
  function renderAnswerCard(item, qKey, locked) {
    var part = item.part;
    var placeholder = part === 'p1'
      ? 'Viết 1 câu miêu tả bức tranh (dùng đủ 2 từ khoá)...'
      : part === 'p2'
        ? 'Viết thư trả lời (nên 80–120 từ, đủ yêu cầu trong Directions)...'
        : 'Viết bài luận của bạn tại đây (mục tiêu ≥ 300 từ)...';
    var isSubmit = part === 'p3' && !nextQInBlock();
    var btnLabel = advanceBtnLabel();
    var btnCls = isSubmit ? 'btn btn-accent ft-submit-btn' : 'btn btn-accent ft-next-btn';
    var actionBtn = '<button id="advanceBtn" class="' + btnCls + '" title="' + (isSubmit ? 'Nộp bài và nhận báo cáo (Ctrl + Enter)' : 'Lưu và sang bước tiếp theo (Ctrl + Enter)') + '">' + esc(btnLabel) + '</button>';

    // Nút "câu trước" — chỉ hiện khi đang ở Part 1 (nhiều câu trong 1 khối) và có câu trước
    var showBack = part === 'p1' && !locked && !!prevQInBlock();
    var backBtn = showBack
      ? '<button id="prevQBtn" class="btn btn-outline ft-back-btn" title="Quay lại câu trước (Ctrl + ←)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg> Câu trước</button>'
      : '';

    var label = part === 'p1' ? 'Câu trả lời của bạn' : part === 'p2' ? 'Email trả lời của bạn' : 'Bài luận của bạn';
    return (
      '<div class="card exam-answer-card">' +
        '<div class="answer-editor">' +
          '<div class="answer-label">' + label + (locked ? ' <span class="locked-note">— đã hết giờ & bị khóa</span>' : '') + '</div>' +
          '<textarea id="examAnswerTextarea" placeholder="' + esc(placeholder) + '" spellcheck="true" ' + (locked ? 'disabled' : '') + '></textarea>' +
          '<div class="answer-stats">' +
            '<span class="count-pill"><strong id="ftWordCount">0</strong> từ</span>' +
            '<span class="count-pill"><strong id="ftCharCount">0</strong> ký tự</span>' +
            '<span class="count-pill"><strong id="ftSentenceCount">0</strong> câu</span>' +
          '</div>' +
        '</div>' +
        '<div class="answer-actions">' + backBtn + actionBtn + '</div>' +
      '</div>'
    );
  }

  // ==========================================================================
  // SUBMIT + REPORT
  // ==========================================================================
  function finalizeExam(auto) {
    if (!exam || exam.submitted) return;
    exam.submitted = true;
    stopTimer();
    saveCurrentAnswer();

    var isAi = !!(window.ToeicLlmEvaluator && window.ToeicLlmEvaluator.isEnabled &&
      window.ToeicLlmEvaluator.isEnabled());

    if (window.PartNav) window.PartNav.unlock();
    // Reset beforeunload guard
    leavingGuardActive = false;

    // Determine raw
    var parts = { p1: { qs: [], score: 0 }, p2: { qs: [], score: 0 }, p3: { qs: [], score: 0 } };
    ALL_QS.forEach(function (k) {
      var item = exam.qmap.map[k];
      if (!item) return;
      parts[item.part].qs.push(k);
    });

    showScreen('report');
    // Show loading state, compute asynchronously
    renderReportLoading();

    var results = {};
    computeResults(isAi).then(function (res) {
      var total = res.total;
      results = res;
      renderReport(res);
      if (window.ToeicUi) {
        window.ToeicUi.toast(auto ? 'Hết giờ — bài đã được nộp tự động.' : 'Đã nộp bài. Xem báo cáo bên dưới.', 'success');
      }
    }).catch(function (err) {
      console.error('Grading error', err);
      if (window.ToeicUi) window.ToeicUi.toast('Có lỗi khi chấm điểm. Thử lại.', 'error');
    });
  }

  function renderReportLoading() {
    var raw = document.getElementById('reportRawScore');
    if (raw) {
      raw.innerHTML = '<span class="ai-loading-spinner" style="display:inline-block;width:22px;height:22px;border:3px solid var(--primary-light);border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite;vertical-align:middle;"></span>';
      raw.style.display = 'inline-block';
    }
  }
  // simple spinner keyframes injected once
  (function () {
    var st = document.createElement('style');
    st.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(st);
  })();

  // Grade all answered questions: Q1-5 via P1 evaluator, Q6-7 via P2, Q8 via P3.
  // Auto-uses AI (Gemini) when enabled (shared key), with local fallback on any error.
  async function computeResults(isAi) {
    var p1Scores = [];
    var p1Items = [];
    for (var i = 1; i <= 5; i++) {
      var k = 'q' + i;
      var item = exam.qmap.map[k];
      if (!item) continue;
      var text = exam.answers[k] || '';
      var prompt = item.prompt;
      // P1 LLM reads question.image to send the picture — from fulltest/ that must
      // resolve to ../images/qN.jpg (data stores "images/qN.jpg").
      var llmQ = item.q;
      if (llmQ && llmQ.image && llmQ.image.indexOf('../') !== 0) {
        llmQ = Object.assign({}, llmQ, { image: '../' + llmQ.image });
      }
      var r;
      try {
        if (isAi && text.trim() && window.ToeicLlmEvaluator) {
          try { r = await window.ToeicLlmEvaluator.evaluate(text, prompt, llmQ); }
          catch (e) { r = window.ToeicEvaluator.evaluate(text, prompt, item.q); }
        } else {
          r = window.ToeicEvaluator.evaluate(text, prompt, item.q);
        }
      } catch (e) {
        r = { score: 0, criteria: [], label: 'Lỗi chấm điểm' };
      }
      p1Scores.push(r.score);
      p1Items.push({ key: k, item: item, text: text, r: r });
    }
    var p2Items = [];
    var p2Scores = [];
    var p2Keys = ['q6', 'q7'];
    for (var p2i = 0; p2i < p2Keys.length; p2i++) {
      var k = p2Keys[p2i];
      var item = exam.qmap.map[k];
      if (!item) continue;
      var text = exam.answers[k] || '';
      var r;
      try {
        if (isAi && text.trim() && window.ToeicP2LlmEvaluator) {
          try { r = await window.ToeicP2LlmEvaluator.evaluate(text, item.q); }
          catch (e) { r = window.ToeicP2Evaluator.evaluate(text, item.q); }
        } else {
          r = window.ToeicP2Evaluator.evaluate(text, item.q);
        }
      } catch (e) {
        r = { score: 0, criteria: [], label: 'Lỗi chấm điểm', tasks: [] };
      }
      p2Scores.push(r.score);
      p2Items.push({ key: k, item: item, text: text, r: r });
    }
    var p3Item = exam.qmap.map.q8;
    var p3Text = exam.answers.q8 || '';
    var p3R;
    try {
      if (isAi && p3Text.trim() && window.ToeicP3LlmEvaluator) {
        try { p3R = await window.ToeicP3LlmEvaluator.evaluate(p3Text, p3Item.q); }
        catch (e) { p3R = window.ToeicP3Evaluator.evaluate(p3Text, p3Item.q); }
      } else {
        p3R = window.ToeicP3Evaluator.evaluate(p3Text, p3Item.q);
      }
    } catch (e) {
      p3R = { score: 0, criteria: [], label: 'Lỗi chấm điểm' };
    }

    var p1Total = p1Scores.reduce(function (a, b) { return a + b; }, 0);
    var p2Total = p2Scores.reduce(function (a, b) { return a + b; }, 0);
    var p3Total = p3R.score || 0;
    var total = p1Total + p2Total + p3Total;
    return {
      total: total, p1Total: p1Total, p2Total: p2Total, p3Total: p3Total,
      p1Items: p1Items, p2Items: p2Items, p3Item: p3Item, p3Text: p3Text, p3R: p3R,
      isAi: isAi
    };
  }

  // Approximate unofficial 0-200 mapping (10-pt steps), labeled as estimate.
  // Honest linear scale: raw 0→0, raw 28→200. (Không "phóng" điểm thấp lên cao.)
  function estimate200(raw) {
    raw = Math.max(0, Math.min(28, raw || 0));
    if (raw <= 0) return 0;
    var est = Math.round((raw / 28) * 200 / 10) * 10;
    if (est < 10) est = 10;
    if (est > 200) est = 200;
    return est;
  }

  function levelLabel(raw) {
    // ETS proficiency-ish labels for the band
    if (raw >= 24) return 'Xuất sắc (Level 8–9)';
    if (raw >= 19) return 'Khá giỏi (Level 7)';
    if (raw >= 14) return 'Trung bình khá (Level 5–6)';
    if (raw >= 8) return 'Trung bình (Level 3–4)';
    if (raw >= 1) return 'Còn yếu (Level 1–2)';
    return 'Chưa hoàn thành';
  }

  function renderReport(res) {
    el.reportRawScore.textContent = res.total;
    var est = estimate200(res.total);
    el.reportEst200.textContent = est;
    el.reportP1Score.textContent = res.p1Total;
    el.reportP2Score.textContent = res.p2Total;
    el.reportP3Score.textContent = res.p3Total;
    el.reportDetailP1.innerHTML = '';
    el.reportDetailP2.innerHTML = '';
    el.reportDetailP3.innerHTML = '';

    // Mức trình độ + thanh điểm ngang 0-200 (kiểu báo cáo TOEIC)
    var lvl = document.getElementById('reportLevel');
    if (lvl) lvl.textContent = levelLabel(res.total);
    var pct = Math.max(0, Math.min(100, (est / 200) * 100));
    var fill = document.getElementById('scorebarFill');
    if (fill) fill.style.width = pct + '%';
    // Clamp marker/bubble INSIDE the track so chúng không lòi ra ngoài thanh.
    var clamped = Math.max(1.5, Math.min(98.5, pct));
    var marker = document.getElementById('scorebarMarker');
    if (marker) marker.style.left = clamped + '%';
    var bubble = document.getElementById('scorebarBubble');
    if (bubble) {
      bubble.style.left = clamped + '%';
      bubble.textContent = est;
    }

    // descriptions — ghi rõ cách chấm: AI hỗ trợ hay quy tắc cục bộ (hard)
    var gradeBadge = document.getElementById('reportGradeBadge');
    var gradeText = res.isAi
      ? 'AI hỗ trợ chấm chi tiết (Gemini) — câu trống = 0 điểm'
      : 'Chấm bằng quy tắc cục bộ chuẩn ETS (không dùng AI)';
    if (gradeBadge) {
      gradeBadge.innerHTML = res.isAi
        ? 'Cách chấm: <b>AI hỗ trợ (Gemini) chấm chi tiết</b> · câu trống = 0'
        : 'Cách chấm: <b>quy tắc cục bộ chuẩn ETS</b> (AI đang tắt)';
      gradeBadge.className = 'rh-grade' + (res.isAi ? ' ai' : ' hard');
    }
    var d1 = document.getElementById('reportP1Desc');
    var d2 = document.getElementById('reportP2Desc');
    var d3 = document.getElementById('reportP3Desc');
    if (d1) d1.innerHTML = res.isAi ? 'Đã chấm bằng AI hỗ trợ (Gemini)' : 'Đã chấm bằng quy tắc cục bộ (hard)';
    if (d2) d2.innerHTML = res.isAi ? 'Đã chấm bằng AI hỗ trợ (Gemini)' : 'Đã chấm bằng quy tắc cục bộ (hard)';
    if (d3) d3.innerHTML = res.isAi ? 'Đã chấm bằng AI hỗ trợ (Gemini)' : 'Đã chấm bằng quy tắc cục bộ (hard)';
    void gradeText;

    // P1 detail
    if (res.p1Items.length) {
      var h1 = res.p1Items.map(function (it) {
        return reportP1ItemHtml(it);
      }).join('');
      el.reportDetailP1.innerHTML = '<h3 style="margin-bottom:0.6rem;">Part 1 — chi tiết từng câu</h3>' + h1;
    }
    if (res.p2Items.length) {
      var h2 = res.p2Items.map(function (it) {
        return reportP2ItemHtml(it);
      }).join('');
      el.reportDetailP2.innerHTML = '<h3 style="margin-bottom:0.6rem;">Part 2 — chi tiết từng câu</h3>' + h2;
    }
    if (res.p3Item) {
      el.reportDetailP3.innerHTML = '<h3 style="margin-bottom:0.6rem;">Part 3 — chi tiết</h3>' + reportP3ItemHtml(res);
    }
    // Wire toggles
    document.querySelectorAll('.prc-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var part = btn.getAttribute('data-part-detail');
        var d = document.getElementById('reportDetail' + part.toUpperCase());
        if (d) {
          var isOpen = d.classList.contains('open');
          d.classList.toggle('open', !isOpen);
          btn.textContent = isOpen ? 'Xem chi tiết từng câu' : 'Ẩn chi tiết';
        }
      });
    });
    // Wire report actions
    wireReportActions(res);
  }

  function reportQuestionHeader(icon, qTitle, idHtml, scoreR, labelText) {
    var cls = 'score-badge score-' + scoreR;
    return '<div class="rd-item-head">' +
      '<span class="rd-title">' + icon + ' ' + qTitle + ' ' + idHtml + '</span>' +
      '<span class="' + cls + '">' + (labelText || 'Điểm ' + scoreR) + '</span>' +
      '</div>';
  }

  function feedbackList(criteria) {
    if (!criteria || !criteria.length) return '';
    var items = criteria.map(function (c) {
      var ok = !!c.passed;
      return '<li><span class="fb-ico ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓' : '✗') + '</span><div><b>' + esc(c.name || '') + ':</b> ' + esc(c.detail || '') + '</div></li>';
    }).join('');
    return '<ul class="feedback-list">' + items + '</ul>';
  }

  function reportP1ItemHtml(it) {
    var q = it.item.q;
    var prompt = it.item.prompt || {};
    var isSec = q.set === 'sec';
    var secHtml = isSec ? '<span class="sec-tag" style="background:var(--accent-light);color:#b45309;font-size:0.68rem;font-weight:800;padding:0.12rem 0.45rem;border-radius:9999px;">SEC #' + (q.sec_id != null ? q.sec_id : '') + '</span> ' : '';
    var html = '<div class="rd-item">';
    html += '<div class="rd-item-head"><span class="rd-title">' + secHtml + 'Câu ' + it.key.replace('q', '') + ' • ID #' + esc(q.id) + '</span>' +
      '<span class="score-badge score-' + (it.r.score || 0) + '">' + (it.r.isAi ? '<span class="ai-badge">AI</span>' : '') + esc(it.r.label || ('Điểm ' + it.r.score + '/3')) + '</span></div>';
    html += '<div class="rd-question-block"><img src="' + esc(p1Image(q)) + '" alt="Q' + esc(q.id) + '"></div>';
    html += '<div style="margin-bottom:0.5rem;font-size:0.84rem;color:var(--text-muted);"><b>Từ khoá:</b> ' + esc(prompt.keywords_display || (prompt.keywords || []).join(' / ')) + '</div>';
    html += '<div class="rd-user-answer"><span class="ua-label">Câu của bạn</span>' + (it.text.trim() ? esc(it.text) : '<em style="color:var(--danger);">(Chưa trả lời — 0 điểm)</em>') + '</div>';
    html += feedbackList(it.r.criteria);
    if (it.r.sampleAnswer || (prompt && prompt.sample_answer)) {
      html += '<div class="sample-box"><div class="sb-label">Câu mẫu chuẩn điểm 3</div>' + esc(it.r.sampleAnswer || prompt.sample_answer) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function reportP2ItemHtml(it) {
    var q = it.item.q;
    var email = q.email || {};
    var qNum = it.key === 'q6' ? '6' : '7';
    var isSec = q.set === 'sec';
    var secHtml = isSec ? '<span class="sec-tag" style="background:var(--accent-light);color:#b45309;font-size:0.68rem;font-weight:800;padding:0.12rem 0.45rem;border-radius:9999px;">SEC #' + (q.sec_id != null ? q.sec_id : '') + '</span> ' : '';
    var r = it.r;
    var html = '<div class="rd-item">';
    html += '<div class="rd-item-head"><span class="rd-title">' + secHtml + 'Question ' + qNum + ' • ID #' + esc(q.id) + '</span>' +
      '<span class="score-badge score-' + (r.score || 0) + '">' + (r.isAi ? '<span class="ai-badge">AI</span>' : '') + esc(r.label || ('Điểm ' + r.score + '/4')) + '</span></div>';
    html += '<div style="font-size:0.84rem;border:1px solid var(--border-color);padding:0.5rem;border-radius:var(--radius-md);margin-bottom:0.5rem;background:var(--bg-card);">' +
      '<div><b>From:</b> ' + esc(email.from) + '</div><div><b>To:</b> ' + esc(email.to) + '</div><div><b>Subject:</b> ' + esc(email.subject) + '</div></div>';
    html += '<div class="rd-user-answer"><span class="ua-label">Email của bạn</span>' + (it.text.trim() ? esc(it.text) : '<em style="color:var(--danger);">(Chưa trả lời — 0 điểm)</em>') + '</div>';
    // task badges
    if (r.tasks && r.tasks.length) {
      var t = r.tasks.map(function (tk) {
        return '<span class="sec-tag" style="' + (tk.completed ? 'background:var(--success-light);color:#047857;' : 'background:var(--danger-light);color:var(--danger);') + '">' + (tk.completed ? '✓' : '✗') + ' ' + esc(tk.type || '') + '</span>';
      }).join(' ');
      html += '<div style="margin-bottom:0.5rem;display:flex;gap:0.3rem;flex-wrap:wrap;">' + t + '</div>';
    }
    html += feedbackList(r.criteria);
    if (r.sampleAnswer) {
      html += '<div class="sample-box"><div class="sb-label">Email mẫu chuẩn</div>' + esc(r.sampleAnswer) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function reportP3ItemHtml(res) {
    var q = res.p3Item.q;
    var r = res.p3R;
    var html = '<div class="rd-item">';
    html += '<div class="rd-item-head"><span class="rd-title">Question 8 • ID #' + esc(q.id) + '</span>' +
      '<span class="score-badge score-' + (r.score || 0) + '">' + (r.isAi ? '<span class="ai-badge">AI</span>' : '') + esc(r.label || ('Điểm ' + r.score + '/5')) + '</span></div>';
    html += '<div class="essay-prompt" style="font-size:0.95rem;margin-bottom:0.5rem;">' + esc(q.prompt) + '</div>';
    html += '<div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.5rem;">' + (r.wordCount != null ? r.wordCount : countWords(res.p3Text)) + ' từ • ' + (r.sentenceCount != null ? r.sentenceCount : 0) + ' câu' + (r.transitionCount != null ? ' • ' + r.transitionCount + ' từ nối' : '') + '</div>';
    html += '<div class="rd-user-answer"><span class="ua-label">Bài luận của bạn</span>' + (res.p3Text.trim() ? esc(res.p3Text) : '<em style="color:var(--danger);">(Chưa trả lời — 0 điểm)</em>') + '</div>';
    html += feedbackList(r.criteria);
    if (r.sampleAnswer) {
      html += '<div class="sample-box"><div class="sb-label">Bài mẫu chuẩn</div>' + esc(r.sampleAnswer) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function wireReportActions(res) {
    if (el.reportRetakeBtn) {
      el.reportRetakeBtn.onclick = function () {
        // re-run same selection
        var qmap = buildExamQuestions();
        // copy answers that still map? For retake we want fresh — reset exam and restart
        startExam();
      };
    }
    if (el.reportNewBtn) {
      el.reportNewBtn.onclick = function () {
        var i1 = randomPick(P1_TESTS.length);
        var i2 = randomPick(P2_TESTS.length);
        var i3 = randomPick(P3_TESTS.length);
        setSelection('p1', i1); setSelection('p2', i2); setSelection('p3', i3);
        startExam();
      };
    }
    if (el.reportSetupBtn) {
      el.reportSetupBtn.onclick = function () {
        showScreen('setup');
        renderSetupRandomLabels();
      };
    }
  }

  function renderSetupRandomLabels() {
    if (el.p1RandLabel) el.p1RandLabel.textContent = '';
    if (el.p2RandLabel) el.p2RandLabel.textContent = '';
    if (el.p3RandLabel) el.p3RandLabel.textContent = '';
  }

  // ==========================================================================
  // LEAVE GUARD (beforeunload while exam running)
  // ==========================================================================
  var leavingGuardActive = false;
  function setLeavingGuard(active) {
    leavingGuardActive = active;
  }
  window.addEventListener('beforeunload', function (e) {
    if (leavingGuardActive) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  });

  // ==========================================================================
  // INIT
  // ==========================================================================
  function init() {
    cacheEls();
    initTheme();
    initModals();
    wireAiConfig();
    if (el.themeToggleBtn) el.themeToggleBtn.addEventListener('click', toggleTheme);

    // Handle keyboard shortcuts (giống các trang part):
    // - Ctrl/Alt + ArrowLeft  → câu trước (trong khối)
    // - Ctrl/Alt + ArrowRight → câu kế tiếp (trong khối)
    // - Ctrl + Enter → "nộp câu hiện tại" (sang bước kế tiếp / nộp phần khi ở cuối khối)
    document.addEventListener('keydown', function (e) {
      if (!(exam && !exam.submitted && el.examScreen.classList.contains('active'))) return;
      var mod = (e.ctrlKey || e.metaKey || e.altKey);
      if (mod && e.key === 'ArrowLeft') {
        e.preventDefault();
        var p = prevQInBlock();
        if (p) {
          saveCurrentAnswer();
          exam.activeQ = p;
          renderQuestion(p);
          renderProgressDots();
        }
        return;
      }
      if (mod && e.key === 'ArrowRight') {
        e.preventDefault();
        var n = nextQInBlock();
        if (n) {
          saveCurrentAnswer();
          exam.activeQ = n;
          renderQuestion(n);
          renderProgressDots();
        } else {
          advanceBlock();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        advanceBlock();
      }
    });

    buildSetupSelects();
    wireSetup();
    updateStartState();
    showScreen('setup');
    // If CustomSelect has already run, refresh; else it auto-runs.
    if (window.CustomSelect && window.CustomSelect.init) {
      // Enhancement happens on DOMContentLoaded via custom_select auto-init;
      // re-init now to pick up options just added.
      window.CustomSelect.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
