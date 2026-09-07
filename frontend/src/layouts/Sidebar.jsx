import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShieldCheck, History, BarChart2,
  Database, Settings, ChevronRight, X, Newspaper, Shield
} from 'lucide-react';

const MAIN_NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/verify', label: 'Verify', icon: ShieldCheck },
  { path: '/news', label: 'Live News', icon: Newspaper },
  { path: '/history', label: 'History', icon: History },
];

const CONFIG_NAV_ITEMS = [
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/sources', label: 'Sources', icon: Database },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(7, 26, 61, 0.4)',
            backdropFilter: 'blur(4px)', zIndex: 49, display: 'none',
          }}
          className="mobile-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        {/* Top Brand Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Shield size={20} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="sidebar-logo-name">
              Verify<span style={{ color: 'var(--primary-emerald)' }}>AI</span>
            </div>
            <div className="sidebar-logo-sub">
              Truth & Fact-Checking
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close navigation">
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">MAIN HUB</div>
          {MAIN_NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={18} className="sidebar-nav-icon" strokeWidth={2} />
              <span className="sidebar-nav-text">{label}</span>
              {location.pathname === path && <ChevronRight size={14} className="sidebar-nav-arrow" strokeWidth={2.5} />}
            </NavLink>
          ))}

          <div className="sidebar-nav-label" style={{ marginTop: 20 }}>INTELLIGENCE & SYSTEM</div>
          {CONFIG_NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={18} className="sidebar-nav-icon" strokeWidth={2} />
              <span className="sidebar-nav-text">{label}</span>
              {location.pathname === path && <ChevronRight size={14} className="sidebar-nav-arrow" strokeWidth={2.5} />}
            </NavLink>
          ))}
        </nav>

        {/* Engine Online Card (Exact match with reference screenshot) */}
        <div className="sidebar-engine-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <div className="sonar-emitter">
              <div className="sonar-ping-dot" />
              <div className="sonar-ping-wave" />
            </div>
            <span className="sidebar-engine-title">Engine Online</span>
          </div>
          <div className="sidebar-engine-sub">Multi-Agent Real-Time</div>

          {/* Flowing animated multi-color wave line (Teal -> Cyan -> Blue -> Purple) */}
          <div className="sidebar-wave-container">
            <svg viewBox="0 0 160 28" width="100%" height="28" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="35%" stopColor="#06B6D4" />
                  <stop offset="70%" stopColor="#1687E8" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              <path
                d="M0 16 C 25 6, 45 24, 75 14 C 105 4, 130 22, 160 12"
                stroke="url(#waveGradient)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: background-color 0.25s ease, border-color 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 22px 20px 18px;
        }

        .sidebar-logo-icon {
          width: 38px;
          height: 38px;
          background: var(--gradient-primary);
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3);
        }

        .sidebar-logo-name {
          font-family: var(--font-display);
          font-size: 1.1875rem;
          font-weight: 800;
          color: var(--primary-navy);
          letter-spacing: -0.025em;
          line-height: 1.2;
        }

        .sidebar-logo-sub {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
          margin-top: 1px;
        }

        .sidebar-close-btn {
          margin-left: auto;
          display: none;
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 5px;
          border-radius: 6px;
        }
        .sidebar-close-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }

        .sidebar-nav {
          flex: 1;
          padding: 18px 14px;
          overflow-y: auto;
        }

        .sidebar-nav-label {
          font-family: var(--font-display);
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 6px 12px 6px;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 550;
          transition: all 0.2s ease;
          position: relative;
          margin-bottom: 4px;
          text-decoration: none;
        }

        .sidebar-nav-item:hover {
          background: var(--bg-secondary);
          color: var(--primary-blue);
        }

        /* Active Navigation Item (Reference: Vibrant Teal to Blue Gradient) */
        .sidebar-nav-item--active {
          background: var(--gradient-primary) !important;
          color: #FFFFFF !important;
          font-weight: 650;
          box-shadow: 0 4px 14px rgba(6, 182, 212, 0.32);
        }

        .sidebar-nav-item--active .sidebar-nav-icon,
        .sidebar-nav-item--active .sidebar-nav-text,
        .sidebar-nav-item--active .sidebar-nav-arrow {
          color: #FFFFFF !important;
        }

        .sidebar-nav-arrow {
          margin-left: auto;
        }

        /* Bottom Engine Online Card */
        .sidebar-engine-card {
          margin: 16px 14px 20px;
          padding: 14px 16px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: var(--shadow-sm);
        }

        .sidebar-engine-title {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--primary-navy);
          font-size: 0.8125rem;
        }

        .sidebar-engine-sub {
          font-size: 0.6875rem;
          color: var(--text-muted);
          margin-bottom: 8px;
          padding-left: 16px;
        }

        .sidebar-wave-container {
          margin-top: 4px;
          height: 28px;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar--open {
            transform: translateX(0);
            box-shadow: var(--shadow-xl);
          }
          .sidebar-close-btn { display: flex; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </>
  );
}
