// pages/sitemap.js - Interactive Sitemap with expandable tree
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useAuth } from '../components/AuthContext';

// Full sitemap data structure
const SITEMAP_DATA = {
  id: 'root',
  label: 'Ontographia',
  type: 'root',
  children: [
    {
      id: 'public',
      label: 'Public Pages',
      type: 'category',
      icon: 'public',
      description: 'Accessible without authentication',
      children: [
        { id: 'login', label: 'Login', href: '/login', type: 'page' },
        { id: 'landing', label: 'Landing Page', href: '/', type: 'page' },
      ]
    },
    {
      id: 'auth-required',
      label: 'Authenticated Access',
      type: 'category',
      icon: 'lock',
      description: 'Requires user login',
      children: [
        {
          id: 'domain-context',
          label: 'Domain Context',
          type: 'category',
          description: 'All work happens within a domain',
          children: [
            {
              id: 'navigation',
              label: 'Navigation',
              type: 'section',
              children: [
                {
                  id: 'home',
                  label: 'Home Dashboard',
                  href: '/home',
                  type: 'page',
                  features: [
                    { id: 'recent-items', label: 'Recent Items' },
                    { id: 'quick-actions', label: 'Quick Actions' },
                    { id: 'domain-stats', label: 'Domain Statistics' },
                  ]
                },
                {
                  id: 'projects-overview',
                  label: 'Projects Overview',
                  href: '/navigation/projects-overview',
                  type: 'page',
                  features: [
                    { id: 'project-cards', label: 'Project Cards Grid' },
                    { id: 'create-project', label: 'Create New Project' },
                    { id: 'project-filters', label: 'Filter & Search' },
                  ]
                },
              ]
            },
            {
              id: 'knowledge',
              label: 'Knowledge',
              type: 'section',
              children: [
                {
                  id: 'knowledge-studio',
                  label: 'Knowledge Studio',
                  href: '/knowledge-studio',
                  type: 'page',
                  features: [
                    { id: 'ks-nodes', label: 'Nodes Management' },
                    { id: 'ks-relationships', label: 'Relationships' },
                    { id: 'ks-node-types', label: 'Node Types' },
                    { id: 'ks-rel-types', label: 'Relationship Types' },
                    { id: 'ks-import-export', label: 'Import/Export' },
                  ]
                },
                {
                  id: 'graph-navigator',
                  label: 'Graph Navigator',
                  href: '/graphnavigator',
                  type: 'page',
                  features: [
                    { id: 'gn-visual', label: 'Visual Graph View' },
                    { id: 'gn-zoom', label: 'Zoom & Pan Controls' },
                    { id: 'gn-filter', label: 'Type Filtering' },
                    { id: 'gn-search', label: 'Node Search' },
                    { id: 'gn-details', label: 'Node Details Panel' },
                  ]
                },
              ]
            },
            {
              id: 'workspaces',
              label: 'Workspaces',
              type: 'section',
              children: [
                {
                  id: 'product-design',
                  label: 'Product Design',
                  href: '/product-design-workspace',
                  type: 'page',
                  features: [
                    { id: 'pdw-personas', label: 'Personas' },
                    { id: 'pdw-problems', label: 'Problems' },
                    { id: 'pdw-solutions', label: 'Solutions' },
                    { id: 'pdw-features', label: 'Features' },
                    { id: 'pdw-journeys', label: 'Customer Journeys' },
                    { id: 'pdw-canvas', label: 'Canvas View' },
                    { id: 'pdw-relationships', label: 'Relationship Mapping' },
                  ]
                },
                {
                  id: 'requirements',
                  label: 'Requirements Studio',
                  href: '/requirements-studio',
                  type: 'page',
                  features: [
                    { id: 'req-cards', label: 'Requirement Cards' },
                    { id: 'req-hierarchy', label: 'Hierarchy View' },
                    { id: 'req-traceability', label: 'Traceability Matrix' },
                    { id: 'req-status', label: 'Status Tracking' },
                    { id: 'req-export', label: 'Export to Documents' },
                  ]
                },
                {
                  id: 'enterprise-arch',
                  label: 'Enterprise Architecture',
                  href: '/ea-workspace',
                  type: 'page',
                  features: [
                    {
                      id: 'ea-layers',
                      label: 'ArchiMate Layers',
                      children: [
                        { id: 'ea-business', label: 'Business Layer' },
                        { id: 'ea-application', label: 'Application Layer' },
                        { id: 'ea-technology', label: 'Technology Layer' },
                        { id: 'ea-motivation', label: 'Motivation Layer' },
                        { id: 'ea-strategy', label: 'Strategy Layer' },
                      ]
                    },
                    { id: 'ea-diagrams', label: 'Diagram Editor' },
                    { id: 'ea-viewpoints', label: 'Viewpoints' },
                    { id: 'ea-baselines', label: 'Baselines' },
                    { id: 'ea-standards', label: 'Standards Registry' },
                    { id: 'ea-decisions', label: 'Architecture Decisions' },
                  ]
                },
                {
                  id: 'diagram-workspace',
                  label: 'Diagram Studio',
                  href: '/diagram-workspace',
                  type: 'page',
                  features: [
                    {
                      id: 'ds-packs',
                      label: 'Diagram Packs',
                      children: [
                        { id: 'ds-flowchart', label: 'Flowchart' },
                        { id: 'ds-bpmn', label: 'BPMN Process' },
                        { id: 'ds-uml-class', label: 'UML Class' },
                        { id: 'ds-mindmap', label: 'Mind Map' },
                        { id: 'ds-sticky', label: 'Sticky Notes' },
                        { id: 'ds-context', label: 'Context Diagram' },
                      ]
                    },
                    { id: 'ds-canvas', label: 'Interactive Canvas' },
                    { id: 'ds-properties', label: 'Properties Panel' },
                    { id: 'ds-export', label: 'Export (SVG/PNG)' },
                    { id: 'ds-templates', label: 'Templates' },
                  ]
                },
                {
                  id: 'ba-workspace',
                  label: 'Business Analysis',
                  href: '/ba-workspace',
                  type: 'page',
                  features: [
                    { id: 'ba-guided', label: 'Guided Analysis' },
                    { id: 'ba-stakeholders', label: 'Stakeholder Analysis' },
                    { id: 'ba-processes', label: 'Process Mapping' },
                    { id: 'ba-requirements', label: 'Requirements Elicitation' },
                  ]
                },
                {
                  id: 'change-mgmt',
                  label: 'Change Management',
                  href: '/change-management',
                  type: 'page',
                  features: [
                    { id: 'cm-initiatives', label: 'Change Initiatives' },
                    { id: 'cm-stakeholders', label: 'Stakeholder Impact' },
                    { id: 'cm-communication', label: 'Communication Plans' },
                    { id: 'cm-training', label: 'Training Needs' },
                    { id: 'cm-resistance', label: 'Resistance Analysis' },
                  ]
                },
                {
                  id: 'portfolio-studio',
                  label: 'Portfolio Studio',
                  href: '/portfolio-studio',
                  type: 'page',
                  features: [
                    {
                      id: 'portfolio-overview',
                      label: 'Portfolio Overview',
                      children: [
                        { id: 'pf-dashboard', label: 'Portfolio Dashboard' },
                        { id: 'pf-initiatives', label: 'Initiatives' },
                        { id: 'pf-themes', label: 'Investment Themes' },
                      ]
                    },
                    {
                      id: 'portfolio-prioritization',
                      label: 'Prioritization Tools',
                      children: [
                        { id: 'pf-priority-matrix', label: 'Priority Matrix (Value vs Effort)' },
                        { id: 'pf-stack-rank', label: 'Stack Rank' },
                        { id: 'pf-scoring', label: 'Scoring Panel (WSJF/RICE)' },
                        { id: 'pf-dependency-map', label: 'Dependency Map' },
                      ]
                    },
                    {
                      id: 'portfolio-governance',
                      label: 'Governance',
                      children: [
                        { id: 'pf-committee', label: 'Committee Review & Voting' },
                        { id: 'pf-budget', label: 'Budget Envelopes' },
                        { id: 'pf-timeline', label: 'Decision Timeline' },
                        { id: 'pf-decisions', label: 'Decision Records' },
                      ]
                    },
                    { id: 'pf-export', label: 'Export (SVG/PNG)' },
                  ]
                },
              ]
            },
            {
              id: 'reasoning',
              label: 'Reasoning',
              type: 'section',
              children: [
                {
                  id: 'system-dynamics',
                  label: 'System Dynamics',
                  href: '/system-dynamics',
                  type: 'page',
                  features: [
                    { id: 'sd-cld', label: 'Causal Loop Diagrams' },
                    { id: 'sd-stock-flow', label: 'Stock & Flow Models' },
                    { id: 'sd-variables', label: 'Variable Management' },
                    { id: 'sd-loops', label: 'Feedback Loop Analysis' },
                    { id: 'sd-simulation', label: 'Simulation Preview' },
                  ]
                },
                {
                  id: 'dynamic-work',
                  label: 'Dynamic Work Design',
                  href: '/dynamic-work-design',
                  type: 'page',
                  features: [
                    { id: 'dwd-cases', label: 'Case Types' },
                    { id: 'dwd-activities', label: 'Activities' },
                    { id: 'dwd-roles', label: 'Roles & Responsibilities' },
                    { id: 'dwd-rules', label: 'Business Rules' },
                    { id: 'dwd-milestones', label: 'Milestones' },
                  ]
                },
                {
                  id: 'negotiation',
                  label: 'Negotiation & Persuasion',
                  href: '/negotiation-studio',
                  type: 'page',
                  features: [
                    { id: 'np-situations', label: 'Situation Setup' },
                    { id: 'np-parties', label: 'Party Analysis' },
                    { id: 'np-interests', label: 'Interests & Positions' },
                    { id: 'np-batna', label: 'BATNA Analysis' },
                    { id: 'np-tactics', label: 'Tactics Library' },
                    { id: 'np-journal', label: 'Negotiation Journal' },
                  ]
                },
                {
                  id: 'sensemaking',
                  label: 'Mental Models & Sensemaking',
                  href: '/sensemaking-studio',
                  type: 'page',
                  features: [
                    { id: 'mms-situations', label: 'Situation Framing' },
                    { id: 'mms-models', label: 'Mental Model Mapping' },
                    { id: 'mms-assumptions', label: 'Assumptions' },
                    { id: 'mms-evidence', label: 'Evidence Tracking' },
                    { id: 'mms-frameworks', label: 'Thinking Frameworks' },
                  ]
                },
                {
                  id: 'learning',
                  label: 'Academic Learning',
                  href: '/learning-studio',
                  type: 'page',
                  features: [
                    { id: 'als-courses', label: 'Courses' },
                    { id: 'als-concepts', label: 'Concept Maps' },
                    { id: 'als-notes', label: 'Notes & Annotations' },
                    { id: 'als-questions', label: 'Study Questions' },
                  ]
                },
                {
                  id: 'philosophy',
                  label: 'Philosophy Studio',
                  href: '/philosophy-studio',
                  type: 'page',
                  features: [
                    {
                      id: 'phil-lenses',
                      label: 'Thinking Lenses',
                      children: [
                        { id: 'phil-concept', label: 'Concept Clarification' },
                        { id: 'phil-argument', label: 'Argument Examination' },
                        { id: 'phil-assumptions', label: 'Assumptions Analysis' },
                        { id: 'phil-counter', label: 'Counter-Perspective' },
                        { id: 'phil-ethics', label: 'Ethical Reasoning' },
                        { id: 'phil-limits', label: 'Limit Testing' },
                      ]
                    },
                    {
                      id: 'phil-elements',
                      label: 'Element Types',
                      children: [
                        { id: 'phil-question', label: 'Questions' },
                        { id: 'phil-concept-el', label: 'Concepts' },
                        { id: 'phil-claim', label: 'Claims' },
                        { id: 'phil-argument-el', label: 'Arguments' },
                        { id: 'phil-counter-el', label: 'Counterarguments' },
                        { id: 'phil-implication', label: 'Implications' },
                      ]
                    },
                    { id: 'phil-canvas', label: 'Reasoning Canvas' },
                    { id: 'phil-guidance', label: 'Guidance Panel' },
                    { id: 'phil-reflections', label: 'Reflections' },
                  ]
                },
                {
                  id: 'strategic-reasoning',
                  label: 'Strategic Reasoning Suite',
                  href: '/strategic-reasoning',
                  type: 'page',
                  features: [
                    {
                      id: 'srs-spaces',
                      label: 'Reasoning Spaces',
                      children: [
                        { id: 'srs-questions', label: 'Questions Space' },
                        { id: 'srs-frames', label: 'Frames Space' },
                        { id: 'srs-parallel-states', label: 'Parallel States Space' },
                        { id: 'srs-systems', label: 'Systems Space' },
                        { id: 'srs-perspectives', label: 'Perspectives Space' },
                        { id: 'srs-decisions', label: 'Decisions Space' },
                      ]
                    },
                    {
                      id: 'srs-features',
                      label: 'Core Features',
                      children: [
                        { id: 'srs-sessions', label: 'Reasoning Sessions' },
                        { id: 'srs-connections', label: 'Cross-Space Connections' },
                        { id: 'srs-coaching', label: 'Coaching Panel' },
                        { id: 'srs-snapshots', label: 'Session Snapshots' },
                        { id: 'srs-readiness', label: 'Decision Readiness Scoring' },
                      ]
                    },
                    { id: 'srs-stakeholder-matrix', label: 'Stakeholder Matrix' },
                    { id: 'srs-causal-mapping', label: 'Causal Mapping' },
                    { id: 'srs-scenario-comparison', label: 'Scenario Comparison' },
                  ]
                },
              ]
            },
            {
              id: 'project-context',
              label: 'Project Context',
              type: 'category',
              description: 'Project-scoped features within a domain',
              children: [
                {
                  id: 'project-artefacts',
                  label: 'Project Artefacts',
                  type: 'feature',
                  features: [
                    { id: 'artefact-types', label: 'Artefact Types' },
                    { id: 'artefact-versions', label: 'Version History' },
                    { id: 'artefact-relations', label: 'Cross-References' },
                  ]
                },
                {
                  id: 'project-documents',
                  label: 'Documents',
                  type: 'feature',
                  features: [
                    { id: 'doc-templates', label: 'Document Templates' },
                    { id: 'doc-generation', label: 'Auto-Generation' },
                    { id: 'doc-export', label: 'Export Options' },
                  ]
                },
                {
                  id: 'project-members',
                  label: 'Team Members',
                  type: 'feature',
                  features: [
                    { id: 'member-roles', label: 'Role Assignment' },
                    { id: 'member-permissions', label: 'Permissions' },
                  ]
                },
              ]
            },
          ]
        },
        {
          id: 'admin',
          label: 'Administration',
          type: 'category',
          icon: 'settings',
          description: 'Admin-only features',
          children: [
            {
              id: 'admin-users',
              label: 'User Management',
              href: '/admin/users',
              type: 'page',
              features: [
                { id: 'admin-create-user', label: 'Create Users' },
                { id: 'admin-edit-user', label: 'Edit Users' },
                { id: 'admin-roles', label: 'Role Assignment' },
                { id: 'admin-permissions', label: 'Page Permissions' },
              ]
            },
            {
              id: 'admin-domains',
              label: 'Domain Management',
              href: '/domains',
              type: 'page',
              features: [
                { id: 'domain-create', label: 'Create Domains' },
                { id: 'domain-settings', label: 'Domain Settings' },
                { id: 'domain-access', label: 'Access Control' },
              ]
            },
            {
              id: 'settings',
              label: 'Settings',
              href: '/settings',
              type: 'page',
              features: [
                { id: 'settings-theme', label: 'Theme Settings' },
                { id: 'settings-password', label: 'Change Password' },
              ]
            },
          ]
        },
      ]
    },
    {
      id: 'help-section',
      label: 'Help & Information',
      type: 'category',
      children: [
        { id: 'help', label: 'Help Center', href: '/help', type: 'page' },
        { id: 'sitemap', label: 'Sitemap', href: '/sitemap', type: 'page' },
      ]
    },
  ]
};

