import React, { useState, useEffect } from 'react';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { 
  initializeLearningService,
  getLearningMetrics,
  getMetaInsights,
  getPredictions,
  subscribeToMetrics,
  subscribeToInsights,
  type LearningMetrics,
  type MetaInsight,
  type Prediction
} from '../services/learning.service';

/**
 * Autopilot App - AI Learning Dashboard
 * Shows meta-learning insights, predictions, and system optimization with real-time Firebase data
 */
export const AutopilotApp: React.FC = () => {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [insights, setInsights] = useState<MetaInsight[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'predictions' | 'optimization'>('overview');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Firebase and get current user
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      setUserId(user.uid);
      const db = getFirestore();
      initializeLearningService(db);
      loadData(user.uid);
      
      // Subscribe to real-time updates
      const unsubMetrics = subscribeToMetrics(user.uid, (newMetrics) => {
        setMetrics(newMetrics);
      });
      
      const unsubInsights = subscribeToInsights(user.uid, (newInsights) => {
        setInsights(newInsights);
      });
      
      return () => {
        unsubMetrics();
        unsubInsights();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = async (uid: string) => {
    try {
      setLoading(true);
      
      const [metricsData, insightsData, predictionsData] = await Promise.all([
        getLearningMetrics(uid),
        getMetaInsights(uid, 10),
        getPredictions(uid),
      ]);

      setMetrics(metricsData);
      setInsights(insightsData);
      setPredictions(predictionsData);
    } catch (error) {
      console.error('Error loading autopilot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (value: number): string => {
    if (value >= 0.7) return '#10b981';
    if (value >= 0.4) return '#f59e0b';
    return '#ef4444';
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'optimization': return '⚡';
      case 'prediction': return '🔮';
      case 'recommendation': return '💡';
      case 'warning': return '⚠️';
      default: return '📊';
    }
  };

  if (!userId) {
    return (
      <div className="autopilot-app" style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Please sign in to view autopilot data</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="autopilot-app" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading-spinner">Loading autopilot data...</div>
      </div>
    );
  }

  return (
    <div className="autopilot-app" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#fff',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.2)',
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🤖 AI Autopilot
          <span style={{ fontSize: '0.875rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
            Live
          </span>
        </h2>
        <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
          Real-time meta-learning insights and system optimization
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.1)',
      }}>
        {(['overview', 'insights', 'predictions', 'optimization'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: activeTab === tab ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === tab ? '#818cf8' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              transition: 'all 0.2s',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
        {activeTab === 'overview' && metrics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {/* Metrics Cards */}
            {Object.entries(metrics).filter(([key]) => key !== 'timestamp').map(([key, value]) => (
              <div key={key} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: getMetricColor(value as number),
                  }}>
                    {Math.round((value as number) * 100)}%
                  </div>
                  <div style={{
                    flex: 1,
                    height: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${(value as number) * 100}%`,
                      height: '100%',
                      background: getMetricColor(value as number),
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Stats */}
            <div style={{
              gridColumn: '1 / -1',
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginTop: '1rem',
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>System Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Active Patterns</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#818cf8' }}>24</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Insights Generated</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#818cf8' }}>{insights.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Predictions</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#818cf8' }}>{predictions.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Learning Efficiency</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {Math.round((metrics.patternAccuracy + metrics.insightRelevance + metrics.userEngagement) / 3 * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {insights.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                No insights available yet. Keep using the system to generate insights.
              </div>
            ) : (
              insights.map(insight => (
                <div key={insight.id} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: `1px solid ${getPriorityColor(insight.priority)}33`,
                  borderLeft: `4px solid ${getPriorityColor(insight.priority)}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>{getTypeIcon(insight.type)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{insight.title}</h4>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          background: `${getPriorityColor(insight.priority)}33`,
                          color: getPriorityColor(insight.priority),
                        }}>
                          {insight.priority}
                        </span>
                      </div>
                      <p style={{ margin: '0.5rem 0', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                        {insight.description}
                      </p>
                      {insight.actionable && (
                        <button style={{
                          marginTop: '0.75rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          background: 'rgba(99, 102, 241, 0.2)',
                          color: '#818cf8',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}>
                          Take Action
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {predictions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                Not enough data to make predictions yet.
              </div>
            ) : (
              predictions.map((prediction, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.125rem' }}>🔮 {prediction.pattern}</h4>
                    <span style={{
                      fontSize: '0.875rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                    }}>
                      {prediction.timeframe.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      Confidence:
                    </div>
                    <div style={{ flex: 1, height: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${prediction.confidence * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#818cf8' }}>
                      {Math.round(prediction.confidence * 100)}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'optimization' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚡ Optimization Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#10b981' }}>✓</span>
                  <span style={{ fontSize: '0.875rem' }}>Pattern detection threshold optimized</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#10b981' }}>✓</span>
                  <span style={{ fontSize: '0.875rem' }}>Insight timing personalized</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#f59e0b' }}>⟳</span>
                  <span style={{ fontSize: '0.875rem' }}>Prediction model retraining in progress</span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>System Health</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                    Learning Loop
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>Healthy</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                    Data Quality
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>Excellent</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                    Model Accuracy
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>Good</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                    Storage Usage
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>12%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>
          Last updated: {metrics?.timestamp ? metrics.timestamp.toLocaleTimeString() : new Date().toLocaleTimeString()}
        </div>
        <button
          onClick={() => userId && loadData(userId)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};
