// components/ea/EANavigator.js
// Restructured navigation for Enterprise Architecture Studio
// Groups: Overview, By Layer, Viewpoints, Analysis Views, Help

import { useMemo, useState } from 'react';
import { Navigator, NavGroup, NavItem } from '@/components/ui';
import { useEA, EA_LAYERS, EA_ELEMENT_TYPES, EA_ELEMENT_TYPE_MAP } from './EAContext';
import { EA_VIEWS, EA_VIEW_CATEGORIES } from './views';

// MUI Icons
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FlagIcon from '@mui/icons-material/Flag';
import BuildIcon from '@mui/icons-material/Build';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import SettingsIcon from '@mui/icons-material/Settings';
import LayersIcon from '@mui/icons-material/Layers';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GridViewIcon from '@mui/icons-material/GridView';
import GavelIcon from '@mui/icons-material/Gavel';
import HubIcon from '@mui/icons-material/Hub';
import FolderIcon from '@mui/icons-material/Folder';

// Viewpoint definitions - question-based navigation
const VIEWPOINTS = [
  {
    id: 'capabilities',
    question: 'What can we do?',
    label: 'Business Capabilities',
    icon: FlagIcon,
    color: '#f59e0b',
    types: ['businessCapability', 'capability'],
    description: 'Core abilities of the organization',
  },
  {
    id: 'processes',
    question: 'How does work flow?',
    label: 'Business Processes',
    icon: AccountTreeIcon,
    color: '#f59e0b',
    types: ['businessProcess', 'businessFunction', 'businessService'],
    description: 'Workflows and procedures',
  },
  {
    id: 'organization',
    question: 'Who does what?',
    label: 'Organization',
    icon: GroupsIcon,
    color: '#f59e0b',
    types: ['businessActor', 'businessRole', 'businessCollaboration'],
    description: 'People, roles, and teams',
  },
  {
    id: 'applications',
    question: 'What systems exist?',
    label: 'Applications',
    icon: ViewModuleIcon,
    color: '#3b82f6',
    types: ['applicationComponent', 'applicationService', 'applicationInterface', 'applicationFunction'],
    description: 'Software systems and services',
  },
  {
    id: 'data',
    question: 'What data do we manage?',
    label: 'Data & Information',
    icon: StorageIcon,
    color: '#3b82f6',
    types: ['dataObject', 'businessObject', 'representation'],
    description: 'Data assets and information',
  },
  {
    id: 'technology',
    question: 'What infrastructure?',
    label: 'Technology',
    icon: CloudIcon,
    color: '#10b981',
    types: ['technologyService', 'node', 'device', 'systemSoftware', 'artifact', 'communicationNetwork'],
    description: 'Hardware and infrastructure',
  },
  {
    id: 'motivation',
    question: 'Why do we do this?',
    label: 'Goals & Drivers',
    icon: LightbulbIcon,
    color: '#8b5cf6',
    types: ['goal', 'driver', 'principle', 'requirement', 'constraint', 'stakeholder', 'assessment', 'outcome', 'value'],
    description: 'Business motivation and rationale',
  },
  {
    id: 'strategy',
    question: 'Where are we going?',
    label: 'Strategy',
    icon: TrendingUpIcon,
    color: '#ec4899',
    types: ['resource', 'courseOfAction', 'valueStream'],
    description: 'Strategic direction and roadmap',
  },
];

// Layer configuration with icons and descriptions
const LAYER_CONFIG = {
  motivation: {
    icon: LightbulbIcon,
    color: '#a855f7',
    order: 1,
    shortDesc: 'Why'
  },
  strategy: {
    icon: TrendingUpIcon,
    color: '#f59e0b',
    order: 2,
    shortDesc: 'Where'
  },
  business: {
    icon: BusinessIcon,
    color: '#f97316',
    order: 3,
    shortDesc: 'What'
  },
  application: {
    icon: ViewModuleIcon,
    color: '#3b82f6',
    order: 4,
    shortDesc: 'How (SW)'
  },
  technology: {
    icon: CloudIcon,
    color: '#10b981',
    order: 5,
    shortDesc: 'How (HW)'
  },
  physical: {
    icon: BuildIcon,
    color: '#64748b',
    order: 6,
    shortDesc: 'Physical'
  },
  implementation: {
    icon: SettingsIcon,
    color: '#0ea5e9',
    order: 7,
    shortDesc: 'Transition'
  },
};

