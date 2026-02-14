// lib/exportUtils.js
// Export utilities for Requirements Studio
// Supports rich HTML (for Confluence/Word), Jira format, and Markdown

import { ARTEFACT_TYPES, ARTEFACT_STATUS, PRIORITY, ATTACHMENT_TYPES } from '../components/ArtefactContext';

// ============ RICH HTML FORMAT (for Confluence/Word paste) ============

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatFieldValueForHtml(field, value) {
  if (!value) return '<em style="color: #6b7280;">Not specified</em>';

  switch (field.type) {
    case 'textarea':
      return escapeHtml(value).replace(/\n/g, '<br>');
    case 'list':
      if (!Array.isArray(value) || value.length === 0) return '<em>None</em>';
      return '<ul style="margin: 8px 0; padding-left: 24px;">' +
        value.filter(Boolean).map(item => `<li>${escapeHtml(item)}</li>`).join('') +
        '</ul>';
    case 'numberedList':
      if (!Array.isArray(value) || value.length === 0) return '<em>None</em>';
      return '<ol style="margin: 8px 0; padding-left: 24px;">' +
        value.filter(Boolean).map(item => `<li>${escapeHtml(item)}</li>`).join('') +
        '</ol>';
    case 'checklist':
      if (!Array.isArray(value) || value.length === 0) return '<em>None</em>';
      return '<ul style="margin: 8px 0; padding-left: 24px; list-style: none;">' +
        value.map(item =>
          `<li>${item.checked ? '✅' : '☐'} ${escapeHtml(item.text)}</li>`
        ).join('') +
        '</ul>';
    case 'multiselect':
    case 'tags':
      if (!Array.isArray(value) || value.length === 0) return '<em>None</em>';
      return value.map(v =>
        `<span style="display: inline-block; padding: 2px 8px; margin: 2px; background: #e5e7eb; border-radius: 4px; font-size: 12px;">${escapeHtml(v)}</span>`
      ).join(' ');
    case 'userstory':
      return `<blockquote style="margin: 8px 0; padding: 12px 16px; border-left: 4px solid #3b82f6; background: #f8fafc; font-style: italic;">${escapeHtml(value)}</blockquote>`;
    case 'date':
      return new Date(value).toLocaleDateString();
    default:
      return escapeHtml(String(value));
  }
}

