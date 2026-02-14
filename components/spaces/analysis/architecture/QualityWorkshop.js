// components/spaces/analysis/architecture/QualityWorkshop.js
// Quality Attribute Workshop - Utility tree, scenario management, importance/difficulty matrix
// Pure SVG tree visualization and priority matrix

import { useState, useCallback, useMemo } from 'react';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import LockIcon from '@mui/icons-material/Lock';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import BuildIcon from '@mui/icons-material/Build';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import SyncIcon from '@mui/icons-material/Sync';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import WarningIcon from '@mui/icons-material/Warning';

// ============ CONSTANTS ============

const QUALITY_CATEGORIES = {
  Performance: { color: '#f59e0b', icon: 'speed', subcategories: ['Response Time', 'Throughput', 'Resource Utilization', 'Scalability'] },
  Security: { color: '#a54d4d', icon: 'lock', subcategories: ['Authentication', 'Authorization', 'Data Encryption', 'Audit Trail', 'Input Validation'] },
  Availability: { color: '#5B8A6A', icon: 'cloud', subcategories: ['Uptime', 'Failover', 'Recovery Time', 'Data Backup'] },
  Modifiability: { color: '#6366f1', icon: 'build', subcategories: ['Modularity', 'Encapsulation', 'Coupling', 'Cohesion'] },
  Usability: { color: '#ec4899', icon: 'accessibility', subcategories: ['Learnability', 'Efficiency', 'Error Prevention', 'Satisfaction'] },
  Testability: { color: '#14b8a6', icon: 'sync', subcategories: ['Observability', 'Controllability', 'Isolation', 'Automation'] },
  Interoperability: { color: '#b45309', icon: 'sync', subcategories: ['Data Exchange', 'Protocol Support', 'API Standards', 'Format Compatibility'] },
};

const IMPORTANCE_LABELS = { High: 'H', Medium: 'M', Low: 'L' };
const DIFFICULTY_LABELS = { High: 'H', Medium: 'M', Low: 'L' };

// ============ UTILITY TREE (SVG) ============

