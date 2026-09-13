/**
 * TOEIC Writing Part 3 — Opinion Essay (Q8) Gemini LLM Evaluator
 * ---------------------------------------------------------------------------
 * Interfaces with Google Gemini to give an authoritative 0–5 essay score based
 * on the official ETS band descriptors (ETS/IIBC). Shares the same localStorage
 * Gemini keys as Part 1 & Part 2 (gemini_api_key / gemini_model / gemini_ai_enabled).
 */
(function (window) {
  'use strict';

  const STORAGE_KEY_API = 'gemini_api_key';
  const STORAGE_KEY_MODEL = 'gemini_model';
  const STORAGE_KEY_ENABLED = 'gemini_ai_enabled';
  const DEFAULT_MODEL = 'gemini-flash-lite-latest';
  const FALLBACK_MODELS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];

  // System default key (character-code obfuscated to prevent automated crawler exposure)
  const _SYS_K = [65, 81, 46, 65, 98, 56, 82, 78, 54, 76, 89, 87, 89, 45, 73, 122, 95, 83, 53, 53, 70, 105, 56, 56, 68, 104, 55, 57, 55, 88, 121, 72, 86, 101, 120, 122, 120, 79, 106, 86, 116, 48, 118, 84, 79, 78, 77, 75, 74, 85, 80, 80, 65];

  function getSystemKey() {
    return String.fromCharCode.apply(null, _SYS_K);
  }

  function getUserKey() {
    return localStorage.getItem(STORAGE_KEY_API) || '';
  }

  function getApiKey() {
    const userKey = getUserKey().trim();
    return userKey || getSystemKey();
  }

  function isUsingSystemKey() {
    return !getUserKey().trim();
  }

  // --- Key verification -----------------------------------------------------
  // AI may only be turned ON for a key that Google has actually accepted. We
  // remember the exact key string that last passed a live check, so a typo'd or
  // revoked key can never inherit an earlier approval — and can never silently
  // "enable" AI only to fail later at grading time.
  const STORAGE_KEY_VERIFIED = 'gemini_key_verified';

  function getVerifiedKey() {
    return localStorage.getItem(STORAGE_KEY_VERIFIED) || '';
  }

  function markKeyVerified(key) {
    localStorage.setItem(STORAGE_KEY_VERIFIED, (key || '').trim());
  }

  function clearKeyVerified() {
    localStorage.removeItem(STORAGE_KEY_VERIFIED);
  }

  function getEffectiveKey() {
    return getUserKey().trim() || getSystemKey();
  }

  function isUsingVerifiedKey() {
    return getEffectiveKey() === getVerifiedKey();
  }

  function hasApiKey() {
    return isUsingVerifiedKey();
  }

  function setApiKey(key) {
    const k = (key || '').trim();
    localStorage.setItem(STORAGE_KEY_API, k);
    if (k !== getVerifiedKey()) clearKeyVerified();
    if (!isUsingVerifiedKey()) setEnabled(false);
  }

  function clearApiKey() {
    localStorage.removeItem(STORAGE_KEY_API);
    clearKeyVerified();
    if (!isUsingVerifiedKey()) setEnabled(false);
  }

  function getModel() {
    return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
  }

  function setModel(model) {
    localStorage.setItem(STORAGE_KEY_MODEL, model || DEFAULT_MODEL);
  }

  function isEnabled() {
    const val = localStorage.getItem(STORAGE_KEY_ENABLED);
    const wanted = val === null ? true : val === 'true'; // Default preference is ON
    // Never report ON unless the current key has been proven to work.
    return wanted && isUsingVerifiedKey();
  }

  function setEnabled(enabled) {
    localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
  }

  // Verifies the current key with a live round-trip and only then enables AI.
  // Returns { ok, usingSystemKey, error?, warning? } instead of throwing, so every
  // UI can show a clear message and leave the toggle OFF when the key is bad.
  async function activate() {
    const key = getEffectiveKey();
    const model = getModel();
    const usingSystemKey = isUsingSystemKey();

    if (isUsingVerifiedKey()) {
      setEnabled(true);
      return { ok: true, cached: true, usingSystemKey };
    }

    try {
      await testConnection(key, model);
      markKeyVerified(key);
      setEnabled(true);
      return { ok: true, usingSystemKey };
    } catch (err) {
      const msg = (err && err.message) ? err.message : String(err);
      if (msg.includes('QUOTA_EXCEEDED')) {
        markKeyVerified(key);
        setEnabled(true);
        return { ok: true, warning: msg, usingSystemKey };
      }
      clearKeyVerified();
      setEnabled(false);
      return { ok: false, error: msg, usingSystemKey };
    }
  }

  const SCORE_LABELS = {
    5: 'Xuất Sắc',
    4: 'Tốt',
    3: 'Khá',
    2: 'Cần Cải Thiện',
    1: 'Yếu',
    0: 'Chưa Đạt'
  };

  const SCORE_COLORS = {
    5: '#10b981',
    4: '#22c55e',
    3: '#eab308',
    2: '#f59e0b',
    1: '#ef4444',
    0: '#94a3b8'
  };

  async function testConnection(apiKey, model) {
    const key = apiKey || getApiKey();
    const testModel = model || getModel();
    if (!key) {
      throw new Error('Chưa có Gemini API Key!');
    }
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] })
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `Lỗi kết nối Gemini API (HTTP ${response.status})`;
      if (response.status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
        throw new Error('QUOTA_EXCEEDED: Key này đã đạt giới hạn lượt gọi (Quota/Rate limit).');
      }
      throw new Error(msg);
    }
    return true;
  }

  async function callGeminiApi(prompt, systemInstruction, apiKey, model, retryCount = 0) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const requestBody = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.2
      }
    };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        if ((response.status === 503 || response.status === 404) && retryCount < FALLBACK_MODELS.length) {
          console.warn(`Model ${model} failed with ${response.status}. Trying fallback...`);
          return callGeminiApi(prompt, systemInstruction, apiKey, FALLBACK_MODELS[retryCount], retryCount + 1);
        }
        const errorText = await response.text();
        if (response.status === 429 || errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('quota')) {
          if (isUsingSystemKey()) {
            throw new Error('QUOTA_EXCEEDED: Key AI hệ thống miễn phí đã đạt giới hạn hôm nay. Vui lòng nhập Gemini API Key cá nhân của bạn (hoàn toàn miễn phí tại Google AI Studio) để tiếp tục chấm không giới hạn!');
          } else {
            throw new Error('QUOTA_EXCEEDED: Gemini API Key cá nhân của bạn đã đạt giới hạn tạm thời (Rate Limit/Quota). Vui lòng thử lại sau giây lát.');
          }
        }
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No evaluation generated by the AI.');
      }
      const responseText = data.candidates[0].content.parts[0].text;
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  async function evaluate(userEssay, question) {
    if (!isEnabled()) {
      throw new Error('AI Evaluation is not enabled or API key is missing.');
    }
    const apiKey = getApiKey();
    const model = getModel();

    const systemInstruction = `You are a certified ETS / SEC TOEIC Writing Senior Examiner for Part 3 (Question 8: "Write an Opinion Essay").
Score the student's essay strictly on the official 0–5 scale based on the SEC TIÊU CHÍ CHẤM ĐIỂM (WRITING) Part 3 rubric below.

=========================================================
THE OFFICIAL ETS SCORING CRITERIA (verbatim from the ETS Examinee Handbook)
=========================================================
For Question 8 the ETS directions state that a response is scored on:
  • whether your opinion is supported with reasons and/or examples
  • grammar
  • vocabulary
  • organization
These are the ONLY official criteria. Assess ALL FOUR explicitly.
Scoring is HOLISTIC band placement (0-5), not sentence-by-sentence deduction.

CRITICAL ETS RULE — UNSUPPORTED OPINION:
An opinion that is merely stated, or that lists reasons without any concrete example
or explanation, cannot reach the upper bands. The rubric rewards a position statement
plus at least two distinct supporting reasons/explanations, developed with specific
detail — and, at the top band, explicit examples.
A response that is one undifferentiated block of prose with no visible paragraph
structure is capped below the top band even if the English is flawless.

OFFICIAL SEC RUBRIC GUIDELINES (0–5 SCALE):
- ĐIỂM 5 (Bài viết rất xuất sắc):
  • Trả lời đúng và đầy đủ yêu cầu đề bài; nêu rõ quan điểm và bảo vệ bằng lý do + ví dụ cụ thể.
  • Tổ chức bài mạch lạc (mở bài – thân bài – kết luận), phát triển ý sâu với ví dụ rõ ràng.
  • Liên kết chặt chẽ, trôi chảy, dùng đa dạng từ nối.
  • Dùng từ và ngữ pháp đa dạng, tự nhiên, chỉ có lỗi nhỏ không ảnh hưởng ý nghĩa (thường ≥ 300 từ).
- ĐIỂM 4 (Bài viết tốt nhưng chưa phát triển hết các ý):
  • Trả lời đúng, có bố cục rõ ràng, sử dụng ví dụ hợp lý.
  • Có thể lặp ý, lạc đề nhẹ hoặc kết nối ý chưa mượt.
  • Từ vựng và ngữ pháp khá tốt, có lỗi nhỏ không ảnh hưởng ý nghĩa.
- ĐIỂM 3 (Bài viết đáp ứng một phần yêu cầu):
  • Phát triển ý còn sơ sài; lý do chưa được hỗ trợ đầy đủ.
  • Có sự mạch lạc nhất định, nhưng liên kết giữa các ý có thể không rõ ràng.
  • Ngữ pháp và từ vựng còn hạn chế, đôi khi gây khó hiểu.
- ĐIỂM 2 (Bài viết có nhiều điểm yếu):
  • Ý chưa rõ ràng, thiếu phát triển; ví dụ/giải thích không đủ hoặc không phù hợp.
  • Tổ chức bài kém.
  • Dùng từ sai, ngữ pháp lỗi nhiều gây ảnh hưởng đến hiểu bài.
- ĐIỂM 1 (Bài viết gần như không đạt):
  • Không có bố cục rõ ràng, ý lan man hoặc không liên quan đề.
  • Lỗi sai nghiêm trọng và lặp lại nhiều về từ vựng và ngữ pháp.
- ĐIỂM 0 (Không tính điểm):
  • Bài viết sao chép đề, lạc đề, không viết bằng tiếng Anh, chỉ gõ linh tinh hoặc bỏ trống.

=========================================================
EVALUATION INSTRUCTIONS
=========================================================
1. Locate the position statement and say whether it is clear and on-topic.
2. Count the distinct supporting reasons and, for each, whether it has a concrete
   example or explanation attached. Report this in "support_analysis".
3. Assess grammar and vocabulary range explicitly, listing concrete errors with corrections.
4. Assess organization: are introduction / body / conclusion visible, and are transitions smooth?
5. Apply the caps, then place the essay in a band. Be strict.
6. Output valid JSON only.

Output strictly valid JSON (no markdown fences):
{
  "score": 0 or 1 or 2 or 3 or 4 or 5,
  "position_passed": true/false,
  "position_comment": "Bằng tiếng Việt: luận điểm rõ chưa, đúng trọng tâm đề chưa theo chuẩn SEC",
  "support_analysis": [
    {"reason": "lý do 1 của học viên", "has_example": true/false, "note": "ví dụ/giải thích đi kèm là gì"}
  ],
  "support_comment": "Bằng tiếng Việt: có bao nhiêu lý do riêng biệt và mỗi lý do có ví dụ/giải thích cụ thể chưa (tiêu chí ETS: opinion supported with reasons and/or examples)",
  "organization_passed": true/false,
  "organization_comment": "Bằng tiếng Việt: bố cục, đoạn văn, mạch lạc, từ nối theo chuẩn SEC",
  "vocabulary_comment": "Bằng tiếng Việt: vốn từ, độ chính xác, paraphrase theo chuẩn SEC",
  "grammar_errors": ["lỗi 1 kèm cách sửa", "lỗi 2 kèm cách sửa"],
  "examiner_comment": "Nhận xét tổng thể bằng tiếng Việt, giải thích vì sao đạt điểm đó theo tiêu chí SEC",
  "native_upgrade": "Bài viết lại tối ưu chuẩn điểm 5 (native quality, độ dài 300+ từ)",
  "criteria": [
    {"name": "Opinion supported with reasons/examples (Quan điểm + lý do & ví dụ)", "passed": true/false, "detail": "..."},
    {"name": "Organization (Bố cục mạch lạc)", "passed": true/false, "detail": "..."},
    {"name": "Vocabulary (Vốn từ đa dạng & chính xác)", "passed": true/false, "detail": "..."},
    {"name": "Grammar (Ngữ pháp & cấu trúc câu)", "passed": true/false, "detail": "..."}
  ],
  "feedback_items": [{"type": "pass/fail/warning", "text": "..."}]
}`;

    const prompt = `Evaluate the following TOEIC Writing Part 3 opinion essay (Question 8).

### Topic / Prompt:
${question?.prompt || ''}

### Category:
${question?.category_vi || ''}

### Student's Essay:
${userEssay}

STEP 1 — State the essay's position and whether it is on-topic.
STEP 2 — List each distinct supporting reason and whether it carries a concrete
example or explanation ("support_analysis"). ETS rewards opinions supported with
reasons AND/OR examples, so an unsupported or example-free essay cannot reach the top bands.
STEP 3 — Assess organization, vocabulary and grammar separately, with concrete errors.
STEP 4 — Place the essay in the 0-5 band and justify it against the official criteria.

Return the evaluation in the required JSON format.`;

    try {
      const aiResult = await callGeminiApi(prompt, systemInstruction, apiKey, model);

      let score = typeof aiResult.score === 'number' ? Math.max(0, Math.min(5, Math.round(aiResult.score))) : 0;

      // Offline guard for the official ETS axis "opinion supported with reasons
      // and/or examples": an essay whose reasons carry no concrete example or
      // explanation cannot sit in the top band (5). Two or more unsupported reasons
      // caps it at 3. Guards against an over-generous model.
      const guardSupport = Array.isArray(aiResult.support_analysis) ? aiResult.support_analysis : [];
      const guardUnsupported = guardSupport.filter(s => s && s.has_example === false).length;
      if (guardSupport.length > 0) {
        if (guardUnsupported >= 2) score = Math.min(score, 3);
        else if (guardUnsupported === 1) score = Math.min(score, 4);
      }
      if (aiResult.position_passed === false) score = Math.min(score, 3);

      const label = SCORE_LABELS[score] || 'Chưa Đạt';
      const badge = `Score ${score}/5 - ${label}`;
      const scoreColor = SCORE_COLORS[score] || '#94a3b8';
      const scoreClass = `score-${score}`;

      // The model sometimes returns grammar_errors as objects instead of strings —
      // flatten them so the UI never prints "[object Object]". Declared here because
      // both the criteria list below and the feedback messages use it.
      const grammarErrors = (Array.isArray(aiResult.grammar_errors) ? aiResult.grammar_errors : [])
        .map(e => {
          if (e && typeof e === 'object') {
            const err = e.error || e.issue || e.original || e.text || '';
            const fix = e.correction || e.fix || e.suggestion || '';
            return fix ? `"${err}" → "${fix}"` : `"${err}"`;
          }
          return String(e || '');
        })
        .filter(Boolean);

      const aiCriteria = Array.isArray(aiResult.criteria) && aiResult.criteria.length >= 4
        ? aiResult.criteria
        : [
            { name: 'Opinion supported with reasons/examples', passed: !!aiResult.position_passed, detail: aiResult.position_comment || '' },
            { name: 'Organization', passed: !!aiResult.organization_passed, detail: aiResult.organization_comment || '' },
            { name: 'Vocabulary', passed: score >= 3, detail: aiResult.vocabulary_comment || '' },
            { name: 'Grammar', passed: score >= 3, detail: grammarErrors.length ? grammarErrors.join(' | ') : 'Ít lỗi, dùng câu đa dạng' }
          ];

      const messages = [];
      if (aiResult.position_comment) messages.push({ type: aiResult.position_passed ? 'success' : 'warning', text: `Quan điểm: ${aiResult.position_comment}` });

      // Support analysis — does each reason carry a concrete example/explanation?
      const supportList = Array.isArray(aiResult.support_analysis) ? aiResult.support_analysis : [];
      const unsupportedReasons = supportList.filter(s => s && s.has_example === false);
      if (aiResult.support_comment) {
        messages.push({
          type: unsupportedReasons.length > 0 ? 'warning' : 'success',
          text: `Lý do & ví dụ: ${aiResult.support_comment}`
        });
      }
      if (supportList.length > 0) {
        messages.push({
          type: unsupportedReasons.length > 0 ? 'warning' : 'info',
          text: `Đã triển khai ${supportList.length} lý do` +
            (unsupportedReasons.length > 0
              ? `, trong đó ${unsupportedReasons.length} lý do CHƯA có ví dụ/giải thích cụ thể (tiêu chí ETS yêu cầu "opinion supported with reasons and/or examples").`
              : ', mỗi lý do đều có ví dụ/giải thích cụ thể.')
        });
      }

      if (aiResult.organization_comment) messages.push({ type: aiResult.organization_passed ? 'success' : 'warning', text: `Bố cục: ${aiResult.organization_comment}` });
      if (aiResult.vocabulary_comment) messages.push({ type: 'info', text: `Từ vựng: ${aiResult.vocabulary_comment}` });
      if (grammarErrors.length) {
        messages.push({ type: 'warning', text: `Lỗi ngữ pháp: ${grammarErrors.join(' | ')}` });
      }
      if (aiResult.examiner_comment) messages.push({ type: 'info', text: `Giám khảo nhận xét: ${aiResult.examiner_comment}` });

      const feedbackItems = Array.isArray(aiResult.feedback_items) && aiResult.feedback_items.length
        ? aiResult.feedback_items
        : messages.map(m => ({ type: m.type === 'success' ? 'pass' : 'fail', text: m.text }));

      return {
        score,
        badge,
        label,
        scoreColor,
        scoreClass,
        isAi: true,
        criteria: aiCriteria,
        messages,
        feedback: feedbackItems,
        sampleAnswer: question?.sample_answer || '',
        reasoning: aiResult.examiner_comment || '',
        nativeUpgrade: aiResult.native_upgrade || '',
        improved: aiResult.native_upgrade || ''
      };
    } catch (error) {
      console.error('LLM Evaluation failed:', error);
      if (error.message && error.message.includes('QUOTA_EXCEEDED')) {
        throw error;
      }
      throw new Error('Failed to evaluate essay: ' + error.message);
    }
  }

  window.ToeicP3LlmEvaluator = {
    getApiKey,
    getUserKey,
    getSystemKey,
    isUsingSystemKey,
    setApiKey,
    clearApiKey,
    hasApiKey,
    getEffectiveKey,
    isUsingVerifiedKey,
    activate,
    getModel,
    setModel,
    isEnabled,
    setEnabled,
    testConnection,
    evaluate
  };
})(typeof window !== 'undefined' ? window : this);
