import React, { useState } from 'react';
import { THINKING_ERRORS } from '../constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from '../constants/cognitiveDisorders';
import Tooltip from './Tooltip';
import Card from './Card';

const Journal = ({ entries, onViewEntry, onDeleteEntry }) => {
  const [sortBy, setSortBy] = useState('dateDesc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    errors: [],
    distortions: [],
    intensity: 'all',
    efficacy: 'all'
  });

  const toggleFilter = (category, id) => {
    setFilters(prev => {
      const current = prev[category];
      return {
        ...prev,
        [category]: current.includes(id) 
          ? current.filter(item => item !== id)
          : [...current, id]
      };
    });
  };

  const getProcessedEntries = () => {
    let result = [...entries];

    // Apply Filters
    if (filters.type !== 'all') {
      result = result.filter(e => (e.type || 'distortion') === filters.type);
    }
    if (filters.errors.length > 0) {
      result = result.filter(e => e.selectedErrors?.some(id => filters.errors.includes(id)));
    }
    if (filters.distortions.length > 0) {
      result = result.filter(e => e.selectedDistortions?.some(id => filters.distortions.includes(id)));
    }
    if (filters.intensity !== 'all') {
      result = result.filter(e => {
        const score = e.aiScores?.intensity || 0;
        return filters.intensity === 'high' ? score >= 50 : score < 50;
      });
    }
    if (filters.efficacy !== 'all') {
      result = result.filter(e => {
        const score = e.aiScores?.efficacy || e.aiScores?.resilience || 0;
        return filters.efficacy === 'high' ? score >= 50 : score < 50;
      });
    }

    // Apply Sort
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'dateAsc':
          return a.id - b.id;
        case 'dateDesc':
          return b.id - a.id;
        case 'intensityDesc':
          return (b.aiScores?.intensity || 0) - (a.aiScores?.intensity || 0);
        case 'intensityAsc':
          return (a.aiScores?.intensity || 0) - (b.aiScores?.intensity || 0);
        case 'efficacyDesc':
          return (b.aiScores?.efficacy || b.aiScores?.resilience || 0) - (a.aiScores?.efficacy || a.aiScores?.resilience || 0);
        case 'efficacyAsc':
          return (a.aiScores?.efficacy || a.aiScores?.resilience || 0) - (b.aiScores?.efficacy || b.aiScores?.resilience || 0);
        default:
          return b.id - a.id;
      }
    });
  };

  const processedEntries = getProcessedEntries();
  
  const showDistortionFilters = filters.type === 'all' || filters.type === 'distortion';
  const efficacyLabel = (filters.type === 'stressor' || filters.type === 'worry' || filters.type === 'mood') ? 'Resilience' : (filters.type === 'distortion' ? 'Efficacy' : 'Efficacy / Resilience');

  return (
    <div className="journal">
      {entries.length === 0 ? (
        <div className="empty-state">
          <p>No sessions recorded yet.</p>
          <p className="empty-state-text">Start a new session to begin restructuring your thoughts.</p>
        </div>
      ) : (
        <>
          <div className="journal-controls">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="nav-btn secondary btn-filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              {showFilters ? 'Hide Filters' : 'Filter'}
              {(filters.type !== 'all' || filters.errors.length > 0 || filters.distortions.length > 0 || filters.intensity !== 'all' || filters.efficacy !== 'all') && (
                <span className="filter-badge">
                  {(filters.type !== 'all' ? 1 : 0) + filters.errors.length + filters.distortions.length + (filters.intensity !== 'all' ? 1 : 0) + (filters.efficacy !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="dateDesc">Date: Newest First</option>
              <option value="dateAsc">Date: Oldest First</option>
              <option value="intensityDesc">Intensity: High to Low</option>
              <option value="intensityAsc">Intensity: Low to High</option>
              <option value="efficacyDesc">{efficacyLabel}: High to Low</option>
              <option value="efficacyAsc">{efficacyLabel}: Low to High</option>
            </select>
          </div>

          {showFilters && (
            <div className="filter-panel">
              <div className="filter-header">
                <h3 className="filter-title">Filters</h3>
                <button 
                  onClick={() => setFilters({ type: 'all', errors: [], distortions: [], intensity: 'all', efficacy: 'all' })}
                  className="btn-clear-filters"
                >
                  Clear all
                </button>
              </div>

              <div className="filter-grid">
                <div>
                  <label className="filter-section-label">Entry Type</label>
                  <div className="filter-tags">
                    <button
                      onClick={() => setFilters({...filters, type: 'all'})}
                      className={`filter-tag ${filters.type === 'all' ? 'active' : ''}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilters({...filters, type: 'distortion'})}
                      className={`filter-tag ${filters.type === 'distortion' ? 'active' : ''}`}
                    >
                      Distortions
                    </button>
                    <button
                      onClick={() => setFilters({...filters, type: 'stressor', errors: [], distortions: []})}
                      className={`filter-tag ${filters.type === 'stressor' ? 'active' : ''}`}
                    >
                      Stressors
                    </button>
                    <button
                      onClick={() => setFilters({...filters, type: 'worry', errors: [], distortions: []})}
                      className={`filter-tag ${filters.type === 'worry' ? 'active' : ''}`}
                    >
                      Worry Tree
                    </button>
                    <button
                      onClick={() => setFilters({...filters, type: 'mood', errors: [], distortions: []})}
                      className={`filter-tag ${filters.type === 'mood' ? 'active' : ''}`}
                    >
                      Mood Reset
                    </button>
                  </div>
                </div>

                {showDistortionFilters && (
                <div>
                  <label className="filter-section-label">Thinking Errors</label>
                  <div className="filter-tags">
                    {THINKING_ERRORS.map(err => (
                      <button
                        key={err.id}
                        onClick={() => toggleFilter('errors', err.id)}
                        className={`filter-tag ${filters.errors.includes(err.id) ? 'active' : ''}`}
                      >
                        {err.label}
                      </button>
                    ))}
                  </div>
                </div>
                )}

                {showDistortionFilters && (
                <div>
                  <label className="filter-section-label">Cognitive Distortions</label>
                  <div className="filter-tags">
                    {COGNITIVE_DISTORTIONS.map(dist => (
                      <button
                        key={dist.id}
                        onClick={() => toggleFilter('distortions', dist.id)}
                        className={`filter-tag ${filters.distortions.includes(dist.id) ? 'active' : ''}`}
                      >
                        {dist.label}
                      </button>
                    ))}
                  </div>
                </div>
                )}

                <div>
                  <label className="filter-section-label">Scores</label>
                  <div className="filter-scores">
                    <select value={filters.intensity} onChange={(e) => setFilters({...filters, intensity: e.target.value})} className="score-select">
                      <option value="all">Intensity: Any</option>
                      <option value="high">High Intensity (50+)</option>
                      <option value="low">Low Intensity (&lt;50)</option>
                    </select>
                    <select value={filters.efficacy} onChange={(e) => setFilters({...filters, efficacy: e.target.value})} className="score-select">
                      <option value="all">{efficacyLabel}: Any</option>
                      <option value="high">High {efficacyLabel} (50+)</option>
                      <option value="low">Low {efficacyLabel} (&lt;50)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="journal-list">
            {processedEntries.length === 0 ? (
              <div className="no-results">
                No entries match your filters.
              </div>
            ) : processedEntries.map(entry => {
              const isStressor = entry.type === 'stressor';
              const isWorry = entry.type === 'worry';
              const isMood = entry.type === 'mood';
              return (
            <Card key={entry.id} className={`journal-card ${isStressor ? 'stressor' : (isWorry ? 'worry' : (isMood ? 'mood' : 'distortion'))}`} onClick={() => onViewEntry(entry)}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="card-badge" style={{ backgroundColor: isStressor ? 'var(--secondary)' : (isWorry ? 'var(--teal)' : (isMood ? 'var(--orange)' : 'var(--primary)')), color: 'white' }}>
                    {isStressor ? 'Stressor' : (isWorry ? 'Worry' : (isMood ? 'Mood' : 'Distortion'))}
                  </span>
                  <span className="card-date">{new Date(entry.id).toLocaleDateString()}</span>
                </div>
                <button 
                  className="delete-btn"
                  title="Delete session"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEntry(entry.id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <div className="card-thought">{entry.thought}</div>
              
              {(isStressor || isWorry || isMood) && entry.aiCopingPlan ? (
                <div className="balanced-thought-preview">
                  <div dangerouslySetInnerHTML={{ __html: entry.aiCopingPlan }} />
                </div>
              ) : entry.aiBalancedThought && (
                <div className="balanced-thought-preview">
                  <div dangerouslySetInnerHTML={{ __html: entry.aiBalancedThought }} />
                </div>
              )}

              {entry.aiScores && (
                <div className="scores-preview">
                  <span>Intensity: <b>{entry.aiScores.intensity}</b></span>
                  <span>{(isStressor || isWorry || isMood) ? 'Resilience' : 'Efficacy'}: <b>{entry.aiScores.resilience || entry.aiScores.efficacy}</b></span>
                </div>
              )}

              {isMood && entry.aiSuggestedTechniques && entry.aiSuggestedTechniques.length > 0 && (
                <div className="keywords-list">
                  {entry.aiSuggestedTechniques.map((tech, i) => (
                    <span key={i} className="keyword-pill mood">{tech}</span>
                  ))}
                </div>
              )}

              {entry.aiKeywords && entry.aiKeywords.length > 0 && (
                <div className="keywords-list">
                  {entry.aiKeywords.map((kw, i) => (
                    <span key={i} className="keyword-pill">{kw}</span>
                  ))}
                </div>
              )}

              <div className="tags-preview">
                {entry.selectedErrors && entry.selectedErrors.map(id => {
                  const item = THINKING_ERRORS.find(e => e.id === id);
                  if (!item) return null;
                  return (
                    <Tooltip key={id} text={item.label}>
                      <div className="dot-indicator dot-error" style={{
                        backgroundColor: item.color?.background || 'var(--border)',
                        border: `1px solid ${item.color?.text || 'var(--gray-400)'}`
                      }} />
                    </Tooltip>
                  );
                })}
                
                {entry.selectedDistortions && entry.selectedDistortions.map(id => {
                  const item = COGNITIVE_DISTORTIONS.find(d => d.id === id);
                  if (!item) return null;
                  return (
                    <Tooltip key={id} text={item.label}>
                      <div className="dot-indicator dot-distortion" style={{
                        backgroundColor: item.color?.background || 'var(--border)',
                        border: `1px solid ${item.color?.text || 'var(--gray-400)'}`
                      }} />
                    </Tooltip>
                  );
                })}
              </div>
            </Card>
          )})}
          </div>
        </>
      )}
    </div>
  );
};

export default Journal;