function UtilityTreeSVG({ scenarios, expandedCategories, expandedSubs, onToggleCategory, onToggleSub, onSelectScenario, selectedId }) {
  // Build tree layout
  const treeData = useMemo(() => {
    const rootX = 40;
    const rootY = 30;
    let currentY = 80;
    const nodeHeight = 32;
    const gap = 6;
    const catIndent = 60;
    const subIndent = 200;
    const scenarioIndent = 400;
    const nodes = [];
    const links = [];

    // Root node
    nodes.push({ id: 'root', x: rootX, y: rootY, label: 'System Quality', type: 'root', color: '#47453F' });

    Object.entries(QUALITY_CATEGORIES).forEach(([catName, catConfig]) => {
      const catId = `cat-${catName}`;
      const catY = currentY;
      const catScenarios = scenarios.filter(s => (s.metadata?.attribute || s.attribute) === catName);
      const catExpanded = expandedCategories[catName];

      nodes.push({
        id: catId, x: catIndent, y: catY,
        label: `${catName} (${catScenarios.length})`,
        type: 'category', color: catConfig.color,
        expanded: catExpanded, name: catName,
      });
      links.push({ from: 'root', to: catId, fromX: rootX + 120, fromY: rootY + 10, toX: catIndent, toY: catY + 12 });

      currentY += nodeHeight + gap;

      if (catExpanded) {
        catConfig.subcategories.forEach(subName => {
          const subId = `sub-${catName}-${subName}`;
          const subY = currentY;
          const subScenarios = catScenarios.filter(s => (s.metadata?.subcategory || s.subcategory) === subName);
          const subExpanded = expandedSubs[`${catName}-${subName}`];

          nodes.push({
            id: subId, x: subIndent, y: subY,
            label: `${subName} (${subScenarios.length})`,
            type: 'subcategory', color: catConfig.color,
            expanded: subExpanded, catName, subName,
          });
          links.push({ from: catId, to: subId, fromX: catIndent + 140, fromY: catY + 12, toX: subIndent, toY: subY + 12 });

          currentY += nodeHeight + gap;

          if (subExpanded) {
            subScenarios.forEach(scenario => {
              const sId = `scenario-${scenario.id}`;
              const sY = currentY;
              const imp = scenario.metadata?.importance || scenario.importance || 'Medium';
              const diff = scenario.metadata?.difficulty || scenario.difficulty || 'Medium';

              nodes.push({
                id: sId, x: scenarioIndent, y: sY,
                label: scenario.name,
                type: 'scenario', color: catConfig.color,
                importance: imp, difficulty: diff,
                scenarioId: scenario.id,
                selected: selectedId === scenario.id,
              });
              links.push({ from: subId, to: sId, fromX: subIndent + 140, fromY: subY + 12, toX: scenarioIndent, toY: sY + 12 });

              currentY += nodeHeight + gap;
            });
          }
        });
      }
    });

    return { nodes, links, totalHeight: Math.max(currentY + 40, 400) };
  }, [scenarios, expandedCategories, expandedSubs, selectedId]);

  return (
    <svg
      className="utility-tree-svg"
      viewBox={`0 0 800 ${treeData.totalHeight}`}
      style={{ width: '100%', height: treeData.totalHeight, minHeight: 300 }}
    >
      {/* Links */}
      {treeData.links.map((link, i) => (
        <path
          key={i}
          d={`M ${link.fromX} ${link.fromY} C ${link.fromX + 30} ${link.fromY}, ${link.toX - 30} ${link.toY}, ${link.toX} ${link.toY}`}
          fill="none" stroke="#E2E0DB" strokeWidth={1.5}
        />
      ))}

      {/* Nodes */}
      {treeData.nodes.map(node => {
        const handleClick = () => {
          if (node.type === 'category') onToggleCategory(node.name);
          else if (node.type === 'subcategory') onToggleSub(node.catName, node.subName);
          else if (node.type === 'scenario') onSelectScenario(node.scenarioId);
        };

        const isExpandable = node.type === 'category' || node.type === 'subcategory';
        const rectW = node.type === 'root' ? 140 : node.type === 'scenario' ? 320 : 160;
        const rectH = 26;

        return (
          <g key={node.id} onClick={handleClick} style={{ cursor: 'pointer' }}>
            {node.selected && (
              <rect x={node.x - 3} y={node.y - 1} width={rectW + 6} height={rectH + 2}
                rx={5} fill="none" stroke="#47453F" strokeWidth={2} />
            )}
            <rect x={node.x} y={node.y} width={rectW} height={rectH} rx={4}
              fill={node.type === 'root' ? node.color : node.type === 'scenario' ? '#FDFCFA' : `${node.color}18`}
              stroke={node.type === 'scenario' ? '#E2E0DB' : node.color}
              strokeWidth={1}
            />
            {isExpandable && (
              <text x={node.x + 8} y={node.y + 17} fill={node.color} fontSize={12} fontWeight={700}>
                {node.expanded ? '\u25BC' : '\u25B6'}
              </text>
            )}
            <text x={node.x + (isExpandable ? 22 : 10)} y={node.y + 17}
              fill={node.type === 'root' ? '#F0EFEC' : '#1F1E1B'}
              fontSize={12} fontWeight={node.type === 'root' ? 700 : 500}>
              {truncateText(node.label, rectW - (isExpandable ? 30 : 20), 12)}
            </text>
            {node.type === 'scenario' && (
              <>
                <rect x={node.x + rectW - 60} y={node.y + 4} width={24} height={18} rx={3}
                  fill={node.importance === 'High' ? '#f59e0b' : node.importance === 'Low' ? '#E2E0DB' : '#C9A227'}
                />
                <text x={node.x + rectW - 48} y={node.y + 16} textAnchor="middle"
                  fill={node.importance === 'Low' ? '#5C5A54' : '#fff'} fontSize={10} fontWeight={700}>
                  {IMPORTANCE_LABELS[node.importance]}
                </text>
                <rect x={node.x + rectW - 32} y={node.y + 4} width={24} height={18} rx={3}
                  fill={node.difficulty === 'High' ? '#A54D4D' : node.difficulty === 'Low' ? '#E2E0DB' : '#9C9A94'}
                />
                <text x={node.x + rectW - 20} y={node.y + 16} textAnchor="middle"
                  fill={node.difficulty === 'Low' ? '#5C5A54' : '#fff'} fontSize={10} fontWeight={700}>
                  {DIFFICULTY_LABELS[node.difficulty]}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function truncateText(text, maxWidth, fontSize) {
  if (!text) return '';
  const charWidth = fontSize * 0.55;
  const maxChars = Math.floor(maxWidth / charWidth);
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + '\u2026';
}

// ============ IMPORTANCE / DIFFICULTY MATRIX ============

function PriorityMatrix({ scenarios, onSelectScenario, selectedId }) {
  // Map scenarios to matrix quadrants
  const quadrants = useMemo(() => {
    const q = { HH: [], HL: [], LH: [], LL: [] };
    scenarios.forEach(s => {
      const imp = s.metadata?.importance || s.importance || 'Medium';
      const diff = s.metadata?.difficulty || s.difficulty || 'Medium';
      const impKey = imp === 'Low' ? 'L' : 'H';
      const diffKey = diff === 'Low' ? 'L' : 'H';
      // Medium goes to H for both for simplicity
      q[`${impKey}${diffKey}`].push(s);
    });
    return q;
  }, [scenarios]);

  const matrixW = 400;
  const matrixH = 320;
  const padLeft = 70;
  const padBottom = 40;
  const padTop = 30;
  const padRight = 20;
  const plotW = matrixW - padLeft - padRight;
  const plotH = matrixH - padTop - padBottom;

  const getPosition = (scenario) => {
    const imp = scenario.metadata?.importance || scenario.importance || 'Medium';
    const diff = scenario.metadata?.difficulty || scenario.difficulty || 'Medium';
    const impVal = imp === 'High' ? 0.8 : imp === 'Medium' ? 0.5 : 0.2;
    const diffVal = diff === 'High' ? 0.8 : diff === 'Medium' ? 0.5 : 0.2;
    // Add jitter for overlapping dots
    const jitterX = (Math.random() - 0.5) * 20;
    const jitterY = (Math.random() - 0.5) * 20;
    return {
      x: padLeft + diffVal * plotW + jitterX,
      y: padTop + (1 - impVal) * plotH + jitterY,
    };
  };

  const dotPositions = useMemo(() => {
    return scenarios.map(s => ({
      ...s,
      pos: getPosition(s),
      cat: s.metadata?.attribute || s.attribute || 'Performance',
    }));
  }, [scenarios]);

  return (
    <div className="priority-matrix">
      <h3 className="matrix-title">
        <BubbleChartIcon fontSize="small" />
        Importance / Difficulty Matrix
      </h3>

      <div className="matrix-legend">
        <div className="legend-quadrant">
          <span className="legend-dot" style={{ background: '#5B8A6A' }} />
          <span>H/L: Quick Win</span>
        </div>
        <div className="legend-quadrant">
          <span className="legend-dot" style={{ background: '#f59e0b' }} />
          <span>H/H: Critical - Prioritize</span>
        </div>
        <div className="legend-quadrant">
          <span className="legend-dot" style={{ background: '#9C9A94' }} />
          <span>L/L: Deprioritize</span>
        </div>
        <div className="legend-quadrant">
          <span className="legend-dot" style={{ background: '#C9A227' }} />
          <span>L/H: Consider Later</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${matrixW} ${matrixH}`} className="matrix-svg">
        {/* Quadrant backgrounds */}
        <rect x={padLeft} y={padTop} width={plotW / 2} height={plotH / 2}
          fill="#5B8A6A" opacity={0.08} />
        <rect x={padLeft + plotW / 2} y={padTop} width={plotW / 2} height={plotH / 2}
          fill="#f59e0b" opacity={0.1} />
        <rect x={padLeft} y={padTop + plotH / 2} width={plotW / 2} height={plotH / 2}
          fill="#9C9A94" opacity={0.06} />
        <rect x={padLeft + plotW / 2} y={padTop + plotH / 2} width={plotW / 2} height={plotH / 2}
          fill="#C9A227" opacity={0.06} />

        {/* Quadrant labels */}
        <text x={padLeft + plotW * 0.25} y={padTop + 20} textAnchor="middle"
          fill="#5B8A6A" fontSize={11} fontWeight={600} opacity={0.8}>Quick Win</text>
        <text x={padLeft + plotW * 0.75} y={padTop + 20} textAnchor="middle"
          fill="#f59e0b" fontSize={11} fontWeight={600} opacity={0.8}>Critical</text>
        <text x={padLeft + plotW * 0.25} y={padTop + plotH - 8} textAnchor="middle"
          fill="#9C9A94" fontSize={11} fontWeight={600} opacity={0.8}>Deprioritize</text>
        <text x={padLeft + plotW * 0.75} y={padTop + plotH - 8} textAnchor="middle"
          fill="#C9A227" fontSize={11} fontWeight={600} opacity={0.8}>Consider Later</text>

        {/* Axes */}
        <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH}
          stroke="#E2E0DB" strokeWidth={1.5} />
        <line x1={padLeft} y1={padTop + plotH} x2={padLeft + plotW} y2={padTop + plotH}
          stroke="#E2E0DB" strokeWidth={1.5} />

        {/* Mid lines */}
        <line x1={padLeft + plotW / 2} y1={padTop} x2={padLeft + plotW / 2} y2={padTop + plotH}
          stroke="#E2E0DB" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={padLeft} y1={padTop + plotH / 2} x2={padLeft + plotW} y2={padTop + plotH / 2}
          stroke="#E2E0DB" strokeWidth={1} strokeDasharray="4 4" />

        {/* Axis labels */}
        <text x={padLeft + plotW / 2} y={matrixH - 6} textAnchor="middle"
          fill="#5C5A54" fontSize={11} fontWeight={600}>
          Difficulty \u2192
        </text>
        <text x={14} y={padTop + plotH / 2} textAnchor="middle"
          fill="#5C5A54" fontSize={11} fontWeight={600}
          transform={`rotate(-90, 14, ${padTop + plotH / 2})`}>
          Importance \u2192
        </text>

        {/* Low/High labels on axes */}
        <text x={padLeft + 6} y={matrixH - 24} fill="#9C9A94" fontSize={9}>Low</text>
        <text x={padLeft + plotW - 20} y={matrixH - 24} fill="#9C9A94" fontSize={9}>High</text>
        <text x={padLeft - 6} y={padTop + plotH - 4} fill="#9C9A94" fontSize={9} textAnchor="end">Low</text>
        <text x={padLeft - 6} y={padTop + 12} fill="#9C9A94" fontSize={9} textAnchor="end">High</text>

        {/* Dots */}
        {dotPositions.map(s => {
          const cat = QUALITY_CATEGORIES[s.cat];
          return (
            <g key={s.id} onClick={() => onSelectScenario(s.id)} style={{ cursor: 'pointer' }}>
              <circle cx={s.pos.x} cy={s.pos.y} r={selectedId === s.id ? 9 : 7}
                fill={cat?.color || '#9C9A94'}
                stroke={selectedId === s.id ? '#1F1E1B' : 'rgba(255,255,255,0.6)'}
                strokeWidth={selectedId === s.id ? 2 : 1} />
              <title>{s.name} ({s.cat})</title>
            </g>
          );
        })}
      </svg>

      <style jsx>{`
        .priority-matrix {
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          padding: 16px;
        }
        .matrix-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 15px;
          font-weight: 600;
          color: #1F1E1B;
          margin: 0 0 12px;
        }
        .matrix-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }
        .legend-quadrant {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #5C5A54;
        }
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .matrix-svg {
          width: 100%;
          max-width: 420px;
        }
      `}</style>
    </div>
  );
}

// ============ SCENARIO DETAIL ============

function ScenarioDetail({ scenario, onUpdate, onDelete, onClose }) {
  const [editing, setEditing] = useState(false);
  const meta = scenario?.metadata || {};
  const [formData, setFormData] = useState({
    name: scenario?.name || '',
    attribute: meta.attribute || scenario?.attribute || 'Performance',
    subcategory: meta.subcategory || '',
    stimulus: meta.stimulus || '',
    source: meta.source || '',
    environment: meta.environment || '',
    response: meta.response || '',
    response_measure: meta.response_measure || '',
    importance: meta.importance || 'Medium',
    difficulty: meta.difficulty || 'Medium',
  });

  if (!scenario) return null;

  const handleSave = () => {
    onUpdate(scenario.id, {
      name: formData.name,
      metadata: {
        ...(scenario.metadata || {}),
        attribute: formData.attribute,
        subcategory: formData.subcategory,
        stimulus: formData.stimulus,
        source: formData.source,
        environment: formData.environment,
        response: formData.response,
        response_measure: formData.response_measure,
        importance: formData.importance,
        difficulty: formData.difficulty,
      },
    });
    setEditing(false);
  };

  return (
    <div className="scenario-detail">
      <div className="detail-header">
        <h3>{scenario.name}</h3>
        <div className="detail-actions">
          {editing ? (
            <>
              <button className="btn-sm primary" onClick={handleSave}>
                <SaveIcon fontSize="small" /> Save
              </button>
              <button className="btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn-sm" onClick={() => setEditing(true)}>
                <EditIcon fontSize="small" /> Edit
              </button>
              <button className="btn-sm danger" onClick={() => onDelete(scenario.id)}>
                <DeleteIcon fontSize="small" />
              </button>
            </>
          )}
          <button className="btn-sm" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="detail-body">
        {editing ? (
          <div className="scenario-form">
            <div className="form-group">
              <label>Scenario Name</label>
              <input type="text" value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quality Attribute</label>
                <select value={formData.attribute}
                  onChange={(e) => setFormData(p => ({ ...p, attribute: e.target.value }))}>
                  {Object.keys(QUALITY_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subcategory</label>
                <select value={formData.subcategory}
                  onChange={(e) => setFormData(p => ({ ...p, subcategory: e.target.value }))}>
                  <option value="">Select...</option>
                  {(QUALITY_CATEGORIES[formData.attribute]?.subcategories || []).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Stimulus</label>
              <textarea value={formData.stimulus} rows={2}
                onChange={(e) => setFormData(p => ({ ...p, stimulus: e.target.value }))}
                placeholder="What triggers this scenario?" />
            </div>
            <div className="form-group">
              <label>Source</label>
              <input type="text" value={formData.source}
                onChange={(e) => setFormData(p => ({ ...p, source: e.target.value }))}
                placeholder="Who/what generates the stimulus?" />
            </div>
            <div className="form-group">
              <label>Environment</label>
              <input type="text" value={formData.environment}
                onChange={(e) => setFormData(p => ({ ...p, environment: e.target.value }))}
                placeholder="Under what conditions?" />
            </div>
            <div className="form-group">
              <label>Response</label>
              <textarea value={formData.response} rows={2}
                onChange={(e) => setFormData(p => ({ ...p, response: e.target.value }))}
                placeholder="Desired system behavior" />
            </div>
            <div className="form-group">
              <label>Response Measure</label>
              <input type="text" value={formData.response_measure}
                onChange={(e) => setFormData(p => ({ ...p, response_measure: e.target.value }))}
                placeholder="Quantifiable metric (e.g., < 200ms)" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Importance</label>
                <select value={formData.importance}
                  onChange={(e) => setFormData(p => ({ ...p, importance: e.target.value }))}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <select value={formData.difficulty}
                  onChange={(e) => setFormData(p => ({ ...p, difficulty: e.target.value }))}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="scenario-fields">
            <div className="field-badges">
              <span className="badge" style={{ background: QUALITY_CATEGORIES[meta.attribute]?.color || '#9C9A94', color: '#fff' }}>
                {meta.attribute || 'Unclassified'}
              </span>
              {meta.subcategory && <span className="badge outline">{meta.subcategory}</span>}
              <span className={`badge imp-${(meta.importance || 'Medium').toLowerCase()}`}>
                Imp: {meta.importance || 'Medium'}
              </span>
              <span className={`badge diff-${(meta.difficulty || 'Medium').toLowerCase()}`}>
                Diff: {meta.difficulty || 'Medium'}
              </span>
            </div>

            {meta.stimulus && (
              <div className="field-section">
                <span className="field-label">Stimulus</span>
                <p>{meta.stimulus}</p>
              </div>
            )}
            {meta.source && (
              <div className="field-section">
                <span className="field-label">Source</span>
                <p>{meta.source}</p>
              </div>
            )}
            {meta.environment && (
              <div className="field-section">
                <span className="field-label">Environment</span>
                <p>{meta.environment}</p>
              </div>
            )}
            {meta.response && (
              <div className="field-section">
                <span className="field-label">Response</span>
                <p>{meta.response}</p>
              </div>
            )}
            {meta.response_measure && (
              <div className="field-section">
                <span className="field-label">Response Measure</span>
                <p className="measure-highlight">{meta.response_measure}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .scenario-detail {
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          overflow: hidden;
        }
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #E2E0DB;
          background: #F0EFEC;
        }
        .detail-header h3 { margin: 0; font-size: 15px; color: #1F1E1B; }
        .detail-actions { display: flex; gap: 4px; }
        .btn-sm {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border: 1px solid #E2E0DB;
          background: #FDFCFA;
          color: #5C5A54;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 120ms ease-out;
        }
        .btn-sm:hover { background: #E2E0DB; color: #1F1E1B; }
        .btn-sm.primary { background: #47453F; color: #F0EFEC; border-color: #47453F; }
        .btn-sm.primary:hover { background: #35332F; }
        .btn-sm.danger:hover { color: #A54D4D; border-color: #A54D4D; }
        .detail-body { padding: 16px; }
        .scenario-form .form-group { margin-bottom: 10px; }
        .scenario-form .form-row { display: flex; gap: 10px; }
        .scenario-form .form-row .form-group { flex: 1; }
        .scenario-form label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #5C5A54;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .scenario-form input,
        .scenario-form select,
        .scenario-form textarea {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 13px;
          background: #FDFCFA;
          color: #1F1E1B;
          box-sizing: border-box;
          font-family: inherit;
        }
        .scenario-form textarea { resize: vertical; }
        .field-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .badge {
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge.outline {
          background: transparent;
          border: 1px solid #E2E0DB;
          color: #5C5A54;
        }
        .badge.imp-high { background: #f59e0b; color: #fff; }
        .badge.imp-medium { background: #C9A227; color: #fff; }
        .badge.imp-low { background: #E2E0DB; color: #5C5A54; }
        .badge.diff-high { background: #A54D4D; color: #fff; }
        .badge.diff-medium { background: #9C9A94; color: #fff; }
        .badge.diff-low { background: #E2E0DB; color: #5C5A54; }
        .field-section { margin-bottom: 12px; }
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #9C9A94;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .field-section p { margin: 0; font-size: 13px; color: #1F1E1B; line-height: 1.5; }
        .measure-highlight {
          padding: 6px 10px;
          background: #F0EFEC;
          border-radius: 4px;
          font-weight: 600;
          color: #47453F;
        }
      `}</style>
    </div>
  );
}

// ============ TRADE-OFF ANALYSIS ============

function TradeOffAnalysis({ scenarios }) {
  const tradeoffs = useMemo(() => {
    const sensitivityPoints = [];
    const tradeoffPoints = [];
    const risks = [];

    // Simple heuristic: scenarios with High importance and High difficulty are risks
    // Scenarios with conflicting quality attributes are tradeoff points
    const highImpHighDiff = scenarios.filter(s => {
      const imp = s.metadata?.importance || 'Medium';
      const diff = s.metadata?.difficulty || 'Medium';
      return imp === 'High' && diff === 'High';
    });

    highImpHighDiff.forEach(s => {
      risks.push({ scenario: s.name, reason: 'High importance + High difficulty' });
    });

    // Check for potential tradeoffs (same component, different attributes)
    const byAttribute = {};
    scenarios.forEach(s => {
      const attr = s.metadata?.attribute || 'Other';
      if (!byAttribute[attr]) byAttribute[attr] = [];
      byAttribute[attr].push(s);
    });

    const attrs = Object.keys(byAttribute);
    for (let i = 0; i < attrs.length; i++) {
      for (let j = i + 1; j < attrs.length; j++) {
        if (byAttribute[attrs[i]].length > 0 && byAttribute[attrs[j]].length > 0) {
          // Common tradeoff pairs
          const knownTradeoffs = [
            ['Performance', 'Security'],
            ['Performance', 'Modifiability'],
            ['Availability', 'Modifiability'],
            ['Security', 'Usability'],
          ];
          const pair = [attrs[i], attrs[j]].sort();
          const isKnown = knownTradeoffs.some(kt => kt.sort().join() === pair.join());
          if (isKnown) {
            tradeoffPoints.push({
              pair: `${attrs[i]} vs ${attrs[j]}`,
              reason: `${byAttribute[attrs[i]].length + byAttribute[attrs[j]].length} scenarios may conflict`,
            });
          }
        }
      }
    }

    // Sensitivity points: attributes with many High importance scenarios
    Object.entries(byAttribute).forEach(([attr, items]) => {
      const highImp = items.filter(s => s.metadata?.importance === 'High').length;
      if (highImp >= 2) {
        sensitivityPoints.push({ attribute: attr, count: highImp });
      }
    });

    return { sensitivityPoints, tradeoffPoints, risks };
  }, [scenarios]);

  return (
    <div className="tradeoff-analysis">
      <h3>
        <WarningIcon fontSize="small" style={{ color: '#C9A227' }} />
        Trade-off Analysis
      </h3>

      <div className="tradeoff-sections">
        <div className="tradeoff-section">
          <h4>Sensitivity Points</h4>
          {tradeoffs.sensitivityPoints.length === 0 ? (
            <p className="tradeoff-empty">No sensitivity points identified yet</p>
          ) : (
            <ul>
              {tradeoffs.sensitivityPoints.map((sp, i) => (
                <li key={i}>
                  <span className="tradeoff-attr">{sp.attribute}</span>
                  <span className="tradeoff-reason">{sp.count} high-importance scenarios</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tradeoff-section">
          <h4>Tradeoff Points</h4>
          {tradeoffs.tradeoffPoints.length === 0 ? (
            <p className="tradeoff-empty">No tradeoff points identified yet</p>
          ) : (
            <ul>
              {tradeoffs.tradeoffPoints.map((tp, i) => (
                <li key={i}>
                  <span className="tradeoff-attr">{tp.pair}</span>
                  <span className="tradeoff-reason">{tp.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tradeoff-section">
          <h4>Risks</h4>
          {tradeoffs.risks.length === 0 ? (
            <p className="tradeoff-empty">No architectural risks identified yet</p>
          ) : (
            <ul>
              {tradeoffs.risks.map((r, i) => (
                <li key={i} className="risk-item">
                  <span className="tradeoff-attr">{r.scenario}</span>
                  <span className="tradeoff-reason">{r.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <style jsx>{`
        .tradeoff-analysis {
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          padding: 16px;
        }
        .tradeoff-analysis h3 {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 15px;
          font-weight: 600;
          color: #1F1E1B;
          margin: 0 0 16px;
        }
        .tradeoff-sections {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .tradeoff-section h4 {
          font-size: 13px;
          font-weight: 600;
          color: #5C5A54;
          margin: 0 0 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .tradeoff-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .tradeoff-section li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 10px;
          border-radius: 4px;
          margin-bottom: 4px;
          background: #F0EFEC;
        }
        .tradeoff-section li.risk-item { background: rgba(165, 77, 77, 0.06); }
        .tradeoff-attr { font-size: 13px; font-weight: 600; color: #1F1E1B; }
        .tradeoff-reason { font-size: 12px; color: #9C9A94; }
        .tradeoff-empty { font-size: 13px; color: #9C9A94; margin: 0; font-style: italic; }
      `}</style>
    </div>
  );
}

// ============ MAIN QUALITY WORKSHOP ============

export default function QualityWorkshop() {
  const {
    getArtefactsByType,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    createRelationship,
    relationships,
    artefacts,
  } = useAnalysis();

  const [activeView, setActiveView] = useState('tree'); // 'tree' | 'matrix'
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    Performance: true,
    Security: false,
    Availability: false,
    Modifiability: false,
    Usability: false,
    Testability: false,
    Interoperability: false,
  });
  const [expandedSubs, setExpandedSubs] = useState({});

  const scenarios = useMemo(() => getArtefactsByType('QualityAttribute'), [getArtefactsByType]);

  const selectedScenario = useMemo(
    () => scenarios.find(s => s.id === selectedScenarioId),
    [scenarios, selectedScenarioId]
  );

  const handleToggleCategory = useCallback((name) => {
    setExpandedCategories(prev => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const handleToggleSub = useCallback((catName, subName) => {
    const key = `${catName}-${subName}`;
    setExpandedSubs(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleCreateScenario = useCallback(async (data) => {
    const result = await createArtefact('QualityAttribute', {
      name: data.name,
      metadata: {
        attribute: data.attribute,
        subcategory: data.subcategory || '',
        stimulus: data.stimulus || '',
        source: data.source || '',
        environment: data.environment || '',
        response: data.response || '',
        response_measure: data.response_measure || '',
        importance: data.importance || 'Medium',
        difficulty: data.difficulty || 'Medium',
      },
    });
    setShowCreateForm(false);
    if (result?.id) setSelectedScenarioId(result.id);
  }, [createArtefact]);

  const handleDeleteScenario = useCallback(async (id) => {
    if (confirm('Delete this quality attribute scenario?')) {
      await deleteArtefact(id);
      if (selectedScenarioId === id) setSelectedScenarioId(null);
    }
  }, [deleteArtefact, selectedScenarioId]);

  // Stats
  const categoryStats = useMemo(() => {
    const counts = {};
    scenarios.forEach(s => {
      const attr = s.metadata?.attribute || 'Other';
      counts[attr] = (counts[attr] || 0) + 1;
    });
    return counts;
  }, [scenarios]);

  return (
    <div className="quality-workshop">
      {/* Header / Toolbar */}
      <div className="qw-toolbar">
        <div className="qw-title">
          <ShieldIcon fontSize="small" />
          <h2>Quality Attribute Workshop</h2>
          <span className="qw-count">{scenarios.length} scenarios</span>
        </div>

        <div className="qw-actions">
          <div className="view-toggle">
            <button className={activeView === 'tree' ? 'active' : ''} onClick={() => setActiveView('tree')}>
              <AccountTreeIcon fontSize="small" />
              <span>Tree</span>
            </button>
            <button className={activeView === 'matrix' ? 'active' : ''} onClick={() => setActiveView('matrix')}>
              <GridViewIcon fontSize="small" />
              <span>Matrix</span>
            </button>
          </div>
          <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
            <AddIcon fontSize="small" />
            Add Scenario
          </button>
        </div>
      </div>

      {/* Category stats bar */}
      <div className="qw-stats-bar">
        {Object.entries(QUALITY_CATEGORIES).map(([name, cat]) => (
          <div key={name} className="cat-stat" onClick={() => {
            setExpandedCategories(prev => ({ ...prev, [name]: true }));
            setActiveView('tree');
          }}>
            <span className="cat-dot" style={{ background: cat.color }} />
            <span className="cat-name">{name}</span>
            <span className="cat-count">{categoryStats[name] || 0}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="qw-content">
        <div className="qw-main">
          {activeView === 'tree' ? (
            <div className="tree-container">
              {scenarios.length === 0 ? (
                <div className="qw-empty">
                  <ShieldIcon style={{ fontSize: 48, color: '#9C9A94' }} />
                  <h3>No Quality Scenarios</h3>
                  <p>Define quality attribute scenarios to drive your architecture decisions.</p>
                  <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
                    <AddIcon fontSize="small" />
                    Create First Scenario
                  </button>
                </div>
              ) : (
                <UtilityTreeSVG
                  scenarios={scenarios}
                  expandedCategories={expandedCategories}
                  expandedSubs={expandedSubs}
                  onToggleCategory={handleToggleCategory}
                  onToggleSub={handleToggleSub}
                  onSelectScenario={setSelectedScenarioId}
                  selectedId={selectedScenarioId}
                />
              )}
            </div>
          ) : (
            <div className="matrix-container">
              <PriorityMatrix
                scenarios={scenarios}
                onSelectScenario={setSelectedScenarioId}
                selectedId={selectedScenarioId}
              />
              <TradeOffAnalysis scenarios={scenarios} />
            </div>
          )}
        </div>

        {/* Side panel for selected scenario */}
        {selectedScenario && (
          <div className="qw-side">
            <ScenarioDetail
              scenario={selectedScenario}
              onUpdate={updateArtefact}
              onDelete={handleDeleteScenario}
              onClose={() => setSelectedScenarioId(null)}
            />
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateForm && (
        <CreateScenarioModal
          onSave={handleCreateScenario}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      <style jsx>{`
        .quality-workshop {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #FDFCFA;
        }
        .qw-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #F0EFEC;
          border-bottom: 1px solid #E2E0DB;
        }
        .qw-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .qw-title h2 { margin: 0; font-size: 16px; color: #1F1E1B; }
        .qw-count {
          font-size: 12px;
          color: #9C9A94;
          padding: 2px 8px;
          background: #E2E0DB;
          border-radius: 10px;
        }
        .qw-actions { display: flex; gap: 8px; align-items: center; }
        .view-toggle {
          display: flex;
          gap: 2px;
          background: #E2E0DB;
          border-radius: 4px;
          padding: 2px;
        }
        .view-toggle button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 12px;
          border: none;
          background: transparent;
          color: #5C5A54;
          font-size: 12px;
          cursor: pointer;
          border-radius: 3px;
          transition: all 120ms ease-out;
        }
        .view-toggle button.active {
          background: #FDFCFA;
          color: #1F1E1B;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(31,30,27,0.1);
        }
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 120ms ease-out;
        }
        .btn-primary:hover { background: #35332F; transform: translateY(-1px); }
        .qw-stats-bar {
          display: flex;
          gap: 4px;
          padding: 8px 16px;
          border-bottom: 1px solid #E2E0DB;
          overflow-x: auto;
        }
        .cat-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 100ms ease-out;
        }
        .cat-stat:hover { background: #F0EFEC; }
        .cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .cat-name { font-size: 12px; color: #5C5A54; }
        .cat-count { font-size: 12px; font-weight: 600; color: #1F1E1B; }
        .qw-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .qw-main { flex: 1; overflow-y: auto; padding: 16px; }
        .tree-container { overflow-x: auto; }
        .matrix-container { display: flex; flex-direction: column; gap: 16px; }
        .qw-side { width: 380px; border-left: 1px solid #E2E0DB; overflow-y: auto; }
        .qw-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }
        .qw-empty h3 { margin: 12px 0 4px; font-size: 18px; color: #1F1E1B; }
        .qw-empty p { margin: 0 0 16px; font-size: 14px; color: #5C5A54; }
      `}</style>
    </div>
  );
}

// ============ CREATE SCENARIO MODAL ============

function CreateScenarioModal({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    attribute: 'Performance',
    subcategory: '',
    stimulus: '',
    source: '',
    environment: '',
    response: '',
    response_measure: '',
    importance: 'Medium',
    difficulty: 'Medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Quality Attribute Scenario</h3>
          <button onClick={onClose} className="close-btn"><CloseIcon fontSize="small" /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Scenario Name *</label>
              <input type="text" value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g., System must respond to user queries within 200ms"
                required autoFocus />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quality Attribute</label>
                <select value={formData.attribute}
                  onChange={(e) => setFormData(p => ({ ...p, attribute: e.target.value, subcategory: '' }))}>
                  {Object.keys(QUALITY_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subcategory</label>
                <select value={formData.subcategory}
                  onChange={(e) => setFormData(p => ({ ...p, subcategory: e.target.value }))}>
                  <option value="">Select...</option>
                  {(QUALITY_CATEGORIES[formData.attribute]?.subcategories || []).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Stimulus</label>
              <textarea value={formData.stimulus} rows={2}
                onChange={(e) => setFormData(p => ({ ...p, stimulus: e.target.value }))}
                placeholder="What triggers this quality scenario?" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Source</label>
                <input type="text" value={formData.source}
                  onChange={(e) => setFormData(p => ({ ...p, source: e.target.value }))}
                  placeholder="Who/what?" />
              </div>
              <div className="form-group">
                <label>Environment</label>
                <input type="text" value={formData.environment}
                  onChange={(e) => setFormData(p => ({ ...p, environment: e.target.value }))}
                  placeholder="Under what conditions?" />
              </div>
            </div>

            <div className="form-group">
              <label>Expected Response</label>
              <textarea value={formData.response} rows={2}
                onChange={(e) => setFormData(p => ({ ...p, response: e.target.value }))}
                placeholder="Desired system behavior" />
            </div>

            <div className="form-group">
              <label>Response Measure</label>
              <input type="text" value={formData.response_measure}
                onChange={(e) => setFormData(p => ({ ...p, response_measure: e.target.value }))}
                placeholder="e.g., Latency < 200ms at 95th percentile" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Business Importance</label>
                <select value={formData.importance}
                  onChange={(e) => setFormData(p => ({ ...p, importance: e.target.value }))}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label>Technical Difficulty</label>
                <select value={formData.difficulty}
                  onChange={(e) => setFormData(p => ({ ...p, difficulty: e.target.value }))}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Scenario</button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(31, 30, 27, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .create-modal {
          background: #FDFCFA;
          border-radius: 4px;
          width: 580px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(31, 30, 27, 0.2);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #E2E0DB;
        }
        .modal-header h3 { margin: 0; font-size: 16px; color: #1F1E1B; }
        .close-btn {
          background: none;
          border: none;
          color: #9C9A94;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        .close-btn:hover { color: #1F1E1B; background: #E2E0DB; }
        .modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }
        .form-group { margin-bottom: 12px; }
        .form-row { display: flex; gap: 12px; }
        .form-row .form-group { flex: 1; }
        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #5C5A54;
          margin-bottom: 4px;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 13px;
          background: #FDFCFA;
          color: #1F1E1B;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 120ms ease-out;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #47453F;
        }
        .form-group textarea { resize: vertical; }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid #E2E0DB;
        }
        .btn-primary {
          padding: 8px 16px;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: background 120ms ease-out;
        }
        .btn-primary:hover { background: #35332F; }
        .btn-secondary {
          padding: 8px 16px;
          background: transparent;
          color: #5C5A54;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }
        .btn-secondary:hover { background: #F0EFEC; }
      `}</style>
    </div>
  );
}

export { UtilityTreeSVG, PriorityMatrix, ScenarioDetail, TradeOffAnalysis, CreateScenarioModal, QUALITY_CATEGORIES };
