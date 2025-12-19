// components/pds/ToolsPalette.js
// Tools Palette - Discoverable tools panel for PDS workspace

import { useState, useMemo } from 'react';
import { usePDS } from './PDSContext';
import { getAllTools, getToolsForStage, searchTools } from '../../lib/pds-tools';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BugReportIcon from '@mui/icons-material/BugReport';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import SchoolIcon from '@mui/icons-material/School';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GavelIcon from '@mui/icons-material/Gavel';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import StarIcon from '@mui/icons-material/Star';
import FlagIcon from '@mui/icons-material/Flag';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

// Icon mapping for tools
const TOOL_ICONS = {
  stakeholder_matrix: PeopleIcon,
  raci_chart: PeopleIcon,
  business_case_builder: BusinessCenterIcon,
  success_criteria_editor: ChecklistIcon,
  wbs_tree: AccountTreeIcon,
  dependency_graph: AccountTreeIcon,
  timeline_view: TimelineIcon,
  resource_planner: AssignmentIcon,
  risk_heatmap: WarningIcon,
  assumption_board: LightbulbIcon,
  raid_log: BugReportIcon,
  contingency_planner: WarningIcon,
  progress_dashboard: AssessmentIcon,
  issue_tracker: BugReportIcon,
  change_log: ChangeCircleIcon,
  exception_report: WarningIcon,
  lessons_library: SchoolIcon,
  retrospective_canvas: SchoolIcon,
  benefits_tracker: TrendingUpIcon,
  closure_checklist: FactCheckIcon,
};

// Stage icons
const STAGE_ICONS = {
  intent: FlagIcon,
  structure: AccountTreeIcon,
  uncertainty: WarningIcon,
  control: PlayCircleIcon,
  learning: SchoolIcon,
};

export default function ToolsPalette({
  isOpen,
  onClose,
  onSelectTool,
  currentStage,
}) {
  const { activeView } = usePDS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState(currentStage || 'all');

  // Get filtered tools
  const filteredTools = useMemo(() => {
    let tools = getAllTools();

    // Filter by search query
    if (searchQuery.trim()) {
      tools = searchTools(searchQuery);
    }

    // Filter by stage (each tool has a single 'stage' property)
    if (selectedStage && selectedStage !== 'all') {
      tools = tools.filter(t => t.stage === selectedStage);
    }

    return tools;
  }, [searchQuery, selectedStage]);

  // Group tools by stage for display
  const toolsByStage = useMemo(() => {
    if (selectedStage !== 'all') {
      return { [selectedStage]: filteredTools };
    }

    const grouped = {};
    filteredTools.forEach(tool => {
      const primaryStage = tool.stage;
      if (!grouped[primaryStage]) {
        grouped[primaryStage] = [];
      }
      grouped[primaryStage].push(tool);
    });
    return grouped;
  }, [filteredTools, selectedStage]);

  // Stage labels
  const stageLabels = {
    intent: 'Intent & Governance',
    structure: 'Structure & Planning',
    uncertainty: 'Risk & Uncertainty',
    control: 'Execution & Control',
    learning: 'Learning & Evolution',
  };

  if (!isOpen) return null;

  return (
    <div className="pds-tools-palette-backdrop" onClick={onClose}>
      <div className="pds-tools-palette" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pds-tools-palette__header">
          <h2 className="pds-tools-palette__title">Available Tools</h2>
          <button
            className="pds-tools-palette__close"
            onClick={onClose}
            aria-label="Close tools palette"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search */}
        <div className="pds-tools-palette__search">
          <SearchIcon className="pds-tools-palette__search-icon" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pds-tools-palette__search-input"
          />
        </div>

        {/* Stage filters */}
        <div className="pds-tools-palette__filters">
          <button
            className={`pds-tools-palette__filter ${selectedStage === 'all' ? 'pds-tools-palette__filter--active' : ''}`}
            onClick={() => setSelectedStage('all')}
          >
            All
          </button>
          {Object.entries(stageLabels).map(([stage, label]) => {
            const StageIcon = STAGE_ICONS[stage];
            return (
              <button
                key={stage}
                className={`pds-tools-palette__filter ${selectedStage === stage ? 'pds-tools-palette__filter--active' : ''}`}
                onClick={() => setSelectedStage(stage)}
                title={label}
              >
                <StageIcon fontSize="small" />
                <span>{label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tools grid */}
        <div className="pds-tools-palette__content">
          {Object.entries(toolsByStage).map(([stage, tools]) => (
            <div key={stage} className="pds-tools-palette__stage-group">
              {selectedStage === 'all' && (
                <div className="pds-tools-palette__stage-header">
                  {(() => {
                    const StageIcon = STAGE_ICONS[stage];
                    return StageIcon && <StageIcon fontSize="small" />;
                  })()}
                  <span>{stageLabels[stage]}</span>
                </div>
              )}

              <div className="pds-tools-palette__grid">
                {tools.map((tool) => {
                  const ToolIcon = TOOL_ICONS[tool.id] || AssignmentIcon;
                  const isActive = activeView === tool.viewId;

                  return (
                    <button
                      key={tool.id}
                      className={`pds-tools-palette__tool ${isActive ? 'pds-tools-palette__tool--active' : ''}`}
                      onClick={() => {
                        onSelectTool(tool);
                        onClose();
                      }}
                      title={tool.description}
                    >
                      <div
                        className="pds-tools-palette__tool-icon"
                        style={{ backgroundColor: tool.color || 'var(--accent)' }}
                      >
                        <ToolIcon />
                      </div>
                      <div className="pds-tools-palette__tool-info">
                        <span className="pds-tools-palette__tool-name">{tool.name}</span>
                        <span className="pds-tools-palette__tool-desc">
                          {tool.description.length > 50
                            ? tool.description.substring(0, 50) + '...'
                            : tool.description}
                        </span>
                      </div>
                      {tool.recommended && (
                        <StarIcon className="pds-tools-palette__tool-star" fontSize="small" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredTools.length === 0 && (
            <div className="pds-tools-palette__empty">
              <LightbulbIcon fontSize="large" />
              <p>No tools found matching your search.</p>
            </div>
          )}
        </div>

        {/* Footer with tips */}
        <div className="pds-tools-palette__footer">
          <p>
            <strong>Tip:</strong> Tools are organized by project stage.
            Select a stage filter to see relevant tools for your current focus.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline tool selector for use within views
 */
export function InlineToolSelector({ stage, onSelectTool }) {
  const tools = useMemo(() => getToolsForStage(stage), [stage]);

  if (tools.length === 0) return null;

  return (
    <div className="pds-inline-tools">
      <span className="pds-inline-tools__label">Quick tools:</span>
      <div className="pds-inline-tools__list">
        {tools.slice(0, 4).map((tool) => {
          const ToolIcon = TOOL_ICONS[tool.id] || AssignmentIcon;
          return (
            <button
              key={tool.id}
              className="pds-inline-tools__btn"
              onClick={() => onSelectTool(tool)}
              title={tool.description}
            >
              <ToolIcon fontSize="small" />
              <span>{tool.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
