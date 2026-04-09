import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toeicAPI } from '../services/api';
import { useProgress } from '../hooks/useProgress';

const ANSWER_PREFIX = 'toeic_official_answers:';
const NOTE_PREFIX = 'toeic_official_notes:';

const PART_DIRECTIONS = {
  1: 'Select the one statement that best describes what you see in the picture.',
  2: 'Select the best response to each question.',
  3: 'Select the best response to each question. Questions are based on the conversation and any graphic provided.',
  4: 'Select the best response to each question. Questions are based on the talk and any graphic provided.',
  5: 'Select the best answer to complete the sentence.',
  6: 'Read the text and select the best answer for each blank.',
  7: 'Read the following text or set of texts and answer the questions.',
};

function loadLocalState(prefix, sessionId) {
  if (!sessionId || typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(`${prefix}${sessionId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveLocalState(prefix, sessionId, value) {
  if (!sessionId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${prefix}${sessionId}`, JSON.stringify(value));
  } catch {
    // ignore local storage write failures
  }
}

function clearLocalState(prefix, sessionId) {
  if (!sessionId || typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(`${prefix}${sessionId}`);
  } catch {
    // ignore local storage remove failures
  }
}

function buildFlatGroups(session) {
  const groups = [];
  (session?.sections || []).forEach((section, sectionIndex) => {
    (section.parts || []).forEach((part, partIndex) => {
      (part.groups || []).forEach((group, groupIndex) => {
        groups.push({
          sectionIndex,
          partIndex,
          groupIndex,
          section,
          part,
          group,
        });
      });
    });
  });
  return groups;
}

function buildFlatQuestions(flatGroups) {
  const questions = [];
  flatGroups.forEach((entry, groupIndex) => {
    (entry.group.questions || []).forEach((question) => {
      questions.push({
        question,
        groupIndex,
      });
    });
  });
  return questions;
}

function formatQuestionPosition(start, count, total) {
  if (!total) return '0 of 0';
  if (count <= 1) return `${start} of ${total}`;
  const end = Math.min(start + count - 1, total);
  return `${start}-${end} of ${total}`;
}

function getQuestionCountLabel(group) {
  const count = Array.isArray(group?.questions) ? group.questions.length : 0;
  if (count <= 1) return '';
  return `${count} questions`;
}

function getAnsweredCount(session, answers) {
  const answerMap = answers || {};
  let total = 0;
  buildFlatGroups(session).forEach((entry) => {
    (entry.group.questions || []).forEach((question) => {
      const selected = String(answerMap[question.id] || '').trim();
      if (selected) total += 1;
    });
  });
  return total;
}

function renderPassageCard(passage) {
  return (
    <article key={passage.id} className="toeic-official-passage-card">
      <div className="toeic-official-passage-head">
        <strong>{passage.label}</strong>
        {passage.title ? <span>{passage.title}</span> : null}
      </div>
      <pre>{passage.content}</pre>
    </article>
  );
}

