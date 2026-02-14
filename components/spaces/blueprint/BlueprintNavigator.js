// components/spaces/blueprint/BlueprintNavigator.js
// Blueprint Studio navigator - Left sidebar navigation
// Restructured into Discovery → Decision flow with clear sections

import { useMemo } from 'react';
import { useBlueprint, BPS_STAGE_INFO } from './BlueprintContext';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExploreIcon from '@mui/icons-material/Explore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import StorefrontIcon from '@mui/icons-material/Storefront';
import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import HubIcon from '@mui/icons-material/Hub';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GavelIcon from '@mui/icons-material/Gavel';
import BuildIcon from '@mui/icons-material/Build';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import GridViewIcon from '@mui/icons-material/GridView';
import ScoreIcon from '@mui/icons-material/Score';
import LockIcon from '@mui/icons-material/Lock';
import SchoolIcon from '@mui/icons-material/School';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// View information for breadcrumbs and titles
// section: maps to horizontal tab (overview, ideation, market, decision, governance, tools)
// requiresInitiative: true means the view needs an initiative to be selected
export const VIEW_INFO = {
  // Form views (create/edit initiative)
  new: { name: 'New Initiative', group: null, section: 'overview', requiresInitiative: false },
  edit: { name: 'Edit Initiative', group: null, section: 'overview', requiresInitiative: false },
  // Overview tab (portfolio level - no initiative required)
  overview: { name: 'Initiatives', group: null, section: 'overview', requiresInitiative: false },
  initiatives: { name: 'Initiatives', group: 'Overview', section: 'overview', requiresInitiative: false },
  dashboard: { name: 'Dashboard', group: 'Overview', section: 'overview', requiresInitiative: false },
  // Ideation tab - Product Ideas (discovery stages only)
  pipeline: { name: 'Pipeline View', group: 'Ideation', section: 'ideation', requiresInitiative: false },
  health: { name: 'Funnel Health', group: 'Ideation', section: 'ideation', requiresInitiative: false },
  // Discovery is now a single consolidated view (idea + explore + assess)
  discovery: { name: 'Discovery', group: 'Discovery', section: 'ideation', requiresInitiative: true },
  idea: { name: 'Discovery', group: 'Discovery', section: 'ideation', requiresInitiative: true },
  explore: { name: 'Discovery', group: 'Discovery', section: 'ideation', requiresInitiative: true },
  assess: { name: 'Discovery', group: 'Discovery', section: 'ideation', requiresInitiative: true },
  // Market tab (market analysis - initiative-scoped)
  market: { name: 'Market Overview', group: 'Market', section: 'market', requiresInitiative: true },
  tamsam: { name: 'TAM/SAM/SOM', group: 'Market', section: 'market', requiresInitiative: true },
  competitors: { name: 'Competitors', group: 'Market', section: 'market', requiresInitiative: true },
  pestle: { name: 'PESTLE Analysis', group: 'Market', section: 'market', requiresInitiative: true },
  segments: { name: 'Customer Segments', group: 'Market', section: 'market', requiresInitiative: true },
  porters: { name: "Porter's Five Forces", group: 'Market', section: 'market', requiresInitiative: true },
  // Decision tab (Business Case & Approval - Initiative level, synthesizes all product ideas)
  case: { name: 'Business Case', group: 'Decision', section: 'decision', requiresInitiative: true },
  approval: { name: 'Approval', group: 'Decision', section: 'decision', requiresInitiative: true },
  summary: { name: 'Summary', group: 'Decision', section: 'decision', requiresInitiative: true },
  // Governance tab (oversight & tracking)
  gates: { name: 'Stage Gates', group: 'Governance', section: 'governance', requiresInitiative: true },
  sla: { name: 'SLA Tracker', group: 'Governance', section: 'governance', requiresInitiative: false },
  risk: { name: 'At Risk', group: 'Governance', section: 'governance', requiresInitiative: false },
  plr: { name: 'Post-Launch Review', group: 'Governance', section: 'governance', requiresInitiative: true },
  killed: { name: 'Killed Ideas', group: 'Governance', section: 'governance', requiresInitiative: false },
  accounting: { name: 'Innovation Accounting', group: 'Governance', section: 'governance', requiresInitiative: false },
  funnel: { name: 'Funnel Analytics', group: 'Governance', section: 'governance', requiresInitiative: false },
  reviewers: { name: 'Reviewer Assignment', group: 'Governance', section: 'governance', requiresInitiative: true },
  // Tools tab (analysis & planning tools)
  tools: { name: 'Tools Library', group: 'Tools', section: 'tools', requiresInitiative: false },
  'value-prop': { name: 'Value Proposition Canvas', group: 'Tools', section: 'tools', requiresInitiative: true },
  lean: { name: 'Lean Canvas', group: 'Tools', section: 'tools', requiresInitiative: true },
  assumptions: { name: 'Assumption Mapping', group: 'Tools', section: 'tools', requiresInitiative: true },
  swot: { name: 'SWOT Analysis', group: 'Tools', section: 'tools', requiresInitiative: true },
  rice: { name: 'RICE Scoring', group: 'Tools', section: 'tools', requiresInitiative: false },
  'ai-design': { name: 'AI Design Wizard', group: 'Tools', section: 'tools', requiresInitiative: false },
};

