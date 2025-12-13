// components/ba/RACIMatrix.js
// BABOK Knowledge Area: Stakeholder Analysis
// RACI Matrix: Responsible, Accountable, Consulted, Informed

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useArtefacts, ARTEFACT_TYPES } from '../ArtefactContext';
import { useProjects } from '../ProjectContext';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TableChartIcon from '@mui/icons-material/TableChart';

// ============ RACI DEFINITIONS ============
const RACI_ROLES = {
  R: {
    id: 'R',
    name: 'Responsible',
    description: 'Does the work to complete the task',
    color: '#3b82f6',
    bgColor: '#dbeafe',
  },
  A: {
    id: 'A',
    name: 'Accountable',
    description: 'Ultimately answerable for the task completion',
    color: '#ef4444',
    bgColor: '#fee2e2',
  },
  C: {
    id: 'C',
    name: 'Consulted',
    description: 'Provides input and expertise',
    color: '#f59e0b',
    bgColor: '#fef3c7',
  },
  I: {
    id: 'I',
    name: 'Informed',
    description: 'Kept up-to-date on progress',
    color: '#22c55e',
    bgColor: '#dcfce7',
  },
};

// ============ RACI CELL ============
function RACICell({ value, onChange, stakeholder, item, readOnly = false }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    if (!readOnly) {
      setIsEditing(true);
    }
  };

  const handleSelect = (role) => {
    onChange(stakeholder.id, item.id, role);
    setIsEditing(false);
  };

  const roleDef = value ? RACI_ROLES[value] : null;

  return (
    <td className={`raci-cell ${value ? 'has-value' : 'empty'}`} onClick={handleClick}>
      {value ? (
        <span
          className="raci-badge"
          style={{ backgroundColor: roleDef?.bgColor, color: roleDef?.color }}
          title={roleDef?.name}
        >
          {value}
        </span>
      ) : (
        <span className="raci-empty">-</span>
      )}

      {isEditing && (
        <div className="raci-dropdown" onClick={(e) => e.stopPropagation()}>
          <button
            className="raci-option clear"
            onClick={() => handleSelect(null)}
          >
            Clear
          </button>
          {Object.entries(RACI_ROLES).map(([key, role]) => (
            <button
              key={key}
              className={`raci-option ${value === key ? 'selected' : ''}`}
              style={{ backgroundColor: role.bgColor, color: role.color }}
              onClick={() => handleSelect(key)}
            >
              <span className="option-key">{key}</span>
              <span className="option-name">{role.name}</span>
            </button>
          ))}
          <button className="raci-option cancel" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      )}
    </td>
  );
}

