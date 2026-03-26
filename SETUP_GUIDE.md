# 📥 Hướng dẫn Pull Code từ GitHub

## 🎯 Dành cho người mới bắt đầu

### Bước 1: Cài đặt Git (nếu chưa có)

#### Windows:
1. Tải Git từ: https://git-scm.com/download/win
2. Chạy file cài đặt và làm theo hướng dẫn
3. Mở **Git Bash** hoặc **Command Prompt**

#### macOS:
```bash
# Cài qua Homebrew
brew install git

# Hoặc tải từ: https://git-scm.com/download/mac
```

#### Linux:
```bash
# Ubuntu/Debian
sudo apt-get install git

# Fedora
sudo dnf install git
```

### Bước 2: Kiểm tra Git đã cài đặt

```bash
git --version
# Kết quả: git version 2.x.x
```

---

## 🚀 Cách 1: Clone lần đầu (Máy chưa có code)

### 1. Mở Terminal/Command Prompt

```bash
# Di chuyển đến thư mục muốn lưu code
cd ~/Documents
# hoặc
cd C:\Users\YourName\Documents
```

### 2. Clone repository

```bash
git clone https://github.com/Procoderdata/wectoeic.....git
```

### 3. Vào thư mục project

```bash
cd wectoeic
```

### 4. Cài đặt dependencies

#### Backend:
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend:
```bash
cd frontend
npm install
```

### 5. Chạy ứng dụng

#### Terminal 1 - Backend:
```bash
cd backend
python main.py
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

✅ **Xong!** Mở trình duyệt: http://localhost:5173

---

## 🔄 Cách 2: Pull code mới (Máy đã có code)

### Khi bạn hoặc người khác đã push code mới lên GitHub:

```bash
# 1. Vào thư mục project
cd wectoeic

# 2. Kiểm tra branch hiện tại
git branch
# Kết quả: * main

# 3. Pull code mới về
git pull origin main
```

### Nếu có conflict (xung đột):

```bash
# Git sẽ báo conflict, bạn cần:
# 1. Mở file bị conflict
# 2. Sửa phần conflict (giữa <<<< và >>>>)
# 3. Sau đó:
git add .
git commit -m "fix: resolve conflicts"
git push origin main
```

---

## 🌿 Cách 3: Làm việc với Branches

### Tạo branch mới để code tính năng:

```bash
# 1. Tạo và chuyển sang branch mới
git checkout -b feature/ten-tinh-nang

# 2. Code tính năng của bạn...

# 3. Commit changes
git add .
git commit -m "feat: thêm tính năng XYZ"

# 4. Push branch lên GitHub
git push origin feature/ten-tinh-nang

# 5. Tạo Pull Request trên GitHub
```

### Chuyển đổi giữa các branches:

```bash
# Xem danh sách branches
git branch -a

# Chuyển sang branch khác
git checkout main
git checkout feature/ten-tinh-nang

# Pull code từ branch khác
git pull origin feature/ten-tinh-nang
```

---

## 🔧 Các lệnh Git thường dùng

### Kiểm tra trạng thái:
```bash
# Xem files đã thay đổi
git status

# Xem lịch sử commits
git log

# Xem lịch sử ngắn gọn
git log --oneline
```

### Làm việc với changes:
```bash
# Thêm tất cả files đã thay đổi
git add .

# Thêm file cụ thể
git add backend/main.py

# Commit với message
git commit -m "feat: thêm tính năng mới"

# Push lên GitHub
git push origin main
```

### Hủy changes:
```bash
# Hủy changes chưa commit (cẩn thận!)
git checkout -- filename.py

# Hủy tất cả changes chưa commit
git reset --hard

# Quay về commit trước đó
git reset --soft HEAD~1
```

### Đồng bộ với remote:
```bash
# Xem remote repositories
git remote -v

# Fetch thông tin mới (không merge)
git fetch origin

# Pull = Fetch + Merge
git pull origin main

# Push code lên
git push origin main
```

---

## 🎯 Workflow thực tế

### Scenario 1: Bạn muốn code tính năng mới

```bash
# 1. Pull code mới nhất
git pull origin main

# 2. Tạo branch mới
git checkout -b feature/dark-mode

# 3. Code tính năng...

# 4. Commit
git add .
git commit -m "feat: add dark mode toggle"

# 5. Push
git push origin feature/dark-mode

# 6. Tạo Pull Request trên GitHub
# 7. Sau khi merge, quay về main
git checkout main
git pull origin main
```

### Scenario 2: Đồng nghiệp đã push code mới

```bash
# 1. Lưu code đang làm (nếu chưa commit)
git stash

# 2. Pull code mới
git pull origin main

# 3. Lấy lại code đang làm
git stash pop

# 4. Tiếp tục code...
```

### Scenario 3: Làm việc trên máy khác

```bash
# Máy 1:
git add .
git commit -m "feat: work in progress"
git push origin main

# Máy 2:
git pull origin main
# Tiếp tục code...
```

---

## 🆘 Xử lý lỗi thường gặp

### Lỗi: "fatal: not a git repository"
```bash
# Bạn chưa ở trong thư mục git
cd wectoeic
```

### Lỗi: "Permission denied (publickey)"
```bash
# Cần setup SSH key hoặc dùng HTTPS
# Dùng HTTPS (dễ hơn):
git remote set-url origin https://github.com/Procoderdata/wectoeic.....git
```

### Lỗi: "Your local changes would be overwritten"
```bash
# Option 1: Lưu changes
git stash
git pull origin main
git stash pop

# Option 2: Hủy changes (cẩn thận!)
git reset --hard
git pull origin main
```

### Lỗi: "Merge conflict"
```bash
# 1. Mở file bị conflict
# 2. Tìm dòng có <<<<<<< HEAD
# 3. Sửa code, xóa các dấu <<<<, ====, >>>>
# 4. Sau đó:
git add .
git commit -m "fix: resolve merge conflict"
```

---

## 📱 Sử dụng GitHub Desktop (GUI)

Nếu không thích dùng command line:

1. Tải **GitHub Desktop**: https://desktop.github.com/
2. Đăng nhập GitHub
3. Clone repository bằng GUI
4. Pull/Push bằng nút bấm

---

## 🎓 Tips & Best Practices

### ✅ Nên làm:
- Pull code trước khi bắt đầu làm việc
- Commit thường xuyên với message rõ ràng
- Tạo branch cho mỗi tính năng mới
- Test kỹ trước khi push

### ❌ Không nên:
- Commit trực tiếp vào main (nên dùng branch)
- Push code chưa test
- Commit quá nhiều files không liên quan
- Dùng `git push -f` (force push) trừ khi thật sự cần

### 📝 Commit message tốt:
```bash
# Good
git commit -m "feat: add dark mode toggle button"
git commit -m "fix: resolve login authentication bug"
git commit -m "docs: update README with setup guide"

# Bad
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

---

## 🔗 Tài nguyên học thêm

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Interactive Git Tutorial**: https://learngitbranching.js.org/

---

## 💡 Quick Reference

```bash
# Clone repository
git clone <url>

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/name

# Check status
git status

# Add changes
git add .

# Commit
git commit -m "message"

# Push
git push origin main

# Switch branch
git checkout main

# View branches
git branch -a

# View log
git log --oneline
```

---

**Có câu hỏi?** Mở [Issue](https://github.com/Procoderdata/wectoeic.....git/issues) trên GitHub!

Happy Coding! 🚀
