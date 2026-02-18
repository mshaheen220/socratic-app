import React from 'react';
import { THINKING_ERRORS } from '../constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from '../constants/cognitiveDisorders';

const SessionDetails = ({ session, onClose }) => {
  if (!session) return null;

  // Helper to display label for single-select IDs
  const getLabel = (val, options) => {
    if (!val) return 'Not answered';
    const found = options.find(o => o.id === val);
    return found ? found.label : val;
  };

  const habitOptions = [
    {id:'habit', label:'Old Habit', color: { text: '#92400e', background: '#fef3c7' }}, 
    {id:'past', label:'Past Experience', color: { text: '#6b21a8', background: '#f3e8ff' }}, 
    {id:'current', label:'Current Truth', color: { text: '#166534', background: '#dcfce7' }}
  ];

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

          {session.aiInsight && (
            <div className="detail-group" style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px' }}>
              <label style={{ color: '#0369a1' }}>AI Insight</label>
              <div dangerouslySetInnerHTML={{ __html: session.aiInsight }} />
            </div>
          )}

          <div className="detail-group">
            <label>Thinking Errors</label>
            <div className="tags">
              {session.selectedErrors.length > 0 ? (
                session.selectedErrors.map(id => {
                  const error = THINKING_ERRORS.find(e => e.id === id);
                  const style = error?.color ? { backgroundColor: error.color.background, color: error.color.text } : {};
                  return <span key={id} className="tag" style={style}>{error?.label || id}</span>;
                })
              ) : (
                <p>None identified</p>
              )}
            </div>
          </div>

          <div className="detail-group">
            <label>Cognitive Distortions</label>
            <div className="tags">
              {session.selectedDistortions && session.selectedDistortions.length > 0 ? (
                session.selectedDistortions.map(id => {
                  const distortion = COGNITIVE_DISTORTIONS.find(d => d.id === id);
                  const style = distortion?.color ? { backgroundColor: distortion.color.background, color: distortion.color.text } : {};
                  return <span key={id} className="tag" style={style}>{distortion?.label || id}</span>;
                })
              ) : (
                <p>None identified</p>
              )}
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-group"><label>Evidence For</label><p>{session.evidenceFor || '-'}</p></div>
            <div className="detail-group"><label>Evidence Against</label><p>{session.evidenceAgainst || '-'}</p></div>
            <div className="detail-group"><label>Feelings vs Facts</label><p>{getLabel(session.feelingsVsFacts, [{id:'feelings', label:'Feelings'}, {id:'facts', label:'Facts'}])}</p></div>
            <div className="detail-group"><label>Alternative View</label><p>{session.alternativeInterpretations || '-'}</p></div>
            <div className="detail-group">
              <label>Habit/Past</label>
              {Array.isArray(session.habitOrPast) && session.habitOrPast.length > 0 ? (
                <div className="tags">
                  {session.habitOrPast.map(id => {
                    const option = habitOptions.find(o => o.id === id);
                    const style = option?.color ? { backgroundColor: option.color.background, color: option.color.text } : {};
                    return <span key={id} className="tag" style={style}>{option?.label || id}</span>;
                  })}
                </div>
              ) : (
                <p>-</p>
              )}
            </div>
            <div className="detail-group"><label>Likelihood</label><p>{getLabel(session.likelihoodVsPossibility, [{id:'likely', label:'Likely Outcome'}, {id:'possible', label:'Just a Possibility'}])}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;