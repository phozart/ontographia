/**
 * OverviewDashboard - Overview view for Strategic Reasoning Suite
 *
 * Shows the problem-solving journey, session stats, and guides users
 * through the reasoning process from Questions to Decisions.
 */

import { useMemo, useState } from 'react';
import { useSRS, SESSION_INTENTS } from '../SRSContext';

// MUI Icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CropFreeIcon from '@mui/icons-material/CropFree';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GavelIcon from '@mui/icons-material/Gavel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// The reasoning journey - explains purpose and flow
const REASONING_JOURNEY = [
  {
    phase: 'explore',
    phaseName: 'Explore',
    phaseColor: '#3b82f6',
    spaces: [
      {
        id: 'questions',
        name: 'Questions',
        icon: HelpOutlineIcon,
        color: '#3b82f6',
        purpose: 'Surface the questions keeping you up at night',
        guidance: 'Start here. What do you need to understand? What\'s unclear?',
        prompts: ['What am I uncertain about?', 'What would I need to know to decide?', 'Why is this happening?'],
      },
      {
        id: 'frames',
        name: 'Frames',
        icon: CropFreeIcon,
        color: '#10b981',
        purpose: 'Reframe the problem to see it differently',
        guidance: 'Challenge how you\'re seeing the situation. What assumptions are you making?',
        prompts: ['How else could I describe this?', 'What am I taking for granted?', 'What\'s the real problem here?'],
      },
    ],
  },
  {
    phase: 'analyze',
    phaseName: 'Analyze',
    phaseColor: '#f59e0b',
    spaces: [
      {
        id: 'parallel_states',
        name: 'Parallel States',
        icon: CallSplitIcon,
        color: '#f59e0b',
        purpose: 'Explore multiple futures simultaneously',
        guidance: 'Hold competing possibilities in mind. What could happen?',
        prompts: ['What\'s the best case?', 'What\'s the worst case?', 'What\'s most likely?'],
      },
      {
        id: 'systems',
        name: 'Systems Map',
        icon: AccountTreeIcon,
        color: '#ef4444',
        purpose: 'Map cause-and-effect relationships',
        guidance: 'See how things connect. What drives what? Where are the feedback loops?',
        prompts: ['What causes what?', 'Where are the reinforcing cycles?', 'What can I actually influence?'],
      },
    ],
  },
  {
    phase: 'decide',
    phaseName: 'Decide',
    phaseColor: '#8b5cf6',
    spaces: [
      {
        id: 'perspectives',
        name: 'Perspectives',
        icon: VisibilityIcon,
        color: '#8b5cf6',
        purpose: 'See through different stakeholder eyes',
        guidance: 'Step into other viewpoints. What would they see? What matters to them?',
        prompts: ['Who else is affected?', 'What would a skeptic say?', 'What am I missing?'],
      },
      {
        id: 'decisions',
        name: 'Decisions',
        icon: GavelIcon,
        color: '#6366f1',
        purpose: 'Assess readiness to commit and act',
        guidance: 'Are you ready to decide? What assumptions must hold? What\'s the risk?',
        prompts: ['What am I actually deciding?', 'Is this reversible?', 'What would make me change my mind?'],
      },
    ],
  },
];

