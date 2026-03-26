from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Toeic + Aptis Academy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SITE_OVERVIEW = {
    "brand": "Bloom English House",
    "tagline": "Nhẹ nhàng, cute Hàn Quốc, nhưng học là vào form thi thật.",
    "hero": {
        "title": "Một trang học cho cả TOEIC và Aptis",
        "subtitle": (
            "Lấy tinh thần từ Charnishere cho TOEIC và giao diện khóa học từ Edubit "
            "để làm một website học, xem video, test online, flashcard và hồ sơ tiến độ."
        ),
        "cta_primary": "Vào khu TOEIC",
        "cta_secondary": "Xem Aptis",
    },
    "certificates": [
        {
            "slug": "toeic",
            "label": "TOEIC",
            "description": "8 tính năng học từ vựng, ngữ pháp, profile và mini game.",
            "accent": "sunrise",
            "stats": ["12 bộ từ vựng", "450+ từ khóa", "full dashboard xinh xắn"],
        },
        {
            "slug": "aptis",
            "label": "APTIS",
            "description": "Khóa học video, lesson roadmap và online test cho Reading, Listening, Grammar & Vocab.",
            "accent": "mint",
            "stats": ["3 lộ trình", "video lesson", "mock tests online"],
        },
    ],
    "toeic_features": [
        {"key": "search", "title": "Tra từ thông minh", "icon": "Sparkles", "description": "Tìm từ và hiện nghĩa + câu đã xuất hiện trong đề."},
        {"key": "flashcard", "title": "Flashcard", "icon": "Layers", "description": "Thẻ học pastel, lật mặt, lưu từ và đi theo chủ đề."},
        {"key": "quiz", "title": "Quiz", "icon": "BadgeCheck", "description": "Làm trắc nghiệm nghĩa từ như phong cách Charnishere."},
        {"key": "listening", "title": "Nghe phát âm", "icon": "Headphones", "description": "Nghe bot đọc và đoán lại từ."},
        {"key": "typing", "title": "Typing", "icon": "Keyboard", "description": "Gõ lại từ theo nghĩa để nhớ lâu."},
        {"key": "matching", "title": "Nối từ", "icon": "Puzzle", "description": "Ghép nhanh từ và nghĩa trong dạng game."},
        {"key": "grammar", "title": "Ngữ pháp", "icon": "BookOpen", "description": "Lý thuyết + bài tập thực hành theo từng dạng."},
        {"key": "profile", "title": "Hồ sơ", "icon": "Trophy", "description": "Theo dõi streak, từ đã lưu và điểm tích lũy."},
    ],
}


TOEIC_SETS = [
    {
        "id": "office-rhythm",
        "title": "Office Rhythm",
        "level": "Core 550+",
        "theme": "Văn phòng và vận hành",
        "color": "#ffd9e8",
        "words": [
            {
                "id": "allocate",
                "word": "allocate",
                "type": "verb",
                "ipa": "/ˈal.ə.keɪt/",
                "meaning": "phân bổ tài nguyên, ngân sách hoặc nhân sự",
                "example_en": "The manager allocated extra staff to the support desk before the launch.",
                "example_vi": "Quan ly da phan bo them nhan su cho ban ho tro truoc ngay ra mat.",
                "origin": "Latin allocare",
                "synonyms": ["assign", "distribute"],
                "note": "Hay gặp trong email nội bộ và budget report.",
                "sentences": [
                    "Please allocate enough time for the compliance review before Friday.",
                    "The finance team allocated a larger budget to digital campaigns this quarter.",
                ],
            },
            {
                "id": "procurement",
                "word": "procurement",
                "type": "noun",
                "ipa": "/prəˈkjʊr.mənt/",
                "meaning": "việc mua sắm hàng hóa, dịch vụ cho công ty",
                "example_en": "Procurement approved a new supplier for packaging materials.",
                "example_vi": "Bo phan mua sam da phe duyet nha cung cap moi cho vat lieu dong goi.",
                "origin": "Latin procurare",
                "synonyms": ["purchasing", "acquisition"],
                "note": "Rất hay có trong TOEIC Part 7 business memo.",
                "sentences": [
                    "Our procurement policy requires three quotations for any purchase over $5,000.",
                    "The procurement officer negotiated better delivery terms with the vendor.",
                ],
            },
            {
                "id": "backlog",
                "word": "backlog",
                "type": "noun",
                "ipa": "/ˈbæk.lɒɡ/",
                "meaning": "lượng công việc tồn đọng chưa xử lý",
                "example_en": "The customer service team cleared the backlog after hiring two assistants.",
                "example_vi": "Nhom cham soc khach hang da xu ly xong luong viec ton dong sau khi tuyen them hai tro ly.",
                "origin": "log kept at the back",
                "synonyms": ["pending work", "queue"],
                "note": "Thường xuất hiện trong context service delay.",
                "sentences": [
                    "We still have a backlog of refund requests from last month.",
                    "The warehouse backlog shrank once the night shift was introduced.",
                ],
            },
            {
                "id": "compliance",
                "word": "compliance",
                "type": "noun",
                "ipa": "/kəmˈplaɪ.əns/",
                "meaning": "sự tuân thủ quy định, tiêu chuẩn hoặc chính sách",
                "example_en": "Compliance checks must be completed before the contract is signed.",
                "example_vi": "Các bước kiểm tra tuân thủ phải được hoàn thành trước khi hợp đồng được ký.",
                "origin": "comply",
                "synonyms": ["adherence", "conformity"],
                "note": "Một từ rất quan trọng trong email, legal notice, HR notice.",
                "sentences": [
                    "The audit found minor compliance issues in the records.",
                    "Staff training was updated to improve compliance with safety rules.",
                ],
            },
            {
                "id": "streamline",
                "word": "streamline",
                "type": "verb",
                "ipa": "/ˈstriːm.laɪn/",
                "meaning": "đơn giản hóa quy trình để nhanh và hiệu quả hơn",
                "example_en": "We streamlined the hiring workflow by combining two approval steps.",
                "example_vi": "Chung toi da don gian hoa quy trinh tuyen dung bang cach gop hai buoc phe duyet.",
                "origin": "stream line",
                "synonyms": ["simplify", "optimize"],
                "note": "Hay thấy trong proposal hoặc performance review.",
                "sentences": [
                    "The app will streamline appointment scheduling for patients.",
                    "Management wants to streamline inventory tracking before the busy season.",
                ],
            },
        ],
    },
    {
        "id": "travel-service",
        "title": "Travel & Service",
        "level": "Core 650+",
        "theme": "Khách sạn, di chuyển, dịch vụ",
        "color": "#fff4c2",
        "words": [
            {
                "id": "itinerary",
                "word": "itinerary",
                "type": "noun",
                "ipa": "/aɪˈtɪn.ər.ər.i/",
                "meaning": "lịch trình chi tiết của chuyến đi",
                "example_en": "The travel coordinator emailed the final itinerary to all participants.",
                "example_vi": "Dieu phoi vien du lich da gui lich trinh cuoi cung cho tat ca nguoi tham gia.",
                "origin": "Latin itinerarium",
                "synonyms": ["schedule", "travel plan"],
                "note": "Rất hay xuất hiện trong booking email.",
                "sentences": [
                    "Please review the itinerary before confirming your flight details.",
                    "A revised itinerary was issued due to heavy rain in Busan.",
                ],
            },
            {
                "id": "amenities",
                "word": "amenities",
                "type": "noun",
                "ipa": "/əˈmiː.nə.tiz/",
                "meaning": "các tiện ích đi kèm như gym, hồ bơi, breakfast",
                "example_en": "The upgraded room includes premium amenities and late checkout.",
                "example_vi": "Phong nang hang bao gom tien ich cao cap va tra phong muon.",
                "origin": "amenity",
                "synonyms": ["facilities", "extras"],
                "note": "Gap nhieu trong hotel advertisement.",
                "sentences": [
                    "Guests appreciated the hotel's business center and other amenities.",
                    "The brochure lists all amenities available at the resort.",
                ],
            },
            {
                "id": "reimburse",
                "word": "reimburse",
                "type": "verb",
                "ipa": "/ˌriː.ɪmˈbɜːs/",
                "meaning": "hoan tra chi phi da ung truoc",
                "example_en": "Employees will be reimbursed for approved taxi expenses.",
                "example_vi": "Nhan vien se duoc hoan tien cho cac chi phi taxi da duoc phe duyet.",
                "origin": "Old French rembourser",
                "synonyms": ["repay", "refund"],
                "note": "Cuc ky pho bien trong expense form.",
                "sentences": [
                    "Please submit your receipts within five days to be reimbursed.",
                    "The company reimbursed all conference registration fees.",
                ],
            },
            {
                "id": "complimentary",
                "word": "complimentary",
                "type": "adjective",
                "ipa": "/ˌkɒm.plɪˈmen.tər.i/",
                "meaning": "mien phi, tang kem",
                "example_en": "All guests receive complimentary breakfast and airport pickup.",
                "example_vi": "Tat ca khach deu duoc tang buffet sang va dua don san bay.",
                "origin": "compliment",
                "synonyms": ["free", "included"],
                "note": "De nham voi compliment khen ngoi; trong service thi nghia la mien phi.",
                "sentences": [
                    "The hotel offered complimentary drinks in the lobby.",
                    "A complimentary shuttle runs every thirty minutes.",
                ],
            },
            {
                "id": "detour",
                "word": "detour",
                "type": "noun",
                "ipa": "/ˈdiː.tʊər/",
                "meaning": "duong vong tam thoi do sua duong hoac tac duong",
                "example_en": "Passengers were advised to expect a detour because of road construction.",
                "example_vi": "Hanh khach duoc thong bao se di duong vong vi cong trinh dang thi cong.",
                "origin": "French detour",
                "synonyms": ["alternate route", "diversion"],
                "note": "Hay thay trong thong bao giao thong va schedule notice.",
                "sentences": [
                    "The shuttle made a short detour around the closed bridge.",
                    "Delivery trucks must follow the posted detour signs.",
                ],
            },
        ],
    },
    {
        "id": "marketing-finance",
        "title": "Marketing & Finance",
        "level": "Core 750+",
        "theme": "Bao cao, chien dich, doanh thu",
        "color": "#dff5e8",
        "words": [
            {
                "id": "benchmark",
                "word": "benchmark",
                "type": "noun",
                "ipa": "/ˈbentʃ.mɑːk/",
                "meaning": "moc chuan de so sanh hieu suat",
                "example_en": "Last year's sales figures are the benchmark for this quarter's target.",
                "example_vi": "So lieu doanh so nam ngoai la moc chuan cho muc tieu quy nay.",
                "origin": "mark on a bench",
                "synonyms": ["standard", "reference point"],
                "note": "Rat hop cho report, analytics, KPI context.",
                "sentences": [
                    "The campaign exceeded the benchmark for email click-through rates.",
                    "Regional offices use Tokyo as a benchmark for customer retention.",
                ],
            },
            {
                "id": "lucrative",
                "word": "lucrative",
                "type": "adjective",
                "ipa": "/ˈluː.krə.tɪv/",
                "meaning": "sinh loi cao, đem lai nhieu loi nhuan",
                "example_en": "The company secured a lucrative contract with a regional distributor.",
                "example_vi": "Cong ty da ky duoc hop dong rat sinh loi voi mot nha phan phoi khu vuc.",
                "origin": "Latin lucrum",
                "synonyms": ["profitable", "high-yield"],
                "note": "Tu kho, la, dung de nang cap lexical range.",
                "sentences": [
                    "Luxury skincare remains one of the brand's most lucrative segments.",
                    "Their partnership with the airport became especially lucrative during the holidays.",
                ],
            },
            {
                "id": "merger",
                "word": "merger",
                "type": "noun",
                "ipa": "/ˈmɜː.dʒər/",
                "meaning": "su sap nhap giua hai cong ty",
                "example_en": "Shareholders approved the merger after months of negotiation.",
                "example_vi": "Co dong da thong qua vu sap nhap sau nhieu thang dam phan.",
                "origin": "merge",
                "synonyms": ["consolidation", "combination"],
                "note": "Hay co trong business news passage.",
                "sentences": [
                    "The merger created the largest retail network in the province.",
                    "Staff received a memo outlining changes after the merger.",
                ],
            },
            {
                "id": "forecast",
                "word": "forecast",
                "type": "noun",
                "ipa": "/ˈfɔː.kɑːst/",
                "meaning": "du bao doanh thu, nhu cau hoac xu huong",
                "example_en": "The updated forecast predicts stronger demand in the final quarter.",
                "example_vi": "Ban du bao moi du doan nhu cau se tang manh vao quy cuoi.",
                "origin": "fore + cast",
                "synonyms": ["projection", "prediction"],
                "note": "Thuong di cung sales, revenue, demand.",
                "sentences": [
                    "Analysts adjusted the revenue forecast after the product recall.",
                    "The weather forecast affected attendance at the outdoor expo.",
                ],
            },
            {
                "id": "undermine",
                "word": "undermine",
                "type": "verb",
                "ipa": "/ˌʌn.dəˈmaɪn/",
                "meaning": "lam suy yeu, gay ton hai dan dan",
                "example_en": "Late deliveries can undermine customer confidence in the brand.",
                "example_vi": "Vie c giao hang tre co the lam suy yeu niem tin cua khach hang vao thuong hieu.",
                "origin": "under + mine",
                "synonyms": ["weaken", "erode"],
                "note": "Mot tu premium rat hop cho cau suy luan.",
                "sentences": [
                    "Frequent system errors may undermine the launch campaign.",
                    "Poor communication undermined morale across the department.",
                ],
            },
        ],
    },
]


