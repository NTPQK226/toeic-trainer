/**
 * TOEIC Writing Part 3 — Opinion Essay (Q8) Offline Evaluator
 * ---------------------------------------------------------------------------
 * ETS format: "Write an opinion essay" (~30 min, effective essays ≥ 300 words).
 * Question 8 is scored on the 0–5 scale.
 *
 * Heuristic rubric (calibrated to official band descriptors, clearly labelled
 * as an approximation — the AI examiner gives the fine-grained assessment):
 *
 * 5 — Clear position; well-organized & well-developed; unity + progression +
 *     coherence across paragraphs; sentence variety; precise vocabulary;
 *     grammatically accurate; length ≈ 300+ words.
 * 4 — Clear position with developed reasons/examples; good organization;
 *     only minor lapses.
 * 3 — Position + some reasons but underdeveloped, repetitive, short, or with
 *     noticeable organization/grammar weaknesses.
 * 2 — Limited support/development, disorganized, or serious grammar errors.
 * 1 — Very limited content; little relevance or mostly unsupported claims.
 * 0 — Blank, off-topic, copied, or not written in English.
 *
 * NOTE: no official per-point rater table is public; this engine follows the
 * official band descriptors (ETS/IIBC). It powers quick feedback while the
 * Gemini examiner provides the authoritative 0–5 with detailed comments.
 */
