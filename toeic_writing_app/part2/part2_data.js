// TOEIC WRITING PART 2 - AUTHENTIC QUESTION BANK (30 ETS QUESTIONS)
// 10 SEC Exam Questions + 20 Authentic Business Email Exam Questions with Full Model Answers

const TOEIC_PART2_DATA = [
  {
    "id": "P2_01",
    "category": "invitation",
    "category_vi": "Lời mời",
    "difficulty": "medium",
    "email": {
      "from": "George Pinkney",
      "to": "Social Committee members",
      "subject": "Meeting",
      "date": "April 12, 9:15 A.M.",
      "body": "Dear Members,\n\nI want to remind you that the Social Committee meeting is this Friday at 3:00 P.M. in the conference room. If you cannot attend, please contact me immediately.\n\nWe will be planning the company anniversary dinner. I hope to see you all there.\n\nBest regards,\nGeorge Pinkney"
    },
    "directions": "Respond to the e-mail as if you are a member of the Social Committee. In your e-mail, explain ONE problem and make TWO suggestions.",
    "directions_vi": "Viết email trả lời như thể bạn là một thành viên của Ủy ban Xã hội. Trong email của bạn, giải thích MỘT vấn đề và đưa ra HAI đề xuất.",
    "tasks": [
      {
        "type": "explain_problem",
        "count": 1
      },
      {
        "type": "make_suggestion",
        "count": 2
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Mr. Pinkney,\n\nThank you for the reminder about our Social Committee meeting this Friday. Unfortunately, I will not be able to attend at 3:00 P.M. because I have a pre-scheduled client presentation that I cannot reschedule.\n\nTo ensure our planning stays on track, I suggest that we reschedule the meeting to Thursday afternoon at 2:00 P.M. when most members are free. Alternatively, I suggest that we share a digital document beforehand so absent members can submit their dinner venue ideas and catering preferences online.\n\nI apologize for any inconvenience and look forward to hearing your decision.\n\nBest regards,\n[Your Name]",
    "key_phrases": [
      "Thank you for the reminder",
      "Unfortunately, I will not be able to attend because",
      "I suggest that we reschedule",
      "Alternatively, I suggest that we share"
    ],
    "set": "sec",
    "sec_id": 1
  },
  {
    "id": "P2_02",
    "category": "inquiry",
    "category_vi": "Hỏi thông tin",
    "difficulty": "medium",
    "email": {
      "from": "Journal of Business News",
      "to": "Prospective Subscribers",
      "subject": "Subscription inquiry",
      "date": "October 5, 2:30 P.M.",
      "body": "Dear Reader,\n\nThank you for your interest in the Journal of Business News. We provide top-tier market analysis, executive interviews, and financial forecasts.\n\nIf you have any questions regarding our subscription options or delivery services, please do not hesitate to contact us.\n\nSincerely,\nSubscription Department\nJournal of Business News"
    },
    "directions": "Respond to the e-mail as if you are a businessperson interested in subscribing to the Journal of Business News. In your e-mail, ask THREE questions.",
    "directions_vi": "Viết email trả lời như thể bạn là một doanh nhân muốn đăng ký tạp chí Journal of Business News. Trong email, hãy hỏi BA câu hỏi.",
    "tasks": [
      {
        "type": "ask_question",
        "count": 3
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Subscription Department,\n\nThank you for reaching out regarding subscription options for the Journal of Business News. I am very interested in subscribing for our corporate office.\n\nBefore finalizing my order, I would like to ask a few questions. First, what is the annual subscription rate for a digital and print bundle? Second, do you offer corporate group discounts for companies purchasing more than ten accounts? Finally, how frequently is the journal published and delivered to international addresses?\n\nThank you for your time and assistance. I look forward to receiving your response.\n\nSincerely,\n[Your Name]",
    "key_phrases": [
      "Thank you for reaching out",
      "I would like to ask a few questions",
      "What is the annual subscription rate",
      "Do you offer corporate group discounts",
      "How frequently is the journal published"
    ],
    "set": "sec",
    "sec_id": 2
  },
  {
    "id": "P2_03",
    "category": "event",
    "category_vi": "Sự kiện",
    "difficulty": "medium",
    "email": {
      "from": "James Parker, Office Manager",
      "to": "All Employees",
      "subject": "Move to the new building",
      "date": "June 14, 11:00 A.M.",
      "body": "Dear Staff,\n\nAs you know, our company will relocate to the new headquarters next month. We need volunteers to help coordinate packing and organizing departments over the upcoming weekend.\n\nPlease let me know your availability and any questions you might have regarding the move.\n\nBest regards,\nJames Parker\nOffice Manager"
    },
    "directions": "Respond to the e-mail as if you are an employee of James Parker. In your e-mail, suggest ONE time that you would like to participate and ask TWO questions.",
    "directions_vi": "Viết email trả lời như thể bạn là một nhân viên của James Parker. Trong email, hãy đề xuất MỘT thời gian bạn muốn tham gia và hỏi HAI câu hỏi.",
    "tasks": [
      {
        "type": "make_suggestion",
        "count": 1
      },
      {
        "type": "ask_question",
        "count": 2
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Mr. Parker,\n\nThank you for your email regarding our upcoming office relocation. I would be very glad to volunteer and assist with the transition.\n\nI suggest that I participate on Saturday morning from 9:00 A.M. to 1:00 P.M., as I am fully available during that window. Regarding the moving logistics, will the company provide packing crates and labeling markers in advance? Also, where should we park our vehicles at the new building during moving days?\n\nPlease let me know if this schedule works for the team.\n\nBest regards,\n[Your Name]",
    "key_phrases": [
      "Thank you for your email regarding",
      "I suggest that I participate on",
      "Will the company provide packing crates",
      "Where should we park our vehicles"
    ],
    "set": "sec",
    "sec_id": 3
  },
  {
    "id": "P2_04",
    "category": "service",
    "category_vi": "Dịch vụ",
    "difficulty": "medium",
    "email": {
      "from": "Passageways Travel",
      "to": "Valued Customer",
      "subject": "Travel package inquiry",
      "date": "August 20, 1:45 P.M.",
      "body": "Dear Customer,\n\nThank you for choosing Passageways Travel for your upcoming vacation. We have received your inquiry about our European holiday tour package.\n\nPlease let us know if you need additional details or wish to customize your itinerary.\n\nWarm regards,\nPassageways Travel Team"
    },
    "directions": "Respond to the e-mail as if you are a Passageways Travel customer. In your e-mail, ask TWO questions and make ONE request regarding the travel package.",
    "directions_vi": "Viết email trả lời như thể bạn là khách hàng của Passageways Travel. Trong email, hãy hỏi HAI câu hỏi và đưa ra MỘT yêu cầu về gói du lịch.",
    "tasks": [
      {
        "type": "ask_question",
        "count": 2
      },
      {
        "type": "make_request",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Passageways Travel Team,\n\nThank you for contacting me regarding the European holiday tour package. I am looking forward to this trip.\n\nI have two questions concerning the itinerary. First, are meals and local sightseeing transportation included in the overall price? Second, what is your cancellation and refund policy in case of unexpected schedule changes? Additionally, I would like to request a hotel room with two queen beds and a city view for our stay in Paris.\n\nThank you for your assistance, and I look forward to your reply.\n\nBest regards,\n[Your Name]",
    "key_phrases": [
      "Thank you for contacting me regarding",
      "Are meals and local sightseeing transportation included",
      "What is your cancellation and refund policy",
      "I would like to request a hotel room"
    ],
    "set": "sec",
    "sec_id": 4
  },
  {
    "id": "P2_05",
    "category": "complaint",
    "category_vi": "Khiếu nại",
    "difficulty": "hard",
    "email": {
      "from": "A. Chae, General Company",
      "to": "Fine Prints Customer Service",
      "subject": "Printing accident",
      "date": "May 2, 10:32 A.M.",
      "body": "Dear Fine Prints,\n\nYour company recently prepared letterheads for us. However, I've just noticed that you printed our old address by mistake.\n\nI have to send out hundreds of letters to our customers for a new promotion. Please e-mail me about this as soon as possible.\n\nThank you,\nA. Chae\nGeneral Company"
    },
    "directions": "Respond to the e-mail as if you are an employee at Fine Prints. In your e-mail, make TWO suggestions for how to handle the problem and provide ONE piece of information you think will be useful.",
    "directions_vi": "Viết email trả lời như thể bạn là nhân viên tại Fine Prints. Trong email, đưa ra HAI đề xuất để xử lý vấn đề và cung cấp MỘT thông tin hữu ích.",
    "tasks": [
      {
        "type": "make_suggestion",
        "count": 2
      },
      {
        "type": "provide_information",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Mr. Chae,\n\nPlease accept our sincere apologies for printing the incorrect address on your company letterheads. We understand how crucial this promotional campaign is for your business.\n\nTo resolve this problem immediately, I suggest that we reprint your entire order with the corrected address today free of charge. Alternatively, if you need materials right away, I suggest we provide pre-printed adhesive correction labels that can be cleanly affixed over the address. For your information, our express press can complete the full reprint within 24 hours, and we will courier them directly to your office tomorrow morning.\n\nWe apologize again for the inconvenience.\n\nSincerely,\n[Your Name]\nFine Prints",
    "key_phrases": [
      "Please accept our sincere apologies",
      "I suggest that we reprint your entire order",
      "Alternatively, I suggest we provide",
      "For your information, our express press can complete"
    ],
    "set": "sec",
    "sec_id": 5
  },
  {
    "id": "P2_06",
    "category": "event",
    "category_vi": "Sự kiện",
    "difficulty": "medium",
    "email": {
      "from": "Bill Britten, Teachers' Association Chairman",
      "to": "TA Members",
      "subject": "Summer Concert Participant Recruitment",
      "date": "May 28, 3:45 P.M.",
      "body": "Dear TA Members,\n\nWe're going to hold our annual summer concert festival from July 7 to 11.\n\nIf you have any students interested in playing in our orchestra, please give us their names and the instruments they play so they can join in this wonderful event.\n\nPlease reply by e-mail no later than June 6.\n\nThanks in advance for your assistance,\nBill Britten\nTeachers' Association Chairman"
    },
    "directions": "Respond to the e-mail as if you are a member of the Teachers' Association. In your e-mail, ask TWO questions and give ONE piece of information about the event.",
    "directions_vi": "Viết email trả lời như thể bạn là một thành viên của Hiệp hội Giáo viên. Trong email, hỏi HAI câu hỏi và cung cấp MỘT thông tin về sự kiện.",
    "tasks": [
      {
        "type": "ask_question",
        "count": 2
      },
      {
        "type": "provide_information",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Mr. Britten,\n\nThank you for your email regarding the upcoming Summer Concert Festival. It is a wonderful opportunity for our students.\n\nI have two questions about the event. First, where will the rehearsal sessions take place prior to the festival? Second, is there a specific dress code required for student performers? Regarding student participants, I would like to register two students from my music class: Emily Davis, who plays the violin, and Lucas Chen, who plays the flute.\n\nThank you for organizing this event, and I look forward to your reply.\n\nBest regards,\n[Your Name]",
    "key_phrases": [
      "Thank you for your email regarding",
      "Where will the rehearsal sessions take place",
      "Is there a specific dress code required",
      "I would like to register two students"
    ],
    "set": "sec",
    "sec_id": 6
  },
  {
    "id": "P2_07",
    "category": "welcome",
    "category_vi": "Chào đón",
    "difficulty": "easy",
    "email": {
      "from": "P. Spata, Department Manager",
      "to": "A. Means",
      "subject": "Welcome",
      "date": "November 9, 4:08 P.M.",
      "body": "Dear A. Means,\n\nWelcome! I'm happy to have you in our department.\n\nPlease tell me if there is anything I can do to make your transition here more comfortable. And let me know if you have any questions about working in our office.\n\nBest regards,\nP. Spata"
    },
    "directions": "Respond to the e-mail as if you are A. Means. In your e-mail, ask TWO questions about working in the new office and make ONE request.",
    "directions_vi": "Viết email trả lời như thể bạn là A. Means. Trong email, hỏi HAI câu hỏi về việc làm việc tại văn phòng mới và đưa ra MỘT yêu cầu.",
    "tasks": [
      {
        "type": "ask_question",
        "count": 2
      },
      {
        "type": "make_request",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Ms. Spata,\n\nThank you very much for the warm welcome. I am thrilled to join the team and look forward to working with everyone in the department.\n\nI have a couple of questions about the office routines. First, what are the standard office working hours and lunch break schedules? Second, is there designated parking available on-site for new staff members? Furthermore, I would like to request a brief meeting with you early next week to discuss my initial assignments and priorities.\n\nThank you again for your support.\n\nSincerely,\nA. Means",
    "key_phrases": [
      "Thank you very much for the warm welcome",
      "What are the standard office working hours",
      "Is there designated parking available",
      "I would like to request a brief meeting"
    ],
    "set": "sec",
    "sec_id": 7
  },
  {
    "id": "P2_08",
    "category": "service",
    "category_vi": "Dịch vụ",
    "difficulty": "hard",
    "email": {
      "from": "Martin Cole, Vertex International",
      "to": "Exacto Translation Services",
      "subject": "Legal document translation",
      "date": "September 15, 11:20 A.M.",
      "body": "Dear Exacto Translation Services,\n\nOur firm needs a 40-page commercial contract translated from German to English by next Friday. Since this is our first time working with your agency, could you explain your translation process and what you need from us?\n\nThank you,\nMartin Cole\nVertex International"
    },
    "directions": "Respond to the e-mail as if you are a translator at Exacto Translation Services. In your e-mail, explain TWO steps involved in the translation process and request ONE additional piece of information about the customer's document.",
    "directions_vi": "Viết email trả lời như thể bạn là biên dịch viên tại Exacto Translation Services. Trong email, giải thích HAI bước trong quy trình dịch thuật và yêu cầu MỘT thông tin bổ sung về tài liệu của khách hàng.",
    "tasks": [
      {
        "type": "explain_process",
        "count": 2
      },
      {
        "type": "make_request",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Mr. Cole,\n\nThank you for reaching out to Exacto Translation Services. We would be pleased to assist Vertex International with your legal translation project.\n\nOur standard translation process involves two rigorous quality steps. First, an accredited legal translator with subject-matter expertise produces the primary translation draft. Second, a senior bilingual editor conducts a comprehensive proofreading review to ensure terminology accuracy and legal precision. To provide an exact quote and schedule, could you please send us the original editable document file so we can analyze the technical word count?\n\nWe look forward to collaborating with your firm.\n\nSincerely,\n[Your Name]\nExacto Translation Services",
    "key_phrases": [
      "Thank you for reaching out",
      "Our standard translation process involves two steps",
      "First, an accredited legal translator produces",
      "Second, a senior bilingual editor conducts",
      "Could you please send us the original editable file"
    ],
    "set": "sec",
    "sec_id": 8
  },
  {
    "id": "P2_09",
    "category": "service",
    "category_vi": "Dịch vụ",
    "difficulty": "medium",
    "email": {
      "from": "David Kim, Tech Repair Center",
      "to": "Mr. Slate",
      "subject": "Computer repair assessment",
      "date": "July 3, 4:15 P.M.",
      "body": "Dear Mr. Slate,\n\nWe have examined your desktop computer. The motherboard has experienced severe overheating and requires replacement, which will take three business days.\n\nPlease let us know how you would like to proceed with the repair.\n\nSincerely,\nDavid Kim\nTech Repair Center"
    },
    "directions": "Respond to the e-mail as if you are Mr. Slate. In your e-mail, ask ONE question and make TWO suggestions about getting the computer fixed.",
    "directions_vi": "Viết email trả lời như thể bạn là Mr. Slate. Trong email, hỏi MỘT câu hỏi và đưa ra HAI đề xuất để sửa máy tính.",
    "tasks": [
      {
        "type": "ask_question",
        "count": 1
      },
      {
        "type": "make_suggestion",
        "count": 2
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Mr. Kim,\n\nThank you for examining my computer and providing the diagnostic report so promptly.\n\nBefore authorizing the work, could you please tell me the total estimated cost for the replacement motherboard including labor? In terms of proceeding, I suggest that you back up all files from my hard drive before beginning the hardware installation to prevent data loss. Additionally, I suggest installing an upgraded cooling fan to prevent similar overheating issues in the future.\n\nPlease confirm the quote so we can start the repair.\n\nBest regards,\nMr. Slate",
    "key_phrases": [
      "Thank you for examining my computer",
      "Could you please tell me the total estimated cost",
      "I suggest that you back up all files",
      "Additionally, I suggest installing an upgraded cooling fan"
    ],
    "set": "sec",
    "sec_id": 9
  },
  {
    "id": "P2_10",
    "category": "event",
    "category_vi": "Sự kiện",
    "difficulty": "easy",
    "email": {
      "from": "Tradewinds Apartments Management",
      "to": "All Residents",
      "subject": "Annual Residents Meeting",
      "date": "January 18, 10:00 A.M.",
      "body": "Dear Residents,\n\nOur annual community meeting will take place next Wednesday at 7:00 P.M. in the clubhouse. We will discuss upcoming facility improvements and community guidelines.\n\nPlease email us any agenda topics you would like to cover.\n\nTradewinds Management"
    },
    "directions": "Respond to the e-mail as if you are a resident at Tradewinds Apartments. In your e-mail, suggest TWO topics and ask ONE question about the meeting.",
    "directions_vi": "Viết email trả lời như thể bạn là cư dân tại Tradewinds Apartments. Trong email, đề xuất HAI chủ đề và hỏi MỘT câu hỏi về cuộc họp.",
    "tasks": [
      {
        "type": "make_suggestion",
        "count": 2
      },
      {
        "type": "ask_question",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Tradewinds Management,\n\nThank you for organizing the annual residents meeting. I plan to attend next Wednesday.\n\nI would like to suggest two topics for the meeting agenda. First, I suggest discussing improved lighting in the underground parking garage to increase resident safety. Second, I suggest reviewing the fitness center operating hours so residents can exercise earlier in the morning. Finally, will meeting minutes or a video recording be distributed afterward for neighbors unable to attend?\n\nThank you for your dedication to our community.\n\nSincerely,\n[Your Name]\nResident #402",
    "key_phrases": [
      "Thank you for organizing the annual residents meeting",
      "I suggest discussing improved lighting",
      "Second, I suggest reviewing the fitness center hours",
      "Will meeting minutes or a recording be distributed"
    ],
    "set": "sec",
    "sec_id": 10
  },
  {
    "id": "P2_11",
    "category": "training",
    "category_vi": "Đào tạo nghiệp vụ",
    "difficulty": "medium",
    "email": {
      "from": "Helen Vance, HR Director",
      "to": "Department Managers",
      "subject": "Executive Communication Workshop",
      "date": "February 15, 10:00 A.M.",
      "body": "Dear Managers,\n\nWe are organizing a one-day workshop on Advanced Workplace Communication next month. We would like each department to send representatives.\n\nPlease let me know your thoughts on our proposed schedule and if you have any suggestions regarding the training content.\n\nBest regards,\nHelen Vance\nHR Director"
    },
    "directions": "Respond to the e-mail as if you are a Department Manager. In your e-mail, ask TWO questions about the workshop schedule and make ONE suggestion regarding training materials.",
    "directions_vi": "Viết email trả lời như một Trưởng bộ phận. Trong email, hỏi HAI câu hỏi về lịch trình buổi hội thảo và đưa ra MỘT đề xuất về tài liệu đào tạo.",
    "tasks": [
      {
        "type": "ask_question",
        "count": 2
      },
      {
        "type": "make_suggestion",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Ms. Vance,\n\nThank you for organizing the Advanced Workplace Communication workshop. Our team is very interested in participating.\n\nI have two questions regarding the schedule. First, on which specific date next month will the session take place? Second, will the workshop run for a full day or just during the morning hours? In addition, I suggest providing digital copies of the presentation slides and workbooks in advance so attendees can prepare questions beforehand.\n\nThank you for your assistance, and I look forward to your response.\n\nBest regards,\n[Your Name]",
    "key_phrases": [
      "Thank you for organizing the workshop",
      "On which specific date next month will the session take place",
      "Will the workshop run for a full day",
      "I suggest providing digital copies of the presentation"
    ],
    "set": "core"
  },
  {
    "id": "P2_12",
    "category": "service",
    "category_vi": "Chăm sóc khách hàng",
    "difficulty": "hard",
    "email": {
      "from": "Arthur Pendelton",
      "to": "Apex Electronics Customer Support",
      "subject": "Delayed Laptop Order #84920",
      "date": "March 4, 2:15 P.M.",
      "body": "Dear Support Team,\n\nI ordered a high-performance laptop two weeks ago with guaranteed 3-day express shipping. I have not received it yet, and tracking has not updated for five days. I need this laptop urgently for an overseas business trip next week.\n\nPlease explain what happened.\n\nArthur Pendelton"
    },
    "directions": "Respond to the e-mail as a customer service representative. In your e-mail, apologize for the delay, explain ONE reason for the issue, and make TWO offers to resolve the situation.",
    "directions_vi": "Viết email trả lời như nhân viên CSKH. Trong email, xin lỗi về sự chậm trễ, giải thích MỘT nguyên nhân và đưa ra HAI đề xuất giải quyết.",
    "tasks": [
      {
        "type": "make_apology",
        "count": 1
      },
      {
        "type": "explain_reason",
        "count": 1
      },
      {
        "type": "make_offer",
        "count": 2
      }
    ],
    "total_tasks": 4,
    "sample_answer": "Dear Mr. Pendelton,\n\nPlease accept our sincere apologies for the unexpected delay with your order #84920. Due to severe winter weather affecting our central logistics hub, express freight shipments were temporarily halted.\n\nTo make amends, we have upgraded your parcel to priority overnight courier at no extra cost, ensuring delivery by tomorrow noon. Furthermore, we would like to refund your express shipping fee and offer you a 20% discount coupon applicable to your next purchase.\n\nThank you for your patience, and please let us know if you need further assistance.\n\nSincerely,\n[Your Name]\nApex Customer Support",
    "key_phrases": [
      "Please accept our sincere apologies for the delay",
      "Due to severe winter weather affecting our logistics hub",
      "We have upgraded your parcel to priority overnight",
      "We would like to refund your express shipping fee"
    ],
    "set": "core"
  },
  {
    "id": "P2_13",
    "category": "booking",
    "category_vi": "Đặt phòng hội nghị",
    "difficulty": "medium",
    "email": {
      "from": "Sandra Bullock, Facility Coordinator",
      "to": "Project Management Team",
      "subject": "Main Boardroom Maintenance Notice",
      "date": "April 8, 9:30 A.M.",
      "body": "Dear Project Team,\n\nDue to scheduled audio-visual upgrades, the Main Boardroom will be unavailable this Thursday. We understand your team has a major client presentation booked for that morning.\n\nPlease let us know how you would like to proceed.\n\nSandra Bullock\nFacility Coordinator"
    },
    "directions": "Respond to the e-mail as the Project Manager. In your e-mail, suggest ONE alternative room or time and ask TWO questions about available equipment.",
    "directions_vi": "Viết email trả lời như Trưởng dự án. Trong email, đề xuất MỘT phòng hoặc thời gian thay thế và hỏi HAI câu hỏi về thiết bị.",
    "tasks": [
      {
        "type": "make_suggestion",
        "count": 1
      },
      {
        "type": "ask_question",
        "count": 2
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Ms. Bullock,\n\nThank you for notifying us about the boardroom maintenance schedule.\n\nTo accommodate our client presentation, I suggest moving our meeting to Conference Room B on Thursday afternoon at 2:00 P.M. instead. Before we confirm this adjustment, does Conference Room B have high-definition video conferencing capabilities? In addition, could you please confirm whether wireless microphones will be available for our presenters?\n\nPlease let me know if Conference Room B is available for reservation at that time.\n\nBest regards,\n[Your Name]\nProject Manager",
    "key_phrases": [
      "Thank you for notifying us about the maintenance",
      "I suggest moving our meeting to Conference Room B",
      "Does Conference Room B have video conferencing capabilities",
      "Could you please confirm whether wireless microphones will be available"
    ],
    "set": "core"
  },
  {
    "id": "P2_14",
    "category": "internal_it",
    "category_vi": "Hỗ trợ công nghệ",
    "difficulty": "medium",
    "email": {
      "from": "Mark Davis, IT Support Lead",
      "to": "All Staff",
      "subject": "Company-wide Operating System Update",
      "date": "May 12, 11:20 A.M.",
      "body": "Dear Staff Members,\n\nWe will be upgrading all office computer operating systems this Friday starting at 6:00 P.M. The update will take approximately 4 hours.\n\nPlease contact the help desk if you have any questions or special requirements before the maintenance begins.\n\nMark Davis\nIT Support Lead"
    },
    "directions": "Respond to the e-mail as an employee. In your e-mail, explain ONE concern regarding your ongoing project and make TWO requests for data backup guidance.",
    "directions_vi": "Viết email trả lời như nhân viên. Trong email, giải thích MỘT lo ngại về dự án hiện tại và đưa ra HAI yêu cầu về hướng dẫn sao lưu dữ liệu.",
    "tasks": [
      {
        "type": "explain_problem",
        "count": 1
      },
      {
        "type": "make_request",
        "count": 2
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Mr. Davis,\n\nThank you for informing us about the upcoming operating system update.\n\nI am currently working on an urgent quarterly financial audit with large database files, so I am concerned about potential data loss during the system upgrade. Therefore, I request that you send step-by-step instructions on how to back up local files to the secure company cloud server. Furthermore, I would like to request clarification on whether we should leave our computers powered on or turned off when leaving the office Friday.\n\nThank you for your guidance and support.\n\nBest regards,\n[Your Name]",
    "key_phrases": [
      "Thank you for informing us about the update",
      "I am concerned about potential data loss",
      "I request that you send step-by-step instructions",
      "I would like to request clarification on"
    ],
    "set": "core"
  },
  {
    "id": "P2_15",
    "category": "invitation",
    "category_vi": "Lời mời diễn giả",
    "difficulty": "medium",
    "email": {
      "from": "Jonathan Meyers, Summit Coordinator",
      "to": "Guest Speakers",
      "subject": "Keynote Speaker Invitation - Digital Marketing Summit 2026",
      "date": "June 18, 3:00 P.M.",
      "body": "Dear Speaker,\n\nOur association is hosting the Annual Digital Marketing Summit on July 25. We would be honored if you could deliver a 30-minute keynote presentation on Modern Brand Strategy.\n\nPlease let us know if you are available to join us as a featured speaker.\n\nJonathan Meyers\nSummit Coordinator"
    },
    "directions": "Respond to the e-mail as the invited guest speaker. In your e-mail, accept the invitation, ask ONE question about the audience, and state TWO technical requirements for your presentation.",
    "directions_vi": "Viết email trả lời như diễn giả được mời. Trong email, chấp nhận lời mời, hỏi MỘT câu hỏi về đối tượng người nghe và nêu HAI yêu cầu kỹ thuật cho bài thuyết trình.",
    "tasks": [
      {
        "type": "accept_invitation",
        "count": 1
      },
      {
        "type": "ask_question",
        "count": 1
      },
      {
        "type": "state_requirement",
        "count": 2
      }
    ],
    "total_tasks": 4,
    "sample_answer": "Dear Mr. Meyers,\n\nThank you very much for the kind invitation. I am delighted to accept and look forward to delivering the keynote presentation on July 25.\n\nTo help me tailor the presentation, could you please tell me how many attendees are expected and whether they are primarily corporate executives or marketing specialists? Regarding my technical requirements, I will need a wireless lapel microphone and an HDMI connection for my laptop to stream demonstration videos.\n\nThank you again for the opportunity, and I look forward to working together.\n\nWarm regards,\n[Your Name]",
    "key_phrases": [
      "Thank you very much for the kind invitation",
      "I am delighted to accept",
      "Could you please tell me how many attendees are expected",
      "Regarding my technical requirements, I will need"
    ],
    "set": "core"
  },
  {
    "id": "P2_16",
    "category": "feedback",
    "category_vi": "Đóng góp ý kiến",
    "difficulty": "easy",
    "email": {
      "from": "Chef Louis Laurent, Catering Director",
      "to": "Annual Banquet Committee",
      "subject": "Feedback on Annual Banquet Catering",
      "date": "July 10, 1:40 P.M.",
      "body": "Dear Committee Members,\n\nThank you for choosing Grand Hotel Catering for your annual awards banquet last night. We strive to provide excellent culinary experiences and would appreciate your feedback on the event.\n\nBest regards,\nChef Louis Laurent\nCatering Director"
    },
    "directions": "Respond to the e-mail as a committee member. In your e-mail, give TWO compliments about the dinner and make ONE suggestion for future events.",
    "directions_vi": "Viết email trả lời như thành viên ban tổ chức. Trong email, đưa ra HAI lời khen về bữa tiệc và MỘT đề xuất cho các sự kiện tới.",
    "tasks": [
      {
        "type": "give_compliment",
        "count": 2
      },
      {
        "type": "make_suggestion",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Chef Laurent,\n\nThank you for your email. On behalf of the entire committee, I would like to share our feedback on last night's banquet.\n\nFirst, our guests thoroughly enjoyed the main course; the grilled salmon was exceptionally fresh and flavorful. Second, the banquet staff provided remarkably courteous and efficient service throughout the evening. For future events, I suggest expanding the selection of vegetarian and dairy-free dessert options to accommodate more dietary preferences.\n\nThank you for making our annual celebration such a success.\n\nSincerely,\n[Your Name]\nBanquet Committee",
    "key_phrases": [
      "Thank you for your email",
      "Our guests thoroughly enjoyed the main course",
      "The banquet staff provided remarkably courteous service",
      "I suggest expanding the selection of vegetarian dessert options"
    ],
    "set": "core"
  },
  {
    "id": "P2_17",
    "category": "complaint",
    "category_vi": "Khiếu nại",
    "difficulty": "hard",
    "email": {
      "from": "Karen White, Office Manager",
      "to": "Modern Office Supplies Support",
      "subject": "Damaged Desks in Delivery #62019",
      "date": "August 14, 10:15 A.M.",
      "body": "Dear Customer Support,\n\nWe received our order of ten executive desks this morning. However, three desks have deep scratches on the wooden surface, and one chair was missing from the shipment.\n\nWe need these workstations ready for new employees starting next Monday. Please contact us immediately.\n\nKaren White\nOffice Manager"
    },
    "directions": "Respond to the e-mail as a customer service representative. In your e-mail, apologize for the damaged shipment, describe ONE replacement procedure, and offer ONE compensation discount.",
    "directions_vi": "Viết email trả lời như nhân viên CSKH. Trong email, xin lỗi về lô hàng hỏng, mô tả MỘT quy trình đổi trả và đưa ra MỘT mức giảm giá đền bù.",
    "tasks": [
      {
        "type": "make_apology",
        "count": 1
      },
      {
        "type": "describe_procedure",
        "count": 1
      },
      {
        "type": "make_offer",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Ms. White,\n\nPlease accept our sincere apologies for the damaged desks and the missing chair in your recent delivery #62019. We deeply regret this oversight.\n\nTo resolve this promptly, our logistics team will deliver three replacement desks and the missing chair directly to your office this Friday morning, while collecting the damaged units at no charge. In addition, to compensate your company for the inconvenience, we would like to offer a 15% discount on your entire order invoice.\n\nThank you for your understanding, and please let us know if this arrangement meets your schedule.\n\nSincerely,\n[Your Name]\nModern Office Supplies",
    "key_phrases": [
      "Please accept our sincere apologies for the damaged desks",
      "Our logistics team will deliver three replacement desks",
      "We would like to offer a 15% discount on your invoice"
    ],
    "set": "core"
  },
  {
    "id": "P2_18",
    "category": "inquiry",
    "category_vi": "Hỏi thông tin",
    "difficulty": "medium",
    "email": {
      "from": "David Miller, Expo Coordinator",
      "to": "Prospective Exhibitors",
      "subject": "International Tech Expo 2026 Booth Registration",
      "date": "September 2, 2:00 P.M.",
      "body": "Dear Exhibitor,\n\nRegistration is now open for the International Tech Expo 2026 taking place at the National Convention Center. Over 5,000 industry professionals are expected to attend.\n\nPlease let us know if your company would like to reserve an exhibition booth.\n\nDavid Miller\nExpo Coordinator"
    },
    "directions": "Respond to the e-mail as a marketing coordinator. In your e-mail, express interest in reserving a booth, ask TWO questions about booth amenities and setup times, and request ONE floor plan diagram.",
    "directions_vi": "Viết email trả lời như điều phối viên tiếp thị. Trong email, bày tỏ sự quan tâm đặt gian hàng, hỏi HAI câu hỏi về tiện ích và giờ lắp đặt, và yêu cầu MỘT sơ đồ mặt bằng.",
    "tasks": [
      {
        "type": "express_interest",
        "count": 1
      },
      {
        "type": "ask_question",
        "count": 2
      },
      {
        "type": "make_request",
        "count": 1
      }
    ],
    "total_tasks": 4,
    "sample_answer": "Dear Mr. Miller,\n\nThank you for your email. Our company is very interested in reserving a standard exhibition booth at the International Tech Expo 2026.\n\nI have two questions regarding booth logistics. First, are high-speed Wi-Fi and dedicated electrical outlets included in the booth rental fee? Second, what are the designated hours for exhibitors to set up displays on the day before the event? Furthermore, could you please send us an updated floor plan diagram highlighting the available prime booth locations?\n\nThank you for your assistance, and I look forward to hearing from you.\n\nBest regards,\n[Your Name]\nMarketing Coordinator",
    "key_phrases": [
      "Our company is very interested in reserving a booth",
      "Are high-speed Wi-Fi and electrical outlets included",
      "What are the designated hours for exhibitors to set up",
      "Could you please send us an updated floor plan diagram"
    ],
    "set": "core"
  },
  {
    "id": "P2_19",
    "category": "logistics",
    "category_vi": "Vận chuyển hàng hóa",
    "difficulty": "medium",
    "email": {
      "from": "Richard Clark, Supply Chain Manager",
      "to": "Global Freight Logistics",
      "subject": "Status of Cargo Shipment #GF-9902",
      "date": "October 11, 8:45 A.M.",
      "body": "Dear Global Freight,\n\nOur shipment of industrial sensors #GF-9902 was scheduled to arrive at the Port of Long Beach yesterday. We have not received customs clearance confirmation yet.\n\nPlease provide an immediate status update on the shipment.\n\nRichard Clark\nSupply Chain Manager"
    },
    "directions": "Respond to the e-mail as a logistics representative. In your e-mail, explain ONE reason for the customs delay, provide ONE revised arrival date, and ask ONE question regarding local delivery instructions.",
    "directions_vi": "Viết email trả lời như đại diện giao nhận. Trong email, giải thích MỘT lý do chậm hải quan, cung cấp MỘT ngày đến mới và hỏi MỘT câu hỏi về hướng dẫn giao hàng.",
    "tasks": [
      {
        "type": "explain_reason",
        "count": 1
      },
      {
        "type": "provide_information",
        "count": 1
      },
      {
        "type": "ask_question",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Mr. Clark,\n\nThank you for contacting Global Freight regarding your cargo shipment #GF-9902.\n\nThe shipment experienced a brief delay because customs authorities conducted a mandatory security inspection for all incoming electronics containers. I am pleased to inform you that clearance is now complete, and the revised estimated delivery to your warehouse is this Thursday by 3:00 P.M. Finally, could you please confirm whether our truck drivers will need a special security pass to enter your warehouse loading dock?\n\nThank you for your patience and cooperation.\n\nSincerely,\n[Your Name]\nGlobal Freight Logistics",
    "key_phrases": [
      "Thank you for contacting Global Freight",
      "The shipment experienced a brief delay because",
      "The revised estimated delivery to your warehouse is",
      "Could you please confirm whether our truck drivers will need a security pass"
    ],
    "set": "core"
  },
  {
    "id": "P2_20",
    "category": "job",
    "category_vi": "Tuyển dụng nhân sự",
    "difficulty": "medium",
    "email": {
      "from": "Sarah Jenkins, Senior Recruiter",
      "to": "Job Applicant",
      "subject": "Interview Invitation - Senior Financial Analyst",
      "date": "November 3, 11:30 A.M.",
      "body": "Dear Applicant,\n\nThank you for applying for the Senior Financial Analyst position. We were very impressed with your credentials and would like to invite you for an in-person interview this Friday at 10:00 A.M.\n\nPlease confirm if this time works for you.\n\nSarah Jenkins\nSenior Recruiter"
    },
    "directions": "Respond to the e-mail as the job applicant. In your e-mail, explain ONE scheduling conflict, propose TWO alternative interview dates/times, and ask ONE question about interview preparation.",
    "directions_vi": "Viết email trả lời như ứng viên xin việc. Trong email, giải thích MỘT xung đột lịch trình, đề xuất HAI thời gian phỏng vấn thay thế và hỏi MỘT câu hỏi chuẩn bị.",
    "tasks": [
      {
        "type": "explain_problem",
        "count": 1
      },
      {
        "type": "make_suggestion",
        "count": 2
      },
      {
        "type": "ask_question",
        "count": 1
      }
    ],
    "total_tasks": 4,
    "sample_answer": "Dear Ms. Jenkins,\n\nThank you very much for inviting me for an interview for the Senior Financial Analyst position. I am very enthusiastic about this opportunity.\n\nUnfortunately, I have an unavoidable work commitment this Friday at 10:00 A.M. that I cannot reschedule. I would like to propose meeting on Monday, November 6 at 10:00 A.M., or Tuesday, November 7 at 2:00 P.M. instead. Additionally, should I bring physical copies of my portfolio or prepare a presentation for the hiring committee?\n\nThank you for your understanding, and I look forward to your reply.\n\nSincerely,\n[Your Name]",
    "key_phrases": [
      "Thank you very much for inviting me for an interview",
      "Unfortunately, I have an unavoidable work commitment",
      "I would like to propose meeting on",
      "Should I bring physical copies of my portfolio"
    ],
    "set": "core"
  },
  {
    "id": "P2_21",
    "category": "travel",
    "category_vi": "Vé máy bay công tác",
    "difficulty": "medium",
    "email": {
      "from": "Michael Chang, Corporate Travel Agency",
      "to": "Business Traveler",
      "subject": "Flight Cancellation Notice - Flight #SK402",
      "date": "December 1, 4:00 P.M.",
      "body": "Dear Client,\n\nWe regret to inform you that your flight #SK402 to Chicago tomorrow has been cancelled due to severe weather. We can rebook you on an alternative flight.\n\nPlease let us know your travel preferences as soon as possible.\n\nMichael Chang\nCorporate Travel Agency"
    },
    "directions": "Respond to the e-mail as the business traveler. In your e-mail, request ONE morning flight rebooking, ask TWO questions regarding airline refund and hotel accommodation policies.",
    "directions_vi": "Viết email trả lời như người đi công tác. Trong email, yêu cầu MỘT chuyến bay sáng thay thế, hỏi HAI câu hỏi về chính sách hoàn tiền và khách sạn.",
    "tasks": [
      {
        "type": "make_request",
        "count": 1
      },
      {
        "type": "ask_question",
        "count": 2
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Mr. Chang,\n\nThank you for notifying me promptly about the flight cancellation.\n\nSince I have an essential client conference tomorrow afternoon, I would like to request rebooking on the earliest available morning flight departing before 9:00 A.M. Additionally, I have two questions. Will the airline cover the hotel accommodation costs if an overnight layover is required? Furthermore, what is the procedure for claiming a refund on our prepaid business lounge passes?\n\nThank you for your swift assistance with this matter.\n\nBest regards,\n[Your Name]",
    "key_phrases": [
      "Thank you for notifying me promptly",
      "I would like to request rebooking on the earliest available flight",
      "Will the airline cover the hotel accommodation costs",
      "What is the procedure for claiming a refund"
    ],
    "set": "core"
  },
  {
    "id": "P2_22",
    "category": "service",
    "category_vi": "Thiết kế website",
    "difficulty": "medium",
    "email": {
      "from": "Emily Thorne, Creative Director",
      "to": "Client Review Committee",
      "subject": "New Website Redesign Prototype",
      "date": "January 15, 3:15 P.M.",
      "body": "Dear Review Committee,\n\nOur design team has finished the initial prototype for your e-commerce website redesign. We have updated the visual layout, color scheme, and product catalog.\n\nPlease review the prototype and share your feedback with us.\n\nEmily Thorne\nCreative Director"
    },
    "directions": "Respond to the e-mail as the client committee lead. In your e-mail, give TWO compliments on the visual design and make ONE suggestion for checkout navigation.",
    "directions_vi": "Viết email trả lời như trưởng ban đánh giá. Trong email, đưa ra HAI lời khen về thiết kế giao diện và MỘT đề xuất cải thiện quy trình thanh toán.",
    "tasks": [
      {
        "type": "give_compliment",
        "count": 2
      },
      {
        "type": "make_suggestion",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Ms. Thorne,\n\nThank you for sharing the new e-commerce website prototype with our committee. Overall, we are extremely impressed with your team's creative work.\n\nFirst, the modern color palette and typography align perfectly with our updated corporate branding. Second, the product catalog filtering is remarkably fast and intuitive for mobile users. However, regarding the checkout flow, I suggest reducing the checkout process to a single-page layout with fewer form fields to minimize cart abandonment.\n\nThank you again, and we look forward to reviewing the revised mockup.\n\nSincerely,\n[Your Name]\nClient Committee Lead",
    "key_phrases": [
      "Thank you for sharing the prototype",
      "The modern color palette aligns perfectly with our branding",
      "The product catalog filtering is remarkably fast and intuitive",
      "I suggest reducing the checkout process to a single-page layout"
    ],
    "set": "core"
  },
  {
    "id": "P2_23",
    "category": "real_estate",
    "category_vi": "Hợp đồng thuê văn phòng",
    "difficulty": "medium",
    "email": {
      "from": "Robert Sterling, Property Manager",
      "to": "Tenant Representative",
      "subject": "Office Lease Agreement Renewal - Suite 500",
      "date": "February 20, 10:45 A.M.",
      "body": "Dear Tenant,\n\nYour commercial office lease for Suite 500 will expire on April 30. We value your tenancy and would like to discuss lease renewal terms for the upcoming period.\n\nPlease let us know if you wish to renew your lease agreement.\n\nRobert Sterling\nProperty Manager"
    },
    "directions": "Respond to the e-mail as the tenant representative. In your e-mail, express intention to renew the lease for two years, ask TWO questions regarding monthly rent and parking spaces, and make ONE request for carpet replacement.",
    "directions_vi": "Viết email trả lời như đại diện bên thuê. Trong email, bày tỏ ý định gia hạn hợp đồng 2 năm, hỏi HAI câu hỏi về giá thuê và chỗ đỗ xe, và đưa ra MỘT yêu cầu thay thảm văn phòng.",
    "tasks": [
      {
        "type": "express_interest",
        "count": 1
      },
      {
        "type": "ask_question",
        "count": 2
      },
      {
        "type": "make_request",
        "count": 1
      }
    ],
    "total_tasks": 4,
    "sample_answer": "Dear Mr. Sterling,\n\nThank you for contacting us regarding our lease renewal for Suite 500. We have enjoyed our tenancy and would like to extend our lease agreement for another two years.\n\nBefore signing the new agreement, I have two questions. Will the monthly rental rate remain unchanged during the new two-year term? Also, can our allocation of reserved basement parking spaces be increased from four to six? In addition, we would like to request that the property management replace the worn carpeting in our main reception area prior to the new lease commencement.\n\nWe look forward to receiving the renewal draft.\n\nBest regards,\n[Your Name]\nTenant Representative",
    "key_phrases": [
      "Thank you for contacting us regarding our lease renewal",
      "We would like to extend our lease agreement for two years",
      "Will the monthly rental rate remain unchanged",
      "Can our allocation of reserved parking spaces be increased",
      "We would like to request that management replace the carpeting"
    ],
    "set": "core"
  },
  {
    "id": "P2_24",
    "category": "sales",
    "category_vi": "Bán hàng B2B",
    "difficulty": "medium",
    "email": {
      "from": "Amanda Ross, Enterprise Solutions",
      "to": "IT Procurement Director",
      "subject": "Cloud Inventory Management Software Inquiry",
      "date": "March 10, 1:15 P.M.",
      "body": "Dear Director,\n\nThank you for your interest in our CloudSync Inventory Management Platform. Our software streamlines warehouse tracking, supplier orders, and real-time analytics.\n\nPlease let us know if you would like to schedule a product demonstration or receive pricing information.\n\nAmanda Ross\nEnterprise Solutions"
    },
    "directions": "Respond to the e-mail as the IT Procurement Director. In your e-mail, request ONE live demonstration session, ask TWO questions regarding user licensing fees and security compliance.",
    "directions_vi": "Viết email trả lời như Giám đốc mua sắm CNTT. Trong email, yêu cầu MỘT buổi demo trực tiếp, hỏi HAI câu hỏi về phí bản quyền người dùng và tuân thủ bảo mật.",
    "tasks": [
      {
        "type": "make_request",
        "count": 1
      },
      {
        "type": "ask_question",
        "count": 2
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Ms. Ross,\n\nThank you for reaching out regarding the CloudSync Inventory Management Platform. Our logistics division is currently evaluating new software solutions.\n\nWe would like to request a 45-minute live demonstration session next Wednesday at 10:00 A.M. for our technical evaluation team. Furthermore, I have two questions. What is the pricing structure for enterprise tier licensing with 100 concurrent users? Secondly, does your cloud infrastructure comply with international SOC 2 data security and privacy standards?\n\nThank you, and I look forward to your reply.\n\nSincerely,\n[Your Name]\nIT Procurement Director",
    "key_phrases": [
      "Thank you for reaching out regarding CloudSync",
      "We would like to request a live demonstration session",
      "What is the pricing structure for enterprise tier licensing",
      "Does your cloud infrastructure comply with SOC 2 standards"
    ],
    "set": "core"
  },
  {
    "id": "P2_25",
    "category": "internal_hr",
    "category_vi": "Phúc lợi nhân viên",
    "difficulty": "easy",
    "email": {
      "from": "Employee Wellness Committee",
      "to": "All Employees",
      "subject": "New Corporate Gym Membership Subsidy",
      "date": "April 5, 9:00 A.M.",
      "body": "Dear Colleagues,\n\nWe are pleased to announce our new Corporate Wellness Program starting next month, which subsidizes 50% of monthly gym memberships for all full-time employees.\n\nPlease reply with any questions or suggestions you have regarding fitness partners.\n\nWellness Committee"
    },
    "directions": "Respond to the e-mail as an employee. In your e-mail, express appreciation for the subsidy program, ask ONE question about participating gym locations, and suggest ONE on-site fitness class.",
    "directions_vi": "Viết email trả lời như một nhân viên. Trong email, bày tỏ sự cảm ơn về chương trình tài trợ, hỏi MỘT câu hỏi về các phòng gym liên kết và đề xuất MỘT lớp thể dục tại công ty.",
    "tasks": [
      {
        "type": "give_compliment",
        "count": 1
      },
      {
        "type": "ask_question",
        "count": 1
      },
      {
        "type": "make_suggestion",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Wellness Committee,\n\nThank you so much for introducing the corporate gym membership subsidy. This is a wonderful initiative that demonstrates how much the company values employee health and well-being.\n\nI have one question regarding the partnership details. Could you please provide a list of participating fitness centers and gyms located near our downtown office? In addition, I suggest organizing weekly on-site yoga or meditation classes in the multipurpose hall during lunch hours for staff who cannot commute to commercial gyms.\n\nThank you again for this fantastic benefit.\n\nBest regards,\n[Your Name]",
    "key_phrases": [
      "Thank you so much for introducing the subsidy",
      "This is a wonderful initiative",
      "Could you please provide a list of participating fitness centers",
      "I suggest organizing weekly on-site yoga classes"
    ],
    "set": "core"
  },
  {
    "id": "P2_26",
    "category": "service",
    "category_vi": "Thu hồi sản phẩm lỗi",
    "difficulty": "hard",
    "email": {
      "from": "Brian Adams, Quality Assurance Director",
      "to": "Retail Store Managers",
      "subject": "Voluntary Recall: EcoClean Steam Mop (Model #EM-300)",
      "date": "May 18, 11:00 A.M.",
      "body": "Dear Store Managers,\n\nDue to a faulty heating element in Batch #B22 of the EcoClean Steam Mop (Model #EM-300), we are issuing an immediate voluntary recall for units sold between March and April.\n\nPlease confirm receipt of this notice and instruct your staff on return procedures.\n\nBrian Adams\nQuality Assurance Director"
    },
    "directions": "Respond to the e-mail as a store manager. In your e-mail, confirm receipt of the recall notice, outline TWO steps your store will take, and ask ONE question about reimbursement for returned stock.",
    "directions_vi": "Viết email trả lời như quản lý cửa hàng. Trong email, xác nhận đã nhận thông báo thu hồi, nêu HAI bước cửa hàng sẽ thực hiện và hỏi MỘT câu hỏi về hoàn tiền kho hàng.",
    "tasks": [
      {
        "type": "confirm_attendance",
        "count": 1
      },
      {
        "type": "describe_procedure",
        "count": 2
      },
      {
        "type": "ask_question",
        "count": 1
      }
    ],
    "total_tasks": 4,
    "sample_answer": "Dear Mr. Adams,\n\nI am writing to confirm receipt of the voluntary product recall notice for the EcoClean Steam Mop (Model #EM-300, Batch #B22).\n\nOur store has initiated two immediate actions. First, our inventory team has removed all affected units from the retail display shelves and quarantined them in the secure backroom. Second, our customer service desk is displaying notice signage and issuing instant full refunds or store credits to impacted customers. Finally, how should our store submit the inventory manifest to receive credit reimbursement for the recalled units?\n\nThank you for your guidance, and we await further shipping instructions.\n\nSincerely,\n[Your Name]\nStore Manager",
    "key_phrases": [
      "I am writing to confirm receipt of the recall notice",
      "Our inventory team has removed all affected units from display",
      "Our customer service desk is issuing instant refunds",
      "How should our store submit the inventory manifest for reimbursement"
    ],
    "set": "core"
  },
  {
    "id": "P2_27",
    "category": "booking",
    "category_vi": "Mượn phòng thư viện",
    "difficulty": "medium",
    "email": {
      "from": "Clara Oswald, Community Services Librarian",
      "to": "Book Club Organizer",
      "subject": "Community Room Reservation Request",
      "date": "June 7, 2:30 P.M.",
      "body": "Dear Organizer,\n\nWe received your application to reserve the Community Meeting Room for your monthly book club gathering on Saturday, June 28.\n\nPlease provide any additional equipment requirements or scheduling details so we can finalize your reservation.\n\nClara Oswald\nCommunity Services Librarian"
    },
    "directions": "Respond to the e-mail as the book club organizer. In your e-mail, confirm reservation hours, describe TWO audio-visual requirements, and ask ONE question about guest parking.",
    "directions_vi": "Viết email trả lời như trưởng nhóm đọc sách. Trong email, xác nhận giờ mượn phòng, mô tả HAI yêu cầu về thiết bị âm thanh/hình ảnh và hỏi MỘT câu hỏi về bãi đỗ xe.",
    "tasks": [
      {
        "type": "provide_information",
        "count": 1
      },
      {
        "type": "state_requirement",
        "count": 2
      },
      {
        "type": "ask_question",
        "count": 1
      }
    ],
    "total_tasks": 4,
    "sample_answer": "Dear Ms. Oswald,\n\nThank you for approving our room reservation request for the monthly book club on Saturday, June 28. We will hold our meeting from 2:00 P.M. to 4:30 P.M.\n\nRegarding our audio-visual setup, we will require a digital projector with an HDMI cable to display author interview clips, as well as a wireless microphone for audience discussion. Additionally, could you please clarify whether our attendees may use the library's underground parking garage free of charge during the event?\n\nThank you for supporting our community book club.\n\nBest regards,\n[Your Name]\nBook Club Organizer",
    "key_phrases": [
      "Thank you for approving our room reservation request",
      "We will hold our meeting from 2:00 P.M. to 4:30 P.M.",
      "We will require a digital projector with an HDMI cable",
      "Could you please clarify whether attendees may use the parking garage"
    ],
    "set": "core"
  },
  {
    "id": "P2_28",
    "category": "event",
    "category_vi": "Tổ chức tiệc công ty",
    "difficulty": "easy",
    "email": {
      "from": "Social Planning Committee",
      "to": "All Employees",
      "subject": "Annual Summer Gala Planning - Theme & Venue Vote",
      "date": "July 12, 10:10 A.M.",
      "body": "Dear Staff,\n\nWe are preparing for our Annual Summer Gala in August. We want to make sure everyone enjoys the celebration.\n\nPlease email us with your preferred theme, activity suggestions, and any questions you have about the event.\n\nSocial Planning Committee"
    },
    "directions": "Respond to the e-mail as an employee. In your e-mail, vote in favor of a beachfront venue, suggest TWO entertainment activities, and ask ONE question about guest invitations.",
    "directions_vi": "Viết email trả lời như nhân viên. Trong email, bình chọn địa điểm bãi biển, đề xuất HAI hoạt động giải trí và hỏi MỘT câu hỏi về việc mời người thân đi cùng.",
    "tasks": [
      {
        "type": "vote_in_favor",
        "count": 1
      },
      {
        "type": "make_suggestion",
        "count": 2
      },
      {
        "type": "ask_question",
        "count": 1
      }
    ],
    "total_tasks": 4,
    "sample_answer": "Dear Social Planning Committee,\n\nThank you for organizing our upcoming Annual Summer Gala. I am truly looking forward to celebrating with the team.\n\nI would like to cast my vote in favor of hosting the gala at the Seaside Beachfront Resort. To make the evening engaging, I suggest having a live acoustic music band during dinner, as well as organizing an interactive trivia competition with company prizes. Finally, are employees permitted to invite spouses or family members to join the gala?\n\nThank you for your hard work in organizing this celebration.\n\nBest regards,\n[Your Name]",
    "key_phrases": [
      "Thank you for organizing our upcoming gala",
      "I would like to cast my vote in favor of hosting the gala at the beach",
      "I suggest having a live acoustic band",
      "Are employees permitted to invite family members"
    ],
    "set": "core"
  },
  {
    "id": "P2_29",
    "category": "complaint",
    "category_vi": "Đổi trả thiết bị gia dụng",
    "difficulty": "hard",
    "email": {
      "from": "Thomas Walker",
      "to": "KitchenPro Customer Care",
      "subject": "Defective Espresso Machine (Order #KP-77182)",
      "date": "August 22, 11:30 A.M.",
      "body": "Dear KitchenPro,\n\nI purchased your Deluxe Espresso Maker last week. Upon unboxing, the water pressure pump failed to operate, and water leaked from the bottom base onto my kitchen counter.\n\nI am very disappointed with this product and request a prompt resolution.\n\nThomas Walker"
    },
    "directions": "Respond to the e-mail as a customer care representative. In your e-mail, apologize for the defective machine, explain ONE return procedure with a prepaid shipping label, and offer ONE complimentary coffee bean gift set.",
    "directions_vi": "Viết email trả lời như nhân viên chăm sóc khách hàng. Trong email, xin lỗi về máy lỗi, giải thích MỘT quy trình đổi trả bằng nhãn bưu điện miễn phí và tặng MỘT bộ quà tặng hạt cà phê.",
    "tasks": [
      {
        "type": "make_apology",
        "count": 1
      },
      {
        "type": "describe_procedure",
        "count": 1
      },
      {
        "type": "make_offer",
        "count": 1
      }
    ],
    "total_tasks": 3,
    "sample_answer": "Dear Mr. Walker,\n\nPlease accept our sincere apologies for the frustration caused by the defective Deluxe Espresso Maker in your order #KP-77182. We maintain strict manufacturing standards and deeply regret that your unit malfunctioned.\n\nTo resolve this immediately, we have attached a prepaid shipping return label to this email so you can drop off the defective machine at any post office free of charge. We have already dispatched a brand-new, tested replacement unit via express courier, scheduled to arrive by Friday. Furthermore, we would like to include a complimentary artisanal coffee bean gift set as our token of apology.\n\nThank you for choosing KitchenPro, and please let us know if you need any further assistance.\n\nSincerely,\n[Your Name]\nKitchenPro Customer Care",
    "key_phrases": [
      "Please accept our sincere apologies for the frustration caused",
      "We have attached a prepaid shipping return label",
      "We have dispatched a brand-new replacement unit",
      "We would like to include a complimentary coffee bean gift set"
    ],
    "set": "core"
  },
  {
    "id": "P2_30",
    "category": "training",
    "category_vi": "Phát triển chuyên môn",
    "difficulty": "medium",
    "email": {
      "from": "Learning & Development Department",
      "to": "Professional Staff",
      "subject": "Professional Certification Sponsorship Program 2026",
      "date": "September 14, 9:20 A.M.",
      "body": "Dear Staff,\n\nOur department is accepting applications for the 2026 Professional Certification Sponsorship. The company supports employees pursuing industry credentials that enhance departmental capabilities.\n\nPlease submit your proposed course details and expected business benefits.\n\nLearning & Development Team"
    },
    "directions": "Respond to the e-mail as an employee. In your e-mail, request enrollment sponsorship for the PMP Project Management course, explain TWO benefits to your current projects, and ask ONE question about tuition reimbursement.",
    "directions_vi": "Viết email trả lời như nhân viên. Trong email, xin tài trợ khóa học Quản lý dự án PMP, giải thích HAI lợi ích cho các dự án hiện tại và hỏi MỘT câu hỏi về thanh toán học phí.",
    "tasks": [
      {
        "type": "make_request",
        "count": 1
      },
      {
        "type": "explain_benefits",
        "count": 2
      },
      {
        "type": "ask_question",
        "count": 1
      }
    ],
    "total_tasks": 4,
    "sample_answer": "Dear Learning & Development Team,\n\nThank you for offering the Professional Certification Sponsorship Program. I would like to request sponsorship for the upcoming Project Management Professional (PMP) certification course.\n\nObtaining this credential will provide two substantial benefits to our department. First, it will introduce standardized risk management frameworks to prevent project delivery delays. Second, it will improve cost budgeting efficiency across our ongoing IT client deployments. Finally, could you please clarify whether the company reimburses tuition upfront upon registration or upon successful completion of the certification exam?\n\nThank you for supporting employee professional growth.\n\nSincerely,\n[Your Name]",
    "key_phrases": [
      "Thank you for offering the sponsorship program",
      "I would like to request sponsorship for the PMP course",
      "It will introduce standardized risk management frameworks",
      "It will improve cost budgeting efficiency",
      "Could you please clarify whether the company reimburses tuition upfront"
    ],
    "set": "core"
  }
];

if (typeof window !== 'undefined') {
  window.TOEIC_PART2_DATA = TOEIC_PART2_DATA;
  window.TOEIC_PART2_QUESTIONS = TOEIC_PART2_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TOEIC_PART2_DATA;
}
