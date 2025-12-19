// lib/dwd-exportUtils.js
// Export utilities for Dynamic Work Design cases
// Supports HTML, Markdown, and JSON export formats

import { getPrinciple, calculatePrincipleAlignment } from './dwd-principles';

// =============================================================================
// EXPORT TEMPLATES
// =============================================================================

export const DWD_EXPORT_TEMPLATES = {
  full: {
    id: 'full',
    name: 'Full Case Report',
    description: 'Complete case analysis with all artefacts and learnings',
    sections: [
      { id: 'summary', name: 'Case Summary', included: true },
      { id: 'problem', name: 'Problem Statement (P1)', included: true },
      { id: 'signals', name: 'Signals & Observations', included: true },
      { id: 'landscape', name: 'Work Landscape (P5)', included: true },
      { id: 'actors', name: 'Actors & Authority (P3)', included: true },
      { id: 'coordination', name: 'Coordination Patterns', included: true },
      { id: 'flow', name: 'Flow Analysis (P4)', included: true },
      { id: 'adjustments', name: 'Adjustments & Experiments', included: true },
      { id: 'learnings', name: 'Learnings (P2)', included: true },
      { id: 'principles', name: 'Principle Alignment', included: true },
    ],
  },
  executive: {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview for stakeholders',
    sections: [
      { id: 'summary', name: 'Case Summary', included: true },
      { id: 'problem', name: 'Problem Statement', included: true },
      { id: 'signals', name: 'Key Signals', included: true },
      { id: 'adjustments', name: 'Adjustments & Outcomes', included: true },
      { id: 'learnings', name: 'Key Learnings', included: true },
    ],
  },
  technical: {
    id: 'technical',
    name: 'Technical Analysis',
    description: 'Detailed work design analysis',
    sections: [
      { id: 'landscape', name: 'Work Landscape', included: true },
      { id: 'actors', name: 'Actors & Authority', included: true },
      { id: 'coordination', name: 'Coordination Patterns', included: true },
      { id: 'flow', name: 'Flow Analysis', included: true },
      { id: 'principles', name: 'Principle Alignment', included: true },
    ],
  },
  learning: {
    id: 'learning',
    name: 'Learning Report',
    description: 'Experiments and learnings for knowledge sharing',
    sections: [
      { id: 'summary', name: 'Case Summary', included: true },
      { id: 'problem', name: 'Problem Statement', included: true },
      { id: 'adjustments', name: 'Adjustments & Experiments', included: true },
      { id: 'learnings', name: 'Learnings', included: true },
    ],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format a date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get artefacts of a specific type from case data
 */
function getArtefactsByType(artefacts, type) {
  return artefacts.filter(a => a.artefact_type === type);
}

/**
 * Get volatility label
 */
function getVolatilityLabel(level) {
  const labels = { high: 'High', medium: 'Medium', low: 'Low' };
  return labels[level] || level;
}

/**
 * Get authority label
 */
function getAuthorityLabel(level) {
  const labels = { high: 'High', medium: 'Medium', low: 'Low' };
  return labels[level] || level;
}

/**
 * Get status label
 */
function getStatusLabel(status) {
  const labels = {
    proposed: 'Proposed',
    trying: 'Trying',
    adopted: 'Adopted',
    reverted: 'Reverted',
    active: 'Active',
    resolved: 'Resolved',
    parked: 'Parked',
  };
  return labels[status] || status;
}

/**
 * Escape HTML characters
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =============================================================================
// HTML EXPORT
// =============================================================================

/**
 * Export DWD case to HTML format
 * @param {Object} caseData - The case artefact
 * @param {Array} artefacts - All related artefacts
 * @param {Array} relationships - All relationships
 * @param {Object} options - Export options including sections
 * @returns {string} HTML content
 */
export function exportDWDCaseToHTML(caseData, artefacts, relationships, options = {}) {
  const { sections = DWD_EXPORT_TEMPLATES.full.sections, includeStyles = true } = options;
  const includedSections = sections.filter(s => s.included).map(s => s.id);

  // Categorize artefacts
  const signals = getArtefactsByType(artefacts, 'dwd_signal');
  const workItems = getArtefactsByType(artefacts, 'dwd_work_item');
  const actors = getArtefactsByType(artefacts, 'dwd_actor');
  const adjustments = getArtefactsByType(artefacts, 'dwd_adjustment');
  const learnings = getArtefactsByType(artefacts, 'dwd_learning');
  const coordPatterns = getArtefactsByType(artefacts, 'dwd_coordination_pattern');

  // Calculate principle alignment
  const alignment = calculatePrincipleAlignment(artefacts, relationships);

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DWD Case Report: ${escapeHtml(caseData.title)}</title>
  ${includeStyles ? getDWDExportStyles() : ''}
</head>
<body>
  <div class="dwd-report">
    <header class="dwd-report-header">
      <h1>Dynamic Work Design Case Report</h1>
      <p class="dwd-report-subtitle">${escapeHtml(caseData.title)}</p>
      <p class="dwd-report-date">Generated: ${formatDate(new Date().toISOString())}</p>
    </header>
`;

  // Case Summary
  if (includedSections.includes('summary')) {
    html += `
    <section class="dwd-section">
      <h2>Case Summary</h2>
      <div class="dwd-summary-grid">
        <div class="dwd-summary-item">
          <span class="dwd-summary-label">Status</span>
          <span class="dwd-summary-value dwd-status--${caseData.custom_fields?.status || 'active'}">${getStatusLabel(caseData.custom_fields?.status)}</span>
        </div>
        <div class="dwd-summary-item">
          <span class="dwd-summary-label">Created</span>
          <span class="dwd-summary-value">${formatDate(caseData.created_at)}</span>
        </div>
        <div class="dwd-summary-item">
          <span class="dwd-summary-label">Work Items</span>
          <span class="dwd-summary-value">${workItems.length}</span>
        </div>
        <div class="dwd-summary-item">
          <span class="dwd-summary-label">Signals</span>
          <span class="dwd-summary-value">${signals.length}</span>
        </div>
        <div class="dwd-summary-item">
          <span class="dwd-summary-label">Actors</span>
          <span class="dwd-summary-value">${actors.length}</span>
        </div>
        <div class="dwd-summary-item">
          <span class="dwd-summary-label">Adjustments</span>
          <span class="dwd-summary-value">${adjustments.length}</span>
        </div>
      </div>
      ${caseData.description ? `<p class="dwd-description">${escapeHtml(caseData.description)}</p>` : ''}
    </section>
`;
  }

  // Problem Statement (Principle 1)
  if (includedSections.includes('problem')) {
    const principle1 = getPrinciple('solve_right_problem');
    html += `
    <section class="dwd-section">
      <h2>Problem Statement</h2>
      <div class="dwd-principle-badge" style="background-color: ${principle1.color}15; border-left: 4px solid ${principle1.color}">
        <strong>Principle 1: ${principle1.name}</strong>
        <p>${principle1.keyInsight}</p>
      </div>
      <div class="dwd-problem-statement">
        <h3>${escapeHtml(caseData.title)}</h3>
        ${caseData.description ? `<p>${escapeHtml(caseData.description)}</p>` : ''}
        ${caseData.custom_fields?.context ? `<p><strong>Context:</strong> ${escapeHtml(caseData.custom_fields.context)}</p>` : ''}
      </div>
    </section>
`;
  }

  // Signals
  if (includedSections.includes('signals') && signals.length > 0) {
    html += `
    <section class="dwd-section">
      <h2>Signals & Observations</h2>
      <p class="dwd-section-intro">Observations indicating problems, opportunities, or changes in work patterns.</p>
      <table class="dwd-table">
        <thead>
          <tr>
            <th>Signal</th>
            <th>Type</th>
            <th>Impact</th>
            <th>Frequency</th>
          </tr>
        </thead>
        <tbody>
          ${signals.map(s => `
          <tr>
            <td>
              <strong>${escapeHtml(s.title)}</strong>
              ${s.description ? `<br><small>${escapeHtml(s.description)}</small>` : ''}
            </td>
            <td>${escapeHtml(s.custom_fields?.signal_type || 'general')}</td>
            <td class="dwd-impact--${s.custom_fields?.impact || 'medium'}">${s.custom_fields?.impact || 'medium'}</td>
            <td>${escapeHtml(s.custom_fields?.frequency || '-')}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
`;
  }

  // Work Landscape (Principle 5)
  if (includedSections.includes('landscape') && workItems.length > 0) {
    const principle5 = getPrinciple('visualize_work');
    const byVolatility = {
      high: workItems.filter(w => w.custom_fields?.volatility === 'high'),
      medium: workItems.filter(w => w.custom_fields?.volatility === 'medium'),
      low: workItems.filter(w => w.custom_fields?.volatility === 'low'),
    };

    html += `
    <section class="dwd-section">
      <h2>Work Landscape</h2>
      <div class="dwd-principle-badge" style="background-color: ${principle5.color}15; border-left: 4px solid ${principle5.color}">
        <strong>Principle 5: ${principle5.name}</strong>
        <p>${principle5.keyInsight}</p>
      </div>

      <div class="dwd-volatility-grid">
        <div class="dwd-volatility-column dwd-volatility--high">
          <h4>High Volatility (${byVolatility.high.length})</h4>
          <p class="dwd-volatility-desc">Unpredictable, requires adaptive responses</p>
          ${byVolatility.high.map(w => `
            <div class="dwd-work-item">${escapeHtml(w.title)}</div>
          `).join('') || '<p class="dwd-empty">None</p>'}
        </div>
        <div class="dwd-volatility-column dwd-volatility--medium">
          <h4>Medium Volatility (${byVolatility.medium.length})</h4>
          <p class="dwd-volatility-desc">Some variability, patterns exist</p>
          ${byVolatility.medium.map(w => `
            <div class="dwd-work-item">${escapeHtml(w.title)}</div>
          `).join('') || '<p class="dwd-empty">None</p>'}
        </div>
        <div class="dwd-volatility-column dwd-volatility--low">
          <h4>Low Volatility (${byVolatility.low.length})</h4>
          <p class="dwd-volatility-desc">Predictable, can standardize</p>
          ${byVolatility.low.map(w => `
            <div class="dwd-work-item">${escapeHtml(w.title)}</div>
          `).join('') || '<p class="dwd-empty">None</p>'}
        </div>
      </div>
    </section>
`;
  }

  // Actors & Authority (Principle 3)
  if (includedSections.includes('actors') && actors.length > 0) {
    const principle3 = getPrinciple('connect_human_chain');
    html += `
    <section class="dwd-section">
      <h2>Actors & Authority</h2>
      <div class="dwd-principle-badge" style="background-color: ${principle3.color}15; border-left: 4px solid ${principle3.color}">
        <strong>Principle 3: ${principle3.name}</strong>
        <p>${principle3.keyInsight}</p>
      </div>

      <table class="dwd-table">
        <thead>
          <tr>
            <th>Actor/Role</th>
            <th>Authority Level</th>
            <th>Skills/Capabilities</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${actors.map(a => `
          <tr>
            <td><strong>${escapeHtml(a.title)}</strong></td>
            <td class="dwd-authority--${a.custom_fields?.authority_level || 'medium'}">${getAuthorityLabel(a.custom_fields?.authority_level)}</td>
            <td>${escapeHtml(a.custom_fields?.skills?.join(', ') || '-')}</td>
            <td>${escapeHtml(a.description || '-')}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
`;
  }

  // Coordination Patterns
  if (includedSections.includes('coordination') && coordPatterns.length > 0) {
    html += `
    <section class="dwd-section">
      <h2>Coordination Patterns</h2>
      <p class="dwd-section-intro">Mechanisms for coordinating work between actors.</p>
      <div class="dwd-cards-grid">
        ${coordPatterns.map(cp => `
          <div class="dwd-card">
            <h4>${escapeHtml(cp.title)}</h4>
            <p class="dwd-card-type">${escapeHtml(cp.custom_fields?.pattern_type || 'custom')}</p>
            ${cp.description ? `<p>${escapeHtml(cp.description)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
`;
  }

  // Flow Analysis (Principle 4)
  if (includedSections.includes('flow')) {
    const principle4 = getPrinciple('regulate_for_flow');
    const bottleneckSignals = signals.filter(s => s.custom_fields?.signal_type === 'bottleneck');
    const overloadSignals = signals.filter(s => s.custom_fields?.signal_type === 'overload');

    html += `
    <section class="dwd-section">
      <h2>Flow Analysis</h2>
      <div class="dwd-principle-badge" style="background-color: ${principle4.color}15; border-left: 4px solid ${principle4.color}">
        <strong>Principle 4: ${principle4.name}</strong>
        <p>${principle4.keyInsight}</p>
      </div>

      <div class="dwd-flow-analysis">
        <div class="dwd-flow-item">
          <h4>Bottlenecks Identified</h4>
          ${bottleneckSignals.length > 0
            ? bottleneckSignals.map(s => `<p>• ${escapeHtml(s.title)}</p>`).join('')
            : '<p class="dwd-empty">No bottleneck signals recorded</p>'}
        </div>
        <div class="dwd-flow-item">
          <h4>Overload Indicators</h4>
          ${overloadSignals.length > 0
            ? overloadSignals.map(s => `<p>• ${escapeHtml(s.title)}</p>`).join('')
            : '<p class="dwd-empty">No overload signals recorded</p>'}
        </div>
      </div>
    </section>
`;
  }

  // Adjustments
  if (includedSections.includes('adjustments') && adjustments.length > 0) {
    const byStatus = {
      proposed: adjustments.filter(a => a.custom_fields?.status === 'proposed'),
      trying: adjustments.filter(a => a.custom_fields?.status === 'trying'),
      adopted: adjustments.filter(a => a.custom_fields?.status === 'adopted'),
      reverted: adjustments.filter(a => a.custom_fields?.status === 'reverted'),
    };

    html += `
    <section class="dwd-section">
      <h2>Adjustments & Experiments</h2>
      <p class="dwd-section-intro">Small, deliberate changes to improve how work flows.</p>

      <div class="dwd-adjustment-summary">
        <span class="dwd-adj-stat dwd-adj--proposed">${byStatus.proposed.length} Proposed</span>
        <span class="dwd-adj-stat dwd-adj--trying">${byStatus.trying.length} Trying</span>
        <span class="dwd-adj-stat dwd-adj--adopted">${byStatus.adopted.length} Adopted</span>
        <span class="dwd-adj-stat dwd-adj--reverted">${byStatus.reverted.length} Reverted</span>
      </div>

      <table class="dwd-table">
        <thead>
          <tr>
            <th>Adjustment</th>
            <th>Status</th>
            <th>Type</th>
            <th>Outcome</th>
          </tr>
        </thead>
        <tbody>
          ${adjustments.map(a => `
          <tr>
            <td>
              <strong>${escapeHtml(a.title)}</strong>
              ${a.description ? `<br><small>${escapeHtml(a.description)}</small>` : ''}
            </td>
            <td class="dwd-status--${a.custom_fields?.status || 'proposed'}">${getStatusLabel(a.custom_fields?.status)}</td>
            <td>${escapeHtml(a.custom_fields?.adjustment_type || '-')}</td>
            <td>${escapeHtml(a.custom_fields?.outcome || '-')}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
`;
  }

  // Learnings (Principle 2)
  if (includedSections.includes('learnings') && learnings.length > 0) {
    const principle2 = getPrinciple('structure_for_discovery');
    html += `
    <section class="dwd-section">
      <h2>Learnings</h2>
      <div class="dwd-principle-badge" style="background-color: ${principle2.color}15; border-left: 4px solid ${principle2.color}">
        <strong>Principle 2: ${principle2.name}</strong>
        <p>${principle2.keyInsight}</p>
      </div>

      <div class="dwd-learnings-list">
        ${learnings.map(l => `
          <div class="dwd-learning-card">
            <h4>${escapeHtml(l.title)}</h4>
            ${l.description ? `<p>${escapeHtml(l.description)}</p>` : ''}
            ${l.custom_fields?.confidence ? `<span class="dwd-confidence">Confidence: ${l.custom_fields.confidence}</span>` : ''}
            ${l.custom_fields?.implications ? `<p class="dwd-implications"><strong>Implications:</strong> ${escapeHtml(l.custom_fields.implications)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
`;
  }

  // Principle Alignment
  if (includedSections.includes('principles')) {
    html += `
    <section class="dwd-section">
      <h2>DWD Principle Alignment</h2>
      <p class="dwd-section-intro">Assessment against MIT's 5 Dynamic Work Design Principles.</p>

      <div class="dwd-principles-grid">
        ${alignment.map(p => `
          <div class="dwd-principle-card" style="border-left: 4px solid ${p.principle.color}">
            <div class="dwd-principle-header">
              <span class="dwd-principle-num" style="background: ${p.principle.color}">${p.principle.number}</span>
              <span class="dwd-principle-name">${p.principle.name}</span>
              <span class="dwd-principle-score">${Math.round(p.score * 100)}%</span>
            </div>
            <p class="dwd-principle-insight">${p.principle.keyInsight}</p>
            <div class="dwd-principle-evidence">
              ${p.evidence.map(e => `<span class="dwd-evidence-item">✓ ${escapeHtml(e)}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
`;
  }

  // Footer
  html += `
    <footer class="dwd-report-footer">
      <p>Generated by Knowledge Graph - Dynamic Work Design Workspace</p>
      <p>Based on MIT Dynamic Work Design principles (Repenning & Kieffer)</p>
    </footer>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Get CSS styles for HTML export
 */
function getDWDExportStyles() {
  return `
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .dwd-report {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .dwd-report-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    .dwd-report-header h1 {
      margin: 0;
      font-size: 24px;
      color: #6366f1;
    }
    .dwd-report-subtitle {
      font-size: 28px;
      font-weight: 600;
      margin: 10px 0;
    }
    .dwd-report-date {
      color: #6b7280;
      font-size: 14px;
    }
    .dwd-section {
      margin-bottom: 40px;
    }
    .dwd-section h2 {
      font-size: 20px;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .dwd-section-intro {
      color: #6b7280;
      margin-bottom: 20px;
    }
    .dwd-principle-badge {
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .dwd-principle-badge strong {
      display: block;
      margin-bottom: 8px;
    }
    .dwd-principle-badge p {
      margin: 0;
      font-size: 14px;
      color: #4b5563;
    }
    .dwd-summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .dwd-summary-item {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    .dwd-summary-label {
      display: block;
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .dwd-summary-value {
      display: block;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }
    .dwd-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .dwd-table th, .dwd-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .dwd-table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .dwd-table tr:hover {
      background: #f9fafb;
    }
    .dwd-volatility-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .dwd-volatility-column {
      padding: 20px;
      border-radius: 8px;
    }
    .dwd-volatility--high { background: #fef2f2; border-top: 4px solid #ef4444; }
    .dwd-volatility--medium { background: #fffbeb; border-top: 4px solid #f59e0b; }
    .dwd-volatility--low { background: #ecfdf5; border-top: 4px solid #10b981; }
    .dwd-volatility-column h4 { margin: 0 0 8px; }
    .dwd-volatility-desc { font-size: 12px; color: #6b7280; margin-bottom: 16px; }
    .dwd-work-item {
      background: white;
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .dwd-empty { color: #9ca3af; font-style: italic; }
    .dwd-cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .dwd-card {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
    }
    .dwd-card h4 { margin: 0 0 8px; }
    .dwd-card-type {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .dwd-adjustment-summary {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }
    .dwd-adj-stat {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    .dwd-adj--proposed { background: #f3f4f6; color: #6b7280; }
    .dwd-adj--trying { background: #fef3c7; color: #92400e; }
    .dwd-adj--adopted { background: #d1fae5; color: #065f46; }
    .dwd-adj--reverted { background: #fee2e2; color: #991b1b; }
    .dwd-status--active { color: #3b82f6; }
    .dwd-status--resolved { color: #10b981; }
    .dwd-status--proposed { color: #6b7280; }
    .dwd-status--trying { color: #f59e0b; }
    .dwd-status--adopted { color: #10b981; }
    .dwd-status--reverted { color: #ef4444; }
    .dwd-impact--high { color: #ef4444; font-weight: 600; }
    .dwd-impact--medium { color: #f59e0b; }
    .dwd-impact--low { color: #10b981; }
    .dwd-authority--high { color: #10b981; }
    .dwd-authority--medium { color: #f59e0b; }
    .dwd-authority--low { color: #ef4444; }
    .dwd-flow-analysis {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .dwd-flow-item {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }
    .dwd-flow-item h4 { margin: 0 0 12px; }
    .dwd-learnings-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .dwd-learning-card {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 16px;
      border-radius: 0 8px 8px 0;
    }
    .dwd-learning-card h4 { margin: 0 0 8px; }
    .dwd-confidence {
      display: inline-block;
      font-size: 12px;
      padding: 2px 8px;
      background: #d1fae5;
      border-radius: 4px;
      margin-top: 8px;
    }
    .dwd-implications {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #d1fae5;
    }
    .dwd-principles-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .dwd-principle-card {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
    }
    .dwd-principle-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .dwd-principle-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      color: white;
      font-weight: 600;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dwd-principle-name { font-weight: 600; flex: 1; }
    .dwd-principle-score { font-weight: 600; color: #10b981; }
    .dwd-principle-insight { font-size: 14px; color: #6b7280; margin: 0 0 12px; }
    .dwd-principle-evidence {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .dwd-evidence-item {
      font-size: 12px;
      background: white;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .dwd-report-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
    @media print {
      body { background: white; padding: 0; }
      .dwd-report { box-shadow: none; }
    }
  </style>
`;
}

// =============================================================================
// MARKDOWN EXPORT
// =============================================================================

/**
 * Export DWD case to Markdown format
 * @param {Object} caseData - The case artefact
 * @param {Array} artefacts - All related artefacts
 * @param {Array} relationships - All relationships
 * @param {Object} options - Export options including sections
 * @returns {string} Markdown content
 */
export function exportDWDCaseToMarkdown(caseData, artefacts, relationships, options = {}) {
  const { sections = DWD_EXPORT_TEMPLATES.full.sections } = options;
  const includedSections = sections.filter(s => s.included).map(s => s.id);

  // Categorize artefacts
  const signals = getArtefactsByType(artefacts, 'dwd_signal');
  const workItems = getArtefactsByType(artefacts, 'dwd_work_item');
  const actors = getArtefactsByType(artefacts, 'dwd_actor');
  const adjustments = getArtefactsByType(artefacts, 'dwd_adjustment');
  const learnings = getArtefactsByType(artefacts, 'dwd_learning');
  const coordPatterns = getArtefactsByType(artefacts, 'dwd_coordination_pattern');

  // Calculate principle alignment
  const alignment = calculatePrincipleAlignment(artefacts, relationships);

  let md = `# Dynamic Work Design Case Report

## ${caseData.title}

*Generated: ${formatDate(new Date().toISOString())}*

---

`;

  // Case Summary
  if (includedSections.includes('summary')) {
    md += `## Case Summary

| Metric | Value |
|--------|-------|
| Status | ${getStatusLabel(caseData.custom_fields?.status)} |
| Created | ${formatDate(caseData.created_at)} |
| Work Items | ${workItems.length} |
| Signals | ${signals.length} |
| Actors | ${actors.length} |
| Adjustments | ${adjustments.length} |

${caseData.description || ''}

---

`;
  }

  // Problem Statement
  if (includedSections.includes('problem')) {
    const principle1 = getPrinciple('solve_right_problem');
    md += `## Problem Statement

> **Principle 1: ${principle1.name}**
> ${principle1.keyInsight}

### ${caseData.title}

${caseData.description || ''}

${caseData.custom_fields?.context ? `**Context:** ${caseData.custom_fields.context}` : ''}

---

`;
  }

  // Signals
  if (includedSections.includes('signals') && signals.length > 0) {
    md += `## Signals & Observations

| Signal | Type | Impact | Frequency |
|--------|------|--------|-----------|
${signals.map(s => `| ${s.title} | ${s.custom_fields?.signal_type || '-'} | ${s.custom_fields?.impact || '-'} | ${s.custom_fields?.frequency || '-'} |`).join('\n')}

---

`;
  }

  // Work Landscape
  if (includedSections.includes('landscape') && workItems.length > 0) {
    const principle5 = getPrinciple('visualize_work');
    md += `## Work Landscape

> **Principle 5: ${principle5.name}**
> ${principle5.keyInsight}

### High Volatility
${workItems.filter(w => w.custom_fields?.volatility === 'high').map(w => `- ${w.title}`).join('\n') || '*None*'}

### Medium Volatility
${workItems.filter(w => w.custom_fields?.volatility === 'medium').map(w => `- ${w.title}`).join('\n') || '*None*'}

### Low Volatility
${workItems.filter(w => w.custom_fields?.volatility === 'low').map(w => `- ${w.title}`).join('\n') || '*None*'}

---

`;
  }

  // Actors
  if (includedSections.includes('actors') && actors.length > 0) {
    const principle3 = getPrinciple('connect_human_chain');
    md += `## Actors & Authority

> **Principle 3: ${principle3.name}**
> ${principle3.keyInsight}

| Actor/Role | Authority | Skills | Notes |
|------------|-----------|--------|-------|
${actors.map(a => `| ${a.title} | ${getAuthorityLabel(a.custom_fields?.authority_level)} | ${a.custom_fields?.skills?.join(', ') || '-'} | ${a.description || '-'} |`).join('\n')}

---

`;
  }

  // Coordination Patterns
  if (includedSections.includes('coordination') && coordPatterns.length > 0) {
    md += `## Coordination Patterns

${coordPatterns.map(cp => `### ${cp.title}
- **Type:** ${cp.custom_fields?.pattern_type || 'custom'}
- ${cp.description || ''}`).join('\n\n')}

---

`;
  }

  // Flow Analysis
  if (includedSections.includes('flow')) {
    const principle4 = getPrinciple('regulate_for_flow');
    const bottleneckSignals = signals.filter(s => s.custom_fields?.signal_type === 'bottleneck');
    const overloadSignals = signals.filter(s => s.custom_fields?.signal_type === 'overload');

    md += `## Flow Analysis

> **Principle 4: ${principle4.name}**
> ${principle4.keyInsight}

### Bottlenecks Identified
${bottleneckSignals.length > 0 ? bottleneckSignals.map(s => `- ${s.title}`).join('\n') : '*No bottleneck signals recorded*'}

### Overload Indicators
${overloadSignals.length > 0 ? overloadSignals.map(s => `- ${s.title}`).join('\n') : '*No overload signals recorded*'}

---

`;
  }

  // Adjustments
  if (includedSections.includes('adjustments') && adjustments.length > 0) {
    md += `## Adjustments & Experiments

| Adjustment | Status | Type | Outcome |
|------------|--------|------|---------|
${adjustments.map(a => `| ${a.title} | ${getStatusLabel(a.custom_fields?.status)} | ${a.custom_fields?.adjustment_type || '-'} | ${a.custom_fields?.outcome || '-'} |`).join('\n')}

---

`;
  }

  // Learnings
  if (includedSections.includes('learnings') && learnings.length > 0) {
    const principle2 = getPrinciple('structure_for_discovery');
    md += `## Learnings

> **Principle 2: ${principle2.name}**
> ${principle2.keyInsight}

${learnings.map(l => `### ${l.title}

${l.description || ''}

${l.custom_fields?.confidence ? `**Confidence:** ${l.custom_fields.confidence}` : ''}

${l.custom_fields?.implications ? `**Implications:** ${l.custom_fields.implications}` : ''}`).join('\n\n')}

---

`;
  }

  // Principle Alignment
  if (includedSections.includes('principles')) {
    md += `## DWD Principle Alignment

${alignment.map(p => `### ${p.principle.number}. ${p.principle.name} (${Math.round(p.score * 100)}%)

> ${p.principle.keyInsight}

**Evidence:**
${p.evidence.map(e => `- ${e}`).join('\n')}`).join('\n\n')}

---

`;
  }

  md += `
*Generated by Knowledge Graph - Dynamic Work Design Workspace*
*Based on MIT Dynamic Work Design principles (Repenning & Kieffer)*
`;

  return md;
}

// =============================================================================
// JSON EXPORT
// =============================================================================

/**
 * Export DWD case to JSON format
 * @param {Object} caseData - The case artefact
 * @param {Array} artefacts - All related artefacts
 * @param {Array} relationships - All relationships
 * @param {Object} options - Export options
 * @returns {string} JSON string
 */
export function exportDWDCaseToJSON(caseData, artefacts, relationships, options = {}) {
  const { prettyPrint = true } = options;

  // Categorize artefacts
  const signals = getArtefactsByType(artefacts, 'dwd_signal');
  const workItems = getArtefactsByType(artefacts, 'dwd_work_item');
  const actors = getArtefactsByType(artefacts, 'dwd_actor');
  const adjustments = getArtefactsByType(artefacts, 'dwd_adjustment');
  const learnings = getArtefactsByType(artefacts, 'dwd_learning');
  const coordPatterns = getArtefactsByType(artefacts, 'dwd_coordination_pattern');

  // Calculate principle alignment
  const alignment = calculatePrincipleAlignment(artefacts, relationships);

  const exportData = {
    exportedAt: new Date().toISOString(),
    exportVersion: '1.0',
    case: {
      id: caseData.id,
      title: caseData.title,
      description: caseData.description,
      status: caseData.custom_fields?.status,
      createdAt: caseData.created_at,
      updatedAt: caseData.updated_at,
      customFields: caseData.custom_fields,
    },
    artefacts: {
      signals: signals.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        signalType: a.custom_fields?.signal_type,
        impact: a.custom_fields?.impact,
        frequency: a.custom_fields?.frequency,
      })),
      workItems: workItems.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        volatility: a.custom_fields?.volatility,
        state: a.custom_fields?.state,
      })),
      actors: actors.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        authorityLevel: a.custom_fields?.authority_level,
        skills: a.custom_fields?.skills,
      })),
      adjustments: adjustments.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        status: a.custom_fields?.status,
        adjustmentType: a.custom_fields?.adjustment_type,
        outcome: a.custom_fields?.outcome,
      })),
      learnings: learnings.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        confidence: a.custom_fields?.confidence,
        implications: a.custom_fields?.implications,
      })),
      coordinationPatterns: coordPatterns.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        patternType: a.custom_fields?.pattern_type,
      })),
    },
    relationships: relationships.map(r => ({
      id: r.id,
      sourceId: r.source_id,
      targetId: r.target_id,
      relationshipType: r.relationship_type,
    })),
    principleAlignment: alignment.map(p => ({
      principleId: p.principle.id,
      principleNumber: p.principle.number,
      principleName: p.principle.name,
      score: p.score,
      evidence: p.evidence,
    })),
    summary: {
      totalArtefacts: artefacts.length,
      signalCount: signals.length,
      workItemCount: workItems.length,
      actorCount: actors.length,
      adjustmentCount: adjustments.length,
      learningCount: learnings.length,
      coordinationPatternCount: coordPatterns.length,
    },
  };

  return prettyPrint ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
}

// =============================================================================
// DOWNLOAD HELPERS
// =============================================================================

/**
 * Trigger download of content as file
 * @param {string} content - File content
 * @param {string} filename - Desired filename
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download DWD case export
 * @param {string} format - 'html', 'markdown', or 'json'
 * @param {Object} caseData - The case artefact
 * @param {Array} artefacts - All related artefacts
 * @param {Array} relationships - All relationships
 * @param {Object} options - Export options
 */
export function downloadDWDExport(format, caseData, artefacts, relationships, options = {}) {
  const sanitizedTitle = caseData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const timestamp = new Date().toISOString().split('T')[0];

  switch (format) {
    case 'html':
      const htmlContent = exportDWDCaseToHTML(caseData, artefacts, relationships, options);
      downloadFile(htmlContent, `dwd_${sanitizedTitle}_${timestamp}.html`, 'text/html');
      break;
    case 'markdown':
      const mdContent = exportDWDCaseToMarkdown(caseData, artefacts, relationships, options);
      downloadFile(mdContent, `dwd_${sanitizedTitle}_${timestamp}.md`, 'text/markdown');
      break;
    case 'json':
      const jsonContent = exportDWDCaseToJSON(caseData, artefacts, relationships, options);
      downloadFile(jsonContent, `dwd_${sanitizedTitle}_${timestamp}.json`, 'application/json');
      break;
    default:
      console.error(`Unsupported export format: ${format}`);
  }
}
