// components/srs/SRSNavigator.js
// Navigation sidebar for SRS workspace
// Shows space navigation, connections, and suggestions

import { useMemo } from 'react';
import { useSRS, SRS_SPACES, SPACE_ORDER, CONNECTION_TYPES } from './SRSContext';

// MUI Icons
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CropFreeIcon from '@mui/icons-material/CropFree';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GavelIcon from '@mui/icons-material/Gavel';
import LinkIcon from '@mui/icons-material/Link';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const SPACE_ICONS = {
  questions: HelpOutlineIcon,
  frames: CropFreeIcon,
  parallel: CallSplitIcon,
  systems: AccountTreeIcon,
  perspectives: VisibilityIcon,
  decisions: GavelIcon,
};

export default function SRSNavigator() {
  const {
    currentSpace,
    navigateToSpace,
    sessionStats,
    connections,
    suggestedNextSpace,
    elements,
  } = useSRS();

  // Get connections summary
  const connectionSummary = useMemo(() => {
    const summary = {};
    Object.keys(CONNECTION_TYPES).forEach(type => {
      summary[type] = connections.filter(c => c.connection_type === type).length;
    });
    return summary;
  }, [connections]);

  // Cross-space connection counts
  const crossSpaceConnections = useMemo(() => {
    const spaceToElements = {};

    // Map elements to their spaces
    Object.entries(elements).forEach(([key, els]) => {
      const space = getSpaceForElementKey(key);
      if (space) {
        els.forEach(el => {
          spaceToElements[el.id] = space;
        });
      }
    });

    // Count cross-space connections
    const counts = {};
    SPACE_ORDER.forEach(s1 => {
      counts[s1] = {};
      SPACE_ORDER.forEach(s2 => {
        counts[s1][s2] = 0;
      });
    });

    connections.forEach(conn => {
      const fromSpace = spaceToElements[conn.from_element_id];
      const toSpace = spaceToElements[conn.to_element_id];
      if (fromSpace && toSpace && fromSpace !== toSpace) {
        counts[fromSpace][toSpace]++;
      }
    });

    return counts;
  }, [elements, connections]);

  return (
    <aside className="srs-navigator">
      {/* Spaces Section */}
      <div className="srs-navigator__section">
        <h3 className="srs-navigator__section-title">Spaces</h3>
        <nav className="srs-navigator__spaces">
          {SPACE_ORDER.map(spaceId => {
            const space = SRS_SPACES[spaceId];
            const Icon = SPACE_ICONS[spaceId] || HelpOutlineIcon;
            const count = sessionStats.bySpace?.[spaceId] || 0;
            const isActive = currentSpace === spaceId;

            // Count outgoing connections from this space
            const outgoingConnections = Object.values(crossSpaceConnections[spaceId] || {})
              .reduce((a, b) => a + b, 0);

            return (
              <button
                key={spaceId}
                className={`srs-navigator__space ${isActive ? 'active' : ''}`}
                onClick={() => navigateToSpace(spaceId)}
                style={{ '--space-color': space.color }}
              >
                <div className="srs-navigator__space-icon">
                  <Icon fontSize="small" />
                </div>
                <div className="srs-navigator__space-info">
                  <span className="srs-navigator__space-name">{space.shortName}</span>
                  <span className="srs-navigator__space-count">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
                {outgoingConnections > 0 && (
                  <span className="srs-navigator__space-connections">
                    <LinkIcon fontSize="small" />
                    {outgoingConnections}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Suggestions Section */}
      {suggestedNextSpace && (
        <div className="srs-navigator__section">
          <h3 className="srs-navigator__section-title">
            <LightbulbIcon fontSize="small" />
            Suggestion
          </h3>
          <div className="srs-navigator__suggestion">
            <p>{suggestedNextSpace.reason}</p>
            <button
              className="srs-btn srs-btn--secondary srs-btn--sm"
              onClick={() => navigateToSpace(suggestedNextSpace.space)}
            >
              Go to {SRS_SPACES[suggestedNextSpace.space]?.shortName}
              <ArrowForwardIcon fontSize="small" />
            </button>
          </div>
        </div>
      )}

      {/* Connections Section */}
      {connections.length > 0 && (
        <div className="srs-navigator__section">
          <h3 className="srs-navigator__section-title">
            <LinkIcon fontSize="small" />
            Connections
          </h3>
          <div className="srs-navigator__connections">
            {Object.entries(connectionSummary)
              .filter(([_, count]) => count > 0)
              .map(([type, count]) => {
                const typeConfig = CONNECTION_TYPES[type];
                return (
                  <div
                    key={type}
                    className="srs-navigator__connection-type"
                    style={{ '--type-color': typeConfig?.color || '#666' }}
                  >
                    <span className="srs-navigator__connection-name">
                      {typeConfig?.name || type}
                    </span>
                    <span className="srs-navigator__connection-count">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="srs-navigator__section srs-navigator__stats">
        <div className="srs-navigator__stat">
          <span className="srs-navigator__stat-value">{sessionStats.totalElements}</span>
          <span className="srs-navigator__stat-label">Total Elements</span>
        </div>
        <div className="srs-navigator__stat">
          <span className="srs-navigator__stat-value">{sessionStats.connections}</span>
          <span className="srs-navigator__stat-label">Connections</span>
        </div>
        <div className="srs-navigator__stat">
          <span className="srs-navigator__stat-value">{sessionStats.snapshots}</span>
          <span className="srs-navigator__stat-label">Snapshots</span>
        </div>
      </div>
    </aside>
  );
}

// Helper to map element keys to spaces
function getSpaceForElementKey(key) {
  const map = {
    questions: 'questions',
    frames: 'frames',
    frameElements: 'frames',
    parallelStates: 'parallel',
    systemNodes: 'systems',
    causalLinks: 'systems',
    feedbackLoops: 'systems',
    perspectives: 'perspectives',
    decisions: 'decisions',
  };
  return map[key];
}