export default function ToeicOfficialTestPage() {
  const navigate = useNavigate();
  const { sessionId = '' } = useParams();
  const { refreshProgress } = useProgress();
  const audioRef = useRef(null);

  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [audioRate, setAudioRate] = useState('1');
  const [audioVolume, setAudioVolume] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteEditor, setNoteEditor] = useState(null);
  const [isQuestionMapOpen, setIsQuestionMapOpen] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      navigate('/toeic/tests', { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);
    toeicAPI.getFullTestSession(sessionId)
      .then((data) => {
        if (cancelled) return;
        const resumeState = data?.submitted ? null : (data?.resume_state || null);
        const localAnswerState = data?.submitted ? {} : loadLocalState(ANSWER_PREFIX, sessionId);
        const localNoteState = loadLocalState(NOTE_PREFIX, sessionId);
        const remoteAnswerState =
          resumeState && resumeState.answers && typeof resumeState.answers === 'object'
            ? resumeState.answers
            : {};
        const remoteNoteState =
          resumeState && resumeState.notes && typeof resumeState.notes === 'object'
            ? resumeState.notes
            : {};
        const totalGroups = buildFlatGroups(data).length;
        const resumeGroupIndex = Number(resumeState?.current_group_index);
        const hasLocalAnswers = Object.keys(localAnswerState).length > 0;
        const hasLocalNotes = Object.keys(localNoteState).length > 0;

        setSession(data);
        setAnswers(data?.submitted ? {} : (hasLocalAnswers ? localAnswerState : remoteAnswerState));
        setNotes(hasLocalNotes ? localNoteState : remoteNoteState);
        setCurrentGroupIndex(
          Number.isFinite(resumeGroupIndex)
            ? Math.max(0, Math.min(Math.trunc(resumeGroupIndex), Math.max(totalGroups - 1, 0)))
            : 0
        );
        setIsQuestionMapOpen(false);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, sessionId]);

  useEffect(() => {
    if (!sessionId || !session || session.submitted) return;
    saveLocalState(ANSWER_PREFIX, sessionId, answers);
  }, [answers, session, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    saveLocalState(NOTE_PREFIX, sessionId, notes);
  }, [notes, sessionId]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = Number(audioRate) || 1;
    audioRef.current.volume = Number(audioVolume) || 1;
  }, [audioRate, audioVolume, session, currentGroupIndex]);

  const flatGroups = useMemo(() => buildFlatGroups(session), [session]);
  const flatQuestions = useMemo(() => buildFlatQuestions(flatGroups), [flatGroups]);
  const currentEntry = flatGroups[currentGroupIndex] || null;
  const currentGroup = currentEntry?.group || null;
  const currentPart = currentEntry?.part || null;
  const currentSection = currentEntry?.section || null;
  const totalQuestions = Number(session?.selected_questions || 0) || flatQuestions.length;
  const answeredCount = useMemo(() => getAnsweredCount(session, answers), [answers, session]);
  const currentQuestionCount = Array.isArray(currentGroup?.questions) ? currentGroup.questions.length : 0;
  const currentQuestionStart = useMemo(() => {
    const firstQuestionId = currentGroup?.questions?.[0]?.id;
    if (!firstQuestionId) return Math.max(1, currentGroupIndex + 1);
    const firstQuestionIndex = flatQuestions.findIndex((entry) => entry.question.id === firstQuestionId);
    return firstQuestionIndex >= 0 ? firstQuestionIndex + 1 : Math.max(1, currentGroupIndex + 1);
  }, [currentGroup?.questions, currentGroupIndex, flatQuestions]);
  const currentQuestionPositionLabel = formatQuestionPosition(
    currentQuestionStart,
    Math.max(1, currentQuestionCount),
    totalQuestions
  );
  const currentRangeLabel = currentGroup?.question_range
    ? String(currentGroup.question_range).includes('-')
      ? `Questions ${currentGroup.question_range}`
      : `Question ${currentGroup.question_range}`
    : `${currentQuestionCount > 1 ? 'Questions' : 'Question'} ${currentQuestionStart}`;

  const handleAnswerSelect = (questionId, answerKey) => {
    if (session?.submitted) return;
    setAnswers((current) => ({
      ...current,
      [questionId]: answerKey,
    }));
  };

  const handleExit = () => {
    if (!session?.submitted && answeredCount > 0) {
      const shouldLeave = window.confirm('Bài làm hiện tại chưa nộp. Thoát khỏi phòng thi?');
      if (!shouldLeave) return;
    }
    navigate('/toeic/tests');
  };

  const handleSubmit = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([question_id, answer_key]) => ({
        question_id,
        answer_key: String(answer_key || '').trim(),
      }));
      const result = await toeicAPI.submitFullTestSession(session.id, payload);
      setSession((current) => (current ? { ...current, submitted: true, result } : current));
      clearLocalState(ANSWER_PREFIX, session.id);
      clearLocalState(NOTE_PREFIX, session.id);
      await refreshProgress();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (!session || saving || session.submitted) {
      navigate('/toeic/tests');
      return;
    }

    setSaving(true);
    try {
      const payloadAnswers = Object.entries(answers)
        .map(([question_id, answer_key]) => ({
          question_id,
          answer_key: String(answer_key || '').trim(),
        }))
        .filter((item) => item.question_id);

      await toeicAPI.saveFullTestSession(session.id, {
        user_id: session.user_id || 'demo-user',
        current_group_index: currentGroupIndex,
        answers: payloadAnswers,
        notes,
      });

      saveLocalState(ANSWER_PREFIX, session.id, answers);
      saveLocalState(NOTE_PREFIX, session.id, notes);
      setError('');
      navigate('/toeic/tests');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openNoteEditor = (question) => {
    setNoteEditor({
      questionId: question.id,
      title: `Question ${question.number}`,
      content: notes[question.id] || '',
    });
  };

  const saveNote = () => {
    if (!noteEditor?.questionId) return;
    setNotes((current) => ({
      ...current,
      [noteEditor.questionId]: noteEditor.content || '',
    }));
    setNoteEditor(null);
  };

  if (loading) {
    return <div className="state-card">Đang tải đề TOEIC...</div>;
  }

  if (error && !session) {
    return (
      <div className="state-card error-state">
        <p>{error}</p>
        <button className="ghost-btn" onClick={() => navigate('/toeic/tests')}>Quay lại danh sách đề</button>
      </div>
    );
  }

  if (!session || !currentGroup || !currentPart || !currentSection) {
    return <div className="state-card">Không tìm thấy dữ liệu đề thi.</div>;
  }

  const headerTitle = `${currentSection.title}: ${currentQuestionCount > 1 ? 'Questions' : 'Question'} ${currentQuestionPositionLabel}`;

  return (
    <div className="toeic-official-page">
      <header className="toeic-official-header">
        <button className="toeic-official-exit" onClick={handleExit}>❮ Exit</button>
        <h1>{headerTitle}</h1>
        <div className="toeic-official-header-actions">
          {currentGroup.audio_url ? (
            <label className="toeic-official-volume">
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioVolume}
                onChange={(event) => setAudioVolume(Number(event.target.value))}
              />
            </label>
          ) : null}
          <span className="toeic-official-progress-pill">{answeredCount}/{totalQuestions}</span>
          <button className="toeic-official-save-exit" onClick={handleSaveAndExit} disabled={saving || submitting || session.submitted}>
            {saving ? 'Saving...' : 'Save & Exit'}
          </button>
          <button className="toeic-official-submit" onClick={handleSubmit} disabled={submitting || session.submitted}>
            {session.submitted ? 'Submitted' : submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </header>

      {session.submitted && session.result ? (
        <section className="toeic-official-result">
          <div className="toeic-official-result-head">
            <div>
              <p className="section-kicker">Result</p>
              <h2>{session.result.correct_count}/{session.result.total_questions} • {session.result.accuracy}%</h2>
              <p>Estimated TOEIC score: {session.result.estimated_score}</p>
            </div>
            <span className="toeic-official-xp">+{session.result.awarded_xp} XP</span>
          </div>

          <div className="toeic-official-result-grid">
            {(session.result.sections || []).map((section) => (
              <article key={section.skill} className="toeic-official-result-card">
                <p>{section.title}</p>
                <strong>{section.correct}/{section.total}</strong>
                <span>{section.accuracy}% • score {section.estimated_score}</span>
              </article>
            ))}
          </div>

          <div className="toeic-official-result-grid small">
            {(session.result.parts || []).map((part) => (
              <article key={`${part.skill}-${part.part_number}`} className="toeic-official-result-card">
                <p>{part.part_label}</p>
                <strong>{part.correct}/{part.total}</strong>
                <span>{part.accuracy}%</span>
              </article>
            ))}
          </div>

          <div className="toeic-official-footer">
            <button className="toeic-official-nav" onClick={() => navigate('/toeic/tests')}>Quay lại danh sách đề</button>
          </div>
        </section>
      ) : (
        <>
          <main className="toeic-official-shell">
            <section className="toeic-official-left">
              <div className="toeic-official-copy">
                <h2>{PART_DIRECTIONS[currentPart.part_number] || currentPart.title}</h2>
                <p>{currentPart.title} • {currentSection.title}</p>
              </div>

              {currentGroup.audio_url ? (
                <div className="toeic-official-audio-card">
                  <div className="toeic-official-audio-head">
                    <strong>Nghe lại Audio</strong>
                    <label>
                      <span>Tốc độ</span>
                      <select value={audioRate} onChange={(event) => setAudioRate(event.target.value)}>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                      </select>
                    </label>
                  </div>
                  <audio key={currentGroup.audio_url} ref={audioRef} controls preload="metadata" src={currentGroup.audio_url} />
                </div>
              ) : null}

              {currentGroup.image_url ? (
                <img className="toeic-official-image" src={currentGroup.image_url} alt={currentGroup.title || 'Illustration'} />
              ) : null}

              {currentGroup.graphic_url ? (
                <img className="toeic-official-graphic" src={currentGroup.graphic_url} alt={currentGroup.title || 'Graphic'} />
              ) : null}

              {currentGroup.passages?.length ? (
                <div className="toeic-official-passage-stack">
                  {currentGroup.passages.map((passage) => renderPassageCard(passage))}
                </div>
              ) : null}

              {!currentGroup.image_url && !currentGroup.graphic_url && !currentGroup.passages?.length ? (
                <div className="toeic-official-blank-card">
                  <strong>{currentPart.part_label}</strong>
                  <p>{currentPart.directions || PART_DIRECTIONS[currentPart.part_number] || 'Read the question carefully and select the best answer.'}</p>
                </div>
              ) : null}
            </section>

            <section className="toeic-official-right">
              <div className="toeic-official-question-head">
                <div>
                  <p>Question</p>
                  {currentGroup.question_range ? (
                    <span className="toeic-official-group-pill">
                      {currentRangeLabel}
                      {getQuestionCountLabel(currentGroup) ? ` (${getQuestionCountLabel(currentGroup)})` : ''}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="toeic-official-question-stack">
                {(currentGroup.questions || []).map((question) => (
                  <article key={question.id} className="toeic-official-question-card">
                    <div className="toeic-official-question-top">
                      <h3>{question.number}.</h3>
                      <button className="toeic-official-note-btn" onClick={() => openNoteEditor(question)}>
                        Note
                      </button>
                    </div>

                    {question.prompt ? <p className="toeic-official-question-text">{question.prompt}</p> : null}
                    {question.support_text ? <p className="toeic-official-support-text">{question.support_text}</p> : null}

                    <div className={`toeic-official-choice-list ${question.printed_choices ? 'printed' : 'compact'}`}>
                      {(question.display_choices || []).map((choice) => {
                        const isSelected = String(answers[question.id] || '') === choice.key;
                        return (
                          <button
                            key={`${question.id}-${choice.key}`}
                            className={`toeic-official-choice ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(question.id, choice.key)}
                          >
                            <span className="toeic-official-choice-key">
                              <span className="toeic-official-choice-radio" />
                              ({choice.key})
                            </span>
                            {question.printed_choices ? <span className="toeic-official-choice-text">{choice.text}</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </main>

          <footer className="toeic-official-footer">
            <button
              className="toeic-official-nav"
              onClick={() => setCurrentGroupIndex((index) => Math.max(index - 1, 0))}
              disabled={currentGroupIndex === 0}
            >
              ‹
            </button>
            <button
              className="toeic-official-footer-pill toeic-official-map-trigger"
              onClick={() => setIsQuestionMapOpen(true)}
            >
              {currentQuestionPositionLabel}
            </button>
            <button
              className="toeic-official-nav"
              onClick={() => setCurrentGroupIndex((index) => Math.min(index + 1, flatGroups.length - 1))}
              disabled={currentGroupIndex >= flatGroups.length - 1}
            >
              ›
            </button>
          </footer>
        </>
      )}

      {error ? <div className="feedback-card toeic-official-feedback">{error}</div> : null}

      {isQuestionMapOpen ? (
        <div className="overlay-sheet" onClick={() => setIsQuestionMapOpen(false)}>
          <article className="overlay-panel toeic-official-map-panel" onClick={(event) => event.stopPropagation()}>
            <div className="toeic-official-map-head">
              <div>
                <p className="section-kicker">{currentSection.title}</p>
                <h3>{currentQuestionPositionLabel}</h3>
              </div>
              <button className="ghost-btn" onClick={() => setIsQuestionMapOpen(false)}>Đóng</button>
            </div>

            <div className="toeic-official-map-grid">
              {flatQuestions.map((entry, index) => {
                const questionNumber = Number(entry.question?.number) || index + 1;
                const hasAnswer = Boolean(String(answers[entry.question.id] || '').trim());
                const isViewing = entry.groupIndex === currentGroupIndex;
                return (
                  <button
                    key={entry.question.id}
                    className={`toeic-official-map-item ${hasAnswer ? 'answered' : 'unanswered'} ${isViewing ? 'viewing' : ''}`}
                    onClick={() => {
                      setCurrentGroupIndex(entry.groupIndex);
                      setIsQuestionMapOpen(false);
                    }}
                  >
                    {questionNumber}
                  </button>
                );
              })}
            </div>

            <div className="toeic-official-map-legend">
              <span><i className="toeic-official-map-dot answered" />Answered</span>
              <span><i className="toeic-official-map-dot viewing" />Viewing</span>
              <span><i className="toeic-official-map-dot unanswered" />Unanswered</span>
            </div>
          </article>
        </div>
      ) : null}

      {noteEditor ? (
        <div className="overlay-sheet" onClick={() => setNoteEditor(null)}>
          <article className="overlay-panel toeic-official-note-panel" onClick={(event) => event.stopPropagation()}>
            <div className="overlay-head">
              <div>
                <p className="section-kicker">Note</p>
                <h3>{noteEditor.title}</h3>
              </div>
              <button className="ghost-btn" onClick={() => setNoteEditor(null)}>Đóng</button>
            </div>
            <textarea
              className="toeic-official-note-textarea"
              value={noteEditor.content}
              onChange={(event) => setNoteEditor((current) => ({ ...current, content: event.target.value }))}
              placeholder="Ghi chú nhanh cho câu này..."
            />
            <div className="toeic-official-note-actions">
              <button className="ghost-btn" onClick={() => setNoteEditor(null)}>Đóng</button>
              <button className="primary-btn" onClick={saveNote}>Lưu note</button>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}