GRAMMAR_TOPICS = [
    {
        "id": "participle-adjectives",
        "title": "Participle Adjectives",
        "summary": "Phan biet -ed va -ing trong email, notice, advertisement.",
        "accent": "#ffe7c6",
        "theory_points": [
            "-ed mo ta cam xuc cua nguoi: The staff felt relieved.",
            "-ing mo ta tinh chat gay ra cam xuc: The delay was frustrating.",
            "Trong TOEIC, dung sai cap nay rat hay bi danh lua o sentence completion.",
        ],
        "practice": [
            {
                "question": "Customers were ______ by the fast response from the support team.",
                "options": ["impress", "impressed", "impressive", "impression"],
                "answer": 1,
                "explanation": "Chu ngu la customers nen can tinh tu chi cam xuc cua nguoi => impressed.",
            },
            {
                "question": "The new dashboard is more ______ than the old reporting tool.",
                "options": ["engaging", "engaged", "engage", "engagement"],
                "answer": 0,
                "explanation": "Dashboard la vat gay cam xuc/thu hut, nen dung engaging.",
            },
        ],
    },
    {
        "id": "conditionals-business",
        "title": "Business Conditionals",
        "summary": "Neu... thi... trong context policy, shipping, reimbursement.",
        "accent": "#d8f5e4",
        "theory_points": [
            "If + hien tai don, will + V cho tinh huong thuc te tuong lai.",
            "If + qua khu don, would + V cho tinh huong gia dinh.",
            "TOEIC rat hay hoi dang dong tu sau if hoac ket qua cua cau.",
        ],
        "practice": [
            {
                "question": "If the shipment arrives before noon, we ______ the order today.",
                "options": ["dispatch", "will dispatch", "dispatched", "would dispatch"],
                "answer": 1,
                "explanation": "Menh de if dang hien tai => menh de chinh dung will dispatch.",
            },
            {
                "question": "If the venue were larger, the event ______ more sponsors.",
                "options": ["attracts", "will attract", "would attract", "attracted"],
                "answer": 2,
                "explanation": "Tinh huong gia dinh hien tai => If were ..., would attract.",
            },
        ],
    },
    {
        "id": "relative-clauses",
        "title": "Relative Clauses",
        "summary": "Who, which, that trong memo, brochure, company profile.",
        "accent": "#dfe9ff",
        "theory_points": [
            "Who cho nguoi, which cho vat, that dung cho ca hai trong restrictive clause.",
            "Muc tieu la noi thong tin phu khong lam dut mach logic cau.",
            "Part 6 va Part 7 cuc hay dat cau hoi dang nay.",
        ],
        "practice": [
            {
                "question": "The consultant ______ led the workshop will send the slides tomorrow.",
                "options": ["which", "who", "whose", "whom"],
                "answer": 1,
                "explanation": "Consultant la nguoi va dong vai tro chu ngu trong menh de phu => who.",
            },
            {
                "question": "The app update, ______ was released last week, fixed the login issue.",
                "options": ["that", "which", "who", "where"],
                "answer": 1,
                "explanation": "Menh de co dau phay la non-restrictive clause => which.",
            },
        ],
    },
]


TOEIC_FULL_TEST_PACKS = [
    {
        "id": "ets-2026-test-1",
        "series": "ETS 2026",
        "title": "Test 1",
        "questions": 200,
        "duration_minutes": 120,
        "status": "Chua lam",
        "focus": "Listening + Reading full format",
        "parts": [
            {"part": "Part 1", "count": 6, "type": "Photos"},
            {"part": "Part 2", "count": 25, "type": "Question-Response"},
            {"part": "Part 3", "count": 39, "type": "Conversations"},
            {"part": "Part 4", "count": 30, "type": "Talks"},
            {"part": "Part 5", "count": 30, "type": "Incomplete Sentences"},
            {"part": "Part 6", "count": 16, "type": "Text Completion"},
            {"part": "Part 7", "count": 54, "type": "Reading Comprehension"},
        ],
    },
    {
        "id": "ets-2026-test-2",
        "series": "ETS 2026",
        "title": "Test 2",
        "questions": 200,
        "duration_minutes": 120,
        "status": "Dang hoc",
        "focus": "Part 5-7 business reading",
        "parts": [
            {"part": "Part 1", "count": 6, "type": "Photos"},
            {"part": "Part 2", "count": 25, "type": "Question-Response"},
            {"part": "Part 3", "count": 39, "type": "Conversations"},
            {"part": "Part 4", "count": 30, "type": "Talks"},
            {"part": "Part 5", "count": 30, "type": "Incomplete Sentences"},
            {"part": "Part 6", "count": 16, "type": "Text Completion"},
            {"part": "Part 7", "count": 54, "type": "Reading Comprehension"},
        ],
    },
    {
        "id": "ets-2024-test-1",
        "series": "ETS 2024",
        "title": "Test 1",
        "questions": 200,
        "duration_minutes": 120,
        "status": "Chua lam",
        "focus": "Classic ETS pacing",
        "parts": [
            {"part": "Part 1", "count": 6, "type": "Photos"},
            {"part": "Part 2", "count": 25, "type": "Question-Response"},
            {"part": "Part 3", "count": 39, "type": "Conversations"},
            {"part": "Part 4", "count": 30, "type": "Talks"},
            {"part": "Part 5", "count": 30, "type": "Incomplete Sentences"},
            {"part": "Part 6", "count": 16, "type": "Text Completion"},
            {"part": "Part 7", "count": 54, "type": "Reading Comprehension"},
        ],
    },
    {
        "id": "ets-2024-test-2",
        "series": "ETS 2024",
        "title": "Test 2",
        "questions": 200,
        "duration_minutes": 120,
        "status": "Da lam",
        "focus": "Mixed grammar traps",
        "parts": [
            {"part": "Part 1", "count": 6, "type": "Photos"},
            {"part": "Part 2", "count": 25, "type": "Question-Response"},
            {"part": "Part 3", "count": 39, "type": "Conversations"},
            {"part": "Part 4", "count": 30, "type": "Talks"},
            {"part": "Part 5", "count": 30, "type": "Incomplete Sentences"},
            {"part": "Part 6", "count": 16, "type": "Text Completion"},
            {"part": "Part 7", "count": 54, "type": "Reading Comprehension"},
        ],
    },
    {
        "id": "ets-2023-test-1",
        "series": "ETS 2023",
        "title": "Test 1",
        "questions": 200,
        "duration_minutes": 120,
        "status": "Chua lam",
        "focus": "Reading inference heavy",
        "parts": [
            {"part": "Part 1", "count": 6, "type": "Photos"},
            {"part": "Part 2", "count": 25, "type": "Question-Response"},
            {"part": "Part 3", "count": 39, "type": "Conversations"},
            {"part": "Part 4", "count": 30, "type": "Talks"},
            {"part": "Part 5", "count": 30, "type": "Incomplete Sentences"},
            {"part": "Part 6", "count": 16, "type": "Text Completion"},
            {"part": "Part 7", "count": 54, "type": "Reading Comprehension"},
        ],
    },
    {
        "id": "sinagong-850-1",
        "series": "SINAGONG 850",
        "title": "Set 1",
        "questions": 100,
        "duration_minutes": 60,
        "status": "Dang hoc",
        "focus": "High-frequency vocabulary",
        "parts": [
            {"part": "Part 5", "count": 40, "type": "Grammar + Vocab"},
            {"part": "Part 6", "count": 20, "type": "Text Completion"},
            {"part": "Part 7", "count": 40, "type": "Reading Comprehension"},
        ],
    },
    {
        "id": "sinagong-950-1",
        "series": "SINAGONG 950",
        "title": "Set 1",
        "questions": 100,
        "duration_minutes": 60,
        "status": "Chua lam",
        "focus": "Advanced reading speed",
        "parts": [
            {"part": "Part 5", "count": 40, "type": "Grammar + Vocab"},
            {"part": "Part 6", "count": 20, "type": "Text Completion"},
            {"part": "Part 7", "count": 40, "type": "Reading Comprehension"},
        ],
    },
]


TOEIC_EXAM_THEMES = [
    {"key": "corporate", "label": "Corporate Office", "description": "Email, meeting, KPI, workflow"},
    {"key": "travel-service", "label": "Travel & Hospitality", "description": "Airport, hotel, booking, customer care"},
    {"key": "retail-logistics", "label": "Retail & Logistics", "description": "Delivery, warehouse, inventory, store ops"},
]

TOEIC_EXAM_SKILLS = [
    {
        "key": "listening",
        "label": "Listening",
        "official_label": "TOEIC Listening",
        "recommended_minutes": 45,
        "question_count": 100,
        "description": "Photo, response, short conversation, short talk",
    },
    {
        "key": "reading",
        "label": "Reading",
        "official_label": "TOEIC Reading",
        "recommended_minutes": 75,
        "question_count": 100,
        "description": "Sentence completion, text completion, reading comprehension",
    },
    {
        "key": "speaking",
        "label": "Speaking",
        "official_label": "TOEIC Speaking",
        "recommended_minutes": 20,
        "question_count": 11,
        "description": "Read aloud, describe picture, respond, propose solution, opinion",
    },
    {
        "key": "writing",
        "label": "Writing",
        "official_label": "TOEIC Writing",
        "recommended_minutes": 60,
        "question_count": 8,
        "description": "Sentence writing, email response, opinion essay",
    },
]

