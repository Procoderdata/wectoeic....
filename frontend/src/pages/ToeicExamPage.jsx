import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toeicExamAPI } from '../services/api';
import { useProgress } from '../hooks/useProgress';

const PRESET_MAP = {
  listening: ['listening'],
  reading: ['reading'],
  speaking: ['speaking'],
  writing: ['writing'],
  lr: ['listening', 'reading'],
  lrs: ['listening', 'reading', 'speaking'],
  lrsw: ['listening', 'reading', 'speaking', 'writing'],
};

function normalizeSkills(skills, availableSkills) {
  const allowed = new Set(availableSkills.map((item) => item.key));
  const next = [];
  skills.forEach((skill) => {
    if (allowed.has(skill) && !next.includes(skill)) next.push(skill);
  });
  return next;
}

function getPresetKeyFromSkills(skills) {
  const normalized = [...skills].sort().join('|');
  const entries = Object.entries(PRESET_MAP);
  for (const [key, presetSkills] of entries) {
    if ([...presetSkills].sort().join('|') === normalized) return key;
  }
  return 'custom';
}

function speakPrompt(text) {
  if (!window.speechSynthesis || !text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function getAnswerStorageKey(sessionId) {
  return `toeic_exam_answers:${sessionId}`;
}

function loadSavedAnswers(sessionId) {
  if (!sessionId || typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(getAnswerStorageKey(sessionId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
    return {};
  } catch {
    return {};
  }
}

function clearSavedAnswers(sessionId) {
  if (!sessionId || typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(getAnswerStorageKey(sessionId));
  } catch {
    // ignore local storage errors
  }
}

export default function ToeicExamPage() {
  const navigate = useNavigate();
  const { preset = '', sessionId = '' } = useParams();
  const { recordActivity, refreshProgress } = useProgress();
  const autoSubmittedRef = useRef(false);
  const [config, setConfig] = useState({ skills: [], themes: [], default_theme: 'corporate' });
  const [selectedSkills, setSelectedSkills] = useState(['listening', 'reading']);
  const [selectedTheme, setSelectedTheme] = useState('corporate');
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!preset && !sessionId) {
      navigate('/toeic/exam/lr', { replace: true });
    }
  }, [navigate, preset, sessionId]);

  useEffect(() => {
    toeicExamAPI.getConfig()
      .then((data) => {
        setConfig(data);
        setSelectedTheme(data.default_theme || 'corporate');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!config.skills.length) return;
    const presetSkills = PRESET_MAP[preset] || PRESET_MAP.lr;
    const normalized = normalizeSkills(presetSkills, config.skills);
    if (normalized.length) setSelectedSkills(normalized);
  }, [config.skills, preset]);

  useEffect(() => {
    if (!sessionId) {
      autoSubmittedRef.current = false;
      setSession(null);
      setResult(null);
      setAnswers({});
      setCurrentSectionIndex(0);
      setCurrentQuestionIndex(0);
      setRemainingSeconds(0);
      return;
    }
    toeicExamAPI.getSession(sessionId)
      .then((data) => {
        autoSubmittedRef.current = false;
        setSession(data);
        if (data.skills?.length) {
          setSelectedSkills(data.skills);
        }
        setCurrentSectionIndex(0);
        setCurrentQuestionIndex(0);
        if (data.submitted && data.result) {
          setResult(data.result);
          setAnswers({});
          setRemainingSeconds(0);
          clearSavedAnswers(sessionId);
        } else {
          setResult(null);
          setAnswers(loadSavedAnswers(sessionId));
          setRemainingSeconds((data.recommended_minutes || 20) * 60);
        }
        setError('');
      })
      .catch((err) => setError(err.message));
  }, [sessionId]);

  useEffect(() => {
    if (!session || result || !remainingSeconds) return undefined;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [session, result, remainingSeconds]);

  const currentSection = session?.sections?.[currentSectionIndex] || null;
  const currentQuestion = currentSection?.questions?.[currentQuestionIndex] || null;

  const answeredCount = useMemo(() => {
    if (!session) return 0;
    let count = 0;
    session.sections.forEach((section) => {
      section.questions.forEach((question) => {
        const key = `${section.skill_key}|${question.id}`;
        const value = answers[key];
        if (value !== undefined && value !== null && String(value).trim() !== '') count += 1;
      });
    });
    return count;
  }, [answers, session]);

  const totalQuestionCount = useMemo(() => {
    if (!session) return 0;
    return session.sections.reduce((sum, section) => sum + section.questions.length, 0);
  }, [session]);

  const toggleSkill = (skillKey) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skillKey)) return prev.filter((item) => item !== skillKey);
      return [...prev, skillKey];
    });
  };

  const setPresetSkills = (skills) => {
    const normalized = normalizeSkills(skills, config.skills);
    if (!normalized.length) return;
    setSelectedSkills(normalized);
    const presetKey = getPresetKeyFromSkills(normalized);
    navigate(`/toeic/exam/${presetKey}`);
  };

  const startExam = async () => {
    if (!selectedSkills.length) return;
    try {
      const data = await toeicExamAPI.createSession(selectedSkills, selectedTheme);
      autoSubmittedRef.current = false;
      setSession(data);
      setAnswers({});
      setCurrentSectionIndex(0);
      setCurrentQuestionIndex(0);
      setRemainingSeconds((data.recommended_minutes || 20) * 60);
      setResult(null);
      setError('');
      recordActivity('quiz', { title: `Start TOEIC 4 skills • ${data.theme_label}`, xp: 6 });
      const presetKey = getPresetKeyFromSkills(selectedSkills);
      navigate(`/toeic/exam/${presetKey}/session/${data.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnswerChange = (sectionKey, questionId, value) => {
    const key = `${sectionKey}|${questionId}`;
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const goToQuestion = (sectionIndex, questionIndex) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentQuestionIndex(questionIndex);
  };

  const submitExam = useCallback(async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      const payload = [];
      session.sections.forEach((section) => {
        section.questions.forEach((question) => {
          const key = `${section.skill_key}|${question.id}`;
          payload.push({
            section_key: section.skill_key,
            question_id: question.id,
            answer: answers[key] ?? '',
          });
        });
      });

      const submitResult = await toeicExamAPI.submitSession(session.id, payload);
      setResult(submitResult);
      setRemainingSeconds(0);
      clearSavedAnswers(session.id);
      setError('');
      await refreshProgress();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [answers, refreshProgress, session, submitting]);

  useEffect(() => {
    if (!sessionId || !session || result || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(getAnswerStorageKey(sessionId), JSON.stringify(answers));
    } catch {
      // ignore local storage errors
    }
  }, [answers, result, session, sessionId]);

  useEffect(() => {
    if (!session || result || submitting || remainingSeconds > 0) return;
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    submitExam();
  }, [remainingSeconds, result, session, submitExam, submitting]);

  const nextQuestion = () => {
    if (!session || !currentSection) return;
    const isLastQuestionInSection = currentQuestionIndex >= currentSection.questions.length - 1;
    if (!isLastQuestionInSection) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }
    if (currentSectionIndex < session.sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const previousQuestion = () => {
    if (!session || !currentSection) return;
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      return;
    }
    if (currentSectionIndex > 0) {
      const prevSectionIndex = currentSectionIndex - 1;
      const prevSection = session.sections[prevSectionIndex];
      setCurrentSectionIndex(prevSectionIndex);
      setCurrentQuestionIndex(Math.max(prevSection.questions.length - 1, 0));
    }
  };

  if (loading) {
    return <div className="state-card">Dang tai phong thi TOEIC...</div>;
  }

  if (error && !session) {
    return <div className="state-card error-state">{error}</div>;
  }

  if (!session) {
    return (
      <div className="toeic-exam-page">
        <section className="toeic-exam-setup">
          <div className="toeic-exam-header-row">
            <button className="ghost-btn" onClick={() => navigate('/toeic')}>← Quay lại TOEIC</button>
            <span className="pill exam-pill">Official-style TOEIC 4 skills</span>
          </div>

          <h2>Phòng Thi TOEIC 4 Kỹ Năng</h2>
          <p>Chọn 1-4 kỹ năng hoặc gộp 2/3/4 kỹ năng rồi bắt đầu bài làm. Theme bài tập được áp dụng xuyên suốt đề.</p>

          <div className="toeic-exam-presets">
            <button className="topic-chip" onClick={() => setPresetSkills(['listening'])}>1 kỹ năng: Listening</button>
            <button className="topic-chip" onClick={() => setPresetSkills(['reading'])}>1 kỹ năng: Reading</button>
            <button className="topic-chip" onClick={() => setPresetSkills(['listening', 'reading'])}>2 kỹ năng: L + R</button>
            <button className="topic-chip" onClick={() => setPresetSkills(['listening', 'reading', 'speaking'])}>3 kỹ năng: L + R + S</button>
            <button className="topic-chip" onClick={() => setPresetSkills(['listening', 'reading', 'speaking', 'writing'])}>4 kỹ năng Full</button>
          </div>

          <div className="toeic-skill-grid">
            {config.skills.map((skill) => (
              <button
                key={skill.key}
                className={`toeic-skill-card ${selectedSkills.includes(skill.key) ? 'active' : ''}`}
                onClick={() => toggleSkill(skill.key)}
              >
                <div className="card-title-row align-start">
                  <div>
                    <p className="section-kicker">{skill.official_label}</p>
                    <h4>{skill.label}</h4>
                  </div>
                  <span className="pill pastel-blue">{selectedSkills.includes(skill.key) ? 'Đã chọn' : 'Bỏ chọn'}</span>
                </div>
                <p>{skill.description}</p>
                <p className="subtle">{skill.question_count} câu chuẩn • {skill.recommended_minutes} phút chuẩn</p>
              </button>
            ))}
          </div>

          <div className="toeic-theme-row">
            <p className="section-kicker">Theme bài tập</p>
            <div className="toeic-theme-chips">
              {config.themes.map((theme) => (
                <button
                  key={theme.key}
                  className={`topic-chip ${selectedTheme === theme.key ? 'active' : ''}`}
                  onClick={() => setSelectedTheme(theme.key)}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          <div className="toeic-exam-cta">
            <span className="subtle">Đã chọn {selectedSkills.length} kỹ năng</span>
            <button className="primary-btn" onClick={startExam} disabled={!selectedSkills.length}>Bắt đầu bài làm</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="toeic-exam-page">
      <section className="toeic-exam-shell">
        <div className="toeic-exam-topbar">
          <div>
            <p className="section-kicker">Theme: {session.theme_label}</p>
            <h3>TOEIC Official Practice Room</h3>
          </div>
          <div className="toeic-exam-metrics">
            <span className="pill exam-pill">{answeredCount}/{totalQuestionCount} answered</span>
            <span className="pill exam-pill">{formatDuration(remainingSeconds)}</span>
          </div>
        </div>

        <div className="toeic-exam-sections">
          {session.sections.map((section, sectionIndex) => (
            <button
              key={section.skill_key}
              className={`toeic-exam-section-btn ${sectionIndex === currentSectionIndex ? 'active' : ''}`}
              onClick={() => goToQuestion(sectionIndex, 0)}
            >
              {section.skill_label}
            </button>
          ))}
        </div>

        <div className="toeic-exam-layout">
          <aside className="toeic-exam-nav-card">
            <p className="section-kicker">Question Map</p>
            {session.sections.map((section, sectionIndex) => (
              <div key={section.skill_key} className="toeic-exam-nav-section">
                <strong>{section.skill_label}</strong>
                <div className="toeic-exam-question-grid">
                  {section.questions.map((question, questionIndex) => {
                    const key = `${section.skill_key}|${question.id}`;
                    const answered = answers[key] !== undefined && String(answers[key]).trim() !== '';
                    return (
                      <button
                        key={question.id}
                        className={`jump-pill ${answered ? 'answered' : ''}`}
                        onClick={() => goToQuestion(sectionIndex, questionIndex)}
                      >
                        {questionIndex + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>

          <article className="toeic-exam-question-card">
            {currentQuestion ? (
              <>
                <div className="card-title-row">
                  <p className="meta-line">{currentSection?.official_label} • {currentQuestion.task}</p>
                  <span className="pill pastel-green">Q{currentQuestionIndex + 1}</span>
                </div>

                {currentQuestion.audio_script ? (
                  <button className="secondary-btn" onClick={() => speakPrompt(currentQuestion.audio_script)}>
                    🔊 Nghe audio mẫu
                  </button>
                ) : null}

                <h4>{currentQuestion.prompt}</h4>

                {currentQuestion.kind === 'mcq' ? (
                  <div className="stack-list">
                    {currentQuestion.options.map((option, optionIndex) => {
                      const key = `${currentSection.skill_key}|${currentQuestion.id}`;
                      const selected = Number(answers[key]) === optionIndex;
                      return (
                        <button
                          key={option}
                          className={`option-card option-card-rich ${selected ? 'selected' : ''}`}
                          onClick={() => handleAnswerChange(currentSection.skill_key, currentQuestion.id, optionIndex)}
                        >
                          <span className="option-index">{['A', 'B', 'C', 'D'][optionIndex]}</span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="stack-list">
                    <p className="subtle">Viết hoặc nhập câu trả lời cho phần {currentQuestion.task}. Hệ thống demo sẽ chấm theo độ dài + từ khóa.</p>
                    <textarea
                      className="toeic-open-answer"
                      value={answers[`${currentSection.skill_key}|${currentQuestion.id}`] || ''}
                      onChange={(event) => handleAnswerChange(currentSection.skill_key, currentQuestion.id, event.target.value)}
                      placeholder="Nhập câu trả lời ở đây..."
                    />
                  </div>
                )}

                <div className="toeic-exam-actions">
                  <button className="ghost-btn" onClick={previousQuestion}>Câu trước</button>
                  <button className="secondary-btn" onClick={nextQuestion}>Câu tiếp</button>
                  <button className="primary-btn" onClick={submitExam} disabled={submitting}>
                    {submitting ? 'Đang nộp...' : 'Nộp bài'}
                  </button>
                </div>
              </>
            ) : null}
          </article>
        </div>

        {result ? (
          <section className="toeic-exam-result">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Kết quả</p>
                <h4>{result.correct_count}/{result.total_questions} • {result.accuracy}%</h4>
              </div>
              <span className="pill pastel-pink">+{result.awarded_xp} XP</span>
            </div>
            <div className="grid-4">
              {result.sections.map((section) => (
                <article key={section.skill_key} className="soft-card">
                  <p className="section-kicker">{section.skill_label}</p>
                  <h4>{section.correct}/{section.total}</h4>
                  <p>{section.accuracy}% accuracy</p>
                </article>
              ))}
            </div>
            <div className="hero-actions">
              <button className="ghost-btn" onClick={() => navigate('/toeic')}>Về TOEIC</button>
              <button className="primary-btn" onClick={() => navigate(`/toeic/exam/${getPresetKeyFromSkills(selectedSkills)}`)}>
                Thi lại với combo khác
              </button>
            </div>
          </section>
        ) : null}

        {error ? <div className="feedback-card">{error}</div> : null}
      </section>
    </div>
  );
}