// Navigation structure - matches horizontal tabs
// Each section shows ONLY when that tab is active
const NAV_STRUCTURE = {
  // Overview tab - Portfolio-level views (no initiative required)
  overview: {
    id: 'overview',
    label: 'Overview',
    description: 'Portfolio-level views',
    requiresInitiative: false,
    items: [
      { id: 'overview', label: 'Initiatives', icon: ViewKanbanIcon, countKey: 'total', description: 'Browse all initiatives' },
      { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, description: 'Portfolio metrics & KPIs' },
    ],
  },
  // Ideation tab - Product Ideas discovery stages (initiative-scoped)
  ideation: {
    id: 'ideation',
    label: 'Ideation',
    description: 'Product ideas discovery',
    requiresInitiative: true,
    items: [
      { id: 'pipeline', label: 'Pipeline', icon: TimelineIcon, description: 'Stage progression view' },
      // Discovery phase (consolidated view for idea/explore/assess)
      { id: 'discovery', label: 'Discovery', icon: LightbulbIcon, phase: 'discovery', description: 'Capture, explore & assess ideas' },
    ],
  },
  // Market tab - Market analysis tools (initiative-scoped)
  market: {
    id: 'market',
    label: 'Market',
    description: 'Market analysis & research',
    requiresInitiative: true,
    items: [
      { id: 'market', label: 'Market Overview', icon: StorefrontIcon, description: 'Market summary' },
      { id: 'tamsam', label: 'TAM/SAM/SOM', icon: TrendingUpIcon, description: 'Market sizing' },
      { id: 'competitors', label: 'Competitors', icon: GroupsIcon, description: 'Competitive landscape' },
      { id: 'segments', label: 'Customer Segments', icon: PeopleOutlineIcon, description: 'Target personas & buying journey' },
      { id: 'porters', label: "Porter's Five Forces", icon: HubIcon, description: 'Competitive forces analysis' },
      { id: 'pestle', label: 'PESTLE', icon: PublicIcon, description: 'Macro environment analysis' },
    ],
  },
  // Decision tab - Business Case & Approval (initiative-level, synthesizes all product ideas)
  decision: {
    id: 'decision',
    label: 'Decision',
    description: 'Build the investment case',
    requiresInitiative: true,
    items: [
      { id: 'summary', label: 'Summary', icon: FactCheckIcon, description: 'Initiative summary & validated ideas' },
      { id: 'case', label: 'Business Case', icon: DescriptionIcon, description: 'Financial & strategic case' },
      { id: 'approval', label: 'Approval', icon: GavelIcon, description: 'Get investment sign-off' },
    ],
  },
  // Governance tab - Oversight & tracking (initiative-scoped)
  governance: {
    id: 'governance',
    label: 'Governance',
    description: 'Oversight & stage management',
    requiresInitiative: false, // Some governance views are portfolio-level
    items: [
      { id: 'gates', label: 'Stage Gates', icon: CheckCircleIcon, requiresInitiative: true, description: 'Gate criteria & approvals' },
      { id: 'sla', label: 'SLA Tracker', icon: TimelineIcon, description: 'Timeline & escalation tracking' },
      { id: 'risk', label: 'At Risk', icon: WarningIcon, description: 'Initiatives at risk' },
      { id: 'plr', label: 'Post-Launch Review', icon: CompareArrowsIcon, requiresInitiative: true, description: 'Projected vs actual outcomes' },
      { id: 'killed', label: 'Killed Ideas', icon: SchoolIcon, description: 'Archive of declined initiatives' },
      { id: 'accounting', label: 'Innovation Accounting', icon: AccountBalanceIcon, description: 'Three-tier innovation metrics' },
      { id: 'funnel', label: 'Funnel Analytics', icon: AnalyticsIcon, description: 'Conversion rates & zombie detector' },
      { id: 'reviewers', label: 'Reviewers', icon: PersonAddIcon, requiresInitiative: true, description: 'Assign reviewers & COI disclosure' },
    ],
  },
  // Tools tab - Analysis & planning tools
  tools: {
    id: 'tools',
    label: 'Tools',
    description: 'Analysis & planning tools',
    requiresInitiative: false,
    items: [
      { id: 'ai-design', label: 'AI Design Wizard', icon: AutoAwesomeIcon, description: 'AI-assisted analysis', highlight: true },
      { id: 'value-prop', label: 'Value Proposition', icon: LightbulbIcon, requiresInitiative: true, description: 'Value proposition canvas' },
      { id: 'lean', label: 'Lean Canvas', icon: DashboardCustomizeIcon, requiresInitiative: true, description: 'Business model canvas' },
      { id: 'swot', label: 'SWOT Analysis', icon: GridViewIcon, requiresInitiative: true, description: 'Strengths, weaknesses, opportunities, threats' },
      { id: 'rice', label: 'RICE Scoring', icon: ScoreIcon, description: 'Prioritization scoring' },
    ],
  },
};

