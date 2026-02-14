// components/spaces/analysis/AnalysisNavigator.js
// Navigation for Analysis Studio - Module-based sidebar navigation

import { useState, useMemo } from 'react';
import { useAnalysis, ANALYSIS_MODULES, ANALYSIS_ARTEFACT_TYPES } from './AnalysisContext';

// MUI Icons
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import PaletteIcon from '@mui/icons-material/Palette';
import GroupIcon from '@mui/icons-material/Group';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import StorageIcon from '@mui/icons-material/Storage';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

// Module icon mapping
const MODULE_ICONS = {
  requirements: AssignmentIcon,
  stories: DescriptionIcon,
  architecture: ArchitectureIcon,
  data: StorageIcon,
  design: PaletteIcon,
  testing: CheckCircleIcon,
  crosscutting: LinkIcon,
  stakeholders: GroupIcon,
  traceability: AccountTreeIcon
};

// Module Item Component
function ModuleItem({ moduleId, module, isActive, artefactCount, onClick, onCreateArtefact }) {
  const [expanded, setExpanded] = useState(isActive);
  const Icon = MODULE_ICONS[moduleId] || FolderIcon;

  return (
    <div className={`nav-module ${isActive ? 'active' : ''}`}>
      <div
        className="nav-module-header"
        onClick={() => onClick(moduleId)}
      >
        <button
          className="nav-module-expand"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </button>

        <span className="nav-module-icon" style={{ color: module.color }}>
          <Icon fontSize="small" />
        </span>

        <span className="nav-module-name">{module.name}</span>

        <span className="nav-module-count">{artefactCount}</span>
      </div>

      {expanded && module.artefactTypes?.length > 0 && (
        <div className="nav-module-artefacts">
          {module.artefactTypes.map(typeId => {
            const type = ANALYSIS_ARTEFACT_TYPES[typeId];
            if (!type) return null;

            return (
              <button
                key={typeId}
                className="nav-artefact-type"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateArtefact(typeId);
                }}
                title={`Create ${type.name}`}
              >
                <span className="nav-artefact-icon">{type.icon}</span>
                <span className="nav-artefact-name">{type.name}</span>
                <AddIcon className="nav-artefact-add" fontSize="small" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Analysis Project Selector
function ProjectSelector({ projects, activeProject, onSelect, onCreate }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="nav-project-selector">
      <button
        className="nav-project-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {activeProject ? (
          <>
            <span className="nav-project-prefix">AN-{activeProject.number || '???'}</span>
            <span className="nav-project-name">{activeProject.name}</span>
          </>
        ) : (
          <span className="nav-project-placeholder">Select Analysis Project</span>
        )}
        <ExpandMoreIcon fontSize="small" />
      </button>

      {showDropdown && (
        <div className="nav-project-dropdown">
          {projects.length === 0 ? (
            <div className="nav-project-empty">
              <p>No analysis projects yet</p>
              <button onClick={onCreate} className="nav-project-create">
                <AddIcon fontSize="small" />
                Create First Project
              </button>
            </div>
          ) : (
            <>
              {projects.map(project => (
                <button
                  key={project.id}
                  className={`nav-project-option ${activeProject?.id === project.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelect(project);
                    setShowDropdown(false);
                  }}
                >
                  <span className="option-prefix">AN-{project.number || '???'}</span>
                  <span className="option-name">{project.name}</span>
                  {project.status === 'Approved' && (
                    <CheckCircleIcon fontSize="small" className="option-status approved" />
                  )}
                  {project.status === 'In Review' && (
                    <WarningIcon fontSize="small" className="option-status review" />
                  )}
                </button>
              ))}
              <button
                className="nav-project-create"
                onClick={onCreate}
              >
                <AddIcon fontSize="small" />
                New Analysis Project
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Completeness Indicator
function CompletenessIndicator({ score, rules }) {
  const passedRules = rules.filter(r => r.passed);
  const failedRules = rules.filter(r => !r.passed);

  return (
    <div className="nav-completeness">
      <div className="nav-completeness-header">
        <span>Completeness</span>
        <span className="nav-completeness-score">{score}%</span>
      </div>

      <div className="nav-completeness-bar">
        <div
          className="nav-completeness-fill"
          style={{
            width: `${score}%`,
            backgroundColor: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
          }}
        />
      </div>

      {failedRules.length > 0 && (
        <div className="nav-completeness-hints">
          {failedRules.slice(0, 3).map(rule => (
            <div key={rule.id} className="nav-hint">
              <WarningIcon fontSize="small" />
              <span>{rule.message}</span>
            </div>
          ))}
          {failedRules.length > 3 && (
            <span className="nav-hint-more">+{failedRules.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  );
}

// Main Navigator Component
export default function AnalysisNavigator({ onCreateArtefact, onCreateProject }) {
  const {
    analysisProjects,
    activeAnalysisProject,
    setActiveAnalysisProject,
    activeModule,
    setActiveModule,
    stats,
    calculateCompleteness
  } = useAnalysis();

  const [searchQuery, setSearchQuery] = useState('');

  const completeness = useMemo(() => calculateCompleteness(), [calculateCompleteness]);

  return (
    <nav className="analysis-navigator">
      {/* Project Selector */}
      <ProjectSelector
        projects={analysisProjects}
        activeProject={activeAnalysisProject}
        onSelect={setActiveAnalysisProject}
        onCreate={onCreateProject}
      />

      {/* Search */}
      <div className="nav-search">
        <SearchIcon fontSize="small" />
        <input
          type="text"
          placeholder="Search artefacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Navigation */}
      <div className="nav-main">
        <button
          className={`nav-main-item ${activeModule === 'overview' || activeModule === null ? 'active' : ''}`}
          onClick={() => setActiveModule('overview')}
        >
          <HomeIcon fontSize="small" />
          <span>Studio Home</span>
        </button>
        <button
          className={`nav-main-item ${activeModule === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveModule('dashboard')}
        >
          <DashboardIcon fontSize="small" />
          <span>Full Dashboard</span>
        </button>
      </div>

      {/* Modules */}
      <div className="nav-modules">
        <div className="nav-section-title">Modules</div>

        {Object.entries(ANALYSIS_MODULES).map(([moduleId, module]) => (
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
      {activeAnalysisProject && (
        <CompletenessIndicator
          score={completeness.score}
          rules={completeness.rules}
        />
      )}

      {/* Quick Stats */}
      {activeAnalysisProject && (
        <div className="nav-stats">
          <div className="nav-stats-title">Overview</div>
          <div className="nav-stats-grid">
            <div className="nav-stat">
              <span className="nav-stat-value">{stats.total}</span>
              <span className="nav-stat-label">Artefacts</span>
            </div>
            <div className="nav-stat">
              <span className="nav-stat-value">{stats.relationships}</span>
              <span className="nav-stat-label">Relationships</span>
            </div>
            <div className="nav-stat">
              <span className="nav-stat-value">{stats.byStatus['Approved'] || 0}</span>
              <span className="nav-stat-label">Approved</span>
            </div>
            <div className="nav-stat">
              <span className="nav-stat-value">{stats.byStatus['In Review'] || 0}</span>
              <span className="nav-stat-label">In Review</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export { ModuleItem, ProjectSelector, CompletenessIndicator };
