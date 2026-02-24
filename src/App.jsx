import React, { useState, useEffect } from 'react';
import QuestionStep from './components/QuestionStep';
import MultiSelectStep from './components/MultiSelectStep';
import Journal from './components/Journal';
import ThoughtTriage from './components/ThoughtTriage';
import SessionDetails from './components/SessionDetails';
import Analytics from './components/Analytics';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import { THINKING_ERRORS } from './constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from './constants/cognitiveDisorders';
import { generateSessionInsight } from './services/gemini';
import { useLocalStorage } from './hooks/useLocalStorage';
import { importData } from './utils';

function AppContent() {
  const [history, setHistory] = useLocalStorage('socratic_history', []);
  const [lastBackup, setLastBackup] = useLocalStorage('socratic_last_backup', null);
  const [theme, setTheme] = useLocalStorage('socratic_theme', 'light');
  const [view, setView] = useState('journal'); // 'journal' | 'triage' | 'wizard' | 'analytics'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const initialSessionState = {
    type: 'distortion', // 'distortion' | 'stressor' | 'worry' | 'mood'
    thought: '',
    selectedErrors: [],
    selectedDistortions: [],
    evidenceFor: '',
    evidenceAgainst: '',
    feelingsVsFacts: '',
    alternativeInterpretations: '',
    habitOrPast: '',
    likelihoodVsPossibility: '',
    // Coping Schema
    radicalAcceptance: '',
    worstCase: '',
    worstCasePlan: '',
    controlIn: '',
    controlOut: '',
    // Worry Tree Schema
    worryType: '', // 'current' | 'hypothetical'
    worryActionable: '', // 'yes' | 'no'
    worryPlan: '', // Action plan or distraction technique
    // Mood Reset Schema
    moodIntensityBefore: 5,
    moodExplanation: ''
  };

  const [session, setSession] = useState(initialSessionState);

  const totalSteps = session.type === 'stressor' ? 4 : (session.type === 'worry' ? 4 : (session.type === 'mood' ? 2 : 6));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const startNewSession = () => {
    setSession(initialSessionState);
    setView('triage');
  };

  const handleTriageSelect = (type) => {
    setSession(prev => ({ ...prev, type }));
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
      aiCopingPlan: aiData?.copingPlan,
      aiKeywords: aiData?.keywords,
      aiSuggestedTechniques: aiData?.suggestedTechniques,
      aiScores: aiData?.scores,
      id: Date.now()
    };
    setHistory([...history, newEntry]);
    setSession(initialSessionState);
    setStep(1);
    setView('journal');
    setSelectedEntry(newEntry);
    setIsGenerating(false);
  };

  const deleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      setHistory(history.filter(h => h.id !== id));
    }
  };

  const cancelSession = () => {
    if (window.confirm('Are you sure you want to cancel? All progress in this session will be lost.')) {
      setSession(initialSessionState);
      setStep(1);
      setView('journal');
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getIntensityColor = (val) => {
    if (val <= 3) return 'var(--success)';
    if (val <= 7) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getWorkflowInfo = () => {
    switch (session.type) {
      case 'stressor':
        return { title: 'Valid Stressor', tagline: 'Build resilience for difficult situations.' };
      case 'worry':
        return { title: 'Worry Tree', tagline: 'Manage anxiety and uncertainty.' };
      case 'mood':
        return { title: 'Mood Reset', tagline: 'Regulate your emotions.' };
      default:
        return { title: 'Socratic Restructuring', tagline: 'Challenge your negative thoughts.' };
    }
  };

  // Ensure history is an array to prevent crashes if local storage is corrupted
  const safeHistory = Array.isArray(history) ? history : [];

  return (
    <div className="app-wrapper">
      {view !== 'wizard' && view !== 'triage' && (
        <Header 
          entries={safeHistory} 
          onNewSession={startNewSession} 
          onImport={handleImport}
          lastBackup={lastBackup}
          onRecordBackup={() => setLastBackup(Date.now())}
          theme={theme}
          toggleTheme={toggleTheme}
          onViewAnalytics={() => setView('analytics')}
          view={view}
          onViewJournal={() => setView('journal')}
        />
      )}
      <div className="app-container">
      {view === 'journal' ? (
        <Journal 
          entries={safeHistory} 
          onViewEntry={setSelectedEntry} 
          onDeleteEntry={deleteEntry}
        />
      ) : view === 'analytics' ? (
        <Analytics entries={safeHistory} />
      ) : view === 'triage' ? (
        <ThoughtTriage onSelect={handleTriageSelect} onCancel={() => setView('journal')} />
      ) : (
        <>
          <button 
            onClick={cancelSession}
            className="close-btn"
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}
            aria-label="Cancel session"
            title="Cancel session"
          >
            &times;
          </button>
          <h1 className="app-title">
            {getWorkflowInfo().title}
            <span style={{fontSize: '0.5em', color: '#6b7280', fontWeight: 'normal', marginLeft: '10px'}}>
              (Step {step} of {totalSteps})
            </span>
          </h1>
          <p className="app-tagline">{getWorkflowInfo().tagline}</p>
          
          {/* Step 1: Shared Thought Identification */}
          {step === 1 && (
            <QuestionStep 
              label={session.type === 'stressor' ? "1. What is the stressful situation?" : (session.type === 'worry' ? "1. What are you worried about?" : (session.type === 'mood' ? "1. What event or emotion do you need to reset?" : "1. Thought I want to question:"))}
              value={session.thought}
              onChange={(v) => setSession({...session, thought: v})}
              placeholder={session.type === 'stressor' ? "Describe the difficult situation you are facing." : (session.type === 'worry' ? "Describe the specific worry on your mind." : (session.type === 'mood' ? "e.g., 'I had a bad meeting' or 'I feel overwhelmed'." : "Identifying the specific negative thought."))}
            />
          )}

          {/* DISTORTION WORKFLOW STEPS */}
          {session.type === 'distortion' && step === 2 && (
            <MultiSelectStep 
              label="2. Which thinking errors are present?"
              description="Identify any cognitive distortions that might be influencing this thought. Select all that apply."
              options={THINKING_ERRORS}
              value={session.selectedErrors}
              onChange={(val) => setSession({...session, selectedErrors: val})}
            />
          )}

          {session.type === 'distortion' && step === 3 && (
            <MultiSelectStep 
              label="3. Are there other cognitive distortions?"
              description="Check if any of these specific distortions apply to your thought."
              options={COGNITIVE_DISTORTIONS}
              value={session.selectedDistortions}
              onChange={(val) => setSession({...session, selectedDistortions: val})}
            />
          )}

          {session.type === 'distortion' && step === 4 && (
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

          {session.type === 'distortion' && step === 5 && (
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

          {session.type === 'distortion' && step === 6 && (
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

          {/* COPING WORKFLOW STEPS */}
          {session.type === 'stressor' && step === 2 && (
            <QuestionStep 
              label="2. Radical Acceptance:"
              value={session.radicalAcceptance}
              onChange={(v) => setSession({...session, radicalAcceptance: v})}
              placeholder="What are the facts of this situation that I cannot change right now? (Acknowledging them doesn't mean liking them)."
            />
          )}

          {session.type === 'stressor' && step === 3 && (
            <>
              <QuestionStep 
                label="3a. Decatastrophizing - Worst Case:"
                value={session.worstCase}
                onChange={(v) => setSession({...session, worstCase: v})}
                placeholder="If the worst happened, what would that look like?"
              />
              <QuestionStep 
                label="3b. My Action Plan:"
                value={session.worstCasePlan}
                onChange={(v) => setSession({...session, worstCasePlan: v})}
                placeholder="How would I cope if the worst case happened? Who could help?"
              />
            </>
          )}

          {session.type === 'stressor' && step === 4 && (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">4. Control Audit</label>
                <p className="text-sm text-gray-500 mb-2">Separate the situation into two buckets.</p>
                <textarea className="w-full p-3 border rounded mb-3" rows="3" placeholder="What is IN my control?" value={session.controlIn} onChange={(e) => setSession({...session, controlIn: e.target.value})} />
                <textarea className="w-full p-3 border rounded" rows="3" placeholder="What is OUT of my control?" value={session.controlOut} onChange={(e) => setSession({...session, controlOut: e.target.value})} />
              </div>
            </>
          )}

          {/* WORRY TREE WORKFLOW STEPS */}
          {session.type === 'worry' && step === 2 && (
            <MultiSelectStep 
              label="2. What kind of worry is this?"
              description="Is this about a current problem you can act on, or a hypothetical 'what if'?"
              options={[
                { id: 'current', label: 'Current Problem', description: 'Something happening now or very soon that requires attention.' },
                { id: 'hypothetical', label: 'Hypothetical Situation', description: 'A "What if...?" scenario about the future that may not happen.' }
              ]}
              value={session.worryType}
              onChange={(val) => setSession({...session, worryType: val})}
              singleSelect={true}
            />
          )}

          {session.type === 'worry' && step === 3 && (
            session.worryType === 'hypothetical' ? (
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">3. Let it go</label>
                <p className="text-sm text-gray-500 mb-4">Since this is hypothetical, there is nothing to solve right now. The best approach is to shift your focus.</p>
                <QuestionStep 
                  label="How will you shift your attention?"
                  value={session.worryPlan}
                  onChange={(v) => setSession({...session, worryPlan: v})}
                  placeholder="e.g., Go for a walk, call a friend, focus on my breathing, 5-4-3-2-1 technique."
                />
              </div>
            ) : (
              <MultiSelectStep 
                label="3. Can you do something about it?"
                description="Is there an action you can take to resolve or improve this?"
                options={[
                  { id: 'yes', label: 'Yes, I can act', description: 'There are concrete steps I can take.' },
                  { id: 'no', label: 'No, it is out of my control', description: 'I have to wait or accept the outcome.' }
                ]}
                value={session.worryActionable}
                onChange={(val) => setSession({...session, worryActionable: val})}
                singleSelect={true}
              />
            )
          )}

          {session.type === 'worry' && step === 4 && (
            session.worryType === 'current' && session.worryActionable === 'yes' ? (
              <QuestionStep 
                label="4. Action Plan"
                value={session.worryPlan}
                onChange={(v) => setSession({...session, worryPlan: v})}
                placeholder="What will you do? Will you do it now, or schedule it for later?"
              />
            ) : (
              <QuestionStep 
                label="4. Acceptance Strategy"
                value={session.worryPlan}
                onChange={(v) => setSession({...session, worryPlan: v})}
                placeholder="Since you cannot control this, how will you practice acceptance or self-care?"
              />
            )
          )}

          {/* MOOD RESET WORKFLOW STEPS */}
          {session.type === 'mood' && step === 2 && (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">2a. Explanation</label>
                <textarea 
                  className="w-full p-3 border rounded mb-3" 
                  rows="3" 
                  placeholder="Briefly explain what happened or how you are feeling." 
                  value={session.moodExplanation} 
                  onChange={(e) => setSession({...session, moodExplanation: e.target.value})} 
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">2b. Current Intensity: <span style={{ color: getIntensityColor(session.moodIntensityBefore) }}>{session.moodIntensityBefore}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={session.moodIntensityBefore} 
                  onChange={(e) => setSession({...session, moodIntensityBefore: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: getIntensityColor(session.moodIntensityBefore), width: '100%' }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>0 (Calm)</span>
                  <span>10 (Maximum Distress)</span>
                </div>
              </div>
            </>
          )}

          <div className="nav-buttons">
            {step > 1 ? (
              <button onClick={prevStep} className="nav-btn secondary">Back</button>
            ) : (
              <button onClick={() => setView('journal')} className="nav-btn secondary">Cancel</button>
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
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}