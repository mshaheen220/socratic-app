import { useState } from 'react';
import Journal from './components/views/Journal';
import ThoughtTriage from './components/session/ThoughtTriage';
import SessionDetails from './components/session/SessionDetails';
import Analytics from './components/views/Analytics';
import Header from './components/layout/Header';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Auth from './components/views/Auth';
import AdminDashboard from './components/views/AdminDashboard';
import SessionWizard from './components/session/SessionWizard';
import { useAppState } from './hooks/useAppState';

function AppContent({ token, username, role, onLogout }) {
  const {
    history,
    settings,
    isLoaded,
    view,
    setView,
    selectedEntry,
    setSelectedEntry,
    step,
    totalSteps,
    isGenerating,
    session,
    setSession,
    startNewSession,
    handleTriageSelect,
    nextStep,
    prevStep,
    saveQuickThought,
    processDraft,
    saveSession,
    deleteEntry,
    cancelSession,
    handleImport,
    updateSettings
  } = useAppState(token, onLogout);

  const { theme, last_export: lastExport } = settings;

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      {view !== 'wizard' && view !== 'triage' && (
        <Header 
          entries={history} 
          onNewSession={startNewSession} 
          onImport={handleImport}
          lastExport={lastExport}
          onRecordExport={() => updateSettings({ ...settings, last_export: Date.now() })}
          theme={theme}
          toggleTheme={() => updateSettings({ ...settings, theme: theme === 'light' ? 'dark' : 'light' })}
          onQuickAdd={saveQuickThought}
          onViewAnalytics={() => setView('analytics')}
          view={view}
          onViewJournal={() => setView('journal')}
          role={role}
          onViewAdmin={() => setView('admin')}
          username={username}
          onLogout={onLogout}
        />
      )}
      <div className="app-container">
      {view === 'journal' ? (
        <Journal 
          entries={history} 
          onViewEntry={setSelectedEntry} 
          onDeleteEntry={deleteEntry}
          onProcessDraft={processDraft}
        />
      ) : view === 'analytics' ? (
        <Analytics entries={history} />
      ) : view === 'admin' && role === 'admin' ? (
        <AdminDashboard token={token} onCancel={() => setView('journal')} />
      ) : view === 'triage' ? (
        <ThoughtTriage 
          onSelect={handleTriageSelect} 
          onCancel={() => setView('journal')} 
          initialThought={session.thought}
        />
      ) : (
        <SessionWizard
          session={session}
          setSession={setSession}
          step={step}
          totalSteps={totalSteps}
          onNext={nextStep}
          onPrev={prevStep}
          onCancel={cancelSession}
          onExit={() => setView('journal')}
          onSave={saveSession}
          isGenerating={isGenerating}
        />
      )}

      {selectedEntry && (
        <SessionDetails 
          session={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
        />
      )}
    </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('socratic_token'));
  const [username, setUsername] = useState(localStorage.getItem('socratic_user'));
  const [role, setRole] = useState(localStorage.getItem('socratic_role') || 'user');

  const handleLogin = (newToken, newUser, newRole) => {
    localStorage.setItem('socratic_token', newToken);
    localStorage.setItem('socratic_user', newUser);
    localStorage.setItem('socratic_role', newRole);
    setToken(newToken);
    setUsername(newUser);
    setRole(newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('socratic_token');
    localStorage.removeItem('socratic_user');
    localStorage.removeItem('socratic_role');
    setToken(null);
    setUsername(null);
    setRole('user');
  };

  return (
    <ErrorBoundary>
      {!token ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <AppContent token={token} username={username} role={role} onLogout={handleLogout} />
      )}
    </ErrorBoundary>
  );
}