TOEIC_EXAM_QUESTION_BANK = {
    "corporate": {
        "listening": [
            {
                "id": "cor-listen-1",
                "kind": "mcq",
                "task": "Listening Part 2",
                "audio_script": "Could you send me the revised sales forecast before noon?",
                "prompt": "How does the listener most likely respond?",
                "options": ["At the noon meeting room.", "Sure, I will send it right away.", "The sales floor is on level two.", "Noon is my favorite meal time."],
                "answer_index": 1,
                "explanation": "The question asks for action; the correct response is agreement to send it.",
            },
            {
                "id": "cor-listen-2",
                "kind": "mcq",
                "task": "Listening Part 3",
                "audio_script": "Man: The supplier changed the delivery date. Woman: Then we should notify procurement now. Man: Agreed, I will update the dashboard.",
                "prompt": "What will the man do next?",
                "options": ["Call procurement", "Update the dashboard", "Cancel the order", "Visit the supplier office"],
                "answer_index": 1,
                "explanation": "He explicitly says he will update the dashboard.",
            },
            {
                "id": "cor-listen-3",
                "kind": "mcq",
                "task": "Listening Part 4",
                "audio_script": "This is a reminder that all team leads must submit their monthly KPI review by five p.m. Friday.",
                "prompt": "When is the KPI review due?",
                "options": ["Friday at 5 p.m.", "Thursday morning", "Next Monday", "At noon today"],
                "answer_index": 0,
                "explanation": "The announcement states Friday by five p.m.",
            },
            {
                "id": "cor-listen-4",
                "kind": "mcq",
                "task": "Listening Part 1",
                "audio_script": "A manager is pointing at a chart while colleagues take notes.",
                "prompt": "Which statement best describes the scene?",
                "options": ["People are shopping in a mall.", "A presentation is in progress.", "A chef is serving food.", "Passengers are boarding a train."],
                "answer_index": 1,
                "explanation": "The scene indicates a meeting presentation.",
            },
        ],
        "reading": [
            {
                "id": "cor-read-1",
                "kind": "mcq",
                "task": "Reading Part 5",
                "prompt": "The compliance team requested that all invoices be ______ before approval.",
                "options": ["verify", "verified", "verifying", "verification"],
                "answer_index": 1,
                "explanation": "Passive structure requires past participle: verified.",
            },
            {
                "id": "cor-read-2",
                "kind": "mcq",
                "task": "Reading Part 6",
                "prompt": "Please note that the workshop has been moved to Room B, ______ is next to the finance office.",
                "options": ["who", "where", "which", "that"],
                "answer_index": 2,
                "explanation": "Room B is a thing; non-restrictive clause uses which.",
            },
            {
                "id": "cor-read-3",
                "kind": "mcq",
                "task": "Reading Part 7",
                "prompt": "Memo: The launch event is delayed because packaging updates are incomplete. What is the reason for delay?",
                "options": ["Low attendance", "Budget cut", "Packaging updates", "Venue closure"],
                "answer_index": 2,
                "explanation": "The memo clearly states packaging updates are incomplete.",
            },
            {
                "id": "cor-read-4",
                "kind": "mcq",
                "task": "Reading Part 5",
                "prompt": "If the shipment arrives on time, we ______ the installation this afternoon.",
                "options": ["begin", "began", "will begin", "beginning"],
                "answer_index": 2,
                "explanation": "First conditional uses will + base verb in main clause.",
            },
        ],
        "speaking": [
            {
                "id": "cor-speak-1",
                "kind": "speaking",
                "task": "Read Aloud",
                "prompt": "Our quarterly review meeting starts at 9 a.m. Please bring the latest KPI report and action plan updates.",
                "min_words": 18,
                "keywords": ["meeting", "report", "updates"],
            },
            {
                "id": "cor-speak-2",
                "kind": "speaking",
                "task": "Describe a Picture",
                "prompt": "Describe a picture of an office team discussing a project timeline on a whiteboard.",
                "min_words": 35,
                "keywords": ["team", "timeline", "project"],
            },
            {
                "id": "cor-speak-3",
                "kind": "speaking",
                "task": "Respond to a Request",
                "prompt": "A colleague asks you to explain why a report was submitted late and what you will do next time.",
                "min_words": 35,
                "keywords": ["delay", "reason", "next time"],
            },
            {
                "id": "cor-speak-4",
                "kind": "speaking",
                "task": "Express an Opinion",
                "prompt": "Do you think weekly team meetings are necessary? Give reasons and an example.",
                "min_words": 45,
                "keywords": ["weekly", "communication", "example"],
            },
        ],
        "writing": [
            {
                "id": "cor-write-1",
                "kind": "writing",
                "task": "Write a Sentence",
                "prompt": "Use these words in one sentence: allocate / budget / department.",
                "min_words": 10,
                "keywords": ["allocate", "budget"],
            },
            {
                "id": "cor-write-2",
                "kind": "writing",
                "task": "Reply to Email",
                "prompt": "Write an email reply to a client who asks to postpone a meeting to next Tuesday afternoon.",
                "min_words": 40,
                "keywords": ["Tuesday", "meeting", "confirm"],
            },
            {
                "id": "cor-write-3",
                "kind": "writing",
                "task": "Opinion Essay",
                "prompt": "Should companies allow hybrid work schedules? Explain your opinion with business reasons.",
                "min_words": 70,
                "keywords": ["hybrid", "productivity", "team"],
            },
            {
                "id": "cor-write-4",
                "kind": "writing",
                "task": "Short Message",
                "prompt": "Write a short internal message reminding staff about compliance training deadline.",
                "min_words": 25,
                "keywords": ["deadline", "training", "staff"],
            },
        ],
    },
    "travel-service": {
        "listening": [
            {
                "id": "travel-listen-1",
                "kind": "mcq",
                "task": "Listening Part 2",
                "audio_script": "Where should I pick up my boarding pass?",
                "prompt": "What is the best response?",
                "options": ["At counter D near Gate 8.", "The flight lasted two hours.", "Your suitcase is heavy.", "I prefer train travel."],
                "answer_index": 0,
                "explanation": "The response gives a location for boarding pass pickup.",
            },
            {
                "id": "travel-listen-2",
                "kind": "mcq",
                "task": "Listening Part 3",
                "audio_script": "Woman: We need to overbook less this season. Man: Agreed, guest complaints increased last month.",
                "prompt": "What problem is mentioned?",
                "options": ["Food quality", "Guest complaints", "Staff shortage", "Late flights"],
                "answer_index": 1,
                "explanation": "They mention increased guest complaints.",
            },
            {
                "id": "travel-listen-3",
                "kind": "mcq",
                "task": "Listening Part 4",
                "audio_script": "Attention passengers: Flight 217 will depart from Gate 14 due to maintenance at Gate 9.",
                "prompt": "Why was the gate changed?",
                "options": ["Weather", "Maintenance", "Security check", "Late crew"],
                "answer_index": 1,
                "explanation": "The announcement says maintenance at Gate 9.",
            },
            {
                "id": "travel-listen-4",
                "kind": "mcq",
                "task": "Listening Part 1",
                "audio_script": "A hotel receptionist is handing room keys to guests.",
                "prompt": "What is happening?",
                "options": ["Guests are checking in.", "A conference is ending.", "A bill is being audited.", "A meal is being prepared."],
                "answer_index": 0,
                "explanation": "Handing room keys indicates check-in.",
            },
        ],
        "reading": [
            {
                "id": "travel-read-1",
                "kind": "mcq",
                "task": "Reading Part 5",
                "prompt": "Guests can request late checkout, ______ it depends on room availability.",
                "options": ["and", "but", "because", "unless"],
                "answer_index": 1,
                "explanation": "Contrast relation requires but.",
            },
            {
                "id": "travel-read-2",
                "kind": "mcq",
                "task": "Reading Part 7",
                "prompt": "Notice: Complimentary shuttle runs every 30 minutes from 6:00 to 22:00. Which statement is true?",
                "options": ["It runs once an hour.", "It is paid service.", "It stops at 10 p.m.", "It starts at 7 a.m."],
                "answer_index": 2,
                "explanation": "22:00 equals 10 p.m.",
            },
            {
                "id": "travel-read-3",
                "kind": "mcq",
                "task": "Reading Part 6",
                "prompt": "The itinerary was revised, and all travelers were asked to check the ______ schedule.",
                "options": ["update", "updated", "updating", "updates"],
                "answer_index": 1,
                "explanation": "Adjective before schedule: updated.",
            },
            {
                "id": "travel-read-4",
                "kind": "mcq",
                "task": "Reading Part 5",
                "prompt": "If the airport bus is full, passengers ______ take the metro line.",
                "options": ["must", "must be", "must to", "must have"],
                "answer_index": 0,
                "explanation": "Modal + base verb: must take.",
            },
        ],
        "speaking": [
            {
                "id": "travel-speak-1",
                "kind": "speaking",
                "task": "Read Aloud",
                "prompt": "Please proceed to Gate 14. Boarding for Flight 217 begins in fifteen minutes.",
                "min_words": 16,
                "keywords": ["Gate", "boarding", "minutes"],
            },
            {
                "id": "travel-speak-2",
                "kind": "speaking",
                "task": "Describe a Picture",
                "prompt": "Describe a picture of passengers waiting at an airport check-in counter.",
                "min_words": 32,
                "keywords": ["passengers", "counter", "airport"],
            },
            {
                "id": "travel-speak-3",
                "kind": "speaking",
                "task": "Respond to a Request",
                "prompt": "A guest complains that the room is noisy. Explain what support you can provide.",
                "min_words": 35,
                "keywords": ["apologize", "room", "support"],
            },
            {
                "id": "travel-speak-4",
                "kind": "speaking",
                "task": "Express an Opinion",
                "prompt": "Should hotels offer digital check-in only? Give your view and reasons.",
                "min_words": 45,
                "keywords": ["digital", "guest", "service"],
            },
        ],
        "writing": [
            {
                "id": "travel-write-1",
                "kind": "writing",
                "task": "Write a Sentence",
                "prompt": "Use these words in one sentence: itinerary / updated / passengers.",
                "min_words": 10,
                "keywords": ["itinerary", "updated"],
            },
            {
                "id": "travel-write-2",
                "kind": "writing",
                "task": "Reply to Email",
                "prompt": "Reply to a traveler asking about airport pickup and breakfast time.",
                "min_words": 40,
                "keywords": ["pickup", "breakfast", "time"],
            },
            {
                "id": "travel-write-3",
                "kind": "writing",
                "task": "Opinion Essay",
                "prompt": "Is customer review feedback the most important metric for hotels? Explain.",
                "min_words": 70,
                "keywords": ["review", "quality", "service"],
            },
            {
                "id": "travel-write-4",
                "kind": "writing",
                "task": "Short Message",
                "prompt": "Write a short message to staff about shuttle schedule changes.",
                "min_words": 25,
                "keywords": ["schedule", "shuttle", "staff"],
            },
        ],
    },
    "retail-logistics": {
        "listening": [
            {
                "id": "retail-listen-1",
                "kind": "mcq",
                "task": "Listening Part 2",
                "audio_script": "Why was the shipment rerouted this morning?",
                "prompt": "Which response is most appropriate?",
                "options": ["Because the highway was closed.", "It was packed yesterday.", "The cartons are blue.", "At warehouse C."],
                "answer_index": 0,
                "explanation": "The response gives a reason for rerouting.",
            },
            {
                "id": "retail-listen-2",
                "kind": "mcq",
                "task": "Listening Part 3",
                "audio_script": "Man: Inventory count is lower than expected. Woman: Then we should run a recount before dispatch.",
                "prompt": "What will they do?",
                "options": ["Dispatch immediately", "Run a recount", "Close the warehouse", "Call customers"],
                "answer_index": 1,
                "explanation": "They decide to run a recount.",
            },
            {
                "id": "retail-listen-3",
                "kind": "mcq",
                "task": "Listening Part 4",
                "audio_script": "Please place fragile packages on shelf A and label priority shipments in red.",
                "prompt": "What is the instruction about priority shipments?",
                "options": ["Store them in freezer", "Ship them tomorrow", "Label them in red", "Move them to shelf C"],
                "answer_index": 2,
                "explanation": "The announcement says label in red.",
            },
            {
                "id": "retail-listen-4",
                "kind": "mcq",
                "task": "Listening Part 1",
                "audio_script": "Workers are loading boxes onto a delivery truck.",
                "prompt": "Which statement best matches the image?",
                "options": ["Boxes are being loaded.", "A meeting is starting.", "Products are on sale.", "A cashier is closing a register."],
                "answer_index": 0,
                "explanation": "The scene indicates loading activity.",
            },
        ],
        "reading": [
            {
                "id": "retail-read-1",
                "kind": "mcq",
                "task": "Reading Part 5",
                "prompt": "The warehouse manager asked staff to ______ each parcel before dispatch.",
                "options": ["inspect", "inspected", "inspecting", "inspection"],
                "answer_index": 0,
                "explanation": "Ask + object + to + base verb implied: inspect.",
            },
            {
                "id": "retail-read-2",
                "kind": "mcq",
                "task": "Reading Part 6",
                "prompt": "Due to traffic delays, the courier arrived ______ than usual.",
                "options": ["late", "later", "latest", "lately"],
                "answer_index": 1,
                "explanation": "Comparative form later is required with than.",
            },
            {
                "id": "retail-read-3",
                "kind": "mcq",
                "task": "Reading Part 7",
                "prompt": "Notice: Priority orders must be scanned twice before loading. What must be done?",
                "options": ["Weigh twice", "Scan twice", "Pack twice", "Invoice twice"],
                "answer_index": 1,
                "explanation": "The notice says scanned twice.",
            },
            {
                "id": "retail-read-4",
                "kind": "mcq",
                "task": "Reading Part 5",
                "prompt": "If demand increases next month, we ______ another evening shift.",
                "options": ["add", "added", "will add", "adding"],
                "answer_index": 2,
                "explanation": "First conditional main clause uses will add.",
            },
        ],
        "speaking": [
            {
                "id": "retail-speak-1",
                "kind": "speaking",
                "task": "Read Aloud",
                "prompt": "All priority orders must be scanned and labeled before they are loaded onto delivery trucks.",
                "min_words": 18,
                "keywords": ["priority", "orders", "labeled"],
            },
            {
                "id": "retail-speak-2",
                "kind": "speaking",
                "task": "Describe a Picture",
                "prompt": "Describe a picture of a warehouse team checking inventory with barcode scanners.",
                "min_words": 32,
                "keywords": ["warehouse", "inventory", "scanner"],
            },
            {
                "id": "retail-speak-3",
                "kind": "speaking",
                "task": "Respond to a Request",
                "prompt": "A customer asks why an order is delayed. Give a clear response and solution.",
                "min_words": 35,
                "keywords": ["delay", "delivery", "solution"],
            },
            {
                "id": "retail-speak-4",
                "kind": "speaking",
                "task": "Express an Opinion",
                "prompt": "Should companies prioritize speed or accuracy in logistics? Give reasons.",
                "min_words": 45,
                "keywords": ["speed", "accuracy", "logistics"],
            },
        ],
        "writing": [
            {
                "id": "retail-write-1",
                "kind": "writing",
                "task": "Write a Sentence",
                "prompt": "Use these words in one sentence: inventory / recount / dispatch.",
                "min_words": 10,
                "keywords": ["inventory", "dispatch"],
            },
            {
                "id": "retail-write-2",
                "kind": "writing",
                "task": "Reply to Email",
                "prompt": "Reply to a client asking for updated delivery status and new ETA.",
                "min_words": 40,
                "keywords": ["delivery", "ETA", "update"],
            },
            {
                "id": "retail-write-3",
                "kind": "writing",
                "task": "Opinion Essay",
                "prompt": "Should warehouses automate all scanning processes? Explain your opinion.",
                "min_words": 70,
                "keywords": ["automation", "cost", "quality"],
            },
            {
                "id": "retail-write-4",
                "kind": "writing",
                "task": "Short Message",
                "prompt": "Write a short notice to staff about evening shift inventory checks.",
                "min_words": 25,
                "keywords": ["shift", "check", "staff"],
            },
        ],
    },
}


