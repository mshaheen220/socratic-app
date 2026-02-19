import React, { useState } from 'react';
import QuestionStep from './components/QuestionStep';
import MultiSelectStep from './components/MultiSelectStep';
import Dashboard from './components/Dashboard';
import SessionDetails from './components/SessionDetails';
import { THINKING_ERRORS } from './constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from './constants/cognitiveDisorders';
import { generateSessionInsight } from './services/gemini';
import { useLocalStorage } from './hooks/useLocalStorage';
import { importData } from './utils';

export default function App() {
  const [history, setHistory] = useLocalStorage('socratic_history', []);
  const [lastBackup, setLastBackup] = useLocalStorage('socratic_last_backup', null);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'wizard'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [session, setSession] = useState({
    thought: '',
    selectedErrors: [],
    selectedDistortions: [],
    evidenceFor: '',
    evidenceAgainst: '',
    feelingsVsFacts: '',
    alternativeInterpretations: '',
    habitOrPast: '',
    likelihoodVsPossibility: ''
  });

  const totalSteps = 6;

  const startNewSession = () => {
    setSession({
      thought: '',
      selectedErrors: [],
      selectedDistortions: [],
      evidenceFor: '',
      evidenceAgainst: '',
      feelingsVsFacts: '',
      alternativeInterpretations: '',
      habitOrPast: '',
      likelihoodVsPossibility: ''
    });
    setStep(1);
    setView('wizard');
  };

  const nextStep = () => {
    if (step === 1 && !session.thought) return alert("Please identify a thought first!");
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const saveSession = async () => {
    if (!session.thought) return alert("Identify a thought first!");

    setIsGenerating(true);
    let aiData = null;
    try {
      aiData = await generateSessionInsight(session);
    } catch (e) {
      console.error(e);
    }

    const newEntry = {
      ...session,
      aiSummary: aiData?.summary,
      aiBalancedThought: aiData?.balancedThought,
      aiScores: aiData?.scores,
      id: Date.now()
    };
    setHistory([...history, newEntry]);
    setSession({
      thought: '',
      selectedErrors: [],
      selectedDistortions: [],
      evidenceFor: '',
      evidenceAgainst: '',
      feelingsVsFacts: '',
      alternativeInterpretations: '',
      habitOrPast: '',
      likelihoodVsPossibility: ''
    });
    setStep(1);
    setView('dashboard');
    setSelectedEntry(newEntry);
    setIsGenerating(false);
  };

  const deleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      setHistory(history.filter(h => h.id !== id));
    }
  };

  const handleImport = async (file) => {
    if (!file) return;
    try {
      const data = await importData(file);
      if (Array.isArray(data)) {
        const existingIds = new Set(history.map(item => item.id));
        const newItems = data.filter(item => !existingIds.has(item.id));
        
        if (newItems.length > 0) {
          setHistory([...history, ...newItems]);
          alert(`Successfully imported ${newItems.length} sessions.`);
        } else {
          alert('No new sessions found in backup.');
        }
      } else {
        alert('Invalid backup file format.');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import backup file.');
    }
  };

  return (
    <div className="app-container">
      {view === 'dashboard' ? (
        <Dashboard 
          entries={history} 
          onNewSession={startNewSession} 
          onViewEntry={setSelectedEntry} 
          onDeleteEntry={deleteEntry}
          onImport={handleImport}
          lastBackup={lastBackup}
          onRecordBackup={() => setLastBackup(Date.now())}
        />
      ) : (
        <>
          <h1 className="app-title">
            Socratic Restructuring 
            <span style={{fontSize: '0.5em', color: '#6b7280', fontWeight: 'normal', marginLeft: '10px'}}>
              (Step {step} of {totalSteps})
            </span>
          </h1>
          
          {step === 1 && (
            <QuestionStep 
              label="1. Thought I want to question:"
              value={session.thought}
              onChange={(v) => setSession({...session, thought: v})}
              placeholder="Identifying the specific negative thought."
            />
          )}

          {step === 2 && (
            <MultiSelectStep 
              label="2. Which thinking errors are present?"
              description="Identify any cognitive distortions that might be influencing this thought. Select all that apply."
              options={THINKING_ERRORS}
              value={session.selectedErrors}
              onChange={(val) => setSession({...session, selectedErrors: val})}
            />
          )}

          {step === 3 && (
            <MultiSelectStep 
              label="3. Are there other cognitive distortions?"
              description="Check if any of these specific distortions apply to your thought."
              options={COGNITIVE_DISTORTIONS}
              value={session.selectedDistortions}
              onChange={(val) => setSession({...session, selectedDistortions: val})}
            />
          )}

          {step === 4 && (
            <>
              <QuestionStep 
                label="4. Evidence for this thought:"
                value={session.evidenceFor}
                onChange={(v) => setSession({...session, evidenceFor: v})}
                placeholder="Listing facts that support the thought."
              />

              <QuestionStep 
                label="5. Evidence against this thought:"
                value={session.evidenceAgainst}
                onChange={(v) => setSession({...session, evidenceAgainst: v})}
                placeholder="Listing facts that contradict the thought."
              />
            </>
          )}

          {step === 5 && (
            <>
              <MultiSelectStep 
                label="6. Feelings vs. Facts:"
                description="Determining if the thought is based on emotions rather than objective reality."
                options={[
                  { id: 'feelings', label: 'Feelings', description: 'The thought is based more on emotions than objective reality.' },
                  { id: 'facts', label: 'Facts', description: 'The thought is based on verifiable facts.' }
                ]}
                value={session.feelingsVsFacts}
                onChange={(val) => setSession({...session, feelingsVsFacts: val})}
                singleSelect={true}
              />
              <QuestionStep 
                label="7. Alternative Interpretations:"
                value={session.alternativeInterpretations}
                onChange={(v) => setSession({...session, alternativeInterpretations: v})}
                placeholder="Considering how others might interpret the same situation differently."
              />
            </>
          )}

          {step === 6 && (
            <>
              <MultiSelectStep 
                label="8. Habit or Past Experience:"
                description="Assessing if the thought is based on old habits or past events rather than current truth. Select all that apply."
                options={[
                  { id: 'habit', label: 'Old Habit', description: 'The thought is a habitual pattern that may not reflect current reality.' },
                  { id: 'past', label: 'Past Experience', description: 'The thought is based on past experiences that may not be relevant now.' },
                  { id: 'current', label: 'Current Truth', description: 'The thought is based on current, accurate information.' }
                ]}
                value={session.habitOrPast}
                onChange={(val) => setSession({...session, habitOrPast: val})}
                singleSelect={false}
              />

              <MultiSelectStep 
                label="9. Likelihood vs. Possibility:"
                description="Deciding if the scenario is a likely outcome or just one of many possibilities."
                options={[
                  { id: 'likely', label: 'Likely Outcome', description: 'The thought is based on a high probability of occurrence.' },
                  { id: 'possible', label: 'Just a Possibility', description: 'The thought is based on a low probability of occurrence.' }
                ]}
                value={session.likelihoodVsPossibility}
                onChange={(val) => setSession({...session, likelihoodVsPossibility: val})}
                singleSelect={true}
              />
            </>
          )}

          <div className="nav-buttons">
            {step > 1 ? (
              <button onClick={prevStep} className="nav-btn secondary">Back</button>
            ) : (
              <button onClick={() => setView('dashboard')} className="nav-btn secondary">Cancel</button>
            )}
            {step < totalSteps ? (
              <button onClick={nextStep} className="nav-btn primary">Next</button>
            ) : (
              <button onClick={saveSession} disabled={isGenerating} className="nav-btn success">
                {isGenerating ? 'Saving & Analyzing...' : 'Save Session'}
              </button>
            )}
          </div>
        </>
      )}

      {selectedEntry && (
        <SessionDetails 
          session={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
        />
      )}
    </div>
  );
}