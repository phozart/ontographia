// components/ba/ReportGenerator.js
// BABOK-Compliant Report Generator
// Generate Requirements Specification, Traceability Matrix, Stakeholder Analysis reports

import { useState, useMemo } from 'react';
import { useArtefacts, ARTEFACT_TYPES, ARTEFACT_STATUS } from '../ArtefactContext';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import GroupsIcon from '@mui/icons-material/Groups';
import LinkIcon from '@mui/icons-material/Link';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import PreviewIcon from '@mui/icons-material/Preview';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// ============ REPORT TEMPLATES ============
const REPORT_TEMPLATES = {
  requirements: {
    id: 'requirements',
    name: 'Requirements Specification',
    description: 'Complete requirements document including business, stakeholder, and solution requirements',
    icon: <DescriptionIcon />,
    color: '#dc2626',
    sections: [
      { id: 'executive-summary', name: 'Executive Summary', included: true },
      { id: 'business-requirements', name: 'Business Requirements', included: true },
      { id: 'stakeholder-requirements', name: 'Stakeholder Requirements', included: true },
      { id: 'solution-requirements', name: 'Solution Requirements', included: true },
      { id: 'business-rules', name: 'Business Rules', included: true },
      { id: 'data-dictionary', name: 'Data Dictionary', included: false },
      { id: 'glossary', name: 'Glossary', included: false },
    ]
  },
  traceability: {
    id: 'traceability',
    name: 'Traceability Matrix',
    description: 'Complete traceability from business needs to implementation',
    icon: <LinkIcon />,
    color: '#059669',
    sections: [
      { id: 'trace-summary', name: 'Traceability Summary', included: true },
      { id: 'br-to-sr', name: 'BR to SR Mapping', included: true },
      { id: 'sr-to-solr', name: 'SR to SolR Mapping', included: true },
      { id: 'solr-to-stories', name: 'SolR to Stories Mapping', included: true },
      { id: 'coverage-analysis', name: 'Coverage Analysis', included: true },
      { id: 'gap-analysis', name: 'Gap Analysis', included: false },
    ]
  },
  stakeholder: {
    id: 'stakeholder',
    name: 'Stakeholder Analysis',
    description: 'Stakeholder register, power/interest analysis, and RACI matrix',
    icon: <GroupsIcon />,
    color: '#06b6d4',
    sections: [
      { id: 'stakeholder-register', name: 'Stakeholder Register', included: true },
      { id: 'power-interest', name: 'Power/Interest Grid', included: true },
      { id: 'raci-matrix', name: 'RACI Matrix', included: true },
      { id: 'communication-plan', name: 'Communication Plan', included: false },
      { id: 'engagement-history', name: 'Engagement History', included: false },
    ]
  },
  impact: {
    id: 'impact',
    name: 'Impact Analysis',
    description: 'Change impact assessment and dependency analysis',
    icon: <AssessmentIcon />,
    color: '#f59e0b',
    sections: [
      { id: 'change-summary', name: 'Change Summary', included: true },
      { id: 'affected-items', name: 'Affected Items', included: true },
      { id: 'dependency-graph', name: 'Dependency Analysis', included: true },
      { id: 'risk-assessment', name: 'Risk Assessment', included: false },
      { id: 'recommendations', name: 'Recommendations', included: false },
    ]
  },
  status: {
    id: 'status',
    name: 'Status Report',
    description: 'Project status, metrics, and progress overview',
    icon: <TableChartIcon />,
    color: '#8b5cf6',
    sections: [
      { id: 'project-summary', name: 'Project Summary', included: true },
      { id: 'requirements-status', name: 'Requirements Status', included: true },
      { id: 'delivery-progress', name: 'Delivery Progress', included: true },
      { id: 'issues-risks', name: 'Issues & Risks', included: true },
      { id: 'upcoming-milestones', name: 'Upcoming Milestones', included: false },
    ]
  }
};

