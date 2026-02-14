// components/dwd/views/WorkActorFit.js
// DWD Work-Actor Fit View - Actors and what they touch, authority mapping

import { useState, useMemo } from 'react';
import { useDWD } from '../DWDContext';
import GuidancePanel from '../shared/GuidancePanel';
import QuickStartCard from '../shared/QuickStartCard';
import { WORK_ACTOR_FIT_GUIDANCE } from '../../../../lib/dwd-guidance';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ComputerIcon from '@mui/icons-material/Computer';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import HelpIcon from '@mui/icons-material/Help';
import LinkIcon from '@mui/icons-material/Link';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ACTOR_ICONS = {
  person: PersonIcon,
  team: GroupIcon,
  system: ComputerIcon,
};

export default function WorkActorFit({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const {
    artefacts,
    getArtefactsByType,
    activeCase,
    getCaseArtefacts,
    getRelated,
    DWD_ACTOR_TYPES,
    DWD_AUTHORITY_LEVELS,
  } = useDWD();

  const [searchTerm, setSearchTerm] = useState('');
  const [actorTypeFilter, setActorTypeFilter] = useState('all');
  const [authorityFilter, setAuthorityFilter] = useState('all');
  const [showGuidance, setShowGuidance] = useState(false);

  // Get actors (filtered by active case if set)
  const actors = useMemo(() => {
    const items = activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_actor')
      : getArtefactsByType('dwd_actor');

    return items.filter(actor => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!actor.name.toLowerCase().includes(search)) {
          return false;
        }
      }

      if (actorTypeFilter !== 'all') {
        const actorType = actor.custom_fields?.actor_type || 'person';
        if (actorType !== actorTypeFilter) return false;
      }

      if (authorityFilter !== 'all') {
        const authority = actor.custom_fields?.authority_level || 'medium';
        if (authority !== authorityFilter) return false;
      }

      return true;
    });
  }, [activeCase, getCaseArtefacts, getArtefactsByType, searchTerm, actorTypeFilter, authorityFilter]);

  // Get work items
  const workItems = useMemo(() => {
    return activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_work_item')
      : getArtefactsByType('dwd_work_item');
  }, [activeCase, getCaseArtefacts, getArtefactsByType]);

  // Build actor-work item relationships
  const actorWorkMap = useMemo(() => {
    const map = new Map();

    actors.forEach(actor => {
      const rels = getRelated(actor.id);
      const touchedWorkItems = rels
        .map(rel => {
          const otherId = rel.from_artefact_id === actor.id ? rel.to_artefact_id : rel.from_artefact_id;
          return artefacts.find(a => a.id === otherId && a.artefact_type === 'dwd_work_item');
        })
        .filter(Boolean);

      map.set(actor.id, touchedWorkItems);
    });

    return map;
  }, [actors, artefacts, getRelated]);

  // Detect overload (actors touching many items with low authority)
  const overloadWarnings = useMemo(() => {
    const warnings = [];

    actors.forEach(actor => {
      const touchedItems = actorWorkMap.get(actor.id) || [];
      const authority = actor.custom_fields?.authority_level || 'medium';

      // Heuristic: touching 3+ items with low authority = potential overload
      if (touchedItems.length >= 3 && authority === 'low') {
        warnings.push({
          actorId: actor.id,
          actorName: actor.name,
          type: 'overload_low_authority',
          message: `${actor.name} touches ${touchedItems.length} work items but has low authority`,
          severity: 'medium',
        });
      }

      // High volatility items + low authority
      const highVolItems = touchedItems.filter(i => i.custom_fields?.volatility === 'high');
      if (highVolItems.length > 0 && authority === 'low') {
        warnings.push({
          actorId: actor.id,
          actorName: actor.name,
          type: 'high_vol_low_auth',
          message: `${actor.name} handles high-volatility work with low authority`,
          severity: 'high',
        });
      }

      // Too many items (overload)
      if (touchedItems.length >= 5) {
        warnings.push({
          actorId: actor.id,
          actorName: actor.name,
          type: 'overload',
          message: `${actor.name} is connected to ${touchedItems.length} work items (potential overload)`,
          severity: 'medium',
        });
      }
    });

    return warnings;
  }, [actors, actorWorkMap]);

  // Stats
  const stats = useMemo(() => ({
    total: actors.length,
    byType: {
      person: actors.filter(a => a.custom_fields?.actor_type === 'person' || !a.custom_fields?.actor_type).length,
      team: actors.filter(a => a.custom_fields?.actor_type === 'team').length,
      system: actors.filter(a => a.custom_fields?.actor_type === 'system').length,
    },
    lowAuthority: actors.filter(a => a.custom_fields?.authority_level === 'low').length,
    warnings: overloadWarnings.length,
    highSeverity: overloadWarnings.filter(w => w.severity === 'high').length,
  }), [actors, overloadWarnings]);

  const isEmpty = actors.length === 0 && !searchTerm && actorTypeFilter === 'all';

  return (
    <div className="dwd-work-actor-fit">
      {/* Guidance Panel */}
      {showGuidance && (
        <GuidancePanel
          guidance={WORK_ACTOR_FIT_GUIDANCE}
          onClose={() => setShowGuidance(false)}
        />
      )}

      {/* Header */}
      <div className="dwd-view-header">
        <div className="dwd-view-header__left">
          <h2>Work-Actor Fit</h2>
          <p>Analyze who handles what work and whether they have appropriate authority</p>
        </div>

        <div className="dwd-view-stats">
          <span className="dwd-view-stat">
            <PersonIcon fontSize="small" />
            {stats.total} actors
          </span>
          <span className="dwd-view-stat">
            {stats.byType.person} people
          </span>
          <span className="dwd-view-stat">
            {stats.byType.team} teams
          </span>
          {stats.byType.system > 0 && (
            <span className="dwd-view-stat">
              {stats.byType.system} systems
            </span>
          )}
          {stats.warnings > 0 && (
            <span className="dwd-view-stat dwd-view-stat--warning">
              <WarningIcon fontSize="small" />
              {stats.warnings} issues
              {stats.highSeverity > 0 && ` (${stats.highSeverity} critical)`}
            </span>
          )}
        </div>
      </div>

      <div className="dwd-view-actions">
        {/* Search */}
        <div className="dwd-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            placeholder="Search actors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <select
          className="dwd-filter-select"
          value={actorTypeFilter}
          onChange={(e) => setActorTypeFilter(e.target.value)}
        >
          <option value="all">All types</option>
          {DWD_ACTOR_TYPES?.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          className="dwd-filter-select"
          value={authorityFilter}
          onChange={(e) => setAuthorityFilter(e.target.value)}
        >
          <option value="all">All authority</option>
          {DWD_AUTHORITY_LEVELS?.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>

        {/* Help button */}
        <button
          className="btn btn--ghost btn--small"
          onClick={() => setShowGuidance(true)}
        >
          <HelpIcon fontSize="small" />
          How to use
        </button>

        <button
          className="btn btn--primary btn--small"
          onClick={() => onCreateArtefact?.('dwd_actor')}
        >
          <AddIcon fontSize="small" />
          Add Actor
        </button>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <QuickStartCard
          quickStart={WORK_ACTOR_FIT_GUIDANCE.quickStart}
          onCreate={onCreateArtefact}
        />
      )}

      {/* Warnings Panel */}
      {!isEmpty && overloadWarnings.length > 0 && (
        <div className="dwd-warnings-panel">
          <div className="dwd-warnings-panel__header">
            <h4>
              <ErrorOutlineIcon fontSize="small" />
              Potential Fit Issues Detected
            </h4>
            <span className="dwd-warnings-panel__count">
              {stats.highSeverity > 0 && (
                <span style={{ color: '#ef4444' }}>{stats.highSeverity} critical</span>
              )}
              {stats.warnings - stats.highSeverity > 0 && (
                <span style={{ color: '#f59e0b' }}>{stats.warnings - stats.highSeverity} warnings</span>
              )}
            </span>
          </div>
          <div className="dwd-warnings-list">
            {overloadWarnings.map((warning, idx) => (
              <div
                key={idx}
                className={`dwd-warning-item dwd-warning-item--${warning.severity}`}
              >
                {warning.severity === 'high' ? (
                  <ErrorOutlineIcon fontSize="small" style={{ color: '#ef4444' }} />
                ) : (
                  <WarningIcon fontSize="small" style={{ color: '#f59e0b' }} />
                )}
                <span>{warning.message}</span>
                <div className="dwd-warning-item__hint">
                  {warning.type === 'high_vol_low_auth' && (
                    <span>Consider increasing authority or reassigning to actor with higher authority</span>
                  )}
                  {warning.type === 'overload' && (
                    <span>Review if this actor is a bottleneck or legitimate coordination hub</span>
                  )}
                  {warning.type === 'overload_low_authority' && (
                    <span>Low authority with many work types may cause delays and escalations</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actor Cards with Work Items */}
      {!isEmpty && (
        <div className="dwd-actor-grid">
          {actors.map(actor => {
            const touchedItems = actorWorkMap.get(actor.id) || [];
            const Icon = ACTOR_ICONS[actor.custom_fields?.actor_type] || PersonIcon;
            const authority = actor.custom_fields?.authority_level || 'medium';
            const authorityColors = { low: '#ef4444', medium: '#f59e0b', high: '#10b981' };
            const hasWarning = overloadWarnings.some(w => w.actorId === actor.id);
            const hasCritical = overloadWarnings.some(w => w.actorId === actor.id && w.severity === 'high');

            return (
              <div
                key={actor.id}
                className={`dwd-actor-card ${hasWarning ? 'dwd-actor-card--warning' : ''} ${hasCritical ? 'dwd-actor-card--critical' : ''}`}
              >
                <div className="dwd-actor-card__header">
                  <div className="dwd-actor-card__icon">
                    <Icon />
                  </div>
                  <div className="dwd-actor-card__info">
                    <h4>{actor.name}</h4>
                    <span className="dwd-actor-card__type">
                      {actor.custom_fields?.actor_type || 'person'}
                    </span>
                  </div>
                  <span
                    className="dwd-actor-card__authority"
                    style={{ backgroundColor: authorityColors[authority] }}
                    title={`${authority} authority - ${
                      authority === 'high' ? 'Can make significant decisions independently' :
                      authority === 'medium' ? 'Can make routine decisions within guidelines' :
                      'Must follow procedures, escalate decisions'
                    }`}
                  >
                    {authority}
                  </span>
                </div>

                {actor.custom_fields?.constraints && (
                  <p className="dwd-actor-card__constraints">
                    <strong>Constraints:</strong> {actor.custom_fields.constraints}
                  </p>
                )}

                {actor.custom_fields?.capabilities && (
                  <p className="dwd-actor-card__capabilities">
                    <strong>Capabilities:</strong> {actor.custom_fields.capabilities}
                  </p>
                )}

                <div className="dwd-actor-card__work-items">
                  <h5>
                    <LinkIcon fontSize="small" />
                    Connected to {touchedItems.length} work items
                  </h5>
                  {touchedItems.length > 0 ? (
                    <div className="dwd-actor-card__items-list">
                      {touchedItems.slice(0, 4).map(item => (
                        <div
                          key={item.id}
                          className="dwd-actor-card__item"
                          onClick={() => onSelectArtefact?.(item)}
                        >
                          <span className="dwd-actor-card__item-name">{item.name}</span>
                          {item.custom_fields?.volatility === 'high' && (
                            <span className="dwd-actor-card__item-badge" style={{ backgroundColor: '#ef4444' }}>
                              high vol
                            </span>
                          )}
                          {item.custom_fields?.volatility === 'low' && (
                            <span className="dwd-actor-card__item-badge" style={{ backgroundColor: '#10b981' }}>
                              low vol
                            </span>
                          )}
                        </div>
                      ))}
                      {touchedItems.length > 4 && (
                        <span className="dwd-actor-card__more">
                          +{touchedItems.length - 4} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="dwd-actor-card__no-items">
                      No connected work items
                      <span className="dwd-actor-card__hint">
                        Link this actor to work items to analyze fit
                      </span>
                    </p>
                  )}
                </div>

                {/* Fit indicator */}
                {touchedItems.length > 0 && (
                  <div className="dwd-actor-card__fit-indicator">
                    {hasWarning ? (
                      <span className="dwd-actor-card__fit dwd-actor-card__fit--warning">
                        <WarningIcon fontSize="small" />
                        Potential fit issue
                      </span>
                    ) : (
                      <span className="dwd-actor-card__fit dwd-actor-card__fit--good">
                        <CheckCircleIcon fontSize="small" />
                        Good fit
                      </span>
                    )}
                  </div>
                )}

                <div className="dwd-actor-card__actions">
                  <button onClick={() => onEditArtefact?.(actor)}>Edit</button>
                  <button onClick={() => onDeleteArtefact?.(actor)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
