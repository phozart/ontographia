// components/spaces/gtm/GTMNavigator.js
// Navigation for GTM Studio - Module-based sidebar navigation

import { useState, useMemo } from 'react';
import { useGTM, GTM_MODULES, GTM_ARTEFACT_TYPES, GTM_STAGES } from './GTMContext';

// MUI Icons
import CampaignIcon from '@mui/icons-material/Campaign';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import MessageIcon from '@mui/icons-material/Message';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import SchoolIcon from '@mui/icons-material/School';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Module icon mapping
const MODULE_ICONS = {
  plan: CampaignIcon,
  strategy: TrackChangesIcon,
  messaging: MessageIcon,
  launch: RocketLaunchIcon,
  campaigns: GroupWorkIcon,
  enablement: SchoolIcon,
  metrics: BarChartIcon
};

// Module Item Component
function ModuleItem({ moduleId, module, isActive, artefactCount, onClick, onCreateArtefact }) {
  const [expanded, setExpanded] = useState(isActive);
  const Icon = MODULE_ICONS[moduleId] || FolderIcon;

  return (
    <div className={`gtm-nav-module ${isActive ? 'active' : ''}`}>
      <div
        className="gtm-nav-module-header"
        onClick={() => onClick(moduleId)}
      >
        {module.artefactTypes?.length > 0 && (
          <button
            className="gtm-nav-module-expand"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </button>
        )}

        <span className="gtm-nav-module-icon" style={{ color: module.color }}>
          <Icon fontSize="small" />
        </span>

        <span className="gtm-nav-module-name">{module.name}</span>

        {artefactCount > 0 && (
          <span className="gtm-nav-module-count">{artefactCount}</span>
        )}
      </div>

      {expanded && module.artefactTypes?.length > 0 && (
        <div className="gtm-nav-module-artefacts">
          {module.artefactTypes.map(typeId => {
            const type = GTM_ARTEFACT_TYPES[typeId];
            if (!type) return null;

            return (
              <button
                key={typeId}
                className="gtm-nav-artefact-type"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateArtefact(typeId);
                }}
                title={`Create ${type.name}`}
              >
                <span className="gtm-nav-artefact-icon">{type.icon}</span>
                <span className="gtm-nav-artefact-name">{type.name}</span>
                <AddIcon className="gtm-nav-artefact-add" fontSize="small" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// GTM Plan Selector
function PlanSelector({ plans, activePlan, onSelect, onCreate }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const getStageColor = (status) => {
    return GTM_STAGES[status]?.color || '#9ca3af';
  };

  return (
    <div className="gtm-nav-plan-selector">
      <button
        className="gtm-nav-plan-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {activePlan ? (
          <>
            <span
              className="gtm-nav-plan-status"
              style={{ backgroundColor: getStageColor(activePlan.status) }}
            />
            <span className="gtm-nav-plan-prefix">GTM-{activePlan.number || '???'}</span>
            <span className="gtm-nav-plan-name">{activePlan.name}</span>
          </>
        ) : (
          <span className="gtm-nav-plan-placeholder">Select GTM Plan</span>
        )}
        <ExpandMoreIcon fontSize="small" />
      </button>

      {showDropdown && (
        <div className="gtm-nav-plan-dropdown">
          {plans.length === 0 ? (
            <div className="gtm-nav-plan-empty">
              <p>No GTM plans yet</p>
              <button onClick={onCreate} className="gtm-nav-plan-create">
                <AddIcon fontSize="small" />
                Create First GTM Plan
              </button>
            </div>
          ) : (
            <>
              {plans.map(plan => (
                <button
                  key={plan.id}
                  className={`gtm-nav-plan-option ${activePlan?.id === plan.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelect(plan);
                    setShowDropdown(false);
                  }}
                >
                  <span
                    className="option-status"
                    style={{ backgroundColor: getStageColor(plan.status) }}
                  />
                  <span className="option-prefix">GTM-{plan.number || '???'}</span>
                  <span className="option-name">{plan.name}</span>
                  <span className="option-stage">{GTM_STAGES[plan.status]?.name || plan.status}</span>
                </button>
              ))}
              <button
                className="gtm-nav-plan-create"
                onClick={() => {
                  setShowDropdown(false);
                  onCreate();
                }}
              >
                <AddIcon fontSize="small" />
                New GTM Plan
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Stage Progress Indicator
function StageProgressIndicator({ currentStage }) {
  const stages = Object.values(GTM_STAGES);
  const currentIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="gtm-nav-stages">
      <div className="gtm-nav-stages-title">Stage Progress</div>
      <div className="gtm-nav-stages-track">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={`gtm-nav-stage ${index <= currentIndex ? 'completed' : ''} ${index === currentIndex ? 'current' : ''}`}
            title={stage.name}
          >
            <div
              className="gtm-nav-stage-dot"
              style={{ backgroundColor: index <= currentIndex ? stage.color : '#d1d5db' }}
            />
            {index < stages.length - 1 && (
              <div
                className="gtm-nav-stage-line"
                style={{ backgroundColor: index < currentIndex ? stages[index + 1].color : '#d1d5db' }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="gtm-nav-stages-labels">
        {stages.map((stage, index) => (
          <span
            key={stage.id}
            className={`gtm-nav-stage-label ${index === currentIndex ? 'current' : ''}`}
          >
            {stage.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// Completeness Indicator
function CompletenessIndicator({ score, rules }) {
  const failedRules = rules.filter(r => !r.passed);

  return (
    <div className="gtm-nav-completeness">
      <div className="gtm-nav-completeness-header">
        <span>GTM Readiness</span>
        <span className="gtm-nav-completeness-score">{score}%</span>
      </div>

      <div className="gtm-nav-completeness-bar">
        <div
          className="gtm-nav-completeness-fill"
          style={{
            width: `${score}%`,
            backgroundColor: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
          }}
        />
      </div>

      {failedRules.length > 0 && (
        <div className="gtm-nav-completeness-hints">
          {failedRules.slice(0, 3).map(rule => (
            <div key={rule.id} className="gtm-nav-hint">
              <WarningIcon fontSize="small" />
              <span>{rule.message}</span>
            </div>
          ))}
          {failedRules.length > 3 && (
            <span className="gtm-nav-hint-more">+{failedRules.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  );
}

// Quick Stats Panel
function QuickStats({ stats }) {
  return (
    <div className="gtm-nav-stats">
      <div className="gtm-nav-stats-title">Quick Stats</div>
      <div className="gtm-nav-stats-grid">
        <div className="gtm-nav-stat">
          <span className="gtm-nav-stat-value">{stats.totalArtefacts}</span>
          <span className="gtm-nav-stat-label">Artefacts</span>
        </div>
        <div className="gtm-nav-stat">
          <span className="gtm-nav-stat-value">{stats.activeCampaigns}</span>
          <span className="gtm-nav-stat-label">Active Campaigns</span>
        </div>
        <div className="gtm-nav-stat">
          <span className="gtm-nav-stat-value">{stats.byType['Material'] || 0}</span>
          <span className="gtm-nav-stat-label">Materials</span>
        </div>
        <div className="gtm-nav-stat">
          <span className="gtm-nav-stat-value">{stats.byType['Target'] || 0}</span>
          <span className="gtm-nav-stat-label">Targets</span>
        </div>
      </div>
    </div>
  );
}

// Main Navigator Component
export default function GTMNavigator({ onCreateArtefact, onCreatePlan }) {
  const {
    gtmPlans,
    activeGTMPlan,
    setActiveGTMPlan,
    activeModule,
    setActiveModule,
    stats,
    calculateCompleteness
  } = useGTM();

  const [searchQuery, setSearchQuery] = useState('');

  const completeness = useMemo(() => calculateCompleteness(), [calculateCompleteness]);

  return (
    <nav className="gtm-navigator">
      {/* Plan Selector */}
      <PlanSelector
        plans={gtmPlans}
        activePlan={activeGTMPlan}
        onSelect={setActiveGTMPlan}
        onCreate={onCreatePlan}
      />

      {/* Stage Progress */}
      {activeGTMPlan && (
        <StageProgressIndicator currentStage={activeGTMPlan.status} />
      )}

      {/* Search */}
      <div className="gtm-nav-search">
        <SearchIcon fontSize="small" />
        <input
          type="text"
          placeholder="Search artefacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Modules */}
      <div className="gtm-nav-modules">
        <div className="gtm-nav-section-title">Modules</div>

        {Object.entries(GTM_MODULES).map(([moduleId, module]) => (
          <ModuleItem
            key={moduleId}
            moduleId={moduleId}
            module={module}
            isActive={activeModule === moduleId}
            artefactCount={stats.byModule[moduleId] || 0}
            onClick={setActiveModule}
            onCreateArtefact={onCreateArtefact}
          />
        ))}
      </div>

      {/* Completeness */}
      {activeGTMPlan && (
        <CompletenessIndicator
          score={completeness.score}
          rules={completeness.rules}
        />
      )}

      {/* Quick Stats */}
      {activeGTMPlan && <QuickStats stats={stats} />}

      {/* Enterprise Link */}
      {activeGTMPlan?.links?.service && (
        <div className="gtm-nav-enterprise-link">
          <TrendingUpIcon fontSize="small" />
          <span>Linked to Service</span>
          <a href={`/enterprise/services/${activeGTMPlan.links.service}`}>
            {activeGTMPlan.links.service}
          </a>
        </div>
      )}
    </nav>
  );
}

export { ModuleItem, PlanSelector, StageProgressIndicator, CompletenessIndicator, QuickStats };
