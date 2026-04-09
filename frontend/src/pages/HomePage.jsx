import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI, fetchJson, gamificationAPI, getAccessToken, progressAPI } from '../services/api';

const landingHighlights = [
  {
    title: 'TOEIC dashboard mỗi ngày',
    body: 'Tra từ, flashcard, reading practice, quiz và review trong một luồng học liền mạch.',
  },
  {
    title: 'Aptis course + mock test',
    body: 'Học theo lesson roadmap và luyện test có timer để bám sát format thi thật.',
  },
  {
    title: 'Theo dõi tiến độ rõ ràng',
    body: 'Nhìn ngay streak, XP và hoạt động gần đây để biết cần tập trung kỹ năng nào.',
  },
];

function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export default function HomePage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [statsOverview, setStatsOverview] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchJson('/api/site/overview'),
      gamificationAPI.getStatsOverview(),
      progressAPI.getStats(),
      gamificationAPI.getLeaderboard(),
    ])
      .then(([overviewData, statsData, progressData, leaderboardData]) => {
        setOverview(overviewData);
        setStatsOverview(statsData);
        setProgressStats(progressData);
        setLeaderboard(leaderboardData?.items || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setCurrentUser(null);
      return;
    }

    authAPI
      .me()
      .then((res) => {
        setCurrentUser(res.user || null);
        navigate('/home', { replace: true });
      })
      .catch(() => setCurrentUser(null));
  }, [navigate]);

  const progressPercent = useMemo(() => {
    if (!progressStats) return 0;
    const totalInteractions = Object.values(progressStats.module_counts || {}).reduce(
      (sum, count) => sum + Number(count || 0),
      0,
    );
    return clampPercent(totalInteractions * 6.5);
  }, [progressStats]);

  async function handleLogout() {
    try {
      await authAPI.logout();
      setCurrentUser(null);
      toast.success('Đã đăng xuất');
    } catch (err) {
      toast.error(err.message || 'Không thể đăng xuất');
    }
  }

  if (error) {
    return <div className="state-card error-state">{error}</div>;
  }

  if (!overview || !statsOverview || !progressStats) {
    return <div className="state-card">Đang tải landing page...</div>;
  }

  const hallOfFame = leaderboard.slice(0, 5);

  return (
    <div className="sat-landing-page">
      <header className="sat-landing-nav-wrap">
        <div className="sat-landing-nav">
          <Link className="sat-brand" to="/">
            <span className="sat-brand-icon">BP</span>
            <span>BloomPrep</span>
          </Link>

          <div className="sat-nav-actions">
            <a href="#hall-of-fame" className="sat-nav-link">
              Hall of Fame
            </a>

            {currentUser ? (
              <>
                <span className="sat-user-chip">Hi, {currentUser.username}</span>
                <Link className="sat-google-btn" to="/home">
                  <span className="sat-google-g">GO</span>
                  Vào học
                </Link>
                <button type="button" className="sat-nav-logout" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link className="sat-google-btn" to="/auth/login">
                  <span className="sat-google-g">GO</span>
                  Đăng nhập Google
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="sat-hero">
        <div className="sat-hero-copy">
          <span className="sat-kicker">Luyện TOEIC + Aptis theo lộ trình chuẩn</span>
          <h2>
            Nền tảng ôn thi TOEIC & Aptis với <span>định hướng rõ ràng</span>
          </h2>
          <p>
            Tập trung vào kỹ năng cốt lõi, full test mô phỏng đề thật và dashboard tiến độ
            để học viên theo dõi kết quả theo từng giai đoạn.
          </p>

          <div className="sat-hero-actions">
            <Link className="sat-primary-cta" to="/toeic">
              Vào khu TOEIC
            </Link>
            <Link className="sat-secondary-cta" to="/aptis">
              Vào khu Aptis
            </Link>
          </div>
        </div>

        <article className="sat-progress-card">
          <div className="sat-progress-head">
            <div className="sat-progress-badge" />
            <div>
              <h3>TOEIC Sprint</h3>
              <p>Reading • Vocabulary</p>
            </div>
          </div>

          <div className="sat-progress-meta">
            <span>Tiến độ</span>
            <strong>{Math.round(progressPercent)}%</strong>
          </div>
          <div className="sat-progress-track">
            <div className="sat-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          <Link className="sat-progress-cta" to="/toeic/tests">
            Tiếp tục học
          </Link>
        </article>
      </section>

      <section className="sat-stats-strip">
        <article className="sat-stat-card sat-pink">
          <strong>{statsOverview.toeic.total_words}+</strong>
          <span>Từ vựng TOEIC</span>
        </article>
        <article className="sat-stat-card sat-blue">
          <strong>{statsOverview.aptis.total_tests}</strong>
          <span>Mock test Aptis</span>
        </article>
        <article className="sat-stat-card sat-mint">
          <strong>{statsOverview.user.total_xp}</strong>
          <span>XP tích lũy</span>
        </article>
      </section>

      <section className="sat-highlight-grid">
        {landingHighlights.map((item) => (
          <article key={item.title} className="sat-highlight-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section id="hall-of-fame" className="sat-hall-of-fame">
        <div className="sat-hof-head">
          <p>Hall of Fame</p>
          <h3>Bảng xếp hạng học viên nổi bật tuần này</h3>
        </div>

        <div className="sat-hof-list">
          {hallOfFame.length ? (
            hallOfFame.map((entry, index) => (
              <article key={`${entry.user_id || entry.username}-${index}`} className="sat-hof-item">
                <span className="sat-hof-rank">#{entry.rank || index + 1}</span>
                <strong>{entry.display_name || entry.username}</strong>
                <span>{entry.xp} XP</span>
              </article>
            ))
          ) : (
            <p className="sat-hof-empty">Chưa có dữ liệu xếp hạng.</p>
          )}
        </div>

        <p className="sat-hof-footnote">{overview.tagline}</p>
      </section>
    </div>
  );
}
