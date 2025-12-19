// components/pdw/views/CanvasLibrary.js
// Canvas Library - Template picker with guided canvas creation wizard

import { useState, useMemo, useCallback } from 'react';
import { usePDW } from '../PDWContext';

// Shared UI Components
import {
  Button,
  IconButton,
  ViewHeader,
  Card,
} from '../../ui';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import RouteIcon from '@mui/icons-material/Route';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BalanceIcon from '@mui/icons-material/Balance';
import ChecklistIcon from '@mui/icons-material/Checklist';
import SpeedIcon from '@mui/icons-material/Speed';
import ScienceIcon from '@mui/icons-material/Science';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import GridViewIcon from '@mui/icons-material/GridView';
import DiamondIcon from '@mui/icons-material/Diamond';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SecurityIcon from '@mui/icons-material/Security';
import MapIcon from '@mui/icons-material/Map';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import ArticleIcon from '@mui/icons-material/Article';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoIcon from '@mui/icons-material/Info';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';

// Canvas types with comprehensive guidance
const CANVAS_LIBRARY = {
  research: {
    title: 'User Research & Discovery',
    description: 'Understand your users deeply before building solutions',
    color: '#06b6d4',
    icon: PeopleIcon,
    whenToUse: 'Start here when beginning a new product or feature. Use these before ideation.',
    canvases: [
      {
        id: 'pdw_empathy_map',
        name: 'Empathy Map',
        icon: PeopleIcon,
        color: '#06b6d4',
        purpose: 'Understand what users think, feel, say, and do',
        whenToUse: 'After user interviews to synthesize observations',
        inputs: ['User interview notes', 'Observation data'],
        outputs: ['User needs', 'Pain points', 'Opportunities'],
        timeToComplete: '30-60 minutes',
        teamSize: '1-3 people',
      },
      {
        id: 'pdw_customer_journey',
        name: 'Customer Journey Map',
        icon: RouteIcon,
        color: '#0891b2',
        purpose: 'Visualize the end-to-end user experience',
        whenToUse: 'To identify pain points across the entire experience',
        inputs: ['User research', 'Touchpoint analysis'],
        outputs: ['Pain points', 'Opportunity areas', 'Service gaps'],
        timeToComplete: '2-4 hours',
        teamSize: '2-5 people',
      },
      {
        id: 'pdw_persona',
        name: 'User Persona',
        icon: PersonIcon,
        color: '#0e7490',
        purpose: 'Create a representative user archetype',
        whenToUse: 'After initial research to align team on target user',
        inputs: ['User research', 'Demographic data', 'Behavioral patterns'],
        outputs: ['Shared understanding of user', 'Design decisions guide'],
        timeToComplete: '1-2 hours',
        teamSize: '2-4 people',
      },
      {
        id: 'pdw_jtbd_canvas',
        name: 'Jobs To Be Done',
        icon: WorkIcon,
        color: '#155e75',
        purpose: 'Understand the job users are trying to accomplish',
        whenToUse: 'When defining what problem to solve',
        inputs: ['User interviews', 'Behavioral observations'],
        outputs: ['Job statements', 'Success criteria', 'Pain points'],
        timeToComplete: '1-2 hours',
        teamSize: '1-3 people',
      },
    ],
  },
  ideation: {
    title: 'Ideation & Solution Design',
    description: 'Generate and structure solution ideas',
    color: '#8b5cf6',
    icon: AccountTreeIcon,
    whenToUse: 'After understanding the problem space. Use to generate and prioritize ideas.',
    canvases: [
      {
        id: 'pdw_opportunity_solution_tree',
        name: 'Opportunity Solution Tree',
        icon: AccountTreeIcon,
        color: '#8b5cf6',
        purpose: 'Map opportunities to outcomes and solutions',
        whenToUse: 'When moving from discovery to solution ideation',
        inputs: ['Desired outcomes', 'Opportunities identified', 'Solution ideas'],
        outputs: ['Prioritized opportunities', 'Solution hypotheses'],
        timeToComplete: '1-2 hours',
        teamSize: '3-6 people',
      },
    ],
  },
  prioritization: {
    title: 'Prioritization & Decision Making',
    description: 'Make informed decisions about what to build',
    color: '#22c55e',
    icon: BalanceIcon,
    whenToUse: 'When you have multiple options and need to decide what to pursue.',
    canvases: [
      {
        id: 'pdw_impact_effort',
        name: 'Impact/Effort Matrix',
        icon: TrendingUpIcon,
        color: '#22c55e',
        purpose: 'Prioritize ideas by impact vs effort',
        whenToUse: 'When deciding between multiple solution ideas',
        inputs: ['List of ideas or features', 'Team estimates'],
        outputs: ['Quick wins', 'Big bets', 'Deprioritized items'],
        timeToComplete: '30-60 minutes',
        teamSize: '3-8 people',
      },
      {
        id: 'pdw_rice_scoring',
        name: 'RICE Scoring',
        icon: SpeedIcon,
        color: '#16a34a',
        purpose: 'Score features by Reach, Impact, Confidence, Effort',
        whenToUse: 'For quantitative prioritization of backlog items',
        inputs: ['Feature list', 'Reach estimates', 'Impact estimates'],
        outputs: ['Prioritized feature list with scores'],
        timeToComplete: '1-2 hours',
        teamSize: '2-5 people',
      },
      {
        id: 'pdw_moscow',
        name: 'MoSCoW Prioritization',
        icon: ChecklistIcon,
        color: '#15803d',
        purpose: 'Categorize features as Must/Should/Could/Won\'t',
        whenToUse: 'When defining MVP scope or release planning',
        inputs: ['Feature requirements', 'Stakeholder input'],
        outputs: ['Must-have features', 'Nice-to-haves', 'Out of scope'],
        timeToComplete: '1-2 hours',
        teamSize: '3-6 people',
      },
      {
        id: 'pdw_kano_model',
        name: 'Kano Model',
        icon: DiamondIcon,
        color: '#166534',
        purpose: 'Classify features by customer satisfaction impact',
        whenToUse: 'When understanding which features delight vs are expected',
        inputs: ['Feature list', 'Customer survey data'],
        outputs: ['Basic needs', 'Performance features', 'Delighters'],
        timeToComplete: '2-4 hours',
        teamSize: '2-4 people',
      },
    ],
  },
  validation: {
    title: 'Validation & Experimentation',
    description: 'Test assumptions and learn from experiments',
    color: '#f59e0b',
    icon: ScienceIcon,
    whenToUse: 'Before building. Use to reduce risk by testing assumptions.',
    canvases: [
      {
        id: 'pdw_assumption_map',
        name: 'Assumption Mapping',
        icon: SecurityIcon,
        color: '#f59e0b',
        purpose: 'Identify and prioritize risky assumptions',
        whenToUse: 'Before starting development to identify what to test',
        inputs: ['Product concept', 'Business model'],
        outputs: ['Risk-ranked assumptions', 'Test priorities'],
        timeToComplete: '1-2 hours',
        teamSize: '3-6 people',
      },
      {
        id: 'pdw_test_card',
        name: 'Test Card',
        icon: AssignmentIcon,
        color: '#d97706',
        purpose: 'Design an experiment to test a hypothesis',
        whenToUse: 'When planning how to validate an assumption',
        inputs: ['Hypothesis', 'Success criteria'],
        outputs: ['Test design', 'Metrics to track', 'Pass/fail criteria'],
        timeToComplete: '30-60 minutes',
        teamSize: '1-3 people',
      },
      {
        id: 'pdw_learning_card',
        name: 'Learning Card',
        icon: SchoolIcon,
        color: '#b45309',
        purpose: 'Capture insights from experiments',
        whenToUse: 'After running an experiment',
        inputs: ['Experiment results', 'Data collected'],
        outputs: ['Validated/invalidated hypotheses', 'Next steps'],
        timeToComplete: '30 minutes',
        teamSize: '1-3 people',
      },
      {
        id: 'pdw_experiment_canvas',
        name: 'Experiment Canvas',
        icon: ScienceIcon,
        color: '#92400e',
        purpose: 'Plan a complete validation experiment',
        whenToUse: 'When designing rigorous experiments',
        inputs: ['Hypothesis', 'Resources available', 'Timeline'],
        outputs: ['Experiment plan', 'Success metrics', 'Learning objectives'],
        timeToComplete: '1-2 hours',
        teamSize: '2-4 people',
      },
    ],
  },
  business: {
    title: 'Business Strategy & Model',
    description: 'Define and validate your business model',
    color: '#6366f1',
    icon: BusinessIcon,
    whenToUse: 'When working on business viability and go-to-market strategy.',
    canvases: [
      {
        id: 'pdw_lean_canvas',
        name: 'Lean Canvas',
        icon: GridViewIcon,
        color: '#6366f1',
        purpose: 'One-page business model for startups',
        whenToUse: 'When creating or pivoting a business model',
        inputs: ['Problem hypothesis', 'Solution concept', 'Target customer'],
        outputs: ['Business model overview', 'Key assumptions to test'],
        timeToComplete: '1-2 hours',
        teamSize: '2-5 people',
      },
      {
        id: 'pdw_bmc_canvas',
        name: 'Business Model Canvas',
        icon: BusinessIcon,
        color: '#4f46e5',
        purpose: 'Comprehensive business model visualization',
        whenToUse: 'For established products or detailed business planning',
        inputs: ['Market research', 'Value proposition', 'Revenue model'],
        outputs: ['Complete business model', 'Partnership needs', 'Cost structure'],
        timeToComplete: '2-4 hours',
        teamSize: '3-6 people',
      },
      {
        id: 'pdw_vp_canvas',
        name: 'Value Proposition Canvas',
        icon: DiamondIcon,
        color: '#4338ca',
        purpose: 'Design value propositions that customers want',
        whenToUse: 'When defining product-market fit',
        inputs: ['Customer profile', 'Jobs/pains/gains'],
        outputs: ['Value proposition', 'Fit assessment', 'Feature priorities'],
        timeToComplete: '1-2 hours',
        teamSize: '2-4 people',
      },
      {
        id: 'pdw_competitive_analysis',
        name: 'Competitive Analysis',
        icon: CompareArrowsIcon,
        color: '#3730a3',
        purpose: 'Analyze competitive landscape',
        whenToUse: 'When positioning your product in the market',
        inputs: ['Competitor list', 'Feature comparison', 'Market data'],
        outputs: ['Competitive positioning', 'Differentiation opportunities'],
        timeToComplete: '2-4 hours',
        teamSize: '2-4 people',
      },
      {
        id: 'pdw_swot',
        name: 'SWOT Analysis',
        icon: SecurityIcon,
        color: '#312e81',
        purpose: 'Assess strengths, weaknesses, opportunities, threats',
        whenToUse: 'For strategic planning and situational analysis',
        inputs: ['Internal assessment', 'Market analysis', 'Competitor data'],
        outputs: ['Strategic insights', 'Action priorities'],
        timeToComplete: '1-2 hours',
        teamSize: '3-8 people',
      },
    ],
  },
  delivery: {
    title: 'Design & Delivery',
    description: 'Plan and design your solution',
    color: '#0ea5e9',
    icon: MapIcon,
    whenToUse: 'When moving from validation to building.',
    canvases: [
      {
        id: 'pdw_service_blueprint',
        name: 'Service Blueprint',
        icon: MapIcon,
        color: '#0ea5e9',
        purpose: 'Map the service delivery process end-to-end',
        whenToUse: 'When designing service experiences',
        inputs: ['Customer journey', 'Touchpoints', 'Backend processes'],
        outputs: ['Service design', 'Process requirements', 'Integration needs'],
        timeToComplete: '4-8 hours',
        teamSize: '4-8 people',
      },
      {
        id: 'pdw_user_story_map',
        name: 'User Story Map',
        icon: ViewTimelineIcon,
        color: '#0284c7',
        purpose: 'Organize user stories into a coherent product',
        whenToUse: 'When planning releases and defining scope',
        inputs: ['User stories', 'User workflow', 'Release goals'],
        outputs: ['Release plan', 'MVP definition', 'Feature prioritization'],
        timeToComplete: '2-4 hours',
        teamSize: '3-6 people',
      },
      {
        id: 'pdw_feature_canvas',
        name: 'Feature Canvas',
        icon: ArticleIcon,
        color: '#0369a1',
        purpose: 'Define a feature in detail before building',
        whenToUse: 'When specifying features for development',
        inputs: ['Feature concept', 'User needs', 'Technical constraints'],
        outputs: ['Feature specification', 'Success criteria', 'Dependencies'],
        timeToComplete: '1-2 hours',
        teamSize: '2-4 people',
      },
    ],
  },
};

