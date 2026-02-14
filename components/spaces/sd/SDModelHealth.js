// components/sd/SDModelHealth.js
// EPIC 2.9 - CLD Consistency Validation (Model Health Panel)
import { useState, useMemo, useCallback } from 'react';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

// Validation issue types
export const ISSUE_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const ISSUE_TYPES = {
  ORPHAN_NODE: {
    id: 'orphan_node',
    severity: ISSUE_SEVERITY.WARNING,
    title: 'Orphan Variable',
    message: (label) => `"${label}" is not connected to any other element`,
  },
  INCOMPLETE_LOOP: {
    id: 'incomplete_loop',
    severity: ISSUE_SEVERITY.WARNING,
    title: 'Incomplete Loop',
    message: (label) => `"${label}" has connections but is not part of a complete feedback loop`,
  },
  SELF_LOOP: {
    id: 'self_loop',
    severity: ISSUE_SEVERITY.ERROR,
    title: 'Self-Loop',
    message: (label) => `"${label}" has a link pointing to itself`,
  },
  MISSING_LABEL: {
    id: 'missing_label',
    severity: ISSUE_SEVERITY.WARNING,
    title: 'Missing Label',
    message: (label) => `Element has no descriptive label`,
  },
  CONFLICTING_POLARITY: {
    id: 'conflicting_polarity',
    severity: ISSUE_SEVERITY.INFO,
    title: 'Conflicting Parallel Paths',
    message: (source, target) => `Multiple paths between "${source}" and "${target}" have different polarities`,
  },
  FLOW_WITHOUT_STOCK: {
    id: 'flow_without_stock',
    severity: ISSUE_SEVERITY.ERROR,
    title: 'Flow Without Stock',
    message: (label) => `Flow "${label}" is not connected to any stock`,
  },
  STOCK_NO_FLOW: {
    id: 'stock_no_flow',
    severity: ISSUE_SEVERITY.WARNING,
    title: 'Stock Without Flows',
    message: (label) => `Stock "${label}" has no inflows or outflows`,
  },
  MISSING_FORMULA: {
    id: 'missing_formula',
    severity: ISSUE_SEVERITY.WARNING,
    title: 'Missing Formula',
    message: (label) => `Flow "${label}" has no formula defined`,
  },
  MISSING_INITIAL_VALUE: {
    id: 'missing_initial_value',
    severity: ISSUE_SEVERITY.WARNING,
    title: 'Missing Initial Value',
    message: (label) => `Stock "${label}" has no initial value`,
  },
  MISSING_POLARITY: {
    id: 'missing_polarity',
    severity: ISSUE_SEVERITY.INFO,
    title: 'Missing Polarity',
    message: (id) => `Causal link has no polarity (+/-) defined`,
  },
};

