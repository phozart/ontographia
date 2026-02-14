/**
 * SDWorkspace - System Dynamics Workspace wrapper
 *
 * This wraps the legacy SystemDynamicsStudio component for the new
 * /app/spaces/sd route structure.
 *
 * TODO: Refactor the actual workspace logic out of pages/system-dynamics.js
 * into this component for better separation of concerns.
 */

// Re-export the legacy component for now
// The actual logic is in pages/system-dynamics.js (5400+ lines)
export { default } from '../../../pages/system-dynamics';
