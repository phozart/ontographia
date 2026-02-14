/**
 * EnterpriseWorkspace - Main workspace for Enterprise Studio
 *
 * The "as-is" view of the organisation - what we have, how it performs,
 * and the value we've realized.
 *
 * Consolidates: EA (Enterprise Architecture) + CAP (Capabilities) + Value Realization
 *
 * @module components/spaces/enterprise/EnterpriseWorkspace
 */

import { useState, useCallback, useMemo } from 'react';
import { useEnterprise, ENTERPRISE_MODULES } from './EnterpriseContext';
import EnterpriseNavigator, { MODULE_ICONS } from './EnterpriseNavigator';
import {
  WorkspaceLayout,
  ViewHeader,
  Button,
  EmptyState,
  Card,
  SummaryBar,
  SummaryItem,
} from '@/components/ui';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
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
import DomainIcon from '@mui/icons-material/Domain';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';

// Import module views
import OverviewDashboard from './views/OverviewDashboard';
import { CapabilityMap, MaturityHeatmap, GapAnalysis } from './capabilities';
import { ServiceCatalog } from './services';
import { ApplicationLandscape } from './landscape';
import { TechnologyRadar } from './technology';
import { ValueDashboard } from './value';
import { GovernanceRegister } from './governance';
import { RiskRegister, RiskHeatmap } from './risk';
import { OrgStructure, RolesList } from './organisation';
import { ProductPortfolio } from './products';
import { DataProductCatalog, DataContractEditor, DataDomainPanel } from './data';

// Styles
import styles from './enterprise.module.css';

/**
 * Module quick stats cards for dashboard
 */
function ModuleCard({ module, count, onClick }) {
  const Icon = MODULE_ICONS[module.id] || DashboardIcon;

  return (
    <div
      className={styles.moduleCard}
      onClick={onClick}
      style={{ '--module-color': module.color || '#47453F' }}
    >
      <div className={styles.moduleCardIcon}>
        <Icon />
      </div>
      <div className={styles.moduleCardContent}>
        <span className={styles.moduleCardCount}>{count}</span>
        <span className={styles.moduleCardName}>{module.name}</span>
      </div>
      <p className={styles.moduleCardDesc}>{module.description}</p>
    </div>
  );
}

/**
 * Simple list view for module items
 */
function SimpleListView({ items, module, onItemClick, onCreateItem }) {
  const Icon = MODULE_ICONS[module] || DashboardIcon;
  const moduleInfo = ENTERPRISE_MODULES[module];

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={Icon}
        title={`No ${moduleInfo?.name || 'Items'} Yet`}
        message={`Start by adding your first ${(moduleInfo?.name || 'item').toLowerCase()}.`}
        action={{
          label: `Add ${moduleInfo?.name?.replace(/s$/, '') || 'Item'}`,
          onClick: onCreateItem,
        }}
      />
    );
  }

  return (
    <div className={styles.listView}>
      {items.map(item => (
        <Card
          key={item.id}
          className={styles.itemCard}
          onClick={() => onItemClick?.(item)}
        >
          <div className={styles.itemCardHeader}>
            <span className={styles.itemCardName}>{item.name}</span>
            {item.status && (
              <span className={`${styles.itemCardStatus} ${styles[item.status]}`}>
                {item.status}
              </span>
            )}
          </div>
          {item.description && (
            <p className={styles.itemCardDesc}>{item.description}</p>
          )}
        </Card>
      ))}
    </div>
  );
}

/**
 * Main Enterprise Workspace Component
 */
