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

  function setApiKey(key) {
    localStorage.setItem(STORAGE_KEY_API, (key || '').trim());
  }

  function clearApiKey() {
    localStorage.removeItem(STORAGE_KEY_API);
  }

  function hasApiKey() {
    return true; // Always has default system key available
  }

  function getModel() {
    return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
  }

  function setModel(model) {
    localStorage.setItem(STORAGE_KEY_MODEL, model || DEFAULT_MODEL);
  }

  function isEnabled() {
    const val = localStorage.getItem(STORAGE_KEY_ENABLED);
    return val === null ? true : val === 'true'; // Default is ON
  }

  function setEnabled(enabled) {
    localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
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

    const systemInstruction = `You are a certified ETS / SEC TOEIC Writing Senior Examiner for Part 3 (Question 8: "Write an opinion essay").
Score the student's essay strictly on the official 0–5 scale based on the SEC TIÊU CHÍ CHẤM ĐIỂM (WRITING) Part 3 rubric below.

OFFICIAL SEC RUBRIC GUIDELINES (0–5 SCALE):
- ĐIỂM 5 (Bài viết rất xuất sắc):
  • Trả lời đúng và đầy đủ yêu cầu đề bài.
  • Tổ chức bài mạch lạc, phát triển ý sâu với ví dụ rõ ràng.
  • Liên kết chặt chẽ, trôi chảy.
  • Dùng từ và ngữ pháp đa dạng, tự nhiên, chỉ có lỗi nhỏ không ảnh hưởng ý nghĩa (thường ≥ 300 từ).
- ĐIỂM 4 (Bài viết tốt nhưng chưa phát triển hết các ý):
  • Trả lời đúng, có bố cục rõ ràng, sử dụng ví dụ hợp lý.
  • Có thể lặp ý, lạc đề nhẹ hoặc kết nối ý chưa mượt.
  • Từ vựng và ngữ pháp khá tốt, có lỗi nhỏ không ảnh hưởng ý nghĩa.
- ĐIỂM 3 (Bài viết đáp ứng một phần yêu cầu):
  • Phát triển ý còn sơ sài.
  • Có sự mạch lạc nhất định, nhưng liên kết giữa các ý có thể không rõ ràng.
  • Ngữ pháp và từ vựng còn hạn chế, đôi khi gây khó hiểu.
- ĐIỂM 2 (Bài viết có nhiều điểm yếu):
  • Ý chưa rõ ràng, thiếu phát triển.
  • Tổ chức bài kém, ví dụ/giải thích không đủ hoặc không phù hợp.
  • Dùng từ sai, ngữ pháp lỗi nhiều gây ảnh hưởng đến hiểu bài.
- ĐIỂM 1 (Bài viết gần như không đạt):
  • Không có bố cục rõ ràng, ý lan man hoặc không liên quan đề.
  • Lỗi sai nghiêm trọng và lặp lại nhiều về từ vựng và ngữ pháp.
- ĐIỂM 0 (Không tính điểm):
  • Bài viết sao chép đề, lạc đề, không viết bằng tiếng Anh, chỉ gõ linh tinh hoặc bỏ trống.

Output strictly valid JSON (no markdown fences):
{
  "score": 0 or 1 or 2 or 3 or 4 or 5,
  "position_passed": true/false,
  "position_comment": "Bằng tiếng Việt: luận điểm rõ chưa, đúng trọng tâm đề chưa theo chuẩn SEC",
  "organization_passed": true/false,
  "organization_comment": "Bằng tiếng Việt: bố cục, đoạn văn, mạch lạc, từ nối theo chuẩn SEC",
  "vocabulary_comment": "Bằng tiếng Việt: vốn từ, độ chính xác, paraphrase theo chuẩn SEC",
  "grammar_errors": ["lỗi 1 kèm cách sửa", "lỗi 2 kèm cách sửa"],
  "examiner_comment": "Nhận xét tổng thể bằng tiếng Việt, giải thích vì sao đạt điểm đó theo tiêu chí SEC",
  "native_upgrade": "Bài viết lại tối ưu chuẩn điểm 5 (native quality, độ dài 300+ từ)",
  "criteria": [
    {"name": "Trả lời đúng & Đầy đủ yêu cầu đề", "passed": true/false, "detail": "..."},
    {"name": "Bố cục mạch lạc & Phát triển ý với ví dụ", "passed": true/false, "detail": "..."},
    {"name": "Vốn từ vựng đa dạng & Chính xác", "passed": true/false, "detail": "..."},
    {"name": "Ngữ pháp & Cấu trúc câu tự nhiên", "passed": true/false, "detail": "..."}
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

Return the evaluation in the required JSON format.`;

    try {
      const aiResult = await callGeminiApi(prompt, systemInstruction, apiKey, model);

      let score = typeof aiResult.score === 'number' ? Math.max(0, Math.min(5, Math.round(aiResult.score))) : 0;
      const label = SCORE_LABELS[score] || 'Chưa Đạt';
      const badge = `Score ${score}/5 - ${label}`;
      const scoreColor = SCORE_COLORS[score] || '#94a3b8';
      const scoreClass = `score-${score}`;

      const aiCriteria = Array.isArray(aiResult.criteria) && aiResult.criteria.length >= 4
        ? aiResult.criteria
        : [
            { name: 'Nêu rõ & bảo vệ quan điểm', passed: !!aiResult.position_passed, detail: aiResult.position_comment || '' },
            { name: 'Phát triển ý & bố cục', passed: !!aiResult.organization_passed, detail: aiResult.organization_comment || '' },
            { name: 'Vốn từ', passed: score >= 3, detail: aiResult.vocabulary_comment || '' },
            { name: 'Ngữ pháp & Cấu trúc câu', passed: score >= 3, detail: Array.isArray(aiResult.grammar_errors) && aiResult.grammar_errors.length ? aiResult.grammar_errors.join(' | ') : 'Ít lỗi, dùng câu đa dạng' }
          ];

      const messages = [];
      if (aiResult.position_comment) messages.push({ type: aiResult.position_passed ? 'success' : 'warning', text: `Quan điểm: ${aiResult.position_comment}` });
      if (aiResult.organization_comment) messages.push({ type: aiResult.organization_passed ? 'success' : 'warning', text: `Bố cục: ${aiResult.organization_comment}` });
      if (aiResult.vocabulary_comment) messages.push({ type: 'info', text: `Từ vựng: ${aiResult.vocabulary_comment}` });
      if (Array.isArray(aiResult.grammar_errors) && aiResult.grammar_errors.length) {
        messages.push({ type: 'warning', text: `Lỗi ngữ pháp: ${aiResult.grammar_errors.join(' | ')}` });
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
    getModel,
    setModel,
    isEnabled,
    setEnabled,
    testConnection,
    evaluate
  };
})(typeof window !== 'undefined' ? window : this);
