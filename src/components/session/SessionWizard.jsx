import QuestionStep from './QuestionStep';
import MultiSelectStep from './MultiSelectStep';
import { THINKING_ERRORS } from '../../constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from '../../constants/cognitiveDisorders';

const SessionWizard = ({
  session,
  setSession,
  step,
  totalSteps,
  onNext,
  onPrev,
  onCancel,
  onExit,
  onSave,
  isGenerating
}) => {
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

  return (
    <>
      <button 
        onClick={onCancel}
        className="close-btn wizard-close-btn"
        aria-label="Cancel session"
        title="Cancel session"
      >
        &times;
      </button>
      <h1 className="app-title">
        {getWorkflowInfo().title}
        <span className="step-counter">
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
          <div className="section">
            <label className="section-label">4. Control Audit</label>
            <p className="section-description">Separate the situation into two buckets.</p>
            <textarea className="textarea-stacked" rows="3" placeholder="What is IN my control?" value={session.controlIn} onChange={(e) => setSession({...session, controlIn: e.target.value})} />
            <textarea rows="3" placeholder="What is OUT of my control?" value={session.controlOut} onChange={(e) => setSession({...session, controlOut: e.target.value})} />
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
          <div className="section">
            <label className="section-label">3. Let it go</label>
            <p className="section-description">Since this is hypothetical, there is nothing to solve right now. The best approach is to shift your focus.</p>
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
          <div className="section">
            <label className="section-label">2a. Explanation</label>
            <textarea 
              className="textarea-stacked"
              rows="3" 
              placeholder="Briefly explain what happened or how you are feeling." 
              value={session.moodExplanation} 
              onChange={(e) => setSession({...session, moodExplanation: e.target.value})} 
            />
          </div>
          <div className="section">
            <label className="section-label">2b. Current Intensity: <span style={{ color: getIntensityColor(session.moodIntensityBefore) }}>{session.moodIntensityBefore}</span></label>
            <input 
              type="range" 
              min="0" 
              max="10" 
              value={session.moodIntensityBefore} 
              onChange={(e) => setSession({...session, moodIntensityBefore: parseInt(e.target.value)})}
              className="range-slider"
              style={{ accentColor: getIntensityColor(session.moodIntensityBefore) }}
            />
            <div className="range-labels">
              <span>0 (Calm)</span>
              <span>10 (Maximum Distress)</span>
            </div>
          </div>
        </>
      )}

      <div className="nav-buttons">
        {step > 1 ? (
          <button onClick={onPrev} className="nav-btn secondary">Back</button>
        ) : (
          <button onClick={onExit} className="nav-btn secondary">Cancel</button>
        )}
        {step < totalSteps ? (
          <button onClick={onNext} className="nav-btn primary">Next</button>
        ) : (
          <button onClick={onSave} disabled={isGenerating} className="nav-btn success">
            {isGenerating ? 'Saving & Analyzing...' : 'Save Session'}
          </button>
        )}
      </div>
    </>
  );
};

export default SessionWizard;