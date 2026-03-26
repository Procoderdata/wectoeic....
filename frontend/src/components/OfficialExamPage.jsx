import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { officialExamAPI } from '../services/api';

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function skillLabel(skill) {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

export default function OfficialExamPage({ examType, skill }) {
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    officialExamAPI.getExam(examType, skill)
      .then((data) => {
        setExam(data);
        setRemainingSeconds((data.duration_minutes || 1) * 60);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [examType, skill]);

  useEffect(() => {
    if (!exam || result || !remainingSeconds) return undefined;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [exam, result, remainingSeconds]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => String(value ?? '').trim() !== '').length,
    [answers]
  );

  const submitExam = async () => {
    if (!exam || submitting) return;
    try {
      setSubmitting(true);
      const data = await officialExamAPI.submitExam(examType, skill, answers);
      setResult(data);
      setRemainingSeconds(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="state-card">Đang tải giao diện thi {examType.toUpperCase()}...</div>;
  }

  if (error) {
    return <div className="state-card error-state">{error}</div>;
  }

  return (
    <div className="official-exam-shell">
      <section className="official-exam-header">
        <div>
          <p className="section-kicker">{examType.toUpperCase()} Official Layout</p>
          <h2>{exam?.title}</h2>
          <p className="subtle">Modern exam UI với timer, progress, review nhanh và chấm điểm backend.</p>
        </div>
        <div className="official-badge-stack">
          <span className="pill pastel-blue">Skill: {skillLabel(skill)}</span>
          <span className="pill pastel-pink">Answered {answeredCount}/{exam?.questions?.length || 0}</span>
          <span className="pill pastel-green">⏱ {formatTimer(remainingSeconds)}</span>
        </div>
      </section>

      <section className="official-layout-grid">
        <aside className="soft-card official-nav-card">
          <h4>Skills</h4>
          <div className="stack-list">
            {['listening', 'reading', 'speaking', 'writing'].map((item) => (
              <Link
                key={item}
                className={`lesson-item ${item === skill ? 'active' : ''}`}
                to={`/${examType}/official/${item}`}
              >
                {skillLabel(item)}
              </Link>
            ))}
          </div>
          {result ? (
            <div className="official-score-card">
              <p className="meta-line">Scaled score</p>
              <h3>{result.scaled_score}</h3>
              <p className="subtle">Accuracy: {result.accuracy}%</p>
            </div>
          ) : null}
        </aside>

        <div className="soft-card official-question-card">
          <div className="stack-list">
            {exam?.questions?.map((question, index) => (
              <article key={question.id} className="official-question-item">
                <p className="meta-line">Question {index + 1}</p>
                <h4>{question.prompt}</h4>

                {question.type === 'mcq' ? (
                  <div className="grid-2">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={option}
                        className={`option-card ${String(answers[question.id]) === String(optionIndex) ? 'selected' : ''}`}
                        onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="stack-list">
                    <textarea
                      rows={5}
                      className="official-textarea"
                      value={answers[question.id] || ''}
                      onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))}
                      placeholder={`Trả lời tối thiểu ${question.min_words || 50} từ...`}
                    />
                    <p className="subtle">Yêu cầu tối thiểu: {question.min_words || 50} từ.</p>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="hero-actions">
            <button className="primary-btn" onClick={submitExam} disabled={submitting || !!result}>
              {submitting ? 'Đang nộp...' : result ? 'Đã nộp bài' : 'Nộp bài & chấm điểm'}
            </button>
          </div>

          {result ? (
            <div className="official-result-block">
              <h3>Kết quả chính thức ({skillLabel(skill)})</h3>
              <p>Scaled score: <strong>{result.scaled_score}</strong> • Accuracy: <strong>{result.accuracy}%</strong></p>
              <div className="stack-list">
                {result.breakdown.map((item) => (
                  <div key={item.id} className="saved-row">
                    <div>
                      <strong>{item.id}</strong>
                      <p className="subtle">
                        {item.type === 'mcq'
                          ? item.correct ? 'Correct answer' : 'Incorrect answer'
                          : `Text score ratio: ${item.score_ratio}`}
                      </p>
                    </div>
                    <span className="pill pastel-blue">{item.type}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