// Validation engine
export function validateModel(elements, connections, loops = []) {
  const issues = [];
  const elementMap = new Map(elements.map(el => [el.id, el]));

  // Find orphan nodes (no connections)
  elements.forEach(el => {
    const hasConnections = connections.some(
      c => c.source === el.id || c.target === el.id
    );
    if (!hasConnections && el.type !== 'note') {
      issues.push({
        id: `orphan_${el.id}`,
        type: ISSUE_TYPES.ORPHAN_NODE,
        severity: ISSUE_TYPES.ORPHAN_NODE.severity,
        elementId: el.id,
        message: ISSUE_TYPES.ORPHAN_NODE.message(el.label || el.name),
      });
    }
  });

  // Check for self-loops
  connections.forEach(conn => {
    if (conn.source === conn.target) {
      const el = elementMap.get(conn.source);
      issues.push({
        id: `selfloop_${conn.id}`,
        type: ISSUE_TYPES.SELF_LOOP,
        severity: ISSUE_TYPES.SELF_LOOP.severity,
        elementId: conn.source,
        connectionId: conn.id,
        message: ISSUE_TYPES.SELF_LOOP.message(el?.label || el?.name || conn.source),
      });
    }
  });

  // Check for missing labels
  elements.forEach(el => {
    if (!el.label && !el.name && el.type !== 'cloud') {
      issues.push({
        id: `nolabel_${el.id}`,
        type: ISSUE_TYPES.MISSING_LABEL,
        severity: ISSUE_TYPES.MISSING_LABEL.severity,
        elementId: el.id,
        message: ISSUE_TYPES.MISSING_LABEL.message(''),
      });
    }
  });

  // Check for missing polarity on causal links
  connections.forEach(conn => {
    if ((conn.type === 'positive' || conn.type === 'negative') &&
        !conn.polaritySymbol && conn.type !== 'flow_pipe' && conn.type !== 'connector') {
      // This is a causal link type but might not have explicit polarity
    }
  });

  // Stock-flow specific validations
  const stocks = elements.filter(el => el.type === 'stock');
  const flows = elements.filter(el => el.type === 'flow');

  // Check flows connected to stocks
  flows.forEach(flow => {
    const flowConnections = connections.filter(
      c => c.type === 'flow_pipe' && (c.source === flow.id || c.target === flow.id)
    );

    const touchesStock = flowConnections.some(conn => {
      const otherId = conn.source === flow.id ? conn.target : conn.source;
      return elementMap.get(otherId)?.type === 'stock';
    });

    if (!touchesStock) {
      issues.push({
        id: `flownostock_${flow.id}`,
        type: ISSUE_TYPES.FLOW_WITHOUT_STOCK,
        severity: ISSUE_TYPES.FLOW_WITHOUT_STOCK.severity,
        elementId: flow.id,
        message: ISSUE_TYPES.FLOW_WITHOUT_STOCK.message(flow.label || flow.name),
      });
    }

    // Check for missing formula
    if (!flow.properties?.equation) {
      issues.push({
        id: `noformula_${flow.id}`,
        type: ISSUE_TYPES.MISSING_FORMULA,
        severity: ISSUE_TYPES.MISSING_FORMULA.severity,
        elementId: flow.id,
        message: ISSUE_TYPES.MISSING_FORMULA.message(flow.label || flow.name),
      });
    }
  });

  // Check stocks for flows and initial values
  stocks.forEach(stock => {
    const stockConnections = connections.filter(
      c => c.type === 'flow_pipe' && (c.source === stock.id || c.target === stock.id)
    );

    if (stockConnections.length === 0) {
      issues.push({
        id: `stocknoflow_${stock.id}`,
        type: ISSUE_TYPES.STOCK_NO_FLOW,
        severity: ISSUE_TYPES.STOCK_NO_FLOW.severity,
        elementId: stock.id,
        message: ISSUE_TYPES.STOCK_NO_FLOW.message(stock.label || stock.name),
      });
    }

    // Check for missing initial value
    if (stock.properties?.initialValue === undefined || stock.properties?.initialValue === '') {
      issues.push({
        id: `noinitval_${stock.id}`,
        type: ISSUE_TYPES.MISSING_INITIAL_VALUE,
        severity: ISSUE_TYPES.MISSING_INITIAL_VALUE.severity,
        elementId: stock.id,
        message: ISSUE_TYPES.MISSING_INITIAL_VALUE.message(stock.label || stock.name),
      });
    }
  });

  // Check for conflicting polarities in parallel paths
  const pairPaths = new Map();
  connections.forEach(conn => {
    if (conn.type === 'positive' || conn.type === 'negative') {
      const key = `${conn.source}_${conn.target}`;
      if (!pairPaths.has(key)) {
        pairPaths.set(key, []);
      }
      pairPaths.get(key).push(conn);
    }
  });

  pairPaths.forEach((conns, key) => {
    if (conns.length > 1) {
      const polarities = new Set(conns.map(c => c.type));
      if (polarities.size > 1) {
        const [sourceId, targetId] = key.split('_');
        const source = elementMap.get(sourceId);
        const target = elementMap.get(targetId);
        issues.push({
          id: `conflicting_${key}`,
          type: ISSUE_TYPES.CONFLICTING_POLARITY,
          severity: ISSUE_TYPES.CONFLICTING_POLARITY.severity,
          elementId: sourceId,
          message: ISSUE_TYPES.CONFLICTING_POLARITY.message(
            source?.label || source?.name || sourceId,
            target?.label || target?.name || targetId
          ),
        });
      }
    }
  });

  return issues;
}

// Hook for model health validation
export function useModelHealth(elements, connections, loops) {
  const issues = useMemo(() => {
    return validateModel(elements, connections, loops);
  }, [elements, connections, loops]);

  const errorCount = useMemo(() => {
    return issues.filter(i => i.severity === ISSUE_SEVERITY.ERROR).length;
  }, [issues]);

  const warningCount = useMemo(() => {
    return issues.filter(i => i.severity === ISSUE_SEVERITY.WARNING).length;
  }, [issues]);

  const infoCount = useMemo(() => {
    return issues.filter(i => i.severity === ISSUE_SEVERITY.INFO).length;
  }, [issues]);

  const isHealthy = errorCount === 0 && warningCount === 0;

  return {
    issues,
    errorCount,
    warningCount,
    infoCount,
    isHealthy,
  };
}