// Canvas field configurations for each canvas type
const CANVAS_FIELDS = {
  pdw_empathy_map: {
    layout: 'quadrant',
    fields: [
      { key: 'thinks', label: 'Thinks', placeholder: 'What are they really thinking? What matters to them?', hint: 'Beliefs, assumptions, worries' },
      { key: 'feels', label: 'Feels', placeholder: 'What emotions do they experience?', hint: 'Hopes, fears, frustrations' },
      { key: 'says', label: 'Says', placeholder: 'Include direct quotes from research', hint: 'Actual statements, expressions' },
      { key: 'does', label: 'Does', placeholder: 'What actions do they take?', hint: 'Observable behaviors' },
      { key: 'pains', label: 'Pains', placeholder: 'Frustrations, fears, obstacles', hint: 'What frustrates them?' },
      { key: 'gains', label: 'Gains', placeholder: 'Goals, desires, measures of success', hint: 'What does success look like?' },
    ],
  },
  pdw_lean_canvas: {
    layout: 'lean',
    fields: [
      { key: 'problem', label: 'Problem', placeholder: 'What are the top 3 problems you are solving?', hint: 'If no problem, nothing else matters' },
      { key: 'existing_alternatives', label: 'Existing Alternatives', placeholder: 'How do people solve these today?', hint: 'Current workarounds' },
      { key: 'solution', label: 'Solution', placeholder: 'Top 3 features or capabilities', hint: 'Keep it simple' },
      { key: 'key_metrics', label: 'Key Metrics', placeholder: 'What will you measure?', hint: 'Leading indicators' },
      { key: 'unique_value_proposition', label: 'Unique Value Proposition', placeholder: 'Single, clear, compelling message', hint: 'Why are you different?' },
      { key: 'high_level_concept', label: 'High-Level Concept', placeholder: 'X for Y (e.g., "YouTube for courses")', hint: 'Elevator pitch' },
      { key: 'unfair_advantage', label: 'Unfair Advantage', placeholder: 'What cannot be easily copied?', hint: 'Moat, defensibility' },
      { key: 'channels', label: 'Channels', placeholder: 'How will you reach customers?', hint: 'Distribution paths' },
      { key: 'customer_segments', label: 'Customer Segments', placeholder: 'Who are your target customers?', hint: 'Be specific' },
      { key: 'early_adopters', label: 'Early Adopters', placeholder: 'Ideal first customers', hint: 'Who has the problem most?' },
      { key: 'cost_structure', label: 'Cost Structure', placeholder: 'Main costs to run business', hint: 'Fixed and variable' },
      { key: 'revenue_streams', label: 'Revenue Streams', placeholder: 'How will you make money?', hint: 'Pricing model' },
    ],
  },
  pdw_swot: {
    layout: 'quadrant',
    fields: [
      { key: 'strengths', label: 'Strengths', placeholder: 'One strength per line...', hint: 'Internal positives - what you do well', color: '#22c55e' },
      { key: 'weaknesses', label: 'Weaknesses', placeholder: 'One weakness per line...', hint: 'Internal negatives - areas to improve', color: '#ef4444' },
      { key: 'opportunities', label: 'Opportunities', placeholder: 'One opportunity per line...', hint: 'External positives - trends to leverage', color: '#3b82f6' },
      { key: 'threats', label: 'Threats', placeholder: 'One threat per line...', hint: 'External negatives - risks to monitor', color: '#f59e0b' },
    ],
  },
  pdw_vp_canvas: {
    layout: 'split',
    fields: [
      { key: 'customer_jobs', label: 'Customer Jobs', placeholder: 'Jobs they are trying to get done...', hint: 'Functional, social, emotional jobs', side: 'customer' },
      { key: 'customer_pains', label: 'Customer Pains', placeholder: 'Frustrations, risks, obstacles...', hint: 'What frustrates them?', side: 'customer' },
      { key: 'customer_gains', label: 'Customer Gains', placeholder: 'Outcomes they want...', hint: 'Required, expected, desired', side: 'customer' },
      { key: 'products_services', label: 'Products & Services', placeholder: 'What you offer...', hint: 'Features, functionality', side: 'value' },
      { key: 'pain_relievers', label: 'Pain Relievers', placeholder: 'How you alleviate pains...', hint: 'Address specific pains', side: 'value' },
      { key: 'gain_creators', label: 'Gain Creators', placeholder: 'How you create gains...', hint: 'Enable specific gains', side: 'value' },
    ],
  },
  pdw_bmc_canvas: {
    layout: 'bmc',
    fields: [
      { key: 'key_partners', label: 'Key Partners', placeholder: 'Who are your key partners and suppliers?' },
      { key: 'key_activities', label: 'Key Activities', placeholder: 'What key activities does your value proposition require?' },
      { key: 'key_resources', label: 'Key Resources', placeholder: 'What resources does your value proposition require?' },
      { key: 'value_propositions', label: 'Value Propositions', placeholder: 'What value do you deliver to the customer?' },
      { key: 'customer_relationships', label: 'Customer Relationships', placeholder: 'What type of relationship does each segment expect?' },
      { key: 'channels', label: 'Channels', placeholder: 'How do you reach your customer segments?' },
      { key: 'customer_segments', label: 'Customer Segments', placeholder: 'Who are your most important customers?' },
      { key: 'cost_structure', label: 'Cost Structure', placeholder: 'What are the most important costs?' },
      { key: 'revenue_streams', label: 'Revenue Streams', placeholder: 'For what value are customers willing to pay?' },
    ],
  },
  pdw_persona: {
    layout: 'persona',
    fields: [
      { key: 'name', label: 'Persona Name', placeholder: 'Give them a memorable name' },
      { key: 'role', label: 'Role/Title', placeholder: 'Their job or role' },
      { key: 'demographics', label: 'Demographics', placeholder: 'Age, location, background' },
      { key: 'goals', label: 'Goals', placeholder: 'What are they trying to achieve?' },
      { key: 'frustrations', label: 'Frustrations', placeholder: 'What blocks them?' },
      { key: 'bio', label: 'Bio', placeholder: 'Brief background story' },
      { key: 'quote', label: 'Quote', placeholder: 'A characteristic statement' },
    ],
  },
  pdw_jtbd_canvas: {
    layout: 'sections',
    fields: [
      { key: 'job_statement', label: 'Job Statement', placeholder: 'When I [situation], I want to [motivation], so I can [outcome].' },
      { key: 'current_solutions', label: 'Current Solutions', placeholder: 'How do they currently solve this job?' },
      { key: 'success_criteria', label: 'Success Criteria', placeholder: 'How do they measure success?' },
      { key: 'constraints', label: 'Constraints', placeholder: 'What limitations do they have?' },
      { key: 'emotional_jobs', label: 'Emotional Jobs', placeholder: 'How do they want to feel?' },
      { key: 'social_jobs', label: 'Social Jobs', placeholder: 'How do they want to be perceived?' },
    ],
  },
};

