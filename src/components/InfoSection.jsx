import React, { useState } from 'react';

const InfoSection = ({ defaultExpanded = false }) => {
  const [showInfo, setShowInfo] = useState(defaultExpanded);

  return (
    <div className="info-section">
      <button 
        onClick={() => setShowInfo(!showInfo)}
        className="info-toggle"
      >
        {showInfo ? 'Hide Info' : 'What is this?'} 
        <span className={`arrow ${showInfo ? 'up' : 'down'}`}>▼</span>
      </button>
      
      {showInfo && (
        <div className="info-content">
          <h3>About Mindframe</h3>
          <p>This tool helps you navigate difficult thoughts and situations using principles from Cognitive Behavioral Therapy (CBT). It helps you distinguish between <strong>distorted thoughts</strong> (which need challenging), <strong>valid stressors</strong> (which need coping strategies), <strong>worries</strong> (which need a plan or acceptance), and <strong>moods</strong> (which need regulation).</p>
          
          <h4>How to use it</h4>
          <ol>
            <li><strong>Quick Add (Optional):</strong> Capture a thought instantly and save it as a draft to process later.</li>
            <li><strong>Triage your thought:</strong> Decide if you are dealing with a <em>Distortion</em>, a <em>Stressor</em>, a <em>Worry</em>, or a <em>Mood</em>.</li>
            <li><strong>For Distortions:</strong> Use Socratic Questioning to examine the evidence and find a more balanced perspective.</li>
            <li><strong>For Stressors:</strong> Use Radical Acceptance and Control Audits to create a resilient coping plan.</li>
            <li><strong>For Worries:</strong> Use the Worry Tree to determine if a problem is hypothetical (let it go) or current (make a plan).</li>
            <li><strong>For Moods:</strong> Use the Mood Reset to identify the emotion and receive a grounding technique to regulate your nervous system.</li>
            <li><strong>Receive AI Analysis:</strong> Get a custom summary and actionable advice based on your inputs.</li>
          </ol>

          <h4>When to use it</h4>
          <p>Use this whenever you feel overwhelmed, anxious, or stuck in a loop of negative thinking. It helps break the cycle by engaging your analytical mind.</p>

          <h4>Privacy & Data</h4>
          <p>Your data is stored <strong>locally on your machine</strong>, so you don't need to worry about others seeing your submissions. Because of this, clearing your browser data may wipe out your history. You can use the <strong>Backup</strong> and <strong>Import</strong> buttons to save your data to a file and restore it later.</p>

          <p className="info-footer"><em>Based on worksheets and concepts from <a href="https://www.therapistaid.com" target="_blank" rel="noopener noreferrer">TherapistAid.com</a>. AI analysis is generated using Google Gemini (gemini-2.5-flash-lite).</em></p>
        </div>
      )}
    </div>
  );
};

export default InfoSection;