// ============ VALIDATION PANEL ============
function ValidationPanel({ matrix, stakeholders, items }) {
  const issues = useMemo(() => {
    const problems = [];

    items.forEach(item => {
      const assignments = stakeholders.map(s => ({
        stakeholder: s,
        role: matrix[`${s.id}-${item.id}`]
      })).filter(a => a.role);

      // Check for missing Accountable
      const accountable = assignments.filter(a => a.role === 'A');
      if (accountable.length === 0) {
        problems.push({
          type: 'error',
          item,
          message: `No one is Accountable for "${item.name}"`,
        });
      } else if (accountable.length > 1) {
        problems.push({
          type: 'warning',
          item,
          message: `Multiple people are Accountable for "${item.name}" - should be only one`,
        });
      }

      // Check for missing Responsible
      const responsible = assignments.filter(a => a.role === 'R');
      if (responsible.length === 0) {
        problems.push({
          type: 'warning',
          item,
          message: `No one is Responsible for "${item.name}"`,
        });
      }
    });

    // Check for stakeholder overload
    stakeholders.forEach(s => {
      const assignments = items.map(item => ({
        item,
        role: matrix[`${s.id}-${item.id}`]
      })).filter(a => a.role === 'A' || a.role === 'R');

      if (assignments.length > items.length * 0.7) {
        problems.push({
          type: 'info',
          stakeholder: s,
          message: `${s.name} is heavily loaded (${assignments.length}/${items.length} items)`,
        });
      }
    });

    return problems;
  }, [matrix, stakeholders, items]);

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;

  return (
    <div className="raci-validation">
      <div className="validation-header">
        <h4>Validation</h4>
        <div className="validation-summary">
          {errorCount > 0 && (
            <span className="summary-item error">
              <ErrorIcon fontSize="small" />
              {errorCount} errors
            </span>
          )}
          {warningCount > 0 && (
            <span className="summary-item warning">
              <WarningIcon fontSize="small" />
              {warningCount} warnings
            </span>
          )}
          {errorCount === 0 && warningCount === 0 && (
            <span className="summary-item success">
              <CheckCircleIcon fontSize="small" />
              All good!
            </span>
          )}
        </div>
      </div>

      {issues.length > 0 && (
        <div className="validation-issues">
          {issues.slice(0, 5).map((issue, index) => (
            <div key={index} className={`validation-issue ${issue.type}`}>
              {issue.type === 'error' && <ErrorIcon fontSize="small" />}
              {issue.type === 'warning' && <WarningIcon fontSize="small" />}
              {issue.type === 'info' && <InfoIcon fontSize="small" />}
              <span>{issue.message}</span>
            </div>
          ))}
          {issues.length > 5 && (
            <div className="validation-more">
              +{issues.length - 5} more issues
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ LEGEND ============
function RACILegend() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`raci-legend ${expanded ? 'expanded' : ''}`}>
      <button className="legend-toggle" onClick={() => setExpanded(!expanded)}>
        <HelpOutlineIcon fontSize="small" />
        <span>RACI Legend</span>
        <span className="toggle-icon">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="legend-content">
          {Object.entries(RACI_ROLES).map(([key, role]) => (
            <div key={key} className="legend-item">
              <span
                className="legend-badge"
                style={{ backgroundColor: role.bgColor, color: role.color }}
              >
                {key}
              </span>
              <div className="legend-details">
                <span className="legend-name">{role.name}</span>
                <span className="legend-desc">{role.description}</span>
              </div>
            </div>
          ))}

          <div className="legend-rules">
            <h5>Rules</h5>
            <ul>
              <li>Each task must have exactly one <strong>Accountable</strong> person</li>
              <li>Each task should have at least one <strong>Responsible</strong> person</li>
              <li>The Accountable person can also be Responsible (A/R)</li>
              <li>Avoid giving one person too many A or R assignments</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN RACI MATRIX ============
export default function RACIMatrix({ onSelectArtefact }) {
  const { artefacts, relationships, updateArtefact } = useArtefacts();
  const { activeProject } = useProjects();

  // State
  const [matrix, setMatrix] = useState({}); // { 'stakeholderId-itemId': 'R'|'A'|'C'|'I' }
  const [filterType, setFilterType] = useState('all');
  const [showValidation, setShowValidation] = useState(false); // Off by default
  const [saving, setSaving] = useState(false);

  // Get stakeholders
  const stakeholders = useMemo(() => {
    return artefacts.filter(a => a.artefactType === 'Stakeholder');
  }, [artefacts]);

  // Get items to assign (requirements, decisions, deliverables)
  const assignableItems = useMemo(() => {
    const types = ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement', 'Epic', 'Feature'];
    let items = artefacts.filter(a => types.includes(a.artefactType));

    if (filterType !== 'all') {
      items = items.filter(a => a.artefactType === filterType);
    }

    return items;
  }, [artefacts, filterType]);

  // Load RACI assignments from artefacts on mount
  useEffect(() => {
    const loadedMatrix = {};
    artefacts.forEach(item => {
      if (item.raciAssignments) {
        Object.entries(item.raciAssignments).forEach(([stakeholderId, role]) => {
          loadedMatrix[`${stakeholderId}-${item.id}`] = role;
        });
      }
    });
    setMatrix(loadedMatrix);
  }, [artefacts]);

  // Get unique types for filter
  const availableTypes = useMemo(() => {
    const types = new Set(artefacts.map(a => a.artefactType));
    return ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement', 'Epic', 'Feature']
      .filter(t => types.has(t));
  }, [artefacts]);

  // Handle RACI assignment - update local state and persist to database
  const handleAssignment = useCallback(async (stakeholderId, itemId, role) => {
    // Update local state immediately for responsive UI
    setMatrix(prev => {
      const key = `${stakeholderId}-${itemId}`;
      if (role) {
        return { ...prev, [key]: role };
      } else {
        const next = { ...prev };
        delete next[key];
        return next;
      }
    });

    // Persist to database
    setSaving(true);
    try {
      // Get the item artefact
      const item = artefacts.find(a => a.id === itemId);
      if (item) {
        // Build new raciAssignments
        const currentAssignments = { ...(item.raciAssignments || {}) };
        if (role) {
          currentAssignments[stakeholderId] = role;
        } else {
          delete currentAssignments[stakeholderId];
        }

        // Update the artefact with new RACI assignments
        await updateArtefact(itemId, { raciAssignments: currentAssignments });
      }
    } catch (err) {
      console.error('Failed to save RACI assignment:', err);
    } finally {
      setSaving(false);
    }
  }, [artefacts, updateArtefact]);

  // Calculate stakeholder stats
  const stakeholderStats = useMemo(() => {
    const stats = {};
    stakeholders.forEach(s => {
      stats[s.id] = { R: 0, A: 0, C: 0, I: 0, total: 0 };
    });

    Object.entries(matrix).forEach(([key, role]) => {
      const [stakeholderId] = key.split('-');
      if (stats[stakeholderId]) {
        stats[stakeholderId][role]++;
        stats[stakeholderId].total++;
      }
    });

    return stats;
  }, [stakeholders, matrix]);

  // State for export menu
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Item', 'Type', ...stakeholders.map(s => s.name)];
    const rows = assignableItems.map(item => {
      const itemRoles = stakeholders.map(s => matrix[`${s.id}-${item.id}`] || '');
      return [item.name, item.artefactType, ...itemRoles];
    });

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'raci-matrix.csv';
    a.click();
    setShowExportMenu(false);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const headers = ['Item', 'Type', ...stakeholders.map(s => s.name)];
    const rows = assignableItems.map(item => {
      const itemRoles = stakeholders.map(s => matrix[`${s.id}-${item.id}`] || '');
      return [item.name, ARTEFACT_TYPES[item.artefactType]?.name || item.artefactType, ...itemRoles];
    });

    // Create workbook XML for Excel
    const escapeXml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xml += '<Styles>\n';
    xml += '<Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E5E7EB" ss:Pattern="Solid"/></Style>\n';
    xml += '<Style ss:ID="R"><Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/><Font ss:Color="#3B82F6"/></Style>\n';
    xml += '<Style ss:ID="A"><Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/><Font ss:Color="#EF4444"/></Style>\n';
    xml += '<Style ss:ID="C"><Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/><Font ss:Color="#F59E0B"/></Style>\n';
    xml += '<Style ss:ID="I"><Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/><Font ss:Color="#22C55E"/></Style>\n';
    xml += '</Styles>\n';
    xml += '<Worksheet ss:Name="RACI Matrix">\n<Table>\n';

    // Header row
    xml += '<Row>\n';
    headers.forEach(h => {
      xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
    });
    xml += '</Row>\n';

    // Data rows
    rows.forEach(row => {
      xml += '<Row>\n';
      row.forEach((cell, idx) => {
        const raciStyle = ['R', 'A', 'C', 'I'].includes(cell) ? ` ss:StyleID="${cell}"` : '';
        xml += `<Cell${raciStyle}><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>\n`;
      });
      xml += '</Row>\n';
    });

    xml += '</Table>\n</Worksheet>\n</Workbook>';

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'raci-matrix.xls';
    a.click();
    setShowExportMenu(false);
  };

  return (
    <div className="raci-matrix-view">
      {/* Header */}
      <div className="raci-header">
        <div className="header-title">
          <h2>RACI Matrix</h2>
          <span className="subtitle">Responsibility Assignment Matrix</span>
          {saving && <span className="saving-indicator">Saving...</span>}
        </div>

        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{stakeholders.length}</span>
            <span className="stat-label">Stakeholders</span>
          </div>
          <div className="stat">
            <span className="stat-value">{assignableItems.length}</span>
            <span className="stat-label">Items</span>
          </div>
          <div className="stat">
            <span className="stat-value">{Object.keys(matrix).length}</span>
            <span className="stat-label">Assignments</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <RACILegend />

      {/* Toolbar */}
      <div className="raci-toolbar">
        <div className="toolbar-filters">
          <div className="filter-group">
            <FilterListIcon fontSize="small" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>{ARTEFACT_TYPES[type]?.name || type}</option>
              ))}
            </select>
          </div>

          <label className="checkbox-filter">
            <input
              type="checkbox"
              checked={showValidation}
              onChange={(e) => setShowValidation(e.target.checked)}
            />
            Show Validation
          </label>
        </div>

        <div className="toolbar-actions">
          <div className="export-dropdown">
            <button className="export-btn" onClick={() => setShowExportMenu(!showExportMenu)}>
              <DownloadIcon fontSize="small" />
              Export
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button onClick={handleExportCSV}>
                  <TableChartIcon fontSize="small" />
                  Export as CSV
                </button>
                <button onClick={handleExportExcel}>
                  <TableChartIcon fontSize="small" />
                  Export as Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Panel */}
      {showValidation && (
        <ValidationPanel
          matrix={matrix}
          stakeholders={stakeholders}
          items={assignableItems}
        />
      )}

      {/* Matrix Table */}
      <div className="raci-table-container">
        {stakeholders.length === 0 ? (
          <div className="empty-state">
            <PersonIcon style={{ fontSize: 48, opacity: 0.3 }} />
            <p>No stakeholders found</p>
            <p className="hint">Add stakeholders in the Stakeholder Register first</p>
          </div>
        ) : assignableItems.length === 0 ? (
          <div className="empty-state">
            <InfoIcon style={{ fontSize: 48, opacity: 0.3 }} />
            <p>No items to assign</p>
            <p className="hint">Create requirements or epics to populate the matrix</p>
          </div>
        ) : (
          <table className="raci-table">
            <thead>
              <tr>
                <th className="item-header">Item</th>
                <th className="type-header">Type</th>
                {stakeholders.map(s => (
                  <th key={s.id} className="stakeholder-header">
                    <div className="stakeholder-col">
                      <PersonIcon fontSize="small" />
                      <span className="stakeholder-name">{s.name}</span>
                      <span className="stakeholder-role">{s.role}</span>
                      <div className="stakeholder-stats">
                        {stakeholderStats[s.id]?.A > 0 && (
                          <span className="stat-badge A">{stakeholderStats[s.id].A}A</span>
                        )}
                        {stakeholderStats[s.id]?.R > 0 && (
                          <span className="stat-badge R">{stakeholderStats[s.id].R}R</span>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignableItems.map(item => {
                const typeDef = ARTEFACT_TYPES[item.artefactType];
                const hasAccountable = stakeholders.some(s => matrix[`${s.id}-${item.id}`] === 'A');

                return (
                  <tr key={item.id} className={!hasAccountable ? 'missing-accountable' : ''}>
                    <td className="item-cell">
                      <button
                        className="item-link"
                        onClick={() => onSelectArtefact && onSelectArtefact(item)}
                      >
                        {item.name}
                      </button>
                      {!hasAccountable && (
                        <span className="warning-indicator" title="Missing Accountable">
                          <WarningIcon fontSize="small" />
                        </span>
                      )}
                    </td>
                    <td className="type-cell">
                      <span
                        className="type-badge"
                        style={{ backgroundColor: typeDef?.color }}
                      >
                        {typeDef?.icon}
                      </span>
                    </td>
                    {stakeholders.map(s => (
                      <RACICell
                        key={`${s.id}-${item.id}`}
                        value={matrix[`${s.id}-${item.id}`]}
                        onChange={handleAssignment}
                        stakeholder={s}
                        item={item}
                      />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Stats */}
      <div className="raci-footer">
        <div className="footer-stats">
          <span className="stat-item">
            <span className="stat-badge R">R</span>
            {Object.values(matrix).filter(v => v === 'R').length} Responsible
          </span>
          <span className="stat-item">
            <span className="stat-badge A">A</span>
            {Object.values(matrix).filter(v => v === 'A').length} Accountable
          </span>
          <span className="stat-item">
            <span className="stat-badge C">C</span>
            {Object.values(matrix).filter(v => v === 'C').length} Consulted
          </span>
          <span className="stat-item">
            <span className="stat-badge I">I</span>
            {Object.values(matrix).filter(v => v === 'I').length} Informed
          </span>
        </div>
      </div>
    </div>
  );
}

export { RACICell, ValidationPanel, RACILegend, RACI_ROLES };
