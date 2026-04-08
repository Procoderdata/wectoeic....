import { lazy, Suspense, useEffect } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ToastProvider from './components/ToastProvider';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { getAccessToken, getAdminAccessToken } from './services/api';

const HomePage = lazy(() => import('./pages/HomePage'));
const StudentHomePage = lazy(() => import('./pages/StudentHomePage'));
const ToeicPage = lazy(() => import('./pages/ToeicPage'));
const ToeicHomePage = lazy(() => import('./pages/ToeicHomePage'));
const ToeicTestsPage = lazy(() => import('./pages/ToeicTestsPage'));
const ToeicRankingPage = lazy(() => import('./pages/ToeicRankingPage'));
const ToeicTasksPage = lazy(() => import('./pages/ToeicTasksPage'));
const ToeicProfilePage = lazy(() => import('./pages/ToeicProfilePage'));
const ToeicSettingsPage = lazy(() => import('./pages/ToeicSettingsPage'));
const ToeicExamPage = lazy(() => import('./pages/ToeicExamPage'));
const ToeicReadingPracticePage = lazy(() => import('./pages/ToeicReadingPracticePage'));
const ToeicReviewImprovePage = lazy(() => import('./pages/ToeicReviewImprovePage'));
const ToeicFlashcardsPage = lazy(() => import('./pages/ToeicFlashcardsPage'));
const ToeicAdminPage = lazy(() => import('./pages/ToeicAdminPage'));
const ToeicAdminLoginPage = lazy(() => import('./pages/ToeicAdminLoginPage'));
const AptisPage = lazy(() => import('./pages/AptisPage'));
const AptisCoursePage = lazy(() => import('./pages/AptisCoursePage'));
const AuthLoginPage = lazy(() => import('./pages/AuthLoginPage'));

function RequireAuth({ children }) {
  if (!getAccessToken()) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
}

function RequireAdminAuth({ children }) {
  if (!getAdminAccessToken()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function AppShell() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isStudentAuthPage =
    location.pathname === '/auth/login' ||
    location.pathname === '/login' ||
    location.pathname === '/register';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminAuthPage = location.pathname === '/admin/login';
  const isLearningArea = !isLandingPage && !isStudentAuthPage && !isAdminRoute;

  useEffect(() => {
    document.body.classList.toggle('study-mode', isLearningArea);
    document.body.classList.toggle('admin-mode', isAdminRoute);
    return () => {
      document.body.classList.remove('study-mode');
      document.body.classList.remove('admin-mode');
    };
  }, [isLearningArea, isAdminRoute]);
  const sectionBackLink = (() => {
    if (location.pathname.startsWith('/toeic/')) {
      return { to: '/toeic/home', label: '← Về TOEIC' };
    }
    if (location.pathname.startsWith('/aptis/')) {
      return { to: '/aptis', label: '← Về Aptis' };
    }
    return null;
  })();

  return (
    <div className={`app-shell ${isLearningArea ? 'authenticated-shell' : ''} ${isAdminRoute ? 'admin-shell' : ''}`}>
      <ToastProvider />
      {!isLandingPage && !isStudentAuthPage && !isAdminRoute ? (
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
              <NavLink to="/home">Trang chủ</NavLink>
              <NavLink to="/toeic">Toeic</NavLink>
              <NavLink to="/aptis">Aptis</NavLink>
            </nav>
            <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? '🌙' : '☀️'}
            </button>
            <div className="header-pill-note">cute Hàn Quốc cho TOEIC • course style cho Aptis</div>
          </div>
        </motion.header>
      ) : null}

      <main className={`page-frame ${isAdminRoute && !isAdminAuthPage ? 'admin-page-frame' : ''}`}>
        {sectionBackLink && !isStudentAuthPage && !isAdminRoute ? (
          <div className="page-home-shortcut">
            <Link className="page-home-btn" to={sectionBackLink.to}>
              {sectionBackLink.label}
            </Link>
          </div>
        ) : null}

        <Suspense fallback={<div className="state-card">Đang tải trang...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<AuthLoginPage />} />
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/register" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/login" replace />} />
            <Route path="/home" element={<RequireAuth><StudentHomePage /></RequireAuth>} />
            <Route path="/toeic" element={<Navigate to="/toeic/home" replace />} />
            <Route path="/toeic/home" element={<RequireAuth><ToeicHomePage /></RequireAuth>} />
            <Route path="/toeic/tests" element={<RequireAuth><ToeicTestsPage /></RequireAuth>} />
            <Route path="/toeic/ranking" element={<RequireAuth><ToeicRankingPage /></RequireAuth>} />
            <Route path="/toeic/tasks" element={<RequireAuth><ToeicTasksPage /></RequireAuth>} />
            <Route path="/toeic/profile" element={<RequireAuth><ToeicProfilePage /></RequireAuth>} />
            <Route path="/toeic/settings" element={<RequireAuth><ToeicSettingsPage /></RequireAuth>} />
            <Route path="/toeic/studio" element={<RequireAuth><ToeicPage /></RequireAuth>} />
            <Route path="/toeic/exam" element={<RequireAuth><ToeicExamPage /></RequireAuth>} />
            <Route path="/toeic/exam/:preset" element={<RequireAuth><ToeicExamPage /></RequireAuth>} />
            <Route path="/toeic/exam/session/:sessionId" element={<RequireAuth><ToeicExamPage /></RequireAuth>} />
            <Route path="/toeic/exam/:preset/session/:sessionId" element={<RequireAuth><ToeicExamPage /></RequireAuth>} />
            <Route path="/toeic/reading" element={<RequireAuth><ToeicReadingPracticePage /></RequireAuth>} />
            <Route path="/toeic/review" element={<RequireAuth><ToeicReviewImprovePage /></RequireAuth>} />
            <Route path="/toeic/flashcards" element={<RequireAuth><ToeicFlashcardsPage /></RequireAuth>} />
            <Route path="/admin/login" element={<ToeicAdminLoginPage />} />
            <Route path="/admin" element={<RequireAdminAuth><ToeicAdminPage /></RequireAdminAuth>} />
            <Route path="/aptis" element={<RequireAuth><AptisPage /></RequireAuth>} />
            <Route path="/aptis/courses/:slug" element={<RequireAuth><AptisCoursePage /></RequireAuth>} />
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
