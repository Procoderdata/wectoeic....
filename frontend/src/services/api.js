const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export { API_BASE_URL };

export async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let detail = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      detail = data.detail || detail;
    } catch {
      // noop
    }
    throw new Error(detail);
  }

  return response.json();
}

// ============================================================================
// PROGRESS API
// ============================================================================

export const progressAPI = {
  async getStats() {
    return fetchJson('/api/toeic/progress/stats');
  },

  async recordActivity(module, title, xp = 0) {
    return fetchJson('/api/toeic/progress/activity', {
      method: 'POST',
      body: JSON.stringify({ module, title, xp }),
    });
  },

  async getSavedWords() {
    return fetchJson('/api/toeic/progress/saved-words');
  },

  async saveWord(word) {
    return fetchJson('/api/toeic/progress/save-word', {
      method: 'POST',
      body: JSON.stringify(word),
    });
  },

  async unsaveWord(wordId) {
    return fetchJson(`/api/toeic/progress/save-word/${wordId}`, {
      method: 'DELETE',
    });
  },

  async getActivities() {
    return fetchJson('/api/toeic/progress/activities');
  },

  async getStreak() {
    return fetchJson('/api/toeic/progress/streak');
  },
};

// ============================================================================
// TOEIC ENHANCED API
// ============================================================================

export const toeicAPI = {
  async getFullTests(series = '', query = '') {
    const params = new URLSearchParams();
    if (series) params.set('series', series);
    if (query) params.set('q', query);
    const queryString = params.toString();
    return fetchJson(`/api/toeic/full-tests${queryString ? `?${queryString}` : ''}`);
  },

  async launchFullTest(packId, mode = 'practice', userId = 'demo-user') {
    return fetchJson(`/api/toeic/full-tests/${packId}/launch`, {
      method: 'POST',
      body: JSON.stringify({ mode, user_id: userId }),
    });
  },

  async getGrammarProgress() {
    return fetchJson('/api/toeic/grammar/progress');
  },

  async recordGrammarAttempt(topicId, questionId, isCorrect) {
    return fetchJson('/api/toeic/grammar/attempt', {
      method: 'POST',
      body: JSON.stringify({
        topic_id: topicId,
        question_id: questionId,
        is_correct: isCorrect,
      }),
    });
  },

  async getVocabLessons() {
    return fetchJson('/api/toeic/vocab/lessons');
  },

  async setVocabLessonStatus(lessonId, status) {
    return fetchJson(`/api/toeic/vocab/lessons/${lessonId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },
};

export const toeicExamAPI = {
  async getConfig() {
    return fetchJson('/api/toeic/exam/config');
  },

  async createSession(skills, theme) {
    return fetchJson('/api/toeic/exam/sessions', {
      method: 'POST',
      body: JSON.stringify({ skills, theme }),
    });
  },

  async getSession(sessionId) {
    return fetchJson(`/api/toeic/exam/sessions/${sessionId}`);
  },

  async submitSession(sessionId, answers) {
    return fetchJson(`/api/toeic/exam/sessions/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};

export const officialExamAPI = {
  async getExam(examType, skill) {
    return fetchJson(`/api/${examType}/official/${skill}`);
  },

  async submitExam(examType, skill, answers) {
    return fetchJson(`/api/${examType}/official/${skill}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};

export const toeicReadingAPI = {
  async getSession() {
    return fetchJson('/api/toeic/reading/session');
  },

  async submitAnswer(questionId, answerIndex) {
    return fetchJson('/api/toeic/reading/answer', {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        answer_index: answerIndex,
      }),
    });
  },

  async getNote(questionId) {
    return fetchJson(`/api/toeic/reading/notes/${questionId}`);
  },

  async saveNote(questionId, content) {
    return fetchJson(`/api/toeic/reading/notes/${questionId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async getReviewItems() {
    return fetchJson('/api/toeic/reading/review');
  },

  async createFlashcards(questionIds = []) {
    return fetchJson('/api/toeic/reading/review/to-flashcards', {
      method: 'POST',
      body: JSON.stringify({ question_ids: questionIds }),
    });
  },

  async getFlashcards() {
    return fetchJson('/api/toeic/reading/flashcards');
  },

  async reviewFlashcard(cardId, quality) {
    return fetchJson(`/api/toeic/reading/flashcards/${cardId}/review`, {
      method: 'POST',
      body: JSON.stringify({ quality }),
    });
  },
};

// ============================================================================
// APTIS API
// ============================================================================

export const aptisAPI = {
  async enrollCourse(slug, userId = 'demo-user') {
    return fetchJson(`/api/aptis/courses/${slug}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  async getCourseProgress(slug, userId = 'demo-user') {
    return fetchJson(`/api/aptis/courses/${slug}/progress?user_id=${userId}`);
  },

  async completeLesson(lessonId, userId = 'demo-user') {
    return fetchJson(`/api/aptis/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },
};

// ============================================================================
// ACHIEVEMENTS & LEADERBOARD API
// ============================================================================

export const gamificationAPI = {
  async getAchievements() {
    return fetchJson('/api/achievements');
  },

  async getLeaderboard() {
    return fetchJson('/api/leaderboard');
  },

  async getStatsOverview() {
    return fetchJson('/api/stats/overview');
  },
};
