import React, { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { THINKING_ERRORS } from '../constants/thinkingErrors';
import { COGNITIVE_DISTORTIONS } from '../constants/cognitiveDisorders';
import Card from './Card';

const Analytics = ({ entries, onBack }) => {
  const stats = useMemo(() => {
    const distortionCounts = {};
    const errorCounts = {};
    let totalDistortions = 0;
    let totalErrors = 0;
    let totalIntensity = 0;
    let totalEfficacy = 0;
    let scoreCount = 0;

    entries.forEach(entry => {
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
      if (entry.aiScores && typeof entry.aiScores.intensity === 'number' && typeof entry.aiScores.efficacy === 'number') {
        totalIntensity += entry.aiScores.intensity;
        totalEfficacy += entry.aiScores.efficacy;
        scoreCount++;
      }
    });

    const sortedDistortions = COGNITIVE_DISTORTIONS.map(d => ({
      id: d.id,
      label: d.label,
      count: distortionCounts[d.id] || 0,
      fill: d.color?.text || '#8884d8'
    })).sort((a, b) => b.count - a.count);

    const sortedErrors = Object.entries(errorCounts)
      .map(([id, count]) => {
        const def = THINKING_ERRORS.find(e => e.id === id);
        return { 
          id, 
          label: def ? def.label : id, 
          count,
          percentage: totalErrors ? Math.round((count / totalErrors) * 100) : 0,
          fill: def?.color?.text || '#8884d8'
        };
      })
      .sort((a, b) => b.count - a.count);

    const chartData = entries
      .filter(e => e.aiScores && typeof e.aiScores.intensity === 'number' && typeof e.aiScores.efficacy === 'number')
      .map(e => ({
        id: e.id,
        date: new Date(e.id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        timestamp: e.id,
        intensity: e.aiScores.intensity,
        efficacy: e.aiScores.efficacy
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return { 
      sortedDistortions, 
      sortedErrors, 
      totalSessions: entries.length,
      avgIntensity: scoreCount ? Math.round(totalIntensity / scoreCount) : 0,
      avgEfficacy: scoreCount ? Math.round(totalEfficacy / scoreCount) : 0,
      hasScores: scoreCount > 0,
      chartData,
      hasDistortions: totalDistortions > 0
    };
  }, [entries]);

  return (
    <div className="analytics-view">
      <div className="dashboard-header">
        <h1 className="app-title dashboard-title">Insights & Analytics</h1>
        <button onClick={onBack} className="nav-btn secondary btn-auto">Back to Dashboard</button>
      </div>

      <div className="analytics-grid">
        <Card title="Total Sessions">
          <div className="stat-big">{stats.totalSessions}</div>
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
              <div>
                <div className="chart-label">
                  <span>Efficacy</span>
                  <span>{stats.avgEfficacy}</span>
                </div>
                <div className="chart-bar-bg">
                  <div className="chart-bar-fill" style={{ width: `${stats.avgEfficacy}%`, backgroundColor: 'var(--success)' }}></div>
                </div>
              </div>
            </div>
          ) : (
            <p className="empty-text">No score data yet.</p>
          )}
        </Card>

        <Card title="Score Trends">
          {stats.chartData && stats.chartData.length >= 2 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="intensity" stroke="#f59e0b" fill="none" name="Intensity" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="efficacy" stroke="#059669" fill="none" name="Efficacy" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-text">Not enough data for trends (need at least 2 sessions with scores).</p>
          )}
        </Card>

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
                  />
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