(function (window) {
  'use strict';

  // ---- Simple helpers -------------------------------------------------------
  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function countSentences(text) {
    if (!text) return 0;
    const parts = text.replace(/\b(mr|mrs|ms|dr|vs|etc|e\.g|i\.e)\./gi, '$1_dot_')
      .replace(/\b(a\.m|p\.m)\./gi, '$1_dot_')
      .split(/[.!?]+/)
      .map(s => s.trim()).filter(Boolean);
    return parts.length;
  }

  function countParagraphs(text) {
    if (!text) return 0;
    return text.split(/\n\s*\n/).filter(p => p.trim().split(/\s+/).filter(Boolean).length >= 2).length;
  }

  const TRANSITIONS = [
    'first', 'firstly', 'first of all', 'to begin with', 'second', 'secondly',
    'third', 'thirdly', 'next', 'then', 'after that', 'in addition', 'additionally',
    'furthermore', 'moreover', 'also', 'besides', 'in conclusion', 'to conclude',
    'finally', 'lastly', 'however', 'on the other hand', 'in contrast',
    'nevertheless', 'nonetheless', 'therefore', 'thus', 'consequently',
    'as a result', 'for example', 'for instance', 'in my opinion', 'i believe',
    'i think', 'in my view', 'although', 'while', 'because', 'since'
  ];

  function countTransitions(text) {
    const lower = ' ' + text.toLowerCase().replace(/[^a-z\s]/g, ' ') + ' ';
    let count = 0;
    for (const t of TRANSITIONS) {
      const re = new RegExp('\\b' + t.replace(/\s+/g, '\\s+') + '\\b', 'g');
      const m = lower.match(re);
      if (m) count += m.length;
    }
    return count;
  }

  // Heuristic: does the text contain a clear thesis-like claim early?
  function hasOpinionStatement(text) {
    return /(in my opinion|i (believe|think|strongly believe|am convinced)|i would argue|from my perspective|it seems to me|my view is|i feel that)/i.test(text);
  }

  // ---------- Main evaluation -------------------------------------------------
  function evaluate(userEssay, question) {
    const raw = (userEssay || '').trim();
    const words = countWords(raw);
    const sentences = countSentences(raw);
    const paragraphs = countParagraphs(raw);
    const transitions = countTransitions(raw);
    const hasThesis = hasOpinionStatement(raw);

    const issues = [];
    const result = {
      score: 0,
      label: 'Score 0/5 - Chưa Đạt',
      criteria: [],
      feedback: [],
      isAi: false,
      wordCount: words,
      sentenceCount: sentences,
      paragraphCount: paragraphs,
      transitionCount: transitions,
      sampleAnswer: question ? question.sample_answer : ''
    };

    // --- Score 0 guards (ETS: blank / off-topic / copy / not English) ---
    const alpha = (raw.match(/[a-zA-Z]/g) || []).length;
    const latinRatio = raw.length ? alpha / raw.length : 0;
    if (!raw || words === 0) {
      result.label = 'Score 0/5 - Bài Trống';
      result.feedback.push({ type: 'error', text: 'Bạn chưa viết bài luận.' });
      return _finalize(result);
    }
    if (latinRatio < 0.6 || alpha < 60) {
      result.label = 'Score 0/5 - Không Phải Tiếng Anh';
      result.feedback.push({ type: 'error', text: 'Bài viết không phải tiếng Anh hoặc chứa quá nhiều ký tự không hợp lệ.' });
      return _finalize(result);
    }
    if (words < 40) {
      result.label = 'Score 0/5 - Quá Ngắn';
      result.feedback.push({ type: 'error', text: 'Bài viết quá ngắn (dưới 40 từ) — không đủ để đánh giá theo chuẩn ETS (yêu cầu khoảng 300 từ).' });
      return _finalize(result);
    }

    // Simple copy check against prompt
    const promptText = (question && question.prompt) || '';
    if (promptText && words > 20) {
      const cleanResp = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanPrompt = promptText.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanPrompt.includes(cleanResp) && cleanResp.length > 80) {
        result.label = 'Score 0/5 - Sao Chép Đề';
        result.feedback.push({ type: 'error', text: 'Bài viết dường như sao chép trực tiếp từ đề bài.' });
        return _finalize(result);
      }
    }

    // --- Dimension scoring (each 0-5) ---
    // 1) Position / relevance
    let posScore = 0;
    if (hasThesis) posScore = 3;
    if (hasThesis && sentences >= 8) posScore = 4;
    if (hasThesis && paragraphs >= 3 && sentences >= 10) posScore = 5;
    else if (!hasThesis && words >= 80) posScore = 2;

    // 2) Development & organization (paragraphs, transitions, length)
    let devScore = 0;
    if (paragraphs >= 2) devScore = 2;
    if (paragraphs >= 3) devScore = 3;
    if (paragraphs >= 3 && transitions >= 3) devScore = 4;
    if (paragraphs >= 4 && transitions >= 5 && words >= 220) devScore = 5;
    else if (paragraphs >= 3 && transitions >= 3 && words >= 180) devScore = 4;
    else if (paragraphs >= 3) devScore = 3;

    // 3) Language (length as proxy for lexical range; sentence variety)
    let langScore = 2;
    if (words >= 150) langScore = 3;
    if (words >= 220 && sentences >= 12) langScore = 4;
    if (words >= 280 && sentences >= 15) langScore = 5;
    else if (words >= 200 && sentences >= 10) langScore = 4;

    // --- Length-based caps (ETS: short/underdeveloped essays cannot score high) ---
    // Effective Q8 essays are ~300+ words; cap the top band accordingly.
    let cap = 5;
    if (words < 300) cap = Math.min(cap, 4); // below ETS length guideline → max 4
    if (words < 220) cap = Math.min(cap, 3);
    if (words < 150) cap = Math.min(cap, 2);
    if (words < 100) cap = Math.min(cap, 1);
    if (paragraphs < 3) cap = Math.min(cap, 3);
    if (paragraphs < 2) cap = Math.min(cap, 2);

    // Composite
    const avg = (posScore + devScore + langScore) / 3;
    let score = Math.round(avg);
    score = Math.min(score, cap);

    // If there's no clear opinion at all, cap at 2
    if (!hasThesis) score = Math.min(score, 2);

    // --- Feedback messages ---
    if (score <= 0) score = 0;
    result.score = score; // ← persist the computed score on the result object
    const labelMap = {
      5: 'Score 5/5 - Xuất Sắc',
      4: 'Score 4/5 - Tốt',
      3: 'Score 3/5 - Khá',
      2: 'Score 2/5 - Cần Cải Thiện',
      1: 'Score 1/5 - Yếu',
      0: 'Score 0/5 - Chưa Đạt'
    };
    result.label = labelMap[score];

    if (!hasThesis) issues.push('Bài viết chưa thể hiện rõ quan điểm (thesis) — hãy nêu rõ bạn đồng ý/không đồng ý ngay từ đoạn mở đầu.');
    if (paragraphs < 3) issues.push('Bài nên có ít nhất 3 đoạn: mở bài - thân bài (2-3 ý) - kết luận.');
    if (transitions < 3) issues.push('Nên dùng thêm từ nối (First of all, Furthermore, In conclusion...) để liên kết ý rõ ràng.');
    if (words < 250) issues.push(`Bài hơi ngắn (${words} từ). Bài hiệu quả chuẩn ETS thường từ 300 từ trở lên.`);
    if (words >= 250) issues.push(`Độ dài tốt (${words} từ).`);
    if (score >= 4) issues.push('Bố cục rõ ràng, có luận điểm và ví dụ hỗ trợ. Tiếp tục giữ sự mạch lạc giữa các đoạn.');
    if (score <= 2) issues.push('Cần phát triển luận điểm đầy đủ hơn với ví dụ cụ thể và tổ chức bài chặt chẽ.');

    result.criteria = [
      { name: 'Nêu rõ & bảo vệ quan điểm', passed: posScore >= 3, detail: hasThesis ? 'Đã nêu quan điểm rõ ràng' : 'Chưa thể hiện quan điểm rõ ràng (thesis)' },
      { name: 'Phát triển ý & bố cục', passed: devScore >= 3, detail: `${paragraphs} đoạn, ${transitions} từ nối` },
      { name: 'Vốn từ & độ dài chuẩn ETS', passed: words >= 200, detail: `${words} từ (chuẩn ~300 từ)` },
      { name: 'Mạch lạc & liên kết', passed: transitions >= 3, detail: transitions >= 3 ? 'Dùng từ nối tốt' : 'Thiếu từ nối liên kết' }
    ];
    result.feedback = issues.map(t => ({ type: score >= 4 ? 'success' : 'warning', text: t }));

    return _finalize(result);
  }

  function _finalize(r) {
    const colors = { 5: '#10b981', 4: '#22c55e', 3: '#eab308', 2: '#f59e0b', 1: '#ef4444', 0: '#ef4444' };
    const classes = { 5: 'score-5', 4: 'score-4', 3: 'score-3', 2: 'score-2', 1: 'score-1', 0: 'score-0' };
    r.scoreColor = colors[r.score] || colors[0];
    r.scoreClass = classes[r.score] || classes[0];
    r.status = r.score >= 4 ? 'excellent' : r.score === 3 ? 'good' : r.score === 2 ? 'needs_work' : 'invalid';
    return r;
  }

  window.ToeicP3Evaluator = {
    evaluate,
    countWords,
    countSentences,
    countParagraphs,
    countTransitions
  };
})(typeof window !== 'undefined' ? window : this);
