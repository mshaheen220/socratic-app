import React, { useState } from 'react';
import QuestionStep from './components/QuestionStep';
import MultiSelectStep from './components/MultiSelectStep';
import Dashboard from './components/Dashboard';
import SessionDetails from './components/SessionDetails';
import { THINKING_ERRORS } from './constants/thinkingErrors';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [history, setHistory] = useLocalStorage('socratic_history', []);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'wizard'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [step, setStep] = useState(1);
  const [session, setSession] = useState({
    thought: '',
    selectedErrors: [],
    evidenceFor: '',
    evidenceAgainst: '',
    feelingsVsFacts: '',
    levelOfCriticism: '',
    exaggerationCheck: '',
    alternativeInterpretations: '',
    habitOrPast: '',
    likelihoodVsPossibility: ''
  });

  const totalSteps = 5;

  const startNewSession = () => {
    setSession({
      thought: '',
      selectedErrors: [],
      evidenceFor: '',
      evidenceAgainst: '',
      feelingsVsFacts: '',
      levelOfCriticism: '',
      exaggerationCheck: '',
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

  const saveSession = () => {
    if (!session.thought) return alert("Identify a thought first!");
    setHistory([...history, { ...session, id: Date.now() }]);
    setSession({
      thought: '',
      selectedErrors: [],
      evidenceFor: '',
      evidenceAgainst: '',
      feelingsVsFacts: '',
      levelOfCriticism: '',
      exaggerationCheck: '',
      alternativeInterpretations: '',
      habitOrPast: '',
      likelihoodVsPossibility: ''
    });
    setStep(1);
    setView('dashboard');
  };

  return (
    <div className="app-container">
      {view === 'dashboard' ? (
        <Dashboard 
          entries={history} 
          onNewSession={startNewSession} 
          onViewEntry={setSelectedEntry} 
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
              options={THINKING_ERRORS}
              value={session.selectedErrors}
              onChange={(val) => setSession({...session, selectedErrors: val})}
            />
          )}

          {step === 3 && (
            <>
              <QuestionStep 
                label="3. Evidence for this thought:"
                value={session.evidenceFor}
                onChange={(v) => setSession({...session, evidenceFor: v})}
                placeholder="Listing facts that support the thought."
              />

              <QuestionStep 
                label="4. Evidence against this thought:"
                value={session.evidenceAgainst}
                onChange={(v) => setSession({...session, evidenceAgainst: v})}
                placeholder="Listing facts that contradict the thought."
              />
            </>
          )}

          {step === 4 && (
            <>
              <MultiSelectStep 
                label="5. Feelings vs. Facts:"
                options={[
                  { id: 'feelings', label: 'Feelings' },
                  { id: 'facts', label: 'Facts' }
                ]}
                value={session.feelingsVsFacts}
                onChange={(val) => setSession({...session, feelingsVsFacts: val})}
                singleSelect={true}
              />

              <QuestionStep 
                label="6. Level of Criticism:"
                value={session.levelOfCriticism}
                onChange={(v) => setSession({...session, levelOfCriticism: v})}
                placeholder="Evaluating if the thought is overly critical of yourself or others."
              />

              <QuestionStep 
                label="7. Exaggeration Check:"
                value={session.exaggerationCheck}
                onChange={(v) => setSession({...session, exaggerationCheck: v})}
                placeholder="Reflecting on whether the thought might be an exaggeration of the truth."
              />
            </>
          )}

          {step === 5 && (
            <>
              <QuestionStep 
                label="8. Alternative Interpretations:"
                value={session.alternativeInterpretations}
                onChange={(v) => setSession({...session, alternativeInterpretations: v})}
                placeholder="Considering how others might interpret the same situation differently."
              />

              <MultiSelectStep 
                label="9. Habit or Past Experience:"
                options={[
                  { id: 'habit', label: 'Old Habit' },
                  { id: 'past', label: 'Past Experience' },
                  { id: 'current', label: 'Current Truth' }
                ]}
                value={session.habitOrPast}
                onChange={(val) => setSession({...session, habitOrPast: val})}
                singleSelect={false}
              />

              <MultiSelectStep 
                label="10. Likelihood vs. Possibility:"
                options={[
                  { id: 'likely', label: 'Likely Outcome' },
                  { id: 'possible', label: 'Just a Possibility' }
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
              <button onClick={saveSession} className="nav-btn success">Save Session</button>
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