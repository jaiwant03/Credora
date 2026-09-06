import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShieldCheck, History, BarChart2,
  Database, Settings, ChevronRight, X, Newspaper, Sparkles
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
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)', zIndex: 49, display: 'none',
          }}
          className="mobile-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <ShieldCheck size={20} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="sidebar-logo-name">
              Verify<span style={{ color: 'var(--brand-primary)' }}>AI</span>
            </div>
            <div className="sidebar-logo-sub">
              <Sparkles size={10} color="var(--brand-secondary)" style={{ display: 'inline', marginRight: 3 }} />
              Truth & Fact-Checking
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close navigation">
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Main Hub</div>
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
              <Icon size={18} className="sidebar-nav-icon" />
              <span>{label}</span>
              {location.pathname === path && <ChevronRight size={14} className="sidebar-nav-arrow" />}
            </NavLink>
          ))}

          <div className="sidebar-nav-label" style={{ marginTop: 14 }}>Intelligence & System</div>
          {CONFIG_NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={18} className="sidebar-nav-icon" />
              <span>{label}</span>
              {location.pathname === path && <ChevronRight size={14} className="sidebar-nav-arrow" />}
            </NavLink>
          ))}
        </nav>

        {/* Footer note with sonar ping */}
        <div className="sidebar-footer">
          <div className="sonar-emitter" style={{ marginRight: 4 }}>
            <div className="sonar-ping-dot" />
            <div className="sonar-ping-wave" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.75rem' }}>Engine Online</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Multi-Source Real-Time</span>
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
          box-shadow: 1px 0 3px rgba(15, 23, 42, 0.02);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 18px 18px;
          border-bottom: 1px solid var(--border-light);
        }

        .sidebar-logo-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .sidebar-logo-name {
          font-family: var(--font-display);
          font-size: 1.0625rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.025em;
          line-height: 1.2;
        }

        .sidebar-logo-sub {
          font-size: 0.6875rem;
          font-weight: 550;
          color: var(--text-muted);
          margin-top: 1px;
          display: flex;
          align-items: center;
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
        .sidebar-close-btn:hover { background: var(--bg-gray); color: var(--text-primary); }

        .sidebar-nav {
          flex: 1;
          padding: 14px 12px;
          overflow-y: auto;
        }

        .sidebar-nav-label {
          font-family: var(--font-display);
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 6px 10px 4px;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          margin-bottom: 3px;
        }

        .sidebar-nav-item:hover {
          background: var(--bg-gray);
          color: var(--brand-primary);
          transform: translateX(2px);
        }

        .sidebar-nav-item--active {
          background: var(--brand-light);
          color: var(--brand-primary);
          font-weight: 650;
        }

        .sidebar-nav-item--active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 3px;
          background: var(--brand-primary);
          border-radius: 0 4px 4px 0;
        }

        .sidebar-nav-item--active .sidebar-nav-icon {
          color: var(--brand-primary);
        }

        .sidebar-nav-arrow {
          margin-left: auto;
          color: var(--brand-secondary);
          opacity: 0.8;
        }

        .sidebar-footer {
          padding: 16px 18px;
          border-top: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-card);
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