// TreeNode component
function TreeNode({ node, level = 0, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded || level < 2);
  const hasChildren = (node.children && node.children.length > 0) || (node.features && node.features.length > 0);

  const getIcon = () => {
    if (node.icon === 'public') return <PublicIcon fontSize="small" />;
    if (node.icon === 'lock') return <LockIcon fontSize="small" />;
    if (node.icon === 'settings') return <SettingsIcon fontSize="small" />;
    if (node.type === 'page') return <DescriptionIcon fontSize="small" />;
    if (node.type === 'section' || node.type === 'category') return <FolderIcon fontSize="small" />;
    if (node.type === 'feature') return <AccountTreeIcon fontSize="small" />;
    return null;
  };

  return (
    <div className="sitemap-node" style={{ marginLeft: level * 20 }}>
      <div className="sitemap-node-header">
        {hasChildren ? (
          <button
            className="sitemap-expand-btn"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </button>
        ) : (
          <span className="sitemap-expand-placeholder" />
        )}

        <span className="sitemap-node-icon">{getIcon()}</span>

        {node.href ? (
          <Link href={node.href} className="sitemap-node-link">
            {node.label}
          </Link>
        ) : (
          <span className="sitemap-node-label">{node.label}</span>
        )}

        {node.type && (
          <span className={`sitemap-node-type sitemap-type-${node.type}`}>
            {node.type}
          </span>
        )}
      </div>

      {node.description && (
        <p className="sitemap-node-desc" style={{ marginLeft: 28 }}>{node.description}</p>
      )}

      {expanded && hasChildren && (
        <div className="sitemap-children">
          {node.children?.map(child => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
          {node.features?.map(feature => (
            <TreeNode key={feature.id} node={{ ...feature, type: 'feature' }} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SitemapPage() {
  const { user } = useAuth();
  const [expandAll, setExpandAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter nodes based on search
  const filterNodes = (node, term) => {
    if (!term) return node;

    const matches = node.label.toLowerCase().includes(term.toLowerCase());
    const childMatches = node.children?.map(c => filterNodes(c, term)).filter(Boolean) || [];
    const featureMatches = node.features?.filter(f =>
      f.label.toLowerCase().includes(term.toLowerCase()) ||
      f.children?.some(c => c.label.toLowerCase().includes(term.toLowerCase()))
    ) || [];

    if (matches || childMatches.length > 0 || featureMatches.length > 0) {
      return {
        ...node,
        children: childMatches.length > 0 ? childMatches : node.children,
        features: featureMatches.length > 0 ? featureMatches : node.features,
      };
    }
    return null;
  };

  const filteredData = searchTerm ? filterNodes(SITEMAP_DATA, searchTerm) : SITEMAP_DATA;

  return (
    <>
      <Head>
        <title>Sitemap | Ontographia</title>
        <meta name="description" content="Complete sitemap and feature overview" />
      </Head>

      <div className="sitemap-page">
        <div className="sitemap-header">
          <h1>Sitemap</h1>
          <p>Complete overview of all pages and features in Ontographia</p>
        </div>

        <div className="sitemap-controls">
          <input
            type="text"
            placeholder="Search pages and features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sitemap-search"
          />
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="sitemap-expand-all-btn"
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        <div className="sitemap-legend">
          <span className="sitemap-legend-item">
            <PublicIcon fontSize="small" /> Public
          </span>
          <span className="sitemap-legend-item">
            <LockIcon fontSize="small" /> Auth Required
          </span>
          <span className="sitemap-legend-item">
            <DescriptionIcon fontSize="small" /> Page
          </span>
          <span className="sitemap-legend-item">
            <AccountTreeIcon fontSize="small" /> Feature
          </span>
        </div>

        <div className="sitemap-tree" key={expandAll ? 'expanded' : 'collapsed'}>
          {filteredData ? (
            <TreeNode node={filteredData} defaultExpanded={expandAll} />
          ) : (
            <p className="sitemap-no-results">No results found for "{searchTerm}"</p>
          )}
        </div>

        <div className="sitemap-architecture">
          <h2>Access Architecture</h2>
          <div className="sitemap-diagram">
            <div className="sitemap-arch-flow">
              <div className="sitemap-arch-box sitemap-arch-auth">
                <strong>Authentication</strong>
                <span>User Login</span>
              </div>
              <div className="sitemap-arch-arrow">→</div>
              <div className="sitemap-arch-box sitemap-arch-domain">
                <strong>Domain Selection</strong>
                <span>Personal / Shared</span>
              </div>
              <div className="sitemap-arch-arrow">→</div>
              <div className="sitemap-arch-box sitemap-arch-context">
                <strong>Work Context</strong>
                <span>Knowledge / Workspace / Reasoning</span>
              </div>
            </div>

            <div className="sitemap-arch-flow sitemap-arch-project">
              <div className="sitemap-arch-spacer" />
              <div className="sitemap-arch-arrow">↓</div>
              <div className="sitemap-arch-box sitemap-arch-project-box">
                <strong>Project Context</strong>
                <span>Optional scoping</span>
              </div>
              <div className="sitemap-arch-arrow">→</div>
              <div className="sitemap-arch-box sitemap-arch-artefacts">
                <strong>Artefacts</strong>
                <span>Documents / Models / Diagrams</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
