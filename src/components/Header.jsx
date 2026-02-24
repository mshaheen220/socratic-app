import React, { useRef } from 'react';
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
  onViewAnalytics,
  view,
  onViewJournal
}) => {
  const fileInputRef = useRef(null);

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

  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const hasUnsavedChanges = latestEntry && (!lastBackup || latestEntry.id > lastBackup);
  const backupTooltip = lastBackup 
    ? `Last backup: ${new Date(lastBackup).toLocaleString()}` 
    : "No backups yet";

  return (
    <div className="sticky-header">
      <div className="header-content">
        <div className="journal-header">
          <div>
            <h1 className="app-title journal-title">Mindframe</h1>
            <p className="header-tagline">Structure your thoughts. Reframe your reality.</p>
          </div>
          <div className="journal-actions">
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
            <button onClick={onNewSession} className="nav-btn primary btn-new-session">
              New Session
            </button>
          </div>
        </div>

        <InfoSection defaultExpanded={entries.length === 0} />
      </div>
    </div>
  );
};

export default Header;