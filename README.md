# Bloom English House

Clone concept theo yeu cau:

- TOEIC: lay feel giao dien + luong hoc tap tu `charnishere.com`
- Aptis: lay feel khoa hoc + card course + mock test tu `maihienvstep.edubit.vn/courses`

## Cau truc

- `frontend/`: React + Vite
- `backend/`: FastAPI API

## Chay backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend mac dinh chay o `http://localhost:8000`

## Chay frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend mac dinh chay o `http://localhost:5173`

Neu backend khong chay o cong 8000, tao file `.env` trong `frontend/`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Feature da lam

### TOEIC

- landing/dashboard pastel
- 8 module:
  - tra tu
  - flashcard
  - quiz
  - listening prompt
  - typing
  - matching game
  - grammar theory + practice
  - profile / progress

### Aptis

- course marketplace kiểu Edubit
- course detail + video lesson panel
- mock test online:
  - Listening
  - Reading
  - Grammar & Vocab

## Luu y

- Du lieu hien tai la sample data de co the demo giao dien va tinh nang
- Video dang dung link embed mau
- Progress TOEIC duoc luu bang `localStorage`
