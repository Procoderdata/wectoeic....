# API Endpoints - Bloom English House

## ✅ Đã có sẵn (Original)

### Site Overview
- `GET /api/health` - Health check
- `GET /api/site/overview` - Thông tin tổng quan trang web

### TOEIC - Vocabulary
- `GET /api/toeic/sets` - Danh sách bộ từ vựng
- `GET /api/toeic/search?q={query}` - Tìm kiếm từ vựng
- `GET /api/toeic/flashcards/{set_id}` - Flashcard cho một bộ từ
- `GET /api/toeic/quiz/{set_id}` - Quiz cho một bộ từ
- `GET /api/toeic/matching/{set_id}` - Game nối từ
- `GET /api/toeic/grammar` - Danh sách chủ đề ngữ pháp

### APTIS - Courses & Tests
- `GET /api/aptis/courses` - Danh sách khóa học
- `GET /api/aptis/courses/{slug}` - Chi tiết khóa học
- `GET /api/aptis/tests` - Danh sách bài test
- `GET /api/aptis/tests/{slug}` - Chi tiết bài test
- `POST /api/aptis/tests/{slug}/submit` - Nộp bài test

---

## 🆕 Mới bổ sung

### TOEIC - Listening & Typing Practice
- `GET /api/toeic/listening/{set_id}` - Lấy dữ liệu luyện nghe
- `GET /api/toeic/typing/{set_id}` - Lấy dữ liệu luyện gõ từ

### TOEIC Reading Practice + Review & Improve + Flashcards
- `GET /api/toeic/reading/session` - Lấy session Reading (passage + câu hỏi)
- `POST /api/toeic/reading/answer` - Chấm nhanh 1 câu Reading + trả giải thích
  ```json
  {
    "question_id": "read-135",
    "answer_index": 3
  }
  ```
- `GET /api/toeic/reading/notes/{question_id}` - Lấy note cá nhân của 1 câu
- `POST /api/toeic/reading/notes/{question_id}` - Lưu note cá nhân
  ```json
  {
    "content": "Bẫy: long-term nhưng sai đối tượng"
  }
  ```
- `GET /api/toeic/reading/review` - Danh sách câu sai để Review & Improve
- `POST /api/toeic/reading/review/to-flashcards` - Tạo flashcard từ câu sai
  ```json
  {
    "question_ids": ["read-135", "read-139"]
  }
  ```
- `GET /api/toeic/reading/flashcards` - Danh sách flashcard Reading + due cards
- `POST /api/toeic/reading/flashcards/{card_id}/review` - Chấm mức nhớ thẻ (1-4)
  ```json
  {
    "quality": 3
  }
  ```

### Progress Tracking (TOEIC)
- `GET /api/toeic/progress/stats` - Thống kê tiến độ học tập
- `POST /api/toeic/progress/activity` - Ghi nhận hoạt động học
  ```json
  {
    "module": "quiz",
    "title": "Quiz Office Rhythm",
    "xp": 20
  }
  ```
- `GET /api/toeic/progress/saved-words` - Danh sách từ đã lưu
- `POST /api/toeic/progress/save-word` - Lưu từ vào bộ sưu tập
  ```json
  {
    "id": "allocate",
    "word": "allocate",
    "meaning": "phân bổ tài nguyên",
    "set_title": "Office Rhythm"
  }
  ```
- `DELETE /api/toeic/progress/save-word/{word_id}` - Xóa từ đã lưu
- `GET /api/toeic/progress/activities` - Lịch sử hoạt động gần đây
- `GET /api/toeic/progress/streak` - Thông tin streak hiện tại

### Course Enrollment & Progress (APTIS)
- `POST /api/aptis/courses/{slug}/enroll` - Đăng ký khóa học
  ```json
  {
    "user_id": "demo-user"
  }
  ```
- `GET /api/aptis/courses/{slug}/progress?user_id={user_id}` - Tiến độ khóa học
- `POST /api/aptis/lessons/{lesson_id}/complete` - Đánh dấu bài học hoàn thành
  ```json
  {
    "user_id": "demo-user"
  }
  ```

### Test History (APTIS)
- `GET /api/aptis/tests/history?user_id={user_id}` - Lịch sử làm bài test
- `POST /api/aptis/tests/{slug}/save-result` - Lưu kết quả test vào lịch sử
  ```json
  {
    "answers": [1, 2, 0, 3],
    "user_id": "demo-user"
  }
  ```

### Achievements & Gamification
- `GET /api/achievements` - Danh sách thành tựu và trạng thái unlock
- `GET /api/leaderboard` - Bảng xếp hạng theo XP

### Statistics
- `GET /api/stats/overview` - Thống kê tổng quan hệ thống

---

## 📊 Response Examples

### GET /api/toeic/progress/stats
```json
{
  "total_xp": 450,
  "streak_days": 7,
  "saved_word_count": 12,
  "module_counts": {
    "search": 5,
    "flashcard": 8,
    "quiz": 3,
    "listening": 2,
    "typing": 4,
    "matching": 1,
    "grammar": 2
  },
  "last_activity_date": "2024-01-15"
}
```

### GET /api/achievements
```json
{
  "items": [
    {
      "id": "first-search",
      "title": "First Search",
      "description": "Tra từ đầu tiên",
      "icon": "🔍",
      "unlocked": true
    },
    {
      "id": "word-collector",
      "title": "Word Collector",
      "description": "Lưu 5 từ vựng",
      "icon": "📚",
      "unlocked": false
    }
  ]
}
```

### GET /api/leaderboard
```json
{
  "items": [
    {
      "rank": 1,
      "username": "You",
      "xp": 450,
      "streak": 7
    },
    {
      "rank": 2,
      "username": "Alice",
      "xp": 1250,
      "streak": 12
    }
  ]
}
```

---

## 🔧 Technical Notes

### In-Memory Storage
Hiện tại backend đang dùng in-memory storage (dictionary) để demo:
- `USER_PROGRESS` - Tiến độ học tập
- `COURSE_ENROLLMENTS` - Đăng ký khóa học
- `LESSON_COMPLETIONS` - Hoàn thành bài học
- `TEST_HISTORY` - Lịch sử làm bài

### Production Ready
Để deploy production, cần:
1. Thay thế in-memory storage bằng database (PostgreSQL, MongoDB)
2. Thêm authentication (JWT tokens)
3. Thêm user management
4. Rate limiting
5. Caching (Redis)
6. File storage cho audio/video

### CORS
Backend đã enable CORS cho tất cả origins (`allow_origins=["*"]`). 
Trong production nên giới hạn chỉ frontend domain.

---

## 🚀 Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

Backend chạy tại: `http://localhost:8000`
Frontend chạy tại: `http://localhost:5173`

API docs tự động: `http://localhost:8000/docs`