APTIS_COURSES = [
    {
        "slug": "b2-aptis-esol",
        "title": "B2 Aptis Esol Ms. Mai Hien",
        "category": "Aptis Premium",
        "level": "B2 target",
        "teacher": "Ms. Mai Hien",
        "rating": 4.9,
        "reviews": 26,
        "students": 218,
        "duration_weeks": 8,
        "discount": 50,
        "original_price": "5.000.000d",
        "sale_price": "2.500.000d",
        "image": "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80",
        "summary": "Lo trinh B2 Aptis day du voi speaking strategy, reading tricks, grammar-vocab va lesson video co san.",
        "focus_tags": ["Speaking", "Reading", "Grammar & Vocab"],
        "highlights": [
            "Video bai giang quay san theo lesson",
            "Mock test online cho Reading, Listening, Grammar & Vocab",
            "Roadmap 8 tuan + tai lieu PDF tong hop",
        ],
        "outcomes": [
            "Biet cach can gio cho tung phan Aptis",
            "Nang kha nang doc nhanh va chon keyword",
            "Co phrase bank de vao Speaking tu tin hon",
        ],
        "lessons": [
            {"id": "b2-intro", "title": "Orientation + study plan", "duration": "12:14", "type": "Recorded lesson", "summary": "Nham layout va plan hoc 8 tuan truoc khi vao part chi tiet.", "video_url": "https://www.youtube.com/embed/ysz5S6PUM-U", "locked": False},
            {"id": "b2-reading", "title": "Reading Part 2-3 strategies", "duration": "18:40", "type": "Recorded lesson", "summary": "Doc nhanh, khoanh vung keyword va loai dap an gay nhieu.", "video_url": "https://www.youtube.com/embed/jNQXAC9IVRw", "locked": False},
            {"id": "b2-grammar", "title": "Grammar & Vocab focus on Chapter 5-6-8", "duration": "21:06", "type": "Workshop", "summary": "Tong hop nhom chu diem ngu phap va vocab hay gap khi thi.", "video_url": "https://www.youtube.com/embed/tgbNymZ7vqY", "locked": False},
            {"id": "b2-speaking", "title": "Speaking timing and response structure", "duration": "16:22", "type": "Premium clinic", "summary": "Huong dan mo-bai than-bai ket-bai va cach can nhac gio.", "video_url": "https://www.youtube.com/embed/aqz-KE-bpKQ", "locked": True},
        ],
        "materials": ["Checklist B2", "PDF tong hop grammar", "Template cau tra loi Speaking"],
    },
    {
        "slug": "b1-aptis-esol",
        "title": "B1 Aptis Esol Ms. Mai Hien",
        "category": "Aptis Foundation",
        "level": "B1 target",
        "teacher": "Ms. Mai Hien",
        "rating": 4.8,
        "reviews": 12,
        "students": 164,
        "duration_weeks": 6,
        "discount": 45,
        "original_price": "4.000.000d",
        "sale_price": "2.200.000d",
        "image": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
        "summary": "Tap trung vao muc tieu B1 voi bai giang ngan gon, de thuc hanh va phan Vocabulary co giai thich de hieu.",
        "focus_tags": ["Reading", "Vocabulary", "Foundation"],
        "highlights": [
            "Video lesson ngan, de theo",
            "Lesson map cho nguoi mat goc",
            "Bai tap online chuyen Reading va Grammar",
        ],
        "outcomes": [
            "Nam format Aptis co ban",
            "Tao duoc phrase bank cho topic quen thuoc",
            "Hoc theo nhom bai ngan gon de khong bi ngop",
        ],
        "lessons": [
            {"id": "b1-starter", "title": "Starter lesson: Aptis format", "duration": "09:55", "type": "Starter", "summary": "Lam quen tung ky nang va cach chia gio on tap.", "video_url": "https://www.youtube.com/embed/ysz5S6PUM-U", "locked": False},
            {"id": "b1-reading", "title": "Reading sentence ordering", "duration": "14:32", "type": "Recorded lesson", "summary": "Bai doc sap xep cau va cach doan logic nhanh.", "video_url": "https://www.youtube.com/embed/jNQXAC9IVRw", "locked": False},
            {"id": "b1-vocab", "title": "Topic vocab for daily life", "duration": "13:08", "type": "Practice lab", "summary": "Bo tu thong dung theo topic hang ngay va cong viec.", "video_url": "https://www.youtube.com/embed/tgbNymZ7vqY", "locked": False},
        ],
        "materials": ["B1 checklist", "Phrase bank", "Weekly warm-up plan"],
    },
    {
        "slug": "aptis-tu-luyen",
        "title": "Aptis Tu Luyen",
        "category": "Self-study",
        "level": "Self-paced",
        "teacher": "Bloom Team",
        "rating": 4.7,
        "reviews": 6,
        "students": 92,
        "duration_weeks": 4,
        "discount": 35,
        "original_price": "2.500.000d",
        "sale_price": "1.600.000d",
        "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
        "summary": "Ban tu hoc gon gang, it loang, gom video ngan, test online va checklist tu hoc moi tuan.",
        "focus_tags": ["Self-study", "Planner", "Mock tests"],
        "highlights": [
            "Danh cho nguoi muon tu hoc",
            "Mock test online nhanh gon",
            "Co tracker lesson completion",
        ],
        "outcomes": [
            "Co planner on tap ro tung tuan",
            "Biet cach tu cham loi sai sau moi mini test",
            "Khong bi roi vi flow hoc da duoc sap san",
        ],
        "lessons": [
            {"id": "self-path", "title": "How to self-study effectively", "duration": "11:10", "type": "Planner", "summary": "Xay planner 4 tuan va quy tac sai dau sua do.", "video_url": "https://www.youtube.com/embed/aqz-KE-bpKQ", "locked": False},
            {"id": "self-listening", "title": "Listening note taking", "duration": "15:44", "type": "Recorded lesson", "summary": "Cach ghi note nhanh khi nghe passage Aptis.", "video_url": "https://www.youtube.com/embed/jNQXAC9IVRw", "locked": False},
        ],
        "materials": ["Self-study planner", "Mini mock pack", "Error log template"],
    },
]


APTIS_TESTS = [
    {
        "slug": "aptis-listening-demo",
        "title": "Aptis Listening Demo",
        "module": "Listening",
        "difficulty": "Medium",
        "recommended_for": "Learners targeting B1-B2",
        "duration_minutes": 18,
        "description": "Mini test dang multiple choice voi transcript ngan de lam online.",
        "questions": [
            {
                "id": "l1",
                "prompt": "You hear a speaker explaining a delayed train. What is the main reason for the delay?",
                "support_text": "Audio script: The maintenance team found a technical issue on the southbound line, so all departures after 9 a.m. were postponed.",
                "options": ["Bad weather", "Technical issue", "Staff shortage", "Passenger complaint"],
                "answer_index": 1,
                "explanation": "The speaker clearly says there was a technical issue on the line.",
            },
            {
                "id": "l2",
                "prompt": "What does the manager ask the listeners to do next?",
                "support_text": "Audio script: Please upload your final slide deck by six, and then wait for the confirmation email from the design team.",
                "options": ["Print the slides", "Call the design team", "Upload the slides", "Book a meeting room"],
                "answer_index": 2,
                "explanation": "The instruction is to upload the final slide deck by six.",
            },
            {
                "id": "l3",
                "prompt": "Which feature of the hotel is being highlighted?",
                "support_text": "Audio script: Guests particularly appreciate the quiet reading lounge on the seventh floor, which stays open all night.",
                "options": ["Breakfast buffet", "Rooftop pool", "Reading lounge", "Airport shuttle"],
                "answer_index": 2,
                "explanation": "The speaker highlights the quiet reading lounge.",
            },
        ],
    },
    {
        "slug": "aptis-reading-demo",
        "title": "Aptis Reading Demo",
        "module": "Reading",
        "difficulty": "Medium",
        "recommended_for": "Learners needing logic and inference practice",
        "duration_minutes": 22,
        "description": "Reading mini set theo phong cach Aptis, co passage ngan va cau hoi suy luan.",
        "questions": [
            {
                "id": "r1",
                "prompt": "A local library is extending its weekend hours because attendance has risen sharply. What is the best summary?",
                "support_text": "The library has decided to keep its doors open until 9 p.m. on Saturdays after a surge in student visitors during exam season.",
                "options": ["Attendance fell recently", "The library is reducing services", "Weekend demand has increased", "Exam season was canceled"],
                "answer_index": 2,
                "explanation": "The reason for longer hours is the surge in student visitors.",
            },
            {
                "id": "r2",
                "prompt": "Which statement is TRUE based on the notice?",
                "support_text": "Employees who complete the cybersecurity course before May 30 will receive a digital certificate and priority access to the advanced workshop.",
                "options": ["Only managers can join", "The course ends in June", "Early completion brings extra benefits", "Certificates are printed only"],
                "answer_index": 2,
                "explanation": "Employees who finish early receive a certificate and priority access.",
            },
            {
                "id": "r3",
                "prompt": "What can be inferred about the product launch?",
                "support_text": "The team has postponed the launch by one week to finalize packaging and update the instruction leaflet after customer testing.",
                "options": ["Customer testing found issues", "The product is canceled", "Sales are already strong", "Packaging is unchanged"],
                "answer_index": 0,
                "explanation": "The delay happened after customer testing led to final updates.",
            },
        ],
    },
    {
        "slug": "aptis-grammar-vocab-demo",
        "title": "Aptis Grammar & Vocab Demo",
        "module": "Grammar & Vocab",
        "difficulty": "Foundation",
        "recommended_for": "Learners reviewing Chapter 5-6-8",
        "duration_minutes": 15,
        "description": "Tap trung vao Chapter 5-6-8 nhu user note, cho lam online.",
        "questions": [
            {
                "id": "g1",
                "prompt": "Choose the best word: The report was ______ enough to persuade the investors.",
                "support_text": "Focus: vocabulary precision.",
                "options": ["convincing", "convince", "convinced", "conviction"],
                "answer_index": 0,
                "explanation": "Need an adjective describing the report => convincing.",
            },
            {
                "id": "g2",
                "prompt": "Choose the correct grammar form: If she ______ more time, she would join the workshop.",
                "support_text": "Focus: second conditional.",
                "options": ["has", "had", "will have", "having"],
                "answer_index": 1,
                "explanation": "Second conditional uses if + past simple => had.",
            },
            {
                "id": "g3",
                "prompt": "Choose the best option: The supervisor asked ______ the file before noon.",
                "support_text": "Focus: infinitive pattern.",
                "options": ["submit", "submitting", "to submit", "submitted"],
                "answer_index": 2,
                "explanation": "Ask + object + to infinitive => to submit.",
            },
        ],
    },
]


class TestSubmission(BaseModel):
    answers: list[int]


class FullTestLaunchRequest(BaseModel):
    mode: str = "exam"
    user_id: str = "demo-user"


class GrammarAttemptRecord(BaseModel):
    topic_id: str
    question_id: str
    is_correct: bool


class VocabLessonStatusRequest(BaseModel):
    status: str


class ToeicExamSessionRequest(BaseModel):
    skills: list[str]
    theme: str = "corporate"


class ToeicExamSubmitRequest(BaseModel):
    answers: list[dict[str, object]]


class ToeicReadingAnswerRequest(BaseModel):
    question_id: str
    answer_index: int


class ToeicReadingNoteRequest(BaseModel):
    content: str = ""


class ToeicReadingFlashcardBulkRequest(BaseModel):
    question_ids: list[str] = []


class ToeicReadingFlashcardReviewRequest(BaseModel):
    quality: int = 3


def _get_toeic_set(set_id: str) -> dict[str, Any]:
    for item in TOEIC_SETS:
        if item["id"] == set_id:
            return item
    raise HTTPException(status_code=404, detail="TOEIC set not found")


def _get_course(slug: str) -> dict[str, Any]:
    for item in APTIS_COURSES:
        if item["slug"] == slug:
            return item
    raise HTTPException(status_code=404, detail="Aptis course not found")


