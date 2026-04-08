import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI, getAccessToken } from '../services/api';

export default function AuthRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) return;
    authAPI
      .me()
      .then(() => navigate('/home', { replace: true }))
      .catch(() => {});
  }, [navigate]);

  function updateField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.email.trim() || !form.username.trim() || !form.password.trim()) {
      setError('Vui lòng nhập đủ username, email và mật khẩu.');
      return;
    }

    if (form.password.length < 8) {
      setError('Mật khẩu cần ít nhất 8 ký tự.');
      return;
    }

    setSubmitting(true);
    try {
      await authAPI.register({
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        full_name: form.fullName.trim() || null,
      });
      toast.success('Đăng ký thành công');
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-shell">
        <Link className="auth-brand" to="/">
          BloomPrep
        </Link>

        <h2>Tạo tài khoản</h2>
        <p className="auth-subline">Đăng ký để lưu tiến độ TOEIC và Aptis trên nhiều thiết bị.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-full-name">Họ và tên</label>
          <input
            id="register-full-name"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            placeholder="Nguyen Van A"
          />

          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            type="text"
            autoComplete="username"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
            placeholder="hocvien_toeic"
          />

          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="you@example.com"
          />

          <label htmlFor="register-password">Mật khẩu</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Tối thiểu 8 ký tự"
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/auth/login">Đăng nhập</Link>
        </p>
      </section>
    </div>
  );
}
