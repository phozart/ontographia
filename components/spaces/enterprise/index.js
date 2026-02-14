/**
 * Enterprise Studio - Index
 *
 * The "as-is" view of the organisation - what we have, how it performs
 *
 * Consolidates: EA (Enterprise Architecture) + CAP (Capabilities) + Value Realization
 *
 * @module components/spaces/enterprise
 */

// Context and hooks
export {
  EnterpriseProvider,
  useEnterprise,
  // Type definitions
  CAPABILITY_STATUS,
  MATURITY_LEVELS,
  STRATEGIC_IMPORTANCE,
  INVESTMENT_PRIORITY,
  SERVICE_TYPE,
  SERVICE_STATUS,
  SERVICE_TIER,
  APPLICATION_TYPE,
  APPLICATION_STATUS,
  APPLICATION_TIER,
  RADAR_RINGS,
  TECHNOLOGY_CATEGORIES,
  GOVERNANCE_TYPE,
  GOVERNANCE_STATUS,
  RISK_CATEGORY,
  RISK_STATUS,
  BENEFIT_TYPE,
  BENEFIT_STATUS,
  KPI_STATUS,
  ORG_UNIT_TYPE,
  ENTERPRISE_MODULES,
} from './EnterpriseContext';

// Main workspace
export { default as EnterpriseWorkspace } from './EnterpriseWorkspace';

// Navigator
export {
  default as EnterpriseNavigator,
  CAPABILITY_VIEWS,
  SERVICE_VIEWS,
  LANDSCAPE_VIEWS,
  TECHNOLOGY_VIEWS,
  VALUE_VIEWS,
  RISK_VIEWS,
  ORG_VIEWS,
  MODULE_ICONS,
} from './EnterpriseNavigator';

// Views
export { default as OverviewDashboard } from './views/OverviewDashboard';

// Capability module
export {
  CapabilityMap,
  CapabilityCard,
  CapabilityModal,
  MaturityHeatmap,
  GapAnalysis,
} from './capabilities';

// Services module
export {
  ServiceCatalog,
  ServiceCard,
} from './services';

// Landscape (Applications) module
export {
  ApplicationLandscape,
  ApplicationCard,
} from './landscape';

// Technology module
export {
  TechnologyRadar,
} from './technology';

// Value module
export {
  ValueDashboard,
} from './value';

// Governance module
export {
  GovernanceRegister,
  GovernanceCard,
} from './governance';

// Risk module
export {
  RiskRegister,
  RiskCard,
  RiskHeatmap,
} from './risk';

// Organisation module
export {
  OrgStructure,
  OrgUnitCard,
  RolesList,
} from './organisation';

// Products module
export {
  ProductPortfolio,
  ProductCard,
} from './products';
