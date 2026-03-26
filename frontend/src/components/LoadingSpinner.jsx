import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'medium', message = 'Đang tải...' }) {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const dimension = sizeMap[size] || sizeMap.medium;

  return (
    <div className="loading-spinner-container">
      <motion.div
        className="loading-spinner"
        style={{ width: dimension, height: dimension }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80, 200"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff8eb4" />
              <stop offset="100%" stopColor="#ffe798" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}
