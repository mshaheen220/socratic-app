import { useMemo } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import WordCloud from '../ui/WordCloud';
import { THINKING_ERRORS } from '../../constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from '../../constants/cognitiveDisorders';
import Card from '../ui/Card';

const Analytics = ({ entries }) => {
  const stats = useMemo(() => {
    const distortionCounts = {};
    const errorCounts = {};
    let totalDistortions = 0;
    let totalErrors = 0;
    let totalIntensity = 0;
    let totalEfficacy = 0;
    let totalResilience = 0;
    let scoreCount = 0;
    let efficacyCount = 0;
    let resilienceCount = 0;
    let distortionSessions = 0;
    let stressorSessions = 0;
    let worrySessions = 0;
    let moodSessions = 0;
    const keywordCounts = {};
    const techniqueCounts = {};
    const worryBreakdown = [
      { name: 'Hypothetical', value: 0, fill: 'var(--gray-400)' }, 
      { name: 'Actionable', value: 0, fill: 'var(--primary)' },   
      { name: 'Acceptance', value: 0, fill: 'var(--teal)' }    
    ];

    const completedEntries = entries.filter(e => e.type !== 'draft');

    completedEntries.forEach(entry => {
      if (entry.type === 'stressor') {
        stressorSessions++;
      } else if (entry.type === 'worry') {
        worrySessions++;
        if (entry.worryType === 'hypothetical') {
          worryBreakdown[0].value++;
        } else if (entry.worryType === 'current') {
          if (entry.worryActionable === 'yes') worryBreakdown[1].value++;
          else if (entry.worryActionable === 'no') worryBreakdown[2].value++;
        }
      } else if (entry.type === 'mood') {
        moodSessions++;
      } else {
        distortionSessions++;
      }

      if (entry.selectedDistortions) {
        entry.selectedDistortions.forEach(id => {
          distortionCounts[id] = (distortionCounts[id] || 0) + 1;
          totalDistortions++;
        });
      }
      if (entry.selectedErrors) {
        entry.selectedErrors.forEach(id => {
          errorCounts[id] = (errorCounts[id] || 0) + 1;
          totalErrors++;
        });
      }
      
      const scores = entry.aiScores;
      if (scores && typeof scores.intensity === 'number') {
        totalIntensity += scores.intensity;
        scoreCount++;

        if (typeof scores.efficacy === 'number') {
          totalEfficacy += scores.efficacy;
          efficacyCount++;
        }
        if (typeof scores.resilience === 'number') {
          totalResilience += scores.resilience;
          resilienceCount++;
        }
      }

      if (entry.aiKeywords && Array.isArray(entry.aiKeywords)) {
        entry.aiKeywords.forEach(word => {
          const key = word.toLowerCase();
          keywordCounts[key] = (keywordCounts[key] || 0) + 1;
        });
      }

      if (entry.aiSuggestedTechniques && Array.isArray(entry.aiSuggestedTechniques)) {
        entry.aiSuggestedTechniques.forEach(tech => {
          const t = tech.trim();
          techniqueCounts[t] = (techniqueCounts[t] || 0) + 1;
        });
      }
    });

    const sortedDistortions = COGNITIVE_DISTORTIONS.map(d => ({
      id: d.id,
      label: d.label,
      count: distortionCounts[d.id] || 0,
      fill: d.color?.background || 'var(--primary)'
    })).sort((a, b) => b.count - a.count);

    const sortedErrors = Object.entries(errorCounts)
      .map(([id, count]) => {
        const def = THINKING_ERRORS.find(e => e.id === id);
        return { 
          id, 
          label: def ? def.label : id, 
          count,
          percentage: totalErrors ? Math.round((count / totalErrors) * 100) : 0,
          fill: def?.color?.background || 'var(--primary)'
        };
      })
      .sort((a, b) => b.count - a.count);

    const chartData = completedEntries
      .map(e => {
        const scores = e.aiScores || {};
        return {
          id: e.id,
          date: new Date(e.id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          timestamp: e.id,
          intensity: scores.intensity,
          efficacy: scores.efficacy,
          resilience: scores.resilience
        };
      })
      .filter(e => typeof e.intensity === 'number')
      .sort((a, b) => a.timestamp - b.timestamp);

    const wordCloudData = Object.entries(keywordCounts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 40);

    const sortedTechniques = Object.entries(techniqueCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const sessionTypeData = [
      { name: 'Distortions', value: distortionSessions, fill: 'var(--primary)' },
      { name: 'Stressors', value: stressorSessions, fill: 'var(--secondary)' },
      { name: 'Worry Tree', value: worrySessions, fill: 'var(--teal)' },
      { name: 'Mood Reset', value: moodSessions, fill: 'var(--orange)' }
    ].filter(d => d.value > 0);

    return { 
      sortedDistortions, 
      sortedErrors, 
      totalSessions: completedEntries.length,
      distortionSessions,
      stressorSessions,
      worrySessions,
      moodSessions,
      worryBreakdown,
      hasWorry: worrySessions > 0,
      avgIntensity: scoreCount ? Math.round(totalIntensity / scoreCount) : 0,
      avgEfficacy: efficacyCount ? Math.round(totalEfficacy / efficacyCount) : 0,
      avgResilience: resilienceCount ? Math.round(totalResilience / resilienceCount) : 0,
      hasScores: scoreCount > 0,
      hasEfficacy: efficacyCount > 0,
      hasResilience: resilienceCount > 0,
      chartData,
      hasDistortions: totalDistortions > 0,
      wordCloudData,
      sortedTechniques,
      hasTechniques: sortedTechniques.length > 0,
      sessionTypeData
    };
  }, [entries]);

  return (
    <div className="analytics-view">
      <div className="analytics-grid">
        <Card title="Total Sessions">
          <div className="chart-container-relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.sessionTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.sessionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-chart-center-label">
              <div className="stat-big adjusted">{stats.totalSessions}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </Card>

        <Card title="Average Scores">
          {stats.hasScores ? (
            <div className="avg-scores-container">
              <div>
                <div className="chart-label">
                  <span>Intensity</span>
                  <span>{stats.avgIntensity}</span>
                </div>
                <div className="chart-bar-bg">
                  <div className="chart-bar-fill fill-warning" style={{ width: `${stats.avgIntensity}%` }}></div>
                </div>
              </div>
              {stats.hasEfficacy && (
              <div>
                <div className="chart-label">
                  <span>Efficacy (Distortions)</span>
                  <span>{stats.avgEfficacy}</span>
                </div>
                <div className="chart-bar-bg">
                  <div className="chart-bar-fill fill-success" style={{ width: `${stats.avgEfficacy}%` }}></div>
                </div>
              </div>
              )}
              {stats.hasResilience && (
              <div>
                <div className="chart-label">
                  <span>Resilience (Stressors/Worry)</span>
                  <span>{stats.avgResilience}</span>
                </div>
                <div className="chart-bar-bg">
                  <div className="chart-bar-fill fill-teal" style={{ width: `${stats.avgResilience}%` }}></div>
                </div>
              </div>
              )}
            </div>
          ) : (
            <p className="empty-text">No score data yet.</p>
          )}
        </Card>

        <Card title="Topic Cloud">
          {stats.wordCloudData.length > 0 ? (
            <div className="tag-cloud-container chart-container">
              <WordCloud words={stats.wordCloudData} />
            </div>
          ) : (
            <p className="empty-text">No keywords generated yet.</p>
          )}
        </Card>

        <Card title="Score Trends">
          {stats.chartData && stats.chartData.length >= 2 ? (
            <div className="chart-container">
              <ResponsiveContainer>
                <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="var(--text-secondary)" 
                    fontSize={12} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis domain={[0, 100]} stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip 
                    labelFormatter={(val) => new Date(val).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} 
                    itemStyle={{ color: 'var(--text)' }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="intensity" stroke="var(--warning)" fill="none" name="Intensity" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4 }} connectNulls />
                  <Line type="monotone" dataKey="efficacy" stroke="var(--success)" fill="none" name="Efficacy" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4 }} connectNulls />
                  <Line type="monotone" dataKey="resilience" stroke="var(--teal)" fill="none" name="Resilience" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-text">Not enough data for trends (need at least 2 sessions with scores).</p>
          )}
        </Card>

        {stats.hasWorry && (
          <Card title="Worry Tree Outcomes">
            <div className="chart-container">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.worryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.worryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {stats.hasTechniques && (
          <Card title="Suggested Techniques">
            <div className="chart-list">
              {stats.sortedTechniques.map((tech, index) => {
                const maxCount = stats.sortedTechniques[0]?.count || 1;
                const percentage = (tech.count / maxCount) * 100;
                return (
                  <div key={index} className="chart-item">
                    <div className="chart-label">
                      <span className="chart-label-name">{tech.name}</span>
                      <span className="chart-label-value">{tech.count}</span>
                    </div>
                    <div className="chart-bar-bg">
                      <div 
                        className="chart-bar-fill fill-orange" 
                        style={{ 
                          width: `${percentage}%`
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card title="Cognitive Distortions Breakdown">
          {stats.hasDistortions ? (
            <div className="chart-container">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.sortedDistortions}
                    labelLine={false}
                    fill="var(--primary)"
                    dataKey="count"
                    nameKey="label"
                    innerRadius="80%"
                    outerRadius="100%"
                    // Corner radius is the rounded edge of each pie slice
                    cornerRadius="50%"
                    // padding angle is the gap between each pie slice
                    paddingAngle={5}
                  >
                    {stats.sortedDistortions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-text">No data yet.</p>
          )}
        </Card>

        <Card title="Thinking Errors">
          {stats.sortedErrors.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="10%" 
                  outerRadius="80%" 
                  barSize={20} 
                  data={stats.sortedErrors.slice(0, 5).map((entry) => ({ ...entry, name: entry.label }))}
                >
                  <RadialBar
                    minAngle={15}
                    background={{ fill: 'transparent' }}
                    clockWise
                    dataKey="count"
                  >
                    {stats.sortedErrors.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </RadialBar>
                  <Tooltip 
                    formatter={(value, name, props) => [value, props.payload.name]}
                    labelStyle={{ display: 'none' }}
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} 
                    itemStyle={{ color: 'var(--text)' }} 
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-text">No data yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
