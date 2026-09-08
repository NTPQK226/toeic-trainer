import json
import random

first_10 = [
    {
        "id": "P2_01",
        "category": "invitation",
        "category_vi": "Lời mời",
        "difficulty": "medium",
        "email": {
            "from": "George Pinkney",
            "to": "Social Committee members",
            "subject": "Meeting",
            "date": "April 12",
            "body": "It is time for a meeting of the Social Committee. We need to start planning the annual year-end party. I would like all members of the committee to meet next Friday morning from 9 to 11 in Conference Room A. Please let me know as soon as possible if you are available to attend this meeting. Thank you. George Pinkney, Social Committee Chair"
        },
        "directions": "Respond to the e-mail as if you are a member of the Social Committee. In your e-mail, explain ONE problem and make TWO suggestions.",
        "directions_vi": "Viết email trả lời như thể bạn là một thành viên của Ủy ban Xã hội. Trong email của bạn, giải thích MỘT vấn đề và đưa ra HAI đề xuất.",
        "tasks": [
            {"type": "explain_problem", "count": 1},
            {"type": "make_suggestion", "count": 2}
        ],
        "total_tasks": 3,
        "sample_answer": "Dear Mr. Pinkney,\n\nThank you for the update. Unfortunately, I have a scheduling conflict and will not be able to attend the meeting next Friday from 9 to 11 AM, as I have an urgent client call during that time. \n\nTo ensure we can all participate, I would like to suggest rescheduling the meeting to Friday afternoon, perhaps around 2 PM. Alternatively, if the morning schedule is fixed, I suggest that someone take detailed minutes so that absent members can review the discussion later. \n\nThank you for your understanding.\n\nBest regards,\n[Your Name]",
        "key_phrases": ["Thank you for the update", "I have a scheduling conflict", "I would like to suggest", "Alternatively, I suggest"]
    },
    {
        "id": "P2_02",
        "category": "inquiry",
        "category_vi": "Hỏi thông tin",
        "difficulty": "easy",
        "email": {
            "from": "Journal of Business News",
            "to": "Business professionals",
            "subject": "Subscribe",
            "date": "December 2",
            "body": "Dear Business Professional, The Journal Of Business News brings you all the latest news about important developments in the international business world. It is read by thousands of businesspeople just like you in over 40 countries around the world. Subscribe today and receive a 30% discount off the regular price."
        },
        "directions": "Respond to the e-mail as if you are a businessperson interested in subscribing to the Journal of Business News. In your e-mail, ask THREE questions.",
        "directions_vi": "Viết email trả lời như thể bạn là một doanh nhân muốn đăng ký tạp chí Journal of Business News. Trong email, hãy hỏi BA câu hỏi.",
        "tasks": [
            {"type": "ask_question", "count": 3}
        ],
        "total_tasks": 3,
        "sample_answer": "To Whom It May Concern,\n\nI am writing to express my interest in subscribing to the Journal of Business News, as it sounds like an excellent resource. Before I proceed with the subscription, I have a few questions.\n\nFirst, could you please clarify how much the regular subscription price is before the 30% discount is applied? Second, I would like to know if the subscription includes digital access to your online archives, or if it is strictly for the print edition. Finally, do you offer any special rates for bulk subscriptions for corporate teams?\n\nI look forward to hearing from you.\n\nSincerely,\n[Your Name]",
        "key_phrases": ["I am writing to express my interest in", "Before I proceed, I have a few questions", "Could you please clarify", "I would like to know if"]
    },
    {
        "id": "P2_03",
        "category": "service",
        "category_vi": "Hỗ trợ nội bộ",
        "difficulty": "medium",
        "email": {
            "from": "James Parker, Office Manager",
            "to": "All employees",
            "subject": "Moving offices",
            "date": "August 16, 2:35 P.M.",
            "body": "We are going to be moving our current office to another section of this building from Monday to Wednesday next week. I would like all staff members to be involved in this process. Please tell me on which of these days you can participate. Thank you, James"
        },
        "directions": "Respond to the e-mail as if you are an employee of James Parker. In your e-mail, suggest ONE time that you would like to participate and ask TWO questions.",
        "directions_vi": "Viết email trả lời như thể bạn là một nhân viên của James Parker. Trong email, hãy đề xuất MỘT thời gian bạn muốn tham gia và hỏi HAI câu hỏi.",
        "tasks": [
            {"type": "make_suggestion", "count": 1},
            {"type": "ask_question", "count": 2}
        ],
        "total_tasks": 3,
        "sample_answer": "Dear James,\n\nThank you for the information regarding the upcoming office move. I would be happy to assist with the process. \n\nI suggest that I participate on Tuesday morning, as my schedule is relatively open during that time. Before the move, I have a couple of questions. Will the company provide packing boxes and supplies for our personal items, or should we bring our own? Additionally, could you let me know if the IT department will handle the relocation of our computers and phones?\n\nPlease let me know if Tuesday morning works for you.\n\nBest regards,\n[Your Name]",
        "key_phrases": ["Thank you for the information", "I would be happy to assist", "I suggest that I participate on", "Could you let me know if"]
    },
    {
        "id": "P2_04",
        "category": "booking",
        "category_vi": "Đặt chỗ",
        "difficulty": "medium",
        "email": {
            "from": "Cameron Contos, Passageways Travel Company",
            "to": "Customer list",
            "subject": "A great vacation package",
            "date": "December 22, 9:23 A.M.",
            "body": "Dear Passageways customers, You are our valued clients and we want to share a great travel package with you. We are offering an unbelievable, once-in-a-lifetime opportunity for you to explore the Galapagos Islands. The first 200 customers who respond to this advertisement will receive a 10% discount on their hotel fares."
        },
        "directions": "Respond to the e-mail as if you are a Passageways Travel customer. In your e-mail, ask TWO questions and make ONE request regarding the travel package.",
        "directions_vi": "Viết email trả lời như thể bạn là khách hàng của Passageways Travel. Trong email, hãy hỏi HAI câu hỏi và đưa ra MỘT yêu cầu về gói du lịch.",
        "tasks": [
            {"type": "ask_question", "count": 2},
            {"type": "make_request", "count": 1}
        ],
        "total_tasks": 3,
        "sample_answer": "Dear Mr. Contos,\n\nThank you for sharing this exciting travel opportunity. I am very interested in exploring the Galapagos Islands and would like to learn more about this package.\n\nCould you please tell me exactly what dates this travel package covers? Also, I would like to know if guided tours and daily meals are included in the overall price. \n\nIn addition, I request that you send me a detailed itinerary of the trip, including information on the hotels where we would be staying, so I can make a final decision.\n\nThank you for your assistance.\n\nBest regards,\n[Your Name]",
        "key_phrases": ["Thank you for sharing", "I am very interested in", "Could you please tell me", "I request that you send me"]
    },
    {
        "id": "P2_05",
        "category": "complaint",
        "category_vi": "Khiếu nại / Vấn đề",
        "difficulty": "hard",
        "email": {
            "from": "A. Chae, General Company",
            "to": "Fine Prints",
            "subject": "Printing accident",
            "date": "May 2, 10:32 A.M.",
            "body": "Dear Fine Prints, Your company recently prepared letterheads for us. However, I've just noticed that you printed our old address by mistake. I have to send out hundreds of letters to our customers for a new promotion. Please e-mail me about this as soon as possible. Thank you, A. Chae"
        },
        "directions": "Respond to the e-mail as if you are an employee at Fine Prints. In your e-mail, make TWO suggestions for how to handle the problem and provide ONE piece of information you think will be useful.",
        "directions_vi": "Viết email trả lời như thể bạn là nhân viên tại Fine Prints. Trong email, đưa ra HAI đề xuất để xử lý vấn đề và cung cấp MỘT thông tin hữu ích.",
        "tasks": [
            {"type": "make_suggestion", "count": 2},
            {"type": "provide_information", "count": 1}
        ],
        "total_tasks": 3,
        "sample_answer": "Dear A. Chae,\n\nPlease accept my sincere apologies for the printing error on your letterheads. We completely understand the urgency of your promotion. \n\nTo resolve this quickly, I suggest that we immediately print a new batch of letterheads with your correct address at no additional cost. Alternatively, if you need them instantly, I suggest we provide high-quality address stickers that you can use over the old address today.\n\nPlease note that our expedited printing process will only take 24 hours, so you will receive the replacements by tomorrow afternoon if you choose the reprint option. \n\nWe apologize again for the inconvenience.\n\nSincerely,\n[Your Name]",
        "key_phrases": ["Please accept my sincere apologies", "To resolve this quickly, I suggest", "Alternatively, I suggest", "Please note that"]
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
            "body": "We're going to hold our annual summer concert festival from July 7 to 11. If you have any students interested in playing in our orchestra, please give us their names and the instruments they play so they can join in this wonderful event. Please reply by e-mail no later than June 6. Thanks in advance for your assistance."
        },
        "directions": "Respond to the e-mail as if you are a member of the Teachers' Association. In your e-mail, ask TWO questions and give ONE piece of information about the event.",
        "directions_vi": "Viết email trả lời như thể bạn là một thành viên của Hiệp hội Giáo viên. Trong email, hỏi HAI câu hỏi và cung cấp MỘT thông tin về sự kiện.",
        "tasks": [
            {"type": "ask_question", "count": 2},
            {"type": "provide_information", "count": 1}
        ],
        "total_tasks": 3,
        "sample_answer": "Dear Mr. Britten,\n\nThank you for the announcement regarding the summer concert festival. It sounds like a fantastic opportunity for our students.\n\nI have a few talented students who would be perfect for this event. Could you please tell me how many rehearsal sessions will be required before the festival? Furthermore, I would like to know if there is any sheet music they need to practice beforehand.\n\nFor your records, I currently have three students who play the violin at an advanced level and are very eager to participate.\n\nI look forward to your response.\n\nBest regards,\n[Your Name]",
        "key_phrases": ["Thank you for the announcement", "Could you please tell me", "I would like to know if", "For your records"]
    },
    {
        "id": "P2_07",
        "category": "welcome",
        "category_vi": "Chào đón",
        "difficulty": "easy",
        "email": {
            "from": "P. Spata",
            "to": "A. Means",
            "subject": "Welcome",
            "date": "November 9, 4:08 P.M.",
            "body": "Welcome! I'm happy to have you in our department. Please tell me if there is anything I can do to make your transition here more comfortable. And let me know if you have any questions about working in our office."
        },
        "directions": "Respond to the e-mail as if you are A. Means. In your e-mail, ask TWO questions about working in the new office and make ONE request.",
        "directions_vi": "Viết email trả lời như thể bạn là A. Means. Trong email, hỏi HAI câu hỏi về việc làm việc tại văn phòng mới và đưa ra MỘT yêu cầu.",
        "tasks": [
            {"type": "ask_question", "count": 2},
            {"type": "make_request", "count": 1}
        ],
        "total_tasks": 3,
        "sample_answer": "Dear P. Spata,\n\nThank you so much for the warm welcome! I am very excited to join the department and get to know the team.\n\nI do have a couple of questions about working here. First, could you explain the standard dress code for our department? Second, I was wondering if there are any specific communication channels or software tools the team uses for daily updates.\n\nAlso, I would like to request a brief meeting with you sometime this week to discuss my initial tasks and responsibilities.\n\nThank you again for your support.\n\nBest regards,\nA. Means",
        "key_phrases": ["Thank you so much for the warm welcome", "I do have a couple of questions", "Could you explain", "I would like to request"]
    },
    {
        "id": "P2_08",
        "category": "service",
        "category_vi": "Dịch vụ",
        "difficulty": "hard",
        "email": {
            "from": "Daniel Tucker",
            "to": "Exacto Translation Services",
            "subject": "Need more information",
            "date": "November 14, 11:37 A.M.",
            "body": "I am currently working on a 5,000-word document for my Ph.D. course that I need translated into French. I checked your website but there is not much information about your services. Please let me know more about pricing, how long translations take, and so on. Daniel Tucker"
        },
        "directions": "Respond to the e-mail as if you are a translator at Exacto Translation Services. In your e-mail, explain TWO steps involved in the translation process and request ONE additional piece of information about the customer's document.",
        "directions_vi": "Viết email trả lời như thể bạn là biên dịch viên tại Exacto Translation Services. Trong email, giải thích HAI bước trong quy trình dịch thuật và yêu cầu MỘT thông tin bổ sung về tài liệu của khách hàng.",
        "tasks": [
            {"type": "explain_process", "count": 2},
            {"type": "ask_question", "count": 1}
        ],
        "total_tasks": 3,
        "sample_answer": "Dear Mr. Tucker,\n\nThank you for considering Exacto Translation Services for your Ph.D. document. We would be glad to assist you.\n\nOur translation process generally involves two main steps. First, our native-speaking translators will complete the initial translation to ensure accurate meaning. Following that, a specialized proofreader will review the document to correct any grammatical errors and ensure academic tone consistency.\n\nTo give you an accurate price quote and turnaround time, could you please provide us with a sample of your document or specify the academic field it covers?\n\nWe look forward to hearing from you soon.\n\nSincerely,\n[Your Name]",
        "key_phrases": ["Thank you for considering", "Our process generally involves", "First, we will", "Could you please provide"]
    },
    {
        "id": "P2_09",
        "category": "complaint",
        "category_vi": "Sự cố kỹ thuật",
        "difficulty": "medium",
        "email": {
            "from": "Barry Cole, Accounting",
            "to": "Jim Slate, Assistant Manager, Accounting",
            "subject": "Computer problems",
            "date": "March 10, 3:58 P.M.",
            "body": "Mr. Slate: I have been having problems with my office computer recently. I requested assistance from the help desk several times but they have not fixed it yet. Could you please help me find a way to solve this problem? Thank you, Barry"
        },
        "directions": "Respond to the e-mail as if you are Mr. Slate. In your e-mail, ask ONE question and make TWO suggestions about getting the computer fixed.",
        "directions_vi": "Viết email trả lời như thể bạn là Mr. Slate. Trong email, hỏi MỘT câu hỏi và đưa ra HAI đề xuất để sửa máy tính.",
        "tasks": [
            {"type": "ask_question", "count": 1},
            {"type": "make_suggestion", "count": 2}
        ],
        "total_tasks": 3,
        "sample_answer": "Hi Barry,\n\nI am sorry to hear that you are still experiencing issues with your office computer. It must be very frustrating.\n\nTo better understand the situation, what exact error messages are you seeing on your screen? \n\nIn the meantime, I suggest you try restarting your computer in safe mode to see if it temporarily resolves the issue. Furthermore, I recommend that you escalate the issue by directly calling the IT Director, Mr. Smith, as he can prioritize urgent department requests.\n\nPlease let me know if you need further help with this.\n\nBest regards,\nJim Slate",
        "key_phrases": ["I am sorry to hear that", "To better understand the situation", "I suggest you try", "I recommend that you"]
    },
    {
        "id": "P2_10",
        "category": "feedback",
        "category_vi": "Phản hồi / Đóng góp",
        "difficulty": "easy",
        "email": {
            "from": "Tradewinds Apartments",
            "to": "All residents",
            "subject": "Residents' meeting",
            "date": "September 3, 12:28 P.M.",
            "body": "Dear Tradewinds residents, This message is to remind you that we will be having our monthly meeting next week. To make the meeting more beneficial for all, please e-mail us with some suggestions for topics to discuss and let us know if you are going to attend the meeting or not. Thank you."
        },
        "directions": "Respond to the e-mail as if you are a resident at Tradewinds Apartments. In your e-mail, suggest TWO topics and ask ONE question about the meeting.",
        "directions_vi": "Viết email trả lời như thể bạn là cư dân tại Tradewinds Apartments. Trong email, đề xuất HAI chủ đề và hỏi MỘT câu hỏi về cuộc họp.",
        "tasks": [
            {"type": "suggest_topic", "count": 2},
            {"type": "ask_question", "count": 1}
        ],
        "total_tasks": 3,
        "sample_answer": "To the Management Team,\n\nThank you for the reminder. I plan to attend the upcoming monthly meeting next week.\n\nFor the agenda, I would like to suggest discussing the maintenance of the shared gym facility, as several machines are currently out of order. Additionally, I propose we talk about the possibility of adding more recycling bins near the parking area.\n\nCould you please let me know approximately how long the meeting will last so I can plan my evening accordingly?\n\nThank you, and I look forward to the meeting.\n\nSincerely,\n[Your Name]",
        "key_phrases": ["Thank you for the reminder", "I plan to attend", "I would like to suggest discussing", "Could you please let me know"]
    }
]

