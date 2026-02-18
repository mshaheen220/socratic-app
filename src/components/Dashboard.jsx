import React from 'react';

const Dashboard = ({ entries, onNewSession, onViewEntry, onDeleteEntry }) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="app-title" style={{ marginBottom: 0, border: 'none' }}>My Thoughts</h1>
        <button onClick={onNewSession} className="nav-btn primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', flex: 'none' }}>
          New Session
        </button>
      </div>
      
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;