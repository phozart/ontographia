// components/dwd/views/OverviewDashboard.js
// DWD Overview Dashboard - Health dashboard with stage progress and observations

import { useMemo } from 'react';
import { useDWD } from '../DWDContext';
import DWDArtefactCard from '../artefacts/DWDArtefactCard';

// MUI Icons
import FolderIcon from '@mui/icons-material/Folder';
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import TuneIcon from '@mui/icons-material/Tune';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function OverviewDashboard({
  onNavigate,
  onSelectArtefact,
  onCreateArtefact,
  onEditArtefact,
  onDeleteArtefact,
}) {
  const {
    cases,
    artefacts,
    stats,
    observations,
    activeCase,
    setActiveCase,
    DWD_STAGES,
  } = useDWD();

  // Calculate stage progress
  const stageProgress = useMemo(() => {
    if (!stats) return [];

    return Object.entries(DWD_STAGES).map(([stageId, stage]) => {
      const count = stats.countsByStage?.[stageId] || 0;
      return {
        id: stageId,
        ...stage,
        count,
      };
    });
  }, [stats, DWD_STAGES]);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!stats) return null;

    return {
      cases: stats.cases?.total || 0,
      activeCases: stats.cases?.byStatus?.active || 0,
      signals: stats.signals?.total || 0,
      highImpactSignals: stats.signals?.byImpact?.high || 0,
      workItems: stats.workItems?.total || 0,
      blockedItems: stats.workItems?.byState?.blocked || 0,
      actors: stats.actors?.total || 0,
      adjustments: stats.adjustments?.total || 0,
      tryingAdjustments: stats.adjustments?.byStatus?.trying || 0,
      learnings: stats.learnings?.total || 0,
    };
  }, [stats]);

  // Recent cases
  const recentCases = useMemo(() => {
    return cases.slice(0, 5);
  }, [cases]);

  return (
    <div className="dwd-overview">
      {/* Summary Stats */}
      <div className="dwd-overview__stats">
        <div className="dwd-stat-card" onClick={() => onNavigate?.('cases')}>
          <div className="dwd-stat-card__icon" style={{ backgroundColor: '#6366f115' }}>
            <FolderIcon style={{ color: '#6366f1' }} />
          </div>
          <div className="dwd-stat-card__content">
            <span className="dwd-stat-card__value">{summaryStats?.cases || 0}</span>
            <span className="dwd-stat-card__label">Work Situations</span>
          </div>
          {summaryStats?.activeCases > 0 && (
            <span className="dwd-stat-card__badge" style={{ backgroundColor: '#3b82f6' }}>
              {summaryStats.activeCases} active
            </span>
          )}
        </div>

        <div className="dwd-stat-card" onClick={() => onNavigate?.('signals')}>
          <div className="dwd-stat-card__icon" style={{ backgroundColor: '#ef444415' }}>
            <WarningIcon style={{ color: '#ef4444' }} />
          </div>
          <div className="dwd-stat-card__content">
            <span className="dwd-stat-card__value">{summaryStats?.signals || 0}</span>
            <span className="dwd-stat-card__label">Signals</span>
          </div>
          {summaryStats?.highImpactSignals > 0 && (
            <span className="dwd-stat-card__badge" style={{ backgroundColor: '#ef4444' }}>
              {summaryStats.highImpactSignals} high impact
            </span>
          )}
        </div>

        <div className="dwd-stat-card" onClick={() => onNavigate?.('work-items')}>
          <div className="dwd-stat-card__icon" style={{ backgroundColor: '#3b82f615' }}>
            <AssignmentIcon style={{ color: '#3b82f6' }} />
          </div>
          <div className="dwd-stat-card__content">
            <span className="dwd-stat-card__value">{summaryStats?.workItems || 0}</span>
            <span className="dwd-stat-card__label">Work Items</span>
          </div>
          {summaryStats?.blockedItems > 0 && (
            <span className="dwd-stat-card__badge" style={{ backgroundColor: '#ef4444' }}>
              {summaryStats.blockedItems} blocked
            </span>
          )}
        </div>

        <div className="dwd-stat-card" onClick={() => onNavigate?.('adjustments')}>
          <div className="dwd-stat-card__icon" style={{ backgroundColor: '#10b98115' }}>
            <TuneIcon style={{ color: '#10b981' }} />
          </div>
          <div className="dwd-stat-card__content">
            <span className="dwd-stat-card__value">{summaryStats?.adjustments || 0}</span>
            <span className="dwd-stat-card__label">Adjustments</span>
          </div>
          {summaryStats?.tryingAdjustments > 0 && (
            <span className="dwd-stat-card__badge" style={{ backgroundColor: '#f59e0b' }}>
              {summaryStats.tryingAdjustments} trying
            </span>
          )}
        </div>
      </div>

      {/* Observations (Heuristic insights) */}
      {observations && observations.length > 0 && (
        <div className="dwd-overview__observations">
          <h3 className="dwd-overview__section-title">
            <InfoIcon fontSize="small" />
            Observations
          </h3>
          <div className="dwd-observations-list">
            {observations.map((obs, idx) => (
              <div
                key={obs.id || idx}
                className={`dwd-observation dwd-observation--${obs.severity}`}
              >
                <div className="dwd-observation__content">
                  <p>{obs.message}</p>
                </div>
                {obs.suggestedAction && (
                  <button
                    className="dwd-observation__action"
                    onClick={() => onCreateArtefact?.()}
                  >
                    {obs.suggestedAction}
                    <ChevronRightIcon fontSize="small" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Progress */}
      <div className="dwd-overview__stages">
        <h3 className="dwd-overview__section-title">
          <TrendingUpIcon fontSize="small" />
          Stage Progress
        </h3>
        <div className="dwd-stages-progress">
          {stageProgress.map(stage => (
            <div
              key={stage.id}
              className="dwd-stage-card"
              onClick={() => onNavigate?.(stage.id)}
              style={{ borderTopColor: stage.color }}
            >
              <div className="dwd-stage-card__header">
                <span className="dwd-stage-card__name">{stage.name}</span>
                <span className="dwd-stage-card__count">{stage.count}</span>
              </div>
              <p className="dwd-stage-card__desc">{stage.description}</p>
              <div className="dwd-stage-card__types">
                {stage.types.map(type => (
                  <span key={type} className="dwd-stage-card__type">
                    {type.replace('dwd_', '')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Cases */}
      <div className="dwd-overview__recent">
        <div className="dwd-overview__section-header">
          <h3 className="dwd-overview__section-title">
            <FolderIcon fontSize="small" />
            Recent Work Situations
          </h3>
          <button
            className="btn btn--small btn--primary"
            onClick={() => onCreateArtefact?.('dwd_case')}
          >
            <AddIcon fontSize="small" />
            New Situation
          </button>
        </div>

        {recentCases.length === 0 ? (
          <div className="dwd-empty-state">
            <FolderIcon style={{ fontSize: 48, opacity: 0.3 }} />
            <p>No work situations yet</p>
            <button
              className="btn btn--primary"
              onClick={() => onCreateArtefact?.('dwd_case')}
            >
              Create Your First Situation
            </button>
          </div>
        ) : (
          <div className="dwd-cases-list">
            {recentCases.map(c => (
              <DWDArtefactCard
                key={c.id}
                artefact={c}
                onSelect={() => {
                  setActiveCase(c);
                  onNavigate?.('landscape');
                }}
                onEdit={onEditArtefact}
                onDelete={onDeleteArtefact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dwd-overview__actions">
        <h3 className="dwd-overview__section-title">Quick Actions</h3>
        <div className="dwd-quick-actions">
          <button
            className="dwd-quick-action"
            onClick={() => onCreateArtefact?.('dwd_case')}
          >
            <FolderIcon />
            <span>New Work Situation</span>
          </button>
          <button
            className="dwd-quick-action"
            onClick={() => onCreateArtefact?.('dwd_signal')}
          >
            <WarningIcon />
            <span>Add Signal</span>
          </button>
          <button
            className="dwd-quick-action"
            onClick={() => onCreateArtefact?.('dwd_adjustment')}
          >
            <TuneIcon />
            <span>Design Adjustment</span>
          </button>
          <button
            className="dwd-quick-action"
            onClick={() => onCreateArtefact?.('dwd_learning')}
          >
            <LightbulbIcon />
            <span>Capture Learning</span>
          </button>
        </div>
      </div>
    </div>
  );
}
