import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNotifications } from '../context/NotificationContext';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeToast, dismissToast } = useNotifications();
  const navigate = useNavigate();

  function handleToastClick() {
    if (activeToast?.question) {
      navigate('/verify', { state: { initialQuestion: activeToast.question, autoSubmit: false } });
    }
    dismissToast();
  }

  return (
    <div className="app-layout">
      <div className="ambient-glow-mesh" aria-hidden="true" />
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="main-content">
        <Header onMenuToggle={() => setMobileOpen(true)} />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>

      {/* Floating Notification Toast */}
      {activeToast && (
        <div className="notification-floating-toast" role="alert">
          <div className="notification-toast-icon">
            <Sparkles size={20} />
          </div>
          <div className="notification-toast-content">
            <div className="notification-toast-title">
              <span>{activeToast.title || 'This question is ready!'}</span>
            </div>
            <p className="notification-toast-msg">{activeToast.message}</p>
            <div className="notification-toast-actions">
              <button
                type="button"
                className="notification-toast-btn notification-toast-btn-primary"
                onClick={handleToastClick}
              >
                <span>View Question</span>
                <ArrowRight size={12} style={{ marginLeft: 4, display: 'inline' }} />
              </button>
              <button
                type="button"
                className="notification-toast-btn notification-toast-btn-ghost"
                onClick={dismissToast}
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            type="button"
            className="notification-toast-close"
            onClick={dismissToast}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
