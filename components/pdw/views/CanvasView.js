// components/pdw/views/CanvasView.js
// My Canvases - Shows existing canvases in their actual visual format with export

import { useState, useMemo, useCallback, useRef } from 'react';
import { usePDW } from '../PDWContext';
import styles from '../PDWWorkspace.module.css';

// Shared UI Components
import {
  Button,
  IconButton,
  ViewHeader,
  QuickStart,
} from '../../ui';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PeopleIcon from '@mui/icons-material/People';
import GridViewIcon from '@mui/icons-material/GridView';
import BusinessIcon from '@mui/icons-material/Business';
import DiamondIcon from '@mui/icons-material/Diamond';
import SecurityIcon from '@mui/icons-material/Security';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import BuildIcon from '@mui/icons-material/Build';
import PaletteIcon from '@mui/icons-material/Palette';
import DashboardIcon from '@mui/icons-material/Dashboard';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

// ============================================================================
// CANVAS TYPE CONFIGURATIONS
// ============================================================================

const CANVAS_CONFIGS = {
  pdw_lean_canvas: {
    name: 'Lean Canvas',
    icon: GridViewIcon,
    color: '#6366f1',
    description: 'One-page business model for problem/solution fit',
    guidance: {
      purpose: 'Document your business model hypothesis on a single page',
      tips: [
        'Start with Problem - if no real problem, nothing else matters',
        'Focus on your unique value proposition - what makes you different?',
        'Identify your unfair advantage - what cannot be easily copied?',
      ],
    },
    fields: [
      { key: 'problem', label: 'Problem', color: '#ef4444' },
      { key: 'existing_alternatives', label: 'Existing Alternatives', color: '#f97316' },
      { key: 'solution', label: 'Solution', color: '#3b82f6' },
      { key: 'key_metrics', label: 'Key Metrics', color: '#06b6d4' },
      { key: 'unique_value_proposition', label: 'Unique Value Prop', color: '#8b5cf6' },
      { key: 'high_level_concept', label: 'High-Level Concept', color: '#a855f7' },
      { key: 'unfair_advantage', label: 'Unfair Advantage', color: '#f59e0b' },
      { key: 'channels', label: 'Channels', color: '#14b8a6' },
      { key: 'customer_segments', label: 'Customer Segments', color: '#10b981' },
      { key: 'early_adopters', label: 'Early Adopters', color: '#22c55e' },
      { key: 'cost_structure', label: 'Cost Structure', color: '#64748b' },
      { key: 'revenue_streams', label: 'Revenue Streams', color: '#22c55e' },
    ],
  },
  pdw_empathy_map: {
    name: 'Empathy Map',
    icon: PeopleIcon,
    color: '#06b6d4',
    description: 'Understand what users think, feel, say, and do',
    guidance: {
      purpose: 'Build empathy by synthesizing user research into a visual map',
      tips: [
        'Base this on real user research, not assumptions',
        'Use direct quotes in the "Says" section',
        'Look for contradictions between what users say and do',
      ],
    },
    fields: [
      { key: 'thinks', label: 'Thinks', color: '#ec4899' },
      { key: 'feels', label: 'Feels', color: '#f59e0b' },
      { key: 'says', label: 'Says', color: '#6366f1' },
      { key: 'does', label: 'Does', color: '#22c55e' },
      { key: 'pains', label: 'Pains', color: '#ef4444' },
      { key: 'gains', label: 'Gains', color: '#10b981' },
    ],
  },
  pdw_swot: {
    name: 'SWOT Analysis',
    icon: SecurityIcon,
    color: '#8b5cf6',
    description: 'Assess strengths, weaknesses, opportunities, threats',
    guidance: {
      purpose: 'Strategic analysis of internal and external factors',
      tips: [
        'Strengths & Weaknesses are internal (you can control)',
        'Opportunities & Threats are external (market/environment)',
        'Be honest about weaknesses - they are growth opportunities',
      ],
    },
    fields: [
      { key: 'strengths', label: 'Strengths', color: '#22c55e' },
      { key: 'weaknesses', label: 'Weaknesses', color: '#ef4444' },
      { key: 'opportunities', label: 'Opportunities', color: '#3b82f6' },
      { key: 'threats', label: 'Threats', color: '#f59e0b' },
    ],
  },
  pdw_vp_canvas: {
    name: 'Value Proposition Canvas',
    icon: DiamondIcon,
    color: '#4338ca',
    description: 'Design value propositions that customers want',
    guidance: {
      purpose: 'Ensure your product creates value that customers care about',
      tips: [
        'Start with Customer Profile (right side) before Value Map',
        'Each Pain Reliever should address a specific Customer Pain',
        'Each Gain Creator should enable a specific Customer Gain',
      ],
    },
    fields: [
      { key: 'customer_jobs', label: 'Customer Jobs', side: 'customer', color: '#6366f1' },
      { key: 'customer_pains', label: 'Customer Pains', side: 'customer', color: '#ef4444' },
      { key: 'customer_gains', label: 'Customer Gains', side: 'customer', color: '#22c55e' },
      { key: 'products_services', label: 'Products & Services', side: 'value', color: '#10b981' },
      { key: 'pain_relievers', label: 'Pain Relievers', side: 'value', color: '#14b8a6' },
      { key: 'gain_creators', label: 'Gain Creators', side: 'value', color: '#22c55e' },
    ],
  },
  pdw_bmc_canvas: {
    name: 'Business Model Canvas',
    icon: BusinessIcon,
    color: '#4f46e5',
    description: 'Comprehensive 9-block business model visualization',
    guidance: {
      purpose: 'Map out your complete business model',
      tips: [
        'Start with Value Proposition and Customer Segments',
        'Channels and Customer Relationships connect you to customers',
        'Revenue Streams should exceed Cost Structure',
      ],
    },
    fields: [
      { key: 'key_partners', label: 'Key Partners', color: '#8b5cf6' },
      { key: 'key_activities', label: 'Key Activities', color: '#6366f1' },
      { key: 'key_resources', label: 'Key Resources', color: '#3b82f6' },
      { key: 'value_propositions', label: 'Value Propositions', color: '#ec4899' },
      { key: 'customer_relationships', label: 'Customer Relationships', color: '#f59e0b' },
      { key: 'channels', label: 'Channels', color: '#14b8a6' },
      { key: 'customer_segments', label: 'Customer Segments', color: '#22c55e' },
      { key: 'cost_structure', label: 'Cost Structure', color: '#64748b' },
      { key: 'revenue_streams', label: 'Revenue Streams', color: '#10b981' },
    ],
  },
  pdw_persona: {
    name: 'User Persona',
    icon: PersonIcon,
    color: '#0e7490',
    description: 'Create a representative user archetype',
    guidance: {
      purpose: 'Create a shared understanding of your target user',
      tips: [
        'Base personas on real research, not assumptions',
        'Give them a memorable name and photo',
        'Focus on goals and frustrations, not demographics',
      ],
    },
    fields: [
      { key: 'name', label: 'Name', color: '#0e7490' },
      { key: 'role', label: 'Role/Title', color: '#06b6d4' },
      { key: 'demographics', label: 'Demographics', color: '#64748b' },
      { key: 'goals', label: 'Goals', color: '#22c55e' },
      { key: 'frustrations', label: 'Frustrations', color: '#ef4444' },
      { key: 'bio', label: 'Bio', color: '#6366f1' },
      { key: 'quote', label: 'Quote', color: '#8b5cf6' },
    ],
  },
  pdw_jtbd_canvas: {
    name: 'Jobs To Be Done',
    icon: WorkIcon,
    color: '#155e75',
    description: 'Understand the job users are trying to accomplish',
    guidance: {
      purpose: 'Focus on what users are trying to achieve, not features',
      tips: [
        'Write job statements: When I [situation], I want to [motivation], so I can [outcome]',
        'Identify functional, emotional, and social jobs',
        'Look at current solutions and their shortcomings',
      ],
    },
    fields: [
      { key: 'job_statement', label: 'Job Statement', color: '#155e75' },
      { key: 'current_solutions', label: 'Current Solutions', color: '#64748b' },
      { key: 'success_criteria', label: 'Success Criteria', color: '#22c55e' },
      { key: 'constraints', label: 'Constraints', color: '#f59e0b' },
      { key: 'emotional_jobs', label: 'Emotional Jobs', color: '#ec4899' },
      { key: 'social_jobs', label: 'Social Jobs', color: '#8b5cf6' },
    ],
  },
  pdw_customer_journey: {
    name: 'Customer Journey Map',
    icon: PeopleIcon,
    color: '#0891b2',
    description: 'Map the customer experience across touchpoints',
    guidance: {
      purpose: 'Visualize the end-to-end customer experience with your product/service',
      tips: [
        'Define clear stages (Awareness, Consideration, Decision, etc.)',
        'Capture emotions at each stage - highs and lows',
        'Identify pain points and opportunities for improvement',
      ],
    },
    fields: [
      { key: 'persona', label: 'Persona', color: '#0891b2' },
      { key: 'scenario', label: 'Scenario', color: '#06b6d4' },
      { key: 'stages', label: 'Journey Stages', color: '#22c55e' },
      { key: 'actions', label: 'Customer Actions', color: '#3b82f6' },
      { key: 'touchpoints', label: 'Touchpoints', color: '#8b5cf6' },
      { key: 'emotions', label: 'Emotions', color: '#ec4899' },
      { key: 'pain_points', label: 'Pain Points', color: '#ef4444' },
      { key: 'opportunities', label: 'Opportunities', color: '#10b981' },
    ],
  },
  pdw_stakeholder_map: {
    name: 'Stakeholder Map',
    icon: PeopleIcon,
    color: '#7c3aed',
    description: 'Identify and analyze key stakeholders',
    guidance: {
      purpose: 'Map stakeholder influence and interest to manage relationships',
      tips: [
        'Categorize by influence level (high/low) and interest level (high/low)',
        'Identify key players, keep satisfied, keep informed, monitor',
        'Define engagement strategy for each group',
      ],
    },
    fields: [
      { key: 'key_players', label: 'Key Players (High Influence, High Interest)', color: '#22c55e' },
      { key: 'keep_satisfied', label: 'Keep Satisfied (High Influence, Low Interest)', color: '#f59e0b' },
      { key: 'keep_informed', label: 'Keep Informed (Low Influence, High Interest)', color: '#3b82f6' },
      { key: 'monitor', label: 'Monitor (Low Influence, Low Interest)', color: '#64748b' },
      { key: 'engagement_strategy', label: 'Engagement Strategy', color: '#7c3aed' },
    ],
  },
  pdw_assumption_map: {
    name: 'Assumption Map',
    icon: LightbulbIcon,
    color: '#d97706',
    description: 'Identify and prioritize assumptions to test',
    guidance: {
      purpose: 'Map assumptions by importance and uncertainty to prioritize testing',
      tips: [
        'List all assumptions about customers, problem, and solution',
        'Rate each by importance (how critical) and uncertainty (how unknown)',
        'Focus on high importance + high uncertainty first',
      ],
    },
    fields: [
      { key: 'critical_unknowns', label: 'Critical Unknowns (Test First)', color: '#ef4444' },
      { key: 'important_knowns', label: 'Important Known Assumptions', color: '#22c55e' },
      { key: 'nice_to_know', label: 'Nice to Know', color: '#3b82f6' },
      { key: 'low_priority', label: 'Low Priority', color: '#64748b' },
    ],
  },
  pdw_test_card: {
    name: 'Test Card',
    icon: GridViewIcon,
    color: '#059669',
    description: 'Design experiments to test assumptions',
    guidance: {
      purpose: 'Structure experiments with clear hypothesis and success criteria',
      tips: [
        'State your hypothesis clearly and specifically',
        'Define what you will measure and success criteria',
        'Keep experiments small and fast',
      ],
    },
    fields: [
      { key: 'hypothesis', label: 'We believe that...', color: '#059669' },
      { key: 'test', label: 'To verify, we will...', color: '#3b82f6' },
      { key: 'metric', label: 'We will measure...', color: '#8b5cf6' },
      { key: 'criteria', label: 'We are right if...', color: '#22c55e' },
      { key: 'timeline', label: 'Timeline', color: '#64748b' },
      { key: 'resources', label: 'Resources Needed', color: '#f59e0b' },
    ],
  },
  pdw_learning_card: {
    name: 'Learning Card',
    icon: LightbulbIcon,
    color: '#0ea5e9',
    description: 'Capture insights from experiments',
    guidance: {
      purpose: 'Document what you learned from running experiments',
      tips: [
        'Be honest about whether hypothesis was validated or not',
        'Capture both quantitative and qualitative learnings',
        'Define clear next steps based on learnings',
      ],
    },
    fields: [
      { key: 'hypothesis_tested', label: 'We believed that...', color: '#64748b' },
      { key: 'observations', label: 'We observed...', color: '#3b82f6' },
      { key: 'learnings', label: 'From that we learned...', color: '#0ea5e9' },
      { key: 'validated', label: 'Validated/Invalidated', color: '#22c55e' },
      { key: 'next_steps', label: 'Therefore we will...', color: '#8b5cf6' },
    ],
  },
  pdw_experiment_canvas: {
    name: 'Experiment Canvas',
    icon: GridViewIcon,
    color: '#16a34a',
    description: 'Comprehensive experiment planning',
    guidance: {
      purpose: 'Plan and track experiments in detail',
      tips: [
        'Start with the riskiest assumption',
        'Design the minimum viable experiment',
        'Commit to action based on results before running',
      ],
    },
    fields: [
      { key: 'assumption', label: 'Assumption', color: '#ef4444' },
      { key: 'hypothesis', label: 'Hypothesis', color: '#16a34a' },
      { key: 'experiment_type', label: 'Experiment Type', color: '#3b82f6' },
      { key: 'method', label: 'Method', color: '#8b5cf6' },
      { key: 'metrics', label: 'Metrics', color: '#06b6d4' },
      { key: 'success_criteria', label: 'Success Criteria', color: '#22c55e' },
      { key: 'timeline', label: 'Timeline', color: '#64748b' },
      { key: 'results', label: 'Results', color: '#f59e0b' },
      { key: 'decision', label: 'Decision', color: '#ec4899' },
    ],
  },
  pdw_competitive_analysis: {
    name: 'Competitive Analysis',
    icon: SecurityIcon,
    color: '#dc2626',
    description: 'Analyze competitors and market positioning',
    guidance: {
      purpose: 'Understand competitive landscape and find differentiation',
      tips: [
        'Include direct and indirect competitors',
        'Focus on customer perception, not just features',
        'Identify gaps and opportunities',
      ],
    },
    fields: [
      { key: 'competitors', label: 'Key Competitors', color: '#dc2626' },
      { key: 'their_strengths', label: 'Their Strengths', color: '#22c55e' },
      { key: 'their_weaknesses', label: 'Their Weaknesses', color: '#ef4444' },
      { key: 'our_differentiation', label: 'Our Differentiation', color: '#3b82f6' },
      { key: 'market_gaps', label: 'Market Gaps', color: '#8b5cf6' },
      { key: 'positioning', label: 'Our Positioning', color: '#f59e0b' },
    ],
  },
  pdw_service_blueprint: {
    name: 'Service Blueprint',
    icon: GridViewIcon,
    color: '#2563eb',
    description: 'Map service delivery from front to back stage',
    guidance: {
      purpose: 'Visualize service delivery including visible and invisible processes',
      tips: [
        'Start with customer actions on the front stage',
        'Map employee actions visible to customer',
        'Include backstage processes and support systems',
      ],
    },
    fields: [
      { key: 'customer_actions', label: 'Customer Actions', color: '#22c55e' },
      { key: 'frontstage', label: 'Frontstage (Visible)', color: '#3b82f6' },
      { key: 'backstage', label: 'Backstage (Invisible)', color: '#8b5cf6' },
      { key: 'support_processes', label: 'Support Processes', color: '#64748b' },
      { key: 'physical_evidence', label: 'Physical Evidence', color: '#f59e0b' },
      { key: 'pain_points', label: 'Pain Points', color: '#ef4444' },
    ],
  },
  pdw_user_story_map: {
    name: 'User Story Map',
    icon: GridViewIcon,
    color: '#7c3aed',
    description: 'Organize user stories by activities and releases',
    guidance: {
      purpose: 'Visualize the big picture of your product through user stories',
      tips: [
        'Start with user activities (horizontal backbone)',
        'Break down into user tasks under each activity',
        'Slice horizontally for releases/iterations',
      ],
    },
    fields: [
      { key: 'user_goal', label: 'User Goal', color: '#7c3aed' },
      { key: 'activities', label: 'Activities (Backbone)', color: '#3b82f6' },
      { key: 'mvp_stories', label: 'MVP Stories', color: '#22c55e' },
      { key: 'release_2', label: 'Release 2 Stories', color: '#f59e0b' },
      { key: 'future', label: 'Future Stories', color: '#64748b' },
    ],
  },
  pdw_feature_canvas: {
    name: 'Feature Canvas',
    icon: DiamondIcon,
    color: '#0d9488',
    description: 'Design individual features in detail',
    guidance: {
      purpose: 'Think through a feature before building it',
      tips: [
        'Start with the problem the feature solves',
        'Define clear success metrics',
        'Consider edge cases and risks',
      ],
    },
    fields: [
      { key: 'feature_name', label: 'Feature Name', color: '#0d9488' },
      { key: 'problem', label: 'Problem Solved', color: '#ef4444' },
      { key: 'solution', label: 'Solution Description', color: '#3b82f6' },
      { key: 'user_benefit', label: 'User Benefit', color: '#22c55e' },
      { key: 'success_metrics', label: 'Success Metrics', color: '#8b5cf6' },
      { key: 'risks', label: 'Risks & Mitigations', color: '#f59e0b' },
      { key: 'dependencies', label: 'Dependencies', color: '#64748b' },
      { key: 'acceptance_criteria', label: 'Acceptance Criteria', color: '#06b6d4' },
    ],
  },
};

