// components/spaces/blueprint/tools/ToolsLibrary.js
// Overview of available tools - canvases and prioritization

import { useBlueprint } from '../BlueprintContext';

// MUI Icons
import BuildIcon from '@mui/icons-material/Build';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ScoreIcon from '@mui/icons-material/Score';
import CompareIcon from '@mui/icons-material/Compare';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GridViewIcon from '@mui/icons-material/GridView';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BalanceIcon from '@mui/icons-material/Balance';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const TOOL_CATEGORIES = [
  {
    id: 'canvases',
    name: 'Canvases',
    description: 'Visual frameworks for thinking through initiative strategy',
    icon: DashboardCustomizeIcon,
    tools: [
      {
        id: 'value-prop',
        name: 'Value Proposition Canvas',
        description: 'Map customer jobs, pains, and gains against your value proposition',
        icon: LightbulbIcon,
        scope: 'initiative',
      },
      {
        id: 'lean',
        name: 'Lean Canvas',
        description: 'One-page business model with problem, solution, metrics, and channels',
        icon: AssignmentIcon,
        scope: 'initiative',
      },
      {
        id: 'assumptions',
        name: 'Assumption Mapping',
        description: 'Track what you believe vs what you\'ve validated',
        icon: FactCheckIcon,
        scope: 'initiative',
      },
      {
        id: 'swot',
        name: 'SWOT Analysis',
        description: 'Strengths, Weaknesses, Opportunities, and Threats',
        icon: GridViewIcon,
        scope: 'initiative',
      },
    ],
  },
  {
    id: 'prioritization',
    name: 'Prioritization',
    description: 'Score and rank initiatives to focus on what matters most',
    icon: ScoreIcon,
    tools: [
      {
        id: 'rice',
        name: 'RICE Scoring',
        description: 'Reach × Impact × Confidence ÷ Effort scoring framework',
        icon: AnalyticsIcon,
        scope: 'portfolio',
      },
      {
        id: 'matrix',
        name: 'Priority Matrix',
        description: '2×2 Value vs Effort matrix for quick prioritization',
        icon: GridViewIcon,
        scope: 'portfolio',
      },
      {
        id: 'weighted',
        name: 'Weighted Scoring',
        description: 'Custom criteria with configurable weights',
        icon: BalanceIcon,
        scope: 'portfolio',
      },
    ],
  },
  {
    id: 'analysis',
    name: 'Analysis',
    description: 'Compare and analyze initiatives side by side',
    icon: CompareIcon,
    tools: [
      {
        id: 'compare',
        name: 'Initiative Compare',
        description: 'Side-by-side comparison of multiple initiatives',
        icon: CompareIcon,
        scope: 'portfolio',
      },
    ],
  },
];

export default function ToolsLibrary({ onViewChange, selectedInitiative }) {
  const { initiatives } = useBlueprint();

  const handleToolClick = (toolId, scope) => {
    if (scope === 'initiative' && !selectedInitiative) {
      // Could show a message to select an initiative first
      return;
    }
    onViewChange?.(toolId);
  };

  return (
    <div className="tools-library">
      <div className="tools-library-header">
        <BuildIcon />
        <div>
          <h2>Tools</h2>
          <p>Canvases, prioritization frameworks, and analysis tools</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="tools-library-stats">
        <div className="tools-library-stat">
          <span className="tools-library-stat-value">{initiatives.length}</span>
          <span className="tools-library-stat-label">Initiatives</span>
        </div>
        <div className="tools-library-stat">
          <span className="tools-library-stat-value">
            {selectedInitiative ? selectedInitiative.display_id : '—'}
          </span>
          <span className="tools-library-stat-label">Selected</span>
        </div>
      </div>

      {/* Tool categories */}
      <div className="tools-library-categories">
        {TOOL_CATEGORIES.map(category => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.id} className="tools-library-category">
              <div className="tools-library-category-header">
                <CategoryIcon />
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
              </div>

              <div className="tools-library-tools">
                {category.tools.map(tool => {
                  const ToolIcon = tool.icon;
                  const needsInitiative = tool.scope === 'initiative' && !selectedInitiative;

                  return (
                    <button
                      key={tool.id}
                      className={`tools-library-tool ${needsInitiative ? 'tools-library-tool--disabled' : ''}`}
                      onClick={() => handleToolClick(tool.id, tool.scope)}
                      disabled={needsInitiative}
                    >
                      <div className="tools-library-tool-icon">
                        <ToolIcon />
                      </div>
                      <div className="tools-library-tool-content">
                        <h4>{tool.name}</h4>
                        <p>{tool.description}</p>
                        <span className={`tools-library-tool-scope tools-library-tool-scope--${tool.scope}`}>
                          {tool.scope === 'initiative' ? 'Per Initiative' : 'Portfolio View'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help text */}
      {!selectedInitiative && (
        <div className="tools-library-hint">
          <LightbulbIcon />
          <p>
            Select an initiative from the Initiative Board to use per-initiative tools like
            canvases and SWOT analysis.
          </p>
        </div>
      )}
    </div>
  );
}
