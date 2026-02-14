// components/spaces/gtm/GTMWorkspace.js
// Main GTM Studio Workspace - Go-to-Market Planning
// Manages the launch and marketing of services/products from Enterprise Studio

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  useGTM,
  GTMProvider,
  GTM_MODULES,
  GTM_ARTEFACT_TYPES,
  GTM_STAGES
} from './GTMContext';
import GTMNavigator from './GTMNavigator';
import { WorkspaceLayout } from '../../ui';
import { DomainDashboard } from '../../shared/DomainDashboard';
import { useDomains } from '../../DomainContext';
import { useAuth } from '../../AuthContext';

// Module components
import OverviewDashboard from './views/OverviewDashboard';
import StrategyOverview from './strategy/StrategyOverview';
import PositioningCanvas from './strategy/PositioningCanvas';
import SegmentManager from './strategy/SegmentManager';
import PricingBuilder from './strategy/PricingBuilder';
import MessageHouse from './messaging/MessageHouse';
import KeyMessages from './messaging/KeyMessages';
import ObjectionHandler from './messaging/ObjectionHandler';
import LaunchOverview from './launch/LaunchOverview';
import ReadinessTracker from './launch/ReadinessTracker';
import MilestoneTimeline from './launch/MilestoneTimeline';
import CampaignList from './campaigns/CampaignList';
import CampaignCalendar from './campaigns/CampaignCalendar';
import MaterialsLibrary from './enablement/MaterialsLibrary';
import TrainingPlan from './enablement/TrainingPlan';
import MetricsDashboard from './metrics/MetricsDashboard';
import TargetTracker from './metrics/TargetTracker';

// Shared components
import GTMPlanModal from './plan/GTMPlanModal';
import GuidancePanel from './shared/GuidancePanel';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LinkIcon from '@mui/icons-material/Link';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CampaignIcon from '@mui/icons-material/Campaign';

// Dashboard config for GTM Studio
const GTM_DASHBOARD_CONFIG = {
  title: 'GTM Studio',
  subtitle: 'Go-to-Market plans across this domain',
  projectLabel: 'GTM Plans',
  projectLabelSingular: 'GTM Plan',
  emptyIcon: '\u{1F680}',
  emptyTitle: 'No GTM Plans Yet',
  emptyMessage: 'Create a GTM Plan to start planning your go-to-market strategy.',
  displayIdField: 'plan_id',
  statusField: 'status',
  countField: 'artefact_count',
  countLabel: 'items',
  showProgress: false,
};

// ============ MODULE VIEW COMPONENTS ============

// Strategy Module
function StrategyModule({ onSelectArtefact }) {
  const { getArtefactsByModule, createArtefact, updateArtefact, deleteArtefact, activeGTMPlan } = useGTM();
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className="gtm-module strategy-module">
      <div className="module-tabs">
        <button
          className={activeView === 'overview' ? 'active' : ''}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button
          className={activeView === 'positioning' ? 'active' : ''}
          onClick={() => setActiveView('positioning')}
        >
          Positioning
        </button>
        <button
          className={activeView === 'segments' ? 'active' : ''}
          onClick={() => setActiveView('segments')}
        >
          Segments
        </button>
        <button
          className={activeView === 'pricing' ? 'active' : ''}
          onClick={() => setActiveView('pricing')}
        >
          Pricing
        </button>
      </div>

      <div className="module-content">
        {activeView === 'overview' && (
          <StrategyOverview
            plan={activeGTMPlan}
            onSelect={onSelectArtefact}
            onNavigate={setActiveView}
          />
        )}
        {activeView === 'positioning' && (
          <PositioningCanvas
            plan={activeGTMPlan}
            onSave={(data) => updateArtefact(activeGTMPlan.id, { strategy: { ...activeGTMPlan.strategy, ...data } })}
          />
        )}
        {activeView === 'segments' && (
          <SegmentManager
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('Segment', {})}
          />
        )}
        {activeView === 'pricing' && (
          <PricingBuilder
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('PricingStrategy', {})}
          />
        )}
      </div>
    </div>
  );
}

