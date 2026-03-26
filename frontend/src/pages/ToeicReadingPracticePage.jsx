import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toeicReadingAPI } from '../services/api';
import { useProgress } from '../hooks/useProgress';

function formatDuration(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function choiceLetter(index) {
  return ['A', 'B', 'C', 'D'][index] || String(index + 1);
}

export default function ToeicReadingPracticePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { recordActivity } = useProgress();
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [noteDraft, setNoteDraft] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingQuestionId, setSubmittingQuestionId] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassageHelper, setShowPassageHelper] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showNotePanel, setShowNotePanel] = useState(false);
  const [showQuestionMap, setShowQuestionMap] = useState(false);

  const flattenedQuestions = useMemo(() => {
    if (!session?.passages) return [];
    return session.passages.flatMap((passage) =>
      passage.questions.map((question) => ({
        ...question,
        passage_id: passage.id,
        passage_title: passage.title,
        passage_text: passage.passage_text,
        paraphrase_vi: passage.paraphrase_vi,
        vocab_focus: passage.vocab_focus || [],
        range_label: passage.range_label,
        part: passage.part,
      }))
    );
  }, [session]);

  const currentQuestion = flattenedQuestions[currentIndex] || null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const selectedIndex = typeof currentAnswer?.selected_index === 'number' ? currentAnswer.selected_index : null;

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((item) => item?.correct).length;

  useEffect(() => {
    toeicReadingAPI.getSession()
      .then((data) => {
        setSession(data);
        setRemainingSeconds((data.duration_minutes || 35) * 60);
        setNotes(data.notes || {});
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!session || !flattenedQuestions.length) return;
    const focusQuestionId = searchParams.get('focus');
    if (!focusQuestionId) return;
    const focusIndex = flattenedQuestions.findIndex((question) => question.id === focusQuestionId);
    if (focusIndex >= 0) {
      setCurrentIndex(focusIndex);
    }
  }, [flattenedQuestions, searchParams, session]);

  useEffect(() => {
    if (!session || remainingSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRemainingSeconds((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds, session]);

  useEffect(() => {
    if (!currentQuestion) return;
    setNoteDraft(notes[currentQuestion.id] || '');
    setFeedbackMessage('');
    setShowAnalysis(false);
  }, [currentQuestion, notes]);

  const goToQuestion = (index) => {
    if (index < 0 || index >= flattenedQuestions.length) return;
    setCurrentIndex(index);
  };

  const answerQuestion = async (answerIndex) => {
    if (!currentQuestion || submittingQuestionId) return;
    setSubmittingQuestionId(currentQuestion.id);
    setFeedbackMessage('');
    try {
      const result = await toeicReadingAPI.submitAnswer(currentQuestion.id, answerIndex);
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: result,
      }));
      setNotes((prev) => ({
        ...prev,
        [currentQuestion.id]: result.note || prev[currentQuestion.id] || '',
      }));
      setFeedbackMessage('Đã chấm câu này. Bấm "Giải thích" để xem phân tích.');
      setError('');
      await recordActivity('quiz', {
        title: `Reading Q${currentQuestion.number}`,
        xp: result.correct ? 18 : 10,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingQuestionId('');
    }
  };

  const saveNote = async () => {
    if (!currentQuestion || savingNote) return;
    setSavingNote(true);
    setFeedbackMessage('');
    try {
      const result = await toeicReadingAPI.saveNote(currentQuestion.id, noteDraft);
      setNotes((prev) => ({
        ...prev,
        [currentQuestion.id]: result.content || '',
      }));
      setFeedbackMessage('Đã lưu ghi chú cá nhân cho câu này.');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNote(false);
    }
  };

  const addCurrentToFlashcards = async () => {
    if (!currentQuestion || savingCard) return;
    setSavingCard(true);
    setFeedbackMessage('');
    try {
      const result = await toeicReadingAPI.createFlashcards([currentQuestion.id]);
      if (result.created > 0) {
        setFeedbackMessage('Đã thêm câu này vào flashcard.');
      } else {
        setFeedbackMessage('Câu này đã có trong flashcard.');
      }
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCard(false);
    }
  };

  if (loading) {
    return <div className="state-card">Đang tải phòng Reading...</div>;
  }

  if (!session || !currentQuestion) {
    return <div className="state-card error-state">{error || 'Không có dữ liệu reading.'}</div>;
  }

  return (
    <div className="toeic-reading-page">
      <section className="toeic-reading-topbar">
        <div className="toeic-reading-topbar-left">
          <button className="ghost-btn" onClick={() => navigate('/toeic')}>← Exit</button>
          <div>
            <p className="section-kicker">Reading Practice</p>
            <h3>{currentQuestion.range_label} • {session.title}</h3>
          </div>
        </div>

        <div className="toeic-reading-metrics">
          <span className="pill exam-pill">{answeredCount}/{session.total_questions} answered</span>
          <span className="pill exam-pill">{correctCount} correct</span>
          <span className={`pill exam-pill ${remainingSeconds < 300 ? 'danger-timer' : ''}`}>
            {formatDuration(remainingSeconds)}
          </span>
          <button className="secondary-btn" onClick={() => navigate('/toeic/review')}>
            Review & Improve
          </button>
          <button className="secondary-btn" onClick={() => navigate('/toeic/flashcards')}>
            Flashcards
          </button>
        </div>
      </section>

      <section className="toeic-reading-togglebar">
        <button
          className={`toggle-chip ${showPassageHelper ? 'active' : ''}`}
          onClick={() => setShowPassageHelper((prev) => !prev)}
        >
          {showPassageHelper ? 'Ẩn dịch & từ vựng' : 'Hiện dịch & từ vựng'}
        </button>
        <button
          className={`toggle-chip ${showAnalysis ? 'active' : ''}`}
          onClick={() => setShowAnalysis((prev) => !prev)}
        >
          {showAnalysis ? 'Ẩn giải thích' : 'Giải thích'}
        </button>
        <button
          className={`toggle-chip ${showNotePanel ? 'active' : ''}`}
          onClick={() => setShowNotePanel((prev) => !prev)}
        >
          {showNotePanel ? 'Ẩn note cá nhân' : 'Note cá nhân'}
        </button>
        <button
          className={`toggle-chip ${showQuestionMap ? 'active' : ''}`}
          onClick={() => setShowQuestionMap((prev) => !prev)}
        >
          {showQuestionMap ? 'Ẩn bản đồ câu' : 'Bản đồ câu'}
        </button>
      </section>

      <section className="toeic-reading-layout">
        <article className="toeic-reading-passage-panel">
          <div className="card-title-row align-start">
            <div>
              <p className="meta-line">{currentQuestion.part} • {currentQuestion.range_label}</p>
              <h4>{currentQuestion.passage_title}</h4>
            </div>
            <span className="pill pastel-blue">Q{currentQuestion.number}</span>
          </div>

          <div className="toeic-reading-passage-text">
            {String(currentQuestion.passage_text)
              .split('\n\n')
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>

          {showPassageHelper ? (
            <div className="toeic-reading-helper-grid">
              <div className="toeic-reading-helper-card translation">
                <p className="section-kicker">VN Dịch nghĩa passage</p>
                <p>{currentQuestion.paraphrase_vi}</p>
              </div>
              <div className="toeic-reading-helper-card vocab">
                <p className="section-kicker">Từ vựng chung</p>
                <div className="toeic-reading-vocab-list">
                  {currentQuestion.vocab_focus.map((item) => (
                    <span key={item.word} className="sentence-chip">{item.word}: {item.meaning_vi}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="toeic-reading-inline-hint">Đang ẩn phần dịch và từ vựng để tập trung làm bài.</div>
          )}
        </article>

        <article className="toeic-reading-question-panel">
          <div className="toeic-reading-question-head">
            <h4>{currentQuestion.number}. {currentQuestion.prompt}</h4>
          </div>

          <div className="stack-list">
            {currentQuestion.options.map((option, optionIndex) => {
              const isCorrect = currentAnswer && optionIndex === currentAnswer.correct_index;
              const isWrongSelected = currentAnswer && selectedIndex === optionIndex && !currentAnswer.correct;
              const isSelected = selectedIndex === optionIndex;
              return (
                <button
                  key={`${currentQuestion.id}-${option}`}
                  className={`option-card option-card-rich ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrongSelected ? 'wrong' : ''}`}
                  onClick={() => answerQuestion(optionIndex)}
                  disabled={submittingQuestionId === currentQuestion.id}
                >
                  <span className="option-index">({choiceLetter(optionIndex)})</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {showAnalysis ? (
            currentAnswer ? (
              <div className="toeic-reading-analysis">
                <article className="toeic-reading-analysis-card">
                  <p className="section-kicker">VN Dịch nghĩa (Câu {currentQuestion.number})</p>
                  <ul className="toeic-reading-option-vi-list">
                    {currentQuestion.options_vi.map((optionVi, optionIndex) => (
                      <li key={`${currentQuestion.id}-vi-${optionVi}`}>
                        <strong>{choiceLetter(optionIndex)}.</strong> {optionVi}
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="toeic-reading-analysis-card detail">
                  <p className="section-kicker">Giải thích chi tiết</p>
                  <p>{currentAnswer.explanation_vi}</p>
                </article>

                <article className="toeic-reading-analysis-card trap">
                  <p className="section-kicker">Lưu ý bẫy đề</p>
                  <p>{currentAnswer.trap_note}</p>
                </article>
              </div>
            ) : (
              <div className="toeic-reading-inline-hint">Chọn đáp án trước để mở phần giải thích.</div>
            )
          ) : null}

          {showNotePanel ? (
            <article className="toeic-reading-note-panel">
              <div className="card-title-row align-start">
                <div>
                  <p className="section-kicker">Ghi chú cá nhân</p>
                  <h4>Note cho câu {currentQuestion.number}</h4>
                </div>
              </div>
              <textarea
                className="toeic-reading-note-input"
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Gõ mẹo nhớ, paraphrase hoặc lỗi tư duy của bạn..."
              />
              <div className="hero-actions">
                <button className="primary-btn" onClick={saveNote} disabled={savingNote}>
                  {savingNote ? 'Đang lưu...' : 'Lưu ghi chú'}
                </button>
                <button className="secondary-btn" onClick={addCurrentToFlashcards} disabled={savingCard}>
                  {savingCard ? 'Đang thêm...' : 'Thêm vào flashcard'}
                </button>
              </div>
            </article>
          ) : null}

          {feedbackMessage ? <p className="subtle">{feedbackMessage}</p> : null}
        </article>
      </section>

      <section className="toeic-reading-footer">
        {showQuestionMap ? (
          <div className="toeic-reading-question-map">
            {session.passages.map((passage) => (
              <div key={passage.id} className="toeic-reading-map-group">
                <strong>{passage.range_label}</strong>
                <div className="question-jump-strip">
                  {passage.questions.map((question) => {
                    const globalIndex = flattenedQuestions.findIndex((item) => item.id === question.id);
                    const answerResult = answers[question.id];
                    const isCurrent = globalIndex === currentIndex;
                    const isAnswered = Boolean(answerResult);
                    return (
                      <button
                        key={question.id}
                        className={`jump-pill ${isAnswered ? 'answered' : ''} ${answerResult?.correct === false ? 'wrong' : ''} ${isCurrent ? 'active' : ''}`}
                        onClick={() => goToQuestion(globalIndex)}
                      >
                        {question.number}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="toeic-reading-inline-hint">Bản đồ câu đang ẩn để giảm rối màn hình.</div>
        )}

        <div className="hero-actions">
          <button className="ghost-btn" onClick={() => goToQuestion(currentIndex - 1)} disabled={currentIndex === 0}>
            Câu trước
          </button>
          <button
            className="primary-btn"
            onClick={() => goToQuestion(currentIndex + 1)}
            disabled={currentIndex >= flattenedQuestions.length - 1}
          >
            Câu tiếp
          </button>
        </div>
      </section>

      {error ? <div className="feedback-card">{error}</div> : null}
    </div>
  );
}
