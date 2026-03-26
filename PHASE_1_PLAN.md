# 🚀 PHASE 1: Database & Authentication - Migration Plan

## 📊 Current State Analysis

### Backend
- **Framework**: FastAPI with in-memory storage (dictionaries)
- **Data**: TOEIC_SETS, GRAMMAR_TOPICS, APTIS_COURSES, APTIS_TESTS
- **Progress**: USER_PROGRESS, COURSE_ENROLLMENTS, LESSON_COMPLETIONS, TEST_HISTORY
- **Auth**: None (demo-user hardcoded)

### Frontend
- **State**: localStorage via `useLocalProgress` hook
- **Data stored locally**:
  - savedWords
  - totalXp
  - moduleCounts
  - activityDates
  - lastActions
  - streak calculation

### Current API Endpoints (25+)
- Site overview
- TOEIC: sets, search, flashcards, quiz, listening, typing, matching, grammar
- Progress: stats, activity, saved-words, streak
- Aptis: courses, lessons, tests, enrollment
- Gamification: achievements, leaderboard

## ⚠️ Migration Risks

### 1. Data Loss Risk
- **Risk**: Users lose progress when switching from localStorage to server
- **Mitigation**: 
  - Create migration endpoint to import localStorage data
  - Keep localStorage as backup for 2 weeks
  - Show migration banner with "Import Progress" button

### 2. Breaking Changes
- **Risk**: Frontend expects immediate responses, DB queries add latency
- **Mitigation**:
  - Add loading states
  - Implement optimistic updates
  - Cache frequently accessed data (Redis)

### 3. Authentication Friction
- **Risk**: Users must register/login, may abandon
- **Mitigation**:
  - Allow guest mode (localStorage) for first visit
  - One-click social login (Google/Facebook)
  - "Continue as Guest" option

### 4. Concurrent Access
- **Risk**: Multiple devices/tabs cause data conflicts
- **Mitigation**:
  - Use optimistic locking (version field)
  - Last-write-wins for non-critical data
  - Conflict resolution UI for critical data

### 5. Performance Degradation
- **Risk**: N+1 queries, slow joins
- **Mitigation**:
  - Use SQLAlchemy eager loading
  - Add database indexes
  - Implement Redis caching layer

## 🗄️ Database Schema Design

### Core Tables