// Messaging Module
function MessagingModule({ onSelectArtefact }) {
  const { getArtefactsByModule, createArtefact, activeGTMPlan, updateGTMPlan } = useGTM();
  const [activeView, setActiveView] = useState('house');

  return (
    <div className="gtm-module messaging-module">
      <div className="module-tabs">
        <button
          className={activeView === 'house' ? 'active' : ''}
          onClick={() => setActiveView('house')}
        >
          Message House
        </button>
        <button
          className={activeView === 'messages' ? 'active' : ''}
          onClick={() => setActiveView('messages')}
        >
          Key Messages
        </button>
        <button
          className={activeView === 'objections' ? 'active' : ''}
          onClick={() => setActiveView('objections')}
        >
          Objection Handling
        </button>
      </div>

      <div className="module-content">
        {activeView === 'house' && (
          <MessageHouse
            plan={activeGTMPlan}
            onSave={(data) => updateGTMPlan(activeGTMPlan.id, { messaging: { ...activeGTMPlan.messaging, ...data } })}
          />
        )}
        {activeView === 'messages' && (
          <KeyMessages
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('KeyMessage', {})}
          />
        )}
        {activeView === 'objections' && (
          <ObjectionHandler
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('Objection', {})}
          />
        )}
      </div>
    </div>
  );
}

// Launch Module
function LaunchModule({ onSelectArtefact }) {
  const { getArtefactsByModule, createArtefact, activeGTMPlan, calculateReadiness } = useGTM();
  const [activeView, setActiveView] = useState('overview');

  const readiness = calculateReadiness();

  return (
    <div className="gtm-module launch-module">
      <div className="module-tabs">
        <button
          className={activeView === 'overview' ? 'active' : ''}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button
          className={activeView === 'readiness' ? 'active' : ''}
          onClick={() => setActiveView('readiness')}
        >
          Readiness Tracker
        </button>
        <button
          className={activeView === 'milestones' ? 'active' : ''}
          onClick={() => setActiveView('milestones')}
        >
          Milestones
        </button>
      </div>

      <div className="module-content">
        {activeView === 'overview' && (
          <LaunchOverview
            plan={activeGTMPlan}
            readiness={readiness}
            onNavigate={setActiveView}
          />
        )}
        {activeView === 'readiness' && (
          <ReadinessTracker
            readiness={readiness}
            onSelect={onSelectArtefact}
            onCreate={(dimension) => createArtefact('ReadinessItem', { dimension })}
          />
        )}
        {activeView === 'milestones' && (
          <MilestoneTimeline
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('Milestone', {})}
          />
        )}
      </div>
    </div>
  );
}

// Campaigns Module
function CampaignsModule({ onSelectArtefact }) {
  const { getArtefactsByModule, createArtefact } = useGTM();
  const [activeView, setActiveView] = useState('list');

  return (
    <div className="gtm-module campaigns-module">
      <div className="module-tabs">
        <button
          className={activeView === 'list' ? 'active' : ''}
          onClick={() => setActiveView('list')}
        >
          Campaigns
        </button>
        <button
          className={activeView === 'calendar' ? 'active' : ''}
          onClick={() => setActiveView('calendar')}
        >
          Calendar
        </button>
        <button
          className={activeView === 'channels' ? 'active' : ''}
          onClick={() => setActiveView('channels')}
        >
          Channels
        </button>
      </div>

      <div className="module-content">
        {activeView === 'list' && (
          <CampaignList
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('Campaign', {})}
          />
        )}
        {activeView === 'calendar' && (
          <CampaignCalendar
            onSelect={onSelectArtefact}
          />
        )}
        {activeView === 'channels' && (
          <ChannelsPlaceholder
            onCreate={() => createArtefact('Channel', {})}
          />
        )}
      </div>
    </div>
  );
}

function ChannelsPlaceholder({ onCreate }) {
  return (
    <div className="gtm-placeholder-view">
      <div className="placeholder-icon">📡</div>
      <h3>Channels</h3>
      <p>Define and manage your go-to-market channels.</p>
      <button className="btn-primary" onClick={onCreate}>
        <AddIcon fontSize="small" />
        Add Channel
      </button>
    </div>
  );
}

