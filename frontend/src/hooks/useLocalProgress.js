import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'bloom-english-house-progress';

const defaultProgress = {
  savedWords: [],
  totalXp: 0,
  moduleCounts: {
    search: 0,
    flashcard: 0,
    quiz: 0,
    listening: 0,
    typing: 0,
    matching: 0,
    grammar: 0,
  },
  activityDates: [],
  lastActions: [],
};

function computeStreak(activityDates) {
  const days = [...new Set(activityDates)].sort().reverse();
  if (!days.length) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of days) {
    const iso = cursor.toISOString().slice(0, 10);
    if (day !== iso) {
      if (streak === 0) {
        cursor.setDate(cursor.getDate() - 1);
        if (day !== cursor.toISOString().slice(0, 10)) break;
      } else {
        break;
      }
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function useLocalProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return stored ? { ...defaultProgress, ...stored } : defaultProgress;
    } catch {
      return defaultProgress;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const recordActivity = (moduleKey, payload = {}) => {
    const today = new Date().toISOString().slice(0, 10);
    setProgress((current) => ({
      ...current,
      totalXp: current.totalXp + (payload.xp || 15),
      moduleCounts: {
        ...current.moduleCounts,
        [moduleKey]: (current.moduleCounts[moduleKey] || 0) + 1,
      },
      activityDates: [...current.activityDates, today],
      lastActions: [
        {
          id: `${moduleKey}-${Date.now()}`,
          module: moduleKey,
          title: payload.title || moduleKey,
          time: new Date().toLocaleString('vi-VN'),
        },
        ...current.lastActions,
      ].slice(0, 8),
    }));
  };

  const toggleSavedWord = (word) => {
    setProgress((current) => {
      const exists = current.savedWords.some((item) => item.id === word.id);
      return {
        ...current,
        savedWords: exists
          ? current.savedWords.filter((item) => item.id !== word.id)
          : [word, ...current.savedWords],
      };
    });
  };

  const savedWordIds = useMemo(
    () => new Set(progress.savedWords.map((item) => item.id)),
    [progress.savedWords]
  );

  const streak = useMemo(() => computeStreak(progress.activityDates), [progress.activityDates]);

  return {
    progress,
    streak,
    savedWordIds,
    toggleSavedWord,
    recordActivity,
  };
}
