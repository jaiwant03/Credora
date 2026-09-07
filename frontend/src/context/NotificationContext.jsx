import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext(null);

// Audio chime using Web Audio API
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone (D5 ~ 587Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second harmonic tone (A5 ~ 880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0.09, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  } catch {
    // AudioContext blocked or not allowed by browser policy
  }
}

const INITIAL_NOTIFICATIONS = [
  {
    id: 'init-1',
    title: 'Verification Complete',
    message: 'The Great Wall of China visibility claim is verified and ready to review.',
    question: 'The Great Wall of China is visible from space with the naked eye.',
    status: 'verified',
    confidence: 78,
    time: '5m ago',
    read: false,
  },
  {
    id: 'init-2',
    title: 'Grounding Stream Connected',
    message: 'Google News RSS and Wikipedia REST API connections active and ready.',
    status: 'info',
    time: '15m ago',
    read: true,
  },
];

export function NotificationProvider({ children }) {
  // Theme state
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('verifyai_theme') || 'light';
  });

  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('verifyai_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  // Active floating toast state
  const [activeToast, setActiveToast] = useState(null);

  // Apply theme to DOM
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('verifyai_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    window.dispatchEvent(new CustomEvent('verifyai_theme_change', { detail: { theme: newTheme } }));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Sync theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('verifyai_theme') || 'light';
    setTheme(saved);
  }, [setTheme]);

  // Persist notifications
  useEffect(() => {
    try {
      localStorage.setItem('verifyai_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Add new notification
  const addNotification = useCallback((notification) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: notification.title || 'Verification Complete',
      message: notification.message || 'Your claim has been verified and is ready to review.',
      question: notification.question || '',
      status: notification.status || 'verified',
      confidence: notification.confidence,
      time: 'Just now',
      read: false,
      timestamp: Date.now(),
      ...notification,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Show floating toast
    setActiveToast(newNotif);
    playChime();

    // Auto-dismiss toast after 5 seconds
    setTimeout(() => {
      setActiveToast((curr) => (curr?.id === newNotif.id ? null : curr));
    }, 5000);

    // Browser desktop notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(newNotif.title, {
            body: newNotif.message,
            icon: '/favicon.svg',
          });
        } catch {}
      }
    }
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        activeToast,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}