export default function BlueprintNavigator({
  activeSection = 'overview', // Which tab is active (overview, ideation, market, governance, tools)
  activeView,
  onViewChange,
  onCreateClick,
  onOpenAIWizard,
  // Initiative context
  hasActiveInitiative = false,
  activeInitiative = null,
  // Project selection props
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
}) {
  const { stageCounts, initiativesAtRisk, funnelMetrics, productIdeas, initiatives } = useBlueprint();

  // Build counts object for nav items
  const counts = useMemo(() => ({
    ...stageCounts,
    atRisk: initiativesAtRisk?.length || 0,
    total: funnelMetrics?.total || 0,
    active: funnelMetrics?.active || 0,
    productIdeas: productIdeas?.length || 0,
  }), [stageCounts, initiativesAtRisk, funnelMetrics, productIdeas]);

  // Get the current section's configuration
  const currentSection = NAV_STRUCTURE[activeSection] || NAV_STRUCTURE.overview;

  // Check if item is accessible
  const isItemAccessible = (item) => {
    // If section requires initiative and we don't have one, item is locked
    if (currentSection.requiresInitiative && !hasActiveInitiative) return false;
    // If item specifically requires initiative
    if (item.requiresInitiative && !hasActiveInitiative) return false;
    return true;
  };

  // Handle item click
  const handleItemClick = (item) => {
    if (!isItemAccessible(item)) {
      // If trying to access locked item, redirect to ideas board
      onViewChange('overview');
      return;
    }

    // Special handling for AI Design
    if (item.id === 'ai-design' && onOpenAIWizard) {
      onOpenAIWizard();
      return;
    }

    onViewChange(item.id);
  };

  // Check if section is locked (requires initiative but none selected)
  const isSectionLocked = currentSection.requiresInitiative && !hasActiveInitiative;

  return (
    <nav className="blueprint-navigator blueprint-navigator--contextual">
      {/* Active initiative indicator - shows when an initiative is selected */}
      {hasActiveInitiative && activeInitiative && (
        <div className="nav-initiative-indicator">
          <span className="nav-initiative-id">{activeInitiative.display_id}</span>
          <span className="nav-initiative-name">{activeInitiative.name}</span>
        </div>
      )}

      {/* Section header */}
      <div className="nav-section-header">
        <span className="nav-section-label">{currentSection.label}</span>
        <span className="nav-section-description">{currentSection.description}</span>
        {isSectionLocked && (
          <div className="nav-section-locked-notice">
            <LockIcon fontSize="small" />
            <span>Select an initiative first</span>
          </div>
        )}
      </div>

      {/* Render only the active section's items */}
      <div className="nav-section-items">
        {currentSection.items.map(item => {
          const Icon = item.icon;
          const count = item.countKey ? counts[item.countKey] : null;
          const isActive = activeView === item.id;
          const isAccessible = isItemAccessible(item);
          const stageInfo = item.stageId ? BPS_STAGE_INFO[item.stageId] : null;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''} ${!isAccessible ? 'locked' : ''} ${item.highlight ? 'highlight' : ''} ${item.phase ? `phase-${item.phase}` : ''}`}
              onClick={() => handleItemClick(item)}
              disabled={!isAccessible}
              title={!isAccessible ? 'Select an initiative first' : item.description}
            >
              <Icon
                fontSize="small"
                className="nav-item-icon"
                style={stageInfo ? { color: stageInfo.color } : undefined}
              />
              <span className="nav-item-label">{item.label}</span>
              {count !== null && count > 0 && (
                <span className="nav-item-count">{count}</span>
              )}
              {!isAccessible && (
                <LockIcon className="nav-item-lock" fontSize="small" />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick stats footer */}
      <div className="nav-footer">
        <div className="nav-stats">
          <div className="nav-stat">
            <span className="nav-stat-value">{counts.total}</span>
            <span className="nav-stat-label">Initiatives</span>
          </div>
          {hasActiveInitiative && (
            <div className="nav-stat">
              <span className="nav-stat-value">{counts.productIdeas}</span>
              <span className="nav-stat-label">Ideas</span>
            </div>
          )}
          <div className="nav-stat">
            <span className="nav-stat-value nav-stat-alert">{counts.atRisk}</span>
            <span className="nav-stat-label">At Risk</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
