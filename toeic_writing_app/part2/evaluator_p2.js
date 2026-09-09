(function(globalWindow) {
    'use strict';

    const ToeicP2Evaluator = {
        evaluate: function(userResponse, question) {
            userResponse = userResponse || '';
            const text = userResponse.trim();
            const words = text.split(/\s+/).filter(w => w.length > 0);
            const wordCount = words.length;

            const result = {
                score: 0,
                badge: 'Score 0/4 - Chưa Đạt',
                label: 'Score 0/4 - Chưa Đạt',
                scoreColor: '#94a3b8',
                scoreClass: 'score-0',
                isAi: false,
                criteria: [],
                feedback: [],
                sampleAnswer: question ? question.sample_answer : '',
                taskCompletion: { completed: 0, total: 0 }
            };

            if (!text || wordCount === 0) {
                result.feedback.push({ type: 'error', icon: '', text: 'Bài viết bỏ trống.' });
                this._setScore(result, 0);
                return result;
            }

            if (wordCount < 10) {
                result.feedback.push({ type: 'error', icon: '', text: 'Bài viết quá ngắn, không đủ để chấm điểm.' });
                this._setScore(result, 0);
                return result;
            }

            // Rubric Score 0: not written in English / gibberish (few real letters)
            const alphaChars = (text.match(/[a-zA-Z]/g) || []).length;
            const latinRatio = text.length > 0 ? alphaChars / text.length : 0;
            if (latinRatio < 0.5 || alphaChars < 30) {
                result.feedback.push({ type: 'error', icon: '', text: 'Bài viết không phải tiếng Anh hoặc chứa ký tự không hợp lệ (rubric Score 0).' });
                this._setScore(result, 0);
                return result;
            }

            // Simple plagiarism check (copying prompt)
            const promptText = question && question.email ? question.email.body : '';
            if (promptText && promptText.length > 20) {
                const cleanedResponse = text.toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanedPrompt = promptText.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (cleanedPrompt.includes(cleanedResponse) && cleanedResponse.length > 50) {
                    result.feedback.push({ type: 'error', icon: '', text: 'Bài viết sao chép từ đề bài.' });
                    this._setScore(result, 0);
                    return result;
                }
            }

            // Rubric Score 0/1: content is off-topic (does not address the email at all)
            if (promptText && promptText.length > 20) {
                const pWords = promptText.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
                const topicHits = pWords.filter(w => text.toLowerCase().includes(w)).length;
                if (topicHits === 0) {
                    result.feedback.push({ type: 'error', icon: '', text: 'Bài viết không liên quan đến nội dung email/đề bài (rubric Score 0-1).' });
                    this._setScore(result, 0);
                    return result;
                }
            }

            // Evaluate criteria
            const formatEval = this._evaluateFormat(text);
            const taskEval = this._evaluateTaskCompletion(text, question);
            const languageEval = this._evaluateLanguage(text, words);
            const toneEval = this._evaluateTone(text);

            result.taskCompletion = taskEval.stats;
            result.tasks = taskEval.tasks || [];

            result.criteria = [
                { name: 'Hoàn thành yêu cầu đề', passed: taskEval.score >= 3, detail: `Đáp ứng ${taskEval.stats.completed}/${taskEval.stats.total} yêu cầu` },
                { name: 'Cấu trúc Email', passed: formatEval.score >= 2, detail: formatEval.detail },
                { name: 'Từ vựng & Ngữ pháp', passed: languageEval.score >= 2, detail: languageEval.detail },
                { name: 'Giọng điệu & Phong cách', passed: toneEval.score >= 1, detail: toneEval.detail }
            ];

            result.feedback = [...taskEval.feedback, ...formatEval.feedback, ...languageEval.feedback, ...toneEval.feedback];
            result.messages = result.feedback;
            result.improved = '';

            // Determine final score based on the rubric
            let finalScore = 0;
            const completedTasks = taskEval.stats.completed;
            const totalTasks = taskEval.stats.total;

            if (completedTasks === totalTasks && totalTasks > 0) {
                if (formatEval.score >= 2 && toneEval.score >= 1 && languageEval.score >= 2) {
                    finalScore = 4;
                } else {
                    finalScore = 3;
                }
            } else if (completedTasks === totalTasks - 1 && totalTasks > 1) {
                finalScore = 3;
            } else if (completedTasks >= 1) {
                finalScore = 2;
            } else {
                finalScore = 1;
            }

            if (wordCount < 30 && finalScore > 2) finalScore = 2;

            this._setScore(result, finalScore);

            return result;
        },

        _setScore: function(result, score) {
            result.score = score;
            switch(score) {
                case 4:
                    result.badge = result.label = 'Score 4/4 - Xuất Sắc';
                    result.scoreColor = '#10b981';
                    result.scoreClass = 'score-4';
                    break;
                case 3:
                    result.badge = result.label = 'Score 3/4 - Tốt';
                    result.scoreColor = '#3b82f6';
                    result.scoreClass = 'score-3';
                    break;
                case 2:
                    result.badge = result.label = 'Score 2/4 - Cần Cải Thiện';
                    result.scoreColor = '#f59e0b';
                    result.scoreClass = 'score-2';
                    break;
                case 1:
                    result.badge = result.label = 'Score 1/4 - Yếu';
                    result.scoreColor = '#ef4444';
                    result.scoreClass = 'score-1';
                    break;
                case 0:
                default:
                    result.badge = result.label = 'Score 0/4 - Chưa Đạt';
                    result.scoreColor = '#94a3b8';
                    result.scoreClass = 'score-0';
                    break;
            }
        },

        _evaluateFormat: function(text) {
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            let hasGreeting = false;
            let hasClosing = false;
            
            if (lines.length > 0) {
                const firstLine = lines[0].toLowerCase();
                if (firstLine.match(/^(dear|hi|hello|to|good (morning|afternoon|evening))/)) {
                    hasGreeting = true;
                }
            }
            if (lines.length > 1) {
                const lastLine = lines[lines.length - 1].toLowerCase();
                const secondLastLine = lines[lines.length - 2].toLowerCase();
                if (lastLine.match(/^(sincerely|best regards|regards|thank you|thanks|best wishes|yours)/) ||
                    secondLastLine.match(/^(sincerely|best regards|regards|thank you|thanks|best wishes|yours)/)) {
                    hasClosing = true;
                }
            }

            const score = (hasGreeting ? 1 : 0) + (hasClosing ? 1 : 0);
            const feedback = [];
            let detail = 'Có lời chào, thân bài, kết thư';

            if (!hasGreeting) {
                feedback.push({ type: 'warning', icon: '', text: 'Thiếu lời chào (Dear, Hi,...).' });
                detail = 'Thiếu lời chào';
            }
            if (!hasClosing) {
                feedback.push({ type: 'warning', icon: '', text: 'Thiếu kết thư (Best regards, Sincerely,...).' });
                detail = hasGreeting ? 'Thiếu kết thư' : 'Thiếu lời chào và kết thư';
            }

            return { score, detail, feedback };
        },

        _evaluateTaskCompletion: function(text, question) {
            let total = 0;
            let completed = 0;
            const feedback = [];
            const textLower = text.toLowerCase();

            if (!question || !question.tasks || question.tasks.length === 0) {
                total = 2;
                const numQuestions = (text.match(/\?/g) || []).length;
                if (numQuestions > 0) completed++;
                if (textLower.match(/(suggest|recommend|advise|you should|how about|what about|could you|please)/)) completed++;
                
                if (completed >= total) {
                    feedback.push({ type: 'success', icon: '', text: 'Có vẻ bạn đã trả lời các yêu cầu.' });
                } else if (completed > 0) {
                    feedback.push({ type: 'warning', icon: '', text: 'Chỉ trả lời được một phần yêu cầu.' });
                } else {
                    feedback.push({ type: 'error', icon: '', text: 'Không thấy dấu hiệu trả lời yêu cầu đề.' });
                }
            } else {
                total = question.total_tasks || question.tasks.reduce((sum, t) => sum + (t.count || 1), 0);
                const taskList = [];
                
                for (const task of question.tasks) {
                    const taskType = task.type || '';
                    const taskCount = task.count || 1;
                    let foundForTaskType = 0;

                    if (taskType.includes('ask')) {
                        const numQuestions = (text.match(/\?/g) || []).length;
                        const embeddedQuestions = (textLower.match(/(i would like to know|could you tell me|please let me know)/g) || []).length;
                        foundForTaskType = Math.min(numQuestions + embeddedQuestions, taskCount);
                    } else if (taskType.includes('suggest') || taskType.includes('recommend')) {
                        const suggestions = (textLower.match(/(suggest|recommend|advise|you should|how about|what about|would be better|why don't you)/g) || []).length;
                        foundForTaskType = Math.min(suggestions, taskCount);
                    } else if (taskType.includes('explain') || taskType.includes('problem')) {
                        const problems = (textLower.match(/(problem|issue|trouble|difficult|unable|cannot|unfortunately|conflict)/g) || []).length;
                        foundForTaskType = problems > 0 ? Math.min(problems, taskCount) : (text.length > 50 ? taskCount : 0);
                    } else if (taskType.includes('information') || taskType.includes('detail')) {
                        if (text.length > 50) foundForTaskType = taskCount;
                    } else {
                         if (text.length > 50) foundForTaskType = taskCount;
                    }

                    taskList.push({
                        type: taskType,
                        count: taskCount,
                        completed: foundForTaskType >= taskCount
                    });

                    completed += foundForTaskType;
                }
                
                completed = Math.min(completed, total);

                if (completed === total) {
                    feedback.push({ type: 'success', icon: '', text: 'Bạn đã trả lời đầy đủ các yêu cầu.' });
                } else if (completed > 0) {
                    feedback.push({ type: 'warning', icon: '', text: `Bạn trả lời được ${completed}/${total} yêu cầu.` });
                } else {
                    feedback.push({ type: 'error', icon: '', text: 'Bạn chưa trả lời đúng các yêu cầu của đề bài.' });
                }
                return { score: completed, stats: { completed, total }, tasks: taskList, feedback };
            }

            return { score: completed, stats: { completed, total }, feedback };
        },

        _evaluateLanguage: function(text, words) {
            const feedback = [];
            let score = 2;
            let detail = 'Từ vựng & ngữ pháp ở mức trung bình';

            const sentences = text.split(/[.?!]+/).filter(s => s.trim().length > 0);
            
            if (words.length < 50) {
                feedback.push({ type: 'warning', icon: '', text: 'Bài viết khá ngắn (dưới 50 từ). Hãy viết thêm chi tiết.' });
                score--;
            } else if (words.length >= 80) {
                feedback.push({ type: 'success', icon: '', text: 'Độ dài bài viết rất tốt.' });
                score++;
            }

            const transitions = (text.toLowerCase().match(/(however|therefore|additionally|furthermore|moreover|in addition|also|besides|on the other hand|for example)/g) || []);
            if (transitions.length > 0) {
                feedback.push({ type: 'success', icon: '', text: 'Có sử dụng từ nối tốt.' });
                score++;
                detail = 'Dùng từ nối tốt, đa dạng câu';
            } else {
                feedback.push({ type: 'warning', icon: '', text: 'Nên sử dụng thêm từ nối (however, therefore,...) để liên kết ý rõ ràng hơn.' });
                detail = 'Thiếu từ nối, liên kết ý mờ nhạt';
            }

            return { score: Math.min(Math.max(score, 0), 4), detail, feedback };
        },

        _evaluateTone: function(text) {
            const feedback = [];
            let score = 1;
            let detail = 'Giọng điệu phù hợp';
            
            const casualWords = (text.toLowerCase().match(/(wanna|gonna|kinda|dunno|lol|omg|btw)/g) || []);
            if (casualWords.length > 0) {
                feedback.push({ type: 'warning', icon: '', text: 'Tránh dùng từ ngữ quá thân mật (wanna, gonna, btw...) trong email công việc.' });
                score = 0;
                detail = 'Giọng điệu chưa chuyên nghiệp';
            } else {
                score = 2;
            }

            return { score, detail, feedback };
        }
    };

    globalWindow.ToeicP2Evaluator = ToeicP2Evaluator;

})(typeof window !== 'undefined' ? window : global);