const EXPORT_FORMATS = [
  { id: 'html', name: 'HTML', icon: <CodeIcon />, extension: '.html' },
  { id: 'markdown', name: 'Markdown', icon: <ArticleIcon />, extension: '.md' },
  { id: 'csv', name: 'CSV (Data)', icon: <TableChartIcon />, extension: '.csv' },
];

// ============ REPORT TEMPLATE CARD ============
function ReportTemplateCard({ template, selected, onSelect }) {
  return (
    <div
      className={`report-template-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="template-icon" style={{ backgroundColor: `${template.color}20`, color: template.color }}>
        {template.icon}
      </div>
      <div className="template-info">
        <h4>{template.name}</h4>
        <p>{template.description}</p>
      </div>
      {selected && (
        <div className="template-check">
          <CheckCircleIcon style={{ color: template.color }} />
        </div>
      )}
    </div>
  );
}

// ============ SECTION SELECTOR ============
function SectionSelector({ sections, onChange }) {
  const toggleSection = (sectionId) => {
    const updated = sections.map(s =>
      s.id === sectionId ? { ...s, included: !s.included } : s
    );
    onChange(updated);
  };

  return (
    <div className="section-selector">
      <h4>Report Sections</h4>
      <div className="sections-list">
        {sections.map(section => (
          <label key={section.id} className="section-item">
            <input
              type="checkbox"
              checked={section.included}
              onChange={() => toggleSection(section.id)}
            />
            <span>{section.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ============ REPORT PREVIEW ============
function ReportPreview({ template, sections, artefacts, relationships, onClose }) {
  const generateReportContent = () => {
    let content = [];

    content.push(`# ${template.name}\n`);
    content.push(`Generated: ${new Date().toLocaleDateString()}\n\n`);

    sections.filter(s => s.included).forEach(section => {
      content.push(`## ${section.name}\n\n`);

      switch (section.id) {
        case 'executive-summary':
        case 'project-summary':
        case 'trace-summary':
          content.push(generateSummary(artefacts));
          break;
        case 'business-requirements':
          content.push(generateRequirementsList(artefacts, 'BusinessRequirement'));
          break;
        case 'stakeholder-requirements':
          content.push(generateRequirementsList(artefacts, 'StakeholderRequirement'));
          break;
        case 'solution-requirements':
          content.push(generateRequirementsList(artefacts, 'SolutionRequirement'));
          break;
        case 'business-rules':
          content.push(generateRequirementsList(artefacts, 'BusinessRule'));
          break;
        case 'stakeholder-register':
          content.push(generateStakeholderList(artefacts));
          break;
        case 'requirements-status':
          content.push(generateStatusTable(artefacts));
          break;
        case 'coverage-analysis':
          content.push(generateCoverageAnalysis(artefacts, relationships));
          break;
        default:
          content.push('*Section content will be generated based on project data.*\n\n');
      }
    });

    return content.join('');
  };

  const generateSummary = (artefacts) => {
    const byType = {};
    const byStatus = {};

    artefacts.forEach(a => {
      byType[a.artefactType] = (byType[a.artefactType] || 0) + 1;
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    });

    let summary = `**Total Artefacts:** ${artefacts.length}\n\n`;
    summary += '### By Type\n';
    Object.entries(byType).forEach(([type, count]) => {
      const typeDef = ARTEFACT_TYPES[type];
      summary += `- ${typeDef?.label || type}: ${count}\n`;
    });
    summary += '\n### By Status\n';
    Object.entries(byStatus).forEach(([status, count]) => {
      summary += `- ${status}: ${count}\n`;
    });
    summary += '\n';
    return summary;
  };

  const generateRequirementsList = (artefacts, type) => {
    const items = artefacts.filter(a => a.artefactType === type);
    if (items.length === 0) return '*No items found.*\n\n';

    let content = '';
    items.forEach(item => {
      content += `### ${item.referenceId || item.id} - ${item.name}\n\n`;
      content += `**Status:** ${item.status}  \n`;
      if (item.priority) content += `**Priority:** ${item.priority}  \n`;
      content += '\n';
      if (item.description) {
        content += `${item.description}\n\n`;
      }
      if (item.acceptanceCriteria && item.acceptanceCriteria.length > 0) {
        content += '**Acceptance Criteria:**\n';
        item.acceptanceCriteria.forEach(ac => {
          content += `- ${ac}\n`;
        });
        content += '\n';
      }
      content += '---\n\n';
    });
    return content;
  };

  const generateStakeholderList = (artefacts) => {
    const stakeholders = artefacts.filter(a => a.artefactType === 'Stakeholder');
    if (stakeholders.length === 0) return '*No stakeholders defined.*\n\n';

    let content = '| Name | Role | Interest | Influence |\n';
    content += '|------|------|----------|----------|\n';
    stakeholders.forEach(s => {
      content += `| ${s.name} | ${s.role || '-'} | ${s.interest || '-'} | ${s.influence || '-'} |\n`;
    });
    content += '\n';
    return content;
  };

  const generateStatusTable = (artefacts) => {
    let content = '| Type | Draft | In Progress | In Review | Approved | Done |\n';
    content += '|------|-------|-------------|-----------|----------|------|\n';

    const types = ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement', 'Epic', 'Feature', 'Story'];
    types.forEach(type => {
      const items = artefacts.filter(a => a.artefactType === type);
      const typeDef = ARTEFACT_TYPES[type];
      content += `| ${typeDef?.label || type} `;
      ['Draft', 'InProgress', 'InReview', 'Approved', 'Done'].forEach(status => {
        const count = items.filter(i => i.status === status).length;
        content += `| ${count} `;
      });
      content += '|\n';
    });
    content += '\n';
    return content;
  };

  const generateCoverageAnalysis = (artefacts, relationships) => {
    const brs = artefacts.filter(a => a.artefactType === 'BusinessRequirement');
    const covered = brs.filter(br =>
      relationships.some(r => r.sourceId === br.id || r.targetId === br.id)
    );

    let content = `**Business Requirements Coverage:** ${covered.length}/${brs.length} (${Math.round((covered.length / brs.length) * 100) || 0}%)\n\n`;

    if (brs.length > 0) {
      content += '| Requirement | Status | Coverage |\n';
      content += '|-------------|--------|----------|\n';
      brs.forEach(br => {
        const isCovered = relationships.some(r => r.sourceId === br.id || r.targetId === br.id);
        content += `| ${br.referenceId || br.id} - ${br.name} | ${br.status} | ${isCovered ? '✓ Covered' : '✗ Not Covered'} |\n`;
      });
      content += '\n';
    }

    return content;
  };

  const reportContent = generateReportContent();

  return (
    <div className="report-preview-modal">
      <div className="preview-header">
        <h3>
          <PreviewIcon />
          Report Preview
        </h3>
        <button className="btn-icon" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className="preview-content">
        <pre className="report-markdown">{reportContent}</pre>
      </div>
      <div className="preview-footer">
        <button className="btn-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ============ REPORT GENERATOR ============
export default function ReportGenerator({ projectId }) {
  const { artefacts, relationships } = useArtefacts();
  const [selectedTemplate, setSelectedTemplate] = useState('requirements');
  const [sections, setSections] = useState(REPORT_TEMPLATES.requirements.sections);
  const [exportFormat, setExportFormat] = useState('html');
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Filter artefacts by project
  const projectArtefacts = useMemo(() => {
    return artefacts.filter(a => a.projectId === projectId);
  }, [artefacts, projectId]);

  const projectRelationships = useMemo(() => {
    return relationships.filter(r =>
      projectArtefacts.some(a => a.id === r.sourceId || a.id === r.targetId)
    );
  }, [relationships, projectArtefacts]);

  const currentTemplate = REPORT_TEMPLATES[selectedTemplate];

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setSections(REPORT_TEMPLATES[templateId].sections);
  };

  const generateReport = () => {
    setGenerating(true);

    // Generate report content based on template and sections
    let content = '';
    const template = REPORT_TEMPLATES[selectedTemplate];

    if (exportFormat === 'html') {
      content = generateHTMLReport(template, sections, projectArtefacts, projectRelationships);
    } else if (exportFormat === 'markdown') {
      content = generateMarkdownReport(template, sections, projectArtefacts, projectRelationships);
    } else if (exportFormat === 'csv') {
      content = generateCSVReport(template, projectArtefacts, projectRelationships);
    }

    // Download the file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}${EXPORT_FORMATS.find(f => f.id === exportFormat)?.extension || '.txt'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setGenerating(false);
  };

  const generateHTMLReport = (template, sections, artefacts, relationships) => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; color: #1f2937; }
    h1 { color: ${template.color}; border-bottom: 3px solid ${template.color}; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    h3 { color: #4b5563; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    tr:hover { background: #f9fafb; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .badge-draft { background: #f1f5f9; color: #475569; }
    .badge-inprogress { background: #dbeafe; color: #1d4ed8; }
    .badge-approved { background: #dcfce7; color: #166534; }
    .badge-done { background: #d1fae5; color: #059669; }
    .summary-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .stat { display: inline-block; margin-right: 30px; }
    .stat-value { font-size: 24px; font-weight: 700; color: ${template.color}; }
    .stat-label { font-size: 12px; color: #6b7280; }
    .requirement-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 12px 0; }
    .requirement-card h4 { margin: 0 0 8px; color: #1f2937; }
    .requirement-meta { font-size: 13px; color: #6b7280; margin-bottom: 8px; }
    .acceptance-criteria { background: #f9fafb; padding: 12px; border-radius: 4px; margin-top: 12px; }
    .acceptance-criteria h5 { margin: 0 0 8px; font-size: 12px; color: #6b7280; }
    .acceptance-criteria ul { margin: 0; padding-left: 20px; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <h1>${template.name}</h1>
  <p style="color: #6b7280;">Generated: ${new Date().toLocaleDateString()} | Project Report</p>
`;

    sections.filter(s => s.included).forEach(section => {
      html += `<h2>${section.name}</h2>\n`;

      switch (section.id) {
        case 'executive-summary':
        case 'project-summary':
        case 'trace-summary':
          html += generateHTMLSummary(artefacts, template);
          break;
        case 'business-requirements':
          html += generateHTMLRequirements(artefacts, 'BusinessRequirement');
          break;
        case 'stakeholder-requirements':
          html += generateHTMLRequirements(artefacts, 'StakeholderRequirement');
          break;
        case 'solution-requirements':
          html += generateHTMLRequirements(artefacts, 'SolutionRequirement');
          break;
        case 'business-rules':
          html += generateHTMLRequirements(artefacts, 'BusinessRule');
          break;
        case 'stakeholder-register':
          html += generateHTMLStakeholders(artefacts);
          break;
        case 'requirements-status':
          html += generateHTMLStatusTable(artefacts);
          break;
        case 'coverage-analysis':
          html += generateHTMLCoverage(artefacts, relationships);
          break;
        default:
          html += '<p><em>Section content based on project data.</em></p>\n';
      }
    });

    html += `
  <div class="footer">
    <p>Generated by BA Workspace | ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;

    return html;
  };

  const generateHTMLSummary = (artefacts, template) => {
    const byStatus = {};
    artefacts.forEach(a => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    });

    let html = `
  <div class="summary-box">
    <div class="stat">
      <div class="stat-value">${artefacts.length}</div>
      <div class="stat-label">Total Artefacts</div>
    </div>
    <div class="stat">
      <div class="stat-value">${byStatus.Done || 0}</div>
      <div class="stat-label">Completed</div>
    </div>
    <div class="stat">
      <div class="stat-value">${byStatus.InProgress || 0}</div>
      <div class="stat-label">In Progress</div>
    </div>
    <div class="stat">
      <div class="stat-value">${Math.round(((byStatus.Done || 0) / artefacts.length) * 100) || 0}%</div>
      <div class="stat-label">Completion Rate</div>
    </div>
  </div>`;
    return html;
  };

  const generateHTMLRequirements = (artefacts, type) => {
    const items = artefacts.filter(a => a.artefactType === type);
    if (items.length === 0) return '<p><em>No items found.</em></p>\n';

    let html = '';
    items.forEach(item => {
      html += `
  <div class="requirement-card">
    <h4>${item.referenceId || item.id} - ${item.name}</h4>
    <div class="requirement-meta">
      <span class="badge badge-${item.status.toLowerCase()}">${item.status}</span>
      ${item.priority ? `<span style="margin-left: 8px;">Priority: ${item.priority}</span>` : ''}
    </div>
    ${item.description ? `<p>${item.description}</p>` : ''}
    ${item.acceptanceCriteria && item.acceptanceCriteria.length > 0 ? `
    <div class="acceptance-criteria">
      <h5>Acceptance Criteria</h5>
      <ul>
        ${item.acceptanceCriteria.map(ac => `<li>${typeof ac === 'object' ? (ac.text || JSON.stringify(ac)) : ac}</li>`).join('')}
      </ul>
    </div>` : ''}
  </div>`;
    });
    return html;
  };

  const generateHTMLStakeholders = (artefacts) => {
    const stakeholders = artefacts.filter(a => a.artefactType === 'Stakeholder');
    if (stakeholders.length === 0) return '<p><em>No stakeholders defined.</em></p>\n';

    let html = `
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Role</th>
        <th>Interest</th>
        <th>Influence</th>
      </tr>
    </thead>
    <tbody>`;
    stakeholders.forEach(s => {
      html += `
      <tr>
        <td>${s.name}</td>
        <td>${s.role || '-'}</td>
        <td>${s.interest || '-'}</td>
        <td>${s.influence || '-'}</td>
      </tr>`;
    });
    html += `
    </tbody>
  </table>`;
    return html;
  };

  const generateHTMLStatusTable = (artefacts) => {
    let html = `
  <table>
    <thead>
      <tr>
        <th>Type</th>
        <th>Draft</th>
        <th>In Progress</th>
        <th>In Review</th>
        <th>Approved</th>
        <th>Done</th>
      </tr>
    </thead>
    <tbody>`;

    const types = ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement', 'Epic', 'Feature', 'Story'];
    types.forEach(type => {
      const items = artefacts.filter(a => a.artefactType === type);
      const typeDef = ARTEFACT_TYPES[type];
      html += `<tr><td>${typeDef?.label || type}</td>`;
      ['Draft', 'InProgress', 'InReview', 'Approved', 'Done'].forEach(status => {
        const count = items.filter(i => i.status === status).length;
        html += `<td>${count}</td>`;
      });
      html += '</tr>';
    });

    html += `
    </tbody>
  </table>`;
    return html;
  };

  const generateHTMLCoverage = (artefacts, relationships) => {
    const brs = artefacts.filter(a => a.artefactType === 'BusinessRequirement');
    const covered = brs.filter(br =>
      relationships.some(r => r.sourceId === br.id || r.targetId === br.id)
    );

    let html = `
  <div class="summary-box">
    <div class="stat">
      <div class="stat-value">${covered.length}/${brs.length}</div>
      <div class="stat-label">BR Coverage</div>
    </div>
    <div class="stat">
      <div class="stat-value">${Math.round((covered.length / brs.length) * 100) || 0}%</div>
      <div class="stat-label">Coverage Rate</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Requirement</th>
        <th>Status</th>
        <th>Coverage</th>
      </tr>
    </thead>
    <tbody>`;

    brs.forEach(br => {
      const isCovered = relationships.some(r => r.sourceId === br.id || r.targetId === br.id);
      html += `
      <tr>
        <td>${br.referenceId || br.id} - ${br.name}</td>
        <td><span class="badge badge-${br.status.toLowerCase()}">${br.status}</span></td>
        <td style="color: ${isCovered ? '#059669' : '#dc2626'}">${isCovered ? '✓ Covered' : '✗ Not Covered'}</td>
      </tr>`;
    });

    html += `
    </tbody>
  </table>`;
    return html;
  };

  const generateMarkdownReport = (template, sections, artefacts, relationships) => {
    let md = `# ${template.name}\n\n`;
    md += `**Generated:** ${new Date().toLocaleDateString()}\n\n---\n\n`;

    sections.filter(s => s.included).forEach(section => {
      md += `## ${section.name}\n\n`;

      const items = artefacts.filter(a => {
        if (section.id === 'business-requirements') return a.artefactType === 'BusinessRequirement';
        if (section.id === 'stakeholder-requirements') return a.artefactType === 'StakeholderRequirement';
        if (section.id === 'solution-requirements') return a.artefactType === 'SolutionRequirement';
        return false;
      });

      if (items.length > 0) {
        items.forEach(item => {
          md += `### ${item.referenceId || item.id} - ${item.name}\n\n`;
          md += `**Status:** ${item.status}\n\n`;
          if (item.description) md += `${item.description}\n\n`;
          md += '---\n\n';
        });
      } else {
        md += '*Content based on project data.*\n\n';
      }
    });

    return md;
  };

  const generateCSVReport = (template, artefacts, relationships) => {
    let csv = 'ID,Reference ID,Name,Type,Status,Priority,Description\n';

    artefacts.forEach(a => {
      csv += `"${a.id}","${a.referenceId || ''}","${a.name.replace(/"/g, '""')}","${a.artefactType}","${a.status}","${a.priority || ''}","${(a.description || '').replace(/"/g, '""')}"\n`;
    });

    return csv;
  };

  return (
    <div className="report-generator-view">
      {/* Header */}
      <div className="report-header">
        <div className="header-title">
          <DescriptionIcon />
          <div>
            <h2>Report Generator</h2>
            <span className="subtitle">Generate BABOK-compliant documentation</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="report-content">
        {/* Template Selection */}
        <section className="report-section">
          <h3>Select Report Template</h3>
          <div className="templates-grid">
            {Object.values(REPORT_TEMPLATES).map(template => (
              <ReportTemplateCard
                key={template.id}
                template={template}
                selected={selectedTemplate === template.id}
                onSelect={() => handleTemplateSelect(template.id)}
              />
            ))}
          </div>
        </section>

        {/* Configuration */}
        <div className="config-row">
          {/* Sections */}
          <section className="report-section config-section">
            <SectionSelector
              sections={sections}
              onChange={setSections}
            />
          </section>

          {/* Export Options */}
          <section className="report-section config-section">
            <h4>Export Format</h4>
            <div className="format-options">
              {EXPORT_FORMATS.map(format => (
                <button
                  key={format.id}
                  className={`format-btn ${exportFormat === format.id ? 'selected' : ''}`}
                  onClick={() => setExportFormat(format.id)}
                >
                  {format.icon}
                  <span>{format.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="report-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowPreview(true)}
          >
            <PreviewIcon fontSize="small" />
            Preview
          </button>
          <button
            className="btn-primary"
            onClick={generateReport}
            disabled={generating}
          >
            <DownloadIcon fontSize="small" />
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {/* Info */}
        <div className="report-info">
          <p>
            <strong>Selected:</strong> {currentTemplate.name} |{' '}
            <strong>Sections:</strong> {sections.filter(s => s.included).length} of {sections.length} |{' '}
            <strong>Format:</strong> {EXPORT_FORMATS.find(f => f.id === exportFormat)?.name} |{' '}
            <strong>Items:</strong> {projectArtefacts.length} artefacts
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div onClick={e => e.stopPropagation()}>
            <ReportPreview
              template={currentTemplate}
              sections={sections}
              artefacts={projectArtefacts}
              relationships={projectRelationships}
              onClose={() => setShowPreview(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
