/**
 * VotingAndTimers
 * Real-time voting, dot voting, and countdown timers for collaboration
 */

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';

/**
 * Voting types
 */
export const VOTE_TYPES = {
  UP_DOWN: 'up_down',          // Simple up/down voting
  DOT_VOTING: 'dot_voting',    // Allocate limited dots
  REACTION: 'reaction',        // Emoji reactions
  RATING: 'rating',            // Star rating (1-5)
  PRIORITY: 'priority',        // Priority ranking
};

/**
 * Timer types
 */
export const TIMER_TYPES = {
  COUNTDOWN: 'countdown',       // Count down to zero
  STOPWATCH: 'stopwatch',       // Count up from zero
  POMODORO: 'pomodoro',         // Pomodoro technique timer
};

/**
 * Default reactions for reaction voting
 */
export const DEFAULT_REACTIONS = [
  { id: 'thumbs_up', emoji: '👍', label: 'Thumbs Up' },
  { id: 'thumbs_down', emoji: '👎', label: 'Thumbs Down' },
  { id: 'heart', emoji: '❤️', label: 'Heart' },
  { id: 'celebrate', emoji: '🎉', label: 'Celebrate' },
  { id: 'thinking', emoji: '🤔', label: 'Thinking' },
  { id: 'question', emoji: '❓', label: 'Question' },
];

/**
 * Create a voting session
 */