// Default field config for unknown types
function getDefaultFieldsForCanvas(canvas) {
  return {
    layout: 'sections',
    fields: [
      { key: 'summary', label: 'Summary', placeholder: `Describe your ${canvas.name.toLowerCase()}...` },
      { key: 'details', label: 'Details', placeholder: 'Add more details...' },
      { key: 'notes', label: 'Notes', placeholder: 'Additional notes...' },
    ],
  };
}

// Build stats for ViewHeader
function useCanvasStats(canvasCounts) {
  return useMemo(() => {
    const total = Object.values(canvasCounts).reduce((sum, count) => sum + count, 0);
    const byCategory = {};

    Object.entries(CANVAS_LIBRARY).forEach(([catId, category]) => {
      byCategory[catId] = category.canvases.reduce(
        (sum, c) => sum + (canvasCounts[c.id] || 0), 0
      );
    });

    const stats = [
      { value: total, label: 'Total', icon: DashboardIcon },
      { value: byCategory.research || 0, label: 'Research', color: CANVAS_LIBRARY.research.color },
      { value: byCategory.validation || 0, label: 'Validation', color: CANVAS_LIBRARY.validation.color },
      { value: byCategory.business || 0, label: 'Business', color: CANVAS_LIBRARY.business.color },
    ];

    return { stats, total };
  }, [canvasCounts]);
}

