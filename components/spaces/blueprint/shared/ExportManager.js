// components/spaces/blueprint/shared/ExportManager.js
// Export functionality for Blueprint Studio
// Handles print-friendly rendering and data export (CSV, JSON)

import { useState, useCallback, useRef } from 'react';
import {
  useBlueprint,
  BPS_STAGE_INFO,
  formatCurrency,
  formatPercentage,
} from '../BlueprintContext';

// MUI Icons
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CloseIcon from '@mui/icons-material/Close';
import SummarizeIcon from '@mui/icons-material/Summarize';

const COLORS = {
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  muted: '#9C9A94',
  canvas: '#FDFCFA',
  panel: '#F0EFEC',
  border: '#E2E0DB',
  accent: '#47453F',
  success: '#5B8A6A',
  warning: '#C9A227',
  danger: '#A54D4D',
};

// Export format options
const EXPORT_FORMATS = [
  {
    id: 'print',
    label: 'Print / PDF',
    description: 'Print-friendly view (use browser print to save as PDF)',
    icon: PrintIcon,
  },
  {
    id: 'csv',
    label: 'CSV Spreadsheet',
    description: 'Export initiative data as CSV',
    icon: TableChartIcon,
  },
  {
    id: 'json',
    label: 'JSON Data',
    description: 'Export raw data as JSON',
    icon: DataObjectIcon,
  },
  {
    id: 'summary',
    label: 'Executive Summary',
    description: 'One-page initiative summary for stakeholders',
    icon: SummarizeIcon,
  },
];

// Export scopes
const EXPORT_SCOPES = [
  { id: 'initiative', label: 'Current Initiative', requiresInitiative: true },
  { id: 'portfolio', label: 'Full Portfolio', requiresInitiative: false },
];

/**
 * Generate CSV content from initiatives
 */