export default function EnterpriseWorkspace() {
  const {
    // Data
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
    totalItems,

    // UI State
    activeModule,
    setActiveModule,
    selectedId,
    setSelectedId,
    loading,
    error,
    saving,
    setError,

    // Operations
    refreshData,
    createArtefact,
    updateArtefact,
    deleteArtefact,
  } = useEnterprise();

  // Local UI state
  const [activeView, setActiveView] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Navigation handler
  const handleNavigate = useCallback((module, view = null) => {
    setActiveModule(module);
    setActiveView(view);
    setSelectedId(null);
  }, [setActiveModule, setSelectedId]);

  // Create item handler
  const handleCreateItem = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  // Get current module data
  const getCurrentModuleData = useCallback(() => {
    switch (activeModule) {
      case 'capabilities':
        return capabilities;
      case 'services':
        return services;
      case 'products':
        return products;
      case 'landscape':
        return applications;
      case 'technology':
        return technologies;
      case 'governance':
        return governance;
      case 'risk':
        return risks;
      case 'value':
        if (activeView === 'benefits') return benefits;
        if (activeView === 'kpis') return kpis;
        return [...benefits, ...kpis];
      case 'organisation':
        if (activeView === 'roles') return roles;
        return orgUnits;
      case 'data':
        if (activeView === 'contracts') return dataContracts || [];
        if (activeView === 'domains') return dataDomains || [];
        return dataProducts || [];
      default:
        return [];
    }
  }, [activeModule, activeView, capabilities, services, products, applications, technologies, governance, risks, benefits, kpis, orgUnits, roles, dataProducts, dataContracts, dataDomains]);

  // Get module info
  const currentModule = ENTERPRISE_MODULES[activeModule] || ENTERPRISE_MODULES.overview;
  const CurrentIcon = MODULE_ICONS[activeModule] || DashboardIcon;
  const moduleData = getCurrentModuleData();

  // Render current view
  const renderCurrentView = () => {
    switch (activeModule) {
      case 'overview':
        return (
          <OverviewDashboard
            stats={stats}
            onNavigate={handleNavigate}
            modules={ENTERPRISE_MODULES}
            counts={{
              capabilities: capabilities.length,
              services: services.length,
              products: products.length,
              applications: applications.length,
              technologies: technologies.length,
              governance: governance.length,
              risks: risks.length,
              benefits: benefits.length,
              kpis: kpis.length,
              orgUnits: orgUnits.length,
              roles: roles.length,
              dataProducts: (dataProducts || []).length,
              dataContracts: (dataContracts || []).length,
              dataDomains: (dataDomains || []).length,
            }}
          />
        );

      case 'capabilities':
        if (activeView === 'heatmap') return <MaturityHeatmap />;
        if (activeView === 'gap-analysis') return <GapAnalysis />;
        return <CapabilityMap />;

      case 'services':
        return <ServiceCatalog />;

      case 'products':
        return <ProductPortfolio />;

      case 'landscape':
        return <ApplicationLandscape />;

      case 'technology':
        return <TechnologyRadar />;

      case 'governance':
        return <GovernanceRegister />;

      case 'risk':
        if (activeView === 'heatmap') return <RiskHeatmap />;
        return <RiskRegister />;

      case 'value':
        return <ValueDashboard />;

      case 'organisation':
        if (activeView === 'roles') return <RolesList />;
        return <OrgStructure />;

      case 'data':
        if (activeView === 'contracts') return <DataContractEditor />;
        if (activeView === 'domains') return <DataDomainPanel />;
        return <DataProductCatalog />;

      case 'analysis':
        return (
          <div className={styles.moduleView}>
            <ViewHeader
              icon={DomainIcon}
              iconColor="#47453F"
              title="Cross-Space Analysis"
              description="Trace relationships across the enterprise"
            />

            <EmptyState
              icon={DomainIcon}
              title="Analysis Views Coming Soon"
              message="Cross-space relationship analysis and change impact views are under development."
            />
          </div>
        );

      default:
        return (
          <EmptyState
            icon={DashboardIcon}
            title="Select a Module"
            message="Choose a module from the navigation to get started."
          />
        );
    }
  };

  return (
    <WorkspaceLayout
      navigator={
        <EnterpriseNavigator
          activeModule={activeModule}
          activeView={activeView}
          onNavigate={handleNavigate}
          onCreateItem={handleCreateItem}
        />
      }
      error={error}
      modals={null}
    >
      <div className={styles.workspace}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner} />
            <p>Loading enterprise data...</p>
          </div>
        )}

        {renderCurrentView()}
      </div>
    </WorkspaceLayout>
  );
}
