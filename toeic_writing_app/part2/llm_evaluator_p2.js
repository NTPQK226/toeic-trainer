(function(window) {
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
    4: 'Xuất Sắc',
    3: 'Tốt',
    2: 'Cần Cải Thiện',
    1: 'Yếu',
    0: 'Chưa Đạt'
  };

  const SCORE_COLORS = {
    4: '#10b981',
    3: '#3b82f6',
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello' }] }]
      })
    });

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
  
  async function evaluate(userResponse, question) {
    if (!isEnabled()) {
      throw new Error('AI Evaluation is not enabled or API key is missing.');
    }

    const apiKey = getApiKey();
    const model = getModel();
    
    const systemInstruction = `You are a certified ETS TOEIC Writing Senior Examiner for Part 2 (Questions 6-7: "Respond to a Written Request").
Your task is to accurately score an email response against the official ETS rubric below.

=========================================================
THE OFFICIAL ETS SCORING CRITERIA (verbatim from the ETS Examinee Handbook)
=========================================================
For Questions 6-7 the ETS directions state that a response is scored on:
  • the quality and variety of your sentences
  • vocabulary
  • organization
These are the ONLY official criteria. REGISTER/TONE is a widely used supporting
consideration (the prompt establishes a register that the reply must match) —
assess it, but do not treat it as a fourth official axis.
Scoring is HOLISTIC band placement (0-4), NOT sentence-by-sentence deduction.

CRITICAL ETS RULE — MISSING A REQUEST:
Each element of the directions ("explain ONE problem", "make TWO suggestions",
"ask THREE questions") is an INDEPENDENT requirement. The single most reliable way
to drop from 4 to 2 is to miss a required element. If the response completely misses
even ONE required element, the score must NOT exceed 2.
Count the required elements carefully: the prompt may embed a second request inside
the same sentence (e.g. "Please send pricing and let me know whether a morning trial
is possible" = TWO requests), or disguise one as a statement of preference
("I would appreciate...", "We would like..."). Count these as real requests.

### 0-4 Rubric bands (holistic):
Score 4 (Xuất sắc):
- ALL required elements are addressed, each visibly (its own sentence, not buried in a clause).
- Sentence quality AND VARIETY: a mix of simple, compound and complex structures; not a run of uniform simple sentences.
- Vocabulary is varied, precise and appropriate to the workplace context.
- Organization: clear email structure (salutation → acknowledgement → body → closing → sign-off), coherent, natural transitions.
- Register matches the prompt (mirror the prompt's formality).
- At most minor errors that do not obscure meaning.
NOTE: ticking off each request in clean but uniform simple sentences caps the score at 3 —
sentence VARIETY is required for 4.

Score 3 (Tốt):
- All required elements addressed.
- Adequate but repetitive sentence structures; limited variety.
- Mostly appropriate register; some lapses in organization or vocabulary.
- Obvious grammar errors, possibly one sentence that is difficult to understand.

Score 2 (Đạt yêu cầu):
- ONE required element MISSED, OR
- register mismatch (e.g. casual reply to a formal request), OR
- grammar/vocabulary problems severe enough to disrupt communication.
This cap applies regardless of how clean the rest of the response is.

Score 1 (Yếu):
- MULTIPLE required elements missed, OR
- major organization problems, OR
- register badly wrong.
- Severe and repetitive errors making most of the content hard to understand.

Score 0 (Không tính điểm):
- Copied from the prompt, irrelevant, not written in English, random keystrokes, or blank.

=========================================================
STRUCTURE REFERENCE — the 4-band email shape
=========================================================
Salutation (Dear Mr./Ms. [Surname] / Dear [First Name]) → opening acknowledgement of
the sender's email (1-2 sentences) → one body paragraph per request (2-3 sentences each)
→ closing offer of further help + sign-off (Best regards, / Sincerely,) + a name.
Missing salutation, sign-off, or name is a structural weakness the rubric scores.

=========================================================
EVALUATION INSTRUCTIONS
=========================================================
1. FIRST enumerate every required element from the Directions (and the task list provided).
   State explicitly, per element, whether it was addressed and where.
2. Then judge sentence quality/variety, vocabulary, organization and register.
3. Apply the caps: any missed required element → max 2. Uniform simple sentences → max 3.
4. Be strict. Place the response in a band; do not average sub-scores.
5. Output valid JSON only.

### Required JSON output structure:
{
  "score": <number 0-4>,
  "missed_any_requirement": true or false,
  "task_completion": [
    {"requirement": "explain ONE problem", "addressed": true, "evidence": "sentence from the student's email proving it"}
  ],
  "criteria": [
    {"name": "Task Completion", "score_contribution": "...", "comment": "..."},
    {"name": "Sentence Quality & Variety", "score_contribution": "...", "comment": "..."},
    {"name": "Vocabulary", "score_contribution": "...", "comment": "..."},
    {"name": "Organization & Cohesion", "score_contribution": "...", "comment": "..."},
    {"name": "Register & Tone", "score_contribution": "...", "comment": "..."}
  ],
  "sentence_variety_note": "Bằng tiếng Việt: câu có đa dạng cấu trúc (đơn/kép/phức) hay chỉ toàn câu đơn — nêu rõ vì sao đạt/chưa đạt Score 4",
  "structure_note": "Bằng tiếng Việt: có đủ salutation, opening, body, closing, sign-off + tên không",
  "grammar_errors": ["error 1 with correction", "error 2 with correction"],
  "vocabulary_notes": "...",
  "organization_comment": "...",
  "examiner_comment": "Overall justification for the score...",
  "improved_version": "A rewritten version of the response showing Score 4 quality."
}`;

    const emailText = typeof question.email === 'string'
      ? question.email
      : `From: ${question.email?.from || ''}
To: ${question.email?.to || ''}
Subject: ${question.email?.subject || ''}
Date: ${question.email?.date || ''}

${question.email?.body || ''}`;

    const prompt = `Evaluate the following TOEIC Writing Part 2 response.

### Original Email:
${emailText}

### Directions:
${question.directions}

### Required elements (the task list — total required = sum of "count"):
${JSON.stringify(question.tasks, null, 2)}

### User's Response:
${userResponse}

STEP 1 — Before scoring, enumerate EVERY required element from the Directions above
(including requests hidden inside one sentence, or phrased as a preference such as
"I would appreciate..."). For each one, report in "task_completion" whether it was
addressed and quote the exact sentence that proves it.
STEP 2 — Apply the rubric. Remember: missing even ONE required element caps the
score at 2. Uniform simple sentences with no structural variety cap it at 3.

Provide the evaluation in the required JSON format.`;

    try {
      const aiResult = await callGeminiApi(prompt, systemInstruction, apiKey, model);
      
      // --- Normalise task_completion (model may return an array of strings, as in
      // the older contract, or an array of {requirement, addressed, evidence}).
      const rawCompletion = Array.isArray(aiResult.task_completion) ? aiResult.task_completion : [];
      const completionList = rawCompletion.map(item => {
        if (item && typeof item === 'object') {
          return {
            requirement: String(item.requirement || item.task || ''),
            addressed: item.addressed !== false,
            evidence: String(item.evidence || '')
          };
        }
        return { requirement: String(item || ''), addressed: true, evidence: '' };
      });
      const totalTasks = (question.tasks && question.tasks.length) ? question.tasks.reduce((sum, t) => sum + (t.count || 1), 0) : 0;
      const metTasks = completionList.filter(t => t.addressed).length;
      const missedTasks = completionList.filter(t => !t.addressed).length;

      // The model sometimes returns grammar_errors as objects instead of strings —
      // flatten them so the UI never prints "[object Object]".
      const grammarErrors = (Array.isArray(aiResult.grammar_errors) ? aiResult.grammar_errors : [])
        .map(e => {
          if (e && typeof e === 'object') {
            const err = e.error || e.issue || e.original || e.text || '';
            const fix = e.correction || e.fix || e.suggestion || '';
            return `"${err}" → "${fix}"`;
          }
          return String(e || '');
        })
        .filter(Boolean);

      // --- Enforce the official ETS cap: missing even ONE required element → max 2.
      // (Either the model flag or our own count of unaddressed elements triggers it.)
      let score = typeof aiResult.score === 'number' ? Math.max(0, Math.min(4, Math.round(aiResult.score))) : 0;
      const missedAny = aiResult.missed_any_requirement === true || missedTasks > 0;
      if (missedAny && score > 2) score = 2;

      const label = SCORE_LABELS[score] || 'Chưa Đạt';
      const badge = `Score ${score}/4 - ${label}`;
      const scoreColor = SCORE_COLORS[score] || '#94a3b8';
      const scoreClass = `score-${score}`;

      // --- Criteria: use the model's richer criteria list when it matches the new
      // contract, otherwise fall back to the derived set below.
      const aiCriteria = Array.isArray(aiResult.criteria) && aiResult.criteria.length >= 4
        ? aiResult.criteria.map(c => ({
            name: c.name,
            // Older rows had no `passed`; derive from the score band so the UI still works.
            passed: typeof c.passed === 'boolean' ? c.passed : score >= 3,
            detail: c.comment || c.detail || c.score_contribution || ''
          }))
        : null;

      const tasks = (question.tasks || []).map((t, idx) => ({
        type: t.type,
        count: t.count || 1,
        completed: completionList.length > 0 ? completionList[idx] ? completionList[idx].addressed : true : score >= 3
      }));

      const criteria = aiCriteria || [
        {
          name: 'Hoàn thành yêu cầu đề',
          passed: !missedAny,
          detail: completionList.length > 0
            ? completionList.map(t => `${t.addressed ? '✔' : '✘'} ${t.requirement}`).join('; ')
            : `Đạt ${Math.min(metTasks, totalTasks)}/${totalTasks} yêu cầu`
        },
        {
          name: 'Cấu trúc Email',
          passed: score >= 2,
          detail: aiResult.structure_note || aiResult.organization_comment || 'Bố cục và liên kết câu'
        },
        {
          name: 'Chất lượng & Độ đa dạng câu văn',
          passed: score >= 4,
          detail: aiResult.sentence_variety_note || 'Cần đa dạng cấu trúc câu (đơn/kép/phức) để đạt Score 4'
        },
        {
          name: 'Từ vựng & Ngữ pháp',
          passed: score >= 2,
          detail: grammarErrors.length > 0
            ? `Lỗi: ${grammarErrors.join(' | ')}`
            : (aiResult.vocabulary_notes || 'Ngữ pháp và từ vựng tốt')
        },
        {
          name: 'Giọng điệu & Phong cách',
          passed: score >= 3,
          detail: score >= 3 ? 'Giọng điệu chuyên nghiệp, phù hợp người nhận' : 'Cần cải thiện giọng điệu công sở'
        }
      ];
      
      const feedback = [];
      const messages = [];
      if (missedAny) {
        const missedNames = completionList.filter(t => !t.addressed).map(t => `"${t.requirement}"`).join(', ');
        const msg = `Thiếu yêu cầu đề bài${missedNames ? ': ' + missedNames : ''}. Theo chuẩn ETS, bỏ sót dù chỉ 1 yêu cầu sẽ giới hạn điểm tối đa ở 2/4.`;
        feedback.push(msg);
        messages.push({ type: 'error', icon: '', text: msg });
      }
      if (aiResult.sentence_variety_note) {
        feedback.push(`Sentence variety: ${aiResult.sentence_variety_note}`);
        messages.push({ type: score >= 4 ? 'success' : 'warning', icon: '', text: `Độ đa dạng câu văn: ${aiResult.sentence_variety_note}` });
      }
      if (aiResult.structure_note) {
        feedback.push(`Structure: ${aiResult.structure_note}`);
        messages.push({ type: 'info', icon: '', text: `Cấu trúc email: ${aiResult.structure_note}` });
      }
      if (grammarErrors.length > 0) {
        feedback.push(`Grammar Errors: ${grammarErrors.join(' | ')}`);
        messages.push({ type: 'warning', icon: '', text: `Lỗi ngữ pháp: ${grammarErrors.join(' | ')}` });
      }
      if (aiResult.vocabulary_notes) {
        feedback.push(`Vocabulary: ${aiResult.vocabulary_notes}`);
        messages.push({ type: 'info', icon: '', text: `Từ vựng: ${aiResult.vocabulary_notes}` });
      }
      if (aiResult.organization_comment) {
        feedback.push(`Organization: ${aiResult.organization_comment}`);
        messages.push({ type: 'info', icon: '', text: `Bố cục: ${aiResult.organization_comment}` });
      }
      if (aiResult.examiner_comment) {
        messages.push({ type: 'info', icon: '', text: `Giám khảo nhận xét: ${aiResult.examiner_comment}` });
      }

      const improvedText = aiResult.improved_version || '';

      return {
        score,
        badge,
        label,
        scoreColor,
        scoreClass,
        isAi: true,
        criteria,
        tasks,
        messages,
        feedback: messages,
        sampleAnswer: question.sample_answer || '',
        missedAnyRequirement: missedAny,
        taskCompletion: { completed: completionList.length > 0 ? metTasks : Math.min(metTasks, totalTasks), total: totalTasks || completionList.length },
        reasoning: aiResult.examiner_comment || '',
        improved: improvedText,
        improvedVersion: improvedText
      };
    } catch (error) {
      console.error('LLM Evaluation failed:', error);
      if (error.message && error.message.includes('QUOTA_EXCEEDED')) {
        throw error;
      }
      throw new Error('Failed to evaluate response: ' + error.message);
    }
  }
  
  window.ToeicP2LlmEvaluator = {
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
  
})(typeof window !== 'undefined' ? window : global);