// ============ CANVAS CREATION WIZARD ============

function CanvasCreationWizard({ canvas, category, onSave, onClose, saving }) {
  const [canvasName, setCanvasName] = useState(`New ${canvas.name}`);
  const [formData, setFormData] = useState({});
  const [showTips, setShowTips] = useState(true);

  const fieldConfig = CANVAS_FIELDS[canvas.id] || getDefaultFieldsForCanvas(canvas);
  const Icon = canvas.icon;

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(canvas.id, canvasName, formData);
  };

  const filledFields = fieldConfig.fields.filter(f => {
    const val = formData[f.key];
    return val && (typeof val === 'string' ? val.trim() : val.length > 0);
  }).length;
  const completeness = Math.round((filledFields / fieldConfig.fields.length) * 100);

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
          maxWidth: 900,
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
          borderBottom: `3px solid ${canvas.color}`,
          background: 'var(--bg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: `${canvas.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon style={{ color: canvas.color, fontSize: 28 }} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: canvas.color, fontWeight: 500 }}>{canvas.name}</span>
              <input
                type="text"
                value={canvasName}
                onChange={(e) => setCanvasName(e.target.value)}
                placeholder="Canvas name..."
                style={{
                  display: 'block',
                  width: 300,
                  padding: '4px 0',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{completeness}% filled</span>
              <div style={{ width: 80, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${completeness}%`, height: '100%', backgroundColor: canvas.color, borderRadius: 3 }} />
              </div>
            </div>
            <IconButton
              icon={LightbulbIcon}
              onClick={() => setShowTips(!showTips)}
              title={showTips ? 'Hide tips' : 'Show tips'}
              style={showTips ? { background: `${canvas.color}15`, color: canvas.color } : undefined}
            />
            <IconButton icon={CloseIcon} onClick={onClose} title="Close" />
          </div>
        </div>

        {/* Tips Panel */}
        {showTips && (
          <div style={{
            padding: '12px 24px',
            background: `${canvas.color}08`,
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <LightbulbIcon style={{ color: canvas.color, fontSize: 20, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text)' }}>How to use this canvas</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{canvas.purpose}</p>
              {canvas.inputs && (
                <div style={{ marginTop: 8, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  <strong>Inputs:</strong> {canvas.inputs.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: fieldConfig.layout === 'quadrant' ? '1fr 1fr' : '1fr',
            gap: 16,
          }}>
            {fieldConfig.fields.map(field => (
              <div
                key={field.key}
                style={{
                  background: 'var(--bg)',
                  borderRadius: 10,
                  padding: 16,
                  borderLeft: field.color ? `3px solid ${field.color}` : '3px solid var(--border)',
                }}
              >
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: field.color || 'var(--text)',
                  marginBottom: 4,
                }}>
                  {field.label}
                  {formData[field.key] && <CheckCircleIcon style={{ fontSize: 16, color: '#22c55e' }} />}
                </label>
                {field.hint && (
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    {field.hint}
                  </span>
                )}
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  style={{
                    width: '100%',
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
              </div>
            ))}
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
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{filledFields} of {fieldConfig.fields.length} sections filled</span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>You can always edit this later</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !canvasName.trim()}>
              <SaveIcon fontSize="small" />
              <span>{saving ? 'Creating...' : 'Create Canvas'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ CANVAS TYPE CARD ============

function CanvasTypeCard({ canvas, category, onSelect, existingCount, creating }) {
  const Icon = canvas.icon;

  return (
    <Card
      onClick={() => !creating && onSelect(canvas, category)}
      style={{
        borderLeft: `4px solid ${canvas.color}`,
        opacity: creating ? 0.6 : 1,
        cursor: creating ? 'not-allowed' : 'pointer',
      }}
    >
      <Card.Header>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: `${canvas.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon style={{ color: canvas.color }} />
        </div>
        <div style={{ flex: 1 }}>
          <Card.Title style={{ marginBottom: 0 }}>{canvas.name}</Card.Title>
          {existingCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{existingCount} existing</span>
          )}
        </div>
      </Card.Header>

      <p style={{ margin: '8px 0', fontSize: '0.875rem', color: 'var(--text)' }}>{canvas.purpose}</p>

      <Card.Section label="When to use">
        {canvas.whenToUse}
      </Card.Section>

      <Card.Footer>
        <Card.Meta icon={AccessTimeIcon}>{canvas.timeToComplete}</Card.Meta>
        <Card.Meta icon={GroupIcon}>{canvas.teamSize}</Card.Meta>
        <Button variant="primary" size="sm" disabled={creating} style={{ marginLeft: 'auto' }}>
          <AddIcon fontSize="small" />
          <span>{creating ? 'Creating...' : 'Create'}</span>
        </Button>
      </Card.Footer>
    </Card>
  );
}

// ============ CATEGORY SECTION ============

function CategorySection({ categoryId, category, onSelectCanvas, canvasCounts, creating }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = category.icon;

  const totalCanvases = category.canvases.reduce(
    (sum, c) => sum + (canvasCounts[c.id] || 0), 0
  );

  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          padding: '16px 20px',
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderLeft: `4px solid ${category.color}`,
          borderRadius: 12,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: `${category.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon style={{ color: category.color, fontSize: 24 }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>{category.title}</h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{category.description}</p>
        </div>
        {totalCanvases > 0 && (
          <span style={{
            padding: '4px 10px',
            background: `${category.color}15`,
            color: category.color,
            borderRadius: 12,
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}>
            {totalCanvases}
          </span>
        )}
        {expanded ? (
          <ExpandMoreIcon style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronRightIcon style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {expanded && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            background: `${category.color}08`,
            borderRadius: '0 0 8px 8px',
            marginTop: -8,
            marginBottom: 16,
          }}>
            <InfoIcon style={{ color: category.color, fontSize: 18 }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{category.whenToUse}</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
            paddingLeft: 24,
          }}>
            {category.canvases.map(canvas => (
              <CanvasTypeCard
                key={canvas.id}
                canvas={canvas}
                category={category}
                onSelect={onSelectCanvas}
                existingCount={canvasCounts[canvas.id] || 0}
                creating={creating}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============ WORKFLOW HINT ============

function WorkflowHint() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '16px 24px',
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      marginBottom: 24,
      overflowX: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <LightbulbIcon style={{ color: '#f59e0b' }} />
        <strong style={{ fontSize: '0.875rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>Recommended Flow</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(CANVAS_LIBRARY).map(([id, cat], i) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {i > 0 && <ArrowForwardIcon style={{ color: 'var(--text-muted)', fontSize: 16 }} />}
            <span style={{ fontSize: '0.8125rem', color: cat.color, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {i + 1}. {cat.title.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export default function CanvasLibrary({ onCreateCanvas, onNavigateToCanvas }) {
  const { artefacts, isCanvasType, createArtefact } = usePDW();

  const [creating, setCreating] = useState(false);
  const [wizardCanvas, setWizardCanvas] = useState(null);
  const [wizardCategory, setWizardCategory] = useState(null);

  // Count existing canvases by type
  const canvasCounts = useMemo(() => {
    const counts = {};
    artefacts.forEach(a => {
      if (isCanvasType(a.artefact_type)) {
        counts[a.artefact_type] = (counts[a.artefact_type] || 0) + 1;
      }
    });
    return counts;
  }, [artefacts, isCanvasType]);

  // Get stats for header
  const { stats, total } = useCanvasStats(canvasCounts);

  // Handle canvas selection - opens the wizard
  const handleSelectCanvas = useCallback((canvas, category) => {
    if (creating) return;
    setWizardCanvas(canvas);
    setWizardCategory(category);
  }, [creating]);

  // Handle wizard save
  const handleWizardSave = useCallback(async (canvasType, name, formData) => {
    setCreating(true);
    try {
      await createArtefact(canvasType, {
        name: name,
        customFields: formData,
      });

      setWizardCanvas(null);
      setWizardCategory(null);

      if (onNavigateToCanvas) {
        onNavigateToCanvas();
      }
    } catch (err) {
      console.error('Failed to create canvas:', err);
      alert('Failed to create canvas');
    } finally {
      setCreating(false);
    }
  }, [createArtefact, onNavigateToCanvas]);

  // Close wizard
  const handleWizardClose = useCallback(() => {
    if (!creating) {
      setWizardCanvas(null);
      setWizardCategory(null);
    }
  }, [creating]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with inline stats */}
      <ViewHeader
        icon={DashboardIcon}
        iconColor="#6366f1"
        title="Canvas Library"
        stats={total > 0 ? stats : undefined}
      />

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
        {/* Workflow hint */}
        <WorkflowHint />

        {/* Categories */}
        {Object.entries(CANVAS_LIBRARY).map(([categoryId, category]) => (
          <CategorySection
            key={categoryId}
            categoryId={categoryId}
            category={category}
            onSelectCanvas={handleSelectCanvas}
            canvasCounts={canvasCounts}
            creating={creating}
          />
        ))}
      </div>

      {/* Canvas Creation Wizard */}
      {wizardCanvas && (
        <CanvasCreationWizard
          canvas={wizardCanvas}
          category={wizardCategory}
          onSave={handleWizardSave}
          onClose={handleWizardClose}
          saving={creating}
        />
      )}
    </div>
  );
}

// Export for use in other components
export { CANVAS_LIBRARY };
