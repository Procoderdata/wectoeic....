import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson, toeicAPI } from '../services/api';
import { useProgress } from '../hooks/useProgress';

const modules = [
  {
    key: 'search',
    label: 'Tra từ',
    icon: '🔎',
    short: 'Lookup',
    description: 'Tìm nghĩa, ví dụ và câu đã xuất hiện trong đề thi.',
  },
  {
    key: 'flashcard',
    label: 'Flashcard',
    icon: '📇',
    short: 'Cards',
    description: 'Lật thẻ, reveal nghĩa, lưu từ và đi nhanh qua bộ từ vựng.',
  },
  {
    key: 'quiz',
    label: 'Quiz',
    icon: '☑️',
    short: 'Quiz',
    description: 'Chọn nghĩa đúng như dạng mini test từ vựng.',
  },
  {
    key: 'listening',
    label: 'Listening',
    icon: '🎧',
    short: 'Audio',
    description: 'Nghe phát âm rồi gõ lại từ đúng.',
  },
  {
    key: 'typing',
    label: 'Typing',
    icon: '⌨️',
    short: 'Type',
    description: 'Đọc nghĩa và gõ lại từ tiếng Anh.',
  },
  {
    key: 'matching',
    label: 'Nối từ',
    icon: '🧩',
    short: 'Match',
    description: 'Game ghép cặp từ và nghĩa.',
  },
  {
    key: 'grammar',
    label: 'Ngữ pháp',
    icon: '📝',
    short: 'Grammar',
    description: 'Lý thuyết + bài tập theo dạng TOEIC.',
  },
  {
    key: 'profile',
    label: 'Hồ sơ',
    icon: '🏆',
    short: 'Profile',
    description: 'XP, streak, saved words và nhật ký học tập.',
  },
];

const defaultFullTestSeries = ['ETS 2026'];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function speakWord(word) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function getChoiceLetter(index) {
  return ['A', 'B', 'C', 'D'][index] || String(index + 1);
}