export function createVotingSession(options = {}) {
  const {
    type = VOTE_TYPES.DOT_VOTING,
    title = 'Vote',
    targetIds = [],
    dotsPerUser = 3,
    maxReactions = 1,
    allowMultiple = false,
    anonymous = false,
    showResults = 'after', // 'live', 'after', 'never'
    reactions = DEFAULT_REACTIONS,
  } = options;

  return {
    id: `vote_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    title,
    targetIds,
    dotsPerUser,
    maxReactions,
    allowMultiple,
    anonymous,
    showResults,
    reactions,
    votes: {},
    status: 'active', // 'active', 'paused', 'closed'
    createdAt: new Date().toISOString(),
    closedAt: null,
  };
}

/**
 * Voting context for sharing state
 */
const VotingContext = createContext(null);

/**
 * Voting provider
 */
export function VotingProvider({ children, onVote, onSessionChange }) {
  const [sessions, setSessions] = useState({});
  const [activeSessionId, setActiveSessionId] = useState(null);

  const createSession = useCallback((options) => {
    const session = createVotingSession(options);
    setSessions((prev) => ({ ...prev, [session.id]: session }));
    setActiveSessionId(session.id);
    onSessionChange?.({ type: 'created', session });
    return session;
  }, [onSessionChange]);

  const closeSession = useCallback((sessionId) => {
    setSessions((prev) => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        status: 'closed',
        closedAt: new Date().toISOString(),
      },
    }));
    onSessionChange?.({ type: 'closed', sessionId });
  }, [onSessionChange]);

  const castVote = useCallback((sessionId, userId, targetId, value) => {
    setSessions((prev) => {
      const session = prev[sessionId];
      if (!session || session.status !== 'active') return prev;

      const userVotes = session.votes[userId] || {};
      const updatedVotes = { ...userVotes, [targetId]: value };

      return {
        ...prev,
        [sessionId]: {
          ...session,
          votes: { ...session.votes, [userId]: updatedVotes },
        },
      };
    });

    onVote?.({ sessionId, userId, targetId, value });
  }, [onVote]);

  const removeVote = useCallback((sessionId, userId, targetId) => {
    setSessions((prev) => {
      const session = prev[sessionId];
      if (!session) return prev;

      const userVotes = { ...session.votes[userId] };
      delete userVotes[targetId];

      return {
        ...prev,
        [sessionId]: {
          ...session,
          votes: { ...session.votes, [userId]: userVotes },
        },
      };
    });
  }, []);

  const contextValue = {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    closeSession,
    castVote,
    removeVote,
  };

  return (
    <VotingContext.Provider value={contextValue}>
      {children}
    </VotingContext.Provider>
  );
}

/**
 * Hook to access voting context
 */
export function useVoting() {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
}

/**
 * Hook for voting on a specific element
 */
export function useElementVoting(elementId, userId) {
  const { sessions, activeSessionId, castVote, removeVote } = useVoting();

  const session = activeSessionId ? sessions[activeSessionId] : null;

  const userVotes = session?.votes[userId] || {};
  const myVote = userVotes[elementId];

  const allVotes = session
    ? Object.values(session.votes)
        .map((v) => v[elementId])
        .filter(Boolean)
    : [];

  const voteCount = allVotes.length;
  const dotCount = allVotes.reduce((sum, v) => sum + (v.dots || 0), 0);

  const vote = useCallback(
    (value) => {
      if (!session || !userId) return;
      castVote(session.id, userId, elementId, value);
    },
    [session, userId, elementId, castVote]
  );

  const unvote = useCallback(() => {
    if (!session || !userId) return;
    removeVote(session.id, userId, elementId);
  }, [session, userId, elementId, removeVote]);

  return {
    session,
    myVote,
    voteCount,
    dotCount,
    allVotes,
    vote,
    unvote,
    canVote: session?.status === 'active',
  };
}

/**
 * Dot voting component for an element
 */
export function DotVotingBadge({
  elementId,
  userId,
  maxDots = 3,
  className = '',
}) {
  const { session, myVote, dotCount, vote, unvote, canVote } = useElementVoting(
    elementId,
    userId
  );

  if (!session || session.type !== VOTE_TYPES.DOT_VOTING) {
    return null;
  }

  const currentDots = myVote?.dots || 0;

  const handleAddDot = () => {
    if (!canVote || currentDots >= maxDots) return;
    vote({ dots: currentDots + 1 });
  };

  const handleRemoveDot = () => {
    if (!canVote) return;
    if (currentDots <= 1) {
      unvote();
    } else {
      vote({ dots: currentDots - 1 });
    }
  };

  return (
    <div
      className={`dot-voting-badge ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '12px',
      }}
    >
      {/* Total dots indicator */}
      <span
        style={{
          display: 'flex',
          gap: '2px',
        }}
      >
        {Array.from({ length: Math.min(dotCount, 5) }).map((_, i) => (
          <span
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
            }}
          />
        ))}
        {dotCount > 5 && <span style={{ marginLeft: '2px' }}>+{dotCount - 5}</span>}
      </span>

      {/* My dots controls */}
      {canVote && (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
          <button
            onClick={handleRemoveDot}
            disabled={currentDots === 0}
            style={{
              width: '20px',
              height: '20px',
              border: 'none',
              borderRadius: '50%',
              backgroundColor: '#f5f5f5',
              cursor: currentDots === 0 ? 'not-allowed' : 'pointer',
              opacity: currentDots === 0 ? 0.5 : 1,
            }}
          >
            -
          </button>
          <span style={{ margin: '0 4px', minWidth: '16px', textAlign: 'center' }}>
            {currentDots}
          </span>
          <button
            onClick={handleAddDot}
            disabled={currentDots >= maxDots}
            style={{
              width: '20px',
              height: '20px',
              border: 'none',
              borderRadius: '50%',
              backgroundColor: '#E3F2FD',
              cursor: currentDots >= maxDots ? 'not-allowed' : 'pointer',
              opacity: currentDots >= maxDots ? 0.5 : 1,
            }}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Reaction voting component
 */
export function ReactionVoting({
  elementId,
  userId,
  reactions = DEFAULT_REACTIONS,
  className = '',
}) {
  const { session, myVote, allVotes, vote, unvote, canVote } = useElementVoting(
    elementId,
    userId
  );

  if (!session || session.type !== VOTE_TYPES.REACTION) {
    return null;
  }

  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.id] = allVotes.filter((v) => v.reactionId === r.id).length;
    return acc;
  }, {});

  const handleReaction = (reactionId) => {
    if (!canVote) return;
    if (myVote?.reactionId === reactionId) {
      unvote();
    } else {
      vote({ reactionId });
    }
  };

  return (
    <div
      className={`reaction-voting ${className}`}
      style={{
        display: 'flex',
        gap: '4px',
        padding: '4px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {reactions.map((reaction) => (
        <button
          key={reaction.id}
          onClick={() => handleReaction(reaction.id)}
          disabled={!canVote}
          title={reaction.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            border: 'none',
            borderRadius: '16px',
            backgroundColor:
              myVote?.reactionId === reaction.id ? '#E3F2FD' : 'transparent',
            cursor: canVote ? 'pointer' : 'default',
            fontSize: '14px',
          }}
        >
          <span>{reaction.emoji}</span>
          {reactionCounts[reaction.id] > 0 && (
            <span style={{ fontSize: '11px', color: '#666' }}>
              {reactionCounts[reaction.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Timer context
 */
const TimerContext = createContext(null);

/**
 * Timer provider
 */
export function TimerProvider({ children, onTimerEvent }) {
  const [timers, setTimers] = useState({});
  const intervalRefs = useRef({});

  const createTimer = useCallback((options = {}) => {
    const {
      type = TIMER_TYPES.COUNTDOWN,
      duration = 5 * 60 * 1000, // 5 minutes default
      title = 'Timer',
      autoStart = false,
    } = options;

    const timer = {
      id: `timer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      duration,
      remaining: type === TIMER_TYPES.COUNTDOWN ? duration : 0,
      elapsed: 0,
      status: autoStart ? 'running' : 'paused',
      createdAt: new Date().toISOString(),
      startedAt: autoStart ? new Date().toISOString() : null,
    };

    setTimers((prev) => ({ ...prev, [timer.id]: timer }));

    if (autoStart) {
      startTimerInterval(timer.id, type);
    }

    onTimerEvent?.({ type: 'created', timer });
    return timer;
  }, [onTimerEvent]);

  const startTimerInterval = useCallback((timerId, timerType) => {
    if (intervalRefs.current[timerId]) {
      clearInterval(intervalRefs.current[timerId]);
    }

    intervalRefs.current[timerId] = setInterval(() => {
      setTimers((prev) => {
        const timer = prev[timerId];
        if (!timer || timer.status !== 'running') return prev;

        const elapsed = timer.elapsed + 1000;
        const remaining = Math.max(0, timer.duration - elapsed);

        if (timerType === TIMER_TYPES.COUNTDOWN && remaining === 0) {
          clearInterval(intervalRefs.current[timerId]);
          onTimerEvent?.({ type: 'complete', timerId });
          return {
            ...prev,
            [timerId]: { ...timer, elapsed, remaining, status: 'complete' },
          };
        }

        return {
          ...prev,
          [timerId]: { ...timer, elapsed, remaining },
        };
      });
    }, 1000);
  }, [onTimerEvent]);

  const startTimer = useCallback((timerId) => {
    setTimers((prev) => {
      const timer = prev[timerId];
      if (!timer) return prev;

      startTimerInterval(timerId, timer.type);

      return {
        ...prev,
        [timerId]: {
          ...timer,
          status: 'running',
          startedAt: new Date().toISOString(),
        },
      };
    });

    onTimerEvent?.({ type: 'started', timerId });
  }, [startTimerInterval, onTimerEvent]);

  const pauseTimer = useCallback((timerId) => {
    if (intervalRefs.current[timerId]) {
      clearInterval(intervalRefs.current[timerId]);
    }

    setTimers((prev) => ({
      ...prev,
      [timerId]: { ...prev[timerId], status: 'paused' },
    }));

    onTimerEvent?.({ type: 'paused', timerId });
  }, [onTimerEvent]);

  const resetTimer = useCallback((timerId) => {
    if (intervalRefs.current[timerId]) {
      clearInterval(intervalRefs.current[timerId]);
    }

    setTimers((prev) => {
      const timer = prev[timerId];
      if (!timer) return prev;

      return {
        ...prev,
        [timerId]: {
          ...timer,
          elapsed: 0,
          remaining: timer.type === TIMER_TYPES.COUNTDOWN ? timer.duration : 0,
          status: 'paused',
        },
      };
    });

    onTimerEvent?.({ type: 'reset', timerId });
  }, [onTimerEvent]);

  const deleteTimer = useCallback((timerId) => {
    if (intervalRefs.current[timerId]) {
      clearInterval(intervalRefs.current[timerId]);
    }

    setTimers((prev) => {
      const updated = { ...prev };
      delete updated[timerId];
      return updated;
    });

    onTimerEvent?.({ type: 'deleted', timerId });
  }, [onTimerEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, []);

  const contextValue = {
    timers,
    createTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    deleteTimer,
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
}

/**
 * Hook to access timer context
 */
export function useTimers() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimers must be used within a TimerProvider');
  }
  return context;
}

/**
 * Format milliseconds to MM:SS
 */
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Timer display component
 */
export function TimerDisplay({ timerId, onComplete, className = '' }) {
  const { timers, startTimer, pauseTimer, resetTimer } = useTimers();
  const timer = timers[timerId];

  useEffect(() => {
    if (timer?.status === 'complete') {
      onComplete?.();
    }
  }, [timer?.status, onComplete]);

  if (!timer) return null;

  const displayTime =
    timer.type === TIMER_TYPES.COUNTDOWN
      ? formatTime(timer.remaining)
      : formatTime(timer.elapsed);

  const isRunning = timer.status === 'running';
  const isComplete = timer.status === 'complete';
  const progress =
    timer.type === TIMER_TYPES.COUNTDOWN
      ? (timer.remaining / timer.duration) * 100
      : Math.min((timer.elapsed / timer.duration) * 100, 100);

  return (
    <div
      className={`timer-display ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: isComplete ? '#FFEBEE' : 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {/* Title */}
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
        {timer.title}
      </div>

      {/* Time display */}
      <div
        style={{
          fontSize: '32px',
          fontWeight: 600,
          fontFamily: 'monospace',
          color: isComplete ? '#C62828' : '#333',
        }}
      >
        {displayTime}
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#f0f0f0',
          borderRadius: '2px',
          marginTop: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor:
              progress < 20 ? '#F44336' : progress < 50 ? '#FF9800' : '#4CAF50',
            transition: 'width 1s linear',
          }}
        />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        {!isComplete && (
          <>
            {isRunning ? (
              <button
                onClick={() => pauseTimer(timerId)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Pause
              </button>
            ) : (
              <button
                onClick={() => startTimer(timerId)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Start
              </button>
            )}
          </>
        )}
        <button
          onClick={() => resetTimer(timerId)}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/**
 * Floating timer widget
 */
export function FloatingTimer({ position = 'bottom-right', className = '' }) {
  const { timers, createTimer, deleteTimer } = useTimers();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newDuration, setNewDuration] = useState(5);
  const [newTitle, setNewTitle] = useState('');

  const timerList = Object.values(timers);
  const activeTimers = timerList.filter((t) => t.status === 'running');

  const positionStyles = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
  };

  const handleCreate = () => {
    createTimer({
      duration: newDuration * 60 * 1000,
      title: newTitle || `${newDuration}min Timer`,
      autoStart: true,
    });
    setShowCreate(false);
    setNewDuration(5);
    setNewTitle('');
  };

  return (
    <div
      className={`floating-timer ${className}`}
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 1000,
      }}
    >
      {/* Timer list */}
      {isOpen && timerList.length > 0 && (
        <div
          style={{
            marginBottom: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {timerList.map((timer) => (
            <div
              key={timer.id}
              style={{
                position: 'relative',
              }}
            >
              <TimerDisplay timerId={timer.id} />
              <button
                onClick={() => deleteTimer(timer.id)}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create timer form */}
      {showCreate && (
        <div
          style={{
            marginBottom: '8px',
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Timer name"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '8px',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {[1, 3, 5, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() => setNewDuration(mins)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: newDuration === mins ? '#2196F3' : '#f5f5f5',
                  color: newDuration === mins ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {mins}m
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCreate}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#4CAF50',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Start
            </button>
            <button
              onClick={() => setShowCreate(false)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => {
          if (timerList.length === 0) {
            setShowCreate(true);
          }
          setIsOpen(!isOpen);
        }}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: activeTimers.length > 0 ? '#4CAF50' : '#2196F3',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        ⏱
        {activeTimers.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#F44336',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {activeTimers.length}
          </span>
        )}
      </button>

      {/* Add timer button */}
      {isOpen && !showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          style={{
            position: 'absolute',
            bottom: '70px',
            right: 0,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#2196F3',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          +
        </button>
      )}
    </div>
  );
}

export default VotingProvider;
