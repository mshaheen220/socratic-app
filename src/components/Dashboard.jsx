import React, { useRef } from 'react';
import { THINKING_ERRORS } from '../constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from '../constants/cognitiveDisorders';
import Tooltip from './Tooltip';
import InfoSection from './InfoSection';
import { exportData } from '../utils';

const Dashboard = ({ entries, onNewSession, onViewEntry, onDeleteEntry, onImport, lastBackup, onRecordBackup }) => {
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
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="app-title" style={{ marginBottom: 0, border: 'none' }}>My Thoughts</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Tooltip text={backupTooltip}>
            <button 
              onClick={handleBackup} 
              className={`nav-btn secondary ${hasUnsavedChanges ? 'pulse-alert' : ''}`} 
              style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              {hasUnsavedChanges && <span>⚠️</span>} Backup
            </button>
          </Tooltip>
          <button onClick={() => fileInputRef.current.click()} className="nav-btn secondary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Import</button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />
          <button onClick={onNewSession} className="nav-btn primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', flex: 'none' }}>
            New Session
          </button>
        </div>
      </div>

      <InfoSection defaultExpanded={entries.length === 0} />
      
      {entries.length === 0 ? (
        <div className="empty-state">
          <p>No sessions recorded yet.</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Start a new session to begin restructuring your thoughts.</p>
        </div>
      ) : (
        <div className="dashboard-list">
          {entries.slice().reverse().map(entry => (
            <div key={entry.id} className="dashboard-card" onClick={() => onViewEntry(entry)}>
              <div className="card-header">
                <span className="card-date">{new Date(entry.id).toLocaleDateString()}</span>
                <button 
                  className="delete-btn"
                  title="Delete session"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEntry(entry.id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <div className="card-thought">{entry.thought}</div>
              
              {entry.aiBalancedThought && (
                <div style={{ marginTop: '0.75rem', paddingLeft: '0.75rem', borderLeft: '3px solid #10b981', fontSize: '0.9rem', color: '#374151' }}>
                  <div dangerouslySetInnerHTML={{ __html: entry.aiBalancedThought }} />
                </div>
              )}

              {entry.aiScores && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  <span>Intensity: <b>{entry.aiScores.intensity}</b></span>
                  <span>Efficacy: <b>{entry.aiScores.efficacy}</b></span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                {entry.selectedErrors && entry.selectedErrors.map(id => {
                  const item = THINKING_ERRORS.find(e => e.id === id);
                  if (!item) return null;
                  return (
                    <Tooltip key={id} text={item.label}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: item.color?.background || '#e5e7eb',
                        border: `1px solid ${item.color?.text || '#9ca3af'}`
                      }} />
                    </Tooltip>
                  );
                })}
                
                {entry.selectedDistortions && entry.selectedDistortions.map(id => {
                  const item = COGNITIVE_DISTORTIONS.find(d => d.id === id);
                  if (!item) return null;
                  return (
                    <Tooltip key={id} text={item.label}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: item.color?.background || '#e5e7eb',
                        border: `1px solid ${item.color?.text || '#9ca3af'}`
                      }} />
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;