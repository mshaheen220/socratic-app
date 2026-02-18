import React from 'react';
import { THINKING_ERRORS } from '../constants/thinkingErrors';

const SessionDetails = ({ session, onClose }) => {
  if (!session) return null;

  const getErrorLabel = (id) => THINKING_ERRORS.find(e => e.id === id)?.label || id;
  
  // Helper to display label for single-select IDs
  const getLabel = (val, options) => {
    if (!val) return 'Not answered';
    const found = options.find(o => o.id === val);
    return found ? found.label : val;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Session Details</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <div className="detail-group">
            <label>Date</label>
            <p>{new Date(session.id).toLocaleString()}</p>
          </div>

          <div className="detail-group">
            <label>Thought</label>
            <p className="highlight-text">{session.thought}</p>
          </div>

          <div className="detail-group">
            <label>Thinking Errors</label>
            <div className="tags">
              {session.selectedErrors.length > 0 ? (
                session.selectedErrors.map(id => (
                  <span key={id} className="tag">{getErrorLabel(id)}</span>
                ))
              ) : (
                <p>None identified</p>
              )}
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-group"><label>Evidence For</label><p>{session.evidenceFor || '-'}</p></div>
            <div className="detail-group"><label>Evidence Against</label><p>{session.evidenceAgainst || '-'}</p></div>
            <div className="detail-group"><label>Feelings vs Facts</label><p>{getLabel(session.feelingsVsFacts, [{id:'feelings', label:'Feelings'}, {id:'facts', label:'Facts'}])}</p></div>
            <div className="detail-group"><label>Level of Criticism</label><p>{session.levelOfCriticism || '-'}</p></div>
            <div className="detail-group"><label>Exaggeration</label><p>{session.exaggerationCheck || '-'}</p></div>
            <div className="detail-group"><label>Alternative View</label><p>{session.alternativeInterpretations || '-'}</p></div>
            <div className="detail-group"><label>Habit/Past</label><p>{getLabel(session.habitOrPast, [{id:'habit', label:'Old Habit'}, {id:'past', label:'Past Experience'}, {id:'current', label:'Current Truth'}])}</p></div>
            <div className="detail-group"><label>Likelihood</label><p>{getLabel(session.likelihoodVsPossibility, [{id:'likely', label:'Likely Outcome'}, {id:'possible', label:'Just a Possibility'}])}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;