// Model Health Panel Component
export default function SDModelHealth({
  issues = [],
  errorCount = 0,
  warningCount = 0,
  infoCount = 0,
  isHealthy = true,
  onIssueClick,
  onRefresh,
  isOpen = false,
  onClose,
  cyRef,
}) {
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filteredIssues = useMemo(() => {
    if (filterSeverity === 'all') return issues;
    return issues.filter(i => i.severity === filterSeverity);
  }, [issues, filterSeverity]);

  const focusOnElement = useCallback((elementId) => {
    const cy = cyRef?.current;
    if (!cy || !elementId) return;

    const element = cy.getElementById(elementId);
    if (element && element.length > 0) {
      cy.animate({
        center: { eles: element },
        zoom: 1.5,
      }, {
        duration: 300,
      });

      // Flash highlight
      element.addClass('flash-highlight');
      setTimeout(() => {
        element.removeClass('flash-highlight');
      }, 1500);
    }

    onIssueClick?.(elementId);
  }, [cyRef, onIssueClick]);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case ISSUE_SEVERITY.ERROR:
        return <ErrorIcon fontSize="small" className="error-icon" />;
      case ISSUE_SEVERITY.WARNING:
        return <WarningIcon fontSize="small" className="warning-icon" />;
      case ISSUE_SEVERITY.INFO:
        return <InfoIcon fontSize="small" className="info-icon" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sd-model-health">
      <div className="health-header">
        <HealthAndSafetyIcon fontSize="small" />
        <span className="health-title">Model Health</span>
        <button className="refresh-btn" onClick={onRefresh} title="Refresh validation">
          <RefreshIcon fontSize="small" />
        </button>
        <button className="close-btn" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </button>
      </div>

      <div className="health-summary">
        {isHealthy ? (
          <div className="health-status healthy">
            <CheckCircleIcon fontSize="small" />
            <span>Model is healthy</span>
          </div>
        ) : (
          <div className="health-counts">
            {errorCount > 0 && (
              <button
                className={`count-btn error ${filterSeverity === 'error' ? 'active' : ''}`}
                onClick={() => setFilterSeverity(filterSeverity === 'error' ? 'all' : 'error')}
              >
                <ErrorIcon fontSize="small" />
                <span>{errorCount} Errors</span>
              </button>
            )}
            {warningCount > 0 && (
              <button
                className={`count-btn warning ${filterSeverity === 'warning' ? 'active' : ''}`}
                onClick={() => setFilterSeverity(filterSeverity === 'warning' ? 'all' : 'warning')}
              >
                <WarningIcon fontSize="small" />
                <span>{warningCount} Warnings</span>
              </button>
            )}
            {infoCount > 0 && (
              <button
                className={`count-btn info ${filterSeverity === 'info' ? 'active' : ''}`}
                onClick={() => setFilterSeverity(filterSeverity === 'info' ? 'all' : 'info')}
              >
                <InfoIcon fontSize="small" />
                <span>{infoCount} Info</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="issues-list">
        {filteredIssues.length === 0 ? (
          <div className="no-issues">
            <CheckCircleIcon />
            <p>No issues found</p>
          </div>
        ) : (
          filteredIssues.map(issue => (
            <div
              key={issue.id}
              className={`issue-item ${issue.severity}`}
              onClick={() => focusOnElement(issue.elementId)}
            >
              <div className="issue-icon">
                {getSeverityIcon(issue.severity)}
              </div>
              <div className="issue-content">
                <div className="issue-title">{issue.type.title}</div>
                <div className="issue-message">{issue.message}</div>
              </div>
              <button className="focus-btn" title="Focus on element">
                <CenterFocusStrongIcon fontSize="small" />
              </button>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .sd-model-health {
          position: absolute;
          bottom: 60px;
          left: 240px;
          width: 350px;
          max-height: 400px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          z-index: 200;
          overflow: hidden;
        }

        .health-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
        }

        .health-title {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .refresh-btn, .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .refresh-btn:hover, .close-btn:hover {
          background: var(--border);
          color: var(--text);
        }

        .health-summary {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border);
        }

        .health-status.healthy {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #10b981;
          font-weight: 500;
        }

        .health-counts {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .count-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .count-btn.error {
          color: #ef4444;
        }

        .count-btn.error.active {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
        }

        .count-btn.warning {
          color: #f59e0b;
        }

        .count-btn.warning.active {
          background: rgba(245, 158, 11, 0.1);
          border-color: #f59e0b;
        }

        .count-btn.info {
          color: #3b82f6;
        }

        .count-btn.info.active {
          background: rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
        }

        .issues-list {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }

        .no-issues {
          text-align: center;
          padding: 30px 20px;
          color: #10b981;
        }

        .no-issues :global(svg) {
          font-size: 36px;
          margin-bottom: 8px;
        }

        .issue-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .issue-item:hover {
          border-color: var(--accent);
        }

        .issue-item.error {
          border-left: 3px solid #ef4444;
        }

        .issue-item.warning {
          border-left: 3px solid #f59e0b;
        }

        .issue-item.info {
          border-left: 3px solid #3b82f6;
        }

        .issue-icon {
          padding-top: 2px;
        }

        :global(.error-icon) {
          color: #ef4444;
        }

        :global(.warning-icon) {
          color: #f59e0b;
        }

        :global(.info-icon) {
          color: #3b82f6;
        }

        .issue-content {
          flex: 1;
          min-width: 0;
        }

        .issue-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 2px;
        }

        .issue-message {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .focus-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          flex-shrink: 0;
        }

        .focus-btn:hover {
          background: var(--border);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
