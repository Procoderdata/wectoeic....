import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toeicReadingAPI } from '../services/api';

function choiceLetter(index) {
  return ['A', 'B', 'C', 'D'][index] || String(index + 1);
}

export default function ToeicFlashcardsPage() {
  const navigate = useNavigate();
  const [cardsData, setCardsData] = useState({
    items: [],
    due_items: [],
    stats: { total: 0, due: 0, new: 0 },
  });
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, strong: 0 });
  const [error, setError] = useState('');
  const [showDeepReview, setShowDeepReview] = useState(false);

  const loadCards = async () => {
    setLoading(true);
    try {
      const data = await toeicReadingAPI.getFlashcards();
      setCardsData(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const activeCard = queue[index] || null;
  const progressText = `${Math.min(index + 1, Math.max(queue.length, 1))}/${Math.max(queue.length, 1)}`;

  const sessionDone = useMemo(
    () => reviewing && queue.length > 0 && index >= queue.length,
    [index, queue.length, reviewing]
  );

  const startReview = () => {
    const dueFirst = cardsData.due_items.length ? cardsData.due_items : cardsData.items;
    setQueue(dueFirst);
    setIndex(0);
    setRevealed(false);
    setShowDeepReview(false);
    setSessionStats({ reviewed: 0, strong: 0 });
    setReviewing(true);
  };

  const rateCard = async (quality) => {
    if (!activeCard || submitting) return;
    setSubmitting(true);
    try {
      await toeicReadingAPI.reviewFlashcard(activeCard.id, quality);
      setSessionStats((prev) => ({
        reviewed: prev.reviewed + 1,
        strong: quality >= 3 ? prev.strong + 1 : prev.strong,
      }));
      setIndex((prev) => prev + 1);
      setRevealed(false);
      setShowDeepReview(false);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!sessionDone) return;
    loadCards();
  }, [sessionDone]);

  if (loading) {
    return <div className="state-card">Đang tải flashcards...</div>;
  }

  return (
    <div className="toeic-flashcards-page">
      <section className="soft-card toeic-flashcards-header">
        <div>
          <p className="section-kicker">TOEIC Reading Flashcards</p>
          <h2>Flashcards + Spaced Review</h2>
          <p>Bộ thẻ được tạo từ câu sai trong Reading và ưu tiên review theo hạn.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-btn" onClick={() => navigate('/toeic/review')}>Review & Improve</button>
          <button className="ghost-btn" onClick={() => navigate('/toeic/reading')}>Quay lại TOEIC Reading</button>
        </div>
      </section>

      <section className="toeic-flashcards-stats">
        <article className="soft-card">
          <p className="meta-line">Total cards</p>
          <h4>{cardsData.stats.total}</h4>
        </article>
        <article className="soft-card">
          <p className="meta-line">Due now</p>
          <h4>{cardsData.stats.due}</h4>
        </article>
        <article className="soft-card">
          <p className="meta-line">New cards</p>
          <h4>{cardsData.stats.new}</h4>
        </article>
      </section>

      {!reviewing ? (
        <section className="soft-card toeic-flashcards-start">
          <h3>Bắt đầu phiên review</h3>
          <p>Hệ thống sẽ ưu tiên các thẻ đến hạn trước. Nếu chưa có thẻ đến hạn sẽ lấy toàn bộ thẻ hiện có.</p>
          <button
            className="primary-btn"
            onClick={startReview}
            disabled={!cardsData.items.length}
          >
            {cardsData.items.length ? 'Start Review' : 'Chưa có flashcard'}
          </button>
        </section>
      ) : null}

      {reviewing && !sessionDone && activeCard ? (
        <section className="soft-card toeic-flashcard-shell">
          <div className="card-title-row align-start">
            <div>
              <p className="meta-line">{activeCard.part} • {activeCard.passage_title}</p>
              <h4>Card {progressText} • Q{activeCard.source_number}</h4>
            </div>
            <span className="pill pastel-blue">Streak {activeCard.streak}</span>
          </div>

          <div className={`toeic-flashcard-front ${revealed ? 'revealed' : ''}`}>
            <p className="section-kicker">Front</p>
            <h3>{activeCard.front}</h3>
            <div className="stack-list">
              {activeCard.options.map((option, optionIndex) => (
                <div key={`${activeCard.id}-${option}`} className="toeic-flashcard-option">
                  <strong>{choiceLetter(optionIndex)}.</strong> {option}
                </div>
              ))}
            </div>
          </div>

          {revealed ? (
            <div className="toeic-flashcard-back">
              <p className="section-kicker">Back</p>
              <p className="toeic-flashcard-answer-line"><strong>Đáp án đúng:</strong> {activeCard.back}</p>
              {showDeepReview ? (
                <>
                  <p><strong>Giải thích:</strong> {activeCard.explanation_vi}</p>
                  <p><strong>Bẫy đề:</strong> {activeCard.trap_note}</p>
                  {activeCard.note ? <p><strong>Note cá nhân:</strong> {activeCard.note}</p> : null}
                </>
              ) : (
                <p className="subtle">Bấm "Xem phân tích sâu" để hiện giải thích và bẫy đề.</p>
              )}
            </div>
          ) : null}

          <div className="hero-actions">
            {!revealed ? (
              <button className="primary-btn" onClick={() => setRevealed(true)}>
                Reveal Answer
              </button>
            ) : (
              <>
                <button className="secondary-btn" onClick={() => setShowDeepReview((prev) => !prev)}>
                  {showDeepReview ? 'Ẩn phân tích sâu' : 'Xem phân tích sâu'}
                </button>
                <button className="rating-btn reset" onClick={() => rateCard(1)} disabled={submitting}>1 • Quên</button>
                <button className="rating-btn hard" onClick={() => rateCard(2)} disabled={submitting}>2 • Khó</button>
                <button className="rating-btn good" onClick={() => rateCard(3)} disabled={submitting}>3 • Tốt</button>
                <button className="rating-btn easy" onClick={() => rateCard(4)} disabled={submitting}>4 • Rất dễ</button>
              </>
            )}
          </div>
        </section>
      ) : null}

      {sessionDone ? (
        <section className="soft-card toeic-flashcards-done">
          <h3>Hoàn thành phiên review</h3>
          <p>Bạn đã review {sessionStats.reviewed} thẻ, trong đó {sessionStats.strong} thẻ ở mức nhớ tốt trở lên.</p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={startReview}>Review thêm</button>
            <button className="ghost-btn" onClick={() => navigate('/toeic/review')}>Mở Review & Improve</button>
          </div>
        </section>
      ) : null}

      {error ? <div className="feedback-card">{error}</div> : null}
    </div>
  );
}
