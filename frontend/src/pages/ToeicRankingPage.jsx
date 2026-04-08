import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ToeicWorkspaceLayout from '../components/ToeicWorkspaceLayout';
import { gamificationAPI } from '../services/api';

const rankingTabs = [
  { key: 'xp', label: '⚡ Đại Gia XP', metricLabel: 'XP' },
  { key: 'vocab', label: '📚 Vua Từ Vựng', metricLabel: 'điểm' },
  { key: 'grammar', label: '📝 Chiến Thần Ngữ Pháp', metricLabel: 'điểm' },
  { key: 'consistency', label: '⏱ Chiến binh kiên định', metricLabel: 'điểm' },
  { key: 'toeic', label: '🏆 Đỉnh Cao TOEIC', metricLabel: 'điểm' },
];

export default function ToeicRankingPage() {
  const [activeTab, setActiveTab] = useState('xp');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    gamificationAPI.getLeaderboard()
      .then((data) => {
        setLeaderboard(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Không thể tải bảng xếp hạng');
        setLoading(false);
      });
  }, []);

  const activeMeta = rankingTabs.find((tab) => tab.key === activeTab) || rankingTabs[0];

  const rankingRows = useMemo(() => {
    return [...leaderboard]
      .sort((a, b) => {
        const scoreGap = (b?.[activeTab] || 0) - (a?.[activeTab] || 0);
        if (scoreGap !== 0) return scoreGap;
        return (b?.xp || 0) - (a?.xp || 0);
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        score: entry?.[activeTab] || 0,
      }));
  }, [activeTab, leaderboard]);

  return (
    <ToeicWorkspaceLayout
      title="Bảng Vàng TOEIC"
      subtitle="Theo dõi bảng xếp hạng theo từng hạng mục học tập"
    >
      <section className="soft-card toeic-ranking-board">
        <div className="toeic-ranking-tabs">
          {rankingTabs.map((tab) => (
            <button
              key={tab.key}
              className={`toeic-ranking-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Đang tải bảng vàng..." />
        ) : error ? (
          <div className="state-card error-state">{error}</div>
        ) : rankingRows.length ? (
          <div className="toeic-ranking-list">
            {rankingRows.map((entry) => (
              <article
                key={`${activeTab}-${entry.user_id || entry.username}`}
                className={`toeic-ranking-row rank-${Math.min(entry.rank, 4)} ${entry.is_current_user ? 'you' : ''}`}
              >
                <div className="toeic-ranking-row-left">
                  <strong className="toeic-rank-number">#{entry.rank}</strong>
                  <div>
                    <h4>{entry.display_name || entry.username}</h4>
                    <p>{entry.level || 'Lv.1 - Learner'}</p>
                  </div>
                </div>
                <strong className="toeic-ranking-score">{entry.score} {activeMeta.metricLabel}</strong>
              </article>
            ))}
          </div>
        ) : (
          <div className="state-card">Chưa có dữ liệu xếp hạng.</div>
        )}
      </section>
    </ToeicWorkspaceLayout>
  );
}