export default function OverviewDashboard() {
  const {
    sessions,
    activeSession,
    loadSession,
    createSession,
    updateSession,
    deleteSession,
    sessionStats,
    navigateToSpace,
  } = useSRS();

  // Session management modals
  const [editingSession, setEditingSession] = useState(null);
  const [deletingSession, setDeletingSession] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContext, setEditContext] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Calculate progress for current session
  const sessionProgress = useMemo(() => {
    if (!activeSession) return null;

    const bySpace = sessionStats.bySpace || {};
    const total = Object.values(bySpace).reduce((a, b) => a + b, 0);

    // Check which spaces have content
    const spacesWithContent = Object.entries(bySpace)
      .filter(([_, count]) => count > 0)
      .map(([space]) => space);

    // Determine suggested next space
    let suggestedNext = 'questions';
    if (bySpace.questions > 0 && !bySpace.frames) suggestedNext = 'frames';
    else if (bySpace.frames > 0 && !bySpace.parallel_states) suggestedNext = 'parallel_states';
    else if (bySpace.parallel_states > 0 && !bySpace.systems) suggestedNext = 'systems';
    else if (bySpace.systems > 0 && !bySpace.perspectives) suggestedNext = 'perspectives';
    else if (bySpace.perspectives > 0 && !bySpace.decisions) suggestedNext = 'decisions';
    else if (bySpace.decisions > 0) suggestedNext = null; // Journey complete

    return {
      total,
      bySpace,
      spacesWithContent,
      suggestedNext,
      isComplete: spacesWithContent.length === 6,
    };
  }, [activeSession, sessionStats]);

  // Recent sessions
  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 5);
  }, [sessions]);

  // Handle create new session
  const handleCreateSession = async () => {
    await createSession({
      title: `Reasoning Session ${sessions.length + 1}`,
      intent: 'understand',
      mode: 'solo',
    });
  };

  // Handle edit session
  const handleStartEdit = (session, e) => {
    e.stopPropagation();
    setEditingSession(session);
    setEditTitle(session.title);
    setEditContext(session.context || '');
    setMenuOpenId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingSession) return;
    await updateSession(editingSession.id, {
      title: editTitle.trim() || editingSession.title,
      context: editContext.trim() || null,
    });
    setEditingSession(null);
  };

  // Handle delete session
  const handleStartDelete = (session, e) => {
    e.stopPropagation();
    setDeletingSession(session);
    setMenuOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSession) return;
    await deleteSession(deletingSession.id);
    setDeletingSession(null);
  };

  // Toggle menu
  const handleToggleMenu = (sessionId, e) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === sessionId ? null : sessionId);
  };

  return (
    <div className="srs-overview-wrapper">
      {/* Welcome / Journey Introduction */}
      {!activeSession && (
        <div className="srs-overview__welcome">
          <div className="srs-welcome-header">
            <PsychologyIcon className="srs-welcome-icon" />
            <div>
              <h1>Strategic Reasoning Suite</h1>
              <p>A structured approach to thinking through complex problems and decisions</p>
            </div>
          </div>

          <div className="srs-welcome-journey">
            <h2>The Reasoning Journey</h2>
            <p className="srs-welcome-subtitle">
              Move through three phases: <strong>Explore</strong> what you don't know,
              <strong> Analyze</strong> how things connect, then <strong>Decide</strong> with confidence.
            </p>

            <div className="srs-journey-phases">
              {REASONING_JOURNEY.map((phase, phaseIdx) => (
                <div key={phase.phase} className="srs-journey-phase">
                  <div className="srs-phase-header" style={{ '--phase-color': phase.phaseColor }}>
                    <span className="srs-phase-number">{phaseIdx + 1}</span>
                    <span className="srs-phase-name">{phase.phaseName}</span>
                  </div>
                  <div className="srs-phase-spaces">
                    {phase.spaces.map(space => {
                      const Icon = space.icon;
                      return (
                        <div key={space.id} className="srs-journey-space-card">
                          <Icon style={{ color: space.color }} />
                          <div className="srs-journey-space-info">
                            <h4>{space.name}</h4>
                            <p>{space.purpose}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="srs-welcome-action">
            <button className="srs-btn srs-btn--primary srs-btn--large" onClick={handleCreateSession}>
              <AddIcon />
              Start a New Session
            </button>
            <p className="srs-welcome-hint">
              Each session is a reasoning journey through a specific problem or decision.
            </p>
          </div>
        </div>
      )}

      {/* Active Session View */}
      {activeSession && (
        <>
          {/* Session Header */}
          <div className="srs-session-header">
            <div className="srs-session-title-row">
              <h2>{activeSession.title}</h2>
              <span className="srs-session-intent-badge">
                {SESSION_INTENTS[activeSession.intent]?.name || activeSession.intent}
              </span>
            </div>
            {activeSession.context && (
              <p className="srs-session-context">{activeSession.context}</p>
            )}
          </div>

          {/* Suggested Next Step */}
          {sessionProgress?.suggestedNext && (
            <div className="srs-suggested-next">
              <div className="srs-suggested-content">
                <LightbulbIcon className="srs-suggested-icon" />
                <div>
                  <h3>Suggested Next Step</h3>
                  <p>
                    {getSuggestedNextMessage(sessionProgress.suggestedNext, sessionProgress.bySpace)}
                  </p>
                </div>
              </div>
              <button
                className="srs-btn srs-btn--accent"
                onClick={() => navigateToSpace(sessionProgress.suggestedNext)}
              >
                Go to {getSpaceName(sessionProgress.suggestedNext)}
                <ArrowForwardIcon fontSize="small" />
              </button>
            </div>
          )}

          {/* Journey Progress */}
          <div className="srs-journey-progress">
            <h3>Your Reasoning Journey</h3>
            <div className="srs-progress-phases">
              {REASONING_JOURNEY.map((phase, phaseIdx) => (
                <div key={phase.phase} className="srs-progress-phase">
                  <div className="srs-progress-phase-header" style={{ '--phase-color': phase.phaseColor }}>
                    <span className="srs-progress-phase-name">{phase.phaseName}</span>
                  </div>
                  <div className="srs-progress-spaces">
                    {phase.spaces.map((space, spaceIdx) => {
                      const Icon = space.icon;
                      const count = sessionProgress?.bySpace[space.id] || 0;
                      const hasContent = count > 0;
                      const isSuggested = sessionProgress?.suggestedNext === space.id;

                      return (
                        <button
                          key={space.id}
                          className={`srs-progress-space ${hasContent ? 'has-content' : ''} ${isSuggested ? 'suggested' : ''}`}
                          onClick={() => navigateToSpace(space.id)}
                          style={{ '--space-color': space.color }}
                        >
                          <div className="srs-progress-space-icon">
                            <Icon />
                            {hasContent && <CheckCircleIcon className="srs-progress-check" />}
                          </div>
                          <div className="srs-progress-space-info">
                            <span className="srs-progress-space-name">{space.name}</span>
                            <span className="srs-progress-space-count">
                              {count} {count === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                          {isSuggested && <span className="srs-progress-suggested-badge">Next</span>}
                          <ArrowForwardIcon className="srs-progress-arrow" />
                        </button>
                      );
                    })}
                  </div>
                  {phaseIdx < REASONING_JOURNEY.length - 1 && (
                    <div className="srs-progress-connector" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Guide */}
          <div className="srs-quick-guide">
            <h3>How Each Space Helps You Think</h3>
            <div className="srs-guide-grid">
              {REASONING_JOURNEY.flatMap(phase => phase.spaces).map(space => {
                const Icon = space.icon;
                return (
                  <div key={space.id} className="srs-guide-card" style={{ '--space-color': space.color }}>
                    <div className="srs-guide-card-header">
                      <Icon />
                      <h4>{space.name}</h4>
                    </div>
                    <p className="srs-guide-purpose">{space.guidance}</p>
                    <div className="srs-guide-prompts">
                      {space.prompts.map((prompt, idx) => (
                        <span key={idx} className="srs-guide-prompt">"{prompt}"</span>
                      ))}
                    </div>
                    <button
                      className="srs-guide-go-btn"
                      onClick={() => navigateToSpace(space.id)}
                    >
                      Open {space.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Recent Sessions (always shown if there are sessions) */}
      {sessions.length > 0 && (
        <div className="srs-overview__section srs-recent-section">
          <div className="srs-section-header">
            <h3>Recent Sessions</h3>
            <button className="srs-btn srs-btn--secondary" onClick={handleCreateSession}>
              <AddIcon fontSize="small" />
              New Session
            </button>
          </div>
          <div className="srs-recent-sessions">
            {recentSessions.map(session => (
              <div
                key={session.id}
                className={`srs-session-item ${activeSession?.id === session.id ? 'active' : ''}`}
                onClick={() => loadSession(session.id)}
              >
                <div className="srs-session-item__main">
                  <span className="srs-session-item__title">{session.title}</span>
                  <span className="srs-session-item__intent">
                    {SESSION_INTENTS[session.intent]?.name || session.intent}
                  </span>
                </div>
                <div className="srs-session-item__meta">
                  <AccessTimeIcon fontSize="small" />
                  <span>{new Date(session.updated_at || session.created_at).toLocaleDateString()}</span>
                </div>
                <div className="srs-session-item__actions">
                  <button
                    className="srs-session-item__menu-btn"
                    onClick={(e) => handleToggleMenu(session.id, e)}
                    title="Options"
                  >
                    <MoreVertIcon fontSize="small" />
                  </button>
                  {menuOpenId === session.id && (
                    <div className="srs-session-menu">
                      <button onClick={(e) => handleStartEdit(session, e)}>
                        <EditIcon fontSize="small" />
                        Edit
                      </button>
                      <button className="danger" onClick={(e) => handleStartDelete(session, e)}>
                        <DeleteIcon fontSize="small" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="srs-modal-overlay" onClick={() => setEditingSession(null)}>
          <div className="srs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="srs-modal-header">
              <h3>Edit Session</h3>
              <button className="srs-modal-close" onClick={() => setEditingSession(null)}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="srs-form-group">
              <label>Session Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter session title..."
                autoFocus
              />
            </div>
            <div className="srs-form-group">
              <label>Context (optional)</label>
              <textarea
                value={editContext}
                onChange={(e) => setEditContext(e.target.value)}
                placeholder="What problem or decision is this session about?"
                rows={3}
              />
            </div>
            <div className="srs-modal-actions">
              <button className="srs-btn srs-btn--secondary" onClick={() => setEditingSession(null)}>
                Cancel
              </button>
              <button className="srs-btn srs-btn--primary" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSession && (
        <div className="srs-modal-overlay" onClick={() => setDeletingSession(null)}>
          <div className="srs-modal srs-modal--danger" onClick={(e) => e.stopPropagation()}>
            <div className="srs-modal-header">
              <h3>Delete Session?</h3>
              <button className="srs-modal-close" onClick={() => setDeletingSession(null)}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <p className="srs-modal-text">
              Are you sure you want to delete "<strong>{deletingSession.title}</strong>"?
              This will permanently remove all questions, frames, and other content in this session.
            </p>
            <div className="srs-modal-actions">
              <button className="srs-btn srs-btn--secondary" onClick={() => setDeletingSession(null)}>
                Cancel
              </button>
              <button className="srs-btn srs-btn--danger" onClick={handleConfirmDelete}>
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .srs-overview-wrapper {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: var(--bg);
        }

        /* Welcome State */
        .srs-overview__welcome {
          max-width: 900px;
          margin: 0 auto;
        }

        .srs-welcome-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 40px;
          padding: 32px;
          background: linear-gradient(135deg, var(--panel) 0%, var(--bg) 100%);
          border: 1px solid var(--border);
          border-radius: 16px;
        }

        .srs-welcome-icon {
          font-size: 48px !important;
          color: var(--accent);
        }

        .srs-welcome-header h1 {
          margin: 0 0 8px;
          font-size: 1.75rem;
          color: var(--text);
        }

        .srs-welcome-header p {
          margin: 0;
          color: var(--text-muted);
          font-size: 1rem;
        }

        .srs-welcome-journey {
          margin-bottom: 40px;
        }

        .srs-welcome-journey h2 {
          margin: 0 0 8px;
          font-size: 1.25rem;
          color: var(--text);
        }

        .srs-welcome-subtitle {
          margin: 0 0 24px;
          color: var(--text-muted);
        }

        .srs-welcome-subtitle strong {
          color: var(--text);
        }

        .srs-journey-phases {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .srs-journey-phase {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .srs-phase-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: color-mix(in srgb, var(--phase-color) 10%, transparent);
          border-bottom: 2px solid var(--phase-color);
        }

        .srs-phase-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: var(--phase-color);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 50%;
        }

        .srs-phase-name {
          font-weight: 600;
          color: var(--text);
        }

        .srs-phase-spaces {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .srs-journey-space-card {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--bg);
          border-radius: 8px;
        }

        .srs-journey-space-info h4 {
          margin: 0 0 4px;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text);
        }

        .srs-journey-space-info p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .srs-welcome-action {
          text-align: center;
          padding: 32px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
        }

        .srs-welcome-hint {
          margin: 12px 0 0;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        /* Session Header */
        .srs-session-header {
          margin-bottom: 24px;
          padding: 20px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
        }

        .srs-session-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .srs-session-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text);
        }

        .srs-session-intent-badge {
          padding: 4px 10px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 12px;
        }

        .srs-session-context {
          margin: 12px 0 0;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        /* Suggested Next */
        .srs-suggested-next {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
          border: 1px solid #fcd34d;
          border-radius: 12px;
        }

        .srs-suggested-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .srs-suggested-icon {
          color: #d97706 !important;
          font-size: 28px !important;
        }

        .srs-suggested-content h3 {
          margin: 0 0 4px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #92400e;
        }

        .srs-suggested-content p {
          margin: 0;
          font-size: 0.875rem;
          color: #a16207;
        }

        /* Journey Progress */
        .srs-journey-progress {
          margin-bottom: 32px;
        }

        .srs-journey-progress h3 {
          margin: 0 0 16px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
        }

        .srs-progress-phases {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .srs-progress-phase {
          position: relative;
        }

        .srs-progress-phase-header {
          margin-bottom: 8px;
          padding-left: 4px;
        }

        .srs-progress-phase-name {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--phase-color);
        }

        .srs-progress-spaces {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .srs-progress-space {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .srs-progress-space:hover {
          border-color: var(--space-color);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .srs-progress-space.has-content {
          border-left: 3px solid var(--space-color);
        }

        .srs-progress-space.suggested {
          border-color: var(--space-color);
          background: color-mix(in srgb, var(--space-color) 5%, var(--panel));
        }

        .srs-progress-space-icon {
          position: relative;
          color: var(--space-color);
        }

        .srs-progress-check {
          position: absolute;
          bottom: -4px;
          right: -4px;
          font-size: 14px !important;
          color: #16a34a;
          background: var(--panel);
          border-radius: 50%;
        }

        .srs-progress-space-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .srs-progress-space-name {
          font-weight: 500;
          color: var(--text);
          font-size: 0.875rem;
        }

        .srs-progress-space-count {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .srs-progress-suggested-badge {
          padding: 2px 8px;
          background: var(--space-color);
          color: white;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          border-radius: 10px;
        }

        .srs-progress-arrow {
          color: var(--text-muted);
          font-size: 18px !important;
        }

        .srs-progress-connector {
          width: 2px;
          height: 16px;
          margin: 0 auto;
          background: var(--border);
        }

        /* Quick Guide */
        .srs-quick-guide {
          margin-bottom: 32px;
        }

        .srs-quick-guide h3 {
          margin: 0 0 16px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
        }

        .srs-guide-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .srs-guide-card {
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          border-top: 3px solid var(--space-color);
        }

        .srs-guide-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          color: var(--space-color);
        }

        .srs-guide-card-header h4 {
          margin: 0;
          font-size: 0.9375rem;
          color: var(--text);
        }

        .srs-guide-purpose {
          margin: 0 0 12px;
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .srs-guide-prompts {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 12px;
        }

        .srs-guide-prompt {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .srs-guide-go-btn {
          width: 100%;
          padding: 8px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text);
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .srs-guide-go-btn:hover {
          border-color: var(--space-color);
          color: var(--space-color);
        }

        /* Recent Sessions */
        .srs-recent-section {
          border-top: 1px solid var(--border);
          padding-top: 24px;
        }

        .srs-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .srs-section-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
        }

        .srs-overview__section {
          margin-bottom: 32px;
        }

        .srs-recent-sessions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .srs-session-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
          width: 100%;
        }

        .srs-session-item:hover {
          border-color: var(--accent);
        }

        .srs-session-item.active {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .srs-session-item__main {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .srs-session-item__title {
          font-weight: 500;
          color: var(--text);
        }

        .srs-session-item__intent {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .srs-session-item__meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Buttons */
        .srs-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .srs-btn--primary {
          background: var(--accent);
          color: white;
        }

        .srs-btn--primary:hover {
          opacity: 0.9;
        }

        .srs-btn--secondary {
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
        }

        .srs-btn--secondary:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .srs-btn--accent {
          background: #d97706;
          color: white;
        }

        .srs-btn--accent:hover {
          background: #b45309;
        }

        .srs-btn--large {
          padding: 12px 24px;
          font-size: 1rem;
        }

        .srs-btn--danger {
          background: #ef4444;
          color: white;
        }

        .srs-btn--danger:hover {
          background: #dc2626;
        }

        /* Session Management */
        .srs-session-item__actions {
          position: relative;
          display: flex;
          align-items: center;
          margin-left: 12px;
        }

        .srs-session-item__menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .srs-session-item__menu-btn:hover {
          background: var(--bg);
          color: var(--text);
        }

        .srs-session-menu {
          position: absolute;
          right: 0;
          top: 100%;
          z-index: 100;
          min-width: 120px;
          padding: 4px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .srs-session-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          color: var(--text);
          cursor: pointer;
          text-align: left;
        }

        .srs-session-menu button:hover {
          background: var(--bg);
        }

        .srs-session-menu button.danger {
          color: #ef4444;
        }

        .srs-session-menu button.danger:hover {
          background: #fef2f2;
        }

        /* Modal Styles */
        .srs-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .srs-modal {
          width: 100%;
          max-width: 480px;
          padding: 24px;
          background: var(--panel);
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .srs-modal--danger .srs-modal-header h3 {
          color: #ef4444;
        }

        .srs-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .srs-modal-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: var(--text);
        }

        .srs-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .srs-modal-close:hover {
          background: var(--bg);
          color: var(--text);
        }

        .srs-modal-text {
          margin: 0 0 20px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .srs-modal-text strong {
          color: var(--text);
        }

        .srs-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .srs-form-group {
          margin-bottom: 16px;
        }

        .srs-form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text);
        }

        .srs-form-group input,
        .srs-form-group textarea {
          width: 100%;
          padding: 10px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 0.875rem;
          color: var(--text);
        }

        .srs-form-group input:focus,
        .srs-form-group textarea:focus {
          outline: none;
          border-color: var(--accent);
        }

        .srs-form-group textarea {
          resize: vertical;
        }

        @media (max-width: 768px) {
          .srs-journey-phases {
            grid-template-columns: 1fr;
          }

          .srs-progress-spaces {
            grid-template-columns: 1fr;
          }

          .srs-guide-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Helper functions
function getSpaceName(spaceId) {
  const names = {
    questions: 'Questions',
    frames: 'Frames',
    parallel_states: 'Parallel States',
    systems: 'Systems Map',
    perspectives: 'Perspectives',
    decisions: 'Decisions',
  };
  return names[spaceId] || spaceId;
}

function getSuggestedNextMessage(suggestedNext, bySpace) {
  const messages = {
    questions: "Start by surfacing the questions on your mind. What do you need to understand?",
    frames: `You have ${bySpace.questions || 0} questions. Now challenge how you're framing the problem.`,
    parallel_states: "Consider multiple futures. What could happen? Best case, worst case?",
    systems: "Map the cause-and-effect relationships. What drives what?",
    perspectives: "Step into other viewpoints. Who else is affected? What would they see?",
    decisions: "You've built your reasoning. Are you ready to decide?",
  };
  return messages[suggestedNext] || "Continue building your reasoning.";
}
