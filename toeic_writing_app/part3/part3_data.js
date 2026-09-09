// ============================================================================
// TOEIC WRITING PART 3 — OPINION ESSAY QUESTION BANK (Question 8)
// ----------------------------------------------------------------------------
// Nguồn: bộ đề thật do người dùng cung cấp (Google Doc "KAIZEN: Chữa đề thi
// TOEIC Writing" + ảnh chụp). Mỗi mục = 1 đề Q8.
//   - set/exam_date: đề thi thật (có ngày nếu biết)
//   - has_sample:false + sample_answer:"" = CHƯA có bài mẫu (đề chỉ có câu hỏi)
// ============================================================================

// ETS CHUẨN: Q8 "Write an opinion essay" — nêu, giải thích, bảo vệ quan điểm;
// bài hiệu quả thường ≥ 300 từ; 30 phút; chấm thang 0–5.

const TOEIC_PART3_DATA = [
  {
    "id": "P3_01",
    "category": "education",
    "category_vi": "Học tập & Giáo dục",
    "topic": "Best way to learn a new language",
    "difficulty": "medium",
    "exam_date": "29/08/2026 - Vietnam",
    "prompt": "Some people believe that the best way to learn a new language is by using computer software, while others think that listening to the radio or keeping a personal journal is more effective. In your essay, state, explain, and support your opinion on which is the best way to learn a new language.",
    "prompt_vi": "Một số người cho rằng cách tốt nhất để học một ngôn ngữ mới là dùng phần mềm máy tính, trong khi những người khác nghĩ rằng nghe đài radio hoặc viết nhật ký cá nhân hiệu quả hơn. Trong bài luận, hãy nêu, giải thích và bảo vệ quan điểm của bạn về cách học ngôn ngữ mới tốt nhất.",
    "has_sample": true,
    "sample_answer": "Language learners often question which method is the most effective for mastering a new language: using computer software, listening to the radio, or keeping a personal journal. Some believe computer software is ideal, while others argue for the benefits of daily journaling. To me, I believe listening to the radio is the most crucial method for language acquisition. In this essay, I will present reasons and examples to support my choice.\n\nTo begin, listening to the radio provides exposure to authentic and natural conversations. The reason is that radio presenters speak at a normal speed, use everyday vocabulary, and express real emotions, which helps learners understand how the language is truly spoken. For example, when students listen to news broadcasts or talk shows, they can hear proper pronunciation and local idioms. This constant exposure allows their brains to naturally absorb the rhythm and intonation of the language without relying on artificial textbook dialogues.\n\nFurthermore, tuning into radio programs plays a crucial role in improving listening comprehension through passive learning. This is because learners can practice while doing other daily activities, making it easier to build a consistent study habit. When I first started learning English, I struggled with understanding native speakers and finding time to study. My goal was to establish a daily listening routine to improve my comprehension skills. I set my smartphone to play a popular English radio station every morning while I cooked breakfast and commuted to work, ensuring I listened for at least thirty minutes a day. Over time, this disciplined approach not only increased my vocabulary but also improved my ability to catch fast-spoken words, demonstrating how crucial radio listening is to language success.\n\nIn conclusion, while software and journals have their merits, listening to the radio remains the most practical and effective way to master a language. It offers genuine linguistic exposure and allows learners to seamlessly integrate studying into their daily routines.",
    "model_ideas": [
      "Radio provides authentic, natural exposure to real pronunciation and idioms",
      "Passive listening builds a consistent daily study habit",
      "Software and journaling help, but radio best develops listening skills"
    ]
  },
  {
    "id": "P3_02",
    "category": "education",
    "category_vi": "Học tập & Giáo dục",
    "topic": "Online learning vs. classroom learning",
    "difficulty": "medium",
    "exam_date": "",
    "prompt": "In your opinion, what are the benefits and drawbacks of online learning compared to classroom learning? In your essay, state, explain, and support your opinion.",
    "prompt_vi": "Theo bạn, đâu là lợi ích và hạn chế của việc học trực tuyến so với học tại lớp? Trong bài luận, hãy nêu, giải thích và bảo vệ quan điểm của bạn.",
    "has_sample": false,
    "sample_answer": "",
    "model_ideas": [
      "Benefit: flexibility of time and location for online learning",
      "Drawback: less face-to-face interaction and self-discipline challenges",
      "Classroom offers structure and immediate feedback but less scheduling freedom"
    ]
  },
  {
    "id": "P3_03",
    "category": "workplace",
    "category_vi": "Môi trường công sở",
    "topic": "Sharing information: hold a meeting or send an email",
    "difficulty": "medium",
    "exam_date": "19/08/2026 - Vietnam",
    "prompt": "When sharing important information, should leaders hold a meeting or send an email? In your essay, state, explain, and support your opinion on which approach is more effective for leaders.",
    "prompt_vi": "Khi chia sẻ thông tin quan trọng, nhà lãnh đạo nên tổ chức một cuộc họp hay gửi một email? Trong bài luận, hãy nêu, giải thích và bảo vệ quan điểm của bạn về cách tiếp cận hiệu quả hơn.",
    "has_sample": true,
    "sample_answer": "Sharing important information is a critical task for leaders in the modern workplace. Some believe sending an email is sufficient, while others argue for the power of holding a meeting. To me, I believe holding a meeting is the most effective approach for leaders. In this essay, I will present reasons and examples to support my choice.\n\nTo begin, holding a meeting is a cornerstone of effective leadership communication. The reason is that direct interaction allows leaders to clarify complex details and ensure everyone understands the message immediately. For example, a recent business survey showed that teams who held in-person meetings for major announcements resolved misunderstandings much faster than those who only used digital messages, proving that direct communication always secures better team alignment and productivity.\n\nFurthermore, building team connection plays a crucial role in sharing critical news. This is because gathering the team together helps employees feel valued and united during important company transitions. When I first started working as a project manager, I struggled with confused team members after sending a long email about a new policy. My goal was to improve communication and build better trust within my department. I set up brief weekly meetings, created a welcoming environment, and committed to explaining new updates face-to-face regardless of my busy schedule. Over time, this direct approach not only reduced confusion but also improved the overall morale of my staff, demonstrating how crucial face-to-face interaction is to effective leadership.\n\nIn conclusion, holding a meeting is undeniably superior to sending emails when sharing important information. It not only ensures clear understanding but also strengthens team spirit within the organization. By choosing this approach, leaders can achieve their highest professional goals.",
    "model_ideas": [
      "Meetings allow immediate clarification of complex information",
      "Face-to-face interaction strengthens team connection and morale",
      "Emails are convenient but can cause misunderstandings for key news"
    ]
  }
];

// Export tương thích cả browser lẫn Node (giữ phong cách part2_data.js)
if (typeof window !== 'undefined') {
  window.TOEIC_PART3_DATA = TOEIC_PART3_DATA;
  window.TOEIC_PART3_QUESTIONS = TOEIC_PART3_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TOEIC_PART3_DATA;
}
