import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShieldCheck, Sun, Moon } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/verify': 'Verify an Answer',
  '/history': 'Verification History',
  '/analytics': 'Analytics',
  '/sources': 'Sources',
  '/settings': 'Settings',
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('verifyai_theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('verifyai_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const title = PAGE_TITLES[location.pathname] || 'VerifyAI';

  function handleSearch(e) {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/history?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  }

  return (
    <header className="app-header">
      {/* Mobile menu btn */}
      <button className="header-menu-btn" onClick={onMenuToggle} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="header-title">{title}</div>

      {/* Right actions */}
      <div className="header-actions">
        <form className="header-search" onSubmit={handleSearch}>
          <Search size={14} className="header-search-icon" />
          <input
            type="text"
            placeholder="Search verifications..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="header-search-input"
          />
        </form>

        {/* Dark/Light Mode toggle */}
        <button
          className="header-icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} color="#F59E0B" /> : <Moon size={17} />}
        </button>

        <div className="header-avatar" title="VerifyAI Active">
          <ShieldCheck size={16} color="#19C463" />
        </div>
      </div>

      <style>{`
        .app-header {
          height: var(--header-height);
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 40;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .header-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 6px;
          border-radius: 8px;
        }
        .header-menu-btn:hover { background: var(--bg-gray); }

        .header-title {
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--text-primary);
          flex: 1;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-search {
          position: relative;
          display: flex;
          align-items: center;
        }

        .header-search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .header-search-input {
          padding: 7px 12px 7px 32px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          color: var(--text-primary);
          background: var(--bg-gray);
          outline: none;
          width: 220px;
          transition: all 0.15s ease;
        }
        .header-search-input:focus {
          border-color: var(--green-primary);
          background: var(--bg-card);
          box-shadow: 0 0 0 3px rgba(25,196,99,0.15);
          width: 260px;
        }
        .header-search-input::placeholder { color: var(--text-muted); }

        .header-icon-btn {
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 7px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .header-icon-btn:hover { background: var(--bg-gray); border-color: var(--text-muted); }

        .header-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--green-light);
          border: 2px solid var(--green-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .header-menu-btn { display: flex; }
          .header-search { display: none; }
          .app-header { padding: 0 16px; }
        }
      `}</style>
    </header>
  );
}
