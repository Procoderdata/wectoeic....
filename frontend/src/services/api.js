const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const ACCESS_TOKEN_KEY = 'bloom_access_token';
const REFRESH_TOKEN_KEY = 'bloom_refresh_token';
const ADMIN_ACCESS_TOKEN_KEY = 'bloom_admin_access_token';

export { API_BASE_URL };

function getStoredToken(key) {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

function setStoredToken(key, value) {
  if (typeof window === 'undefined') return;
  if (!value) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, value);
}

export function getAccessToken() {
  return getStoredToken(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return getStoredToken(REFRESH_TOKEN_KEY);
}

export function getAdminAccessToken() {
  return getStoredToken(ADMIN_ACCESS_TOKEN_KEY);
}

export function setAuthTokens(tokens = {}) {
  setStoredToken(ACCESS_TOKEN_KEY, tokens.access_token);
  setStoredToken(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function setAdminAuthTokens(tokens = {}) {
  setStoredToken(ADMIN_ACCESS_TOKEN_KEY, tokens.access_token);
}

export function clearAuthTokens() {
  setStoredToken(ACCESS_TOKEN_KEY, null);
  setStoredToken(REFRESH_TOKEN_KEY, null);
}

export function clearAdminAuthTokens() {
  setStoredToken(ADMIN_ACCESS_TOKEN_KEY, null);
}

export async function fetchJson(path, options = {}) {
  const { authMode = 'student', headers: optionHeaders, ...requestOptions } = options;
  const accessToken =
    authMode === 'admin'
      ? getAdminAccessToken()
      : authMode === 'none'
        ? null
        : getAccessToken();
  const isFormData = typeof FormData !== 'undefined' && requestOptions.body instanceof FormData;
  const headers = {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(optionHeaders || {}),
  };

  if (!isFormData && !Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...requestOptions,
  });

  if (!response.ok) {
    let detail = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      detail = data.detail || detail;
    } catch {
      // noop
    }
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  async loginWithGoogle(credential) {
    const res = await fetchJson('/api/auth/google', {
      method: 'POST',
      authMode: 'none',
      body: JSON.stringify({ credential }),
    });
    if (res?.tokens) setAuthTokens(res.tokens);
    return res;
  },

  async me() {
    return fetchJson('/api/auth/me');
  },

  async refresh(refreshToken = getRefreshToken()) {
    if (!refreshToken) {
      throw new Error('Missing refresh token');
    }
    const res = await fetchJson('/api/auth/refresh', {
      method: 'POST',
      authMode: 'none',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (res?.tokens) setAuthTokens(res.tokens);
    return res;
  },

  async logout() {
    const refreshToken = getRefreshToken();
    try {
      return await fetchJson('/api/auth/logout', {
        method: 'POST',
        authMode: 'none',
        body: JSON.stringify({
          refresh_token: refreshToken || null,
        }),
      });
    } finally {
      clearAuthTokens();
    }
  },
};

export const adminAuthAPI = {
  async login(payload) {
    const res = await fetchJson('/api/admin/auth/login', {
      method: 'POST',
      authMode: 'none',
      body: JSON.stringify(payload),
    });
    if (res?.tokens) setAdminAuthTokens(res.tokens);
    return res;
  },

  async me() {
    return fetchJson('/api/admin/auth/me', {
      authMode: 'admin',
    });
  },

  async logout() {
    try {
      return await fetchJson('/api/admin/auth/logout', {
        method: 'POST',
        authMode: 'admin',
      });
    } finally {
      clearAdminAuthTokens();
    }
  },
};

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

  async launchFullTest(packId, mode = 'practice', userId = 'demo-user', selectedParts = []) {
    return fetchJson(`/api/toeic/full-tests/${packId}/launch`, {
      method: 'POST',
      body: JSON.stringify({ mode, user_id: userId, selected_parts: selectedParts }),
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

export const adminAPI = {
  async getOverview() {
    return fetchJson('/api/admin/toeic/overview', {
      authMode: 'admin',
    });
  },

  async getFullTests() {
    return fetchJson('/api/admin/toeic/full-tests', {
      authMode: 'admin',
    });
  },

  async getFullTestDetail(packId) {
    return fetchJson(`/api/admin/toeic/full-tests/${packId}`, {
      authMode: 'admin',
    });
  },

  async saveFullTest(payload) {
    return fetchJson('/api/admin/toeic/full-tests', {
      method: 'POST',
      authMode: 'admin',
      body: JSON.stringify(payload),
    });
  },

  async deleteFullTest(packId) {
    return fetchJson(`/api/admin/toeic/full-tests/${packId}`, {
      method: 'DELETE',
      authMode: 'admin',
    });
  },

  async importJson(payload) {
    return fetchJson('/api/admin/toeic/import-json', {
      method: 'POST',
      authMode: 'admin',
      body: JSON.stringify(payload),
    });
  },

  async importFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJson('/api/admin/toeic/import-file', {
      method: 'POST',
      authMode: 'admin',
      body: formData,
    });
  },

  async exportBundle() {
    return fetchJson('/api/admin/toeic/export', {
      authMode: 'admin',
    });
  },
};
