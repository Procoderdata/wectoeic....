import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { aptisAPI, fetchJson } from '../services/api';

const DEMO_USER_ID = 'demo-user';

export default function AptisCoursePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [error, setError] = useState('');

  const loadCourseProgress = async (courseSlug) => {
    try {
      const progress = await aptisAPI.getCourseProgress(courseSlug, DEMO_USER_ID);
      setCourseProgress(progress);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!slug) return;

    fetchJson(`/api/aptis/courses/${slug}`)
      .then(async (courseData) => {
        setCourse(courseData);
        setSelectedLesson(courseData.lessons?.[0] || null);
        await loadCourseProgress(courseData.slug);
      })
      .catch((err) => setError(err.message));
  }, [slug]);

  const completedLessonIds = useMemo(
    () => new Set(courseProgress?.completed_lesson_ids || []),
    [courseProgress]
  );
  const selectedLessonDone = selectedLesson ? completedLessonIds.has(selectedLesson.id) : false;

  const enrollSelectedCourse = async () => {
    if (!course) return;
    try {
      await aptisAPI.enrollCourse(course.slug, DEMO_USER_ID);
      await loadCourseProgress(course.slug);
    } catch (err) {
      setError(err.message);
    }
  };

  const completeCurrentLesson = async () => {
    if (!selectedLesson || !course) return;
    try {
      await aptisAPI.completeLesson(selectedLesson.id, DEMO_USER_ID);
      await loadCourseProgress(course.slug);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <div className="state-card error-state">{error}</div>;
  }

  if (!course) {
    return <div className="state-card">Đang tải khóa học...</div>;
  }

  return (
    <div className="aptis-page">
      <section className="soft-card course-page-head">
        <div className="card-title-row">
          <div>
            <p className="section-kicker">Aptis course detail</p>
            <h3>{course.title}</h3>
          </div>
          <button className="ghost-btn" onClick={() => navigate('/aptis')}>
            ← Quay lại danh sách
          </button>
        </div>
      </section>

      <section className="course-detail premium-course-detail">
        <div className="course-player-column">
          <div className="video-frame">
            {selectedLesson ? (
              <iframe
                src={selectedLesson.video_url}
                title={selectedLesson.title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : null}
          </div>

          <article className="soft-card course-summary-card">
            <div className="card-title-row">
              <div>
                <span className="pill pastel-pink">{course.category}</span>
                <h3>{course.title}</h3>
              </div>
              <div className="price-highlight">
                <span className="old-price">{course.original_price}</span>
                <strong>{course.sale_price}</strong>
              </div>
            </div>
            <p>{course.summary}</p>

            <div className="soft-subcard">
              <div className="card-title-row">
                <div>
                  <p className="section-kicker">Tiến độ khóa học</p>
                  <strong>{courseProgress?.progress_percent || 0}% hoàn thành</strong>
                </div>
                <span className="pill pastel-blue">
                  {courseProgress?.completed_lessons || 0}/{courseProgress?.total_lessons || course.lessons.length} lessons
                </span>
              </div>
              <div className="soft-progress">
                <div className="soft-progress-fill success" style={{ width: `${courseProgress?.progress_percent || 0}%` }} />
              </div>
              <div className="hero-actions">
                <button className="primary-btn" onClick={enrollSelectedCourse}>
                  {courseProgress?.enrolled ? 'Đã đăng ký' : 'Đăng ký khóa học'}
                </button>
                <button
                  className="secondary-btn"
                  onClick={completeCurrentLesson}
                  disabled={!selectedLesson || selectedLessonDone}
                >
                  {selectedLessonDone ? 'Lesson đã hoàn thành' : 'Đánh dấu xong lesson hiện tại'}
                </button>
              </div>
            </div>

            <div className="course-info-grid">
              <div className="soft-subcard">
                <p className="section-kicker">Teacher</p>
                <strong>{course.teacher}</strong>
                <p className="subtle">{course.rating} stars • {course.reviews} reviews</p>
              </div>
              <div className="soft-subcard">
                <p className="section-kicker">Track</p>
                <strong>{course.level}</strong>
                <p className="subtle">{course.duration_weeks} tuần • {course.students} học viên</p>
              </div>
            </div>

            <div className="grid-2">
              <div className="soft-subcard">
                <p className="section-kicker">Diem noi bat</p>
                <div className="bullet-stack">
                  {course.highlights.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>

              <div className="soft-subcard">
                <p className="section-kicker">Tai lieu di kem</p>
                <div className="sentence-list">
                  {course.materials.map((item) => (
                    <span key={item} className="sentence-chip">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>

        <aside className="lesson-sidebar premium-lesson-sidebar">
          <div className="lesson-panel-head">
            <div>
              <p className="section-kicker">Danh sách bài học</p>
              <h3>Lesson roadmap</h3>
            </div>
            <span className="pill pastel-blue">{course.lessons.length} lessons</span>
          </div>
          <div className="stack-list">
            {course.lessons.map((lesson, index) => (
              <button
                key={lesson.id}
                className={`lesson-item lesson-row ${selectedLesson?.id === lesson.id ? 'active' : ''}`}
                onClick={() => setSelectedLesson(lesson)}
              >
                <div className="lesson-leading">
                  <span className="lesson-index">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{lesson.title}</strong>
                    <p className="subtle">{lesson.type} • {lesson.duration}</p>
                    <p className="subtle">{lesson.summary}</p>
                  </div>
                </div>
                <div className="stack-actions">
                  <span className={`pill ${lesson.locked ? 'pastel-blue' : 'pastel-green'}`}>
                    {lesson.locked ? 'Premium' : 'Mở'}
                  </span>
                  {completedLessonIds.has(lesson.id) ? (
                    <span className="pill pastel-green">Hoàn thành</span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
