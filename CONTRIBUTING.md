# Contributing to Bloom English House

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án! 🎉

## 🚀 Cách đóng góp

### 1. Fork và Clone

```bash
# Fork repo trên GitHub, sau đó clone về máy
git clone https://github.com/YOUR_USERNAME/wectoeic.....git
cd wectoeic
```

### 2. Tạo branch mới

```bash
git checkout -b feature/ten-tinh-nang-moi
# hoặc
git checkout -b fix/sua-loi-gi-do
```

### 3. Làm việc trên branch của bạn

- Viết code sạch, dễ đọc
- Follow coding conventions hiện tại
- Thêm comments khi cần thiết
- Test kỹ trước khi commit

### 4. Commit changes

```bash
git add .
git commit -m "feat: thêm tính năng XYZ"
# hoặc
git commit -m "fix: sửa lỗi ABC"
```

**Commit message format:**
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật documentation
- `style:` - Format code, không ảnh hưởng logic
- `refactor:` - Refactor code
- `test:` - Thêm tests
- `chore:` - Cập nhật build tools, dependencies

### 5. Push và tạo Pull Request

```bash
git push origin feature/ten-tinh-nang-moi
```

Sau đó mở Pull Request trên GitHub với mô tả rõ ràng về thay đổi.

## 📋 Checklist trước khi submit PR

- [ ] Code chạy được không lỗi
- [ ] Đã test các tính năng mới
- [ ] Đã update documentation nếu cần
- [ ] Commit messages rõ ràng
- [ ] Code style nhất quán với project

## 🎯 Các vấn đề có thể đóng góp

### 🐛 Bug Fixes
- Sửa lỗi UI/UX
- Sửa lỗi API
- Sửa lỗi logic

### ✨ Features
- Thêm tính năng mới cho TOEIC zone
- Thêm tính năng mới cho Aptis zone
- Cải thiện gamification
- Thêm animations

### 📚 Documentation
- Cải thiện README
- Thêm code comments
- Viết tutorials
- Dịch sang tiếng Anh

### 🎨 Design
- Cải thiện UI/UX
- Thêm themes mới
- Responsive design
- Accessibility improvements

## 💻 Development Guidelines

### Backend (Python/FastAPI)

```python
# Good
@app.get("/api/toeic/sets")
def get_toeic_sets() -> dict[str, Any]:
    """Get list of TOEIC vocabulary sets"""
    return {"items": TOEIC_SETS}

# Bad - thiếu type hints và docstring
@app.get("/api/toeic/sets")
def get_toeic_sets():
    return {"items": TOEIC_SETS}
```

### Frontend (React)

```jsx
// Good - component rõ ràng, có PropTypes
function CourseCard({ course, onEnroll }) {
  return (
    <article className="course-card">
      <h3>{course.title}</h3>
      <button onClick={() => onEnroll(course.slug)}>
        Enroll
      </button>
    </article>
  );
}

// Bad - inline styles, logic phức tạp trong JSX
function CourseCard({ course }) {
  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      {course && course.title ? (
        <h3>{course.title}</h3>
      ) : null}
    </div>
  );
}
```

### CSS

```css
/* Good - BEM naming, organized */
.course-card {
  padding: 22px;
  border-radius: 28px;
  background: var(--card);
}

.course-card__title {
  margin: 0 0 12px;
  font-size: 1.2rem;
}

/* Bad - generic names, !important */
.card {
  padding: 20px !important;
}

.title {
  color: red !important;
}
```

## 🧪 Testing

Trước khi submit PR, hãy test:

### Backend
```bash
cd backend
python main.py
# Mở http://localhost:8000/docs
# Test các endpoints
```

### Frontend
```bash
cd frontend
npm run dev
# Test UI trên browser
# Test responsive trên mobile
```

## 📞 Liên hệ

Nếu có câu hỏi, hãy:
- Mở [Issue](https://github.com/Procoderdata/wectoeic.....git/issues)
- Comment trong Pull Request
- Liên hệ qua GitHub

## 🙏 Cảm ơn

Mọi đóng góp đều được trân trọng! Cảm ơn bạn đã giúp cải thiện dự án.

---

Happy Coding! 🚀
