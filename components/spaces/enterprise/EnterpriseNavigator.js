/**
 * EnterpriseNavigator - Navigation component for Enterprise Studio
 *
 * Provides navigation across all enterprise modules:
 * Capabilities, Services, Products, Landscape, Technology,
 * Governance, Risk, Value, Organisation
 *
 * @module components/spaces/enterprise/EnterpriseNavigator
 */

import { useMemo } from 'react';
import { Navigator, NavGroup, NavItem } from '@/components/ui';
import { useEnterprise, ENTERPRISE_MODULES } from './EnterpriseContext';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FlagIcon from '@mui/icons-material/Flag';
import SettingsIcon from '@mui/icons-material/Settings';
import InventoryIcon from '@mui/icons-material/Inventory';
import AppsIcon from '@mui/icons-material/Apps';
import RadarIcon from '@mui/icons-material/Radar';
import GavelIcon from '@mui/icons-material/Gavel';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HubIcon from '@mui/icons-material/Hub';
import DomainIcon from '@mui/icons-material/Domain';
import StorageIcon from '@mui/icons-material/Storage';

// Icon mapping for modules
const MODULE_ICONS = {
  overview: DashboardIcon,
  capabilities: FlagIcon,
  services: SettingsIcon,
  products: InventoryIcon,
  landscape: AppsIcon,
  technology: RadarIcon,
  governance: GavelIcon,
  risk: WarningIcon,
  value: TrendingUpIcon,
  organisation: GroupsIcon,
  data: StorageIcon,
};

// View definitions for each module
const CAPABILITY_VIEWS = [
  { id: 'map', name: 'Capability Map', icon: AccountTreeIcon },
  { id: 'heatmap', name: 'Maturity Heatmap', icon: BarChartIcon },
  { id: 'gaps', name: 'Gap Analysis', icon: AssessmentIcon },
];

const SERVICE_VIEWS = [
  { id: 'catalog', name: 'Service Catalog', icon: SettingsIcon },
  { id: 'metrics', name: 'Service Metrics', icon: BarChartIcon },
];

const LANDSCAPE_VIEWS = [
  { id: 'landscape', name: 'Application Landscape', icon: AppsIcon },
  { id: 'integrations', name: 'Integration Map', icon: IntegrationInstructionsIcon },
  { id: 'debt', name: 'Technical Debt', icon: WarningIcon },
];

const TECHNOLOGY_VIEWS = [
  { id: 'radar', name: 'Technology Radar', icon: RadarIcon },
];

const VALUE_VIEWS = [
  { id: 'dashboard', name: 'Value Dashboard', icon: DashboardIcon },
  { id: 'benefits', name: 'Benefits Tracker', icon: TrendingUpIcon },
  { id: 'kpis', name: 'KPI Scorecard', icon: BarChartIcon },
  { id: 'trends', name: 'Trend Analysis', icon: TimelineIcon },
];

const RISK_VIEWS = [
  { id: 'register', name: 'Risk Register', icon: WarningIcon },
  { id: 'heatmap', name: 'Risk Heatmap', icon: BarChartIcon },
];

const ORG_VIEWS = [
  { id: 'chart', name: 'Org Chart', icon: AccountTreeIcon },
  { id: 'roles', name: 'Role Directory', icon: GroupsIcon },
  { id: 'raci', name: 'RACI Matrix', icon: BarChartIcon },
];

const DATA_VIEWS = [
  { id: 'products', name: 'Data Products', icon: StorageIcon },
  { id: 'contracts', name: 'Data Contracts', icon: GavelIcon },
  { id: 'domains', name: 'Data Domains', icon: DomainIcon },
];

