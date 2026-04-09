import ToeicWorkspaceLayout from '../components/ToeicWorkspaceLayout';
import { useProgress } from '../hooks/useProgress';

export default function ToeicProfilePage() {
  const { progress, streak } = useProgress();

  return (
    <ToeicWorkspaceLayout
      title="Hồ Sơ Học Tập"
      subtitle="Theo dõi XP, streak, từ đã lưu và hoạt động gần đây"
    >
      <section className="soft-card toeic-profile-board">
        <div className="grid-4 profile-stat-grid">
          <article className="soft-card profile-metric-card">
            <p className="meta-line">Tổng XP</p>
            <h4>{progress.totalXp}</h4>
          </article>
          <article className="soft-card profile-metric-card">
            <p className="meta-line">Saved</p>
            <h4>{progress.savedWords.length}</h4>
          </article>
          <article className="soft-card profile-metric-card">
            <p className="meta-line">Streak</p>
            <h4>{streak} ngày</h4>
          </article>
          <article className="soft-card profile-metric-card">
            <p className="meta-line">Quiz</p>
            <h4>{progress.moduleCounts.quiz || 0}</h4>
          </article>
        </div>

        <div className="grid-2">
          <article className="soft-card">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Saved words</p>
                <h4>Từ đã lưu</h4>
              </div>
            </div>
            <div className="stack-list">
              {progress.savedWords.length ? progress.savedWords.map((word) => (
                <div key={word.id} className="saved-row">
                  <div>
                    <strong>{word.word}</strong>
                    <p className="subtle">{word.meaning}</p>
                  </div>
                  <span className="pill pastel-blue">{word.set_title || 'Set'}</span>
                </div>
              )) : <p className="subtle">Chưa có từ nào được lưu.</p>}
            </div>
          </article>

          <article className="soft-card">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Recent activity</p>
                <h4>Nhật ký gần đây</h4>
              </div>
            </div>
            <div className="stack-list">
              {progress.lastActions.length ? progress.lastActions.map((action) => (
                <div key={action.id} className="saved-row">
                  <div>
                    <strong>{action.title}</strong>
                    <p className="subtle">{action.module}</p>
                  </div>
                  <span className="meta-line">{action.time}</span>
                </div>
              )) : <p className="subtle">Chưa có hoạt động nào.</p>}
            </div>
          </article>
        </div>
      </section>
    </ToeicWorkspaceLayout>
  );
}
