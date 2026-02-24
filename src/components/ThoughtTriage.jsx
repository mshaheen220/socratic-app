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
          <div className="triage-icon">🧠</div>
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
          className="triage-card stressor" 
          onClick={() => onSelect('stressor')}
        >
          <h3>Valid Stressor</h3>
          <div className="triage-icon">🌪️</div>
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
          className="triage-card worry" 
          onClick={() => onSelect('worry')}
        >
          <h3>Worry Tree</h3>
          <div className="triage-icon">🌳</div>
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
          className="triage-card mood" 
          onClick={() => onSelect('mood')}
        >
          <h3>Mood Reset</h3>
          <div className="triage-icon">🧘</div>
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