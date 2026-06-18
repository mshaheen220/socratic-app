import { useRef, useState } from 'react';
import Tooltip from '../ui/Tooltip';
import InfoSection from './InfoSection';
import { exportData } from '../../utils';

const Header = ({ 
  entries, 
  onNewSession, 
  onImport, 
  lastExport, 
  onRecordExport, 
  theme, 
  toggleTheme, 
  onQuickAdd,
  onViewAnalytics,
  view,
  onViewJournal,
  role,
  onViewAdmin,
  username,
  onLogout
}) => {
  const fileInputRef = useRef(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(entries.length === 0);

  const handleExport = () => {
    exportData(entries);
    if (onRecordExport) onRecordExport();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImport(file);
    }
    e.target.value = null;
  };

  const handleQuickAdd = () => {
    setShowQuickAdd(true);
  };

  const handleSaveQuickAdd = () => {
    if (quickAddText.trim()) {
      onQuickAdd(quickAddText);
      setQuickAddText('');
      setShowQuickAdd(false);
    }
  };

  const exportTooltip = lastExport 
    ? `Last export: ${new Date(lastExport).toLocaleString()}` 
    : "You haven't exported your data yet.";

  return (
    <div className="sticky-header">
      <div className="header-content">
        <div className="journal-header">
          <div className="header-title-group">
            <div className="app-logo">
              <img src="/images/mindframe-logo.png" alt="Mindframe Logo" width="38" height="38" className="app-logo-img" />
            </div>
            <div>
              <h1 className="app-title journal-title">Mindframe</h1>
              <p className="header-tagline">Structure your thoughts. Reframe your reality.</p>
            </div>
          </div>
          <div className="journal-actions">
            <div className="desktop-actions">
            <div className="view-toggle-group">
              <button 
                onClick={onViewJournal} 
                className={`view-toggle-btn ${view === 'journal' ? 'active' : ''}`}
              >
                Journal
              </button>
              <button 
                onClick={onViewAnalytics} 
                className={`view-toggle-btn ${view === 'analytics' ? 'active' : ''}`}
              >
                Analytics
              </button>
            </div>
            <Tooltip text="Quick Add Thought">
              <button onClick={handleQuickAdd} className="nav-btn secondary btn-quick-add">
                ⚡
              </button>
            </Tooltip>
            <input type="file" ref={fileInputRef} className="hidden-input" accept=".json" onChange={handleFileChange} />
            <button onClick={onNewSession} className="nav-btn primary btn-new-session">
              New Session
            </button>
            <div className="settings-menu-container">
              <button onClick={() => setIsSettingsOpen(prev => !prev)} className="nav-btn secondary btn-sm settings-btn">
                ⚙️
              </button>
              {isSettingsOpen && (
                <div className="settings-dropdown">
                  <div className="settings-user-info">
                    Signed in as <span className="username">{username}</span>
                  </div>
                  <div className="settings-divider"></div>
                  {role === 'admin' && (
                    <button onClick={() => { onViewAdmin(); setIsSettingsOpen(false); }} className="settings-item">
                      🛡️ Admin Dashboard
                    </button>
                  )}
                  <button onClick={() => { setShowInfoModal(true); setIsSettingsOpen(false); }} className="settings-item">
                    ℹ️ About / Help
                  </button>
                  <Tooltip text={exportTooltip}>
                    <button onClick={() => { handleExport(); setIsSettingsOpen(false); }} className="settings-item">
                      💾 Export Data
                    </button>
                  </Tooltip>
                  <button onClick={() => { fileInputRef.current.click(); setIsSettingsOpen(false); }} className="settings-item">
                    📥 Import Data
                  </button>
                  <button onClick={() => { toggleTheme(); setIsSettingsOpen(false); }} className="settings-item">
                    {theme === 'light' ? '🌙' : '☀️'} Toggle Theme
                  </button>
                  <div className="settings-divider"></div>
                  <button onClick={() => { onLogout(); setIsSettingsOpen(false); }} className="settings-item logout">
                    Logout
                  </button>
                </div>
              )}
            </div>
            </div>

            <div className="mobile-actions">
              <Tooltip text="Quick Add Thought">
                <button onClick={handleQuickAdd} className="nav-btn secondary btn-quick-add">
                  ⚡
                </button>
              </Tooltip>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="nav-btn secondary btn-sm hamburger-btn"
                aria-label="Menu"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mobile-menu">
            <button onClick={() => { onNewSession(); setIsMenuOpen(false); }} className="nav-btn primary">
              New Session
            </button>
            <div className="view-toggle-group mobile-view-toggle">
              <button onClick={() => { onViewJournal(); setIsMenuOpen(false); }} className={`view-toggle-btn mobile-view-toggle-btn ${view === 'journal' ? 'active' : ''}`}>
                Journal
              </button>
              <button onClick={() => { onViewAnalytics(); setIsMenuOpen(false); }} className={`view-toggle-btn mobile-view-toggle-btn ${view === 'analytics' ? 'active' : ''}`}>
                Analytics
              </button>
            </div>
            {role === 'admin' && (
              <button onClick={() => { onViewAdmin(); setIsMenuOpen(false); }} className={`nav-btn ${view === 'admin' ? 'primary' : 'secondary'}`}>
                Admin Dashboard
              </button>
            )}
            <button onClick={() => { setShowInfoModal(true); setIsMenuOpen(false); }} className="nav-btn secondary">
              About / Help
            </button>
            <div className="mobile-menu-row">
              <button onClick={handleExport} className="nav-btn secondary btn-sm btn-backup mobile-menu-btn">
                Export
              </button>
              <button onClick={() => { fileInputRef.current.click(); setIsMenuOpen(false); }} className="nav-btn secondary btn-sm mobile-menu-btn">
                Import
              </button>
              <button 
                className="theme-toggle" 
                onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                aria-label={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showQuickAdd && (
        <div className="modal-overlay" onClick={() => setShowQuickAdd(false)}>
          <div className="modal-content quick-add-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quick Add</h2>
              <button onClick={() => setShowQuickAdd(false)} className="close-btn">&times;</button>
            </div>
            <textarea
              className="quick-add-textarea"
              value={quickAddText}
              onChange={(e) => setQuickAddText(e.target.value)}
              placeholder="What's on your mind?"
              autoFocus
            />
            <div className="quick-add-actions nav-buttons">
              <button onClick={() => setShowQuickAdd(false)} className="nav-btn secondary">Cancel</button>
              <button onClick={handleSaveQuickAdd} className="nav-btn primary">Save</button>
            </div>
          </div>
        </div>
      )}

      {showInfoModal && (
        <InfoSection onClose={() => setShowInfoModal(false)} />
      )}
    </div>
  );
};

export default Header;