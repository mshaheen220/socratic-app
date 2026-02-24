import React, { useState } from 'react';
import Card from './Card';
import { getTriageRecommendation } from '../services/gemini';

const ThoughtTriage = ({ onSelect, onCancel }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [helpInput, setHelpInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const handleAnalyze = async () => {
    if (!helpInput.trim()) return;
    setIsAnalyzing(true);
    setRecommendation(null);
    try {
      const result = await getTriageRecommendation(helpInput);
      setRecommendation(result);
    } catch (error) {
      console.error(error);
      alert("Could not analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="triage-container">
      <h2 className="triage-title">What kind of thought is this?</h2>
      
      <div className="triage-help-section">
        {!showHelp ? (
          <button onClick={() => setShowHelp(true)} className="text-btn">🤔 Not sure? Help me decide</button>
        ) : (
          <div className="help-box">
            <p>Briefly describe what's on your mind:</p>
            <div className="help-input-group">
              <textarea 
                value={helpInput} 
                onChange={(e) => setHelpInput(e.target.value)} 
                placeholder="e.g., I'm freaking out about a meeting..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAnalyze();
                  }
                }}
                disabled={isAnalyzing}
                rows={2}
                maxLength={300}
              />
              <button onClick={handleAnalyze} disabled={isAnalyzing || !helpInput.trim()} className="nav-btn primary btn-sm">{isAnalyzing ? '...' : 'Analyze'}</button>
            </div>
            {recommendation && (
              <div className="recommendation-result"><strong>Recommendation: {recommendation.type.toUpperCase()}</strong><p>{recommendation.reason}</p></div>
            )}
            <button onClick={() => { setShowHelp(false); setRecommendation(null); setHelpInput(''); }} className="close-help">&times;</button>
          </div>
        )}
      </div>

      <div className="triage-grid">
        <Card 
          className={`triage-card distortion ${recommendation?.type === 'distortion' ? 'recommended' : ''}`}
          onClick={() => onSelect('distortion')}
        >
          <h3>Distortion / Bias</h3>
          <div className="triage-details">
            <p>My thought might be exaggerated, irrational, or untrue. I need to challenge it with facts and logic.</p>
            <ul>
              <li>"I always mess up."</li>
              <li>"They definitely hate me."</li>
              <li>"It's going to be a disaster."</li>
            </ul>
          </div>
        </Card>

        <Card 
          className={`triage-card stressor ${recommendation?.type === 'stressor' ? 'recommended' : ''}`}
          onClick={() => onSelect('stressor')}
        >
          <h3>Valid Stressor</h3>
          <div className="triage-details">
            <p>The situation is real, difficult, and objectively true. I need to find a way to cope and move forward.</p>
            <ul>
              <li>"I lost my job."</li>
              <li>"I have a chronic illness."</li>
              <li>"I can't afford rent this month."</li>
            </ul>
          </div>
        </Card>

        <Card 
          className={`triage-card worry ${recommendation?.type === 'worry' ? 'recommended' : ''}`}
          onClick={() => onSelect('worry')}
        >
          <h3>Worry Tree</h3>
          <div className="triage-details">
            <p>I am feeling anxious about something. I need to figure out if I can solve it or if I need to let it go.</p>
            <ul>
              <li>"What if I get sick?"</li>
              <li>"I have so much to do tomorrow."</li>
              <li>"I'm worried about the presentation."</li>
            </ul>
          </div>
        </Card>

        <Card 
          className={`triage-card mood ${recommendation?.type === 'mood' ? 'recommended' : ''}`}
          onClick={() => onSelect('mood')}
        >
          <h3>Mood Reset</h3>
          <div className="triage-details">
            <p>I need to "quarantine" a bad event or emotion so it doesn't ruin my day. I need to regulate my nervous system.</p>
            <ul>
              <li>"I'm shaking from that meeting."</li>
              <li>"I just need to calm down."</li>
            </ul>
          </div>
        </Card>
      </div>
      <div className="triage-actions">
        <button onClick={onCancel} className="nav-btn secondary">Cancel</button>
      </div>
    </div>
  );
};

export default ThoughtTriage;