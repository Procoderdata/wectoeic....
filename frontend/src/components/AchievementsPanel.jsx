import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gamificationAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

export default function AchievementsPanel() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamificationAPI.getAchievements()
      .then((data) => {
        setAchievements(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingSpinner message="Đang tải thành tựu..." />;
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="achievements-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Achievements</p>
          <h3>Thành tựu đã mở khóa</h3>
        </div>
        <span className="pill pastel-pink">{unlockedCount}/{achievements.length}</span>
      </div>

      <div className="quick-badge-grid">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className={`achievement-badge ${achievement.unlocked ? 'earned' : ''}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{achievement.icon}</div>
            <strong>{achievement.title}</strong>
            <p className="subtle" style={{ fontSize: '0.75rem', margin: '4px 0 0' }}>
              {achievement.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
