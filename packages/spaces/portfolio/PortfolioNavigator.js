// components/portfolio/PortfolioNavigator.js
// Portfolio Studio Navigation - Logical structure for investment decisions
// "This is where we decide what deserves a project."

import { useMemo } from 'react';
import { Navigator, NavGroup, NavItem } from '../../ui';
import { usePortfolio } from './PortfolioContext';

// MUI Icons
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FlagIcon from '@mui/icons-material/Flag';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BalanceIcon from '@mui/icons-material/Balance';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GavelIcon from '@mui/icons-material/Gavel';
import WarningIcon from '@mui/icons-material/Warning';
import DonutSmallIcon from '@mui/icons-material/DonutSmall';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AssessmentIcon from '@mui/icons-material/Assessment';
// New icons for enhanced portfolio features
import GridViewIcon from '@mui/icons-material/GridView';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CalculateIcon from '@mui/icons-material/Calculate';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventIcon from '@mui/icons-material/Event';
import HubIcon from '@mui/icons-material/Hub';

// Navigation sections
const PORTFOLIO_SECTIONS = {
  overview: { id: 'overview', label: 'Overview', icon: DashboardIcon },
  themes: { id: 'themes', label: 'Investment Themes', icon: FlagIcon },
  initiatives: { id: 'initiatives', label: 'Initiatives', icon: RocketLaunchIcon },
  // Prioritize section
  matrix: { id: 'matrix', label: 'Priority Matrix', icon: GridViewIcon },
  stackrank: { id: 'stackrank', label: 'Stack Rank', icon: FormatListNumberedIcon },
  depmap: { id: 'depmap', label: 'Dependency Map', icon: HubIcon },
  // Assess section
  scoring: { id: 'scoring', label: 'Scoring', icon: CalculateIcon },
  committee: { id: 'committee', label: 'Committee Review', icon: HowToVoteIcon },
  // Governance section
  budget: { id: 'budget', label: 'Budget Envelopes', icon: AccountBalanceWalletIcon },
  timeline: { id: 'timeline', label: 'Decision Timeline', icon: EventIcon },
  decisions: { id: 'decisions', label: 'Decision Records', icon: GavelIcon },
  // Constraints
  dependencies: { id: 'dependencies', label: 'Dependencies', icon: AccountTreeIcon },
  risks: { id: 'risks', label: 'Risks', icon: WarningIcon },
};

// Views configuration (legacy - keeping for backwards compatibility)
const PORTFOLIO_VIEWS = [
  { id: 'horizon-balance', label: 'Horizon Balance', icon: DonutSmallIcon, description: 'Run / Grow / Transform' },
  { id: 'value-risk', label: 'Value vs Risk', icon: BubbleChartIcon, description: 'Initiative positioning' },
  { id: 'pipeline', label: 'Initiative Pipeline', icon: TimelineIcon, description: 'Discovery to Commitment' },
  { id: 'dependency-map', label: 'Dependency Map', icon: AccountTreeIcon, description: 'Cross-initiative links' },
  { id: 'theme-allocation', label: 'Theme Allocation', icon: AssessmentIcon, description: 'Investment by theme' },
];