export default function ToeicPage() {
  const navigate = useNavigate();
  const [sets, setSets] = useState([]);
  const [grammarTopics, setGrammarTopics] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [showExpandedDashboard, setShowExpandedDashboard] = useState(false);
  const [showLearningTools, setShowLearningTools] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [quizItems, setQuizItems] = useState([]);
  const [matchingPairs, setMatchingPairs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('allocate');
  const [searchResults, setSearchResults] = useState([]);
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [flashRevealed, setFlashRevealed] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [listeningIndex, setListeningIndex] = useState(0);
  const [listeningInput, setListeningInput] = useState('');
  const [listeningFeedback, setListeningFeedback] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState('');
  const [activeGrammarId, setActiveGrammarId] = useState('');
  const [grammarAnswers, setGrammarAnswers] = useState({});
  const [fullTestSeries, setFullTestSeries] = useState(defaultFullTestSeries);
  const [fullTestPacks, setFullTestPacks] = useState([]);
  const [selectedTestSeries, setSelectedTestSeries] = useState(defaultFullTestSeries[0]);
  const [fullTestQuery, setFullTestQuery] = useState('');
  const [grammarProgressBoard, setGrammarProgressBoard] = useState([]);
  const [vocabLessonBoard, setVocabLessonBoard] = useState([]);
  const [showGrammarProgress, setShowGrammarProgress] = useState(false);
  const [showVocabBoard, setShowVocabBoard] = useState(false);
  const [shuffleVocabBoard, setShuffleVocabBoard] = useState(false);
  const [matchingState, setMatchingState] = useState({
    left: '',
    right: '',
    matched: [],
    meanings: [],
    feedback: '',
  });
  const [error, setError] = useState('');
  const { progress, streak, savedWordIds, toggleSavedWord, recordActivity, loading, refreshProgress } = useProgress();

  useEffect(() => {
    Promise.all([
      fetchJson('/api/toeic/sets'),
      fetchJson('/api/toeic/grammar'),
      fetchJson('/api/toeic/search?q=allocate'),
      toeicAPI.getFullTests(),
      toeicAPI.getGrammarProgress(),
      toeicAPI.getVocabLessons(),
    ])
      .then(([setsData, grammarData, searchData, fullTestsData, grammarBoardData, vocabBoardData]) => {
        const setItems = setsData.items || [];
        const topicItems = grammarData.topics || [];
        const seriesItems = fullTestsData.series || defaultFullTestSeries;
        setSets(setItems);
        setSelectedSetId(setItems[0]?.id || '');
        setGrammarTopics(topicItems);
        setActiveGrammarId(topicItems[0]?.id || '');
        setSearchResults(searchData.items || []);
        setFullTestSeries(seriesItems.length ? seriesItems : defaultFullTestSeries);
        setSelectedTestSeries((current) => (seriesItems.includes(current) ? current : seriesItems[0]));
        setFullTestPacks(fullTestsData.items || []);
        setGrammarProgressBoard(grammarBoardData.items || []);
        setVocabLessonBoard(vocabBoardData.items || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedSetId) return;
    Promise.all([
      fetchJson(`/api/toeic/flashcards/${selectedSetId}`),
      fetchJson(`/api/toeic/quiz/${selectedSetId}`),
      fetchJson(`/api/toeic/matching/${selectedSetId}`),
    ])
      .then(([flashData, quizData, matchData]) => {
        const pairs = matchData.pairs || [];
        setFlashcardSet(flashData.set);
        setQuizItems(quizData.items || []);
        setMatchingPairs(pairs);
        setMatchingState({
          left: '',
          right: '',
          matched: [],
          meanings: shuffle(pairs).map((item) => ({ ...item })),
          feedback: '',
        });
        setCurrentFlashIndex(0);
        setFlashRevealed(false);
        setCurrentQuizIndex(0);
        setSelectedAnswer('');
        setListeningIndex(0);
        setListeningInput('');
        setListeningFeedback('');
        setTypingIndex(0);
        setTypingInput('');
        setTypingFeedback('');
      })
      .catch((err) => setError(err.message));
  }, [selectedSetId]);

  useEffect(() => {
    if (!selectedTestSeries) return;
    toeicAPI.getFullTests(selectedTestSeries, fullTestQuery)
      .then((data) => {
        setFullTestPacks(data.items || []);
      })
      .catch((err) => setError(err.message));
  }, [fullTestQuery, selectedTestSeries]);

  const activeWords = flashcardSet?.words || [];
  const selectedSet = sets.find((item) => item.id === selectedSetId) || flashcardSet;
  const currentFlashWord = activeWords[currentFlashIndex];
  const currentQuiz = quizItems[currentQuizIndex];
  const currentListeningWord = activeWords[listeningIndex];
  const currentTypingWord = activeWords[typingIndex];
  const activeGrammar = grammarTopics.find((topic) => topic.id === activeGrammarId) || grammarTopics[0];
  const activeModuleMeta = modules.find((item) => item.key === selectedModule) || {
    key: '',
    label: 'Chọn module chính',
    description: 'Giao diện chi tiết chỉ mở khi học sinh bấm vào chức năng cần học.',
  };

  const dashboardStats = useMemo(
    () => [
      { label: 'Tổng XP', value: progress.totalXp },
      { label: 'Saved', value: progress.savedWords.length },
      { label: 'Streak', value: `${streak} ngày` },
      { label: 'Quiz đã làm', value: progress.moduleCounts.quiz },
    ],
    [progress, streak]
  );

  const flashProgress = activeWords.length ? ((currentFlashIndex + 1) / activeWords.length) * 100 : 0;
  const quizProgress = quizItems.length ? ((currentQuizIndex + 1) / quizItems.length) * 100 : 0;
  const matchingProgress = matchingPairs.length ? (matchingState.matched.length / matchingPairs.length) * 100 : 0;
  const featuredSearchResult = searchResults[0] || null;
  const quickSearchSuggestions = useMemo(
    () => (selectedSet?.words || []).slice(0, 4).map((item) => item.word),
    [selectedSet]
  );
  const spotlightWords = useMemo(
    () => (selectedSet?.words || []).slice(0, 4),
    [selectedSet]
  );
  const moduleProgressCards = useMemo(
    () =>
      modules
        .filter((module) => module.key !== 'profile')
        .map((module) => ({
          ...module,
          count: progress.moduleCounts[module.key] || 0,
        })),
    [progress.moduleCounts]
  );
  const todayChecklist = useMemo(
    () => [
      { label: 'Tra một từ mới', done: (progress.moduleCounts.search || 0) > 0 },
      { label: 'Lật flashcard', done: (progress.moduleCounts.flashcard || 0) > 0 },
      { label: 'Làm quiz', done: (progress.moduleCounts.quiz || 0) > 0 },
      { label: 'Giữ streak hôm nay', done: streak > 0 },
    ],
    [progress.moduleCounts, streak]
  );
  const weakModules = useMemo(
    () => [...moduleProgressCards].sort((a, b) => a.count - b.count).slice(0, 3),
    [moduleProgressCards]
  );
  const weeklyPlan = useMemo(() => {
    const today = new Date();
    const skillActionMap = {
      search: 'Tra 3 từ mới trong set hiện tại và lưu ít nhất 1 từ.',
      flashcard: 'Lật 10 flashcard, ưu tiên từ chưa nhớ.',
      quiz: 'Làm 5 câu quiz và note lại câu sai.',
      listening: 'Nghe và gõ lại tối thiểu 5 từ.',
      typing: 'Luyện typing 5 từ theo nghĩa tiếng Việt.',
      matching: 'Hoàn thành ít nhất 1 vòng nối từ.',
      grammar: 'Làm 2 câu grammar và đọc lại explanation.',
    };

    const focusPool = weakModules.length ? weakModules : moduleProgressCards;
    const fallbackPool = moduleProgressCards.length
      ? moduleProgressCards
      : modules.filter((item) => item.key !== 'profile').map((item) => ({ ...item, count: 0 }));

    return Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(today);
      date.setDate(today.getDate() + dayIndex);
      const focus = focusPool[dayIndex % focusPool.length] || fallbackPool[dayIndex % fallbackPool.length];
      const support = fallbackPool[(dayIndex + 2) % fallbackPool.length];
      const gap = Math.max(0, 4 - (focus?.count || 0));

      return {
        id: `${focus?.key || 'module'}-${dayIndex}`,
        dateLabel: date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        focusKey: focus?.key || 'search',
        focusLabel: focus?.label || 'Tra từ',
        supportLabel: support?.label || 'Flashcard',
        reason: `Module "${focus?.label || 'Tra từ'}" đang ít hoạt động, nên ưu tiên boost lại tuần này.`,
        tasks: [
          skillActionMap[focus?.key] || 'Làm 1 bài tập nhỏ trong module này.',
          `Kết hợp thêm ${support?.label || 'Flashcard'} để củng cố kiến thức.`,
        ],
        xpGoal: 24 + gap * 6 + (streak ? 4 : 0),
      };
    });
  }, [moduleProgressCards, streak, weakModules]);
  const filteredFullTests = useMemo(() => fullTestPacks, [fullTestPacks]);
  const grammarProgressRows = useMemo(
    () => (
      grammarProgressBoard.length
        ? grammarProgressBoard
        : grammarTopics.map((topic) => {
            const total = topic.practice.length;
            const done = topic.practice.filter((question) => typeof grammarAnswers[question.question] === 'number').length;
            const correct = topic.practice.filter(
              (question) => grammarAnswers[question.question] === question.answer
            ).length;
            const accuracy = done ? Math.round((correct / done) * 100) : 0;
            return {
              id: topic.id,
              title: topic.title,
              done,
              total,
              accuracy,
            };
          })
    ),
    [grammarAnswers, grammarProgressBoard, grammarTopics]
  );
  const displayedVocabLessons = useMemo(
    () => (shuffleVocabBoard ? shuffle(vocabLessonBoard) : vocabLessonBoard),
    [shuffleVocabBoard, vocabLessonBoard]
  );

  const runSearch = async (term) => {
    const normalized = term.trim();
    setSearchQuery(normalized);
    if (!normalized) {
      setSearchResults([]);
      return;
    }
    try {
      const data = await fetchJson(`/api/toeic/search?q=${encodeURIComponent(normalized)}`);
      setSearchResults(data.items || []);
      recordActivity('search', { title: `Tra từ: ${normalized}`, xp: 6 });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = async () => runSearch(searchQuery);

  const handleQuickSearch = async (term) => {
    await runSearch(term);
  };

  const goToNextFlashcard = () => {
    setFlashRevealed(false);
    setCurrentFlashIndex((prev) => (prev + 1) % Math.max(activeWords.length, 1));
  };

  const nextFlashcard = () => {
    goToNextFlashcard();
    recordActivity('flashcard', { title: currentFlashWord?.word || 'Flashcard' });
  };

  const rateFlashcard = (ratingLabel, xp) => {
    if (!currentFlashWord) return;
    recordActivity('flashcard', { title: `${currentFlashWord.word} • ${ratingLabel}`, xp });
    goToNextFlashcard();
  };

  const answerQuiz = (option) => {
    if (!currentQuiz || selectedAnswer) return;
    setSelectedAnswer(option);
    recordActivity('quiz', { title: `Quiz ${currentQuiz.word}`, xp: option === currentQuiz.answer ? 20 : 10 });
  };

  const nextQuiz = () => {
    setCurrentQuizIndex((prev) => (prev + 1) % Math.max(quizItems.length, 1));
    setSelectedAnswer('');
  };

  const checkListening = () => {
    if (!currentListeningWord) return;
    const correct = listeningInput.trim().toLowerCase() === currentListeningWord.word.toLowerCase();
    setListeningFeedback(
      correct
        ? `Đúng rồi. "${currentListeningWord.word}" đã khớp với phát âm.`
        : `Chưa đúng. Đáp án là "${currentListeningWord.word}".`
    );
    recordActivity('listening', { title: `Listening ${currentListeningWord.word}`, xp: correct ? 18 : 8 });
  };

  const nextListening = () => {
    setListeningIndex((prev) => (prev + 1) % Math.max(activeWords.length, 1));
    setListeningInput('');
    setListeningFeedback('');
  };

  const checkTyping = () => {
    if (!currentTypingWord) return;
    const correct = typingInput.trim().toLowerCase() === currentTypingWord.word.toLowerCase();
    setTypingFeedback(
      correct
        ? `Chuẩn rồi. Từ này là "${currentTypingWord.word}".`
        : `Sai một chút. Từ đúng là "${currentTypingWord.word}".`
    );
    recordActivity('typing', { title: `Typing ${currentTypingWord.word}`, xp: correct ? 18 : 8 });
  };

  const nextTyping = () => {
    setTypingIndex((prev) => (prev + 1) % Math.max(activeWords.length, 1));
    setTypingInput('');
    setTypingFeedback('');
  };

  const handleMatchingPick = (side, id) => {
    setMatchingState((current) => {
      const next = { ...current, [side]: id };
      if (!next.left || !next.right) return next;
      const correct = next.left === next.right;
      const matched = correct && !next.matched.includes(next.left)
        ? [...next.matched, next.left]
        : next.matched;
      if (correct) {
        recordActivity('matching', { title: `Match ${next.left}`, xp: 16 });
      }
      return {
        ...next,
        left: '',
        right: '',
        matched,
        feedback: correct ? 'Match đúng rồi, tiếp tục ghép cặp tiếp theo.' : 'Cặp này chưa khớp, thử lại nhé.',
      };
    });
  };

  const refreshGrammarBoard = async () => {
    try {
      const data = await toeicAPI.getGrammarProgress();
      setGrammarProgressBoard(data.items || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const refreshVocabBoard = async () => {
    try {
      const data = await toeicAPI.getVocabLessons();
      setVocabLessonBoard(data.items || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGrammarAnswer = async (questionId, optionIndex, topicTitle, answerIndex, topicId) => {
    setGrammarAnswers((current) => ({
      ...current,
      [questionId]: optionIndex,
    }));
    recordActivity('grammar', { title: `Grammar ${topicTitle}`, xp: 14 });
    try {
      await toeicAPI.recordGrammarAttempt(topicId, questionId, optionIndex === answerIndex);
      await refreshGrammarBoard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFullTestAction = async (mode, packId) => {
    try {
      await toeicAPI.launchFullTest(packId, mode);
      await refreshProgress();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVocabLessonClick = async (lessonId, currentStatus) => {
    const nextStatus = currentStatus === 'Chua hoc'
      ? 'Dang hoc'
      : currentStatus === 'Dang hoc'
        ? 'Da hoc'
        : 'Chua hoc';
    try {
      await toeicAPI.setVocabLessonStatus(lessonId, nextStatus);
      await refreshVocabBoard();
      recordActivity('flashcard', { title: `Lesson ${nextStatus}`, xp: 8 });
    } catch (err) {
      setError(err.message);
    }
  };

  const renderSearchModule = () => (
    <section className="studio-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Global search</p>
          <h3>Tra từ theo dạng dashboard học mỗi ngày</h3>
        </div>
        <span className="pill pastel-pink">{searchResults.length} kết quả</span>
      </div>

      <div className="search-bar-soft search-bar-large">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Nhập từ vựng cần tra..."
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button className="primary-btn" onClick={handleSearch}>Tra ngay</button>
      </div>

      {featuredSearchResult ? (
        <article className="soft-card search-feature-card">
          <div className="card-title-row align-start">
            <div>
              <p className="meta-line">Spotlight result • {featuredSearchResult.set_title}</p>
              <h4>{featuredSearchResult.word}</h4>
              <p className="subtle">{featuredSearchResult.type} • {featuredSearchResult.ipa}</p>
            </div>
            <button
              className={savedWordIds.has(featuredSearchResult.id) ? 'tag-btn saved' : 'tag-btn'}
              onClick={() =>
                    toggleSavedWord({
                      id: featuredSearchResult.id,
                      word: featuredSearchResult.word,
                      meaning: featuredSearchResult.meaning,
                      set_title: featuredSearchResult.set_title,
                    })
                  }
                >
              {savedWordIds.has(featuredSearchResult.id) ? 'Đã lưu' : 'Lưu nhanh'}
            </button>
          </div>
          <div className="search-feature-grid">
            <div className="soft-subcard">
              <p className="section-kicker">Meaning</p>
              <p className="meaning-text">{featuredSearchResult.meaning}</p>
              <p>{featuredSearchResult.example_en}</p>
              <p className="subtle">{featuredSearchResult.example_vi}</p>
            </div>
            <div className="soft-subcard">
              <p className="section-kicker">Exam sentences</p>
              <div className="sentence-list">
                {featuredSearchResult.sentences.map((sentence) => (
                  <span key={sentence} className="sentence-chip">{sentence}</span>
                ))}
              </div>
            </div>
          </div>
        </article>
      ) : null}

      <div className="search-layout">
        <aside className="search-help-card">
          <p className="section-kicker">Tra nhanh như Charnishere</p>
          <h4>Tìm theo từ, nghĩa hoặc context</h4>
          <p>
            Kết quả sẽ hiện nghĩa, ví dụ, bộ học và các câu đã xuất hiện trong đề. Bạn có thể lưu ngay từ quan trọng vào profile.
          </p>
          <div className="sentence-list">
            <span className="sentence-chip">Tra từ theo set</span>
            <span className="sentence-chip">Lưu từ vào profile</span>
            <span className="sentence-chip">Xem câu đã gặp trong đề</span>
          </div>
          <div className="quick-chip-wrap">
            {quickSearchSuggestions.map((term) => (
              <button key={term} className="topic-chip quick-chip" onClick={() => handleQuickSearch(term)}>
                {term}
              </button>
            ))}
          </div>
        </aside>

        <div className="grid-2">
          {searchResults.length ? searchResults.map((word) => (
            <article key={`${word.set_id}-${word.id}`} className="soft-card vocab-result-card">
              <div className="card-title-row align-start">
                <div>
                  <p className="meta-line">{word.set_title}</p>
                  <h4>{word.word}</h4>
                  <p className="subtle">{word.type} • {word.ipa}</p>
                </div>
                <button
                  className={savedWordIds.has(word.id) ? 'tag-btn saved' : 'tag-btn'}
                  onClick={() =>
                    toggleSavedWord({
                      id: word.id,
                      word: word.word,
                      meaning: word.meaning,
                      set_title: word.set_title,
                    })
                  }
                >
                  {savedWordIds.has(word.id) ? 'Đã lưu' : 'Lưu từ'}
                </button>
              </div>
              <p className="meaning-text">{word.meaning}</p>
              <div className="example-box">
                <strong>Example</strong>
                <p>{word.example_en}</p>
                <p className="subtle">{word.example_vi}</p>
              </div>
              <div className="sentence-list">
                {word.sentences.map((sentence) => (
                  <div key={sentence} className="sentence-chip">{sentence}</div>
                ))}
              </div>
            </article>
          )) : (
            <article className="soft-card empty-search-card">
              <p className="section-kicker">Search ready</p>
              <h4>Nhập từ vào ô trên để bắt đầu</h4>
              <p>Bạn có thể bấm các quick chip ở bên trái để xem UI dictionary detail ngay lập tức.</p>
            </article>
          )}
        </div>
      </div>
    </section>
  );

  const renderFlashcardModule = () => (
    <section className="studio-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Flashcard studio</p>
          <h3>Lật thẻ và học nhanh theo bộ từ vựng</h3>
        </div>
        <div className="set-switcher">
          <select value={selectedSetId} onChange={(event) => setSelectedSetId(event.target.value)}>
            {sets.map((setItem) => (
              <option key={setItem.id} value={setItem.id}>{setItem.title}</option>
            ))}
          </select>
        </div>
      </div>

      {currentFlashWord ? (
        <>
          <div className="progress-meta-row">
            <span>{currentFlashIndex + 1}/{activeWords.length} từ</span>
            <span>{selectedSet?.level}</span>
          </div>
          <div className="soft-progress">
            <div className="soft-progress-fill" style={{ width: `${flashProgress}%` }} />
          </div>

          <div className="flashcard-shell polished-card">
            <div className={`flashcard-main ${flashRevealed ? 'revealed' : ''}`}>
              <div className="flashcard-topline">
                <span className="flash-label">{selectedSet?.title}</span>
                <button
                  className={savedWordIds.has(currentFlashWord.id) ? 'tag-btn saved' : 'tag-btn'}
                  onClick={() =>
                    toggleSavedWord({
                      id: currentFlashWord.id,
                      word: currentFlashWord.word,
                      meaning: currentFlashWord.meaning,
                      set_title: flashcardSet.title,
                    })
                  }
                >
                  {savedWordIds.has(currentFlashWord.id) ? 'Đã lưu' : 'Lưu'}
                </button>
              </div>

              <h2>{currentFlashWord.word}</h2>
              <p className="meta-line">{currentFlashWord.type} • {currentFlashWord.ipa}</p>

              {!flashRevealed ? (
                <div className="flash-placeholder">
                  <p>Nhấn hiện đáp án để xem nghĩa, ví dụ và note học nhanh.</p>
                </div>
              ) : (
                <div className="flash-reveal">
                  <p className="meaning-text">{currentFlashWord.meaning}</p>
                  <p>{currentFlashWord.example_en}</p>
                  <p className="subtle">{currentFlashWord.example_vi}</p>
                  <div className="sentence-list">
                    <span className="sentence-chip">{currentFlashWord.note}</span>
                    <span className="sentence-chip">{currentFlashWord.synonyms.join(' • ')}</span>
                  </div>
                </div>
              )}
            </div>

            <aside className="study-side-panel">
              <div className="study-side-card">
                <p className="section-kicker">Quick actions</p>
                <button className="secondary-btn wide-btn" onClick={() => setFlashRevealed((prev) => !prev)}>
                  {flashRevealed ? 'Ẩn đáp án' : 'Hiện đáp án'}
                </button>
                <button className="ghost-btn wide-btn" onClick={() => speakWord(currentFlashWord.word)}>
                  Phát âm từ
                </button>
                <button className="primary-btn wide-btn" onClick={nextFlashcard}>
                  Thẻ tiếp theo
                </button>
              </div>
              <div className="study-side-card">
                <p className="section-kicker">Gợi ý học</p>
                <p className="subtle">Hãy nhìn nghĩa trước, từ từ đoán context, sau đó mới reveal ví dụ để nhớ lâu hơn.</p>
              </div>
            </aside>
          </div>

          <div className="flashcard-rating-row">
            <button className="rating-btn reset" onClick={() => rateFlashcard('Lại từ đầu', 8)}>Lại từ đầu</button>
            <button className="rating-btn hard" onClick={() => rateFlashcard('Khó', 10)}>Khó</button>
            <button className="rating-btn good" onClick={() => rateFlashcard('Tốt', 16)}>Tốt</button>
            <button className="rating-btn easy" onClick={() => rateFlashcard('Rất dễ', 20)}>Rất dễ</button>
          </div>
        </>
      ) : null}
    </section>
  );

  const renderQuizModule = () => (
    <section className="studio-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Quiz mode</p>
          <h3>Trắc nghiệm nghĩa từ theo phong cách mini test</h3>
        </div>
        <span className="pill pastel-blue">{currentQuizIndex + 1}/{Math.max(quizItems.length, 1)}</span>
      </div>

      <div className="soft-progress">
        <div className="soft-progress-fill alt" style={{ width: `${quizProgress}%` }} />
      </div>

      {currentQuiz ? (
        <div className="quiz-shell">
          <div className="quiz-prompt-panel">
            <span className="pill pastel-blue">Context</span>
            <p className="quiz-context">{currentQuiz.context}</p>
            <h4>As used in the context, "{currentQuiz.word}" gần nghĩa nhất với:</h4>
          </div>

          <div className="quiz-options-grid">
            {currentQuiz.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = currentQuiz.answer === option;
              return (
                <button
                  key={option}
                  className={`option-card option-card-rich ${isSelected ? 'selected' : ''} ${selectedAnswer && isCorrect ? 'correct' : ''} ${selectedAnswer && isSelected && !isCorrect ? 'wrong' : ''}`}
                  onClick={() => answerQuiz(option)}
                >
                  <span className="option-index">{getChoiceLetter(index)}</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {selectedAnswer ? (
            <div className="feedback-card strong-feedback">
              {selectedAnswer === currentQuiz.answer ? 'Đúng rồi. ' : 'Cần xem lại. '}
              Đáp án đúng là <strong>{currentQuiz.answer}</strong>.
            </div>
          ) : null}

          <div className="hero-actions">
            <button className="primary-btn" onClick={nextQuiz}>Câu tiếp theo</button>
          </div>
        </div>
      ) : null}
    </section>
  );

  const renderListeningModule = () => (
    <section className="studio-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Listening practice</p>
          <h3>Nghe phát âm và đoán lại từ</h3>
        </div>
      </div>
      {currentListeningWord ? (
        <div className="exercise-shell">
          <div className="exercise-intro-card">
            <span className="pill pastel-green">Hint</span>
            <h4>{currentListeningWord.meaning}</h4>
            <p>{currentListeningWord.example_vi}</p>
          </div>
          <div className="exercise-main-card">
            <div className="hero-actions">
              <button className="secondary-btn" onClick={() => speakWord(currentListeningWord.word)}>Phát âm</button>
              <button className="ghost-btn" onClick={nextListening}>Đổi từ</button>
            </div>
            <input
              className="soft-input"
              value={listeningInput}
              onChange={(event) => setListeningInput(event.target.value)}
              placeholder="Gõ từ bạn nghe được..."
            />
            <button className="primary-btn" onClick={checkListening}>Kiểm tra</button>
            {listeningFeedback ? <div className="feedback-card">{listeningFeedback}</div> : null}
          </div>
        </div>
      ) : null}
    </section>
  );

  const renderTypingModule = () => (
    <section className="studio-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Typing challenge</p>
          <h3>Đọc nghĩa và gõ lại từ tiếng Anh</h3>
        </div>
      </div>
      {currentTypingWord ? (
        <div className="exercise-shell">
          <div className="exercise-intro-card">
            <span className="pill pastel-pink">Meaning</span>
            <h4>{currentTypingWord.meaning}</h4>
            <p>{currentTypingWord.example_vi}</p>
          </div>
          <div className="exercise-main-card">
            <input
              className="soft-input"
              value={typingInput}
              onChange={(event) => setTypingInput(event.target.value)}
              placeholder="Nhập từ tiếng Anh..."
            />
            <div className="hero-actions">
              <button className="primary-btn" onClick={checkTyping}>Kiểm tra</button>
              <button className="ghost-btn" onClick={nextTyping}>Từ tiếp theo</button>
            </div>
            {typingFeedback ? <div className="feedback-card">{typingFeedback}</div> : null}
          </div>
        </div>
      ) : null}
    </section>
  );

  const renderMatchingModule = () => (
    <section className="studio-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Matching game</p>
          <h3>Ghép từ với nghĩa như một mini game nhẹ nhàng</h3>
        </div>
        <span className="pill pastel-blue">{matchingState.matched.length}/{matchingPairs.length} cặp</span>
      </div>

      <div className="soft-progress">
        <div className="soft-progress-fill success" style={{ width: `${matchingProgress}%` }} />
      </div>

      <div className="grid-2 matching-grid">
        <div className="column-card">
          <p className="section-kicker">Words</p>
          {matchingPairs.map((pair) => (
            <button
              key={pair.id}
              className={`match-chip ${matchingState.left === pair.id ? 'selected' : ''} ${matchingState.matched.includes(pair.id) ? 'matched' : ''}`}
              onClick={() => handleMatchingPick('left', pair.id)}
              disabled={matchingState.matched.includes(pair.id)}
            >
              {pair.word}
            </button>
          ))}
        </div>
        <div className="column-card">
          <p className="section-kicker">Meanings</p>
          {matchingState.meanings.map((pair) => (
            <button
              key={`meaning-${pair.id}`}
              className={`match-chip ${matchingState.right === pair.id ? 'selected' : ''} ${matchingState.matched.includes(pair.id) ? 'matched' : ''}`}
              onClick={() => handleMatchingPick('right', pair.id)}
              disabled={matchingState.matched.includes(pair.id)}
            >
              {pair.meaning}
            </button>
          ))}
        </div>
      </div>
      <div className="feedback-card">{matchingState.feedback || 'Chọn một từ bên trái và một nghĩa bên phải.'}</div>
    </section>
  );

  const renderGrammarModule = () => (
    <section className="studio-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Grammar studio</p>
          <h3>Lý thuyết ngắn gọn + practice theo dạng TOEIC</h3>
        </div>
      </div>
      <div className="grammar-layout enhanced-grammar-layout">
        <aside className="grammar-sidebar">
          {grammarTopics.map((topic) => (
            <button
              key={topic.id}
              className={`topic-chip ${activeGrammarId === topic.id ? 'active' : ''}`}
              onClick={() => setActiveGrammarId(topic.id)}
            >
              {topic.title}
            </button>
          ))}
        </aside>

        {activeGrammar ? (
          <div className="grammar-main">
            <article className="soft-card theory-card">
              <span className="pill pastel-blue">{activeGrammar.summary}</span>
              <h4>{activeGrammar.title}</h4>
              <div className="bullet-stack">
                {activeGrammar.theory_points.map((point) => (
                  <p key={point}>{point}</p>
                ))}
              </div>
            </article>

            <div className="stack-list">
              {activeGrammar.practice.map((item) => (
                <article key={item.question} className="soft-card practice-card">
                  <p className="meta-line">Practice</p>
                  <h4>{item.question}</h4>
                  <div className="grid-2">
                    {item.options.map((option, index) => {
                      const selected = grammarAnswers[item.question] === index;
                      const correct = item.answer === index;
                      return (
                        <button
                          key={option}
                          className={`option-card option-card-rich ${selected ? 'selected' : ''} ${selected && correct ? 'correct' : ''} ${selected && !correct ? 'wrong' : ''}`}
                          onClick={() =>
                            handleGrammarAnswer(item.question, index, activeGrammar.title, item.answer, activeGrammar.id)
                          }
                        >
                          <span className="option-index">{getChoiceLetter(index)}</span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                  {typeof grammarAnswers[item.question] === 'number' ? (
                    <div className="feedback-card">
                      {item.explanation}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );

          const renderProfileModule = () => (
    <section className="studio-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Profile inspired by Charnishere</p>
          <h3>Streak, XP, từ đã lưu và lịch sử học</h3>
        </div>
      </div>

      <div className="grid-4 profile-stat-grid">
        {dashboardStats.map((item) => (
          <article key={item.label} className="soft-card profile-metric-card">
            <p className="meta-line">{item.label}</p>
            <h4>{item.value}</h4>
          </article>
        ))}
      </div>

      <div className="grid-2">
        <article className="soft-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Learning map</p>
              <h4>Module progression</h4>
            </div>
            <span className="pill pastel-blue">{moduleProgressCards.reduce((sum, item) => sum + item.count, 0)} actions</span>
          </div>
          <div className="module-progress-stack">
            {moduleProgressCards.map((item) => (
              <div key={item.key} className="module-progress-row">
                <div className="module-progress-head">
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </div>
                <div className="soft-progress tiny-progress">
                  <div
                    className="soft-progress-fill"
                    style={{ width: `${Math.min(100, item.count * 18)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="soft-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Saved words</p>
              <h4>Từ đã lưu</h4>
            </div>
            <span className="pill pastel-pink">{progress.savedWords.length} từ</span>
          </div>
          <div className="stack-list">
            {progress.savedWords.length ? progress.savedWords.map((word) => (
              <div key={word.id} className="saved-row">
                <div>
                  <strong>{word.word}</strong>
                  <p className="subtle">{word.meaning}</p>
                </div>
                <span className="pill pastel-pink">{word.set_title || word.setTitle}</span>
              </div>
            )) : <p className="subtle">Chưa có từ nào được lưu.</p>}
          </div>
        </article>
      </div>

      <div className="grid-2">
        <article className="soft-card profile-badge-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Small achievements</p>
              <h4>Badge board</h4>
            </div>
          </div>
          <div className="quick-badge-grid">
            <div className={`achievement-badge ${progress.savedWords.length >= 3 ? 'earned' : ''}`}>Saved 3+ words</div>
            <div className={`achievement-badge ${streak >= 1 ? 'earned' : ''}`}>Keep 1-day streak</div>
            <div className={`achievement-badge ${(progress.moduleCounts.quiz || 0) >= 2 ? 'earned' : ''}`}>Finish 2 quizzes</div>
            <div className={`achievement-badge ${(progress.moduleCounts.grammar || 0) >= 1 ? 'earned' : ''}`}>Open grammar lab</div>
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
            )) : <p className="subtle">Bạn chưa có activity nào.</p>}
          </div>
        </article>
      </div>
    </section>
  );

  const renderModuleContent = () => {
    switch (selectedModule) {
      case 'search':
        return renderSearchModule();
      case 'flashcard':
        return renderFlashcardModule();
      case 'quiz':
        return renderQuizModule();
      case 'listening':
        return renderListeningModule();
      case 'typing':
        return renderTypingModule();
      case 'matching':
        return renderMatchingModule();
      case 'grammar':
        return renderGrammarModule();
      case 'profile':
        return renderProfileModule();
      default:
        return null;
    }
  };

  if (error) {
    return <div className="state-card error-state">{error}</div>;
  }

  if (loading && !sets.length) {
    return <div className="state-card">Đang tải TOEIC studio...</div>;
  }

  return (
    <div className="toeic-page">
      <section className="dashboard-hero toeic-dashboard-hero">
        <div className="toeic-hero-main">
          <span className="pill pastel-pink">Inspired by Charnishere</span>
          <h2>TOEIC studio pastel, cute, học là có vibe mỗi ngày</h2>
          <p>
            Giữ tinh thần dashboard học từ vựng của Charnishere: quick modules, bộ từ vựng, progress nhẹ nhàng, streak và profile.
          </p>

          <div className="hero-actions">
            <div className="hero-mini-chip">
              <strong>{selectedSet?.title || 'Đang tải bộ từ vựng'}</strong>
              <span>{selectedSet?.theme || 'Theme'}</span>
            </div>
            <div className="hero-mini-chip">
              <strong>{selectedSet?.level || 'Level'}</strong>
              <span>{activeWords.length} từ trong bộ</span>
            </div>
          </div>

          <div className="hero-streak-ribbon">
            <span>Daily mood board</span>
            <strong>{streak ? `${streak} ngày liên tiếp` : 'Bắt đầu streak hôm nay'}</strong>
            <p className="subtle">Mở mỗi module như một mini station: tra từ, quiz, typing, listening, matching và grammar.</p>
          </div>
        </div>

        <div className="hero-stats">
          {dashboardStats.map((stat) => (
            <div key={stat.label} className="stats-pill">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
          <div className="hero-note-card">
            <p className="section-kicker">Quick note</p>
            <h4>{activeModuleMeta.label}</h4>
            <p>{activeModuleMeta.description}</p>
          </div>
          <div className="hero-note-card mission-preview-card">
            <p className="section-kicker">Daily mission</p>
            <div className="mission-mini-list">
              {todayChecklist.map((item) => (
                <div key={item.label} className={`mission-mini-item ${item.done ? 'done' : ''}`}>
                  <span>{item.done ? '✓' : '•'}</span>
                  <small>{item.label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className={`toeic-shell ${showLearningTools ? '' : 'compact-only'}`}>
        {showLearningTools ? (
          <aside className="toeic-sidebar">
            <div className="sidebar-card">
              <p className="section-kicker">Quick modules</p>
              <div className="module-sidebar-list">
                {modules.map((module) => (
                  <button
                    key={module.key}
                    className={`module-sidebar-btn ${selectedModule === module.key ? 'active' : ''}`}
                    onClick={() => setSelectedModule(module.key)}
                  >
                    <span className="module-sidebar-icon">{module.icon}</span>
                    <span>
                      <strong>{module.label}</strong>
                      <small>{module.short}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <p className="section-kicker">Bo tu dang hoc</p>
              <select value={selectedSetId} onChange={(event) => setSelectedSetId(event.target.value)}>
                {sets.map((setItem) => (
                  <option key={setItem.id} value={setItem.id}>{setItem.title}</option>
                ))}
              </select>
              {selectedSet ? (
                <div className="set-preview-card" style={{ '--set-color': selectedSet.color || '#ffd9e8' }}>
                  <strong>{selectedSet.theme}</strong>
                  <p>{selectedSet.level}</p>
                </div>
              ) : null}
            </div>

            <div className="sidebar-card">
              <p className="section-kicker">Top words in set</p>
              <div className="quick-chip-wrap compact">
                {spotlightWords.map((word) => (
                  <button key={word.id} className="topic-chip quick-chip" onClick={() => handleQuickSearch(word.word)}>
                    {word.word}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        ) : null}

        <div className="toeic-main-panel">
          <section className="soft-card toeic-compact-core">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Core học sinh dùng mỗi ngày</p>
                <h4>Chọn nhanh 1 chức năng để mở</h4>
              </div>
              <div className="toeic-core-controls">
                <button
                  className="ghost-btn"
                  onClick={() => {
                    setShowLearningTools((prev) => {
                      const next = !prev;
                      if (!next) {
                        setSelectedModule('');
                      }
                      return next;
                    });
                  }}
                >
                  {showLearningTools ? 'Ẩn công cụ nâng cao' : 'Mở công cụ nâng cao'}
                </button>
                <button
                  className="ghost-btn"
                  onClick={() => setShowExpandedDashboard((prev) => !prev)}
                >
                  {showExpandedDashboard ? 'Ẩn dashboard mở rộng' : 'Hiện dashboard mở rộng'}
                </button>
              </div>
            </div>
            <div className="quick-hub-grid compact-core-grid">
              <button className="quick-hub-card" onClick={() => navigate('/toeic/reading')}>
                <span className="quick-hub-icon">📖</span>
                <strong>Reading Practice</strong>
                <small>Thi reading + giải thích</small>
              </button>
              <button className="quick-hub-card" onClick={() => navigate('/toeic/review')}>
                <span className="quick-hub-icon">🧠</span>
                <strong>Review & Improve</strong>
                <small>Ôn câu sai + note</small>
              </button>
              <button className="quick-hub-card" onClick={() => navigate('/toeic/flashcards')}>
                <span className="quick-hub-icon">📇</span>
                <strong>Flashcards SRS</strong>
                <small>Tự động từ câu sai</small>
              </button>
              <button className="quick-hub-card" onClick={() => navigate('/toeic/exam/lrsw')}>
                <span className="quick-hub-icon">📄</span>
                <strong>TOEIC Exam</strong>
                <small>Luyện đề 4 kỹ năng</small>
              </button>
            </div>
          </section>

          {!showLearningTools ? (
            <section className="soft-card toeic-collapsed-tip">
              <p className="section-kicker">Màn hình học sinh gọn</p>
              <h4>Đang ẩn toàn bộ module phụ để tránh tràn nội dung.</h4>
              <p className="subtle">Chỉ khi bấm "Mở công cụ nâng cao" thì các module Tra từ/Quiz/Grammar mới hiện ra.</p>
            </section>
          ) : null}

          {showExpandedDashboard ? (
            <>
          <section className="toeic-overview-grid">
            <article className="soft-card overview-panel set-spotlight-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">Set spotlight</p>
                  <h4>{selectedSet?.title || 'Dang tai bo hoc'}</h4>
                </div>
                <span className="pill pastel-blue">{selectedSet?.level || 'Core set'}</span>
              </div>
              <p className="subtle">{selectedSet?.theme || 'Theme dang duoc mo o day.'}</p>
              <div className="spotlight-word-list">
                {spotlightWords.map((word) => (
                  <div key={word.id} className="spotlight-word-card">
                    <strong>{word.word}</strong>
                    <p>{word.meaning}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="soft-card overview-panel mission-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">Study plan today</p>
                  <h4>Check nhanh 4 buoc</h4>
                </div>
                <span className="pill pastel-green">{todayChecklist.filter((item) => item.done).length}/4 done</span>
              </div>
              <div className="mission-list">
                {todayChecklist.map((item) => (
                  <div key={item.label} className={`mission-row ${item.done ? 'done' : ''}`}>
                    <span className="mission-dot">{item.done ? '✓' : ''}</span>
                    <div>
                      <strong>{item.label}</strong>
                      <p className="subtle">{item.done ? 'Da co activity trong module nay.' : 'Ban co the hoan thanh nhanh trong 2-3 phut.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="soft-card overview-panel tracker-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">Module tracker</p>
                  <h4>Usage heat</h4>
                </div>
              </div>
              <div className="module-progress-stack compact-progress-stack">
                {moduleProgressCards.slice(0, 4).map((item) => (
                  <div key={item.key} className="module-progress-row">
                    <div className="module-progress-head">
                      <span>{item.label}</span>
                      <strong>{item.count}</strong>
                    </div>
                    <div className="soft-progress tiny-progress">
                      <div
                        className="soft-progress-fill alt"
                        style={{ width: `${Math.min(100, item.count * 18)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="soft-card week-plan-panel">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Auto Study Plan</p>
                <h4>Kế hoạch 7 ngày theo điểm yếu</h4>
              </div>
              <span className="pill pastel-pink">
                Điểm yếu: {weakModules.map((item) => item.label).join(' • ') || 'Đang phân tích'}
              </span>
            </div>
            <div className="week-plan-grid">
              {weeklyPlan.map((day) => (
                <article key={day.id} className="week-plan-card">
                  <div className="card-title-row align-start">
                    <div>
                      <p className="meta-line">{day.dateLabel}</p>
                      <h4>{day.focusLabel}</h4>
                    </div>
                    <button className="mini-link" onClick={() => setSelectedModule(day.focusKey)}>
                      Mở module
                    </button>
                  </div>
                  <p className="subtle">{day.reason}</p>
                  <div className="bullet-stack">
                    {day.tasks.map((task) => (
                      <p key={`${day.id}-${task}`}>{task}</p>
                    ))}
                  </div>
                  <div className="sentence-list compact-stack">
                    <span className="sentence-chip">Support: {day.supportLabel}</span>
                    <span className="sentence-chip">Mục tiêu {day.xpGoal} XP</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="soft-card quick-hub-panel">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Quick hub</p>
                <h4>Mo nhanh cac khu trong 1 click</h4>
              </div>
              <span className="pill pastel-pink">Charnishere style</span>
            </div>
            <div className="quick-hub-grid">
              <button className="quick-hub-card" onClick={() => navigate('/toeic/reading')}>
                <span className="quick-hub-icon">📖</span>
                <strong>Reading Practice</strong>
                <small>Giao diện thi reading + giải thích</small>
              </button>
              <button className="quick-hub-card" onClick={() => navigate('/toeic/review')}>
                <span className="quick-hub-icon">🧠</span>
                <strong>Review & Improve</strong>
                <small>Ôn lại câu sai và note</small>
              </button>
              <button className="quick-hub-card" onClick={() => navigate('/toeic/flashcards')}>
                <span className="quick-hub-icon">📇</span>
                <strong>Flashcards SRS</strong>
                <small>Bộ thẻ từ câu sai reading</small>
              </button>
              <button className="quick-hub-card" onClick={() => setShowVocabBoard(true)}>
                <span className="quick-hub-icon">📚</span>
                <strong>Tu vung TOEIC</strong>
                <small>Mo khoa chu de</small>
              </button>
              <button className="quick-hub-card" onClick={() => setShowGrammarProgress(true)}>
                <span className="quick-hub-icon">📝</span>
                <strong>Ngu phap</strong>
                <small>Ly thuyet va bai tap</small>
              </button>
              <button className="quick-hub-card" onClick={() => setSelectedModule('profile')}>
                <span className="quick-hub-icon">💛</span>
                <strong>Da luu</strong>
                <small>{progress.savedWords.length} tu, 0 cau</small>
              </button>
              <button className="quick-hub-card" onClick={() => setSelectedModule('profile')}>
                <span className="quick-hub-icon">🏆</span>
                <strong>Ho so</strong>
                <small>Thanh tich va lich su</small>
              </button>
              <button className="quick-hub-card wide" onClick={() => navigate('/toeic/exam/lrsw')}>
                <span className="quick-hub-icon">📄</span>
                <strong>Luyen thi</strong>
                <small>Phong thi TOEIC 4 ky nang theo giao dien exam</small>
              </button>
            </div>
          </section>

          <section className="soft-card full-test-center">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Chinh phuc TOEIC full test</p>
                <h4>Luyen de thi that va cham diem tu dong</h4>
              </div>
              <div className="hero-actions">
                <span className="pill pastel-blue">{filteredFullTests.length} de</span>
                <button className="ghost-btn" onClick={() => navigate('/toeic/exam/lrsw')}>Thi 4 kỹ năng</button>
              </div>
            </div>

            <div className="search-bar-soft full-test-search">
              <input
                value={fullTestQuery}
                onChange={(event) => setFullTestQuery(event.target.value)}
                placeholder="Tim kiem bo de..."
              />
              <button className="primary-btn" onClick={() => setSelectedModule('quiz')}>Tim</button>
            </div>

            <div className="full-test-series-row">
              {fullTestSeries.map((series) => (
                <button
                  key={series}
                  className={`full-test-series-btn ${selectedTestSeries === series ? 'active' : ''}`}
                  onClick={() => setSelectedTestSeries(series)}
                >
                  {series}
                </button>
              ))}
            </div>

            <div className="full-test-card-list">
              {filteredFullTests.map((test) => (
                <article key={test.id} className="full-test-card">
                  <div className="full-test-card-head">
                    <div>
                      <h4>{test.title}</h4>
                      <p className="subtle">{test.questions} cau • {test.duration_minutes} phut</p>
                    </div>
                    <span className="pill pastel-pink">{test.status}</span>
                  </div>
                  <p className="subtle">{test.focus}</p>
                  <div className="full-test-actions">
                    <button className="ghost-btn wide-btn" onClick={() => handleFullTestAction('exam', test.id)}>
                      ▷ Luyen thi
                    </button>
                    <button className="secondary-btn wide-btn" onClick={() => handleFullTestAction('practice', test.id)}>
                      📖 Luyen tap
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
            </>
          ) : (
            <section className="soft-card toeic-collapsed-tip">
              <p className="section-kicker">Chế độ cô đọng đang bật</p>
              <h4>Chỉ hiện chức năng chính để tránh quá tải màn hình.</h4>
              <p className="subtle">
                Khi học sinh bấm vào module ở cột trái hoặc core button ở trên, nội dung chi tiết mới mở ra.
              </p>
            </section>
          )}

          {showLearningTools ? (
            selectedModule ? (
              renderModuleContent()
            ) : (
              <section className="soft-card toeic-collapsed-tip">
                <p className="section-kicker">Chưa mở module chi tiết</p>
                <h4>Bấm một module ở cột trái để bắt đầu học.</h4>
              </section>
            )
          ) : null}
        </div>
      </div>

      {showGrammarProgress ? (
        <div className="overlay-sheet" onClick={() => setShowGrammarProgress(false)}>
          <article className="overlay-panel" onClick={(event) => event.stopPropagation()}>
            <div className="overlay-head">
              <div>
                <p className="section-kicker">Tien do ngu phap</p>
                <h3>Nhan vao tung chu de de mo bai hoc</h3>
              </div>
              <button className="ghost-btn" onClick={() => setShowGrammarProgress(false)}>✕</button>
            </div>
            <div className="overlay-list">
              {grammarProgressRows.map((row) => (
                <button
                  key={row.id}
                  className="overlay-row"
                  onClick={() => {
                    setSelectedModule('grammar');
                    setActiveGrammarId(row.id);
                    setShowGrammarProgress(false);
                  }}
                >
                  <div>
                    <strong>{row.title}</strong>
                    <p className="subtle">Da lam: {row.done}/{row.total}</p>
                  </div>
                  <span className="pill pastel-pink">Dung {row.accuracy}%</span>
                </button>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      {showVocabBoard ? (
        <div className="overlay-sheet" onClick={() => setShowVocabBoard(false)}>
          <article className="overlay-panel" onClick={(event) => event.stopPropagation()}>
            <div className="overlay-head">
              <div>
                <p className="section-kicker">Bang bai hoc tu vung</p>
                <h3>Chon bai hoc va cap nhat trang thai trong 1 click</h3>
              </div>
              <button className="ghost-btn" onClick={() => setShowVocabBoard(false)}>✕</button>
            </div>
            <label className="shuffle-toggle">
              <input
                type="checkbox"
                checked={shuffleVocabBoard}
                onChange={(event) => setShuffleVocabBoard(event.target.checked)}
              />
              <span>Tron thu tu tu vung</span>
            </label>
            <div className="overlay-lesson-grid">
              {displayedVocabLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className={`lesson-board-chip ${lesson.status === 'Da hoc' ? 'done' : ''}`}
                  onClick={() => handleVocabLessonClick(lesson.id, lesson.status)}
                >
                  <small>{lesson.status}</small>
                  <strong>{lesson.title}</strong>
                </button>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}