def _get_test(slug: str) -> dict[str, Any]:
    for item in APTIS_TESTS:
        if item["slug"] == slug:
            return item
    raise HTTPException(status_code=404, detail="Aptis test not found")


def _get_full_test_pack(pack_id: str) -> dict[str, Any]:
    for item in TOEIC_FULL_TEST_PACKS:
        if item["id"] == pack_id:
            return item
    raise HTTPException(status_code=404, detail="TOEIC full test not found")


def _build_quiz_for_set(set_item: dict[str, Any]) -> list[dict[str, Any]]:
    words = set_item["words"]
    options_pool = [word["meaning"] for word in words]
    quiz_items = []
    for index, word in enumerate(words):
        options = options_pool.copy()
        if len(options) >= 4:
            filtered = [item for item in options if item != word["meaning"]][:3]
            options = [word["meaning"], *filtered]
        quiz_items.append(
            {
                "id": f"{set_item['id']}-quiz-{index + 1}",
                "word": word["word"],
                "context": word["example_en"],
                "options": options,
                "answer": word["meaning"],
            }
        )
    return quiz_items


def _sanitize_exam_question(question: dict[str, Any]) -> dict[str, Any]:
    public_question = {}
    for key, value in question.items():
        if key in {"answer_index", "explanation", "keywords"}:
            continue
        public_question[key] = value
    return public_question


def _build_exam_session_sections(skills: list[str], theme: str) -> list[dict[str, Any]]:
    theme_bank = TOEIC_EXAM_QUESTION_BANK[theme]
    skill_meta_map = {item["key"]: item for item in TOEIC_EXAM_SKILLS}

    pick_per_skill = 4 if len(skills) <= 2 else 3
    sections = []
    for skill in skills:
        skill_questions = theme_bank.get(skill, [])
        picked = skill_questions[:pick_per_skill]
        meta = skill_meta_map.get(skill)
        sections.append(
            {
                "skill_key": skill,
                "skill_label": meta["label"] if meta else skill.title(),
                "official_label": meta["official_label"] if meta else skill.title(),
                "recommended_minutes": meta["recommended_minutes"] if meta else 30,
                "questions": picked,
            }
        )
    return sections


def _public_exam_session(session: dict[str, Any]) -> dict[str, Any]:
    public_sections = []
    for section in session["sections"]:
        public_sections.append(
            {
                "skill_key": section["skill_key"],
                "skill_label": section["skill_label"],
                "official_label": section["official_label"],
                "recommended_minutes": section["recommended_minutes"],
                "questions": [_sanitize_exam_question(question) for question in section["questions"]],
            }
        )

    return {
        "id": session["id"],
        "theme": session["theme"],
        "theme_label": session["theme_label"],
        "skills": session["skills"],
        "recommended_minutes": session["recommended_minutes"],
        "sections": public_sections,
        "created_at": session["created_at"],
        "submitted": session["submitted"],
        "submitted_at": session.get("submitted_at"),
        "result": session.get("result") if session.get("submitted") else None,
    }


def _score_open_response(answer_text: str, keywords: list[str], min_words: int) -> tuple[bool, int]:
    normalized = answer_text.strip().lower()
    word_count = len([word for word in normalized.split() if word])
    keyword_hits = sum(1 for keyword in keywords if keyword.lower() in normalized)

    passed = word_count >= min_words and keyword_hits >= max(1, min(2, len(keywords)))
    quality_score = min(100, 40 + word_count + keyword_hits * 15) if passed else min(60, word_count + keyword_hits * 10)
    return passed, quality_score


def _find_reading_question(question_id: str) -> tuple[dict[str, Any], dict[str, Any]]:
    for passage in TOEIC_READING_PRACTICE["passages"]:
        for question in passage["questions"]:
            if question["id"] == question_id:
                return passage, question
    raise HTTPException(status_code=404, detail="Reading question not found")


def _build_reading_question_public(question: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": question["id"],
        "number": question["number"],
        "task": question["task"],
        "prompt": question["prompt"],
        "options": question["options"],
        "options_vi": question["options_vi"],
    }


def _build_toeic_reading_session() -> dict[str, Any]:
    passages_payload = []
    total_questions = 0

    for passage in TOEIC_READING_PRACTICE["passages"]:
        questions_payload = [_build_reading_question_public(question) for question in passage["questions"]]
        total_questions += len(questions_payload)
        passages_payload.append(
            {
                "id": passage["id"],
                "part": passage["part"],
                "range_label": passage["range_label"],
                "title": passage["title"],
                "passage_text": passage["passage_text"],
                "paraphrase_vi": passage["paraphrase_vi"],
                "vocab_focus": passage["vocab_focus"],
                "questions": questions_payload,
            }
        )

    return {
        "id": TOEIC_READING_PRACTICE["id"],
        "title": TOEIC_READING_PRACTICE["title"],
        "duration_minutes": TOEIC_READING_PRACTICE["duration_minutes"],
        "total_questions": total_questions,
        "passages": passages_payload,
    }


def _ensure_reading_flashcard(question_id: str) -> dict[str, Any]:
    passage, question = _find_reading_question(question_id)
    card = TOEIC_READING_FLASHCARDS.get(question_id)
    note = TOEIC_READING_NOTES.get(question_id, "")
    now = datetime.now()
    due_at = now.isoformat()
    front = question["prompt"]
    correct_option = question["options"][question["answer_index"]]

    if card:
        card["note"] = note
        return card

    card = {
        "id": f"reading-card-{question_id}",
        "source_question_id": question_id,
        "source_number": question["number"],
        "part": question["task"],
        "passage_title": passage["title"],
        "front": front,
        "back": correct_option,
        "options": question["options"],
        "options_vi": question["options_vi"],
        "correct_index": question["answer_index"],
        "explanation_vi": question["explanation_vi"],
        "trap_note": question["trap_note"],
        "note": note,
        "streak": 0,
        "review_count": 0,
        "last_quality": None,
        "last_reviewed_at": None,
        "due_at": due_at,
        "created_at": now.isoformat(),
    }
    TOEIC_READING_FLASHCARDS[question_id] = card
    return card


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/site/overview")
def get_site_overview() -> dict[str, Any]:
    return SITE_OVERVIEW


@app.get("/api/toeic/sets")
def get_toeic_sets() -> dict[str, Any]:
    return {"items": TOEIC_SETS}


@app.get("/api/toeic/search")
def search_toeic_vocab(q: str = "") -> dict[str, Any]:
    query = q.strip().lower()
    if not query:
        return {"items": []}

    results = []
    for set_item in TOEIC_SETS:
        for word in set_item["words"]:
            haystack = " ".join(
                [
                    word["word"],
                    word["meaning"],
                    word["example_en"],
                    word["example_vi"],
                    " ".join(word["sentences"]),
                ]
            ).lower()
            if query in haystack:
                results.append(
                    {
                        "set_id": set_item["id"],
                        "set_title": set_item["title"],
                        **word,
                    }
                )
    return {"items": results}


@app.get("/api/toeic/flashcards/{set_id}")
def get_toeic_flashcards(set_id: str) -> dict[str, Any]:
    set_item = _get_toeic_set(set_id)
    return {"set": set_item}


@app.get("/api/toeic/quiz/{set_id}")
def get_toeic_quiz(set_id: str) -> dict[str, Any]:
    set_item = _get_toeic_set(set_id)
    return {"set_id": set_item["id"], "title": set_item["title"], "items": _build_quiz_for_set(set_item)}


@app.get("/api/toeic/matching/{set_id}")
def get_toeic_matching(set_id: str) -> dict[str, Any]:
    set_item = _get_toeic_set(set_id)
    pairs = [
        {
            "id": word["id"],
            "word": word["word"],
            "meaning": word["meaning"],
        }
        for word in set_item["words"]
    ]
    return {"set_id": set_item["id"], "title": set_item["title"], "pairs": pairs}


@app.get("/api/toeic/grammar")
def get_toeic_grammar() -> dict[str, Any]:
    return {"topics": GRAMMAR_TOPICS}


@app.get("/api/toeic/full-tests")
def get_toeic_full_tests(series: str = "", q: str = "") -> dict[str, Any]:
    normalized_series = series.strip().lower()
    normalized_query = q.strip().lower()
    filtered = []

    for item in TOEIC_FULL_TEST_PACKS:
        if normalized_series and item["series"].lower() != normalized_series:
            continue
        if normalized_query:
            haystack = " ".join([item["series"], item["title"], item["status"], item["focus"]]).lower()
            if normalized_query not in haystack:
                continue
        filtered.append(item)

    series_list = sorted({item["series"] for item in TOEIC_FULL_TEST_PACKS})
    return {"series": series_list, "items": filtered}


@app.get("/api/toeic/full-tests/{pack_id}")
def get_toeic_full_test_detail(pack_id: str) -> dict[str, Any]:
    pack = _get_full_test_pack(pack_id)
    return pack


@app.post("/api/toeic/full-tests/{pack_id}/launch")
def launch_toeic_full_test(pack_id: str, payload: FullTestLaunchRequest) -> dict[str, Any]:
    from datetime import datetime

    pack = _get_full_test_pack(pack_id)
    mode = payload.mode if payload.mode in {"exam", "practice"} else "practice"
    session_id = f"toeic-session-{len(TOEIC_FULL_TEST_HISTORY) + 1}"

    launch_record = {
        "id": session_id,
        "user_id": payload.user_id,
        "pack_id": pack["id"],
        "title": pack["title"],
        "series": pack["series"],
        "mode": mode,
        "started_at": datetime.now().isoformat(),
    }
    TOEIC_FULL_TEST_HISTORY.insert(0, launch_record)

    xp = 24 if mode == "exam" else 14
    USER_PROGRESS["total_xp"] += xp
    USER_PROGRESS["module_counts"]["quiz"] += 1
    today = datetime.now().date().isoformat()
    if USER_PROGRESS["last_activity_date"] != today:
        USER_PROGRESS["streak_days"] += 1
        USER_PROGRESS["last_activity_date"] = today
    USER_PROGRESS["activities"].insert(
        0,
        {
            "id": f"activity-{len(USER_PROGRESS['activities']) + 1}",
            "module": "quiz",
            "title": f"{'Luyen thi' if mode == 'exam' else 'Luyen tap'} • {pack['title']}",
            "xp": xp,
            "time": datetime.now().isoformat(),
        },
    )
    USER_PROGRESS["activities"] = USER_PROGRESS["activities"][:20]

    return {
        "success": True,
        "session_id": session_id,
        "mode": mode,
        "pack": {
            "id": pack["id"],
            "series": pack["series"],
            "title": pack["title"],
            "questions": pack["questions"],
            "duration_minutes": pack["duration_minutes"],
        },
        "xp_awarded": xp,
    }


@app.get("/api/toeic/grammar/progress")
def get_toeic_grammar_progress() -> dict[str, Any]:
    rows = []
    for topic in GRAMMAR_TOPICS:
        tracked = USER_GRAMMAR_PROGRESS.get(topic["id"]) or {
            "title": topic["title"],
            "done_questions": set(),
            "correct_questions": set(),
            "total_questions": len(topic["practice"]),
        }
        done = len(tracked["done_questions"])
        correct = len(tracked["correct_questions"])
        accuracy = round((correct / done) * 100) if done else 0
        rows.append(
            {
                "id": topic["id"],
                "title": tracked["title"],
                "done": done,
                "total": tracked["total_questions"],
                "accuracy": accuracy,
            }
        )
    return {"items": rows}


@app.post("/api/toeic/grammar/attempt")
def record_toeic_grammar_attempt(payload: GrammarAttemptRecord) -> dict[str, Any]:
    topic = None
    for item in GRAMMAR_TOPICS:
        if item["id"] == payload.topic_id:
            topic = item
            break
    if not topic:
        raise HTTPException(status_code=404, detail="Grammar topic not found")

    tracked = USER_GRAMMAR_PROGRESS.get(payload.topic_id)
    if not tracked:
        tracked = {
            "title": topic["title"],
            "done_questions": set(),
            "correct_questions": set(),
            "total_questions": len(topic["practice"]),
        }
        USER_GRAMMAR_PROGRESS[payload.topic_id] = tracked

    tracked["done_questions"].add(payload.question_id)
    if payload.is_correct:
        tracked["correct_questions"].add(payload.question_id)
    else:
        tracked["correct_questions"].discard(payload.question_id)

    done = len(tracked["done_questions"])
    correct = len(tracked["correct_questions"])
    accuracy = round((correct / done) * 100) if done else 0
    return {
        "success": True,
        "topic_id": payload.topic_id,
        "done": done,
        "total": tracked["total_questions"],
        "accuracy": accuracy,
    }


