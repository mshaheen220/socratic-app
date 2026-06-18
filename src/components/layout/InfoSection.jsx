import { version } from '../../../package.json';

const InfoSection = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>About Mindframe</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="info-content info-content-modal">
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
          <p>Your data is securely stored in your user account. You can use the <strong>Export</strong> button to download a full copy of your history at any time, and the <strong>Import</strong> button to add sessions from a file.</p>

          <p className="info-footer">
            <em>Based on worksheets and concepts from <a href="https://www.therapistaid.com" target="_blank" rel="noopener noreferrer">TherapistAid.com</a>. AI analysis is generated using Google Gemini (gemini-2.5-flash-lite).</em> <br />
            Version {version}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;