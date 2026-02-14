// components/pds/views/OverviewDashboard.js
// Project Canvas - Overview dashboard for PDS workspace
// Redesigned with better visual layout

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import {
  ViewHeader,
  SummaryBar,
  SummaryItem,
  Card,
  Button
} from '../../../ui';
import { HealthWheel } from '../../../ui';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function OverviewDashboard({
  onNavigate,
  onSelectArtefact,
  onCreateArtefact,
  onEditArtefact,
  onDeleteArtefact,
}) {
  const {
    activeProject,
    activePdsProject,
    artefacts,
    stats,
    projectHealth,
    stageCompletion,
    PDS_STAGE_INFO,
  } = usePDS();

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!artefacts.length) return null;

    return {
      stakeholders: artefacts.filter(a => a.artefact_type === 'pds_stakeholder').length,
      deliverables: artefacts.filter(a => a.artefact_type === 'pds_deliverable').length,
      risks: artefacts.filter(a => a.artefact_type === 'pds_risk').length,
      issues: artefacts.filter(a => a.artefact_type === 'pds_issue' &&
        a.custom_fields?.status !== 'resolved').length,
      milestones: artefacts.filter(a => a.artefact_type === 'pds_milestone').length,
    };
  }, [artefacts]);

  // Prepare stage data with colors and info
  const stageData = useMemo(() => {
    if (!PDS_STAGE_INFO) return [];

    return Object.entries(PDS_STAGE_INFO).map(([id, stage]) => ({
      id,
      name: stage.name || id,
      shortName: stage.shortName || stage.name?.split(' ')[0] || id,
      completion: stageCompletion?.[id] || 0,
      color: stage.color || '#64748b',
      icon: stage.icon,
    }));
  }, [stageCompletion, PDS_STAGE_INFO]);

  // Prepare health wheel data with abbreviated labels for radar chart
  const healthWheelData = useMemo(() => {
    // Use very short labels to fit within radar chart
    const abbreviations = {
      'intent': 'Intent',
      'structure': 'Plan',
      'uncertainty': 'Risk',
      'control': 'Execute',
      'learning': 'Learn',
    };
    return stageData.map(stage => ({
      label: abbreviations[stage.id] || stage.shortName,
      value: stage.completion,
      color: stage.color,
    }));
  }, [stageData]);

  // Calculate overall health
  const overallHealth = useMemo(() => {
    if (!stageData.length) return 0;
    const total = stageData.reduce((acc, s) => acc + s.completion, 0);
    return Math.round(total / stageData.length);
  }, [stageData]);

  // Use main project for display, PDS project for data if available
  const displayProject = activePdsProject || activeProject;

  return (
    <div className="pds-view">
      <ViewHeader
        icon={DashboardIcon}
        title="Project Overview"
        description={displayProject.vision || displayProject.description || 'Your project at a glance'}
      />

      {/* Summary stats */}
      {summaryStats && (
        <SummaryBar>
          <SummaryItem
            icon={PeopleIcon}
            label="Stakeholders"
            value={summaryStats.stakeholders}
            onClick={() => onNavigate?.('stakeholders')}
          />
          <SummaryItem
            icon={AssignmentIcon}
            label="Deliverables"
            value={summaryStats.deliverables}
            onClick={() => onNavigate?.('structure')}
          />
          <SummaryItem
            icon={WarningIcon}
            label="Active Risks"
            value={summaryStats.risks}
            onClick={() => onNavigate?.('risk')}
          />
          <SummaryItem
            icon={FlagIcon}
            label="Milestones"
            value={summaryStats.milestones}
            onClick={() => onNavigate?.('timeline')}
          />
        </SummaryBar>
      )}

      <div className="pds-view__content">
        <div className="pds-dashboard-grid pds-cards-grid--animated">
          {/* Project Health - Radar Chart */}
          <div className="pds-dashboard-card pds-dashboard-card--health pds-card--animated pds-card--lift">
            <div className="pds-dashboard-card__header">
              <TrendingUpIcon className="pds-dashboard-card__icon" />
              <h3>Project Health</h3>
            </div>
            <div className="pds-health-wheel-container">
              {healthWheelData.length > 0 ? (
                <HealthWheel
                  spaces={healthWheelData}
                  size={360}
                  showPercentage={true}
                />
              ) : (
                <div className="pds-health-empty">
                  <TrendingUpIcon className="pds-health-empty__icon" />
                  <p>Add artefacts to see health metrics</p>
                </div>
              )}
            </div>
          </div>

          {/* Stage Progress - Horizontal Bars */}
          <div className="pds-dashboard-card pds-dashboard-card--stages pds-card--animated pds-card--lift">
            <div className="pds-dashboard-card__header">
              <RocketLaunchIcon className="pds-dashboard-card__icon" />
              <h3>Stage Progress</h3>
            </div>
            <div className="pds-stage-bars">
              {stageData.map((stage) => (
                <div
                  key={stage.id}
                  className="pds-stage-bar pds-progress-bar--animated"
                  onClick={() => onNavigate?.(stage.id)}
                >
                  <div className="pds-stage-bar__header">
                    <span className="pds-stage-bar__name">{stage.name}</span>
                    <span className="pds-stage-bar__value">{stage.completion}%</span>
                  </div>
                  <div className="pds-stage-bar__track">
                    <div
                      className="pds-stage-bar__fill"
                      style={{
                        width: `${stage.completion}%`,
                        background: stage.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions - Icon Cards */}
          <div className="pds-dashboard-card pds-dashboard-card--actions pds-card--animated pds-card--lift">
            <div className="pds-dashboard-card__header">
              <AutoAwesomeIcon className="pds-dashboard-card__icon" />
              <h3>Quick Actions</h3>
            </div>
            <div className="pds-action-grid">
              <button
                className="pds-action-btn pds-action-btn--purple"
                onClick={() => onCreateArtefact?.('pds_stakeholder')}
              >
                <div className="pds-action-btn__icon">
                  <PeopleIcon />
                </div>
                <span className="pds-action-btn__label">Add Stakeholder</span>
              </button>
              <button
                className="pds-action-btn pds-action-btn--blue"
                onClick={() => onCreateArtefact?.('pds_deliverable')}
              >
                <div className="pds-action-btn__icon">
                  <AssignmentIcon />
                </div>
                <span className="pds-action-btn__label">Add Deliverable</span>
              </button>
              <button
                className="pds-action-btn pds-action-btn--amber"
                onClick={() => onCreateArtefact?.('pds_risk')}
              >
                <div className="pds-action-btn__icon">
                  <WarningIcon />
                </div>
                <span className="pds-action-btn__label">Log Risk</span>
              </button>
              <button
                className="pds-action-btn pds-action-btn--green"
                onClick={() => onCreateArtefact?.('pds_milestone')}
              >
                <div className="pds-action-btn__icon">
                  <FlagIcon />
                </div>
                <span className="pds-action-btn__label">Set Milestone</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="pds-dashboard-card pds-dashboard-card--activity pds-card--animated pds-card--lift">
            <div className="pds-dashboard-card__header">
              <HistoryIcon className="pds-dashboard-card__icon" />
              <h3>Recent Activity</h3>
            </div>
            {artefacts.length > 0 ? (
              <div className="pds-activity-list">
                {artefacts.slice(0, 5).map(artefact => (
                  <div
                    key={artefact.id}
                    className="pds-activity-item"
                    onClick={() => onSelectArtefact?.(artefact)}
                  >
                    <div className="pds-activity-item__icon">
                      <CheckCircleIcon fontSize="small" />
                    </div>
                    <div className="pds-activity-item__content">
                      <span className="pds-activity-item__name">{artefact.name}</span>
                      <span className="pds-activity-item__type">
                        {artefact.artefact_type?.replace('pds_', '').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pds-activity-empty">
                <HistoryIcon className="pds-activity-empty__icon" />
                <p className="pds-activity-empty__title">No activity yet</p>
                <p className="pds-activity-empty__desc">
                  Start by adding stakeholders, deliverables, or milestones to your project
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
