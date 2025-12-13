// components/pdw/views/CanvasLibrary.js
// Canvas Library - Entry point showing all canvas types with clear guidance on when/how to use each

import { useState, useMemo } from 'react';
import { usePDW } from '../PDWContext';

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

// Canvas type card component
function CanvasTypeCard({ canvas, category, onSelect, existingCount }) {
  const Icon = canvas.icon;

  return (
    <div
      className="pdw-canvas-library__card"
      onClick={() => onSelect(canvas, category)}
      style={{ borderLeftColor: canvas.color }}
    >
      <div className="pdw-canvas-library__card-header">
        <div className="pdw-canvas-library__card-icon" style={{ backgroundColor: `${canvas.color}15` }}>
          <Icon style={{ color: canvas.color }} />
        </div>
        <div className="pdw-canvas-library__card-meta">
          <h4>{canvas.name}</h4>
          {existingCount > 0 && (
            <span className="pdw-canvas-library__card-count">{existingCount} existing</span>
          )}
        </div>
      </div>

      <p className="pdw-canvas-library__card-purpose">{canvas.purpose}</p>

      <div className="pdw-canvas-library__card-when">
        <strong>When to use:</strong> {canvas.whenToUse}
      </div>

      <div className="pdw-canvas-library__card-footer">
        <span className="pdw-canvas-library__card-time">⏱ {canvas.timeToComplete}</span>
        <span className="pdw-canvas-library__card-team">👥 {canvas.teamSize}</span>
      </div>

      <button className="pdw-canvas-library__card-btn">
        <AddIcon fontSize="small" />
        Create Canvas
      </button>
    </div>
  );
}

// Category section component
function CategorySection({ categoryId, category, onSelectCanvas, canvasCounts }) {
  const [expanded, setExpanded] = useState(true);
  const Icon = category.icon;

  const totalCanvases = category.canvases.reduce(
    (sum, c) => sum + (canvasCounts[c.id] || 0),
    0
  );

  return (
    <div className="pdw-canvas-library__category">
      <div
        className="pdw-canvas-library__category-header"
        onClick={() => setExpanded(!expanded)}
        style={{ borderLeftColor: category.color }}
      >
        <div className="pdw-canvas-library__category-icon" style={{ backgroundColor: `${category.color}15` }}>
          <Icon style={{ color: category.color }} />
        </div>
        <div className="pdw-canvas-library__category-info">
          <h3>{category.title}</h3>
          <p>{category.description}</p>
        </div>
        {totalCanvases > 0 && (
          <span className="pdw-canvas-library__category-count">{totalCanvases}</span>
        )}
        <ArrowForwardIcon
          className={`pdw-canvas-library__category-arrow ${expanded ? 'expanded' : ''}`}
        />
      </div>

      {expanded && (
        <>
          <div className="pdw-canvas-library__category-guidance">
            <InfoIcon fontSize="small" />
            {category.whenToUse}
          </div>

          <div className="pdw-canvas-library__category-canvases">
            {category.canvases.map(canvas => (
              <CanvasTypeCard
                key={canvas.id}
                canvas={canvas}
                category={category}
                onSelect={onSelectCanvas}
                existingCount={canvasCounts[canvas.id] || 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CanvasLibrary({ onCreateCanvas, onNavigateToCanvas }) {
  const { artefacts, isCanvasType } = usePDW();

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

  const handleSelectCanvas = (canvas, category) => {
    if (onCreateCanvas) {
      onCreateCanvas(canvas.id);
    }
  };

  const totalCanvases = Object.values(canvasCounts).reduce((sum, c) => sum + c, 0);

  return (
    <div className="pdw-canvas-library">
      <div className="pdw-canvas-library__header">
        <div>
          <h2>Canvas Library</h2>
          <p>Choose the right framework for your current activity. Each canvas is designed for a specific stage of product discovery.</p>
        </div>
        {totalCanvases > 0 && (
          <div className="pdw-canvas-library__summary">
            <span className="pdw-canvas-library__summary-count">{totalCanvases}</span>
            <span>canvases created</span>
          </div>
        )}
      </div>

      <div className="pdw-canvas-library__workflow-hint">
        <h4>💡 Recommended Workflow</h4>
        <div className="pdw-canvas-library__workflow-steps">
          <span style={{ color: CANVAS_LIBRARY.research.color }}>1. Research</span>
          <ArrowForwardIcon fontSize="small" />
          <span style={{ color: CANVAS_LIBRARY.ideation.color }}>2. Ideate</span>
          <ArrowForwardIcon fontSize="small" />
          <span style={{ color: CANVAS_LIBRARY.prioritization.color }}>3. Prioritize</span>
          <ArrowForwardIcon fontSize="small" />
          <span style={{ color: CANVAS_LIBRARY.validation.color }}>4. Validate</span>
          <ArrowForwardIcon fontSize="small" />
          <span style={{ color: CANVAS_LIBRARY.business.color }}>5. Model</span>
          <ArrowForwardIcon fontSize="small" />
          <span style={{ color: CANVAS_LIBRARY.delivery.color }}>6. Deliver</span>
        </div>
      </div>

      <div className="pdw-canvas-library__categories">
        {Object.entries(CANVAS_LIBRARY).map(([categoryId, category]) => (
          <CategorySection
            key={categoryId}
            categoryId={categoryId}
            category={category}
            onSelectCanvas={handleSelectCanvas}
            canvasCounts={canvasCounts}
          />
        ))}
      </div>
    </div>
  );
}

// Export for use in other components
export { CANVAS_LIBRARY };
