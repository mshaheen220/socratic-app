import React, { useRef, useState } from 'react';
import Tooltip from './Tooltip';
import InfoSection from './InfoSection';
import { exportData } from '../utils';

const Header = ({ 
  entries, 
  onNewSession, 
  onImport, 
  lastBackup, 
  onRecordBackup, 
  theme, 
  toggleTheme, 
  onQuickAdd,
  onViewAnalytics,
  view,
  onViewJournal
}) => {
  const fileInputRef = useRef(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleBackup = () => {
    exportData(entries);
    if (onRecordBackup) onRecordBackup();
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

  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const hasUnsavedChanges = latestEntry && (!lastBackup || latestEntry.id > lastBackup);
  const backupTooltip = lastBackup 
    ? `Last backup: ${new Date(lastBackup).toLocaleString()}` 
    : "No backups yet";

  return (
    <div className="sticky-header">
      <div className="header-content">
        <div className="journal-header">
          <div className="header-title-group">
            <h1 className="app-title journal-title">Mindframe</h1>
            <p className="header-tagline">Structure your thoughts. Reframe your reality.</p>
          </div>
          <div className="journal-actions">
            <div className="desktop-actions">
            <button 
              onClick={onViewJournal} 
              className={`nav-btn btn-sm ${view === 'journal' ? 'primary' : 'secondary'}`}
            >
              Journal
            </button>
            <button 
              onClick={onViewAnalytics} 
              className={`nav-btn btn-sm ${view === 'analytics' ? 'primary' : 'secondary'}`}
            >
              Analytics
            </button>
            <Tooltip text={backupTooltip}>
              <button 
                onClick={handleBackup} 
                className={`nav-btn secondary btn-sm btn-backup ${hasUnsavedChanges ? 'pulse-alert' : ''}`} 
              >
                {hasUnsavedChanges && <span>⚠️</span>} 💾 Backup
              </button>
            </Tooltip>
            <button onClick={() => fileInputRef.current.click()} className="nav-btn secondary btn-sm">📥 Import</button>
            <input type="file" ref={fileInputRef} className="hidden-input" accept=".json" onChange={handleFileChange} />
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Tooltip text="Quick Add Thought">
              <button onClick={handleQuickAdd} className="nav-btn secondary btn-quick-add">
                ⚡
              </button>
            </Tooltip>
            <button onClick={onNewSession} className="nav-btn primary btn-new-session">
              New Session
            </button>
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
            <button onClick={() => { onViewJournal(); setIsMenuOpen(false); }} className={`nav-btn ${view === 'journal' ? 'primary' : 'secondary'}`}>
              Journal
            </button>
            <button onClick={() => { onViewAnalytics(); setIsMenuOpen(false); }} className={`nav-btn ${view === 'analytics' ? 'primary' : 'secondary'}`}>
              Analytics
            </button>
            <div className="mobile-menu-row">
              <button onClick={handleBackup} className={`nav-btn secondary btn-sm btn-backup ${hasUnsavedChanges ? 'pulse-alert' : ''}`} style={{ flex: 1 }}>
                {hasUnsavedChanges && <span>⚠️</span>} Backup
              </button>
              <button onClick={() => { fileInputRef.current.click(); setIsMenuOpen(false); }} className="nav-btn secondary btn-sm" style={{ flex: 1 }}>
                Import
              </button>
              <button 
                className="theme-toggle" 
                onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                aria-label={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
                style={{ flex: 'none' }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        )}

        <InfoSection defaultExpanded={entries.length === 0} />
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
            <div className="quick-add-actions">
              <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowQuickAdd(false)} className="nav-btn secondary">Cancel</button>
                <button onClick={handleSaveQuickAdd} className="nav-btn primary">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;