import { lazy, Suspense } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import ToastProvider from './components/ToastProvider';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const ToeicPage = lazy(() => import('./pages/ToeicPage'));
const ToeicExamPage = lazy(() => import('./pages/ToeicExamPage'));
const ToeicReadingPracticePage = lazy(() => import('./pages/ToeicReadingPracticePage'));
const ToeicReviewImprovePage = lazy(() => import('./pages/ToeicReviewImprovePage'));
const ToeicFlashcardsPage = lazy(() => import('./pages/ToeicFlashcardsPage'));
const ToeicOfficialListeningPage = lazy(() => import('./pages/ToeicOfficialListeningPage'));
const ToeicOfficialReadingPage = lazy(() => import('./pages/ToeicOfficialReadingPage'));
const ToeicOfficialSpeakingPage = lazy(() => import('./pages/ToeicOfficialSpeakingPage'));
const ToeicOfficialWritingPage = lazy(() => import('./pages/ToeicOfficialWritingPage'));
const AptisPage = lazy(() => import('./pages/AptisPage'));
const AptisCoursePage = lazy(() => import('./pages/AptisCoursePage'));
const AptisOfficialListeningPage = lazy(() => import('./pages/AptisOfficialListeningPage'));
const AptisOfficialReadingPage = lazy(() => import('./pages/AptisOfficialReadingPage'));
const AptisOfficialSpeakingPage = lazy(() => import('./pages/AptisOfficialSpeakingPage'));
const AptisOfficialWritingPage = lazy(() => import('./pages/AptisOfficialWritingPage'));

function AppShell() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <ToastProvider />
      <motion.header 
        className="topbar"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="brand-stack">
          <div className="brand-mark">BEH</div>
          <div>
            <p className="brand-kicker">Bloom English House</p>
            <h1>Toeic + Aptis Learning Studio</h1>
            <p className="brand-subline">Soft TOEIC dashboard + clean Aptis course platform</p>
          </div>
        </div>
        <div className="topbar-actions">
          <nav className="topnav">
            <NavLink to="/">Trang chủ</NavLink>
            <NavLink to="/toeic">Toeic</NavLink>
            <NavLink to="/toeic/reading">Reading</NavLink>
            <NavLink to="/toeic/official/listening">TOEIC Official</NavLink>
            <NavLink to="/aptis">Aptis</NavLink>
            <NavLink to="/aptis/official/listening">Aptis Official</NavLink>
          </nav>
          <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? '🌙' : '☀️'}
          </button>
          <div className="header-pill-note">cute Hàn Quốc cho TOEIC • course style cho Aptis</div>
        </div>
      </motion.header>

      <main className="page-frame">
        <Suspense fallback={<div className="state-card">Đang tải trang...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/toeic" element={<ToeicPage />} />
            <Route path="/toeic/exam" element={<ToeicExamPage />} />
            <Route path="/toeic/exam/:preset" element={<ToeicExamPage />} />
            <Route path="/toeic/exam/session/:sessionId" element={<ToeicExamPage />} />
            <Route path="/toeic/exam/:preset/session/:sessionId" element={<ToeicExamPage />} />
            <Route path="/toeic/reading" element={<ToeicReadingPracticePage />} />
            <Route path="/toeic/review" element={<ToeicReviewImprovePage />} />
            <Route path="/toeic/flashcards" element={<ToeicFlashcardsPage />} />
            <Route path="/toeic/official/listening" element={<ToeicOfficialListeningPage />} />
            <Route path="/toeic/official/reading" element={<ToeicOfficialReadingPage />} />
            <Route path="/toeic/official/speaking" element={<ToeicOfficialSpeakingPage />} />
            <Route path="/toeic/official/writing" element={<ToeicOfficialWritingPage />} />
            <Route path="/aptis" element={<AptisPage />} />
            <Route path="/aptis/courses/:slug" element={<AptisCoursePage />} />
            <Route path="/aptis/official/listening" element={<AptisOfficialListeningPage />} />
            <Route path="/aptis/official/reading" element={<AptisOfficialReadingPage />} />
            <Route path="/aptis/official/speaking" element={<AptisOfficialSpeakingPage />} />
            <Route path="/aptis/official/writing" element={<AptisOfficialWritingPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
