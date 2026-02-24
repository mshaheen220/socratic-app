import React from 'react';
import { THINKING_ERRORS } from '../constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from '../constants/cognitiveDisorders';
import Tooltip from './Tooltip';

const SessionDetails = ({ session, onClose }) => {
  if (!session) return null;

  const isStressor = session.type === 'stressor';
  const isWorry = session.type === 'worry';
  const title = isStressor ? 'Stressor Details' : (isWorry ? 'Worry Tree Details' : 'Distortion Details');
  const typeTooltip = isStressor 
    ? "Valid Stressor: A real, difficult situation requiring coping and acceptance." 
    : (isWorry ? "Worry Tree: A decision-making tool to handle current problems or let go of hypothetical worries." 
    : "Cognitive Distortion: A biased thought pattern requiring logical challenging.");

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
      <div className={`modal-content ${isStressor ? 'stressor' : (isWorry ? 'worry' : 'distortion')}`} onClick={e => e.stopPropagation()}>
        <div className={`modal-header ${isStressor ? 'stressor' : (isWorry ? 'worry' : 'distortion')}`}>
          <Tooltip text={typeTooltip}>
            <h2 className="session-type-title">{title}</h2>
          </Tooltip>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <div className="detail-group">
            <label>Date</label>
            <p>{new Date(session.id).toLocaleString()}</p>
          </div>

          <div className="detail-group">
            <label>{isStressor ? 'Situation' : (isWorry ? 'Worry' : 'Thought')}</label>
            <p className="highlight-text">{session.thought}</p>
          </div>

          {(session.aiSummary || session.aiBalancedThought || session.aiCopingPlan || session.aiScores || session.aiKeywords) ? (
            <div className={`ai-analysis-card ${isStressor ? 'stressor' : (isWorry ? 'worry' : 'distortion')}`}>
              <h3 className="ai-title">AI Analysis</h3>
              
              {session.aiSummary && (
                <div className="ai-section">
                  <label className="ai-label">Summary</label>
                  <div dangerouslySetInnerHTML={{ __html: session.aiSummary }} />
                </div>
              )}

              {session.aiBalancedThought && (
                <div className="ai-section">
                  <label className="ai-label">Balanced Thought</label>
                  <div dangerouslySetInnerHTML={{ __html: session.aiBalancedThought }} />
                </div>
              )}

              {session.aiCopingPlan && (
                <div className="ai-section">
                  <label className="ai-label">Coping Plan</label>
                  <div dangerouslySetInnerHTML={{ __html: session.aiCopingPlan }} />
                </div>
              )}

              {session.aiKeywords && session.aiKeywords.length > 0 && (
                <div className="ai-section">
                  <label className="ai-label">Keywords</label>
                  <div className="tags">
                    {session.aiKeywords.map((kw, i) => (
                      <span key={i} className="tag keyword-tag">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {session.aiScores && (
                <div>
                  <label className="ai-label">Scores</label>
                  <div className="ai-scores">
                    <div className="ai-score-badge">
                      <strong>Intensity:</strong> {session.aiScores.intensity}
                    </div>
                    <div className="ai-score-badge">
                      <strong>{isStressor ? 'Resilience' : 'Efficacy'}:</strong> {session.aiScores.resilience || session.aiScores.efficacy}
                    </div>
                  </div>
                  {session.aiScores.scoreExplanation && (
                    <div className="ai-explanation" dangerouslySetInnerHTML={{ __html: session.aiScores.scoreExplanation }} />
                  )}
                </div>
              )}
            </div>
          ) : session.aiInsight && (
            <div className={`ai-analysis-card ${isStressor ? 'stressor' : (isWorry ? 'worry' : 'distortion')}`}>
              <label className="ai-label">AI Insight</label>
              <div dangerouslySetInnerHTML={{ __html: session.aiInsight }} />
            </div>
          )}

          {isStressor ? (
            <div className="detail-grid">
              <div className="detail-group" style={{ gridColumn: '1 / -1' }}>
                <label>Radical Acceptance</label>
                <p>{session.radicalAcceptance || '-'}</p>
              </div>
              <div className="detail-group"><label>Worst Case</label><p>{session.worstCase || '-'}</p></div>
              <div className="detail-group"><label>Action Plan</label><p>{session.worstCasePlan || '-'}</p></div>
              <div className="detail-group"><label>In My Control</label><p>{session.controlIn || '-'}</p></div>
              <div className="detail-group"><label>Out of My Control</label><p>{session.controlOut || '-'}</p></div>
            </div>
          ) : isWorry ? (
            <div className="detail-grid">
              <div className="detail-group"><label>Type</label><p>{getLabel(session.worryType, [{id:'current', label:'Current Problem'}, {id:'hypothetical', label:'Hypothetical'}])}</p></div>
              <div className="detail-group"><label>Actionable</label><p>{getLabel(session.worryActionable, [{id:'yes', label:'Yes'}, {id:'no', label:'No'}])}</p></div>
              <div className="detail-group" style={{ gridColumn: '1 / -1' }}><label>Plan / Strategy</label><p>{session.worryPlan || '-'}</p></div>
            </div>
          ) : (
            <>
              <div className="detail-group">
                <label>Thinking Errors</label>
                <div className="tags">
                  {session.selectedErrors.length > 0 ? (
                    session.selectedErrors.map(id => {
                      const error = THINKING_ERRORS.find(e => e.id === id);
                      const style = error?.color ? { backgroundColor: error.color.background, color: error.color.text } : {};
                      return (
                        <Tooltip key={id} text={error?.description}>
                          <span className="tag" style={style}>{error?.label || id}</span>
                        </Tooltip>
                      );
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
                      return (
                        <Tooltip key={id} text={distortion?.description}>
                          <span className="tag" style={style}>{distortion?.label || id}</span>
                        </Tooltip>
                      );
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;