export default function PortfolioNavigator({
  activeSection = 'overview',
  activeView,
  onNavigate,
  onCreateInitiative,
}) {
  const { stats, themes, initiatives, decisions, risks, dependencies, portfolioHealth } = usePortfolio();

  // Count active themes
  const activeThemeCount = useMemo(() =>
    themes.filter(t => t.custom_fields?.status === 'active').length,
  [themes]);

  // Pipeline stage counts
  const stageCounts = stats.stageCounts || {};

  return (
    <Navigator
      title="Portfolio"
      icon={BusinessCenterIcon}
      iconColor="#8b5cf6"
      showHome={true}
      homeLabel="Overview"
      homeIcon={DashboardIcon}
      homeActive={activeSection === 'overview'}
      onHomeClick={() => onNavigate('overview')}
      createLabel="New Initiative"
      onCreate={onCreateInitiative}
    >
      {/* Investment Management */}
      <NavGroup
        name="Investment Management"
        count={initiatives.length}
        defaultExpanded={true}
        hasActiveChild={['themes', 'initiatives'].includes(activeSection)}
      >
        <NavItem
          icon={FlagIcon}
          label="Investment Themes"
          count={activeThemeCount}
          color="#8b5cf6"
          active={activeSection === 'themes'}
          onClick={() => onNavigate('themes')}
        />
        <NavItem
          icon={RocketLaunchIcon}
          label="Portfolio Initiatives"
          count={initiatives.length}
          color="#3b82f6"
          active={activeSection === 'initiatives'}
          onClick={() => onNavigate('initiatives')}
        />
      </NavGroup>

      {/* Prioritize - NEW */}
      <NavGroup
        name="Prioritize"
        defaultExpanded={true}
        hasActiveChild={['matrix', 'stackrank', 'depmap'].includes(activeSection)}
      >
        <NavItem
          icon={GridViewIcon}
          label="Priority Matrix"
          color="#f59e0b"
          active={activeSection === 'matrix'}
          onClick={() => onNavigate('matrix')}
        />
        <NavItem
          icon={FormatListNumberedIcon}
          label="Stack Rank"
          color="#8b5cf6"
          active={activeSection === 'stackrank'}
          onClick={() => onNavigate('stackrank')}
        />
        <NavItem
          icon={HubIcon}
          label="Dependency Map"
          color="#3b82f6"
          active={activeSection === 'depmap'}
          onClick={() => onNavigate('depmap')}
        />
      </NavGroup>

      {/* Assess - NEW */}
      <NavGroup
        name="Assess"
        defaultExpanded={false}
        hasActiveChild={['scoring', 'committee'].includes(activeSection)}
      >
        <NavItem
          icon={CalculateIcon}
          label="Scoring"
          color="#10b981"
          active={activeSection === 'scoring'}
          onClick={() => onNavigate('scoring')}
        />
        <NavItem
          icon={HowToVoteIcon}
          label="Committee Review"
          color="#6366f1"
          active={activeSection === 'committee'}
          onClick={() => onNavigate('committee')}
        />
      </NavGroup>

      {/* Pipeline Stages */}
      <NavGroup
        name="Initiative Pipeline"
        defaultExpanded={true}
        hasActiveChild={activeSection === 'pipeline'}
      >
        <NavItem
          icon={TrendingUpIcon}
          label="Discover"
          count={stageCounts.discover || 0}
          color="#8b5cf6"
          active={activeSection === 'pipeline-discover'}
          onClick={() => onNavigate('pipeline', 'discover')}
        />
        <NavItem
          icon={AutoGraphIcon}
          label="Evaluate"
          count={stageCounts.evaluate || 0}
          color="#3b82f6"
          active={activeSection === 'pipeline-evaluate'}
          onClick={() => onNavigate('pipeline', 'evaluate')}
        />
        <NavItem
          icon={BalanceIcon}
          label="Decide"
          count={stageCounts.decide || 0}
          color="#f59e0b"
          active={activeSection === 'pipeline-decide'}
          onClick={() => onNavigate('pipeline', 'decide')}
        />
        <NavItem
          icon={PlaylistAddCheckIcon}
          label="Commit"
          count={stageCounts.commit || 0}
          color="#10b981"
          active={activeSection === 'pipeline-commit'}
          onClick={() => onNavigate('pipeline', 'commit')}
        />
      </NavGroup>

      {/* Governance - EXPANDED */}
      <NavGroup
        name="Governance"
        count={decisions.length}
        defaultExpanded={false}
        hasActiveChild={['budget', 'timeline', 'decisions'].includes(activeSection)}
      >
        <NavItem
          icon={AccountBalanceWalletIcon}
          label="Budget Envelopes"
          color="#f59e0b"
          active={activeSection === 'budget'}
          onClick={() => onNavigate('budget')}
        />
        <NavItem
          icon={EventIcon}
          label="Decision Timeline"
          color="#3b82f6"
          active={activeSection === 'timeline'}
          onClick={() => onNavigate('timeline')}
        />
        <NavItem
          icon={GavelIcon}
          label="Decision Records"
          count={decisions.length}
          color="#10b981"
          active={activeSection === 'decisions'}
          onClick={() => onNavigate('decisions')}
        />
      </NavGroup>

      {/* Risk & Dependencies */}
      <NavGroup
        name="Constraints"
        count={stats.blockingDeps + stats.openRisks}
        defaultExpanded={dependencies.length > 0 || risks.length > 0}
        hasActiveChild={['dependencies', 'risks'].includes(activeSection)}
      >
        <NavItem
          icon={AccountTreeIcon}
          label="Dependencies"
          count={dependencies.length}
          color="#64748b"
          active={activeSection === 'dependencies'}
          onClick={() => onNavigate('dependencies')}
        />
        <NavItem
          icon={WarningIcon}
          label="Portfolio Risks"
          count={stats.openRisks}
          color="#ef4444"
          active={activeSection === 'risks'}
          onClick={() => onNavigate('risks')}
        />
      </NavGroup>

      {/* Help */}
      <NavGroup
        name="Learn"
        defaultExpanded={false}
        hasActiveChild={activeSection === 'help'}
      >
        <NavItem
          icon={HelpOutlineIcon}
          label="Portfolio Basics"
          active={activeSection === 'help' && activeView === 'basics'}
          onClick={() => onNavigate('help', 'basics')}
        />
        <NavItem
          icon={HelpOutlineIcon}
          label="Initiative Pipeline"
          active={activeSection === 'help' && activeView === 'pipeline'}
          onClick={() => onNavigate('help', 'pipeline')}
        />
        <NavItem
          icon={HelpOutlineIcon}
          label="Investment Horizons"
          active={activeSection === 'help' && activeView === 'horizons'}
          onClick={() => onNavigate('help', 'horizons')}
        />
        <NavItem
          icon={HelpOutlineIcon}
          label="Prioritisation"
          active={activeSection === 'help' && activeView === 'prioritisation'}
          onClick={() => onNavigate('help', 'prioritisation')}
        />
        <NavItem
          icon={HelpOutlineIcon}
          label="Best Practices"
          active={activeSection === 'help' && activeView === 'practices'}
          onClick={() => onNavigate('help', 'practices')}
        />
      </NavGroup>
    </Navigator>
  );
}

export { PORTFOLIO_SECTIONS, PORTFOLIO_VIEWS };