```sql
-- Users & Auth
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TOEIC Content
CREATE TABLE toeic_question_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    level VARCHAR(50),
    theme VARCHAR(255),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE toeic_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID REFERENCES toeic_question_sets(id) ON DELETE CASCADE,
    question_type VARCHAR(50), -- vocab, grammar, reading, listening
    difficulty VARCHAR(20), -- easy, medium, hard
    content JSONB NOT NULL, -- flexible structure
    correct_answer TEXT,
    explanation TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word VARCHAR(255) NOT NULL,
    word_type VARCHAR(50),
    ipa VARCHAR(100),
    meaning TEXT NOT NULL,
    example_en TEXT,
    example_vi TEXT,
    origin TEXT,
    synonyms TEXT[],
    note TEXT,
    sentences TEXT[],
    set_id UUID REFERENCES toeic_question_sets(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Grammar Topics
CREATE TABLE grammar_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    accent VARCHAR(20),
    theory_points TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE grammar_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES grammar_topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL,
    answer_index INTEGER NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Aptis Content
CREATE TABLE aptis_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    level VARCHAR(50),
    teacher VARCHAR(255),
    rating DECIMAL(3,2),
    reviews INTEGER DEFAULT 0,
    students INTEGER DEFAULT 0,
    duration_weeks INTEGER,
    discount INTEGER DEFAULT 0,
    original_price VARCHAR(50),
    sale_price VARCHAR(50),
    image_url TEXT,
    summary TEXT,
    focus_tags TEXT[],
    highlights TEXT[],
    outcomes TEXT[],
    materials TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE aptis_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES aptis_courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(20),
    lesson_type VARCHAR(50),
    summary TEXT,
    video_url TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE aptis_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    module VARCHAR(50), -- Reading, Listening, Grammar & Vocab
    difficulty VARCHAR(20),
    recommended_for VARCHAR(255),
    duration_minutes INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE aptis_test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES aptis_tests(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    support_text TEXT,
    options TEXT[] NOT NULL,
    answer_index INTEGER NOT NULL,
    explanation TEXT,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Progress & Activity
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    module_counts JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE saved_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    word_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
    set_title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activities_user_created ON activities(user_id, created_at DESC);

-- Attempts & Scores
CREATE TABLE toeic_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    set_id UUID REFERENCES toeic_question_sets(id),
    attempt_type VARCHAR(50), -- quiz, full_test, practice
    total_questions INTEGER,
    correct_count INTEGER,
    accuracy DECIMAL(5,2),
    time_spent_seconds INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE toeic_attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES toeic_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES toeic_questions(id),
    user_answer TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE aptis_test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    test_id UUID REFERENCES aptis_tests(id),
    total_questions INTEGER,
    correct_count INTEGER,
    accuracy DECIMAL(5,2),
    time_spent_seconds INTEGER,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE aptis_test_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES aptis_test_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES aptis_test_questions(id),
    answer_index INTEGER,
    is_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Course Enrollment & Progress
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES aptis_courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    progress_percent DECIMAL(5,2) DEFAULT 0,
    last_accessed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE TABLE lesson_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES aptis_lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Achievements & Gamification
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    achievement_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    xp_required INTEGER DEFAULT 0,
    action_required VARCHAR(50),
    count_required INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_vocabulary_word ON vocabulary(word);
CREATE INDEX idx_vocabulary_set ON vocabulary(set_id);
CREATE INDEX idx_toeic_questions_set ON toeic_questions(set_id);
CREATE INDEX idx_toeic_questions_type ON toeic_questions(question_type);
CREATE INDEX idx_grammar_questions_topic ON grammar_questions(topic_id);
CREATE INDEX idx_aptis_lessons_course ON aptis_lessons(course_id);
CREATE INDEX idx_aptis_test_questions_test ON aptis_test_questions(test_id);
CREATE INDEX idx_saved_words_user ON saved_words(user_id);
CREATE INDEX idx_toeic_attempts_user ON toeic_attempts(user_id);
CREATE INDEX idx_aptis_test_attempts_user ON aptis_test_attempts(user_id);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_lesson_completions_user ON lesson_completions(user_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
```

## 📁 New Backend Structure

```
backend/
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Settings (DB, Redis, JWT)
│   ├── database.py             # SQLAlchemy setup
│   ├── dependencies.py         # Auth dependencies
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── toeic.py
│   │   ├── aptis.py
│   │   ├── progress.py
│   │   └── achievement.py
│   │
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── toeic.py
│   │   ├── aptis.py
│   │   └── progress.py
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── toeic.py
│   │   ├── aptis.py
│   │   ├── progress.py
│   │   └── achievements.py
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── toeic_service.py
│   │   ├── aptis_service.py
│   │   └── progress_service.py
│   │
│   ├── utils/                  # Utilities
│   │   ├── __init__.py
│   │   ├── security.py         # Password hashing, JWT
│   │   ├── cache.py            # Redis helpers
│   │   └── validators.py
│   │
│   └── seed/                   # Seed data
│       ├── __init__.py
│       ├── toeic_data.py
│       ├── aptis_data.py
│       └── seed_db.py
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_toeic.py
│   └── test_progress.py
│
├── requirements.txt
├── requirements-dev.txt
├── alembic.ini
├── .env.example
└── docker-compose.yml
```

## 🔐 Authentication Flow