@app.get("/api/toeic/vocab/lessons")
def get_toeic_vocab_lessons() -> dict[str, Any]:
    rows = []
    for set_index, set_item in enumerate(TOEIC_SETS, start=1):
        total_parts = min(len(set_item["words"]), 5)
        for part_index in range(1, total_parts + 1):
            lesson_id = f"{set_item['id']}-part-{part_index}"
            default_status = "Dang hoc" if part_index <= 2 else "Chua hoc"
            rows.append(
                {
                    "id": lesson_id,
                    "set_id": set_item["id"],
                    "title": f"Chu de Test {set_index} - Part {part_index} - {set_item['title']}",
                    "status": USER_VOCAB_LESSON_STATUS.get(lesson_id, default_status),
                }
            )
    return {"items": rows}


@app.post("/api/toeic/vocab/lessons/{lesson_id}/status")
def set_toeic_vocab_lesson_status(lesson_id: str, payload: VocabLessonStatusRequest) -> dict[str, Any]:
    if payload.status not in {"Chua hoc", "Dang hoc", "Da hoc"}:
        raise HTTPException(status_code=400, detail="Invalid lesson status")
    USER_VOCAB_LESSON_STATUS[lesson_id] = payload.status
    return {"success": True, "lesson_id": lesson_id, "status": payload.status}


@app.get("/api/toeic/exam/config")
def get_toeic_exam_config() -> dict[str, Any]:
    return {
        "skills": TOEIC_EXAM_SKILLS,
        "themes": TOEIC_EXAM_THEMES,
        "default_theme": TOEIC_EXAM_THEMES[0]["key"],
    }


@app.post("/api/toeic/exam/sessions")
def create_toeic_exam_session(payload: ToeicExamSessionRequest) -> dict[str, Any]:
    valid_skill_keys = {item["key"] for item in TOEIC_EXAM_SKILLS}
    selected_skills = []
    for skill in payload.skills:
        if skill in valid_skill_keys and skill not in selected_skills:
            selected_skills.append(skill)

    if not selected_skills:
        raise HTTPException(status_code=400, detail="Please select at least one skill")

    theme_key = payload.theme if payload.theme in TOEIC_EXAM_QUESTION_BANK else TOEIC_EXAM_THEMES[0]["key"]
    sections = _build_exam_session_sections(selected_skills, theme_key)
    total_minutes = sum(section["recommended_minutes"] for section in sections)
    theme_meta = next((theme for theme in TOEIC_EXAM_THEMES if theme["key"] == theme_key), TOEIC_EXAM_THEMES[0])

    session_id = f"toeic-exam-{uuid4().hex[:10]}"
    session = {
        "id": session_id,
        "theme": theme_key,
        "theme_label": theme_meta["label"],
        "skills": selected_skills,
        "recommended_minutes": total_minutes,
        "sections": sections,
        "created_at": datetime.now().isoformat(),
        "submitted": False,
        "submitted_at": None,
        "result": None,
    }
    TOEIC_EXAM_SESSIONS[session_id] = session
    return _public_exam_session(session)


@app.get("/api/toeic/exam/sessions/{session_id}")
def get_toeic_exam_session(session_id: str) -> dict[str, Any]:
    session = TOEIC_EXAM_SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Exam session not found")
    return _public_exam_session(session)


@app.post("/api/toeic/exam/sessions/{session_id}/submit")
def submit_toeic_exam_session(session_id: str, payload: ToeicExamSubmitRequest) -> dict[str, Any]:
    session = TOEIC_EXAM_SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Exam session not found")
    if session["submitted"]:
        return session["result"]

    answers_map = {
        (str(item.get("section_key", "")), str(item.get("question_id", ""))): item.get("answer")
        for item in payload.answers
    }

    total_correct = 0
    total_questions = 0
    section_breakdown = []

    for section in session["sections"]:
        skill_correct = 0
        skill_total = 0
        question_feedback = []

        for question in section["questions"]:
            skill_total += 1
            total_questions += 1
            raw_answer = answers_map.get((section["skill_key"], question["id"]))
            is_correct = False
            quality_score = 0

            if question["kind"] == "mcq":
                if isinstance(raw_answer, str) and raw_answer.isdigit():
                    raw_answer = int(raw_answer)
                if isinstance(raw_answer, int) and raw_answer == question["answer_index"]:
                    is_correct = True
                    quality_score = 100
            else:
                answer_text = str(raw_answer or "")
                is_correct, quality_score = _score_open_response(
                    answer_text,
                    question.get("keywords", []),
                    question.get("min_words", 20),
                )

            if is_correct:
                skill_correct += 1
                total_correct += 1

            question_feedback.append(
                {
                    "question_id": question["id"],
                    "kind": question["kind"],
                    "correct": is_correct,
                    "quality_score": quality_score,
                }
            )

        section_breakdown.append(
            {
                "skill_key": section["skill_key"],
                "skill_label": section["skill_label"],
                "correct": skill_correct,
                "total": skill_total,
                "accuracy": round((skill_correct / skill_total) * 100) if skill_total else 0,
                "questions": question_feedback,
            }
        )

    total_accuracy = round((total_correct / total_questions) * 100) if total_questions else 0
    awarded_xp = total_correct * 6 + len(session["skills"]) * 10

    USER_PROGRESS["total_xp"] += awarded_xp
    USER_PROGRESS["module_counts"]["quiz"] += 1
    today = datetime.now().date().isoformat()
    if USER_PROGRESS["last_activity_date"] != today:
        USER_PROGRESS["streak_days"] += 1
        USER_PROGRESS["last_activity_date"] = today
    USER_PROGRESS["activities"].insert(
        0,
        {
            "id": f"activity-{len(USER_PROGRESS['activities']) + 1}",
            "module": "quiz",
            "title": f"TOEIC 4 skills exam • {session['theme_label']}",
            "xp": awarded_xp,
            "time": datetime.now().isoformat(),
        },
    )
    USER_PROGRESS["activities"] = USER_PROGRESS["activities"][:20]

    result = {
        "session_id": session["id"],
        "theme": session["theme_label"],
        "skills": session["skills"],
        "correct_count": total_correct,
        "total_questions": total_questions,
        "accuracy": total_accuracy,
        "awarded_xp": awarded_xp,
        "sections": section_breakdown,
    }

    session["submitted"] = True
    session["submitted_at"] = datetime.now().isoformat()
    session["result"] = result
    return result


# ============================================================================
# TOEIC READING PRACTICE + REVIEW & IMPROVE + FLASHCARDS
# ============================================================================

@app.get("/api/toeic/reading/session")
def get_toeic_reading_session() -> dict[str, Any]:
    payload = _build_toeic_reading_session()
    payload["notes"] = {key: value for key, value in TOEIC_READING_NOTES.items() if value.strip()}
    payload["review_count"] = len(TOEIC_READING_REVIEW)
    payload["flashcard_count"] = len(TOEIC_READING_FLASHCARDS)
    return payload


@app.post("/api/toeic/reading/answer")
def submit_toeic_reading_answer(payload: ToeicReadingAnswerRequest) -> dict[str, Any]:
    passage, question = _find_reading_question(payload.question_id)
    correct_index = question["answer_index"]
    is_correct = payload.answer_index == correct_index
    now_iso = datetime.now().isoformat()

    selected_option = (
        question["options"][payload.answer_index]
        if 0 <= payload.answer_index < len(question["options"])
        else ""
    )
    selected_option_vi = (
        question["options_vi"][payload.answer_index]
        if 0 <= payload.answer_index < len(question["options_vi"])
        else ""
    )

    created_flashcard = False
    review_entry = TOEIC_READING_REVIEW.get(question["id"])
    if not is_correct:
        wrong_count = (review_entry or {}).get("wrong_count", 0) + 1
        review_entry = {
            "question_id": question["id"],
            "number": question["number"],
            "task": question["task"],
            "prompt": question["prompt"],
            "options": question["options"],
            "options_vi": question["options_vi"],
            "correct_index": correct_index,
            "correct_option": question["options"][correct_index],
            "correct_option_vi": question["options_vi"][correct_index],
            "user_answer_index": payload.answer_index,
            "user_answer": selected_option,
            "user_answer_vi": selected_option_vi,
            "wrong_count": wrong_count,
            "last_wrong_at": now_iso,
            "passage_id": passage["id"],
            "passage_title": passage["title"],
            "paraphrase_vi": passage["paraphrase_vi"],
            "explanation_vi": question["explanation_vi"],
            "trap_note": question["trap_note"],
            "vocab_focus": passage["vocab_focus"],
            "note": TOEIC_READING_NOTES.get(question["id"], ""),
        }
        TOEIC_READING_REVIEW[question["id"]] = review_entry
        created_flashcard = question["id"] not in TOEIC_READING_FLASHCARDS
        _ensure_reading_flashcard(question["id"])

    return {
        "question_id": question["id"],
        "number": question["number"],
        "correct": is_correct,
        "correct_index": correct_index,
        "correct_option": question["options"][correct_index],
        "correct_option_vi": question["options_vi"][correct_index],
        "selected_index": payload.answer_index,
        "selected_option": selected_option,
        "selected_option_vi": selected_option_vi,
        "explanation_vi": question["explanation_vi"],
        "trap_note": question["trap_note"],
        "paraphrase_vi": passage["paraphrase_vi"],
        "vocab_focus": passage["vocab_focus"],
        "note": TOEIC_READING_NOTES.get(question["id"], ""),
        "review_item": review_entry,
        "flashcard_created": created_flashcard,
    }


@app.get("/api/toeic/reading/notes/{question_id}")
def get_toeic_reading_note(question_id: str) -> dict[str, Any]:
    _find_reading_question(question_id)
    return {"question_id": question_id, "content": TOEIC_READING_NOTES.get(question_id, "")}


@app.post("/api/toeic/reading/notes/{question_id}")
def set_toeic_reading_note(question_id: str, payload: ToeicReadingNoteRequest) -> dict[str, Any]:
    _find_reading_question(question_id)
    content = payload.content.strip()
    TOEIC_READING_NOTES[question_id] = content

    review_entry = TOEIC_READING_REVIEW.get(question_id)
    if review_entry:
        review_entry["note"] = content

    card = TOEIC_READING_FLASHCARDS.get(question_id)
    if card:
        card["note"] = content

    return {"success": True, "question_id": question_id, "content": content}


@app.get("/api/toeic/reading/review")
def get_toeic_reading_review() -> dict[str, Any]:
    items = list(TOEIC_READING_REVIEW.values())
    items.sort(
        key=lambda item: (
            item.get("wrong_count", 0),
            item.get("last_wrong_at", ""),
        ),
        reverse=True,
    )

    total_wrong_attempts = sum(item.get("wrong_count", 0) for item in items)
    noted_count = sum(1 for item in items if str(item.get("note", "")).strip())
    return {
        "items": items,
        "total_questions": len(items),
        "total_wrong_attempts": total_wrong_attempts,
        "noted_questions": noted_count,
    }


@app.post("/api/toeic/reading/review/to-flashcards")
def create_toeic_reading_flashcards(payload: ToeicReadingFlashcardBulkRequest) -> dict[str, Any]:
    question_ids = payload.question_ids or list(TOEIC_READING_REVIEW.keys())
    created = 0
    card_ids = []

    for question_id in question_ids:
        if question_id not in TOEIC_READING_REVIEW:
            continue
        is_new = question_id not in TOEIC_READING_FLASHCARDS
        card = _ensure_reading_flashcard(question_id)
        card_ids.append(card["id"])
        if is_new:
            created += 1

    return {
        "success": True,
        "requested": len(question_ids),
        "created": created,
        "total_flashcards": len(TOEIC_READING_FLASHCARDS),
        "card_ids": card_ids,
    }


@app.get("/api/toeic/reading/flashcards")
def get_toeic_reading_flashcards() -> dict[str, Any]:
    now = datetime.now()
    cards = list(TOEIC_READING_FLASHCARDS.values())

    def parse_due(card: dict[str, Any]) -> datetime:
        try:
            return datetime.fromisoformat(str(card.get("due_at", "")))
        except ValueError:
            return now

    cards.sort(key=lambda item: (parse_due(item), item.get("source_number", 0)))
    due_cards = [card for card in cards if parse_due(card) <= now]
    return {
        "items": cards,
        "due_items": due_cards,
        "stats": {
            "total": len(cards),
            "due": len(due_cards),
            "new": sum(1 for card in cards if card.get("review_count", 0) == 0),
        },
    }


