/**
 * CapWorkspace - Main workspace layout for Organisation Studio
 *
 * Comprehensive toolset with grouped navigation:
 * - Map: Unified visual overview
 * - Capabilities: Capabilities, Value Streams, Initiatives
 * - Services: Service Catalog, Levels, Consumers, Dependencies
 * - Performance: OKRs, KPIs, Metrics, Tracking
 * - Risk: Risk Management, Scenarios, Resilience, Assessments
 *
 * @component
 * @module components/cap/CapWorkspace
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from './CapWorkspace.module.css';
import { useCap } from './CapContext';
import { useBsm } from '../bsm/BsmContext';
import { usePerf } from '../perf/PerfContext';
import { useRisk } from '../risk/RiskContext';
import { useGov } from '../gov/GovContext';
import CapListView from './CapListView';
import CapArtefactModal from './CapArtefactModal';
import CapDashboard from './CapDashboard';
import BsmListView from '../bsm/BsmListView';

// Shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '../ui';

// Icons
import MapIcon from '@mui/icons-material/Map';
import CategoryIcon from '@mui/icons-material/Category';
import TimelineIcon from '@mui/icons-material/Timeline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShieldIcon from '@mui/icons-material/Shield';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import LinkIcon from '@mui/icons-material/Link';
import FlagIcon from '@mui/icons-material/Flag';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningIcon from '@mui/icons-material/Warning';
import InsightsIcon from '@mui/icons-material/Insights';
import HomeIcon from '@mui/icons-material/Home';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PolicyIcon from '@mui/icons-material/Policy';
import GroupsIcon from '@mui/icons-material/Groups';
import BalanceIcon from '@mui/icons-material/Balance';
import BusinessIcon from '@mui/icons-material/Business';

// Navigation structure - grouped tree
const NAV_GROUPS = [
  {
    id: 'capabilities',
    name: 'Capabilities',
    icon: CategoryIcon,
    type: 'group',
    description: 'What we can do',
    items: [
      { id: 'cap_map', name: 'Capability Map', icon: MapIcon, types: [], color: '#6366f1', isMap: true },
      { id: 'cap_list', name: 'Capabilities', icon: CategoryIcon, types: ['cap_capability', 'cap_capability_group'], color: '#6366f1' },
      { id: 'value_streams', name: 'Value Streams', icon: TimelineIcon, types: ['cap_value_stream'], color: '#0d9488' },
      { id: 'initiatives', name: 'Initiatives', icon: RocketLaunchIcon, types: ['cap_initiative', 'cap_gap'], color: '#10b981' },
    ],
  },
  {
    id: 'services',
    name: 'Services',
    icon: SupportAgentIcon,
    type: 'group',
    description: 'What we provide',
    items: [
      { id: 'service_catalog', name: 'Service Catalog', icon: MiscellaneousServicesIcon, types: ['bsm_service', 'bsm_service_category'], color: '#3b82f6' },
      { id: 'service_levels', name: 'Service Levels', icon: SpeedIcon, types: ['bsm_service_level', 'bsm_sla'], color: '#8b5cf6' },
      { id: 'consumers', name: 'Consumers', icon: GroupIcon, types: ['bsm_consumer', 'bsm_consumer_agreement'], color: '#22c55e' },
      { id: 'dependencies', name: 'Dependencies', icon: LinkIcon, types: ['bsm_dependency', 'bsm_integration'], color: '#f59e0b' },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    icon: TrendingUpIcon,
    type: 'group',
    description: 'How we measure',
    items: [
      { id: 'okrs', name: 'Objectives & OKRs', icon: FlagIcon, types: ['perf_objective', 'perf_key_result'], color: '#ef4444' },
      { id: 'kpis', name: 'KPIs & Metrics', icon: SpeedIcon, types: ['perf_kpi', 'perf_metric', 'perf_target'], color: '#f59e0b' },
      { id: 'tracking', name: 'Tracking', icon: AssessmentIcon, types: ['perf_measurement', 'perf_review'], color: '#8b5cf6' },
      { id: 'outcomes', name: 'Outcomes', icon: EmojiEventsIcon, types: ['perf_outcome', 'perf_insight'], color: '#10b981' },
    ],
  },
  {
    id: 'governance',
    name: 'Governance',
    icon: AccountBalanceIcon,
    type: 'group',
    description: 'How we decide',
    items: [
      { id: 'decisions', name: 'Decisions', icon: GavelIcon, types: ['gov_decision_type', 'gov_decision_right'], color: '#6366f1' },
      { id: 'forums', name: 'Forums', icon: GroupsIcon, types: ['gov_forum'], color: '#0d9488' },
      { id: 'policies', name: 'Policies', icon: PolicyIcon, types: ['gov_policy', 'gov_principle'], color: '#8b5cf6' },
      { id: 'accountability', name: 'Accountability', icon: BalanceIcon, types: ['gov_accountability', 'gov_escalation'], color: '#f59e0b' },
    ],
  },
  {
    id: 'risk',
    name: 'Risk',
    icon: ShieldIcon,
    type: 'group',
    description: 'What threatens us',
    items: [
      { id: 'risks', name: 'Risk Register', icon: WarningIcon, types: ['risk_risk', 'risk_control'], color: '#ef4444' },
      { id: 'scenarios', name: 'Scenarios', icon: InsightsIcon, types: ['risk_scenario'], color: '#f59e0b' },
      { id: 'resilience', name: 'Resilience', icon: ShieldIcon, types: ['risk_resilience'], color: '#3b82f6' },
      { id: 'assessments', name: 'Assessments', icon: AssessmentIcon, types: ['risk_assessment'], color: '#8b5cf6' },
    ],
  },
];

/**
 * Navigator Component - Grouped tree sidebar
 * Follows requirements-studio pattern from style guide
 */
