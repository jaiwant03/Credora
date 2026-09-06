import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShieldCheck, Sun, Moon, Command, Sparkles } from 'lucide-react';

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
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('verifyai_theme') || 'light';
  });

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('verifyai_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    function handleStorageChange(e) {
      const incomingTheme = e?.detail?.theme || localStorage.getItem('verifyai_theme') || 'light';
      setTheme(incomingTheme);
    }
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('verifyai_theme_change', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('verifyai_theme_change', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    window.dispatchEvent(new CustomEvent('verifyai_theme_change', { detail: { theme: next } }));
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

      {/* Page title with subtle badge */}
      <div className="header-title-container">
        <h2 className="header-title">{title}</h2>
      </div>

      {/* Right actions */}
      <div className="header-actions">
        <form className="header-search" onSubmit={handleSearch}>
          <Search size={15} className="header-search-icon" />
          <input
            type="text"
            placeholder="Search claims or topics..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="header-search-input"
          />
          <kbd className="header-search-kbd">
            <Command size={10} style={{ marginRight: 2 }} />K
          </kbd>
        </form>

        {/* Theme toggle */}
        <button
          className="header-icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} color="#F59E0B" /> : <Moon size={17} />}
        </button>

        {/* Verified Shield Badge Avatar */}
        <div className="header-avatar" title="VerifyAI Multi-Agent Consensus Online">
          <ShieldCheck size={17} color="#FFFFFF" strokeWidth={2.4} />
        </div>
      </div>

      <style>{`
        .app-header {
          height: var(--header-height);
          background: var(--bg-glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 32px;
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
        .header-menu-btn:hover { background: var(--bg-gray); }

        .header-title-container {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-title {
          font-family: var(--font-display);
          font-weight: 750;
          font-size: 1.0625rem;
          color: var(--text-primary);
          letter-spacing: -0.015em;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-search {
          position: relative;
          display: flex;
          align-items: center;
        }

        .header-search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .header-search-input {
          padding: 8px 36px 8px 36px;
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 0.8125rem;
          color: var(--text-primary);
          background: var(--bg-card);
          box-shadow: var(--shadow-xs);
          outline: none;
          width: 240px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-search-input:focus {
          border-color: var(--brand-secondary);
          background: var(--bg-card);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15), var(--shadow-sm);
          width: 290px;
        }

        .header-search-input::placeholder { color: var(--text-muted); }

        .header-search-kbd {
          position: absolute;
          right: 12px;
          display: flex;
          align-items: center;
          background: var(--bg-gray);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 2px 5px;
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
          pointer-events: none;
        }

        .header-icon-btn {
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          width: 36px;
          height: 36px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-xs);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-icon-btn:hover {
          background: var(--bg-gray);
          border-color: var(--border-hover);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .header-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-avatar:hover {
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
          transform: scale(1.05);
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
