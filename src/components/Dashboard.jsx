import React from 'react';

const Dashboard = ({ entries, onNewSession, onViewEntry }) => {
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
                <span className="card-badge">{entry.selectedErrors.length} Errors</span>
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