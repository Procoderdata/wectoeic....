import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gamificationAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

export default function LeaderboardPanel() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamificationAPI.getLeaderboard()
      .then((data) => {
        setLeaderboard(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingSpinner message="Đang tải bảng xếp hạng..." />;
  }

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="leaderboard-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Leaderboard</p>
          <h3>Top học viên</h3>
        </div>
        <span className="pill pastel-blue">Top {leaderboard.length}</span>
      </div>

      <div className="stack-list">
        {leaderboard.map((entry, index) => (
          <motion.div
            key={entry.user_id || entry.username}
            className={`saved-row ${entry.is_current_user ? 'ok-row' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem', minWidth: '40px' }}>
                {getMedalEmoji(entry.rank)}
              </span>
              <div>
                <strong>{entry.display_name || entry.username}</strong>
                <p className="subtle">{entry.xp} XP • {entry.streak} ngày streak</p>
              </div>
            </div>
            {entry.is_current_user && (
              <span className="pill pastel-pink">Bạn</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