### JWT Strategy
```python
# Access Token: 15 minutes
# Refresh Token: 7 days
# Stored in httpOnly cookies

POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Hashed with bcrypt (cost factor 12)

## 📦 New Dependencies

```txt
# requirements.txt additions
sqlalchemy==2.0.23
alembic==1.13.0
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
redis==5.0.1
```

## 🔄 Migration Strategy

### Step 1: Parallel Run (Week 1-2)
1. Deploy new backend with DB
2. Keep old in-memory endpoints active
3. Frontend calls both (new for logged-in, old for guests)
4. Monitor error rates

### Step 2: Migration Tool (Week 2)
1. Add `/api/migrate/import-progress` endpoint
2. Frontend shows banner: "Save your progress to cloud"
3. User clicks → sends localStorage data → creates account
4. Verify data integrity

### Step 3: Deprecation (Week 3-4)
1. Show warning for localStorage-only users
2. Gradually reduce localStorage usage
3. Remove old endpoints after 90% migration

### Step 4: Cleanup (Week 5)
1. Remove in-memory storage code
2. Remove localStorage fallbacks
3. Update documentation

## 🧪 Testing Plan

### Unit Tests
```bash
# Auth
- test_register_success
- test_register_duplicate_email
- test_login_success
- test_login_invalid_credentials
- test_refresh_token
- test_logout

# Progress
- test_record_activity
- test_save_word
- test_calculate_streak
- test_get_stats

# TOEIC
- test_create_attempt
- test_submit_answers
- test_calculate_score
```

### Integration Tests
```bash
# Full flow
- test_user_journey_register_to_first_quiz
- test_concurrent_progress_updates
- test_migration_from_localstorage
```

### Load Tests
```bash
# Locust scenarios
- 100 concurrent users taking quiz
- 1000 users viewing leaderboard
- Stress test: 10k requests/minute
```

## 📊 Monitoring & Observability

### Metrics to Track
- API response times (p50, p95, p99)
- Database query times
- Cache hit rates
- Authentication success/failure rates
- Active users (DAU, MAU)
- Feature usage (quiz, flashcard, etc.)

### Logging
```python
# Structured logging with context
logger.info(
    "user_login",
    extra={
        "user_id": user.id,
        "email": user.email,
        "ip": request.client.host,
    }
)
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Database migrations tested
- [ ] Seed data loaded
- [ ] Environment variables configured
- [ ] Redis connection verified
- [ ] SSL certificates ready

### Deployment
- [ ] Run migrations: `alembic upgrade head`
- [ ] Seed initial data: `python -m app.seed.seed_db`
- [ ] Start backend: `uvicorn app.main:app`
- [ ] Verify health: `GET /api/health`
- [ ] Test auth flow end-to-end

### Post-deployment
- [ ] Monitor error logs
- [ ] Check database connections
- [ ] Verify cache performance
- [ ] Test migration endpoint
- [ ] Update API documentation

## 📝 API Contract Changes

### Breaking Changes
None - all new endpoints, old ones remain

### New Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/migrate/import-progress
```

### Modified Endpoints
All existing endpoints now accept optional `Authorization: Bearer <token>` header
- If present: use user_id from token
- If absent: use demo-user (backward compatible)

## 🎯 Success Criteria

### Phase 1 Complete When:
1. ✅ Database schema created and migrated
2. ✅ Auth endpoints working (register, login, refresh, logout)
3. ✅ All existing features work with DB (backward compatible)
4. ✅ Migration tool tested with 10+ users
5. ✅ Tests passing (>80% coverage)
6. ✅ Documentation updated
7. ✅ Staging environment deployed

### Performance Targets
- API response time: <200ms (p95)
- Database queries: <50ms (p95)
- Auth flow: <500ms end-to-end
- Zero data loss during migration

## 🔜 Next Steps

After Phase 1 approval:
1. Create database models (SQLAlchemy)
2. Setup Alembic migrations
3. Implement auth service
4. Write tests
5. Deploy to staging
6. User acceptance testing

---

**Estimated Timeline**: 2-3 weeks
**Team Required**: 1 Senior Backend + 1 Frontend + 1 DevOps
**Risk Level**: Medium (data migration always risky)
