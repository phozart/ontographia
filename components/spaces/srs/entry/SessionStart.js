// components/srs/entry/SessionStart.js
// Entry flow for starting a new reasoning session
// Captures intent and initial context

import { useState, useCallback } from 'react';
import { useSRS, SESSION_INTENTS, SESSION_MODES, SRS_SPACES } from '../SRSContext';

// MUI Icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import GavelIcon from '@mui/icons-material/Gavel';
import ChatIcon from '@mui/icons-material/Chat';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const INTENT_ICONS = {
  understand: PsychologyIcon,
  decide: GavelIcon,
  explain: ChatIcon,
  explore: ExploreIcon,
  analyze: AccountTreeIcon,
};

const MODE_ICONS = {
  solo: PersonIcon,
  collaborative: GroupIcon,
  facilitated: RecordVoiceOverIcon,
};

export default function SessionStart({ onComplete, onCancel }) {
  const { createSession, loading, error } = useSRS();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [intent, setIntent] = useState(null);
  const [mode, setMode] = useState('solo');
  const [context, setContext] = useState('');

  // Handle session creation
  const handleCreate = useCallback(async () => {
    if (!title.trim() || !intent) return;

    const session = await createSession({
      title: title.trim(),
      intent,
      mode,
      context: context.trim(),
    });

    if (session) {
      onComplete?.(session);
    }
  }, [title, intent, mode, context, createSession, onComplete]);

  // Render intent selection step
  const renderIntentStep = () => (
    <div className="srs-entry-step">
      <h2>What brings you here?</h2>
      <p className="srs-entry-subtitle">Choose what best describes your goal</p>

      <div className="srs-intent-grid">
        {Object.entries(SESSION_INTENTS).map(([key, intentConfig]) => {
          const Icon = INTENT_ICONS[key] || HelpOutlineIcon;
          return (
            <button
              key={key}
              className={`srs-intent-card ${intent === key ? 'selected' : ''}`}
              onClick={() => {
                setIntent(key);
                setStep(2); // Auto-advance to next step
              }}
            >
              <div className="srs-intent-card__icon">
                <Icon />
              </div>
              <div className="srs-intent-card__content">
                <span className="srs-intent-card__name">{intentConfig.name}</span>
                <span className="srs-intent-card__desc">{intentConfig.description}</span>
              </div>
              <div className="srs-intent-card__start">
                Starts in <strong>{SRS_SPACES[intentConfig.suggestedStartSpace]?.shortName}</strong>
              </div>
            </button>
          );
        })}
      </div>

      <div className="srs-entry-actions">
        <button className="srs-btn srs-btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="srs-btn srs-btn--primary"
          onClick={() => setStep(2)}
          disabled={!intent}
        >
          Continue
          <ArrowForwardIcon fontSize="small" />
        </button>
      </div>
    </div>
  );

  // Render details step
  const renderDetailsStep = () => (
    <div className="srs-entry-step">
      <h2>Set up your session</h2>
      <p className="srs-entry-subtitle">Give your reasoning session a name and context</p>

      <div className="srs-form-group">
        <label htmlFor="session-title">Session Title</label>
        <input
          id="session-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Q4 Strategy Decision, Product Launch Analysis"
          autoFocus
        />
        <span className="srs-form-hint">A memorable name for this reasoning session</span>
      </div>

      <div className="srs-form-group">
        <label htmlFor="session-context">Initial Context (optional)</label>
        <textarea
          id="session-context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="What's the situation? What prompted this thinking session? Any background that would help frame the reasoning..."
          rows={4}
        />
        <span className="srs-form-hint">Brief background to anchor your reasoning</span>
      </div>

      <div className="srs-form-group">
        <label>Session Mode</label>
        <div className="srs-mode-options">
          {Object.entries(SESSION_MODES).map(([key, modeConfig]) => {
            const Icon = MODE_ICONS[key] || PersonIcon;
            return (
              <button
                key={key}
                className={`srs-mode-option ${mode === key ? 'selected' : ''}`}
                onClick={() => setMode(key)}
              >
                <Icon fontSize="small" />
                <span className="srs-mode-option__name">{modeConfig.name}</span>
                <span className="srs-mode-option__desc">{modeConfig.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="srs-entry-error">
          {error}
        </div>
      )}

      <div className="srs-entry-actions">
        <button className="srs-btn srs-btn--secondary" onClick={() => setStep(1)}>
          <ArrowBackIcon fontSize="small" />
          Back
        </button>
        <button
          className="srs-btn srs-btn--primary"
          onClick={handleCreate}
          disabled={!title.trim() || loading}
        >
          {loading ? 'Creating...' : 'Start Reasoning'}
          <ArrowForwardIcon fontSize="small" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="srs-entry">
      <div className="srs-entry-header">
        <div className="srs-entry-logo">
          <PsychologyIcon />
        </div>
        <h1>Strategic Reasoning Suite</h1>
        <p>A thinking space for complex decisions</p>
      </div>

      <div className="srs-entry-progress">
        <div className={`srs-entry-progress__step ${step >= 1 ? 'active' : ''}`}>
          <span className="srs-entry-progress__number">1</span>
          <span className="srs-entry-progress__label">Intent</span>
        </div>
        <div className="srs-entry-progress__line" />
        <div className={`srs-entry-progress__step ${step >= 2 ? 'active' : ''}`}>
          <span className="srs-entry-progress__number">2</span>
          <span className="srs-entry-progress__label">Details</span>
        </div>
      </div>

      {step === 1 && renderIntentStep()}
      {step === 2 && renderDetailsStep()}
    </div>
  );
}
