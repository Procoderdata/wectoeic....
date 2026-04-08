import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { authAPI, gamificationAPI, progressAPI } from '../services/api';
import ProgressChart from '../components/ProgressChart';
import LeaderboardPanel from '../components/LeaderboardPanel';
import AchievementsPanel from '../components/AchievementsPanel';

const MODULE_LABELS = {
  search: 'Tra từ',
  flashcard: 'Flashcard',
  quiz: 'Quiz',
  listening: 'Listening',
  typing: 'Typing',
  matching: 'Matching',
  grammar: 'Grammar',
};

export default function StudentHomePage() {
  const [user, setUser] = useState(null);
  const [statsOverview, setStatsOverview] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      authAPI.me(),
      gamificationAPI.getStatsOverview(),
      progressAPI.getStats(),
    ])
      .then(([meData, statsData, progressData]) => {
        setUser(meData.user || null);
        setStatsOverview(statsData);
        setProgressStats(progressData);
      })
      .catch((err) => setError(err.message));
  }, []);

  const chartData = useMemo(() => {
    if (!progressStats?.module_counts) return [];
    return Object.entries(progressStats.module_counts).map(([key, value]) => ({
      name: MODULE_LABELS[key] || key,
      value,
    }));
  }, [progressStats]);

  const topModules = useMemo(() => {
    if (!progressStats?.module_counts) return [];
    return Object.entries(progressStats.module_counts)
      .map(([key, value]) => ({
        key,
        label: MODULE_LABELS[key] || key,
        count: value,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [progressStats]);

  if (error) {
    return <div className="state-card error-state">{error}</div>;
  }

  if (!user || !statsOverview || !progressStats) {
    return <div className="state-card">Đang tải trang chủ học viên...</div>;
  }

  return (
    <div className="home-page">
      <section className="hero-panel home-hero">
        <div className="hero-copy">
          <span className="pill pastel-pink">Trang chủ học viên</span>
          <h2>Hi {user.username}, hôm nay học gì tiếp?</h2>
          <p>
            Theo dõi tiến độ học tập TOEIC + Aptis, mở nhanh module cần luyện
            và giữ streak hằng ngày.
          </p>

          <div className="hero-actions">
            <Link className="primary-btn" to="/toeic">
              Vào TOEIC Studio
            </Link>
            <Link className="secondary-btn" to="/aptis">
              Vào Aptis Platform
            </Link>
            <Link className="ghost-btn" to="/toeic/exam/reading">
              Reading Practice
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-panel warm-panel">
            <p className="card-kicker">Tiến độ nhanh</p>
            <h3>{progressStats.total_xp} XP • {progressStats.streak_days} ngày streak</h3>
            <div className="mini-stat-grid">
              <span>{progressStats.saved_word_count} từ đã lưu</span>
              <span>{statsOverview.user.activities_count} hoạt động</span>
            </div>
          </div>

          <div className="floating-panel cool-panel">
            <p className="card-kicker">Module nổi bật</p>
            <h3>Top chức năng bạn đang dùng nhiều</h3>
            <div className="mini-stat-grid">
              {topModules.map((module) => (
                <span key={module.key}>{module.label}: {module.count}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid-4">
        <article className="soft-card">
          <p className="section-kicker">TOEIC</p>
          <h4>{statsOverview.toeic.total_sets} bộ từ vựng</h4>
          <p>{statsOverview.toeic.total_words} từ • {statsOverview.toeic.total_grammar_topics} chủ đề ngữ pháp</p>
        </article>
        <article className="soft-card">
          <p className="section-kicker">Aptis</p>
          <h4>{statsOverview.aptis.total_courses} khóa học</h4>
          <p>{statsOverview.aptis.total_tests} mock test • {statsOverview.aptis.total_lessons} bài học</p>
        </article>
        <article className="soft-card">
          <p className="section-kicker">Hiệu suất</p>
          <h4>{progressStats.total_xp} XP</h4>
          <p>{progressStats.streak_days} ngày streak • {progressStats.saved_word_count} từ đã lưu</p>
        </article>
        <article className="soft-card">
          <p className="section-kicker">Hành động</p>
          <h4>{statsOverview.user.activities_count} hoạt động</h4>
          <p>Tổng tương tác học tập đã ghi nhận trên hệ thống.</p>
        </article>
      </section>

      <section className="soft-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Study analytics</p>
            <h4>Biểu đồ hoạt động theo module</h4>
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
