import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson } from '../services/api';

const courseFilters = ['Tất cả', 'Aptis Premium', 'Aptis Foundation', 'Self-study'];

function renderStars(value) {
  const rounded = Math.round(value);
  return '★'.repeat(rounded) + '☆'.repeat(Math.max(0, 5 - rounded));
}

export default function AptisPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [selectedTest, setSelectedTest] = useState(null);
  const [testAnswers, setTestAnswers] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState('courses');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchJson('/api/aptis/courses'), fetchJson('/api/aptis/tests')])
      .then(([courseData, testData]) => {
        setCourses(courseData.items || []);
        setTests(testData.items || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedTest || !remainingSeconds) return undefined;

    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [selectedTest, remainingSeconds]);

  const visibleCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesFilter = activeFilter === 'Tất cả' || course.category === activeFilter;
      const matchesQuery = !normalized || [course.title, course.summary, course.category, course.teacher]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, courses, query]);

  const featuredCourse = visibleCourses[0] || courses[0] || null;
  const selectedAnsweredCount = testAnswers.filter((item) => item >= 0).length;

  const marketHighlights = useMemo(
    () => [
      { label: 'Khóa học', value: courses.length, note: 'layout card sách và rõ' },
      { label: 'Mock tests', value: tests.length, note: 'timer + result breakdown' },
      { label: 'Current level', value: featuredCourse?.level || 'Aptis', note: 'focus track đang mở' },
    ],
    [courses.length, featuredCourse?.level, tests.length]
  );

  const openCourse = (slug) => {
    navigate(`/aptis/courses/${slug}`);
  };

  const startTest = async (slug) => {
    try {
      const detail = await fetchJson(`/api/aptis/tests/${slug}`);
      setSelectedTest(detail);
      setTestAnswers(Array(detail.questions.length).fill(-1));
      setTestResult(null);
      setRemainingSeconds(detail.duration_minutes * 60);
      setTab('tests');
    } catch (err) {
      setError(err.message);
    }
  };

  const submitTest = async () => {
    if (!selectedTest || testResult || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const result = await fetchJson(`/api/aptis/tests/${selectedTest.slug}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: testAnswers }),
      });

      setTestResult(result);
      setRemainingSeconds(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (error) {
    return <div className="state-card error-state">{error}</div>;
  }

  return (
    <div className="aptis-page">
      <section className="aptis-header aptis-hero-enhanced">
        <div>
          <span className="pill pastel-green">Inspired by Edubit course pages</span>
          <h2>Aptis course platform: card khóa học, lesson panel, mock test online</h2>
          <p>
            Trang tổng quan chỉ giữ danh sách khóa học và khu test online. Chi tiết khóa học được tách riêng để giao diện gọn hơn.
          </p>

          <div className="hero-actions">
            <div className="hero-mini-chip dark-chip">
              <strong>{courses.length}</strong>
              <span>Khóa học Aptis</span>
            </div>
            <div className="hero-mini-chip dark-chip">
              <strong>{tests.length}</strong>
              <span>Mini mock tests</span>
            </div>
          </div>
        </div>

        <div className="aptis-hero-side">
          <div className="search-bar-soft white">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm khóa học Aptis..."
            />
          </div>
          <div className="aptis-side-note">
            <p className="section-kicker">Current focus</p>
            <h4>{featuredCourse?.title || 'Chọn một khóa học'}</h4>
            <p>{featuredCourse?.summary || 'Bấm “Xem khóa học” để mở trang chi tiết riêng.'}</p>
            {featuredCourse ? (
              <div className="sentence-list compact-stack">
                <span className="sentence-chip">{featuredCourse.level}</span>
                <span className="sentence-chip">{featuredCourse.duration_weeks} tuần</span>
                <span className="sentence-chip">{featuredCourse.students} học viên</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="aptis-insight-strip">
        {marketHighlights.map((item) => (
          <article key={item.label} className="soft-card insight-card">
            <p className="section-kicker">{item.label}</p>
            <h4>{item.value}</h4>
            <p>{item.note}</p>
          </article>
        ))}
      </section>

      <section className="aptis-tabs premium-tabs">
        <button className={tab === 'courses' ? 'active' : ''} onClick={() => setTab('courses')}>Khóa học</button>
        <button className={tab === 'tests' ? 'active' : ''} onClick={() => setTab('tests')}>Đề thi mẫu</button>
      </section>

      {tab === 'courses' ? (
        <>
          <section className="filter-row">
            {courseFilters.map((item) => (
              <button
                key={item}
                className={`filter-pill ${activeFilter === item ? 'active' : ''}`}
                onClick={() => setActiveFilter(item)}
              >
                {item}
              </button>
            ))}
          </section>

          <section className="course-grid market-grid">
            {visibleCourses.map((course) => (
              <article key={course.slug} className="course-card market-card">
                <div className="course-thumb" style={{ backgroundImage: `url(${course.image})` }}>
                  <span className="discount-badge">-{course.discount}%</span>
                  <span className="course-level-badge">{course.level}</span>
                </div>
                <div className="course-body">
                  <div className="course-top-meta">
                    <p className="meta-line">{course.category}</p>
                    <span className="course-teacher">👩‍🏫 {course.teacher}</span>
                  </div>
                  <h3>{course.title}</h3>
                  <div className="course-inline-meta">
                    <span>{course.duration_weeks} tuần</span>
                    <span>{course.students} học viên</span>
                  </div>
                  <div className="course-rating">
                    <span className="stars">{renderStars(course.rating)}</span>
                    <span>{course.rating} • {course.reviews} reviews</span>
                  </div>
                  <p>{course.summary}</p>
                  <div className="sentence-list inline-chip-list">
                    {course.focus_tags.map((tag) => (
                      <span key={tag} className="sentence-chip">{tag}</span>
                    ))}
                  </div>
                  <div className="price-row">
                    <span className="old-price">{course.original_price}</span>
                    <strong>{course.sale_price}</strong>
                  </div>
                  <button className="primary-btn wide-btn" onClick={() => openCourse(course.slug)}>
                    Xem khóa học
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : (
        <section className="tests-layout premium-tests-layout">
          <aside className="test-side-column">
            <div className="soft-card test-side-card">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">Mock test list</p>
                  <h3>Exam center</h3>
                </div>
              </div>
              <div className="stack-list">
                {tests.map((test) => (
                  <button
                    key={test.slug}
                    className={`lesson-item test-select-card ${selectedTest?.slug === test.slug ? 'active' : ''}`}
                    onClick={() => startTest(test.slug)}
                  >
                    <div>
                      <p className="meta-line">{test.module} • {test.difficulty}</p>
                      <strong>{test.title}</strong>
                      <p className="subtle">{test.question_count} câu • {test.duration_minutes} phút</p>
                    </div>
                    <span className="pill pastel-blue">Mở</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {selectedTest ? (
            <div className="test-board premium-test-board">
              <div className="test-board-head">
                <div>
                  <span className="pill pastel-blue">{selectedTest.module}</span>
                  <h3>{selectedTest.title}</h3>
                  <p className="subtle">{selectedTest.difficulty} • {selectedTest.recommended_for}</p>
                  <p className="subtle">{selectedAnsweredCount}/{selectedTest.questions.length} câu đã chọn đáp án</p>
                </div>
                <div className="timer-box">{formatTimer(remainingSeconds)}</div>
              </div>

              <div className="test-meta-row">
                <div className="soft-subcard">
                  <p className="section-kicker">Duration</p>
                  <strong>{selectedTest.duration_minutes} phút</strong>
                </div>
                <div className="soft-subcard">
                  <p className="section-kicker">Difficulty</p>
                  <strong>{selectedTest.difficulty}</strong>
                </div>
                <div className="soft-subcard">
                  <p className="section-kicker">For</p>
                  <strong>{selectedTest.recommended_for}</strong>
                </div>
              </div>

              <div className="question-jump-strip">
                {selectedTest.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`jump-pill ${testAnswers[index] >= 0 ? 'answered' : ''}`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>

              <div className="stack-list">
                {selectedTest.questions.map((question, index) => (
                  <article key={question.id} className="soft-card test-question-card">
                    <div className="card-title-row">
                      <p className="meta-line">Câu {index + 1}</p>
                      <span className="pill pastel-green">{selectedTest.module}</span>
                    </div>
                    <h4>{question.prompt}</h4>
                    <p className="subtle">{question.support_text}</p>
                    <div className="grid-2">
                      {question.options.map((option, optionIndex) => (
                        <button
                          key={option}
                          className={`option-card option-card-rich ${testAnswers[index] === optionIndex ? 'selected' : ''}`}
                          onClick={() =>
                            setTestAnswers((current) => {
                              const next = [...current];
                              next[index] = optionIndex;
                              return next;
                            })
                          }
                        >
                          <span className="option-index">{['A', 'B', 'C', 'D'][optionIndex]}</span>
                          <span>{option}</span>
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              <button
                className="primary-btn wide-btn"
                onClick={submitTest}
                disabled={isSubmitting || !!testResult}
              >
                {isSubmitting ? 'Đang nộp bài...' : testResult ? 'Đã nộp bài' : 'Nộp bài'}
              </button>

              {testResult ? (
                <article className="soft-card result-card">
                  <div className="card-title-row">
                    <div>
                      <p className="section-kicker">Kết quả</p>
                      <h3>{testResult.title}</h3>
                    </div>
                    <div className="result-badge-box">
                      <p className="result-score">{testResult.correct_count}/{testResult.total_questions}</p>
                      <span className="subtle">Độ chính xác {testResult.accuracy}%</span>
                    </div>
                  </div>

                  <div className="stack-list">
                    {testResult.breakdown.map((item, index) => (
                      <div key={item.id} className={`saved-row ${item.correct ? 'ok-row' : 'warn-row'}`}>
                        <div>
                          <strong>Câu {index + 1}: {item.correct ? 'Đúng' : 'Cần xem lại'}</strong>
                          <p className="subtle">{item.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ) : null}
            </div>
          ) : (
            <div className="soft-card empty-test-board">
              <p className="section-kicker">Online test</p>
              <h3>Chọn một đề mẫu ở cột bên trái để bắt đầu</h3>
              <p>Board làm bài online sẽ hiện ở đây với timer, card câu hỏi và kết quả sau khi nộp.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