export default function EnterpriseNavigator({
  activeModule = 'overview',
  activeView = null,
  onNavigate,
  onCreateItem,
}) {
  const {
    capabilities,
    services,
    products,
    applications,
    technologies,
    governance,
    risks,
    benefits,
    kpis,
    orgUnits,
    roles,
    dataProducts,
    dataContracts,
    dataDomains,
    stats,
  } = useEnterprise();

  // Calculate counts for each module
  const counts = useMemo(() => ({
    capabilities: capabilities.length,
    services: services.length,
    products: products.length,
    landscape: applications.length,
    technology: technologies.length,
    governance: governance.length,
    risk: risks.length,
    value: benefits.length + kpis.length,
    organisation: orgUnits.length + roles.length,
    data: (dataProducts?.length || 0) + (dataContracts?.length || 0) + (dataDomains?.length || 0),
  }), [capabilities, services, products, applications, technologies, governance, risks, benefits, kpis, orgUnits, roles, dataProducts, dataContracts, dataDomains]);

  // Total items
  const totalItems = useMemo(() => {
    return Object.values(counts).reduce((a, b) => a + b, 0);
  }, [counts]);

  return (
    <Navigator
      title="Enterprise"
      icon={DomainIcon}
      iconColor="#47453F"
      showHome={true}
      homeLabel="Dashboard"
      homeIcon={DashboardIcon}
      homeActive={activeModule === 'overview'}
      onHomeClick={() => onNavigate('overview')}
      createLabel="New Item"
      onCreate={onCreateItem}
    >
      {/* What We Have */}
      <NavGroup
        name="🏢 What We Have"
        count={counts.capabilities + counts.services + counts.products}
        defaultExpanded={true}
        hasActiveChild={['capabilities', 'services', 'products'].includes(activeModule)}
      >
        <NavItem
          icon={FlagIcon}
          label="Capabilities"
          count={counts.capabilities}
          color={ENTERPRISE_MODULES.capabilities.color}
          active={activeModule === 'capabilities'}
          onClick={() => onNavigate('capabilities')}
        />
        <NavItem
          icon={SettingsIcon}
          label="Services"
          count={counts.services}
          color={ENTERPRISE_MODULES.services.color}
          active={activeModule === 'services'}
          onClick={() => onNavigate('services')}
        />
        <NavItem
          icon={InventoryIcon}
          label="Products"
          count={counts.products}
          color={ENTERPRISE_MODULES.products.color}
          active={activeModule === 'products'}
          onClick={() => onNavigate('products')}
        />
      </NavGroup>

      {/* Technology Landscape */}
      <NavGroup
        name="💻 Technology"
        count={counts.landscape + counts.technology}
        defaultExpanded={false}
        hasActiveChild={['landscape', 'technology'].includes(activeModule)}
      >
        <NavItem
          icon={AppsIcon}
          label="Applications"
          count={counts.landscape}
          color={ENTERPRISE_MODULES.landscape.color}
          active={activeModule === 'landscape'}
          onClick={() => onNavigate('landscape')}
        />
        <NavItem
          icon={RadarIcon}
          label="Tech Radar"
          count={counts.technology}
          color={ENTERPRISE_MODULES.technology.color}
          active={activeModule === 'technology'}
          onClick={() => onNavigate('technology')}
        />
      </NavGroup>

      {/* Governance & Risk */}
      <NavGroup
        name="⚖️ Governance"
        count={counts.governance + counts.risk}
        defaultExpanded={false}
        hasActiveChild={['governance', 'risk'].includes(activeModule)}
      >
        <NavItem
          icon={GavelIcon}
          label="Policies"
          count={counts.governance}
          color={ENTERPRISE_MODULES.governance.color}
          active={activeModule === 'governance'}
          onClick={() => onNavigate('governance')}
        />
        <NavItem
          icon={WarningIcon}
          label="Risks"
          count={counts.risk}
          color={ENTERPRISE_MODULES.risk.color}
          active={activeModule === 'risk'}
          onClick={() => onNavigate('risk')}
        />
      </NavGroup>

      {/* Value & Performance */}
      <NavGroup
        name="📈 Value & Performance"
        count={counts.value}
        defaultExpanded={false}
        hasActiveChild={['value'].includes(activeModule)}
      >
        <NavItem
          icon={TrendingUpIcon}
          label="Benefits"
          count={benefits.length}
          color={ENTERPRISE_MODULES.value.color}
          active={activeModule === 'value' && activeView === 'benefits'}
          onClick={() => onNavigate('value', 'benefits')}
        />
        <NavItem
          icon={BarChartIcon}
          label="KPIs"
          count={kpis.length}
          color={ENTERPRISE_MODULES.value.color}
          active={activeModule === 'value' && activeView === 'kpis'}
          onClick={() => onNavigate('value', 'kpis')}
        />
        <NavItem
          icon={DashboardIcon}
          label="Dashboard"
          color={ENTERPRISE_MODULES.value.color}
          active={activeModule === 'value' && (!activeView || activeView === 'dashboard')}
          onClick={() => onNavigate('value', 'dashboard')}
        />
      </NavGroup>

      {/* Organisation */}
      <NavGroup
        name="👥 Organisation"
        count={counts.organisation}
        defaultExpanded={false}
        hasActiveChild={['organisation'].includes(activeModule)}
      >
        <NavItem
          icon={AccountTreeIcon}
          label="Org Chart"
          count={orgUnits.length}
          active={activeModule === 'organisation' && (!activeView || activeView === 'chart')}
          onClick={() => onNavigate('organisation', 'chart')}
        />
        <NavItem
          icon={GroupsIcon}
          label="Roles"
          count={roles.length}
          active={activeModule === 'organisation' && activeView === 'roles'}
          onClick={() => onNavigate('organisation', 'roles')}
        />
      </NavGroup>

      {/* Data Products (Data Mesh) */}
      <NavGroup
        name="📦 Data Products"
        count={counts.data}
        defaultExpanded={false}
        hasActiveChild={activeModule === 'data'}
      >
        <NavItem
          icon={StorageIcon}
          label="Products"
          count={dataProducts?.length || 0}
          color={ENTERPRISE_MODULES.data?.color}
          active={activeModule === 'data' && (!activeView || activeView === 'products')}
          onClick={() => onNavigate('data', 'products')}
        />
        <NavItem
          icon={GavelIcon}
          label="Contracts"
          count={dataContracts?.length || 0}
          color={ENTERPRISE_MODULES.data?.color}
          active={activeModule === 'data' && activeView === 'contracts'}
          onClick={() => onNavigate('data', 'contracts')}
        />
        <NavItem
          icon={DomainIcon}
          label="Domains"
          count={dataDomains?.length || 0}
          color={ENTERPRISE_MODULES.data?.color}
          active={activeModule === 'data' && activeView === 'domains'}
          onClick={() => onNavigate('data', 'domains')}
        />
      </NavGroup>

      {/* Analysis & Integration */}
      <NavGroup
        name="🔗 Analysis"
        defaultExpanded={false}
        hasActiveChild={activeModule === 'analysis'}
      >
        <NavItem
          icon={HubIcon}
          label="Cross-Space Links"
          active={activeModule === 'analysis' && activeView === 'cross-space'}
          onClick={() => onNavigate('analysis', 'cross-space')}
        />
        <NavItem
          icon={TimelineIcon}
          label="Change Impact"
          active={activeModule === 'analysis' && activeView === 'impact'}
          onClick={() => onNavigate('analysis', 'impact')}
        />
      </NavGroup>
    </Navigator>
  );
}

// Export view definitions for use in workspace
export {
  CAPABILITY_VIEWS,
  SERVICE_VIEWS,
  LANDSCAPE_VIEWS,
  TECHNOLOGY_VIEWS,
  VALUE_VIEWS,
  RISK_VIEWS,
  ORG_VIEWS,
  DATA_VIEWS,
  MODULE_ICONS,
};