export function exportToRichHtml(artefact, options = {}) {
  const { includeChildren = true, children = [], relationships = [], documents = [] } = options;
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const statusDef = ARTEFACT_STATUS[artefact.status];
  const customFields = artefact.customFields || {};

  // Status color mapping
  const statusColors = {
    'Draft': '#94a3b8',
    'InReview': '#f59e0b',
    'Approved': '#22c55e',
    'Rejected': '#ef4444',
    'Deprecated': '#6b7280',
  };

  const priorityColors = {
    'Critical': '#ef4444',
    'High': '#f97316',
    'Medium': '#fbbf24',
    'Low': '#22c55e',
  };

  let html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; color: #1f2937;">
  <h1 style="margin: 0 0 16px; font-size: 28px; color: #111827;">${escapeHtml(artefact.name)}</h1>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
    <tr>
      <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; width: 140px;">Type</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">
        <span style="display: inline-block; padding: 2px 8px; background: ${typeDef?.color || '#6b7280'}; color: white; border-radius: 4px; font-size: 12px;">${typeDef?.name || artefact.artefactType}</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600;">Status</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">
        <span style="display: inline-block; padding: 2px 8px; background: ${statusColors[artefact.status] || '#6b7280'}; color: white; border-radius: 4px; font-size: 12px;">${statusDef?.name || artefact.status}</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600;">Priority</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">
        <span style="display: inline-block; padding: 2px 8px; background: ${priorityColors[artefact.priority] || '#fbbf24'}; color: white; border-radius: 4px; font-size: 12px;">${artefact.priority}</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600;">Created</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${new Date(artefact.createdAt).toLocaleString()}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600;">Last Updated</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${new Date(artefact.updatedAt).toLocaleString()}</td>
    </tr>
  </table>`;

  // Description
  if (artefact.description) {
    html += `
  <h2 style="margin: 24px 0 12px; font-size: 20px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Description</h2>
  <p style="margin: 0 0 16px; line-height: 1.6;">${escapeHtml(artefact.description).replace(/\n/g, '<br>')}</p>`;
  }

  // Custom fields by category
  const fields = typeDef?.fields || {};
  const displayFields = Object.values(fields).filter(f => !['title', 'description'].includes(f.id));

  // Group fields
  const fieldGroups = {
    'Business Context': ['businessValue', 'businessGoal', 'businessOwner', 'requestor', 'capabilityImpacted'],
    'Scope & Stakeholders': ['inScope', 'outOfScope', 'stakeholders'],
    'Assessment': ['urgency', 'impact', 'priority', 'risks', 'impactOfNotDoing', 'alternativeOptions'],
    'User Story': ['userStory', 'acceptanceCriteria', 'definitionOfDone', 'owner'],
  };

  Object.entries(fieldGroups).forEach(([groupName, fieldIds]) => {
    const groupFields = displayFields.filter(f => fieldIds.includes(f.id));
    const hasValues = groupFields.some(f => {
      const value = customFields[f.id] ?? artefact[f.id];
      return value !== undefined && value !== null && value !== '' &&
        !(Array.isArray(value) && value.length === 0);
    });

    if (groupFields.length > 0 && hasValues) {
      html += `
  <h2 style="margin: 24px 0 12px; font-size: 20px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">${groupName}</h2>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">`;

      groupFields.forEach(field => {
        const value = customFields[field.id] ?? artefact[field.id];
        if (value !== undefined && value !== null && value !== '' &&
          !(Array.isArray(value) && value.length === 0)) {
          html += `
    <tr>
      <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; width: 180px; vertical-align: top;">${field.name}</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${formatFieldValueForHtml(field, value)}</td>
    </tr>`;
        }
      });

      html += `
  </table>`;
    }
  });

  // Children
  if (includeChildren && children.length > 0) {
    html += `
  <h2 style="margin: 24px 0 12px; font-size: 20px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Child Items</h2>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
    <tr style="background: #f9fafb;">
      <th style="padding: 10px 12px; border: 1px solid #e5e7eb; text-align: left;">Type</th>
      <th style="padding: 10px 12px; border: 1px solid #e5e7eb; text-align: left;">Name</th>
      <th style="padding: 10px 12px; border: 1px solid #e5e7eb; text-align: left;">Status</th>
      <th style="padding: 10px 12px; border: 1px solid #e5e7eb; text-align: left;">Priority</th>
    </tr>`;

    children.forEach(child => {
      const childType = ARTEFACT_TYPES[child.artefactType];
      const childStatus = ARTEFACT_STATUS[child.status];
      html += `
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">
        <span style="display: inline-block; padding: 2px 6px; background: ${childType?.color || '#6b7280'}; color: white; border-radius: 4px; font-size: 11px;">${childType?.name}</span>
      </td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${escapeHtml(child.name)}</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${childStatus?.name}</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${child.priority}</td>
    </tr>`;
    });

    html += `
  </table>`;
  }

  // Traceability
  const upstreamRels = relationships.filter(r => r.to === artefact.id);
  const downstreamRels = relationships.filter(r => r.from === artefact.id);

  if (upstreamRels.length > 0 || downstreamRels.length > 0) {
    html += `
  <h2 style="margin: 24px 0 12px; font-size: 20px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Traceability</h2>`;

    if (upstreamRels.length > 0) {
      html += `
  <h3 style="margin: 16px 0 8px; font-size: 16px; color: #374151;">Traces From (Upstream)</h3>
  <ul style="margin: 0 0 16px; padding-left: 24px;">`;
      upstreamRels.forEach(rel => {
        html += `<li>${escapeHtml(rel.sourceName || rel.from)} <em style="color: #6b7280;">(${rel.type})</em></li>`;
      });
      html += `</ul>`;
    }

    if (downstreamRels.length > 0) {
      html += `
  <h3 style="margin: 16px 0 8px; font-size: 16px; color: #374151;">Traces To (Downstream)</h3>
  <ul style="margin: 0 0 16px; padding-left: 24px;">`;
      downstreamRels.forEach(rel => {
        html += `<li>${escapeHtml(rel.targetName || rel.to)} <em style="color: #6b7280;">(${rel.type})</em></li>`;
      });
      html += `</ul>`;
    }
  }

  // Footer
  html += `
  <hr style="margin: 32px 0 16px; border: none; border-top: 1px solid #e5e7eb;">
  <p style="margin: 0; font-size: 12px; color: #6b7280;">
    Exported from Requirements Studio on ${new Date().toLocaleString()} | ID: ${artefact.id}
  </p>
</div>`;

  return html;
}