function Navigator({ activeView, activeGroup, onViewChange, counts, onCreate, expandedGroups, onToggleGroup, collapsed, onToggleCollapse }) {
  // Collapsed view - just show toggle button
  if (collapsed) {
    return (
      <nav className="navigator collapsed">
        <button className="nav-expand-btn" onClick={onToggleCollapse} title="Expand navigation">
          <ChevronRightIcon />
        </button>

        <style jsx>{`
          .navigator.collapsed {
            width: 48px;
            background: var(--panel);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 12px;
            flex-shrink: 0;
          }

          .nav-expand-btn {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .nav-expand-btn:hover {
            background: var(--nav-hover-bg);
            color: var(--text);
            border-color: var(--border-strong);
          }
        `}</style>
      </nav>
    );
  }

  return (
    <nav className="navigator">
      {/* Header with title and collapse toggle */}
      <div className="nav-header">
        <div className="nav-header-title">
          <BusinessIcon className="nav-header-icon" />
          <span>Organisation</span>
        </div>
        <button className="nav-collapse-btn" onClick={onToggleCollapse} title="Collapse navigation">
          <ChevronLeftIcon fontSize="small" />
        </button>
      </div>

      {/* Home Button - Overview */}
      <div className="nav-home">
        <button
          className={`nav-home-btn ${activeView === 'cap_map' ? 'active' : ''}`}
          onClick={() => onViewChange('cap_map', 'capabilities')}
        >
          <HomeIcon fontSize="small" />
          <span>Overview</span>
        </button>
      </div>

      {/* Grouped View Switcher */}
      <div className="nav-views-grouped">
        {NAV_GROUPS.map(group => {
          const isExpanded = expandedGroups.includes(group.id);
          const hasActiveView = group.items?.some(item => activeView === item.id);
          const groupCount = group.items?.reduce((sum, item) => sum + (counts[item.id] || 0), 0) || 0;

          return (
            <div key={group.id} className={`nav-group ${hasActiveView ? 'has-active' : ''}`}>
              <button
                className={`nav-group-header ${isExpanded ? 'expanded' : ''} ${hasActiveView ? 'has-active' : ''}`}
                onClick={() => onToggleGroup(group.id)}
              >
                {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                <span className="group-name">{group.name}</span>
                {groupCount > 0 && <span className="group-count">{groupCount}</span>}
              </button>

              {isExpanded && (
                <div className="nav-group-views">
                  {group.items.map(item => {
                    const ItemIcon = item.icon;
                    const itemCount = counts[item.id] || 0;
                    const isItemActive = activeView === item.id;

                    return (
                      <button
                        key={item.id}
                        className={`nav-view-btn ${isItemActive ? 'active' : ''}`}
                        onClick={() => onViewChange(item.id, group.id)}
                        title={item.name}
                      >
                        <ItemIcon fontSize="small" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick create */}
      <div className="nav-footer">
        <button className="nav-create-btn" onClick={() => onCreate()}>
          <AddIcon fontSize="small" />
          <span>New Artefact</span>
        </button>
      </div>

      <style jsx>{`
        .navigator {
          width: 260px;
          background: var(--panel);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 100%;
          overflow: hidden;
        }

        .nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .nav-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
        }

        :global(.nav-header-icon) {
          font-size: 24px !important;
          color: var(--module-teal);
        }

        .nav-collapse-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .nav-collapse-btn:hover {
          background: var(--bg);
          color: var(--text);
          border-color: var(--text-muted);
        }

        .nav-home {
          padding: 8px 12px;
          flex-shrink: 0;
        }

        .nav-home-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--text);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .nav-home-btn:hover {
          background: var(--bg);
        }

        .nav-home-btn.active {
          background: var(--menu-selected-bg);
          color: var(--menu-selected-text);
          font-weight: 500;
        }

        .nav-views-grouped {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 8px 0;
        }

        .nav-group {
          margin-bottom: 4px;
        }

        .nav-group-header {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-left: 3px solid transparent;
          color: var(--text);
          font-size: 0.85rem;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }

        .nav-group-header:hover {
          background: var(--bg);
        }

        .nav-group-header.has-active {
          border-left-color: var(--text);
        }

        .group-name {
          flex: 1;
        }

        .group-count {
          font-size: 0.75rem;
          padding: 2px 8px;
          background: var(--border);
          border-radius: 10px;
          color: var(--text-muted);
        }

        .nav-group-views {
          padding-left: 24px;
        }

        .nav-view-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-muted);
          font-size: 0.8rem;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }

        .nav-view-btn:hover {
          background: var(--bg);
          color: var(--text);
        }

        .nav-view-btn.active {
          background: var(--menu-selected-bg);
          color: var(--menu-selected-text);
          font-weight: 500;
        }

        .nav-footer {
          padding: 12px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }

        .nav-create-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 10px;
          background: var(--btn);
          color: var(--btn-text);
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .nav-create-btn:hover {
          background: var(--btn-2);
        }
      `}</style>
    </nav>
  );
}

/**
 * CapWorkspace Component
 */
export default function CapWorkspace() {
  const router = useRouter();

  // Capability context
  const {
    artefacts: capArtefacts,
    capabilities,
    valueStreams,
    initiatives,
    gaps,
    error: capError,
    selectedId: capSelectedId,
    setSelectedId: setCapSelectedId,
    CAP_TYPE_DEFS,
    deleteArtefact: deleteCapArtefact,
  } = useCap();

  // BSM context
  const {
    artefacts: bsmArtefacts,
    services,
    getArtefactsByModule: getBsmArtefactsByModule,
    selectedId: bsmSelectedId,
    setSelectedId: setBsmSelectedId,
    error: bsmError,
    BSM_TYPE_DEFS,
  } = useBsm();

  // Performance context
  const {
    artefacts: perfArtefacts,
    objectives,
    keyResults,
    kpis,
    getArtefactsByModule: getPerfArtefactsByModule,
    selectedId: perfSelectedId,
    setSelectedId: setPerfSelectedId,
    error: perfError,
    PERF_TYPE_DEFS,
  } = usePerf();

  // Risk context
  const {
    artefacts: riskArtefacts,
    selectedId: riskSelectedId,
    setSelectedId: setRiskSelectedId,
    error: riskError,
    deleteArtefact: deleteRiskArtefact,
  } = useRisk();

  // Governance context
  const {
    artefacts: govArtefacts,
    getArtefactsByModule: getGovArtefactsByModule,
    selectedId: govSelectedId,
    setSelectedId: setGovSelectedId,
    error: govError,
  } = useGov();

  const [activeView, setActiveViewState] = useState('cap_map');
  const [activeGroup, setActiveGroup] = useState('capabilities');
  const [expandedGroups, setExpandedGroups] = useState(['capabilities']);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingArtefact, setEditingArtefact] = useState(null);
  const [defaultType, setDefaultType] = useState(null);
  const [urlInitialized, setUrlInitialized] = useState(false);

  // Combined error
  const error = capError || bsmError || perfError || riskError || govError;

  // Find the group for a given view ID
  const findGroupForView = useCallback((viewId) => {
    for (const group of NAV_GROUPS) {
      if (group.items?.some(item => item.id === viewId)) {
        return group.id;
      }
    }
    return 'capabilities'; // Default
  }, []);

  // Set active view and update URL
  const setActiveView = useCallback((viewId) => {
    setActiveViewState(viewId);
    // Update URL with view parameter (shallow update, no page reload)
    const url = new URL(window.location.href);
    if (viewId === 'cap_map') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', viewId);
    }
    router.replace(url.pathname + url.search, undefined, { shallow: true });
  }, [router]);

  // Initialize view from URL on mount
  useEffect(() => {
    if (!router.isReady || urlInitialized) return;

    const viewFromUrl = router.query.view;
    if (viewFromUrl && typeof viewFromUrl === 'string') {
      // Validate the view exists
      const isValidView = NAV_GROUPS.some(g =>
        g.items?.some(item => item.id === viewFromUrl)
      ) || viewFromUrl === 'cap_map';

      if (isValidView) {
        setActiveViewState(viewFromUrl);
        const group = findGroupForView(viewFromUrl);
        setActiveGroup(group);
        if (!expandedGroups.includes(group)) {
          setExpandedGroups(prev => [...prev, group]);
        }
      }
    }
    setUrlInitialized(true);
  }, [router.isReady, router.query.view, urlInitialized, findGroupForView, expandedGroups]);

  // Handle toggle group
  const handleToggleGroup = useCallback((groupId) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(g => g !== groupId)
        : [...prev, groupId]
    );
  }, []);

  // Handle view change
  const handleViewChange = useCallback((viewId, groupId) => {
    setActiveView(viewId); // This now also updates the URL
    setActiveGroup(groupId);
    if (groupId && !expandedGroups.includes(groupId)) {
      setExpandedGroups(prev => [...prev, groupId]);
    }
  }, [expandedGroups, setActiveView]);

  // Calculate counts for nav
  const counts = useMemo(() => ({
    // Capability counts
    cap_list: capabilities?.length || 0,
    value_streams: valueStreams?.length || 0,
    initiatives: (initiatives?.length || 0) + (gaps?.length || 0),
    // BSM counts
    service_catalog: services?.length || 0,
    service_levels: getBsmArtefactsByModule?.('levels')?.length || 0,
    consumers: getBsmArtefactsByModule?.('consumers')?.length || 0,
    dependencies: getBsmArtefactsByModule?.('dependencies')?.length || 0,
    // Performance counts
    okrs: (objectives?.length || 0) + (keyResults?.length || 0),
    kpis: kpis?.length || 0,
    tracking: getPerfArtefactsByModule?.('tracking')?.length || 0,
    outcomes: getPerfArtefactsByModule?.('outcomes')?.length || 0,
    // Governance counts
    decisions: getGovArtefactsByModule?.('decisions')?.length || 0,
    forums: getGovArtefactsByModule?.('forums')?.length || 0,
    policies: getGovArtefactsByModule?.('policies')?.length || 0,
    accountability: getGovArtefactsByModule?.('accountability')?.length || 0,
    // Risk counts
    risks: riskArtefacts?.filter(a => a.type === 'risk_risk' || a.type === 'risk_control')?.length || 0,
    scenarios: riskArtefacts?.filter(a => a.type === 'risk_scenario')?.length || 0,
    resilience: riskArtefacts?.filter(a => a.type === 'risk_resilience')?.length || 0,
    assessments: riskArtefacts?.filter(a => a.type === 'risk_assessment')?.length || 0,
  }), [capabilities, valueStreams, initiatives, gaps, services, getBsmArtefactsByModule, objectives, keyResults, kpis, getPerfArtefactsByModule, getGovArtefactsByModule, riskArtefacts]);

  // Get artefacts for current view
  const currentArtefacts = useMemo(() => {
    switch (activeView) {
      // Capability views
      case 'cap_list':
        return capabilities || [];
      case 'value_streams':
        return valueStreams || [];
      case 'initiatives':
        return [...(initiatives || []), ...(gaps || [])];
      // BSM views
      case 'service_catalog':
        return services || [];
      case 'service_levels':
        return getBsmArtefactsByModule?.('levels') || [];
      case 'consumers':
        return getBsmArtefactsByModule?.('consumers') || [];
      case 'dependencies':
        return getBsmArtefactsByModule?.('dependencies') || [];
      // Performance views
      case 'okrs':
        return [...(objectives || []), ...(keyResults || [])];
      case 'kpis':
        return kpis || [];
      case 'tracking':
        return getPerfArtefactsByModule?.('tracking') || [];
      case 'outcomes':
        return getPerfArtefactsByModule?.('outcomes') || [];
      // Governance views
      case 'decisions':
        return getGovArtefactsByModule?.('decisions') || [];
      case 'forums':
        return getGovArtefactsByModule?.('forums') || [];
      case 'policies':
        return getGovArtefactsByModule?.('policies') || [];
      case 'accountability':
        return getGovArtefactsByModule?.('accountability') || [];
      // Risk views
      case 'risks':
        return riskArtefacts?.filter(a => a.type === 'risk_risk' || a.type === 'risk_control') || [];
      case 'scenarios':
        return riskArtefacts?.filter(a => a.type === 'risk_scenario') || [];
      case 'resilience':
        return riskArtefacts?.filter(a => a.type === 'risk_resilience') || [];
      case 'assessments':
        return riskArtefacts?.filter(a => a.type === 'risk_assessment') || [];
      default:
        return [];
    }
  }, [activeView, capabilities, valueStreams, initiatives, gaps, services, getBsmArtefactsByModule, objectives, keyResults, kpis, getPerfArtefactsByModule, getGovArtefactsByModule, riskArtefacts]);

  // Get current nav item config
  const getCurrentNavItem = useCallback(() => {
    for (const group of NAV_GROUPS) {
      if (group.type === 'single' && group.id === activeView) {
        return { ...group, types: [] };
      }
      if (group.items) {
        const item = group.items.find(i => i.id === activeView);
        if (item) return item;
      }
    }
    return null;
  }, [activeView]);

  const currentNavItem = getCurrentNavItem();

  // Handle create new
  const handleCreate = useCallback((type = null) => {
    let typeToUse = type;
    if (!typeToUse && currentNavItem?.types?.length > 0) {
      typeToUse = currentNavItem.types[0];
    }
    setDefaultType(typeToUse);
    setEditingArtefact(null);
    setShowModal(true);
  }, [currentNavItem]);

  // Handle edit
  const handleEdit = useCallback((artefact) => {
    setEditingArtefact(artefact);
    setDefaultType(artefact?.artefact_type);
    setShowModal(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingArtefact(null);
    setDefaultType(null);
  }, []);

  // Get available types for modal
  const getAvailableTypes = useCallback(() => {
    const types = currentNavItem?.types || ['cap_capability'];
    return types.map(typeId => ({
      id: typeId,
      ...CAP_TYPE_DEFS[typeId],
    })).filter(t => t.name); // Filter out types not in CAP_TYPE_DEFS
  }, [currentNavItem, CAP_TYPE_DEFS]);

  // Handle navigation from map
  const handleNavigate = useCallback((viewId) => {
    // Find the group for this view
    const groupId = findGroupForView(viewId);
    handleViewChange(viewId, groupId);
  }, [handleViewChange, findGroupForView]);

  // Get title for current view
  const getViewTitle = () => {
    if (currentNavItem?.name) return currentNavItem.name;
    if (activeView === 'map') return 'Organisation Map';
    return 'Organisation';
  };

  // Get selected ID and setter based on active group
  const getSelectedIdForGroup = useCallback(() => {
    switch (activeGroup) {
      case 'services': return bsmSelectedId;
      case 'performance': return perfSelectedId;
      case 'governance': return govSelectedId;
      case 'risk': return riskSelectedId;
      default: return capSelectedId;
    }
  }, [activeGroup, capSelectedId, bsmSelectedId, perfSelectedId, govSelectedId, riskSelectedId]);

  const setSelectedIdForGroup = useCallback((id) => {
    switch (activeGroup) {
      case 'services': setBsmSelectedId(id); break;
      case 'performance': setPerfSelectedId(id); break;
      case 'governance': setGovSelectedId(id); break;
      case 'risk': setRiskSelectedId(id); break;
      default: setCapSelectedId(id); break;
    }
  }, [activeGroup, setCapSelectedId, setBsmSelectedId, setPerfSelectedId, setGovSelectedId, setRiskSelectedId]);

  // Get breadcrumb info
  const getBreadcrumbs = useCallback(() => {
    const crumbs = [{ label: 'Organisation', icon: HomeIcon }];

    // Find current group
    const currentGroup = NAV_GROUPS.find(g => g.id === activeGroup);
    if (currentGroup) {
      crumbs.push({ label: currentGroup.name, icon: currentGroup.icon });
    }

    // Find current item
    if (currentNavItem && currentNavItem.name) {
      crumbs.push({ label: currentNavItem.name, icon: currentNavItem.icon });
    }

    return crumbs;
  }, [activeGroup, currentNavItem]);

  // Render main content
  const renderContent = () => {
    if (activeView === 'cap_map') {
      return (
        <CapDashboard
          onNavigate={handleNavigate}
          onCreate={handleCreate}
        />
      );
    }

    // Check which group is active
    const isCapView = ['cap_list', 'value_streams', 'initiatives'].includes(activeView);
    const isBsmView = ['service_catalog', 'service_levels', 'consumers', 'dependencies'].includes(activeView);
    const isGovView = ['decisions', 'forums', 'policies', 'accountability'].includes(activeView);
    const isRiskView = ['risks', 'scenarios', 'resilience', 'assessments'].includes(activeView);
    const isPerfView = ['okrs', 'kpis', 'tracking', 'outcomes'].includes(activeView);

    const selectedId = getSelectedIdForGroup();

    // Capability views
    if (isCapView && currentArtefacts) {
      const NavIcon = currentNavItem?.icon || CategoryIcon;
      return (
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon} style={{ backgroundColor: `${currentNavItem?.color || '#6366f1'}15`, color: currentNavItem?.color || '#6366f1' }}>
                <NavIcon fontSize="small" />
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.headerTitle}>
                  <h2>{currentNavItem?.name}</h2>
                  <span className={styles.headerCount}>{currentArtefacts.length}</span>
                </div>
                <p>{currentNavItem?.description || `Manage your ${currentNavItem?.name?.toLowerCase()}`}</p>
              </div>
            </div>
            <button className={styles.createBtn} onClick={() => handleCreate()}>
              <AddIcon fontSize="small" />
              <span>Add {currentNavItem?.name?.replace(/s$/, '') || 'Item'}</span>
            </button>
          </div>
          <CapListView
            artefacts={currentArtefacts}
            onSelect={setSelectedIdForGroup}
            onEdit={handleEdit}
            onCreate={handleCreate}
            selectedId={selectedId}
            moduleId={activeView}
            viewMode="cards"
          />
        </div>
      );
    }

    // BSM views
    if (isBsmView && currentArtefacts) {
      const NavIcon = currentNavItem?.icon || CategoryIcon;
      return (
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon} style={{ backgroundColor: `${currentNavItem?.color || '#3b82f6'}15`, color: currentNavItem?.color || '#3b82f6' }}>
                <NavIcon fontSize="small" />
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.headerTitle}>
                  <h2>{currentNavItem?.name}</h2>
                  <span className={styles.headerCount}>{currentArtefacts.length}</span>
                </div>
                <p>{currentNavItem?.description || `Manage your ${currentNavItem?.name?.toLowerCase()}`}</p>
              </div>
            </div>
            <button className={styles.createBtn} onClick={() => handleCreate()}>
              <AddIcon fontSize="small" />
              <span>Add {currentNavItem?.name?.replace(/s$/, '') || 'Item'}</span>
            </button>
          </div>
          <BsmListView
            artefacts={currentArtefacts}
            onSelect={setSelectedIdForGroup}
            onEdit={handleEdit}
            onCreate={handleCreate}
            selectedId={selectedId}
            moduleId={activeView === 'service_catalog' ? 'catalog' : activeView.replace('service_', '')}
          />
        </div>
      );
    }

    // Governance views
    if (isGovView && currentArtefacts) {
      const NavIcon = currentNavItem?.icon || CategoryIcon;
      return (
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon} style={{ backgroundColor: `${currentNavItem?.color || '#6366f1'}15`, color: currentNavItem?.color || '#6366f1' }}>
                <NavIcon fontSize="small" />
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.headerTitle}>
                  <h2>{currentNavItem?.name}</h2>
                  <span className={styles.headerCount}>{currentArtefacts.length}</span>
                </div>
                <p>{currentNavItem?.description || `Manage your ${currentNavItem?.name?.toLowerCase()}`}</p>
              </div>
            </div>
            <button className={styles.createBtn} onClick={() => handleCreate()}>
              <AddIcon fontSize="small" />
              <span>Add {currentNavItem?.name?.replace(/s$/, '') || 'Item'}</span>
            </button>
          </div>
          <CapListView
            artefacts={currentArtefacts}
            onSelect={setSelectedIdForGroup}
            onEdit={handleEdit}
            onCreate={handleCreate}
            selectedId={selectedId}
            moduleId={activeView}
            viewMode="cards"
          />
        </div>
      );
    }

    // Risk views - use generic list for now
    if (isRiskView && currentArtefacts) {
      const NavIcon = currentNavItem?.icon || CategoryIcon;
      return (
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon} style={{ backgroundColor: `${currentNavItem?.color || '#ef4444'}15`, color: currentNavItem?.color || '#ef4444' }}>
                <NavIcon fontSize="small" />
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.headerTitle}>
                  <h2>{currentNavItem?.name}</h2>
                  <span className={styles.headerCount}>{currentArtefacts.length}</span>
                </div>
                <p>{currentNavItem?.description || `Manage your ${currentNavItem?.name?.toLowerCase()}`}</p>
              </div>
            </div>
            <button className={styles.createBtn} onClick={() => handleCreate()}>
              <AddIcon fontSize="small" />
              <span>Add {currentNavItem?.name?.replace(/s$/, '') || 'Item'}</span>
            </button>
          </div>
          <CapListView
            artefacts={currentArtefacts}
            onSelect={setSelectedIdForGroup}
            onEdit={handleEdit}
            onCreate={handleCreate}
            selectedId={selectedId}
            moduleId={activeView}
            viewMode="cards"
          />
        </div>
      );
    }

    // Performance views - use generic list for now
    if (isPerfView && currentArtefacts) {
      const NavIcon = currentNavItem?.icon || CategoryIcon;
      return (
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon} style={{ backgroundColor: `${currentNavItem?.color || '#f59e0b'}15`, color: currentNavItem?.color || '#f59e0b' }}>
                <NavIcon fontSize="small" />
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.headerTitle}>
                  <h2>{currentNavItem?.name}</h2>
                  <span className={styles.headerCount}>{currentArtefacts.length}</span>
                </div>
                <p>{currentNavItem?.description || `Manage your ${currentNavItem?.name?.toLowerCase()}`}</p>
              </div>
            </div>
            <button className={styles.createBtn} onClick={() => handleCreate()}>
              <AddIcon fontSize="small" />
              <span>Add {currentNavItem?.name?.replace(/s$/, '') || 'Item'}</span>
            </button>
          </div>
          <CapListView
            artefacts={currentArtefacts}
            onSelect={setSelectedIdForGroup}
            onEdit={handleEdit}
            onCreate={handleCreate}
            selectedId={selectedId}
            moduleId={activeView}
            viewMode="cards"
          />
        </div>
      );
    }

    // Fallback placeholder
    const Icon = currentNavItem?.icon || CategoryIcon;
    return (
      <div className={styles.placeholderView}>
        <div className={styles.placeholderContent}>
          <Icon style={{ fontSize: 48, color: 'var(--text-muted)', opacity: 0.6 }} />
          <h2>{currentNavItem?.name || 'Coming Soon'}</h2>
          <p>No items found. Create your first item to get started.</p>
        </div>
      </div>
    );
  };

  // Dynamic page title based on current view
  const pageTitle = useMemo(() => {
    if (activeView === 'cap_map') return 'Organisation Studio | Ontographia';
    if (currentNavItem?.name) return `${currentNavItem.name} - Organisation | Ontographia`;
    return 'Organisation Studio | Ontographia';
  }, [activeView, currentNavItem]);

  // Build breadcrumbs
  const breadcrumbsContent = useMemo(() => {
    const crumbs = getBreadcrumbs();
    if (crumbs.length === 0) return null;

    return (
      <Breadcrumbs>
        {crumbs.map((crumb, idx, arr) => {
          const isLast = idx === arr.length - 1;
          return (
            <span key={idx} style={{ display: 'contents' }}>
              {idx > 0 && <BreadcrumbSeparator />}
              <Breadcrumb
                icon={idx === 0 ? crumb.icon : undefined}
                label={crumb.label}
                active={isLast}
              />
            </span>
          );
        })}
      </Breadcrumbs>
    );
  }, [getBreadcrumbs]);

  // Modal content
  const modalsContent = showModal ? (
    <CapArtefactModal
      isOpen={showModal}
      onClose={handleModalClose}
      artefact={editingArtefact}
      availableTypes={getAvailableTypes()}
      defaultType={defaultType || currentNavItem?.types?.[0]}
    />
  ) : null;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <WorkspaceLayout
        navigator={
          <Navigator
            activeView={activeView}
            activeGroup={activeGroup}
            onViewChange={handleViewChange}
            counts={counts}
            onCreate={handleCreate}
            expandedGroups={expandedGroups}
            onToggleGroup={handleToggleGroup}
            collapsed={navCollapsed}
            onToggleCollapse={() => setNavCollapsed(!navCollapsed)}
          />
        }
        breadcrumbs={breadcrumbsContent}
        error={error}
        modals={modalsContent}
      >
        {renderContent()}
      </WorkspaceLayout>
    </>
  );
}