// Enablement Module
function EnablementModule({ onSelectArtefact }) {
  const { getArtefactsByModule, createArtefact } = useGTM();
  const [activeView, setActiveView] = useState('materials');

  return (
    <div className="gtm-module enablement-module">
      <div className="module-tabs">
        <button
          className={activeView === 'materials' ? 'active' : ''}
          onClick={() => setActiveView('materials')}
        >
          Materials Library
        </button>
        <button
          className={activeView === 'training' ? 'active' : ''}
          onClick={() => setActiveView('training')}
        >
          Training
        </button>
      </div>

      <div className="module-content">
        {activeView === 'materials' && (
          <MaterialsLibrary
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('Material', {})}
          />
        )}
        {activeView === 'training' && (
          <TrainingPlan
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('Training', {})}
          />
        )}
      </div>
    </div>
  );
}

// Metrics Module
function MetricsModule({ onSelectArtefact }) {
  const { getArtefactsByModule, createArtefact } = useGTM();
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="gtm-module metrics-module">
      <div className="module-tabs">
        <button
          className={activeView === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveView('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeView === 'targets' ? 'active' : ''}
          onClick={() => setActiveView('targets')}
        >
          Targets
        </button>
      </div>

      <div className="module-content">
        {activeView === 'dashboard' && (
          <MetricsDashboard
            onSelect={onSelectArtefact}
          />
        )}
        {activeView === 'targets' && (
          <TargetTracker
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('Target', {})}
          />
        )}
      </div>
    </div>
  );
}

// ============ MAIN WORKSPACE CONTENT ============

