// components/spaces/gtm/index.js
// GTM Studio exports

// Core components
export { default as GTMWorkspace } from './GTMWorkspace';
export { GTMProvider, useGTM, GTM_STAGES, GTM_MODULES, GTM_ARTEFACT_TYPES,
         CAMPAIGN_TYPES, LAUNCH_TYPES, PRICING_MODELS, MATERIAL_TYPES,
         READINESS_DIMENSIONS } from './GTMContext';
export { default as GTMNavigator } from './GTMNavigator';

// Plan components
export { default as GTMPlanModal } from './plan/GTMPlanModal';
export { default as GTMPlanCard } from './plan/GTMPlanCard';
export { default as GTMPlanDetail } from './plan/GTMPlanDetail';
export { default as StageIndicator } from './plan/StageIndicator';

// Strategy components
export { default as StrategyOverview } from './strategy/StrategyOverview';
export { default as PositioningCanvas } from './strategy/PositioningCanvas';
export { default as SegmentManager } from './strategy/SegmentManager';
export { default as PricingBuilder } from './strategy/PricingBuilder';

// Messaging components
export { default as MessageHouse } from './messaging/MessageHouse';
export { default as KeyMessages } from './messaging/KeyMessages';
export { default as ObjectionHandler } from './messaging/ObjectionHandler';

// Launch components
export { default as LaunchOverview } from './launch/LaunchOverview';
export { default as ReadinessTracker } from './launch/ReadinessTracker';
export { default as MilestoneTimeline } from './launch/MilestoneTimeline';

// Campaign components
export { default as CampaignList } from './campaigns/CampaignList';
export { default as CampaignCard } from './campaigns/CampaignCard';
export { default as CampaignBuilder } from './campaigns/CampaignBuilder';
export { default as CampaignCalendar } from './campaigns/CampaignCalendar';
export { default as CampaignMetrics } from './campaigns/CampaignMetrics';
export { default as UTMBuilder } from './campaigns/UTMBuilder';
export { default as ROIModeler } from './campaigns/ROIModeler';
export { default as ABTestManager } from './campaigns/ABTestManager';
export { default as RetrospectiveWizard } from './campaigns/RetrospectiveWizard';
export { default as DependencyGantt } from './campaigns/DependencyGantt';
export { default as WorkflowEditor } from './campaigns/WorkflowEditor';

// Analytics components
export { AudienceOverlap, FatigueMonitor, AttributionDashboard, CannibalizationView } from './analytics';

// Enablement components
export { default as MaterialsLibrary } from './enablement/MaterialsLibrary';
export { default as MaterialCard } from './enablement/MaterialCard';
export { default as TrainingPlan } from './enablement/TrainingPlan';
export { default as CollateralManager } from './enablement/CollateralManager';

// Metrics components
export { default as MetricsDashboard } from './metrics/MetricsDashboard';
export { default as TargetTracker } from './metrics/TargetTracker';
export { default as TrendAnalysis } from './metrics/TrendAnalysis';

// Views
export { default as OverviewDashboard } from './views/OverviewDashboard';
export { default as LaunchCalendar } from './views/LaunchCalendar';
export { default as ContentLibrary } from './views/ContentLibrary';

// Shared components
export { default as GuidancePanel } from './shared/GuidancePanel';