const DEFAULT_CONFIG = {
  name: 'Canvas',
  icon: GridViewIcon,
  color: '#64748b',
  description: 'Strategic canvas',
  guidance: { purpose: 'Document your thinking', tips: [] },
  fields: [],
};

// Custom canvas type - user-defined fields
const CUSTOM_CANVAS_CONFIG = {
  name: 'Custom Canvas',
  icon: BuildIcon,
  color: '#8b5cf6',
  description: 'Your own canvas with custom fields',
  guidance: {
    purpose: 'Create your own strategic canvas with custom sections',
    tips: [
      'Define fields that matter for your specific use case',
      'Choose colors that help distinguish different sections',
      'Keep field names clear and actionable',
    ],
  },
  fields: [], // Will be populated from custom_fields.canvas_definition
};

// Color palette for custom canvas fields
const FIELD_COLORS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#64748b', label: 'Gray' },
];

// Size options for custom canvas fields
const FIELD_SIZES = [
  { value: 'full', label: 'Full Width', cols: 2, icon: '▬▬' },
  { value: 'half', label: 'Half Width', cols: 1, icon: '▬' },
  { value: 'third', label: 'One Third', cols: 1, icon: '▪' },
];

// Icon options for custom canvases
const CANVAS_ICONS = [
  { value: 'GridViewIcon', icon: GridViewIcon, label: 'Grid' },
  { value: 'LightbulbIcon', icon: LightbulbIcon, label: 'Idea' },
  { value: 'PeopleIcon', icon: PeopleIcon, label: 'People' },
  { value: 'BusinessIcon', icon: BusinessIcon, label: 'Business' },
  { value: 'SecurityIcon', icon: SecurityIcon, label: 'Security' },
  { value: 'DiamondIcon', icon: DiamondIcon, label: 'Value' },
  { value: 'BuildIcon', icon: BuildIcon, label: 'Build' },
  { value: 'PaletteIcon', icon: PaletteIcon, label: 'Design' },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getCanvasCompleteness(canvas, config) {
  const cf = canvas.custom_fields || {};
  const fields = config.fields || [];
  if (fields.length === 0) return { filled: 0, total: 0, percentage: 0 };

  const filled = fields.filter(f => {
    const value = cf[f.key];
    if (Array.isArray(value)) return value.length > 0;
    return value && String(value).trim().length > 0;
  }).length;

  return {
    filled,
    total: fields.length,
    percentage: Math.round((filled / fields.length) * 100),
  };
}

function parseListValue(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split('\n').filter(Boolean);
  return [];
}

// ============================================================================
// EXPORT UTILITIES - Native browser approach, no external dependencies
// ============================================================================

/**
 * Convert SVG string to PNG using native browser canvas
 */
async function svgToPNG(svgString, scale = 2) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('PNG export requires browser environment'));
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Test for canvas taint by trying to get pixel data
      try {
        ctx.getImageData(0, 0, 1, 1);
      } catch (err) {
        // Canvas is tainted - can't export as PNG
        console.warn('Canvas is tainted, falling back to data URL method');
        // Try alternative: use data URL instead of blob URL for SVG
        try {
          const base64 = btoa(unescape(encodeURIComponent(svgString)));
          const dataUrl = 'data:image/svg+xml;base64,' + base64;
          const img2 = new Image();
          img2.onload = () => {
            const canvas2 = document.createElement('canvas');
            const ctx2 = canvas2.getContext('2d');
            canvas2.width = img2.width * scale;
            canvas2.height = img2.height * scale;
            ctx2.scale(scale, scale);
            ctx2.fillStyle = '#ffffff';
            ctx2.fillRect(0, 0, img2.width, img2.height);
            ctx2.drawImage(img2, 0, 0);
            canvas2.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('PNG export not available - try SVG export instead'));
              }
            }, 'image/png');
          };
          img2.onerror = () => {
            reject(new Error('PNG export not available - try SVG export instead'));
          };
          img2.src = dataUrl;
        } catch (e) {
          reject(new Error('PNG export not available - try SVG export instead'));
        }
        return;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG for PNG conversion'));
    };

    img.src = url;
  });
}