function GTMWorkspaceContent({ view }) {
  const {
    activeModule,
    setActiveModule,
    activeGTMPlan,
    setActiveGTMPlan,
    loading,
    error
  } = useGTM();

  const { activeDomain } = useDomains();
  const { user, role } = useAuth();

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // Sync view from URL to context
  useEffect(() => {
    if (view && view !== activeModule) {
      // Map URL view to module (handles plural/singular variants)
      const viewToModule = {
        'overview': 'plan',
        'plans': 'plan',
        'plan': 'plan',
        'strategy': 'strategy',
        'messaging': 'messaging',
        'launch': 'launch',
        'campaigns': 'campaigns',
        'enablement': 'enablement',
        'metrics': 'metrics'
      };
      const targetModule = viewToModule[view] || 'plan';
      setActiveModule(targetModule);
    }
  }, [view, activeModule, setActiveModule]);

  const [selectedArtefact, setSelectedArtefact] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  // Domain-level dashboard state
  const [domainPlans, setDomainPlans] = useState([]);
  const [domainStats, setDomainStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Fetch domain-level data when no plan is selected
  useEffect(() => {
    if (activeGTMPlan || !activeDomain) return;

    const fetchDomainData = async () => {
      setDashboardLoading(true);
      setDashboardError(null);

      try {
        const res = await fetch(`/api/gtm/plans?domain_id=${activeDomain}`, { headers: authHeaders });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `GTM Plans: ${res.status}`);
        }
        const data = await res.json();
        setDomainPlans(data.plans || []);
        setDomainStats(data.stats);
      } catch (err) {
        console.error('Error fetching domain data:', err);
        setDashboardError(err.message);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDomainData();
  }, [activeGTMPlan, activeDomain, authHeaders]);

  const handleSelectArtefact = useCallback((artefact) => {
    setSelectedArtefact(artefact);
  }, []);

  const handleCreateArtefact = useCallback((type) => {
    console.log('Create artefact:', type);
  }, []);

  const handleCreatePlan = useCallback(() => {
    setShowPlanModal(true);
  }, []);

  // Build dashboard stats
  const dashboardStats = useMemo(() => {
    if (!domainStats) {
      return [
        { label: 'Plans', value: domainPlans.length, icon: '\u{1F680}' },
      ];
    }

    const byStage = domainStats.byStage || {};

    return [
      { label: 'Total Plans', value: domainStats.total || domainPlans.length, icon: '\u{1F680}' },
      { label: 'Active', value: byStage.active || 0, icon: '\u26A1' },
      { label: 'Planning', value: byStage.planning || 0, icon: '\u{1F4DD}' },
      { label: 'Ready', value: byStage.ready || 0, icon: '\u2705' },
      { label: 'Complete', value: byStage.complete || 0, icon: '\u{1F3C6}' },
    ];
  }, [domainStats, domainPlans.length]);

  // Quick actions for dashboard
  const dashboardQuickActions = useMemo(() => [
    {
      label: 'View Launches',
      icon: <RocketLaunchIcon fontSize="small" />,
      onClick: () => setActiveModule?.('launch'),
    },
    {
      label: 'Campaigns',
      icon: <CampaignIcon fontSize="small" />,
      onClick: () => setActiveModule?.('campaigns'),
    },
  ], [setActiveModule]);

  // Handler to select a plan from dashboard
  const handleDashboardSelectPlan = useCallback((plan) => {
    setActiveGTMPlan?.(plan);
    setActiveModule?.('plan');
  }, [setActiveGTMPlan, setActiveModule]);

  // Render module content based on active module
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'plan':
        return <OverviewDashboard onNavigate={setActiveModule} />;
      case 'strategy':
        return <StrategyModule onSelectArtefact={handleSelectArtefact} />;
      case 'messaging':
        return <MessagingModule onSelectArtefact={handleSelectArtefact} />;
      case 'launch':
        return <LaunchModule onSelectArtefact={handleSelectArtefact} />;
      case 'campaigns':
        return <CampaignsModule onSelectArtefact={handleSelectArtefact} />;
      case 'enablement':
        return <EnablementModule onSelectArtefact={handleSelectArtefact} />;
      case 'metrics':
        return <MetricsModule onSelectArtefact={handleSelectArtefact} />;
      default:
        return <OverviewDashboard onNavigate={setActiveModule} />;
    }
  };

  // View tabs for studio nav bar
  const views = [
    { id: 'plan', name: 'Overview', icon: '\u{1F4CB}' },
    { id: 'strategy', name: 'Strategy', icon: '\u{1F3AF}' },
    { id: 'messaging', name: 'Messaging', icon: '\u{1F4AC}' },
    { id: 'launch', name: 'Launch', icon: '\u{1F680}' },
    { id: 'campaigns', name: 'Campaigns', icon: '\u{1F4E3}' },
    { id: 'enablement', name: 'Enablement', icon: '\u{1F4DA}' },
    { id: 'metrics', name: 'Metrics', icon: '\u{1F4CA}' }
  ];

  if (loading) {
    return (
      <div className="gtm-loading">
        <div className="loading-spinner" />
        <p>Loading GTM Studio...</p>
      </div>
    );
  }

  // Render domain dashboard when no plan is selected
  if (!activeGTMPlan) {
    return (
      <>
        <DomainDashboard
          config={GTM_DASHBOARD_CONFIG}
          projects={domainPlans}
          stats={dashboardStats}
          loading={dashboardLoading}
          error={dashboardError}
          onSelectProject={handleDashboardSelectPlan}
          onCreateProject={handleCreatePlan}
          quickActions={dashboardQuickActions}
        />
        {showPlanModal && (
          <GTMPlanModal
            onClose={() => setShowPlanModal(false)}
            onSave={(plan) => {
              setShowPlanModal(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <WorkspaceLayout
      views={views}
      activeView={activeModule}
      onViewChange={setActiveModule}
      navigator={
        <GTMNavigator
          onCreateArtefact={handleCreateArtefact}
          onCreatePlan={handleCreatePlan}
        />
      }
      actions={
        <>
          <button
            className="workspace-action"
            onClick={() => setShowGuidance(!showGuidance)}
            title="Show guidance"
          >
            <HelpOutlineIcon fontSize="small" />
          </button>
          {activeGTMPlan?.links?.service && (
            <button
              className="workspace-action"
              onClick={() => {/* Navigate to Enterprise */}}
              title="View linked service"
            >
              <LinkIcon fontSize="small" />
            </button>
          )}
        </>
      }
      error={error}
      modals={
        <>
          {showPlanModal && (
            <GTMPlanModal
              onClose={() => setShowPlanModal(false)}
              onSave={(plan) => {
                setShowPlanModal(false);
              }}
            />
          )}
        </>
      }
    >
      <div className="gtm-workspace-content">
        {renderModuleContent()}

        {showGuidance && (
          <GuidancePanel
            module={activeModule}
            onClose={() => setShowGuidance(false)}
          />
        )}
      </div>
    </WorkspaceLayout>
  );
}

// ============ MAIN EXPORT ============

export default function GTMWorkspace({ view, domainId, projectId }) {
  // Note: Provider is now wrapped by SpacePageFactory
  // This component no longer wraps GTMProvider internally
  return <GTMWorkspaceContent view={view} domainId={domainId} projectId={projectId} />;
}

export { StrategyModule, MessagingModule, LaunchModule, CampaignsModule, EnablementModule, MetricsModule };
