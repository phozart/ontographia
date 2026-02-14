// components/spaces/blueprint/index.js
// Blueprint Studio exports

export { BlueprintProvider, useBlueprint } from './BlueprintContext';
export { default as BlueprintWorkspace } from './BlueprintWorkspace';
export { default as BlueprintNavigator, VIEW_INFO } from './BlueprintNavigator';

// Re-export type definitions
export {
  BPS_STAGES,
  BPS_STAGE_INFO,
  BPS_HORIZONS,
  BPS_SCORING_CRITERIA,
  BPS_RECOMMENDATIONS,
  BPS_GATE_DECISIONS,
  BPS_KILL_CRITERIA,
  BPS_STAGE_SLAS,
  BPS_INVESTMENT_THRESHOLDS,
  BPS_IDEA_SOURCES,
  BPS_PESTLE_CATEGORIES,
} from './BlueprintContext';
