/**
 * Services Index
 *
 * Export all service modules for easy importing
 *
 * @module lib/services
 */

export { EAAggregationService, eaAggregationService, AGGREGATION_SOURCES, TYPE_MAPPINGS } from './EAAggregationService';
export { OpenRouterService, openRouterService, OPENROUTER_MODELS, DEFAULT_MODEL } from './OpenRouterService';
export { emitEvent, getEventsByEntity, getEventsByDomain, getEventCount, getEventsByCorrelation, EVENT_TYPES } from './innovationEvents';
export { syncInitiativeToGraph, syncProductIdeaToGraph, createGraphRelationship, removeGraphNode, updateGraphNodeProperties } from './blueprintGraphSync';
export { createInitiativeFromCapabilityGap, getInitiativesForCapability, getCapabilityGapForInitiative } from './eaBlueprintBridge';
export { createNotification, getNotifications, markAsRead, markAllAsRead, getUnreadCount, deleteNotification, checkAndNotifySLA, NOTIFICATION_TYPES } from './notificationService';
export { emitAnalysisEvent, getAnalysisEventsByEntity, getAnalysisEventsByProject, getAnalysisEventsByDomain, getAnalysisEventCount, ANALYSIS_EVENT_TYPES } from './analysisEvents';
export { syncArtefactToGraph, syncAnalysisProjectToGraph, syncAnalysisRelationship, removeArtefactFromGraph, removeAnalysisRelationshipFromGraph, updateArtefactGraphProperties } from './analysisGraphSync';
export { writeOutboxEvent, writeOutboxEvents, enqueueOutboxEvent, enqueueOutboxEvents, processOutbox, getOutboxStats, cleanupProcessed, ensureOutboxTable, OUTBOX_ACTIONS } from './outboxService';