// ============ JIRA TICKET FORMAT ============

export function exportToJiraTicket(artefact, options = {}) {
  const { projectKey = 'PROJECT' } = options;
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const customFields = artefact.customFields || {};

  const issueTypeMap = {
    'Epic': 'Epic',
    'Feature': 'Feature',
    'UserStory': 'Story',
    'Ticket': 'Task',
    'DataChangeSpec': 'Sub-task',
    'FrontendSpec': 'Sub-task',
    'BusinessNeed': 'Epic',
    'BusinessRequirement': 'Feature',
    'StakeholderRequirement': 'Story',
    'SolutionRequirement': 'Sub-task',
  };

  // Build description text
  let description = artefact.description || '';

  if (customFields.userStory) {
    description += `\n\n*User Story:*\n{quote}${customFields.userStory}{quote}`;
  }

  if (customFields.businessValue) {
    description += `\n\n*Business Value:*\n${customFields.businessValue}`;
  }

  if (customFields.acceptanceCriteria?.length > 0) {
    description += `\n\n*Acceptance Criteria:*`;
    customFields.acceptanceCriteria.forEach(ac => {
      description += `\n* ${ac.checked ? '(/)' : '(/)'} ${ac.text}`;
    });
  }

  if (customFields.inScope?.length > 0) {
    description += `\n\n*In Scope:*`;
    customFields.inScope.forEach(item => {
      description += `\n* ${item}`;
    });
  }

  if (customFields.outOfScope?.length > 0) {
    description += `\n\n*Out of Scope:*`;
    customFields.outOfScope.forEach(item => {
      description += `\n* ${item}`;
    });
  }

  return {
    fields: {
      project: { key: projectKey },
      summary: artefact.name,
      issuetype: { name: issueTypeMap[artefact.artefactType] || 'Task' },
      description: description,
      priority: { name: mapPriorityToJira(artefact.priority) },
      labels: artefact.tags || [],
    },
  };
}

function mapPriorityToJira(priority) {
  const map = {
    'Critical': 'Highest',
    'High': 'High',
    'Medium': 'Medium',
    'Low': 'Low',
  };
  return map[priority] || 'Medium';
}

// ============ MARKDOWN EXPORT ============

export function exportToMarkdown(artefact, options = {}) {
  const { includeChildren = true, children = [], relationships = [], documents = [] } = options;
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const statusDef = ARTEFACT_STATUS[artefact.status];
  const customFields = artefact.customFields || {};

  let md = '';

  md += `# ${artefact.name}\n\n`;

  md += `| Property | Value |\n`;
  md += `|----------|-------|\n`;
  md += `| Type | ${typeDef?.name || artefact.artefactType} |\n`;
  md += `| Status | ${statusDef?.name || artefact.status} |\n`;
  md += `| Priority | ${artefact.priority} |\n`;
  md += `| Created | ${new Date(artefact.createdAt).toLocaleString()} |\n`;
  md += `| Updated | ${new Date(artefact.updatedAt).toLocaleString()} |\n\n`;

  if (artefact.description) {
    md += `## Description\n\n${artefact.description}\n\n`;
  }

  // Custom fields
  const fields = typeDef?.fields || {};
  const displayFields = Object.values(fields).filter(f => !['title', 'description'].includes(f.id));

  if (displayFields.length > 0) {
    md += `## Details\n\n`;

    displayFields.forEach(field => {
      const value = customFields[field.id] ?? artefact[field.id];
      if (value !== undefined && value !== null && value !== '' &&
        !(Array.isArray(value) && value.length === 0)) {
        md += `### ${field.name}\n\n`;
        md += formatFieldValueForMarkdown(field, value);
        md += `\n\n`;
      }
    });
  }

  if (includeChildren && children.length > 0) {
    md += `## Child Items\n\n`;
    children.forEach(child => {
      const childType = ARTEFACT_TYPES[child.artefactType];
      md += `- **${childType?.name}**: ${child.name} (${child.status})\n`;
    });
    md += `\n`;
  }

  return md;
}

