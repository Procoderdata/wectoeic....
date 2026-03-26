import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#2d3142',
          padding: '16px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 183, 207, 0.35)',
          boxShadow: '0 22px 44px rgba(239, 150, 184, 0.16)',
          backdropFilter: 'blur(16px)',
          fontWeight: '700',
        },
        success: {
          iconTheme: {
            primary: '#ff8eb4',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ff6b7a',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