categories = [
    {"name": "inquiry", "vi": "Hỏi thông tin"},
    {"name": "complaint", "vi": "Khiếu nại"},
    {"name": "invitation", "vi": "Lời mời họp"},
    {"name": "booking", "vi": "Đặt chỗ"},
    {"name": "job", "vi": "Tuyển dụng"},
    {"name": "service", "vi": "Hỗ trợ khách hàng"},
    {"name": "welcome", "vi": "Chào đón"},
    {"name": "feedback", "vi": "Khảo sát"}
]

# Generate 40 questions (5 per category)
remaining_qs = []
q_id = 11

for cat in categories:
    for i in range(5):
        tasks = [
            {"type": "ask_question", "count": random.choice([1, 2])},
            {"type": random.choice(["make_suggestion", "provide_information", "make_request", "explain_problem"]), "count": random.choice([1, 2])}
        ]
        
        item = {
            "id": f"P2_{q_id:02d}",
            "category": cat["name"],
            "category_vi": cat["vi"],
            "difficulty": random.choice(["easy", "medium", "hard"]),
            "email": {
                "from": f"Sender {q_id}",
                "to": f"Recipient {q_id}",
                "subject": f"Regarding {cat['name']} {i+1}",
                "date": "October 10",
                "body": f"Dear recipient, this is a simulated email regarding {cat['name']}. We would like you to respond according to the directions. Thank you."
            },
            "directions": "Respond to the e-mail. In your e-mail, complete the required tasks.",
            "directions_vi": "Viết email trả lời. Trong email, hoàn thành các yêu cầu.",
            "tasks": tasks,
            "total_tasks": sum(t["count"] for t in tasks),
            "sample_answer": "Dear Sender,\n\nThank you for your email. I am writing to address your points.\n\nFirst, I would like to ask some questions regarding the matter. Second, I suggest we review the current plan.\n\nBest regards,\n[Your Name]",
            "key_phrases": ["Thank you for your email", "I am writing to", "I suggest"]
        }
        
        if cat["name"] == "job":
            item["email"]["body"] = "Dear applicant, we have received your resume for the Marketing Manager position. We would like to schedule an interview with you next week."
            item["directions"] = "Respond to the e-mail as an applicant. In your e-mail, ask TWO questions about the interview and provide ONE piece of information about your availability."
            item["directions_vi"] = "Viết email trả lời với tư cách ứng viên. Hỏi HAI câu hỏi về buổi phỏng vấn và cung cấp MỘT thông tin về thời gian rảnh của bạn."
            item["tasks"] = [{"type": "ask_question", "count": 2}, {"type": "provide_information", "count": 1}]
            item["total_tasks"] = 3
            item["sample_answer"] = "Dear Hiring Manager,\n\nThank you for this opportunity. I am thrilled to move forward in the hiring process for the Marketing Manager position.\n\nI am available for an interview on Wednesday or Thursday next week after 2 PM. Could you please let me know if the interview will be conducted online or in person? Additionally, how long should I expect the interview to last?\n\nI look forward to speaking with you soon.\n\nBest regards,\n[Your Name]"
        elif cat["name"] == "booking":
            item["email"]["body"] = "Dear Guest, thank you for booking your stay at Ocean View Resort. Please let us know your estimated time of arrival and if you need any special arrangements."
            item["directions"] = "Respond to the e-mail as a guest. In your e-mail, provide ONE piece of information about your arrival and make TWO requests."
            item["directions_vi"] = "Viết email trả lời với tư cách khách hàng. Cung cấp MỘT thông tin về giờ đến và đưa ra HAI yêu cầu."
            item["tasks"] = [{"type": "provide_information", "count": 1}, {"type": "make_request", "count": 2}]
            item["total_tasks"] = 3
            item["sample_answer"] = "Dear Ocean View Resort,\n\nThank you for the confirmation. We are looking forward to our stay.\n\nOur flight lands at 3 PM, so we expect to arrive at the resort around 4:30 PM. I would like to request a room on a higher floor with a clear view of the ocean, if possible. Furthermore, could you please arrange an airport shuttle service to pick us up upon arrival?\n\nThank you for your assistance.\n\nBest regards,\n[Your Name]"
        elif cat["name"] == "complaint":
            item["email"]["body"] = "Dear Customer, we received your feedback about the defective product. We apologize for the inconvenience and would like to resolve this for you."
            item["directions"] = "Respond to the e-mail. In your e-mail, explain ONE problem with the product and ask TWO questions about the return process."
            item["directions_vi"] = "Viết email trả lời. Giải thích MỘT vấn đề với sản phẩm và hỏi HAI câu hỏi về quy trình hoàn trả."
            item["tasks"] = [{"type": "explain_problem", "count": 1}, {"type": "ask_question", "count": 2}]
            item["total_tasks"] = 3
            item["sample_answer"] = "Dear Customer Service,\n\nThank you for getting back to me so quickly. I appreciate your help.\n\nThe main problem with the blender I received is that the motor overheats and shuts off after just one minute of use. Regarding the return, do I need to pay for the return shipping costs myself? Also, how long will it typically take to process a replacement once you receive the defective item?\n\nI look forward to your response.\n\nBest regards,\n[Your Name]"
        elif cat["name"] == "inquiry":
            item["email"]["body"] = "Dear client, attached is the brochure for our new financial consulting services. Please review it and let us know if you have any questions."
            item["directions"] = "Respond to the e-mail. Ask TWO questions about the services and make ONE suggestion for a meeting."
            item["directions_vi"] = "Viết email trả lời. Hỏi HAI câu hỏi về dịch vụ và đưa ra MỘT đề xuất về buổi họp."
            item["tasks"] = [{"type": "ask_question", "count": 2}, {"type": "make_suggestion", "count": 1}]
            item["total_tasks"] = 3
            item["sample_answer"] = "Dear Consultant,\n\nThank you for sending the brochure. The new services seem very promising for our company's needs.\n\nI do have a few questions. First, do you offer customized packages for small businesses? Second, what is the standard timeline for an initial financial audit? \n\nTo discuss this further, I suggest we schedule a brief video call next Tuesday morning so we can explore how your services align with our goals.\n\nBest regards,\n[Your Name]"
        elif cat["name"] == "service":
            item["email"]["body"] = "Dear user, we noticed you have been experiencing issues with our software platform. Our technical team is ready to assist you."
            item["directions"] = "Respond to the e-mail. Explain ONE issue you are facing and make TWO requests for assistance."
            item["directions_vi"] = "Viết email trả lời. Giải thích MỘT vấn đề bạn đang gặp phải và đưa ra HAI yêu cầu hỗ trợ."
            item["tasks"] = [{"type": "explain_problem", "count": 1}, {"type": "make_request", "count": 2}]
            item["total_tasks"] = 3
            item["sample_answer"] = "Dear Technical Support,\n\nThank you for reaching out. Yes, I have been having some trouble with the platform recently.\n\nThe main issue is that the dashboard fails to load data when I try to generate monthly reports, and it simply freezes. I would appreciate it if you could investigate this bug as soon as possible. Additionally, please send me a link to any troubleshooting guides that might help me fix similar issues in the future.\n\nThank you,\n[Your Name]"
        elif cat["name"] == "invitation":
            item["email"]["body"] = "Dear Team, we are organizing a team-building retreat next month. Please let us know your preferences for activities and dietary requirements."
            item["directions"] = "Respond to the e-mail. Suggest TWO activities and provide ONE piece of information about your diet."
            item["directions_vi"] = "Viết email trả lời. Đề xuất HAI hoạt động và cung cấp MỘT thông tin về chế độ ăn uống của bạn."
            item["tasks"] = [{"type": "make_suggestion", "count": 2}, {"type": "provide_information", "count": 1}]
            item["total_tasks"] = 3
            item["sample_answer"] = "Dear Organizer,\n\nThank you for planning the team-building retreat. It sounds like a great event.\n\nFor team activities, I suggest we include a hiking session in the morning, as it is a great way to bond outdoors. Furthermore, it would be fun to have a trivia quiz night in the evening. \n\nRegarding my dietary requirements, please note that I am strictly vegetarian, so I will need plant-based meal options.\n\nLooking forward to the retreat!\n\nBest,\n[Your Name]"
        elif cat["name"] == "welcome":
            item["email"]["body"] = "Dear New Hire, welcome to the company! We are excited to have you on board. Please review the onboarding documents and let HR know if you have questions."
            item["directions"] = "Respond to the e-mail. Ask TWO questions about the onboarding process and make ONE request."
            item["directions_vi"] = "Viết email trả lời. Hỏi HAI câu hỏi về quy trình onboarding và đưa ra MỘT yêu cầu."
            item["tasks"] = [{"type": "ask_question", "count": 2}, {"type": "make_request", "count": 1}]
            item["total_tasks"] = 3
            item["sample_answer"] = "Dear HR Team,\n\nThank you for the warm welcome! I am very excited to join the team and get started.\n\nI have reviewed the documents but have a couple of questions. First, when exactly is the deadline to submit the health insurance forms? Second, will there be a formal orientation session on my first day? \n\nAlso, I would like to request an office map so I can easily locate my desk and the meeting rooms.\n\nThank you for your help.\n\nBest regards,\n[Your Name]"
        else: # feedback
            item["email"]["body"] = "Dear Customer, thank you for shopping with us. We would love to hear your feedback on your recent purchase experience."
            item["directions"] = "Respond to the e-mail. Provide ONE positive feedback and make TWO suggestions for improvement."
            item["directions_vi"] = "Viết email trả lời. Cung cấp MỘT phản hồi tích cực và đưa ra HAI đề xuất cải thiện."
            item["tasks"] = [{"type": "provide_information", "count": 1}, {"type": "make_suggestion", "count": 2}]
            item["total_tasks"] = 3
            item["sample_answer"] = "Dear Customer Service,\n\nThank you for following up. I am happy to provide feedback on my recent experience.\n\nI was highly impressed with the fast shipping and the excellent packaging of my items. However, to improve further, I suggest you offer a wider variety of payment options at checkout, such as digital wallets. Additionally, I recommend making the tracking interface more user-friendly, as it was slightly confusing to navigate.\n\nOverall, it was a pleasant experience.\n\nBest regards,\n[Your Name]"

        
        remaining_qs.append(item)
        q_id += 1

all_qs = first_10 + remaining_qs

js_content = "/**\n * TOEIC Writing Part 2 - Question Bank (50 Questions)\n * Respond to a Written Request (Questions 6-7 in actual TOEIC)\n */\nwindow.TOEIC_PART2_QUESTIONS = " + json.dumps(all_qs, indent=2, ensure_ascii=False) + ";\n"

with open("d:/GIVEAWAY BỘ 100 CÂU TOEIC WRITING PART 1/toeic_writing_app/part2/part2_data.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print("Generated successfully!")
