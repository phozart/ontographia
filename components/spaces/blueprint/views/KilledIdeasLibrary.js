// components/spaces/blueprint/views/KilledIdeasLibrary.js
// Killed Ideas Library — archive of declined initiatives with post-mortem data
// Learning from failures: captures why initiatives were killed, lessons learned, and retrieval triggers

import { useState, useMemo, useCallback } from 'react';
import {
  useBlueprint,
  BPS_STAGE_INFO,
  BPS_KILL_CLASSIFICATIONS,
  BPS_POSTMORTEM_TEMPLATE,
  formatCurrency,
} from '../BlueprintContext';

// MUI Icons
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Classification color mapping
const CLASSIFICATION_COLORS = {
  wrong_timing: '#C9A227',
  wrong_market: '#A54D4D',
  wrong_solution: '#6366f1',
  wrong_team: '#0284c7',
  insufficient_evidence: '#9C9A94',
  strategic_misfit: '#6B6965',
  financial_unviable: '#A54D4D',
  external_factors: '#5C5A54',
};

export default function KilledIdeasLibrary({ onNavigate }) {
  const { initiatives } = useBlueprint();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassification, setFilterClassification] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  // Get all declined/killed initiatives
  const killedInitiatives = useMemo(() => {
    return initiatives.filter(i => i.stage === 'declined' || i.status === 'declined');
  }, [initiatives]);

  // Group by kill classification
  const groupedByClassification = useMemo(() => {
    const groups = {};
    killedInitiatives.forEach(init => {
      const classification = init.governance_data?.kill_classification
        || init.custom_fields?.kill_classification
        || 'unclassified';
      if (!groups[classification]) {
        groups[classification] = [];
      }
      groups[classification].push(init);
    });
    return groups;
  }, [killedInitiatives]);

  // Filter and search
  const filteredInitiatives = useMemo(() => {
    let result = killedInitiatives;

    if (filterClassification !== 'all') {
      result = result.filter(i => {
        const cls = i.governance_data?.kill_classification
          || i.custom_fields?.kill_classification
          || 'unclassified';
        return cls === filterClassification;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.idea_data?.problem_statement?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [killedInitiatives, filterClassification, searchQuery]);

  // Classification stats
  const classificationStats = useMemo(() => {
    const stats = {};
    Object.entries(groupedByClassification).forEach(([cls, items]) => {
      stats[cls] = items.length;
    });
    return stats;
  }, [groupedByClassification]);

  const toggleExpanded = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  return (
    <div className="killed-library">
      {/* Header */}
      <header className="killed-library-header">
        <button className="killed-library-back" onClick={() => onNavigate?.('overview')}>
          <ArrowBackIcon style={{ fontSize: 18 }} />
        </button>
        <div>
          <h1 className="killed-library-title">
            <SchoolIcon style={{ fontSize: 24 }} /> Killed Ideas Library
          </h1>
          <p className="killed-library-subtitle">
            Learn from past decisions — {killedInitiatives.length} initiative{killedInitiatives.length !== 1 ? 's' : ''} archived
          </p>
        </div>
      </header>

      {/* Stats Banner */}
      <div className="killed-library-stats">
        {Object.entries(BPS_KILL_CLASSIFICATIONS || {}).map(([id, cls]) => (
          <div
            key={id}
            className={`killed-library-stat ${filterClassification === id ? 'active' : ''}`}
            onClick={() => setFilterClassification(filterClassification === id ? 'all' : id)}
            style={{ '--cls-color': CLASSIFICATION_COLORS[id] || '#9C9A94' }}
          >
            <span className="killed-library-stat-value">{classificationStats[id] || 0}</span>
            <span className="killed-library-stat-label">{cls.name || id}</span>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="killed-library-controls">
        <div className="killed-library-search">
          <SearchIcon style={{ fontSize: 18, color: '#9C9A94' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search killed initiatives..."
            className="killed-library-search-input"
          />
        </div>
        {filterClassification !== 'all' && (
          <button
            className="killed-library-clear-filter"
            onClick={() => setFilterClassification('all')}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Initiative Cards */}
      <div className="killed-library-list">
        {filteredInitiatives.length === 0 ? (
          <div className="killed-library-empty">
            <CancelIcon style={{ fontSize: 48, color: '#E2E0DB' }} />
            <h3>No Killed Initiatives</h3>
            <p>{killedInitiatives.length === 0
              ? 'No initiatives have been declined yet.'
              : 'No initiatives match your search/filter.'
            }</p>
          </div>
        ) : (
          filteredInitiatives.map(init => {
            const isExpanded = expandedId === init.id;
            const classification = init.governance_data?.kill_classification
              || init.custom_fields?.kill_classification;
            const classInfo = classification && BPS_KILL_CLASSIFICATIONS
              ? BPS_KILL_CLASSIFICATIONS[classification]
              : null;
            const postmortem = init.governance_data?.postmortem || {};
            const declineDate = init.governance_data?.stage_history?.find(
              h => h.decision === 'declined'
            )?.entered;

            return (
              <div key={init.id} className="killed-library-card">
                <div
                  className="killed-library-card-header"
                  onClick={() => toggleExpanded(init.id)}
                >
                  <div className="killed-library-card-main">
                    <span className="killed-library-card-id">{init.initiative_id || init.display_id}</span>
                    <h3 className="killed-library-card-name">{init.name}</h3>
                    {classInfo && (
                      <span
                        className="killed-library-classification-badge"
                        style={{ color: CLASSIFICATION_COLORS[classification] }}
                      >
                        {classInfo.name || classification}
                      </span>
                    )}
                  </div>
                  <div className="killed-library-card-meta">
                    {declineDate && (
                      <span className="killed-library-card-date">
                        <HistoryIcon style={{ fontSize: 14 }} />
                        {new Date(declineDate).toLocaleDateString()}
                      </span>
                    )}
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="killed-library-card-body">
                    {/* Problem statement */}
                    {init.idea_data?.problem_statement && (
                      <div className="killed-library-section">
                        <h4><LightbulbIcon style={{ fontSize: 16 }} /> Original Problem</h4>
                        <p>{init.idea_data.problem_statement}</p>
                      </div>
                    )}

                    {/* Post-mortem */}
                    {(postmortem.hypotheses || postmortem.findings || postmortem.lessons) && (
                      <div className="killed-library-section">
                        <h4><SchoolIcon style={{ fontSize: 16 }} /> Post-Mortem</h4>
                        {postmortem.hypotheses && (
                          <div className="killed-library-field">
                            <span className="killed-library-field-label">Key Hypotheses:</span>
                            <p>{postmortem.hypotheses}</p>
                          </div>
                        )}
                        {postmortem.findings && (
                          <div className="killed-library-field">
                            <span className="killed-library-field-label">Findings:</span>
                            <p>{postmortem.findings}</p>
                          </div>
                        )}
                        {postmortem.lessons && (
                          <div className="killed-library-field">
                            <span className="killed-library-field-label">Lessons Learned:</span>
                            <p>{postmortem.lessons}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Retrieval triggers */}
                    {postmortem.retrieval_triggers && (
                      <div className="killed-library-section killed-library-section--triggers">
                        <h4>Retrieval Triggers</h4>
                        <p className="killed-library-triggers-hint">
                          Conditions under which this idea should be reconsidered:
                        </p>
                        <p>{postmortem.retrieval_triggers}</p>
                      </div>
                    )}

                    {/* Financial summary if available */}
                    {init.case_data?.investment_required && (
                      <div className="killed-library-section">
                        <h4>Financial Context</h4>
                        <div className="killed-library-financials">
                          <span>Investment: {formatCurrency(init.case_data.investment_required)}</span>
                          {init.case_data.year1_revenue && (
                            <span>Projected Y1: {formatCurrency(init.case_data.year1_revenue)}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
