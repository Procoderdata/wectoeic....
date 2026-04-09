import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAuthAPI, clearAdminAuthTokens, getAdminAccessToken } from '../services/api';

export default function ToeicAdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getAdminAccessToken()) return;
    adminAuthAPI
      .me()
      .then(() => navigate('/admin', { replace: true }))
      .catch(() => {
        clearAdminAuthTokens();
      });
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập email và mật khẩu admin.');
      return;
    }

    setSubmitting(true);
    try {
      await adminAuthAPI.login({
        email: email.trim(),
        password,
      });
      toast.success('Đăng nhập admin thành công');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng nhập admin thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="toeic-admin-login-page">
      <section className="toeic-admin-login-card">
        <Link className="toeic-admin-back-link" to="/">
          <FiArrowLeft />
          <span>Về website học</span>
        </Link>

        <div className="toeic-admin-login-badge">
          <FiShield />
        </div>

        <p className="toeic-admin-login-kicker">TOEIC Admin Portal</p>
        <h1>Đăng nhập khu quản trị riêng</h1>
        <p className="toeic-admin-login-subtitle">
          Trang này tách hẳn khỏi luồng học sinh. Chỉ tài khoản admin mới gọi được API quản trị.
        </p>

        <form className="toeic-admin-login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-login-email">Email admin</label>
          <input
            id="admin-login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@webtoeic.local"
          />

          <label htmlFor="admin-login-password">Mật khẩu</label>
          <input
            id="admin-login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />

          {error ? <p className="toeic-admin-login-error">{error}</p> : null}

          <button className="toeic-admin-login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Đang đăng nhập...' : 'Vào trang admin'}
          </button>
        </form>
      </section>
    </div>
  );
}
