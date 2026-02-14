/**
 * Project Studio - Main Exports
 *
 * Workspace for project lifecycle management with integrated change management.
 */

// Main workspace
export { default as ProjectWorkspace } from './ProjectWorkspace';
export { default as ProjectNavigator, VIEW_INFO } from './ProjectNavigator';
export { ProjectStudioProvider, useProjectStudio } from './ProjectContext';

// Overview
export { default as OverviewDashboard } from './OverviewDashboard';

// Stage views
export { default as StageView } from './StageView';

// Project management
export { default as ProjectModal } from './project/ProjectModal';
export { default as CreateTypeSelector } from './project/CreateTypeSelector';

// Planning views
export { default as WBSTree } from './planning/WBSTree';
export { default as ScheduleView } from './planning/ScheduleView';
export { default as MilestoneList } from './planning/MilestoneList';
export { default as ResourceAllocation } from './planning/ResourceAllocation';
export { default as BudgetTracker } from './planning/BudgetTracker';

// RAID views
export { default as RAIDDashboard } from './raid/RAIDDashboard';
export { default as RiskRegister } from './raid/RiskRegister';
export { default as IssueLog } from './raid/IssueLog';
export { default as DependencyMap } from './raid/DependencyMap';
export { default as DecisionLog } from './raid/DecisionLog';

// Change Management views
export { default as ChangeOverview } from './change/ChangeOverview';
export { default as ImpactAssessment } from './change/ImpactAssessment';
export { default as StakeholderEngagement } from './change/StakeholderEngagement';
export { default as CommunicationsPlan } from './change/CommunicationsPlan';
export { default as TrainingPlan } from './change/TrainingPlan';
export { default as ReadinessAssessment } from './change/ReadinessAssessment';

// Status & Reporting
export { default as StatusReport } from './status/StatusReport';

// Closure views
export { default as LessonsLearned } from './closure/LessonsLearned';
export { default as HandoverChecklist } from './closure/HandoverChecklist';
export { default as BenefitsBaseline } from './closure/BenefitsBaseline';

// Portfolio view
export { default as PortfolioDashboard } from './portfolio/PortfolioDashboard';

// Shared components
export { default as GuidancePanel } from './shared/GuidancePanel';
