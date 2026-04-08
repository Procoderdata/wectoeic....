import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toeicReadingAPI } from '../services/api';

function choiceLetter(index) {
  return ['A', 'B', 'C', 'D'][index] || String(index + 1);
}

export default function ToeicReviewImprovePage() {
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState({
    items: [],
    total_questions: 0,
    total_wrong_attempts: 0,
    noted_questions: 0,
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  const loadReviewData = async () => {
    setLoading(true);
    try {
      const data = await toeicReadingAPI.getReviewItems();
      setReviewData(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewData();
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return reviewData.items;
    return reviewData.items.filter((item) => {
      const haystack = [
        item.prompt,
        item.correct_option,
        item.user_answer,
        item.passage_title,
        item.note,
      ].join(' ').toLowerCase();
      return haystack.includes(normalized);
    });
  }, [reviewData.items, searchQuery]);

  const toggleSelect = (questionId) => {
    setSelectedIds((prev) => (
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    ));
  };

  const toggleExpandedItem = (questionId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const createFlashcards = async (questionIds = []) => {
    if (creating) return;
    setCreating(true);
    setFeedback('');
    try {
      const result = await toeicReadingAPI.createFlashcards(questionIds);
      if (result.created > 0) {
        setFeedback(`Đã tạo ${result.created} flashcard mới.`);
      } else {
        setFeedback('Không có flashcard mới được tạo.');
      }
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="state-card">Đang tải Review & Improve...</div>;
  }

  return (
    <div className="toeic-review-page">
      <section className="soft-card toeic-review-header">
        <div>
          <p className="section-kicker">TOEIC Reading</p>
          <h2>Review & Improve</h2>
          <p>Ôn lại câu sai, thêm note cá nhân, và chuyển nhanh sang flashcard.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-btn" onClick={() => navigate('/toeic/reading')}>Quay lại TOEIC Reading</button>
          <button className="secondary-btn" onClick={() => navigate('/toeic/flashcards')}>Mở Flashcards</button>
        </div>
      </section>

      <section className="toeic-review-stats">
        <article className="soft-card">
          <p className="meta-line">Wrong questions</p>
          <h4>{reviewData.total_questions}</h4>
        </article>
        <article className="soft-card">
          <p className="meta-line">Wrong attempts</p>
          <h4>{reviewData.total_wrong_attempts}</h4>
        </article>
        <article className="soft-card">
          <p className="meta-line">With note</p>
          <h4>{reviewData.noted_questions}</h4>
        </article>
      </section>

      <section className="soft-card toeic-review-controls">
        <div className="search-bar-soft">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm theo prompt, đáp án hoặc note..."
          />
        </div>
        <div className="hero-actions">
          <button
            className="primary-btn"
            onClick={() => createFlashcards(selectedIds)}
            disabled={!selectedIds.length || creating}
          >
            {creating ? 'Đang tạo...' : `Tạo flashcard (${selectedIds.length})`}
          </button>
          <button
            className="secondary-btn"
            onClick={() => createFlashcards([])}
            disabled={!reviewData.items.length || creating}
          >
            Tạo flashcard tất cả câu sai
          </button>
        </div>
      </section>

      {filteredItems.length ? (
        <div className="toeic-review-list">
          {filteredItems.map((item) => {
            const isExpanded = Boolean(expandedItems[item.question_id]);
            return (
              <article key={item.question_id} className="soft-card toeic-review-item">
                <div className="card-title-row align-start">
                  <label className="toeic-review-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.question_id)}
                      onChange={() => toggleSelect(item.question_id)}
                    />
                    <span>Q{item.number}</span>
                  </label>
                  <div>
                    <p className="meta-line">{item.task} • {item.passage_title}</p>
                    <h4>{item.prompt}</h4>
                    <p className="subtle">Sai {item.wrong_count} lần</p>
                  </div>
                  <div className="hero-actions">
                    <button
                      className="ghost-btn"
                      onClick={() => navigate(`/toeic/reading?focus=${item.question_id}`)}
                    >
                      Làm lại
                    </button>
                    <button className="secondary-btn" onClick={() => toggleExpandedItem(item.question_id)}>
                      {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                    </button>
                  </div>
                </div>

                <div className="toeic-review-item-summary">
                  <span><strong>Bạn chọn:</strong> {item.user_answer || 'Chưa trả lời'}</span>
                  <span><strong>Đáp án đúng:</strong> {item.correct_option}</span>
                </div>

                {isExpanded ? (
                  <>
                    <div className="toeic-review-options">
                      {item.options.map((option, index) => {
                        const isCorrect = index === item.correct_index;
                        const isWrongPicked = index === item.user_answer_index && !isCorrect;
                        return (
                          <div
                            key={`${item.question_id}-${option}`}
                            className={`toeic-review-option ${isCorrect ? 'correct' : ''} ${isWrongPicked ? 'wrong' : ''}`}
                          >
                            <strong>{choiceLetter(index)}.</strong> {option}
                          </div>
                        );
                      })}
                    </div>

                    <div className="toeic-review-detail-grid">
                      <div className="toeic-review-detail-card">
                        <p className="section-kicker">Giải thích</p>
                        <p>{item.explanation_vi}</p>
                      </div>
                      <div className="toeic-review-detail-card trap">
                        <p className="section-kicker">Bẫy đề</p>
                        <p>{item.trap_note}</p>
                      </div>
                    </div>

                    {item.note ? (
                      <div className="toeic-review-note">
                        <strong>Note cá nhân:</strong> {item.note}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="state-card">Bạn chưa có câu sai nào để review.</div>
      )}

      {feedback ? <div className="feedback-card">{feedback}</div> : null}
      {error ? <div className="feedback-card">{error}</div> : null}
    </div>
  );
}
