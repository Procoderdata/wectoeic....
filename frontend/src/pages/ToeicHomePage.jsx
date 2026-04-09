import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToeicWorkspaceLayout from '../components/ToeicWorkspaceLayout';
import { fetchJson } from '../services/api';
import { useProgress } from '../hooks/useProgress';

export default function ToeicHomePage() {
  const navigate = useNavigate();
  const [sets, setSets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('allocate');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [error, setError] = useState('');
  const { progress, streak, recordActivity } = useProgress();

  useEffect(() => {
    Promise.all([
      fetchJson('/api/toeic/sets'),
      fetchJson('/api/toeic/search?q=allocate'),
    ])
      .then(([setsData, searchData]) => {
        setSets(setsData.items || []);
        setSearchResults(searchData.items || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingBoard(false));
  }, []);

  const todayChecklist = useMemo(
    () => [
      { label: 'Tra một từ mới', done: (progress.moduleCounts.search || 0) > 0 },
      { label: 'Lật flashcard', done: (progress.moduleCounts.flashcard || 0) > 0 },
      { label: 'Làm quiz', done: (progress.moduleCounts.quiz || 0) > 0 },
      { label: 'Giữ streak hôm nay', done: streak > 0 },
    ],
    [progress.moduleCounts, streak]
  );

  const completedChecklistCount = todayChecklist.filter((item) => item.done).length;
  const selectedSet = sets[0] || null;
  const latestActivity = progress.lastActions[0] || null;

  const runSearch = async () => {
    const normalized = searchQuery.trim();
    if (!normalized) return;
    try {
      const data = await fetchJson(`/api/toeic/search?q=${encodeURIComponent(normalized)}`);
      setSearchResults(data.items || []);
      recordActivity('search', { title: `Tra từ: ${normalized}`, xp: 6 });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !sets.length) {
    return <div className="state-card error-state">{error}</div>;
  }

  if (loadingBoard && !sets.length) {
    return <div className="state-card">Đang tải dashboard TOEIC...</div>;
  }

  return (
    <ToeicWorkspaceLayout
      title="TOEIC Trang Chủ"
      subtitle="Bảng điều khiển học tập và điều hướng chức năng chính"
    >
      <section className="soft-card toeic-home-board">
        <div className="toeic-home-brand-row">
          <h3>BloomPrep TOEIC</h3>
          <span className="pill pastel-pink">{streak || 0} ngày streak</span>
        </div>

        <article className="toeic-priority-card">
          <p className="section-kicker">Nhiệm vụ ưu tiên</p>
          <h4>{completedChecklistCount === todayChecklist.length ? 'Ôn tập ngay' : 'Checklist hôm nay'}</h4>
          <p>
            {completedChecklistCount}/{todayChecklist.length} nhiệm vụ đã xong.
            {completedChecklistCount === todayChecklist.length ? ' Tuyệt vời, giữ phong độ.' : ' Tiếp tục hoàn thành các bước còn lại.'}
          </p>
        </article>

        <div className="toeic-activity-strip">
          <span>LOG</span>
          <p>
            {latestActivity
              ? `${latestActivity.title} vừa hoàn thành • +${latestActivity.xp || 0} XP`
              : 'Chưa có hoạt động mới. Hãy bắt đầu bằng một module bất kỳ.'}
          </p>
        </div>

        <div className="search-bar-soft toeic-inline-search">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Nhập từ vựng cần tra cứu..."
            onKeyDown={(event) => {
              if (event.key === 'Enter') runSearch();
            }}
          />
          <button className="primary-btn" onClick={runSearch}>Tìm</button>
        </div>

        <div className="toeic-command-grid">
          <button className="quick-hub-card" onClick={() => navigate('/toeic/studio?module=search')}>
            <span className="quick-hub-icon">VOC</span>
            <strong>Từ vựng TOEIC</strong>
            <small>Mở kho chủ đề và tra cứu nhanh</small>
          </button>

          <button className="quick-hub-card" onClick={() => navigate('/toeic/studio?module=grammar')}>
            <span className="quick-hub-icon">GRM</span>
            <strong>Ngữ pháp</strong>
            <small>Lý thuyết và bài tập thực hành</small>
          </button>

          <button className="quick-hub-card" onClick={() => navigate('/toeic/profile')}>
            <span className="quick-hub-icon">SAV</span>
            <strong>Đã lưu</strong>
            <small>{progress.savedWords.length} từ, ôn lại mọi lúc</small>
          </button>

          <button className="quick-hub-card" onClick={() => navigate('/toeic/profile')}>
            <span className="quick-hub-icon">PRF</span>
            <strong>Hồ sơ</strong>
            <small>XP, streak và lịch sử học</small>
          </button>

          <button className="quick-hub-card wide" onClick={() => navigate('/toeic/tests')}>
            <span className="quick-hub-icon">EXM</span>
            <strong>Luyện thi</strong>
            <small>Trải nghiệm giao diện thi thật với các bộ đề mới nhất</small>
          </button>
        </div>

        <article className="toeic-home-quote">
          <p className="section-kicker">Snapshot</p>
          <h4>{selectedSet?.title || 'TOEIC Core Set'}</h4>
          <p>
            {selectedSet
              ? `${selectedSet.level} • ${selectedSet.theme}. Tìm thấy ${searchResults.length} kết quả cho từ khóa hiện tại.`
              : 'Theo dõi set hiện tại, kết quả tra từ và trạng thái học mỗi ngày.'}
          </p>
        </article>
      </section>

      {error ? <div className="feedback-card">{error}</div> : null}
    </ToeicWorkspaceLayout>
  );
}