// View icons mapping
const VIEW_ICONS = {
  'dashboard': DashboardIcon,
  'layered-view': LayersIcon,
  'organization-capability': GroupsIcon,
  'capability-heatmap': GridViewIcon,
  'application-portfolio': BarChartIcon,
  'integration-map': IntegrationInstructionsIcon,
  'technology-stack': CloudIcon,
  'value-stream-map': TimelineIcon,
  'gap-analysis': VisibilityIcon,
  'roadmap': TimelineIcon,
  'traceability-matrix': AccountTreeIcon,
  'adrs': GavelIcon,
  'cross-space': HubIcon,
  'pds-projects': FolderIcon,
};

export default function EANavigator({
  activeSection = 'overview',
  activeViewpoint,
  activeLayer,
  activeView,
  activeElementType,
  onNavigate,
  onCreateElement,
}) {
  const { elements } = useEA();
  const [expandedSection, setExpandedSection] = useState('layers');

  // Calculate counts by viewpoint
  const viewpointCounts = useMemo(() => {
    const counts = {};
    VIEWPOINTS.forEach(vp => {
      counts[vp.id] = elements.filter(e => vp.types.includes(e.element_type)).length;
    });
    return counts;
  }, [elements]);

  // Calculate counts by layer
  const layerCounts = useMemo(() => {
    const counts = {};
    Object.keys(LAYER_CONFIG).forEach(layer => {
      counts[layer] = elements.filter(e => {
        const typeDef = EA_ELEMENT_TYPE_MAP[e.element_type];
        return typeDef?.layer === layer;
      }).length;
    });
    return counts;
  }, [elements]);

  // Get element types for a layer
  const getLayerTypes = (layerId) => {
    return EA_ELEMENT_TYPES.filter(t => t.layer === layerId);
  };

  // Total elements
  const totalElements = elements.length;

  // Organize views by category
  const coreViews = EA_VIEWS.filter(v => v.category === 'Core');
  const analysisViews = EA_VIEWS.filter(v =>
    v.category === 'Strategy' ||
    v.category === 'Application' ||
    v.category === 'Analysis'
  );
  const implementationViews = EA_VIEWS.filter(v => v.category === 'Implementation');
  const governanceViews = EA_VIEWS.filter(v => v.category === 'Governance');
  const integrationViews = EA_VIEWS.filter(v => v.category === 'Integration');

  return (
    <Navigator
      title="Architecture"
      icon={BusinessIcon}
      iconColor="#6366f1"
      showHome={true}
      homeLabel="Overview"
      homeIcon={DashboardIcon}
      homeActive={activeSection === 'overview'}
      onHomeClick={() => onNavigate('overview')}
      createLabel="New Element"
      onCreate={() => onCreateElement && onCreateElement()}
    >
      {/* By Architecture Layer - Primary navigation */}
      <NavGroup
        name="📚 By Layer"
        count={totalElements}
        defaultExpanded={true}
        hasActiveChild={activeSection === 'layer'}
      >
        {Object.entries(LAYER_CONFIG)
          .sort((a, b) => a[1].order - b[1].order)
          .map(([layerId, config]) => {
            const layer = EA_LAYERS[layerId];
            if (!layer) return null;
            return (
              <NavItem
                key={layerId}
                icon={config.icon}
                label={layer.name}
                count={layerCounts[layerId]}
                color={config.color}
                active={activeLayer === layerId}
                onClick={() => onNavigate('layer', layerId)}
              />
            );
          })}
      </NavGroup>

      {/* Viewpoints - Question-based */}
      <NavGroup
        name="🔍 Viewpoints"
        defaultExpanded={expandedSection === 'viewpoints'}
        hasActiveChild={activeSection === 'viewpoint'}
      >
        {VIEWPOINTS.map(vp => (
          <NavItem
            key={vp.id}
            icon={vp.icon}
            label={vp.label}
            count={viewpointCounts[vp.id]}
            color={vp.color}
            active={activeViewpoint === vp.id}
            onClick={() => onNavigate('viewpoint', vp.id)}
          />
        ))}
      </NavGroup>

      {/* Core Views - The main ArchiMate diagrams */}
      <NavGroup
        name="📊 Core Views"
        defaultExpanded={false}
        hasActiveChild={activeSection === 'view' && coreViews.some(v => v.id === activeView)}
      >
        {coreViews.map(view => {
          const ViewIcon = VIEW_ICONS[view.id] || VisibilityIcon;
          return (
            <NavItem
              key={view.id}
              icon={ViewIcon}
              label={view.name}
              active={activeView === view.id}
              onClick={() => onNavigate('view', view.id)}
            />
          );
        })}
      </NavGroup>

      {/* Analysis Views */}
      <NavGroup
        name="📈 Analysis"
        defaultExpanded={false}
        hasActiveChild={activeSection === 'view' && analysisViews.some(v => v.id === activeView)}
      >
        {analysisViews.map(view => {
          const ViewIcon = VIEW_ICONS[view.id] || BarChartIcon;
          return (
            <NavItem
              key={view.id}
              icon={ViewIcon}
              label={view.name}
              active={activeView === view.id}
              onClick={() => onNavigate('view', view.id)}
            />
          );
        })}
      </NavGroup>

      {/* Implementation & Roadmap */}
      {implementationViews.length > 0 && (
        <NavGroup
          name="🗺️ Implementation"
          defaultExpanded={false}
          hasActiveChild={activeSection === 'view' && implementationViews.some(v => v.id === activeView)}
        >
          {implementationViews.map(view => {
            const ViewIcon = VIEW_ICONS[view.id] || TimelineIcon;
            return (
              <NavItem
                key={view.id}
                icon={ViewIcon}
                label={view.name}
                active={activeView === view.id}
                onClick={() => onNavigate('view', view.id)}
              />
            );
          })}
        </NavGroup>
      )}

      {/* Governance - ADRs, Standards, etc */}
      {governanceViews.length > 0 && (
        <NavGroup
          name="⚖️ Governance"
          defaultExpanded={false}
          hasActiveChild={activeSection === 'view' && governanceViews.some(v => v.id === activeView)}
        >
          {governanceViews.map(view => {
            const ViewIcon = VIEW_ICONS[view.id] || GavelIcon;
            return (
              <NavItem
                key={view.id}
                icon={ViewIcon}
                label={view.name}
                active={activeView === view.id}
                onClick={() => onNavigate('view', view.id)}
              />
            );
          })}
        </NavGroup>
      )}

      {/* Integration - Cross-Space Relationships */}
      <NavGroup
        name="🔗 Integration"
        defaultExpanded={false}
        hasActiveChild={activeSection === 'view' && (
          integrationViews.some(v => v.id === activeView) ||
          activeView === 'pds-projects'
        )}
      >
        <NavItem
          icon={FolderIcon}
          label="PDS Projects"
          color="#0ea5e9"
          active={activeView === 'pds-projects'}
          onClick={() => onNavigate('view', 'pds-projects')}
        />
        {integrationViews.map(view => {
          const ViewIcon = VIEW_ICONS[view.id] || HubIcon;
          return (
            <NavItem
              key={view.id}
              icon={ViewIcon}
              label={view.name}
              active={activeView === view.id}
              onClick={() => onNavigate('view', view.id)}
            />
          );
        })}
      </NavGroup>

      {/* Help & Settings */}
      <NavGroup
        name="⚙️ Help & Settings"
        defaultExpanded={false}
      >
        <NavItem
          icon={HelpOutlineIcon}
          label="Getting Started"
          onClick={() => onNavigate('help', 'getting-started')}
        />
        <NavItem
          icon={HelpOutlineIcon}
          label="ArchiMate Guide"
          onClick={() => onNavigate('help', 'archimate-guide')}
        />
        <NavItem
          icon={ImportExportIcon}
          label="Import from Modules"
          onClick={() => onNavigate('import')}
        />
      </NavGroup>
    </Navigator>
  );
}

// Export viewpoints for use elsewhere
export { VIEWPOINTS, LAYER_CONFIG };