function formatFieldValueForMarkdown(field, value) {
  if (!value) return '_Not specified_';

  switch (field.type) {
    case 'textarea':
      return value;
    case 'list':
      if (!Array.isArray(value) || value.length === 0) return '_None_';
      return value.filter(Boolean).map(item => `- ${item}`).join('\n');
    case 'numberedList':
      if (!Array.isArray(value) || value.length === 0) return '_None_';
      return value.filter(Boolean).map((item, i) => `${i + 1}. ${item}`).join('\n');
    case 'checklist':
      if (!Array.isArray(value) || value.length === 0) return '_None_';
      return value.map(item => `- [${item.checked ? 'x' : ' '}] ${item.text}`).join('\n');
    case 'multiselect':
    case 'tags':
      if (!Array.isArray(value) || value.length === 0) return '_None_';
      return value.join(', ');
    case 'userstory':
      return `> ${value}`;
    default:
      return String(value);
  }
}

// ============ BULK EXPORT ============

export function exportProjectToRichHtml(artefacts, relationships, documents, options = {}) {
  const { projectName = 'Project Export' } = options;

  let html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; color: #1f2937;">
  <h1 style="margin: 0 0 8px; font-size: 32px; color: #111827;">${escapeHtml(projectName)}</h1>
  <p style="margin: 0 0 32px; color: #6b7280;">Exported on ${new Date().toLocaleString()}</p>
  <hr style="border: none; border-top: 2px solid #e5e7eb; margin-bottom: 32px;">`;

  // Group by level
  const levels = {
    'EA': { name: 'Enterprise Architecture', items: [] },
    'L1': { name: 'Portfolio Level (Epics)', items: [] },
    'L2': { name: 'Feature Level', items: [] },
    'L3': { name: 'Story Level', items: [] },
    'L4': { name: 'Ticket Level', items: [] },
  };

  artefacts.forEach(a => {
    const level = ARTEFACT_TYPES[a.artefactType]?.level;
    if (level && levels[level]) {
      levels[level].items.push(a);
    }
  });

  Object.entries(levels).forEach(([level, { name, items }]) => {
    if (items.length === 0) return;

    html += `<h2 style="margin: 32px 0 16px; font-size: 24px; color: #111827; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">${name}</h2>`;

    items.forEach(artefact => {
      const children = artefacts.filter(a =>
        relationships.some(r => r.from === artefact.id && r.to === a.id)
      );
      const artefactDocs = documents.filter(d => d.artefactId === artefact.id);

      html += exportToRichHtml(artefact, {
        includeChildren: true,
        children,
        relationships,
        documents: artefactDocs,
      });
      html += `<hr style="margin: 32px 0; border: none; border-top: 1px dashed #e5e7eb;">`;
    });
  });

  html += `</div>`;

  return html;
}

export function exportProjectToJiraCSV(artefacts, options = {}) {
  const headers = [
    'Summary',
    'Issue Type',
    'Description',
    'Priority',
    'Labels',
  ];

  const rows = [headers.join(',')];

  artefacts.forEach(artefact => {
    const issueTypeMap = {
      'Epic': 'Epic',
      'Feature': 'Feature',
      'UserStory': 'Story',
      'Ticket': 'Task',
    };

    const row = [
      `"${escapeCSV(artefact.name)}"`,
      issueTypeMap[artefact.artefactType] || 'Task',
      `"${escapeCSV(artefact.description || '')}"`,
      mapPriorityToJira(artefact.priority),
      `"${(artefact.tags || []).join(' ')}"`,
    ];

    rows.push(row.join(','));
  });

  return rows.join('\n');
}

function escapeCSV(text) {
  if (!text) return '';
  return text.replace(/"/g, '""').replace(/\n/g, ' ');
}

// Keeping old function name for backwards compatibility
export function exportToConfluence(artefact, options = {}) {
  return exportToRichHtml(artefact, options);
}
