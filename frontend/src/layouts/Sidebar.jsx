import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShieldCheck, History, BarChart2,
  Database, Settings, ChevronRight, X, Newspaper,
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
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 49, display: 'none',
          }}
          className="mobile-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <ShieldCheck size={18} color="#fff" />
          </div>
          <div>
            <div className="sidebar-logo-name">VerifyAI</div>
            <div className="sidebar-logo-sub">Answer Verification</div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Main</div>
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
              <Icon size={17} className="sidebar-nav-icon" />
              <span>{label}</span>
              {location.pathname === path && <ChevronRight size={14} className="sidebar-nav-arrow" />}
            </NavLink>
          ))}

          <div className="sidebar-nav-label" style={{ marginTop: 8 }}>Data & Config</div>
          {CONFIG_NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={17} className="sidebar-nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer note */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-dot" />
          <span>Demo Mode Active</span>
        </div>
      </aside>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: var(--bg-white);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: transform 0.25s ease;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 16px 16px;
          border-bottom: 1px solid var(--border-light);
        }

        .sidebar-logo-icon {
          width: 34px;
          height: 34px;
          background: var(--green-primary);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(25,196,99,0.35);
        }

        .sidebar-logo-name {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .sidebar-logo-sub {
          font-size: 0.6875rem;
          color: var(--text-muted);
          margin-top: 1px;
        }

        .sidebar-close-btn {
          margin-left: auto;
          display: none;
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 4px;
          border-radius: 6px;
        }
        .sidebar-close-btn:hover { background: var(--bg-subtle); }

        .sidebar-nav {
          flex: 1;
          padding: 12px 10px;
          overflow-y: auto;
        }

        .sidebar-nav-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          padding: 6px 8px 4px;
          margin-top: 4px;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 450;
          transition: all 0.15s;
          position: relative;
          margin-bottom: 1px;
        }

        .sidebar-nav-item:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .sidebar-nav-item--active {
          background: var(--green-light);
          color: var(--green-dark);
          font-weight: 550;
        }

        .sidebar-nav-item--active .sidebar-nav-icon {
          color: var(--green-primary);
        }

        .sidebar-nav-arrow {
          margin-left: auto;
          color: var(--green-primary);
        }

        .sidebar-footer {
          padding: 14px 18px;
          border-top: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .sidebar-footer-dot {
          width: 7px;
          height: 7px;
          background: var(--green-primary);
          border-radius: 50%;
          animation: pulse 2s infinite;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar--open {
            transform: translateX(0);
            box-shadow: var(--shadow-lg);
          }
          .sidebar-close-btn { display: flex; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </>
  );
}
