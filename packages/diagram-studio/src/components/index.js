/**
 * Diagram Studio - Components Index
 * Re-exports all UI components
 */

// Collaboration components (Phase 1)
export { PresenceAvatars } from './PresenceAvatars.js';
export { RemoteCursors } from './RemoteCursors.js';
export {
  RemoteSelections,
  CollaboratorBadge,
} from './RemoteSelections.js';
export {
  ConnectionStatus,
  ReconnectButton,
  OfflineBanner,
  SyncStatus,
} from './ConnectionStatus.js';

// Canvas components (Phase 2)
export { FrameRenderer } from './canvas/FrameRenderer.js';

// Comments components (Phase 2)
export {
  CommentPins,
  ElementCommentBadge,
  CommentCreator,
} from './comments/CommentPin.js';
export { CommentsPanel } from './comments/CommentsPanel.js';

// Navigation components (Phase 2)
export {
  FrameNavigator,
  FrameStrip,
} from './navigation/FrameNavigator.js';
export {
  PresentationMode,
  usePresentationMode,
} from './navigation/PresentationMode.js';

// Command palette (Phase 2)
export {
  CommandPalette,
  useCommandPalette,
} from './CommandPalette.js';

// Board search (Phase 2)
export {
  BoardSearch,
  useBoardSearch,
} from './BoardSearch.js';

// Share dialog (Phase 2)
export {
  ShareDialog,
  useShareDialog,
} from './ShareDialog.js';

// Image upload (Phase 2)
export {
  DropZoneOverlay,
  ImageUploadButton,
  ImageElement,
  useImagePaste,
  useImageDragDrop,
  useImageUpload,
} from './ImageUpload.js';

// Export dialog (Phase 2)
export {
  ExportDialog,
  useExportDialog,
  ExportUtils,
  EXPORT_FORMATS,
  EXPORT_SCALES,
} from './ExportDialog.js';

// Role-based UI (Phase 2)
export {
  ROLES,
  PERMISSIONS,
  ROLE_HIERARCHY,
  hasPermission,
  meetsRoleRequirement,
  getRoleDisplayName,
  getRoleColor,
  RoleProvider,
  useRole,
  useActionAvailability,
  IfCan,
  IfRole,
  RequireRole,
  RoleBadge,
  ReadOnlyBanner,
  ReadOnlyOverlay,
  PermissionButton,
  EditToolbar,
  CommentToolbar,
  ManageToolbar,
} from './RoleBasedUI.js';

// Canvas performance (Phase 3)
export {
  LODElement,
  LODConnection,
  LODCanvas,
  LODStats,
  LOD_THRESHOLDS,
  getLODLevel,
  useLODLevel,
} from './canvas/LODRenderer.js';

// Version history (Phase 3)
export {
  VersionHistory,
  useVersionHistory,
} from './VersionHistory.js';

// Template gallery (Phase 3)
export {
  TemplateGallery,
  useTemplateGallery,
  TEMPLATE_CATEGORIES,
  DEFAULT_TEMPLATES,
} from './TemplateGallery.js';

// Public sharing (Phase 4)
export {
  SHARE_LINK_TYPES,
  EXPIRATION_OPTIONS,
  createShareLink,
  PublicShareProvider,
  usePublicShare,
  ShareLinkManager,
  PasswordPrompt,
  PublicBoardViewer,
} from './PublicShare.js';

// Embeddable board (Phase 4)
export {
  EMBED_OPTIONS,
  parseEmbedParams,
  generateEmbedUrl,
  generateEmbedCode,
  EmbedWrapper,
  EmbedToolbar,
  useEmbedMode,
  useEmbedMessaging,
  useEmbedController,
  EmbedCodeGenerator,
} from './EmbeddableBoard.js';

// Voting and timers (Phase 4)
export {
  VOTE_TYPES,
  TIMER_TYPES,
  DEFAULT_REACTIONS,
  createVotingSession,
  VotingProvider,
  useVoting,
  useElementVoting,
  DotVotingBadge,
  ReactionVoting,
  TimerProvider,
  useTimers,
  TimerDisplay,
  FloatingTimer,
} from './VotingAndTimers.js';

// Analytics dashboard (Phase 4)
export {
  METRIC_TYPES,
  TIME_PERIODS,
  getDateRange,
  useAnalytics,
  MetricCard,
  BarChart,
  LineChart,
  ActivityHeatmap,
  Leaderboard,
  AnalyticsDashboard,
} from './AnalyticsDashboard.js';