@app.post("/api/toeic/reading/flashcards/{card_id}/review")
def review_toeic_reading_flashcard(card_id: str, payload: ToeicReadingFlashcardReviewRequest) -> dict[str, Any]:
    card = None
    for item in TOEIC_READING_FLASHCARDS.values():
        if item["id"] == card_id:
            card = item
            break
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    quality = max(1, min(4, payload.quality))
    now = datetime.now()
    interval_map = {
        1: timedelta(minutes=15),
        2: timedelta(days=1),
        3: timedelta(days=3),
        4: timedelta(days=7),
    }

    if quality <= 2:
        card["streak"] = 0
    else:
        card["streak"] = int(card.get("streak", 0)) + 1

    card["review_count"] = int(card.get("review_count", 0)) + 1
    card["last_quality"] = quality
    card["last_reviewed_at"] = now.isoformat()
    card["due_at"] = (now + interval_map[quality]).isoformat()

    return {
        "success": True,
        "card_id": card_id,
        "quality": quality,
        "streak": card["streak"],
        "review_count": card["review_count"],
        "due_at": card["due_at"],
    }


@app.get("/api/aptis/courses")
def get_aptis_courses() -> dict[str, Any]:
    return {"items": APTIS_COURSES}


@app.get("/api/aptis/courses/{slug}")
def get_aptis_course(slug: str) -> dict[str, Any]:
    return _get_course(slug)


@app.get("/api/aptis/tests")
def get_aptis_tests() -> dict[str, Any]:
    preview = []
    for test in APTIS_TESTS:
        preview.append(
            {
                "slug": test["slug"],
                "title": test["title"],
                "module": test["module"],
                "difficulty": test["difficulty"],
                "recommended_for": test["recommended_for"],
                "duration_minutes": test["duration_minutes"],
                "description": test["description"],
                "question_count": len(test["questions"]),
            }
        )
    return {"items": preview}


@app.get("/api/aptis/tests/{slug}")
def get_aptis_test_detail(slug: str) -> dict[str, Any]:
    test = _get_test(slug)
    safe_questions = []
    for question in test["questions"]:
        safe_questions.append(
            {
                "id": question["id"],
                "prompt": question["prompt"],
                "support_text": question["support_text"],
                "options": question["options"],
            }
        )
    return {
        "slug": test["slug"],
        "title": test["title"],
        "module": test["module"],
        "difficulty": test["difficulty"],
        "recommended_for": test["recommended_for"],
        "duration_minutes": test["duration_minutes"],
        "description": test["description"],
        "questions": safe_questions,
    }


@app.post("/api/aptis/tests/{slug}/submit")
def submit_aptis_test(slug: str, payload: TestSubmission) -> dict[str, Any]:
    test = _get_test(slug)
    questions = test["questions"]
    if len(payload.answers) != len(questions):
        raise HTTPException(status_code=400, detail="Number of answers does not match the test")

    breakdown = []
    correct_count = 0
    for user_answer, question in zip(payload.answers, questions):
        is_correct = user_answer == question["answer_index"]
        if is_correct:
            correct_count += 1
        breakdown.append(
            {
                "id": question["id"],
                "correct": is_correct,
                "correct_index": question["answer_index"],
                "explanation": question["explanation"],
            }
        )

    total = len(questions)
    accuracy = round((correct_count / total) * 100, 2) if total else 0
    return {
        "title": test["title"],
        "module": test["module"],
        "correct_count": correct_count,
        "total_questions": total,
        "accuracy": accuracy,
        "breakdown": breakdown,
    }



# ============================================================================
# TOEIC LISTENING & TYPING ENDPOINTS
# ============================================================================

@app.get("/api/toeic/listening/{set_id}")
def get_toeic_listening(set_id: str) -> dict[str, Any]:
    """Get listening practice data for a set"""
    set_item = _get_toeic_set(set_id)
    listening_items = []
    for word in set_item["words"]:
        listening_items.append({
            "id": word["id"],
            "word": word["word"],
            "meaning": word["meaning"],
            "example_vi": word["example_vi"],
            "ipa": word["ipa"],
        })
    return {
        "set_id": set_item["id"],
        "title": set_item["title"],
        "items": listening_items,
    }


@app.get("/api/toeic/typing/{set_id}")
def get_toeic_typing(set_id: str) -> dict[str, Any]:
    """Get typing practice data for a set"""
    set_item = _get_toeic_set(set_id)
    typing_items = []
    for word in set_item["words"]:
        typing_items.append({
            "id": word["id"],
            "word": word["word"],
            "meaning": word["meaning"],
            "example_vi": word["example_vi"],
        })
    return {
        "set_id": set_item["id"],
        "title": set_item["title"],
        "items": typing_items,
    }


# ============================================================================
# PROGRESS TRACKING ENDPOINTS
# ============================================================================

# In-memory storage for demo (replace with database in production)
USER_PROGRESS = {
    "total_xp": 0,
    "streak_days": 0,
    "last_activity_date": None,
    "saved_words": [],
    "activities": [],
    "module_counts": {
        "search": 0,
        "flashcard": 0,
        "quiz": 0,
        "listening": 0,
        "typing": 0,
        "matching": 0,
        "grammar": 0,
    },
}

TOEIC_FULL_TEST_HISTORY: list[dict[str, Any]] = []

USER_GRAMMAR_PROGRESS: dict[str, dict[str, Any]] = {
    topic["id"]: {
        "title": topic["title"],
        "done_questions": set(),
        "correct_questions": set(),
        "total_questions": len(topic["practice"]),
    }
    for topic in GRAMMAR_TOPICS
}

USER_VOCAB_LESSON_STATUS: dict[str, str] = {}
TOEIC_EXAM_SESSIONS: dict[str, dict[str, Any]] = {}

TOEIC_READING_PRACTICE = {
    "id": "toeic-reading-2026-01",
    "title": "TOEIC Reading Drill (Part 6-7)",
    "duration_minutes": 35,
    "passages": [
        {
            "id": "passage-brandrix",
            "part": "Part 7",
            "range_label": "Questions 135-138",
            "title": "Employee Anniversary Letter",
            "passage_text": (
                "Dear Mulligan,\n\n"
                "Congratulations on reaching your 30th work anniversary at Brandrix Distribution Centre. "
                "You have been a valuable member of our team, and your dedication and initiative have "
                "contributed to our growth.\n\n"
                "To honor this milestone, we will mail a commemorative plaque to your home address next week. "
                "Thank you for being part of the Brandrix family.\n\n"
                "Sincerely,\n"
                "Lance Powar\n"
                "Vice President of Human Resources"
            ),
            "paraphrase_vi": (
                "Thư chúc mừng nhân viên Mulligan kỷ niệm 30 năm làm việc tại Brandrix. "
                "Công ty ghi nhận đóng góp, chủ động và lòng tận tâm; đồng thời thông báo sẽ gửi kỷ niệm chương."
            ),
            "vocab_focus": [
                {"word": "dedication", "meaning_vi": "sự cống hiến"},
                {"word": "initiative", "meaning_vi": "sự chủ động"},
                {"word": "commemorative plaque", "meaning_vi": "kỷ niệm chương"},
                {"word": "milestone", "meaning_vi": "cột mốc quan trọng"},
            ],
            "questions": [
                {
                    "id": "read-135",
                    "number": 135,
                    "task": "Reading Part 7",
                    "prompt": "Which choice best completes blank [135]?",
                    "options": [
                        "We especially value our long-term customers.",
                        "Please join our holiday celebration.",
                        "Our annual report will be released soon.",
                        "You have been a valuable member of our team.",
                    ],
                    "options_vi": [
                        "Chúng tôi đặc biệt trân trọng những khách hàng lâu năm.",
                        "Vui lòng tham gia lễ kỷ niệm nghỉ lễ của chúng tôi.",
                        "Báo cáo thường niên của chúng tôi sẽ sớm được phát hành.",
                        "Cô là một thành viên quý giá của đội ngũ chúng tôi.",
                    ],
                    "answer_index": 3,
                    "explanation_vi": (
                        "Mạch văn là thư chúc mừng nhân viên; câu đúng phải nói về đóng góp của người nhận thư. "
                        "Đáp án D khớp ngữ cảnh và liên kết tốt với câu sau về dedication/initiative."
                    ),
                    "trap_note": (
                        "A có cụm long-term dễ đánh lạc hướng với '30th anniversary' nhưng sai đối tượng "
                        "vì khách hàng không phải người nhận thư."
                    ),
                },
                {
                    "id": "read-136",
                    "number": 136,
                    "task": "Reading Part 7",
                    "prompt": "What quality is highlighted in blank [136] based on the letter?",
                    "options": ["Dedication", "Punctuality", "Negotiation", "Public speaking"],
                    "options_vi": ["Sự cống hiến", "Đúng giờ", "Đàm phán", "Thuyết trình trước công chúng"],
                    "answer_index": 0,
                    "explanation_vi": "Đoạn thư nêu rõ dedication and initiative, nên đáp án đúng là Dedication.",
                    "trap_note": "Punctuality nghe hợp môi trường công việc nhưng không hề được nhắc trong thư.",
                },
                {
                    "id": "read-137",
                    "number": 137,
                    "task": "Reading Part 7",
                    "prompt": "What will Brandrix send to Mulligan next week?",
                    "options": ["A salary adjustment", "A commemorative plaque", "A new laptop", "A travel voucher"],
                    "options_vi": ["Điều chỉnh lương", "Kỷ niệm chương", "Laptop mới", "Phiếu du lịch"],
                    "answer_index": 1,
                    "explanation_vi": "Thư ghi rõ sẽ gửi commemorative plaque vào tuần tới.",
                    "trap_note": "Travel voucher là quà phổ biến trong HR nhưng không xuất hiện trong passage.",
                },
                {
                    "id": "read-138",
                    "number": 138,
                    "task": "Reading Part 7",
                    "prompt": "What is the purpose of this letter?",
                    "options": [
                        "To warn about policy changes",
                        "To invite all staff to a meeting",
                        "To congratulate an employee milestone",
                        "To request overtime approval",
                    ],
                    "options_vi": [
                        "Cảnh báo thay đổi chính sách",
                        "Mời toàn bộ nhân viên dự họp",
                        "Chúc mừng cột mốc của nhân viên",
                        "Yêu cầu duyệt tăng ca",
                    ],
                    "answer_index": 2,
                    "explanation_vi": "Toàn bộ thư mang mục đích chúc mừng kỷ niệm 30 năm làm việc.",
                    "trap_note": "Option B dùng giọng văn công ty nên dễ nhiễu nhưng không đúng mục tiêu chính.",
                },
            ],
        },
        {
            "id": "passage-logistics",
            "part": "Part 6",
            "range_label": "Questions 139-142",
            "title": "Warehouse Update Memo",
            "passage_text": (
                "Memo: Starting next Monday, all priority orders must be scanned twice before loading. "
                "Because of recent traffic delays, evening shipments will leave 30 minutes later than usual. "
                "If demand increases next month, we will add another evening shift.\n\n"
                "Please review the updated checklist before dispatch."
            ),
            "paraphrase_vi": (
                "Bản ghi nhớ yêu cầu đơn ưu tiên phải quét 2 lần, chuyến tối rời kho muộn hơn 30 phút "
                "do kẹt xe, và có thể thêm ca tối nếu nhu cầu tăng."
            ),
            "vocab_focus": [
                {"word": "priority orders", "meaning_vi": "đơn hàng ưu tiên"},
                {"word": "dispatch", "meaning_vi": "điều phối / xuất hàng"},
                {"word": "checklist", "meaning_vi": "danh mục kiểm tra"},
                {"word": "demand", "meaning_vi": "nhu cầu"},
            ],
            "questions": [
                {
                    "id": "read-139",
                    "number": 139,
                    "task": "Reading Part 6",
                    "prompt": "Priority orders must be scanned ______ before loading.",
                    "options": ["once", "twice", "carefully", "tomorrow"],
                    "options_vi": ["một lần", "hai lần", "cẩn thận", "ngày mai"],
                    "answer_index": 1,
                    "explanation_vi": "Memo nêu trực tiếp 'must be scanned twice'.",
                    "trap_note": "Carefully đúng về ngữ nghĩa nhưng không đúng thông tin cụ thể trong memo.",
                },
                {
                    "id": "read-140",
                    "number": 140,
                    "task": "Reading Part 5",
                    "prompt": "Evening shipments will leave ______ than usual.",
                    "options": ["late", "later", "latest", "lately"],
                    "options_vi": ["muộn", "muộn hơn", "muộn nhất", "gần đây"],
                    "answer_index": 1,
                    "explanation_vi": "Có từ 'than usual' nên cần dạng so sánh hơn: later.",
                    "trap_note": "Late đúng nghĩa cơ bản nhưng sai cấu trúc so sánh với than.",
                },
                {
                    "id": "read-141",
                    "number": 141,
                    "task": "Reading Part 5",
                    "prompt": "If demand increases next month, we ______ another evening shift.",
                    "options": ["add", "added", "will add", "adding"],
                    "options_vi": ["thêm", "đã thêm", "sẽ thêm", "đang thêm"],
                    "answer_index": 2,
                    "explanation_vi": "Câu điều kiện loại 1: If + hiện tại đơn, mệnh đề chính dùng will + verb.",
                    "trap_note": "Option A dễ bị chọn do nghĩa đúng nhưng sai thì của câu điều kiện.",
                },
                {
                    "id": "read-142",
                    "number": 142,
                    "task": "Reading Part 6",
                    "prompt": "What should staff do before dispatch?",
                    "options": [
                        "Review the updated checklist",
                        "Call every customer",
                        "Cancel evening shipments",
                        "Move all orders to morning shift",
                    ],
                    "options_vi": [
                        "Xem lại checklist đã cập nhật",
                        "Gọi cho mọi khách hàng",
                        "Hủy toàn bộ chuyến tối",
                        "Chuyển toàn bộ đơn sang ca sáng",
                    ],
                    "answer_index": 0,
                    "explanation_vi": "Memo kết thúc bằng yêu cầu review checklist trước khi dispatch.",
                    "trap_note": "C và D mang tính hành động mạnh nhưng không được chỉ định trong văn bản.",
                },
            ],
        },
    ],
}