function generateCSV(initiatives) {
  const headers = [
    'ID', 'Name', 'Stage', 'Track', 'Owner',
    'Created', 'Updated', 'Score',
    'NPV', 'Investment Required',
    'Problem Statement', 'Target Customer',
  ];

  const rows = initiatives.map(init => [
    init.display_id || '',
    `"${(init.name || '').replace(/"/g, '""')}"`,
    init.status || '',
    init.custom_fields?.track || 'full',
    init.owner_name || '',
    init.created_at ? new Date(init.created_at).toISOString().split('T')[0] : '',
    init.updated_at ? new Date(init.updated_at).toISOString().split('T')[0] : '',
    init.assess_data?.overall_score ?? '',
    init.case_data?.npv ?? '',
    init.case_data?.investment_required ?? '',
    `"${(init.idea_data?.problem_statement || '').replace(/"/g, '""')}"`,
    `"${(init.idea_data?.target_customer || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Generate executive summary HTML for print
 */
function generateExecutiveSummary(initiative) {
  const stage = BPS_STAGE_INFO[initiative?.status] || {};
  const ideaData = initiative?.idea_data || {};
  const caseData = initiative?.case_data || {};
  const assessData = initiative?.assess_data || {};

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${initiative?.name || 'Initiative'} — Executive Summary</title>
  <style>
    @media print {
      body { margin: 0; padding: 20mm; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      color: #1F1E1B;
      line-height: 1.5;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: #FDFCFA;
    }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 16px; margin: 24px 0 8px; border-bottom: 2px solid #E2E0DB; padding-bottom: 4px; }
    .meta { color: #5C5A54; font-size: 13px; margin-bottom: 20px; }
    .stage-badge {
      display: inline-block; padding: 2px 10px; border-radius: 4px;
      font-size: 12px; font-weight: 600; color: #FDFCFA;
      background: ${stage.color || '#47453F'};
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .metric { background: #F0EFEC; padding: 12px; border-radius: 4px; }
    .metric-label { font-size: 12px; color: #9C9A94; margin-bottom: 2px; }
    .metric-value { font-size: 18px; font-weight: 600; }
    .section-content { font-size: 14px; color: #5C5A54; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #E2E0DB; font-size: 11px; color: #9C9A94; }
  </style>
</head>
<body>
  <h1>${initiative?.name || 'Untitled Initiative'}</h1>
  <div class="meta">
    ${initiative?.display_id || ''} &bull;
    <span class="stage-badge">${stage.name || initiative?.status || ''}</span> &bull;
    Generated ${new Date().toLocaleDateString()}
  </div>

  <h2>Problem Statement</h2>
  <div class="section-content">${ideaData.problem_statement || 'Not specified'}</div>

  <h2>Proposed Solution</h2>
  <div class="section-content">${ideaData.solution_description || 'Not specified'}</div>

  <h2>Target Customer</h2>
  <div class="section-content">${ideaData.target_customer || 'Not specified'}</div>

  <h2>Key Metrics</h2>
  <div class="grid">
    <div class="metric">
      <div class="metric-label">Overall Score</div>
      <div class="metric-value">${assessData.overall_score != null ? assessData.overall_score + '/5' : 'Not scored'}</div>
    </div>
    <div class="metric">
      <div class="metric-label">NPV</div>
      <div class="metric-value">${caseData.npv != null ? '$' + Number(caseData.npv).toLocaleString() : 'TBD'}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Investment Required</div>
      <div class="metric-value">${caseData.investment_required != null ? '$' + Number(caseData.investment_required).toLocaleString() : 'TBD'}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Track</div>
      <div class="metric-value">${(initiative?.custom_fields?.track || 'full').replace(/_/g, ' ')}</div>
    </div>
  </div>

  ${caseData.recommendation ? `
  <h2>Recommendation</h2>
  <div class="section-content">${caseData.recommendation}</div>
  ` : ''}

  ${caseData.risks?.length ? `
  <h2>Key Risks</h2>
  <ul class="section-content">
    ${caseData.risks.map(r => `<li>${r.description || r}</li>`).join('')}
  </ul>
  ` : ''}

  <div class="footer">
    Ontographia Blueprint Studio &bull; Confidential &bull; ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;
}

/**
 * Generate portfolio summary HTML for print
 */
function generatePortfolioSummary(initiatives) {
  const byStage = {};
  initiatives.forEach(init => {
    const stage = init.status || 'unknown';
    if (!byStage[stage]) byStage[stage] = [];
    byStage[stage].push(init);
  });

  const stageRows = Object.entries(byStage)
    .map(([stage, inits]) => {
      const info = BPS_STAGE_INFO[stage] || {};
      return `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #E2E0DB;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #FDFCFA; background: ${info.color || '#47453F'}">
              ${info.name || stage}
            </span>
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #E2E0DB; text-align: center; font-weight: 600;">${inits.length}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #E2E0DB; font-size: 12px; color: #5C5A54;">
            ${inits.map(i => i.name).join(', ')}
          </td>
        </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Blueprint Portfolio Summary</title>
  <style>
    @media print {
      body { margin: 0; padding: 20mm; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      color: #1F1E1B; line-height: 1.5;
      max-width: 900px; margin: 0 auto; padding: 40px; background: #FDFCFA;
    }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 16px; margin: 24px 0 8px; border-bottom: 2px solid #E2E0DB; padding-bottom: 4px; }
    .meta { color: #5C5A54; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #E2E0DB; font-size: 12px; color: #9C9A94; font-weight: 600; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .summary-card { background: #F0EFEC; padding: 14px; border-radius: 4px; text-align: center; }
    .summary-card-value { font-size: 24px; font-weight: 700; }
    .summary-card-label { font-size: 12px; color: #9C9A94; margin-top: 2px; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #E2E0DB; font-size: 11px; color: #9C9A94; }
  </style>
</head>
<body>
  <h1>Blueprint Portfolio Summary</h1>
  <div class="meta">Generated ${new Date().toLocaleDateString()} &bull; ${initiatives.length} initiatives</div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-card-value">${initiatives.length}</div>
      <div class="summary-card-label">Total Initiatives</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-value">${initiatives.filter(i => !['approved', 'declined'].includes(i.status)).length}</div>
      <div class="summary-card-label">Active</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-value">${initiatives.filter(i => i.status === 'approved').length}</div>
      <div class="summary-card-label">Approved</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-value">${initiatives.filter(i => i.status === 'declined').length}</div>
      <div class="summary-card-label">Declined</div>
    </div>
  </div>

  <h2>By Stage</h2>
  <table>
    <thead>
      <tr>
        <th>Stage</th>
        <th style="text-align: center;">Count</th>
        <th>Initiatives</th>
      </tr>
    </thead>
    <tbody>${stageRows}</tbody>
  </table>

  <h2>All Initiatives</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Stage</th>
        <th>Score</th>
        <th>NPV</th>
      </tr>
    </thead>
    <tbody>
      ${initiatives.map(init => `
        <tr>
          <td style="padding: 6px 12px; border-bottom: 1px solid #E2E0DB; font-size: 12px; color: #9C9A94;">${init.display_id || ''}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #E2E0DB; font-weight: 500;">${init.name}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #E2E0DB;">
            <span style="padding: 1px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; background: ${(BPS_STAGE_INFO[init.status]?.color || '#47453F')}20; color: ${BPS_STAGE_INFO[init.status]?.color || '#47453F'}">
              ${BPS_STAGE_INFO[init.status]?.name || init.status}
            </span>
          </td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #E2E0DB; text-align: center;">${init.assess_data?.overall_score ?? '-'}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #E2E0DB;">${init.case_data?.npv != null ? '$' + Number(init.case_data.npv).toLocaleString() : '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    Ontographia Blueprint Studio &bull; Confidential &bull; ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;
}

/**
 * Download a file
 */
function downloadFile(content, filename, mimeType) {
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
 * Open HTML in a new window for printing
 */
function openPrintWindow(html) {
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    // Give it a moment to render before triggering print
    setTimeout(() => win.print(), 500);
  }
}

export default function ExportManager({ isOpen, onClose }) {
  const { activeInitiative, initiatives } = useBlueprint();
  const [selectedFormat, setSelectedFormat] = useState('print');
  const [selectedScope, setSelectedScope] = useState(activeInitiative ? 'initiative' : 'portfolio');
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);

    try {
      const scope = selectedScope === 'initiative' && activeInitiative
        ? [activeInitiative]
        : initiatives;

      const timestamp = new Date().toISOString().split('T')[0];

      switch (selectedFormat) {
        case 'print': {
          if (selectedScope === 'initiative' && activeInitiative) {
            openPrintWindow(generateExecutiveSummary(activeInitiative));
          } else {
            openPrintWindow(generatePortfolioSummary(initiatives));
          }
          break;
        }

        case 'summary': {
          if (selectedScope === 'initiative' && activeInitiative) {
            openPrintWindow(generateExecutiveSummary(activeInitiative));
          } else {
            openPrintWindow(generatePortfolioSummary(initiatives));
          }
          break;
        }

        case 'csv': {
          const csv = generateCSV(scope);
          const filename = selectedScope === 'initiative' && activeInitiative
            ? `${activeInitiative.display_id || 'initiative'}-${timestamp}.csv`
            : `blueprint-portfolio-${timestamp}.csv`;
          downloadFile(csv, filename, 'text/csv;charset=utf-8;');
          break;
        }

        case 'json': {
          const json = JSON.stringify(scope.map(init => ({
            id: init.id,
            display_id: init.display_id,
            name: init.name,
            status: init.status,
            track: init.custom_fields?.track || 'full',
            created_at: init.created_at,
            updated_at: init.updated_at,
            idea_data: init.idea_data,
            explore_data: init.explore_data,
            assess_data: init.assess_data,
            case_data: init.case_data,
            governance: init.governance,
          })), null, 2);
          const filename = selectedScope === 'initiative' && activeInitiative
            ? `${activeInitiative.display_id || 'initiative'}-${timestamp}.json`
            : `blueprint-portfolio-${timestamp}.json`;
          downloadFile(json, filename, 'application/json');
          break;
        }
      }
    } finally {
      setExporting(false);
    }
  }, [selectedFormat, selectedScope, activeInitiative, initiatives]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(31, 30, 27, 0.4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: COLORS.canvas,
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(31, 30, 27, 0.2)',
          width: 480,
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DownloadIcon style={{ fontSize: 20, color: COLORS.accent }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.text }}>
              Export
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, border: 'none', borderRadius: 4,
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CloseIcon style={{ fontSize: 18, color: COLORS.muted }} />
          </button>
        </div>

        <div style={{ padding: '16px 18px' }}>
          {/* Scope Selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 6 }}>
              Scope
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {EXPORT_SCOPES.map(scope => (
                <button
                  key={scope.id}
                  onClick={() => setSelectedScope(scope.id)}
                  disabled={scope.requiresInitiative && !activeInitiative}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 4,
                    border: `1px solid ${selectedScope === scope.id ? COLORS.accent : COLORS.border}`,
                    background: selectedScope === scope.id ? `${COLORS.accent}10` : COLORS.canvas,
                    color: selectedScope === scope.id ? COLORS.text : COLORS.textSecondary,
                    fontSize: 13, fontWeight: selectedScope === scope.id ? 500 : 400,
                    cursor: scope.requiresInitiative && !activeInitiative ? 'not-allowed' : 'pointer',
                    opacity: scope.requiresInitiative && !activeInitiative ? 0.5 : 1,
                  }}
                >
                  {scope.label}
                </button>
              ))}
            </div>
            {selectedScope === 'initiative' && activeInitiative && (
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
                {activeInitiative.display_id} — {activeInitiative.name}
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 6 }}>
              Format
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {EXPORT_FORMATS.map(format => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 4,
                      border: `1px solid ${selectedFormat === format.id ? COLORS.accent : COLORS.border}`,
                      background: selectedFormat === format.id ? `${COLORS.accent}10` : COLORS.canvas,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <Icon style={{ fontSize: 18, color: selectedFormat === format.id ? COLORS.accent : COLORS.muted }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text }}>{format.label}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>{format.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              width: '100%', padding: '10px 16px',
              border: 'none', borderRadius: 4,
              background: COLORS.accent, color: COLORS.canvas,
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {selectedFormat === 'print' || selectedFormat === 'summary' ? (
              <PrintIcon style={{ fontSize: 18 }} />
            ) : (
              <DownloadIcon style={{ fontSize: 18 }} />
            )}
            {exporting ? 'Exporting...' : (
              selectedFormat === 'print' || selectedFormat === 'summary' ? 'Open Print View' : 'Download'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
