import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { fetchJson, gamificationAPI, progressAPI } from '../services/api';
import LeaderboardPanel from '../components/LeaderboardPanel';
import AchievementsPanel from '../components/AchievementsPanel';
import ProgressChart from '../components/ProgressChart';

const whyCards = [
  {
    title: 'Hai chứng chỉ, một hệ thống',
    body: 'Cùng một website nhưng tách rõ hai tính cách: TOEIC pastel đáng học mỗi ngày và Aptis sách sẻ theo dạng course platform.',
    accent: 'pink',
  },
  {
    title: 'Học để thi thật, không chỉ xem cho vui',
    body: 'Mọi khu đều có bài tập thao tác được, progress, và mock-test online để bám sát trải nghiệm học thật.',
    accent: 'yellow',
  },
  {
    title: 'Visual nhẹ nhàng nhưng có chủ đích',
    body: 'TOEIC giữ feel cute Hàn Quốc, còn Aptis giữ feel đáng học trên một nền tảng course có thứ tự bài học rõ ràng.',
    accent: 'mint',
  },
  {
    title: 'Có thể mở rộng lên data thật',
    body: 'Kiến trúc hiện tại đã tách frontend/backend, nên sau nay có thể nối database, auth, upload video và test bank thật.',
    accent: 'blue',
  },
];

const aptisPathway = [
  {
    step: '01',
    title: 'Bắt đầu từ khóa học',
    body: 'Chọn lộ trình B1, B2 hoặc tự luyện. Mỗi khóa học có card giá, review, teacher, highlight và lesson video.',
  },
  {
    step: '02',
    title: 'Học theo bài giảng quay sẵn',
    body: 'Video ở bên trái, lesson list ở bên phải, học xong có thể xem tài liệu tổng hợp và guideline speaking.',
  },
  {
    step: '03',
    title: 'Làm đề Reading, Listening, Grammar & Vocab',
    body: 'Làm test online có timer và result summary để biết cần kéo phần nào trước kỳ thi.',
  },
];

const testimonials = [
  {
    name: 'Minh Chau',
    role: 'TOEIC learner',
    quote: 'Em muốn một giao diện đáng học mỗi ngày không ngợp. Bản này có đúng feel nhẹ nhàng, nhìn là muốn bấm học tiếp.',
  },
  {
    name: 'Bao Han',
    role: 'Aptis learner',
    quote: 'Phần Aptis có card khóa học, lesson video và test online tách rõ ràng hơn hẳn các web học online loang.',
  },
  {
    name: 'Ngoc Vy',
    role: 'Teacher review',
    quote: 'TOEIC dạng dashboard + Aptis dạng course platform là hướng đi đúng, vì hai nhu cầu học rất khác nhau.',
  },
];

const plannerModules = [
  { key: 'reading', title: 'Reading mini set', estimate: '20 phút', xp: 20 },
  { key: 'flashcard', title: 'Flashcards + recall', estimate: '15 phút', xp: 15 },
  { key: 'listening', title: 'Listening shadowing', estimate: '25 phút', xp: 25 },
  { key: 'grammar', title: 'Grammar drills', estimate: '20 phút', xp: 20 },
];

const plannerStorageKey = 'toeic-study-planner-v1';