TOEIC_READING_NOTES: dict[str, str] = {}
TOEIC_READING_REVIEW: dict[str, dict[str, Any]] = {}
TOEIC_READING_FLASHCARDS: dict[str, dict[str, Any]] = {}


class ActivityRecord(BaseModel):
    module: str
    title: str
    xp: int = 0


class SaveWordRequest(BaseModel):
    id: str
    word: str
    meaning: str
    set_title: str


@app.get("/api/toeic/progress/stats")
def get_progress_stats() -> dict[str, Any]:
    """Get user progress statistics"""
    return {
        "total_xp": USER_PROGRESS["total_xp"],
        "streak_days": USER_PROGRESS["streak_days"],
        "saved_word_count": len(USER_PROGRESS["saved_words"]),
        "module_counts": USER_PROGRESS["module_counts"],
        "last_activity_date": USER_PROGRESS["last_activity_date"],
    }


@app.post("/api/toeic/progress/activity")
def record_activity(activity: ActivityRecord) -> dict[str, Any]:
    """Record a learning activity"""
    from datetime import datetime
    
    # Update XP
    USER_PROGRESS["total_xp"] += activity.xp
    
    # Update module count
    if activity.module in USER_PROGRESS["module_counts"]:
        USER_PROGRESS["module_counts"][activity.module] += 1
    
    # Update streak
    today = datetime.now().date().isoformat()
    if USER_PROGRESS["last_activity_date"] != today:
        USER_PROGRESS["streak_days"] += 1
        USER_PROGRESS["last_activity_date"] = today
    
    # Add to activity log
    activity_record = {
        "id": f"activity-{len(USER_PROGRESS['activities']) + 1}",
        "module": activity.module,
        "title": activity.title,
        "xp": activity.xp,
        "time": datetime.now().isoformat(),
    }
    USER_PROGRESS["activities"].insert(0, activity_record)
    
    # Keep only last 20 activities
    USER_PROGRESS["activities"] = USER_PROGRESS["activities"][:20]
    
    return {
        "success": True,
        "total_xp": USER_PROGRESS["total_xp"],
        "streak_days": USER_PROGRESS["streak_days"],
    }


@app.get("/api/toeic/progress/saved-words")
def get_saved_words() -> dict[str, Any]:
    """Get list of saved words"""
    return {"items": USER_PROGRESS["saved_words"]}


@app.post("/api/toeic/progress/save-word")
def save_word(word: SaveWordRequest) -> dict[str, Any]:
    """Save a word to user's collection"""
    # Check if already saved
    existing = [w for w in USER_PROGRESS["saved_words"] if w["id"] == word.id]
    if existing:
        return {"success": True, "message": "Word already saved", "saved_count": len(USER_PROGRESS["saved_words"])}
    
    USER_PROGRESS["saved_words"].append(word.dict())
    return {"success": True, "message": "Word saved", "saved_count": len(USER_PROGRESS["saved_words"])}


@app.delete("/api/toeic/progress/save-word/{word_id}")
def unsave_word(word_id: str) -> dict[str, Any]:
    """Remove a word from saved collection"""
    USER_PROGRESS["saved_words"] = [w for w in USER_PROGRESS["saved_words"] if w["id"] != word_id]
    return {"success": True, "message": "Word removed", "saved_count": len(USER_PROGRESS["saved_words"])}


@app.get("/api/toeic/progress/activities")
def get_recent_activities() -> dict[str, Any]:
    """Get recent learning activities"""
    return {"items": USER_PROGRESS["activities"][:10]}


@app.get("/api/toeic/progress/streak")
def get_streak() -> dict[str, Any]:
    """Get current streak information"""
    return {
        "streak_days": USER_PROGRESS["streak_days"],
        "last_activity_date": USER_PROGRESS["last_activity_date"],
    }


# ============================================================================
# APTIS COURSE ENROLLMENT & PROGRESS
# ============================================================================

# In-memory storage for demo
COURSE_ENROLLMENTS = {}
LESSON_COMPLETIONS = {}


class EnrollmentRequest(BaseModel):
    user_id: str = "demo-user"


class LessonCompleteRequest(BaseModel):
    user_id: str = "demo-user"


@app.post("/api/aptis/courses/{slug}/enroll")
def enroll_course(slug: str, request: EnrollmentRequest) -> dict[str, Any]:
    """Enroll in a course"""
    course = _get_course(slug)
    
    enrollment_key = f"{request.user_id}:{slug}"
    if enrollment_key not in COURSE_ENROLLMENTS:
        COURSE_ENROLLMENTS[enrollment_key] = {
            "user_id": request.user_id,
            "course_slug": slug,
            "enrolled_at": "2024-01-01",
            "progress_percent": 0,
        }
    
    return {
        "success": True,
        "message": f"Enrolled in {course['title']}",
        "enrollment": COURSE_ENROLLMENTS[enrollment_key],
    }


@app.get("/api/aptis/courses/{slug}/progress")
def get_course_progress(slug: str, user_id: str = "demo-user") -> dict[str, Any]:
    """Get course progress for a user"""
    course = _get_course(slug)
    enrollment_key = f"{user_id}:{slug}"
    
    completed_lessons = []
    for lesson in course["lessons"]:
        lesson_key = f"{user_id}:{lesson['id']}"
        if lesson_key in LESSON_COMPLETIONS:
            completed_lessons.append(lesson["id"])
    
    total_lessons = len(course["lessons"])
    progress_percent = (len(completed_lessons) / total_lessons * 100) if total_lessons else 0
    
    return {
        "course_slug": slug,
        "total_lessons": total_lessons,
        "completed_lessons": len(completed_lessons),
        "progress_percent": round(progress_percent, 2),
        "completed_lesson_ids": completed_lessons,
        "enrolled": enrollment_key in COURSE_ENROLLMENTS,
    }


@app.post("/api/aptis/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: str, request: LessonCompleteRequest) -> dict[str, Any]:
    """Mark a lesson as completed"""
    lesson_key = f"{request.user_id}:{lesson_id}"
    
    if lesson_key not in LESSON_COMPLETIONS:
        LESSON_COMPLETIONS[lesson_key] = {
            "user_id": request.user_id,
            "lesson_id": lesson_id,
            "completed_at": "2024-01-01",
        }
    
    return {
        "success": True,
        "message": "Lesson marked as complete",
        "completion": LESSON_COMPLETIONS[lesson_key],
    }


# ============================================================================
# TEST HISTORY
# ============================================================================

TEST_HISTORY = []


@app.get("/api/aptis/tests/history")
def get_test_history(user_id: str = "demo-user") -> dict[str, Any]:
    """Get test history for a user"""
    user_tests = [t for t in TEST_HISTORY if t.get("user_id") == user_id]
    return {"items": user_tests}


@app.post("/api/aptis/tests/{slug}/save-result")
def save_test_result(slug: str, payload: TestSubmission, user_id: str = "demo-user") -> dict[str, Any]:
    """Save test result to history"""
    test = _get_test(slug)
    
    # Calculate score
    correct_count = sum(
        1 for user_answer, question in zip(payload.answers, test["questions"])
        if user_answer == question["answer_index"]
    )
    total = len(test["questions"])
    accuracy = round((correct_count / total) * 100, 2) if total else 0
    
    # Save to history
    from datetime import datetime
    result = {
        "id": f"test-{len(TEST_HISTORY) + 1}",
        "user_id": user_id,
        "test_slug": slug,
        "test_title": test["title"],
        "module": test["module"],
        "correct_count": correct_count,
        "total_questions": total,
        "accuracy": accuracy,
        "completed_at": datetime.now().isoformat(),
    }
    TEST_HISTORY.insert(0, result)
    
    return {
        "success": True,
        "result": result,
    }


# ============================================================================
# ACHIEVEMENTS & LEADERBOARD
# ============================================================================

ACHIEVEMENTS = [
    {"id": "first-search", "title": "First Search", "description": "Tra từ đầu tiên", "icon": "🔍", "xp_required": 0, "action_required": "search", "count_required": 1},
    {"id": "word-collector", "title": "Word Collector", "description": "Lưu 5 từ vựng", "icon": "📚", "xp_required": 0, "action_required": "save_word", "count_required": 5},
    {"id": "quiz-master", "title": "Quiz Master", "description": "Hoàn thành 10 quiz", "icon": "🎯", "xp_required": 0, "action_required": "quiz", "count_required": 10},
    {"id": "streak-keeper", "title": "Streak Keeper", "description": "Giữ streak 7 ngày", "icon": "🔥", "xp_required": 0, "action_required": "streak", "count_required": 7},
    {"id": "grammar-guru", "title": "Grammar Guru", "description": "Làm 5 bài grammar", "icon": "📝", "xp_required": 0, "action_required": "grammar", "count_required": 5},
    {"id": "xp-hunter", "title": "XP Hunter", "description": "Đạt 500 XP", "icon": "⭐", "xp_required": 500, "action_required": None, "count_required": 0},
]


@app.get("/api/achievements")
def get_achievements() -> dict[str, Any]:
    """Get list of achievements"""
    user_achievements = []
    
    for achievement in ACHIEVEMENTS:
        unlocked = False
        
        # Check XP requirement
        if achievement["xp_required"] > 0:
            unlocked = USER_PROGRESS["total_xp"] >= achievement["xp_required"]
        
        # Check action requirement
        elif achievement["action_required"]:
            if achievement["action_required"] == "save_word":
                unlocked = len(USER_PROGRESS["saved_words"]) >= achievement["count_required"]
            elif achievement["action_required"] == "streak":
                unlocked = USER_PROGRESS["streak_days"] >= achievement["count_required"]
            elif achievement["action_required"] in USER_PROGRESS["module_counts"]:
                unlocked = USER_PROGRESS["module_counts"][achievement["action_required"]] >= achievement["count_required"]
        
        user_achievements.append({
            **achievement,
            "unlocked": unlocked,
        })
    
    return {"items": user_achievements}


@app.get("/api/leaderboard")
def get_leaderboard() -> dict[str, Any]:
    """Get leaderboard (demo data)"""
    # In production, this would query a database
    demo_leaderboard = [
        {"rank": 1, "username": "You", "xp": USER_PROGRESS["total_xp"], "streak": USER_PROGRESS["streak_days"]},
        {"rank": 2, "username": "Alice", "xp": 1250, "streak": 12},
        {"rank": 3, "username": "Bob", "xp": 980, "streak": 8},
        {"rank": 4, "username": "Charlie", "xp": 750, "streak": 5},
        {"rank": 5, "username": "Diana", "xp": 620, "streak": 3},
    ]
    
    # Sort by XP
    demo_leaderboard.sort(key=lambda x: x["xp"], reverse=True)
    for i, entry in enumerate(demo_leaderboard):
        entry["rank"] = i + 1
    
    return {"items": demo_leaderboard}


# ============================================================================
# STATISTICS & ANALYTICS
# ============================================================================

@app.get("/api/stats/overview")
def get_stats_overview() -> dict[str, Any]:
    """Get overall statistics"""
    total_words = sum(len(s["words"]) for s in TOEIC_SETS)
    total_grammar_topics = len(GRAMMAR_TOPICS)
    total_courses = len(APTIS_COURSES)
    total_tests = len(APTIS_TESTS)
    
    return {
        "toeic": {
            "total_sets": len(TOEIC_SETS),
            "total_words": total_words,
            "total_grammar_topics": total_grammar_topics,
        },
        "aptis": {
            "total_courses": total_courses,
            "total_tests": total_tests,
            "total_lessons": sum(len(c["lessons"]) for c in APTIS_COURSES),
        },
        "user": {
            "total_xp": USER_PROGRESS["total_xp"],
            "streak_days": USER_PROGRESS["streak_days"],
            "saved_words": len(USER_PROGRESS["saved_words"]),
            "activities_count": len(USER_PROGRESS["activities"]),
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
