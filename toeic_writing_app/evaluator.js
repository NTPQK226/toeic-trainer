/**
 * TOEIC Writing Part 1 - ETS Evaluator Engine
 * Standards:
 * - Score 3: Both keywords correctly used, grammatically sound single sentence, accurate to picture.
 * - Score 2: Both keywords used, minor grammar error (tense, subject-verb, word form) OR 1 keyword with strong sentence.
 * - Score 1: Only 1 keyword used OR multiple significant grammatical errors.
 * - Score 0: Blank, neither keyword used, multiple sentences, or incomprehensible.
 */

(function (window) {
  'use strict';

  // Comprehensive irregular verbs & forms mapping
  const IRREGULAR_VERBS = {
    'choose': ['choose', 'chooses', 'choosing', 'chose', 'chosen'],
    'hold': ['hold', 'holds', 'holding', 'held'],
    'wear': ['wear', 'wears', 'wearing', 'wore', 'worn'],
    'drive': ['drive', 'drives', 'driving', 'drove', 'driven'],
    'ride': ['ride', 'rides', 'riding', 'rode', 'ridden'],
    'eat': ['eat', 'eats', 'eating', 'ate', 'eaten'],
    'drink': ['drink', 'drinks', 'drinking', 'drank', 'drunk'],
    'buy': ['buy', 'buys', 'buying', 'bought'],
    'sell': ['sell', 'sells', 'selling', 'sold'],
    'give': ['give', 'gives', 'giving', 'gave', 'given'],
    'speak': ['speak', 'speaks', 'speaking', 'spoke', 'spoken'],
    'see': ['see', 'sees', 'seeing', 'saw', 'seen'],
    'go': ['go', 'goes', 'going', 'went', 'gone'],
    'hang': ['hang', 'hangs', 'hanging', 'hung', 'hanged'],
    'swing': ['swing', 'swings', 'swinging', 'swung'],
    'shake': ['shake', 'shakes', 'shaking', 'shook', 'shaken'],
    'lay': ['lay', 'lays', 'laying', 'laid'],
    'lie': ['lie', 'lies', 'lying', 'lay', 'lain'],
    'build': ['build', 'builds', 'building', 'built'],
    'sweep': ['sweep', 'sweeps', 'sweeping', 'swept'],
    'jot': ['jot', 'jots', 'jotting', 'jotted'],
    'put': ['put', 'puts', 'putting'],
    'cut': ['cut', 'cuts', 'cutting'],
    'run': ['run', 'runs', 'running', 'ran'],
    'stand': ['stand', 'stands', 'standing', 'stood'],
    'sit': ['sit', 'sits', 'sitting', 'sat'],
    'take': ['take', 'takes', 'taking', 'took', 'taken'],
    'make': ['make', 'makes', 'making', 'made'],
    'write': ['write', 'writes', 'writing', 'wrote', 'written'],
    'read': ['read', 'reads', 'reading'],
    'pay': ['pay', 'pays', 'paying', 'paid'],
    'leave': ['leave', 'leaves', 'leaving', 'left'],
    'meet': ['meet', 'meets', 'meeting', 'met'],
    'catch': ['catch', 'catches', 'catching', 'caught'],
    'throw': ['throw', 'throws', 'throwing', 'threw', 'thrown'],
    'draw': ['draw', 'draws', 'drawing', 'drew', 'drawn'],
    'grow': ['grow', 'grows', 'growing', 'grew', 'grown'],
    'blow': ['blow', 'blows', 'blowing', 'blew', 'blown'],
    'fly': ['fly', 'flies', 'flying', 'flew', 'flown'],
    'fall': ['fall', 'falls', 'falling', 'fell', 'fallen'],
    'hear': ['hear', 'hears', 'hearing', 'heard'],
    'keep': ['keep', 'keeps', 'keeping', 'kept'],
    'lead': ['lead', 'leads', 'leading', 'led'],
    'lose': ['lose', 'loses', 'losing', 'lost'],
    'send': ['send', 'sends', 'sending', 'sent'],
    'spend': ['spend', 'spends', 'spending', 'spent'],
    'tell': ['tell', 'tells', 'telling', 'told'],
    'understand': ['understand', 'understands', 'understanding', 'understood'],
    'win': ['win', 'wins', 'winning', 'won'],
    'talk': ['talk', 'talks', 'talking', 'talked'],
    'walk': ['walk', 'walks', 'walking', 'walked'],
    'shop': ['shop', 'shops', 'shopping', 'shopped'],
    'carry': ['carry', 'carries', 'carrying', 'carried'],
    'type': ['type', 'types', 'typing', 'typed'],
    'clean': ['clean', 'cleans', 'cleaning', 'cleaned'],
    'examine': ['examine', 'examines', 'examining', 'examined'],
    'arrange': ['arrange', 'arranges', 'arranging', 'arranged'],
    'display': ['display', 'displays', 'displaying', 'displayed'],
    'look': ['look', 'looks', 'looking', 'looked'],
    'wait': ['wait', 'waits', 'waiting', 'waited'],
    'cross': ['cross', 'crosses', 'crossing', 'crossed'],
    'pack': ['pack', 'packs', 'packing', 'packed'],
    'paint': ['paint', 'paints', 'painting', 'painted'],
    'push': ['push', 'pushes', 'pushing', 'pushed'],
    'pull': ['pull', 'pulls', 'pulling', 'pulled'],
    'serve': ['serve', 'serves', 'serving', 'served'],
    'point': ['point', 'points', 'pointing', 'pointed'],
    'reach': ['reach', 'reaches', 'reaching', 'reached'],
    'wash': ['wash', 'washes', 'washing', 'washed'],
    'load': ['load', 'loads', 'loading', 'loaded'],
    'unload': ['unload', 'unloads', 'unloading', 'unloaded'],
    'repair': ['repair', 'repairs', 'repairing', 'repaired'],
    'fix': ['fix', 'fixes', 'fixing', 'fixed'],
    'open': ['open', 'opens', 'opening', 'opened'],
    'close': ['close', 'closes', 'closing', 'closed']
  };

  // Reverse mapping from any inflected form to lemma base
  const VERB_LEMMAS = {};
  for (const [base, forms] of Object.entries(IRREGULAR_VERBS)) {
    for (const form of forms) {
      VERB_LEMMAS[form.toLowerCase()] = base.toLowerCase();
    }
  }

  // Common irregular nouns (plural <-> singular)
  const NOUN_LEMMAS = {
    'women': 'woman', 'woman': 'woman',
    'men': 'man', 'man': 'man',
    'people': 'person', 'person': 'person',
    'children': 'child', 'child': 'child',
    'feet': 'foot', 'foot': 'foot',
    'teeth': 'tooth', 'tooth': 'tooth',
    'mice': 'mouse', 'mouse': 'mouse',
    'shelves': 'shelf', 'shelf': 'shelf',
    'knives': 'knife', 'knife': 'knife',
    'leaves': 'leaf', 'leaf': 'leaf',
    'scarves': 'scarf', 'scarf': 'scarf',
    'boxes': 'box', 'box': 'box',
    'glasses': 'glass', 'glass': 'glass',
    'dishes': 'dish', 'dish': 'dish',
    'benches': 'bench', 'bench': 'bench',
    'branches': 'branch', 'branch': 'branch',
    'buses': 'bus', 'bus': 'bus',
    'merchandise': 'merchandise'
  };

  // Rule-based stemmer / normalizer
  function stem(word) {
    if (!word) return '';
    let w = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (VERB_LEMMAS[w]) return VERB_LEMMAS[w];
    if (NOUN_LEMMAS[w]) return NOUN_LEMMAS[w];

    // Suffix rules for regular words
    if (w.endsWith('ing') && w.length > 5) {
      let base = w.slice(0, -3);
      if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
        base = base.slice(0, -1);
      }
      if (base.endsWith('i')) base = base.slice(0, -1) + 'y';
      return base;
    }
    if (w.endsWith('ied') && w.length > 4) {
      return w.slice(0, -3) + 'y';
    }
    if (w.endsWith('ed') && w.length > 4) {
      let base = w.slice(0, -2);
      if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
        base = base.slice(0, -1);
      }
      return base;
    }
    if (w.endsWith('ies') && w.length > 4) {
      return w.slice(0, -3) + 'y';
    }
    if (w.endsWith('es') && w.length > 4) {
      return w.slice(0, -2);
    }
    if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
      return w.slice(0, -1);
    }
    return w;
  }

  // Levenshtein distance for minor typo allowance
  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Tokenize text into words with punctuation stripped
  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  // Check if a keyword is satisfied in the sentence (Strict word matching, NO false substring matches)
  function checkKeywordMatch(keyword, rawSentence, tokens) {
    const kw = keyword.toLowerCase().trim();
    if (!kw) return { found: true, original: '', matchedWord: '' };

    // Multi-word phrase check (e.g. "next to", "in front of", "in order to", "wait for")
    if (kw.includes(' ')) {
      const kwWords = kw.split(/\s+/);
      
      // 1. Direct regex match on raw sentence
      const escaped = kwWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
      if (new RegExp('\\b' + escaped + '\\b', 'i').test(rawSentence)) {
        return { found: true, original: keyword, matchedWord: kw, type: 'exact_phrase' };
      }

      // 2. Inflected phrase match (e.g. "waiting for" matching "wait for")
      for (let i = 0; i <= tokens.length - kwWords.length; i++) {
        let allMatch = true;
        let matchedTokens = [];
        for (let j = 0; j < kwWords.length; j++) {
          const t = tokens[i + j];
          const kwW = kwWords[j];
          const tStem = stem(t);
          const kwWStem = stem(kwW);
          const matchSingle = (t === kwW || tStem === kwWStem || VERB_LEMMAS[t] === kwW || NOUN_LEMMAS[t] === kwW);
          if (!matchSingle) {
            allMatch = false;
            break;
          }
          matchedTokens.push(t);
        }
        if (allMatch) {
          return { found: true, original: keyword, matchedWord: matchedTokens.join(' '), type: 'inflected_phrase' };
        }
      }

      return { found: false, original: keyword, matchedWord: null };
    }

    // Single word keyword
    const kwStem = stem(kw);
    const kwLemma = VERB_LEMMAS[kw] || NOUN_LEMMAS[kw] || kw;

    for (const t of tokens) {
      // 1. Exact match
      if (t === kw) {
        return { found: true, original: keyword, matchedWord: t, type: 'exact' };
      }

      // 2. Stem & Lemma match
      const tStem = stem(t);
      const tLemma = VERB_LEMMAS[t] || NOUN_LEMMAS[t] || t;
      if (tStem === kwStem || tLemma === kwLemma || tStem === kw || t === kwStem || tLemma === kw) {
        return { found: true, original: keyword, matchedWord: t, type: 'inflection' };
      }
    }

    return { found: false, original: keyword, matchedWord: null };
  }

  // Analyze single sentence format & punctuation
  function analyzeSentenceStructure(rawText) {
    const issues = [];
    const text = rawText.trim();

    if (!text) {
      issues.push({ type: 'error', message: 'Bạn chưa nhập câu trả lời.' });
      return { isValidSingleSentence: false, issues, wordCount: 0 };
    }

    // Check capital letter at start
    const firstChar = text.charAt(0);
    const hasCapital = firstChar === firstChar.toUpperCase() && /[A-Z]/.test(firstChar);
    if (!hasCapital) {
      issues.push({ type: 'warning', message: 'Câu nên bắt đầu bằng chữ cái viết hoa.' });
    }

    // Check ending punctuation
    const endsWithPunct = /[.!?]$/.test(text);
    if (!endsWithPunct) {
      issues.push({ type: 'warning', message: 'Câu phải kết thúc bằng dấu câu thích hợp (dấu chấm .).' });
    }

    // Check for multiple sentences (TOEIC Writing Part 1 rule: exactly ONE sentence)
    const sanitized = text
      .replace(/\b(mr|mrs|ms|dr|vs|etc|e\.g|i\.e)\./gi, '$1_dot_')
      .replace(/\b(a\.m|p\.m)\./gi, '$1_dot_');
    const sentenceSplit = sanitized.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);

    let isMultiSentence = sentenceSplit.length > 1;
    if (isMultiSentence) {
      issues.push({
        type: 'error',
        message: `Quy chuẩn TOEIC Part 1 chỉ viết duy nhất 1 câu. Bạn đang viết ${sentenceSplit.length} câu riêng biệt.`
      });
    }

    // Semicolon check
    if (text.includes(';')) {
      const parts = text.split(';').map(p => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        issues.push({
          type: 'info',
          message: 'Sử dụng dấu chấm phẩy (;) để liên kết 2 mệnh đề độc lập thành 1 câu phức hợp là hợp lệ theo chuẩn ETS.'
        });
      }
    }

    const wordCount = tokenize(text).length;
    if (wordCount < 4) {
      issues.push({ type: 'warning', message: 'Câu quá ngắn (dưới 4 từ), khó thể hiện đầy đủ cấu trúc ngữ pháp.' });
    } else if (wordCount > 35) {
      issues.push({ type: 'warning', message: 'Câu quá dài (trên 35 từ), dễ mắc lỗi câu lê thê (run-on sentence).' });
    }

    const isValid = !isMultiSentence && wordCount >= 3;
    return { isValidSingleSentence: isValid, issues, wordCount, isMultiSentence };
  }

  // Grammar & syntax heuristics for Part 1
  function analyzeGrammarHeuristics(rawText, tokens) {
    const issues = [];
    const lower = rawText.toLowerCase().trim();

    // 1. Missing main verb check
    const hasVerbLike = tokens.some(t => {
      const s = stem(t);
      return VERB_LEMMAS[t] || VERB_LEMMAS[s] || ['is', 'are', 'was', 'were', 'has', 'have', 'had', 'will', 'can', 'should', 'must'].includes(t);
    });
    if (!hasVerbLike && tokens.length > 3) {
      issues.push({ type: 'error', message: 'Không phát hiện động từ chính trong câu. Một câu hoàn chỉnh bắt buộc phải có Vị ngữ.' });
    }

    // 2. Subject-Verb Agreement checks
    if (/\b(the woman|the man|he|she|it|someone|a person)\s+(are|were|have)\b/i.test(lower)) {
      issues.push({ type: 'error', message: 'Lỗi hoà hợp Chủ ngữ - Động từ: Chủ ngữ số ít không đi với are/were/have.' });
    }
    if (/\b(the women|the men|they|people|the children)\s+(is|was|has)\b/i.test(lower)) {
      issues.push({ type: 'error', message: 'Lỗi hoà hợp Chủ ngữ - Động từ: Chủ ngữ số nhiều không đi với is/was/has.' });
    }

    // 3. Double verb error (e.g., "The woman is shop clothes")
    if (/\b(is|are|was|were)\s+(walk|shop|buy|choose|sit|stand|look|clean|talk|wear|hold|read|write)\b/i.test(lower)) {
      issues.push({ type: 'error', message: 'Lỗi cấu trúc thì tiếp diễn: Sau be (is/are) cần dùng V-ing (ví dụ: is shopping, are choosing).' });
    }

    // 4. Repeated consecutive words
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i] === tokens[i + 1] && !['that', 'had'].includes(tokens[i])) {
        issues.push({ type: 'warning', message: `Từ "${tokens[i]}" bị lặp lại 2 lần liên tiếp.` });
      }
    }

    return issues;
  }

  // Rule: sentence must name its subject (a noun phrase) BEFORE using a pronoun.
  // A Part-1 sentence that BEGINS with "he/she/they/we/you" leaves the examiner
  // guessing who is being described, so it is treated as an error.
  function checkClearAntecedent(rawText, tokens) {
    const SUBJECT_PRONOUNS = ['he', 'she', 'they', 'we', 'you'];
    if (tokens.length > 0 && SUBJECT_PRONOUNS.includes(tokens[0])) {
      return {
        passed: false,
        detail: `Câu mở đầu bằng đại từ "${tokens[0]}" nhưng chưa nêu danh từ chủ thể (vd: The woman, Two men, A customer...). Giám khảo không biết "${tokens[0]}" ám chỉ ai — hãy nêu người/vật cụ thể trước.`
      };
    }
    return { passed: true, detail: 'Đã nêu chủ thể cụ thể trước khi dùng đại từ (nếu có)' };
  }

  // MAIN EVALUATION FUNCTION
  function evaluatePart1(userSentence, promptObj) {
    const raw = (userSentence || '').trim();
    const tokens = tokenize(raw);

    const requiredKeywords = promptObj.keywords || [];
    const kwChecks = requiredKeywords.map(kw => checkKeywordMatch(kw, raw, tokens));
    const matchedCount = kwChecks.filter(c => c.found).length;
    const totalKeywords = requiredKeywords.length;

    const struct = analyzeSentenceStructure(raw);
    const grammarIssues = analyzeGrammarHeuristics(raw, tokens);
    const antecedentCheck = checkClearAntecedent(raw, tokens);
    // Antecedent violation counts as a grammar "error" for scoring purposes
    // (it prevents a 3/3 because the subject is ambiguous), but is reported
    // through its own dedicated criterion & message.
    const effectiveErrors = antecedentCheck.passed
      ? grammarIssues.filter(i => i.type === 'error')
      : [...grammarIssues.filter(i => i.type === 'error'), { type: 'error' }];

    let score = 0;
    let label = 'Score 0 - Không Đạt';
    let feedback = '';

    if (!raw || tokens.length === 0) {
      score = 0;
      label = 'Score 0 - Chưa Nhập Câu';
      feedback = 'Bạn chưa nhập câu trả lời. Hãy viết một câu miêu tả bức tranh dựa trên 2 từ khoá bắt buộc.';
    } else if (struct.isMultiSentence) {
      score = 0;
      label = 'Score 0 - Vi Phạm Quy Chuẩn';
      feedback = 'Bạn đã viết nhiều hơn 1 câu. Tiêu chuẩn TOEIC Writing Part 1 quy định CHỈ ĐƯỢC VIẾT DUY NHẤT 1 CÂU.';
    } else if (matchedCount === 0) {
      score = 0;
      label = 'Score 0 - Chưa Đạt Yêu Cầu Từ Khoá';
      feedback = 'Câu của bạn không chứa bất kỳ từ khoá bắt buộc nào trong số 2 từ cho trước.';
    } else if (matchedCount === 1) {
      const hasMajorGrammarError = effectiveErrors.length > 0;
      if (hasMajorGrammarError || !struct.isValidSingleSentence) {
        score = 1;
        label = 'Score 1 - Cần Cải Thiện';
        feedback = 'Câu chỉ sử dụng được 1 từ khoá và còn mắc lỗi ngữ pháp cấu trúc.';
      } else {
        score = 2;
        label = 'Score 2 - Khá Tốt';
        feedback = 'Câu viết đúng ngữ pháp nhưng mới chỉ sử dụng được 1 trong 2 từ khoá bắt buộc.';
      }
    } else if (matchedCount >= totalKeywords) {
      const errors = effectiveErrors;
      const warnings = grammarIssues.filter(i => i.type === 'warning');
      // Per the official ETS rubric, 3 points requires a sentence that is
      // fully correct: no grammar error, no spelling/punctuation warning,
      // correct single-sentence format. Any error or structure warning
      // (missing capital, missing period, run-on, repeated word) caps at 2.
      const structWarnings = struct.issues.filter(i => i.type === 'warning');
      const hasStructIssue = structWarnings.length > 0;

      if (errors.length === 0 && warnings.length === 0 && !hasStructIssue && struct.isValidSingleSentence) {
        score = 3;
        label = 'Score 3 - Xuất Sắc (Chuẩn ETS)';
        feedback = 'Tuyệt vời! Câu của bạn sử dụng đầy đủ 2 từ khoá bắt buộc, đúng ngữ pháp, chuẩn chính tả và tuân thủ hoàn hảo quy chuẩn 1 câu của ETS.';
      } else if (errors.length === 0 && (warnings.length > 0 || hasStructIssue)) {
        score = 2;
        label = 'Score 2 - Khá Tốt';
        feedback = 'Câu dùng đủ 2 từ khoá nhưng còn lỗi chính tả/dấu câu hoặc lặp từ cần sửa (viết hoa đầu câu, kết thúc bằng dấu chấm...) để đạt điểm tối đa.';
      } else if (errors.length <= 1) {
        score = 2;
        label = 'Score 2 - Khá Tốt';
        feedback = 'Câu sử dụng đủ 2 từ khoá nhưng có lỗi ngữ pháp cần lưu ý sửa đổi (chủ ngữ rõ ràng / cấu trúc).';
      } else {
        score = 1;
        label = 'Score 1 - Cần Cải Thiện';
        feedback = 'Câu có đủ 2 từ khoá nhưng mắc nhiều lỗi ngữ pháp hoặc diễn đạt chưa tự nhiên.';
      }
    }

    const allIssues = [...struct.issues, ...grammarIssues];

    const criteria = [
      {
        name: 'Sử dụng đủ 2 từ khoá bắt buộc',
        passed: matchedCount === totalKeywords,
        detail: `Đã dùng ${matchedCount}/${totalKeywords} từ khoá: ` +
          kwChecks.map(c => `${c.original} (${c.found ? 'đạt' : 'chưa có'})`).join(', ')
      },
      {
        name: 'Viết đúng duy nhất MỘT câu',
        passed: !struct.isMultiSentence && raw.length > 0,
        detail: struct.isMultiSentence ? 'Viết nhiều hơn 1 câu riêng biệt' : 'Đúng chuẩn 1 câu đơn/ghép/phức'
      },
      {
        name: 'Chủ ngữ rõ ràng (không mở đầu bằng đại từ mơ hồ)',
        passed: antecedentCheck.passed,
        detail: antecedentCheck.detail
      },
      {
        name: 'Đúng cấu trúc ngữ pháp & vị ngữ',
        passed: !grammarIssues.some(i => i.type === 'error'),
        detail: grammarIssues.some(i => i.type === 'error')
          ? grammarIssues.filter(i => i.type === 'error').map(i => i.message).join(' ')
          : 'Ngữ pháp cơ bản chính xác'
      },
      {
        name: 'Chính tả & Dấu câu chuẩn mực',
        passed: !struct.issues.some(i => i.type === 'warning' || i.type === 'error'),
        detail: struct.issues.length > 0 ? struct.issues.map(i => i.message).join(' ') : 'Viết hoa đầu câu và kết thúc bằng dấu chấm chuẩn'
      }
    ];

    return {
      score,
      label,
      feedback,
      matchedCount,
      totalKeywords,
      kwChecks,
      criteria,
      issues: allIssues,
      tokens,
      wordCount: struct.wordCount,
      sampleAnswer: promptObj.sample_answer || '',
      grammarTip: promptObj.grammar_tip || ''
    };
  }

  // Export to window
  window.ToeicEvaluator = {
    evaluate: evaluatePart1,
    tokenize,
    stem,
    checkKeywordMatch,
    analyzeSentenceStructure,
    checkClearAntecedent
  };

})(typeof window !== 'undefined' ? window : this);
