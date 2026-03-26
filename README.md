# 🎓 Bloom English House - TOEIC & Aptis Learning Platform

> Nền tảng học tiếng Anh kết hợp hai phong cách: TOEIC dashboard pastel đáng học mỗi ngày và Aptis course platform chuyên nghiệp.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.116+-009688.svg)](https://fastapi.tiangolo.com/)

## 🌟 Tính năng nổi bật

### 🎯 TOEIC Zone (Inspired by Charnishere)
- **8 modules học tập tương tác:**
  - 🔍 **Tra từ thông minh** - Tìm kiếm từ vựng với nghĩa và câu ví dụ từ đề thi
  - 📇 **Flashcard** - Thẻ học pastel, lật mặt, lưu từ theo chủ đề
  - ☑️ **Quiz** - Trắc nghiệm nghĩa từ như mini test
  - 🎧 **Listening** - Nghe phát âm và đoán từ
  - ⌨️ **Typing** - Gõ lại từ theo nghĩa để nhớ lâu
  - 🧩 **Matching** - Game ghép cặp từ và nghĩa
  - 📝 **Grammar** - Lý thuyết + bài tập thực hành
  - 🏆 **Profile** - Theo dõi streak, từ đã lưu và XP

### 📚 Aptis Zone (Inspired by Edubit)
- **Course Marketplace:**
  - Card khóa học với giá, discount, rating, teacher
  - Video lessons với roadmap rõ ràng
  - Tài liệu PDF và checklist đi kèm
  
- **Online Mock Tests:**
  - Reading, Listening, Grammar & Vocab
  - Timer đếm ngược
  - Result breakdown chi tiết
  - Lưu lịch sử làm bài

### 🎮 Gamification
- ⭐ XP system
- 🔥 Daily streak tracking
- 🏅 Achievements & badges
- 📊 Progress visualization
- 🎯 Daily missions

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **React Router** - Navigation
- **CSS3** - Styling với pastel theme

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Features
- 25+ REST API endpoints
- In-memory storage (demo mode)
- CORS enabled
- Auto-generated API docs (Swagger)

## 📦 Cài đặt

### Yêu cầu hệ thống
- Python 3.12+
- Node.js 18+
- npm hoặc yarn

### 1. Clone repository

```bash
git clone https://github.com/Procoderdata/wectoeic.....git
cd wectoeic
```

### 2. Setup Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend sẽ chạy tại: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 🎯 Sử dụng

### Truy cập ứng dụng
1. Mở trình duyệt và truy cập `http://localhost:5173`
2. Chọn **TOEIC** để vào dashboard học từ vựng
3. Chọn **Aptis** để xem khóa học và làm mock test

### TOEIC Dashboard
1. Chọn module từ sidebar (Tra từ, Flashcard, Quiz, etc.)
2. Chọn bộ từ vựng muốn học
3. Bắt đầu học và tích lũy XP
4. Lưu từ quan trọng vào profile
5. Giữ streak hàng ngày

### Aptis Platform
1. Duyệt danh sách khóa học
2. Xem chi tiết khóa học và video lessons
3. Làm mock test online với timer
4. Xem kết quả và breakdown chi tiết

## 📚 API Documentation

### Endpoints chính

#### Site Overview
- `GET /api/health` - Health check
- `GET /api/site/overview` - Thông tin tổng quan

#### TOEIC
- `GET /api/toeic/sets` - Danh sách bộ từ vựng
- `GET /api/toeic/search?q={query}` - Tìm kiếm từ
- `GET /api/toeic/flashcards/{set_id}` - Flashcard
- `GET /api/toeic/quiz/{set_id}` - Quiz
- `GET /api/toeic/listening/{set_id}` - Listening practice
- `GET /api/toeic/typing/{set_id}` - Typing practice
- `GET /api/toeic/matching/{set_id}` - Matching game
- `GET /api/toeic/grammar` - Grammar topics

#### Progress Tracking
- `GET /api/toeic/progress/stats` - Thống kê tiến độ
- `POST /api/toeic/progress/activity` - Ghi nhận hoạt động
- `GET /api/toeic/progress/saved-words` - Từ đã lưu
- `POST /api/toeic/progress/save-word` - Lưu từ
- `DELETE /api/toeic/progress/save-word/{word_id}` - Xóa từ
- `GET /api/toeic/progress/streak` - Streak info

#### Aptis
- `GET /api/aptis/courses` - Danh sách khóa học
- `GET /api/aptis/courses/{slug}` - Chi tiết khóa học
- `POST /api/aptis/courses/{slug}/enroll` - Đăng ký khóa học
- `GET /api/aptis/courses/{slug}/progress` - Tiến độ khóa học
- `POST /api/aptis/lessons/{lesson_id}/complete` - Hoàn thành bài học
- `GET /api/aptis/tests` - Danh sách test
- `GET /api/aptis/tests/{slug}` - Chi tiết test
- `POST /api/aptis/tests/{slug}/submit` - Nộp bài test
- `GET /api/aptis/tests/history` - Lịch sử làm bài

#### Gamification
- `GET /api/achievements` - Danh sách thành tựu
- `GET /api/leaderboard` - Bảng xếp hạng
- `GET /api/stats/overview` - Thống kê tổng quan

Xem chi tiết tại: [API_ENDPOINTS.md](./API_ENDPOINTS.md)

## 🎨 Design Philosophy

### TOEIC Zone
- **Pastel colors** - Màu sắc nhẹ nhàng, dễ chịu
- **Dashboard layout** - Tất cả tính năng trong một màn hình
- **Quick actions** - Học nhanh, không phức tạp
- **Daily learning** - Phù hợp học mỗi ngày

### Aptis Zone
- **Course marketplace** - Giống nền tảng học online chuyên nghiệp
- **Structured learning** - Lesson roadmap rõ ràng
- **Video-first** - Tập trung vào video lessons
- **Test-oriented** - Mock tests với timer và breakdown

## 📁 Cấu trúc thư mục

```
wectoeic/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── data/               # Data storage (future)
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── API_ENDPOINTS.md        # API documentation
├── README.md
└── .gitignore
```

## 🔧 Development

### Backend Development

```bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --port 8000

# View API docs
open http://localhost:8000/docs
```

### Frontend Development

```bash
cd frontend
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚧 Roadmap

### Phase 1: Core Features ✅
- [x] TOEIC 8 modules
- [x] Aptis course platform
- [x] 25+ API endpoints
- [x] Progress tracking
- [x] Gamification basics

### Phase 2: Enhancement 🚀
- [ ] User authentication (JWT)
- [ ] Database integration (PostgreSQL)
- [ ] Real Text-to-Speech
- [ ] Dark mode
- [ ] Mobile responsive
- [ ] Charts & visualizations
- [ ] Toast notifications

### Phase 3: Advanced Features 🎯
- [ ] Social features (share progress)
- [ ] Real-time leaderboard
- [ ] Advanced analytics
- [ ] Video upload system
- [ ] Payment integration
- [ ] Admin dashboard

### Phase 4: Production Ready 🏭
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Error tracking (Sentry)
- [ ] Monitoring & logging

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Procoderdata**
- GitHub: [@Procoderdata](https://github.com/Procoderdata)

## 🙏 Acknowledgments

- Design inspiration from [Charnishere](https://charnishere.com/) (TOEIC zone)
- Design inspiration from [Edubit](https://edubit.vn/) (Aptis zone)
- Icons from emoji
- Color palette: Pastel pink, yellow, mint, blue

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng:
- Mở [Issue](https://github.com/Procoderdata/wectoeic.....git/issues)
- Hoặc liên hệ qua GitHub

---

⭐ Nếu project này hữu ích, hãy cho một star nhé!

**Made with ❤️ by Procoderdata**
