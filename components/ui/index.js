// components/ui/index.js
// Shared UI Components - Single source of truth for common UI patterns

export { Button, IconButton, ButtonGroup } from './Button';
export { ViewHeader } from './ViewHeader';
export { ControlsBar, SearchBox, FilterSelect, ViewToggle, CheckboxFilter } from './ControlsBar';
export { Card } from './Card';
export { Navigator, NavGroup, NavItem } from './Navigator';
export { EmptyState, QuickStart, EmptyFiltered } from './EmptyState';
export {
  Skeleton,
  TextSkeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  FormSkeleton,
  NavigatorSkeleton,
  DashboardSkeleton,
  KanbanSkeleton,
  PageSkeleton,
} from './Skeleton';
export { SummaryBar, SummaryItem } from './SummaryBar';
export { ListView, ListRow, ListContainer, Timeline, ContentArea, Placeholder } from './ListView';
export { ContextMenu, useContextMenu } from './ContextMenu';
export {
  WorkspaceLayout,
  Breadcrumb,
  BreadcrumbSeparator,
  Breadcrumbs,
  NavigatorHeader,
  NavigatorContent,
  NavItem as WorkspaceNavItem
} from './WorkspaceLayout';
export { Modal, ConfirmModal } from './Modal';
export { ToastProvider, useToast, Alert, Banner } from './Toast';
export { FormField, FormGroup, FormRow, FormActions, ArrayField } from './FormField';
export { StatsPanel, StatItem, LegendItem, StatGroup, StatDivider, MiniChart } from './StatsPanel';

// Visual/Chart Components
export { ProgressCard, ProgressCardGroup, MiniProgressCard } from './ProgressCard';
export { HeatMap, RiskHeatMap, StakeholderMatrix } from './HeatMap';
export { RadialChart, HealthWheel, DistributionChart } from './RadialChart';
export { KanbanBoard, KanbanCard, AssumptionBoard, IssueBoard } from './KanbanBoard';
export { GanttTimeline, ProjectTimeline } from './GanttTimeline';
export { ForceGraph, DependencyGraph, RelationshipGraph } from './ForceGraph';

// Re-export styles for components that need direct access
export { default as uiStyles } from './ui.module.css';
export { default as workspaceStyles } from './WorkspaceLayout.module.css';
