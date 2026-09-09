/**
 * TOEIC Writing Part 1 - Gemini LLM Evaluator
 * Directly interfaces with Google Gemini API for intelligent, native-level scoring and feedback.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_API = 'gemini_api_key';
  const STORAGE_KEY_MODEL = 'gemini_model';
  const STORAGE_KEY_ENABLED = 'gemini_ai_enabled';

  // Fast & reliable models
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
    return true; // Always has the system default key available
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

  /**
   * Test API Key connection
   */
  async function testConnection(apiKey, model) {
    const key = apiKey || getApiKey();
    const md = model || getModel();
    if (!key) {
      throw new Error('Chưa có Gemini API Key!');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${md}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello' }] }]
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error?.message || `Lỗi kết nối Gemini API (HTTP ${res.status})`;
      if (res.status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
        throw new Error('QUOTA_EXCEEDED: Key này đã đạt giới hạn lượt gọi (Quota/Rate limit).');
      }
      throw new Error(msg);
    }

    return true;
  }

  /**
   * Fetch image as Base64 for multimodal Gemini vision
   */
  async function getImageBase64(imagePath) {
    if (!imagePath) return null;
    try {
      const res = await fetch(imagePath);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const parts = reader.result.split(',');
            resolve({
              mimeType: blob.type || 'image/jpeg',
              data: parts[1] || ''
            });
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('Could not load image for vision analysis:', err);
      return null;
    }
  }

  /**
   * Evaluate a TOEIC Writing Part 1 sentence using Gemini LLM (Multimodal Vision)
   */
  async function evaluate(userSentence, prompt, question) {
    const key = getApiKey();
    const model = getModel();

    if (!key) {
      throw new Error('NO_API_KEY');
    }

    const raw = (userSentence || '').trim();
    const requiredKeywords = prompt.keywords || [];

    if (!raw) {
      return {
        score: 0,
        badge: 'Score 0/3 - Chưa Nhập Câu',
        label: 'Score 0/3 - Chưa Nhập Câu',
        scoreColor: '#94a3b8',
        scoreClass: 'score-0',
        isAi: true,
        criteria: [
          { name: `Từ khoá 1 (${requiredKeywords[0] || ''})`, passed: false, detail: 'Chưa có bài làm' },
          { name: `Từ khoá 2 (${requiredKeywords[1] || ''})`, passed: false, detail: 'Chưa có bài làm' },
          { name: 'Quy chuẩn 1 câu duy nhất', passed: false, detail: 'Chưa có bài làm' },
          { name: 'Ngữ pháp & Cấu trúc', passed: false, detail: 'Chưa có bài làm' }
        ],
        feedback: [{ type: 'warning', icon: '', text: 'Vui lòng nhập câu trả lời miêu tả bức tranh.' }],
        sampleAnswer: prompt.sample_answer || '',
        grammarTip: question?.grammar_tip || '',
        nativeUpgrade: ''
      };
    }

    const systemInstruction = `You are a certified ETS / SEC TOEIC Writing Senior Examiner for Part 1: "Write a Sentence Based on a Picture".
You are directly inspecting the attached picture. Evaluate the student's submitted response strictly according to the official TOEIC Writing Part 1 SEC Rubric (0 to 3 points).

OFFICIAL SEC RUBRIC GUIDELINES (0–3 POINTS):
- ĐIỂM 3 (Tối đa / Xuất Sắc):
  • Không có lỗi ngữ pháp.
  • Sử dụng đúng cả 2 từ cho sẵn (đúng dạng và hợp ngữ cảnh).
  • Phù hợp với hình ảnh.
- ĐIỂM 2 (Khá Tốt / Có thể là 1 hoặc nhiều câu):
  • Có lỗi ngữ pháp nhẹ, không làm sai nghĩa.
  • Có đủ cả 2 từ, có thể sai dạng hoặc không trong cùng câu.
  • Vẫn đúng với hình ảnh.
- ĐIỂM 1 (Cần Cải Thiện):
  • Có lỗi làm sai nghĩa, khó hiểu.
  • Thiếu 1 hoặc cả 2 từ.
  • Không phù hợp với hình ảnh.
- ĐIỂM 0 (Không Tính Điểm):
  • Bỏ trống, viết bằng ngôn ngữ khác, hoặc chỉ gõ ký tự linh tinh / hoàn toàn không liên quan đến tranh.

CRITICAL ETS / SEC EXAMINER CONSTRAINTS:
1. PICTURE ACCURACY & PERSPECTIVE:
- The sentence must accurately describe what is taking place in the attached picture from an objective 3rd-person observer perspective (e.g., "The woman", "Two men", "Customers").
- Avoid starting with vague pronouns ("They/He/She") without naming the subject antecedent first.

2. MANDATORY "native_upgrade" REWRITE RULES (CRITICAL):
- In TOEIC Writing Part 1, the single most critical constraint is that the sentence MUST use BOTH given keywords.
- ABSOLUTE REQUIREMENT: The "native_upgrade" field MUST EXPLICITLY CONTAIN BOTH REQUIRED KEYWORDS: "${requiredKeywords[0] || ''}" and "${requiredKeywords[1] || ''}" (or their valid grammatical inflections).
- Under NO circumstance should either keyword be omitted, deleted, or substituted with a synonym in "native_upgrade" (e.g., if the keyword is "at", do NOT replace it with "in"; if the keyword is "examine", do NOT replace it with "look at")!
- The "native_upgrade" must be a natural, Score 3/3 model sentence accurately describing the scene with a 3rd-person noun subject and exactly 1 complete single sentence.

Output strictly valid JSON with no markdown formatting around it:
{
  "score": 0, 1, 2, or 3,
  "label": "Score X/3 - [Xep Loai]",
  "keyword1_found": true or false,
  "keyword1_note": "Ghi nhận từ/dạng từ đã dùng trong câu",
  "keyword2_found": true or false,
  "keyword2_note": "Ghi nhận từ/dạng từ đã dùng trong câu",
  "single_sentence_passed": true or false,
  "clear_antecedent_passed": true or false,
  "clear_antecedent_note": "Chỉ rõ bằng tiếng Việt liệu câu đã nêu chủ thể cụ thể trước khi dùng đại từ hay chưa",
  "grammar_passed": true or false,
  "grammar_analysis": "Phân tích ngữ pháp tiếng Việt chi tiết theo chuẩn SEC, chỉ rõ chỗ đúng hoặc sai",
  "examiner_comment": "Nhận xét tổng quan của giám khảo bằng tiếng Việt (nêu rõ sự tương thích với tranh)",
  "native_upgrade": "Câu viết lại tối ưu nhất, bắt buộc chứa đủ cả 2 từ khoá '${requiredKeywords[0] || ''}' và '${requiredKeywords[1] || ''}', mượt mà chuẩn người bản xứ",
  "feedback_items": [
    {"type": "pass or fail", "text": "Nhận xét từng tiêu chí bằng tiếng Việt"}
  ]
}`;

    const userPromptText = `TASK DETAILS:
- Question Number: #${question?.id || ''}
- Category: ${question?.category || 'Tranh Người'}
- Required Keyword 1: "${requiredKeywords[0] || ''}"
- Required Keyword 2: "${requiredKeywords[1] || ''}"
- Reference Sample Answer: "${prompt.sample_answer || ''}"
- Student's Submission: "${raw}"

CRITICAL INSTRUCTION FOR "native_upgrade":
You MUST include BOTH Required Keyword 1 ("${requiredKeywords[0] || ''}") AND Required Keyword 2 ("${requiredKeywords[1] || ''}") in your "native_upgrade" sentence. Do NOT omit or change either keyword!

Inspect the attached picture and student submission. Grade strictly according to the SEC rubric and return the JSON evaluation.`;

    const parts = [];

    // Multimodal Vision: Load image base64 if available
    const imgData = await getImageBase64(question?.image);
    if (imgData && imgData.data) {
      parts.push({
        inline_data: {
          mime_type: imgData.mimeType,
          data: imgData.data
        }
      });
    }

    // Text instructions & student answer
    parts.push({ text: `${systemInstruction}\n\n${userPromptText}` });

    const payload = {
      contents: [
        { role: 'user', parts: parts }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    };

    // Candidate models to try in sequence if one returns 503 or 404
    const selectedModel = model || DEFAULT_MODEL;
    const modelsToTry = [selectedModel];
    FALLBACK_MODELS.forEach(fb => {
      if (!modelsToTry.includes(fb)) modelsToTry.push(fb);
    });

    let response = null;
    let lastErrorMsg = '';

    for (const m of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          response = res;
          break;
        } else {
          const err = await res.json().catch(() => ({}));
          lastErrorMsg = err.error?.message || `HTTP ${res.status}`;
          if (res.status === 429 || lastErrorMsg.includes('RESOURCE_EXHAUSTED') || lastErrorMsg.includes('quota')) {
            if (isUsingSystemKey()) {
              throw new Error('QUOTA_EXCEEDED: Key AI hệ thống miễn phí đã đạt giới hạn hôm nay. Vui lòng nhập Gemini API Key cá nhân của bạn (hoàn toàn miễn phí tại Google AI Studio) để tiếp tục chấm không giới hạn!');
            } else {
              throw new Error('QUOTA_EXCEEDED: Gemini API Key cá nhân của bạn đã đạt giới hạn tạm thời (Rate Limit/Quota). Vui lòng thử lại sau giây lát.');
            }
          }
          console.warn(`Gemini model ${m} failed: ${lastErrorMsg}. Falling back to next model...`);
        }
      } catch (netErr) {
        lastErrorMsg = netErr.message;
        if (lastErrorMsg && lastErrorMsg.includes('QUOTA_EXCEEDED')) {
          throw netErr;
        }
        console.warn(`Gemini model ${m} network error: ${lastErrorMsg}. Falling back to next model...`);
      }
    }

    if (!response) {
      throw new Error(lastErrorMsg || 'Không thể kết nối đến máy chủ Gemini.');
    }

    const resJson = await response.json();
    const replyText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      throw new Error('Gemini API không trả về nội dung hợp lệ.');
    }

    const aiData = JSON.parse(replyText);

    // Map AI result to application format
    const scoreColors = { 3: '#10b981', 2: '#f59e0b', 1: '#ef4444', 0: '#ef4444' };
    const score = [0, 1, 2, 3].includes(aiData.score) ? aiData.score : 0;

    const criteria = [
      {
        name: `Từ khoá 1 (${requiredKeywords[0] || ''})`,
        passed: !!aiData.keyword1_found,
        detail: aiData.keyword1_note || (aiData.keyword1_found ? 'Đã sử dụng chính xác' : 'Chưa tìm thấy từ khoá này')
      },
      {
        name: `Từ khoá 2 (${requiredKeywords[1] || ''})`,
        passed: !!aiData.keyword2_found,
        detail: aiData.keyword2_note || (aiData.keyword2_found ? 'Đã sử dụng chính xác' : 'Chưa tìm thấy từ khoá này')
      },
      {
        name: 'Quy chuẩn 1 câu duy nhất',
        passed: !!aiData.single_sentence_passed,
        detail: aiData.single_sentence_passed ? 'Đạt chuẩn duy nhất 1 câu' : 'Vi phạm: Viết nhiều hơn 1 câu hoặc chưa đủ câu'
      },
      {
        name: 'Chủ ngữ rõ ràng (không mở đầu bằng đại từ mơ hồ)',
        passed: !!aiData.clear_antecedent_passed,
        detail: aiData.clear_antecedent_note || (aiData.clear_antecedent_passed
          ? 'Đã nêu chủ thể cụ thể (The woman, Two men...) trước khi dùng đại từ'
          : 'Vi phạm: Mở đầu bằng đại từ (He/She/They...) khi chưa nêu danh từ chủ thể — cần giới thiệu người/vật cụ thể trước')
      },
      {
        name: 'Ngữ pháp & Cấu trúc (Giám khảo AI)',
        passed: !!aiData.grammar_passed,
        detail: aiData.grammar_analysis || (aiData.grammar_passed ? 'Ngữ pháp chuẩn xác' : 'Có lỗi sai ngữ pháp')
      }
    ];

    const feedback = (aiData.feedback_items && aiData.feedback_items.length > 0)
      ? aiData.feedback_items
      : [
          { icon: '', text: aiData.examiner_comment || aiData.grammar_analysis }
        ];

    // Validate native_upgrade to ensure it strictly contains BOTH required keywords
    let finalNativeUpgrade = (aiData.native_upgrade || '').trim();
    if (finalNativeUpgrade && window.ToeicEvaluator && typeof window.ToeicEvaluator.checkKeywordMatch === 'function') {
      const tokens = (typeof window.ToeicEvaluator.tokenize === 'function')
        ? window.ToeicEvaluator.tokenize(finalNativeUpgrade)
        : finalNativeUpgrade.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ').split(/\s+/).filter(Boolean);

      const kw1Ok = requiredKeywords[0] ? window.ToeicEvaluator.checkKeywordMatch(requiredKeywords[0], finalNativeUpgrade, tokens).found : true;
      const kw2Ok = requiredKeywords[1] ? window.ToeicEvaluator.checkKeywordMatch(requiredKeywords[1], finalNativeUpgrade, tokens).found : true;

      if (!kw1Ok || !kw2Ok) {
        console.warn('Gemini native_upgrade was missing required keywords. Falling back to reference sample answer.');
        finalNativeUpgrade = prompt.sample_answer || finalNativeUpgrade;
      }
    } else if (!finalNativeUpgrade) {
      finalNativeUpgrade = prompt.sample_answer || '';
    }

    return {
      score,
      status: score === 3 ? 'excellent' : score === 2 ? 'good' : score === 1 ? 'needs_work' : 'invalid',
      badge: aiData.label || `Score ${score}/3 - ${score === 3 ? 'Xuất Sắc' : score === 2 ? 'Khá Tốt' : score === 1 ? 'Cần Cải Thiện' : 'Chưa Đạt'}`,
      label: aiData.label || `Score ${score}/3`,
      scoreColor: scoreColors[score],
      scoreClass: `score-${score}`,
      isAi: true,
      criteria,
      feedback,
      reasoning: aiData.examiner_comment,
      nativeUpgrade: finalNativeUpgrade,
      sampleAnswer: prompt.sample_answer || '',
      grammarTip: question?.grammar_tip || ''
    };
  }

  // Export to window
  window.ToeicLlmEvaluator = {
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

})(typeof window !== 'undefined' ? window : global);

