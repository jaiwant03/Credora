import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, Command, CheckCircle2, AlertTriangle, Sparkles, Trash2, Check } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const PAGE_TITLES = {
  '/': 'Verification Dashboard',
  '/verify': 'Verify AI Answer & Claim',
  '/news': 'Live News Fact-Checker',
  '/history': 'Verification History',
  '/analytics': 'Platform Analytics',
  '/sources': 'Knowledge Sources',
  '/settings': 'System Settings',
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const {
    theme,
    toggleTheme,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();

  const title = PAGE_TITLES[location.pathname] || 'VerifyAI';

  // Close notifications popover on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/history?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  }

  function handleNotificationClick(notif) {
    markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.question) {
      navigate('/verify', { state: { initialQuestion: notif.question, autoSubmit: false } });
    }
  }

  return (
    <header className="app-header">
      {/* Mobile menu button */}
      <button className="header-menu-btn" onClick={onMenuToggle} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <div className="header-title-container">
        <h1 className="header-title">{title}</h1>
      </div>

      {/* Right Actions */}
      <div className="header-actions">
        {/* Search bar matching reference */}
        <form className="header-search" onSubmit={handleSearch}>
          <Search size={15} className="header-search-icon" />
          <input
            type="text"
            placeholder="Search claims or topics..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="header-search-input"
          />
          <span className="header-search-kbd">
            <Command size={10} style={{ marginRight: 2 }} />K
          </span>
        </form>

        {/* Notification Bell with Dynamic Popover */}
        <div className="notification-popover-wrapper" ref={notifRef}>
          <button
            className={`header-icon-btn ${showNotifications ? 'header-icon-btn--active' : ''}`}
            title="Notifications"
            aria-label="Notifications"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="header-badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <div className="notification-dropdown-title-group">
                  <span className="notification-dropdown-title">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="notification-unread-pill">{unreadCount} new</span>
                  )}
                </div>
                <div className="notification-header-actions">
                  {unreadCount > 0 && (
                    <button
                      className="notification-header-btn"
                      onClick={markAllAsRead}
                      title="Mark all as read"
                    >
                      <Check size={13} style={{ marginRight: 3 }} />
                      Read all
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      className="notification-header-btn"
                      onClick={clearAllNotifications}
                      title="Clear all"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <div className="notification-empty-icon">
                      <Bell size={20} />
                    </div>
                    <span style={{ fontWeight: 650, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                      All caught up!
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Completed verifications and alerts will appear here.
                    </span>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isVerified = n.status === 'verified';
                    const isDisputed = n.status === 'disputed' || n.status === 'false';
                    const iconColor = isVerified ? '#10B981' : isDisputed ? '#EF4444' : '#06B6D4';
                    const iconBg = isVerified
                      ? 'rgba(16, 185, 129, 0.12)'
                      : isDisputed
                      ? 'rgba(239, 68, 68, 0.12)'
                      : 'rgba(6, 182, 212, 0.12)';

                    return (
                      <div
                        key={n.id}
                        className={`notification-item ${!n.read ? 'is-unread' : ''}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className="notification-icon-box" style={{ background: iconBg }}>
                          {isVerified ? (
                            <CheckCircle2 size={16} color={iconColor} />
                          ) : isDisputed ? (
                            <AlertTriangle size={16} color={iconColor} />
                          ) : (
                            <Sparkles size={16} color={iconColor} />
                          )}
                        </div>
                        <div className="notification-body">
                          <div className="notification-item-top">
                            <span className="notification-item-title">{n.title}</span>
                            <span className="notification-item-time">{n.time}</span>
                          </div>
                          <p className="notification-item-msg">{n.message}</p>
                          {n.confidence && (
                            <span
                              className="notification-item-pill"
                              style={{
                                background: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: isVerified ? '#10B981' : '#EF4444',
                              }}
                            >
                              {n.confidence}% Confidence
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button (Light/Dark) */}
        <button
          className="header-icon-btn"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Theme mode toggle"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun size={18} color="#FBBF24" />
          ) : (
            <Moon size={18} />
          )}
        </button>

        {/* User Profile Avatar matching reference ('VK' in vibrant teal-cyan) */}
        <div className="header-profile-avatar" title="Account profile (VK)">
          VK
        </div>
      </div>

      <style>{`
        .app-header {
          height: var(--header-height);
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 36px;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 40;
          transition: background-color 0.25s ease, border-color 0.25s ease;
        }

        .header-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 6px;
          border-radius: 8px;
        }
        .header-menu-btn:hover { background: var(--bg-secondary); }

        .header-title-container {
          flex: 1;
        }

        .header-title {
          font-family: var(--font-display);
          font-weight: 750;
          font-size: 1.125rem;
          color: var(--text-primary);
          letter-spacing: -0.015em;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        /* Search input with ⌘K */
        .header-search {
          display: flex;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0 12px;
          height: 38px;
          width: 270px;
          transition: all 0.2s ease;
          position: relative;
        }

        .header-search:focus-within {
          border-color: var(--primary-cyan);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.16);
        }

        .header-search-icon {
          color: var(--text-muted);
          margin-right: 8px;
          flex-shrink: 0;
        }

        .header-search-input {
          border: none;
          background: transparent;
          font-size: 0.8125rem;
          color: var(--text-primary);
          outline: none;
          width: 100%;
        }

        .header-search-input::placeholder {
          color: var(--text-muted);
        }

        .header-search-kbd {
          display: inline-flex;
          align-items: center;
          font-size: 0.6875rem;
          font-family: var(--font-sans);
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 5px;
          padding: 2px 6px;
          margin-left: 6px;
          flex-shrink: 0;
        }

        .header-icon-btn {
          position: relative;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .header-icon-btn:hover, .header-icon-btn--active {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .header-badge-count {
          position: absolute;
          top: 4px;
          right: 4px;
          background: var(--primary-blue);
          color: #FFFFFF;
          font-size: 0.625rem;
          font-weight: 700;
          min-width: 15px;
          height: 15px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          border: 1.5px solid var(--bg-card);
        }

        /* Profile Avatar VK */
        .header-profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00A88A 0%, #06B6D4 100%);
          color: #FFFFFF;
          font-size: 0.8125rem;
          font-weight: 750;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 2px 6px rgba(0, 168, 138, 0.25);
        }

        @media (max-width: 768px) {
          .app-header { padding: 0 16px; }
          .header-menu-btn { display: flex; }
          .header-search { display: none; }
        }
      `}</style>
    </header>
  );
}