/**
 * Generate clean SVG from canvas element
 */
function generateCanvasSVG(canvasRef, name, config) {
  if (!canvasRef.current) return null;

  const element = canvasRef.current;
  const rect = element.getBoundingClientRect();
  const width = Math.max(rect.width, 800);
  const height = Math.max(rect.height, 600);

  // Get computed styles to embed in SVG
  const styles = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .cv-lean, .cv-empathy, .cv-swot, .cv-vp, .cv-bmc, .cv-persona, .cv-jtbd, .cv-generic { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .cv-lean__grid, .cv-bmc__grid { display: grid; gap: 2px; background: #e2e8f0; border: 1px solid #e2e8f0; border-radius: 8px; }
    .cv-lean__cell, .cv-bmc__cell { background: #f8fafc; border-top: 3px solid; padding: 8px; }
    .cv-lean__cell-header, .cv-bmc__cell-header { display: flex; justify-content: space-between; padding: 4px 8px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: 700; }
    .cv-lean__cell-content, .cv-bmc__cell-content { font-size: 12px; line-height: 1.4; color: #1e293b; padding: 8px; white-space: pre-wrap; }
    .cv-swot__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: #e2e8f0; border-radius: 8px; }
    .cv-swot__quadrant { background: #f8fafc; border: 2px solid; min-height: 150px; }
    .cv-swot__quadrant-header { padding: 10px 14px; color: white; font-weight: 700; }
    .cv-swot__quadrant-content { padding: 12px; font-size: 12px; }
    .cv-swot__list { list-style: none; padding: 0; }
    .cv-swot__list li { padding: 4px 0 4px 12px; border-left: 3px solid; margin-bottom: 4px; font-size: 12px; }
    .cv-empathy__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
    .cv-empathy__quadrant { background: #f8fafc; border: 2px solid; min-height: 120px; }
    .cv-empathy__quadrant-header { padding: 8px 12px; border-bottom: 2px solid; font-size: 11px; font-weight: 700; }
    .cv-empathy__quadrant-content { padding: 12px; font-size: 12px; white-space: pre-wrap; }
    .cv-vp { display: flex; gap: 24px; }
    .cv-vp__side { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
    .cv-vp__side-header { padding: 16px 20px; color: white; }
    .cv-vp__section { border-left: 3px solid; padding: 12px; }
    .cv-vp__section-header { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 8px 12px; background: #f1f5f9; }
    .cv-persona__header { display: flex; align-items: center; gap: 20px; padding: 24px; background: #f1f5f9; border-bottom: 3px solid; }
    .cv-persona__avatar { width: 100px; height: 100px; border: 3px solid; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .cv-persona__name { font-size: 24px; font-weight: 700; margin: 0 0 4px 0; }
    .cv-persona__role { font-size: 14px; color: #64748b; margin: 0; }
    .cv-persona__section { margin: 16px; padding: 16px; background: #f8fafc; border-radius: 8px; border-top: 3px solid #e2e8f0; }
    .cv-persona__section h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin: 0 0 12px 0; }
    .cv-jtbd__statement { padding: 20px 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid; border-radius: 8px; margin-bottom: 24px; }
    .cv-jtbd__statement h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin: 0 0 12px 0; }
    .cv-jtbd__statement-text { font-size: 18px; font-weight: 500; line-height: 1.5; margin: 0; }
    .cv-jtbd__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .cv-jtbd__section { padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-top: 3px solid; border-radius: 8px; }
    .cv-generic__field { padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid; border-radius: 8px; margin-bottom: 16px; }
    .cv-generic__field label { font-size: 12px; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 8px; }
    .cv-generic__field p { margin: 0; font-size: 14px; line-height: 1.5; }
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>${styles}</style>
  <rect width="100%" height="100%" fill="#ffffff"/>
  <foreignObject x="0" y="0" width="${width}" height="${height}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="padding: 20px;">
      <h2 style="margin: 0 0 16px 0; font-family: sans-serif; font-size: 20px; color: #1e293b;">${name} - ${config.name}</h2>
      ${element.innerHTML}
    </div>
  </foreignObject>
</svg>`;
}

async function exportCanvasToPNG(canvasRef, name, config) {
  if (!canvasRef.current) return;

  try {
    const svgString = generateCanvasSVG(canvasRef, name, config);
    if (!svgString) {
      console.error('Failed to generate SVG');
      return;
    }

    const pngBlob = await svgToPNG(svgString, 2);
    const url = URL.createObjectURL(pngBlob);
    const link = document.createElement('a');
    link.download = `${name.replace(/[^a-z0-9]/gi, '_')}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('PNG export failed:', err);
    alert('PNG export failed. Try SVG export instead.');
  }
}

function exportCanvasToSVG(canvasRef, name, config) {
  if (!canvasRef.current) return;

  const svgContent = generateCanvasSVG(canvasRef, name, config);
  if (!svgContent) {
    console.error('Failed to generate SVG');
    return;
  }

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${name.replace(/[^a-z0-9]/gi, '_')}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// FULL CANVAS RENDERERS - Type-specific visual layouts
// ============================================================================

function LeanCanvasRenderer({ canvas, config, editable, onChange }) {
  const cf = canvas.custom_fields || {};

  const Cell = ({ field, label, color, gridArea, placeholder }) => {
    const value = cf[field] || '';
    const hasContent = value && value.trim();

    return (
      <div className={`cv-lean__cell cv-lean__cell--${field}`} style={{ gridArea, borderTopColor: color }}>
        <div className="cv-lean__cell-header">
          <span className="cv-lean__cell-label" style={{ color }}>{label}</span>
          {hasContent && <CheckCircleIcon className="cv-lean__cell-check" style={{ color }} />}
        </div>
        {editable ? (
          <textarea
            className="cv-lean__cell-input"
            value={value}
            onChange={e => onChange(field, e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <div className="cv-lean__cell-content">
            {hasContent ? value : <span className="cv-lean__cell-empty">Not filled</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="cv-lean">
      <div className="cv-lean__grid">
        <Cell field="problem" label="PROBLEM" color="#ef4444" gridArea="problem" placeholder="Top 3 problems you're solving..." />
        <Cell field="existing_alternatives" label="EXISTING ALTERNATIVES" color="#f97316" gridArea="alt" placeholder="How do people solve this today?" />
        <Cell field="solution" label="SOLUTION" color="#3b82f6" gridArea="solution" placeholder="Top 3 features..." />
        <Cell field="key_metrics" label="KEY METRICS" color="#06b6d4" gridArea="metrics" placeholder="What will you measure?" />
        <Cell field="unique_value_proposition" label="UNIQUE VALUE PROPOSITION" color="#8b5cf6" gridArea="uvp" placeholder="Single, clear, compelling message..." />
        <Cell field="high_level_concept" label="HIGH-LEVEL CONCEPT" color="#a855f7" gridArea="concept" placeholder="X for Y (e.g., 'YouTube for courses')" />
        <Cell field="unfair_advantage" label="UNFAIR ADVANTAGE" color="#f59e0b" gridArea="advantage" placeholder="What can't be easily copied?" />
        <Cell field="channels" label="CHANNELS" color="#14b8a6" gridArea="channels" placeholder="How will you reach customers?" />
        <Cell field="customer_segments" label="CUSTOMER SEGMENTS" color="#10b981" gridArea="segments" placeholder="Who are your target customers?" />
        <Cell field="early_adopters" label="EARLY ADOPTERS" color="#22c55e" gridArea="adopters" placeholder="Ideal first customers..." />
        <Cell field="cost_structure" label="COST STRUCTURE" color="#64748b" gridArea="costs" placeholder="Main costs to run business..." />
        <Cell field="revenue_streams" label="REVENUE STREAMS" color="#22c55e" gridArea="revenue" placeholder="How will you make money?" />
      </div>
    </div>
  );
}

function EmpathyMapRenderer({ canvas, config, editable, onChange }) {
  const cf = canvas.custom_fields || {};

  const Quadrant = ({ field, label, color, placeholder }) => {
    const value = cf[field] || '';
    const hasContent = value && value.trim();

    return (
      <div className={`cv-empathy__quadrant cv-empathy__quadrant--${field}`} style={{ borderColor: color }}>
        <div className="cv-empathy__quadrant-header" style={{ backgroundColor: `${color}15`, borderBottomColor: color }}>
          <span style={{ color }}>{label}</span>
          {hasContent && <CheckCircleIcon style={{ color, fontSize: 16 }} />}
        </div>
        {editable ? (
          <textarea
            className="cv-empathy__quadrant-input"
            value={value}
            onChange={e => onChange(field, e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <div className="cv-empathy__quadrant-content">
            {hasContent ? value : <span className="cv-empathy__empty">Not filled</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="cv-empathy">
      <div className="cv-empathy__center">
        <PeopleIcon style={{ fontSize: 40, color: config.color }} />
        <span>User</span>
      </div>
      <div className="cv-empathy__grid">
        <Quadrant field="thinks" label="THINKS" color="#ec4899" placeholder="What are they really thinking?" />
        <Quadrant field="feels" label="FEELS" color="#f59e0b" placeholder="What emotions do they experience?" />
        <Quadrant field="says" label="SAYS" color="#6366f1" placeholder="Include direct quotes..." />
        <Quadrant field="does" label="DOES" color="#22c55e" placeholder="What actions do they take?" />
      </div>
      <div className="cv-empathy__footer">
        <Quadrant field="pains" label="PAINS" color="#ef4444" placeholder="Frustrations, fears, obstacles..." />
        <Quadrant field="gains" label="GAINS" color="#10b981" placeholder="Goals, desires, measures of success..." />
      </div>
    </div>
  );
}

function SwotRenderer({ canvas, config, editable, onChange }) {
  const cf = canvas.custom_fields || {};

  const Quadrant = ({ field, label, color, hint, placeholder }) => {
    const items = parseListValue(cf[field]);

    return (
      <div className={`cv-swot__quadrant cv-swot__quadrant--${field}`} style={{ borderColor: color }}>
        <div className="cv-swot__quadrant-header" style={{ backgroundColor: color }}>
          <span className="cv-swot__quadrant-label">{label}</span>
          <span className="cv-swot__quadrant-hint">{hint}</span>
          {items.length > 0 && <span className="cv-swot__quadrant-count">{items.length}</span>}
        </div>
        {editable ? (
          <textarea
            className="cv-swot__quadrant-input"
            value={items.join('\n')}
            onChange={e => onChange(field, e.target.value.split('\n').filter(Boolean))}
            placeholder={placeholder}
          />
        ) : (
          <div className="cv-swot__quadrant-content">
            {items.length > 0 ? (
              <ul className="cv-swot__list">
                {items.map((item, i) => (
                  <li key={i} style={{ borderLeftColor: color }}>{item}</li>
                ))}
              </ul>
            ) : (
              <span className="cv-swot__empty">No items</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="cv-swot">
      <div className="cv-swot__labels">
        <div className="cv-swot__label cv-swot__label--internal">INTERNAL</div>
        <div className="cv-swot__label cv-swot__label--external">EXTERNAL</div>
      </div>
      <div className="cv-swot__labels cv-swot__labels--top">
        <div className="cv-swot__label cv-swot__label--positive">POSITIVE</div>
        <div className="cv-swot__label cv-swot__label--negative">NEGATIVE</div>
      </div>
      <div className="cv-swot__grid">
        <Quadrant field="strengths" label="S" color="#22c55e" hint="Strengths" placeholder="One strength per line..." />
        <Quadrant field="weaknesses" label="W" color="#ef4444" hint="Weaknesses" placeholder="One weakness per line..." />
        <Quadrant field="opportunities" label="O" color="#3b82f6" hint="Opportunities" placeholder="One opportunity per line..." />
        <Quadrant field="threats" label="T" color="#f59e0b" hint="Threats" placeholder="One threat per line..." />
      </div>
    </div>
  );
}

function VPCanvasRenderer({ canvas, config, editable, onChange }) {
  const cf = canvas.custom_fields || {};

  const Section = ({ field, label, color, placeholder }) => {
    const items = parseListValue(cf[field]);

    return (
      <div className="cv-vp__section" style={{ borderLeftColor: color }}>
        <div className="cv-vp__section-header">
          <span className="cv-vp__section-label" style={{ color }}>{label}</span>
          {items.length > 0 && <span className="cv-vp__section-count" style={{ backgroundColor: color }}>{items.length}</span>}
        </div>
        {editable ? (
          <textarea
            className="cv-vp__section-input"
            value={items.join('\n')}
            onChange={e => onChange(field, e.target.value.split('\n').filter(Boolean))}
            placeholder={placeholder}
          />
        ) : (
          <div className="cv-vp__section-content">
            {items.length > 0 ? (
              <ul className="cv-vp__list">
                {items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            ) : (
              <span className="cv-vp__empty">Not filled</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="cv-vp">
      <div className="cv-vp__side cv-vp__side--value">
        <div className="cv-vp__side-header" style={{ background: 'linear-gradient(135deg, #10b981, #22c55e)' }}>
          <DiamondIcon />
          <div>
            <h3>Value Map</h3>
            <p>What you offer</p>
          </div>
        </div>
        <div className="cv-vp__side-content">
          <Section field="products_services" label="Products & Services" color="#10b981" placeholder="One per line..." />
          <Section field="pain_relievers" label="Pain Relievers" color="#14b8a6" placeholder="How you alleviate pains..." />
          <Section field="gain_creators" label="Gain Creators" color="#22c55e" placeholder="How you create gains..." />
        </div>
      </div>
      <div className="cv-vp__fit-indicator">
        <div className="cv-vp__fit-circle">
          {cf.fit_score ? (
            <span className="cv-vp__fit-status">{cf.fit_score}</span>
          ) : (
            <span className="cv-vp__fit-question">?</span>
          )}
        </div>
        {editable && (
          <select
            className="cv-vp__fit-select"
            value={cf.fit_score || ''}
            onChange={e => onChange('fit_score', e.target.value)}
          >
            <option value="">Select fit...</option>
            <option value="No Fit">No Fit Yet</option>
            <option value="Problem-Solution">Problem-Solution Fit</option>
            <option value="Product-Market">Product-Market Fit</option>
          </select>
        )}
      </div>
      <div className="cv-vp__side cv-vp__side--customer">
        <div className="cv-vp__side-header" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <PeopleIcon />
          <div>
            <h3>Customer Profile</h3>
            <p>Who you serve</p>
          </div>
        </div>
        <div className="cv-vp__side-content">
          <Section field="customer_jobs" label="Customer Jobs" color="#6366f1" placeholder="Jobs to be done..." />
          <Section field="customer_pains" label="Customer Pains" color="#ef4444" placeholder="Frustrations and risks..." />
          <Section field="customer_gains" label="Customer Gains" color="#22c55e" placeholder="Desired outcomes..." />
        </div>
      </div>
    </div>
  );
}

function BMCRenderer({ canvas, config, editable, onChange }) {
  const cf = canvas.custom_fields || {};

  const Cell = ({ field, label, color, gridArea, placeholder }) => {
    const value = cf[field] || '';
    const items = parseListValue(value);

    return (
      <div className={`cv-bmc__cell cv-bmc__cell--${field}`} style={{ gridArea, borderTopColor: color }}>
        <div className="cv-bmc__cell-header">
          <span className="cv-bmc__cell-label" style={{ color }}>{label}</span>
          {items.length > 0 && <span className="cv-bmc__cell-count" style={{ backgroundColor: color }}>{items.length}</span>}
        </div>
        {editable ? (
          <textarea
            className="cv-bmc__cell-input"
            value={Array.isArray(value) ? value.join('\n') : value}
            onChange={e => onChange(field, e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <div className="cv-bmc__cell-content">
            {items.length > 0 ? (
              <ul className="cv-bmc__list">
                {items.slice(0, 5).map((item, i) => <li key={i}>{item}</li>)}
                {items.length > 5 && <li className="cv-bmc__more">+{items.length - 5} more</li>}
              </ul>
            ) : (
              <span className="cv-bmc__empty">Not filled</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="cv-bmc">
      <div className="cv-bmc__grid">
        <Cell field="key_partners" label="Key Partners" color="#8b5cf6" gridArea="partners" placeholder="Who are your key partners?" />
        <Cell field="key_activities" label="Key Activities" color="#6366f1" gridArea="activities" placeholder="What key activities?" />
        <Cell field="key_resources" label="Key Resources" color="#3b82f6" gridArea="resources" placeholder="What key resources?" />
        <Cell field="value_propositions" label="Value Propositions" color="#ec4899" gridArea="value" placeholder="What value do you deliver?" />
        <Cell field="customer_relationships" label="Customer Relationships" color="#f59e0b" gridArea="relationships" placeholder="What type of relationship?" />
        <Cell field="channels" label="Channels" color="#14b8a6" gridArea="channels" placeholder="How do you reach customers?" />
        <Cell field="customer_segments" label="Customer Segments" color="#22c55e" gridArea="segments" placeholder="Who are your customers?" />
        <Cell field="cost_structure" label="Cost Structure" color="#64748b" gridArea="costs" placeholder="What are the main costs?" />
        <Cell field="revenue_streams" label="Revenue Streams" color="#10b981" gridArea="revenue" placeholder="How do you make money?" />
      </div>
    </div>
  );
}

function PersonaRenderer({ canvas, config, editable, onChange }) {
  const cf = canvas.custom_fields || {};

  return (
    <div className="cv-persona">
      <div className="cv-persona__header" style={{ borderBottomColor: config.color }}>
        <div className="cv-persona__avatar" style={{ backgroundColor: `${config.color}20`, borderColor: config.color }}>
          <PersonIcon style={{ fontSize: 48, color: config.color }} />
        </div>
        <div className="cv-persona__identity">
          {editable ? (
            <>
              <input
                type="text"
                className="cv-persona__name-input"
                value={cf.name || ''}
                onChange={e => onChange('name', e.target.value)}
                placeholder="Persona Name"
              />
              <input
                type="text"
                className="cv-persona__role-input"
                value={cf.role || ''}
                onChange={e => onChange('role', e.target.value)}
                placeholder="Role / Title"
              />
            </>
          ) : (
            <>
              <h2 className="cv-persona__name">{cf.name || 'Unnamed Persona'}</h2>
              <p className="cv-persona__role">{cf.role || 'No role specified'}</p>
            </>
          )}
        </div>
        {cf.quote && (
          <div className="cv-persona__quote">
            <span>"{cf.quote}"</span>
          </div>
        )}
      </div>

      <div className="cv-persona__body">
        <div className="cv-persona__section cv-persona__section--demographics">
          <h4>Demographics</h4>
          {editable ? (
            <textarea
              value={cf.demographics || ''}
              onChange={e => onChange('demographics', e.target.value)}
              placeholder="Age, location, background..."
            />
          ) : (
            <p>{cf.demographics || 'Not specified'}</p>
          )}
        </div>

        <div className="cv-persona__section cv-persona__section--bio">
          <h4>Bio</h4>
          {editable ? (
            <textarea
              value={cf.bio || ''}
              onChange={e => onChange('bio', e.target.value)}
              placeholder="Brief background story..."
            />
          ) : (
            <p>{cf.bio || 'No bio provided'}</p>
          )}
        </div>

        <div className="cv-persona__columns">
          <div className="cv-persona__section cv-persona__section--goals" style={{ borderTopColor: '#22c55e' }}>
            <h4 style={{ color: '#22c55e' }}>Goals</h4>
            {editable ? (
              <textarea
                value={cf.goals || ''}
                onChange={e => onChange('goals', e.target.value)}
                placeholder="What are they trying to achieve?"
              />
            ) : (
              <ul>
                {parseListValue(cf.goals).map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            )}
          </div>

          <div className="cv-persona__section cv-persona__section--frustrations" style={{ borderTopColor: '#ef4444' }}>
            <h4 style={{ color: '#ef4444' }}>Frustrations</h4>
            {editable ? (
              <textarea
                value={cf.frustrations || ''}
                onChange={e => onChange('frustrations', e.target.value)}
                placeholder="What blocks them?"
              />
            ) : (
              <ul>
                {parseListValue(cf.frustrations).map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}
          </div>
        </div>

        {editable && (
          <div className="cv-persona__section cv-persona__section--quote">
            <h4>Quote</h4>
            <input
              type="text"
              value={cf.quote || ''}
              onChange={e => onChange('quote', e.target.value)}
              placeholder="A characteristic statement..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function JTBDRenderer({ canvas, config, editable, onChange }) {
  const cf = canvas.custom_fields || {};

  return (
    <div className="cv-jtbd">
      <div className="cv-jtbd__statement" style={{ borderLeftColor: config.color }}>
        <h4>Job Statement</h4>
        {editable ? (
          <textarea
            value={cf.job_statement || ''}
            onChange={e => onChange('job_statement', e.target.value)}
            placeholder="When I [situation], I want to [motivation], so I can [outcome]."
          />
        ) : (
          <p className="cv-jtbd__statement-text">{cf.job_statement || 'No job statement defined'}</p>
        )}
      </div>

      <div className="cv-jtbd__grid">
        <div className="cv-jtbd__section" style={{ borderTopColor: '#64748b' }}>
          <h4>Current Solutions</h4>
          {editable ? (
            <textarea
              value={cf.current_solutions || ''}
              onChange={e => onChange('current_solutions', e.target.value)}
              placeholder="How do they solve this today?"
            />
          ) : (
            <p>{cf.current_solutions || 'Not specified'}</p>
          )}
        </div>

        <div className="cv-jtbd__section" style={{ borderTopColor: '#22c55e' }}>
          <h4>Success Criteria</h4>
          {editable ? (
            <textarea
              value={cf.success_criteria || ''}
              onChange={e => onChange('success_criteria', e.target.value)}
              placeholder="How do they measure success?"
            />
          ) : (
            <p>{cf.success_criteria || 'Not specified'}</p>
          )}
        </div>

        <div className="cv-jtbd__section" style={{ borderTopColor: '#f59e0b' }}>
          <h4>Constraints</h4>
          {editable ? (
            <textarea
              value={cf.constraints || ''}
              onChange={e => onChange('constraints', e.target.value)}
              placeholder="What limitations do they have?"
            />
          ) : (
            <p>{cf.constraints || 'Not specified'}</p>
          )}
        </div>
      </div>

      <div className="cv-jtbd__jobs">
        <div className="cv-jtbd__job-type" style={{ borderLeftColor: '#ec4899' }}>
          <h4 style={{ color: '#ec4899' }}>Emotional Jobs</h4>
          {editable ? (
            <textarea
              value={cf.emotional_jobs || ''}
              onChange={e => onChange('emotional_jobs', e.target.value)}
              placeholder="How do they want to feel?"
            />
          ) : (
            <p>{cf.emotional_jobs || 'Not specified'}</p>
          )}
        </div>

        <div className="cv-jtbd__job-type" style={{ borderLeftColor: '#8b5cf6' }}>
          <h4 style={{ color: '#8b5cf6' }}>Social Jobs</h4>
          {editable ? (
            <textarea
              value={cf.social_jobs || ''}
              onChange={e => onChange('social_jobs', e.target.value)}
              placeholder="How do they want to be perceived?"
            />
          ) : (
            <p>{cf.social_jobs || 'Not specified'}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function GenericRenderer({ canvas, config, editable, onChange }) {
  const cf = canvas.custom_fields || {};

  return (
    <div className="cv-generic">
      {config.fields.map(field => (
        <div key={field.key} className="cv-generic__field" style={{ borderLeftColor: field.color || config.color }}>
          <label style={{ color: field.color || config.color }}>{field.label}</label>
          {editable ? (
            <textarea
              value={cf[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
          ) : (
            <p>{cf[field.key] || 'Not filled'}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// Get the appropriate renderer for a canvas type
function CanvasRenderer({ canvas, config, editable, onChange }) {
  const props = { canvas, config, editable, onChange };

  switch (canvas.artefact_type) {
    case 'pdw_lean_canvas': return <LeanCanvasRenderer {...props} />;
    case 'pdw_empathy_map': return <EmpathyMapRenderer {...props} />;
    case 'pdw_swot': return <SwotRenderer {...props} />;
    case 'pdw_vp_canvas': return <VPCanvasRenderer {...props} />;
    case 'pdw_bmc_canvas': return <BMCRenderer {...props} />;
    case 'pdw_persona': return <PersonaRenderer {...props} />;
    case 'pdw_jtbd_canvas': return <JTBDRenderer {...props} />;
    case 'pdw_custom_canvas': return <CustomCanvasRenderer canvas={canvas} editable={editable} onChange={onChange} />;
    default: return <GenericRenderer {...props} />;
  }
}

// ============================================================================
// CANVAS CARD - Shows canvas preview in card format
// ============================================================================

function CanvasCard({ canvas, config, onEdit, onDelete, onExpand }) {
  const Icon = config.icon;
  const completeness = getCanvasCompleteness(canvas, config);
  const isComplete = completeness.percentage === 100;
  const isEmpty = completeness.percentage === 0;

  return (
    <div className="cv-card" style={{ borderTopColor: config.color }}>
      <div className="cv-card__header">
        <div className="cv-card__icon" style={{ backgroundColor: `${config.color}15` }}>
          <Icon style={{ color: config.color, fontSize: 22 }} />
        </div>
        <div className="cv-card__info">
          <span className="cv-card__type" style={{ color: config.color }}>{config.name}</span>
          <h4 className="cv-card__name">{canvas.name}</h4>
        </div>
        <div className="cv-card__status">
          {isComplete ? (
            <span className="cv-card__badge cv-card__badge--complete"><CheckCircleIcon fontSize="small" /> Complete</span>
          ) : isEmpty ? (
            <span className="cv-card__badge cv-card__badge--empty">Empty</span>
          ) : (
            <span className="cv-card__badge cv-card__badge--progress">{completeness.percentage}%</span>
          )}
        </div>
      </div>

      <div className="cv-card__preview" onClick={() => onExpand(canvas)}>
        <div className="cv-card__preview-mini">
          <CanvasRenderer canvas={canvas} config={config} editable={false} onChange={() => {}} />
        </div>
        <div className="cv-card__preview-overlay">
          <FullscreenIcon /> View Full Canvas
        </div>
      </div>

      <div className="cv-card__progress">
        <div className="cv-card__progress-bar" style={{ width: `${completeness.percentage}%`, backgroundColor: config.color }} />
      </div>

      <div className="cv-card__actions">
        <button className="cv-card__action cv-card__action--primary" onClick={() => onEdit(canvas)}>
          <EditIcon fontSize="small" /> Edit
        </button>
        <button className="cv-card__action" onClick={() => onExpand(canvas)}>
          <FullscreenIcon fontSize="small" />
        </button>
        <button className="cv-card__action cv-card__action--danger" onClick={() => onDelete(canvas)}>
          <DeleteIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// CANVAS VIEWER/EDITOR MODAL
// ============================================================================

function CanvasModal({ canvas, config, onSave, onClose, readOnly = false }) {
  const [formData, setFormData] = useState(canvas.custom_fields || {});
  const [saving, setSaving] = useState(false);
  const [showGuidance, setShowGuidance] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const canvasRef = useRef(null);

  const Icon = config.icon;
  const completeness = getCanvasCompleteness({ custom_fields: formData }, config);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const handleExportPNG = () => {
    exportCanvasToPNG(canvasRef, canvas.name, config);
    setShowExportMenu(false);
  };

  const handleExportSVG = () => {
    exportCanvasToSVG(canvasRef, canvas.name, config);
    setShowExportMenu(false);
  };

  return (
    <div className="cv-modal-overlay" onClick={onClose}>
      <div className="cv-modal" onClick={e => e.stopPropagation()}>
        <div className="cv-modal__header" style={{ borderBottomColor: config.color }}>
          <div className="cv-modal__title">
            <div className="cv-modal__icon" style={{ backgroundColor: `${config.color}15` }}>
              <Icon style={{ color: config.color, fontSize: 28 }} />
            </div>
            <div>
              <span className="cv-modal__type" style={{ color: config.color }}>{config.name}</span>
              <h2>{canvas.name}</h2>
            </div>
          </div>

          <div className="cv-modal__actions">
            <div className="cv-modal__progress">
              <span>{completeness.percentage}% complete</span>
              <div className="cv-modal__progress-bar">
                <div style={{ width: `${completeness.percentage}%`, backgroundColor: config.color }} />
              </div>
            </div>

            <button
              className={`cv-modal__btn cv-modal__btn--icon ${showGuidance ? 'active' : ''}`}
              onClick={() => setShowGuidance(!showGuidance)}
              title="Toggle guidance"
            >
              <LightbulbIcon />
            </button>

            <div className="cv-modal__export-wrapper">
              <button
                className="cv-modal__btn cv-modal__btn--icon"
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="Export canvas"
              >
                <DownloadIcon />
              </button>
              {showExportMenu && (
                <div className="cv-modal__export-menu">
                  <button onClick={handleExportPNG}><ImageIcon /> Export as PNG</button>
                  <button onClick={handleExportSVG}><CodeIcon /> Export as SVG</button>
                </div>
              )}
            </div>

            <button className="cv-modal__btn cv-modal__btn--secondary" onClick={onClose}>
              Close
            </button>

            {!readOnly && (
              <button className="cv-modal__btn cv-modal__btn--primary" onClick={handleSave} disabled={saving}>
                <SaveIcon fontSize="small" /> {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>

        <div className="cv-modal__body">
          {showGuidance && config.guidance && (
            <div className="cv-modal__guidance">
              <div className="cv-modal__guidance-header">
                <LightbulbIcon style={{ color: '#f59e0b' }} />
                <h4>How to use this canvas</h4>
              </div>
              <p>{config.guidance.purpose}</p>
              {config.guidance.tips?.length > 0 && (
                <ul>
                  {config.guidance.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              )}
            </div>
          )}

          <div className="cv-modal__canvas" ref={canvasRef}>
            <CanvasRenderer
              canvas={{ ...canvas, custom_fields: formData }}
              config={config}
              editable={!readOnly}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CUSTOM CANVAS CREATION WIZARD
// ============================================================================

function CustomCanvasWizard({ onSave, onClose, saving }) {
  const [canvasName, setCanvasName] = useState('My Custom Canvas');
  const [canvasColor, setCanvasColor] = useState('#8b5cf6');
  const [canvasIcon, setCanvasIcon] = useState('GridViewIcon');
  const [canvasDescription, setCanvasDescription] = useState('');
  const [layoutCols, setLayoutCols] = useState(2); // 2 or 3 column layout
  const [fields, setFields] = useState([
    { key: 'field_1', label: 'Section 1', color: '#3b82f6', size: 'half', placeholder: '' },
    { key: 'field_2', label: 'Section 2', color: '#22c55e', size: 'half', placeholder: '' },
  ]);

  const addField = () => {
    const nextNum = fields.length + 1;
    setFields([...fields, {
      key: `field_${Date.now()}`,
      label: `Section ${nextNum}`,
      color: FIELD_COLORS[nextNum % FIELD_COLORS.length].value,
      size: 'half',
      placeholder: '',
    }]);
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index, updates) => {
    setFields(fields.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const moveField = (index, direction) => {
    const newFields = [...fields];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < fields.length) {
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      setFields(newFields);
    }
  };

  const handleSave = () => {
    const canvasDefinition = {
      name: canvasName,
      color: canvasColor,
      icon: canvasIcon,
      description: canvasDescription,
      layoutCols: layoutCols,
      fields: fields.map(f => ({
        key: f.key,
        label: f.label,
        color: f.color,
        size: f.size || 'half',
        placeholder: f.placeholder || `Enter ${f.label.toLowerCase()}...`,
      })),
    };

    // Initialize empty values for each field
    const initialData = {};
    fields.forEach(f => { initialData[f.key] = ''; });

    onSave({
      name: canvasName,
      customFields: {
        canvas_definition: canvasDefinition,
        ...initialData,
      },
    });
  };

  const SelectedIcon = CANVAS_ICONS.find(i => i.value === canvasIcon)?.icon || GridViewIcon;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 700,
          maxHeight: '90vh',
          background: 'var(--panel)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: `3px solid ${canvasColor}`,
          background: 'var(--bg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: `${canvasColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SelectedIcon style={{ color: canvasColor, fontSize: 28 }} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: canvasColor, fontWeight: 500 }}>Create Your Own Canvas</span>
              <h3 style={{ margin: 0, color: 'var(--text)' }}>Define Custom Fields</h3>
            </div>
          </div>
          <IconButton icon={CloseIcon} onClick={onClose} title="Close" />
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Canvas Info */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 12px', color: 'var(--text)', fontSize: '0.875rem' }}>Canvas Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Canvas Name</label>
                <input
                  type="text"
                  value={canvasName}
                  onChange={e => setCanvasName(e.target.value)}
                  placeholder="My Custom Canvas"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Icon</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {CANVAS_ICONS.map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setCanvasIcon(value)}
                      style={{
                        width: 40,
                        height: 40,
                        border: canvasIcon === value ? `2px solid ${canvasColor}` : '1px solid var(--border)',
                        borderRadius: 8,
                        background: canvasIcon === value ? `${canvasColor}15` : 'var(--bg)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon style={{ color: canvasIcon === value ? canvasColor : 'var(--text-muted)', fontSize: 20 }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {FIELD_COLORS.map(({ value }) => (
                  <button
                    key={value}
                    onClick={() => setCanvasColor(value)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: canvasColor === value ? '3px solid var(--text)' : '2px solid transparent',
                      backgroundColor: value,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Description (optional)</label>
              <input
                type="text"
                value={canvasDescription}
                onChange={e => setCanvasDescription(e.target.value)}
                placeholder="What is this canvas for?"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Layout Columns */}
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Grid Layout</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setLayoutCols(2)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    border: layoutCols === 2 ? `2px solid ${canvasColor}` : '1px solid var(--border)',
                    borderRadius: 8,
                    background: layoutCols === 2 ? `${canvasColor}15` : 'var(--bg)',
                    color: layoutCols === 2 ? canvasColor : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                  }}
                >
                  <ViewColumnIcon fontSize="small" />
                  2 Columns
                </button>
                <button
                  onClick={() => setLayoutCols(3)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    border: layoutCols === 3 ? `2px solid ${canvasColor}` : '1px solid var(--border)',
                    borderRadius: 8,
                    background: layoutCols === 3 ? `${canvasColor}15` : 'var(--bg)',
                    color: layoutCols === 3 ? canvasColor : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                  }}
                >
                  <ViewModuleIcon fontSize="small" />
                  3 Columns
                </button>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h4 style={{ margin: 0, color: 'var(--text)', fontSize: '0.875rem' }}>Canvas Sections ({fields.length})</h4>
              <Button variant="ghost" size="sm" onClick={addField}>
                <AddIcon fontSize="small" />
                <span>Add Section</span>
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.map((field, index) => (
                <div
                  key={field.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    background: 'var(--bg)',
                    borderRadius: 10,
                    borderLeft: `4px solid ${field.color}`,
                  }}
                >
                  {/* Reorder buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <button
                      onClick={() => moveField(index, -1)}
                      disabled={index === 0}
                      style={{
                        width: 20,
                        height: 16,
                        border: 'none',
                        background: 'transparent',
                        cursor: index === 0 ? 'default' : 'pointer',
                        opacity: index === 0 ? 0.3 : 1,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <KeyboardArrowUpIcon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
                    </button>
                    <button
                      onClick={() => moveField(index, 1)}
                      disabled={index === fields.length - 1}
                      style={{
                        width: 20,
                        height: 16,
                        border: 'none',
                        background: 'transparent',
                        cursor: index === fields.length - 1 ? 'default' : 'pointer',
                        opacity: index === fields.length - 1 ? 0.3 : 1,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <KeyboardArrowDownIcon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
                    </button>
                  </div>

                  {/* Section name */}
                  <input
                    type="text"
                    value={field.label}
                    onChange={e => updateField(index, { label: e.target.value })}
                    placeholder="Section name"
                    style={{
                      flex: 1,
                      minWidth: 120,
                      padding: '6px 10px',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      background: 'var(--panel)',
                      color: 'var(--text)',
                      fontSize: '0.8125rem',
                    }}
                  />

                  {/* Size selector */}
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[
                      { value: 'full', label: 'Full', width: layoutCols === 2 ? '100%' : '100%' },
                      { value: 'half', label: layoutCols === 2 ? '1/2' : '2/3', width: layoutCols === 2 ? '50%' : '66%' },
                      { value: 'third', label: layoutCols === 2 ? '1/2' : '1/3', width: layoutCols === 2 ? '50%' : '33%' },
                    ].map(size => (
                      <button
                        key={size.value}
                        onClick={() => updateField(index, { size: size.value })}
                        title={`${size.label} width`}
                        style={{
                          padding: '4px 8px',
                          border: field.size === size.value ? `2px solid ${field.color}` : '1px solid var(--border)',
                          borderRadius: 4,
                          background: field.size === size.value ? `${field.color}15` : 'transparent',
                          color: field.size === size.value ? field.color : 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                        }}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>

                  {/* Color selector */}
                  <div style={{ display: 'flex', gap: 3 }}>
                    {FIELD_COLORS.slice(0, 5).map(({ value }) => (
                      <button
                        key={value}
                        onClick={() => updateField(index, { color: value })}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: field.color === value ? '2px solid var(--text)' : '1px solid transparent',
                          backgroundColor: value,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>

                  {/* Delete button */}
                  <IconButton
                    icon={DeleteIcon}
                    size="sm"
                    onClick={() => removeField(index)}
                    title="Remove section"
                    disabled={fields.length <= 1}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ marginTop: 24 }}>
            <h4 style={{ margin: '0 0 12px', color: 'var(--text)', fontSize: '0.875rem' }}>Layout Preview</h4>
            <div style={{
              padding: 16,
              background: 'var(--bg)',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: `${canvasColor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <SelectedIcon style={{ color: canvasColor, fontSize: 24 }} />
                </div>
                <div>
                  <h5 style={{ margin: 0, color: 'var(--text)' }}>{canvasName || 'Untitled Canvas'}</h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fields.length} sections · {layoutCols}-column layout</span>
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${layoutCols}, 1fr)`,
                gap: 8,
              }}>
                {fields.map(field => {
                  // Calculate grid column span based on size and layout
                  let colSpan = 1;
                  if (field.size === 'full') {
                    colSpan = layoutCols;
                  } else if (field.size === 'half') {
                    colSpan = layoutCols === 2 ? 1 : 2;
                  } else if (field.size === 'third') {
                    colSpan = 1;
                  }

                  return (
                    <div
                      key={field.key}
                      style={{
                        gridColumn: `span ${colSpan}`,
                        padding: '12px 16px',
                        background: 'var(--panel)',
                        borderRadius: 8,
                        borderLeft: `4px solid ${field.color}`,
                        minHeight: 60,
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: field.color, marginBottom: 4 }}>
                        {field.label}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {field.size === 'full' ? 'Full width' : field.size === 'half' ? (layoutCols === 2 ? 'Half width' : '2/3 width') : (layoutCols === 2 ? 'Half width' : '1/3 width')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg)',
        }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {fields.length} section{fields.length !== 1 ? 's' : ''} defined
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !canvasName.trim() || fields.length === 0}>
              <SaveIcon fontSize="small" />
              <span>{saving ? 'Creating...' : 'Create Canvas'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Canvas Renderer - uses the canvas_definition from custom_fields
function CustomCanvasRenderer({ canvas, editable, onChange }) {
  const cf = canvas.custom_fields || {};
  const definition = cf.canvas_definition || {};
  const fields = definition.fields || [];
  const canvasColor = definition.color || '#8b5cf6';
  const layoutCols = definition.layoutCols || 2;

  if (fields.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>No fields defined for this canvas.</p>
      </div>
    );
  }

  // Calculate grid column span based on size and layout
  const getColSpan = (size) => {
    if (size === 'full') return layoutCols;
    if (size === 'half') return layoutCols === 2 ? 1 : 2;
    if (size === 'third') return 1;
    return 1;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${layoutCols}, 1fr)`,
      gap: 16,
      padding: 16,
    }}>
      {fields.map(field => {
        const colSpan = getColSpan(field.size);
        const fieldColor = field.color || canvasColor;

        return (
          <div
            key={field.key}
            style={{
              gridColumn: `span ${colSpan}`,
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg)',
              borderRadius: 10,
              borderLeft: `4px solid ${fieldColor}`,
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '10px 14px',
              background: `${fieldColor}10`,
              borderBottom: '1px solid var(--border)',
            }}>
              <label style={{
                margin: 0,
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: fieldColor,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {field.label}
              </label>
            </div>
            <div style={{ flex: 1, padding: '12px 14px' }}>
              {editable ? (
                <textarea
                  value={cf[field.key] || ''}
                  onChange={e => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                  style={{
                    width: '100%',
                    minHeight: 80,
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              ) : (
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: cf[field.key] ? 'var(--text)' : 'var(--text-muted)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}>
                  {cf[field.key] || 'Not filled'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Build stats for ViewHeader
function useCanvasStats(canvasesByType) {
  return useMemo(() => {
    const total = Object.values(canvasesByType).reduce((sum, arr) => sum + arr.length, 0);
    const typeCount = Object.keys(canvasesByType).length;

    // Count by category
    const research = Object.entries(canvasesByType)
      .filter(([type]) => ['pdw_empathy_map', 'pdw_persona', 'pdw_customer_journey', 'pdw_jtbd_canvas'].includes(type))
      .reduce((sum, [, arr]) => sum + arr.length, 0);

    const business = Object.entries(canvasesByType)
      .filter(([type]) => ['pdw_lean_canvas', 'pdw_bmc_canvas', 'pdw_vp_canvas', 'pdw_swot', 'pdw_competitive_analysis'].includes(type))
      .reduce((sum, [, arr]) => sum + arr.length, 0);

    const validation = Object.entries(canvasesByType)
      .filter(([type]) => ['pdw_test_card', 'pdw_learning_card', 'pdw_experiment_canvas', 'pdw_assumption_map'].includes(type))
      .reduce((sum, [, arr]) => sum + arr.length, 0);

    const custom = canvasesByType['pdw_custom_canvas']?.length || 0;

    const stats = [
      { value: total, label: 'Total', icon: DashboardIcon },
      { value: typeCount, label: 'Types', color: '#64748b' },
      { value: research, label: 'Research', color: '#06b6d4' },
      { value: business, label: 'Business', color: '#6366f1' },
      { value: validation, label: 'Validation', color: '#f59e0b' },
    ];

    if (custom > 0) {
      stats.push({ value: custom, label: 'Custom', color: '#8b5cf6', icon: BuildIcon });
    }

    return { stats, total };
  }, [canvasesByType]);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CanvasView({ onCreateCanvas, onDeleteCanvas }) {
  const { artefacts, loading, updateArtefact, createArtefact, isCanvasType, getTypeDefinition } = usePDW();

  const [expandedTypes, setExpandedTypes] = useState({});
  const [editingCanvas, setEditingCanvas] = useState(null);
  const [viewingCanvas, setViewingCanvas] = useState(null);
  const [showCustomWizard, setShowCustomWizard] = useState(false);
  const [creatingCustom, setCreatingCustom] = useState(false);

  const canvasesByType = useMemo(() => {
    const grouped = {};
    artefacts.forEach(a => {
      if (isCanvasType(a.artefact_type)) {
        if (!grouped[a.artefact_type]) grouped[a.artefact_type] = [];
        grouped[a.artefact_type].push(a);
      }
    });
    return grouped;
  }, [artefacts, isCanvasType]);

  const canvasTypes = Object.keys(canvasesByType);
  const totalCanvases = Object.values(canvasesByType).reduce((sum, arr) => sum + arr.length, 0);

  // Get stats for header
  const { stats } = useCanvasStats(canvasesByType);

  const toggleType = (type) => {
    setExpandedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSaveCanvas = async (formData) => {
    if (editingCanvas) {
      await updateArtefact(editingCanvas.id, { customFields: formData });
      setEditingCanvas(null);
    }
  };

  const handleCreateCustomCanvas = async (data) => {
    setCreatingCustom(true);
    try {
      await createArtefact('pdw_custom_canvas', data);
      setShowCustomWizard(false);
    } catch (err) {
      console.error('Failed to create custom canvas:', err);
      alert('Failed to create custom canvas');
    } finally {
      setCreatingCustom(false);
    }
  };

  const getConfig = (type) => {
    if (type === 'pdw_custom_canvas') {
      return CUSTOM_CANVAS_CONFIG;
    }
    return CANVAS_CONFIGS[type] || { ...DEFAULT_CONFIG, name: getTypeDefinition(type)?.name || 'Canvas' };
  };

  // Get config for custom canvas that includes its definition
  const getCustomConfig = (canvas) => {
    const definition = canvas.custom_fields?.canvas_definition || {};
    const iconConfig = CANVAS_ICONS.find(i => i.value === definition.icon);
    return {
      ...CUSTOM_CANVAS_CONFIG,
      name: definition.name || 'Custom Canvas',
      color: definition.color || '#8b5cf6',
      icon: iconConfig?.icon || BuildIcon,
      description: definition.description || 'User-defined canvas',
      fields: definition.fields || [],
    };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
        <div className="cv-spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Loading canvases...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with inline stats */}
      <ViewHeader
        icon={DashboardIcon}
        iconColor="#6366f1"
        title="My Canvases"
        stats={totalCanvases > 0 ? stats : undefined}
        createLabel="Create Custom"
        onCreate={() => setShowCustomWizard(true)}
        actions={
          <Button variant="ghost" onClick={() => onCreateCanvas?.()}>
            <GridViewIcon fontSize="small" />
            <span>Canvas Library</span>
          </Button>
        }
      />

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>
        {/* Info tip */}
        {totalCanvases > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: 'rgba(59, 130, 246, 0.08)',
            borderRadius: 8,
            marginBottom: 16,
          }}>
            <InfoIcon style={{ color: '#3b82f6', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text)' }}>
              Click any canvas to view full-size. Use Edit to fill in fields. Export to PNG or SVG from the viewer.
            </p>
          </div>
        )}

        {/* Empty State */}
        {totalCanvases === 0 && (
          <QuickStart
            icon={GridViewIcon}
            title="Strategic Canvas Workspace"
            description="Create and manage strategic canvases like Lean Canvas, SWOT Analysis, Empathy Maps, and more. You can also create your own custom canvases with user-defined sections."
            steps={['Pick a canvas type', 'Fill in sections', 'Export & share']}
            actionLabel="Browse Canvas Library"
            onAction={() => onCreateCanvas?.()}
            secondaryActionLabel="Create Custom Canvas"
            onSecondaryAction={() => setShowCustomWizard(true)}
          />
        )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {canvasTypes.map(type => {
          const config = getConfig(type);
          const canvases = canvasesByType[type];
          const isExpanded = expandedTypes[type] !== false;
          const Icon = config.icon;

          return (
            <div key={type} className="cv-group">
              <div
                className="cv-group__header"
                onClick={() => toggleType(type)}
                style={{ borderLeftColor: config.color }}
              >
                {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                <div className="cv-group__icon" style={{ backgroundColor: `${config.color}15` }}>
                  <Icon style={{ color: config.color }} />
                </div>
                <div className="cv-group__info">
                  <h3>{config.name}</h3>
                  <p>{config.description}</p>
                </div>
                <span className="cv-group__count">{canvases.length}</span>
                <button
                  className="cv-group__add"
                  onClick={e => { e.stopPropagation(); onCreateCanvas?.(type); }}
                  style={{ color: config.color, borderColor: config.color }}
                >
                  <AddIcon fontSize="small" />
                </button>
              </div>

              {isExpanded && (
                <div className="cv-group__content">
                  {canvases.map(canvas => {
                    // For custom canvases, get the config from the canvas definition
                    const cardConfig = type === 'pdw_custom_canvas' ? getCustomConfig(canvas) : config;
                    return (
                      <CanvasCard
                        key={canvas.id}
                        canvas={canvas}
                        config={cardConfig}
                        onEdit={setEditingCanvas}
                        onDelete={onDeleteCanvas}
                        onExpand={setViewingCanvas}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      </div>

      {/* Modals */}
      {editingCanvas && (
        <CanvasModal
          canvas={editingCanvas}
          config={editingCanvas.artefact_type === 'pdw_custom_canvas' ? getCustomConfig(editingCanvas) : getConfig(editingCanvas.artefact_type)}
          onSave={handleSaveCanvas}
          onClose={() => setEditingCanvas(null)}
        />
      )}

      {viewingCanvas && (
        <CanvasModal
          canvas={viewingCanvas}
          config={viewingCanvas.artefact_type === 'pdw_custom_canvas' ? getCustomConfig(viewingCanvas) : getConfig(viewingCanvas.artefact_type)}
          onSave={handleSaveCanvas}
          onClose={() => setViewingCanvas(null)}
          readOnly
        />
      )}

      {/* Custom Canvas Creation Wizard */}
      {showCustomWizard && (
        <CustomCanvasWizard
          onSave={handleCreateCustomCanvas}
          onClose={() => setShowCustomWizard(false)}
          saving={creatingCustom}
        />
      )}
    </div>
  );
}
