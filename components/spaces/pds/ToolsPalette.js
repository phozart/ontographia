// components/pds/ToolsPalette.js
// Tools Palette - Discoverable tools panel for PDS workspace
// Updated to use shared UI components

import { useState, useMemo } from 'react';
import { usePDS } from './PDSContext';
import { getAllTools, getToolsForStage, searchTools } from '../../../lib/pds-tools';
import { Modal, SearchBox } from '@/components/ui';

// MUI Icons
import BuildIcon from '@mui/icons-material/Build';
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
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import StarIcon from '@mui/icons-material/Star';
import FlagIcon from '@mui/icons-material/Flag';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

import styles from './ToolsPalette.module.css';

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

  const handleSelectTool = (tool) => {
    onSelectTool(tool);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Available Tools"
      icon={BuildIcon}
      size="lg"
      footer={
        <div className={styles.footer}>
          <strong>Tip:</strong> Tools are organized by project stage.
          Select a stage filter to see relevant tools for your current focus.
        </div>
      }
    >
      {/* Search */}
      <div className={styles.search}>
        <SearchBox
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools..."
        />
      </div>

      {/* Stage filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filter} ${selectedStage === 'all' ? styles.filterActive : ''}`}
          onClick={() => setSelectedStage('all')}
        >
          All
        </button>
        {Object.entries(stageLabels).map(([stage, label]) => {
          const StageIcon = STAGE_ICONS[stage];
          return (
            <button
              key={stage}
              className={`${styles.filter} ${selectedStage === stage ? styles.filterActive : ''}`}
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
      <div className={styles.content}>
        {Object.entries(toolsByStage).map(([stage, tools]) => (
          <div key={stage} className={styles.stageGroup}>
            {selectedStage === 'all' && (
              <div className={styles.stageHeader}>
                {(() => {
                  const StageIcon = STAGE_ICONS[stage];
                  return StageIcon && <StageIcon fontSize="small" />;
                })()}
                <span>{stageLabels[stage]}</span>
              </div>
            )}

            <div className={styles.grid}>
              {tools.map((tool) => {
                const ToolIcon = TOOL_ICONS[tool.id] || AssignmentIcon;
                const isActive = activeView === tool.viewId;

                return (
                  <button
                    key={tool.id}
                    className={`${styles.tool} ${isActive ? styles.toolActive : ''}`}
                    onClick={() => handleSelectTool(tool)}
                    title={tool.description}
                  >
                    <div
                      className={styles.toolIcon}
                      style={{ backgroundColor: tool.color || 'var(--accent)' }}
                    >
                      <ToolIcon />
                    </div>
                    <div className={styles.toolInfo}>
                      <span className={styles.toolName}>{tool.name}</span>
                      <span className={styles.toolDesc}>
                        {tool.description.length > 50
                          ? tool.description.substring(0, 50) + '...'
                          : tool.description}
                      </span>
                    </div>
                    {tool.recommended && (
                      <StarIcon className={styles.toolStar} fontSize="small" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filteredTools.length === 0 && (
          <div className={styles.empty}>
            <LightbulbIcon fontSize="large" />
            <p>No tools found matching your search.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * Compact inline tool selector for use within views
 */
export function InlineToolSelector({ stage, onSelectTool }) {
  const tools = useMemo(() => getToolsForStage(stage), [stage]);

  if (tools.length === 0) return null;

  return (
    <div className={styles.inlineTools}>
      <span className={styles.inlineLabel}>Quick tools:</span>
      <div className={styles.inlineList}>
        {tools.slice(0, 4).map((tool) => {
          const ToolIcon = TOOL_ICONS[tool.id] || AssignmentIcon;
          return (
            <button
              key={tool.id}
              className={styles.inlineBtn}
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