export default function HomePage() {
  const [overview, setOverview] = useState(null);
  const [statsOverview, setStatsOverview] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [error, setError] = useState('');
  const [plannerState, setPlannerState] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(plannerStorageKey) || '{}');
      return {
        date: stored.date || new Date().toISOString().slice(0, 10),
        checkedKeys: stored.checkedKeys || [],
      };
    } catch {
      return {
        date: new Date().toISOString().slice(0, 10),
        checkedKeys: [],
      };
    }
  });

  useEffect(() => {
    localStorage.setItem(plannerStorageKey, JSON.stringify(plannerState));
  }, [plannerState]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (plannerState.date !== today) {
      setPlannerState({
        date: today,
        checkedKeys: [],
      });
    }
  }, [plannerState.date]);

  useEffect(() => {
    Promise.all([
      fetchJson('/api/site/overview'),
      gamificationAPI.getStatsOverview(),
      progressAPI.getStats(),
    ])
      .then(([overviewData, statsData, progressData]) => {
        setOverview(overviewData);
        setStatsOverview(statsData);
        setProgressStats(progressData);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="state-card error-state">{error}</div>;
  }

  if (!overview || !statsOverview || !progressStats) {
    return <div className="state-card">Đang tải landing page...</div>;
  }

  const chartData = [
    { name: 'Tra từ', value: progressStats.module_counts?.search || 0 },
    { name: 'Flashcard', value: progressStats.module_counts?.flashcard || 0 },
    { name: 'Quiz', value: progressStats.module_counts?.quiz || 0 },
    { name: 'Listening', value: progressStats.module_counts?.listening || 0 },
    { name: 'Typing', value: progressStats.module_counts?.typing || 0 },
    { name: 'Matching', value: progressStats.module_counts?.matching || 0 },
    { name: 'Grammar', value: progressStats.module_counts?.grammar || 0 },
  ];

  const plannerProgress = useMemo(
    () => Math.round((plannerState.checkedKeys.length / plannerModules.length) * 100),
    [plannerState.checkedKeys.length]
  );

  const earnedXp = useMemo(
    () =>
      plannerModules
        .filter((item) => plannerState.checkedKeys.includes(item.key))
        .reduce((total, item) => total + item.xp, 0),
    [plannerState.checkedKeys]
  );

  const togglePlannerTask = (key) => {
    setPlannerState((current) => {
      const exists = current.checkedKeys.includes(key);
      return {
        ...current,
        checkedKeys: exists
          ? current.checkedKeys.filter((item) => item !== key)
          : [...current.checkedKeys, key],
      };
    });
  };

  return (
    <div className="home-page">
      <section className="hero-panel home-hero">
        <div className="hero-copy">
          <span className="pill pastel-pink">Clone concept từ 2 website mẫu</span>
          <h2>{overview.hero.title}</h2>
          <p>{overview.hero.subtitle}</p>

          <div className="hero-actions">
            <Link className="primary-btn" to="/toeic">
              {overview.hero.cta_primary}
            </Link>
            <Link className="secondary-btn" to="/aptis">
              {overview.hero.cta_secondary}
            </Link>
          </div>

          <div className="hero-metrics">
            <article className="hero-metric-card">
              <strong>8</strong>
              <span>Tính năng TOEIC</span>
            </article>
            <article className="hero-metric-card">
              <strong>3</strong>
              <span>Lộ trình Aptis</span>
            </article>
            <article className="hero-metric-card">
              <strong>1</strong>
              <span>Website cho cả hai</span>
            </article>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-panel warm-panel">
            <p className="card-kicker">TOEIC zone</p>
            <h3>Flashcard, quiz, typing, listening, matching, grammar, profile</h3>
            <div className="mini-stat-grid">
              <span>Pastel dashboard</span>
              <span>Daily learning feel</span>
              <span>Saved words</span>
              <span>Study streak</span>
            </div>
          </div>

          <div className="floating-panel cool-panel">
            <p className="card-kicker">Aptis zone</p>
            <h3>Course marketplace, video lessons, online mock tests</h3>
            <div className="mini-stat-grid">
              <span>Course cards</span>
              <span>Lesson panel</span>
              <span>Timer tests</span>
              <span>Result breakdown</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dual-track-section">
        {overview.certificates.map((item) => (
          <article key={item.slug} className={`certificate-card ${item.accent}`}>
            <div className="card-topline">
              <p className="card-kicker">{item.label}</p>
              <span className="soft-dot" />
            </div>
            <h3>{item.description}</h3>
            <ul>
              {item.stats.map((stat) => (
                <li key={stat}>{stat}</li>
              ))}
            </ul>
            <Link to={`/${item.slug}`} className="mini-link">
              Mở khu {item.label}
            </Link>
          </article>
        ))}
      </section>

      <section className="feature-grid">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Vì sao nên học ở đây</p>
            <h3>Không phải một landing đẹp cho có, mà là một bộ khung để phát triển thành sản phẩm thật</h3>
          </div>
        </div>
        <div className="grid-4">
          {whyCards.map((item) => (
            <article key={item.title} className={`soft-card why-card ${item.accent}`}>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="toeic-bento-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">TOEIC inspired by Charnishere</p>
            <h3>8 tính năng được đưa vào một dashboard pastel để học hàng ngày</h3>
          </div>
          <Link to="/toeic" className="ghost-btn">
            Vào khu Toeic
          </Link>
        </div>

        <div className="bento-grid">
          {overview.toeic_features.map((feature, index) => (
            <article
              key={feature.key}
              className={`soft-card bento-card tone-${index % 4}`}
            >
              <div className="feature-badge">{feature.icon}</div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="aptis-roadmap-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Aptis pathway</p>
            <h3>Loại bỏ sự lùng xùng, sắp xếp lại thành một flow course platform để học sinh dễ theo</h3>
          </div>
          <Link to="/aptis" className="ghost-btn">
            Xem khu Aptis
          </Link>
        </div>

        <div className="roadmap-grid">
          {aptisPathway.map((item) => (
            <article key={item.step} className="soft-card roadmap-card">
              <span className="roadmap-step">{item.step}</span>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonial-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Review cảm nhận</p>
            <h3>Cảm giác sử dụng sản phẩm cần thiết thương, rõ, và có tính học tập thật</h3>
          </div>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article key={item.name} className="testimonial-card">
              <p className="student-name">{item.name}</p>
              <p className="meta-line">{item.role}</p>
              <p className="quote">“{item.quote}”</p>
            </article>
          ))}
        </div>
      </section>

      <section className="study-planner-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Daily focus planner</p>
            <h3>Kế hoạch học TOEIC mỗi ngày (checklist tự lưu trên máy)</h3>
          </div>
          <span className="planner-date">Ngày {new Date(plannerState.date).toLocaleDateString('vi-VN')}</span>
        </div>

        <div className="planner-summary">
          <article>
            <p>Tiến độ checklist</p>
            <strong>{plannerProgress}%</strong>
          </article>
          <article>
            <p>Nhiệm vụ hoàn thành</p>
            <strong>{plannerState.checkedKeys.length}/{plannerModules.length}</strong>
          </article>
          <article>
            <p>XP dự kiến đạt</p>
            <strong>{earnedXp} XP</strong>
          </article>
        </div>

        <div className="planner-task-list">
          {plannerModules.map((module) => (
            <label key={module.key} className="planner-task">
              <input
                type="checkbox"
                checked={plannerState.checkedKeys.includes(module.key)}
                onChange={() => togglePlannerTask(module.key)}
              />
              <span>
                <strong>{module.title}</strong>
                <small>{module.estimate} • +{module.xp} XP</small>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <h3>Bạn muốn học TOEIC hàng ngày hay học Aptis theo khóa học?</h3>
        <p>
          Hai hướng học khác nhau, một dashboard thì thích hợp học nhanh mỗi ngày, một course platform thì hợp cho video + mock test.
        </p>
        <div className="hero-actions">
          <Link className="primary-btn" to="/toeic">
            Mở TOEIC Studio
          </Link>
          <Link className="secondary-btn" to="/aptis">
            Mở Aptis Platform
          </Link>
        </div>
      </section>

      <section className="grid-4">
        <article className="soft-card">
          <p className="section-kicker">Hệ thống</p>
          <h4>{statsOverview.toeic.total_sets} bộ TOEIC</h4>
          <p>{statsOverview.toeic.total_words} từ vựng • {statsOverview.toeic.total_grammar_topics} chủ đề ngữ pháp</p>
        </article>
        <article className="soft-card">
          <p className="section-kicker">Aptis</p>
          <h4>{statsOverview.aptis.total_courses} khóa học</h4>
          <p>{statsOverview.aptis.total_tests} đề mẫu • {statsOverview.aptis.total_lessons} lessons</p>
        </article>
        <article className="soft-card">
          <p className="section-kicker">Hồ sơ học</p>
          <h4>{statsOverview.user.total_xp} XP</h4>
          <p>{statsOverview.user.streak_days} ngày streak • {statsOverview.user.saved_words} từ đã lưu</p>
        </article>
        <article className="soft-card">
          <p className="section-kicker">Hoạt động</p>
          <h4>{statsOverview.user.activities_count} hoạt động</h4>
          <p>Tổng số tương tác học tập đã được ghi nhận trên hệ thống.</p>
        </article>
      </section>

      <section className="soft-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Study analytics</p>
            <h4>Biểu đồ hoạt động theo module TOEIC</h4>
          </div>
        </div>
        <ProgressChart data={chartData} />
      </section>

      <section className="grid-2">
        <article className="soft-card">
          <LeaderboardPanel />
        </article>
        <article className="soft-card">
          <AchievementsPanel />
        </article>
      </section>
    </div>
  );
}
