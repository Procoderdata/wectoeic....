# 📥 Hướng dẫn Pull Code từ GitHub về Máy Khác

## 🎯 Tình huống: Bạn đã push code từ máy A, giờ muốn pull về máy B

---

## 📋 Bước 1: Kiểm tra Git đã cài đặt chưa

```bash
git --version
```

Nếu chưa có, cài Git:
- **Windows**: https://git-scm.com/download/win
- **macOS**: `brew install git`
- **Linux**: `sudo apt-get install git`

---

## 🔄 Bước 2: Pull code về (Máy đã có code)

### Nếu máy B đã clone repo trước đó:

```bash
# 1. Vào thư mục project
cd wectoeic

# 2. Kiểm tra branch hiện tại
git branch
# Kết quả: * main

# 3. Kiểm tra có thay đổi local không
git status

# 4. Nếu có thay đổi chưa commit, lưu lại:
git stash

# 5. Pull code mới nhất từ GitHub
git pull origin main

# 6. Lấy lại thay đổi đã stash (nếu có)
git stash pop
```

### Nếu có conflict (xung đột):

```bash
# Git sẽ báo conflict, ví dụ:
# CONFLICT (content): Merge conflict in backend/main.py

# 1. Mở file bị conflict
# 2. Tìm các dòng:
#    <<<<<<< HEAD
#    (code của bạn)
#    =======
#    (code từ GitHub)
#    >>>>>>> origin/main

# 3. Sửa code, giữ phần nào cần thiết, xóa các dấu <<<<, ====, >>>>

# 4. Sau khi sửa xong:
git add .
git commit -m "fix: resolve merge conflicts"
```

---

## 🆕 Bước 3: Clone lần đầu (Máy chưa có code)

### Nếu máy B chưa có code:

```bash
# 1. Vào thư mục muốn lưu code
cd ~/Documents
# hoặc
cd C:\Users\YourName\Documents

# 2. Clone repository
git clone https://github.com/Procoderdata/wectoeic.git

# 3. Vào thư mục project
cd wectoeic

# 4. Kiểm tra code đã về chưa
ls -la
```

---

## 🔧 Bước 4: Cài đặt dependencies sau khi pull

### Backend:

```bash
cd backend

# Cài dependencies
pip install -r requirements.txt

# Nếu cần dev dependencies
pip install -r requirements-dev.txt

# Copy environment file
cp .env.example .env
# Sau đó edit .env với thông tin database của bạn
```

### Frontend:

```bash
cd frontend

# Cài dependencies
npm install

# Hoặc dùng yarn
yarn install
```

---

## 🚀 Bước 5: Chạy ứng dụng

### Terminal 1 - Backend:

```bash
cd backend

# Nếu có migrations mới
alembic upgrade head

# Chạy server
python main.py
# hoặc
uvicorn app.main:app --reload --port 8000
```

### Terminal 2 - Frontend:

```bash
cd frontend

# Chạy dev server
npm run dev
```

### Mở trình duyệt:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🔍 Kiểm tra code mới nhất

### Xem lịch sử commits:

```bash
# Xem 10 commits gần nhất
git log --oneline -10

# Xem chi tiết commit
git show <commit-hash>

# Xem files đã thay đổi
git diff HEAD~1 HEAD
```

### Xem branch nào có code mới:

```bash
# Xem tất cả branches
git branch -a

# Xem commits trên branch khác
git log origin/main --oneline -10

# So sánh với branch khác
git diff main origin/main
```

---

## 🔄 Workflow thực tế

### Scenario 1: Làm việc trên 2 máy

**Máy A (văn phòng):**
```bash
# Sáng: Pull code mới nhất
git pull origin main

# Code...

# Chiều: Push code lên
git add .
git commit -m "feat: add new feature"
git push origin main
```

**Máy B (nhà):**
```bash
# Tối: Pull code từ máy A
git pull origin main

# Code tiếp...

# Đêm: Push code lên
git add .
git commit -m "feat: continue working on feature"
git push origin main
```

**Máy A (sáng hôm sau):**
```bash
# Pull code từ máy B
git pull origin main

# Tiếp tục cycle...
```

### Scenario 2: Làm việc nhóm

```bash
# Mỗi sáng trước khi code
git pull origin main

# Code feature của bạn...

# Trước khi push, pull lại để tránh conflict
git pull origin main

# Nếu có conflict, resolve rồi mới push
git add .
git commit -m "feat: your feature"
git push origin main
```

---

## ⚠️ Lỗi thường gặp

### 1. "Your local changes would be overwritten"

```bash
# Lưu changes trước khi pull
git stash
git pull origin main
git stash pop
```

### 2. "Permission denied (publickey)"

```bash
# Dùng HTTPS thay vì SSH
git remote set-url origin https://github.com/Procoderdata/wectoeic.git
```

### 3. "fatal: not a git repository"

```bash
# Bạn chưa ở trong thư mục git
cd wectoeic
```

### 4. "Merge conflict"

```bash
# Xem files bị conflict
git status

# Mở file, sửa conflict
# Sau đó:
git add .
git commit -m "fix: resolve conflicts"
```

---

## 📊 Kiểm tra trạng thái

### Trước khi pull:

```bash
# Xem có thay đổi local không
git status

# Xem có commits mới trên GitHub không
git fetch origin
git log HEAD..origin/main --oneline
```

### Sau khi pull:

```bash
# Xem files đã thay đổi
git diff HEAD~1 HEAD --name-only

# Xem chi tiết thay đổi
git diff HEAD~1 HEAD
```

---

## 🎯 Quick Commands

```bash
# Pull code mới nhất
git pull origin main

# Xem lịch sử
git log --oneline -10

# Xem trạng thái
git status

# Lưu changes tạm thời
git stash

# Lấy lại changes
git stash pop

# Xem remote URL
git remote -v

# Fetch thông tin mới (không merge)
git fetch origin
```

---

## 🔗 Tài liệu tham khảo

- **Git Basics**: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- **Git Pull**: https://git-scm.com/docs/git-pull
- **Resolving Conflicts**: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts

---

## 💡 Tips

1. **Pull thường xuyên**: Mỗi sáng trước khi code
2. **Commit nhỏ**: Commit thường xuyên với message rõ ràng
3. **Stash khi cần**: Dùng `git stash` khi cần pull nhưng chưa muốn commit
4. **Kiểm tra trước khi push**: Chạy tests trước khi push
5. **Backup quan trọng**: Dùng branch cho features lớn

---

**Có vấn đề?** Mở [Issue](https://github.com/Procoderdata/wectoeic/issues) trên GitHub!

Happy Coding! 🚀
