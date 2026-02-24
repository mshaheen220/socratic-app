import React, { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import WordCloud from './WordCloud';
import { THINKING_ERRORS } from '../constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from '../constants/cognitiveDisorders';
import Card from './Card';

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
    const keywordCounts = {};
    const worryBreakdown = [
      { name: 'Hypothetical', value: 0, fill: '#9ca3af' }, // Gray
      { name: 'Actionable', value: 0, fill: '#4f46e5' },   // Indigo
      { name: 'Acceptance', value: 0, fill: '#14b8a6' }    // Teal
    ];

    entries.forEach(entry => {
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
    });

    const sortedDistortions = COGNITIVE_DISTORTIONS.map(d => ({
      id: d.id,
      label: d.label,
      count: distortionCounts[d.id] || 0,
      fill: d.color?.background || '#8884d8'
    })).sort((a, b) => b.count - a.count);

    const sortedErrors = Object.entries(errorCounts)
      .map(([id, count]) => {
        const def = THINKING_ERRORS.find(e => e.id === id);
        return { 
          id, 
          label: def ? def.label : id, 
          count,
          percentage: totalErrors ? Math.round((count / totalErrors) * 100) : 0,
          fill: def?.color?.background || '#8884d8'
        };
      })
      .sort((a, b) => b.count - a.count);

    const chartData = entries
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

    return { 
      sortedDistortions, 
      sortedErrors, 
      totalSessions: entries.length,
      distortionSessions,
      stressorSessions,
      worrySessions,
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
      wordCloudData
    };
  }, [entries]);

  return (
    <div className="analytics-view">
      <div className="analytics-grid">
        <Card title="Total Sessions">
          <div className="stat-big">{stats.totalSessions}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>{stats.distortionSessions}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Distortions</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: '700', color: 'var(--secondary)' }}>{stats.stressorSessions}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stressors</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: '700', color: 'var(--teal)' }}>{stats.worrySessions}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Worry Tree</span>
            </div>
          </div>
        </Card>

        <Card title="Average Scores">
          {stats.hasScores ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div className="chart-label">
                  <span>Intensity</span>
                  <span>{stats.avgIntensity}</span>
                </div>
                <div className="chart-bar-bg">
                  <div className="chart-bar-fill" style={{ width: `${stats.avgIntensity}%`, backgroundColor: 'var(--warning)' }}></div>
                </div>
              </div>
              {stats.hasEfficacy && (
              <div>
                <div className="chart-label">
                  <span>Efficacy (Distortions)</span>
                  <span>{stats.avgEfficacy}</span>
                </div>
                <div className="chart-bar-bg">
                  <div className="chart-bar-fill" style={{ width: `${stats.avgEfficacy}%`, backgroundColor: 'var(--success)' }}></div>
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
                  <div className="chart-bar-fill" style={{ width: `${stats.avgResilience}%`, backgroundColor: 'var(--teal)' }}></div>
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
            <div className="tag-cloud-container" style={{ height: 300, width: '100%' }}>
              <WordCloud words={stats.wordCloudData} />
            </div>
          ) : (
            <p className="empty-text">No keywords generated yet.</p>
          )}
        </Card>

        <Card title="Score Trends">
          {stats.chartData && stats.chartData.length >= 2 ? (
            <div style={{ width: '100%', height: 300 }}>
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
                  <Line type="monotone" dataKey="intensity" stroke="#f59e0b" fill="none" name="Intensity" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4 }} connectNulls />
                  <Line type="monotone" dataKey="efficacy" stroke="#059669" fill="none" name="Efficacy" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4 }} connectNulls />
                  <Line type="monotone" dataKey="resilience" stroke="#0d9488" fill="none" name="Resilience" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-text">Not enough data for trends (need at least 2 sessions with scores).</p>
          )}
        </Card>

        {stats.hasWorry && (
          <Card title="Worry Tree Outcomes">
            <div style={{ width: '100%', height: 300 }}>
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

        <Card title="Cognitive Distortions Breakdown">
          {stats.hasDistortions ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.sortedDistortions}
                    labelLine={false}
                    fill="#8884d8"
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
            <div style={{ width: '100%', height: 300 }}>
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
