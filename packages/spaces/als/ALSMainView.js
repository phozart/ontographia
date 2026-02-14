// components/als/ALSMainView.js - Main content view (Timeline, Modes, Reflections)
import { useALS } from './ALSContext';
import { ALS_LEARNING_MODES, ALS_UNDERSTANDING_SIGNALS, ALS_INSIGHT_TYPES, formatDuration } from '../../../lib/als-types';
import { getEmptyStateGuidance } from '../../../lib/als-guidance';

export default function ALSMainView({ activeView }) {
  const {
    activeSituation,
    sessions,
    reflections,
    getSessionStats,
    setShowSessionModal
  } = useALS();

  if (!activeSituation) {
    return <EmptyState onCreateSituation={() => {}} />;
  }

  return (
    <div className="als-main-view">
      {activeView === 'timeline' && <TimelineView sessions={sessions} />}
      {activeView === 'modes' && <ModeDistributionView sessions={sessions} stats={getSessionStats()} />}
      {activeView === 'reflections' && <ReflectionsView reflections={reflections} sessions={sessions} />}
    </div>
  );
}

function EmptyState({ onCreateSituation }) {
  const guidance = getEmptyStateGuidance();

  return (
    <div className="als-empty-state">
      <span className="als-empty-icon">{guidance.icon}</span>
      <h3>{guidance.title}</h3>
      <p>{guidance.description}</p>
      <div className="als-empty-steps">
        {guidance.steps.map((step, i) => (
          <div key={i} className="als-empty-step">
            <span className="als-empty-step-num">{i + 1}</span>
            <div>
              <strong>{step.action}</strong>
              <span>{step.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineView({ sessions }) {
  if (sessions.length === 0) {
    return (
      <div className="als-timeline-empty">
        <p>No sessions yet. Start your first learning session!</p>
      </div>
    );
  }

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, session) => {
    const date = new Date(session.startedAt).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  return (
    <div className="als-timeline">
      {Object.entries(groupedSessions).map(([date, dateSessions]) => (
        <div key={date} className="als-timeline-day">
          <div className="als-timeline-date">{date}</div>
          <div className="als-timeline-sessions">
            {dateSessions.map(session => {
              const mode = ALS_LEARNING_MODES[session.learningMode];
              const signal = session.understandingSignal ? ALS_UNDERSTANDING_SIGNALS[session.understandingSignal] : null;
              const startTime = new Date(session.startedAt).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={session.id}
                  className={`als-timeline-session ${session.endedAt ? '' : 'active'}`}
                  style={{ borderLeftColor: mode?.color || '#6366f1' }}
                >
                  <div className="als-timeline-session-header">
                    <span className="als-timeline-time">{startTime}</span>
                    <span className="als-timeline-mode" style={{ color: mode?.color }}>
                      {mode?.icon} {mode?.name}
                    </span>
                    {session.durationMinutes && (
                      <span className="als-timeline-duration">
                        {session.durationMinutes} min
                      </span>
                    )}
                  </div>

                  {session.focusQuestion && (
                    <div className="als-timeline-focus">{session.focusQuestion}</div>
                  )}

                  {signal && (
                    <div className="als-timeline-signal">
                      <span className="als-signal-badge" style={{ backgroundColor: signal.color }}>
                        {signal.icon} {signal.label}
                      </span>
                    </div>
                  )}

                  {session.frictionNotes && (
                    <div className="als-timeline-notes">
                      <span className="als-notes-label">Friction:</span>
                      {session.frictionNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ModeDistributionView({ sessions, stats }) {
  if (!stats || sessions.length === 0) {
    return (
      <div className="als-modes-empty">
        <p>Complete some learning sessions to see your mode distribution.</p>
      </div>
    );
  }

  const maxSessions = Math.max(...Object.values(stats.byMode));

  return (
    <div className="als-mode-distribution">
      <div className="als-stats-summary">
        <div className="als-stat-card">
          <span className="als-stat-value">{stats.totalSessions}</span>
          <span className="als-stat-label">Total Sessions</span>
        </div>
        <div className="als-stat-card">
          <span className="als-stat-value">{stats.totalMinutes}</span>
          <span className="als-stat-label">Total Minutes</span>
        </div>
        <div className="als-stat-card">
          <span className="als-stat-value">{stats.averageMinutes}</span>
          <span className="als-stat-label">Avg. Minutes</span>
        </div>
      </div>

      <div className="als-distribution-section">
        <h4>Sessions by Learning Mode</h4>
        <div className="als-distribution-bars">
          {Object.entries(ALS_LEARNING_MODES).map(([id, mode]) => {
            const count = stats.byMode[id] || 0;
            const percentage = maxSessions > 0 ? (count / maxSessions) * 100 : 0;

            return (
              <div key={id} className="als-distribution-row">
                <div className="als-distribution-label">
                  <span style={{ color: mode.color }}>{mode.icon}</span>
                  <span>{mode.name}</span>
                </div>
                <div className="als-distribution-bar-wrapper">
                  <div
                    className="als-distribution-bar"
                    style={{ width: `${percentage}%`, backgroundColor: mode.color }}
                  />
                </div>
                <span className="als-distribution-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="als-distribution-section">
        <h4>Understanding Signals</h4>
        <div className="als-signal-distribution">
          {Object.entries(ALS_UNDERSTANDING_SIGNALS).map(([id, signal]) => {
            const count = stats.bySignal[id] || 0;
            return (
              <div key={id} className="als-signal-stat">
                <span className="als-signal-icon">{signal.icon}</span>
                <span className="als-signal-name">{signal.label}</span>
                <span className="als-signal-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReflectionsView({ reflections, sessions }) {
  if (reflections.length === 0) {
    return (
      <div className="als-reflections-empty">
        <p>No reflections yet. Complete a session to add your first reflection.</p>
      </div>
    );
  }

  return (
    <div className="als-reflections-view">
      {reflections.map(ref => {
        const session = sessions.find(s => s.id === ref.sessionId);
        const mode = session ? ALS_LEARNING_MODES[session.learningMode] : null;
        const insightType = ref.insightType ? ALS_INSIGHT_TYPES[ref.insightType] : null;

        return (
          <div key={ref.id} className="als-reflection-card">
            <div className="als-reflection-header">
              <span className="als-reflection-date">
                {new Date(ref.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              {mode && (
                <span className="als-reflection-mode" style={{ color: mode.color }}>
                  {mode.icon} {mode.name}
                </span>
              )}
              {insightType && (
                <span className="als-insight-badge" style={{ backgroundColor: insightType.color }}>
                  {insightType.icon} {insightType.label}
                </span>
              )}
            </div>

            <div className="als-reflection-body">
              {ref.whatClicked && (
                <div className="als-reflection-section">
                  <span className="als-reflection-label">What clicked:</span>
                  <p>{ref.whatClicked}</p>
                </div>
              )}

              {ref.whatConfused && (
                <div className="als-reflection-section">
                  <span className="als-reflection-label">What confused:</span>
                  <p>{ref.whatConfused}</p>
                </div>
              )}

              {ref.nextAdjustment && (
                <div className="als-reflection-section">
                  <span className="als-reflection-label">Next adjustment:</span>
                  <p>{ref.nextAdjustment}</p>
                </div>
              )}

              {ref.modeAppropriate !== null && (
                <div className="als-reflection-mode-feedback">
                  Mode was {ref.modeAppropriate ? '✓ appropriate' : '✗ not appropriate'}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
