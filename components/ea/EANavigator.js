// components/ea/EANavigator.js
// Logical navigation for Enterprise Architecture Studio

import { useMemo, useState } from 'react';
import { Navigator, NavGroup, NavItem } from '../ui';
import { useEA, EA_LAYERS, EA_ELEMENT_TYPES, EA_ELEMENT_TYPE_MAP } from './EAContext';

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
import AddIcon from '@mui/icons-material/Add';

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

// Layer configuration with icons
const LAYER_CONFIG = {
  business: { icon: BusinessIcon, color: '#f59e0b', order: 1 },
  application: { icon: ViewModuleIcon, color: '#3b82f6', order: 2 },
  technology: { icon: CloudIcon, color: '#10b981', order: 3 },
  motivation: { icon: LightbulbIcon, color: '#8b5cf6', order: 4 },
  strategy: { icon: TrendingUpIcon, color: '#ec4899', order: 5 },
  physical: { icon: BuildIcon, color: '#64748b', order: 6 },
  implementation: { icon: SettingsIcon, color: '#0ea5e9', order: 7 },
};

export default function EANavigator({
  activeSection = 'overview',
  activeViewpoint,
  activeLayer,
  activeElementType,
  onNavigate,
  onCreateElement,
}) {
  const { elements } = useEA();
  const [expandedSection, setExpandedSection] = useState('viewpoints');

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

  return (
    <Navigator
      title="Architecture"
      icon={BusinessIcon}
      iconColor="#3b82f6"
      showHome={true}
      homeLabel="Overview"
      homeIcon={DashboardIcon}
      homeActive={activeSection === 'overview'}
      onHomeClick={() => onNavigate('overview')}
      createLabel="New Element"
      onCreate={() => onCreateElement && onCreateElement()}
    >
      {/* Architecture Viewpoints - Question-based */}
      <NavGroup
        name="Viewpoints"
        count={totalElements}
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

      {/* By Architecture Layer */}
      <NavGroup
        name="By Layer"
        defaultExpanded={expandedSection === 'layers'}
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

      {/* Architecture Views */}
      <NavGroup
        name="Views"
        defaultExpanded={false}
        hasActiveChild={activeSection === 'views'}
      >
        <NavItem
          icon={ViewModuleIcon}
          label="Capability Map"
          onClick={() => onNavigate('view', 'capability-heatmap')}
        />
        <NavItem
          icon={IntegrationInstructionsIcon}
          label="Application Portfolio"
          onClick={() => onNavigate('view', 'application-portfolio')}
        />
        <NavItem
          icon={AccountTreeIcon}
          label="Integration Map"
          onClick={() => onNavigate('view', 'integration-map')}
        />
        <NavItem
          icon={CloudIcon}
          label="Technology Stack"
          onClick={() => onNavigate('view', 'technology-stack')}
        />
      </NavGroup>

      {/* Help & Guidance */}
      <NavGroup
        name="Help"
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
      </NavGroup>
    </Navigator>
  );
}

// Export viewpoints for use elsewhere
export { VIEWPOINTS, LAYER_CONFIG };
