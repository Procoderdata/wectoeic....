import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI, getAccessToken } from '../services/api';

const GOOGLE_SCRIPT_ID = 'google-identity-services-script';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function ensureGoogleScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not available'));
      return;
    }

    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load Google script')), { once: true });
    document.head.appendChild(script);
  });
}

export default function AuthLoginPage() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) return;
    authAPI
      .me()
      .then(() => navigate('/home', { replace: true }))
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    async function setupGoogleButton() {
      if (!GOOGLE_CLIENT_ID) {
        setError('Thiếu VITE_GOOGLE_CLIENT_ID ở frontend env.');
        setLoadingGoogle(false);
        return;
      }

      try {
        await ensureGoogleScript();
        if (cancelled || !googleButtonRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (!response?.credential || cancelled) {
              setError('Google không trả về credential hợp lệ.');
              return;
            }

            setSubmitting(true);
            setError('');
            try {
              await authAPI.loginWithGoogle(response.credential);
              toast.success('Đăng nhập Google thành công');
              navigate('/home', { replace: true });
            } catch (err) {
              setError(err.message || 'Đăng nhập Google thất bại');
            } finally {
              setSubmitting(false);
            }
          },
        });

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          shape: 'pill',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: 320,
        });
        setLoadingGoogle(false);
      } catch (setupError) {
        if (!cancelled) {
          setError(setupError.message || 'Không thể tải Google Sign-In');
          setLoadingGoogle(false);
        }
      }
    }

    setupGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="auth-page">
      <section className="auth-shell">
        <Link className="auth-brand" to="/">
          BloomPrep
        </Link>

        <h2>Đăng nhập</h2>
        <p className="auth-subline">Đăng nhập học viên chỉ bằng Google.</p>

        <div className="auth-google-only-card">
          <div ref={googleButtonRef} className="auth-google-slot" />
          {loadingGoogle ? <p className="auth-google-note">Đang tải Google Sign-In...</p> : null}
          <p className="auth-google-note">Hệ thống đã tắt đăng nhập email/mật khẩu để chỉ dùng Google OAuth.</p>
        </div>

        {error ? <p className="auth-error">{error}</p> : null}
        {submitting ? <p className="auth-google-note">Đang xác thực Google token...</p> : null}
      </section>
    </div>
  );
}
