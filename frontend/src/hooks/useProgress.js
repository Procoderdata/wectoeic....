import { useState, useEffect, useCallback } from 'react';
import { progressAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useProgress() {
  const [progress, setProgress] = useState({
    totalXp: 0,
    savedWords: [],
    lastActions: [],
    moduleCounts: {},
  });
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const [stats, savedWords, activities, streakData] = await Promise.all([
        progressAPI.getStats(),
        progressAPI.getSavedWords(),
        progressAPI.getActivities(),
        progressAPI.getStreak(),
      ]);

      setProgress({
        totalXp: stats.total_xp || 0,
        savedWords: savedWords.items || [],
        lastActions: activities.items || [],
        moduleCounts: stats.module_counts || {},
      });
      setStreak(streakData.streak_days || 0);
    } catch (error) {
      console.error('Failed to load progress:', error);
      toast.error('Không thể tải tiến độ');
    } finally {
      setLoading(false);
    }
  };

  const recordActivity = useCallback(async (module, activityData) => {
    try {
      const result = await progressAPI.recordActivity(
        module,
        activityData.title || `${module} activity`,
        activityData.xp || 0
      );

      // Update local state
      setProgress((prev) => ({
        ...prev,
        totalXp: result.total_xp,
        moduleCounts: {
          ...prev.moduleCounts,
          [module]: (prev.moduleCounts[module] || 0) + 1,
        },
      }));
      setStreak(result.streak_days);

      // Show toast for XP gain
      if (activityData.xp > 0) {
        toast.success(`+${activityData.xp} XP`, {
          duration: 2000,
        });
      }

      // Reload activities
      const activities = await progressAPI.getActivities();
      setProgress((prev) => ({
        ...prev,
        lastActions: activities.items || [],
      }));
    } catch (error) {
      console.error('Failed to record activity:', error);
    }
  }, []);

  const toggleSavedWord = useCallback(async (word) => {
    const isCurrentlySaved = progress.savedWords.some((w) => w.id === word.id);
    const normalizedWord = {
      id: word.id,
      word: word.word,
      meaning: word.meaning,
      set_title: word.set_title || word.setTitle || 'Vocabulary Set',
    };

    try {
      if (isCurrentlySaved) {
        await progressAPI.unsaveWord(word.id);
        setProgress((prev) => ({
          ...prev,
          savedWords: prev.savedWords.filter((w) => w.id !== word.id),
        }));
        toast.success('Đã bỏ lưu từ');
      } else {
        await progressAPI.saveWord(normalizedWord);
        setProgress((prev) => ({
          ...prev,
          savedWords: [...prev.savedWords, normalizedWord],
        }));
        toast.success('Đã lưu từ vào bộ sưu tập');
      }
    } catch (error) {
      console.error('Failed to toggle saved word:', error);
      toast.error('Có lỗi xảy ra');
    }
  }, [progress.savedWords]);

  const savedWordIds = new Set(progress.savedWords.map((w) => w.id));

  return {
    progress,
    streak,
    loading,
    savedWordIds,
    recordActivity,
    toggleSavedWord,
    refreshProgress: loadProgress,
  };
}
