import React from 'react';
import Card from './Card';

const ThoughtTriage = ({ onSelect, onCancel }) => {
  return (
    <div className="triage-container">
      <h2 className="triage-title">What kind of thought is this?</h2>
      <div className="triage-grid">
        <Card 
          className="triage-card distortion" 
          onClick={() => onSelect('distortion')}
        >
          <h3>Distortion / Bias</h3>
          <p>My thought might be exaggerated, irrational, or untrue. I need to challenge it with facts and logic.</p>
          <ul>
            <li>"I always mess up."</li>
            <li>"They definitely hate me."</li>
            <li>"It's going to be a disaster."</li>
          </ul>
        </Card>

        <Card 
          className="triage-card stressor" 
          onClick={() => onSelect('stressor')}
        >
          <h3>Valid Stressor</h3>
          <p>The situation is real, difficult, and objectively true. I need to find a way to cope and move forward.</p>
          <ul>
            <li>"I lost my job."</li>
            <li>"I have a chronic illness."</li>
            <li>"I can't afford rent this month."</li>
          </ul>
        </Card>
      </div>
      <div className="triage-actions">
        <button onClick={onCancel} className="nav-btn secondary">Cancel</button>
      </div>
    </div>
  );
};

export default ThoughtTriage;